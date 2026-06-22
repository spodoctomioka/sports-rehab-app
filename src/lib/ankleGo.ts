// Ankle-GO RTS スコアリング（Picot 2023/2024・満点25点）
// v1：身体機能4テストは数値入力で採点／質問紙3つは正規化済み％を直接入力で採点。
//
// 境界の扱い（重複回避）：
// ・「a〜b」は a以上b以下
// ・端点が重複する帯は上の帯を優先（例：ALR-RSIの63は「63〜76→2」、SHTの13は「10〜13→2」、F8Tの13は「13〜18→1」）
// ・上限特例：mSEBT COMPの95は「90〜95→2」、FAAM-ADLの95は「90〜95→1」、FAAM-Sportの95は「80〜95→1」

export interface AnkleGoInput {
  // 身体機能（最大18点）
  slsErrors: number | null;  // SLS 片脚立位：エラー数
  slsStable: boolean;        // 不安定感なし +1
  sebtComp: number | null;   // mSEBT COMP %
  sebtAnt: number | null;    // ANT %
  sebtPm: number | null;     // PM %
  sebtStable: boolean;
  shtTime: number | null;    // SHT サイドホップ（秒）
  shtStable: boolean;
  f8tTime: number | null;    // F8T フィギュアエイト（秒）
  f8tStable: boolean;
  // 質問紙（最大7点・スキップ可）
  faamAdl: number | null;    // FAAM-ADL %
  faamSport: number | null;  // FAAM-Sport %
  alrRsi: number | null;     // ALR-RSI %
}

export interface AnkleGoBreakdown {
  sls: number;        // /3
  sebt: number;       // /7
  sht: number;        // /5
  f8t: number;        // /3
  faamAdl: number;    // /2
  faamSport: number;  // /2
  alrRsi: number;     // /3
  physical: number;       // /18
  questionnaire: number;  // /7
  total: number;          // /25（フル）または physical（フィジカルのみ）
  maxTotal: number;       // 25 または 18
  skipQuestionnaire: boolean;
}

const has = (n: number | null | undefined): n is number => n != null && !Number.isNaN(n);

// SLS（最大3）：エラー数 >3→0 ／ 1〜3→1 ／ 0→2。＋不安定感なし +1
export function scoreSLS(errors: number | null, stable: boolean): number {
  if (!has(errors)) return 0;
  let s = errors > 3 ? 0 : errors >= 1 ? 1 : 2;
  if (stable) s += 1;
  return s;
}

// mSEBT（最大7）：COMP% <90→0 ／ 90〜95→2 ／ >95→4。ANT%>60で+1。PM%>90で+1。＋不安定感なし +1
export function scoreSEBT(comp: number | null, ant: number | null, pm: number | null, stable: boolean): number {
  if (!has(comp)) return 0;
  let s = comp < 90 ? 0 : comp <= 95 ? 2 : 4;
  if (has(ant) && ant > 60) s += 1;
  if (has(pm) && pm > 90) s += 1;
  if (stable) s += 1;
  return s;
}

// SHT（最大5）：時間 >13→0 ／ 10〜13→2 ／ <10→4。＋不安定感なし +1（13は上の帯=10〜13→2）
export function scoreSHT(time: number | null, stable: boolean): number {
  if (!has(time)) return 0;
  let s = time > 13 ? 0 : time >= 10 ? 2 : 4;
  if (stable) s += 1;
  return s;
}

// F8T（最大3）：時間 >18→0 ／ 13〜18→1 ／ <13→2。＋不安定感なし +1（13は上の帯=13〜18→1）
export function scoreF8T(time: number | null, stable: boolean): number {
  if (!has(time)) return 0;
  let s = time > 18 ? 0 : time >= 13 ? 1 : 2;
  if (stable) s += 1;
  return s;
}

// FAAM-ADL %（最大2）：<90→0 ／ 90〜95→1 ／ >95→2（95は90〜95→1）
export function scoreFaamAdl(p: number | null): number {
  if (!has(p)) return 0;
  return p < 90 ? 0 : p <= 95 ? 1 : 2;
}

// FAAM-Sport %（最大2）：<80→0 ／ 80〜95→1 ／ >95→2（95は80〜95→1）
export function scoreFaamSport(p: number | null): number {
  if (!has(p)) return 0;
  return p < 80 ? 0 : p <= 95 ? 1 : 2;
}

// ALR-RSI %（最大3）：<55→0 ／ 55〜63→1 ／ 63〜76→2 ／ >76→3（63は上の帯=63〜76→2）
export function scoreAlrRsi(p: number | null): number {
  if (!has(p)) return 0;
  if (p < 55) return 0;
  if (p < 63) return 1;
  if (p <= 76) return 2;
  return 3;
}

