// ---- Types ----

export type InjuryId =
  | "hamstring" | "quadriceps" | "ankle_sprain" | "mcl" | "meniscus"
  | "stress_fracture" | "spondylolysis" | "rotator_cuff" | "shoulder_dislocation"
  | "elbow_throwing" | "concussion" | "slap_lesion"
  | "heat_stroke" | "groin";

export type SportId =
  | "soccer" | "basketball" | "baseball" | "tennis" | "swimming"
  | "track_long" | "track_sprint" | "rugby" | "volleyball" | "judo"
  | "american_football" | "gymnastics" | "lacrosse"
  | "other_noncontact" | "other_contact";

export type JissType = "I" | "II" | "III";
export type JissDegree = 1 | 2 | 3;
export interface JissGrade { type: JissType; degree: JissDegree }

export interface TestItem { id: string; title: string; description: string; icon: string; /** 「△違和感あり」ボタンを表示するか（症状系テスト用のグレーゾーン。判定上は"保留"＝進めない扱い） */ allowDiscomfort?: boolean }
export interface TestResult { id: string; result: boolean | null | "doctor_pending" | "discomfort" }
export interface RehabMenuItem { title: string; sets: string; note: string; details?: string }
export interface TimelineRow { week: string; goal: string; activity: string; criteria?: string }
export interface PhaseTrackerItem { phase: number; name: string; desc: string; duration: string }
export interface ThrowingStep { step: number; name: string; distance: string; reps: string; week?: string; note?: string }

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
  /** エビデンス・出典情報 */
  clinicalGuidance?: string;
  /** 目標日逆算・進捗見通し */
  progressNote?: string;
  /** 段階的投球プログラム：現在の推奨ステップ番号 */
  throwingCurrentStep?: number;
  /** 段階的復帰プログラムの見出し・列ラベル差し替え（未指定なら投球用デフォルト） */
  throwingProgramMeta?: { label?: string; distanceCol?: string; repsCol?: string; noteIcon?: string };
}

export interface GeneratePlanParams {
  injuryId: InjuryId;
  grade: string;
  jissGrade?: JissGrade;
  injuryDate: string;
  targetDate: string;
  surgeryDate?: string;
  tests: TestResult[];
  sport: SportId | "";
  position: string;
  age?: string;
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

export const HAMSTRING_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "急性保護期",       desc: "安静・冷却・圧迫",                                duration: "0〜3日" },
  { phase: 2, name: "亜急性期",         desc: "歩行可・伸長痛（鋭痛）残存",                      duration: "3〜7日" },
  { phase: 3, name: "ジョグ期",         desc: "伸長痛→違和感程度・ジョグ〜70%",                 duration: "1〜2週" },
  { phase: 4, name: "スプリント期",     desc: "圧痛なし・MMT90%・MRI再評価後 全速・対人（Rep制限）", duration: "2〜4週" },
  { phase: 5, name: "フル参加移行期",   desc: "Rep制限練習3回クリア → フル参加",                 duration: "4〜6週" },
  { phase: 6, name: "完全復帰期",       desc: "フル参加クリア・心理的準備完了",                   duration: "6週以降" },
];

export const GRTP_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "完全安静",           desc: "症状消失まで活動禁止",       duration: "症状消失まで" },
  { phase: 2, name: "軽度有酸素運動",     desc: "ウォーキング・水泳",         duration: "最低24時間" },
  { phase: 3, name: "スポーツ特異的運動", desc: "ランニング（コンタクトなし）", duration: "最低24時間" },
  { phase: 4, name: "非コンタクト練習", desc: "ドリル・技術練習",           duration: "最低24時間" },
  { phase: 5, name: "コンタクト練習",   desc: "医師許可後のフル練習",       duration: "最低24時間" },
  { phase: 6, name: "試合復帰",           desc: "通常の競技参加",             duration: "—" },
];

export const HEAT_STROKE_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "活動禁止期", desc: "完全安静・症状消失待ち",      duration: "0〜1日" },
  { phase: 2, name: "軽活動可",   desc: "症状消失確認・水分管理",      duration: "1〜3日" },
  { phase: 3, name: "段階復帰",   desc: "軽運動開始・暑熱順化準備",   duration: "3〜7日" },
  { phase: 4, name: "完全復帰",   desc: "段階的復帰・暑熱順化実施",   duration: "7〜14日" },
];

// 保存療法は時間ベースではなく機能（基準クリア）ベースで進行。durationは目安・移行基準を示す。
export const SHOULDER_DISLOCATION_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "固定・保護期",   desc: "三角巾保護・ABER肢位厳禁",           duration: "三角巾1週間程度（疼痛に応じ外す）" },
  { phase: 2, name: "可動域回復期",   desc: "段階的ROM・外転＋外旋は後半まで制限", duration: "ROM回復まで（基準で次へ）" },
  { phase: 3, name: "筋力強化期",     desc: "腱板・肩甲帯・固有感覚",             duration: "前方不安感消失まで" },
  { phase: 4, name: "スポーツ準備期", desc: "プライオ・競技動作・コンタクト準備",   duration: "筋力健側比80%まで" },
  { phase: 5, name: "競技復帰期",     desc: "前方不安感なし・コンタクト耐性",       duration: "全基準クリアで復帰" },
];

// MCLは保存療法が基本。機能（基準クリア）ベースで進行。durationは目安・移行基準。
// ※ プロトコル詳細は参考論文の確定後にブラッシュアップ予定（現状は概要版）。
export const MCL_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "急性保護期",         desc: "POLICE・外反ストレス回避（必要に応じ装具）", duration: "歩行痛消失まで（〜72hはPOLICE）" },
  { phase: 2, name: "可動域・荷重回復期", desc: "段階的ROM・全荷重歩行へ",                 duration: "ROM回復まで" },
  { phase: 3, name: "筋力強化期",         desc: "大腿四頭筋・ハム・殿筋・外反制御",          duration: "外反テスト陰性まで" },
  { phase: 4, name: "スポーツ準備期",     desc: "アジリティ・ドロップジャンプ・着地制御",     duration: "筋力左右差<10%・ホップLSI≧90%まで" },
  { phase: 5, name: "競技復帰期",         desc: "カット・コンタクト耐性・心理的準備",        duration: "全基準クリアで復帰" },
];

// 腰椎分離症（腰椎の疲労骨折）。機能ベースで進行。硬性コルセット＋骨癒合＋再発予防の体づくりが軸。
export const SPONDYLOLYSIS_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "固定・骨癒合期",     desc: "硬性コルセット早急作成・スポーツ完全休止・伸展/回旋回避", duration: "安静時痛消失まで" },
  { phase: 2, name: "体幹機能回復期",     desc: "コルセット下で体幹安定化・股関節柔軟性",          duration: "ADL痛消失まで" },
  { phase: 3, name: "伸展テスト確認期",   desc: "Stork＋Kempの陰性化を待つ・体幹強化継続",         duration: "Stork＋Kemp陰性まで" },
  { phase: 4, name: "MRI再評価期",        desc: "画像で改善確認（ジョグ前）",                      duration: "MRIで改善確認まで" },
  { phase: 5, name: "ジョグ・競技動作再開期", desc: "ジョグ→競技特異的動作の段階的再開",            duration: "ジョグ無痛まで" },
  { phase: 6, name: "競技復帰期",         desc: "競技動作無痛・画像癒合確認・再発予防の体づくり",   duration: "全基準クリア＋画像確認で復帰" },
];

// 腰椎分離症（大学生以上）：症状・機能ベース。画像ゲートなし。軟性〜半硬性コルセット。
export const SPONDYLOLYSIS_PHASES_COLLEGE: PhaseTrackerItem[] = [
  { phase: 1, name: "安静・体幹リハ期",   desc: "軟性〜半硬性コルセット・疼痛消失までスポーツ休止・体幹安定化のみ", duration: "安静時痛消失まで" },
  { phase: 2, name: "体幹機能回復期",     desc: "コルセット下で体幹安定化・股関節柔軟性",          duration: "ADL痛消失まで" },
  { phase: 3, name: "伸展テスト確認期",   desc: "Stork＋Kempの陰性化を待つ（伸展痛なし）",         duration: "伸展テスト陰性まで" },
  { phase: 4, name: "ジョグ期",           desc: "ジョグ（出力40→60%段階的）",                    duration: "ジョグ無痛まで" },
  { phase: 5, name: "方向転換・ジャンプ期", desc: "方向転換・ジャンプ着地の段階的再開",            duration: "方向転換・ジャンプ無痛まで" },
  { phase: 6, name: "競技復帰期",         desc: "競技動作無痛・誘発テスト陰性維持（画像不要）",     duration: "全基準クリアで復帰" },
];

// 下肢疲労骨折（緩徐発症の骨ストレス障害）。活動制限→画像確認→段階的荷重・ランニング復帰。
export const STRESS_FRACTURE_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "活動制限・保護期",   desc: "疼痛に応じ松葉杖・運動はADLレベルに制限",       duration: "圧痛消失まで" },
  { phase: 2, name: "荷重・歩行回復期",   desc: "自立歩行・全荷重へ",                            duration: "歩行痛消失まで" },
  { phase: 3, name: "画像確認期",         desc: "X線で仮骨／MRIで改善を確認",                    duration: "画像で仮骨・改善確認まで" },
  { phase: 4, name: "筋力強化期",         desc: "カーフレイズ・下半身（15→8RM）／片足カーフレイズ目標", duration: "片足カーフレイズ無痛〜違和感まで" },
  { phase: 5, name: "ホップ準備期",       desc: "片足ホップ10回テスト（痛みで数回→安静継続ADL）", duration: "ホップ違和感程度で10回まで" },
  { phase: 6, name: "ジョグ期",           desc: "ホップ違和感→ジョグから段階的up（ダッシュ前）", duration: "ホップ無痛で10回まで" },
  { phase: 7, name: "ダッシュ・競技復帰期", desc: "ホップ無痛→段階的フルダッシュ→競技復帰",       duration: "全基準クリアで復帰" },
];

// 半月板損傷（保存療法）。機能ベースで進行：腫脹コントロール→ROM→筋力(患健比90%)→荷重筋トレ・ジョグ→方向転換→復帰。
export const MENISCUS_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "急性・腫脹コントロール期",   desc: "保護・腫脹/関節液の軽減・無痛ROM",       duration: "関節裂隙圧痛・腫脹消失まで" },
  { phase: 2, name: "可動域回復期",             desc: "完全伸展・屈曲を左右差なく無痛で",       duration: "ROM左右差消失まで" },
  { phase: 3, name: "筋力回復期",               desc: "大腿四頭筋・ハム 患健比90%へ",           duration: "筋力患健比90%まで" },
  { phase: 4, name: "荷重筋トレ・ジョグ期",     desc: "スクワット・デッドリフト無痛→ジョグ",   duration: "荷重筋トレ無痛まで" },
  { phase: 5, name: "方向転換・競技復帰準備期", desc: "ピボット・カッティング・ジャンプ着地",   duration: "競技動作無痛まで" },
  { phase: 6, name: "競技復帰期",               desc: "全機能基準クリア・段階的復帰",           duration: "全基準クリアで復帰" },
];

// 腱板損傷（保存療法）。機能ベースで進行：疼痛/圧痛→ROMフル→腱板テスト全合格&筋力→段階的復帰→復帰。
export const ROTATOR_CUFF_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "疼痛コントロール期",     desc: "安静時/夜間痛・圧痛の軽減・無痛ROM",          duration: "安静時/夜間痛・圧痛消失まで" },
  { phase: 2, name: "可動域回復期",           desc: "挙上・外旋・内旋をフル（左右差なし・無痛）",   duration: "ROMフルまで" },
  { phase: 3, name: "腱板筋力・機能回復期",   desc: "腱板・肩甲帯の強化・腱板テスト陰性化",         duration: "腱板テスト全合格＆筋力まで" },
  { phase: 4, name: "段階的復帰期",           desc: "OH競技=段階的投球／他=個人→対人→試合形式",   duration: "段階的復帰課題クリアまで" },
  { phase: 5, name: "競技復帰期",             desc: "全機能基準クリア・段階的復帰",                duration: "全基準クリアで復帰" },
];

// ---- Grades by Injury ----

export interface GradeOption { value: string; label: string; desc: string }

export const GRADES_BY_INJURY: Partial<Record<InjuryId, GradeOption[]>> = {
  ankle_sprain: [
    { value: "I",   label: "Ⅰ度", desc: "軽度（靱帯微細損傷）" },
    { value: "II",  label: "Ⅱ度", desc: "中等度（部分断裂）" },
    { value: "III", label: "Ⅲ度", desc: "重度（完全断裂）" },
  ],
  mcl: [
    { value: "I",   label: "Ⅰ度", desc: "外反動揺なし（内側裂隙開大3〜5mm）" },
    { value: "II",  label: "Ⅱ度", desc: "30°屈曲位で外反動揺（開大6〜10mm）" },
    { value: "III", label: "Ⅲ度", desc: "0°+30°で外反動揺（開大>10mm・完全断裂）" },
  ],
  // meniscus: グレード不要（断裂型は画像/医師判断であり本アプリ対象外）。機能評価で進行。
  stress_fracture: [
    { value: "I",   label: "Grade I",   desc: "骨膜反応のみ" },
    { value: "II",  label: "Grade II",  desc: "骨膜＋骨内変化" },
    { value: "III", label: "Grade III", desc: "骨折線あり（要免荷）" },
  ],
  spondylolysis: [
    { value: "early",       label: "初期（疲労蓄積期）", desc: "骨折線なし・MRI高信号のみ" },
    { value: "progressive", label: "進行期（骨折線あり）", desc: "両側性・骨折線明瞭" },
    { value: "terminal",    label: "終末期（偽関節）",   desc: "骨癒合困難・偽関節形成" },
  ],
  // rotator_cuff: グレード不要（断裂型は画像/医師判断で本アプリ対象外）。機能評価で進行。
  shoulder_dislocation: [
    { value: "first",     label: "初回脱臼",   desc: "初回の肩関節前方脱臼" },
    { value: "recurrent", label: "反復性脱臼", desc: "2回以上の脱臼歴あり" },
  ],
  elbow_throwing: [
    { value: "mild",     label: "軽度",  desc: "内側上顆炎・UCL軽度損傷" },
    { value: "moderate", label: "中等度", desc: "UCL中等度損傷" },
    { value: "severe",   label: "重度",  desc: "UCL完全断裂（Tommy John）" },
  ],
  // concussion: グレード不要のため削除
  slap_lesion: [
    { value: "conservative", label: "保存療法（手術なし）",   desc: "疼痛消失までノースロー・肩以外のトレーニング継続・テストクリア後に段階的投球復帰" },
    { value: "stable",       label: "安定型（デブリードマン）", desc: "後上方関節唇の不安定性なし・固定縫合不要" },
    { value: "unstable",     label: "不安定型（縫合修復）",   desc: "前上方関節唇の不安定性あり・縫合アンカー固定" },
  ],
  heat_stroke: [
    { value: "I",   label: "Ⅰ度（軽症）",  desc: "めまい・失神・筋痙攣・大量発汗" },
    { value: "II",  label: "Ⅱ度（中等症）", desc: "頭痛・嘔吐・倦怠感・集中力低下・判断力低下" },
    { value: "III", label: "Ⅲ度（重症）",  desc: "意識障害・痙攣・肝腎機能障害（入院加療必要）" },
  ],
  groin: [
    { value: "adductor",  label: "内転筋型",   desc: "内もも〜鼠径部の痛み（Adductor-related / Doha分類）" },
    { value: "iliopsoas", label: "腸腰筋型",   desc: "股関節前面〜腸骨窩の痛み（Iliopsoas-related / Doha分類）" },
    { value: "inguinal",  label: "鼠径部型",   desc: "脚の付け根・そけい管部の痛み（Inguinal-related / Doha分類）" },
    { value: "pubic",     label: "恥骨型",     desc: "恥骨〜下腹部の痛み（Pubic-related / Doha分類）" },
  ],
};

// ---- Injury Types ----

export interface InjuryDef {
  id: InjuryId;
  label: string;
  area: "下肢" | "体幹" | "上肢" | "頭部" | "全身";
  usesJiss: boolean;
  icon: string;
  /** 機能評価に「医師未許可」ボタンを表示するか */
  showDoctorOption?: boolean;
  /** 手術（予定）日入力を表示するか */
  hasSurgery?: boolean;
}

export const INJURY_TYPES: InjuryDef[] = [
  { id: "hamstring",            label: "ハムストリングス肉離れ",     area: "下肢", usesJiss: true,  icon: "🦵" },
  { id: "quadriceps",           label: "大腿四頭筋肉離れ",           area: "下肢", usesJiss: true,  icon: "🦵" },
  { id: "ankle_sprain",         label: "足関節捻挫",                 area: "下肢", usesJiss: false, icon: "🦶" },
  { id: "mcl",                  label: "内側側副靱帯損傷（MCL）",    area: "下肢", usesJiss: false, icon: "🦵", showDoctorOption: true },
  { id: "meniscus",             label: "半月板損傷",                 area: "下肢", usesJiss: false, icon: "🦴" },
  { id: "stress_fracture",      label: "下肢疲労骨折",               area: "下肢", usesJiss: false, icon: "🦴", showDoctorOption: true },
  { id: "spondylolysis",        label: "腰椎分離症",                 area: "体幹", usesJiss: false, icon: "🦴", showDoctorOption: true },
  { id: "rotator_cuff",         label: "腱板損傷",                   area: "上肢", usesJiss: false, icon: "💪" },
  { id: "shoulder_dislocation", label: "肩関節脱臼",                 area: "上肢", usesJiss: false, icon: "💪", showDoctorOption: true, hasSurgery: true },
  { id: "elbow_throwing",       label: "投球障害肘（内側型）",       area: "上肢", usesJiss: false, icon: "⚾", hasSurgery: true },
  { id: "concussion",           label: "脳震盪",                       area: "頭部", usesJiss: false, icon: "🧠", showDoctorOption: true },
  { id: "slap_lesion",          label: "上方関節唇損傷（SLAP）",       area: "上肢", usesJiss: false, icon: "🦾", showDoctorOption: true, hasSurgery: true },
  { id: "heat_stroke",          label: "熱中症",                       area: "全身", usesJiss: false, icon: "🌡️", showDoctorOption: true },
  { id: "groin",                label: "グロインペイン症候群",          area: "下肢", usesJiss: false, icon: "🩻" },
];

// ---- Tests by Injury ----

export const TESTS_BY_INJURY: Record<InjuryId, TestItem[]> = {
  hamstring: [
    { id: "okWalk",         title: "歩行痛なし",                       description: "通常歩行時に患部の疼痛がないか",                                                                                                                                                                                                                                                                                     icon: "🚶" },
    { id: "okStretchLight", title: "伸長痛が違和感程度に軽減",         description: "大腿後面のストレッチ（SLR・腹臥位膝屈曲など）で鋭い疼痛ではなく「違和感・軽い張り」程度に収まっているか。この段階でゆっくりジョグを開始します。",                                                                                                                                                               icon: "🤸" },
    { id: "okPress",        title: "圧痛なし",                         description: "患部（大腿後面）を直接圧迫しても疼痛がないか（圧痛の消失）。",                                                                                                                                                                                                                                                       icon: "👆" },
    { id: "okResist",       title: "抵抗運動痛なし＆患側MMT 90%以上",  description: "等尺性膝屈曲の抵抗運動（うつ伏せで膝を曲げる方向に力を入れ、抵抗をかける）で大腿後面に疼痛がなく、患側の出力が健側の90%以上（左右差10%以内）か。圧痛・抵抗運動痛の両方がクリアしたらMRI再評価を実施し、問題なければフルスプリント・対人練習をRep制限付きで開始。",                                          icon: "💪" },
    { id: "okRepPractice",  title: "Rep制限付き練習3回クリア",          description: "フルスプリント・対人参加をRep制限付き（初回：通常の30〜50%本数）で3回の練習を通じて徐々に本数を増やし、翌日に疼痛・腫脹の増悪がなかったか。問題なければフル参加へ。",                                                                                                                                         icon: "📅" },
    { id: "okPsych",        title: "フル参加クリア＆心理的準備完了",   description: "制限なしのフル参加を行い問題がないか、かつ再受傷への不安なくスポーツ動作に自信があるか。",                                                                                                                                                                                                                         icon: "🧠" },
  ],
  quadriceps: [
    { id: "okWalk",    title: "歩行痛なし",       description: "通常歩行時に患部の疼痛がないか",                               icon: "🚶" },
    { id: "okStretch", title: "ストレッチ痛なし", description: "患側の膝屈曲可動域（ROM）が健側の90%以上（左右差10%以内）で、かつ伸張時に大腿前面の疼痛がないか。伏臥位で踵を臀部に近づけ、左右の曲がり具合を比べて判断する。",                      icon: "🤸" },
    { id: "okPress",   title: "圧痛なし",         description: "患部を直接圧迫しても疼痛が出ないか",                           icon: "👆" },
    { id: "okResist",  title: "抵抗運動痛なし",   description: "【判定基準】患側の等尺性筋力が健側の90%以上（左右差10%以内）かつ抵抗時に大腿前面の疼痛がないか。【実施方法】椅子の端に腰掛けて膝を約90度に曲げ、下腿前面（膝の前側）に反対の手を当て、膝を伸ばす方向に力を入れ5〜10秒押し返す（最大努力の50〜70%）。補助者不要・1人で可。痛みがないかと左右の力の入りやすさの差で判断する。",                       icon: "💪" },
    { id: "okPsych",   title: "心理的準備完了",   description: "再受傷への不安が少なく、スポーツ動作に自信があるか",           icon: "🧠" },
  ],
  ankle_sprain: [
    { id: "okROM",     title: "ROM正常",     description: "底屈・背屈の左右差が10°以内か",             icon: "↕" },
    { id: "okWeight",  title: "荷重痛なし",  description: "片脚立ちで10秒間、疼痛なく立てるか",         icon: "⚖" },
    { id: "okHop",     title: "ホップテスト", description: "患側片脚で3回連続ホップできるか",           icon: "↑" },
    { id: "okAgility", title: "方向転換",    description: "疼痛なくサイドステップ（3m往復）ができるか", icon: "⟷" },
    { id: "okSprint",  title: "直線走",      description: "30mを疼痛なくフルスピードで走れるか",        icon: "▶" },
  ],
  mcl: [
    { id: "okWalk",     title: "歩行痛なし",          description: "通常歩行・荷重時に膝内側の疼痛がないか",                                                       icon: "🚶" },
    { id: "okROM",      title: "可動域回復",          description: "膝の屈伸可動域が健側とほぼ同等（左右差なし）で、伸展時・屈曲時に内側の疼痛がないか",            icon: "↕" },
    { id: "okValgus",   title: "外反ストレステスト陰性（無痛）", description: "膝を軽く曲げた状態（30°）で下腿を外側に押す（外反ストレス）と、内側の疼痛や「ゆるい・抜ける」不安定感がないか。健側と比べて開きが大きくないこと。医師の評価が望ましい項目です。", icon: "👆" },
    { id: "okStrength", title: "筋力 左右差 <10%",      description: "大腿四頭筋・ハムストリング（および股関節の内外旋）の筋力が左右差10%未満（LSI≧90%）か。※MCL固有の基準は確立されておらず、ACLリハから外挿した一般的基準です。",                            icon: "💪" },
    { id: "okHopAgility", title: "4種ホップLSI≧90%＋競技課題", description: "片脚ホップ4種（シングル・トリプル・クロスオーバー・6mタイム）の左右対称性指数（LSI）が全て90%以上で、かつ無痛・外反制御下で競技特異的なカッティング/ピボット課題が行えるか（着地・カットで膝が内側に入らない＝ニーインを制御）。※ACL基準からの外挿。", icon: "↩" },
  ],
  meniscus: [
    { id: "okJointLine", title: "関節裂隙の圧痛・腫脹なし",                  description: "膝の内/外側の関節裂隙に圧痛がなく、関節の腫れ（関節液）が引いているか。関節裂隙圧痛は半月板障害の参考所見（感度・特異度とも約83%）。腫脹・圧痛の残存は炎症・負荷過多のサインのため、無理に次へ進めません。", icon: "👆" },
    { id: "okROM",       title: "可動域 左右差なし（無痛）",                description: "完全伸展・完全屈曲が健側と同等（左右差なし）で、最終域でも疼痛・引っかかりがないか。",                                                                 icon: "↕" },
    { id: "okStrength",  title: "筋力 患健比90%以上",                       description: "大腿四頭筋・ハムストリングの筋力（MMT、可能なら等速性）が健側比90%以上（左右差10%未満）か。",                                                           icon: "💪" },
    { id: "okSquat",     title: "荷重筋トレ無痛（スクワット・デッドリフト）", description: "フルスクワット・デッドリフトなど荷重をかけた筋力トレーニングを疼痛なく行えるか。クリアできればジョグ・ランニングへ進みます。",                          icon: "🏋" },
    { id: "okPivot",     title: "ピボット・カッティング無痛",               description: "方向転換（ピボット）・カッティング・ジャンプ着地など競技特異的動作を疼痛・不安感なく行えるか（競技復帰の目安）。",                                       icon: "⟳" },
  ],
  stress_fracture: [
    { id: "okPointTender", title: "圧痛消失",            description: "骨折部位を押した時の直接圧痛が消失しているか。疼痛に応じて松葉杖を使用し、運動は日常生活レベルに制限します（違和感程度なら自立歩行可）。", icon: "👆", allowDiscomfort: true },
    { id: "okWalk",        title: "歩行痛なし（自立歩行）", description: "松葉杖なしの通常歩行で疼痛がないか。疼痛が違和感程度まで軽減すれば自立歩行は可ですが、ここでの判定は『歩行時の症状』を問います。", icon: "🚶", allowDiscomfort: true },
    { id: "okImaging",     title: "画像で仮骨形成・改善確認", description: "X線で仮骨形成、またはMRI/CTで骨癒合・骨膜反応の改善が確認されているか。客観的所見のため『可／不可』で判定します。", icon: "📷" },
    { id: "okSingleCalf",  title: "片足カーフレイズ（無痛〜違和感程度）", description: "患側の片足カーフレイズが無痛〜違和感程度で可能か。カーフレイズ・下半身トレを15RM程度からフォーム重視で開始し、段階的に8RMまで上げます。これがクリアできれば次のホップテストへ進みます。", icon: "🦵" },
    { id: "okHop",         title: "片足ホップテスト（10回）",  description: "患側でしっかり片足ジャンプ（ホップ）を10回行い、結果で進路が分かれます。【✓可＝無痛で10回】段階的にフルダッシュまで進めてOK。【△違和感あり＝違和感程度で10回】ジョグから開始し段階的に上げる（フルダッシュはまだ）。【✗不可＝数回で痛みが出て止まる】走らず安静を継続（活動は日常生活レベルまで）、違和感程度で10回できるまで待つ。", icon: "↑", allowDiscomfort: true },
  ],
  spondylolysis: [
    { id: "okPainFree",   title: "安静時疼痛なし",         description: "安静時・夜間の腰部疼痛が消失しているか。診断後は早急に硬性コルセットを作成・装着し、スポーツは完全休止、腰椎の伸展・回旋を避けます（初期ほど骨癒合が得やすい）。",                       icon: "😴" },
    { id: "okWalk",       title: "歩行・ADL痛なし",        description: "通常歩行・日常生活動作で腰部疼痛がないか（硬性コルセット装着下）。",                                                           icon: "🚶" },
    { id: "okExtTest",    title: "伸展テスト陰性（Stork＋Kemp）", description: "片側後屈（Stork：患側一本脚立位で腰を後屈／Jackson test）と、ケンプテスト（立位で後屈＋側屈・回旋を加える）で腰部痛が誘発されないか。分離部の圧痛・叩打痛がないことも確認。両テスト陰性化が次（MRI再評価）への目安。", icon: "🦩" },
    { id: "okImagingImproved", title: "MRI再チェックで改善確認", description: "Stork・ケンプが陰性化した後、MRI（必要に応じCT）を再撮影し、分離部の改善（骨髄浮腫の軽減・骨癒合傾向）が確認されているか。改善が確認できてからジョグ・ランニングへ進みます。判断は専門医が行います。", icon: "📷" },
    { id: "okJog",        title: "ジョグ可",               description: "MRIで改善確認後、コルセット下〜段階的に外した状態で10〜15分のジョグで腰部疼痛が出ないか。",                                                  icon: "🏃" },
    { id: "okSportMove",  title: "競技動作可（画像確認）",   description: "体幹回旋・伸展・ジャンプ・ランニングなど競技特異的動作が無痛で可能か。骨癒合は画像（CT/MRI）で確認。再発予防の体づくり（体幹・柔軟性）が完了しているか。", icon: "🏅" },
  ],
  rotator_cuff: [
    { id: "okPainFree", title: "安静時・夜間痛なし＆圧痛なし",   description: "安静時・夜間の肩の疼痛が消失し、腱板部（大結節など）の圧痛もないか。保存療法はまず疼痛・炎症のコントロールから始めます。",                                                              icon: "😴" },
    { id: "okROM",      title: "肩ROMフル（左右差なし・無痛）", description: "挙上・外旋・内旋の可動域が健側と同等（フル）で、最終域でも疼痛がないか。",                                                                                              icon: "↕" },
    { id: "okStrength", title: "腱板テスト全合格＆筋力",        description: "腱板の各誘発テスト（empty can／外旋・外転抵抗／lift-off・belly-press など）がいずれも無痛・陰性で、外旋・外転筋力が健側と遜色ないか。医療者のもとで実施してください。",       icon: "💪" },
    { id: "okReturn",   title: "段階的復帰課題クリア",          description: "【オーバーヘッド競技】野球肘と同じ段階的投球プログラムを疼痛なく完了したか。【その他の競技】個人練習→対人→試合形式へ進め、各段階で疼痛・不安なくクリアしたか。",              icon: "🏅" },
  ],
  shoulder_dislocation: [
    { id: "okImmobDone",    title: "固定期終了＆安静時痛なし",   description: "医師に指示された固定（スリング）期間を終え、安静時・夜間の肩の疼痛が消失しているか。固定期間は脱臼の方向・程度により異なるため必ず医師の指示に従ってください。", icon: "😴" },
    { id: "okROM",          title: "可動域回復（ABER以外）",     description: "外転＋外旋（ABER：腕を上げて外に開く＝最も脱臼しやすい肢位）以外の方向で、ほぼ全可動域が痛みなく動かせるか。ABER方向は再脱臼予防のため最後まで慎重に進めます。", icon: "↕" },
    { id: "okApprehension", title: "前方不安感テスト陰性",       description: "腕を90°外転＋外旋した肢位（ABER）で「肩が前に外れそう」という不安感（apprehension）が出ないか。不安感があればこの段階に留まり、無理に進めないでください。", icon: "😰" },
    { id: "okStrength",     title: "筋力 健側比80%以上",         description: "外旋（ER）・内旋（IR）の筋力が健側比80%以上か。ER/IR比だけでなく絶対値（体重で正規化）と受傷前の状態との比較を重視します（Athlete Shoulder Consensus）。可能ならハンドヘルドダイナモメーターで評価。", icon: "💪" },
    { id: "okContact",      title: "競技復帰準備（コンタクト耐性・心理面）", description: "対人・タックル・転倒時の手つきなど競技特異的な負荷で、肩の不安感・再脱臼への恐怖がないか。かつ医師の競技復帰許可が出ているか。", icon: "🏈" },
  ],
  elbow_throwing: [
    { id: "okPainFree",  title: "肘痛なし",         description: "日常動作・前腕回内外で疼痛がないか",           icon: "💪" },
    { id: "okROM",       title: "肘ROM正常",        description: "完全伸展〜140°屈曲が疼痛なく可能か",           icon: "↕" },
    { id: "okValgus",    title: "外反ストレス陰性", description: "外反ストレステストで疼痛・不安定性がないか",   icon: "👆" },
    { id: "okThrow",     title: "投球動作可",       description: "疼痛なくスローイング動作（軽負荷）が可能か",   icon: "⚾" },
  ],
  concussion: [
    { id: "okPhase1", title: "Phase 1クリア：安静時に完全無症状（24時間）", description: "頭痛・霧感（ブレインフォグ）・めまい・バランス異常・睡眠障害などの症状がすべて消失し、安静時に24時間以上無症状を維持できているか。【重要】医師管理外の場合は、これに加えて受傷後最低14日が経過していることが必須です。クリアできていれば次のPhase 2（軽度有酸素運動）へ進みます。クリアできていなければ「不可」を選び、完全安静を継続してください。", icon: "🧠" },
    { id: "okPhase2", title: "Phase 2クリア：軽度有酸素運動で無症状（24時間）", description: "最大予測心拍数70%未満のウォーキング・固定自転車・水泳を行い、運動後24時間以内に症状の増悪がなかったか。【心拍70%の出し方】「（220−年齢）×0.7」が目安（例：16歳→(220−16)×0.7≒143拍/分）。測り方は手首または首の脈を15秒数えて×4。心拍計がなければ『会話できる程度（息は弾むが歌えない程度）＝トークテスト』を目安に、ややきつい手前で止めればOK。クリアならPhase 3へ。症状が出たら「不可」で1段階戻る。", icon: "🚶" },
    { id: "okPhase3", title: "Phase 3クリア：スポーツ固有運動で無症状（24時間）", description: "ランニング・方向転換を含むスポーツ固有のドリル（頭部への衝撃なし）を行い、24時間以内に症状の増悪がなかったか。クリアならPhase 4（非コンタクト練習）へ。", icon: "🏃" },
    { id: "okPhase4", title: "Phase 4クリア：非コンタクト練習で無症状＋医師のコンタクト許可", description: "パス・ドリルなど非コンタクト練習に全参加し（漸進的レジスタンス開始可）、24時間以内に症状増悪がなく、かつ医師からフル・コンタクト練習の許可が出ているか。許可がまだなら「医師未許可」を選択してください。クリアならPhase 5（フルコンタクト）へ。", icon: "🛡️" },
    { id: "okPhase5", title: "Phase 5クリア：フルコンタクト練習で無症状（24時間）", description: "医師許可後にタックル・コンタクトを含むフル練習を行い、24時間以内に症状増悪がなかったか。クリアなら最終Phase 6（試合復帰）へ。", icon: "🏅" },
  ],
  slap_lesion: [
    { id: "okPainFree",  title: "安静時疼痛なし",   description: "安静時・日常生活動作での肩部疼痛が消失しているか",                           icon: "😴" },
    { id: "okROM",       title: "外旋ROM正常",      description: "外旋可動域が健側と同等か（投球に必要な外旋が制限されていないか）",             icon: "↕" },
    { id: "okStrength",  title: "腱板筋力正常",     description: "外旋・外転筋力が健側比80%以上か（等速性筋力またはMMT）",                     icon: "💪" },
    { id: "okThrow",     title: "軽投球動作可",     description: "痛みや恐怖感（投げることへの不安・腕が抜けそうな感覚）なく10〜20m程度の軽投球が可能か",                     icon: "⚾" },
    { id: "okFullThrow", title: "全力投球可",       description: "疼痛・不安感なく競技距離での全力投球が可能か（医師許可後）",                   icon: "🏅" },
  ],
  heat_stroke: [
    { id: "symptom_free",   title: "症状消失（安静時）",  description: "安静時に熱中症症状（頭痛・嘔吐・めまい・倦怠感）が完全に消失しているか", icon: "🌡️" },
    { id: "oral_intake",    title: "経口摂取可能",        description: "経口での水分・食事摂取が問題なくできるか",                             icon: "💧" },
    { id: "urine_color",    title: "尿の色が正常",        description: "尿の色が正常（淡黄色）に戻っているか",                                 icon: "🟡" },
    { id: "exercise_light", title: "軽運動で症状なし",    description: "ウォーキング程度の軽い運動で症状が再出現しないか（再出現なし＝可）",     icon: "🚶" },
    { id: "exercise_full",  title: "通常練習で症状なし",  description: "通常の練習強度で症状が再出現しないか（再出現なし＝可）",                icon: "🏃" },
  ],
  groin: [
    { id: "okPainControl",  title: "疼痛管理クリア（負荷調整下で無痛）", description: "練習量・強度を落とした負荷調整（スプリント・キック制限）下で、安静時・日常生活の鼠径部痛が消失し増悪がないか。VAS（疼痛スコア）が低下しているか。", icon: "🎚️" },
    { id: "okMobility",     title: "可動性クリア（股関節内旋・胸郭回旋）", description: "股関節内旋・胸郭回旋の左右差／制限が改善し、内転筋の過緊張（防御収縮）が軽減しているか。鼠径部痛は『痛い場所』ではなく股関節・胸郭の機能障害が上流の原因です。", icon: "🔄" },
    { id: "okStability",    title: "安定性クリア（片脚で骨盤制御）",     description: "片脚立位・片脚動作で骨盤ドロップ・体幹偏位・Knee-in（動的膝外反）が出ず、腹腔内圧（IAP）を保って骨盤を安定させられるか。", icon: "⚖" },
    { id: "okCoordination", title: "協調性クリア（片脚スクワット10回）", description: "痛みなく片脚スクワットが10回遂行でき、減速・切り返し動作を骨盤制御下（減速時の骨盤前傾・回旋過多なし）で行えるか。", icon: "🔗" },
    { id: "okRTP",          title: "RTP基準クリア（4要素）",             description: "①疼痛VAS 安静・運動時0〜1/10、②内転筋筋力 患側/健側比90%以上（ダイナモで内転筋優位）、③機能テスト（squeeze陰性・ジョグ→ダッシュ・直線→カット・トリプルホップ等）クリア、④心理的レディネス（本人の確信）。『痛みがない』だけでは復帰根拠になりません。", icon: "🏅" },
  ],
};

// ---- レベル（年齢）判定：大学生以上 ----
const COLLEGE_PLUS_AGES = ["college", "adult", "pro"];
export function isCollegePlus(age?: string): boolean {
  return !!age && COLLEGE_PLUS_AGES.includes(age);
}

// 腰椎分離症：大学生以上は症状・機能ベース（画像ゲートなし）の評価フロー
export const SPONDY_TESTS_COLLEGE: TestItem[] = [
  { id: "okPainFree",  title: "安静時疼痛なし",            description: "安静時・夜間の腰部疼痛が消失しているか。軟性〜半硬性コルセットを装着し、疼痛消失までスポーツは完全休止、腰椎の伸展・回旋を避けてリハビリ（体幹安定化）のみ行う。", icon: "😴" },
  { id: "okWalk",      title: "歩行・ADL痛なし",           description: "通常歩行・日常生活動作で腰部疼痛がないか。", icon: "🚶" },
  { id: "okExtTest",   title: "伸展テスト陰性（Stork＋Kemp）", description: "片側後屈（Stork：患側一本脚立位で腰を後屈）とKempテスト（立位で後屈＋側屈・回旋）で腰部痛が誘発されないか。分離部の圧痛・叩打痛がないことも確認。この3点（伸展痛なし・Stork陰性・Kemp陰性）が揃って初めてジョグへ進む。", icon: "🦩" },
  { id: "okJog",       title: "ジョグ可",                  description: "10〜15分のジョグで腰部疼痛・症状が再燃しないか。出力40→60%と段階的に。※大学生以上はMRIでの癒合確認を必須としない。", icon: "🏃" },
  { id: "okCutJump",   title: "方向転換・ジャンプ可",       description: "方向転換・ジャンプ着地で腰部症状が再燃しないか。", icon: "↩" },
  { id: "okSportMove", title: "競技動作可（症状・機能ベース）", description: "体幹回旋・伸展・コンタクトなど競技特異的動作が無痛で可能か。体幹安定性が確保され、各誘発テスト（伸展痛・Stork・Kemp）が陰性を維持しているか。※画像確認は必須としない。", icon: "🏅" },
];

// 入力の傷害＋レベルに応じた機能評価テスト一覧を返す（腰椎分離症のみ年齢で分岐）
export function getTestsByInjury(injuryId: InjuryId, age?: string): TestItem[] {
  if (injuryId === "spondylolysis" && isCollegePlus(age)) return SPONDY_TESTS_COLLEGE;
  return TESTS_BY_INJURY[injuryId];
}

// ---- Sports Data ----

export interface SportDef { id: SportId; label: string; emoji: string; positions: string[] }

export const SPORTS_DATA: SportDef[] = [
  { id: "soccer",            label: "サッカー",                 emoji: "⚽", positions: ["FW（フォワード）","MF（ミッドフィールダー）","DF（ディフェンダー）","GK（ゴールキーパー）"] },
  { id: "basketball",        label: "バスケットボール",         emoji: "🏀", positions: ["PG（ポイントガード）","SG（シューティングガード）","SF（スモールフォワード）","PF（パワーフォワード）","C（センター）"] },
  { id: "baseball",          label: "野球",                     emoji: "⚾", positions: ["投手","捕手","一塁手","内野手","外野手","指名打者"] },
  { id: "tennis",            label: "テニス",                   emoji: "🎾", positions: ["シングルス","ダブルス"] },
  { id: "swimming",          label: "水泳",                     emoji: "🏊", positions: ["自由形","背泳ぎ","平泳ぎ","バタフライ","個人メドレー"] },
  { id: "track_long",        label: "陸上（長距離）",           emoji: "🏃", positions: ["長距離","マラソン","駅伝","その他"] },
  { id: "track_sprint",      label: "陸上（短距離・投擲）",     emoji: "⚡", positions: ["短距離（100〜400m）","ハードル","跳躍","投擲","混成","その他"] },
  { id: "lacrosse",          label: "ラクロス",                 emoji: "🥍", positions: ["AT（アタック）","MF（ミッドフィールダー）","DF（ディフェンス）","GK（ゴールキーパー）"] },
  { id: "rugby",             label: "ラグビー",                 emoji: "🏉", positions: ["FW（フォワード）","FL（フランカー）","N8（ナンバーエイト）","HO（フッカー）","BK（バックス）","SH（スクラムハーフ）","SO（スタンドオフ）","WTB（ウィング）"] },
  { id: "volleyball",        label: "バレーボール",             emoji: "🏐", positions: ["セッター","アウトサイドヒッター","ミドルブロッカー","オポジット","リベロ"] },
  { id: "judo",              label: "柔道",                     emoji: "🥋", positions: ["軽量級","中量級","重量級"] },
  { id: "american_football", label: "アメリカンフットボール",   emoji: "🏈", positions: ["QB（クォーターバック）","RB（ランニングバック）","WR（ワイドレシーバー）","OL（オフェンスライン）","DL（ディフェンスライン）","LB（ラインバッカー）","DB（ディフェンスバック）","K/P（キッカー）"] },
  { id: "gymnastics",        label: "体操",                     emoji: "🤸", positions: ["床運動","鞍馬","鉄棒","段違い平行棒","平均台","跳馬"] },
  { id: "other_noncontact",  label: "その他（ノンコンタクト）", emoji: "🏃", positions: ["競技者","コーチ・スタッフ"] },
  { id: "other_contact",     label: "その他（コンタクト）",     emoji: "🤺", positions: ["競技者","コーチ・スタッフ"] },
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
  const isHamstring = p.injuryId === "hamstring";

  let idx = 0;
  if (isHamstring) {
    const okWalk         = t(p.tests, "okWalk");
    const okStretchLight = t(p.tests, "okStretchLight");
    const okPress        = t(p.tests, "okPress");
    const okResist       = t(p.tests, "okResist");
    const okRepPractice  = t(p.tests, "okRepPractice");
    const okPsych        = t(p.tests, "okPsych");
    if      (!okWalk)              idx = 0;
    else if (!okStretchLight)      idx = 1;
    else if (!okPress || !okResist) idx = 2; // 圧痛・抵抗運動痛の両方クリアでPhase3→4
    else if (!okRepPractice)       idx = 3;
    else if (!okPsych)             idx = 4;
    else                           idx = 5;
  } else {
    const okWalk    = t(p.tests, "okWalk");
    const okStretch = t(p.tests, "okStretch");
    const okPress   = t(p.tests, "okPress");
    const okResist  = t(p.tests, "okResist");
    const okPsych   = t(p.tests, "okPsych");
    if      (!okWalk)    idx = 0;
    else if (!okStretch) idx = 1;
    else if (!okPress)   idx = 2;
    else if (!okResist)  idx = 3;
    else if (!okPsych)   idx = 4;
    else                 idx = 5;
  }

  const bw = JISS_BASE_WEEKS[jiss.type][jiss.degree];
  const td = getTargetDays(p.targetDate);

  type PhaseData = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: PhaseData[] = [
    {
      summary: `${muscle}肉離れ（JISS ${JISS_TYPES[jiss.type].label}${jiss.degree}度）急性保護期。歩行痛があるため安静・冷却・圧迫を徹底し、炎症をコントロールします。`,
      okList: ["アイシング（15分 × 4〜6回/日・受傷後72時間／氷嚢を直接押し当てる）","圧迫包帯・スポンジパッドによる固定","松葉杖を使った免荷歩行","足関節・膝関節の自動運動（痛みなし範囲）","疼痛のない範囲での軽いストレッチ（痛気持ちいいは不可）","上半身トレーニング（プッシュアップ等）"],
      ngList: ["痛みを伴う患部ストレッチ（伸張痛・痛気持ちいいはNG）","入浴（湯船）・温熱療法（受傷後72時間は避ける／シャワーは可）","マッサージ・揉みほぐし","疼痛を誘発する荷重動作","患部への直接的な刺激"],
      rehabMenu: [
        { title: "アイシング",           sets: "15分 × 4〜6回", note: "氷嚢/ビニール袋の氷を直接しっかり押し当てる", details: "受傷後72時間までの急性期は1日4〜6回、1回15分を目安にアイシングを行います。湯船・温熱は受傷後72時間は避け、入浴はシャワーのみにしてください。タオル越しでは冷却効果が低いため、氷嚢やビニール袋に入れた氷を患部に直接しっかり押し当ててください。弾性包帯で圧迫しながら冷却するとさらに効果的です。冷たさ→灼熱感→うずき→麻痺（感覚消失）の順に感覚が変化しますが、麻痺感が出たら外してください。" },
        { title: "足関節ポンプ運動",     sets: "20回 × 3セット", note: "仰臥位。腫脹軽減・血栓予防", details: "仰臥位で足首を上下（背屈・底屈）に動かす運動です。大腿部の筋肉への直接負荷はゼロで、静脈・リンパの環流を促進して腫脹を軽減します。患側の股関節・膝関節を少し上げた姿勢（挙上位）で行うとより効果的です。1日何度でも実施できます。" },
        { title: "等尺性収縮（健側）",   sets: "10回 × 3セット", note: "患側は禁止。健側筋力維持目的", details: "患側の筋収縮は禁止ですが、健側を積極的に鍛えることで筋力の廃用を最小限に抑えます。壁や重いものに足を押し当て、動かさずに5〜10秒力を入れ続けます（等尺性収縮）。左右の筋力差が大きいほど復帰後の再受傷リスクが上がるため、この時期から健側のケアが重要です。" },
        { title: "体幹安定化",           sets: "30秒 × 3セット", note: "ドローイン（必須）→ プランクは疼痛なければ追加", details: "まずドローインのみ実施してください。腹横筋を意識して腹部を軽く凹ませ10秒キープ×10回から始めます。大腿後面に張り・疼痛がなければプランク（四肢・腹部で体を支え30秒キープ）を追加しますが、患部に少しでも鋭い疼痛を感じたらプランクは省略してドローインのみで構いません。急性期は個人差が大きいため、自分の状態に合わせて判断してください。体幹の安定性が不足したまま競技復帰すると再受傷リスクが上昇することが知られています。" },
      ],
      timeline: [
        { week: "0〜3日",   goal: "炎症コントロール",  activity: "安静・アイシング・圧迫" },
        { week: "4〜7日",   goal: "歩行痛消失",        activity: "免荷歩行→通常歩行へ" },
        { week: "1〜2週",   goal: "ストレッチ痛なし",  activity: "軽度ROM運動開始" },
        { week: `${bw}週目`, goal: "スポーツ復帰",      activity: "完全復帰目標" },
      ],
      alert: "受傷直後の過度な伸張・マッサージは骨化性筋炎のリスクがあります。受傷後72時間は安静第一（POLICEは72時間まで・湯船は避けシャワーのみ）。",
    },
    {
      summary: `歩行痛は消失しつつありますが、ストレッチでまだ疼痛があります。水中・プール運動と段階的なROM拡大を進める時期です。`,
      okList: ["通常歩行（疼痛なし）","水中ウォーキング","軽度ストレッチ（6/10以下の伸張感まで）","等尺性収縮運動（軽負荷）","固定自転車（軽負荷）"],
      ngList: ["最大域ストレッチ（疼痛範囲）","ジョグ・ランニング","重負荷レジスタンス運動","コンタクトプレー"],
      rehabMenu: [
        { title: "水中ウォーキング",           sets: "15〜20分",    note: "腰まで浸水。ゆっくり歩行から", details: "水の浮力が体重を軽減し、筋肉への負荷を少なくしながら有酸素運動が可能です。腰まで浸水した状態で正常歩行パターンを意識してゆっくり歩きます。水の粘性が適度な抵抗になり筋力トレーニング効果もあります。疼痛が出たら即中止してください。" },
        { title: "軽度ストレッチ（SLR）",       sets: "30秒 × 3",   note: "6/10以下の伸張感まで。反動禁止", details: "仰臥位で膝を伸ばしたまま脚を持ち上げる（SLR）動作でハムストリングスをストレッチします。6/10以下の伸張感（少し張る程度）で止めることが重要です。反動をつけたバリスティックストレッチは禁止。静的に30秒保持→ゆっくりおろします。痛みではなく「張り」を感じる角度で止めてください。" },
        { title: "レッグカール（軽負荷）",       sets: "15回 × 3",   note: "50%以下のROMから。疼痛なし範囲のみ", details: "うつ伏せで膝を曲げるふくらはぎの筋力強化運動です。可動域（ROM）の50%以下から始め、疼痛のない範囲内のみで実施します。軽いウェイトまたは自重のみで行い、反動を使わずゆっくりと。翌日に筋肉痛以上の疼痛・腫脹があれば負荷を下げてください。" },
        { title: "体幹・殿筋強化",             sets: "各15回 × 3",  note: "ブリッジ、クラムシェル", details: "ブリッジは仰臥位から臀部を持ち上げます。大殿筋とハムストリングスが共同で働くため、患部への適度な刺激と臀筋強化が同時にできます。クラムシェルは横向きで膝を持ち上げる運動で中殿筋を強化します。いずれも疼痛のない範囲で実施してください。" },
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
        { title: "ノルディックハムストリングス（導入期）", sets: "Week1：週1回 5本×2セット ／ Week2：週2回 6本×2セット", note: "全疼痛消失後に開始。初週は強いDOMSが出やすいため導入は慎重に", details:
          "【実施方法】\n" +
          "膝立ち位でパートナーに足首を固定してもらい、体幹をまっすぐ保ったまま離心性（ゆっくり前傾）に耐えながら前方へ倒れる。限界で手をついて受け身。戻りの求心性収縮は最小限（パートナーが補助するか、四つ這いで戻る）。\n\n" +
          "【10週間プロトコル（Petersen 2011 / van Dyk 2019）】\n" +
          "Week 1：週1回　5本×2セット\n" +
          "Week 2：週2回　6本×2セット\n" +
          "Week 3：週3回　6〜8本×3セット\n" +
          "Week 4：週3回　8〜10本×3セット\n" +
          "Week 5〜10：週3回　12/10/8本×3セット\n" +
          "維持期（シーズン中）：週1回　12/10/8本×3セット\n\n" +
          "【注意】初回〜2回目は強い遅発性筋痛（DOMS）が出やすい。初回負荷を抑え、翌日の状態を必ず確認してから次回へ進む。膝の下にクッションを置くと痛みを軽減できる。" },
        { title: "レッグカール（段階的）",       sets: "12回 × 3",   note: "自体重→軽ウェイトへ", details: "自体重でのレッグカールから始め、疼痛がなければ段階的に軽ウェイトを追加します。フルROMを目指しながら、伸張時（離心性）にもゆっくり制御することが重要です。週ごとに10%程度の負荷増加が目安です。前週より著しく筋肉痛が強い場合は負荷を据え置いてください。" },
        { title: "ルーマニアンデッドリフト",     sets: "10回 × 3",   note: "腰を丸めない。伸張感でストップ", details: "腰幅に足を開いて立ち、腰を曲げずに上体を前傾させながらダンベルを下ろす動作です。ハムストリングスに大きな伸張ストレスがかかるため、疼痛が出始めた角度でストップします。最初は自体重のみ（バーベルなし）で動作パターンを習得してください。腰が丸まる（キャットバック）と腰椎への負荷が増大するため要注意です。" },
        { title: "直線ジョグ（50〜60%）",        sets: "5〜10分 × 2", note: "疼痛が出たら即中止。翌日腫脹確認", details: "走り始め時の違和感・疼痛を注意深く確認しながら直線でゆっくりジョグします。50〜60%の出力で、疼痛が3/10を超えたら即中止してください。翌日に腫脹・疼痛の増悪がなければ次の練習で距離・速度を少し上げます。コンクリートよりも芝・土のトラックが推奨です。" },
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
        { title: "ノルディックハムストリングス（漸増期）", sets: "週3回：6〜10本 × 3セット（Week 3〜4）", note: "フルレンジを制御できる範囲で漸増。体幹を固定し腰が丸まらないよう注意", details:
          "【現在の目標：Week 3〜4相当】\n" +
          "Week 3：6〜8本×3セット　Week 4：8〜10本×3セット\n\n" +
          "動作中は体幹を一直線に保ち、骨盤を前傾させない。前傾が速くなってきたら「制御できる範囲（コントロールレンジ）」で止め、次回以降に範囲を広げる。\n" +
          "実施後に軽い筋肉痛を感じる程度が適切な負荷の目安。翌日に大きな疼痛・腫脹があれば1回分の負荷を下げて再開する。" },
        { title: "ランニング（70→80→90%）",     sets: "段階的増加",   note: "毎回疼痛チェック。翌日確認後次段階へ", details: "70%→80%→90%と段階的に出力を上げます。1段階ずつ3日以上問題がなければ次の強度へ進みます。直線から始め、緩やかなカーブ→急なカーブの順に移行します。翌日に腫脹・疼痛の増悪があれば前の強度に戻してください。心拍数ではなく疼痛の有無で判断することが重要です。" },
        { title: "スクワット・レッグプレス",     sets: "10回 × 4",    note: "フルレンジ。体重と同重量（1倍）を最低目標", details: "フルレンジ（膝90度以上）のスクワットを行います。体重と同等の負荷（体重1倍）を最低目標とします。無理に高負荷を目指す必要はなく、正しいフォームで体重相当の負荷が扱えることが次フェーズへの移行基準です。疼痛のない範囲内のみで実施し、ハーフスクワットから始めて段階的にフルレンジへ移行してください。レッグプレスは膝が内側に入らないようアライメントに注意してください。" },
        { title: "アジリティラダー",             sets: "5分 × 2",     note: "低速でフォーム重視", details: "地面に置いたラダー（はしご状のマーカー）の中を様々なステップパターンで踏んでいく運動です。低速でフォームを完璧にしてから速度を上げます。1in-1out→2in-2outの順に難易度を上げます。足首・膝のアライメントが崩れないようにしてください。" },
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
      okList: ["フルスプリント（100%出力）","方向転換・カット・デセレレーション","競技特異的ドリル（ほぼ全て）","チーム練習への全体参加","コンタクト練習（段階的）"],
      ngList: ["医師・トレーナー許可なしの試合出場","疼痛を無視した無理な動作"],
      rehabMenu: [
        { title: "スプリント（80→90→100%）",   sets: "× 5〜8本",  note: "段階的に出力を上げる", details: "直線20〜30mを80%の力から始め、3日間問題がなければ90%→100%へ上げます。1本ごとに疼痛・違和感を確認します。全力スプリントは最も大きな離心性負荷がかかるため、段階的な移行が重要です。疼痛なく100%スプリントが可能になれば競技復帰の大きな目安となります。" },
        { title: "カッティングドリル",          sets: "5〜10分",   note: "45°→90°→急激な切り返し", details: "45°カット→90°カット→急激な切り返し（ジグザグ）の順に難易度を上げます。最初は低速で正確なフォームを習得し、次第にスポーツ場面に近い速度・角度で行います。着地時の膝・足首アライメントを確認してください。疼痛が出た角度・速度でプログラムを一時停止します。" },
        { title: "競技特異的ドリル",            sets: "練習準拠",  note: "ポジション特異的な動作を含む", details: "スポーツ・ポジション固有の動作を取り入れます。サッカーならドリブル突破、野球なら打球への反応走など、実際の競技で起きる動作と同じパターンを練習します。コーチと連携して通常練習のどの部分から参加できるかを段階的に決めていきます。" },
        { title: "ノルディックハムストリングス（発展期）", sets: "週3回：12/10/8本 × 3セット（Week 5〜10）", note: "Week 5〜10相当。12→10→8本の逆ピラミッドで実施", details:
          "【現在の目標：Week 5〜10相当】\n" +
          "1セット目：12本 → 2セット目：10本 → 3セット目：8本\n" +
          "セット間休憩2分。週3回。\n\n" +
          "動作の質を最優先し、本数より「フルレンジを制御できているか」を基準に進める。疼痛・筋肉痛が強い日はセット数を2セットに減らして実施してよい。\n" +
          "van Dyk et al. (2019 BJSM) のSRではNHEプログラムがハムストリング損傷リスクをRR 0.49（約51%減）低下させることが確認されている（n=8,459）。" },
      ],
      timeline: [
        { week: "4〜6週", goal: "心理的準備完了",  activity: "全動作・コンタクト練習" },
        { week: "6週〜",  goal: "完全復帰",        activity: "試合出場" },
      ],
      alert: "スポーツ心理面のサポートも重要。再受傷への恐怖がパフォーマンスを制限することがある。",
    },
    {
      summary: `全ての評価をクリア。スポーツへの完全復帰が可能な状態です。予防トレーニングを継続しながら競技に参加してください。`,
      okList: ["全ての競技活動・試合への参加","コンタクト・フルスピードの動作","ポジション固有の全ての動作","予防トレーニングの継続（週2〜3回）"],
      ngList: ["予防トレーニングの完全中止（再受傷リスク上昇）","疼痛を我慢しての継続（新たな損傷サイン）"],
      rehabMenu: [
        { title: "ノルディックハムストリングス（シーズン中維持）", sets: "週1回：12/10/8本 × 3セット", note: "シーズン中維持プロトコル（van Dyk 2019 / Petersen 2011）。週1回でも再受傷予防効果は維持される", details:
          "【シーズン中維持プロトコル】\n" +
          "週1回　12/10/8本×3セット（逆ピラミッド）\n\n" +
          "プレシーズンの10週プロトコル終了後はシーズンを通じて週1回の維持実施を継続する。\n" +
          "van Dyk et al. (2019) のSR（n=8,459）でNHEプログラムの損傷リスク比はRR 0.49（95%CI 0.32–0.74）。効果の鍵は継続率（アドヒアランス）にあり、週1回維持でもプログラムを完全中止するよりはるかに有効。\n" +
          "練習前のダイナミックウォームアップ後、本練習前に実施するのがパフォーマンスへの影響が最小限になるタイミング。" },
        { title: "動的ストレッチウォームアップ",         sets: "練習前10〜15分", note: "レッグスイング・フランケンシュタイン等", details: "静的ストレッチを練習前に行うと瞬発力・筋力が一時的に低下することが示されています。代わりに動的ストレッチ（レッグスイング・フランケンシュタイン・バットキック等）で筋肉を動かしながら温めます。心拍数が軽く上がる程度まで体を動かしてから本練習に入ることで受傷リスクを下げます。" },
        { title: "アイシング（必要時）",                 sets: "練習後20分",    note: "疼痛・腫脹を感じたら即実施", details: "疼痛・腫脹・熱感を感じた場合は練習後すぐにアイシングを実施します。完全復帰後でも新たな張り・違和感を感じたら無視せずケアをしてください。症状が2〜3日以上継続する場合は担当医・トレーナーに報告してください。" },
      ],
      timeline: [
        { week: "復帰後2週",  goal: "試合強度への完全適応", activity: "全試合・全練習参加" },
        { week: "シーズン中", goal: "再受傷予防",           activity: "予防トレーニング継続" },
      ],
      alert: "完全復帰後も違和感・疼痛を感じたら即座に活動を中止し、医師・トレーナーに報告。",
    },
  ];

  if (isHamstring) {
    data[1].summary = `歩行は可能ですが、ストレッチ時に大腿後面の鋭い疼痛が残存しています。「鋭い疼痛→違和感・軽い張り程度」に軽減するまで待ちます。水中運動・等尺性筋力強化を継続してください。`;
    data[2].summary = `伸長痛が違和感程度に軽減しました。ゆっくりジョグから開始し、徐々に70%程度までペースアップします。圧痛消失＆患側MMTが健側比90%以上になれば次の段階（MRI再評価）へ。`;
    data[2].okList  = ["ゆっくりジョグ（直線・低速から開始）","70%程度までのランニング（直線のみ）","等尺性・軽等張性筋力トレーニング","プール練習（水泳含む）","チーム練習の非接触・低強度部分への参加"];
    data[2].ngList  = ["フルスプリント（圧痛なし＆MMT 90%クリアまで禁止）","方向転換・カット・急停止","コンタクトプレー","MMT左右差10%超でのスポーツ特異的ドリル"];
    data[3].summary = `圧痛消失・患側MMTが健側比90%以上をクリアしました。MRI再評価（医師）を実施し、問題なければフルスプリント・対人練習をRep制限付きで開始します。初回は通常の30〜50%本数から3回の練習で徐々に増加させます。`;
    data[3].okList  = ["MRI再評価（医師許可後）にフルスプリント開始","対人・コンタクト練習（Rep制限：初回30〜50%本数）","3回の練習で徐々にRep数を増加","アジリティ・方向転換ドリル（Rep制限）"];
    data[3].ngList  = ["MRI再評価前のフルスプリント・対人","1回の練習で通常全Rep数参加","疼痛を無視した本数増加"];
    data[4].summary = `Rep制限付きフルスプリント・対人練習を3回クリアしました。翌日の増悪がなければ制限なしのフル参加へ移行します。`;
    data[4].okList  = ["制限なしのフル参加（全練習メニュー）","フルコンタクト・フルスピードの動作","ポジション固有の全ての動作","予防トレーニングの継続（NHE 週3回）"];
  } else {
    // 大腿四頭筋：ノルディックハムをリバースノルディックカールに差し替え
    const reverseNordicByPhase: Record<number, RehabMenuItem> = {
      2: {
        title: "リバースノルディックカール（導入期）",
        sets: "Week1：週1回 5本×2セット ／ Week2：週2回 6本×2セット",
        note: "疼痛消失後に開始。大腿四頭筋の離心性エクサイズ。初回は強いDOMSが出やすいため慎重に導入",
        details:
          "【実施方法】\n" +
          "膝立ち位（床にクッション推奨）で足首を固定、体幹をまっすぐに保ちながら後方へゆっくり傾ける（離心性）。限界で体を支え、元の姿勢に戻す（求心性は最小限・手で補助可）。\n\n" +
          "【10週間プロトコル（NHEに準拠）】\n" +
          "Week 1：週1回　5本×2セット\n" +
          "Week 2：週2回　6本×2セット\n" +
          "Week 3：週3回　6〜8本×3セット\n" +
          "Week 4：週3回　8〜10本×3セット\n" +
          "Week 5〜10：週3回　12/10/8本×3セット\n" +
          "維持期（シーズン中）：週1回　12/10/8本×3セット\n\n" +
          "【注意】初回は翌日の大腿前面のDOMSが強く出やすい。倒れる角度（レンジ）は「フルレンジを制御できる範囲」で個別化する。",
      },
      3: {
        title: "リバースノルディックカール（漸増期）",
        sets: "週3回：6〜10本 × 3セット（Week 3〜4）",
        note: "フルレンジを制御できる範囲で漸増。体幹を固定し骨盤が後傾しないよう注意",
        details:
          "【現在の目標：Week 3〜4相当】\n" +
          "Week 3：6〜8本×3セット　Week 4：8〜10本×3セット\n\n" +
          "後傾時に腰が過度に反らないよう体幹を安定させる。セット間休憩2分。\n" +
          "翌日の大腿前面の張り・疼痛が強い場合は本数を下げて継続する。",
      },
      4: {
        title: "リバースノルディックカール（発展期）",
        sets: "週3回：12/10/8本 × 3セット（Week 5〜10）",
        note: "逆ピラミッドで実施。動作の質（制御）を本数より優先",
        details:
          "【現在の目標：Week 5〜10相当】\n" +
          "1セット目：12本 → 2セット目：10本 → 3セット目：8本\n" +
          "セット間休憩2分。週3回。\n\n" +
          "フルレンジ（後方への最大傾斜）で制御できることを確認してから次の週へ進む。" +
          "NHEと同様の離心性負荷原理で大腿四頭筋の損傷予防・再発予防に有効とされる。",
      },
      5: {
        title: "リバースノルディックカール（シーズン中維持）",
        sets: "週1回：12/10/8本 × 3セット",
        note: "シーズン中維持。週1回でも離心性筋力の維持効果は継続する",
        details:
          "【シーズン中維持プロトコル】\n" +
          "週1回　12/10/8本×3セット（逆ピラミッド）\n\n" +
          "NHEと同様に練習前ダイナミックウォームアップ後に実施するのがパフォーマンスへの影響が最小限になるタイミング。\n" +
          "シーズンを通じて継続することで大腿四頭筋の離心性筋力を維持し、再受傷リスクを低減する。",
      },
    };
    for (const phaseIdx of [2, 3, 4, 5]) {
      const menu = data[phaseIdx].rehabMenu;
      const nheIdx = menu.findIndex(m => m.title.includes("ノルディックハムストリングス"));
      if (nheIdx >= 0) menu[nheIdx] = reverseNordicByPhase[phaseIdx];
      else menu.unshift(reverseNordicByPhase[phaseIdx]);
    }
  }

  // ③ スポーツ・ポジション特異的エクササイズ（Phase 5）
  const isCuttingSport = ["basketball", "soccer", "rugby", "american_football", "lacrosse", "volleyball", "other_contact"].includes(p.sport as string);
  const isBasketball   = p.sport === "basketball";

  if (isCuttingSport) {
    data[4].rehabMenu.push(
      {
        title: "ジャンプ片足着地（シングルレッグランディング）",
        sets: "左右各10回 × 3",
        note: "着地時に膝がつま先より内側に入らないよう注意（ニーイン防止）",
        details: "両足で小さくジャンプし、片脚で静かに着地します。着地の瞬間に膝が内側に崩れない（knee-valgus防止）こと、体幹が大きく傾かないことを鏡やスマホ動画で確認しながら行います。最初は低く小さなジャンプから始め、徐々に高さを上げてください。着地時に「ドスン」と大きな音が出る場合は膝・足首の衝撃吸収が不十分なサインです。音を立てずに静かに着地することを意識してください。",
      },
      {
        title: "ボックスジャンプ（ステップ台昇降→ジャンプ着地）",
        sets: "10回 × 3",
        note: "20〜30cmの台。着地は音を立てず柔らかく",
        details: "【Stage 1】20〜30cmのステップ台の前に立ち、両足ジャンプで台に乗り、ステップで静かに降りる。【Stage 2】台に乗った状態からジャンプして着地（両足）→静止3秒。【Stage 3】台から片足着地へ進む。着地音を小さくする（ソフトランディング）意識がポイントで、膝・足首の衝撃吸収能力を高めます。切り返し競技のジャンプシュートやレイアップ後の着地衝撃に対応するための重要な準備エクサイズです。",
      },
      {
        title: "ラテラルジャンプ（横跳び）",
        sets: "左右各10回 × 3",
        note: "1〜2m幅を横に跳び越し、着地で3秒静止",
        details: "床にテープ等でライン（1〜2m幅）を引き、横方向に片脚または両脚でジャンプします。着地時に3秒静止できること（バランス保持）を確認します。患側着地時に健側と同様の安定感があるかを主観的に評価してください。サイドステップの切り返し・横方向の着地衝撃に対応する筋力・協調性を高めます。距離を徐々に伸ばし、スピードを上げていきます。",
      },
      {
        title: "SEBT（スター型バランステスト）",
        sets: "前・後外側・後内側 各3回ずつ",
        note: "片脚立位のまま反対足を3方向へ伸ばす。健側と距離を比較",
        details: "床に「Y字」または8方向の線を描き、片脚で中心に立ちます。軸足のバランスを保ちながら、反対足を①前方 ②後外側 ③後内側の3方向へできる限り遠くへ伸ばし（地面をタッチ）、元の姿勢に戻します。メジャーで伸ばした距離（cm）を計測し、患側と健側を比較します。患側が健側の90%未満であれば復帰に追加準備が必要とされています。1人でもメジャーを使って実施可能です。",
      },
    );
    if (isBasketball) {
      data[4].rehabMenu.push({
        title: "クロスオーバー＆ストップドリル（PG特化）",
        sets: "5往復 × 3セット",
        note: "急停止・切り返しの着地フォームを確認。膝がつま先を超えないよう注意",
        details: "コートのハーフラインを使い、クロスオーバーステップで前進→急停止→逆方向のクロスオーバーを繰り返します。PGが試合中に最も頻繁に行う「ドライブ後の切り返し」「ピック＆ロール後の方向転換」を模擬した動作です。急停止の着地で膝が前に出すぎない（膝がつま先を越えない）こと、体幹が過剰に前傾しないことを確認します。疼痛なく全力に近い動作ができれば試合復帰の重要な基準となります。",
      });
    }
  }

  // ④ アメリカンフットボール特化コンテンツ
  const isAF = p.sport === "american_football";
  if (isAF) {
    const pos = (p.position ?? "").toUpperCase();
    const isWR = pos.includes("WR");
    const isRB = pos.includes("RB");
    const isLB = pos.includes("LB");
    const isDB = pos.includes("DB");
    const isSkill = isWR || isRB || isDB;
    const isKP = pos.includes("K/P");

    // 練習参加レベル参照カード（フェーズ2以降に挿入）
    const participationCard: RehabMenuItem = {
      title: "🏈 練習参加レベルガイド（アメフト）",
      sets: "段階的に引き上げ",
      note: "Lv.0（リハのみ）→ Lv.6（ゲーム出場）で管理",
      details:
        "🔴 Lv.0：リハビリのみ（グラウンド不参加）\n" +
        "🟠 Lv.1：チームウォームアップのみ参加\n" +
        "🟡 Lv.2：個人ドリル（ポジション別・Rep制限あり）\n" +
        "🟢 Lv.3：7 on 7（ノーコンタクト）\n" +
        "🔵 Lv.4：フルプラクティス（コンタクト制限あり）\n" +
        "🟣 Lv.5：スクリメージ（フルコンタクト）\n" +
        "⚫ Lv.6：ゲーム出場\n\n" +
        "1段階ずつ上げ、翌日に疼痛・腫脹の増悪がなければ次レベルへ進む。",
    };

    // ── Phase 3（data[2]・全疼痛消失）：Lv.1→2、低負荷ポジションドリル ──
    data[2].okList.push("練習参加レベル目標：Lv.1（ウォームアップ）→ Lv.2（個人ドリル）");
    data[2].rehabMenu.unshift({ ...participationCard });

    if (isWR || isDB) {
      data[2].rehabMenu.push({
        title: "ルートランニング開始（低負荷ルート限定）",
        sets: "1シリーズ2〜3本",
        note: "ヒッチ・スラント・クイックアウト（5yd以内）のみ。プレー間は歩いて戻る",
        details:
          "ハムストリングスへの負荷が低い短距離ルートから再開します。\n\n" +
          "【許可ルート（≤5yd）】\n" +
          "・ヒッチ（3yd）：前に出て止まる\n" +
          "・スラント（4〜5yd）：斜め前への切り込み\n" +
          "・クイックアウト（5yd）：真っ直ぐ出てサイドへ\n\n" +
          "【禁止ルート】\n" +
          "・in/dig・カール・カムバック（10yd以上）→ 次フェーズ\n" +
          "・ポスト・コーナー・フライ（フルスプリント要）→ 2フェーズ先\n\n" +
          "【Rep管理】\n" +
          "1シリーズ2〜3本。プレーとプレーの間は必ず歩いて戻る。\n" +
          "疼痛が出たらその日の走行は終了。翌日の腫脹・張りを確認してから再開。",
      });
    } else if (isRB) {
      data[2].rehabMenu.push({
        title: "バックフィールドドリル（インサイドハンドオフ・フラットパス）",
        sets: "1シリーズ3〜5本",
        note: "インサイドハンドオフ・フラットのパスキャッチOK。スウィープ・カットバック禁止",
        details:
          "全疼痛消失後は直線・短距離の動作から再開します。\n\n" +
          "【許可プレー】\n" +
          "・インサイドハンドオフ（ギャップへの直線受け渡し）\n" +
          "・フラットのパスキャッチ（LOS付近・短距離）\n" +
          "・ドロー・ダイブ（直線突入系）\n\n" +
          "【禁止プレー】\n" +
          "・スウィープ（横への全力走）→ 次フェーズ\n" +
          "・カットバック（方向転換）→ 次フェーズ\n" +
          "・フルコンタクト → 2フェーズ先\n\n" +
          "【Rep管理】\n" +
          "1シリーズ3〜5本。走行後は立ち止まって患部の感覚を確認。",
      });
    } else if (isLB) {
      data[2].rehabMenu.push({
        title: "カバレッジドロップ・ゾーン読みドリル",
        sets: "5〜10分",
        note: "バックペダル・シャッフルのみ。ブリッツラッシュ禁止",
        details:
          "最大負荷がかかるブリッツを避け、カバレッジ動作から再開します。\n\n" +
          "【許可動作】\n" +
          "・バックペダル（後退走）\n" +
          "・シャッフルステップ（横移動）\n" +
          "・ゾーン移動ドリル（指示でゾーンへ移動）\n\n" +
          "【禁止動作】\n" +
          "・ブリッツラッシュ（最大加速）→ 次フェーズ\n" +
          "・タックル（コンタクト）→ 2フェーズ先\n\n" +
          "7 on 7参加はまだ禁止。ウォームアップ＋個人カバレッジドリルまで。",
      });
    } else {
      data[2].rehabMenu.push({
        title: "ポジション個人ドリル（低強度）",
        sets: "5〜10分",
        note: "スプリント・コンタクト禁止。スタンス・ステップワークのみ",
        details:
          "ポジション固有の基本動作を低強度で再開します。\n\n" +
          "OL/DL：スタンス・ステップワーク（ハーフスピード）\n" +
          "QB：フットワーク・ショートスロー（ドロップバックのみ）\n" +
          "K/P：アプローチ動作（インパクトなし）\n\n" +
          "最大加速・コンタクトが含まれるドリルは禁止です。",
      });
    }

    // ── Phase 4（data[3]・Phase3 3日間クリア）：Lv.2→3、中強度ドリル ──
    data[3].okList.push("練習参加レベル目標：Lv.2（個人ドリル）→ Lv.3（7 on 7）");
    data[3].rehabMenu.unshift({ ...participationCard });

    const ladderIdx = data[3].rehabMenu.findIndex(m => m.title.includes("ラダー"));

    if (isWR || isDB) {
      const midItem: RehabMenuItem = {
        title: "ルートランニング中距離解禁（in/dig・カール・カムバック）",
        sets: "1シリーズ5〜8本",
        note: "10〜12ydルート追加可。ポスト・コーナー・フライはまだ禁止",
        details:
          "中距離ルートを追加し、7 on 7への参加を検討する段階です。\n\n" +
          "【新たに許可するルート（10〜12yd）】\n" +
          "・in/dig：深く走りインサイドへカット\n" +
          "・カール：外へ走りフロントへ向き直る\n" +
          "・カムバック：外へ走り止まってQBへ向き直る\n\n" +
          "【まだ禁止ルート】\n" +
          "・ポスト（15〜20yd） / コーナー（15〜20yd）\n" +
          "・フライ/ゴー（20yd以上フルスプリント）\n\n" +
          "【Rep管理】\n" +
          "1シリーズ5〜8本。7 on 7参加可（ポスト・フライ系は除外）。\n" +
          "翌日に疼痛・腫脹の増悪がなければ次フェーズへ進む。",
      };
      if (ladderIdx >= 0) data[3].rehabMenu[ladderIdx] = midItem;
      else data[3].rehabMenu.push(midItem);
    } else if (isRB) {
      const rbMid: RehabMenuItem = {
        title: "スウィープ・アウトサイドラン解禁・カットバック（1カット）",
        sets: "1シリーズ5〜8本",
        note: "横走り追加。7 on 7ランプレー参加可",
        details:
          "横方向への走りと1回のカットバックを解禁します。\n\n" +
          "【新たに許可するプレー】\n" +
          "・スウィープ（横への加速→縦への転換）\n" +
          "・アウトサイドラン（ピッチアウト系）\n" +
          "・カットバック（1カットまで）\n\n" +
          "【まだ禁止】\n" +
          "・多重カット（ジャーク系ラン）→ 次フェーズ\n" +
          "・フルコンタクト → 次フェーズ\n\n" +
          "7 on 7のランプレー部分への参加可能。\n" +
          "ランアフターキャッチ（RAC）の加速も可だが急停止は疼痛確認しながら。",
      };
      if (ladderIdx >= 0) data[3].rehabMenu[ladderIdx] = rbMid;
      else data[3].rehabMenu.push(rbMid);
    } else if (isLB) {
      const lbMid: RehabMenuItem = {
        title: "ブリッツラッシュ解禁（90%スピード）・ダミータックル",
        sets: "5〜8本",
        note: "最大加速は次フェーズ。タックルはダミーのみ",
        details:
          "ブリッツラッシュを90%スピードで解禁し、タックルはダミーから始めます。\n\n" +
          "【許可動作】\n" +
          "・ブリッツラッシュ（90%スピード・接触なし）\n" +
          "・ゾーンカバレッジ（全方向）\n" +
          "・ダミーへのタックル（コントロールドコンタクト）\n\n" +
          "【まだ禁止】\n" +
          "・対人フルコンタクト → 次フェーズ\n" +
          "・スクリメージ → 2フェーズ先\n\n" +
          "7 on 7参加可。フルプラクティスの個人ドリルまで段階的に拡大。",
      };
      if (ladderIdx >= 0) data[3].rehabMenu[ladderIdx] = lbMid;
      else data[3].rehabMenu.push(lbMid);
    } else if (isKP) {
      const kpMid: RehabMenuItem = {
        title: "キック・パント段階的復帰（本数半減）",
        sets: "通常の半数（例：10本→5本）",
        note: "Phase 4からキック動作解禁。本数は通常の半分に制限",
        details:
          "Phase 4よりキック・パント動作を解禁しますが、本数を通常の半数に制限します。\n\n" +
          "【Rep管理基準】\n" +
          "・通常練習が10本なら5本、20本なら10本が上限\n" +
          "・翌日に大腿後面の疼痛・張りがなければ次回も同本数で継続\n\n" +
          "【許可動作】\n" +
          "・ハーフスピードアプローチ → フルスウィング\n" +
          "・パントキック・フィールドゴール（距離制限なし）\n" +
          "・スナップ受け → キック全工程（コンタクトなし）\n\n" +
          "【注意事項】\n" +
          "キックのスウィングはハムストリングスへの大きな離心性負荷がかかります。\n" +
          "疼痛・張りが出た時点でその日の本数終了。翌日の状態を必ず確認してから再開。",
      };
      if (ladderIdx >= 0) data[3].rehabMenu[ladderIdx] = kpMid;
      else data[3].rehabMenu.push(kpMid);
    }

    // ── Phase 5（data[4]・Phase4 3日間クリア）：Lv.3→4、全解禁 ──
    data[4].okList.push("練習参加レベル目標：Lv.3（7 on 7）→ Lv.4（フルプラクティス）");
    data[4].rehabMenu.unshift({ ...participationCard });

    const sportDrillIdx = data[4].rehabMenu.findIndex(m => m.title.includes("競技特異的ドリル"));

    if (isWR || isDB) {
      const fullItem: RehabMenuItem = {
        title: "全ルート解禁（ポスト・コーナー・フライ）",
        sets: "通常Rep数（1シリーズ10〜15本）",
        note: "全ルート可。7 on 7 → フルプラクティス → スクリメージへ",
        details:
          "全てのルートが解禁され、フルプラクティス参加が目標です。\n\n" +
          "【解禁ルート】\n" +
          "・ポスト（15〜20yd：フルスプリント→斜め内カット）\n" +
          "・コーナー（15〜20yd：フルスプリント→斜め外カット）\n" +
          "・フライ/ゴー（20yd以上：最大スプリント継続）\n" +
          "・シーム（縦への深いルート）\n\n" +
          "【練習参加移行順序】\n" +
          "7 on 7フル参加 → フルプラクティス（コンタクトあり）\n" +
          "→ スクリメージ → ゲーム出場\n\n" +
          "翌日に増悪がなければ医師・トレーナーとゲーム出場日程を確認。",
      };
      if (sportDrillIdx >= 0) data[4].rehabMenu[sportDrillIdx] = fullItem;
      else data[4].rehabMenu.push(fullItem);
    } else if (isRB) {
      const rbFull: RehabMenuItem = {
        title: "全ランプレー解禁・コンタクト段階的復帰",
        sets: "通常Rep数",
        note: "多重カット含む全プレー可。コンタクト：ダミー→対人→スクリメージ",
        details:
          "全てのランプレーを解禁し、接触を段階的に加えます。\n\n" +
          "【許可プレー】\n" +
          "・全ランプレー（多重カット含む）\n" +
          "・ランアフターキャッチ（RAC）のフル走行・急停止\n\n" +
          "【コンタクト移行順序】\n" +
          "1. ダミーへのタックル受け\n" +
          "2. コントロールドコンタクト（相手が力を抑制）\n" +
          "3. フルコンタクト（スクリメージ）\n\n" +
          "フルプラクティス → スクリメージ → ゲーム出場の順で段階的に復帰。",
      };
      if (sportDrillIdx >= 0) data[4].rehabMenu[sportDrillIdx] = rbFull;
      else data[4].rehabMenu.push(rbFull);
    } else if (isLB) {
      const lbFull: RehabMenuItem = {
        title: "フルコンタクト解禁（タックル・ブリッツ全開放）",
        sets: "通常練習量",
        note: "最大加速ブリッツ・対人タックル解禁。スクリメージ参加へ",
        details:
          "全ての動作を解禁し、スクリメージへの参加が目標です。\n\n" +
          "【解禁動作】\n" +
          "・最大加速ブリッツラッシュ\n" +
          "・対人タックル（フルコンタクト）\n" +
          "・ブリッツ後の追走・急停止\n\n" +
          "【練習参加移行順序】\n" +
          "フルプラクティス（コンタクト制限なし）\n" +
          "→ スクリメージ → ゲーム出場\n\n" +
          "翌日に増悪がなければ医師・トレーナーとゲーム出場日程を確認。",
      };
      if (sportDrillIdx >= 0) data[4].rehabMenu[sportDrillIdx] = lbFull;
      else data[4].rehabMenu.push(lbFull);
    } else if (isKP) {
      const kpFull: RehabMenuItem = {
        title: "キック・パント通常本数復帰",
        sets: "通常練習本数（制限解除）",
        note: "Phase 5以降は通常Rep数での参加可。翌日増悪がなければ確認",
        details:
          "Phase 4の半数制限から解除し、通常の練習本数でのキック・パントが許可されます。\n\n" +
          "【Phase 5での確認事項】\n" +
          "・通常本数後の翌日に大腿後面の疼痛・張りがないか\n" +
          "・フルスウィング時の違和感がないか\n\n" +
          "【参加移行順序】\n" +
          "通常本数練習 → フルプラクティス → スクリメージ → ゲーム出場\n\n" +
          "翌日に増悪がなければ医師・トレーナーとゲーム出場日程を確認。",
      };
      if (sportDrillIdx >= 0) data[4].rehabMenu[sportDrillIdx] = kpFull;
      else data[4].rehabMenu.push(kpFull);
    }

    // ── Phase 6（data[5]・完全復帰）：Lv.6 ──
    data[5].okList.push("練習参加レベル：Lv.6 ゲーム出場可");
  }

  // ⑤ 目標日逆算・進捗見通し
  const daysFromInjury  = getDays(p.injuryDate);
  const jissTargetDays  = bw * 7;
  const jissRemainingDays = Math.max(0, jissTargetDays - daysFromInjury);
  const phasesLeft = 5 - idx;

  let progressNote: string | undefined;
  if (td !== null) {
    const weeks = Math.floor(td / 7);
    const remDays = td % 7;
    let feasibility: string;
    if (td > jissRemainingDays + 7) {
      feasibility = "◎ 目標日まで十分余裕があります。標準的なペースで進めてください。";
    } else if (td >= jissRemainingDays - 3) {
      feasibility = "○ 概ね間に合う見込みです。毎週の評価テストでペースを確認してください。";
    } else if (td >= jissRemainingDays - 10) {
      feasibility = "△ スケジュールがタイトです。無理な強度アップは再受傷を招きます。毎週の進捗確認が必須です。";
    } else {
      feasibility = "⚠️ 目標日までの期間が医学的推奨より短い可能性があります。医師・トレーナーと相談し、安全を最優先にしてください。";
    }
    progressNote =
      `目標日まで：${td}日（${weeks}週${remDays > 0 ? remDays + "日" : ""}）\n` +
      `JISS ${jiss.type}-${jiss.degree}度の標準復帰目安：受傷から${bw}週（残り約${jissRemainingDays}日）\n` +
      `現在 Phase ${idx + 1} / 6 → 残り ${phasesLeft} フェーズ\n` +
      feasibility;
  }

  const d = data[idx];
  return {
    phase: `Phase ${idx + 1}：${(isHamstring ? HAMSTRING_PHASES : MUSCLE_STRAIN_PHASES)[idx].name}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: isHamstring ? HAMSTRING_PHASES : MUSCLE_STRAIN_PHASES,
    progressNote,
    clinicalGuidance: p.injuryId === "hamstring"
      ? `Hickey JT, et al. Sports Med 2017;47:1375-1387（ハムストリングス肉離れRTP基準：システマティックレビュー）\n` +
        `■ Askling H-test（能動的SLR）：仰臥位で片脚を思い切り（できるだけ速く・高く）振り上げ、"違和感・痛み・恐怖心・患側の力の弱さ" を左右比較。ゆっくりではなくバリスティック（勢いよく）に行うのがポイント。\n` +
        `  トレーナー補助が理想だが、1人でも実施可能。\n` +
        `  ✓ RTP基準：患側に違和感・痛み・恐怖心・健側比での弱さが感じられないこと（角度の数値比ではなく主観的症状の消失）\n` +
        `  この基準を満たす研究では再受傷率1.3〜3.6%（各研究中最低値）\n` +
        `■ Isokinetic dynamometry（患側/健側 等速性筋力比 85〜90%以上）をRTP基準に追加することで、復帰時間と再受傷率のバランスが最善\n` +
        `■ Phase 5→6（スポーツ準備期→完全復帰期）の移行には、上記2指標のクリアが推奨される\n` +
        `■ 再発予防＝負荷量（ロード）コントロールが最重要：スプリント・全力走は「本数を制限し段階的に増やす」ことが必須。1回の練習でいきなり全本数に戻さず、初回は通常の30〜50%本数から、翌日の症状増悪がなければ漸増する。週単位での急激な負荷増加（acute:chronic比の急上昇）が再受傷の主因。NHEなど遠心性トレーニングの継続も再発予防に有効。`
      : undefined,
  };
}

// --- MCL (内側側副靱帯損傷) ---

function mclGuidance(sport: SportId | ""): string {
  const braceSection = sport === "american_football"
    ? "■ 装具・テーピング（アメフト）\n" +
      "・外反曝露が高いOLは硬性（ヒンジ付き）装具の着用を推奨。DL・LBも可能であれば着用。\n" +
      "・ポジション練習・対人へ復帰する際はテーピングを推奨（外反曝露の高いポジションは装具併用も検討）。\n\n"
    : "■ 装具・サポーター\n" +
      "・競技により使用可能な装具は異なりますが、まずはルール内で装着可能なしっかり目のサポーター/ブレースを使用しましょう。\n" +
      "・練習・対人へ復帰する際はテーピングの併用も検討してください。\n\n";
  return (
    "■ 分類（Fetto & Marshall）\n" +
    "・Ⅰ度：外反動揺なし（内側裂隙開大3〜5mm）／Ⅱ度：30°屈曲位で動揺（6〜10mm）／Ⅲ度：0°+30°で動揺（>10mm・完全断裂）。\n" +
    "・受傷機転：膝20°屈曲位での外反ストレス（多くは下腿外旋を伴う・外側からの接触）。\n" +
    "・受傷時はMRI撮影での診断を推奨（重症度の確定、半月板・十字靱帯など合併損傷の評価）。\n\n" +
    braceSection +
    "■ 治療方針\n" +
    "・単独MCL損傷は不全断裂（Ⅰ・Ⅱ度）も外反不安定のないⅢ度も、早期機能的リハビリによる保存療法が標準。保存の方が手術より筋力回復が速く、復帰率も高いと報告される（Svantesson 2024 SR／EFORT 2018）。\n" +
    "・手術が検討されるのは、Ⅲ度＋著明な外反不安定（外反アライメント不良）、pes anserinusを越えた断端の嵌頓（Stener様病変）、骨性裂離、ACL等との多靱帯損傷など。該当が疑われればスポーツ整形（膝専門医）を受診。術後は執刀医の指示に従ってください。\n\n" +
    "■ 復帰（RTP）基準について\n" +
    "・MCL固有のエビデンスに基づくRTP基準は確立されていません（既存研究は古く・異質性が高い）。\n" +
    "・実臨床ではACLリハから外挿した基準を用いるのが一般的です：①片脚ホップ4種でLSI（左右対称性指数）≧90%、②大腿四頭筋・ハム（およびER/IR）の筋力左右差<10%、③無痛での外反ストレス、④競技特異的なカッティング/ピボット課題のクリア。\n" +
    "・運動の進め方は等尺性 → 直線ジョグ → 直線全力走 → フィギュアエイト/カッティングへ段階的に。装具・荷重・期間は重症度と症状に応じ個別化（暦より機能基準）。"
  );
}

function mclPlan(p: GeneratePlanParams): RehabPlan {
  const gradeOption = (GRADES_BY_INJURY.mcl ?? []).find((g) => g.value === p.grade);
  const gradeLabel  = gradeOption?.label ?? p.grade ?? "";
  const isSevere    = p.grade === "III";   // 完全断裂：装具・荷重制限がやや長め
  const td = getTargetDays(p.targetDate);

  const okWalk       = t(p.tests, "okWalk");
  const okROM        = t(p.tests, "okROM");
  const okValgus     = t(p.tests, "okValgus");
  const okStrength   = t(p.tests, "okStrength");
  const okHopAgility = t(p.tests, "okHopAgility");

  let idx = 0;
  if      (!okWalk)     idx = 0;
  else if (!okROM)      idx = 1;
  else if (!okValgus)   idx = 2;
  else if (!okStrength) idx = 3;
  else                  idx = 4;
  const fullyReturned = okHopAgility;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `内側側副靱帯損傷（MCL ${gradeLabel}）の急性保護期です。MCLは外反ストレス（膝が内側に入る／下腿が外へ開く力）で損傷するため、この肢位を避けることが最優先です。受傷後72時間はPOLICE（保護・適切な荷重・冷却・圧迫・挙上）で炎症を管理します。${isSevere ? "Ⅲ度（完全断裂）はヒンジ付き膝装具での外反制動を医師と検討してください。" : "Ⅰ〜Ⅱ度は基本的に保存療法で良好に治癒します。"}`,
      okList: ["受傷時のMRI撮影（診断精度・重症度／合併損傷評価のため推奨）", "POLICE（アイシング15分・氷嚢を直接押し当てる・圧迫・挙上／受傷後72時間）", "疼痛のない範囲の自動ROM（特に伸展確保）", "等尺性大腿四頭筋収縮・SLR", isSevere ? "ヒンジ付き膝装具で外反制動（医師指示）" : "歩行は疼痛に応じて荷重可（痛ければ松葉杖）", "上半身・体幹トレーニング"],
      ngList: ["外反ストレス肢位（膝を内側に入れる／下腿を外に開く動き）", "痛みを伴う患部ストレッチ（痛気持ちいいはNG）", "ニーイン（knee-in）を伴うスクワット・着地", "コンタクト・側方からの接触", "入浴（湯船）・温熱（受傷後72時間は避ける／シャワーは可）"],
      rehabMenu: [
        { title: "POLICE＋外反保護", sets: "アイシング15分 × 4〜6回", note: "氷嚢を直接押し当てる。受傷後72時間。Ⅱ〜Ⅲ度は装具で外反制動", details: "受傷後72時間はPOLICEで炎症を管理します。アイシングは1回15分とし、タオル越しでは冷却効果が低いため氷嚢やビニール袋の氷を直接しっかり押し当てます。挙上は足の下に枕や丸めた布団を置いて少し高くし、座位でも台に足を置きます。MCLは外反ストレスで再損傷するため、膝が内側に入る肢位を避けます。Ⅱ〜Ⅲ度ではヒンジ付き膝装具（可動域を許しつつ外反を制動）の使用を医師と検討してください。湯船・温熱は72時間避け、入浴はシャワーのみ。" },
        { title: "等尺性大腿四頭筋＋SLR", sets: "各10回 × 3", note: "膝を伸ばしたまま太もも前面に力／脚上げ", details: "大腿四頭筋の等尺性収縮（膝裏でタオルを押す）とストレートレッグレイズ（SLR）で、患部に外反負荷をかけずに筋力低下を防ぎます。痛みのない範囲で行います。" },
        { title: "ヒールスライド（ROM）", sets: "10回 × 3", note: "疼痛のない範囲で屈曲可動域を回復", details: "仰臥位で踵を滑らせて膝をゆっくり曲げ伸ばしし、可動域を回復します。外反方向の動きは加えず、屈伸のみ行います。痛みの手前で止めます。" },
        { title: "上半身・体幹トレーニング", sets: "各2〜3セット", note: "膝に荷重・外反をかけず全身維持", details: "膝に負荷・外反がかからない種目で全身コンディションを維持します。座位・仰臥位での上半身・体幹種目を中心に行います。" },
      ],
      timeline: [
        { week: "急性・保護期",   goal: "歩行痛の消失",     activity: "POLICE・外反回避（〜72hはPOLICE）" },
        { week: "→ ROM回復まで",   goal: "可動域・全荷重",   activity: "段階的ROM・荷重歩行" },
        { week: "→ 外反テスト陰性", goal: "筋力・安定性",     activity: "筋力強化・外反制御" },
        { week: "→ 基準クリアで",   goal: "競技復帰",        activity: "ドロップジャンプ→カット→復帰" },
      ],
      alert: "MCLの受傷機転は外反ストレス。急性期は外反肢位を厳禁とし、再受傷を防ぎます。保存は暦の週数ではなく各段階の基準クリアで進めます。",
    },
    {
      summary: "歩行痛が消失しました。可動域・荷重回復期です。屈伸の可動域を全域へ広げ、全荷重歩行を確立します。外反ストレスを避けながら等尺性→等張性へ筋力トレーニングを進めます。",
      okList: ["全可動域への屈伸ROM訓練", "全荷重歩行（跛行なく）", "固定自転車（軽負荷）", "等尺性→軽い等張性筋力強化", "両脚カーフレイズ・ミニスクワット（ニーイン回避）"],
      ngList: ["外反ストレス・側方への急な動き", "ニーインを伴う深いスクワット", "ジョグ・ランニング（次フェーズ）", "コンタクトプレー"],
      rehabMenu: [
        { title: "全域ROM訓練", sets: "各10回 × 3", note: "屈伸の左右差をなくす", details: "ヒールスライド・自動介助運動で屈伸可動域を健側と同等まで回復します。外反方向の動きは加えません。伸展（完全に伸びる）の確保を優先します。" },
        { title: "固定自転車", sets: "10〜15分", note: "軽負荷で循環・ROM促進", details: "サドルを高めにして軽負荷から開始します。膝に外反をかけずに可動域と循環を促し、有酸素能を維持します。" },
        { title: "ミニスクワット・レッグプレス（軽負荷）", sets: "15回 × 3", note: "膝が内側に入らないアライメントで", details: "0〜60°の浅い範囲から始め、膝とつま先を同じ向きに保ち（ニーイン防止）外反を避けて行います。疼痛のない範囲で段階的に深さ・負荷を上げます。" },
        { title: "中殿筋・殿筋強化（導入）", sets: "各15回 × 3", note: "クラムシェル・サイドブリッジ", details: "中殿筋は膝の外反（ニーイン）を制御する重要な筋です。クラムシェル・サイドブリッジ・ヒップアブダクションで早期から強化を始めます。" },
      ],
      timeline: [
        { week: "現在：ROM・荷重回復期", goal: "全可動域・全荷重", activity: "ROM・荷重・等張性導入" },
        { week: "→ 外反テスト陰性",     goal: "筋力・安定性",     activity: "筋力強化・外反制御" },
        { week: "→ 基準クリアで",       goal: "競技復帰",        activity: "ドロップジャンプ→カット→復帰" },
      ],
      alert: "可動域・筋力は外反ストレスを避けて進めます。膝のぐらつき（外反動揺）が残る場合は医師の再評価を。",
    },
    {
      summary: "可動域・荷重が回復しました。筋力強化期です。外反ストレステストが陰性になるよう、大腿四頭筋・ハムストリング・殿筋（特に中殿筋）の筋力と動的な外反制御を高めます。クローズドキネティックチェーンと固有感覚訓練を進めます。",
      okList: ["全可動域での筋力強化（漸増）", "クローズドキネティックチェーン（スクワット・ランジ）", "中殿筋・殿筋による外反制御訓練", "固有感覚・バランス訓練（両脚→片脚）", "直線ジョグ（疼痛・動揺なければ）"],
      ngList: ["外反不安定感が残る状態でのカット・ジャンプ", "ニーインを伴う動作", "コンタクト・側方接触", "全速の方向転換（次フェーズ）"],
      rehabMenu: [
        { title: "スクワット・デッドリフト・ランジ（CKC／knee-in注意）", sets: "10〜12回 × 3", note: "スクワット・デッドリフトでのknee-in厳禁。両脚→片脚→バランスディスク上へ", details: "両脚スクワット・デッドリフト → スプリットスクワット → 片脚（シングルレッグ）→ バランスディスク上、と支持基底面を狭く・不安定にしながら段階的に進めます。スクワットやデッドリフトでは膝が内側に入る（knee-in＝外反）と内側に負荷が集中し再受傷リスクになるため、膝とつま先を同方向に保ち、鏡・動画でアライメントを必ず確認します。フォーム重視で負荷を漸増します。" },
        { title: "中殿筋・殿筋強化（発展）", sets: "各15回 × 3", note: "片脚ブリッジ・サイドプランク・バンドサイドステップ", details: "片脚ブリッジ・サイドプランク・バンドを使ったサイドステップで、膝の外反を動的に制御する筋を強化します。MCL再受傷予防の要です。" },
        { title: "片脚バランス・固有感覚", sets: "30秒 × 3", note: "安定面→不安定面。膝の安定を意識", details: "片脚立位を安定面から不安定面（バランスディスク）へ進めます。膝が内外にぶれないよう動的安定性を高めます。" },
        { title: "直線ジョグ", sets: "10〜15分", note: "疼痛・外反動揺なければ開始", details: "跛行なく歩行でき外反動揺がなければ、直線ジョグから再開します。低速・短時間から始め、翌日の疼痛・腫脹がなければ漸増します。方向転換はまだ加えません。" },
      ],
      timeline: [
        { week: "現在：筋力強化期", goal: "外反テスト陰性・筋力回復", activity: "CKC・殿筋・固有感覚・ジョグ" },
        { week: "→ 左右差<10%まで", goal: "ドロップジャンプ・着地制御", activity: "プライオ・アジリティ準備" },
        { week: "→ 基準クリアで",   goal: "競技復帰",                activity: "カット→コンタクト→復帰" },
      ],
      alert: "外反ストレステストが陰性化し、片脚動作で膝が内側に入らないことを確認してから次の段階（ジャンプ・カット）へ進みます。",
    },
    {
      summary: "外反テストが陰性になりました。スポーツ準備期です。ドロップジャンプで着地時の膝外反（ニーイン）制御を評価・訓練し、プライオメトリクスとアジリティを段階的に進めます。片脚ホップ4種のLSIが90%以上・筋力左右差が10%未満になり、着地・カットで外反制御ができれば最終段階へ（基準はACLリハから外挿）。",
      okList: ["ドロップジャンプ・着地制御訓練", "両脚→片脚プライオメトリクス", "アジリティ（ラダー→低速カット）", "ランニング（直線→曲線）", "競技特異的ドリル（低〜中強度）"],
      ngList: ["着地・カットで膝が内側に入る（外反）状態での高強度動作", "医師許可前のフルコンタクト", "ホップLSI<90%・筋力左右差≧10%でのカット・ジャンプ多用"],
      rehabMenu: [
        { title: "ドロップジャンプ（着地制御）", sets: "5回 × 3〜5セット", note: "台から両脚着地→膝が内に入らないか確認。低い台から", details: "低い台（20〜30cm）から両脚で飛び降り、着地姿勢を作ります。着地時に膝がつま先より内側に入らない（ニーイン＝外反しない）ことを鏡・動画で確認します。MCLは外反負荷で再損傷するため、着地の膝外反制御がこのフェーズの核です。両脚で安定したら片脚ドロップジャンプ→ジャンプ後すぐの方向転換へ段階的に進めます。痛み・不安定感が出たら中止します。" },
        { title: "プライオメトリクス（漸増）", sets: "各10回 × 3", note: "両脚ジャンプ→片脚ホップ→側方ホップ", details: "両脚ジャンプ→片脚前方ホップ→側方（ラテラル）ホップへ進めます。側方ホップは外反方向の制御が要求されるため、着地の安定を確認しながら慎重に進めます。" },
        { title: "アジリティ（ラダー→カット）", sets: "5〜10分", note: "低速のフォーム重視から", details: "ラダードリルで多方向ステップを習得し、45°→90°の低速カットへ進めます。各カットで膝の外反が出ないことを確認します。高速・急停止は次フェーズです。" },
        { title: "中殿筋・殿筋＋着地フィードバック", sets: "各15回 × 3", note: "外反制御筋の維持＋動作の質確認", details: "外反制御筋（中殿筋・殿筋）の強化を継続し、ジャンプ・着地・カットのたびに膝のアライメントをフィードバックします。" },
      ],
      timeline: [
        { week: "現在：スポーツ準備期", goal: "ホップLSI≧90%・筋力左右差<10%・着地外反制御", activity: "ドロップジャンプ・プライオ・カット準備", criteria: "4種ホップLSI≧90%・筋力左右差<10%・無痛外反ストレス" },
        { week: "→ 基準クリアで",       goal: "競技復帰",            activity: "全速カット→コンタクト→試合", criteria: "競技特異的カット/ピボット課題クリア＋医師許可" },
      ],
      alert: "ドロップジャンプ・カットで膝の外反（ニーイン）が出る間は高強度・コンタクトに進まないこと。外反制御がMCL再受傷予防の鍵です。RTP基準はMCL固有のエビデンスが乏しく、ACLリハから外挿しています。",
    },
    {
      summary: fullyReturned
        ? "全ての基準をクリアしました。競技復帰が可能な状態です。外反制御の維持トレーニングを継続してください。"
        : "競技復帰期です。筋力・着地制御をクリアし、全速のカット・コンタクト耐性と心理的準備（再受傷への不安がないこと）を満たせば医師許可のもとで復帰します。",
      okList: ["全速の方向転換・カット（外反制御下で）", "医師許可後の段階的コンタクト復帰", "外反制御・殿筋の維持トレーニング継続", "（必要に応じ）テーピング・装具の併用"],
      ngList: ["医師許可なしのフルコンタクト・試合", "再受傷への不安を抱えたままの復帰", "外反制御トレーニングの中止"],
      rehabMenu: [
        { title: "全速カット・競技特異的ドリル", sets: "練習準拠", note: "急停止・切り返しで外反が出ないか確認", details: "全速での45°→90°→急激な切り返しを行い、各動作で膝の外反が出ないことを確認します。ポジション固有の動作（アメフトはカットブロック・タックル肢位など）を再現し段階的に強度を上げます。" },
        { title: "コンタクト段階的復帰", sets: "段階的", note: "コントロールド→対人→フルコンタクト", details: "側方からの接触はMCLに直接外反ストレスをかけます。コントロールされた接触から対人、フルコンタクトへ段階的に進め、各段階で翌日の疼痛・動揺がないことを確認します。" },
        { title: "外反制御・殿筋 維持トレ", sets: "週2〜3回", note: "シーズン中も継続", details: "中殿筋・殿筋と着地・カットの外反制御をシーズン中も継続します。膝外反の制御不良はMCLだけでなく他の膝傷害のリスクにもなります。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "カット・コンタクト耐性クリア", activity: "全速カット→段階的コンタクト→試合" },
        { week: "復帰後シーズン中", goal: "再受傷予防継続",            activity: "外反制御・殿筋維持" },
      ],
      alert: "MCLは側方からの接触（外反）で再受傷しやすい。違和感・膝のぐらつきが出たら即中止し医師に報告してください。",
    },
  ];

  // AFポジション特異
  if (p.sport === "american_football") {
    const pos = p.position;
    // 急性〜保護期（idx0）：硬性装具（OLは推奨／DL・LBは可能であれば）
    if (pos.includes("OL")) {
      data[0].okList.unshift("硬性（ヒンジ付き）装具の着用（OLは強く推奨）");
      data[0].rehabMenu.push({
        title: "硬性（ヒンジ付き）装具の着用（OL推奨）", sets: "急性期〜競技復帰まで",
        note: "ラインは外反曝露が高くOLは硬性装具を推奨",
        details: "OLはカットブロック・パイルアップで横からの外反ストレスを受けやすく再受傷リスクが高いポジションです。急性期から、可動域を許しつつ外反を制動するヒンジ付き硬性装具の着用を推奨します。復帰後も装具＋テーピングの併用を検討してください。",
      });
    } else if (pos.includes("DL") || pos.includes("LB")) {
      data[0].okList.unshift("硬性（ヒンジ付き）装具の着用（DL/LBは可能であれば）");
      data[0].rehabMenu.push({
        title: "硬性（ヒンジ付き）装具の着用（DL/LBは可能なら）", sets: "急性期〜競技復帰まで",
        note: "外反曝露が高く可能であれば装具着用",
        details: "DL・LBもコンタクト・パイルアップで膝への外反ストレスを受けやすいため、可能であればヒンジ付き硬性装具の着用を推奨します。難しい場合はテーピングで外反制動を補助します。",
      });
    }
    // スポーツ準備期（idx3）：ポジション別の外反制御ドリル
    if (pos.includes("OL") || pos.includes("DL")) {
      data[3].rehabMenu.push({
        title: "ライン戦の外反負荷対策（OL/DL）", sets: "確認しながら",
        note: "カットブロック・パイルアップでの外反曝露に注意",
        details: "OL/DLは横からのカットブロックやパイルアップで膝に直接外反ストレスを受けやすく、MCL再受傷のリスクが高いポジションです。スタンスからの踏み込み・ドライブで膝が内側に入らないこと、横方向の接触に備えた外反制御を重点的に確認します。復帰時のサポーター・装具併用も検討してください。",
      });
    } else {
      data[3].rehabMenu.push({
        title: "カット・着地の外反制御（スキル/LB等）", sets: "確認しながら",
        note: "全速カット・ランアフターキャッチでのニーイン制御",
        details: "走る・切る・着地するポジションでは、全速カットやランアフターキャッチ、タックル時の踏ん張りで膝の外反が出やすくなります。ドロップジャンプで養った着地制御を競技速度のカットへ引き継ぎ、膝が内側に入らないことを確認します。",
      });
    }
    // 競技復帰期（idx4）：ポジション練習復帰時のテーピング推奨
    data[4].okList.unshift("ポジション練習復帰時はテーピングを推奨（OL/DL/LBは硬性装具の併用も検討）");
    data[4].rehabMenu.push({
      title: "テーピング（ポジション練習復帰時）", sets: "練習・試合時",
      note: "外反制動の補助。OL/DL/LBは硬性装具併用も検討",
      details: "ポジション練習・対人へ復帰する際は、外反制動を補助するテーピングを推奨します。OL/DL/LBなど外反曝露が高いポジションは硬性（ヒンジ付き）装具との併用も検討してください。テーピングは練習・試合のたびに巻き直します。",
    });
  }

  const phaseLabel = fullyReturned && idx === 4 ? "競技復帰可（基準クリア）" : MCL_PHASES[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 5,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: MCL_PHASES,
    clinicalGuidance: mclGuidance(p.sport),
  };
}

// --- 腰椎分離症 (Lumbar Spondylolysis) ---

// 大学生以上：症状・機能ベースの段階復帰（画像での癒合確認は必須としない／軟性〜半硬性コルセット可）
function spondylolysisPlanCollege(p: GeneratePlanParams): RehabPlan {
  const gradeOption = (GRADES_BY_INJURY.spondylolysis ?? []).find((g) => g.value === p.grade);
  const gradeLabel  = gradeOption?.label ?? p.grade ?? "";
  const td = getTargetDays(p.targetDate);

  const okPainFree  = t(p.tests, "okPainFree");
  const okWalk      = t(p.tests, "okWalk");
  const okExtTest   = t(p.tests, "okExtTest");
  const okJog       = t(p.tests, "okJog");
  const okCutJump   = t(p.tests, "okCutJump");
  const okSportMove = t(p.tests, "okSportMove");

  let idx = 0;
  if      (!okPainFree) idx = 0; // 安静・体幹リハ期
  else if (!okWalk)     idx = 1; // 体幹機能回復期
  else if (!okExtTest)  idx = 2; // 伸展テスト確認期（Stork＋Kemp）
  else if (!okJog)      idx = 3; // ジョグ期
  else if (!okCutJump)  idx = 4; // 方向転換・ジャンプ期
  else                  idx = 5; // 競技復帰期
  const fullyReturned = okSportMove;

  const isLineman = p.sport === "american_football" && (p.position.includes("OL") || p.position.includes("DL"));
  const isQB      = p.sport === "american_football" && p.position.includes("QB");

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `腰椎分離症（${gradeLabel}）の安静・体幹リハ期です（大学生以上：症状・機能ベース）。軟性〜半硬性コルセットを装着し（硬性は必須ではありません）、疼痛が消失するまでスポーツは完全休止、腰椎の伸展・回旋を避けて体幹安定化のリハビリのみ行います。大学生以上では画像での骨癒合確認よりも、症状と機能の回復を基準に段階的に復帰します。`,
      okList: ["軟性〜半硬性コルセットの装着（硬性は必須でない）", "疼痛消失までスポーツ完全休止・休養", "腰椎を反らさない・捻らない日常動作", "体幹安定化（腹横筋・ドローイン／腰椎中間位）", "下肢・上肢の非腰椎負荷トレーニング"],
      ngList: ["腰椎の伸展（反らす）・回旋を伴う運動", "ジャンプ・ランニング・コンタクト", "重量物挙上・高負荷の体幹運動", "疼痛を我慢した活動継続"],
      rehabMenu: [
        { title: "軟性〜半硬性コルセット装着", sets: "医師指示の期間", note: "大学生以上は硬性必須でなく軟性〜半硬性で可", details: "大学生以上では骨癒合（画像）よりも症状・機能を基準に進めるため、コルセットは軟性〜半硬性で構いません（硬性は必須ではありません）。疼痛が消失するまではスポーツを完全休止し、装着下でも腰椎を反らす・捻る動作は避けます。" },
        { title: "体幹等尺性（ドローイン）", sets: "10秒 × 10回", note: "腰椎中間位を保つ。反らさない", details: "腰椎を反らさない中間位（ニュートラル）で腹横筋を軽く働かせるドローインから始めます。痛みが出ない範囲で行い、伸展・回旋は加えません。" },
        { title: "股関節・胸郭の柔軟性", sets: "各30秒 × 3", note: "腰椎の代償を減らす", details: "股関節・胸郭の柔軟性を高め、腰椎を反らさずに動ける体をつくります。再発予防の体づくりの土台です。" },
        { title: "下肢・上肢トレーニング", sets: "各2〜3セット", note: "腰椎に伸展・回旋負荷をかけない種目", details: "腰椎に伸展・回旋・高い圧縮負荷をかけない範囲で下肢・上肢の筋力とコンディションを維持します。痛みが出れば中止します。" },
      ],
      timeline: [
        { week: "現在：安静・体幹リハ期", goal: "安静時痛の消失", activity: "軟性〜半硬性コルセット・休養・体幹安定化" },
        { week: "→ ADL痛消失で",        goal: "体幹機能回復",   activity: "体幹安定化・股関節柔軟性" },
        { week: "→ 伸展テスト陰性で",     goal: "ジョグ再開",     activity: "ジョグ（40→60%）→競技動作" },
      ],
      alert: "大学生以上は症状・機能ベースで段階復帰します（画像での癒合確認は必須としません）。ただし下肢への放散痛・しびれや症状の進行が疑われる場合はスポーツ整形を受診してください。",
    },
    {
      summary: "安静時痛が消失しました。体幹機能回復期です。コルセット（軟性〜半硬性）を継続したまま、腰椎を反らさない中間位での体幹安定化と股関節・胸郭の柔軟性を高めます。伸展・回旋はまだ制限します。",
      okList: ["コルセット下での体幹安定化（プランク系・腰椎中間位）", "股関節・胸郭の柔軟性向上", "ウォーキング・非衝撃の有酸素（腰部痛なし）", "下肢筋力強化（腰椎中間位で）"],
      ngList: ["腰椎の伸展・回旋を伴う運動", "ジャンプ・ランニング", "コンタクト・対人", "疼痛を我慢した高負荷運動"],
      rehabMenu: [
        { title: "体幹安定化（腰椎中間位）", sets: "30秒 × 3〜各15回", note: "プランク・デッドバグ・バードドッグ（反らさない）", details: "腰椎を反らさない中間位を保ったまま体幹を安定させます。腰椎ではなく腹圧と股関節で支える感覚を養います。" },
        { title: "股関節・胸郭モビリティ", sets: "各10回 × 2〜3", note: "腰椎の代償を減らす", details: "腰椎を動かさずに股関節・胸郭で動けるようにします。再発予防の核です。" },
        { title: "非衝撃有酸素", sets: "15〜20分", note: "自転車エルゴ・水中運動（腰部痛なし）", details: "腰椎に衝撃・伸展負荷をかけずに有酸素能を維持します。腰部痛が出ない姿勢で行ってください。" },
      ],
      timeline: [
        { week: "現在：体幹機能回復期", goal: "体幹安定・柔軟性", activity: "コルセット下で体幹・股関節" },
        { week: "→ 伸展テスト陰性で",   goal: "ジョグ再開",     activity: "ジョグ（40→60%）" },
        { week: "→ 方向転換・ジャンプ可で", goal: "競技復帰",   activity: "競技動作→復帰" },
      ],
      alert: "この時期も腰椎の伸展・回旋は制限。Stork・ケンプの陰性化を待ちます。",
    },
    {
      summary: "伸展テスト確認期です。Stork（片側後屈）とケンプテストで腰部痛が誘発されないかを確認します。『伸展痛なし・Stork陰性・Kemp陰性』の3点が揃って初めてジョグへ進みます（大学生以上はMRIでの癒合確認は必須としません）。",
      okList: ["体幹安定化・股関節/胸郭柔軟性の継続", "Stork・ケンプテストの定期セルフチェック", "ウォーキング・非衝撃有酸素", "腰椎中間位での下肢筋力強化"],
      ngList: ["伸展テストが陽性の間のジョグ・ランニング", "後屈痛・分離部痛が出る伸展・回旋", "ジャンプ・コンタクト"],
      rehabMenu: [
        { title: "Stork・ケンプテストの確認", sets: "定期的に", note: "伸展痛なし・Stork陰性・Kemp陰性の3点を確認", details: "Stork（患側一本脚で後屈）とケンプ（後屈＋側屈・回旋）で腰部痛が誘発されないか、分離部の圧痛・叩打痛がないかを確認します。3点が揃って陰性になったらジョグへ進みます。陽性の間は伸展・走行を控えます。" },
        { title: "体幹安定化の負荷漸増", sets: "各15回 × 3", note: "腰椎中間位を保って漸増", details: "腰椎中間位を保ったまま体幹安定化の負荷を段階的に上げ、ジョグ・競技動作に備えます。" },
        { title: "抗回旋トレーニング", sets: "各15回 × 3", note: "パロフプレス等の抗回旋から", details: "腰椎を回さずに回旋負荷に耐える種目から導入し、競技の回旋動作に備えます。" },
      ],
      timeline: [
        { week: "現在：伸展テスト確認期", goal: "Stork＋Kemp陰性", activity: "体幹強化・誘発テスト確認" },
        { week: "→ 3点陰性で",          goal: "ジョグ再開",     activity: "ジョグ（出力40→60%）" },
        { week: "→ 方向転換・ジャンプ可で", goal: "競技復帰",   activity: "競技動作→復帰" },
      ],
      alert: "ジョグ再開は『伸展痛なし・Stork陰性・Kemp陰性』の3点が揃ってから。大学生以上はMRIでの癒合確認を必須とせず、症状・機能で進めます。",
    },
    {
      summary: "伸展テストが陰性になりました。ジョグ期です。直線ジョグから始め、出力を40→60%と段階的に上げます。腰部痛・症状が再燃しないことを毎回確認します（大学生以上はMRIでの癒合確認は必須としません）。",
      okList: ["直線ジョグ（出力40→60%へ段階的に）", "腰部症状が再燃しなければ距離・出力を漸増", "体幹安定化・抗回旋の継続", "コルセットの段階的離脱（医師指示下）"],
      ngList: ["全力スプリント・方向転換・ジャンプ（次フェーズ）", "腰部痛・分離部痛を我慢したランニング", "コンタクト・対人"],
      rehabMenu: [
        { title: "ジョグ（出力40→60%）", sets: "10〜15分", note: "腰部症状が再燃しなければ段階的に出力UP", details: "直線ジョグを出力40%から始め、腰部痛・症状の再燃がなく翌日の増悪がなければ60%へ段階的に上げます。着地衝撃で腰部症状が出ないことを確認します。" },
        { title: "体幹安定化・抗回旋（維持）", sets: "各15回 × 3", note: "ランニング中の体幹保持", details: "ジョグ中も腰椎中間位を保てるよう体幹安定化・抗回旋を継続します。" },
        { title: "股関節・胸郭モビリティ（維持）", sets: "各10回 × 2〜3", note: "腰椎の代償を減らす", details: "腰椎以外で動ける状態を維持し、方向転換・ジャンプに備えます。" },
      ],
      timeline: [
        { week: "現在：ジョグ期", goal: "ジョグ（40→60%）無痛", activity: "段階的ジョグ・体幹維持" },
        { week: "→ ジョグ無痛で",  goal: "方向転換・ジャンプ", activity: "カット・ジャンプ着地" },
        { week: "→ 競技動作無痛で", goal: "競技復帰",         activity: "競技特異的動作→試合" },
      ],
      alert: "ジョグは出力40→60%と段階的に。腰部症状が再燃したら一段階戻します。大学生以上は症状・機能ベースで進めます（画像確認は必須でない）。",
    },
    {
      summary: "ジョグが無痛で可能になりました。方向転換・ジャンプ期です。方向転換・ジャンプ着地で腰部症状が再燃しないかを確認しながら段階的に強度を上げ、競技特異的動作へつなげます。",
      okList: ["方向転換ドリル（低速→高速）", "ジャンプ・着地ドリル（両脚→片脚）", "競技特異的な回旋・伸展動作（段階的）", "全身の筋力・パワートレーニング", "再発予防の体幹・柔軟性プログラム"],
      ngList: ["医師許可前のフルコンタクト・試合", "後屈痛・分離部痛を我慢しての継続", "1回での大幅な負荷増加"],
      rehabMenu: [
        { title: "方向転換ドリル", sets: "5〜10分", note: "低速→高速。腰部症状の再燃を確認", details: "45°→90°→鋭角の方向転換を低速から導入し、腰部症状が再燃しないことを確認しながら速度を上げます。" },
        { title: "ジャンプ・着地ドリル", sets: "各10回 × 2〜3", note: "両脚→片脚。着地で腰を反らさない", details: "両脚ジャンプ→片脚へと着地衝撃を段階的に加えます。着地時に腰椎を過度に反らさないアライメントを確認します。" },
        { title: "再発予防プログラム（体幹・股関節・胸郭）", sets: "週2〜3回", note: "復帰前の『肉体改造』が再発予防の鍵", details: "復帰前に体幹安定性・股関節/胸郭の柔軟性を作り直し、腰椎で代償しない動作パターンを定着させます。" },
      ],
      timeline: [
        { week: "現在：方向転換・ジャンプ期", goal: "方向転換・ジャンプ無痛", activity: "カット・ジャンプを段階的に" },
        { week: "→ 競技動作無痛で",          goal: "競技復帰",            activity: "競技特異的動作→試合" },
      ],
      alert: "方向転換・ジャンプ着地で腰部症状が再燃しないことを確認してから競技動作へ。誘発テスト（伸展痛・Stork・Kemp）の陰性維持を確認します。",
    },
    {
      summary: fullyReturned
        ? "全ての基準をクリアしました。競技復帰が可能な状態です（症状・機能ベース）。再発予防の体幹・柔軟性プログラムを継続してください。"
        : "競技復帰期です。競技特異的動作が無痛で行え、体幹安定性が確保され、誘発テスト（伸展痛・Stork・Kemp）の陰性が維持されていれば医師許可のもとで復帰します（大学生以上は画像確認を必須としません）。",
      okList: ["医師許可後の競技完全復帰", "段階的コンタクト→試合", "再発予防プログラムの継続（体幹・股関節・胸郭）", "誘発テスト陰性の維持確認"],
      ngList: ["医師許可なしの試合復帰", "腰部痛・下肢への放散痛を我慢しての継続", "再発予防トレーニングの中止"],
      rehabMenu: [
        { title: "競技完全復帰（段階的コンタクト）", sets: "段階的", note: "コントロールド→対人→フル", details: "医師の許可後、コントロールされた接触から対人・フルコンタクトへ段階的に進めます。各段階で腰部痛・後屈痛・下肢症状が出ないことを確認します。" },
        { title: "再発予防の維持トレーニング", sets: "週2〜3回", note: "体幹安定性・股関節/胸郭柔軟性の維持", details: "復帰後も体幹安定化と股関節・胸郭の柔軟性を維持します。腰椎で代償しない動作の定着が再発予防になります。" },
        { title: "腰部症状・誘発テストの自己管理", sets: "練習・試合後", note: "後屈痛・Stork/Kemp陽性・下肢痛は即報告", details: "後屈時の腰部痛やStork/ケンプの陽性化、下肢への放散痛（しびれ）が出たら即座に活動を中止し医師に報告してください。将来の分離すべり症（下肢痛・しびれ）予防のためにも腰部管理を継続します。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "競技完全復帰", activity: "段階的コンタクト→試合" },
        { week: "復帰後シーズン中", goal: "再発予防継続",   activity: "体幹・股関節・胸郭の維持" },
      ],
      alert: "大学生以上は症状・機能ベースで復帰します（画像での癒合確認は必須でない）。復帰後も体づくりを継続し、下肢の痛み・しびれが出たら即受診してください。",
    },
  ];

  // アメフトのポジション特異（方向転換・ジャンプ期＝idx4 に追記）
  if (isLineman) {
    data[4].rehabMenu.push({
      title: "ラインのスタンス・ブロッキングと腰椎伸展（OL/DL）", sets: "確認しながら",
      note: "スリーポイントスタンス・ドライブで腰椎を過伸展させない",
      details: "OL/DLはスリーポイントスタンスやドライブブロックで腰椎が反りやすく、分離部にストレスがかかります。股関節を深く使って腰椎を反らさないスタンス・ヒットポジションを再教育し、腹圧で腰椎を保護します。",
    });
  } else if (isQB) {
    data[4].rehabMenu.push({
      title: "スロー動作の腰椎伸展・回旋管理（QB）", sets: "確認しながら",
      note: "フォロースルーの伸展＋回旋に注意",
      details: "QBの投球はフォロースルーで腰椎の伸展＋回旋が組み合わさり分離部に負担がかかります。体幹・股関節で力を生み、腰椎を反らし過ぎない投球フォームを段階的に確認します。",
    });
  }

  const phaseLabel = fullyReturned && idx === 5 ? "競技復帰可（症状・機能ベース）" : SPONDYLOLYSIS_PHASES_COLLEGE[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: SPONDYLOLYSIS_PHASES_COLLEGE,
    clinicalGuidance:
      "■ 腰椎分離症（腰椎の疲労骨折）／大学生以上：症状・機能ベース\n" +
      "・骨端線が閉鎖し骨癒合が得にくくなる年代・競技レベルでは、骨癒合（画像）の確認に固執せず、症状消失と機能回復を基準に段階復帰する考え方が用いられる。\n" +
      "・コルセットは軟性〜半硬性で可（硬性は必須でない）。疼痛消失まではスポーツ休止し、体幹安定化リハビリのみ。\n" +
      "・誘発：片側立位後屈（Stork／Jackson）・ケンプテスト・分離部の圧痛/叩打痛。『伸展痛なし・Stork陰性・Kemp陰性』が揃ってからジョグへ。\n" +
      "■ 進め方（機能ベース）\n" +
      "・安静時痛 → ADL痛 → 伸展テスト陰性（Stork＋Kemp）→ ジョグ（出力40→60%）→ 方向転換・ジャンプ → 競技動作。画像での癒合確認は必須としない。\n" +
      "・再発予防：体幹安定性・股関節/胸郭の柔軟性の『肉体改造』。将来の分離すべり症（下肢の痛み・しびれ）予防の観点でも腰部管理を継続。",
  };
}

function spondylolysisPlan(p: GeneratePlanParams): RehabPlan {
  // 大学生以上は症状・機能ベース（画像ゲートなし）の別フローへ
  if (isCollegePlus(p.age)) return spondylolysisPlanCollege(p);
  const isTerminal = p.grade === "terminal"; // 終末期（偽関節）：骨癒合は困難
  const isEarly    = p.grade === "early";
  const gradeOption = (GRADES_BY_INJURY.spondylolysis ?? []).find((g) => g.value === p.grade);
  const gradeLabel  = gradeOption?.label ?? p.grade ?? "";
  const td = getTargetDays(p.targetDate);

  const okPainFree       = t(p.tests, "okPainFree");
  const okWalk           = t(p.tests, "okWalk");
  const okExtTest        = t(p.tests, "okExtTest");        // Stork＋Kemp陰性
  const okImagingImproved = t(p.tests, "okImagingImproved"); // MRI再チェックで改善
  const okJog            = t(p.tests, "okJog");
  const okSportMove      = t(p.tests, "okSportMove");

  let idx = 0;
  if      (!okPainFree)        idx = 0; // 固定・骨癒合期
  else if (!okWalk)            idx = 1; // 体幹機能回復期
  else if (!okExtTest)         idx = 2; // 伸展テスト確認期（Stork＋Kemp）
  else if (!okImagingImproved) idx = 3; // MRI再評価期
  else if (!okJog)             idx = 4; // ジョグ・競技動作再開期
  else                         idx = 5; // 競技復帰期
  const fullyReturned = okSportMove;

  const isLineman = p.sport === "american_football" && (p.position.includes("OL") || p.position.includes("DL"));
  const isQB      = p.sport === "american_football" && p.position.includes("QB");

  const healGoal = isTerminal
    ? "終末期（偽関節）では骨癒合は得られにくいため、骨癒合そのものより「疼痛消失＋体幹機能の獲得」で競技復帰を目指します（癒合しなくても硬性コルセットは分離すべり症の予防になり、特に成長期では推奨）。"
    : `${isEarly ? "初期（疲労蓄積期）" : "進行期"}では骨癒合を目標とします。硬性コルセットとスポーツ休止で癒合を促し（軟性より硬性コルセットの方が癒合良好との報告）、復帰前に画像（CT/MRI）で癒合を確認します。`;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `腰椎分離症（${gradeLabel}）の固定・骨癒合期です。腰椎の疲労骨折であり、繰り返しの伸展・回旋で発生・悪化します。硬性コルセットを装着し、スポーツは完全休止、腰椎の伸展・回旋を避けて分離部を保護します。${healGoal}`,
      okList: ["硬性コルセットの装着（軟性より硬性が癒合良好）", "スポーツ完全休止（分離部の保護）", "腰椎を反らさない・捻らない日常動作", "疼痛のない範囲の体幹等尺性（腹横筋・ドローイン）", "下肢・上肢の非腰椎負荷トレーニング", "（施設により）低出力超音波パルス（LIPUS）で癒合促進"],
      ngList: ["腰椎の伸展（反らす）動作・ブリッジ", "体幹の回旋・ひねり", "ジャンプ・ランニング・コンタクト", "重量物挙上・高負荷の体幹運動", "コルセットを外しての運動（医師許可まで）"],
      rehabMenu: [
        { title: "硬性コルセット（早急に作成・装着）", sets: "医師指示の期間・終日", note: "診断後すぐ作成。軟性より硬性が癒合良好（後藤2021）", details: "診断後はできるだけ早急に硬性コルセットを作成し、医師の指示する期間・時間装着します。やわらかいコルセットより硬いコルセットの方が癒合率が良いと報告されています。装着が遅れると骨癒合の好機を逃すため、作成を急ぎます。装着下でも腰椎を反らす・捻る動作は避けてください。骨癒合の確認は画像（経過観察はMRI、最終判断はCTが推奨）で行います。" },
        { title: "体幹等尺性（ドローイン）", sets: "10秒 × 10回", note: "腰椎中間位を保つ。反らさない", details: "腰椎を反らさない中間位（ニュートラル）で腹横筋を軽く働かせるドローインから始めます。痛みが出ない範囲で行い、伸展・回旋は加えません。腹圧で腰椎を安定させる感覚を再学習します。" },
        { title: "股関節・胸郭の柔軟性", sets: "各30秒 × 3", note: "腰椎の代償を減らす（腰椎以外を動かす）", details: "腰椎への負担は、股関節や胸郭の硬さを腰で代償することで増えます。腰椎を反らさずに股関節屈伸・胸郭回旋の柔軟性を高め、腰椎以外で動ける体をつくります。再発予防の体づくりの土台です。" },
        { title: "下肢・上肢トレーニング", sets: "各2〜3セット", note: "腰椎に伸展・回旋負荷をかけない種目", details: "腰椎に伸展・回旋・高い圧縮負荷をかけない範囲で下肢・上肢の筋力とコンディションを維持します。スクワット系は腰を反らさないフォームに限定し、痛みが出れば中止します。" },
      ],
      timeline: [
        { week: "固定・骨癒合期",  goal: "安静時痛の消失",     activity: "硬性コルセット・スポーツ休止・伸展回旋回避" },
        { week: "→ ADL痛消失まで", goal: "体幹機能回復",       activity: "体幹安定化・股関節柔軟性" },
        { week: "→ Stork陰性まで", goal: "伸展再導入・ジョグ", activity: "段階的伸展・ジョグ" },
        { week: "→ 画像癒合確認で", goal: "競技復帰",          activity: "競技動作→復帰" },
      ],
      alert: "高校生以下で2週間以上続く腰痛の約40%は分離症。腰椎の伸展（反らす）で痛む場合は特に疑い、スポーツ整形でMRI/CT評価を。骨癒合可能な時期を逃さないことが重要です。",
    },
    {
      summary: "安静時痛が消失しました。体幹機能回復期です。硬性コルセットを継続したまま、腰椎を反らさない中間位での体幹安定化と股関節・胸郭の柔軟性を高めます。伸展・回旋はまだ制限します。",
      okList: ["コルセット下での体幹安定化（プランク系・腰椎中間位）", "股関節・胸郭の柔軟性向上", "ウォーキング（腰部痛なし）", "非衝撃の有酸素（自転車エルゴ・水中運動）", "下肢筋力強化（腰椎中間位で）"],
      ngList: ["腰椎の伸展・回旋を伴う運動", "ジャンプ・ランニング", "コンタクト・対人", "コルセットを外しての高負荷運動"],
      rehabMenu: [
        { title: "体幹安定化（腰椎中間位）", sets: "30秒 × 3〜各15回", note: "プランク・デッドバグ・バードドッグ（反らさない）", details: "腰椎を反らさない中間位を保ったまま、フロントプランク・デッドバグ・バードドッグ（四つ這いで対角の手足を伸ばす／腰を反らさない範囲）で体幹を安定させます。腰椎ではなく腹圧と股関節で支える感覚を養います。" },
        { title: "股関節・胸郭モビリティ", sets: "各10回 × 2〜3", note: "腰椎の代償を減らす", details: "ヒップヒンジ・股関節回旋・胸郭回旋ドリルで、腰椎を動かさずに股関節・胸郭で動けるようにします。腰椎への伸展・回旋ストレスを減らす再発予防の核です。" },
        { title: "非衝撃有酸素", sets: "15〜20分", note: "自転車エルゴ・水中運動（腰部痛なし）", details: "固定自転車や水中運動で、腰椎に衝撃・伸展負荷をかけずに有酸素能を維持します。腰部痛が出ない姿勢で行ってください。" },
      ],
      timeline: [
        { week: "現在：体幹機能回復期", goal: "体幹安定・柔軟性", activity: "コルセット下で体幹・股関節" },
        { week: "→ Stork陰性まで",     goal: "伸展再導入・ジョグ", activity: "段階的伸展・ジョグ" },
        { week: "→ 画像癒合確認で",     goal: "競技復帰",          activity: "競技動作→復帰" },
      ],
      alert: "この時期も腰椎の伸展・回旋は制限。コルセットは医師の指示に従って継続してください。",
    },
    {
      summary: "安静時・日常生活の痛みが消失しました。伸展テスト確認期です。硬性コルセット下で体幹安定化・股関節/胸郭の柔軟性を続けながら、Stork（片側後屈）とケンプテストの陰性化を待ちます。腰椎の伸展・回旋・ジョグはまだ行いません。",
      okList: ["コルセット下での体幹安定化（腰椎中間位）", "股関節・胸郭の柔軟性向上", "ウォーキング・非衝撃の有酸素（腰部痛なし）", "Stork・ケンプテストの定期セルフチェック", "下肢筋力強化（腰椎中間位で）"],
      ngList: ["腰椎の伸展（反らす）・回旋を伴う運動", "ジャンプ・ランニング", "コンタクト・対人", "コルセットを外しての高負荷運動"],
      rehabMenu: [
        { title: "体幹安定化（腰椎中間位）", sets: "30秒 × 3〜各15回", note: "プランク・デッドバグ・バードドッグ（反らさない）", details: "腰椎を反らさない中間位を保ったまま、フロントプランク・デッドバグ・バードドッグで体幹を安定させます。腰椎ではなく腹圧と股関節で支える感覚を養います。" },
        { title: "股関節・胸郭モビリティ", sets: "各10回 × 2〜3", note: "腰椎の代償を減らす", details: "ヒップヒンジ・股関節回旋・胸郭回旋ドリルで、腰椎を動かさずに股関節・胸郭で動けるようにします。再発予防の核です。" },
        { title: "Stork・ケンプテストの確認", sets: "定期的に", note: "後屈で腰痛が誘発されないかを確認", details: "Stork（患側一本脚で後屈）とケンプ（後屈＋側屈・回旋）で腰部痛が誘発されないかを定期的に確認します。両方が陰性化したら、次はMRI再評価へ進みます。陽性の間は伸展・走行を控えます。" },
      ],
      timeline: [
        { week: "現在：伸展テスト確認期", goal: "Stork＋Kemp陰性", activity: "コルセット下で体幹・柔軟性" },
        { week: "→ 両テスト陰性で",       goal: "MRI再評価",      activity: "画像で改善を確認" },
        { week: "→ MRI改善で",           goal: "ジョグ再開",      activity: "ジョグ→競技動作→復帰" },
      ],
      alert: "Stork・ケンプが陽性の間は伸展・走行を控えます。両方が陰性化したらMRI再評価へ。コルセットは医師の指示に従って継続してください。",
    },
    {
      summary: "Stork・ケンプテストが陰性になりました。MRI再評価期です。ジョグ・ランニングを始める前に、MRI（必要に応じCT）を再撮影し、分離部の改善（骨髄浮腫の軽減・骨癒合傾向）を確認します。改善が確認できてからジョグへ進みます。",
      okList: ["MRI再撮影での改善確認（ジョグ再開の前提）", "コルセットの段階的離脱（医師指示下）", "腰椎伸展の軽い再導入（痛みなし範囲）", "体幹安定化の負荷漸増", "非衝撃の有酸素継続"],
      ngList: ["MRIで改善が確認できない段階でのジョグ・ランニング", "後屈痛・分離部痛が出る伸展", "ジャンプ・スプリントの反復", "コンタクト・対人"],
      rehabMenu: [
        { title: "MRI再評価（改善確認）", sets: "医師の指示で撮影", note: "ジョグ再開可否の判断材料", details: "Stork・ケンプ陰性化の後、MRI（必要に応じCT）を再撮影し、分離部の骨髄浮腫の軽減・骨癒合傾向など改善を確認します。改善が確認できればジョグへ進みます。確認できなければコルセット下での体幹強化を継続します。判断は専門医が行います。" },
        { title: "腰椎伸展の段階的再導入", sets: "各10回 × 2〜3", note: "痛みなし範囲で可動域を戻す", details: "うつ伏せでの軽い伸展から始め、後屈痛・分離部痛が出ない範囲で腰椎伸展の可動域・コントロールを段階的に戻します。痛みが出る角度では止めます。" },
        { title: "抗回旋トレーニング", sets: "各15回 × 3", note: "パロフプレス等の抗回旋から", details: "腰椎を回さずに回旋負荷に耐えるパロフプレス等から導入します。競技の回旋動作に備えて段階的に進めます。" },
      ],
      timeline: [
        { week: "現在：MRI再評価期", goal: "MRIで改善確認", activity: "画像確認・軽い伸展再導入" },
        { week: "→ MRI改善で",      goal: "ジョグ再開",    activity: "ジョグ→段階的ラン" },
        { week: "→ 競技動作無痛で",  goal: "競技復帰",      activity: "競技動作→復帰" },
      ],
      alert: "ジョグ再開はMRIでの改善確認が前提です。Stork・ケンプが陰性でも、画像の改善が不十分なら走らないでください（判断は専門医）。",
    },
    {
      summary: "MRIで改善が確認できました。ジョグ・競技動作再開期です。直線ジョグから始め、痛みなく進めば段階的にランニング・ジャンプ・体幹回旋など競技特異的動作へ拡大します。再発予防の体づくり（体幹・股関節・胸郭）を仕上げます。",
      okList: ["直線ジョグ→段階的ランニング（腰部痛なし）", "ジャンプ・着地ドリル（段階的）", "競技特異的な回旋・伸展動作（段階的）", "全身の筋力・パワートレーニング", "再発予防の体幹・柔軟性プログラム"],
      ngList: ["医師許可前のフルコンタクト・試合", "後屈痛・分離部痛を我慢しての継続", "1回での大幅な負荷増加"],
      rehabMenu: [
        { title: "ジョグ→ランニング→スプリント漸増", sets: "段階的", note: "腰部痛なく速度・距離UP", details: "直線ジョグからビルドアップ走→スプリントへ段階的に上げます。各段階で腰部痛・後屈痛が出ないこと、翌日に増悪がないことを確認します。" },
        { title: "ジャンプ・着地・競技動作", sets: "練習準拠", note: "伸展・回旋を含む競技動作を段階的に", details: "ジャンプ・着地、体幹の伸展・回旋を含む競技特異的動作を低強度から段階的に再導入します。野球の打撃・投球・守備や、腰椎伸展を伴う動作は特に慎重に進めます。" },
        { title: "再発予防プログラム（体幹・股関節・胸郭）", sets: "週2〜3回", note: "復帰前の『肉体改造』が再発予防の鍵", details: "分離症は再発も多く（病期により8〜33%）、復帰前に体幹安定性・股関節/胸郭の柔軟性を作り直す『肉体改造』が再発予防に必要とされます。腰椎で代償しない動作パターンを定着させます。" },
      ],
      timeline: [
        { week: "現在：ジョグ・競技動作再開期", goal: "競技動作無痛", activity: "ジョグ→ランニング・ジャンプ・回旋を段階的に" },
        { week: "→ 画像癒合確認＋無痛で", goal: "競技復帰",   activity: "段階的コンタクト→試合" },
      ],
      alert: isTerminal
        ? "終末期は骨癒合を待たず、疼痛消失と体幹機能の獲得で復帰を判断します（医師と相談）。復帰後も硬性コルセットや体幹管理の継続を検討。"
        : "復帰の最終判断は画像（CT等）での骨癒合確認が原則。癒合を待たずに高強度の反復伸展を続けると癒合が得られず進行・再発のリスクが高まります。",
    },
    {
      summary: fullyReturned
        ? "全ての基準をクリアしました。競技復帰が可能な状態です。再発予防の体幹・柔軟性プログラムを継続してください。"
        : "競技復帰期です。競技動作が無痛で行え、骨癒合が画像で確認（終末期は症状・機能ベース）でき、再発予防の体づくりが完了すれば医師許可のもとで復帰します。",
      okList: ["医師許可後の競技完全復帰", "段階的コンタクト→試合", "再発予防プログラムの継続（体幹・股関節・胸郭）", "腰椎を反らしすぎない動作習慣の維持"],
      ngList: ["医師許可なしの試合復帰", "腰部痛・下肢への放散痛を我慢しての継続", "再発予防トレーニングの中止"],
      rehabMenu: [
        { title: "競技完全復帰（段階的コンタクト）", sets: "段階的", note: "コントロールド→対人→フル", details: "医師の許可後、コントロールされた接触から対人・フルコンタクトへ段階的に進めます。各段階で腰部痛・後屈痛・下肢症状が出ないことを確認します。" },
        { title: "再発予防の維持トレーニング", sets: "週2〜3回", note: "体幹安定性・股関節/胸郭柔軟性の維持", details: "復帰後も体幹安定化と股関節・胸郭の柔軟性を維持します。腰椎で代償しない動作の定着が再発予防になります。" },
        { title: "腰部症状の自己管理", sets: "練習・試合後", note: "後屈痛・下肢痛は即報告", details: "後屈時の腰部痛や下肢への放散痛（しびれ）が出たら即座に活動を中止し医師に報告してください。将来の分離すべり症（下肢痛・しびれ）の予防のためにも腰部の管理を継続します。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "競技完全復帰", activity: "段階的コンタクト→試合" },
        { week: "復帰後シーズン中", goal: "再発予防継続",   activity: "体幹・股関節・胸郭の維持" },
      ],
      alert: "分離症は再発が多く、復帰後も体づくりの継続が必須。将来の分離すべり症（下肢の痛み・しびれ）予防のためにも腰部の自己管理を続けてください。",
    },
  ];

  // アメフトのポジション特異（ジョグ・競技動作再開期＝idx4 に追記）
  if (isLineman) {
    data[4].rehabMenu.push({
      title: "ラインのスタンス・ブロッキングと腰椎伸展（OL/DL）", sets: "確認しながら",
      note: "スリーポイントスタンス・ドライブで腰椎を過伸展させない",
      details: "OL/DLはスリーポイントスタンスやドライブブロックで腰椎が反りやすく、分離部にストレスがかかります。股関節を深く使って腰椎を反らさないスタンス・ヒットポジションを再教育し、腹圧で腰椎を保護します。過伸展を伴う反復動作は段階的に。",
    });
  } else if (isQB) {
    data[4].rehabMenu.push({
      title: "スロー動作の腰椎伸展・回旋管理（QB）", sets: "確認しながら",
      note: "フォロースルーの伸展＋回旋に注意",
      details: "QBの投球はフォロースルーで腰椎の伸展＋回旋が組み合わさり分離部に負担がかかります。体幹・股関節で力を生み、腰椎を反らし過ぎない投球フォームを段階的に確認します。",
    });
  }

  const phaseLabel = fullyReturned && idx === 5 ? "競技復帰可（基準クリア）" : SPONDYLOLYSIS_PHASES[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: SPONDYLOLYSIS_PHASES,
    clinicalGuidance:
      "■ 腰椎分離症（腰椎の疲労骨折）\n" +
      "・高校生以下で2週間以上続く腰痛の約40%が分離症（酒井 2016）。スポーツ選手で有病率が高い（プロ野球23%・Jリーグ30%）。\n" +
      "・診断：MRIは超初期から検出可、CTは病期判定・癒合判定に有用。経過観察はMRI、最終判断はCTが推奨。\n" +
      "・誘発：片側立位後屈での腰痛誘発（Jackson）、分離部の圧痛・叩打痛。\n" +
      "■ 治療\n" +
      "・治療目的は「分離（骨）を治すこと」と「再発させない体をつくること」。\n" +
      "・硬性コルセットを推奨（軟性より硬性が癒合良好：後藤 2021）。施設によりLIPUS（低出力超音波パルス）で癒合促進。\n" +
      "・病期別の癒合率：超初期・初期は高く、進行期は低下、終末期（偽関節）は癒合困難（ただし成長期は癒合例あり／癒合せずとも分離すべり予防の意義）。\n" +
      "・再発率：超初期33%・初期8%・進行期25%。復帰前に体幹・柔軟性の『肉体改造』が再発予防に必要。\n" +
      "■ 進め方\n" +
      "・暦ではなく機能（安静時痛→ADL痛→片側後屈テスト陰性→ジョグ→競技動作）と画像所見で段階的に。腰椎の伸展・回旋は後半まで慎重に再導入。\n" +
      "・将来の分離すべり症（下肢の痛み・しびれ）予防の観点でも腰部管理を継続。",
  };
}

// --- 下肢疲労骨折 (Lower-limb Stress Fracture) ---

function stressFracturePlan(p: GeneratePlanParams): RehabPlan {
  const isHighGrade = p.grade === "III"; // 骨折線あり：免荷をより厳格に
  const gradeOption = (GRADES_BY_INJURY.stress_fracture ?? []).find((g) => g.value === p.grade);
  const gradeLabel  = gradeOption?.label ?? p.grade ?? "";
  const td = getTargetDays(p.targetDate);

  const okPointTender = t(p.tests, "okPointTender");
  const okWalk        = t(p.tests, "okWalk");
  const okImaging     = t(p.tests, "okImaging");
  const okSingleCalf  = t(p.tests, "okSingleCalf");
  const okHop         = t(p.tests, "okHop");

  // 圧痛・歩行の「△違和感あり」は判定上"保留"（t()はtrueのみ通過）。
  // ホップテストだけは3段階で進路が分岐：無痛→ダッシュまで／違和感→ジョグ／痛み(数回)→安静ADL。
  const res = (id: string) => p.tests.find((x) => x.id === id)?.result;
  const hopRes = res("okHop"); // true(無痛) | "discomfort"(違和感) | false(痛み) | null/undefined(未)
  let idx = 0;
  if      (!okPointTender) idx = 0;            // 活動制限・保護期
  else if (!okWalk)        idx = 1;            // 荷重・歩行回復期
  else if (!okImaging)     idx = 2;            // 画像確認期
  else if (!okSingleCalf)  idx = 3;            // 筋力強化期（片足カーフレイズ目標）
  else if (hopRes === true)         idx = 6;   // ホップ無痛10回 → ダッシュ・競技復帰期
  else if (hopRes === "discomfort") idx = 5;   // ホップ違和感10回 → ジョグ期
  else                              idx = 4;   // ホップ痛み(数回)／未 → ホップ準備期（安静継続ADL）
  const fullyReturned = hopRes === true;
  // 「保留」メッセージは圧痛・歩行の違和感のときだけ（ホップの違和感はジョグへ前進するので対象外）
  const gateDiscomfort = (idx === 0 && res("okPointTender") === "discomfort")
    || (idx === 1 && res("okWalk") === "discomfort");
  const discomfortNote = gateDiscomfort
    ? "\n\n△【違和感が残存】痛みではなく違和感のみのため、フェーズは進めずに現段階の負荷を維持し、ごく慎重に進めます。違和感が消失すれば次へ。痛みが出たら一段階戻してください。"
    : "";

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `下肢疲労骨折（${gradeLabel}）の活動制限・保護期です。繰り返しの負荷による緩徐発症の骨ストレス障害です。疼痛に応じて松葉杖を使用し、運動は日常生活レベルに制限します。疼痛が違和感程度まで軽減すれば自立歩行は可能です。${isHighGrade ? "骨折線がある場合（Grade III）は免荷をより厳格にし、医師の指示に従ってください。" : ""}`,
      okList: ["疼痛に応じた松葉杖の使用（運動は日常生活レベルに制限）", "疼痛が違和感程度なら自立歩行可", "非荷重・非衝撃の有酸素（上肢エルゴ・水中運動）", "患部に負荷をかけない上半身・体幹トレーニング", "骨健康の評価（栄養・エネルギー不足・ビタミンD/Ca）"],
      ngList: ["ランニング・ジャンプ・スプリント", "疼痛を誘発する荷重・反復衝撃", "圧痛が残る状態での競技動作", "コンタクトプレー"],
      rehabMenu: [
        { title: "活動制限＋疼痛に応じた松葉杖", sets: "圧痛消失まで", note: "運動はADLレベルに制限。違和感程度なら自立歩行可", details: "疼痛に応じて松葉杖を使用し、運動量を日常生活レベルに制限します。疼痛が違和感程度まで軽減すれば松葉杖なしの自立歩行が可能です。骨折部に繰り返しの衝撃をかけないことが治癒の前提です。骨折線がある場合（Grade III）や高リスク部位では免荷をより厳格にします。" },
        { title: "非衝撃の有酸素維持", sets: "15〜20分", note: "上肢エルゴ・水中運動（患部に荷重・衝撃なし）", details: "患部に荷重・衝撃をかけない上肢エルゴメーター・水中運動（プールランを含む）で全身持久力を維持します。疼痛が出ない範囲で行ってください。" },
        { title: "骨健康・全身コンディション", sets: "—", note: "栄養・エネルギー不足（RED-S）・ビタミンD/Caの評価", details: "疲労骨折の背景に、エネルギー摂取不足（相対的エネルギー不足：RED-S）やビタミンD・カルシウム不足、月経異常（女子）などの骨健康の問題があることが多いです。再発予防のため栄養・コンディションの評価・改善を並行します。" },
      ],
      timeline: [
        { week: "現在：活動制限・保護期",  goal: "圧痛消失",       activity: "疼痛に応じ松葉杖・運動はADL制限" },
        { week: "→ 歩行痛消失で",    goal: "自立歩行・全荷重", activity: "ウォーキング・非衝撃有酸素" },
        { week: "→ 仮骨・改善確認で",  goal: "筋力強化",  activity: "カーフレイズ・下半身（15→8RM）" },
        { week: "→ 片足カーフレイズで", goal: "ランニング再開", activity: "ジョグ→ホップ10回でダッシュ" },
      ],
      alert: "高リスク部位（大腿骨頸部・膝蓋骨・脛骨前方皮質・舟状骨・第5中足骨基部・母趾種子骨）は癒合不良・進行・完全骨折のリスクが高く、より厳格な免荷・活動制限が必要なことがあります。部位の確定と方針は必ず専門医の評価を。",
    },
    {
      summary: "圧痛が消失しました。荷重・歩行回復期です。松葉杖を外して自立歩行・全荷重を確立し、ウォーキングや非衝撃の有酸素運動を進めます。ランニングはまだ行いません（画像確認後）。",
      okList: ["自立歩行・全荷重（歩行痛なし）", "ウォーキング（時間を漸増）", "非衝撃有酸素（自転車・水中）", "患部周囲の筋力強化（衝撃なし）", "可動域・柔軟性の維持"],
      ngList: ["ランニング・ジャンプ（画像確認・筋力獲得まで）", "歩行痛が出る距離・速度", "反復衝撃を伴う動作", "コンタクトプレー"],
      rehabMenu: [
        { title: "ウォーキング漸増", sets: "歩行痛なし範囲", note: "時間・距離を段階的に", details: "歩行痛が出ない範囲でウォーキングの時間・距離を段階的に増やします。痛みが出たら一段階戻します。" },
        { title: "非衝撃有酸素・筋力", sets: "各15〜20分／15回×3", note: "自転車・水中・衝撃のない筋トレ", details: "固定自転車・水中運動で持久力を、衝撃をかけない範囲で患部周囲の筋力を維持・強化します。ランニング再開に向けた土台をつくります。" },
        { title: "画像確認の準備", sets: "—", note: "次段階でX線の仮骨／MRIの改善を確認", details: "次の段階で画像（X線で仮骨形成、MRI/CTで改善）を確認します。痛みがなくても画像が改善していない段階での走行再開は再骨折のリスクがあります。" },
      ],
      timeline: [
        { week: "現在：荷重・歩行回復期", goal: "自立歩行・全荷重", activity: "ウォーキング・非衝撃有酸素" },
        { week: "→ 仮骨・改善確認で",   goal: "筋力強化",        activity: "カーフレイズ・下半身（15→8RM）" },
        { week: "→ 片足カーフレイズで",  goal: "ランニング再開",  activity: "ジョグ→ホップ10回でダッシュ" },
      ],
      alert: "歩行痛がない＝治癒ではありません。ランニング再開は画像確認と筋力（片足カーフレイズ）獲得の後です。",
    },
    {
      summary: "自立歩行が確立しました。画像確認期です。X線で仮骨形成（またはMRI/CTで改善）を確認します。確認できたら筋力強化期へ進み、確認できるまではウォーキング・非衝撃有酸素を維持します。",
      okList: ["画像（X線で仮骨／MRIで改善）の確認", "ウォーキング・非衝撃有酸素の継続", "患部周囲〜全身の筋力強化（衝撃なし）", "骨健康（栄養・ビタミンD/Ca）の改善継続"],
      ngList: ["画像で仮骨・改善が確認できない段階でのランニング", "ジャンプ・スプリント", "コンタクトプレー"],
      rehabMenu: [
        { title: "画像での仮骨・改善確認", sets: "医師の指示で撮影", note: "次段階（筋力強化）へ進む判断材料", details: "X線で仮骨形成、またはMRI/CTで骨癒合・骨膜反応の改善を確認します。確認できれば筋力強化期（カーフレイズ・下半身）へ進みます。確認できなければ活動制限を継続します。判断は専門医が行います。" },
        { title: "非衝撃有酸素・筋力維持", sets: "15〜20分／15回×3", note: "自転車・水中・衝撃のない筋トレ", details: "画像確認を待つ間も、衝撃をかけない範囲で持久力・筋力を維持します。" },
      ],
      timeline: [
        { week: "現在：画像確認期", goal: "仮骨・改善の確認", activity: "画像確認・非衝撃有酸素維持" },
        { week: "→ 仮骨・改善確認で", goal: "筋力強化",       activity: "カーフレイズ・下半身（15→8RM）" },
        { week: "→ 片足カーフレイズで", goal: "ランニング再開", activity: "ジョグ→ホップ10回でダッシュ" },
      ],
      alert: "ランニング再開は画像での仮骨・改善確認が前提。痛みがなくても画像が不十分なら走らないでください。",
    },
    {
      summary: "画像で仮骨・改善が確認できました。筋力強化期です。カーフレイズ・下半身トレを15RM程度からフォーム重視で開始し、段階的に8RMまで上げます。患側の片足カーフレイズが無痛〜違和感程度でできるようになれば、次のホップテストへ進みます。",
      okList: ["カーフレイズ・下半身トレ（15RM→段階的に8RMへ／フォーム重視）", "両脚→片脚カーフレイズへ段階的に", "非衝撃有酸素の継続", "片足カーフレイズ（無痛〜違和感程度）でホップテストへ", "骨健康・栄養管理の継続"],
      ngList: ["ジョグ・ランニング（ホップテスト前）", "ジャンプ・スプリント", "痛みが出る荷重・カーフレイズの反復", "コンタクトプレー"],
      rehabMenu: [
        { title: "カーフレイズ・下半身トレ（15→8RM）", sets: "15RM→段階的に8RM", note: "フォーム重視で開始し漸増。両脚→片脚へ", details: "【RMとは】Repetition Maximum＝その回数で限界になる重さのこと。15RM＝15回で限界の軽め、8RM＝8回で限界のやや重め（数字が小さいほど高負荷）。\n\n下腿三頭筋（カーフレイズ）と下半身を、まず15RM程度の軽負荷からフォーム重視で開始し、フォームが崩れず翌日に悪化がなければ段階的に8RMまで負荷を上げます。両脚カーフレイズから始め、片脚カーフレイズへ移行します。痛みが出る負荷では進めません。" },
        { title: "片足カーフレイズ（ホップテストへの目安）", sets: "無痛〜違和感程度で可能まで", note: "これがクリアできれば次はホップテスト", details: "患側の片足カーフレイズが無痛〜違和感程度でできるようになることが、次のホップテストへ進む目安です（鋭い痛みが出る間は次へ進まない）。回数・高さを段階的に増やします。" },
        { title: "非衝撃有酸素・骨健康維持", sets: "15〜20分", note: "自転車・水中で持久力維持", details: "衝撃をかけない範囲で持久力を維持しつつ、骨健康（栄養・ビタミンD/Ca）の管理を継続します。" },
      ],
      timeline: [
        { week: "現在：筋力強化期", goal: "片足カーフレイズ（無痛〜違和感）", activity: "カーフレイズ・下半身 15→8RM" },
        { week: "→ 片足カーフレイズで", goal: "ホップテスト（10回）", activity: "片足ホップ10回で進路判定" },
        { week: "→ ホップ結果で",      goal: "ジョグ／ダッシュ", activity: "違和感→ジョグ／無痛→ダッシュ" },
      ],
      alert: "次はホップテストです。片足カーフレイズが無痛〜違和感程度で可能になってから進みます。筋力（カーフレイズ）はフォーム重視で15→8RMへ段階的に。",
    },
    {
      summary: "片足カーフレイズがクリアできました。ホップ準備期です。患側でしっかり片足ジャンプ（ホップ）を10回行うテストで進路が分かれます。【数回で痛みが出て止まる】→走らず安静を継続し、活動は日常生活レベルまで。違和感程度で10回できるまで待ちます。【違和感程度で10回】→ジョグ開始。【無痛で10回】→段階的にフルダッシュまでOK。",
      okList: ["片足ホップ10回テストの実施（しっかり片足ジャンプ）", "痛みで数回で止まる場合：走らず安静継続（活動は日常生活レベル）", "非衝撃有酸素・下肢筋力（8RM級）の維持", "骨健康・栄養管理の継続"],
      ngList: ["ホップで痛みが出る段階でのジョグ・ランニング", "痛みを我慢したホップの反復", "テスト以外のジャンプ・スプリント", "コンタクトプレー"],
      rehabMenu: [
        { title: "片足ホップテスト（10回）", sets: "結果で進路が分岐", note: "痛みで数回→安静ADL／違和感で10回→ジョグ／無痛で10回→ダッシュまで", details: "患側でしっかり片足ジャンプ（ホップ）を10回行います。\n・数回で痛みが出て止まる → まだ走りません。安静を継続し活動は日常生活レベルまで。違和感程度で10回できるまで待ちます。\n・違和感程度で10回できる → ジョグから開始し段階的に上げます。\n・無痛で10回できる → 段階的にフルダッシュまで進めてOK。\n着地衝撃で骨折部に問題がないかを見る重要なテストです。" },
        { title: "非衝撃有酸素・下肢筋力維持", sets: "15〜20分／各10〜12回×3", note: "自転車・水中・8RM級の筋力維持", details: "ホップがまだ痛む間も、衝撃をかけない範囲で持久力と下肢筋力（8RM級）を維持し、骨健康（栄養・ビタミンD/Ca）の管理を継続します。" },
      ],
      timeline: [
        { week: "現在：ホップ準備期", goal: "片足ホップ10回", activity: "ホップテストで進路判定" },
        { week: "→ 違和感で10回",   goal: "ジョグ開始",    activity: "ジョグ→段階的ラン" },
        { week: "→ 無痛で10回",     goal: "ダッシュ許可",  activity: "段階的フルダッシュ→競技" },
      ],
      alert: "ホップで数回で痛みが出る間は走らない（安静・活動は日常生活レベルまで）。『違和感程度で10回』できればジョグ開始、『無痛で10回』でダッシュまでが目安です。",
    },
    {
      summary: "ホップが違和感程度で10回できました。ジョグ期です。ジョグから始め、疼痛・違和感と翌日の状態を確認しながら段階的にランニング距離・速度を上げます。フルダッシュはホップが無痛で10回できるようになってからです。",
      okList: ["ジョグ→段階的ランニング（距離・速度を漸増）", "週単位での緩やかな負荷増加（急増を避ける）", "ホップの継続（→無痛で10回でダッシュ許可）", "下肢筋力・パワーの維持", "骨健康・栄養管理の継続"],
      ngList: ["フルダッシュ・全力スプリント（ホップ無痛10回まで）", "1回での大幅な走行量増加（再骨折リスク）", "疼痛を我慢したランニング継続", "コンタクトプレー"],
      rehabMenu: [
        { title: "ジョグ→ランニング漸増", sets: "段階的", note: "疼痛・違和感・翌日の状態を確認して漸増", details: "短時間のジョグから始め、疼痛・違和感がなく翌日に増悪がなければ距離・速度を段階的に上げます。走行量は週単位で緩やかに増やし（急増を避ける）、悪化したら一段階戻します。芝・土など衝撃の少ない路面を推奨します。" },
        { title: "片足ホップ（→無痛10回でダッシュ許可）", sets: "無痛で10回まで", note: "違和感→無痛になればダッシュへ", details: "片足ホップを継続し、10回が無痛でできるようになればダッシュ（全力走）許可の目安です。違和感が残る間はジョグ〜サブマックスにとどめます。" },
        { title: "下肢筋力・パワー", sets: "各10〜12回 × 3", note: "8RM級の筋力を維持・発展", details: "下肢の筋力・パワーを維持・発展させます。再発予防には適切な負荷管理と筋力が重要です。" },
      ],
      timeline: [
        { week: "現在：ジョグ期", goal: "ジョグ→段階的ラン", activity: "ジョグ漸増・ホップ継続" },
        { week: "→ ホップ無痛10回で", goal: "ダッシュ許可", activity: "段階的フルダッシュ" },
        { week: "→ 競技動作無痛で",   goal: "競技復帰",    activity: "競技特異的動作→試合" },
      ],
      alert: "フルダッシュ許可の目安は『ホップが無痛で10回』。違和感が残る間はジョグ〜サブマックスにとどめ、負荷は週単位で緩やかに上げます。",
    },
    {
      summary: "ホップが無痛で10回できました。ダッシュ・競技復帰期です。段階的にフルダッシュまで進め、カット・ジャンプ・競技特異的動作へ拡大し、医師許可のもとで競技復帰します。負荷量管理と骨健康の維持を継続してください。",
      okList: ["段階的にフルダッシュ（全力走）まで", "ダッシュ→カット・ジャンプ→競技特異的動作・段階的コンタクト", "医師許可後の競技完全復帰", "負荷量（走行量・練習量）の管理継続", "骨健康・栄養・コンディションの維持"],
      ngList: ["医師許可なしの試合復帰", "疼痛を我慢しての継続", "急激な練習量増加（再発リスク）"],
      rehabMenu: [
        { title: "ダッシュ→競技特異的動作→完全復帰", sets: "段階的", note: "全力走・カット・ジャンプ・コンタクトを段階的に", details: "ホップ無痛10回クリア後、ダッシュ（全力走）からカット・ジャンプ・コンタクトなどポジション固有の動作を段階的に再導入し、医師許可のもとで完全復帰します。各段階で疼痛・翌日の状態を確認します。" },
        { title: "負荷量管理・骨健康維持", sets: "継続", note: "練習量の急増回避・栄養管理", details: "疲労骨折の再発予防には、練習量・走行量の急激な増加を避ける負荷管理と、エネルギー摂取・ビタミンD/カルシウムなど骨健康の維持が重要です。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "競技完全復帰", activity: "ダッシュ→競技動作→段階的コンタクト→試合" },
        { week: "復帰後シーズン中", goal: "再発予防継続",   activity: "負荷量管理・骨健康維持" },
      ],
      alert: "疲労骨折は負荷管理と骨健康（栄養・エネルギー不足の是正）が再発予防の鍵。疼痛が再燃したら即中止し医師に相談してください。",
    },
  ];

  const phaseLabel = STRESS_FRACTURE_PHASES[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 7,
    summary: data[idx].summary + discomfortNote,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: STRESS_FRACTURE_PHASES,
    clinicalGuidance:
      "■ 下肢疲労骨折（緩徐発症の骨ストレス障害）\n" +
      "・繰り返しの負荷で生じる。受傷日や急性外傷の概念は当てはまらず、POLICE・アイシングは基本的に不要。活動制限と負荷管理が治療の軸。\n" +
      "・診断・経過観察：MRI（早期検出）・X線（必要に応じCT）。ランニング再開は画像での改善確認後が原則。\n" +
      "■ 部位リスク\n" +
      "・高リスク部位（大腿骨頸部・膝蓋骨・脛骨前方皮質・舟状骨・第5中足骨基部・母趾種子骨）は癒合不良・完全骨折・進行のリスクが高く、より厳格な免荷・活動制限が必要なことがある。必ず専門医評価を。\n" +
      "・低リスク部位は活動制限と段階的復帰で改善することが多い。\n" +
      "■ 進め方（機能ベース）\n" +
      "・圧痛消失 → 全荷重歩行 → 画像で仮骨・改善確認 → 筋力強化（カーフレイズ・下半身を15RM→8RMへフォーム重視で漸増）→ 片足カーフレイズが無痛〜違和感程度 → 片足ホップ10回テスト。\n" +
      "・ホップ10回の結果で分岐：数回で痛みが出て止まる＝走らず安静継続（活動はADLまで）／違和感程度で10回＝ジョグ開始し段階的に上げる／無痛で10回＝段階的にフルダッシュまでOK → 競技復帰。\n" +
      "・グレーゾーン：症状系テスト（圧痛・歩行痛）には『△違和感あり』を選択可能。違和感は判定上は『保留』（フェーズを進めず、負荷を維持して慎重に・違和感消失で次へ）として扱い、白黒つけにくいケースに対応する。\n" +
      "・再発予防：負荷量（走行量・練習量）の急増回避、骨健康（エネルギー摂取不足＝RED-S、ビタミンD・カルシウム、女子は月経状態）の評価・是正。",
  };
}

// --- Meniscus（半月板損傷・保存療法） ---
// 機能ベース・グレードなし。先生の臨床基準（ROM左右差なし・筋力患健比90%・荷重筋トレ無痛で進行）に準拠。
// 出典：Kise 2016 BMJ／Duong 2023 JAMA／Beaufils&Pujol 2017 OTSR／Monson 2025 Curr Rev Musculoskelet Med。
function meniscusPlan(p: GeneratePlanParams): RehabPlan {
  const td = getTargetDays(p.targetDate);

  const okJointLine = t(p.tests, "okJointLine");
  const okROM       = t(p.tests, "okROM");
  const okStrength  = t(p.tests, "okStrength");
  const okSquat     = t(p.tests, "okSquat");
  const okPivot     = t(p.tests, "okPivot");

  let idx = 0;
  if      (!okJointLine) idx = 0; // 急性・腫脹コントロール期
  else if (!okROM)       idx = 1; // 可動域回復期
  else if (!okStrength)  idx = 2; // 筋力回復期（患健比90%）
  else if (!okSquat)     idx = 3; // 荷重筋トレ・ジョグ期
  else if (!okPivot)     idx = 4; // 方向転換・競技復帰準備期
  else                   idx = 5; // 競技復帰可
  const fullyReturned = okPivot;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: "半月板損傷（保存療法）の急性・腫脹コントロール期です。膝の腫れ（関節液）と関節裂隙の圧痛を引かせ、痛みのない範囲で可動域を保ちます。半月板はできる限り温存（保存）を優先します。",
      okList: ["保護＋痛みの出ない範囲での荷重", "腫脹管理（アイシング・圧迫・挙上）", "疼痛のない範囲の可動域運動（ヒールスライド等）", "大腿四頭筋セッティング（等尺性）・非荷重の有酸素"],
      ngList: ["深いしゃがみ込み・正座（深屈曲）", "捻り＋荷重（ピボット）", "ジャンプ・ランニング", "ロッキング（引っかかって伸びない）を我慢した運動"],
      rehabMenu: [
        { title: "腫脹コントロール", sets: "アイシング15分 × 4〜6回", note: "圧迫・挙上と併用。関節液・炎症を引かせる", details: "アイシング（氷嚢を直接15分）・弾性包帯による圧迫・下肢挙上で関節の腫れ（関節液）を軽減します。腫脹・関節裂隙の圧痛は炎症や負荷過多のサインで、残る間は無理に負荷を上げません。" },
        { title: "大腿四頭筋セッティング", sets: "10秒 × 10回 × 3", note: "膝を伸ばしたまま力を入れる等尺性", details: "膝を伸ばした状態で太もも前面に力を入れて10秒保持します。関節を動かさずに筋の廃用を防ぎます。痛みの出ない強さで行います。" },
        { title: "無痛範囲の可動域運動", sets: "各10回 × 3", note: "ヒールスライド等。痛み・引っかかりの手前まで", details: "踵を滑らせて膝をゆっくり曲げ伸ばしします（ヒールスライド）。痛み・引っかかりの出ない範囲で、完全伸展・屈曲の回復を目指します。反動はつけません。" },
      ],
      timeline: [
        { week: "現在：急性・腫脹コントロール期", goal: "圧痛・腫脹消失", activity: "保護・腫脹管理・無痛ROM" },
        { week: "→ 圧痛・腫脹消失で",            goal: "可動域回復",     activity: "完全伸展・屈曲（左右差なし）" },
        { week: "→ ROM回復で",                  goal: "筋力回復",       activity: "患健比90%へ" },
      ],
      alert: "ロッキング（膝が引っかかって完全に伸びない）が続く場合は、変位した断片による外傷性断裂（バケツ柄断裂など）の可能性があり手術適応のことがあります。保存で進まない・ロッキングが続く時は専門医評価を受けてください。",
    },
    {
      summary: "腫脹・圧痛が引きました。可動域回復期です。完全伸展・完全屈曲を健側と同等（左右差なし）に、痛みなく取り戻します。",
      okList: ["完全伸展・屈曲を目標にした可動域運動", "大腿四頭筋・ハムの等尺性〜軽い等張性", "自転車（低負荷）・水中運動", "腫脹が出ない範囲での荷重"],
      ngList: ["深屈曲での荷重・捻り", "ランニング・ジャンプ", "最終域での反動・無理な伸ばし", "痛み・腫脹が出る負荷"],
      rehabMenu: [
        { title: "可動域運動（完全伸展・屈曲）", sets: "各10〜15回 × 3", note: "ヒールスライド・伸展ストレッチ。左右差をなくす", details: "完全伸展（膝裏が伸びきる）と完全屈曲を、健側と同等になるまで段階的に広げます。痛み・引っかかりの手前で止め、反動はつけません。" },
        { title: "軽い筋力強化", sets: "10〜15回 × 3", note: "SLR・等尺性〜軽い等張性", details: "脚上げ（SLR）や軽負荷で大腿四頭筋・ハム・殿筋を刺激します。腫脹・痛みが出ない範囲で行い、翌日に悪化がなければ漸増します。" },
        { title: "低負荷の有酸素", sets: "15〜20分", note: "自転車（低負荷）・水中運動", details: "膝に負担の少ない自転車（サドル高め・低負荷）や水中運動で全身持久力を維持します。" },
      ],
      timeline: [
        { week: "現在：可動域回復期", goal: "ROM左右差なし（無痛）", activity: "完全伸展・屈曲の回復" },
        { week: "→ ROM回復で",       goal: "筋力回復",             activity: "患健比90%へ" },
        { week: "→ 筋力90%で",       goal: "荷重筋トレ・ジョグ",   activity: "スクワット・デッドリフト無痛→ジョグ" },
      ],
      alert: "可動域の左右差・最終域の痛みが残る間は筋力強化へ進めません。腫れが再び出たら一段階戻します。",
    },
    {
      summary: "可動域が回復しました。筋力回復期です。大腿四頭筋・ハムストリングの筋力を患健比90%以上（左右差10%未満）まで戻します。",
      okList: ["大腿四頭筋・ハム・殿筋の筋力強化（漸増）", "両脚→片脚への荷重トレーニングの準備", "バランス・固有感覚訓練", "自転車・水中での持久力維持"],
      ngList: ["深屈曲＋高負荷", "捻り動作（ピボット）", "ランニング・ジャンプ（筋力90%・荷重筋トレ無痛まで）", "痛み・腫脹を伴う負荷"],
      rehabMenu: [
        { title: "下肢筋力強化", sets: "12〜15回 × 3", note: "レッグプレス・レッグカール（軽→中負荷・フォーム重視）", details: "レッグプレス・レッグカール・ハムストリングカールなどで大腿四頭筋・ハムを強化します。フォームが崩れず翌日に悪化がなければ段階的に負荷を上げ、患健比90%（左右差10%未満）を目指します。深屈曲＋高負荷は避けます。" },
        { title: "片脚への移行・殿筋", sets: "各10〜12回 × 3", note: "片脚ブリッジ・ステップアップ", details: "両脚種目が安定したら片脚ブリッジ・ステップアップへ移行し、片脚での荷重に耐えられる筋力をつくります。殿筋を含め下肢全体を強化します。" },
        { title: "バランス・固有感覚", sets: "30秒 × 3", note: "片脚立ち→不安定面", details: "片脚立位から不安定面（バランスパッド等）へ難易度を上げ、固有感覚を回復します。膝が内に入らない制御を意識します。" },
      ],
      timeline: [
        { week: "現在：筋力回復期", goal: "筋力 患健比90%", activity: "下肢筋力強化（漸増）" },
        { week: "→ 筋力90%で",     goal: "荷重筋トレ・ジョグ", activity: "スクワット・デッドリフト無痛→ジョグ" },
        { week: "→ 荷重筋トレ無痛で", goal: "方向転換準備", activity: "ピボット・カッティング" },
      ],
      alert: "筋力 患健比90%が次（荷重筋トレ）の目安。痛み・腫脹なく左右差が縮まってから進みます。",
    },
    {
      summary: "筋力が患健比90%に達しました。荷重筋トレ・ジョグ期です。フルスクワット・デッドリフトなど荷重をかけた筋トレを無痛で行い、問題なければジョグ→ランニングへ進みます。",
      okList: ["フルスクワット・デッドリフト（フォーム重視・漸増）", "荷重筋トレが無痛ならジョグ→段階的ランニング", "両脚→片脚の荷重種目", "ジャンプ準備（両脚の軽いホップから）"],
      ngList: ["痛みを伴うスクワット・デッドリフト", "急なカッティング・ピボット（次段階）", "全力スプリント（ランニングが安定するまで）", "翌日に腫脹・痛みが出る負荷"],
      rehabMenu: [
        { title: "荷重筋トレ（スクワット・デッドリフト）", sets: "8〜12回 × 3", note: "フォーム重視で無痛のまま漸増", details: "フルスクワット・デッドリフトなど荷重をかけた種目を、フォームを崩さず疼痛なく行えるようにします。痛み・翌日の腫脹が出ない範囲で段階的に負荷を上げます。これが無痛で行えることがランニング再開の目安です。" },
        { title: "ジョグ→ランニング漸増", sets: "段階的", note: "荷重筋トレ無痛を確認してから開始", details: "短時間のジョグから始め、疼痛・腫脹がなく翌日に悪化がなければ距離・速度を段階的に上げます。痛みが出たら一段階戻します。" },
        { title: "ジャンプ準備", sets: "各10回 × 3", note: "両脚の軽いホップ→着地制御", details: "両脚での軽いホップ・着地から始め、膝が内に入らない着地制御を確認します。次段階の方向転換に備えます。" },
      ],
      timeline: [
        { week: "現在：荷重筋トレ・ジョグ期", goal: "荷重筋トレ無痛→ジョグ", activity: "スクワット・デッドリフト・ランニング漸増" },
        { week: "→ ランニング無痛で",        goal: "方向転換準備",       activity: "ピボット・カッティング・ジャンプ" },
        { week: "→ 競技動作無痛で",          goal: "競技復帰",           activity: "段階的フル参加" },
      ],
      alert: "荷重筋トレ（スクワット・デッドリフト）が無痛で行えることがランニング再開の目安。痛み・翌日の腫脹が出たら一段階戻します。",
    },
    {
      summary: "荷重筋トレ・ランニングが無痛になりました。方向転換・競技復帰準備期です。ピボット・カッティング・ジャンプ着地など競技特異的動作を、疼痛・不安感なく段階的に行います。",
      okList: ["方向転換（ピボット）・カッティングの段階的導入", "ジャンプ・着地ドリル（膝の制御）", "競技特異的アジリティ（低速→高速）", "片脚ホップの左右対称性の確認"],
      ngList: ["痛み・引っかかり・腫脹が出る方向転換", "不安感が残る状態での全力プレー", "医師の許可前の試合復帰", "翌日に症状が出る負荷"],
      rehabMenu: [
        { title: "アジリティ（方向転換・カッティング）", sets: "10〜15分", note: "ラダー・コーン。低速→高速へ", details: "ラダー・コーンドリルで方向転換・カッティングを低速から導入し、痛み・引っかかり・腫脹が出ないことを確認しながら高速・鋭角へ段階的に進めます。" },
        { title: "ジャンプ・着地制御", sets: "各8〜10回 × 3", note: "両脚→片脚。膝が内に入らない着地", details: "両脚から片脚へジャンプ・着地ドリルを進めます。着地で膝がつま先より内側に入らない（ニーインしない）制御を鏡・動画で確認します。" },
        { title: "片脚ホップ（左右差確認）", sets: "左右で比較", note: "シングル・トリプルホップ等", details: "片脚ホップ（距離・連続）で患側/健側の左右差を確認します。左右差が小さく無痛・不安感なしが復帰の目安です。" },
      ],
      timeline: [
        { week: "現在：方向転換・競技復帰準備期", goal: "ピボット・カッティング無痛", activity: "アジリティ・ジャンプ・ホップ" },
        { week: "→ 競技動作無痛で",              goal: "競技復帰",               activity: "段階的フル参加→試合" },
      ],
      alert: "ピボット・カッティングで痛み・引っかかり・腫脹が出る間は復帰しません。半月板を温存するため無理な深屈曲＋捻りは避けます。",
    },
    {
      summary: "ピボット・カッティングが無痛で可能になりました。機能基準（ROM左右差なし・筋力患健比90%・荷重筋トレ無痛・方向転換無痛）をクリアしています。段階的に競技へ完全復帰します。",
      okList: ["競技特異的練習への段階的フル参加", "筋力・パワー・アジリティの維持・発展", "再発予防（下肢筋力・着地/カット制御の継続）", "違和感・腫脹が出たら負荷を調整"],
      ngList: ["痛み・腫脹を我慢しての継続", "深屈曲＋強い捻りの反復（半月板への過負荷）", "急激な練習量の増加"],
      rehabMenu: [
        { title: "競技特異的フル練習（段階的）", sets: "練習準拠", note: "部分参加→フル参加へ", details: "ポジション固有の動作・練習に段階的にフル参加します。各段階で痛み・腫脹・引っかかりが出ないことを確認します。" },
        { title: "筋力・パワー維持", sets: "8〜10回 × 3〜4", note: "下肢筋力 患健比を維持・発展", details: "回復した筋力・パワーを維持・発展させます。再発予防には下肢筋力と動作の質が重要です。" },
        { title: "再発予防（着地・カット制御）", sets: "継続", note: "ニーイン制御・負荷管理", details: "着地・カットで膝が内に入らない制御を継続し、練習量の急増を避けます。半月板温存のため深屈曲＋捻りの過負荷を避けます。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "競技完全復帰", activity: "段階的フル参加→試合" },
        { week: "復帰後シーズン中", goal: "再発予防継続",   activity: "下肢筋力維持・動作の質・負荷管理" },
      ],
      alert: "復帰後も腫脹・関節裂隙の痛みが出たら負荷を見直してください。半月板温存のため深屈曲＋捻りの過負荷を避け、下肢筋力と動作の質を維持します。",
    },
  ];

  const phaseLabel = fullyReturned && idx === 5 ? "競技復帰可（機能基準クリア）" : MENISCUS_PHASES[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 6,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: MENISCUS_PHASES,
    clinicalGuidance:
      "■ 半月板損傷（保存療法）※本プランは非手術（保存）を対象\n" +
      "・変性断裂：運動療法が第一選択。中年の変性内側半月板断裂では、12週の運動療法が関節鏡下半月板部分切除術（APM）と2年時点で同等の機能改善（Kise NJ, et al. BMJ 2016;354:i3740. doi:10.1136/bmj.i3740）。機械症状（引っかかり・ロッキング）があっても変性断裂では手術は基本的に非適応で、運動療法が第一選択（Duong V, et al. JAMA 2023;330(16):1568-1580. doi:10.1001/jama.2023.19675）。\n" +
      "・『Save the meniscus』：半月板切除は将来の変形性膝関節症リスクを高めるため、可能な限り温存（保存・修復）を優先する（Beaufils P, Pujol N. Orthop Traumatol Surg Res 2017;103(8S):S237-S244. doi:10.1016/j.otsr.2017.08.003）。\n" +
      "・外傷性の変位断裂（バケツ柄断裂など、ロッキングを伴う）は手術適応となることがあるため、保存で進まない・ロッキングが続く場合は専門医評価を（Duong 2023）。\n" +
      "■ 診察所見\n" +
      "・関節裂隙圧痛（感度・特異度とも約83%）・McMurrayテスト（感度61%・特異度84%）が参考所見。腫脹（関節液）・関節裂隙圧痛の残存は炎症/負荷過多のサイン（Duong 2023／修復後でも遅延・癒合不良のサインとされる：Monson JK, et al. Curr Rev Musculoskelet Med 2025;18(9):331-343. doi:10.1007/s12178-025-09967-6）。\n" +
      "■ 進め方（機能ベース・臨床基準）\n" +
      "・腫脹/圧痛の消退 → ROM左右差なし（無痛）→ 筋力 患健比90%以上 → 荷重筋トレ（スクワット・デッドリフト）無痛 → ジョグ → ピボット・カッティング無痛で競技復帰。暦ではなく機能基準で段階を進める。",
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
      okList: [
        "アイシング（15分 × 4〜6回/日／氷嚢を直接押し当てる）",
        "弾性包帯・サポーターによる圧迫",
        "荷重：骨折が否定されていれば疼痛に応じて荷重可（違和感程度なら松葉杖なしで歩行OK）",
        "足関節ポンプ運動（仰臥位）",
        "上半身・体幹トレーニング（自重・ダンベル・チューブ）",
      ],
      ngList: ["強い痛みのある状態での全荷重歩行","入浴（湯船）・温熱療法（受傷後72時間は避ける／シャワーは可）","痛みを伴う強い伸張・マッサージ（痛気持ちいいはNG）"],
      rehabMenu: [
        { title: "アイシング（POLICE）",    sets: "15分 × 4〜6回",   note: "Optimal Load：疼痛に応じた早期荷重が基本方針", details: "POLICEとはProtection（保護）・Optimal Loading（最適荷重）・Ice（冷却）・Compression（圧迫）・Elevation（挙上）の頭文字です。受傷後72時間は1日4〜6回のアイシングを目安に実施してください。1回15分とし、終了後は1時間以上あけてから再実施します。タオル越しでは冷却効果が低いため、氷嚢やビニール袋に入れた氷を直接しっかり押し当ててください。圧迫包帯（弾性包帯）とセットで行うと浮腫軽減効果が高まります。挙上は、足の下に枕や丸めた布団を置いて少し高くし、座っている時も台に足を置きます。なお湯船・温熱は受傷後72時間は避け、入浴はシャワーのみにしてください（温熱は腫脹を増悪させます）。\n\n【荷重・松葉杖について】医師の診察で骨折が否定されていれば、疼痛に応じた荷重が基本方針です。違和感程度であれば松葉杖なしで歩行して構いません。強い痛みがあるときのみ松葉杖を使用し、痛みが落ち着いてきたら徐々に体重をかけていきます。ただし必ず主治医の指示を最優先にしてください。" },
        { title: "足関節ポンプ運動",        sets: "20回 × 5セット", note: "仰臥位・挙上位で実施", details: "仰臥位・挙上位（クッション等で足を持ち上げた状態）で足首を上下（背屈・底屈）に動かします。ふくらはぎの筋肉ポンプ作用で静脈・リンパの還流を促し浮腫を軽減します。1セット20回を1日5回以上実施できます。痛みなく実施できるため、この時期の主要エクサイズです。" },
        { title: "タオルギャザー",          sets: "2〜3分 × 3",   note: "内在筋強化。座位で実施可", details: "床に広げたタオルを足趾（足指）でギャザー（縮める）運動です。足内在筋を強化し足底アーチを支持する筋肉を鍛えます。座位で実施でき患部への荷重ストレスはほぼゼロです。2〜3分連続して行うと適度な筋疲労が得られます。" },
        { title: "等尺性内返し・外返し",    sets: "10秒 × 10回",  note: "固定壁に足を押し当てる形で実施", details: "固定した壁や床に足の内側・外側を押し当て、足関節を動かさずに力を入れ続けます。内返し（内反）・外返し（外反）の両方向を実施します。関節を動かさないため靱帯への負荷が最小限で筋力を維持できます。片方向10秒 × 10回を両方向行います。" },
        { title: "上半身・体幹トレーニング", sets: "各2〜3セット", note: "足を使わず全身コンディション維持", details: "足首を固定したまま実施できる上半身・体幹トレーニングで全身状態を維持します。\n\n【自重】\n・プッシュアップ（腕立て伏せ）× 10〜15回\n・クランチ（腹筋）× 20回\n・プランク 30秒〜1分\n・バックエクステンション × 15回\n\n【ダンベル（5〜10kg目安）】\n・ダンベルベンチプレス × 10回\n・ダンベルカール × 10回\n・サイドレイズ × 12回\n・ダンベルロウ × 12回\n\n【チューブ】\n・チューブローイング × 15回\n・チューブプルダウン × 15回\n・チューブプレス × 15回\n\n※ 座位・仰臥位で実施できる種目を優先し、患部に体重をかけないよう注意してください。" },
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
      ngList: ["ホップ・ジャンプ","方向転換・カット","コンタクトプレー","裸足での高負荷運動"],
      rehabMenu: [
        { title: "バランスボード訓練",   sets: "30秒 × 3",   note: "両脚→片脚。目閉で難易度UP", details: "バランスボードや不安定板の上に立ち、バランスをとります。最初は両脚で始め、慣れたら患脚単独に移行します。目を開けて安定したら目を閉じて難易度を上げます。足関節捻挫後の再発率が高い主な原因は固有感覚（プロプリオセプション）の低下です。バランス訓練は固有感覚回路の再構築に不可欠です。" },
        { title: "カーフレイズ",         sets: "15回 × 3",   note: "両脚→患脚片脚へ移行", details: "立位で踵を持ち上げるふくらはぎの強化運動です。最初は両脚で行い、疼痛がなければ患脚単独へ移行します。ゆっくり（2秒上げ→1秒保持→3秒おろす）を意識してください。おろす動作（離心性収縮）も重要です。片脚カーフレイズができるようになることがホップ動作への重要な前段階です。" },
        { title: "チューブ内返し・外返し", sets: "15回 × 3", note: "中等度の抵抗。ゆっくりと", details: "チューブを足部に引っ掛け、内反・外反方向に抵抗をかけながら動かします。特に外返し（外反）運動は前距腓靱帯（外側靱帯）の機能を担う腓骨筋を強化します。ゆっくりとした動作で筋力を均等に強化してください。疼痛が出たらフォームと強度を見直します。" },
        { title: "水中ウォーキング",     sets: "15〜20分",   note: "膝丈程度の水深。正常歩行パターン意識", details: "膝丈程度の水深で正常歩行パターンを意識して歩きます。水の浮力で体重負荷が軽減されるため疼痛が少ない状態で正常な歩行パターンを再学習できます。水の粘性が適度な抵抗になり下肢筋力のトレーニング効果もあります。" },
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
      ngList: ["急激な切り返し・カット（高速）","フルスプリント","コンタクトプレー"],
      rehabMenu: [
        { title: "ジョグ→ランニング（段階的）",   sets: "10〜20分",   note: "毎回疼痛確認。翌日腫脹チェック", details: "直線でゆっくりジョグから始めます。毎回開始時に疼痛の有無を確認し翌日に腫脹・疼痛増悪がなければ次回少し距離・速度を上げます。10分→15分→20分と段階的に延長します。コンクリートより芝・土のトラックを推奨します。テーピング・サポーター着用で実施してください。" },
        { title: "片脚スクワット",                sets: "10回 × 3",   note: "臀部の沈み込みに注意", details: "患脚単独でのスクワットです。臀部を水平に保ち膝が内側に入らないよう（ニーイン防止）注意してください。鏡の前で実施すると自己確認しやすいです。バランスと患肢の筋力を同時に評価できる運動です。安定してできれば方向転換ドリルへの移行サインとなります。" },
        { title: "T字ドリル（低速）",             sets: "× 5本",      note: "前後・左右の方向転換訓練", details: "コーン4本をT字型に配置し前後左右に移動するアジリティドリルです。最初は低速・正確なフォームで行います。前進→横移動（左右）→後退の順に動作します。足首への側方ストレスを段階的に加えることが目的で、方向転換時の足首安定性を評価できます。" },
        { title: "バランスディスク片脚立ち（動的）", sets: "30秒 × 3", note: "ボールキャッチを加えて難易度UP可", details: "バランスディスクやバランスパッドの上で片脚立ちをします。静止するだけでなく、ボールキャッチや上肢の動きを加えると動的な固有感覚訓練になります。実際の競技では静止することはないため、動きながらバランスを保つ練習が重要です。" },
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
      okList: ["フルスプリント（段階的に100%へ）","全方向のアジリティドリル","チーム練習への大部分参加","コンタクト練習（段階的）"],
      ngList: ["医師・トレーナー許可なしの試合出場"],
      rehabMenu: [
        { title: "スプリント（80→90→100%）",   sets: "× 6〜10本",  note: "疼痛確認しながら出力上げる", details: "3段階で出力を上げます。1段階ずつ3日間問題がなければ次の強度へ進みます。全力スプリントは足関節への衝撃が最も大きいため段階的移行が必要です。テーピングまたはサポーターを着用した状態で行ってください。" },
        { title: "競技特異的アジリティドリル",  sets: "10〜15分",   note: "サッカー：ドリブル変則、バスケ：ピック＆ロール等", details: "各スポーツの実際の動作パターンを取り入れます。サッカーならドリブルでの急ターン、バスケットボールならピック&ロールの動きなど。試合と同等の強度・速度まで段階的に引き上げます。疼痛なく実施できれば試合復帰の準備が整っています。" },
        { title: "ジャンプ着地訓練",           sets: "3回 × 5セット", note: "着地時の膝・足首アライメント確認", details: "両脚ジャンプ後の着地時に、膝・足首のアライメント（ニーイン・足首内反）が崩れないよう意識します。着地は「静かに」（音を抑えて）行います。最初は低い高さからのジャンプ着地から始め、慣れたらボックスジャンプへ移行します。再受傷の多くはジャンプ着地・急停止時に起きることが知られています。" },
      ],
      timeline: [
        { week: "2〜4週",  goal: "スプリント可",   activity: "競技特異的ドリル" },
        { week: "4週〜",   goal: "完全復帰",       activity: "試合出場" },
      ],
      alert: "半数の足関節捻挫が慢性化します。サポーター・テーピングをシーズン中も継続してください。",
    },
    {
      summary: `全テストクリア。競技復帰が可能な状態です。再受傷予防として活動時のサポーター着用と予防訓練を継続してください。`,
      okList: ["全ての競技活動・試合への参加","全方向の動作・コンタクト","予防トレーニングの継続"],
      ngList: ["予防的サポーター・テーピングの中止（３ヶ月間は継続推奨）"],
      rehabMenu: [
        { title: "カーフレイズ・バランス訓練（維持）", sets: "週3回",        note: "再受傷予防プログラムとして継続", details: "週3回のカーフレイズ（片脚15回 × 3）とバランスボード訓練（片脚30秒 × 3）が標準的な維持プログラムです。10分程度で実施できるため、練習前のウォームアップに組み込むと継続しやすいです。足関節捻挫後1年以内の再受傷率は約40%と報告されているため予防継続は重要です。" },
        { title: "動的ウォームアップ",                sets: "練習前10分",   note: "足関節の動的可動域訓練を含む", details: "足首のサークル（円を描くように回す）・カーフレイズ・ランジ・レッグスイングなどの動的ストレッチで足関節周囲を温めます。静的ストレッチは練習前の実施で筋力が一時低下することが知られているため、動的ウォームアップが推奨されます。" },
        { title: "活動後アイシング（必要時）",         sets: "練習後15〜20分", note: "腫脹・熱感があれば実施", details: "練習後に腫脹・熱感・疼痛を感じた場合に実施します。完全復帰後でも足首の違和感を無視せずケアをする習慣を維持してください。症状が2〜3日以上続く場合は担当医・トレーナーに相談してください。" },
      ],
      timeline: [
        { week: "復帰後",    goal: "再受傷予防",       activity: "サポーター着用・予防訓練継続" },
        { week: "1年以内",   goal: "慢性化予防",       activity: "固有感覚・筋力トレーニング継続" },
      ],
      alert: "足関節捻挫の慢性不安定性は将来の変形性関節症リスクを高めます。完全復帰後も予防継続を。",
    },
  ];

  // ── アメリカンフットボール特化コンテンツ（足関節捻挫）──
  const isAF_ankle = p.sport === "american_football";
  if (isAF_ankle) {
    const pos = (p.position ?? "").toUpperCase();
    const isWR_a  = pos.includes("WR");
    const isRB_a  = pos.includes("RB");
    const isLB_a  = pos.includes("LB");
    const isDB_a  = pos.includes("DB");
    const isOLDL  = pos.includes("OL") || pos.includes("DL");
    const isQB_a  = pos.includes("QB");
    const isKP_a  = pos.includes("K/P");

    const afPartCard: RehabMenuItem = {
      title: "🏈 練習参加レベルガイド（アメフト）",
      sets: "段階的に引き上げ",
      note: "Lv.0（リハのみ）→ Lv.6（ゲーム出場）で管理",
      details:
        "🔴 Lv.0：リハビリのみ（グラウンド不参加）\n" +
        "🟠 Lv.1：チームウォームアップのみ参加\n" +
        "🟡 Lv.2：個人ドリル（ポジション別・Rep制限あり）\n" +
        "🟢 Lv.3：7 on 7（ノーコンタクト）\n" +
        "🔵 Lv.4：フルプラクティス（コンタクト制限あり）\n" +
        "🟣 Lv.5：スクリメージ（フルコンタクト）\n" +
        "⚫ Lv.6：ゲーム出場\n\n" +
        "スパイク（cleats）着用時は足首への側方ストレスが増大するため、\n" +
        "テーピング着用を全活動で徹底すること。",
    };

    // Phase 2（idx=1・亜急性期）：Lv.0→1、サポーター強調
    data[1].okList.push("テーピング・ブレース：スパイク移行前にサポーターの種類を確認");
    data[1].rehabMenu.unshift({ ...afPartCard });

    // Phase 3（idx=2・機能回復期）：Lv.1→2、スパイク移行・カット開始
    data[2].okList.push("練習参加レベル目標：Lv.1（ウォームアップ）→ Lv.2（個人ドリル）");
    data[2].okList.push("スパイク移行：直線ジョグで疼痛なければスパイク着用ドリルへ");
    data[2].rehabMenu.unshift({ ...afPartCard });

    if (isWR_a || isDB_a) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのカットパターン（低速）",
        sets: "× 5〜8本",
        note: "45°→90°カット順／ルートはショート→ミドル→ロングと距離を伸ばす。疼痛・不安定感が出たら即中止",
        details:
          "スパイクのグリップが足首に与える側方ストレスを確認しながら、低速のカットから再開します。\n\n" +
          "【開始順序】\n" +
          "1. スパイク着用での直線ジョグ\n" +
          "2. 45°カット（低速）\n" +
          "3. 90°カット（低速）\n" +
          "4. ルートランニング（低速・段階的に距離を延長）\n" +
          "　 ショート（〜5yd：ヒッチ・スラント）\n" +
          "　 → ミドル（10yd前後：イン・カール）\n" +
          "　 → ロング（15yd以上：ポスト・コーナー・フライ）\n\n" +
          "各距離で疼痛・不安定感がなければ次の距離へ進みます。\n" +
          "スパイクはトレーナーより足首の回転ストレスが増大します。\n" +
          "違和感・不安定感があればテーピングの巻き直し・強化を検討。テーピング着用必須。",
      });
    } else if (isRB_a) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのバックフィールドルーティン（直線のみ）",
        sets: "5〜8本",
        note: "ハンドオフ→直線走のみ。横走り（スウィープ）は次フェーズ",
        details:
          "スパイク着用で直線ベースのRBドリルから再開します。\n\n" +
          "【開始順序】\n" +
          "1. スパイク直線ジョグ\n" +
          "2. ハンドオフ受け取り→直線走\n" +
          "3. ドロープレー（方向転換なし）全速\n\n" +
          "スウィープなど横への急加速は足首への側方ストレスが大きいため次フェーズまで禁止。\n" +
          "テーピング＋サポーター着用を推奨。",
      });
    } else if (isLB_a) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのカバレッジドロップ",
        sets: "5〜10分",
        note: "バックペダル・シャッフル。スパイクでのグリップ感を確認",
        details:
          "スパイクを着用してカバレッジ動作を再開します。\n\n" +
          "【開始順序】\n" +
          "1. スパイク着用での直線走\n" +
          "2. バックペダル（後退走）\n" +
          "3. シャッフルステップ（横移動）\n" +
          "4. ゾーン移動ドリル\n\n" +
          "シャッフル時に足首が外へ崩れる感覚がないか確認。\n" +
          "疼痛・不安定感があれば即中止しテーピングを強化。",
      });
    } else if (isOLDL) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのスタンス・ステップワーク",
        sets: "10〜15分",
        note: "広いスタンスでの足首安定性確認。ラテラルステップから",
        details:
          "OL/DLは広いスタンスで足首に大きな偏荷重がかかります。\n\n" +
          "【確認事項】\n" +
          "・スタンス幅（肩幅より広め）での両脚安定\n" +
          "・ラテラルステップ（横への1〜2歩）\n" +
          "・パスラッシュ/パスブロックのフットワーク（ハーフスピード）\n\n" +
          "ドライブブロック時の踏ん張りポジションでの安定性を重点確認。",
      });
    } else if (isQB_a) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのQBフットワーク（ポケット内）＋単純パス7 on 7",
        sets: "5〜10分",
        note: "ドロップバック・ポケット内シャッフル確認。単純ドロップバックパスのみ7 on 7参加可（ロール・スクランブルは次フェーズ）",
        details:
          "スパイクを着用してQBの基本フットワークを再開します。\n\n" +
          "【開始順序】\n" +
          "1. スパイク着用での直線ジョグ（足首グリップ感の確認）\n" +
          "2. 3ステップドロップ → 左右シャッフル（ポケット内移動）\n" +
          "3. 5・7ステップドロップ（後退動作での足首安定性確認）\n" +
          "4. クイックアウトステップ（ポケットを出る動作の入口のみ）\n\n" +
          "【7 on 7参加について】\n" +
          "ポケット内からの単純なドロップバックパスのみであれば、この段階から7 on 7に参加可能です。\n" +
          "ポケット外への動き（ブートレッグ・ロールアウト・スクランブル）を伴うプレーは次フェーズまで禁止。\n" +
          "ドロップ時の踏み込みで足首に不安感がないか確認。テーピング必須。",
      });
    } else if (isKP_a) {
      data[2].rehabMenu.push({
        title: "スパイク着用でのキック短縮アプローチ（1〜2ステップ）",
        sets: "5〜8本",
        note: "プラント足への踏み込みストレス確認。フルアプローチは次フェーズ",
        details:
          "キッカー・パンターのプラント足には受傷機転と同じ外反ストレスがかかります。\n\n" +
          "【開始順序】\n" +
          "1. スパイク着用での直線走（足首グリップ感の確認）\n" +
          "2. 1ステップアプローチ → プラント動作のみ（キックなし）\n" +
          "3. 2ステップアプローチ → 軽いキック動作（50%以下の出力）\n\n" +
          "プラント着地時に足首が外側へ崩れる感覚・疼痛があれば即中止。\n" +
          "フルアプローチ（3〜4ステップ）・フルスウィングは次フェーズ。\n" +
          "テーピング着用必須。",
      });
    }

    // Phase 4（idx=3・スポーツ準備期）：Lv.2→3、全速ドリル・7 on 7
    data[3].okList.push("練習参加レベル目標：Lv.3（7 on 7）参加可");
    data[3].rehabMenu.unshift({ ...afPartCard });

    const afAgilIdx = data[3].rehabMenu.findIndex(m => m.title.includes("競技特異的アジリティ"));

    if (isWR_a || isDB_a) {
      const wrItem: RehabMenuItem = {
        title: "ルートランニング全速・全ルート段階的解禁",
        sets: "1シリーズ5〜8本",
        note: "短→中→長ルートの順。テーピング着用必須",
        details:
          "ハムストリングス同様のルート進行で全速確認します。\n\n" +
          "【解禁順序】\n" +
          "ヒッチ・スラント（5yd以内）→ in/dig・カール（10yd）\n" +
          "→ ポスト・コーナー・フライ（15yd以上）\n\n" +
          "7 on 7参加後も足首増悪なければ\n" +
          "フルプラクティス → スクリメージ → ゲーム出場へ。\n" +
          "テーピングはシーズン中全活動で継続を強く推奨。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = wrItem;
      else data[3].rehabMenu.push(wrItem);
    } else if (isRB_a) {
      const rbItem: RehabMenuItem = {
        title: "全ランプレー全速・7 on 7参加",
        sets: "1シリーズ5〜8本",
        note: "スウィープ・多重カット・RAC急停止。7 on 7参加可",
        details:
          "全速でのランプレーを確認し、7 on 7後にコンタクトへ移行。\n\n" +
          "【確認動作】\n" +
          "・スウィープ全速\n" +
          "・多重カットバック\n" +
          "・ランアフターキャッチ（RAC）急停止\n\n" +
          "7 on 7参加後に増悪なければコンタクト段階的復帰へ。\n" +
          "テーピング継続。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = rbItem;
      else data[3].rehabMenu.push(rbItem);
    } else if (isLB_a) {
      const lbItem: RehabMenuItem = {
        title: "追走・ブリッツ全速確認・ダミータックル",
        sets: "5〜8本",
        note: "最大加速ブリッツ→急停止→ダミーへのタックル。7 on 7参加可",
        details:
          "全速ブリッツとタックル準備動作を確認します。\n\n" +
          "【確認動作】\n" +
          "・最大加速ブリッツ→急停止\n" +
          "・追走→引き剥がし動作\n" +
          "・ダミーへのタックル（着地ストレス確認）\n\n" +
          "7 on 7参加後に増悪なければ対人タックルへ進む。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = lbItem;
      else data[3].rehabMenu.push(lbItem);
    } else if (isOLDL) {
      const olItem: RehabMenuItem = {
        title: "ブロッキングドリル全速→シールドパッドコンタクト",
        sets: "5〜10本",
        note: "ドライブブロックの足踏み全速→パッドへのコンタクト",
        details:
          "ブロッキングの踏み込みと接触を段階的に加えます。\n\n" +
          "【段階】\n" +
          "1. ドライブブロックの足踏み（全速）\n" +
          "2. バッグへのパスラッシュ（DL）/ パスブロック（OL）\n" +
          "3. シールドパッドへのコンタクト（コントロールド）\n\n" +
          "OL/DLはスプリントより駆動方向のストレスが高い。\n" +
          "ドライブブロック時の踏ん張りでの安定性を特に確認。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = olItem;
      else data[3].rehabMenu.push(olItem);
    } else if (isQB_a) {
      const qbItem: RehabMenuItem = {
        title: "ロールアウト・スクランブルドリル",
        sets: "5〜8本",
        note: "ブートレッグ→ロールアウト→スクランブル。7 on 7参加可",
        details:
          "ポケット外への動きを解禁し、7 on 7参加へ移行します。\n\n" +
          "【確認動作】\n" +
          "・ブートレッグ（サイドへの全速走）\n" +
          "・ロールアウト（走りながらスロー・体重移動の安定確認）\n" +
          "・スクランブル（方向転換 → 加速 → スライディング着地）\n\n" +
          "スライディング着地での足首衝撃に疼痛・不安感がなければ7 on 7参加可。\n" +
          "7 on 7後に増悪なければフルプラクティスへ。テーピング継続。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = qbItem;
      else data[3].rehabMenu.push(qbItem);
    } else if (isKP_a) {
      const kpItem: RehabMenuItem = {
        title: "フルアプローチ・フルスウィング段階的解禁",
        sets: "5〜8本",
        note: "3〜4ステップフルアプローチ→フルスウィング。プラント足の安定性最終確認",
        details:
          "フルアプローチとフルスウィングを段階的に解禁します。\n\n" +
          "【段階】\n" +
          "1. 3ステップアプローチ → 70%スウィング（3本）\n" +
          "2. フルアプローチ → 90%スウィング（3本）\n" +
          "3. フルアプローチ → フルスウィング（目標本数まで確認）\n\n" +
          "プラント着地とフォロースルー完了後の足首に疼痛・不安感がないか確認。\n" +
          "スペシャルチームドリルへの7 on 7参加はこの段階から可。\n" +
          "テーピング継続。",
      };
      if (afAgilIdx >= 0) data[3].rehabMenu[afAgilIdx] = kpItem;
      else data[3].rehabMenu.push(kpItem);
    }

    // Phase 5（idx=4・競技復帰期）：Lv.5→6、テーピング継続指導
    data[4].okList.push("練習参加レベル：Lv.5（スクリメージ）→ Lv.6（ゲーム出場）");
    data[4].rehabMenu.push({
      title: "スパイク着用テーピング・シーズン中継続",
      sets: "全練習・試合で着用",
      note: "アメフトのスパイクは足首回転ストレスが特に高い。３ヶ月以上継続推奨",
      details:
        "足関節捻挫後の再受傷率はスポーツ活動中最大40%と報告されています。\n" +
        "スパイクのグリップは地面への固定力が高く、方向転換時の足首への\n" +
        "回転ストレスが他のフットウェアより顕著に大きくなります。\n\n" +
        "【推奨】\n" +
        "・試合：ATテーピング（最優先）\n" +
        "・練習：Aircast等のブレースまたはテーピング\n\n" +
        "シーズン終了まで全活動でのサポートを継続してください。",
    });
  }

  // ── ラクロス特化コンテンツ（足関節捻挫）──
  const isLacrosse_ankle = p.sport === "lacrosse";
  if (isLacrosse_ankle) {
    const pos = (p.position ?? "").toUpperCase();
    const isAT  = pos.includes("AT");
    const isMF  = pos.includes("MF");
    const isDF  = pos.includes("DF");
    const isGK  = pos.includes("GK");

    const laxPartCard: RehabMenuItem = {
      title: "🥍 練習参加レベルガイド（ラクロス）",
      sets: "段階的に引き上げ",
      note: "Lv.0（リハのみ）→ Lv.6（ゲーム出場）で管理",
      details:
        "🔴 Lv.0：リハビリのみ（グラウンド不参加）\n" +
        "🟠 Lv.1：チームウォームアップのみ参加\n" +
        "🟡 Lv.2：個人ドリル（パス・キャッチ・シュート／ポジション別・Rep制限）\n" +
        "🟢 Lv.3：ハーフフィールド／シューティングドリル（ノーコンタクト）\n" +
        "🔵 Lv.4：フルプラクティス（ボディチェック・スティックチェック制限あり）\n" +
        "🟣 Lv.5：スクリメージ（フルコンタクト）\n" +
        "⚫ Lv.6：ゲーム出場\n\n" +
        "ラクロスはターフ・芝でクリート（スパイク）を着用するため、方向転換・ドッジ時の\n" +
        "足首への側方・回転ストレスが大きい。全活動でテーピング／ブレース着用を徹底すること。",
    };

    // Phase 2（idx=1・亜急性期）：Lv.0→1
    data[1].okList.push("テーピング・ブレース：クリート移行前にサポーターの種類を確認");
    data[1].rehabMenu.unshift({ ...laxPartCard });

    // Phase 3（idx=2・機能回復期）：Lv.1→2、クリート移行・低速ドリル
    data[2].okList.push("練習参加レベル目標：Lv.1（ウォームアップ）→ Lv.2（個人ドリル）");
    data[2].okList.push("クリート移行：直線ジョグで疼痛なければクリート着用ドリルへ");
    data[2].rehabMenu.unshift({ ...laxPartCard });

    if (isAT) {
      data[2].rehabMenu.push({
        title: "クリート着用での低速ドッジ・クリース周りカット", sets: "× 5〜8本",
        note: "スプリット/ロールドッジを低速から。タイトカットは段階的に",
        details:
          "アタックはクリース（ゴール前）周りでの急なドッジ・タイトカットが多く、足首に側方ストレスがかかります。\n\n" +
          "【開始順序】\n1. クリート着用での直線ジョグ\n2. 低速スプリットドッジ（左右）\n3. 低速ロールドッジ\n4. クリース周りの小さなカット（低速）\n\n" +
          "全速ドッジ・急カットは次フェーズ。疼痛・不安定感が出たら即中止。テーピング着用必須。",
      });
    } else if (isMF) {
      data[2].rehabMenu.push({
        title: "クリート着用でのトランジション走＋低速ドッジ", sets: "5〜8本",
        note: "直線トランジションから。ドッジは低速。【FOGO補足あり】",
        details:
          "ミッドフィールダーはフルフィールドのトランジション走と両エンドでのドッジが要求されます。\n\n" +
          "【開始順序】\n1. クリート着用での直線トランジション走\n2. 低速スプリット/ロールドッジ\n3. 緩やかな方向転換\n\n" +
          "【フェイスオフ担当（FOGO）の補足】\n地上スクランブル・クランプ姿勢・ラテラルへの爆発は足首に特殊な負荷をかけるため、この段階では低速での姿勢確認にとどめ、全速のクランプ・ラテラル爆発は次フェーズで。\n\n" +
          "テーピング着用必須。疼痛・不安定感が出たら即中止。",
      });
    } else if (isDF) {
      data[2].rehabMenu.push({
        title: "クリート着用でのバックペダル・ディフェンシブスライド（低速）", sets: "5〜10分",
        note: "後退・横移動のフットワーク。スライド時の足首安定性確認",
        details:
          "ディフェンスはバックペダルとスライド（横移動）でのフットワークが中心です。\n\n" +
          "【開始順序】\n1. クリート着用での直線走\n2. バックペダル（後退走）\n3. ディフェンシブスライド（横移動）\n4. アプローチ→ブレイクダウン姿勢（低速）\n\n" +
          "スライド時に足首が外へ崩れる感覚がないか確認。全速アプローチは次フェーズ。テーピング着用必須。",
      });
    } else if (isGK) {
      data[2].rehabMenu.push({
        title: "クリート着用でのラテラルシャッフル・アーク移動（低速）", sets: "5〜10分",
        note: "ゴーリーの側方・反応動作。プッシュオフの足首安定性確認",
        details:
          "ゴーリーは走行は少ないものの、ラテラルシャッフルとアーク（ゴール前の弧）移動、プッシュオフでの反応動作が中心です。\n\n" +
          "【開始順序】\n1. クリート着用での足踏み・グリップ感確認\n2. ラテラルシャッフル（低速）\n3. アーク移動（低速）\n4. セットポジションからの軽いプッシュオフ\n\n" +
          "プッシュオフ・着地で足首に不安感がないか確認。全速・全反応は次フェーズ。テーピング着用必須。",
      });
    }

    // Phase 4（idx=3・スポーツ準備期）：Lv.2→3、全速ドリル
    data[3].okList.push("練習参加レベル目標：Lv.3（ハーフフィールド/シューティング）参加可");
    data[3].rehabMenu.unshift({ ...laxPartCard });

    const laxAgilIdx = data[3].rehabMenu.findIndex(m => m.title.includes("競技特異的アジリティ"));
    let laxItem: RehabMenuItem;
    if (isAT) {
      laxItem = {
        title: "全速ドッジ・急カット・シュートのプラント足", sets: "1シリーズ5〜8本",
        note: "全速スプリット/ロールドッジ→クリース急カット→シュート踏み込み",
        details:
          "全速でのドッジとシュート動作を確認します。\n\n【確認動作】\n・全速スプリット/ロールドッジ\n・クリース周りの急カット（鋭角）\n・シュートのプラント足（踏み込み足）への荷重・ひねり\n\nハーフフィールド/シューティング参加可。増悪なければフルプラクティス→スクリメージへ。テーピング継続。",
      };
    } else if (isMF) {
      laxItem = {
        title: "全速トランジション・全速ドッジ（＋FOGO補足）", sets: "1シリーズ5〜8本",
        note: "全速トランジション→全速ドッジ。FOGOはクランプ・ラテラル爆発を確認",
        details:
          "全速のトランジション走とドッジを確認します。\n\n【確認動作】\n・全速トランジション（攻→守の切り返し）\n・全速スプリット/ロールドッジ\n・両エンドでの連続走\n\n【フェイスオフ担当（FOGO）の補足】\n地上スクランブル・クランプ姿勢からのラテラル爆発・立ち上がりでの足首荷重を全速で確認します。クランプ時の足首のひねりに不安感がないこと。\n\nテーピング継続。",
      };
    } else if (isDF) {
      laxItem = {
        title: "全速アプローチ・スライド・追走", sets: "5〜8本",
        note: "全速アプローチ→ブレイクダウン→スライド→追走の連続",
        details:
          "全速のディフェンス動作を確認します。\n\n【確認動作】\n・全速アプローチ→急停止（ブレイクダウン）\n・ディフェンシブスライド（全速横移動）\n・ドッジャーへの追走→引き剥がし\n\n増悪なければフルプラクティス→スクリメージへ。テーピング継続。",
      };
    } else if (isGK) {
      laxItem = {
        title: "全速アーク移動・プッシュオフ・セービング後リカバリー", sets: "5〜10分",
        note: "全速の側方・反応動作とセーブ後の素早い体勢回復",
        details:
          "全速のゴーリー動作を確認します。\n\n【確認動作】\n・全速ラテラルシャッフル・アーク移動\n・シュートへのプッシュオフ（左右）\n・セービング後のリカバリー（こぼれ球への素早い踏み出し）\n\nプッシュオフ・着地・急な踏み出しでの足首に不安感がないこと。テーピング継続。",
      };
    } else {
      laxItem = {
        title: "全速ドッジ・方向転換・競技特異的アジリティ", sets: "1シリーズ5〜8本",
        note: "全速の方向転換とラクロス動作を段階的に",
        details: "全速でのドッジ・方向転換・トランジションを確認します。増悪なければフルプラクティス→スクリメージへ。テーピング継続。",
      };
    }
    if (laxAgilIdx >= 0) data[3].rehabMenu[laxAgilIdx] = laxItem;
    else data[3].rehabMenu.push(laxItem);

    // Phase 5（idx=4・競技復帰期）：Lv.5→6、テーピング継続
    data[4].okList.push("練習参加レベル：Lv.5（スクリメージ）→ Lv.6（ゲーム出場）");
    data[4].rehabMenu.push({
      title: "クリート着用テーピング・シーズン中継続", sets: "全練習・試合で着用",
      note: "ターフ/芝のクリートは足首回転ストレスが高い。３ヶ月以上継続推奨",
      details:
        "足関節捻挫後の再受傷率はスポーツ活動中最大40%と報告されています。\n" +
        "ラクロスはクリートでのドッジ・方向転換が多く、方向転換時の足首への回転ストレスが\n" +
        "他のフットウェアより大きくなります。\n\n【推奨】\n・試合：ATテーピング（最優先）\n・練習：Aircast等のブレースまたはテーピング\n\nシーズン終了まで全活動でのサポートを継続してください。",
    });
  }

  // ── サッカー特化（足関節捻挫）：主にGKを特異化 ──
  const isSoccer_ankle = p.sport === "soccer";
  if (isSoccer_ankle) {
    const pos = (p.position ?? "").toUpperCase();
    if (pos.includes("GK")) {
      data[2].rehabMenu.push({
        title: "クリート着用でのGK基本フットワーク（低速）", sets: "5〜10分",
        note: "ラテラルシャッフル・前後ステップ・構え→踏み出し（低速）",
        details:
          "ゴールキーパーは走行・スプリントよりも、横移動・前後ステップ・セービングへの踏み出し・着地が中心です。\n\n" +
          "【開始順序】\n1. クリート着用での足踏み・グリップ感確認\n2. ラテラルシャッフル（低速）\n3. 前後ステップ・構え（セットポジション）\n4. 構え→低速の踏み出し（ボールへのアプローチ）\n\n" +
          "踏み出し・着地で足首に不安感がないか確認。全速ダイビング・プッシュオフは次フェーズ。テーピング/ブレース着用必須。",
      });
    }
  }

  // ── GK共通：早期復帰の方針（足関節への走行・カット負荷が小さい）──
  // ※ サッカー・ラクロスなどGKを持つ競技に適用。テーピング/ブレース着用が前提。
  const isGK_ankle = (p.position ?? "").toUpperCase().includes("GK")
    && (p.sport === "soccer" || p.sport === "lacrosse");
  if (isGK_ankle) {
    if (p.sport === "soccer") {
      data[3].rehabMenu.push({
        title: "全速のダイビング・プッシュオフ・クロス対応（GK）", sets: "5〜10本",
        note: "横っ飛びプッシュオフ・着地・素早い立ち上がり・ステップ",
        details:
          "全速のゴーリー動作を確認します。\n\n【確認動作】\n・左右への横っ飛び（ダイビング）プッシュオフ\n・着地→こぼれ球への素早い立ち上がり・踏み出し\n・クロス対応のステップ＆ジャンプ着地\n\nプッシュオフ・着地・急な踏み出しでの足首に不安感がないこと。テーピング/ブレース継続。",
      });
    }
    const gkEarly = "【GK】フィールドプレーヤーより足関節への走行・スプリント・カット負荷が小さいため、テーピング/ブレースを着用した上で早期の段階的復帰が可能（荷重・バランス・側方/プッシュオフ動作が無痛であることが前提。直線フルスプリント・急カットの完全クリアは必須としない）。再受傷予防のためサポートは継続。";
    data[2].okList.push(gkEarly);
    data[3].okList.push(gkEarly);
    data[4].okList.push(gkEarly);
  }

  const d = data[idx];

  const progressNote =
    `🔄 評価テストの再実施タイミング\n` +
    `現在のフェーズ：${phases[idx]}（${idx + 1} / ${5}）\n\n` +
    `3日ごとにこのページを開いて機能評価テストを再実施してください。\n` +
    `症状が改善した項目から「可」に更新すると、自動的に次フェーズへ進みます。\n\n` +
    (idx === 0
      ? `次フェーズへの条件：「荷重痛なし」「ROM正常」の2項目をクリア`
      : idx === 1
      ? `次フェーズへの条件：「ホップ可」をクリア`
      : idx === 2
      ? `次フェーズへの条件：「方向転換可」をクリア`
      : idx === 3
      ? `次フェーズへの条件：「スプリント可」をクリア`
      : `全テストクリア済みです。`);

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
    showOttawaRule: true,
    progressNote,
    clinicalGuidance:
      "■ 復帰基準（Ankle-GO）※全スポーツ共通\n" +
      "・足関節捻挫の競技復帰は Ankle-GO（筋力・バランス・ホップ等を統合した機能テストバッテリー）の全項目クリアを目安とします。\n" +
      "・主な要素：患側の筋力・可動域、片脚バランス（静的・動的）、片脚ホップ（距離・側方・連続）、方向転換、直線フルスプリント。いずれも患側が健側と同等（左右差なし）で無痛であること。\n" +
      "・暦の週数ではなく、これらの機能基準のクリアで段階を進めます。\n" +
      "■ 再受傷予防\n" +
      "・足関節捻挫後の再受傷率は活動中最大約40%。復帰後もサポーター/テーピングと固有感覚・腓骨筋トレーニングの継続を推奨（最低3ヶ月）。",
  };
}

// --- Concussion GRTP ---

function concussionPlan(p: GeneratePlanParams): RehabPlan {
  // GRTP：各フェーズの「前フェーズをクリアできたか」で現在地を決定する。
  // 最初に未クリア（不可／医師未許可）のフェーズが現在のフェーズ。すべてクリアでPhase 6（試合復帰）。
  const okPhase1 = t(p.tests, "okPhase1");
  const okPhase2 = t(p.tests, "okPhase2");
  const okPhase3 = t(p.tests, "okPhase3");
  const okPhase4 = t(p.tests, "okPhase4");
  const okPhase5 = t(p.tests, "okPhase5");

  let idx = 0;
  if      (!okPhase1) idx = 0;
  else if (!okPhase2) idx = 1;
  else if (!okPhase3) idx = 2;
  else if (!okPhase4) idx = 3;
  else if (!okPhase5) idx = 4;
  else                idx = 5;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      // GRTP Phase 1（目安：受傷後最低24時間、非管理は最低14日間）
      summary: "頭痛が残っています。心身の完全な休養が必要です（GRTP Phase 1）。医師管理下であれば最低24時間、医師管理外の場合は受傷後最低14日間はいかなる活動も禁止です。無症状になることが次フェーズへの条件です。",
      okList: ["完全安静・心身の休養","疼痛コントロール（アセトアミノフェン等）","暗室・静音環境での休息","症状が増悪しない範囲での短時間歩行（可能なら）"],
      ngList: ["スポーツ活動・体育参加（非管理の場合は14日間禁止）","スクリーン（スマホ・PC・TV）の長時間使用","学業・集中を要する作業","騒がしい環境","コンタクトプレー"],
      rehabMenu: [
        { title: "認知的安静",       sets: "1日中",   note: "スクリーンタイムを最小化。読書・勉強も制限", details: "スクリーンタイム（スマホ・PC・テレビ）を最小化します。明るい光やスクリーンは脳震盪後の頭痛・光過敏を悪化させます。読書・宿題・集中を要する作業も脳の代謝的回復を妨げるため制限します。暗く静かな環境での休息が脳の回復を最も促進します。完全な暗闇での安静は必ずしも必要なく、症状が増悪しない程度の活動は許可されます。" },
        { title: "症状日記記録",     sets: "1日3回",  note: "頭痛・めまい・霧感を0〜10でスコアリング", details: "頭痛・めまい・霧感（ブレインフォグ）・光過敏・音過敏・集中困難を0〜10のスコアで記録します。朝・昼・夜の3回記録することで症状の変化パターンを把握します。記録は医師・トレーナーへの経過報告に使えます。スコアが増悪した活動・環境は翌日から避けてください。" },
        { title: "軽度歩行（可能時）", sets: "5〜10分", note: "症状増悪なければ。完全安静は回復を遅らせることも", details: "屋外での軽い散歩が脳震盪後の回復を助ける可能性があります。歩行中に症状が増悪した場合は即中止し安静に戻ります。完全な安静は回復を遅らせることがあるため、症状が悪化しない範囲での軽度活動は許容されます。" },
      ],
      timeline: [
        { week: "症状消失まで",  goal: "完全症状消失（無症状）", activity: "完全安静 → Phase 2へ" },
        { week: "Phase 2〜6",    goal: "段階的復帰",              activity: "各24時間以上・無症状で次フェーズへ" },
      ],
      alert: "【重要】医師管理外の場合、受傷後最低14日間はいかなる活動も禁止です。脳震盪後の「Second Impact Syndrome」は生命の危険があります。症状が残る間は絶対に競技復帰しないでください。",
    },
    {
      // GRTP Phase 2（目安：受傷後48時間）
      summary: "頭痛が消失し、GRTP Phase 2に進んでいます。最大予測心拍数の70%未満でのウォーキング・水泳・固定自転車エルゴを24時間実施し、無症状を確認してから次フェーズへ進みます。レジスタンス・トレーニングはこの段階では禁止です。",
      okList: ["ウォーキング（最大予測心拍数70%未満）","固定した自転車エルゴ（低負荷）","水泳（軽度）","スクリーン利用の段階的解禁（30分単位）","十分な睡眠・規則正しい生活"],
      ngList: ["最大予測心拍数70%以上の運動","レジスタンス・トレーニング（この段階は禁止）","スポーツ特異的動作","コンタクトプレー","症状増悪を無視した無理な継続"],
      rehabMenu: [
        { title: "ウォーキング（軽度有酸素）",  sets: "20〜30分",           note: "最大予測心拍数70%未満。症状増悪なければ継続", details: "最大予測心拍数は「220－年齢」で概算できます（例：20歳なら220−20=200、70%は140拍/分）。この心拍数を超えないよう管理しながらウォーキングを行います。運動中・運動後24時間以内に頭痛・めまい・吐き気が増悪した場合は即中止しPhase 1に戻ってください。24時間無症状であればPhase 3へ進みます。" },
        { title: "固定自転車エルゴ（軽負荷）", sets: "15〜20分",            note: "低抵抗・低速。転倒リスクがなく心拍管理しやすい", details: "固定自転車エルゴは転倒リスクがなく心拍数を安定してコントロールできるため、GRTP Phase 2に適した運動です。低抵抗・ゆっくりしたペースで開始し、最大予測心拍数の70%を超えないよう注意します。レジスタンス・トレーニング（筋力トレーニング）はこの段階では禁止です。" },
        { title: "症状日記記録",              sets: "朝・運動後・就寝前", note: "頭痛・めまい・霧感を0〜10でスコアリング", details: "頭痛・めまい・霧感（ブレインフォグ）・光過敏・音過敏・集中困難を0〜10のスコアで記録します。運動後に症状スコアが増悪した場合は運動強度を下げるサインです。記録は医師・トレーナーへの経過報告にも活用できます。" },
      ],
      timeline: [
        { week: "Phase 2（24時間）", goal: "軽度有酸素で無症状",    activity: "ウォーキング・固定自転車・水泳（HR70%未満）" },
        { week: "Phase 3（移行条件）", goal: "24時間無症状の確認",   activity: "無症状確認後にPhase 3開始" },
      ],
      alert: "運動後24時間以内に頭痛・めまいなどの症状増悪があればPhase 1に戻り完全安静を再開してください。レジスタンス・トレーニングはPhase 4まで禁止です。",
    },
    {
      // GRTP Phase 3（目安：受傷後72時間）
      summary: "軽度有酸素運動で無症状を確認。GRTP Phase 3：スポーツ固有の運動（ランニング・ドリル）を24時間実施します。頭部に衝撃を与える運動は禁止です。24時間無症状であればPhase 4へ進みます。",
      okList: ["ランニング・ドリル（方向転換を含む）","スポーツ固有の動作（ヘディング・タックルなど頭部衝撃なし）","チームとは別メニューでの個別練習","テクニカルスキルの復習"],
      ngList: ["頭部への衝撃を伴う動作（ヘディング・タックル等）","コンタクトプレー","レジスタンス・トレーニング（まだ禁止）","チーム全体練習への参加"],
      rehabMenu: [
        { title: "ランニング・ドリル",        sets: "20〜30分",   note: "方向転換・スプリント含む。頭部衝撃なし", details: "競技コートや練習場でのランニングドリルを実施します。直線走から始め、方向転換・加速減速を含む競技特異的な動作へ移行します。この段階ではまだ頭部への衝撃（ヘディング・タックル等）は絶対に禁止です。毎回前後で症状スコアを確認し、増悪した場合はPhase 2に戻ってください。" },
        { title: "スポーツ固有テクニック（非接触）", sets: "練習参加", note: "シュート・パス・ドリブル等。頭部衝撃ゼロに限定", details: "競技種目のテクニカルスキル（シュート練習・パス・ドリブル等）を実施します。頭部への衝撃を伴わない動作のみに限定してください。チームスタッフに脳震盪の状況を伝え、非接触かつ頭部衝撃ゼロのドリルのみに限定するよう協力を得てください。" },
        { title: "バランス・固有感覚訓練",   sets: "10〜15分",  note: "【自己BESS】3姿勢×20秒で経過確認", details: "片脚立ち・タンデム立位でのバランス訓練を実施します。脳震盪後は小脳・前庭系の機能が一時的に低下しバランス能力が損なわれます。症状増悪がなければ不安定面（バランスボード等）で難易度を上げます。" },
      ],
      timeline: [
        { week: "Phase 3（24時間）", goal: "スポーツ固有運動で無症状", activity: "ランニング・ドリル（頭部衝撃なし）" },
        { week: "Phase 4（移行条件）", goal: "24時間無症状の確認",        activity: "無症状確認後にPhase 4開始" },
      ],
      alert: "ランニングドリル後24時間以内に症状が増悪した場合はPhase 2に戻ること。ヘディング・タックルなど頭部への衝撃は絶対に禁止。",
    },
    {
      // GRTP Phase 4（目安：受傷後96時間）
      summary: "スポーツ固有運動で無症状を確認。GRTP Phase 4：コンタクトなしの練習ドリルに参加します。パス・ドリルなどより複雑な練習へ進み、この段階から段階的にレジスタンス・トレーニングの開始も可能です。24時間無症状でPhase 5（フルコンタクト）へ。",
      okList: ["コンタクトなし練習ドリルへの全参加","パス・ドリルなど複雑な練習","レジスタンス・トレーニングの漸進的開始（Phase 4から解禁）","睡眠衛生の改善"],
      ngList: ["コンタクトプレー","試合出場（医師許可まで）"],
      rehabMenu: [
        { title: "非コンタクト練習ドリル", sets: "チーム練習参加", note: "パス・ドリル等。複雑な練習に進む", details: "チームの練習メニューに参加しますが、コンタクトのないドリルに限定します。例：パス・ドリル、シュート練習、戦術確認など「より複雑な練習」への参加が推奨されます。チームメイト・スタッフへ事前に状況を説明し、偶発的なコンタクトを避けるよう協力を得てください。" },
        { title: "レジスタンス・トレーニング（漸進的開始）", sets: "軽負荷から開始", note: "Phase 4から解禁。軽重量・低強度から段階的に", details: "Phase 4からレジスタンス・トレーニング（筋力トレーニング）が解禁されます。軽負荷・低強度から始め、症状増悪がなければ段階的に負荷を上げます。最初はマシン種目など、頭部への負荷が少ない種目から開始してください。" },
        { title: "睡眠衛生改善",           sets: "毎日",           note: "就寝前スクリーン禁止・就寝時間固定", details: "就寝前1〜2時間はスクリーンを使用しない、就寝・起床時間を毎日一定に保つ、カフェインを控えるなどの睡眠衛生を実践します。脳震盪後の睡眠障害は回復を著しく妨げます。睡眠の質と量の改善が全体的な回復を大きく促進します。" },
      ],
      timeline: [
        { week: "Phase 4（24時間）",  goal: "非コンタクト全ドリルで無症状", activity: "パス・ドリル・レジスタンス開始" },
        { week: "Phase 5（移行条件）", goal: "医師によるコンタクト許可",      activity: "医師許可後にPhase 5開始" },
      ],
      alert: "コンタクト練習（Phase 5）への復帰は必ず医師（スポーツ専門医）の許可を得てから。許可なしのコンタクト参加は絶対に禁止です。",
    },
    {
      // GRTP Phase 5（目安：受傷後96時間以降）— フル・コンタクト練習
      summary: "非コンタクト練習で無症状を確認。GRTP Phase 5：医師の許可を得てフル・コンタクト練習を実施します。24時間無症状であれば最終ステップ Phase 6（試合復帰）へ進みます。",
      okList: ["フル・コンタクト練習（医師許可後）","タックル・コンタクトを含む通常トレーニング","体力・筋力の最終仕上げ"],
      ngList: ["医師許可なしのコンタクト参加（絶対禁止）","試合出場（Phase 6 移行後まで禁止）"],
      rehabMenu: [
        { title: "フル・コンタクト練習", sets: "通常トレーニング参加", note: "医師の許可書を必ず取得してから開始", details: "医師による許可を得た後のみ実施できます。タックル・コンタクトを含む通常練習に参加します。医師の許可書はトレーナー・コーチが保管することを推奨します。練習後24時間以内に症状増悪がなければ機能評価の「コンタクト練習で症状増悪なし」を「可」にしてPhase 6（試合復帰）へ進みます。" },
        { title: "再発予防教育",           sets: "1回",                  note: "選手・保護者・コーチ全員で実施", details: "選手本人・保護者・コーチ向けに脳震盪の症状・対処法・報告義務を教育します。脳震盪を隠して競技継続する文化が最大のリスクです。次の脳震盪はより小さな衝撃で発症しうることを全員が理解する必要があります。ヘッドギアは脳震盪を完全には予防できないことも伝えてください。" },
      ],
      timeline: [
        { week: "Phase 5（96時間以降）",   goal: "フル・コンタクト練習で無症状",  activity: "医師許可後・タックル含む通常練習" },
        { week: "Phase 6（移行条件）",     goal: "24時間無症状の確認",              activity: "無症状確認後に試合復帰（Phase 6）" },
      ],
      alert: "コンタクト練習後24時間以内に症状が増悪した場合はPhase 4に戻ること。医師許可なしのコンタクト参加は絶対に禁止です。",
    },
    {
      // GRTP Phase 6（目安：受傷後120時間以降）— 試合復帰・リハビリ完了
      summary: "フル・コンタクト練習で無症状を確認。GRTP Phase 6：試合復帰が可能です。リハビリ完了。通常の競技生活に戻りますが、再発予防と症状の自己管理を継続してください。",
      okList: ["試合出場・通常の競技参加","全ての練習・コンタクトプレー","予防教育の継続"],
      ngList: ["症状が出た場合に無視して継続すること（即中止・報告）"],
      rehabMenu: [
        { title: "試合復帰（Phase 6）",    sets: "通常参加",      note: "リハビリ完了。受傷後最短120時間が目安", details: "GRTPの最終段階です。通常の競技生活に戻ります。2回目の脳震盪は1回目より軽微な衝撃で発症しやすく、かつ重症化するリスクがあります。再発した場合は即座に活動を中止し、より慎重なプロセスを踏んでください。" },
        { title: "症状の自己管理（継続）", sets: "毎試合・練習後", note: "違和感・頭痛があれば即報告", details: "試合・練習後に頭痛・めまい・霧感などの症状がないか自己確認する習慣を継続します。軽微でも症状があれば即座に活動を中止し医師・トレーナーに報告してください。脳震盪を隠して継続することは次の重篤な損傷につながります。" },
      ],
      timeline: [
        { week: "Phase 6（120時間以降）", goal: "試合復帰・リハビリ完了", activity: "通常の競技参加" },
        { week: "復帰後",                 goal: "再発予防・自己管理継続", activity: "症状出現時は即中止・報告" },
      ],
      alert: "GRTPはフェーズ最低24時間ずつ。症状再発で即フェーズ後退。次の脳震盪リスクが高まるため再発予防教育を選手・チーム全員で必ず実施してください。",
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
    clinicalGuidance:
      "段階的競技復帰プロトコル（GRTP）\n" +
      "Phase 1（24〜48時間）：相対的安静（無理のない範囲で安静。過度な完全安静は避ける）。無症状であること。医師管理外は最低14日間。\n" +
      "Phase 2（48hrs）：軽度有酸素運動（ウォーキング・水泳・固定自転車エルゴ、最大予測心拍数70%未満）。レジスタンス禁止。\n" +
      "Phase 3（72hrs）：スポーツ固有の運動（ランニング・ドリル）。頭部衝撃禁止。\n" +
      "Phase 4（96hrs）：非コンタクト練習ドリル（例：パス・ドリル）。漸進的レジスタンス開始可。\n" +
      "Phase 5（96hrs+）：フル・コンタクト練習（医師許可後）。\n" +
      "Phase 6（120hrs）：競技復帰。リハビリ完了。\n" +
      "※ 各フェーズは最低24時間実施し無症状を確認してから次フェーズへ。症状出現で即フェーズ後退。\n" +
      "出典：Patricios JS, et al. Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport — Amsterdam, October 2022. Br J Sports Med 2023;57(11):695-711. doi:10.1136/bjsports-2023-106898（CISG・段階的競技復帰GRTS）",
  };
}

// --- Elbow Throwing ---

// 段階的投球プログラム（クリニック実プロトコル 2022/09/27版 準拠）
// 野球版：塁間・マウンド距離で表示
const THROWING_PROGRAM_BASEBALL: ThrowingStep[] = [
  { step: 1, week: "0〜7日（1週）",    name: "フォーム固め（キャッチボール）",   distance: "10m",                          reps: "30球" },
  { step: 2, week: "8〜14日（2週）",   name: "負荷アップ（塁間キャッチボール）", distance: "塁間（約27m）",                reps: "30〜50球" },
  { step: 3, week: "15〜28日（3〜4週）", name: "動きの中で投球（ノック・守備）",   distance: "塁間＋α（中継程度）",          reps: "50〜80球", note: "内野手・外野手は出場許可（送球は中継を入れる）" },
  { step: 4, week: "28〜49日（5〜7週）", name: "ピッチング",                       distance: "投手：マウンド-本塁／野手：塁間＋α", reps: "30→50→80球", note: "投手・捕手も出場可（野手は5週で80球目安）" },
  { step: 5, week: "50〜63日（8〜9週）", name: "遠投許可・完全復帰",               distance: "遠投",                         reps: "フリー＋遠投20→30球", note: "完全復帰" },
];

// アメフト版（QB）：ルートベースで進行（リオ作成の投球制限エクセル準拠）
const THROWING_PROGRAM_AF: ThrowingStep[] = [
  { step: 1, week: "0〜7日（1週）",    name: "フォーム固め（ショートスロー）", distance: "10yd：キャッチボール・アクロス・スラント", reps: "30球",     note: "ドロップバックのみ" },
  { step: 2, week: "8〜14日（2週）",   name: "負荷アップ（ミドルスロー）",     distance: "5・10ヤード：アウト／カール",             reps: "30球" },
  { step: 3, week: "15〜28日（3〜4週）", name: "動きの中で投球",                 distance: "ポスト／コーナー／ゴー（ディープ）",       reps: "30〜50球", note: "ロールアウト・ブートレッグ可／試合出場を考慮" },
  { step: 4, week: "28〜49日（5〜7週）", name: "フルベロシティ・スロー",         distance: "同上（ポスト／コーナー／ゴー）",           reps: "30〜50球", note: "試合出場可能" },
];

function getThrowingProgram(sport: SportId | ""): ThrowingStep[] {
  return sport === "american_football" ? THROWING_PROGRAM_AF : THROWING_PROGRAM_BASEBALL;
}

// ===== オーバーヘッド非投球競技の段階的復帰プログラム（テニス／バレー／水泳） =====
// ※ 確立した単一プロトコルがないため、インターバル復帰の標準構造（量→強度の順／肩負荷が最大の
//    動作＝サーブ・スパイク・バタフライを最後に導入）に基づくドラフト。数値は臨床に合わせ調整可。
//    distance列＝種目/強度、reps列＝量として表示（throwingProgramMetaで列見出しを差し替え）。
const OVERHEAD_PROGRAM_TENNIS: ThrowingStep[] = [
  { step: 1, name: "フォーム確認（ミニテニス・低強度ストローク）", distance: "フォアハンド主体（ショート）", reps: "10〜20球",        note: "サーブはまだ行わない" },
  { step: 2, name: "グラウンドストローク（ベースライン・両面）",   distance: "フォア＋バック（中強度）",       reps: "20〜30球" },
  { step: 3, name: "ストローク＋ボレー（動きの中で）",             distance: "ストローク＋ネットプレー",       reps: "30〜50球",        note: "サーブは1/2強度から少数のみ" },
  { step: 4, name: "サーブ導入（1/2→3/4強度）",                   distance: "サーブ＋ストローク",             reps: "サーブ10→20→30本", note: "サーブは肩負荷が最大。段階的に強度・本数を増やす" },
  { step: 5, name: "フルサーブ・実戦復帰",                         distance: "全ショット・フルサーブ",         reps: "練習試合→公式戦",  note: "完全復帰" },
];

const OVERHEAD_PROGRAM_VOLLEYBALL: ThrowingStep[] = [
  { step: 1, name: "トス・セット中心（低負荷オーバーヘッド）", distance: "セット・アンダー",         reps: "10〜20回",          note: "スパイク・サーブはまだ行わない" },
  { step: 2, name: "軽打（ダウンボール・1/2強度の打ち込み）", distance: "ダウンボール・軽打",       reps: "20〜30回" },
  { step: 3, name: "スパイク導入（助走なし→助走あり・中強度）", distance: "スパイク（中強度）",       reps: "スパイク10→20→30本", note: "フルスイングはまだ" },
  { step: 4, name: "フルスパイク＋サーブ（3/4→フル）",          distance: "スパイク＋サーブ",         reps: "20→30→40本",        note: "ジャンプサーブは最後に導入" },
  { step: 5, name: "フル参加・実戦復帰",                         distance: "全プレー・ジャンプサーブ", reps: "練習→試合",          note: "完全復帰" },
];

const OVERHEAD_PROGRAM_SWIMMING: ThrowingStep[] = [
  { step: 1, name: "低強度キック・自由形（低ヤード）",        distance: "自由形（イージー）",       reps: "200〜400m",      note: "バタフライ・全力はまだ" },
  { step: 2, name: "ヤード増（自由形・背泳ぎ中心）",          distance: "自由形・背泳ぎ",           reps: "600〜1000m" },
  { step: 3, name: "ストローク追加（平泳ぎ・短いバタフライ）", distance: "4泳法（低〜中強度）",      reps: "1000〜1500m",    note: "バタフライは短距離から" },
  { step: 4, name: "強度アップ（インターバル・スプリント導入）", distance: "専門種目・スプリント",     reps: "通常練習量の50→75%" },
  { step: 5, name: "フルメニュー・レース復帰",               distance: "全種目・レースペース",     reps: "通常練習→大会",   note: "完全復帰" },
];

// オーバーヘッド非投球競技のプログラム＋表示メタ（見出し・列ラベル・noteアイコン）を返す
function getOverheadProgram(sport: SportId | ""): { steps: ThrowingStep[]; meta: NonNullable<RehabPlan["throwingProgramMeta"]> } | null {
  switch (sport) {
    case "tennis":     return { steps: OVERHEAD_PROGRAM_TENNIS,     meta: { label: "🎾 段階的復帰プログラム（テニス）",     distanceCol: "種目/強度", repsCol: "量", noteIcon: "🎾" } };
    case "volleyball": return { steps: OVERHEAD_PROGRAM_VOLLEYBALL, meta: { label: "🏐 段階的復帰プログラム（バレーボール）", distanceCol: "種目/強度", repsCol: "量", noteIcon: "🏐" } };
    case "swimming":   return { steps: OVERHEAD_PROGRAM_SWIMMING,   meta: { label: "🏊 段階的復帰プログラム（水泳）",       distanceCol: "種目/距離", repsCol: "量", noteIcon: "🏊" } };
    default:           return null;
  }
}

// 受傷（または投球開始）からの経過日数を docx の日数バンドに当てて現在ステップを推定
function throwingStepFromDays(days: number): number {
  if (days <= 7)  return 1;
  if (days <= 14) return 2;
  if (days <= 28) return 3;
  if (days <= 49) return 4;
  return 5;
}

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
      ? ["投球動作（いかなる強度も禁止）","コンタクトプレー"]
      : passCount <= 1
      ? ["投球（いかなる強度も禁止）","肘への衝撃・負荷","コンタクトプレー"]
      : ["疼痛を我慢しての投球","球数制限を超えた投球","投球後のアイシング省略"],
    rehabMenu: isSevere
      ? [
          { title: "整形外科受診",               sets: "早急に",       note: "MRI評価・手術適応確認", details: "Tommy John手術（内側側副靱帯再建術：UCL再建）の適応を評価するため整形外科専門医への紹介が急務です。MRI（特に強化MRI）で靱帯の断裂範囲・完全断裂か不完全断裂かを確認します。手術後の競技復帰まで12〜18ヶ月かかるため、早期診断・早期手術判断がその後の競技生活に大きく影響します。" },
          { title: "アイシング",                 sets: "20分 × 4〜6回", note: "肘・前腕を冷却", details: "肘の内側（UCL付着部）を重点的に冷却します。炎症を抑制し疼痛をコントロールします。手術決定・実施までの間は適切な疼痛管理を行います。タオルで包んだ氷嚢を20分当てた後は必ず外してください。" },
          { title: "非投球肢トレーニング",       sets: "週3〜4回",     note: "体幹・下肢・反対側上肢の維持", details: "患側への投球負荷はゼロにしながら体幹・下肢・反対側上肢を積極的に維持します。術後の回復を助けるために全身のコンディションを手術前から最大化します。投球障害肘の根本原因の一つは体幹・下肢のキネティックチェーン不全であるため、この時期の強化が再発予防にも直結します。" },
        ]
      : passCount <= 1
      ? [
          { title: "アイシング",                 sets: "20分 × 4〜6回", note: "前腕・肘の炎症コントロール", details: "前腕・肘の炎症をコントロールします。肘内側（UCL・共同屈筋腱付着部）を重点的に冷却します。消炎鎮痛薬（医師処方）との併用が効果的です。アイシングは運動後だけでなく日中の疼痛コントロールにも活用してください。" },
          { title: "前腕回内外（チューブ）",     sets: "15回 × 3",     note: "痛みのない範囲のみ", details: "チューブまたはライトダンベルを持ち前腕を回内（手の平が下）↔回外（手の平が上）させます。痛みのない範囲のみで行います。尺側手根屈筋・円回内筋などのUCL保護筋を維持します。これらの筋群はUCLへの負荷を軽減する補助靱帯として機能します。" },
          { title: "リストカール（軽負荷）",     sets: "15回 × 3",     note: "手関節屈筋・伸筋の維持", details: "ライトダンベルまたはチューブで手関節の屈伸・撓尺屈を行います。内側型投球障害では手関節屈筋群の過剰使用が関連するため、適切な強度で維持します。急性炎症期は中止し、疼痛のない範囲内でのみ実施してください。" },
          { title: "走り込み",                   sets: "20〜30分",     note: "下半身コンディション維持", details: "下半身コンディションを投球禁止期間中に最大化します。上肢への負荷がゼロで全身持久力・下肢筋力を維持・強化できます。投球障害肘の根本原因の一つは体幹・下肢のキネティックチェーン不全であるため、この時期の下肢強化が再発予防に直結します。" },
        ]
      : [
          { title: "段階的投球プログラム",       sets: "下記参照",     note: "各ステップを3日以上実施してから次へ", details: "10m軽投（50%）から始め、3日以上問題がなければ距離と強度を段階的に上げます。疼痛・腫脹・翌日への影響がなければ次のステップに進みます。一度に2段階以上上げないことが重要です。疼痛が出た場合は1段階下げて再スタートします。" },
          { title: "前腕回内外強化",             sets: "15回 × 3",    note: "UCL保護のための最重要筋群", details: "UCLの保護筋として最も重要な尺側手根屈筋・円回内筋を強化します。投球段階では腕の疲労が溜まりやすいため、投球日と筋力強化日を交互に組みます。段階的投球プログラムと並行して継続することが内側側副靱帯保護の鍵です。" },
          { title: "肩甲骨安定化",               sets: "各15回 × 3", note: "ローテーターカフ・前鋸筋強化", details: "ローテーターカフ（特に後方：棘下筋・小円筋）と前鋸筋を強化します。肩甲骨の安定性が不足すると投球時に肘への過剰な負荷が集中します。フェイスプル・バンドプルアパートなどが効果的です。週3〜4回実施してください。" },
          { title: "投球後アイシング",           sets: "20分（毎回）", note: "必ず実施。省略は炎症悪化のリスク", details: "投球練習後は必ずアイシングを実施します。省略すると微細な炎症が蓄積し靱帯・腱の慢性損傷につながります。投球後アイシングをルーティン化することが長期的な肘保護の基本です。投球日は練習終了直後に20分間実施してください。" },
        ],
    timeline: [
      { week: "投球禁止期（2〜6週）",  goal: "炎症消退",       activity: "体幹・下肢・非投球上肢のみ" },
      { week: "段階的投球（4〜8週）",  goal: "疼痛なく投球可", activity: "距離・強度を段階的に増加" },
      { week: "全力投球（8〜12週）",   goal: "競技距離・強度", activity: "試合に向けた最終調整" },
    ],
    alert: isSevere
      ? "Tommy John手術（UCL再建術）後の復帰期間は12〜18ヶ月です。早期に専門医を受診してください。"
      : "投球障害肘の最大の原因は投げ過ぎです。球数制限・インニング制限を必ず守ること。",
    throwingProgram: !isSevere && passCount >= 2 ? getThrowingProgram(p.sport) : undefined,
    // 投球期に入ったら現在ステップを提示：全力投球テスト未クリアは段階的投球（経過日数で推定）、クリア後は最終ステップ
    throwingCurrentStep: !isSevere && passCount >= 2
      ? (() => {
          const last = getThrowingProgram(p.sport).length;
          return okThrow ? last : Math.min(throwingStepFromDays(getDays(p.injuryDate)), last);
        })()
      : undefined,
  };
}

// --- Generic Plan ---

// --- Rotator Cuff（腱板損傷・保存療法） ---
// 機能ベース・グレードなし。先生の臨床基準（全腱板テスト合格＆ROMフル＆圧痛なし→段階的復帰）に準拠。
// オーバーヘッド競技（野球・アメフト＝投球プログラム対応競技）は段階的投球（野球肘と同じ）へ、
// その他は個人練習→対人→試合形式へ段階的復帰。出典：Kuhn 2013/2024・Ryösä 2017・Lowry 2024・Dickinson 2023・Bi 2024。
function rotatorCuffPlan(p: GeneratePlanParams): RehabPlan {
  const td = getTargetDays(p.targetDate);
  // 投球プログラムが用意されている競技（野球＝塁間/マウンド・アメフト＝ルート）。
  const isThrowingSport = p.sport === "baseball" || p.sport === "american_football";
  // オーバーヘッド非投球競技（テニス／バレー／水泳）は専用の段階的復帰プログラムを表示。
  const overhead = getOverheadProgram(p.sport); // null=投球競技 or 非OH競技
  const isOverheadSport = isThrowingSport || overhead !== null;
  // 段階的復帰期に表示するプログラム＋表示メタ（投球競技は投球プログラム＝デフォルトメタ）。
  const overheadProgram = isThrowingSport ? getThrowingProgram(p.sport) : (overhead?.steps ?? []);
  const overheadMeta = isThrowingSport ? undefined : overhead?.meta;
  // 復帰課程の呼称（投球競技＝野球肘と同じ投球プログラム／他OH＝サーブ・スパイク等の段階的復帰）。
  const ohProgramWord = isThrowingSport ? "段階的投球プログラム（野球肘と同じ）" : "段階的な競技復帰プログラム（サーブ・スパイク・スイム等）";

  const okPainFree = t(p.tests, "okPainFree");
  const okROM      = t(p.tests, "okROM");
  const okStrength = t(p.tests, "okStrength");
  const okReturn   = t(p.tests, "okReturn");

  let idx = 0;
  if      (!okPainFree) idx = 0; // 疼痛コントロール期
  else if (!okROM)      idx = 1; // 可動域回復期
  else if (!okStrength) idx = 2; // 腱板筋力・機能回復期
  else if (!okReturn)   idx = 3; // 段階的復帰期
  else                  idx = 4; // 競技復帰可

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: "腱板損傷（保存療法）の疼痛コントロール期です。安静時・夜間の痛みと腱板部の圧痛を引かせます。非外傷性（変性）の腱板断裂は、まず運動療法を中心とした保存治療が第一選択で、多くが手術を回避できます。",
      okList: ["痛みの出ない範囲での日常使用", "疼痛・炎症のコントロール（必要に応じ医師処方）", "肩甲骨セッティング・姿勢の調整", "痛みのない範囲の振り子運動・自動介助での可動域運動"],
      ngList: ["痛みを伴うオーバーヘッド動作の反復", "重い物の挙上・運搬", "投球・スパイク・サーブ等の競技動作", "夜間痛を悪化させる肢位での就寝"],
      rehabMenu: [
        { title: "疼痛・炎症コントロール", sets: "適宜", note: "負荷調整・アイシング（必要に応じ医師処方）", details: "痛みを誘発する動作（特に痛みの出るオーバーヘッド）を一時的に避け、必要に応じてアイシングや医師処方の薬剤で疼痛・炎症をコントロールします。安静時・夜間痛と腱板部の圧痛が引くことが次段階への目安です。" },
        { title: "振り子運動・自動介助ROM", sets: "各10回 × 2〜3", note: "Codman振り子・反対手の介助で痛みなく", details: "前かがみで腕を脱力して揺らす振り子運動（Codman）や、反対の手で介助しながらの可動域運動を、痛みの出ない範囲で行います。肩を固めず、痛みのない可動性を保ちます。" },
        { title: "肩甲骨セッティング・姿勢", sets: "10秒 × 10", note: "肩甲骨を軽く後下方へ・猫背の是正", details: "肩甲骨を軽く後ろ下方に引く感覚で安定させ、猫背・巻き肩の姿勢を整えます。肩甲骨の土台が安定すると腱板への負担が減ります。" },
      ],
      timeline: [
        { week: "現在：疼痛コントロール期", goal: "安静時/夜間痛・圧痛の消失", activity: "疼痛管理・無痛ROM・姿勢調整" },
        { week: "→ 痛み・圧痛消失で",       goal: "可動域回復",             activity: "挙上・外旋・内旋をフルへ" },
        { week: "→ ROMフルで",             goal: "腱板筋力・機能回復",     activity: "腱板・肩甲帯の段階的強化" },
      ],
      alert: "外傷性の若年・全層断裂など一部は手術適応のことがあります。保存治療で改善しない・脱力が強い場合は専門医評価を受けてください。評価は医療者のもとで行ってください。",
    },
    {
      summary: "痛み・圧痛が落ち着きました。可動域回復期です。挙上・外旋・内旋の可動域を健側と同等（フル）まで、痛みなく回復させます。",
      okList: ["自動・自動介助での全方向ROM", "後方ストレッチ（制限があればクロスボディ・スリーパー）", "肩甲骨の可動性・胸郭の柔軟性", "痛みのない範囲の軽い等尺性"],
      ngList: ["痛みを我慢した最終域への押し込み", "重負荷の挙上・オーバーヘッド", "競技動作（投球・スパイク・サーブ等）", "痛み・夜間痛が再燃する負荷"],
      rehabMenu: [
        { title: "全方向の可動域運動", sets: "各10〜15回 × 3", note: "挙上・外旋・内旋。痛みの手前まで", details: "壁を指で登る、棒を使った外旋・挙上補助など、自動〜自動介助で全方向の可動域を健側と同等まで段階的に広げます。最終域での痛みの手前で止め、反動はつけません。" },
        { title: "後方/肩甲帯の柔軟性", sets: "30秒 × 3", note: "後方タイトネスがあればクロスボディ等", details: "肩後方のタイトネスがある場合はクロスボディ・スリーパーストレッチで改善します。肩甲骨周囲・胸郭の柔軟性も併せて整えます。" },
        { title: "軽い等尺性（痛みなし）", sets: "10秒 × 10", note: "外旋・内旋・外転を壁押しで", details: "関節を動かさずに外旋・内旋・外転方向へ軽く力を入れる等尺性を、痛みの出ない範囲で行い、筋力強化期への土台をつくります。" },
      ],
      timeline: [
        { week: "現在：可動域回復期", goal: "ROMフル（左右差なし・無痛）", activity: "全方向ROM・柔軟性" },
        { week: "→ ROMフルで",       goal: "腱板筋力・機能回復",         activity: "腱板・肩甲帯の段階的強化" },
        { week: "→ 腱板テスト合格で", goal: "段階的復帰",                 activity: "投球プログラム／個人→対人→試合" },
      ],
      alert: "可動域の左右差・最終域の痛みが残る間は筋力強化へ進めません。痛み・夜間痛が再燃したら一段階戻します。",
    },
    {
      summary: "可動域が回復しました。腱板筋力・機能回復期です。腱板（外旋・外転）と肩甲帯の筋力を段階的に強化し、各腱板テストが無痛・陰性になることを目指します。非外傷性断裂に対するMOON型の保存的運動療法に基づきます。",
      okList: ["腱板強化（外旋・内旋・外転：バンド→軽ダンベル）", "肩甲帯強化（ローイング・前鋸筋）", "オープン＋クローズドチェーンの併用", "プライオメトリクスの早期導入（軽負荷バンド）"],
      ngList: ["痛みを伴う高負荷・反復オーバーヘッド", "腱板テストが陽性（痛み）の段階での競技動作", "投球・スパイク・サーブ等のフル強度", "翌日に痛み・夜間痛が出る負荷"],
      rehabMenu: [
        { title: "腱板強化（外旋・内旋・外転）", sets: "15〜20回 × 3", note: "セラバンド→軽ダンベル。フォーム重視で漸増", details: "セラバンドや軽ダンベルで外旋・内旋・外転を強化します。痛みの出ない範囲・正しいフォームで開始し、翌日に悪化がなければ段階的に負荷を上げます。腱板の各誘発テスト（empty can・外旋抵抗・lift-off/belly-press 等）が無痛・陰性になることが目標です（医療者評価）。" },
        { title: "肩甲帯強化", sets: "12〜15回 × 3", note: "ローイング・前鋸筋（プッシュアッププラス等）", details: "ローイング・前鋸筋エクササイズで肩甲骨を安定させます。肩甲骨の安定は腱板の働きやすさと再発予防の基盤です。" },
        { title: "プライオメトリクス（早期・軽負荷）", sets: "各10回 × 3", note: "バンドの速い求心性→ゆっくり遠心性・ドロップ&キャッチ", details: "軽負荷のバンドやボールで、速い求心性→ゆっくりした遠心性、ドロップ&キャッチなどを早期から取り入れ、競技動作に向けた腱板の反応性を高めます（投球肩のRTS原則）。" },
      ],
      timeline: [
        { week: "現在：腱板筋力・機能回復期", goal: "腱板テスト全合格＆筋力", activity: "腱板・肩甲帯強化・プライオ" },
        { week: "→ 腱板テスト合格で",         goal: "段階的復帰",           activity: isOverheadSport ? "段階的復帰プログラム" : "個人→対人→試合形式" },
        { week: "→ 段階的復帰クリアで",       goal: "競技復帰",             activity: "段階的にフル参加→試合" },
      ],
      alert: "腱板の各誘発テストが無痛・陰性で、ROMフル・圧痛なしが揃ってから段階的復帰へ進みます。評価は医療者のもとで行ってください。",
    },
    {
      summary: isOverheadSport
        ? `腱板テスト合格・ROMフル・圧痛なしを確認。段階的復帰期です。${ohProgramWord}（下記）に沿って、量→強度の順で段階的に上げます。各段階で実施後の疼痛・翌日の状態を確認し、問題なければ次へ。評価は医療者のもとで。`
        : "腱板テスト合格・ROMフル・圧痛なしを確認。段階的復帰期です。個人練習（競技動作の単独反復）→ 対人（パス・ラリー・軽い実戦）→ 試合形式へ、各段階で疼痛・不安なくクリアしながら段階的に復帰します。評価は医療者のもとで。",
      okList: isOverheadSport
        ? ["下記の段階的復帰プログラムに沿って進める", "実施後のアイシング・肩甲骨ケア", "腱板・肩甲帯筋力の維持", "量・強度の管理（急増を避ける）"]
        : ["個人練習（競技動作の単独反復）から開始", "問題なければ対人練習（パス・ラリー・軽い実戦）へ", "次いで試合形式へ段階的に", "各段階で疼痛・不安・翌日の状態を確認"],
      ngList: ["痛みを我慢した競技動作の継続", "段階を飛ばして一気に全強度へ戻すこと", "翌日に疼痛・夜間痛が出る負荷", "違和感・脱力がある状態での無理な実戦"],
      rehabMenu: isOverheadSport
        ? [
            { title: ohProgramWord, sets: "下記プログラム参照", note: "量→強度の順。実施後の症状を確認", details: isThrowingSport
                ? "野球肘と同じ段階的投球プログラム（競技別：野球＝塁間・マウンド／アメフト＝ルート）に沿って、距離・球数・強度を段階的に上げます。各ステップで投球後の疼痛・翌日の状態を確認し、問題があれば1段階戻します。"
                : "下記の段階的復帰プログラムに沿って、まず量（回数・距離）を、次に強度を段階的に上げます。肩への負荷が最大の動作（サーブ・スパイク・バタフライ）は最後に導入します。各ステップで実施後の疼痛・翌日の状態を確認し、問題があれば1段階戻します。" },
            { title: "腱板・肩甲帯筋力の維持", sets: "15回 × 3", note: "外旋・内旋・前鋸筋・ローイング", details: "競技動作の再開後も腱板・肩甲帯の強化を継続し、疲労による機能低下を防ぎます。" },
            { title: "実施後ケア・負荷管理", sets: "毎回", note: "アイシング・肩甲骨ケア・量/強度管理", details: "実施後のアイシングと肩甲骨ケアをルーティン化し、肩特異的RPE（修正Borg）で週単位の負荷をモニタリングして急増を避けます。" },
          ]
        : [
            { title: "個人練習（単独反復）", sets: "段階的", note: "競技動作を単独で・低強度から", details: "競技で必要な動作（スイング・サーブ・シュート等）を、対人なしで低強度から反復します。痛み・不安なく行えれば次の対人へ進みます。" },
            { title: "対人練習へ移行", sets: "段階的", note: "パス・ラリー・軽い実戦", details: "対人でのパス・ラリー・軽い実戦に進みます。接触・予測できない負荷でも肩に痛み・不安が出ないことを確認します。" },
            { title: "試合形式へ", sets: "段階的", note: "実戦に近い強度→フル参加", details: "試合形式の練習に段階的に参加し、フル強度・実戦に近い負荷で問題がないことを確認してから競技復帰します。各段階で翌日の状態を確認します。" },
          ],
      timeline: [
        { week: "現在：段階的復帰期", goal: isOverheadSport ? "段階的復帰プログラム完了" : "個人→対人→試合をクリア", activity: isOverheadSport ? "量→強度の段階的アップ" : "個人練習→対人→試合形式" },
        { week: "→ 復帰課題クリアで", goal: "競技復帰", activity: "段階的にフル参加→試合" },
      ],
      alert: "段階を飛ばさず、各段階で疼痛・不安・翌日の状態を確認しながら進めます。痛みを我慢した継続は再燃・増悪の原因になります。",
    },
    {
      summary: "腱板テスト全合格・ROMフル・圧痛なし、かつ段階的復帰課題をクリアしました。競技へ完全復帰できる状態です。再発予防に腱板・肩甲帯の強化と負荷管理を継続してください。",
      okList: ["競技へのフル参加・試合出場", "腱板・肩甲帯筋力の維持（予防プログラムは最低週2回）", "負荷管理（肩特異的RPEで週単位モニタリング・急増回避）", "違和感・夜間痛が出たら負荷を調整"],
      ngList: ["痛み・夜間痛を我慢しての継続", "急激な練習量・投球数の増加", "腱板・肩甲帯ケアの中断"],
      rehabMenu: [
        { title: "腱板・肩甲帯の維持トレ", sets: "15回 × 3（週2回以上）", note: "外旋・内旋・前鋸筋・ローイング", details: "復帰後も腱板・肩甲帯の強化を予防プログラムとして最低週2回継続します。再発予防の基盤です。" },
        { title: "負荷管理", sets: "継続", note: "肩特異的RPE・投球数/強度の管理", details: "週単位の負荷を肩特異的RPE（修正Borg）でモニタリングし、急増を避けます。オーバーヘッド競技では投球数・球速の管理を継続します。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "競技完全復帰", activity: "フル参加→試合" },
        { week: "復帰後シーズン中", goal: "再発予防継続",   activity: "腱板・肩甲帯維持・負荷管理" },
      ],
      alert: "復帰後も夜間痛・脱力・圧痛が出たら負荷を見直してください。腱板・肩甲帯の強化と負荷管理の継続が再発予防の鍵です。",
    },
  ];

  const fullyReturned = okReturn;
  const phaseLabel = fullyReturned && idx === 4 ? "競技復帰可（機能基準クリア）" : ROTATOR_CUFF_PHASES[idx].name;

  const ROTATOR_CUFF_GUIDANCE =
    "■ 腱板損傷（保存療法）※本プランは非手術（保存）を対象\n" +
    "・非外傷性（変性）の腱板断裂は運動療法を中心とした保存治療が第一選択。非外傷性全層断裂への理学療法プログラムで約75%が2年時点で手術を回避（Kuhn JE, et al. J Shoulder Elbow Surg 2013;22(10):1371-1379. doi:10.1016/j.jse.2013.01.026）。10年追跡でも多くが保存を継続でき、手術移行の規定因子は経時的に変化（Kuhn JE, et al. J Bone Joint Surg Am 2024;106(17):1563-1572. doi:10.2106/JBJS.23.00978）。\n" +
    "・手術 vs 保存のメタ解析でも多くの患者報告アウトカムで明確な差は示されていない（Ryösä A, et al. Disabil Rehabil 2017;39(14):1357-1363. doi:10.1080/09638288.2016.1198431）。各種診療ガイドラインでも保存治療が初期管理の中心（Lowry V, et al. Arch Phys Med Rehabil 2024;105(2):411-426. doi:10.1016/j.apmr.2023.09.022）。\n" +
    "・保存の具体的進め方（疼痛コントロール→ROM→腱板/肩甲帯の段階的強化）：Dickinson RN, Kuhn JE. Phys Med Rehabil Clin N Am 2023;34(2):335-355. doi:10.1016/j.pmr.2022.12.002。部分層断裂の評価・管理：Bi AS, et al. JBJS Rev 2024;12(8). doi:10.2106/JBJS.RVW.24.00063。\n" +
    "■ 進め方（機能ベース・臨床基準）\n" +
    "・安静時/夜間痛・圧痛の消失 → ROMフル（左右差なし・無痛）→ 全腱板テスト合格＆筋力 → 【オーバーヘッド競技】段階的な競技復帰プログラム（野球/アメフト＝投球、テニス/バレー/水泳＝サーブ・スパイク・スイムの段階的負荷／いずれも量→強度の順、肩負荷が最大の動作は最後に）／【その他】個人練習→対人→試合形式 → 競技復帰。暦ではなく機能基準で進める（評価は医療者のもとで）。\n" +
    "※ 外傷性の若年・全層断裂など一部は手術適応のことがあり、保存で改善しない場合は専門医評価を。";

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 5,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: ROTATOR_CUFF_PHASES,
    clinicalGuidance: ROTATOR_CUFF_GUIDANCE + (isOverheadSport ? "\n\n" + SHOULDER_RTS_GUIDANCE : ""),
    // オーバーヘッド競技は段階的復帰期からプログラムを表示（野球/アメフト＝投球／テニス・バレー・水泳＝専用）。
    throwingProgram: (isOverheadSport && idx >= 3) ? overheadProgram : undefined,
    throwingCurrentStep: (isOverheadSport && idx >= 3)
      ? (() => { const last = overheadProgram.length; return idx >= 4 ? last : 1; })()
      : undefined,
    throwingProgramMeta: (isOverheadSport && idx >= 3) ? overheadMeta : undefined,
  };
}

function genericPlan(p: GeneratePlanParams): RehabPlan {
  const days = getDays(p.injuryDate);
  const inj  = INJURY_TYPES.find((x) => x.id === p.injuryId);
  const label = inj?.label ?? p.injuryId;

  const surgDays  = p.surgeryDate ? getDays(p.surgeryDate) : null;
  const surgWeeks = surgDays !== null ? Math.floor(surgDays / 7) : null;
  const surgNote  = surgWeeks !== null ? `（術後${surgWeeks}週目）` : "";

  // ---- 汎用プラン ----
  // テスト通過数でフェーズを決定（時間ではなく機能状態を優先）
  const passCount  = p.tests.filter((tr) => tr.result === true).length;
  const totalTests = p.tests.length;
  const isAcute    = passCount === 0;
  const isSubacute = passCount > 0 && passCount < totalTests;

  const phase = isAcute ? "急性期" : isSubacute ? "亜急性期〜回復期" : "機能回復〜スポーツ復帰期";

  // グレード表示ラベル（英語valueではなく日本語labelを使用）
  const gradeOption = (GRADES_BY_INJURY[p.injuryId] ?? []).find((g) => g.value === p.grade);
  const gradeLabel  = gradeOption?.label ?? p.grade;

  return {
    phase,
    currentPhaseIndex: isAcute ? 0 : isSubacute ? 1 : 2,
    totalPhases: 3,
    summary: `${label}（${gradeLabel}）の${phase}${surgNote}です。機能評価の結果に基づいてリハビリプランを進めます。`,
    okList: isAcute
      ? ["安静・保護（損傷部位）","アイシング（15分 × 4〜6回／氷嚢を直接押し当てる）","疼痛なし範囲の自動運動","上肢または下肢の代替トレーニング"]
      : isSubacute
      ? ["段階的な関節可動域訓練","等尺性→等張性筋力強化","有酸素運動（非患部）","固有感覚訓練"]
      : ["競技特異的ドリルの導入","チーム練習への段階的参加","筋力・パワー回復トレーニング","コンタクト練習（段階的）"],
    ngList: isAcute
      ? ["患部への強い負荷","疼痛を誘発する動作","コンタクトプレー","入浴（湯船）・温熱療法（受傷後72時間は避ける／シャワーは可）"]
      : isSubacute
      ? ["最大強度の運動","コンタクトプレー","疼痛を誘発する動作"]
      : ["医師許可なしの試合出場"],
    rehabMenu: isAcute
      ? [
          { title: "アイシング",         sets: "15分 × 4〜6回", note: "氷嚢を直接押し当てる。炎症コントロール", details: "受傷後72時間までの急性期は1日4〜6回、1回15分実施します。タオル越しでは冷却効果が低いため、氷嚢やビニール袋に入れた氷を患部に直接しっかり押し当ててください。圧迫・挙上と組み合わせると浮腫軽減効果が高まります。挙上は下肢のケガでは足の下に枕や丸めた布団を置いて少し高くし、座位でも台に足を置きます。なお湯船・温熱は受傷後72時間は避け、入浴はシャワーのみにしてください。" },
          { title: "等尺性運動",         sets: "10秒 × 10回",   note: "痛みのない範囲で患部周囲筋の維持", details: "関節を動かさずに力を入れ続ける等尺性（アイソメトリック）収縮です。患部周囲の筋肉の廃用萎縮を最小限に抑えます。固定した壁・床に患肢を押し当て5〜10秒力を入れます。疼痛が増悪しない力加減で実施してください。" },
          { title: "体幹安定化",         sets: "30秒 × 3",      note: "プランク、ドローイン", details: "プランク・ドローインで体幹を安定させます。どの傷害においても体幹の安定性は競技復帰の基盤です。この時期から体幹トレーニングを実施することで復帰後の患部への過剰な代償動作を防ぎます。" },
        ]
      : isSubacute
      ? [
          { title: "関節可動域訓練",     sets: "各方向10回 × 3", note: "痛みのない範囲でゆっくり", details: "患部関節を各方向にゆっくりと動かす運動です。疼痛のない範囲でのみ実施し動きの端で反動をつけないようにします。可動域制限が残ると競技動作の質が低下し隣接部位への過剰負荷につながります。毎日実施することが効果的です。" },
          { title: "段階的筋力強化",     sets: "15回 × 3",       note: "軽負荷から段階的に増加", details: "軽負荷から始め疼痛がなければ週10%程度の負荷増加を目安に段階的に強化します。等尺性→等張性（自体重→軽ウェイト→中ウェイト）の順に移行します。翌日に疼痛・腫脹増悪がなければ次の段階へ進みます。" },
          { title: "バランス訓練",       sets: "30秒 × 3",       note: "固有感覚の回復", details: "固有感覚（プロプリオセプション）の回復を目的とした訓練です。損傷後は感覚受容器が一時的にダメージを受けバランス能力が低下します。両脚→片脚、安定面→不安定面（バランスボード）の順に難易度を上げます。" },
        ]
      : [
          { title: "競技特異的ドリル",   sets: "練習準拠",       note: "スポーツのポジション固有動作", details: "実際のスポーツ・ポジションで必要な動作パターンを取り入れます。パスやシュート、スプリントなど競技固有の動きを段階的に導入します。医師・トレーナーと相談しながらチーム練習のどの部分から参加するかを決めてください。" },
          { title: "筋力強化（高負荷）", sets: "8〜10回 × 4",    note: "健側比90%以上を目標", details: "健側比90%以上の筋力回復を目標とします。低回数・高負荷のトレーニングで筋力・パワーを最大化します。等速性筋力測定が可能であれば定期的に評価することを推奨します。筋力が目標値に達してから競技復帰することが再受傷予防の根拠となります。" },
          { title: "アジリティ訓練",     sets: "10〜15分",       note: "方向転換・加速・減速", details: "加速・減速・方向転換など競技で必要な動作を取り入れたドリルです。ラダードリル・コーンドリル等で多方向への敏捷性を回復します。低速→高速の順に段階的に難易度を上げ疼痛・代償動作が出ないことを確認しながら進めてください。" },
        ],
    timeline: [
      { week: "0〜1週",   goal: "炎症コントロール", activity: "安静・保護・アイシング", criteria: "腫脹軽減・安静時疼痛消失" },
      { week: "1〜3週",   goal: "機能回復",          activity: "ROM・筋力訓練",         criteria: "可動域回復・歩行正常化" },
      { week: "3〜6週〜", goal: "スポーツ復帰",      activity: "競技特異的ドリル→試合", criteria: "筋力健側比80%・疼痛なし" },
    ],
    alert: `${label}は専門医による定期的な評価が必要です。症状悪化・新たな痛みは即座に医師に報告してください。`,
  };
}

// --- SLAP Lesion ---

export const SLAP_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "保護期",           desc: "安静・早期ROM",               duration: "0〜3週" },
  { phase: 2, name: "機能回復期",       desc: "可動域・腱板筋力回復",         duration: "3週〜3ヶ月" },
  { phase: 3, name: "段階的投球開始期", desc: "投球プログラム導入",           duration: "3〜6ヶ月" },
  { phase: 4, name: "競技復帰期",       desc: "全力投球・試合復帰",           duration: "6〜9ヶ月" },
];

// 肩（SLAP）の段階的投球は競技別プログラム getThrowingProgram() に統一（AF=ルートベース／野球=塁間・マウンド）。

// Athlete Shoulder Consensus（JOSPT 2022 / Bern枠組み）に基づく投球肩リハ・RTSの原則
const SHOULDER_RTS_GUIDANCE =
  "Athlete Shoulder Consensus Statement（JOSPT 2022・Bern枠組み）の主要原則：\n" +
  "■ リハ原則\n" +
  "・可動域：投球肩はGIRD（内旋制限）・ER gain・総回旋可動域を評価し、能動運動で改善（投球側はER↑・IR↓が正常な適応）。コンタクト主体の選手では全可動域は必須ではない。\n" +
  "・筋力：ER/IR比だけで判断せず、ER・IRの絶対値（体重で正規化）と受傷前ベースラインとの比較を重視。ハンドヘルドダイナモメーターで評価。\n" +
  "・運動様式：オープン＋クローズドキネティックチェーンの両方を含める。\n" +
  "・プライオメトリクスをリハ早期から導入（ドロップ&キャッチ、速い求心性→ゆっくり遠心性のバンドER等）。\n" +
  "■ 負荷管理\n" +
  "・肩特異的RPE（修正Borg 0〜10：『今週の投球腕の負荷はどれくらいきつかったか』）で週単位の負荷をモニタリング。急増を避ける。\n" +
  "・予防プログラムは最低週2回（チーム単位で全員に最低用量を）。\n" +
  "■ RTS連続体（段階）\n" +
  "・Return to participation（制限下の練習）→ Return to sport（競技復帰）→ Return to performance（受傷前の球数・球速でフル出場）。\n" +
  "・心理的準備：抵抗運動の最終可動域や規定強度の投球で不安がないこと、対人接触で再受傷恐怖が低いことがRTSの後押しになる。";

function slapPlan(p: GeneratePlanParams): RehabPlan {
  const isConservative = p.grade === "conservative";
  const isRepair       = p.grade === "unstable";
  const okPainFree = t(p.tests, "okPainFree");
  const okROM      = t(p.tests, "okROM");
  const okStrength = t(p.tests, "okStrength");
  const okThrow    = t(p.tests, "okThrow");
  const okFullThrow = t(p.tests, "okFullThrow");
  const td = getTargetDays(p.targetDate);

  const surgDays  = p.surgeryDate ? getDays(p.surgeryDate) : null;
  const surgWeeks = surgDays !== null ? Math.floor(surgDays / 7) : null;
  const surgNote  = surgWeeks !== null
    ? `（術後${surgWeeks}週目）`
    : "";

  let idx = 0;
  if      (!okPainFree)              idx = 0;
  else if (!okROM || !okStrength)    idx = 1;
  else if (!okThrow)                 idx = 2;
  else                               idx = 3;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: D[] = [
    {
      // Phase 1: 保護期 / 疼痛期（保存療法）
      summary: isConservative
        ? `上方関節唇損傷（SLAP）保存療法。安静時・日常生活での肩部疼痛が残存しています。完全ノースローを徹底し、体幹・下肢・肩以外のトレーニングで全身コンディションを維持します。安静時疼痛・ROM・筋力・テスト評価が全て問題なくなったら段階的投球プログラムへ移行します。`
        : isRepair
        ? `上方関節唇損傷（SLAP）縫合修復術後の保護期${surgNote}。スリング3週間固定と疼痛のないパッシブROMを行います。外旋の過緊張を避けることが最重要です（Kin & Sugaya, AJSM 2026）。`
        : `上方関節唇損傷（SLAP）デブリードマン術後の早期${surgNote}。固定不要で術翌日からPTを開始します。疼痛のない範囲でROM訓練を積極的に行います（Kin & Sugaya, AJSM 2026）。`,
      okList: isConservative
        ? ["完全ノースロー（肩に投球負荷をかけない）","体幹トレーニング（プランク・ドローイン・回旋）","下肢トレーニング（スクワット・デッドリフト・走り込み）","肩より先（肘・手首・前腕）のトレーニング","アイシング（疼痛部位20分）","疼痛のない範囲での肩甲骨モビリゼーション"]
        : isRepair
        ? ["スリング固定（3週間厳守）","振り子運動（パッシブROM）","等尺性収縮（軽度・疼痛なし）","肩甲骨モビリゼーション","体幹・下肢トレーニング"]
        : ["術翌日からPT開始","パッシブ〜アクティブアシストROM","肩甲骨モビリゼーション","体幹・下肢トレーニング","アイシング（練習後）"],
      ngList: isConservative
        ? ["投球動作（疼痛消失・テストクリアまで禁止）","肩関節に疼痛を誘発する挙上・外転・外旋","懸垂・ベンチプレスなど肩関節に強い負荷がかかる種目","コンタクトプレー"]
        : isRepair
        ? ["能動的肩関節挙上（3週間以内）","外旋の強制伸張","重力負荷（1kg超）","投球動作","コンタクトプレー"]
        : ["投球動作（術後1ヶ月以内）","過剰な伸張・牽引","コンタクトプレー"],
      rehabMenu: isConservative ? [
        { title: "アイシング・消炎鎮痛",               sets: "20分 × 4〜6回/日", note: "急性炎症期は特に頻回に実施", details: "肩関節の疼痛部位（前方・上方）にタオルで包んだ氷嚢を当て20分冷却します。急性炎症期は1日4〜6回実施します。医師から処方されている消炎鎮痛薬がある場合は処方通りに服用してください。アイシングを継続することで夜間痛の軽減・組織修復の促進が期待できます。" },
        { title: "肩甲骨モビリゼーション（疼痛なし範囲）", sets: "各10回 × 3",      note: "肩関節には直接負荷をかけない。肩甲骨のみ動かす", details: "肩甲骨を上（挙上）→後（後退）→下（下制）→前（前突）とゆっくり動かします。上腕骨の動きは伴いません。スキャプラダイスキネシス（肩甲骨機能不全）はSLAPの重要なリスクファクターであり、この時期から肩甲骨の可動性を維持しておくことが回復を早めます。" },
        { title: "体幹トレーニング",                   sets: "各15〜30秒 × 3",   note: "プランク・ドローイン・バードドッグ。肩に荷重がかからない種目を選択", details: "プランクは肩に体重が乗るため急性期は省略し、ドローイン（腹横筋収縮）とバードドッグ（四つ這い対側挙上）から開始します。疼痛が落ち着いてきたらサイドプランク・体幹回旋を追加します。投球のパワーは体幹→肩の連鎖で生まれるため、この時期の体幹強化が復帰後のパフォーマンスと再発予防に直結します。" },
        { title: "下肢・走り込みトレーニング",         sets: "スクワット15回×3 / ランニング20〜30分", note: "肩を使わず全身コンディションを最大化", details: "スクワット・デッドリフト・ランジ・走り込みなど、肩への負荷がゼロのトレーニングを積極的に行います。投球障害の根本原因の一つは体幹・下肢のキネティックチェーン不全です。ノースロー期間を肩の「休息」と捉えるだけでなく、下半身を積極的に強化する機会として活用することで、復帰後のパフォーマンス向上と再受傷予防につながります。" },
        { title: "前腕・肘下トレーニング",             sets: "各15回 × 3",       note: "チューブ・軽ダンベルで肩以遠を維持", details: "前腕回内外・リストカール・リバースカール・チューブプルダウン（肘だけ引く）など肩関節に負荷がかからない種目を選択します。肩のみを完全休息させながら、前腕・手首・肘周囲の筋力を維持します。これらの筋群は投球時にUCL・腱板への負荷を軽減する役割を担います。" },
      ] : isRepair ? [
        { title: "振り子運動（コッドマン体操）", sets: "各方向 15回 × 3", note: "前傾位で重力のみ活用。修復部への負荷ゼロ",
          details: "上体を前傾させ、患肢を自然に垂らします。前後・左右・円を描くように15回ずつ動かします。筋収縮を使わず重力のみで関節を動かすため、縫合した関節唇への伸張ストレスが最小限です。疼痛が出た場合は即中止し、担当医に報告してください。スリング除去後すぐに開始できます。" },
        { title: "等尺性外旋（ニュートラルポジション）", sets: "10秒 × 10回 × 2", note: "壁に手の甲を押し当て。関節を動かさない",
          details: "肘を90度に曲げ、体側に固定します。壁またはドアフレームに手の甲を当て、外旋方向に5〜10秒押し続けます（関節は動かさない）。修復部への伸張ストレスゼロで外旋筋の筋力を維持する最も安全な方法です。修復後3週間はこの運動のみで外旋筋を刺激します。" },
        { title: "肩甲骨モビリゼーション（他動）", sets: "各10回 × 3", note: "治療者が肩甲骨を直接動かす・または自動で肩すくめ",
          details: "肩甲骨を上（挙上）→後（後退）→下（下制）→前（前突）と他動的に動かします。術後に起きやすいスキャプラダイスキネシス（肩甲骨機能不全）を予防します。本論文でも術前・非手術治療の基本として肩甲骨機能の修正が強調されています。" },
        { title: "体幹・下肢維持トレーニング", sets: "各15回 × 3", note: "プランク・スクワット等で全身状態を維持",
          details: "投球のパワーは下肢・体幹からの運動連鎖で生まれます。術後の廃用を防ぐためにこの時期から積極的に体幹・下肢を維持します。Kin et al. (2026) の研究では、術後の総合的なコンディショニングがRTPLの重要因子とされています。" },
      ] : [
        { title: "振り子運動（コッドマン体操）", sets: "各方向 15回 × 3", note: "術翌日から開始可。デブリードマン後は早期ROM推奨",
          details: "上体を前傾させ患肢を自然に垂らします。前後・左右・円を描くように動かします。デブリードマン後は固定不要のため、術翌日から積極的に実施して関節拘縮を予防します。疼痛がなければ段階的にアクティブアシスト→自動運動へ移行します。" },
        { title: "アクティブアシストROM（棒体操）", sets: "各方向 10回 × 3", note: "健側で患側をアシストしながら可動域拡大",
          details: "棒・タオル・プーリーを使い、健側の力で患側の肩関節を動かします。前挙上・外転・外旋の順に可動域を拡大します。疼痛範囲を超えての強制は禁止です。段階的に自動運動へ移行します。" },
        { title: "肩甲骨モビリゼーション", sets: "各10回 × 3", note: "早期から肩甲骨機能を回復させる",
          details: "肩甲骨を上・後・下・前と動かします。デブリードマン後は早期からの肩甲骨機能回復が重要です。肩甲骨の安定性はオーバーヘッドスポーツの投球障害予防の根幹であり、本論文でも非手術治療の基本として強調されています。" },
        { title: "体幹・下肢維持トレーニング", sets: "各15回 × 3", note: "デブリードマン群は早期復帰が可能なため土台を早めに作る",
          details: "術後の廃用を防ぐため体幹・下肢を積極的に維持します。デブリードマン群は修復群より1〜2ヶ月早く投球を開始できるため、この時期の全身コンディション維持が早期復帰に直結します。" },
      ],
      timeline: isConservative
        ? [
            { week: "疼痛残存期",         goal: "完全ノースロー",           activity: "肩以外の全身トレーニング・アイシング" },
            { week: "疼痛消失後",         goal: "ROM・筋力回復",            activity: "腱板強化・肩甲骨安定化" },
            { week: "テストクリア後",     goal: "段階的投球プログラム開始", activity: "10m軽投から段階的に" },
            { week: "全テストクリア後",   goal: "競技復帰",                 activity: "全力投球・試合出場" },
          ]
        : [
            { week: "0〜3週",      goal: "組織保護・早期ROM",  activity: isRepair ? "スリング固定・パッシブROM" : "固定なし・術翌日PT開始" },
            { week: "3週〜3ヶ月", goal: "可動域・筋力回復",   activity: "腱板強化・肩甲骨安定化" },
            { week: `${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "10m軽投から段階的に" },
            { week: "6〜9ヶ月",   goal: "競技復帰（RTPL）",   activity: "全力投球・試合出場" },
          ],
      alert: isConservative
        ? "疼痛がある間は投球は絶対禁止です。安静時疼痛・ROM・腱板筋力・投球テストの全てが問題なくなってから段階的投球プログラムを開始します。"
        : isRepair
        ? "縫合修復後3週間はスリング固定を厳守してください。外旋の強制は縫合部離開リスクがあります。投球再開は最短3ヶ月（必ず医師許可後）です。"
        : "デブリードマン後は固定不要ですが、投球は術後1ヶ月以内禁止です。進行は症状・機能回復に基づき個別に判断します。",
    },
    {
      // Phase 2: 機能回復期
      summary: isConservative
        ? `安静時疼痛は消失しました。外旋ROM・腱板筋力の回復期です。肩甲骨機能の正常化とローテーターカフ強化を中心に進めます。ROM・筋力が健側比80〜90%以上になれば段階的投球プログラムを開始します。`
        : `疼痛は消失しています。外旋ROM・腱板筋力の回復期${surgNote}。肩甲骨機能の正常化とローテーターカフ強化を中心に進めます。GIRD（内旋制限）の修正も重要です。`,
      okList: ["完全ROM（自動）","ローテーターカフ強化","肩甲骨安定化エクササイズ","体幹・下肢連動トレーニング","水泳（クロール除く軽度）"],
      ngList: isConservative
        ? ["投球動作（ROM・筋力・テストクリアまで禁止）","疼痛を誘発する肩の運動","コンタクトプレー"]
        : [isRepair ? "投球動作（術後3ヶ月まで禁止）" : "投球動作（術後1ヶ月まで禁止）","外旋の過剰伸張（修復群は特に注意）","コンタクトプレー"],
      rehabMenu: [
        { title: "ローテーターカフ強化（チューブ外旋）", sets: "15回 × 3セット", note: "離心性もゆっくり。健側比80%が目標",
          details: "チューブを腰の高さに固定し、肘90度・体側固定で外旋方向に引きます。戻す際（離心性収縮）もゆっくり行います。外旋筋（棘下筋・小円筋）の筋力低下はSLAP再発・投球障害の原因です。健側比80%以上を目標にします。等速性筋力測定が可能なら定期的に評価してください。" },
        { title: "肩甲骨安定化（ローイング・シュラッグ）", sets: "15回 × 3セット", note: "スキャプラダイスキネシス修正が再発予防の要",
          details: "チューブや軽ダンベルを使い、肩甲骨を後退・下制させるローイング動作を行います。スキャプラダイスキネシス（肩甲骨機能不全）はSLAP損傷の重要なリスクファクターです。Kin et al. (2026) でも術前の非手術治療として肩甲骨機能の修正が強調されています。" },
        { title: "スリーパーストレッチ（GIRD改善）", sets: "30秒 × 3回（1日2セット）", note: "後方関節包拘縮（GIRD）を改善。Sleeper stretch",
          details: "横向きに寝て患側を下にし、肘90度で前方挙上します。健側の手で患側の手首を床方向に押します（内旋方向）。GIRD（Glenohumeral Internal Rotation Deficit：内旋制限）はSLAP損傷の重要なリスクファクターです。疼痛が出る場合は強度を下げてください。1回30秒、1日2セット以上が推奨です。" },
        { title: "体幹回旋・キネティックチェーントレーニング", sets: "各15回 × 3", note: "下肢→体幹→肩の力の連鎖を早期から構築",
          details: "チューブやメディシンボールを使った体幹回旋運動を取り入れます。投球のパワーは下肢→体幹→肩の順（キネティックチェーン）に伝達されます。この時期から体幹回旋の協調性を鍛えることで、肩への過剰な負荷を分散させる基礎が構築されます。" },
      ],
      timeline: [
        { week: isConservative ? "疼痛消失後" : "3週〜3ヶ月", goal: "ROM・筋力正常化", activity: "外旋強化・肩甲骨安定化・GIRD改善" },
        { week: isConservative ? "ROM・筋力クリア後" : `${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "段階的投球（テスト通過後）" },
        { week: isConservative ? "全テストクリア後" : "6〜9ヶ月",  goal: "競技復帰", activity: isConservative ? "全力投球・試合出場" : "RTPL率79%・平均9ヶ月（Kin 2026）" },
      ],
      alert: "外旋の過剰伸張は修復部への再負荷リスクがあります。外旋ROM改善は段階的に行い、健側と同等になることを確認してから投球を開始してください。",
    },
    {
      // Phase 3: 段階的投球開始期
      summary: `ROM・腱板筋力が正常化。段階的投球プログラムを開始します${surgNote}。Kin & Sugaya (2026) の研究では投球開始平均3ヶ月（デブリードマン群1ヶ月）、RTPL達成平均9ヶ月。距離・強度を段階的に増加させます。`,
      okList: ["段階的投球プログラム（下記参照）","チーム練習の非投球部分への参加","ウェイトトレーニング継続","体幹・下肢の最大強化"],
      ngList: [isRepair ? "術後3ヶ月以前の投球（修復群）" : "術後1ヶ月以前の投球","疼痛を我慢しての投球","球数・強度の急激な増加"],
      rehabMenu: [
        { title: "段階的投球プログラム", sets: "下記の表を参照", note: "各ステップ3日以上実施。疼痛なければ次ステップへ",
          details: `Kin et al.の研究では修復群は術後3ヶ月から、デブリードマン群は術後1ヶ月から投球プログラムを開始しました。投球後は必ず肩の疼痛・腫脹を確認し、翌日に問題なければ次ステップへ進みます。疼痛があれば1段階戻ります。最終的な全力投球・競技復帰は術後6ヶ月以降（医師許可後）です。` },
        { title: "投球後アイシング（毎回必須）", sets: "20分（練習・投球後）", note: "投球後の炎症管理は継続的復帰の要",
          details: "投球練習後は毎回アイシングを実施します。氷嚢をタオルで包み肩関節全体（前後・上方）に当てます。炎症の慢性化を防ぎ、次の練習への回復を促します。省略すると炎症が蓄積し、修復部への再損傷リスクが高まります。投球後アイシングをルーティンとして定着させてください。" },
        { title: "肩甲骨安定化・ローテーターカフ（継続）", sets: "週3〜4回", note: "投球プログラムと並行して継続",
          details: "投球プログラム実施期間中も肩甲骨安定化とローテーターカフ強化を継続します。投球時の肩甲骨の安定性が不足すると肩関節への過剰な負荷がかかり、SLAP再損傷のリスクが上昇します。投球日と筋力トレーニング日をうまく組み合わせてください。" },
        { title: "投球前動的ウォームアップ", sets: "15〜20分（毎回）", note: "冷えた状態での投球は禁止",
          details: "アーム・サークル・ショルダーストレッチ・体幹回旋を含む動的ウォームアップを15〜20分実施します。冷えた状態での投球は組織への負荷が増大します。特に朝練や寒冷環境ではウォームアップを十分に確保してください。" },
      ],
      timeline: [
        { week: isConservative ? "テストクリア後" : `術後${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "10m軽投→段階的に距離・強度増加" },
        { week: isConservative ? "投球プログラム後半" : "術後6ヶ月〜",   goal: "競技距離・強度", activity: "全力投球・マウンドからの投球" },
        { week: isConservative ? "全力投球クリア後" : "術後9ヶ月（目標）", goal: "競技復帰", activity: "試合出場・フルパフォーマンス" },
      ],
      alert: "投球プログラム中に疼痛・apprehension（不安定感）が出たら即中断し、医師・トレーナーに報告してください。疼痛を我慢して投球を続けると修復部の再断裂・慢性化につながります。",
    },
    {
      // Phase 4: 競技復帰期
      summary: `段階的投球プログラムをクリア。全力投球・競技復帰が可能な状態です${surgNote}。Kin & Sugaya (2026) ではRTLP率79%（投手81%）、平均9ヶ月で達成。再発予防のため投球数管理と肩甲骨ケアを継続します。`,
      okList: ["全力投球・競技復帰（医師許可後）","チーム練習への全参加・試合出場","予防トレーニングの継続","球数制限の厳守"],
      ngList: ["疼痛を我慢しての投球継続","肩甲骨機能維持トレーニングの中止","シーズン中の過剰投球（球数制限超過）"],
      rehabMenu: [
        { title: "ローテーターカフ強化（維持）", sets: "週2〜3回", note: "復帰後もシーズン中継続が必須",
          details: "競技復帰後もローテーターカフ（特に外旋筋：棘下筋・小円筋）の強化を継続します。筋力低下はSLAP損傷の再発リスクと関連します。週2〜3回の維持プログラムをシーズン中も継続してください。" },
        { title: "肩甲骨安定化（維持）", sets: "週2〜3回", note: "スキャプラダイスキネシスの再発を防ぐ",
          details: "シーズン中も肩甲骨安定化エクササイズを継続します。疲労やオーバーユースにより肩甲骨機能が低下すると投球フォームが崩れ、SLAP損傷の再発リスクが上昇します。試合後・長期遠征後は特に注意が必要です。" },
        { title: "投球後ケア（アイシング＋スリーパーストレッチ）", sets: "練習・試合後毎回", note: "GIRD蓄積と炎症管理の継続",
          details: "投球後は毎回アイシング（20分）とスリーパーストレッチを実施します。GIRD（内旋制限）の蓄積はSLAP損傷の再発につながります。投球後のルーティンとして定着させてください。特にシーズン中盤以降は慢性的な疲労による内旋制限が蓄積しやすくなります。" },
      ],
      timeline: [
        { week: isConservative ? "全力投球テストクリア後" : "術後6ヶ月〜",      goal: "全力投球可",   activity: "競技距離・全力投球" },
        { week: isConservative ? "競技復帰"             : "術後9ヶ月（目標）", goal: "競技復帰達成", activity: "試合出場・フルパフォーマンス" },
        { week: "復帰後シーズン中",  goal: "再発予防継続",       activity: "肩甲骨ケア・球数管理・GIRD管理" },
      ],
      alert: "Kin & Sugaya (2026) では術後平均9ヶ月でRTPL（元のパフォーマンスレベルへの復帰）を達成しています。焦らず段階的な復帰を心がけてください。違和感・疼痛があれば即座に活動を中止し、医師に報告してください。",
    },
  ];

  const d = data[idx];
  return {
    phase: `Phase ${idx + 1}：${SLAP_PHASES[idx].name}`,
    currentPhaseIndex: idx,
    totalPhases: 4,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: SLAP_PHASES,
    clinicalGuidance: SHOULDER_RTS_GUIDANCE,
    // 肩（SLAP）も投球肘と同じ競技別プログラムに準拠（AF=ルートベース／野球=塁間・マウンド）。手術例は開始フェーズが後ろ倒しになるだけ。
    throwingProgram: idx >= 2 ? getThrowingProgram(p.sport) : undefined,
    throwingCurrentStep: idx >= 2
      ? (() => {
          const last = getThrowingProgram(p.sport).length;
          return idx === 2 ? 1 : !okFullThrow ? Math.min(3, last) : last;
        })()
      : undefined,
  };
}

// --- Shoulder Dislocation ---

function shoulderDislocationPlan(p: GeneratePlanParams): RehabPlan {
  const isRecurrent = p.grade === "recurrent";
  const hasSurgery  = !!p.surgeryDate;
  const td = getTargetDays(p.targetDate);

  // コンタクト・コリジョン競技（初回脱臼でも手術が選択されやすい）
  const contactSports = ["american_football", "rugby", "lacrosse", "judo", "basketball", "other_contact"];
  const isContact = contactSports.includes(p.sport as string);
  const isSoccer  = p.sport === "soccer";

  // ── 術後：執刀医の指示に従う（個別の術後プロトコルは提供しない）──
  if (hasSurgery) {
    return {
      phase: "術後（執刀医管理）",
      currentPhaseIndex: 0,
      totalPhases: 1,
      summary: "肩関節脱臼の術後です。術後の固定期間・可動域制限・筋力強化の開始時期・競技復帰の目安は、術式（鏡視下Bankart修復・Latarjet等）や術中所見により大きく異なります。必ず執刀医・担当理学療法士の指示に従ってください。",
      okList: ["執刀医・理学療法士に指示されたリハビリの実施", "指示された固定期間・可動域制限の遵守", "非患側・体幹・下肢のコンディション維持"],
      ngList: ["執刀医の許可前の自己判断でのROM拡大・筋力強化・競技復帰"],
      rehabMenu: [
        { title: "執刀医の術後プロトコルに従う", sets: "—", note: "術式・所見により内容が異なる",
          details: "本アプリでは個別の術後プロトコルは提供しません。可動域制限・固定期間・筋力強化の開始時期・競技復帰の判断は、すべて執刀医・担当理学療法士の指示に従ってください。" },
      ],
      timeline: [
        { week: "術後", goal: "執刀医の指示に従う", activity: "個別の術後プロトコルに準拠" },
      ],
      alert: "術後プロトコルは術式・術者により異なります。必ず執刀医の指示を最優先にしてください。",
    };
  }

  // ── 保存療法（非手術）の段階的プラン ──
  const okImmobDone    = t(p.tests, "okImmobDone");
  const okROM          = t(p.tests, "okROM");
  const okApprehension = t(p.tests, "okApprehension");
  const okStrength     = t(p.tests, "okStrength");
  const okContact      = t(p.tests, "okContact");

  let idx = 0;
  if      (!okImmobDone)    idx = 0;
  else if (!okROM)          idx = 1;
  else if (!okApprehension) idx = 2;
  else if (!okStrength)     idx = 3;
  else                      idx = 4;
  const fullyReturned = okContact;

  // 手術検討の促し（受診を促すのみ・最終判断は専門医）
  const surgeryGuidance = isRecurrent
    ? "【専門医受診の推奨】反復性脱臼は保存療法のみでは再脱臼を防ぎにくく、安定化手術が適応となることが多いです。スポーツ整形（肩専門医）の受診を勧めます。"
    : isContact
    ? "【専門医受診の推奨】年齢や大会時期にもよりますが、コンタクト・コリジョンスポーツ（アメフト・ラグビー等）の初回脱臼は再脱臼率が高く（若年者で特に高い）、初回から安定化手術が選択されるケースが多いです。保存で進める前に一度スポーツ整形（肩専門医）の受診を強く勧めます。"
    : isSoccer
    ? "【参考】非コンタクト競技の初回脱臼は保存療法が選択されることが多いです。ただしサッカーのGKなど肩への反復ストレス・転倒の多いポジションでは手術が検討されることがあります。判断に迷う場合は肩専門医へ。"
    : "【参考】非コンタクト競技の初回脱臼は保存療法が選択されることが多いです。再脱臼を繰り返す場合や不安感が強い場合は肩専門医の受診を検討してください。";

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };
  const data: D[] = [
    {
      summary: `肩関節（前方）脱臼${isRecurrent ? "（反復性）" : "（初回）"}の急性期・保護期です。三角巾は1週間程度を目安に、疼痛に応じて外して構いません。アイシングと、疼痛・不安定感に応じた保護具（三角巾など）で安静を保ち、再脱臼しやすいABER肢位（外転＋外旋）を厳禁とします。`,
      okList: ["三角巾による保護（1週間程度・疼痛に応じて外す）", "アイシング（疼痛・腫脹時）", "肘・手関節・手指の自動運動", "非患側・体幹・下肢のトレーニング", "肩甲帯の等尺性収縮（痛みのない範囲）"],
      ngList: ["外転＋外旋（ABER）肢位（再脱臼の最大リスク肢位・厳禁）", "肩の他動的なストレッチ・無理なROM", "患側上肢での荷重・物の持ち上げ", "コンタクトプレー・転倒リスクのある動作"],
      rehabMenu: [
        { title: "三角巾による保護＋アイシング", sets: "三角巾1週間程度／アイシング20分", note: "疼痛・不安定感に応じて三角巾を使用、痛みが落ち着けば外す", details: "三角巾は1週間程度を目安に使用し、疼痛に応じて外して構いません。疼痛・不安定感が強いときは保護具（三角巾など）で安静を保ちます。腫脹・疼痛時はアイシング（1回15分・氷嚢やビニール袋の氷を直接押し当てる）を行います。いずれの場合もABER肢位（腕を外に開く動作）を避けることが再脱臼予防の最重要点です。" },
        { title: "手指・肘・手関節の自動運動", sets: "各20回 × 数回/日", note: "関節拘縮予防", details: "手指・手関節・肘を積極的に動かし、浮腫と関節拘縮を予防します。握力訓練（ボール握り）も可能です。肩はABER肢位を避け、痛みの出ない範囲に留めてください。" },
        { title: "肩甲帯等尺性・体幹下肢トレ", sets: "各10〜15回 × 3", note: "痛みのない範囲で全身コンディション維持", details: "肩甲骨の引き寄せ（痛みのない範囲の等尺性）、体幹・下肢のトレーニングで全身のコンディションを維持します。患側肩に負荷・ABER肢位がかからない種目を選びます。" },
      ],
      timeline: [
        { week: "急性・保護期",   goal: "安静時痛の消失",     activity: "三角巾保護（〜1週）・アイシング・ABER厳禁" },
        { week: "→ ROM回復まで",   goal: "ABER以外のROM回復", activity: "段階的可動域訓練" },
        { week: "→ 不安感消失まで", goal: "前方不安感の消失",   activity: "腱板・肩甲帯・固有感覚" },
        { week: "→ 基準クリアで",   goal: "競技復帰",          activity: "コンタクト準備→復帰" },
      ],
      alert: "急性期はABER肢位（外転＋外旋）を厳禁。再脱臼すると不安定性が悪化します。保存は暦の週数ではなく、各段階の基準クリアで進めます。",
    },
    {
      summary: "固定期を終え安静時痛が消失しました。可動域回復期です。ABER（外転＋外旋）以外の方向から段階的にROMを広げ、外転＋外旋方向は再脱臼予防のため後半まで慎重に進めます。",
      okList: ["振り子運動（コッドマン体操）", "ABER以外の自動・自動介助ROM訓練", "肩甲帯の等尺性〜軽い等張性強化", "腱板の低負荷活性化（内旋・外旋・中間位）", "有酸素運動（非患部）"],
      ngList: ["ABER肢位への無理なストレッチ（前方不安感が出る角度）", "重量物の挙上・患側荷重", "コンタクトプレー", "反動をつけたストレッチ"],
      rehabMenu: [
        { title: "振り子運動（コッドマン）", sets: "各方向10回 × 3", note: "脱力して腕の重みで揺らす", details: "前傾して患側上肢を脱力し、腕の重みを利用して前後・左右・円を描くように小さく揺らします。関節への負荷をかけずに可動域と循環を促します。" },
        { title: "段階的ROM訓練（ABER以外）", sets: "各方向10回 × 3", note: "屈曲・外転は痛み/不安感の手前まで", details: "屈曲・外転・内旋・体側での外旋から始めます。外転＋外旋（ABER）方向は前方不安感が出ない範囲に限定し、最後まで慎重に拡大します。痛み・不安感の手前で止めてください。" },
        { title: "腱板・肩甲帯の活性化", sets: "各15回 × 3", note: "セラバンド・低負荷から", details: "体側位（0°外転）でのチューブ外旋・内旋、肩甲骨の引き寄せ（ローイング）から開始します。低負荷・高反復で腱板と肩甲帯の協調を再教育します。前方不安感の出る肢位は避けます。" },
      ],
      timeline: [
        { week: "現在：ROM回復期", goal: "ABER以外ほぼ全ROM", activity: "段階的可動域訓練" },
        { week: "→ 不安感消失まで", goal: "前方不安感の消失",   activity: "腱板・肩甲帯・固有感覚" },
        { week: "→ 基準クリアで",   goal: "競技復帰",          activity: "コンタクト準備→復帰" },
      ],
      alert: "ROM拡大は前方不安感（apprehension）が出ない範囲で。暦の週数ではなく可動域・不安感の状態で進めます。ABER方向を焦ると再脱臼リスクが高まります。",
    },
    {
      summary: "可動域がほぼ回復しました。前方不安感テストがまだ陽性のため、ABER肢位の安定性を高める段階です。腱板・肩甲帯の筋力強化と固有感覚訓練、クローズドキネティックチェーンを進めます。",
      okList: ["全可動域の獲得（ABER方向も段階的に）", "腱板・肩甲帯の等張性筋力強化", "クローズドキネティックチェーン（壁・四つ這い）", "固有感覚・動的安定化訓練", "低負荷プライオメトリクスの導入"],
      ngList: ["前方不安感が出る肢位での高負荷・反動動作", "コンタクト・対人プレー", "全力投球・オーバーヘッドの高速動作（次フェーズ）"],
      rehabMenu: [
        { title: "腱板強化（ER/IR・絶対値重視）", sets: "15回 × 3", note: "体側→段階的に外転角度UP", details: "チューブ・ダンベルで外旋（ER）・内旋（IR）を強化します。ER/IR比だけでなく絶対値（体重で正規化）と受傷前の比較を重視します（Athlete Shoulder Consensus）。体側位から始め、不安感がなければ段階的に外転角度を上げます。" },
        { title: "クローズドキネティックチェーン", sets: "30秒 × 3〜各15回", note: "壁プッシュ→四つ這い→不安定面", details: "壁での荷重プッシュ、四つ這いでの体重支持から始め、安定すれば不安定面（バランスボール上）へ進めます。関節の動的安定性と固有感覚を高めます。肩を脱臼方向に追い込まない範囲で実施します。" },
        { title: "低負荷プライオメトリクス（導入）", sets: "各10回 × 3", note: "ドロップ&キャッチ・速い求心性→ゆっくり遠心性", details: "Athlete Shoulder Consensusはリハ早期からのプライオ導入を推奨しています。側臥位での小さなドロップ&キャッチ、仰臥位での速い求心性→ゆっくり遠心性のバンド外旋などから始めます。痛み・不安感のない範囲で。" },
      ],
      timeline: [
        { week: "現在：筋力強化期", goal: "前方不安感の消失",  activity: "筋力強化・固有感覚・プライオ導入" },
        { week: "→ 筋力80%まで",    goal: "競技動作・コンタクト準備", activity: "スポーツ特異的ドリル" },
        { week: "→ 基準クリアで",   goal: "競技復帰",          activity: "コンタクト耐性確認→復帰" },
      ],
      alert: "前方不安感が残る間はコンタクト・全力オーバーヘッド動作は禁止。暦ではなく不安感・筋力の状態で進め、焦らず安定性を作ります。",
    },
    {
      summary: "前方不安感が消失しました。スポーツ準備期です。プライオメトリクスを進め、競技特異的動作とコンタクトへの準備を段階的に行います。筋力が健側比80%以上になれば最終段階へ。",
      okList: ["全可動域での筋力強化（高負荷へ漸増）", "競技特異的ドリル（段階的）", "プライオメトリクス（負荷・スピード漸増）", "コンタクト準備ドリル（コントロールド）", "オープン＋クローズドチェーンの併用"],
      ngList: ["医師許可前のフルコンタクト・試合", "筋力健側比80%未満でのコンタクト復帰", "疲労時の不安定肢位での無理な動作"],
      rehabMenu: [
        { title: "腱板・肩甲帯 高負荷強化", sets: "8〜12回 × 3〜4", note: "絶対値で健側比80%以上を目標", details: "全可動域での外旋・内旋・肩甲帯強化を高負荷へ漸増します。絶対値（体重正規化）で健側比80%以上、かつ受傷前ベースラインへの接近を目標にします。" },
        { title: "プライオメトリクス（発展）", sets: "各10〜15回 × 3", note: "プレス・キャッチ系で負荷とスピードを漸増", details: "メディシンボールのチェストパス・オーバーヘッドスロー・キャッチ&リリースなどで、求心性・遠心性の高速負荷に肩を慣らします。競技動作に近い肢位・速度へ段階的に近づけます。" },
        { title: "競技特異的ドリル", sets: "練習準拠", note: "ポジション固有の動作を段階的に", details: "ポジション固有の動作を低速→高速、低負荷→高負荷で段階的に再導入します。次のコンタクト段階に向けて、転倒時の受け身や腕の使い方も確認します。" },
      ],
      timeline: [
        { week: "現在：スポーツ準備期", goal: "筋力健側比80%・競技動作可", activity: "プライオ・競技特異的ドリル" },
        { week: "→ 基準クリアで",       goal: "コンタクト耐性確認",        activity: "対人・コンタクト段階的導入" },
      ],
      alert: "コンタクト復帰は筋力・不安感・心理面の全基準クリアと医師許可が前提。アメフトは受傷肢位（タックル・転倒）の再現で必ず確認を。",
    },
    {
      summary: fullyReturned
        ? "全ての基準をクリアしました。競技復帰が可能な状態です。再脱臼予防のため腱板・肩甲帯の維持トレーニングを継続してください。"
        : "競技復帰期です。前方不安感なし・筋力基準クリアを確認し、最後にコンタクト耐性と心理的準備（再脱臼への恐怖がないこと）を満たせば医師許可のもとで復帰します。",
      okList: ["医師許可後の段階的コンタクト復帰", "フルコンタクト・対人プレー（基準クリア後）", "再脱臼予防の維持トレーニング継続", "（必要に応じ）テーピング・装具の併用"],
      ngList: ["医師許可なしの試合・フルコンタクト復帰", "再脱臼への不安・恐怖を抱えたままの復帰", "予防トレーニングの中止（再脱臼リスク上昇）"],
      rehabMenu: [
        { title: "コンタクト段階的復帰", sets: "段階的", note: "コントロールド→対人→フルコンタクト", details: "コントロールされたコンタクト（パッド・ダミー）から対人、フルコンタクトへ段階的に進めます。各段階で翌日に不安感・疼痛の増悪がないことを確認します。受傷肢位（ABER・転倒）の再現で不安がないかを必ず確認してください。" },
        { title: "腱板・肩甲帯 維持トレ", sets: "週2〜3回", note: "シーズン中も継続（最低週2回）", details: "Athlete Shoulder Consensusは予防プログラムを最低週2回行うことを推奨しています。腱板（特に外旋筋）と肩甲帯の維持により再脱臼・不安定性のリスクを下げます。" },
        { title: "肩特異的RPEで負荷管理", sets: "週次でチェック", note: "修正Borg 0〜10で週負荷をモニタ", details: "『今週の肩の負荷はどれくらいきつかったか』を修正Borg（0〜10）で記録し、急激な負荷増加を避けます。疲労時は不安定性が出やすいため負荷調整の指標にします。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "コンタクト耐性・心理面クリア", activity: "段階的コンタクト→試合" },
        { week: "復帰後シーズン中", goal: "再脱臼予防継続",            activity: "腱板・肩甲帯維持・負荷管理" },
      ],
      alert: "コンタクトスポーツの脱臼は再脱臼率が高く、復帰後も再受傷・反復性移行のリスクがあります。違和感・不安感が出たら即中止し医師に報告してください。",
    },
  ];

  // AFポジション特異（スポーツ準備期＝idx3 に追記）
  if (p.sport === "american_football") {
    const pos = p.position;
    if (pos.includes("OL") || pos.includes("DL")) {
      data[3].rehabMenu.push({
        title: "ライン戦コンタクト準備（OL/DL）", sets: "5〜10本",
        note: "ハンドファイト・パンチ・ベンチプレス系の押し負荷を段階的に",
        details: "OL/DLは腕を前方に強く突き出すパンチ／ハンドファイトで脱臼肢位に近い外力がかかります。コントロールドなパンチ動作→ブロッキングバッグ→対人へ段階的に進めます。ベンチプレス等の押す筋力も再導入しますが、深いボトム（過外転＋外旋）は不安感の手前までに留めます。",
      });
    } else if (pos.includes("QB")) {
      data[3].rehabMenu.push({
        title: "QB投球動作の再導入", sets: "段階的",
        note: "投球側の脱臼ではコッキング肢位（ABER）に注意",
        details: "投球側肩の脱臼の場合、コッキング期（最大外転＋外旋＝ABER）が前方不安感の出やすい肢位です。低速・短距離のフォーム固めから段階的に距離・強度を上げます（投球の段階づけは投球プログラムに準じる）。不安感が出る肢位では強度を上げないでください。",
      });
    } else {
      data[3].rehabMenu.push({
        title: "タックル・転倒受け身ドリル（スキル/LB）", sets: "5〜10本",
        note: "転倒時の腕のつき方・タックル肢位を低速から",
        details: "WR/RB/DB/LBは転倒時の手つきやタックルで脱臼肢位（外転＋外旋・突き出し）の外力を受けます。低速の受け身・正しいタックル姿勢（頭を上げ肩で当てる）から再教育し、コントロールド→対人へ進めます。腕を伸ばして外に開いた状態での接触を避ける動作習得が再脱臼予防になります。",
      });
    }
  }

  const phaseLabel = fullyReturned && idx === 4
    ? "競技復帰可（基準クリア）"
    : SHOULDER_DISLOCATION_PHASES[idx].name;

  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 5,
    summary: data[idx].summary,
    okList: data[idx].okList,
    ngList: data[idx].ngList,
    rehabMenu: data[idx].rehabMenu,
    timeline: td ? [...data[idx].timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : data[idx].timeline,
    alert: data[idx].alert,
    phaseTracker: SHOULDER_DISLOCATION_PHASES,
    clinicalGuidance: surgeryGuidance + "\n\n" + SHOULDER_RTS_GUIDANCE,
  };
}

// --- Heat Stroke ---

function heatStrokePlan(p: GeneratePlanParams): RehabPlan {
  const isGradeIII   = p.grade === "III";
  const okSymptom    = t(p.tests, "symptom_free");
  const okOral       = t(p.tests, "oral_intake");
  const okUrine      = t(p.tests, "urine_color");
  const okLight      = t(p.tests, "exercise_light");
  const td           = getTargetDays(p.targetDate);
  const gradeLabel   = p.grade === "I" ? "Ⅰ度（軽症）" : p.grade === "II" ? "Ⅱ度（中等症）" : "Ⅲ度（重症）";

  let idx = 0;
  if      (!okSymptom)           idx = 0;
  else if (!okOral || !okUrine)  idx = 1;
  else if (!okLight)             idx = 2;
  else                           idx = 3;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: D[] = [
    {
      summary: `熱中症 ${gradeLabel} の活動禁止期です。安静・冷却・補水を最優先に行います（日本救急医学会 熱中症ガイドライン2023）。${isGradeIII ? "【Ⅲ度重症】入院加療が必要です。すべての判断を主治医の指示に従ってください。" : ""}`,
      okList: ["安静・冷所での休養", "経口補水液または点滴による補水", "体温モニタリング（30分ごと）", "涼しい環境での安静"],
      ngList: ["一切の運動・身体活動", "炎天下への外出", "アルコール摂取", "スポーツドリンクの過剰摂取（電解質不足になる可能性）"],
      rehabMenu: [
        { title: "体温計測",           sets: "30分ごと",    note: "37.5℃以下まで下がることを確認",
          details: "直腸温または鼓膜温での計測が最も正確です。体表温（脇下）は過小評価になる場合があります。38.5℃以上が続く場合は医療機関を受診してください。" },
        { title: "経口補水液（ORS）",  sets: "500ml/時",    note: "水だけでなく電解質補給が重要",
          details: "経口補水液（OS-1等）はスポーツドリンクより塩分濃度が高く、熱中症による電解質喪失に適しています。嘔吐がある場合は点滴が必要なため医療機関を受診してください。" },
        { title: "クールダウン処置",   sets: "適宜",        note: "氷嚢を頸部・腋窩・鼠径部に当てる",
          details: "大血管が皮膚に近い頸部・腋窩（脇の下）・鼠径部（股関節前面）に氷嚢を当てることで深部体温を効率的に下げられます。皮膚への直接接触は凍傷の可能性があるためタオルで包んでください。" },
      ],
      timeline: [
        { week: "0〜1日",  goal: "完全休養・体温正常化",   activity: "安静・冷却・補水" },
        { week: "1〜3日",  goal: "症状消失確認・水分管理", activity: "室内軽活動開始" },
        { week: "3〜7日",  goal: "軽運動開始",             activity: "ウォーキング・涼しい環境" },
        { week: "7〜14日", goal: "段階的復帰",             activity: "暑熱順化再実施" },
      ],
      alert: isGradeIII
        ? "【Ⅲ度（重症）警告】意識障害・痙攣・臓器障害を伴う重症熱中症です。入院加療が必須です。すべてのリハビリ・復帰判断は主治医の指示に従ってください（日本救急医学会 熱中症ガイドライン2023）。"
        : "安静時の症状が完全に消失するまで運動は一切禁止です。Ⅱ度以上では医師の診察を強く推奨します（日本救急医学会 熱中症ガイドライン2023）。",
    },
    {
      summary: "安静時症状は消失しましたが、水分・栄養状態の確認が必要です。室内での軽活動から開始します。",
      okList: ["室内での軽いストレッチ", "経口補水継続", "認知機能・集中力の確認", "涼しい環境での短時間歩行"],
      ngList: ["屋外での運動", "高温環境への暴露", "激しい活動", "アルコール摂取"],
      rehabMenu: [
        { title: "軽いストレッチ",       sets: "15分",               note: "涼しい室内で。発汗・症状出現に注意",
          details: "静的ストレッチを中心に全身の筋群をゆっくり伸ばします。心拍数が上がりすぎないよう注意し、発汗が増えたり頭痛が出たら即中止します。クーラーの効いた室内で実施してください。" },
        { title: "水分摂取管理",         sets: "体重×30ml/日以上",   note: "尿の色が薄い黄色になるまで補水継続",
          details: "体重60kgの場合は1日1,800ml以上が目安です。スポーツドリンクと経口補水液を組み合わせて電解質も補給します。尿が濃い黄色・茶色の場合は脱水が継続しているサインです。" },
        { title: "尿の色確認",           sets: "毎回",               note: "淡黄色（薄い麦茶程度）が正常",
          details: "尿の色は水分状態の最も簡単な指標です。透明（過剰補水）・淡黄色（正常）・黄色（軽度脱水）・濃い黄色（中等度脱水）・茶色（重度脱水・横紋筋融解の可能性）。茶色の場合は即医療機関を受診してください。" },
      ],
      timeline: [
        { week: "1〜3日",  goal: "症状消失確認・水分管理", activity: "室内軽ストレッチ・補水" },
        { week: "3〜7日",  goal: "軽運動開始",             activity: "早朝・夕方ウォーキング" },
        { week: "7〜14日", goal: "段階的復帰",             activity: "暑熱順化再実施" },
      ],
      alert: "屋外での運動を急いで再開することは再発リスクを高めます。尿の色・疲労感を毎日確認し段階的に進めてください。",
    },
    {
      summary: "症状・水分状態が正常化しました。涼しい環境での軽運動から段階的に負荷を上げる時期です。",
      okList: ["ウォーキング（涼しい時間帯・室内）", "水泳（水温が低い環境）", "段階的に負荷増加（室内から始める）", "体重・尿量の継続確認"],
      ngList: ["炎天下での練習", "高強度インターバルトレーニング", "暑熱環境での活動", "水分補給なしでの運動"],
      rehabMenu: [
        { title: "ウォーキング（涼しい時間帯）", sets: "20分（早朝・夕方）", note: "WBGT25以下の環境で実施",
          details: "WBGTとは暑さ指数（Wet Bulb Globe Temperature）で、環境省の熱中症予防情報サイトで確認できます。WBGT25以下の時間帯（早朝6時前・夕方18時以降が目安）に実施してください。心拍数が最大の60〜70%以下を維持します。" },
        { title: "涼しい環境でのジョグ",         sets: "10〜15分",          note: "室内プール・冷房施設推奨",
          details: "初回は10分程度から始め、症状がなければ翌日以降は徐々に延長します。走後に頭痛・めまいが出た場合は1段階前の活動に戻します。水泳も体温上昇が少ないため有効な代替運動です。" },
        { title: "体重・尿量チェック",           sets: "毎朝",              note: "前日比で体重が1%以上減少した場合は補水強化",
          details: "運動前後の体重測定で水分喪失量を把握します。体重1kg減少＝約1L水分喪失です。朝の体重が前日より1%以上減少している場合は脱水継続のサインです。補水量を増やして対応してください。" },
      ],
      timeline: [
        { week: "3〜7日",  goal: "軽運動開始・暑熱順化準備", activity: "早朝ウォーキング・室内ジョグ" },
        { week: "7〜14日", goal: "段階的復帰",               activity: "通常練習への段階的参加" },
      ],
      alert: "この段階でも炎天下・高強度の運動は禁止です。涼しい環境・早朝・夕方に限定して運動を再開してください（日本救急医学会 熱中症ガイドライン2023）。",
    },
    {
      summary: "軽運動での症状再出現なし。通常練習への段階的復帰が可能です。暑熱順化を再実施しながら復帰します。",
      okList: ["通常練習への段階的復帰（暑熱順化を再実施）", "熱中症予防策（WBGT確認・水分補給計画）の継続", "チーム全体での予防教育"],
      ngList: ["突然のフル練習復帰", "暑熱順化なしでの高強度運動", "WBGT31以上での運動（原則中止）", "水分補給なしでの長時間練習"],
      rehabMenu: [
        { title: "暑熱順化プログラム",   sets: "7〜10日間",       note: "徐々に暑熱環境での運動時間を延長",
          details: "暑熱順化とは暑い環境での運動に身体を慣らす過程です。7〜10日間かけて暑熱環境での運動時間を徐々に延長します（Day1：30分→Day7：90分）。発汗能力・血漿量・心機能が改善し熱中症リスクが大幅に低下します。前回の熱中症後は必ず再実施してください。" },
        { title: "WBGT確認・運動調整",   sets: "練習前・中",      note: "WBGT28以上で強度低下、31以上で運動中止",
          details: "環境省「熱中症予防情報サイト」でWBGTを確認します。25〜28：警戒（激しい運動は休憩多く）、28〜31：厳重警戒（激しい運動は中止）、31以上：危険（運動は原則中止）。チームで共有して判断してください。" },
        { title: "水分補給計画",         sets: "練習前・中・後",  note: "20〜30分ごとに150〜250ml補給",
          details: "練習前：体重1kgあたり5〜7ml補給。練習中：20〜30分ごとに150〜250ml補給。練習後：失った体重の150%量を補給（0.5kg減→750ml補給）。塩分も忘れずに（スポーツドリンクまたは塩飴）。" },
      ],
      timeline: [
        { week: "7〜14日",  goal: "段階的復帰・暑熱順化",  activity: "通常練習への段階的参加" },
        { week: "14日以降", goal: "完全復帰・再発予防継続", activity: "WBGT管理・水分補給計画の継続" },
      ],
      alert: "熱中症は再発リスクが高い傷害です。暑熱順化（7〜10日）を必ず再実施し、WBGT28以上での練習は中止基準を設けてください。熱中症を経験した選手は翌年も同じ環境で再発するリスクが高いため、シーズン序盤の段階的負荷増加が重要です（日本救急医学会 熱中症ガイドライン2023）。",
    },
  ];

  const d = data[idx];
  return {
    phase: `Phase ${idx + 1}：${HEAT_STROKE_PHASES[idx].name}`,
    currentPhaseIndex: idx,
    totalPhases: 4,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: HEAT_STROKE_PHASES,
    clinicalGuidance: "出典：日本救急医学会 熱中症ガイドライン2023。本プランは同ガイドラインの重症度分類（Ⅰ〜Ⅲ度）・初期対応・復帰基準に準拠しています。\n※ Ⅲ度（重症）は入院加療が必須です。医師の許可なく活動再開しないでください。",
  };
}

// --- Groin Pain ---

const GROIN_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "疼痛管理期",   desc: "負荷調整・Sprint/Kick制限（上流に同時アプローチ）", duration: "負荷調整下で無痛まで" },
  { phase: 2, name: "可動性期",     desc: "胸郭回旋・股関節内旋・内転筋過緊張の軽減",        duration: "可動性回復まで" },
  { phase: 3, name: "安定性期",     desc: "Hip rotator cuff・中/小殿筋・IAP",               duration: "片脚で骨盤制御できるまで" },
  { phase: 4, name: "協調性期",     desc: "減速制御・切り返し・Copenhagen漸増",             duration: "片脚スクワット無痛10回まで" },
  { phase: 5, name: "競技復帰期",   desc: "競技特異ドリル→RTP（4基準）",                    duration: "RTP4基準クリアで復帰" },
];

function groinPlan(p: GeneratePlanParams): RehabPlan {
  const okPainControl  = t(p.tests, "okPainControl");
  const okMobility     = t(p.tests, "okMobility");
  const okStability    = t(p.tests, "okStability");
  const okCoordination = t(p.tests, "okCoordination");
  const okRTP          = t(p.tests, "okRTP");
  const td             = getTargetDays(p.targetDate);

  const typeLabels: Record<string, string> = {
    adductor:  "Adductor-related（内転筋関連）",
    iliopsoas: "Iliopsoas-related（腸腰筋関連）",
    inguinal:  "Inguinal-related（鼠径部関連）",
    pubic:     "Pubic-related（恥骨関連）",
  };
  const typeLabel = typeLabels[p.grade] ?? "グロインペイン症候群";
  const typeNote: Record<string, string> = {
    adductor:  "内転筋付着部（恥骨下枝）への剪断ストレスが主座。squeeze testでモニタリング。",
    iliopsoas: "腸腰筋の関与が主座。股関節屈曲抵抗・PM test陽性に注意し、腸腰筋の過緊張・出力も評価。",
    inguinal:  "鼠径管部の関与が主座。腹圧（IAP）管理と鼠径部への剪断ストレス軽減を重視。",
    pubic:     "恥骨結合の関与が主座。MRIで恥骨BME・Cleft signを確認するが、BMEは無症候者にも高頻度で復帰可否を単独で決めない。",
  };
  const typeEmphasis = typeNote[p.grade] ?? "複合型（例：内転筋＋恥骨）が最多。包括的に評価する。";
  const isSoccer = p.sport === "soccer";

  let idx = 0;
  if      (!okPainControl)  idx = 0;
  else if (!okMobility)     idx = 1;
  else if (!okStability)    idx = 2;
  else if (!okCoordination) idx = 3;
  else                      idx = 4;
  const fullyReturned = okRTP;

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: D[] = [
    {
      summary: `グロインペイン症候群（${typeLabel}）の疼痛管理期です。鼠径部痛は「結果」であり、股関節・骨盤の機能障害が上流の原因です（痛い場所≠原因）。安静だけでは再発するため、負荷調整を最優先にしつつ、上流（胸郭・股関節）の機能へ同時にアプローチします。${typeEmphasis}`,
      okList: ["負荷調整（練習量・強度を疼痛のない範囲に落とす）", "スプリントは原則禁止から（VASを指標に段階的に）", `キックは制限〜禁止から（${isSoccer ? "サッカーは" : ""}疼痛・全身状態に応じ漸増）`, "疼痛のない範囲の体幹・骨盤の等尺性＋IAP（腹圧）導入", "上流（胸郭回旋・股関節）への早期アプローチ開始", "非荷重・非衝撃の有酸素（自転車・水中）"],
      ngList: ["痛い部位だけの局所治療に終始する（よくある失敗）", "内転筋のストレッチのしすぎ（防御収縮を悪化させる）", "スプリント・キックの早すぎる再開", "疼痛を我慢した練習継続"],
      rehabMenu: [
        { title: "負荷調整＋Sprint/Kick制限", sets: "VASを指標に", note: "最も『現場的』なフェーズ。選手・コーチと合意形成", details: "患部への機械的ストレスを最小化します。スプリントは原則禁止から、キックは制限〜禁止から開始し、VAS（疼痛スコア）を指標に疼痛のない範囲で段階的に戻します。選手・コーチへの説明と合意形成が治療成否を左右します。" },
        { title: "疼痛モニタリング（VAS・squeeze）", sets: "毎日〜練習毎", note: "経時的に記録（動画・数値）", details: "VASとAdductor Squeeze Test（45°）で疼痛・出力の左右差を経時的に記録します。リハ進捗の客観的指標になります。2以上の疼痛が続く・増悪する場合は負荷を下げます。" },
        { title: "体幹・骨盤の等尺性＋IAP導入", sets: "各30秒〜10回 × 3", note: "腹腔内圧（呼吸＋腹横筋）で骨盤剛性", details: "プランク・ドローインに加え、呼吸戦略と連動した腹横筋の再活性化でIAP（腹腔内圧）を高め、骨盤の剛性を作ります。患部に負荷をかけずに開始できます。" },
        { title: "上流（胸郭・股関節）への早期介入", sets: "各10回 × 2〜3", note: "胸郭回旋・股関節モビリティの評価と導入", details: "鼠径部の負荷は胸郭・股関節の機能不全を腰・骨盤で代償することで増えます。疼痛管理と並行して上流の評価・介入を始めます（詳細は可動性期へ）。" },
      ],
      timeline: [
        { week: "疼痛管理期",       goal: "負荷調整下で無痛", activity: "負荷調整・Sprint/Kick制限・上流へ同時介入" },
        { week: "→ 可動性回復まで",  goal: "可動性獲得",       activity: "胸郭回旋・股関節内旋・内転筋過緊張軽減" },
        { week: "→ 片脚骨盤制御まで", goal: "安定性獲得",       activity: "Hip rotator cuff・殿筋・IAP" },
        { week: "→ RTP4基準クリアで", goal: "競技復帰",         activity: "協調性→競技特異ドリル→試合" },
      ],
      alert: "高校生以下で2週間以上続く鼠径部痛は専門医評価を（鑑別：恥骨疲労骨折・FAI・スポーツヘルニア・内科疾患）。安静のみ・局所治療のみは再発します。負荷調整と上流の機能への同時アプローチが鍵です。",
    },
    {
      summary: `疼痛が管理下に入りました。可動性期（Phase 2-a）です。鼠径部への代償ストレスの上流にある胸郭回旋・股関節内旋の可動性を回復し、内転筋の過緊張（防御収縮）を軽減します。内転筋は「ストレッチのしすぎ」を避け、神経筋リラクゼーション（PNF等）を優先します。`,
      okList: ["胸郭回旋モビリティ", "股関節内旋モビライゼーション（関節包レベル）", "内転筋過緊張の軽減（PNF・神経筋リラクゼーション）", "Hip3（Thoracic Rotation・Bird&Dog・Get Up Cross）導入", "疼痛なし範囲の有酸素継続"],
      ngList: ["内転筋の過度なストレッチ（防御収縮を悪化）", "痛みを誘発する可動域end-feelまでの伸張", "スプリント・キック（まだ）", "コンタクトプレー"],
      rehabMenu: [
        { title: "胸郭回旋モビリティ", sets: "各10回 × 2〜3", note: "体幹回旋不足は股関節への代償を増やす", details: "胸郭（Thoracic）の回旋可動性を優先的に回復します。胸郭回旋が不足すると股関節・鼠径部への代償ストレスが増えます。Hip3のThoracic Rotationを活用します。" },
        { title: "股関節内旋モビライゼーション", sets: "各10回 × 2〜3", note: "内旋制限はキック・切り返しで鼠径部負荷↑", details: "股関節内旋制限はキックや切り返しで鼠径部への負荷を増やします。関節包レベルのモビライゼーションで内旋の左右差を改善します。FADIR/FABERで評価しながら進めます。" },
        { title: "内転筋過緊張の軽減（PNF）", sets: "各20〜30秒 × 3", note: "ストレッチしすぎない。神経筋リラクゼーション優先", details: "疼痛による内転筋の防御収縮を、強いストレッチではなくPNF（収縮‐弛緩）など神経筋リラクゼーションで解除します。内転筋のストレッチのしすぎは『よくある失敗』です。" },
        { title: "Hip3（Bird&Dog・Get Up Cross）", sets: "各10回 × 2〜3", note: "可動性と安定性の橋渡し", details: "Bird & Dog（四つ這い対角伸展・腰を反らさない）、Get Up Cross（対角の起き上がり）で胸郭‐骨盤‐股関節の連動を再教育します（Dr.Jimmy Hip3）。" },
      ],
      timeline: [
        { week: "現在：可動性期",     goal: "胸郭回旋・股関節内旋の改善", activity: "モビリティ・内転筋過緊張軽減・Hip3" },
        { week: "→ 片脚骨盤制御まで",  goal: "安定性獲得",               activity: "Hip rotator cuff・殿筋・IAP" },
        { week: "→ RTP4基準クリアで",  goal: "競技復帰",                 activity: "協調性→競技特異ドリル→試合" },
      ],
      alert: "内転筋はストレッチしすぎないこと（防御収縮の悪化）。可動性は『痛い内転筋』ではなく、上流の胸郭・股関節から回復させます。",
    },
    {
      summary: `可動性が回復しました。安定性期（Phase 2-b）です。単一筋の強化ではなく、連動した動的安定化機構を再教育します。Hip rotator cuff（深層外旋筋＋腸腰筋）で股関節の動的求心位を確保し、中殿筋・小殿筋で骨盤側方を安定させ、IAP（腹腔内圧）で体幹剛性を作ります。`,
      okList: ["Hip rotator cuff（深層外旋筋＋腸腰筋）の動的求心位", "中殿筋・小殿筋（片脚立位での独立収縮）", "IAP（呼吸戦略＋腹横筋）の体幹剛性", "Copenhagen Adduction導入（ショートレバー＝膝つきから）", "骨盤制御下での片脚エクササイズ"],
      ngList: ["代償（骨盤ドロップ・Knee-in・体幹偏位）が出る状態での負荷増加", "神経筋制御の強度管理を欠いた高負荷（よくある失敗）", "スプリント・全力キック", "コンタクトプレー"],
      rehabMenu: [
        { title: "Hip rotator cuff", sets: "各15回 × 3", note: "深層外旋筋＋腸腰筋で動的求心位", details: "深層外旋筋群・梨状筋・腸腰筋・中殿筋の協調的活動で股関節を動的求心位に保つ再教育を行います。単一筋でなく連動した安定化機構を作ります。" },
        { title: "中殿筋・小殿筋（独立収縮）", sets: "各15回 × 3", note: "片脚立位で骨盤ドロップ・Knee-inなし", details: "中殿筋・小殿筋は骨盤側方安定の主動筋です。片脚立位で代償（トレンデレンブルグ様の骨盤ドロップ・体幹偏位・Knee-in）なしに独立して収縮できるかを確認しながら強化します。" },
        { title: "IAP（腹腔内圧）トレーニング", sets: "各5〜10呼吸 × 3", note: "呼吸戦略＋腹横筋の再活性化", details: "呼吸と連動した腹横筋の再活性化でIAPを高め、体幹剛性を生み出します。ASLRで腰椎伸展代償・骨盤前傾が出ないことを目標にします。" },
        { title: "Copenhagen Adduction（ショートレバー）", sets: "6〜8回 × 3", note: "膝つき（短レバー）から離心性を導入", details: "Copenhagen Adductionをショートレバー（膝で支持）から導入します。内転筋の離心性筋力はグロイン傷害の予防・再発予防の中核です（Harøy 2017）。痛みなく行える範囲で開始します。" },
      ],
      timeline: [
        { week: "現在：安定性期",     goal: "片脚で骨盤制御", activity: "Hip rotator cuff・殿筋・IAP・Copenhagen導入" },
        { week: "→ 片脚スクワット10回", goal: "協調性獲得",    activity: "減速制御・切り返し・Copenhagen漸増" },
        { week: "→ RTP4基準クリアで",   goal: "競技復帰",      activity: "競技特異ドリル→試合" },
      ],
      alert: "神経筋制御は『強度管理』が重要（よくある失敗）。代償（骨盤ドロップ・Knee-in）が出ない範囲で負荷を上げます。",
    },
    {
      summary: `安定性が獲得できました。協調性期（Phase 3）です。獲得した安定性を動的・高速な条件で発揮できるよう、クロスモーション（対角の四肢協調）、減速制御（偏心性＝内転筋の衝撃吸収）、切り返しを訓練します。Copenhagen Adductionはロングレバーへ漸増します。次フェーズ（RTP）への移行目安は「痛みなく片脚スクワット10回」です。`,
      okList: ["クロスモーション（対角四肢協調・体幹回旋の競技統合）", "減速制御ドリル（偏心性・内転筋の衝撃吸収）", "切り返し（低速→高速）", "Copenhagen Adduction（ロングレバーへ漸増）", "ランニング（ジョグ→ダッシュ）", ...(isSoccer ? ["キック段階再開（インサイド短距離→中距離）"] : ["キック・競技動作の段階的再開"])],
      ngList: ["切り返し・減速で骨盤制御が崩れる状態での高速反復", "片脚スクワットで痛みが出る段階での高強度", "疼痛を我慢した動作", "医師・トレーナー管理外での全力スプリント"],
      rehabMenu: [
        { title: "クロスモーション", sets: "各10回 × 3", note: "対角の上下肢クロスパターン", details: "上下肢の協調的なクロスパターンで、体幹回旋力を競技動作へ統合します。胸郭‐骨盤‐股関節の連動を高速・動的条件へつなげます。" },
        { title: "減速制御ドリル", sets: "各5〜8回 × 3", note: "スプリント後の急停止・方向転換の偏心性制御", details: "スプリント後の急停止・方向転換で、内転筋の偏心性（衝撃吸収）制御を再獲得します。減速時に骨盤が前傾・回旋し過ぎないことを確認します。" },
        { title: "切り返し（低速→高速）", sets: "5〜10分", note: "骨盤制御下で角度・速度を漸増", details: "45°→90°→鋭角の切り返しを低速から導入し、減速時の骨盤制御・体幹回旋・股関節屈曲（浅くならない）を確認しながら速度を上げます。" },
        { title: "Copenhagen Adduction（ロングレバー）", sets: "8〜12回 × 3", note: "足首支持の長レバーへ漸増", details: "支持位置を膝から足首（ロングレバー）へ移し、内転筋離心性の負荷を高めます。RTPの機能テスト（Copenhagen Adductor）にもつながります（Harøy 2017）。" },
        ...(isSoccer ? [{ title: "キック段階再開（サッカー）", sets: "本数を制限し漸増", note: "インサイド短距離パス→中距離→ロング", details: "サッカーのグロインはキック動作が主負荷です。インサイドの短距離パスから始め、疼痛なく翌日の増悪がなければ中距離→ロングキックへ本数を制限しながら段階的に上げます。" }] : []),
      ],
      timeline: [
        { week: "現在：協調性期",       goal: "減速・切り返し制御", activity: "クロスモーション・減速・切り返し・Copenhagen漸増" },
        { week: "→ 片脚スクワット10回",  goal: "RTP準備",           activity: "競技特異ドリル・RTP評価" },
        { week: "→ RTP4基準クリアで",    goal: "競技復帰",          activity: "競技特異ドリル→試合" },
      ],
      alert: "次フェーズ（RTP）への移行目安は『痛みなく片脚スクワット10回』。減速・切り返しの骨盤制御を必ず確認します。スプリント再開は最後（よくある失敗：早すぎる再開）。",
    },
    {
      summary: fullyReturned
        ? `RTPの4基準を満たしました。競技完全復帰が可能です（${typeLabel}）。復帰後も内転筋強化（Copenhagen）を継続し、再発を予防します。`
        : `競技復帰期（Phase 4）です。チーム練習→競技特異ドリル（加速・変向・接触）→試合形式へ段階的に進め、RTPの4基準（①疼痛VAS安静/運動0〜1、②内転筋筋力 患側/健側比≧90%、③機能テスト＝Copenhagen/squeeze陰性・ジョグ→ダッシュ・直線→カット・トリプルホップ、④心理的レディネス）を満たして復帰します。`,
      okList: ["競技特異ドリル（加速・変向・接触）", "チーム練習→試合形式へ段階的に", "Copenhagen Adduction維持（週2〜3回・予防）", "復帰後も時間・強度・距離を微調整", ...(isSoccer ? ["キック完全復帰（ロング・セットプレー）・対人"] : [])],
      ngList: ["『痛みがない』だけでの復帰判断（機能基準との複合が必須）", "予防トレーニング（Copenhagen）の中止", "Sprint再開を急ぐ", "医師許可なしの試合復帰"],
      rehabMenu: [
        { title: "競技特異ドリル→試合形式", sets: "段階的", note: "加速・変向・接触を含め負荷下で監視", details: "加速・減速・変向・接触を含む競技特異的ドリルを段階的に行い、負荷下で疼痛・骨盤制御を監視します。チーム練習フル参加→試合形式へ進めます。復帰時も時間・強度・距離を微調整します。" },
        { title: "RTP判定（4基準＋HAGOS）", sets: "復帰判断時", note: "VAS・内転筋筋力比≧90%・機能テスト・心理", details: "①疼痛VAS安静/運動0〜1、②ダイナモメーターで内転筋筋力 患側/健側比≧90%（内転筋優位）、③機能テスト（Copenhagen Adductor・squeeze陰性・ジョグ→ダッシュ・直線→カット・トリプルホップ）、④心理的レディネス。HAGOS（日本語版）も活用。触診で恥骨・内転筋付着部（・腸腰筋）の圧痛消失を確認。" },
        { title: "Copenhagen Adduction（維持・予防）", sets: "週2〜3回", note: "シーズン通じて継続（FIFA 11+）", details: "Copenhagen Adductionをシーズン中も週2〜3回継続します。内転筋の離心性筋力維持がグロイン傷害の発症・再発を有意に減らします（Harøy 2017 / FIFA 11+）。" },
      ],
      timeline: [
        { week: "現在：競技復帰期",   goal: "RTP4基準クリア・完全復帰", activity: "競技特異ドリル→試合形式", criteria: "VAS0〜1・内転筋筋力比≧90%・機能テスト・心理的準備" },
        { week: "復帰後シーズン中", goal: "再発予防継続",            activity: "Copenhagen維持・負荷管理・モニタリング" },
      ],
      alert: "BME（骨髄浮腫）の残存は復帰不可を意味しません（無症候アスリートの約65%に分布）。復帰は機能基準（圧痛消失・squeeze陰性・左右対称の筋力/ROM・競技特異的パフォーマンス到達）で判断します。",
    },
  ];

  // サッカー以外でキック競技の場合の軽い補足は省略（汎用文で対応）

  const phaseLabel = fullyReturned && idx === 4 ? "競技復帰可（4基準クリア）" : GROIN_PHASES[idx].name;
  const d = data[idx];
  return {
    phase: `Phase ${idx + 1}：${phaseLabel}`,
    currentPhaseIndex: idx,
    totalPhases: 5,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: GROIN_PHASES,
    clinicalGuidance:
      "■ 核心：痛い場所≠原因\n" +
      "・鼠径部痛は『結果』であり、股関節・骨盤の機能障害が上流の原因。安静のみ・局所治療のみは再発する。\n" +
      "・背景にFAI（Cam/Pincer/Mix）＋関節唇の吸着作用（Suction seal）の破綻→microinstability→代償→恥骨への剪断ストレス。\n" +
      "■ 分類（Doha Agreement／Weir 2015 BJSM）\n" +
      "・内転筋関連／腸腰筋関連／鼠径部関連／恥骨関連の4型。複合型（内転筋＋恥骨）が最多。\n" +
      `・現在の分類：${typeLabel} — ${typeEmphasis}\n` +
      "■ 評価（画像より先に動きを見る）\n" +
      "・股関節ROM（内旋低下・左右差）、Adductor Squeeze Test(45°)、ASLR（腰椎伸展代償・骨盤前傾）、片脚動作（骨盤ドロップ・体幹偏位・Knee-in）、Cutting（減速時の骨盤制御・体幹回旋・股関節屈曲不足）、PM/FADIR/FABER。\n" +
      "・MRI：BME・Cleft sign・関節唇損傷を確認。ただしBMEは無症候アスリートにも高頻度（約65%）で、浮腫残存＝復帰不可ではない。\n" +
      "■ 介入（5フェーズ）\n" +
      "・①疼痛管理（負荷調整・Sprint/Kick制限）→②可動性（胸郭回旋・股関節内旋・内転筋過緊張軽減：ストレッチしすぎない）→③安定性（Hip rotator cuff・中/小殿筋・IAP）→④協調性（クロスモーション・減速制御・切り返し・Copenhagen漸増）→⑤RTP。\n" +
      "・よくある失敗：痛い部位だけ治療／内転筋ストレッチのしすぎ／Sprint再開が早すぎ／神経筋制御の強度管理不足。\n" +
      "■ RTP4基準\n" +
      "・①疼痛VAS安静/運動0〜1、②内転筋筋力 患側/健側比≧90%、③機能テスト（Copenhagen Adductor・squeeze陰性等）、④心理的レディネス。『痛みがない』だけでは根拠にならない。\n" +
      "■ エビデンス\n" +
      "・Hölmich P, et al. Active physical training for long-standing adductor-related groin pain: RCT. Lancet 1999;353:439-443.\n" +
      "・Serner A, … Hölmich P. RTS After Criteria-Based Rehab of Acute Adductor Injuries. OJSM 2020.\n" +
      "・Harøy J, et al. Copenhagen Adduction in FIFA 11+: RCT. AJSM 2017;45(13):3052-3059.\n" +
      "・Weir A, et al. Doha Agreement. Br J Sports Med 2015;49:768-774. ／ HAGOS（Sugano 日本語版）。",
  };
}

// ---- Main Entry Point ----

export function generatePlan(p: GeneratePlanParams): RehabPlan {
  let result: RehabPlan;
  switch (p.injuryId) {
    case "hamstring":
    case "quadriceps":
      result = muscleStrainPlan(p); break;
    case "ankle_sprain":
      result = anklePlan(p); break;
    case "meniscus":
      result = meniscusPlan(p); break;
    case "rotator_cuff":
      result = rotatorCuffPlan(p); break;
    case "mcl":
      result = mclPlan(p); break;
    case "concussion":
      result = concussionPlan(p); break;
    case "elbow_throwing":
      result = elbowThrowingPlan(p); break;
    case "slap_lesion":
      result = slapPlan(p); break;
    case "shoulder_dislocation":
      result = shoulderDislocationPlan(p); break;
    case "spondylolysis":
      result = spondylolysisPlan(p); break;
    case "stress_fracture":
      result = stressFracturePlan(p); break;
    case "heat_stroke":
      result = heatStrokePlan(p); break;
    case "groin":
      result = groinPlan(p); break;
    default:
      result = genericPlan(p);
  }
  // POLICE: 急性外傷で受傷7日以内に表示。
  // 除外：脳震盪・熱中症（性質が異なる）、肩関節脱臼（下肢向けPOLICE原則が馴染まない）、
  //       腰椎分離症・下肢疲労骨折（緩徐発症の骨ストレス障害で受傷日/72時間/アイシングの概念が当てはまらない）。
  const noPolice = ["concussion", "heat_stroke", "shoulder_dislocation", "rotator_cuff", "spondylolysis", "stress_fracture", "groin"];
  const daysFromInjury = getDays(p.injuryDate);
  if (!noPolice.includes(p.injuryId) && daysFromInjury <= 7) {
    result = { ...result, showPolice: true };
  }
  return result;
}
