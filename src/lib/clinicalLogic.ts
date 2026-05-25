// ---- Types ----

export type InjuryId =
  | "hamstring" | "quadriceps" | "ankle_sprain" | "ACL" | "meniscus"
  | "stress_fracture" | "rotator_cuff" | "shoulder_dislocation"
  | "elbow_throwing" | "concussion";

export type SportId =
  | "soccer" | "basketball" | "baseball" | "tennis" | "swimming"
  | "track" | "rugby" | "volleyball" | "judo" | "american_football" | "gymnastics";

export type JissType = "I" | "II" | "III";
export type JissDegree = 1 | 2 | 3;
export interface JissGrade { type: JissType; degree: JissDegree }

export interface TestItem { id: string; title: string; description: string; icon: string }
export interface TestResult { id: string; result: boolean | null }
export interface RehabMenuItem { title: string; sets: string; note: string }
export interface TimelineRow { week: string; goal: string; activity: string }
export interface PhaseTrackerItem { phase: number; name: string; desc: string; duration: string }
export interface ThrowingStep { step: number; name: string; distance: string; reps: string }

export interface RehabPlan {
  phase: string;
  currentPhaseIndex: number;
  totalPhases: number;
  summary: string;
  okList: string[];
  ngList: string[];
  rehabMenu: RehabMenuItem[];
  timeline: TimelineRow[];
  alert?: string;
  phaseTracker?: PhaseTrackerItem[];
  showPolice?: boolean;
  showOttawaRule?: boolean;
  throwingProgram?: ThrowingStep[];
}

export interface GeneratePlanParams {
  injuryId: InjuryId;
  grade: string;
  jissGrade?: JissGrade;
  injuryDate: string;
  targetDate: string;
  tests: TestResult[];
  sport: SportId | "";
  position: string;
}

// ---- JISS Classification ----

export const JISS_TYPES: Record<JissType, { label: string; desc: string }> = {
  I:   { label: "Ⅰ型", desc: "筋内損傷（筋膜内）" },
  II:  { label: "Ⅱ型", desc: "筋腱移行部損傷" },
  III: { label: "Ⅲ型", desc: "近位腱損傷" },
};

export const JISS_DEGREES: Record<JissDegree, { label: string; desc: string }> = {
  1: { label: "1度", desc: "軽度（微細損傷）" },
  2: { label: "2度", desc: "中等度（部分断裂）" },
  3: { label: "3度", desc: "重度（完全断裂）" },
};

const JISS_BASE_WEEKS: Record<JissType, Record<JissDegree, number>> = {
  I:   { 1: 1, 2: 2, 3: 3 },
  II:  { 1: 3, 2: 5, 3: 7 },
  III: { 1: 4, 2: 7, 3: 12 },
};

// ---- Phase Definitions ----

export const MUSCLE_STRAIN_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "急性保護期",     desc: "安静・冷却・圧迫",         duration: "0〜3日" },
  { phase: 2, name: "亜急性期",       desc: "軽度ROM・水中運動",         duration: "3〜7日" },
  { phase: 3, name: "リハビリ開始期", desc: "等尺性運動・軽負荷",         duration: "1〜2週" },
  { phase: 4, name: "機能回復期",     desc: "抵抗運動・ジョグ",           duration: "2〜4週" },
  { phase: 5, name: "スポーツ準備期", desc: "スプリント・方向転換",         duration: "4〜6週" },
  { phase: 6, name: "完全復帰期",     desc: "全練習・コンタクト可",         duration: "6週以降" },
];

export const GRTP_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "完全安静",           desc: "症状消失まで活動禁止",       duration: "症状消失まで" },
  { phase: 2, name: "軽度有酸素運動",     desc: "ウォーキング・水泳",         duration: "最低24時間" },
  { phase: 3, name: "スポーツ特異的運動", desc: "ランニング（コンタクトなし）", duration: "最低24時間" },
  { phase: 4, name: "非コンタクット練習", desc: "ドリル・技術練習",           duration: "最低24時間" },
  { phase: 5, name: "コンタクット練習",   desc: "医師許可後のフル練習",       duration: "最低24時間" },
  { phase: 6, name: "試合復帰",           desc: "通常の競技参加",             duration: "—" },
];

// ---- Grades by Injury ----

export interface GradeOption { value: string; label: string; desc: string }

export const GRADES_BY_INJURY: Partial<Record<InjuryId, GradeOption[]>> = {
  ankle_sprain: [
    { value: "I",   label: "Ⅰ度", desc: "軽度（靱帯微細損傷）" },
    { value: "II",  label: "Ⅱ度", desc: "中等度（部分断裂）" },
    { value: "III", label: "Ⅲ度", desc: "重度（完全断裂）" },
  ],
  ACL: [
    { value: "partial",  label: "部分断裂", desc: "線維の一部が断裂" },
    { value: "complete", label: "完全断裂", desc: "ACL完全断裂" },
  ],
  meniscus: [
    { value: "I",   label: "Grade I",   desc: "変性変化（手術不要）" },
    { value: "II",  label: "Grade II",  desc: "水平断裂" },
    { value: "III", label: "Grade III", desc: "完全断裂（手術適応）" },
  ],
  stress_fracture: [
    { value: "I",   label: "Grade I",   desc: "骨膜反応のみ" },
    { value: "II",  label: "Grade II",  desc: "骨膜＋骨内変化" },
    { value: "III", label: "Grade III", desc: "骨折線あり（要免荷）" },
  ],
  rotator_cuff: [
    { value: "partial",  label: "部分断裂", desc: "腱板の部分的断裂" },
    { value: "complete", label: "完全断裂", desc: "腱板の完全断裂" },
  ],
  shoulder_dislocation: [
    { value: "first",     label: "初回脱臼",   desc: "初回の肩関節前方脱臼" },
    { value: "recurrent", label: "反復性脱臼", desc: "2回以上の脱臼歴あり" },
  ],
  elbow_throwing: [
    { value: "mild",     label: "軽度",  desc: "内側上顆炎・UCL軽度損傷" },
    { value: "moderate", label: "中等度", desc: "UCL中等度損傷" },
    { value: "severe",   label: "重度",  desc: "UCL完全断裂（Tommy John）" },
  ],
  concussion: [
    { value: "simple",  label: "単純型", desc: "症状が7〜10日以内に消失" },
    { value: "complex", label: "複雑型", desc: "症状が10日以上持続" },
  ],
};

