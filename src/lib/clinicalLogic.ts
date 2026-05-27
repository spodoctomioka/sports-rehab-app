// ---- Types ----

export type InjuryId =
  | "hamstring" | "quadriceps" | "ankle_sprain" | "ACL" | "meniscus"
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

export interface TestItem { id: string; title: string; description: string; icon: string }
export interface TestResult { id: string; result: boolean | null | "doctor_pending" }
export interface RehabMenuItem { title: string; sets: string; note: string; details?: string }
export interface TimelineRow { week: string; goal: string; activity: string; criteria?: string }
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
  /** エビデンス・出典情報 */
  clinicalGuidance?: string;
  /** 目標日逆算・進捗見通し */
  progressNote?: string;
  /** 段階的投球プログラム：現在の推奨ステップ番号 */
  throwingCurrentStep?: number;
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

export const GRTP_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "完全安静",           desc: "症状消失まで活動禁止",       duration: "症状消失まで" },
  { phase: 2, name: "軽度有酸素運動",     desc: "ウォーキング・水泳",         duration: "最低24時間" },
  { phase: 3, name: "スポーツ特異的運動", desc: "ランニング（コンタクトなし）", duration: "最低24時間" },
  { phase: 4, name: "非コンタクット練習", desc: "ドリル・技術練習",           duration: "最低24時間" },
  { phase: 5, name: "コンタクット練習",   desc: "医師許可後のフル練習",       duration: "最低24時間" },
  { phase: 6, name: "試合復帰",           desc: "通常の競技参加",             duration: "—" },
];

