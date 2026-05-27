"use client";

import { useState, useEffect } from "react";
import {
  SPORTS_DATA, INJURY_TYPES, TESTS_BY_INJURY, GRADES_BY_INJURY,
  JISS_TYPES, JISS_DEGREES, MUSCLE_STRAIN_PHASES, GRTP_PHASES,
  generatePlan,
  type InjuryId, type SportId, type JissGrade, type JissType, type JissDegree,
  type TestResult, type RehabPlan, type PhaseTrackerItem,
} from "@/lib/clinicalLogic";

// ---- Design tokens (inline style values) ----
const BG       = "#f0f4f8";
const CARD     = "#ffffff";
const BORDER   = "#dce8f0";
const GREEN    = "#00875f";
const BLUE     = "#0080a0";
const TEXT     = "#1a2a3a";
const MUTED    = "#6a7f90";
const MUTED2   = "#8a9aaa";
const OK_BG    = "#e6f7ef";
const OK_BORD  = "#7ecba8";
const NG_BG    = "#fde8ee";
const NG_BORD  = "#f0a0b4";
const NG_TEXT  = "#cc2244";
const DOC_BG   = "#fff3d0";
const DOC_BORD = "#c89010";
const DOC_TEXT = "#7a5000";

const AGE_GROUPS = [
  { id: "u10",    label: "〜10歳" },
  { id: "u15",    label: "〜15歳" },
  { id: "u20",    label: "〜20歳" },
  { id: "u30",    label: "〜30歳" },
  { id: "senior", label: "それ以上" },
] as const;