// ---- Injury Types ----

export interface InjuryDef {
  id: InjuryId;
  label: string;
  area: "下肢" | "体幹" | "上肢" | "頭部";
  usesJiss: boolean;
  icon: string;
}

export const INJURY_TYPES: InjuryDef[] = [
  { id: "hamstring",          label: "ハムストリングス肉離れ",   area: "下肢", usesJiss: true,  icon: "🦵" },
  { id: "quadriceps",         label: "大腿四頭筋肉離れ",         area: "下肢", usesJiss: true,  icon: "🦵" },
  { id: "ankle_sprain",       label: "足関節捻挫",               area: "下肢", usesJiss: false, icon: "🦶" },
  { id: "ACL",                label: "前十字靱帯損傷（ACL）",    area: "下肢", usesJiss: false, icon: "🦴" },
  { id: "meniscus",           label: "半月板損傷",               area: "下肢", usesJiss: false, icon: "🦴" },
  { id: "stress_fracture",    label: "疲労骨折",                 area: "体幹", usesJiss: false, icon: "🦴" },
  { id: "rotator_cuff",       label: "回旋筋腱板損傷",           area: "上肢", usesJiss: false, icon: "💪" },
  { id: "shoulder_dislocation", label: "肩関節脱臼",             area: "上肢", usesJiss: false, icon: "💪" },
  { id: "elbow_throwing",     label: "投球障害肘（内側型）",     area: "上肢", usesJiss: false, icon: "⚾" },
  { id: "concussion",         label: "脳震盪",                   area: "頭部", usesJiss: false, icon: "🧠" },
];

// ---- Tests by Injury ----

export const TESTS_BY_INJURY: Record<InjuryId, TestItem[]> = {
  hamstring: [
    { id: "okWalk",    title: "歩行痛なし",       description: "通常歩行時に患部の疼痛がないか",                               icon: "🚶" },
    { id: "okStretch", title: "ストレッチ痛なし", description: "SLR 70°以上まで伸張して疼痛がないか",                          icon: "🤸" },
    { id: "okPress",   title: "圧痛なし",         description: "患部を直接圧迫しても疼痛が出ないか",                           icon: "👆" },
    { id: "okResist",  title: "抵抗運動痛なし",   description: "最大等尺性収縮（膝屈曲・股関節伸展）で疼痛がないか",           icon: "💪" },
    { id: "okPsych",   title: "心理的準備完了",   description: "再受傷への不安が少なく、スポーツ動作に自信があるか",           icon: "🧠" },
  ],
  quadriceps: [
    { id: "okWalk",    title: "歩行痛なし",       description: "通常歩行時に患部の疼痛がないか",                               icon: "🚶" },
    { id: "okStretch", title: "ストレッチ痛なし", description: "膝屈曲 130°以上まで伸張して疼痛がないか",                      icon: "🤸" },
    { id: "okPress",   title: "圧痛なし",         description: "患部を直接圧迫しても疼痛が出ないか",                           icon: "👆" },
    { id: "okResist",  title: "抵抗運動痛なし",   description: "最大等尺性収縮（膝伸展）で疼痛がないか",                       icon: "💪" },
    { id: "okPsych",   title: "心理的準備完了",   description: "再受傷への不安が少なく、スポーツ動作に自信があるか",           icon: "🧠" },
  ],
  ankle_sprain: [
    { id: "okROM",     title: "ROM正常",     description: "底屈・背屈の左右差が10°以内か",             icon: "↕" },
    { id: "okWeight",  title: "荷重痛なし",  description: "片脚立ちで10秒間、疼痛なく立てるか",         icon: "⚖" },
    { id: "okHop",     title: "ホップテスト", description: "患側片脚で3回連続ホップできるか",           icon: "↑" },
    { id: "okAgility", title: "方向転換",    description: "疼痛なくサイドステップ（3m往復）ができるか", icon: "⟷" },
    { id: "okSprint",  title: "直線走",      description: "30mを疼痛なくフルスピードで走れるか",        icon: "▶" },
  ],
  ACL: [
    { id: "okROM",      title: "完全可動域",  description: "完全伸展〜130°屈曲が疼痛なく可能か",                  icon: "↕" },
    { id: "okStrength", title: "筋力80%以上", description: "等速性筋力測定で健側比80%以上か",                     icon: "💪" },
    { id: "okBalance",  title: "片脚バランス", description: "患側片脚立位を30秒以上保持できるか（目閉）",          icon: "⚖" },
    { id: "okHop",      title: "ホップテスト", description: "片脚ホップで健側比85%以上の距離か",                  icon: "↑" },
    { id: "okSprint",   title: "スプリント",  description: "30mスプリントを疼痛なく完走できるか",                 icon: "▶" },
  ],
  meniscus: [
    { id: "okROM",        title: "完全可動域",     description: "完全屈曲・伸展が疼痛なく可能か",             icon: "↕" },
    { id: "okJointLine",  title: "関節裂隙圧痛なし", description: "膝関節の内外側裂隙に圧痛がないか",         icon: "👆" },
    { id: "okSquat",      title: "フルスクワット",  description: "疼痛なくフルスクワットが可能か",             icon: "⬇" },
    { id: "okJog",        title: "ジョグ",         description: "疼痛なく5分間のジョグが可能か",             icon: "🏃" },
    { id: "okPivot",      title: "ピボット動作",   description: "疼痛なくピボット動作が可能か",               icon: "⟳" },
  ],
  stress_fracture: [
    { id: "okPointTender", title: "圧痛消失",    description: "骨折部位への直接圧痛が消失しているか",             icon: "👆" },
    { id: "okWalk",        title: "歩行痛なし",  description: "通常歩行で疼痛がないか",                          icon: "🚶" },
    { id: "okJog",         title: "ジョグ可",    description: "5〜10分のジョグで疼痛が出ないか",                 icon: "🏃" },
    { id: "okImaging",     title: "画像所見改善", description: "X線/MRIで骨癒合・骨膜反応の改善が確認されているか", icon: "📷" },
  ],
  rotator_cuff: [
    { id: "okPainFree",  title: "安静時疼痛なし",   description: "安静時・夜間の疼痛が消失しているか",           icon: "😴" },
    { id: "okROM",       title: "肩関節ROM",        description: "挙上・外旋・内旋の可動域が正常範囲か",         icon: "↕" },
    { id: "okStrength",  title: "腱板筋力",         description: "外旋・外転筋力が健側比75%以上か",             icon: "💪" },
    { id: "okOverhead",  title: "オーバーヘッド動作", description: "疼痛なく頭上動作が可能か",                   icon: "🙌" },
  ],
  shoulder_dislocation: [
    { id: "okStability",  title: "不安感なし",   description: "日常動作で肩の不安定感・外れる感覚がないか",     icon: "😰" },
    { id: "okROM",        title: "ROM正常",      description: "肩関節の可動域が健側と同等か",                   icon: "↕" },
    { id: "okStrength",   title: "筋力正常",     description: "肩周囲筋の筋力が健側比80%以上か",               icon: "💪" },
    { id: "okSportMove",  title: "競技動作可",   description: "疼痛・不安感なく競技特異的動作が可能か",         icon: "🏅" },
  ],
  elbow_throwing: [
    { id: "okPainFree",  title: "肘痛なし",         description: "日常動作・前腕回内外で疼痛がないか",           icon: "💪" },
    { id: "okROM",       title: "肘ROM正常",        description: "完全伸展〜140°屈曲が疼痛なく可能か",           icon: "↕" },
    { id: "okValgus",    title: "外反ストレス陰性", description: "外反ストレステストで疼痛・不安定性がないか",   icon: "👆" },
    { id: "okThrow",     title: "投球動作可",       description: "疼痛なくスローイング動作（軽負荷）が可能か",   icon: "⚾" },
  ],
  concussion: [
    { id: "okHeadache",  title: "頭痛なし",     description: "安静時・運動時の頭痛が完全に消失しているか",       icon: "🧠" },
    { id: "okCog",       title: "認知症状なし", description: "霧がかかった感・集中困難・記憶障害がないか",       icon: "💭" },
    { id: "okBalance",   title: "バランス正常", description: "BESS（Balance Error Scoring System）が正常か",    icon: "⚖" },
    { id: "okExercise",  title: "運動増悪なし", description: "軽度有酸素運動後も症状増悪がないか",             icon: "🏃" },
    { id: "okSleep",     title: "睡眠正常",     description: "睡眠障害（過眠・不眠）がないか",                 icon: "😴" },
  ],
};