export const HEAT_STROKE_PHASES: PhaseTrackerItem[] = [
  { phase: 1, name: "活動禁止期", desc: "完全安静・症状消失待ち",      duration: "0〜1日" },
  { phase: 2, name: "軽活動可",   desc: "症状消失確認・水分管理",      duration: "1〜3日" },
  { phase: 3, name: "段階復帰",   desc: "軽運動開始・暑熱順化準備",   duration: "3〜7日" },
  { phase: 4, name: "完全復帰",   desc: "段階的復帰・暑熱順化実施",   duration: "7〜14日" },
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
  spondylolysis: [
    { value: "early",       label: "初期（疲労蓄積期）", desc: "骨折線なし・MRI高信号のみ" },
    { value: "progressive", label: "進行期（骨折線あり）", desc: "両側性・骨折線明瞭" },
    { value: "terminal",    label: "終末期（偽関節）",   desc: "骨癒合困難・偽関節形成" },
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
  // concussion: グレード不要のため削除
  slap_lesion: [
    { value: "stable",   label: "安定型（デブリードマン）", desc: "後上方関節唇の不安定性なし・固定縫合不要" },
    { value: "unstable", label: "不安定型（縫合修復）",     desc: "前上方関節唇の不安定性あり・縫合アンカー固定" },
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
  { id: "ACL",                  label: "前十字靱帯損傷（ACL）",      area: "下肢", usesJiss: false, icon: "🦴", showDoctorOption: true, hasSurgery: true },
  { id: "meniscus",             label: "半月板損傷",                 area: "下肢", usesJiss: false, icon: "🦴", hasSurgery: true },
  { id: "stress_fracture",      label: "脛骨疲労骨折",               area: "下肢", usesJiss: false, icon: "🦴", showDoctorOption: true, hasSurgery: true },
  { id: "spondylolysis",        label: "腰椎分離症",                 area: "体幹", usesJiss: false, icon: "🦴", showDoctorOption: true, hasSurgery: true },
  { id: "rotator_cuff",         label: "腱板損傷",                   area: "上肢", usesJiss: false, icon: "💪", hasSurgery: true },
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
    { id: "okWalk",    title: "歩行痛なし",       description: "通常歩行時に患部の疼痛がないか",                               icon: "🚶" },
    { id: "okStretch", title: "ストレッチ痛なし", description: "SLR 70°以上まで伸張して疼痛がないか",                          icon: "🤸" },
    { id: "okPress",   title: "圧痛なし",         description: "患部を直接圧迫しても疼痛が出ないか",                           icon: "👆" },
    { id: "okResist",  title: "抵抗運動痛なし",   description: "【実施方法】椅子に腰掛け膝を約90度に曲げ、下腿後面（膝裏から10cm下）に反対の手またはタオルを当て、膝を曲げる方向に50〜70%の力で5〜10秒押し返す。補助者不要・1人で可（椅子の脚を使っても可）。大腿後面（患部）に鋭い疼痛が出なければ「可」。",           icon: "💪" },
    { id: "okPsych",   title: "心理的準備完了",   description: "再受傷への不安が少なく、スポーツ動作に自信があるか",           icon: "🧠" },
  ],
  quadriceps: [
    { id: "okWalk",    title: "歩行痛なし",       description: "通常歩行時に患部の疼痛がないか",                               icon: "🚶" },
    { id: "okStretch", title: "ストレッチ痛なし", description: "膝屈曲 130°以上まで伸張して疼痛がないか",                      icon: "🤸" },
    { id: "okPress",   title: "圧痛なし",         description: "患部を直接圧迫しても疼痛が出ないか",                           icon: "👆" },
    { id: "okResist",  title: "抵抗運動痛なし",   description: "【実施方法】椅子の端に腰掛けて膝を約90度に曲げ、下腿前面（膝の前側）に反対の手を当て、膝を伸ばす方向に50〜70%の力で5〜10秒押し返す。補助者不要・1人で可。大腿前面（患部）に鋭い疼痛が出なければ「可」。",                       icon: "💪" },
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
  spondylolysis: [
    { id: "okPainFree",   title: "安静時疼痛なし",         description: "安静時・日常生活での腰部疼痛が消失しているか",                           icon: "😴" },
    { id: "okStorkTest",  title: "Storkテスト陰性",        description: "患側一本脚立位で腰部後屈した際に疼痛がないか（片脚過伸展テスト）",           icon: "🦩" },
    { id: "okWalk",       title: "歩行・ADL痛なし",        description: "通常歩行・日常生活動作で腰部疼痛がないか",                               icon: "🚶" },
    { id: "okJog",        title: "ジョグ可",               description: "10〜15分のジョグで腰部疼痛が出ないか",                                  icon: "🏃" },
    { id: "okSportMove",  title: "競技動作可",             description: "疼痛なく競技特異的動作（体幹回旋・ランニング・ジャンプ等）が可能か",           icon: "🏅" },
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
    { id: "okBalance",   title: "バランス正常", description: "【自己テスト】①両足揃え・目を閉じ20秒 ②片脚立ち（利き足でない方）・目を閉じ20秒 ③タンデム立位（前後に一直線に足を並べる）・目を閉じ20秒。いずれもふらつき・転倒・バランス崩れが受傷前と比べて明らかに増えていなければ「可」。自信がなければ「不可」を選択。", icon: "⚖" },
    { id: "okExercise",  title: "運動増悪なし", description: "軽度有酸素運動後も症状増悪がないか",             icon: "🏃" },
    { id: "okSleep",     title: "睡眠正常",     description: "睡眠障害（過眠・不眠）がないか",                 icon: "😴" },
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
    { id: "okPain",      title: "安静時疼痛なし",   description: "安静時・歩行時に鼠径部・内転筋の疼痛がないか",                              icon: "😴" },
    { id: "okAdductor",  title: "内転筋テスト陰性", description: "抵抗下内転（squeeze test：両膝の間にボールを挟み押しつぶす）で疼痛がないか", icon: "💪" },
    { id: "okJog",       title: "ジョグ可",         description: "5〜10分のジョグで鼠径部・内転筋の疼痛が出ないか",                          icon: "🏃" },
    { id: "okSprint",    title: "スプリント可",     description: "フルスプリントで疼痛が出ないか",                                           icon: "▶" },
    { id: "okSportMove", title: "競技動作可",       description: "カット・方向転換など競技特異的動作で疼痛がないか",                          icon: "🏅" },
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
        { title: "アイシング",           sets: "20分 × 4〜6回", note: "圧迫しながら冷却。凍傷注意（タオル越し）", details: "受傷後48〜72時間の急性期は1日4〜6回、1回20分を目安にアイシングを行います。氷を直接皮膚に当てると凍傷になるため、必ずタオルで包んでください。弾性包帯で圧迫しながら冷却するとさらに効果的です。冷たさ→灼熱感→うずき→麻痺（感覚消失）の順に感覚が変化しますが、麻痺感が出たら外してください。" },
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
      alert: "受傷直後の過度な伸張・マッサージは骨化性筋炎のリスクがあります。受傷後48時間は安静第一。",
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
        { title: "ノルディックハムストリングス", sets: "6回 × 3",    note: "離心性。再受傷予防の最重要エクサイズ", details: "両膝を床につけ、パートナーに足首を固定してもらいながら体を前傾させる離心性（エキセントリック）エクサイズです。筋肉が伸びながら収縮するため、ハムストリングスの離心性筋力を特異的に鍛えます。複数のRCTでハムストリングス受傷率を最大70%低下させることが証明されています。最初は6回から始め慣れたら回数を増やします。膝の下にクッションを置くと痛みを防げます。" },
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
        { title: "ノルディックハムストリングス", sets: "8〜10回 × 4", note: "週3回。再受傷率を70%低減する離心性", details: "Phase 3から継続し回数・セット数を増やして負荷を上げます。週3回の実施が再受傷予防に最も効果的です。動作中は体幹を固定し、腰が丸まらないよう注意してください。実施後に軽い筋肉痛を感じる程度が適切な負荷の目安です。" },
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
      okList: ["フルスプリント（100%出力）","方向転換・カット・デセレレーション","競技特異的ドリル（ほぼ全て）","チーム練習への全体参加","コンタクット練習（段階的）"],
      ngList: ["医師・トレーナー許可なしの試合出場","疼痛を無視した無理な動作"],
      rehabMenu: [
        { title: "スプリント（80→90→100%）",   sets: "× 5〜8本",  note: "段階的に出力を上げる", details: "直線20〜30mを80%の力から始め、3日間問題がなければ90%→100%へ上げます。1本ごとに疼痛・違和感を確認します。全力スプリントは最も大きな離心性負荷がかかるため、段階的な移行が重要です。疼痛なく100%スプリントが可能になれば競技復帰の大きな目安となります。" },
        { title: "カッティングドリル",          sets: "5〜10分",   note: "45°→90°→急激な切り返し", details: "45°カット→90°カット→急激な切り返し（ジグザグ）の順に難易度を上げます。最初は低速で正確なフォームを習得し、次第にスポーツ場面に近い速度・角度で行います。着地時の膝・足首アライメントを確認してください。疼痛が出た角度・速度でプログラムを一時停止します。" },
        { title: "競技特異的ドリル",            sets: "練習準拠",  note: "ポジション特異的な動作を含む", details: "スポーツ・ポジション固有の動作を取り入れます。サッカーならドリブル突破、野球なら打球への反応走など、実際の競技で起きる動作と同じパターンを練習します。コーチと連携して通常練習のどの部分から参加できるかを段階的に決めていきます。" },
        { title: "ノルディックハムストリングス", sets: "8〜10回 × 3", note: "予防目的で継続", details: "競技復帰前の段階でも週3回の実施を継続します。これは治療ではなく予防目的です。実施後に問題がなければ次回の練習で競技特異的ドリルの強度を上げます。このエクサイズはシーズンを通じて継続することが強く推奨されています。" },
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
        { title: "ノルディックハムストリングス（維持）", sets: "8〜10回 × 3", note: "シーズン通じて週2〜3回継続", details: "競技復帰後もシーズンを通じて週2〜3回継続します。シーズン通じてノルディックを継続したチームはしなかったチームと比較して再受傷率が70%低下したと報告されています。週1回でも効果があるとする報告もあります。アップ後・練習前が最もパフォーマンスへの影響が少ないタイミングです。" },
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

  // ④ 目標日逆算・進捗見通し
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
    progressNote,
    clinicalGuidance: p.injuryId === "hamstring"
      ? `Hickey JT, et al. Sports Med 2017;47:1375-1387（ハムストリングス肉離れRTP基準：システマティックレビュー）\n` +
        `■ Askling H-test（能動的SLR）：仰臥位でゆっくり片脚ずつ上げ、"違和感・痛み・恐怖心・患側の力の弱さ" を左右比較。\n` +
        `  トレーナー補助が理想だが、壁や床に足を沿わせるModified版として1人でも実施可能。\n` +
        `  ✓ RTP基準：患側に違和感・痛み・恐怖心・健側比での弱さが感じられないこと（角度の数値比ではなく主観的症状の消失）\n` +
        `  この基準を満たす研究では再受傷率1.3〜3.6%（各研究中最低値）\n` +
        `■ Isokinetic dynamometry（患側/健側 等速性筋力比 85〜90%以上）をRTP基準に追加することで、復帰時間と再受傷率のバランスが最善\n` +
        `■ Phase 5→6（スポーツ準備期→完全復帰期）の移行には、上記2指標のクリアが推奨される`
      : undefined,
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
      ngList: ["全荷重歩行（疼痛時）","温熱療法（急性期48時間以内）","強い伸張・マッサージ"],
      rehabMenu: [
        { title: "アイシング（POLICE）",    sets: "20分 × 6回",   note: "Optimal Load：痛みのない範囲で荷重開始", details: "POLICEとはProtection（保護）・Optimal Loading（最適荷重）・Ice（冷却）・Compression（圧迫）・Elevation（挙上）の頭文字です。受傷後48〜72時間は1日6回のアイシングを目安に実施してください。20分後は必ず外し1時間以上あけてから再実施します。圧迫包帯（弾性包帯）とセットで行うと浮腫軽減効果が高まります。疼痛のない範囲で荷重を始めることが現代の標準的アプローチです。" },
        { title: "足関節ポンプ運動",        sets: "20回 × 5セット", note: "仰臥位・挙上位で実施", details: "仰臥位・挙上位（クッション等で足を持ち上げた状態）で足首を上下（背屈・底屈）に動かします。ふくらはぎの筋肉ポンプ作用で静脈・リンパの還流を促し浮腫を軽減します。1セット20回を1日5回以上実施できます。痛みなく実施できるため、この時期の主要エクサイズです。" },
        { title: "タオルギャザー",          sets: "2〜3分 × 3",   note: "内在筋強化。座位で実施可", details: "床に広げたタオルを足趾（足指）でギャザー（縮める）運動です。足内在筋を強化し足底アーチを支持する筋肉を鍛えます。座位で実施でき患部への荷重ストレスはほぼゼロです。2〜3分連続して行うと適度な筋疲労が得られます。" },
        { title: "等尺性内返し・外返し",    sets: "10秒 × 10回",  note: "固定壁に足を押し当てる形で実施", details: "固定した壁や床に足の内側・外側を押し当て、足関節を動かさずに力を入れ続けます。内返し（内反）・外返し（外反）の両方向を実施します。関節を動かさないため靱帯への負荷が最小限で筋力を維持できます。片方向10秒 × 10回を両方向行います。" },
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
      ngList: ["急激な切り返し・カット（高速）","フルスプリント","コンタクットプレー"],
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
      okList: ["フルスプリント（段階的に100%へ）","全方向のアジリティドリル","チーム練習への大部分参加","コンタクット練習（段階的）"],
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
      okList: ["全ての競技活動・試合への参加","全方向の動作・コンタクット","予防トレーニングの継続"],
      ngList: ["予防的サポーター・テーピングの中止（1年間は継続推奨）"],
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
    showOttawaRule: true,
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
        { title: "認知的安静",       sets: "1日中",     note: "スクリーンタイムを最小化。読書・勉強も制限", details: "スクリーンタイム（スマホ・PC・テレビ）を最小化します。明るい光やスクリーンは脳震盪後の頭痛・光過敏を悪化させます。読書・宿題・集中を要する作業も脳の代謝的回復を妨げるため制限します。暗く静かな環境での休息が脳の回復を最も促進します。ただし完全な暗闇での安静は必ずしも必要なく、症状が増悪しない程度の活動は許可されます。" },
        { title: "症状日記記録",     sets: "1日3回",    note: "頭痛・めまい・霧感を0〜10でスコアリング", details: "頭痛・めまい・霧感（ブレインフォグ）・光過敏・音過敏・集中困難を0〜10のスコアで記録します。朝・昼・夜の3回記録することで症状の変化パターンを把握します。記録は医師・トレーナーへの経過報告に使えます。スコアが増悪した活動・環境は翌日から避けてください。" },
        { title: "軽度歩行（可能時）", sets: "5〜10分",  note: "症状増悪なければ。屋外の新鮮な空気も有効", details: "屋外での軽い散歩が脳震盪後の回復を助ける可能性があります。歩行中に症状（頭痛・めまい・吐き気）が増悪した場合は即中止し安静に戻ります。新鮮な空気と穏やかな日光は精神的にも回復を助けます。完全な安静は回復を遅らせることがあるため、症状が悪化しない範囲での軽度活動は推奨されます。" },
      ],
      timeline: [
        { week: "症状消失まで",  goal: "完全症状消失",     activity: "完全安静→GRTP Phase 2へ" },
        { week: "Phase 2〜6",    goal: "段階的復帰",       activity: "各24時間以上で症状なければ次フェーズ" },
      ],
      alert: "脳震盪後の「Second Impact Syndrome」は生命の危険があります。症状が残る間は絶対に競技復帰しないでください。",
    },
    {
      summary: "頭痛が消失し、GRTP Phase 2に進んでいます。ウォーキング・固定自転車・水泳などの軽度有酸素運動を開始してください。認知症状やバランス障害が残っている場合は強度を低く保ち、症状が増悪しないことを確認しながら進めます（CISG 2023）。",
      okList: ["ウォーキング（20〜30分・軽強度）","固定自転車（低抵抗・軽負荷）","水泳（軽度・クロール等）","スクリーン利用の段階的解禁（30分単位で増やす）","十分な睡眠・規則正しい生活"],
      ngList: ["ランニング・インターバルなど高強度有酸素運動","筋力トレーニング（重量使用）","スポーツ特異的動作（まだ不可）","コンタクットプレー","症状増悪を無視した無理な継続"],
      rehabMenu: [
        { title: "ウォーキング（軽度有酸素）", sets: "20〜30分",        note: "心拍最大の50〜70%以下。症状増悪なければ継続", details: "CISG 2023に基づくGRTP Phase 2では、ウォーキング・固定自転車・水泳などの軽度有酸素運動が推奨されています。心拍数は最大の50〜70%以下を目安に保ちます。運動中・運動後24時間以内に頭痛・めまい・吐き気が増悪した場合は即中止しPhase 1に戻ってください。症状増悪がなく24時間経過すればPhase 3へ進みます。" },
        { title: "固定自転車（軽負荷）",       sets: "15〜20分",        note: "低抵抗・低速。屋外は転倒リスクがあるため固定式推奨", details: "固定自転車は転倒リスクがなく心拍数のコントロールがしやすいため、GRTP Phase 2に適した運動です。低抵抗・ゆっくりしたペースで開始し、症状がなければ継続します。屋外サイクリングは転倒による二次的頭部外傷のリスクがあるため、この段階では固定式が推奨です。" },
        { title: "症状日記記録",              sets: "朝・運動後・就寝前", note: "頭痛・めまい・霧感を0〜10でスコアリング", details: "頭痛・めまい・霧感（ブレインフォグ）・光過敏・音過敏・集中困難を0〜10のスコアで記録します。運動後に症状スコアが増悪した場合は運動強度を下げるサインです。記録は医師・トレーナーへの経過報告にも活用できます。" },
      ],
      timeline: [
        { week: "Phase 2",           goal: "軽度有酸素運動で症状増悪なし", activity: "ウォーキング・固定自転車・水泳" },
        { week: "Phase 3（移行条件）", goal: "24時間症状増悪なし",           activity: "症状なし確認後にPhase 3開始" },
      ],
      alert: "運動後24時間以内に頭痛・めまいなどの症状増悪があればPhase 1に戻り完全安静を再開してください。症状増悪がなく24時間経過すればPhase 3（スポーツ特異的運動）へ進みます（CISG 2023）。",
    },
    {
      summary: "基本的な認知・バランスは回復。有酸素運動で症状増悪がまだあります。スポーツ特異的な動作を非コンタクットで行うPhase 3です。",
      okList: ["ランニング（スポーツコートでのドリル）","スポーツ特異的な動作（コンタクットなし）","チームとは別メニューで練習","テクニカルスキルの復習"],
      ngList: ["コンタクットプレー","頭部への衝撃","高強度インターバル"],
      rehabMenu: [
        { title: "スポーツ特異的ランニング", sets: "20〜30分",  note: "方向転換を含む。心拍数の80%以下", details: "競技コートや練習場での方向転換を含むランニングドリルを実施します。心拍数は最大の80%以下を目安にします。接触・コンタクットは禁止です。頭部への衝撃リスクが低い運動（ドリブル・シュート練習等）を含みます。毎回前後で症状スコアを確認してください。" },
        { title: "テクニカルスキル（非接触）", sets: "練習参加", note: "コートドリル、シュート練習等", details: "コートドリル・シュート練習・テクニカルスキルの復習など、コンタクットのない練習メニューに参加します。この段階でもヘディング・タックルなど頭部への衝撃を伴う動作は禁止です。チームスタッフに脳震盪の状況を伝え、非接触ドリルのみに限定するよう協力を得てください。" },
        { title: "バランス・固有感覚訓練",   sets: "10〜15分", note: "BESSテストで経過確認", details: "BESSテスト（Balance Error Scoring System）で評価しながら経過確認します。脳震盪後は小脳・前庭系の機能が一時的に低下しバランス能力が損なわれます。片脚立ち・不安定面でのバランス訓練を実施します。症状増悪がなければ徐々に難易度を上げます。" },
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
        { title: "チーム練習（非接触）",    sets: "フル参加",   note: "コンタクットのないドリルは全て可", details: "チームの練習メニューに参加しますが、コンタクットのないドリルに限定します。チームメイト・スタッフへ事前に状況を説明し、偶発的なコンタクットを避けるよう注意を払います。戦術理解・コミュニケーション・チームのシステムへの復帰がこの段階の主目的です。" },
        { title: "睡眠衛生改善",           sets: "毎日",       note: "就寝前スクリーン禁止・就寝時間固定", details: "就寝前1〜2時間はスクリーン（スマホ・PC・TV）を使用しない、就寝・起床時間を毎日一定に保つ、カフェインを控えるなどの睡眠衛生を実践します。脳震盪後の睡眠障害は回復を著しく妨げます。睡眠の質と量の改善が全体的な回復を大きく促進します。" },
        { title: "高強度インターバル（短時間）", sets: "10〜15分", note: "心拍最大の90%まで。症状確認", details: "最大心拍数の90%程度まで上げる高強度運動を短時間実施します。症状が増悪しないことを確認しながら実施してください。この段階をクリアできれば次の医師によるコンタクット許可待ちの状態に進みます。" },
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
        { title: "コンタクット練習（フル）", sets: "練習参加", note: "Phase 5。医師許可書を必ず取得", details: "医師による書面許可を得た後のみ実施できます。タックル・コンタクットを含む通常練習に参加します。医師の許可書はトレーナー・コーチが保管することを推奨します。この段階（Phase 5）が完了すれば試合復帰（Phase 6）へ進みます。" },
        { title: "試合復帰（Phase 6）",      sets: "通常参加",  note: "症状再発なければ通常の競技生活へ", details: "GRTPの最終段階です。通常の競技生活に戻ります。2回目の脳震盪は1回目より軽微な衝撃で発症しやすくかつ重症化するリスクがあります。再発した場合は即座に活動を中止し、より慎重なプロセスを踏んでください。" },
        { title: "再発予防教育",             sets: "1回",      note: "ヘッドギア・プレーテクニックの見直し", details: "選手本人・保護者・コーチ向けに脳震盪の症状・対処法・報告義務を教育します。脳震盪を隠して競技継続する文化が最大のリスクです。次の脳震盪はより小さな衝撃で発症しうることを全員が理解する必要があります。ヘッドギアは脳震盪を完全には予防できないことも伝えてください。" },
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
    throwingProgram: !isSevere && passCount >= 2 ? THROWING_PROGRAM : undefined,
  };
}

// --- Generic Plan ---

function genericPlan(p: GeneratePlanParams): RehabPlan {
  const days = getDays(p.injuryDate);
  const inj  = INJURY_TYPES.find((x) => x.id === p.injuryId);
  const label = inj?.label ?? p.injuryId;

  const surgDays  = p.surgeryDate ? getDays(p.surgeryDate) : null;
  const surgWeeks = surgDays !== null ? Math.floor(surgDays / 7) : null;
  const surgNote  = surgWeeks !== null ? `（術後${surgWeeks}週目）` : "";

  // ---- ACL 専用プラン ----
  if (p.injuryId === "ACL") {
    const baseDays  = surgDays ?? days;
    const baseWeeks = Math.floor(baseDays / 7);
    const baseLabel = surgDays !== null ? "術後" : "受傷から";

    let phase: string;
    let phaseIdx: number;
    if      (baseWeeks < 2)   { phase = "急性保護期";     phaseIdx = 0; }
    else if (baseWeeks < 6)   { phase = "機能回復期";     phaseIdx = 1; }
    else if (baseWeeks < 12)  { phase = "ランニング期";   phaseIdx = 2; }
    else if (baseWeeks < 24)  { phase = "競技特異的期";   phaseIdx = 3; }
    else                       { phase = "スポーツ復帰期"; phaseIdx = 4; }

    const okROM  = t(p.tests, "okROM");
    const okStr  = t(p.tests, "okStrength");
    const okHop  = t(p.tests, "okHop");

    // テスト結果で後退
    if (!okROM && phaseIdx > 1) phaseIdx = 1;
    if (!okStr && phaseIdx > 2) phaseIdx = 2;
    if (!okHop && phaseIdx > 3) phaseIdx = 3;

    const phaseLabels = ["急性保護期","機能回復期","ランニング期","競技特異的期","スポーツ復帰期"];
    phase = phaseLabels[phaseIdx];

    const aclMenu: Record<number, RehabMenuItem[]> = {
      0: [
        { title: "アイシング・圧迫・挙上", sets: "20分 × 4〜6回", note: "松葉杖で免荷歩行", details: "術直後〜2週は炎症コントロールが最優先です。20分アイシング → 1時間インターバルを繰り返します。弾性包帯での圧迫と枕での挙上を組み合わせると浮腫軽減効果が高まります。" },
        { title: "足関節ポンプ運動",       sets: "20回 × 5",      note: "仰臥位・挙上位で静脈還流促進", details: "足首を上下に動かして下腿の静脈ポンプ機能を活性化します。血栓予防・浮腫軽減の両方に有効です。術後から翌日より開始できます。" },
        { title: "等尺性大腿四頭筋収縮",   sets: "10秒 × 10回",   note: "膝を動かさず太もも前面に力を入れる", details: "仰臥位で膝裏に小さなタオルを置き、それを床に押し付けるようにして太もも前面（大腿四頭筋）に等尺性収縮をかけます。移植腱への負荷は最小限で廃用萎縮を防げます。" },
      ],
      1: [
        { title: "パッシブ可動域訓練",     sets: "各方向10回 × 3", note: "完全伸展を最優先確保", details: "術後2〜6週は完全伸展（0°）の確保が最重要です。腹臥位で膝を自然に垂らして重力伸展、または仰臥位でカーフロールにより完全伸展を達成します。屈曲は疼痛のない範囲で徐々に90°以上を目指します。" },
        { title: "カーフレイズ",           sets: "15回 × 3",       note: "全荷重歩行獲得後に開始", details: "両脚立位から片脚立位へ段階的に移行します。下腿三頭筋を強化しながら体重移動パターンを正常化します。" },
        { title: "ミニスクワット",         sets: "15回 × 3",       note: "0〜60°範囲。疼痛なし範囲のみ", details: "深く曲げすぎない範囲（膝0〜60°）でミニスクワットを行います。膝が内側に入らないよう（ニーイン防止）アライメントに注意してください。徐々に深さを増やし標準スクワットへ移行します。" },
      ],
      2: [
        { title: "直線ジョグ",             sets: "10〜20分",       note: "疼痛なし・跛行なし確認", details: "術後6週以降、跛行なく歩行できれば直線ジョグから開始します。最初は50〜60%の出力で、疼痛・腫脹の増悪がなければ週ごとに強度を上げます。" },
        { title: "レッグプレス（両脚）",   sets: "12回 × 4",       note: "健側比70%の負荷を目標", details: "等速性または通常の筋力測定で健側比70%以上の大腿四頭筋筋力を目標とします。両脚→患脚片脚の順に移行します。" },
        { title: "バランスボード訓練",     sets: "30秒 × 3",       note: "固有感覚再構築（片脚）", details: "固有感覚（プロプリオセプション）は術後に著しく低下しています。両脚→患脚片脚、安定面→不安定面の順に難易度を上げながら再構築します。" },
      ],
      3: [
        { title: "アジリティラダー",       sets: "5〜10分",        note: "低速→高速。膝アライメント確認", details: "ラダードリルで多方向への敏捷性を段階的に回復します。低速で正確なフォームを習得してから速度を上げます。" },
        { title: "カッティングドリル",     sets: "5〜10分",        note: "45°→90°切り返し", details: "45°カット→90°カット→急激な切り返しの順に難易度を上げます。着地時の膝アライメントを常に確認してください。" },
        { title: "シングルレッグホップ",   sets: "3方向 × 5回",   note: "健側比85%以上を目標", details: "前方・側方・クロスホップの3種類で患側の距離を健側と比較します。85%以上が競技復帰の重要な基準値です。" },
      ],
      4: [
        { title: "競技特異的ドリル（フル）", sets: "練習参加",     note: "ポジション固有動作を含む全強度", details: "スポーツ・ポジションに特有の全ての動作を競技と同等の強度で実施します。この段階をクリアしたうえで医師・トレーナーの最終許可を得て試合復帰となります。" },
        { title: "コンタクット練習",         sets: "段階的参加",   note: "医師書面許可後のみ",             details: "コンタクットを伴う練習は必ず医師の書面許可を得てから開始します。許可書はトレーナー・コーチが保管することを推奨します。" },
      ],
    };

    const aclTimeline: TimelineRow[] = [
      { week: `${baseLabel}0〜2週`,   goal: "炎症・腫脹コントロール",  activity: "松葉杖免荷→部分荷重",     criteria: "腫脹軽減・膝完全伸展獲得" },
      { week: `${baseLabel}2〜6週`,   goal: "全荷重歩行",              activity: "ROM・筋力訓練",            criteria: "屈曲90°以上・跛行なし歩行" },
      { week: `${baseLabel}6〜12週`,  goal: "直線ジョグ開始",          activity: "プール・自転車・ジョグ",   criteria: "筋力健側比70%以上" },
      { week: `${baseLabel}3〜6ヶ月`, goal: "方向転換・カット動作",    activity: "アジリティ・ホップ訓練",  criteria: "筋力80%・ホップ85%以上" },
      { week: `${baseLabel}6〜9ヶ月`, goal: "スポーツ完全復帰",        activity: "競技特異的ドリル・試合",  criteria: "全基準クリア・医師許可" },
    ];

    return {
      phase: `ACL：${phase}${surgNote}`,
      currentPhaseIndex: phaseIdx,
      totalPhases: 5,
      summary: `前十字靱帯損傷（ACL）の${phase}${surgNote}です。術後リハビリは各フェーズの基準値をクリアしてから次に進みます。焦りは再断裂リスクを高めます。`,
      okList: aclMenu[phaseIdx].map((m) => m.title),
      ngList: phaseIdx <= 1
        ? ["ランニング・ジャンプ","深いスクワット（膝90°以上）","コンタクットプレー","急激な方向転換"]
        : phaseIdx <= 2
        ? ["方向転換・カット","コンタクットプレー","ジャンプからの片足着地（まだ不可）"]
        : ["医師許可なしのコンタクットプレー"],
      rehabMenu: aclMenu[phaseIdx],
      timeline: aclTimeline,
      alert: "ACL再建術後は移植腱のリモデリングに9〜12ヶ月かかります。筋力・ホップテストの基準値をクリアせずに復帰すると再断裂リスクが高くなります。",
      phaseTracker: [
        { phase: 1, name: "急性保護期",   desc: "腫脹・痛みコントロール",  duration: "0〜2週" },
        { phase: 2, name: "機能回復期",   desc: "全荷重・ROM・筋力",       duration: "2〜6週" },
        { phase: 3, name: "ランニング期", desc: "直線走・筋力強化",         duration: "6〜12週" },
        { phase: 4, name: "競技特異的期", desc: "カット・ホップ・アジリティ", duration: "3〜6ヶ月" },
        { phase: 5, name: "復帰期",       desc: "コンタクット・試合",       duration: "6〜9ヶ月" },
      ],
    };
  }

  // ---- 汎用プラン（ACL以外） ----
  const isAcute    = days <= 7;
  const isSubacute = days <= 21;

  const phase = isAcute ? "急性期" : isSubacute ? "亜急性期〜回復期" : "機能回復〜スポーツ復帰期";

  return {
    phase,
    currentPhaseIndex: isAcute ? 0 : isSubacute ? 1 : 2,
    totalPhases: 3,
    summary: `${label}（${p.grade}）の${phase}${surgNote}です。症状と画像所見に基づいて段階的なリハビリプランを進めます。`,
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
          { title: "アイシング",         sets: "20分 × 4〜6回", note: "炎症コントロール", details: "受傷後48〜72時間の急性期は1日4〜6回実施します。患部をタオルで包んだ氷嚢で冷却し炎症反応をコントロールします。圧迫・挙上と組み合わせると浮腫軽減効果が高まります。凍傷を防ぐため直接皮膚に当てず必ずタオルを使用してください。" },
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

export const SLAP_THROWING_PROGRAM: ThrowingStep[] = [
  { step: 1, name: "ウォームアップ投球（軽投）",  distance: "10m",    reps: "× 20球（50%）" },
  { step: 2, name: "フラットグラウンド（中強度）", distance: "20m",   reps: "× 30球（70%）" },
  { step: 3, name: "フラットグラウンド（通常）",   distance: "30m",   reps: "× 30球（90%）" },
  { step: 4, name: "ロングトス",                  distance: "45m",   reps: "× 20球（全力）" },
  { step: 5, name: "マウンドからの投球",           distance: "投手丘", reps: "球数制限内・段階的増加" },
  { step: 6, name: "実戦復帰",                    distance: "競技距離", reps: "制限解除" },
];

function slapPlan(p: GeneratePlanParams): RehabPlan {
  const isRepair   = p.grade === "unstable";
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
      // Phase 1: 保護期
      summary: isRepair
        ? `上方関節唇損傷（SLAP）縫合修復術後の保護期${surgNote}。スリング3週間固定と疼痛のないパッシブROMを行います。外旋の過緊張を避けることが最重要です（Kin & Sugaya, AJSM 2026）。`
        : `上方関節唇損傷（SLAP）デブリードマン術後の早期${surgNote}。固定不要で術翌日からPTを開始します。疼痛のない範囲でROM訓練を積極的に行います（Kin & Sugaya, AJSM 2026）。`,
      okList: isRepair
        ? ["スリング固定（3週間厳守）","振り子運動（パッシブROM）","等尺性収縮（軽度・疼痛なし）","肩甲骨モビリゼーション","体幹・下肢トレーニング"]
        : ["術翌日からPT開始","パッシブ〜アクティブアシストROM","肩甲骨モビリゼーション","体幹・下肢トレーニング","アイシング（練習後）"],
      ngList: isRepair
        ? ["能動的肩関節挙上（3週間以内）","外旋の強制伸張","重力負荷（1kg超）","投球動作","コンタクトプレー"]
        : ["投球動作（術後1ヶ月以内）","過剰な伸張・牽引","コンタクトプレー"],
      rehabMenu: isRepair ? [
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
      timeline: [
        { week: "0〜3週",      goal: "組織保護・早期ROM",  activity: isRepair ? "スリング固定・パッシブROM" : "固定なし・術翌日PT開始" },
        { week: "3週〜3ヶ月", goal: "可動域・筋力回復",   activity: "腱板強化・肩甲骨安定化" },
        { week: `${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "10m軽投から段階的に" },
        { week: "6〜9ヶ月",   goal: "競技復帰（RTPL）",   activity: "全力投球・試合出場" },
      ],
      alert: isRepair
        ? "縫合修復後3週間はスリング固定を厳守してください。外旋の強制は縫合部離開リスクがあります。投球再開は最短3ヶ月（必ず医師許可後）です。"
        : "デブリードマン後は固定不要ですが、投球は術後1ヶ月以内禁止です。進行は症状・機能回復に基づき個別に判断します。",
    },
    {
      // Phase 2: 機能回復期
      summary: `疼痛は消失しています。外旋ROM・腱板筋力の回復期${surgNote}。肩甲骨機能の正常化とローテーターカフ強化を中心に進めます。GIRD（内旋制限）の修正も重要です。`,
      okList: ["完全ROM（自動）","ローテーターカフ強化","肩甲骨安定化エクササイズ","体幹・下肢連動トレーニング","水泳（クロール除く軽度）"],
      ngList: [isRepair ? "投球動作（術後3ヶ月まで禁止）" : "投球動作（術後1ヶ月まで禁止）","外旋の過剰伸張（修復群は特に注意）","コンタクットプレー"],
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
        { week: "3週〜3ヶ月", goal: "ROM・筋力正常化",  activity: "外旋強化・肩甲骨安定化・GIRD改善" },
        { week: `${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "段階的投球（テスト通過後）" },
        { week: "6〜9ヶ月",  goal: "競技復帰（RTPL）", activity: "RTPL率79%・平均9ヶ月（Kin 2026）" },
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
        { week: `術後${isRepair ? "3" : "1"}ヶ月〜`, goal: "投球プログラム開始", activity: "10m軽投→段階的に距離・強度増加" },
        { week: "術後6ヶ月〜",   goal: "競技距離・強度",    activity: "全力投球・マウンドからの投球" },
        { week: "術後9ヶ月（目標）", goal: "RTPL達成",       activity: "試合出場・フルパフォーマンス" },
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
        { week: "術後6ヶ月〜",      goal: "全力投球可",         activity: "競技距離・全力投球（医師許可後）" },
        { week: "術後9ヶ月（目標）", goal: "RTPL達成",           activity: "試合出場・フルパフォーマンス" },
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
    throwingProgram: idx >= 2 ? SLAP_THROWING_PROGRAM : undefined,
    throwingCurrentStep: idx >= 2
      ? (idx === 2 ? 1 : !okFullThrow ? 3 : 5)
      : undefined,
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

function groinPlan(p: GeneratePlanParams): RehabPlan {
  const okPain      = t(p.tests, "okPain");
  const okAdductor  = t(p.tests, "okAdductor");
  const okJog       = t(p.tests, "okJog");
  const okSprint    = t(p.tests, "okSprint");
  const okSportMove = t(p.tests, "okSportMove");
  const td          = getTargetDays(p.targetDate);

  const typeLabels: Record<string, string> = {
    adductor:  "Adductor-related（内転筋関連）",
    iliopsoas: "Iliopsoas-related（腸腰筋関連）",
    inguinal:  "Inguinal-related（鼠径部関連）",
    pubic:     "Pubic-related（恥骨関連）",
  };
  const typeLabel = typeLabels[p.grade] ?? "グロインペイン症候群";

  let idx = 0;
  if      (!okPain)                idx = 0;
  else if (!okAdductor || !okJog)  idx = 1;
  else if (!okSprint)              idx = 2;
  else if (!okSportMove)           idx = 3;
  else                             idx = 4;

  const GROIN_PHASES: PhaseTrackerItem[] = [
    { phase: 1, name: "急性期",         desc: "安静・炎症コントロール",   duration: "0〜2週" },
    { phase: 2, name: "機能回復期",     desc: "内転筋強化・ROM回復",      duration: "2〜6週" },
    { phase: 3, name: "スポーツ準備期", desc: "ジョグ〜スプリント移行",   duration: "6〜10週" },
    { phase: 4, name: "競技復帰期",     desc: "全力スプリント・競技動作", duration: "10〜14週" },
    { phase: 5, name: "完全復帰",       desc: "全競技活動・予防継続",     duration: "14週以降" },
  ];

  type D = { summary: string; okList: string[]; ngList: string[]; rehabMenu: RehabMenuItem[]; timeline: TimelineRow[]; alert: string };

  const data: D[] = [
    {
      summary: `グロインペイン症候群（${typeLabel}）の急性期です。安静と炎症コントロールを優先します（Doha Agreement, Weir et al. BJSM 2015;49:768-774）。`,
      okList: ["安静・アイシング（20分 × 4〜6回）", "無痛範囲での体幹・殿筋トレーニング", "プール歩行（水中免荷）", "上半身トレーニング"],
      ngList: ["走行・跳躍動作", "開脚・強制伸張（adductor系は特に注意）", "股関節への強い負荷", "コンタクットプレー"],
      rehabMenu: [
        { title: "アイシング",             sets: "20分 × 4〜6回", note: "鼠径部・内転筋起始部を中心に冷却",
          details: "鼠径靱帯付近・恥骨周囲・内転筋の起始部（坐骨・恥骨下枝）を重点的にアイシングします。熱感・腫脹があれば急性炎症の可能性があります。炎症が強い場合は整形外科専門医への受診を推奨します。" },
        { title: "体幹安定化（等尺性）",   sets: "30秒 × 3",      note: "プランク・ドローイン。患部負荷ゼロ",
          details: "体幹安定化はグロインペイン症候群の根本的な治療要素です。骨盤の安定性が低下するとadductor・iliopsoas・inguinalすべての型で症状が悪化します。疼痛なくできるプランクから始めてください（Doha Agreement推奨）。" },
        { title: "殿筋強化（クラムシェル）", sets: "各15回 × 3",  note: "患部を介さない殿筋強化",
          details: "中殿筋・大殿筋の強化により骨盤の安定性が向上し、鼠径部への過剰な剪断力を軽減します。クラムシェル（横向き膝開き）は股関節外旋・外転を強化します。疼痛なく実施できる範囲で実施してください。" },
      ],
      timeline: [
        { week: "0〜2週",  goal: "炎症コントロール",   activity: "安静・アイシング・体幹訓練" },
        { week: "2〜6週",  goal: "内転筋機能回復",     activity: "段階的筋力強化" },
        { week: "6〜10週", goal: "ジョグ→スプリント",  activity: "直線走→方向転換" },
        { week: "10週〜",  goal: "競技復帰",           activity: "競技特異的ドリル・試合" },
      ],
      alert: "グロインペイン症候群は慢性化しやすい傷害です。早期の専門医受診と適切な分類（Doha Agreement分類）が長期予後に重要です（Weir A, et al. Br J Sports Med 2015;49:768-774）。",
    },
    {
      summary: `安静時疼痛は消失。内転筋機能の回復とコアスタビリティの強化を中心に進める時期です（${typeLabel}）。`,
      okList: ["内転筋の等尺性・等張性強化（疼痛なし範囲）", "体幹安定化エクサイズ", "水中ウォーキング", "固定自転車（軽負荷）"],
      ngList: ["ランニング（疼痛ある場合）", "強制的な開脚ストレッチ", "高負荷の内転筋運動", "コンタクットプレー"],
      rehabMenu: [
        { title: "内転筋強化（等尺性）",       sets: "10秒 × 10回 × 3", note: "両膝の間にボールを挟んで等尺性収縮",
          details: "膝の間にソフトボールやタオルを挟んで内転方向に力を入れます（関節は動かさない）。Adductor-related型では特に重要なエクサイズです。疼痛スケール3/10以下なら実施可能です。" },
        { title: "内転筋強化（チューブ）",     sets: "15回 × 3",          note: "側臥位で患側を内転方向に挙上",
          details: "チューブを足関節に引っ掛け、側臥位で患側を内転方向に挙上します。可動範囲全体でゆっくり行います。Adductor-relatedは内転筋、Iliopsoas-relatedは股関節屈曲方向も追加します。" },
        { title: "骨盤安定化（片脚ブリッジ）", sets: "15回 × 3",          note: "骨盤の水平維持を意識",
          details: "仰臥位から片脚でブリッジを行います。骨盤が傾かないよう水平に保ちます。骨盤安定性の向上はDoha Agreement分類のすべての型において重要な治療要素です（Weir 2015）。" },
        { title: "水中ウォーキング",            sets: "15〜20分",           note: "腰まで浸水。正常歩行パターン意識",
          details: "水の浮力で荷重を軽減しながら正常歩行パターンを再学習します。Iliopsoas-related型では積極的に股関節屈曲を意識した歩行が有効です。疼痛が出た場合は即中止してください。" },
      ],
      timeline: [
        { week: "2〜6週",  goal: "内転筋・体幹機能回復", activity: "段階的筋力強化・水中運動" },
        { week: "6〜10週", goal: "ジョグ→スプリント",    activity: "直線走→方向転換" },
        { week: "10週〜",  goal: "競技復帰",             activity: "競技特異的ドリル" },
      ],
      alert: "内転筋への負荷は疼痛スケール3/10以下で実施してください。疼痛が増悪する場合は専門医に相談してください。",
    },
    {
      summary: "内転筋テスト・ジョグはクリア。スプリントへの段階的移行期です。方向転換・加速減速を段階的に導入します。",
      okList: ["直線ジョグ〜80%ランニング", "方向転換ドリル（低速）", "競技特異的ドリル（非コンタクット）", "筋力強化継続"],
      ngList: ["フルスプリント（疼痛ある場合）", "急激な方向転換", "コンタクットプレー"],
      rehabMenu: [
        { title: "段階的ランニング（60→80%）", sets: "段階的増加",    note: "直線→緩やかなカーブ→方向転換の順に",
          details: "60%出力の直線ジョグから始め、問題なければ3日ごとに強度を上げます。鼠径部の疼痛が出た場合は即中止・前の段階に戻します。Inguinal-related型はランニング時の鼠径管へのストレスに注意してください。" },
        { title: "内転筋・体幹強化（維持）",   sets: "週3〜4回",      note: "筋力強化は復帰後も継続が再発予防の鍵",
          details: "ランニングプログラムと並行して内転筋・体幹強化を継続します。週3〜4回の維持プログラムがグロインペインの再発予防に有効です（Doha Agreement recommendations）。" },
        { title: "コペンハーゲンアダクション",  sets: "8〜12回 × 3",  note: "高負荷内転筋離心性エクサイズ",
          details: "片脚を台に乗せ、もう一方の脚で体を持ち上げる高負荷の内転筋エクサイズです。Adductor-relatedグロインペインに特に有効な離心性エクサイズです。最初は補助あり（膝つき）から始めます。" },
      ],
      timeline: [
        { week: "6〜10週",  goal: "スプリント可",    activity: "直線走→方向転換" },
        { week: "10〜14週", goal: "競技動作可",      activity: "競技特異的ドリル" },
        { week: "14週〜",   goal: "完全復帰",        activity: "試合出場" },
      ],
      alert: "スプリント復帰は疼痛が完全に消失してから。鼠径部の牽引感・違和感を無視すると慢性化リスクが高まります。",
    },
    {
      summary: "スプリントはクリア。競技特異的な方向転換・コンタクットへの最終移行期です。",
      okList: ["フルスプリント", "方向転換・カッティング", "競技特異的ドリル（コンタクット段階的）", "強化プログラム継続"],
      ngList: ["疼痛を我慢してのプレー", "予防トレーニングの中止"],
      rehabMenu: [
        { title: "競技特異的アジリティ",         sets: "10〜15分",      note: "競技の実際の動作パターンを導入",
          details: "各競技のポジション固有の動作（サッカーなら切り返し・シュート、ラグビーならスクラム姿勢等）を段階的に導入します。疼痛が出た動作・角度でプログラムを調整します。" },
        { title: "内転筋強化（維持プログラム）",  sets: "週2〜3回",      note: "シーズン中も継続が再発予防に必須",
          details: "コペンハーゲンアダクション（週2〜3回）をシーズン中も継続します。Doha Agreement（Weir 2015）では内転筋の筋力維持がグロインペイン再発予防の根幹であると強調されています。" },
        { title: "クールダウン・ストレッチ",      sets: "練習後10〜15分", note: "鼠径部周囲の柔軟性維持",
          details: "練習後は内転筋・腸腰筋・殿筋のストレッチを実施します。疲労が蓄積すると骨盤安定性が低下し鼠径部への負荷が増大します。練習後のルーティンとして定着させてください。" },
      ],
      timeline: [
        { week: "10〜14週", goal: "競技特異的動作可", activity: "全ドリル・コンタクット練習" },
        { week: "14週以降", goal: "完全復帰",         activity: "試合出場・予防継続" },
      ],
      alert: "グロインペインの再発率は高く、完全復帰後も内転筋強化プログラムの継続が重要です（Weir A, et al. Br J Sports Med 2015;49:768-774）。",
    },
    {
      summary: "全テストクリア。競技完全復帰が可能です。再発予防プログラムをシーズン中も継続してください。",
      okList: ["全競技活動・試合出場", "コンタクット・全力スプリント", "内転筋強化プログラムの継続（週2〜3回）"],
      ngList: ["予防トレーニングの完全中止（再発リスク上昇）", "疼痛を我慢してのプレー継続"],
      rehabMenu: [
        { title: "コペンハーゲンアダクション（維持）", sets: "週2〜3回",       note: "シーズン通じて継続",
          details: "週2〜3回のコペンハーゲンアダクションを継続します。プレシーズンから継続することでシーズン中のグロインペイン発症率を60〜70%低下させるという報告があります。" },
        { title: "動的ウォームアップ",                sets: "練習前10〜15分", note: "股関節・鼠径部周囲の十分なウォームアップ",
          details: "レッグスイング・ランジ・側方ステップを含む動的ウォームアップを実施します。寒冷環境・朝練では特に十分なウォームアップ時間を確保してください。" },
        { title: "定期的な強度モニタリング",          sets: "週1回",          note: "squeeze testで疼痛スケールを自己評価",
          details: "週1回、squeeze test（両膝の間にボールを挟んだ内転力）で疼痛スケールを確認します。2以上の疼痛が連続2週以上続く場合は専門医に相談してください。" },
      ],
      timeline: [
        { week: "14週以降",  goal: "完全復帰・再発予防", activity: "試合出場・予防プログラム継続" },
        { week: "シーズン中", goal: "慢性化防止",         activity: "内転筋強化・モニタリング継続" },
      ],
      alert: "グロインペイン症候群は慢性化しやすく、完全復帰後も再発リスクが高い傷害です。内転筋強化プログラムのシーズン通じた継続と定期的なモニタリングが重要です（Doha Agreement, Weir A, et al. Br J Sports Med 2015;49:768-774）。",
    },
  ];

  const d = data[Math.min(idx, data.length - 1)];
  const phIdx = Math.min(idx, GROIN_PHASES.length - 1);
  return {
    phase: `Phase ${phIdx + 1}：${GROIN_PHASES[phIdx].name}`,
    currentPhaseIndex: phIdx,
    totalPhases: 5,
    summary: d.summary,
    okList: d.okList,
    ngList: d.ngList,
    rehabMenu: d.rehabMenu,
    timeline: td ? [...d.timeline, { week: "目標日", goal: "大会・試合", activity: `${td}日後` }] : d.timeline,
    alert: d.alert,
    phaseTracker: GROIN_PHASES,
    clinicalGuidance:
      `Doha Agreement Meeting on Terminology and Definitions in Groin Pain in Athletes\n` +
      `（Weir A, et al. Br J Sports Med 2015;49:768-774）\n` +
      `■ Adductor-related groin pain（内転筋関連）：squeeze testで鼠径部〜内転筋に疼痛\n` +
      `■ Iliopsoas-related groin pain（腸腰筋関連）：腸腰筋部位の圧痛・股関節屈曲抵抗で疼痛\n` +
      `■ Inguinal-related groin pain（鼠径部関連）：鼠径管部の疼痛・圧痛\n` +
      `■ Pubic-related groin pain（恥骨関連）：恥骨結合部の圧痛\n` +
      `現在の分類：${typeLabel}`,
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
    case "concussion":
      result = concussionPlan(p); break;
    case "elbow_throwing":
      result = elbowThrowingPlan(p); break;
    case "slap_lesion":
      result = slapPlan(p); break;
    case "heat_stroke":
      result = heatStrokePlan(p); break;
    case "groin":
      result = groinPlan(p); break;
    default:
      result = genericPlan(p);
  }
  // POLICE: 脳震盪・熱中症以外の外傷で受傷7日以内に表示
  const daysFromInjury = getDays(p.injuryDate);
  if (p.injuryId !== "concussion" && p.injuryId !== "heat_stroke" && daysFromInjury <= 7) {
    result = { ...result, showPolice: true };
  }
  return result;
}
