/**
 * バックアップの状態管理（weekly-backup.mjs と backup-healthcheck.mjs で共用）
 *
 * - backups/backup-status.json に直近の成功・失敗を記録する
 *   （backups/ は .gitignore 済み。個人データは含めず、件数と日時のみ）
 * - 問題があれば macOS の通知センターに通知する（失敗しても処理は止めない）
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BACKUP_DIR = path.join(ROOT, "backups");
const STATUS_FILE = path.join(BACKUP_DIR, "backup-status.json");

export function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  } catch {
    return {};
  }
}

/** 成功・失敗を追記ではなく上書きで記録（最後の成功と最後の失敗を両方残す） */
export function writeStatus(patch) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const next = { ...readStatus(), ...patch };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(next, null, 2));
  return next;
}

/** 最新のバックアップファイル（players-YYYY-... のみ。latest は除く）と経過日数 */
export function latestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) return null;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^players-\d{4}-/.test(f))
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) return null;
  const f = files[0];
  return { ...f, ageDays: (Date.now() - f.mtime) / 86400000 };
}

/** macOS 通知（macOS 以外や通知が無効でもエラーにしない） */
export function notifyMac(title, message) {
  if (process.platform !== "darwin") return Promise.resolve();
  const script = `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)} sound name "Basso"`;
  return new Promise((resolve) => execFile("osascript", ["-e", script], () => resolve()));
}