// ---- Sports Data ----

export interface SportDef { id: SportId; label: string; emoji: string; positions: string[] }

export const SPORTS_DATA: SportDef[] = [
  { id: "soccer",            label: "サッカー",                 emoji: "⚽", positions: ["FW（フォワード）","MF（ミッドフィールダー）","DF（ディフェンダー）","GK（ゴールキーパー）"] },
  { id: "basketball",        label: "バスケットボール",         emoji: "🏀", positions: ["PG（ポイントガード）","SG（シューティングガード）","SF（スモールフォワード）","PF（パワーフォワード）","C（センター）"] },
  { id: "baseball",          label: "野球",                     emoji: "⚾", positions: ["投手","捕手","一塁手","内野手","外野手","指名打者"] },
  { id: "tennis",            label: "テニス",                   emoji: "🎾", positions: ["シングルス","ダブルス"] },
  { id: "swimming",          label: "水泳",                     emoji: "🏊", positions: ["自由形","背泳ぎ","平泳ぎ","バタフライ","個人メドレー"] },
  { id: "track",             label: "陸上競技",                 emoji: "🏃", positions: ["短距離","中距離","長距離","跳躍","投擲"] },
  { id: "rugby",             label: "ラグビー",                 emoji: "🏉", positions: ["FW（フォワード）","BK（バックス）","SH（スクラムハーフ）","SO（スタンドオフ）"] },
  { id: "volleyball",        label: "バレーボール",             emoji: "🏐", positions: ["セッター","アウトサイドヒッター","ミドルブロッカー","オポジット","リベロ"] },
  { id: "judo",              label: "柔道",                     emoji: "🥋", positions: ["軽量級","中量級","重量級"] },
  { id: "american_football", label: "アメリカンフットボール",   emoji: "🏈", positions: ["QB（クォーターバック）","RB（ランニングバック）","WR（ワイドレシーバー）","OL（オフェンスライン）","DL（ディフェンスライン）","LB（ラインバッカー）","DB（ディフェンスバック）","K/P（キッカー）"] },
  { id: "gymnastics",        label: "体操",                     emoji: "🤸", positions: ["床運動","鞍馬","鉄棒","段違い平行棒","平均台","跳馬"] },
];

// ---- Plan Generation ----

