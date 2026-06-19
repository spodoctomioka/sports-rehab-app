#!/usr/bin/env node
/**
 * 週次バックアップ：Supabase players テーブルの全選手データを
 * backups/ にタイムスタンプ付きJSONで保存する。
 *
 * 実行: node scripts/weekly-backup.mjs
 * 想定: 毎週木曜24:00（金0:00 JST）のスケジュールタスクから呼ばれる。
 *
 * 認証情報は .env.local（NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY）から読む。
 * バックアップは選手の個人データを含むため backups/ は .gitignore 済み。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEEP_WEEKS = 16; // これより古いバックアップは自動削除（容量管理）

function readEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const txt = fs.readFileSync(envPath, "utf8");
  const get = (k) => {
    const m = txt.match(new RegExp("^" + k + "=(.*)$", "m"));
    return m ? m[1].trim() : "";
  };
  const url = get("NEXT_PUBLIC_SUPABASE_URL");
  const key = get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error(".env.local に Supabase の URL / ANON KEY が見つかりません");
  return { url, key };
}

async function main() {
  const { url, key } = readEnv();
  const res = await fetch(url + "/rest/v1/players?select=id,data,updated_at", {
    headers: { apikey: key, Authorization: "Bearer " + key },
  });
  if (!res.ok) throw new Error("Supabase fetch 失敗: " + res.status + " " + (await res.text()));
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("選手データが0件でした。バックアップを中止します（誤って空を保存しないため）。");
  }

  const dir = path.join(ROOT, "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const file = path.join(dir, `players-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(rows, null, 2));

  // 直近の状態をすぐ参照できるよう latest も更新
  fs.writeFileSync(path.join(dir, "players-latest.json"), JSON.stringify(rows, null, 2));

  // 古いバックアップを自動削除（players-YYYY-...json のみ対象、latestは残す）
  const all = fs
    .readdirSync(dir)
    .filter((f) => /^players-\d{4}-/.test(f))
    .sort();
  const stale = all.slice(0, Math.max(0, all.length - KEEP_WEEKS));
  for (const f of stale) fs.rmSync(path.join(dir, f));

  console.log(`✓ バックアップ完了: ${path.relative(ROOT, file)}`);
  console.log(`  選手数: ${rows.length} / 保持件数: ${all.length - stale.length}（${stale.length}件を整理）`);
}

main().catch((e) => {
  console.error("✗ バックアップ失敗:", e.message);
  process.exit(1);
});