export function scoreAnkleGo(input: AnkleGoInput, skipQuestionnaire: boolean): AnkleGoBreakdown {
  const sls  = scoreSLS(input.slsErrors, input.slsStable);
  const sebt = scoreSEBT(input.sebtComp, input.sebtAnt, input.sebtPm, input.sebtStable);
  const sht  = scoreSHT(input.shtTime, input.shtStable);
  const f8t  = scoreF8T(input.f8tTime, input.f8tStable);
  const physical = sls + sebt + sht + f8t; // /18

  const faamAdl   = scoreFaamAdl(input.faamAdl);
  const faamSport = scoreFaamSport(input.faamSport);
  const alrRsi    = scoreAlrRsi(input.alrRsi);
  const questionnaire = faamAdl + faamSport + alrRsi; // /7

  const total    = skipQuestionnaire ? physical : physical + questionnaire;
  const maxTotal = skipQuestionnaire ? 18 : 25;

  return { sls, sebt, sht, f8t, faamAdl, faamSport, alrRsi, physical, questionnaire, total, maxTotal, skipQuestionnaire };
}

export type AnkleGoTier = "good" | "more_rehab" | "caution" | "low";

export interface AnkleGoInterpretation {
  tier: AnkleGoTier;
  title: string;
  desc: string;
  color: string; // 表示色
}

// フル評価（25点満点）時のカットオフ解釈
export function interpretFull(total: number): AnkleGoInterpretation {
  if (total >= 12) {
    return {
      tier: "good",
      title: "復帰準備 良好の目安（12点以上）",
      desc: "2か月時点でこのスコアの選手は、1年後に「良好回復（再受傷なく機能が安定した状態）」に至る確率が約12倍と報告されています。最終判断は医療者と。",
      color: "#00875f",
    };
  }
  if (total >= 8) {
    return {
      tier: "more_rehab",
      title: "追加リハビリ推奨（8〜11点）",
      desc: "11点以下では「良好回復（再受傷なく機能が安定した状態）」に至る確率が低下します。不足している項目を中心に、もう一段階リハビリを継続してから再評価を。",
      color: "#c89010",
    };
  }
  if (total >= 7) {
    return {
      tier: "caution",
      title: "慎重に（8点未満）",
      desc: "再受傷リスクが高い段階です。4か月時点でも受傷前レベルへの復帰が困難なことが多いと報告されています。復帰を急がず段階的リハビリを。",
      color: "#cc2244",
    };
  }
  return {
    tier: "low",
    title: "競技復帰の可能性が低い（7点未満）",
    desc: "現時点では競技復帰の準備が整っていません。基礎的な機能の再獲得から、医療者の指導のもとで進めてください。",
    color: "#cc2244",
  };
}

// ============================================================
// v2：質問紙の設問埋め込み（項目文は正式日本語版を後から差し込むプレースホルダ）
// 著作権保護のため正式項目文は同梱しない。各要素は利用者が差し替える前提のダミー。
// ============================================================

// FAAM-ADL（21項目）／回答：4 全く難しくない〜0 できない／N/A 該当なし
export const FAAM_ADL_ITEMS: string[] = Array.from({ length: 21 }, (_, i) => `（項目${i + 1}：正式項目文を挿入）`);

// FAAM-Sport（8項目）／回答：FAAM-ADLと同一
export const FAAM_SPORT_ITEMS: string[] = Array.from({ length: 8 }, (_, i) => `（項目${i + 1}：正式項目文を挿入）`);

// ALR-RSI（12項目）／回答：0〜10の11段階
export const ALR_RSI_ITEMS: string[] = Array.from({ length: 12 }, (_, i) => `（項目${i + 1}：正式項目文を挿入）`);

// FAAM 回答型：0〜4 の数値、または "NA"（該当なし）、または null（未回答）
export type FaamAnswer = 0 | 1 | 2 | 3 | 4 | "NA" | null;

// FAAM ％算出：(N/A以外の回答合計) ÷ (N/A以外の回答数 × 4) × 100
export function computeFaamPercent(answers: FaamAnswer[]): { pct: number | null; answered: number } {
  const vals = answers.filter((a): a is 0 | 1 | 2 | 3 | 4 => typeof a === "number");
  const answered = vals.length;
  if (answered === 0) return { pct: null, answered: 0 };
  const sum = vals.reduce((s: number, v) => s + v, 0);
  return { pct: (sum / (answered * 4)) * 100, answered };
}

// ALR-RSI ％算出：12項目合計(0〜120) ÷ 1.2（=0〜100）。全項目回答が必須。
export function computeAlrRsiPercent(answers: (number | null)[]): { pct: number | null; answered: number; allAnswered: boolean } {
  const answered = answers.filter((a) => a != null).length;
  const allAnswered = answered === answers.length;
  if (!allAnswered) return { pct: null, answered, allAnswered: false };
  const sum = (answers as number[]).reduce((s, v) => s + v, 0);
  return { pct: sum / 1.2, answered, allAnswered: true };
}
