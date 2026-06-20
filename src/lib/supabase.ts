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
 * 選手リストをクラウドへ Upsert のみで同期。
 * ※ 自動削除は行わない。古いデバイスが保存しても他デバイスで登録した
 *   選手が消えないよう、削除は cloudDeletePlayer() を明示的に呼ぶ。
 */
export async function cloudSavePlayers(players: any[]): Promise<void> {
  if (!supabase || players.length === 0) return;
  try {
    const rows = players.map(p => ({
      id: p.id,
      data: p,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('players')
      .upsert(rows, { onConflict: 'id' });
    if (error) console.error('[Supabase] upsert error:', error);
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