const S = {
  card: {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "20px 24px",
  } as React.CSSProperties,
  label: {
    fontSize: 12,
    color: "#007a60",
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
    outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
  btnPrimary: {
    background: `linear-gradient(135deg, ${GREEN}, ${BLUE})`,
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
    color: "#007a6a",
    border: `1.5px solid #b0ccc8`,
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
    blue:  { bg: "#ddf0f8", border: "#80c4d8", text: BLUE },
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
              background: step >= i ? `linear-gradient(135deg, ${GREEN}, ${BLUE})` : BORDER,
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
              background: isCurrent ? `${GREEN}18` : isDone ? "#eaf7f0" : "transparent",
              border: `1px solid ${isCurrent ? GREEN : isDone ? "#90d8b0" : BORDER}`,
              opacity: i > currentIdx ? 0.4 : 1,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: isCurrent ? GREEN : isDone ? "#c0e8d0" : BORDER,
                color: isCurrent ? "#ffffff" : isDone ? GREEN : MUTED,
                marginTop: 1,
              }}>{isDone ? "✓" : ph.phase}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? GREEN : isDone ? "#007844" : TEXT }}>
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
    { letter: "I", word: "Ice",             desc: "冷却：20分 × 4〜6回/日。タオル越しに" },
    { letter: "C", word: "Compression",     desc: "圧迫：弾性包帯で遠位から近位に巻く" },
    { letter: "E", word: "Elevation",       desc: "挙上：心臓より高く。就寝時も継続" },
  ];
  return (
    <Card style={{ borderColor: `${BLUE}50` }}>
      <SectionLabel>🧊 POLICE プロトコル（急性期管理）</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => (
          <div key={it.letter} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: "#ddf0f8", border: `1px solid ${BLUE}60`,
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
  return (
    <Card style={{ borderColor: "#f0a04060" }}>
      <SectionLabel>⚠️ Ottawa Ankle Rule（X線撮影の適応）</SectionLabel>
      <p style={{ fontSize: 13, color: MUTED2, marginBottom: 10 }}>以下のいずれかを満たす場合はX線撮影を推奨：</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          "足関節後縁・内踝下端6cmの圧痛あり",
          "足関節後縁・外踝下端6cmの圧痛あり",
          "舟状骨（足背の内側）の圧痛あり",
          "第5中足骨基部の圧痛あり",
          "受傷時および受診時に4歩以上の歩行不能",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#d08000", fontSize: 13, flexShrink: 0, marginTop: 1 }}>□</span>
            <span style={{ fontSize: 13, color: "#7a5800" }}>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---- Throwing Program ----

function ThrowingProgramBlock({ steps }: { steps: NonNullable<RehabPlan["throwingProgram"]> }) {
  return (
    <Card>
      <SectionLabel>⚾ 段階的投球プログラム</SectionLabel>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Step", "名称", "距離", "球数"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: MUTED, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.step} style={{ borderBottom: `1px solid ${BORDER}20` }}>
                <td style={{ padding: "8px 10px", color: BLUE, fontWeight: 700 }}>{s.step}</td>
                <td style={{ padding: "8px 10px", color: TEXT }}>{s.name}</td>
                <td style={{ padding: "8px 10px", color: MUTED2 }}>{s.distance}</td>
                <td style={{ padding: "8px 10px", color: MUTED2 }}>{s.reps}</td>
              </tr>
            ))}
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
          <>
            <div key={`label-${tp}`} style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 8 }}>
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
          </>
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

  const today = new Date().toISOString().split("T")[0];

  const currentInjury = INJURY_TYPES.find((x) => x.id === injuryId);
  const currentSport  = SPORTS_DATA.find((x) => x.id === sport);
  const usesJiss      = currentInjury?.usesJiss ?? false;
  const gradeOptions  = injuryId ? (GRADES_BY_INJURY[injuryId as InjuryId] ?? []) : [];

  useEffect(() => {
    setPosition("");
  }, [sport]);

  useEffect(() => {
    setGrade("");
    setJissGrade(null);
    if (injuryId) {
      setTests(TESTS_BY_INJURY[injuryId as InjuryId].map((t) => ({ id: t.id, result: null })));
    }
  }, [injuryId]);

  const step1Valid = !!sport && !!age && !!injuryId && !!injuryDate && (usesJiss ? !!jissGrade : !!grade);
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
    setTests([]); setPlan(null); setExpandedItems(new Set());
  }

  function toggleExpanded(i: number) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function setTestResult(id: string, result: boolean | "doctor_pending") {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, result } : t)));
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${GREEN}, ${BLUE})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🏅</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: GREEN, textTransform: "uppercase" }}>Sports Rehab Planner</div>
            <div style={{ fontSize: 11, color: MUTED }}>スポーツ傷害リハビリ計画支援ツール</div>
          </div>
        </div>
        <StepBar step={step} />
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>

        {/* ================= STEP 0 ================= */}
        {step === 0 && (
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
            {injuryId && (
              <Card>
                <SectionLabel>{usesJiss ? "JISS分類（型 × 度）" : "重症度グレード"}</SectionLabel>
                {usesJiss ? (
                  <>
                    <JissGrid value={jissGrade} onChange={setJissGrade} />
                    <div style={{
                      marginTop: 12, padding: "10px 14px", borderRadius: 8,
                      background: "#fff8e8", border: "1px solid #d4a020",
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
                )}
              </Card>
            )}

            {/* Dates */}
            <Card>
              <div style={{
                display: "grid",
                gridTemplateColumns: currentInjury?.hasSurgery ? "1fr 1fr 1fr" : "1fr 1fr",
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
                        <p style={{ fontSize: 12, color: future ? "#d08000" : BLUE, marginTop: 8 }}>
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
                  <SectionLabel>目標日（大会・試合）</SectionLabel>
                  <input type="date" style={{ ...S.input, colorScheme: "light" } as React.CSSProperties}
                    value={targetDate} min={today}
                    onChange={(e) => setTargetDate(e.target.value)} />
                  {targetDaysLeft !== null && (
                    <p style={{ fontSize: 12, color: "#d08000", marginTop: 8 }}>
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
        {step === 1 && (
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
              const def = injuryId ? TESTS_BY_INJURY[injuryId as InjuryId][i] : null;
              if (!def) return null;
              return (
                <Card key={test.id} style={{
                  borderColor: test.result === true ? OK_BORD
                    : test.result === false ? NG_BORD
                    : test.result === "doctor_pending" ? DOC_BORD
                    : BORDER,
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, background: "#ddeeff", color: BLUE,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                      }}>{def.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{def.title}</div>
                        <div style={{ fontSize: 11, color: MUTED }}>評価 {i + 1}</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: MUTED2, marginBottom: 14, lineHeight: 1.6 }}>{def.description}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setTestResult(test.id, true)} style={{
                      flex: 1, padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: `1.5px solid ${test.result === true ? OK_BORD : BORDER}`,
                      background: test.result === true ? OK_BG : "transparent",
                      color: test.result === true ? GREEN : MUTED2,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    }}>✓ 可</button>
                    <button onClick={() => setTestResult(test.id, false)} style={{
                      flex: 1, padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: `1.5px solid ${test.result === false ? NG_BORD : BORDER}`,
                      background: test.result === false ? NG_BG : "transparent",
                      color: test.result === false ? NG_TEXT : MUTED2,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    }}>✗ 不可</button>
                    {currentInjury?.showDoctorOption && (
                      <button onClick={() => setTestResult(test.id, "doctor_pending")} style={{
                        flex: 1, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${test.result === "doctor_pending" ? DOC_BORD : BORDER}`,
                        background: test.result === "doctor_pending" ? DOC_BG : "transparent",
                        color: test.result === "doctor_pending" ? DOC_TEXT : MUTED2,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
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
        {step === 2 && plan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900 }}>リハビリプラン</h1>
                <span style={{
                  background: "#ddeeff", color: BLUE, border: `1px solid #90c8e0`,
                  borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600,
                }}>{plan.phase}</span>
                {age && (
                  <span style={{
                    background: "#f0f0ff", color: "#5050c0", border: `1px solid #c0c0e8`,
                    borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600,
                  }}>{AGE_GROUPS.find((a) => a.id === age)?.label}</span>
                )}
                {position && (
                  <span style={{
                    background: "#ddf8f0", color: GREEN, border: `1px solid #80cca8`,
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

            {/* Progress Note / Reverse Countdown */}
            {plan.progressNote && (
              <Card style={{ borderColor: "#80c8a8", background: "#f0faf5" }}>
                <SectionLabel>📊 復帰逆算チェック</SectionLabel>
                <p style={{
                  fontSize: 13, color: "#1a4030", lineHeight: 2.0,
                  whiteSpace: "pre-line" as const,
                }}>
                  {plan.progressNote}
                </p>
              </Card>
            )}

            {/* Clinical Guidance / Evidence */}
            {plan.clinicalGuidance && (
              <Card style={{ borderColor: "#b8cfe8", background: "#f4f8fd" }}>
                <SectionLabel>📚 エビデンス・出典</SectionLabel>
                <p style={{
                  fontSize: 13, color: "#2a4060", lineHeight: 1.8,
                  whiteSpace: "pre-line" as const,
                }}>
                  {plan.clinicalGuidance}
                </p>
              </Card>
            )}

            {/* POLICE */}
            {plan.showPolice && <PoliceBlock />}

            {/* Ottawa Ankle Rule */}
            {plan.showOttawaRule && <OttawaRuleBlock />}

            {/* OK / NG */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card style={{ borderColor: OK_BORD }}>
                <SectionLabel>✓ 今やってよいこと</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.okList.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: GREEN, fontSize: 13, flexShrink: 0, marginTop: 1 }}>●</span>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#2a5040" }}>{item}</span>
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
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#7a3040" }}>{item}</span>
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
                    background: "#fff3d0", border: "1px solid #c89010",
                    fontSize: 12, color: "#7a5000", lineHeight: 1.7,
                  }}>
                    ⚠️ <strong>全エクササイズ共通：</strong>
                    実施中に患部に<strong>鋭い痛み・元の部位の痛み</strong>が出た場合は直ちに中止してください。
                    軽い筋肉痛・張り感は許容範囲ですが、無理は厳禁です。
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
                          fontSize: 12, color: BLUE, background: "#ddeeff",
                          border: `1px solid #90c8e0`, borderRadius: 4, padding: "2px 10px", whiteSpace: "nowrap",
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
                              background: isOpen ? "#e6f7ef" : "#f4f6f8",
                              color: isOpen ? GREEN : MUTED,
                              border: `1px solid ${isOpen ? OK_BORD : BORDER}`,
                            }}
                          >
                            {isOpen ? "▲ 閉じる" : "▼ 詳細・注意点を見る"}
                          </button>
                          {isOpen && (
                            <div style={{
                              marginTop: 8, padding: "12px 14px", borderRadius: 10,
                              background: "#f8fafb", border: `1px solid ${BORDER}`,
                              fontSize: 13, color: TEXT, lineHeight: 1.75,
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
              <div>
                <div style={{
                  display: "grid", gridTemplateColumns: "90px 1fr 1fr",
                  gap: 12, padding: "6px 0", borderBottom: `1px solid ${BORDER}`, marginBottom: 4,
                }}>
                  {["時期", "目標", "可能な活動"].map((h) => (
                    <span key={h} style={{ fontSize: 12, color: MUTED, fontWeight: 700 }}>{h}</span>
                  ))}
                </div>
                {plan.timeline.map((row, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "90px 1fr 1fr",
                    gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}20`,
                  }}>
                    <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>{row.week}</span>
                    <span style={{ fontSize: 13, color: "#2a4050" }}>{row.goal}</span>
                    <span style={{ fontSize: 13, color: MUTED2 }}>{row.activity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Throwing Program */}
            {plan.throwingProgram && <ThrowingProgramBlock steps={plan.throwingProgram} />}

            {/* Alert */}
            {plan.alert && (
              <div style={{
                background: "#fff8e8", border: "1px solid #d4a020",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: 14, color: "#7a5000", lineHeight: 1.6 }}>{plan.alert}</span>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              background: "#f4f6f8", border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "10px 16px",
            }}>
              <span style={{ fontSize: 12, color: MUTED }}>
                ⚠️ このプランはAIによる参考情報です。最終的な判断は必ず担当医師・トレーナーが行ってください。
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
