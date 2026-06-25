"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import {
  SPORTS_DATA, INJURY_TYPES, GRADES_BY_INJURY,
  JISS_TYPES, JISS_DEGREES, MUSCLE_STRAIN_PHASES, GRTP_PHASES,
  generatePlan, getTestsByInjury,
  type InjuryId, type SportId, type JissGrade, type JissType, type JissDegree,
  type TestResult, type RehabPlan, type PhaseTrackerItem,
} from "@/lib/clinicalLogic";

// ---- Design tokens (inline style values) ----
const BG       = "#f6f2ec";
const CARD     = "#fffdf9";
const BORDER   = "#e4dcce";
const GREEN    = "#9c2c3a";
const KON      = "#2f5277";
const BLUE     = "#5b7da3";
const TEXT     = "#2a2420";
const MUTED    = "#6a5f55";
const MUTED2   = "#8a8075";
const OK_BG    = "#e8eef4";
const OK_BORD  = "#9db4cc";
const NG_BG    = "#fbe9ec";
const NG_BORD  = "#e6a3ad";
const NG_TEXT  = "#c62b3e";
const DOC_BG   = "#fbf2da";
const DOC_BORD = "#d8b766";
const DOC_TEXT = "#7a5000";

const AGE_GROUPS = [
  { id: "elem_lo",  label: "小学低学年（〜9歳）" },
  { id: "elem_hi",  label: "小学高学年（〜12歳）" },
  { id: "jhs",      label: "中学生" },
  { id: "hs",       label: "高校生" },
  { id: "college",  label: "大学生" },
  { id: "adult",    label: "社会人" },
  { id: "pro",      label: "プロ" },
] as const;

// 選手・保護者向け用語解説（プラン最下部に表示）
const GLOSSARY: { term: string; desc: string }[] = [
  { term: "患側 / 健側", desc: "患側＝ケガをした側。健側＝ケガをしていない反対側。左右を比べる基準になります。" },
  { term: "痛み と 違和感 の違い", desc: "鋭い・ズキッとする・元の部位がはっきり痛む＝「痛み」（無理は禁物）。鈍い張り・気になる程度・突っ張る感じ＝「違和感」（多くは許容範囲）。迷ったら一段階手前で止めましょう。" },
  { term: "負荷を上げる目安", desc: "「徐々に」「段階的に」とある項目は、1〜2回の練習ごとに、翌日に疼痛・違和感の悪化がなければ一段階上げます。悪化したら一段階戻します。" },
  { term: "MMT（徒手筋力テスト）", desc: "手で抵抗をかけて筋力を見る検査。「健側比90%」は厳密な数値でなくてよく、左右で力の入り方に明らかな差がない程度が目安です。正確に知りたい場合は医療機関で測定します。" },
  { term: "ROM（関節可動域）", desc: "関節の動く範囲（曲げ伸ばしなどの角度）。「ROM正常」＝左右でほぼ同じだけ動かせる状態。" },
  { term: "等尺性収縮 / 等張性収縮", desc: "等尺性＝関節を動かさず力を入れる（壁を押す等）。等張性＝関節を動かしながら力を出す（ダンベルを上げ下げ等）。等尺性のほうが患部にやさしく、初期に使います。" },
  { term: "RM（最大反復回数）", desc: "その回数で限界になる重さ。15RM＝15回で限界の軽め、8RM＝8回で限界のやや重め（数字が小さいほど高負荷）。フォームが崩れない重さで行います。" },
  { term: "最大予測心拍数（70%）と測り方", desc: "おおよその上限心拍は「220−年齢」。その70%が目安（例：16歳→(220−16)×0.7≒143拍/分）。手首か首の脈を15秒数えて×4で測れます。心拍計がなければ『会話はできるが歌えない程度（トークテスト）』のやや手前で止めればOK。" },
  { term: "レジスタンストレーニング", desc: "いわゆる筋力トレーニング（重り・チューブ・自重などで負荷をかける運動）。" },
  { term: "固定自転車エルゴ", desc: "その場で漕ぐ固定式の自転車（エルゴメーター）。転倒なく心拍・負荷を管理しやすい有酸素運動です。" },
  { term: "DOMS（遅発性筋痛）", desc: "運動の翌日〜2日後に出る筋肉痛。新しい運動の導入直後に出やすく、数日で治まります（ケガの痛みとは区別）。" },
  { term: "LSI（左右対称性指数）", desc: "患側 ÷ 健側 ×100（%）。ホップ距離や筋力の左右差の指標で、90%以上が復帰の目安に使われます。" },
  { term: "IAP（腹腔内圧）", desc: "お腹の中の圧。呼吸と腹横筋でお腹を適度に張らせると体幹が安定し、腰や股関節を守ります。" },
  { term: "スクイーズテスト", desc: "両膝の間にボール等を挟んで内ももで押しつぶす検査。鼠径部・内ももの痛みの確認と経過観察に使います。" },
  { term: "POLICE", desc: "急性外傷の応急対応：Protection（保護）/ Optimal Loading（適切な荷重）/ Ice（冷却）/ Compression（圧迫）/ Elevation（挙上）の頭文字。" },
  { term: "GRTP（段階的競技復帰）", desc: "脳震盪などで使う、段階を踏んで競技に戻すプロトコル。各段階を最低24時間・無症状で過ごせたら次へ進みます。" },
  { term: "Ankle-GO", desc: "足関節捻挫の復帰判定に使う、筋力・バランス・ホップなどを組み合わせた機能テストのまとまり。全項目クリアが復帰の目安です。" },
  { term: "コペンハーゲンアダクション", desc: "内ももを鍛える代表的な運動。グロイン（鼠径部）の傷害予防・再発予防のエビデンスがあります。" },
  { term: "外旋 / 内旋（ER / IR）", desc: "外旋（ER）＝腕や脚を外へひねる動き。内旋（IR）＝内へひねる動き。肩や股関節の評価でよく使います。" },
  { term: "ABER肢位", desc: "肩を外転＋外旋した姿勢（腕を上げて外へ開く）。肩関節脱臼で最も外れやすい肢位のため、初期は避けます。" },
  { term: "GIRD（内旋制限）", desc: "投球側の肩で内旋の可動域が反対側より大きく減った状態。投球肩のケアで重視します。" },
  { term: "ニーイン（knee-in／動的膝外反）", desc: "着地やカットで膝が内側に入る崩れ。MCLや膝のケガのリスクになるため、入らないよう制御します。" },
  { term: "プライオメトリクス", desc: "ジャンプ・着地・素早い切り返しなど、バネのような瞬発系トレーニング。復帰後半で競技に近づけます。" },
  { term: "キネティックチェーン（開放性 / 閉鎖性）", desc: "閉鎖性＝足や手が床・壁に着いた状態の運動（スクワット等）。開放性＝着かない運動（脚を振る等）。両方を組み合わせます。" },
  { term: "BME（骨髄浮腫）", desc: "MRIで見える骨内のむくみ。骨ストレスのサインですが、無症状の人にも見られ、残っていても必ずしも復帰不可ではありません。" },
  { term: "Stork / Kemp / Jackson テスト", desc: "片脚立ちで腰を後ろに反らせて腰の痛みを誘発する検査（腰椎分離症の確認・経過観察）。痛みが出なければ陰性。" },
  { term: "RED-S（相対的エネルギー不足）", desc: "消費に対して食事（エネルギー）が足りない状態。疲労骨折などの背景になり、栄養の見直しが再発予防に重要です。" },
  { term: "RTS / RTP（競技復帰）", desc: "Return to Sport / Play＝スポーツ・競技への復帰のこと。" },
];