function getDays(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

function getTargetDays(dateStr: string): number | null {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function t(tests: TestResult[], id: string): boolean {
  return tests.find((x) => x.id === id)?.result === true;
}

// --- Muscle Strain ---

function muscleStrainPlan(p: GeneratePlanParams): RehabPlan {
  const jiss = p.jissGrade ?? { type: "II" as JissType, degree: 2 as JissDegree };
  const muscle = p.injuryId === "hamstring" ? "ハムストリングス" : "大腿四頭筋";
  const okWalk    = t(p.tests, "okWalk");
  const okStretch = t(p.tests, "okStretch");
  const okPress   = t(p.tests, "okPress");
  const okResist  = t(p.tests, "okResist");
  const okPsych   = t(p.tests, "okPsych");

  let idx = 0;
  if      (!okWalk)    idx = 0;
  else if (!okStretch) idx = 1;
  else if (!okPress)   idx = 2;
  else if (!okResist)  idx = 3;
  else if (!okPsych)   idx = 4;
  else                 idx = 5;

  const bw = JISS_BASE_WEEKS[jiss.type][jiss.degree];
  const td = getTargetDays(p.targetDate);

  type PhaseData = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: PhaseData[] = [
    {
      summary: `${muscle}肉離れ（JISS ${JISS_TYPES[jiss.type].label}${jiss.degree}度）急性保護期。歩行痛があるため安静・冷却・圧迫を徹底し、炎症をコントロールします。`,
      okList: ["アイシング（20分 × 4〜6回/日）","圧迫包帯・スポンジパッドによる固定","松葉杖を使った免荷歩行","足関節・膝関節の自動運動（痛みなし範囲）","上半身トレーニング（プッシュアップ等）"],
      ngList: ["患部のストレッチ（絶対禁止）","温熱療法（急性期は禁忌）","マッサージ・揉みほぐし","疼痛を誘発する荷重動作","患部への直接的な刺激"],
      rehabMenu: [
        { title: "アイシング",           sets: "20分 × 4〜6回", note: "圧迫しながら冷却。凍傷注意（タオル越し）" },
        { title: "足関節ポンプ運動",     sets: "20回 × 3セット", note: "仰臥位。腫脹軽減・血栓予防" },
        { title: "等尺性収縮（健側）",   sets: "10回 × 3セット", note: "患側は禁止。健側筋力維持目的" },
        { title: "体幹安定化",           sets: "30秒 × 3セット", note: "ドローイン、プランク（疼痛なし）" },
      ],
      timeline: [
        { week: "0〜3日",   goal: "炎症コントロール",  activity: "安静・アイシング・圧迫" },
        { week: "4〜7日",   goal: "歩行痛消失",        activity: "免荷歩行→通常歩行へ" },
        { week: "1〜2週",   goal: "ストレッチ痛なし",  activity: "軽度ROM運動開始" },
        { week: `${bw}週目`, goal: "スポーツ復帰",      activity: "完全復帰目標" },
      ],
      alert: "受傷直後の過度な伸張・マッサージは骨化性筋炎のリスクがあります。受傷後48時間は安静第一。",
    },
    {
      summary: `歩行痛は消失しつつありますが、ストレッチでまだ疼痛があります。水中・プール運動と段階的なROM拡大を進める時期です。`,
      okList: ["通常歩行（疼痛なし）","水中ウォーキング","軽度ストレッチ（6/10以下の伸張感まで）","等尺性収縮運動（軽負荷）","固定自転車（軽負荷）"],
      ngList: ["最大域ストレッチ（疼痛範囲）","ジョグ・ランニング","重負荷レジスタンス運動","コンタクトプレー"],
      rehabMenu: [
        { title: "水中ウォーキング",           sets: "15〜20分",    note: "腰まで浸水。ゆっくり歩行から" },
        { title: "軽度ストレッチ（SLR）",       sets: "30秒 × 3",   note: "6/10以下の伸張感まで。反動禁止" },
        { title: "レッグカール（軽負荷）",       sets: "15回 × 3",   note: "50%以下のROMから。疼痛なし範囲のみ" },
        { title: "体幹・殿筋強化",             sets: "各15回 × 3",  note: "ブリッジ、クラムシェル" },
      ],
      timeline: [
        { week: "3〜7日",   goal: "ストレッチ痛軽減",  activity: "水中運動・軽度ROM" },
        { week: "1〜2週",   goal: "圧痛消失",          activity: "等尺性運動・軽ジョグ検討" },
        { week: "2〜4週",   goal: "抵抗運動可",        activity: "段階的筋力トレーニング" },
        { week: `${bw}週目`, goal: "スポーツ復帰",      activity: "完全復帰目標" },
      ],
      alert: "ストレッチ痛が残る段階での強制伸張は再断裂リスクがあります。",
    },
    {
      summary: `歩行・ストレッチは問題なし、圧痛が残っています。等尺性〜軽度等張性運動を開始し、組織修復を促進する時期です。`,
      okList: ["ジョグ（直線・低速）","プール練習（水泳含む）","等尺性・軽等張性筋力トレーニング","最大域ストレッチ（疼痛なし）","チーム練習の一部参加（非接触・低強度）"],
      ngList: ["フルスプリント","高負荷の筋力トレーニング","方向転換・カット","コンタクトプレー"],
      rehabMenu: [
        { title: "ノルディックハムストリングス", sets: "6回 × 3",    note: "離心性。再受傷予防の最重要エクサイズ" },
        { title: "レッグカール（段階的）",       sets: "12回 × 3",   note: "自体重→軽ウェイトへ" },
        { title: "ルーマニアンデッドリフト",     sets: "10回 × 3",   note: "腰を丸めない。伸張感でストップ" },
        { title: "直線ジョグ（50〜60%）",        sets: "5〜10分 × 2", note: "疼痛が出たら即中止。翌日腫脹確認" },
      ],
      timeline: [
        { week: "1〜2週",   goal: "圧痛消失",         activity: "等尺性運動・軽ジョグ" },
        { week: "2〜4週",   goal: "抵抗運動可",       activity: "段階的筋力強化" },
        { week: "4〜6週",   goal: "スプリント可",     activity: "方向転換・競技特異的ドリル" },
        { week: `${bw}週目`, goal: "スポーツ復帰",     activity: "完全復帰目標" },
      ],
      alert: "圧痛部位の直接マッサージはまだ慎重に。",
    },
    {
      summary: `歩行・ストレッチ・圧痛は問題なし。抵抗運動でまだ疼痛があります。段階的筋力強化とジョグ→ランニングへの移行期です。`,
      okList: ["ジョグ〜軽いランニング（70〜80%出力）","直線走の段階的スピードアップ","高負荷の筋力トレーニング（8割程度）","アジリティ基礎ドリル（低強度）","チーム練習の大部分参加（非コンタクト）"],
      ngList: ["フルスプリント（100%出力）","急激な方向転換・カット","コンタクトプレー"],
      rehabMenu: [
        { title: "ノルディックハムストリングス", sets: "8〜10回 × 4", note: "週3回。再受傷率を70%低減する離心性" },
        { title: "ランニング（70→80→90%）",     sets: "段階的増加",   note: "毎回疼痛チェック。翌日確認後次段階へ" },
        { title: "スクワット・レッグプレス",     sets: "10回 × 4",    note: "フルレンジ。体重1.5倍を目標" },
        { title: "アジリティラダー",             sets: "5分 × 2",     note: "低速でフォーム重視" },
      ],
      timeline: [
        { week: "2〜4週",  goal: "抵抗運動疼痛消失",  activity: "ランニング段階的強化" },
        { week: "4〜6週",  goal: "スプリント可",      activity: "方向転換・競技特異的ドリル" },
        { week: "6週〜",   goal: "スポーツ復帰",      activity: "完全復帰目標" },
      ],
      alert: "筋力が健側比80%未満でのコンタクト復帰は再受傷リスクが非常に高い。",
    },
    {
      summary: `機能的な問題はほぼ解決。競技特異的ドリルへの移行と心理面の準備を整える最終段階です。`,
      okList: ["フルスプリント（100%出力）","方向転換・カット・デセレレーション","競技特異的ドリル（ほぼ全て）","チーム練習への全体参加","コンタクット練習（段階的）"],
      ngList: ["医師・トレーナー許可なしの試合出場","疼痛を無視した無理な動作"],
      rehabMenu: [
        { title: "スプリント（80→90→100%）",   sets: "× 5〜8本",  note: "段階的に出力を上げる" },
        { title: "カッティングドリル",          sets: "5〜10分",   note: "45°→90°→急激な切り返し" },
        { title: "競技特異的ドリル",            sets: "練習準拠",  note: "ポジション特異的な動作を含む" },
        { title: "ノルディックハムストリングス", sets: "8〜10回 × 3", note: "予防目的で継続" },
      ],
      timeline: [
        { week: "4〜6週", goal: "心理的準備完了",  activity: "全動作・コンタクット練習" },
        { week: "6週〜",  goal: "完全復帰",        activity: "試合出場" },
      ],
      alert: "スポーツ心理面のサポートも重要。再受傷への恐怖がパフォーマンスを制限することがある。",
    },
    {
      summary: `全ての評価をクリア。スポーツへの完全復帰が可能な状態です。予防トレーニングを継続しながら競技に参加してください。`,
      okList: ["全ての競技活動・試合への参加","コンタクット・フルスピードの動作","ポジション固有の全ての動作","予防トレーニングの継続（週2〜3回）"],
      ngList: ["予防トレーニングの完全中止（再受傷リスク上昇）","疼痛を我慢しての継続（新たな損傷サイン）"],
      rehabMenu: [
        { title: "ノルディックハムストリングス（維持）", sets: "8〜10回 × 3", note: "シーズン通じて週2〜3回継続" },
        { title: "動的ストレッチウォームアップ",         sets: "練習前10〜15分", note: "レッグスイング・フランケンシュタイン等" },
        { title: "アイシング（必要時）",                 sets: "練習後20分",    note: "疼痛・腫脹を感じたら即実施" },
      ],
      timeline: [
        { week: "復帰後2週",  goal: "試合強度への完全適応", activity: "全試合・全練習参加" },
        { week: "シーズン中", goal: "再受傷予防",           activity: "予防トレーニング継続" },
      ],
      alert: "完全復帰後も違和感・疼痛を感じたら即座に活動を中止し、医師・トレーナーに報告。",
    },
  ];

  const d = data[idx];
  return {
    phase: `Phase ${idx + 1}：${MUSCLE_STRAIN_PHASES[idx].name}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: MUSCLE_STRAIN_PHASES,
  };
}

// --- Ankle Sprain ---

function anklePlan(p: GeneratePlanParams): RehabPlan {
  const days     = getDays(p.injuryDate);
  const okROM    = t(p.tests, "okROM");
  const okWeight = t(p.tests, "okWeight");
  const okHop    = t(p.tests, "okHop");
  const okAgility = t(p.tests, "okAgility");
  const okSprint = t(p.tests, "okSprint");
  const gradeLabel = p.grade === "I" ? "Ⅰ度" : p.grade === "II" ? "Ⅱ度" : "Ⅲ度";
  const td = getTargetDays(p.targetDate);

  let idx = 0;
  if      (!okROM || !okWeight) idx = 0;
  else if (!okHop)              idx = 1;
  else if (!okAgility)          idx = 2;
  else if (!okSprint)           idx = 3;
  else                          idx = 4;

  const phases = ["急性期","亜急性期","機能回復期（ジョグ段階）","スポーツ準備期","競技復帰期"];

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `足関節捻挫 ${gradeLabel}の急性期です。POLICE原則に従い、最適な荷重と保護を行いながら炎症をコントロールします。`,
      okList: ["アイシング（20分 × 4〜6回/日）","弾性包帯・サポーターによる圧迫","松葉杖を使った免荷〜部分荷重歩行","足関節ポンプ運動（仰臥位）","上半身トレーニング"],
      ngList: ["全荷重歩行（疼痛時）","裸足での歩行","温熱療法（急性期48時間以内）","強い伸張・マッサージ"],
      rehabMenu: [
        { title: "アイシング（POLICE）",    sets: "20分 × 6回",   note: "Optimal Load：痛みのない範囲で荷重開始" },
        { title: "足関節ポンプ運動",        sets: "20回 × 5セット", note: "仰臥位・挙上位で実施" },
        { title: "タオルギャザー",          sets: "2〜3分 × 3",   note: "内在筋強化。座位で実施可" },
        { title: "等尺性内返し・外返し",    sets: "10秒 × 10回",  note: "固定壁に足を押し当てる形で実施" },
      ],
      timeline: [
        { week: "0〜3日",  goal: "炎症コントロール", activity: "POLICE・免荷" },
        { week: "3〜7日",  goal: "荷重痛消失",       activity: "部分→全荷重歩行" },
        { week: "1〜2週",  goal: "ホップ可",         activity: "筋力・バランス訓練" },
        { week: "2〜4週",  goal: "スポーツ復帰",     activity: "競技特異的ドリル" },
      ],
      alert: "骨折除外のためOttawa Ankle Ruleを確認してください。",
    },
    {
      summary: `ROM・荷重は問題なし。ホップでまだ疼痛があります。固有感覚・筋力訓練を中心に進める亜急性期です。`,
      okList: ["通常歩行（テーピング着用推奨）","固定自転車（軽負荷）","水中ウォーキング","バランストレーニング（両脚→患脚）","軽度のジョグ（疼痛なし）"],
      ngList: ["ホップ・ジャンプ","方向転換・カット","コンタクットプレー","裸足での高負荷運動"],
      rehabMenu: [
        { title: "バランスボード訓練",   sets: "30秒 × 3",   note: "両脚→片脚。目閉で難易度UP" },
        { title: "カーフレイズ",         sets: "15回 × 3",   note: "両脚→患脚片脚へ移行" },
        { title: "チューブ内返し・外返し", sets: "15回 × 3", note: "中等度の抵抗。ゆっくりと" },
        { title: "水中ウォーキング",     sets: "15〜20分",   note: "膝丈程度の水深。正常歩行パターン意識" },
      ],
      timeline: [
        { week: "3〜7日",  goal: "ホップ可",       activity: "固有感覚・筋力訓練" },
        { week: "1〜2週",  goal: "方向転換可",     activity: "アジリティ開始" },
        { week: "2〜4週",  goal: "スポーツ復帰",   activity: "競技特異的ドリル" },
      ],
      alert: "活動時はテーピングもしくはサポーターを必ず着用。疼痛・腫脹が出たら即中止。",
    },
    {
      summary: `荷重・ホップはクリア。方向転換でまだ疼痛があります。直線ジョグから段階的にアジリティを加える機能回復期です。`,
      okList: ["直線ジョグ〜ランニング（70〜80%）","固有感覚訓練（不安定面）","筋力強化（片脚）","低速の方向転換ドリル"],
      ngList: ["急激な切り返し・カット（高速）","フルスプリント","コンタクットプレー"],
      rehabMenu: [
        { title: "ジョグ→ランニング（段階的）",   sets: "10〜20分",   note: "毎回疼痛確認。翌日腫脹チェック" },
        { title: "片脚スクワット",                sets: "10回 × 3",   note: "臀部の沈み込みに注意" },
        { title: "T字ドリル（低速）",             sets: "× 5本",      note: "前後・左右の方向転換訓練" },
        { title: "バランスディスク片脚立ち（動的）", sets: "30秒 × 3", note: "ボールキャッチを加えて難易度UP可" },
      ],
      timeline: [
        { week: "1〜2週",  goal: "方向転換可",     activity: "アジリティ段階的強化" },
        { week: "2〜4週",  goal: "スプリント可",   activity: "競技特異的ドリル" },
        { week: "4週〜",   goal: "完全復帰",       activity: "試合出場" },
      ],
      alert: "Ankle-GO基準（筋力・バランス・ホップ全クリア）が復帰の目安です。",
    },
    {
      summary: `方向転換もクリア。フルスプリントでまだ疼痛があります。競技特異的なスピード・パワーを回復する最終段階です。`,
      okList: ["フルスプリント（段階的に100%へ）","全方向のアジリティドリル","チーム練習への大部分参加","コンタクット練習（段階的）"],
      ngList: ["医師・トレーナー許可なしの試合出場"],
      rehabMenu: [
        { title: "スプリント（80→90→100%）",   sets: "× 6〜10本",  note: "疼痛確認しながら出力上げる" },
        { title: "競技特異的アジリティドリル",  sets: "10〜15分",   note: "サッカー：ドリブル変則、バスケ：ピック＆ロール等" },
        { title: "ジャンプ着地訓練",           sets: "3回 × 5セット", note: "着地時の膝・足首アライメント確認" },
      ],
      timeline: [
        { week: "2〜4週",  goal: "スプリント可",   activity: "競技特異的ドリル" },
        { week: "4週〜",   goal: "完全復帰",       activity: "試合出場" },
      ],
      alert: "半数の足関節捻挫が慢性化します。サポーター・テーピングをシーズン中も継続してください。",
    },
    {
      summary: `全テストクリア。競技復帰が可能な状態です。再受傷予防として活動時のサポーター着用と予防訓練を継続してください。`,
      okList: ["全ての競技活動・試合への参加","全方向の動作・コンタクット","予防トレーニングの継続"],
      ngList: ["予防的サポーター・テーピングの中止（1年間は継続推奨）"],
      rehabMenu: [
        { title: "カーフレイズ・バランス訓練（維持）", sets: "週3回",        note: "再受傷予防プログラムとして継続" },
        { title: "動的ウォームアップ",                sets: "練習前10分",   note: "足関節の動的可動域訓練を含む" },
        { title: "活動後アイシング（必要時）",         sets: "練習後15〜20分", note: "腫脹・熱感があれば実施" },
      ],
      timeline: [
        { week: "復帰後",    goal: "再受傷予防",       activity: "サポーター着用・予防訓練継続" },
        { week: "1年以内",   goal: "慢性化予防",       activity: "固有感覚・筋力トレーニング継続" },
      ],
      alert: "足関節捻挫の慢性不安定性は将来の変形性関節症リスクを高めます。完全復帰後も予防継続を。",
    },
  ];

  const d = data[idx];
  return {
    phase: phases[idx],
    currentPhaseIndex: idx,
    totalPhases: 5,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    showPolice: days <= 3,
    showOttawaRule: days <= 7 && p.grade !== "I",
  };
}

// --- Concussion GRTP ---

function concussionPlan(p: GeneratePlanParams): RehabPlan {
  const okHeadache = t(p.tests, "okHeadache");
  const okCog      = t(p.tests, "okCog");
  const okBalance  = t(p.tests, "okBalance");
  const okExercise = t(p.tests, "okExercise");
  const okSleep    = t(p.tests, "okSleep");

  let idx = 0;
  if      (!okHeadache)                         idx = 0;
  else if (!okCog || !okBalance)                idx = 1;
  else if (!okExercise)                         idx = 2;
  else if (!okSleep)                            idx = 3;
  else                                          idx = 4;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: "頭痛が残っています。症状が完全に消失するまで完全な認知的・身体的安静が必要です（Phase 1）。",
      okList: ["安静（スクリーン時間最小化）","疼痛コントロール（アセトアミノフェン等）","暗室・静音環境での休息","軽い散歩（症状増悪がなければ）"],
      ngList: ["スポーツ活動・体育参加","スクリーン（スマホ・PC・TV）の長時間使用","学業・集中を要する作業","騒がしい環境","コンタクットプレー"],
      rehabMenu: [
        { title: "認知的安静",       sets: "1日中",     note: "スクリーンタイムを最小化。読書・勉強も制限" },
        { title: "症状日記記録",     sets: "1日3回",    note: "頭痛・めまい・霧感を0〜10でスコアリング" },
        { title: "軽度歩行（可能時）", sets: "5〜10分",  note: "症状増悪なければ。屋外の新鮮な空気も有効" },
      ],
      timeline: [
        { week: "症状消失まで",  goal: "完全症状消失",     activity: "完全安静→GRTP Phase 2へ" },
        { week: "Phase 2〜6",    goal: "段階的復帰",       activity: "各24時間以上で症状なければ次フェーズ" },
      ],
      alert: "脳震盪後の「Second Impact Syndrome」は生命の危険があります。症状が残る間は絶対に競技復帰しないでください。",
    },
    {
      summary: "頭痛は消失しましたが、認知症状またはバランス障害が残っています。軽度有酸素運動から開始するGRTP Phase 2です。",
      okList: ["ウォーキング（15〜20分）","水泳（軽度）","固定自転車（低負荷）","認知的作業（徐々に増やす）"],
      ngList: ["ランニング","頭部への衝撃を伴う動作","コンタクットプレー","高強度の運動"],
      rehabMenu: [
        { title: "ウォーキング（有酸素）", sets: "20〜30分",   note: "心拍数を最大の70%以下に保つ" },
        { title: "固定自転車（低負荷）",   sets: "15〜20分",   note: "症状チェックしながら実施" },
        { title: "認知トレーニング（軽度）", sets: "20〜30分", note: "読書・パズル等。疲労感で中止" },
      ],
      timeline: [
        { week: "Phase 2",  goal: "認知症状・バランス改善",  activity: "軽度有酸素運動" },
        { week: "Phase 3〜", goal: "スポーツ特異的運動",     activity: "症状なし24時間後に進む" },
      ],
      alert: "この段階で症状が増悪した場合は直ちにPhase 1に戻り、医師に報告してください。",
    },
    {
      summary: "基本的な認知・バランスは回復。有酸素運動で症状増悪がまだあります。スポーツ特異的な動作を非コンタクットで行うPhase 3です。",
      okList: ["ランニング（スポーツコートでのドリル）","スポーツ特異的な動作（コンタクットなし）","チームとは別メニューで練習","テクニカルスキルの復習"],
      ngList: ["コンタクットプレー","頭部への衝撃","高強度インターバル"],
      rehabMenu: [
        { title: "スポーツ特異的ランニング", sets: "20〜30分",  note: "方向転換を含む。心拍数の80%以下" },
        { title: "テクニカルスキル（非接触）", sets: "練習参加", note: "コートドリル、シュート練習等" },
        { title: "バランス・固有感覚訓練",   sets: "10〜15分", note: "BESSテストで経過確認" },
      ],
      timeline: [
        { week: "Phase 3",   goal: "運動後症状なし",     activity: "スポーツ特異的動作" },
        { week: "Phase 4〜", goal: "非コンタクット練習", activity: "症状なし24時間後に進む" },
      ],
      alert: "運動後24時間以内に症状が増悪した場合は前フェーズに戻ること。",
    },
    {
      summary: "運動での症状はほぼなし。睡眠障害が残っています。非コンタクットでのチーム練習への参加（Phase 4）です。",
      okList: ["チーム練習への参加（非コンタクット）","高強度ドリル","戦術理解・チームシステムへの復帰","睡眠衛生の改善"],
      ngList: ["コンタクットプレー","試合出場（医師許可まで）"],
      rehabMenu: [
        { title: "チーム練習（非接触）",    sets: "フル参加",   note: "コンタクットのないドリルは全て可" },
        { title: "睡眠衛生改善",           sets: "毎日",       note: "就寝前スクリーン禁止・就寝時間固定" },
        { title: "高強度インターバル（短時間）", sets: "10〜15分", note: "心拍最大の90%まで。症状確認" },
      ],
      timeline: [
        { week: "Phase 4",  goal: "睡眠正常化",      activity: "非コンタクット全参加" },
        { week: "Phase 5〜", goal: "コンタクット練習", activity: "医師許可後" },
      ],
      alert: "コンタクット練習への復帰は必ず医師（スポーツ専門医）の書面による許可を得てから。",
    },
    {
      summary: "全テストクリア。医師の許可のもと、コンタクット練習（Phase 5）から試合復帰（Phase 6）へ進める状態です。",
      okList: ["コンタクット練習（医師許可後）","全ての練習メニュー","試合復帰（Phase 6）"],
      ngList: ["医師の書面許可なしのコンタクット参加"],
      rehabMenu: [
        { title: "コンタクット練習（フル）", sets: "練習参加", note: "Phase 5。医師許可書を必ず取得" },
        { title: "試合復帰（Phase 6）",      sets: "通常参加",  note: "症状再発なければ通常の競技生活へ" },
        { title: "再発予防教育",             sets: "1回",      note: "ヘッドギア・プレーテクニックの見直し" },
      ],
      timeline: [
        { week: "Phase 5",  goal: "コンタクット練習", activity: "医師許可後フル参加" },
        { week: "Phase 6",  goal: "試合復帰",         activity: "通常の競技参加" },
      ],
      alert: "GRTPは各フェーズ最低24時間。症状再発で即フェーズ後退。次の脳震盪のリスクが高まるため再発予防教育を必ず実施。",
    },
  ];

  const d = data[idx];
  return {
    phase: `GRTP Phase ${idx + 1}：${GRTP_PHASES[idx].name}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: d.timeline,
    alert: d.alert,
    phaseTracker: GRTP_PHASES,
  };
}

// --- Elbow Throwing ---

const THROWING_PROGRAM: ThrowingStep[] = [
  { step: 1, name: "ウォームアップ投球",   distance: "10m",  reps: "× 20球" },
  { step: 2, name: "軽投（50%）",          distance: "15m",  reps: "× 30球" },
  { step: 3, name: "中強度（70%）",         distance: "20m",  reps: "× 30球" },
  { step: 4, name: "通常強度（90%）",       distance: "30m",  reps: "× 30球" },
  { step: 5, name: "全力投球（100%）",      distance: "45m",  reps: "× 20球" },
  { step: 6, name: "競技復帰（試合距離）",  distance: "ポジション距離", reps: "球数制限内" },
];

function elbowThrowingPlan(p: GeneratePlanParams): RehabPlan {
  const okPainFree = t(p.tests, "okPainFree");
  const okROM      = t(p.tests, "okROM");
  const okValgus   = t(p.tests, "okValgus");
  const okThrow    = t(p.tests, "okThrow");

  const passCount = [okPainFree, okROM, okValgus, okThrow].filter(Boolean).length;
  const isSevere  = p.grade === "severe";

  const summary = isSevere
    ? `投球障害肘（重度・UCL完全断裂）の可能性があります。Tommy John手術（UCL再建術）の適応評価のため整形外科専門医への紹介が必要です。`
    : passCount <= 1
    ? `投球障害肘（内側型）の急性期〜亜急性期です。完全な投球禁止と炎症コントロールから開始します。`
    : passCount <= 3
    ? `投球障害肘の回復期です。段階的投球プログラムで競技復帰を目指します。`
    : `投球動作の疼痛も消失しています。フルスローイングプログラムで最終段階の復帰を進めます。`;

  return {
    phase: isSevere ? "専門医紹介段階" : passCount <= 1 ? "投球禁止期" : passCount <= 3 ? "段階的投球期" : "全力投球復帰期",
    currentPhaseIndex: isSevere ? 0 : passCount,
    totalPhases: 4,
    summary,
    okList: isSevere
      ? ["整形外科専門医への受診（MRI評価）","アイシング・消炎鎮痛（医師指示）","非投球上肢・体幹のトレーニング"]
      : passCount <= 1
      ? ["アイシング（肘・前腕）","肩・体幹の筋力維持","下肢トレーニング（スクワット・デッドリフト）","走り込み（下半身強化）"]
      : ["段階的投球プログラム（下記参照）","肘周囲筋力強化（前腕回内外・手関節）","肩甲帯安定化","体幹・下肢連動トレーニング"],
    ngList: isSevere
      ? ["投球動作（いかなる強度も禁止）","コンタクットプレー"]
      : passCount <= 1
      ? ["投球（いかなる強度も禁止）","肘への衝撃・負荷","コンタクットプレー"]
      : ["疼痛を我慢しての投球","球数制限を超えた投球","投球後のアイシング省略"],
    rehabMenu: isSevere
      ? [
          { title: "整形外科受診",               sets: "早急に",       note: "MRI評価・手術適応確認" },
          { title: "アイシング",                 sets: "20分 × 4〜6回", note: "肘・前腕を冷却" },
          { title: "非投球肢トレーニング",       sets: "週3〜4回",     note: "体幹・下肢・反対側上肢の維持" },
        ]
      : passCount <= 1
      ? [
          { title: "アイシング",                 sets: "20分 × 4〜6回", note: "前腕・肘の炎症コントロール" },
          { title: "前腕回内外（チューブ）",     sets: "15回 × 3",     note: "痛みのない範囲のみ" },
          { title: "リストカール（軽負荷）",     sets: "15回 × 3",     note: "手関節屈筋・伸筋の維持" },
          { title: "走り込み",                   sets: "20〜30分",     note: "下半身コンディション維持" },
        ]
      : [
          { title: "段階的投球プログラム",       sets: "下記参照",     note: "各ステップを3日以上実施してから次へ" },
          { title: "前腕回内外強化",             sets: "15回 × 3",    note: "UCL保護のための最重要筋群" },
          { title: "肩甲骨安定化",               sets: "各15回 × 3", note: "ローテーターカフ・前鋸筋強化" },
          { title: "投球後アイシング",           sets: "20分（毎回）", note: "必ず実施。省略は炎症悪化のリスク" },
        ],
    timeline: [
      { week: "投球禁止期（2〜6週）",  goal: "炎症消退",       activity: "体幹・下肢・非投球上肢のみ" },
      { week: "段階的投球（4〜8週）",  goal: "疼痛なく投球可", activity: "距離・強度を段階的に増加" },
      { week: "全力投球（8〜12週）",   goal: "競技距離・強度", activity: "試合に向けた最終調整" },
    ],
    alert: isSevere
      ? "Tommy John手術（UCL再建術）後の復帰期間は12〜18ヶ月です。早期に専門医を受診してください。"
      : "投球障害肘の最大の原因は投げ過ぎです。球数制限・インニング制限を必ず守ること。",
    throwingProgram: !isSevere && passCount >= 2 ? THROWING_PROGRAM : undefined,
  };
}

// --- Generic Plan ---

function genericPlan(p: GeneratePlanParams): RehabPlan {
  const days = getDays(p.injuryDate);
  const inj = INJURY_TYPES.find((x) => x.id === p.injuryId);
  const label = inj?.label ?? p.injuryId;

  const isAcute     = days <= 7;
  const isSubacute  = days <= 21;

  const phase = isAcute ? "急性期" : isSubacute ? "亜急性期〜回復期" : "機能回復〜スポーツ復帰期";

  return {
    phase,
    currentPhaseIndex: isAcute ? 0 : isSubacute ? 1 : 2,
    totalPhases: 3,
    summary: `${label}（${p.grade}）の${phase}です。症状と画像所見に基づいて段階的なリハビリプランを進めます。`,
    okList: isAcute
      ? ["安静・保護（損傷部位）","アイシング（20分 × 4〜6回）","疼痛なし範囲の自動運動","上肢または下肢の代替トレーニング"]
      : isSubacute
      ? ["段階的な関節可動域訓練","等尺性→等張性筋力強化","有酸素運動（非患部）","固有感覚訓練"]
      : ["競技特異的ドリルの導入","チーム練習への段階的参加","筋力・パワー回復トレーニング","コンタクット練習（段階的）"],
    ngList: isAcute
      ? ["患部への強い負荷","疼痛を誘発する動作","コンタクットプレー","温熱療法（48時間以内）"]
      : isSubacute
      ? ["最大強度の運動","コンタクットプレー","疼痛を誘発する動作"]
      : ["医師許可なしの試合出場"],
    rehabMenu: isAcute
      ? [
          { title: "アイシング",         sets: "20分 × 4〜6回", note: "炎症コントロール" },
          { title: "等尺性運動",         sets: "10秒 × 10回",   note: "痛みのない範囲で患部周囲筋の維持" },
          { title: "体幹安定化",         sets: "30秒 × 3",      note: "プランク、ドローイン" },
        ]
      : isSubacute
      ? [
          { title: "関節可動域訓練",     sets: "各方向10回 × 3", note: "痛みのない範囲でゆっくり" },
          { title: "段階的筋力強化",     sets: "15回 × 3",       note: "軽負荷から段階的に増加" },
          { title: "バランス訓練",       sets: "30秒 × 3",       note: "固有感覚の回復" },
        ]
      : [
          { title: "競技特異的ドリル",   sets: "練習準拠",       note: "スポーツのポジション固有動作" },
          { title: "筋力強化（高負荷）", sets: "8〜10回 × 4",    note: "健側比90%以上を目標" },
          { title: "アジリティ訓練",     sets: "10〜15分",       note: "方向転換・加速・減速" },
        ],
    timeline: [
      { week: "0〜1週",   goal: "炎症コントロール",  activity: "安静・保護・アイシング" },
      { week: "1〜3週",   goal: "機能回復",          activity: "ROM・筋力訓練" },
      { week: "3〜6週〜", goal: "スポーツ復帰",      activity: "競技特異的ドリル→試合" },
    ],
    alert: `${label}は専門医による定期的な評価が必要です。症状悪化・新たな痛みは即座に医師に報告してください。`,
  };
}

// ---- Main Entry Point ----

export function generatePlan(p: GeneratePlanParams): RehabPlan {
  switch (p.injuryId) {
    case "hamstring":
    case "quadriceps":
      return muscleStrainPlan(p);
    case "ankle_sprain":
      return anklePlan(p);
    case "concussion":
      return concussionPlan(p);
    case "elbow_throwing":
      return elbowThrowingPlan(p);
    default:
      return genericPlan(p);
  }
}
