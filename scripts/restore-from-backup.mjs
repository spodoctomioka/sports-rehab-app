#!/usr/bin/env node
/**
 * バックアップからの復元：backups/ のスナップショットを Supabase へ書き戻す。
 *
 * 確認(変更なし): node scripts/restore-from-backup.mjs backups/players-latest.json
 * 実行(上書き)  : node scripts/restore-from-backup.mjs backups/players-latest.json --yes
 *
 * upsert のみ（既存IDは上書き、バックアップに無いIDは消さない）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readEnv() {
  const txt = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  const get = (k) => {
    const m = txt.match(new RegExp("^" + k + "=(.*)$", "m"));
    return m ? m[1].trim() : "";
  };
  const url = get("NEXT_PUBLIC_SUPABASE_URL");
  const key = get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error(".env.local に Supabase の認証情報が見つかりません");
  return { url, key };
}

async function main() {
  const fileArg = process.argv[2];
  const confirm = process.argv.includes("--yes");
  if (!fileArg) {
    console.error("使い方: node scripts/restore-from-backup.mjs <backupファイル> [--yes]");
    process.exit(1);
  }
  const rows = JSON.parse(fs.readFileSync(path.resolve(ROOT, fileArg), "utf8"));
  console.log(`バックアップ: ${fileArg}（${rows.length}人）`);
  if (!confirm) {
    console.log("\n--- ドライラン（--yes を付けると実際に書き戻します）---");
    rows.slice(0, 5).forEach((r) => {
      const last = (r.data.measurements || []).slice(-1)[0];
      console.log(" ", r.data.name, "直近:", last ? last.date + " " + last.weight + "kg" : "なし");
    });
    console.log(`  …他 ${Math.max(0, rows.length - 5)} 人`);
    return;
  }
  const { url, key } = readEnv();
  const payload = rows.map((r) => ({ id: r.id, data: r.data, updated_at: new Date().toISOString() }));
  const res = await fetch(url + "/rest/v1/players?on_conflict=id", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("復元失敗: " + res.status + " " + (await res.text()));
  console.log(`✓ ${payload.length}人分を復元しました（upsert）`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