const S = {
  card: {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "20px 24px",
  } as React.CSSProperties,
  label: {
    fontSize: 12,
    color: "#2f5277",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 10,
  },
  input: {
    background: CARD,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    padding: "10px 14px",
    fontSize: 15,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box" as const,
    outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
  btnPrimary: {
    background: `linear-gradient(135deg, ${GREEN}, ${KON})`,
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "13px 32px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
  btnSecondary: {
    background: "transparent",
    color: "#9c2c3a",
    border: `1.5px solid #cdb0b5`,
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
};

// ---- Utility components ----

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={S.label}>{children}</div>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.card, ...style }}>{children}</div>;
}

function Chip({
  label, active, color = "green", onClick,
}: { label: string; active: boolean; color?: "green" | "blue" | "red"; onClick: () => void }) {
  const colors = {
    green: { bg: OK_BG, border: OK_BORD, text: GREEN },
    blue:  { bg: "#e8eef4", border: "#9db4cc", text: BLUE },
    red:   { bg: NG_BG, border: NG_BORD, text: NG_TEXT },
  };
  const c = colors[color];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        border: `1.5px solid ${active ? c.border : BORDER}`,
        background: active ? c.bg : "transparent",
        color: active ? c.text : MUTED2,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </button>
  );
}

// ---- Step Indicator ----

