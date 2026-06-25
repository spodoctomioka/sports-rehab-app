import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
// 新旧どちらのキー名にも対応
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          ?? '';

export const isSupabaseEnabled =
  url.length > 0 && key.length > 0 && !url.includes('placeholder');

export const supabase = isSupabaseEnabled ? createClient(url, key) : null;

/** クラウドから全選手データを取得。失敗時は null を返す */
export async function cloudFetchPlayers(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('players').select('data');
  if (error) { console.error('[Supabase] fetch error:', error); return null; }
  return (data ?? []).map((r: any) => r.data);
}

/**
 * この端末が「クラウドに保存済み」と認識している各選手データのスナップショット。
 * key=選手id / value=その時点の data を JSON 文字列化したもの。
 * 保存時はこれと内容が変わった選手だけを upsert する。
 * → 古い値を保持した端末が、自分が触っていない選手まで巻き戻すのを防ぐ。
 */
const syncedSnapshot = new Map<string, string>();

function serializePlayer(p: any): string {
  return JSON.stringify(p);
}

/**
 * スナップショットを丸ごと再構築する。
 * ローカルキャッシュ読込後・クラウド取得後など、
 * 「いま手元にあるデータ＝この端末が認識しているクラウド状態」を確定したタイミングで呼ぶ。
 */
export function cloudSeedSnapshot(players: any[]): void {
  syncedSnapshot.clear();
  for (const p of players) {
    if (p && p.id) syncedSnapshot.set(p.id, serializePlayer(p));
  }
}

/**
 * 選手リストをクラウドへ Upsert のみで同期。
 * ※ 全件ではなく、スナップショットと差分のある選手だけを書き込む。
 *   これにより、古い端末が1人だけ編集しても、触っていない選手の
 *   古い値を他端末へ巻き戻すことがない（再汚染対策）。
 * ※ 自動削除は行わない。削除は cloudDeletePlayer() を明示的に呼ぶ。
 */
export async function cloudSavePlayers(players: any[]): Promise<void> {
  if (!supabase || players.length === 0) return;
  try {
    // スナップショットと内容が変わった選手（新規含む）だけ抽出
    const changed = players.filter(p => {
      if (!p || !p.id) return false;
      return syncedSnapshot.get(p.id) !== serializePlayer(p);
    });
    if (changed.length === 0) return;

    const rows = changed.map(p => ({
      id: p.id,
      data: p,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('players')
      .upsert(rows, { onConflict: 'id' });
    if (error) { console.error('[Supabase] upsert error:', error); return; }

    // 書き込みに成功した分だけスナップショットを更新
    for (const p of changed) syncedSnapshot.set(p.id, serializePlayer(p));
  } catch (err) {
    console.error('[Supabase] sync error:', err);
  }
}

/** 選手を1人だけクラウドから削除（UIの明示的な削除操作時のみ呼ぶ） */
export async function cloudDeletePlayer(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) console.error('[Supabase] delete error:', error);
  } catch (err) {
    console.error('[Supabase] delete error:', err);
  }
}
