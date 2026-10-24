#!/usr/bin/env node
/**
 * バックアップのヘルスチェック（毎日実行）
 *
 * 週次バックアップが「失敗した」だけでなく「そもそも動いていない」ことにも気づくため、
 * backups/ の最新ファイルの日付を見て、古すぎれば警告する。
 * （2026-06〜10 に予定の作業フォルダが消えて、エラーも出ずに約4ヶ月止まっていた再発防止）
 *
 * 実行: node scripts/backup-healthcheck.mjs
 * 終了コード: 0=正常 / 1=要対応（通知も出す）
 * 読み取りのみ。Supabase には接続しない。
 */
import { readStatus, latestBackup, notifyMac } from "./backup-status.mjs";

// 週1回（金曜0時）＋アプリを閉じていた場合の遅れを見込んで8日を上限にする
const MAX_AGE_DAYS = 8;

async function main() {
  const latest = latestBackup();
  const status = readStatus();
  const problems = [];

  if (!latest) {
    problems.push("バックアップファイルが1つもありません");
  } else if (latest.ageDays > MAX_AGE_DAYS) {
    problems.push(`最後のバックアップから${Math.floor(latest.ageDays)}日経っています（${latest.name}）`);
  }
  // 最後の結果が失敗なら（成功より新しい失敗があれば）警告
  if (status.lastFailureAt && (!status.lastSuccessAt || status.lastFailureAt > status.lastSuccessAt)) {
    problems.push(`直近のバックアップが失敗しています：${status.lastFailureError ?? "原因不明"}`);
  }

  if (problems.length > 0) {
    console.error("⚠ バックアップ要確認");
    for (const p of problems) console.error("  - " + p);
    await notifyMac("⚠ 体重アプリ：バックアップ要確認", problems[0]);
    process.exit(1);
  }

  const days = latest.ageDays < 1 ? "今日" : `${Math.floor(latest.ageDays)}日前`;
  console.log(`✓ バックアップ正常：最新 ${latest.name}（${days}）`);
  if (status.players) console.log(`  選手数 ${status.players} / 記録 ${status.measurements}件`);
}

main().catch(async (e) => {
  console.error("✗ ヘルスチェック自体が失敗:", e.message);
  await notifyMac("⚠ 体重アプリ：バックアップ確認エラー", e.message.slice(0, 120));
  process.exit(1);
});
