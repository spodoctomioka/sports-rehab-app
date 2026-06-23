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
  questionnaire: number;  // /7（FAAM-ADLスキップ時は/5）
  questionnaireMax: number; // 7 または 5
  total: number;          // フル25 ／ ADLスキップ23 ／ フィジカルのみ18
  maxTotal: number;       // 25 / 23 / 18
  skipQuestionnaire: boolean;
  skipAdl: boolean;
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

export function scoreAnkleGo(input: AnkleGoInput, skipQuestionnaire: boolean, skipAdl = false): AnkleGoBreakdown {
  const sls  = scoreSLS(input.slsErrors, input.slsStable);
  const sebt = scoreSEBT(input.sebtComp, input.sebtAnt, input.sebtPm, input.sebtStable);
  const sht  = scoreSHT(input.shtTime, input.shtStable);
  const f8t  = scoreF8T(input.f8tTime, input.f8tStable);
  const physical = sls + sebt + sht + f8t; // /18

  const faamAdl   = scoreFaamAdl(input.faamAdl);
  const faamSport = scoreFaamSport(input.faamSport);
  const alrRsi    = scoreAlrRsi(input.alrRsi);
  // FAAM-ADLをスキップする場合は質問紙合計から除外（最大は7→5に）
  const questionnaire = (skipAdl ? 0 : faamAdl) + faamSport + alrRsi;
  const questionnaireMax = skipAdl ? 5 : 7;

  const total    = skipQuestionnaire ? physical : physical + questionnaire;
  const maxTotal = skipQuestionnaire ? 18 : (skipAdl ? 23 : 25);

  return { sls, sebt, sht, f8t, faamAdl, faamSport, alrRsi, physical, questionnaire, questionnaireMax, total, maxTotal, skipQuestionnaire, skipAdl };
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

// FAAM-ADL（21項目）／回答：4 全く難しくない〜0 できない／N/A 該当なし（利用者提供の日本語訳）
export const FAAM_ADL_ITEMS: string[] = [
  "立っている",
  "平地を歩く",
  "裸足で平地を歩く",
  "坂道を上る",
  "坂道を下る",
  "階段を上る",
  "階段を下る",
  "不整地を歩く",
  "縁石の上り下りをする",
  "しゃがむ",
  "つま先立ちをする",
  "歩き始める",
  "5分以内歩く",
  "約10分歩く",
  "15分以上歩く",
  "家事・家庭内の役割を行う",
  "日常生活動作（ADL）を行う",
  "身の回りのケアを行う",
  "軽〜中等度の仕事（立つ・歩くなど）",
  "重労働（押す・引く・登る・運ぶ）",
  "レクリエーション活動",
];

// FAAM-Sport（8項目）／回答：FAAM-ADLと同一（利用者提供の日本語訳）
export const FAAM_SPORT_ITEMS: string[] = [
  "走る",
  "ジャンプする",
  "着地する",
  "素早く開始・停止する",
  "方向転換・横方向動作を行う",
  "通常のフォーム・技術で競技動作を行う",
  "希望するスポーツに参加する",
  "望む時間だけスポーツを続ける",
];

// ALR-RSI（12項目）／回答：0〜10の11段階。左端=0／右端=10のアンカー付き。
// ※ 項目文は利用者（医療者）提供の暫定日本語訳。正式日本語版が無いため解釈に注意。
export interface AlrRsiItem { q: string; left: string; right: string }
export const ALR_RSI_ITEMS: AlrRsiItem[] = [
  { q: "受傷前と同じレベルでスポーツを行える自信がありますか？", left: "全く自信がない", right: "完全に自信がある" },
  { q: "スポーツに参加すると足関節を再受傷する可能性が高いと思いますか？", left: "非常に可能性が高い", right: "全く可能性はない" },
  { q: "スポーツをすることに緊張しますか？", left: "非常に緊張する", right: "全く緊張しない" },
  { q: "スポーツ中に足関節が「抜ける（give way）」ことはないという自信がありますか？", left: "全く自信がない", right: "完全に自信がある" },
  { q: "足関節のことを気にせずスポーツができる自信がありますか？", left: "全く自信がない", right: "完全に自信がある" },
  { q: "スポーツをする際に足関節のことを考慮しなければならないことにストレスを感じますか？", left: "非常にストレスを感じる", right: "全くストレスを感じない" },
  { q: "スポーツをして再び足関節を傷めることが怖いですか？", left: "非常に怖い", right: "全く怖くない" },
  { q: "プレッシャーがかかる場面でも足関節が耐えられる自信がありますか？", left: "全く自信がない", right: "完全に自信がある" },
  { q: "スポーツをしていて偶発的に足関節を傷めることが怖いですか？", left: "非常に怖い", right: "全く怖くない" },
  { q: "手術やリハビリを再度受けることを考えると、スポーツをすることが妨げられますか？", left: "常に妨げられる", right: "全く妨げられない" },
  { q: "スポーツで良いパフォーマンスができる自信がありますか？", left: "全く自信がない", right: "完全に自信がある" },
  { q: "スポーツをすることについてリラックスできていますか？", left: "全くリラックスできない", right: "完全にリラックスしている" },
];

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