function StepBar({ step }: { step: number }) {
  const steps = ["入力", "機能評価", "プラン"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: step >= i ? `linear-gradient(135deg, ${GREEN}, ${KON})` : BORDER,
              color: step >= i ? "#ffffff" : MUTED,
            }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: step === i ? TEXT : MUTED, fontWeight: step === i ? 600 : 400 }}>{s}</span>
          </div>
          {i < steps.length - 1 && <span style={{ color: BORDER, fontSize: 13 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

// ---- Phase Tracker ----

function PhaseTracker({ phases, currentIdx }: { phases: PhaseTrackerItem[]; currentIdx: number }) {
  return (
    <Card>
      <SectionLabel>📍 現在のフェーズ</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {phases.map((ph, i) => {
          const isCurrent = i === currentIdx;
          const isDone    = i < currentIdx;
          return (
            <div key={ph.phase} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "10px 14px", borderRadius: 10,
              background: isCurrent ? `${GREEN}18` : isDone ? "#f1ece5" : "transparent",
              border: `1px solid ${isCurrent ? GREEN : isDone ? "#9db4cc" : BORDER}`,
              opacity: i > currentIdx ? 0.4 : 1,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: isCurrent ? GREEN : isDone ? "#9db4cc" : BORDER,
                color: isCurrent ? "#ffffff" : isDone ? GREEN : MUTED,
                marginTop: 1,
              }}>{isDone ? "✓" : ph.phase}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? GREEN : isDone ? "#2f5277" : TEXT }}>
                  {ph.name}
                  {isCurrent && <span style={{ marginLeft: 8, fontSize: 11, background: GREEN, color: "#ffffff", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>現在</span>}
                </div>
                <div style={{ fontSize: 12, color: MUTED2, marginTop: 2 }}>{ph.desc} / {ph.duration}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- POLICE Block ----

function PoliceBlock() {
  const items = [
    { letter: "P", word: "Protection",      desc: "保護：ギプス・スポンジパッドで患部を保護" },
    { letter: "OL", word: "Optimal Loading", desc: "最適荷重：痛みのない範囲での早期荷重開始" },
    { letter: "I", word: "Ice",             desc: "冷却：15分 × 4〜6回/日。氷嚢やビニール袋に入れた氷を直接しっかり押し当てる（タオル越しは冷却効果が低い）" },
    { letter: "C", word: "Compression",     desc: "圧迫：弾性包帯で遠位から近位に巻く" },
    { letter: "E", word: "Elevation",       desc: "挙上：下肢のケガは足の下に枕や丸めた布団を置いて少し高くする。座っている時も台に足を置く。上肢は患部を心臓より高く保つ" },
  ];
  return (
    <Card style={{ borderColor: `${BLUE}50` }}>
      <SectionLabel>🧊 POLICE プロトコル（急性期管理）</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => (
          <div key={it.letter} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: "#e8eef4", border: `1px solid ${BLUE}60`,
              color: BLUE, fontWeight: 900, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{it.letter}</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>{it.word}</span>
              <span style={{ fontSize: 13, color: MUTED2, marginLeft: 8 }}>{it.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---- Ottawa Ankle Rule ----

function OttawaRuleBlock() {
  const points = [
    { zone: "足関節ゾーン", items: [
      { label: "外踝後縁・下端6cm以内の圧痛", marker: "①", hint: "外くるぶしの後ろ〜下を親指でグッと押す" },
      { label: "内踝後縁・下端6cm以内の圧痛", marker: "②", hint: "内くるぶしの後ろ〜下を押す" },
    ]},
    { zone: "中足部ゾーン", items: [
      { label: "舟状骨（足背の内側）の圧痛",    marker: "③", hint: "土踏まずの内側・足の甲の盛り上がった部分" },
      { label: "第5中足骨基部の圧痛",            marker: "④", hint: "小指側の足外縁・付け根のぽっこり出た部分" },
    ]},
    { zone: "荷重テスト", items: [
      { label: "受傷時または受診時に4歩以上の歩行不能", marker: "⑤", hint: "受傷直後・来院時どちらかで4歩歩けない場合" },
    ]},
  ];

  return (
    <Card style={{ borderColor: "#d09a3060" }}>
      <SectionLabel>⚠️ Ottawa Ankle Rule（骨折スクリーニング）</SectionLabel>
      <p style={{ fontSize: 13, color: "#7a5400", marginBottom: 12, lineHeight: 1.7 }}>
        以下のいずれかを満たす場合は<strong>スポーツ整形外科にてX線撮影</strong>を推奨：
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {points.map((zone) => (
          <div key={zone.zone}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9a6a10", marginBottom: 6, letterSpacing: "0.05em" }}>
              ▶ {zone.zone}
            </div>
            {zone.items.map((item) => (
              <div key={item.marker} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#d09a30",
                  color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{item.marker}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#7a4a10", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9a7a40", marginTop: 1 }}>💡 {item.hint}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---- Throwing Program ----

function ThrowingProgramBlock({
  steps,
  currentStep,
  meta,
}: {
  steps: NonNullable<RehabPlan["throwingProgram"]>;
  currentStep?: number;
  meta?: RehabPlan["throwingProgramMeta"];
}) {
  const label       = meta?.label ?? "⚾ 段階的投球プログラム";
  const distanceCol = meta?.distanceCol ?? "距離";
  const repsCol     = meta?.repsCol ?? "球数";
  const noteIcon    = meta?.noteIcon ?? "🏈";
  return (
    <Card>
      <SectionLabel>{label}</SectionLabel>
      {currentStep !== undefined && (
        <div style={{
          marginBottom: 12, padding: "8px 14px", borderRadius: 8,
          background: "#e8eef4", border: `1px solid #9db4cc`,
          fontSize: 13, color: BLUE, fontWeight: 600,
        }}>
          📍 現在の推奨ステップ：<strong>Step {currentStep}</strong>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Step", "名称", distanceCol, repsCol].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: MUTED, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => {
              const isCurrent = currentStep !== undefined && s.step === currentStep;
              const isDone    = currentStep !== undefined && s.step < currentStep;
              return (
                <tr key={s.step} style={{
                  borderBottom: `1px solid ${BORDER}20`,
                  background: isCurrent ? `${GREEN}14` : "transparent",
                  border: isCurrent ? `1px solid ${GREEN}40` : undefined,
                }}>
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: isCurrent ? GREEN : isDone ? MUTED2 : BLUE }}>
                    {isDone ? "✓" : s.step}
                    {isCurrent && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, background: GREEN, color: "#fff",
                        padding: "1px 6px", borderRadius: 4, fontWeight: 700,
                      }}>現在</span>
                    )}
                  </td>
                  <td style={{ padding: "8px 10px", color: isCurrent ? GREEN : isDone ? MUTED2 : TEXT, fontWeight: isCurrent ? 700 : 400 }}>
                    <div>{s.name}</div>
                    {s.week && <div style={{ fontSize: 11, color: MUTED2, fontWeight: 400, marginTop: 2 }}>🗓 {s.week}</div>}
                    {s.note && <div style={{ fontSize: 11, color: DOC_TEXT, background: DOC_BG, border: `1px solid ${DOC_BORD}`, borderRadius: 4, padding: "2px 6px", marginTop: 4, fontWeight: 400, display: "inline-block" }}>{noteIcon} {s.note}</div>}
                  </td>
                  <td style={{ padding: "8px 10px", color: MUTED2, whiteSpace: "nowrap" }}>{s.distance}</td>
                  <td style={{ padding: "8px 10px", color: MUTED2 }}>{s.reps}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>※ 各ステップ最低3日間実施し、疼痛なければ次のステップへ。</p>
    </Card>
  );
}

// ---- JISS Grade Grid ----

function JissGrid({ value, onChange }: { value: JissGrade | null; onChange: (g: JissGrade) => void }) {
  const types: JissType[]  = ["I", "II", "III"];
  const degrees: JissDegree[] = [1, 2, 3];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: 4 }}>
        <div />
        {degrees.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, color: MUTED, fontWeight: 700, padding: "4px 0" }}>
            {JISS_DEGREES[d].label}
          </div>
        ))}
        {types.map((tp) => (
          <Fragment key={tp}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{JISS_TYPES[tp].label}</span>
              <span style={{ fontSize: 11, color: MUTED }}>{JISS_TYPES[tp].desc}</span>
            </div>
            {degrees.map((d) => {
              const active = value?.type === tp && value?.degree === d;
              return (
                <button
                  key={`${tp}-${d}`}
                  onClick={() => onChange({ type: tp, degree: d })}
                  style={{
                    padding: "10px 4px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    border: `1.5px solid ${active ? GREEN : BORDER}`,
                    background: active ? OK_BG : "transparent",
                    color: active ? GREEN : MUTED2,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {tp}-{d}度
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
      {value && (
        <p style={{ fontSize: 12, color: MUTED2, marginTop: 8 }}>
          選択中：{JISS_TYPES[value.type].label}（{JISS_TYPES[value.type].desc}）× {JISS_DEGREES[value.degree].label}（{JISS_DEGREES[value.degree].desc}）
        </p>
      )}
    </div>
  );
}

// ---- Main App ----

export default function RehabApp() {
  const [step, setStep]             = useState(0);
  const [showIntro, setShowIntro]   = useState(true);
  const [sport, setSport]           = useState<SportId | "">("");
  const [position, setPosition]     = useState("");
  const [age, setAge]               = useState("");
  const [injuryId, setInjuryId]     = useState<InjuryId | "">("");
  const [grade, setGrade]           = useState("");
  const [jissGrade, setJissGrade]   = useState<JissGrade | null>(null);
  const [injuryDate, setInjuryDate] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [tests, setTests]           = useState<TestResult[]>([]);
  const [plan, setPlan]             = useState<RehabPlan | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showOttawa, setShowOttawa] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const currentInjury = INJURY_TYPES.find((x) => x.id === injuryId);
  const currentSport  = SPORTS_DATA.find((x) => x.id === sport);
  const usesJiss      = currentInjury?.usesJiss ?? false;
  const gradeOptions  = injuryId ? (GRADES_BY_INJURY[injuryId as InjuryId] ?? []) : [];

  // ステップ／イントロ切り替え時はページ最上部から表示する
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [step, showIntro]);

  useEffect(() => {
    setPosition("");
  }, [sport]);

  useEffect(() => {
    setGrade("");
    setJissGrade(null);
    if (injuryId) {
      // 腰椎分離症はレベル（高校生以下／大学生以上）で評価テスト構成が変わる
      setTests(getTestsByInjury(injuryId as InjuryId, age).map((t) => ({ id: t.id, result: null })));
    }
  }, [injuryId]);

  // レベル変更時、テスト構成が変わる傷害（腰椎分離症）はテストを再初期化する
  useEffect(() => {
    if (injuryId) {
      setTests(getTestsByInjury(injuryId as InjuryId, age).map((t) => ({ id: t.id, result: null })));
    }
  }, [age]);

  // テスト定義は injuryId / age が変わったときだけ算出（レンダー毎の再計算を回避）
  const testDefs = useMemo(
    () => (injuryId ? getTestsByInjury(injuryId as InjuryId, age) : []),
    [injuryId, age]
  );

  const isHeatStrokeIII = injuryId === "heat_stroke" && grade === "III";
  const step1Valid = !!sport && !!age && !!injuryId && !!injuryDate &&
    (usesJiss ? !!jissGrade : (gradeOptions.length > 0 ? !!grade : true)) &&
    !isHeatStrokeIII;
  const step2Valid = tests.length > 0 && tests.every((t) => t.result !== null);

  const days = injuryDate
    ? Math.max(0, Math.floor((Date.now() - new Date(injuryDate).getTime()) / 86400000))
    : null;
  const targetDaysLeft = targetDate
    ? Math.floor((new Date(targetDate).getTime() - Date.now()) / 86400000)
    : null;

  function handleGenerate() {
    if (!injuryId || !sport) return;
    setExpandedItems(new Set());
    const result = generatePlan({
      injuryId: injuryId as InjuryId,
      grade,
      jissGrade: jissGrade ?? undefined,
      injuryDate,
      surgeryDate: surgeryDate || undefined,
      targetDate,
      tests,
      sport: sport as SportId,
      position,
      age,
    });
    setPlan(result);
    setStep(2);
  }

  function handleReset() {
    setStep(0); setSport(""); setPosition(""); setAge(""); setInjuryId(""); setGrade("");
    setJissGrade(null); setInjuryDate(""); setSurgeryDate(""); setTargetDate("");
    setTests([]); setPlan(null); setExpandedItems(new Set()); setShowOttawa(false);
  }

  // 左上ロゴ／タイトルクリックで最初（イントロ）に戻る
  function goHome() {
    handleReset();
    setShowIntro(true);
  }

  function toggleExpanded(i: number) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  // 脳震盪のGRTPのみ「前段階クリアが前提」の順序ゲート（ある段階を不可にすると以降も自動的に不可）。
  // 他傷害は各評価が独立しうる（例：圧痛はあるが抵抗運動痛なし）ため、カスケードは適用しない。
  const isSequentialGate = injuryId === "concussion";

  function setTestResult(id: string, result: boolean | "doctor_pending" | "discomfort") {
    setTests((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      return prev.map((t, i) => {
        if (i === idx) return { ...t, result };
        if (isSequentialGate && result !== true && i > idx) return { ...t, result: false };
        return t;
      });
    });
  }

  const injuryAreas = ["下肢", "体幹", "上肢", "頭部", "全身"] as const;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Outfit','Noto Sans JP',sans-serif" }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: BG, position: "sticky", top: 0, zIndex: 10,
      }}>
        <div
          onClick={goHome}
          role="button"
          title="最初に戻る"
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${GREEN}, ${KON})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🏅</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: GREEN, textTransform: "uppercase" }}>Sports Rehab Planner</div>
            <div style={{ fontSize: 11, color: MUTED }}>スポーツ傷害リハビリ計画支援ツール</div>
          </div>
        </div>
        {!showIntro && <StepBar step={step} />}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>

        {/* ================= INTRO ================= */}
        {showIntro && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
                background: `linear-gradient(135deg, ${GREEN}, ${KON})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
              }}>🏅</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: "-0.01em" }}>
                Sports Rehab Planner
              </h1>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                スポーツ傷害リハビリ計画支援ツール
              </p>
            </div>

            <Card style={{ borderColor: `${BLUE}50`, background: "#f6f2ec" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🏃</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: BLUE, marginBottom: 8, letterSpacing: "0.04em" }}>
                    このアプリについて
                  </div>
                  <p style={{ fontSize: 13, color: "#2f4a6e", lineHeight: 1.9, margin: 0 }}>
                    日本ではスポーツ医学の専門家が少なく、「痛みが引いたら復帰していいよ」といった
                    根拠に乏しい復帰指導や、電気治療だけで終わるリハビリが今も多く行われています。
                    本来は動作教育を含む適切なリハビリと、競技特性を理解した段階的な復帰計画が必要です。
                    <br /><br />
                    このアプリは、<strong>信頼できるスポーツドクターやアスレティックトレーナーへの
                    アクセスが難しい選手・保護者、学生トレーナーや新人トレーナーの方々</strong>に向けて、
                    スポーツ医学のエビデンスに基づくリハビリ計画の参考情報を提供するために作成しました。
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ borderColor: "#b07d12", background: "#fdf8ec" }}>
              <div style={{ fontSize: 13, color: "#7a5000", lineHeight: 1.9 }}>
                ⚠️ <strong>大前提：</strong>
                身近に信頼できるスポーツドクターがいる場合は、<strong>必ずその意見を最優先</strong>にしてください。
                専門家へのアクセスが難しい場合に、このアプリを<strong>自己の責任のもと</strong>参考ツールとして活用してください。
                <br />
                アプリ使用による怪我の発生や悪化に対し、作成者は一切の責任を負いません。
              </div>
            </Card>

            <button
              onClick={() => setShowIntro(false)}
              style={{ ...S.btnPrimary, padding: "16px 32px", fontSize: 16, borderRadius: 14, width: "100%" }}
            >
              理解して続ける →
            </button>
          </div>
        )}

        {/* ================= STEP 0 ================= */}
        {!showIntro && step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>傷害情報を入力</h1>
              <p style={{ color: MUTED, fontSize: 14 }}>スポーツ・ケガの種類・グレードを選択してリハビリプランを作成します。</p>
            </div>

            {/* Sport Selection */}
            <Card>
              <SectionLabel>スポーツ</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SPORTS_DATA.map((s) => (
                  <button key={s.id} onClick={() => setSport(s.id)} style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: 14,
                    fontWeight: sport === s.id ? 700 : 400,
                    border: `1.5px solid ${sport === s.id ? GREEN : BORDER}`,
                    background: sport === s.id ? OK_BG : "transparent",
                    color: sport === s.id ? GREEN : MUTED2,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Age Group */}
            <Card>
              <SectionLabel>年齢区分</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AGE_GROUPS.map((a) => (
                  <button key={a.id} onClick={() => setAge(a.id)} style={{
                    padding: "9px 20px", borderRadius: 8, fontSize: 14,
                    fontWeight: age === a.id ? 700 : 400,
                    border: `1.5px solid ${age === a.id ? GREEN : BORDER}`,
                    background: age === a.id ? OK_BG : "transparent",
                    color: age === a.id ? GREEN : MUTED2,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Position */}
            {currentSport && (
              <Card>
                <SectionLabel>ポジション（任意）</SectionLabel>
                <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>
                  複数ポジションを兼務している場合は、<strong>最もプレー機会が多いポジション</strong>を選択してください。
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {currentSport.positions.map((pos) => (
                    <Chip key={pos} label={pos} active={position === pos} color="blue" onClick={() => setPosition(pos === position ? "" : pos)} />
                  ))}
                </div>
              </Card>
            )}

            {/* Injury Type */}
            <Card>
              <SectionLabel>ケガの種類</SectionLabel>
              {injuryAreas.map((area) => {
                const areaInjuries = INJURY_TYPES.filter((x) => x.area === area);
                return (
                  <div key={area} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6, textTransform: "uppercase" }}>
                      ■ {area}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {areaInjuries.map((inj) => (
                        <button key={inj.id} onClick={() => setInjuryId(inj.id)} style={{
                          padding: "8px 14px", borderRadius: 8, fontSize: 13,
                          fontWeight: injuryId === inj.id ? 700 : 400,
                          border: `1.5px solid ${injuryId === inj.id ? GREEN : BORDER}`,
                          background: injuryId === inj.id ? OK_BG : "transparent",
                          color: injuryId === inj.id ? GREEN : MUTED2,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        }}>
                          {inj.icon} {inj.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Grade */}
            {injuryId && (usesJiss || gradeOptions.length > 0) && (
              <Card>
                <SectionLabel>{usesJiss ? "JISS分類（型 × 度）" : "重症度グレード"}</SectionLabel>
                {usesJiss ? (
                  <>
                    <JissGrid value={jissGrade} onChange={setJissGrade} />
                    <div style={{
                      marginTop: 12, padding: "10px 14px", borderRadius: 8,
                      background: "#fdf8ec", border: "1px solid #b07d12",
                      fontSize: 12, color: "#7a5000", lineHeight: 1.8,
                    }}>
                      💡 <strong>JISS分類が分からない場合：</strong>
                      スポーツドクターなら画像（MRI等）を見て教えてくれます。一般整形外科では伝わらないこともあるため、
                      「JISS分類（型と度）を教えてください」と直接伝えてみてください。
                      それでも分からなければ、<strong>画像CD（DVDやUSB）を持参</strong>してスポーツドクターを受診することをお勧めします。
                      JISS分類が分からないと正確な復帰目安が算出できません。
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {gradeOptions.map((g) => (
                        <button key={g.value} onClick={() => setGrade(g.value)} style={{
                          flex: "1 1 auto", minWidth: 100, padding: "10px 8px", borderRadius: 8, fontSize: 13,
                          fontWeight: grade === g.value ? 700 : 400,
                          border: `1.5px solid ${grade === g.value ? GREEN : BORDER}`,
                          background: grade === g.value ? OK_BG : "transparent",
                          color: grade === g.value ? GREEN : MUTED2,
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "center",
                        }}>
                          <div style={{ fontWeight: 700 }}>{g.label}</div>
                          <div style={{ fontSize: 11, color: MUTED2, marginTop: 2 }}>{g.desc}</div>
                        </button>
                      ))}
                    </div>
                    {/* Groin guidance note */}
                    {injuryId === "groin" && (
                      <div style={{
                        marginTop: 12, padding: "10px 14px", borderRadius: 8,
                        background: "#fdf8ec", border: "1px solid #b07d12",
                        fontSize: 12, color: "#7a5000", lineHeight: 1.8,
                      }}>
                        💡 <strong>分類が分からない場合：</strong>担当医師に
                        「グロインペインはDOHA分類でどの型ですか？」と確認してください。
                        適切な分類に基づいたリハビリが早期復帰に重要です。
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}

            {/* Heat Stroke Grade III emergency alert */}
            {isHeatStrokeIII && (
              <div style={{
                background: "#fff0f0", border: "2px solid #c62b3e",
                borderRadius: 14, padding: "20px 22px",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <span style={{ fontSize: 30, flexShrink: 0 }}>🚨</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#c62b3e", marginBottom: 8 }}>
                    熱中症 Ⅲ度（重症）— 緊急対応が必要です
                  </div>
                  <div style={{ fontSize: 14, color: "#7a0022", lineHeight: 1.8 }}>
                    意識障害・痙攣・臓器障害を伴う重症熱中症は<strong>入院加療が必須</strong>です。<br />
                    直ちに <strong style={{ fontSize: 16 }}>119番通報</strong> を行い、
                    救急車が到着するまでの間、体を冷やし続けてください（頸部・腋窩・鼠径部に氷嚢）。<br />
                    <span style={{ fontSize: 12, marginTop: 6, display: "block", color: "#9a0030" }}>
                      ※ このアプリでの自己リハビリ管理は対象外です。すべての判断を担当医師の指示に従ってください。
                      （日本救急医学会 熱中症ガイドライン2023）
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <Card>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 16,
              }}>
                <div>
                  <SectionLabel>受傷日</SectionLabel>
                  <input type="date" style={{ ...S.input, colorScheme: "light" } as React.CSSProperties}
                    value={injuryDate} max={today}
                    onChange={(e) => setInjuryDate(e.target.value)} />
                  {days !== null && (
                    <p style={{ fontSize: 12, color: BLUE, marginTop: 8 }}>
                      受傷から <strong style={{ fontSize: 15 }}>{days}</strong> 日
                    </p>
                  )}
                </div>
                {currentInjury?.hasSurgery && (
                  <div>
                    <SectionLabel>
                      手術（予定）日
                      <span style={{ marginLeft: 6, fontSize: 10, color: MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>任意</span>
                    </SectionLabel>
                    <input type="date" style={{ ...S.input, colorScheme: "light" } as React.CSSProperties}
                      value={surgeryDate}
                      onChange={(e) => setSurgeryDate(e.target.value)} />
                    {surgeryDate && (() => {
                      const sd = Math.max(0, Math.floor((Date.now() - new Date(surgeryDate).getTime()) / 86400000));
                      const sw = Math.floor(sd / 7);
                      const future = new Date(surgeryDate) > new Date();
                      return (
                        <p style={{ fontSize: 12, color: future ? "#b07d12" : BLUE, marginTop: 8 }}>
                          {future
                            ? `手術予定まで ${Math.abs(Math.floor((new Date(surgeryDate).getTime() - Date.now()) / 86400000))} 日`
                            : <>術後 <strong style={{ fontSize: 15 }}>{sw}</strong> 週（{sd}日）</>
                          }
                        </p>
                      );
                    })()}
                  </div>
                )}
                <div>
                  <SectionLabel>
                    目標日（大会・試合）
                    <span style={{ marginLeft: 6, fontSize: 10, color: MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>任意</span>
                  </SectionLabel>
                  <input type="date" style={{ ...S.input, colorScheme: "light" } as React.CSSProperties}
                    value={targetDate} min={today}
                    onChange={(e) => setTargetDate(e.target.value)} />
                  {targetDaysLeft !== null && (
                    <p style={{ fontSize: 12, color: "#b07d12", marginTop: 8 }}>
                      目標まで <strong style={{ fontSize: 15 }}>{targetDaysLeft}</strong> 日
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ ...S.btnPrimary, opacity: step1Valid ? 1 : 0.35 }}
                disabled={!step1Valid} onClick={() => setStep(1)}>
                機能評価へ →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 1 ================= */}
        {!showIntro && step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>機能評価テスト</h1>
              <p style={{ color: MUTED, fontSize: 14 }}>
                以下の動作を実際に確認し、結果を選択してください。
                {currentInjury?.showDoctorOption && (
                  <span style={{ marginLeft: 6, fontSize: 12, color: DOC_TEXT, background: DOC_BG, border: `1px solid ${DOC_BORD}`, borderRadius: 4, padding: "1px 8px" }}>
                    🏥 医師許可が必要な項目があります
                  </span>
                )}
              </p>
            </div>

            {tests.map((test, i) => {
              const def = testDefs[i] ?? null;
              if (!def) return null;
              // 順序ゲート（脳震盪のみ）：前の段階に「不可／医師未許可」があれば、この段階は自動的に「不可」（編集不可）
              const blocked = isSequentialGate && tests.slice(0, i).some((tt) => tt.result === false || tt.result === "doctor_pending");
              return (
                <Card key={test.id} style={{
                  borderColor: test.result === true ? OK_BORD
                    : test.result === false ? NG_BORD
                    : test.result === "doctor_pending" ? DOC_BORD
                    : test.result === "discomfort" ? "#e0a850"
                    : BORDER,
                  transition: "border-color 0.2s",
                  opacity: blocked ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, background: "#e8eef4", color: BLUE,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                      }}>{def.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{def.title}</div>
                        <div style={{ fontSize: 11, color: MUTED }}>評価 {i + 1}</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: MUTED2, marginBottom: 14, lineHeight: 1.6 }}>{def.description}</p>
                  {blocked && (
                    <div style={{
                      marginBottom: 12, padding: "8px 12px", borderRadius: 8,
                      background: NG_BG, border: `1px solid ${NG_BORD}`,
                      fontSize: 12, color: NG_TEXT, lineHeight: 1.6,
                    }}>
                      🔒 前の段階が未クリア（不可／医師未許可）のため、この段階は自動的に「不可」です。前の段階をクリアすると評価できます。
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={blocked} onClick={() => setTestResult(test.id, true)} style={{
                      flex: 1, padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: `1.5px solid ${test.result === true ? OK_BORD : BORDER}`,
                      background: test.result === true ? OK_BG : "transparent",
                      color: test.result === true ? KON : MUTED2,
                      cursor: blocked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    }}>✓ 可</button>
                    {def.allowDiscomfort && (
                      <button disabled={blocked} onClick={() => setTestResult(test.id, "discomfort")} style={{
                        flex: 1, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${test.result === "discomfort" ? "#e0a850" : BORDER}`,
                        background: test.result === "discomfort" ? "#fff6e5" : "transparent",
                        color: test.result === "discomfort" ? "#9a6a00" : MUTED2,
                        cursor: blocked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>△ 違和感あり</button>
                    )}
                    <button disabled={blocked} onClick={() => setTestResult(test.id, false)} style={{
                      flex: 1, padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: `1.5px solid ${test.result === false ? NG_BORD : BORDER}`,
                      background: test.result === false ? NG_BG : "transparent",
                      color: test.result === false ? NG_TEXT : MUTED2,
                      cursor: blocked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    }}>✗ 不可</button>
                    {currentInjury?.showDoctorOption && (
                      <button disabled={blocked} onClick={() => setTestResult(test.id, "doctor_pending")} style={{
                        flex: 1, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${test.result === "doctor_pending" ? DOC_BORD : BORDER}`,
                        background: test.result === "doctor_pending" ? DOC_BG : "transparent",
                        color: test.result === "doctor_pending" ? DOC_TEXT : MUTED2,
                        cursor: blocked ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>🏥 医師未許可</button>
                    )}
                  </div>
                </Card>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
              <button style={S.btnSecondary} onClick={() => setStep(0)}>← 戻る</button>
              <button style={{ ...S.btnPrimary, opacity: step2Valid ? 1 : 0.35 }}
                disabled={!step2Valid} onClick={handleGenerate}>
                プランを生成 →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {!showIntro && step === 2 && plan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900 }}>リハビリプラン</h1>
                <span style={{
                  background: "#e8eef4", color: BLUE, border: `1px solid #9db4cc`,
                  borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600,
                }}>{plan.phase}</span>
                {age && (
                  <span style={{
                    background: "#faf2dd", color: "#7a5400", border: `1px solid #d8b766`,
                    borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600,
                  }}>{AGE_GROUPS.find((a) => a.id === age)?.label}</span>
                )}
                {position && (
                  <span style={{
                    background: "#e8eef4", color: GREEN, border: `1px solid #9db4cc`,
                    borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600,
                  }}>{position}</span>
                )}
              </div>
              <p style={{ color: MUTED2, fontSize: 14, lineHeight: 1.7 }}>{plan.summary}</p>
            </div>

            {/* Phase Tracker */}
            {plan.phaseTracker && (
              <PhaseTracker phases={plan.phaseTracker} currentIdx={plan.currentPhaseIndex} />
            )}

            {/* Ankle-GO（足関節捻挫・Phase III＝idx2 以降で開放） */}
            {injuryId === "ankle_sprain" && (
              <Card style={{ borderColor: plan.currentPhaseIndex >= 2 ? OK_BORD : BORDER }}>
                <SectionLabel>🎯 Ankle-GO（復帰準備の客観評価）</SectionLabel>
                <p style={{ fontSize: 13, color: MUTED2, lineHeight: 1.7, marginBottom: 12 }}>
                  RTPの最終段階で、復帰準備が整っているかを6項目25点で客観的に確認できます（Picot 2023/2024）。
                </p>
                {plan.currentPhaseIndex >= 2 ? (
                  <a href="/ankle-go" style={{
                    ...S.btnPrimary, textDecoration: "none", display: "block", textAlign: "center",
                  }}>
                    Ankle-GOテストを受ける →
                  </a>
                ) : (
                  <>
                    <button disabled style={{ ...S.btnPrimary, width: "100%", opacity: 0.35, cursor: "not-allowed" }}>
                      Ankle-GOテストを受ける
                    </button>
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
                      🔒 ホップテストを含むため、<strong>Phase III 以降</strong>（機能回復期／ジョグ段階）で実施可能です。
                    </p>
                  </>
                )}
              </Card>
            )}

            {/* Progress Note / Reverse Countdown */}
            {plan.progressNote && (
              <Card style={{ borderColor: "#9db4cc", background: "#eef2f7" }}>
                <SectionLabel>📊 復帰逆算チェック</SectionLabel>
                <p style={{
                  fontSize: 13, color: "#24405e", lineHeight: 2.0,
                  whiteSpace: "pre-line" as const,
                }}>
                  {plan.progressNote}
                </p>
                <div style={{
                  marginTop: 10, padding: "8px 12px", borderRadius: 8,
                  background: "#fff", border: `1px dashed #9db4cc`,
                  fontSize: 12, color: "#24405e", lineHeight: 1.7,
                }}>
                  💡 <strong>日数はあくまで「最短ケース」の目安</strong>です。実際は機能評価の各項目をクリアした分だけ進みます。
                  日数の経過より、<strong>各項目のクリアを優先</strong>してください（目安より遅くても、項目が未クリアなら焦らず段階を守りましょう）。
                </div>
              </Card>
            )}

            {/* Clinical Guidance / Evidence（折りたたみ：既定で閉じて情報量を抑える） */}
            {plan.clinicalGuidance && (
              <div>
                <button
                  onClick={() => setShowEvidence((v) => !v)}
                  style={{
                    width: "100%", textAlign: "left", display: "flex",
                    alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px", borderRadius: showEvidence ? "12px 12px 0 0" : 12,
                    background: "#eef2f7", border: `1px solid #b8c6da`,
                    fontSize: 14, fontWeight: 700, color: "#2f4a6e",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <span>📚 エビデンス・出典（詳しい解説）</span>
                  <span style={{ fontSize: 12, color: MUTED }}>{showEvidence ? "▲ 閉じる" : "▼ ひらく"}</span>
                </button>
                {showEvidence && (
                  <div style={{
                    border: `1px solid #b8c6da`, borderTop: "none", borderRadius: "0 0 12px 12px",
                    background: "#eef2f7", padding: "4px 18px 16px",
                  }}>
                    <p style={{ fontSize: 13, color: "#2f4a6e", lineHeight: 1.8, whiteSpace: "pre-line" as const }}>
                      {plan.clinicalGuidance}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* POLICE */}
            {plan.showPolice && <PoliceBlock />}

            {/* Ottawa Ankle Rule — 受傷14日以内のみ表示、折りたたみ式 */}
            {plan.showOttawaRule && (days === null || days <= 14) && (
              <div>
                <button
                  onClick={() => setShowOttawa((v) => !v)}
                  style={{
                    width: "100%", textAlign: "left", display: "flex",
                    alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px", borderRadius: showOttawa ? "12px 12px 0 0" : 12,
                    background: "#fdf8ec", border: "1px solid #d09a3060",
                    fontSize: 14, fontWeight: 700, color: "#7a4a10",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <span>⚠️ Ottawa Ankle Rule（骨折スクリーニング）</span>
                  <span style={{ fontSize: 12, color: "#9a6a10" }}>{showOttawa ? "▲ 閉じる" : "▼ 確認する"}</span>
                </button>
                {showOttawa && (
                  <div style={{ borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                    <OttawaRuleBlock />
                  </div>
                )}
              </div>
            )}

            {/* OK / NG */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              <Card style={{ borderColor: OK_BORD }}>
                <SectionLabel>✓ 今やってよいこと</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.okList.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: KON, fontSize: 13, flexShrink: 0, marginTop: 1 }}>●</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#24405e" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card style={{ borderColor: NG_BORD }}>
                <SectionLabel>✗ 避けること</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.ngList.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: NG_TEXT, fontSize: 13, flexShrink: 0, marginTop: 1 }}>●</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8a2632" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Rehab Menu */}
            <Card>
              <SectionLabel>🏋 今週のリハビリメニュー</SectionLabel>
              {plan.rehabMenu.length > 0 && (
                <>
                  <div style={{
                    marginBottom: 12, padding: "9px 13px", borderRadius: 8,
                    background: "#fbf2da", border: "1px solid #d8b766",
                    fontSize: 12, color: "#7a5000", lineHeight: 1.7,
                  }}>
                    ⚠️ <strong>全エクササイズ共通：</strong>
                    実施中に患部に<strong>鋭い痛み・元の部位の痛み</strong>が出た場合は直ちに中止してください。
                    軽い筋肉痛・張り感は許容範囲ですが、無理は厳禁です。
                    <br />
                    📈 <strong>負荷を上げる目安：</strong>
                    「徐々に」「段階的に」とある項目は、<strong>1〜2回の練習ごと</strong>に、
                    翌日に<strong>疼痛・違和感の悪化がなければ</strong>一段階上げます。悪化したら一段階戻してください。
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
                    💡 詳細ボタンをタップすると解説・注意点を確認できます
                  </p>
                </>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {plan.rehabMenu.map((item, i) => {
                  const isOpen = expandedItems.has(i);
                  return (
                    <div key={i} style={{
                      borderLeft: `2px solid ${GREEN}40`, paddingLeft: 16, marginBottom: 16,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{item.title}</span>
                        <span style={{
                          fontSize: 12, color: BLUE, background: "#e8eef4",
                          border: `1px solid #9db4cc`, borderRadius: 4, padding: "2px 10px", whiteSpace: "nowrap",
                        }}>{item.sets}</span>
                      </div>
                      <div style={{ fontSize: 13, color: MUTED2 }}>{item.note}</div>
                      {item.details && (
                        <>
                          <button
                            onClick={() => toggleExpanded(i)}
                            style={{
                              marginTop: 8, padding: "4px 12px", borderRadius: 6,
                              fontSize: 12, fontWeight: 600, cursor: "pointer",
                              fontFamily: "inherit", transition: "all 0.15s",
                              background: isOpen ? "#e8eef4" : "#f1ece5",
                              color: isOpen ? GREEN : MUTED,
                              border: `1px solid ${isOpen ? OK_BORD : BORDER}`,
                            }}
                          >
                            {isOpen ? "▲ 閉じる" : "▼ 詳細・注意点を見る"}
                          </button>
                          {isOpen && (
                            <div style={{
                              marginTop: 8, padding: "12px 14px", borderRadius: 10,
                              background: "#faf7f1", border: `1px solid ${BORDER}`,
                              fontSize: 13, color: TEXT, lineHeight: 1.75,
                              whiteSpace: "pre-wrap",
                            }}>
                              {item.details}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <SectionLabel>📅 復帰タイムライン</SectionLabel>
              {/* 基準日表示 */}
              {(() => {
                const parts: string[] = [];
                if (injuryDate) parts.push(`受傷日：${injuryDate.replace(/-/g, "/")}`);
                if (surgeryDate) {
                  const sw = Math.floor(Math.max(0,(Date.now() - new Date(surgeryDate).getTime()) / 86400000) / 7);
                  parts.push(`手術日：${surgeryDate.replace(/-/g, "/")}（術後${sw}週目）`);
                }
                return parts.length > 0 ? (
                  <p style={{ fontSize: 11, color: BLUE, marginBottom: 10 }}>
                    📌 {parts.join("　／　")}
                    {surgeryDate
                      ? "　※ 時期表示は手術日を基準"
                      : "　※ 時期表示は受傷日を基準"}
                  </p>
                ) : null;
              })()}
              {/* テーブル */}
              {(() => {
                const hasCriteria = plan.timeline.some((r) => r.criteria);
                const cols = hasCriteria ? "80px 1fr 1fr 1fr" : "90px 1fr 1fr";
                const headers = hasCriteria
                  ? ["時期", "目標", "可能な活動", "クリア基準"]
                  : ["時期", "目標", "可能な活動"];
                return (
                  <div>
                    <div style={{
                      display: "grid", gridTemplateColumns: cols,
                      gap: 10, padding: "6px 0", borderBottom: `1px solid ${BORDER}`, marginBottom: 4,
                    }}>
                      {headers.map((h) => (
                        <span key={h} style={{ fontSize: 11, color: MUTED, fontWeight: 700 }}>{h}</span>
                      ))}
                    </div>
                    {plan.timeline.map((row, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: cols,
                        gap: 10, padding: "10px 0", borderBottom: `1px solid ${BORDER}20`,
                      }}>
                        <span style={{ fontSize: 11, color: BLUE, fontWeight: 600 }}>{row.week}</span>
                        <span style={{ fontSize: 12, color: "#2a2420" }}>{row.goal}</span>
                        <span style={{ fontSize: 12, color: MUTED2 }}>{row.activity}</span>
                        {hasCriteria && (
                          <span style={{ fontSize: 11, color: "#2f5277", fontWeight: 600 }}>
                            {row.criteria ? `✓ ${row.criteria}` : "—"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>

            {/* Throwing Program */}
            {plan.throwingProgram && (
              <ThrowingProgramBlock
                steps={plan.throwingProgram}
                currentStep={plan.throwingCurrentStep}
                meta={plan.throwingProgramMeta}
              />
            )}

            {/* Alert */}
            {plan.alert && (
              <div style={{
                background: "#fdf8ec", border: "1px solid #b07d12",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: 14, color: "#7a5000", lineHeight: 1.6 }}>{plan.alert}</span>
              </div>
            )}

            {/* 用語解説（折りたたみ） */}
            <div>
              <button
                onClick={() => setShowGlossary((v) => !v)}
                style={{
                  width: "100%", textAlign: "left", display: "flex",
                  alignItems: "center", justifyContent: "space-between",
                  padding: "12px 18px", borderRadius: showGlossary ? "12px 12px 0 0" : 12,
                  background: "#f1ece5", border: `1px solid ${BORDER}`,
                  fontSize: 14, fontWeight: 700, color: TEXT,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span>📖 用語解説（MMT・ROM・RM・心拍の測り方 など）</span>
                <span style={{ fontSize: 12, color: MUTED }}>{showGlossary ? "▲ 閉じる" : "▼ ひらく"}</span>
              </button>
              {showGlossary && (
                <div style={{
                  border: `1px solid ${BORDER}`, borderTop: "none",
                  borderRadius: "0 0 12px 12px", padding: "8px 18px 16px",
                  background: CARD,
                }}>
                  {GLOSSARY.map((g) => (
                    <div key={g.term} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 3 }}>{g.term}</div>
                      <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.7 }}>{g.desc}</div>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: MUTED2, marginTop: 10, lineHeight: 1.6 }}>
                    ※ 本文中の専門用語はここで解説しています。判定に迷う数値（例：筋力90%）は厳密でなくてよく、左右差が大きくない程度を目安にしてください。
                  </p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{
              background: "#f1ece5", border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "12px 16px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
                📋 このプランはスポーツ医学のエビデンスに基づく<strong>参考情報</strong>です。
                身近に信頼できる<strong>スポーツドクター・アスレティックトレーナー</strong>がいる場合は、必ずその指示を優先してください。
              </span>
              <span style={{ fontSize: 11, color: MUTED2, lineHeight: 1.6 }}>
                本アプリは、専門家へのアクセスが難しい環境にある選手・保護者向けの参考ツールです。
                症状の悪化・新たな痛みが生じた場合は直ちに活動を中止し、医療機関を受診してください。
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button style={S.btnSecondary} onClick={() => setStep(1)}>← 評価を修正</button>
              <button style={S.btnSecondary} onClick={handleReset}>最初からやり直す</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
