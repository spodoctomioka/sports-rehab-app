"use client";

import { useState } from "react";
import {
  scoreAnkleGo, interpretFull, scoreSLS, scoreSEBT, scoreSHT, scoreF8T,
  scoreFaamAdl, scoreFaamSport, scoreAlrRsi,
  type AnkleGoInput,
} from "@/lib/ankleGo";

// ---- Design tokens（Rehabアプリと共通のライトテーマ）----
const BG     = "#f0f4f8";
const CARD   = "#ffffff";
const BORDER = "#dce8f0";
const GREEN  = "#00875f";
const BLUE   = "#0080a0";
const TEXT   = "#1a2a3a";
const MUTED  = "#6a7f90";
const MUTED2 = "#8a9aaa";
const OK_BG  = "#e6f7ef";
const OK_BORD = "#7ecba8";

const S = {
  card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px" } as React.CSSProperties,
  label: { fontSize: 12, color: "#007a60", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 },
  input: {
    background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 8, color: TEXT,
    padding: "10px 14px", fontSize: 15, width: "100%", maxWidth: "100%",
    boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit",
  } as React.CSSProperties,
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...S.card, ...style }}>{children}</div>;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={S.label}>{children}</div>;
}

function NumberField({ label, suffix, value, onChange, placeholder }: {
  label: string; suffix?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number" inputMode="decimal" value={value} placeholder={placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...S.input, colorScheme: "light" } as React.CSSProperties}
        />
        {suffix && <span style={{ fontSize: 13, color: MUTED2, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function StableCheck({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        marginTop: 12, display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
        border: `1.5px solid ${checked ? OK_BORD : BORDER}`, background: checked ? OK_BG : "transparent",
        color: checked ? GREEN : MUTED2, fontSize: 14, fontWeight: 600, textAlign: "left",
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0, fontSize: 13, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: checked ? GREEN : "#eef2f5", color: checked ? "#fff" : MUTED2,
      }}>{checked ? "✓" : ""}</span>
      テスト中に「不安定感なし」（＋1点）
    </button>
  );
}

// ---- 解説SVG（ライトテーマ／GREEN・BLUE基調・概念図）----
const svgBox = { width: "100%", height: "auto", display: "block", background: "#f7fafc", borderRadius: 10, border: `1px solid ${BORDER}` } as React.CSSProperties;

function SvgSLS() {
  return (
    <svg viewBox="0 0 220 130" style={svgBox} role="img" aria-label="片脚立位">
      <line x1="20" y1="112" x2="200" y2="112" stroke={BORDER} strokeWidth="3" />
      <circle cx="110" cy="28" r="11" fill="none" stroke={TEXT} strokeWidth="3" />
      <line x1="110" y1="39" x2="110" y2="78" stroke={TEXT} strokeWidth="3" />
      {/* 支持脚（緑） */}
      <line x1="110" y1="78" x2="104" y2="112" stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
      {/* 挙上脚（青・膝曲げ） */}
      <polyline points="110,78 132,86 126,66" fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 腕 */}
      <line x1="110" y1="52" x2="90" y2="64" stroke={TEXT} strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="52" x2="130" y2="64" stroke={TEXT} strokeWidth="3" strokeLinecap="round" />
      <text x="86" y="124" fontSize="9" fill={GREEN} fontWeight="700">支持脚</text>
      <text x="138" y="80" fontSize="9" fill={BLUE} fontWeight="700">挙上脚</text>
    </svg>
  );
}

function SvgSEBT() {
  return (
    <svg viewBox="0 0 220 130" style={svgBox} role="img" aria-label="mSEBT 3方向リーチ">
      <circle cx="110" cy="78" r="6" fill={TEXT} />
      {/* ANT 前（上） */}
      <line x1="110" y1="78" x2="110" y2="22" stroke={GREEN} strokeWidth="4" markerEnd="url(#agArrow)" />
      {/* PM 後内（左下） */}
      <line x1="110" y1="78" x2="48" y2="116" stroke={BLUE} strokeWidth="4" markerEnd="url(#abArrow)" />
      {/* PL 後外（右下） */}
      <line x1="110" y1="78" x2="172" y2="116" stroke={BLUE} strokeWidth="4" markerEnd="url(#abArrow)" />
      <defs>
        <marker id="agArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GREEN} /></marker>
        <marker id="abArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={BLUE} /></marker>
      </defs>
      <text x="116" y="22" fontSize="9" fill={GREEN} fontWeight="700">ANT（前）</text>
      <text x="14" y="124" fontSize="9" fill={BLUE} fontWeight="700">PM（後内）</text>
      <text x="150" y="124" fontSize="9" fill={BLUE} fontWeight="700">PL（後外）</text>
    </svg>
  );
}

function SvgSHT() {
  return (
    <svg viewBox="0 0 220 130" style={svgBox} role="img" aria-label="サイドホップ">
      <line x1="70" y1="24" x2="70" y2="106" stroke={BORDER} strokeWidth="3" />
      <line x1="150" y1="24" x2="150" y2="106" stroke={BORDER} strokeWidth="3" />
      <text x="92" y="20" fontSize="9" fill={MUTED}>一定幅</text>
      {/* ホップの弧 */}
      <path d="M70,72 Q110,30 150,72" fill="none" stroke={GREEN} strokeWidth="3" strokeDasharray="5 4" />
      <path d="M150,84 Q110,118 70,84" fill="none" stroke={BLUE} strokeWidth="3" strokeDasharray="5 4" />
      <circle cx="70" cy="78" r="7" fill={GREEN} />
      <circle cx="150" cy="78" r="7" fill={BLUE} />
      <line x1="70" y1="112" x2="150" y2="112" stroke="#cfdbe4" strokeWidth="3" />
      <text x="78" y="124" fontSize="9" fill={GREEN} fontWeight="700">左右に片脚で連続ホップ</text>
    </svg>
  );
}

function SvgF8T() {
  return (
    <svg viewBox="0 0 220 130" style={svgBox} role="img" aria-label="フィギュアエイト">
      {/* 8の字 */}
      <path d="M70,65 C70,32 150,32 150,65 C150,98 70,98 70,65 Z" fill="none" stroke={GREEN} strokeWidth="3" />
      {/* コーン2つ */}
      <polygon points="70,58 64,74 76,74" fill={BLUE} />
      <polygon points="150,58 144,74 156,74" fill={BLUE} />
      <text x="44" y="80" fontSize="9" fill={BLUE} fontWeight="700">コーン</text>
      <text x="158" y="80" fontSize="9" fill={BLUE} fontWeight="700">コーン</text>
      <text x="84" y="120" fontSize="9" fill={GREEN} fontWeight="700">8の字に周回</text>
    </svg>
  );
}

const num = (s: string): number | null => (s.trim() === "" ? null : Number(s));

export default function AnkleGoPage() {
  const [skip, setSkip] = useState(false);

  // 身体機能
  const [slsErr, setSlsErr]       = useState("");
  const [slsStable, setSlsStable] = useState(false);
  const [comp, setComp] = useState(""); const [ant, setAnt] = useState(""); const [pm, setPm] = useState("");
  const [sebtStable, setSebtStable] = useState(false);
  const [sht, setSht] = useState(""); const [shtStable, setShtStable] = useState(false);
  const [f8t, setF8t] = useState(""); const [f8tStable, setF8tStable] = useState(false);
  // 質問紙
  const [adl, setAdl] = useState(""); const [sport, setSport] = useState(""); const [rsi, setRsi] = useState("");

  const input: AnkleGoInput = {
    slsErrors: num(slsErr), slsStable,
    sebtComp: num(comp), sebtAnt: num(ant), sebtPm: num(pm), sebtStable,
    shtTime: num(sht), shtStable,
    f8tTime: num(f8t), f8tStable,
    faamAdl: num(adl), faamSport: num(sport), alrRsi: num(rsi),
  };
  const b = scoreAnkleGo(input, skip);
  const interp = interpretFull(b.total);

  const slsScore  = scoreSLS(input.slsErrors, slsStable);
  const sebtScore = scoreSEBT(input.sebtComp, input.sebtAnt, input.sebtPm, sebtStable);
  const shtScore  = scoreSHT(input.shtTime, shtStable);
  const f8tScore  = scoreF8T(input.f8tTime, f8tStable);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Outfit','Noto Sans JP',sans-serif" }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`, padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: BG, position: "sticky", top: 0, zIndex: 10,
      }}>
        <a href="/rehab" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${GREEN}, ${BLUE})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🎯</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: GREEN, textTransform: "uppercase" }}>Ankle-GO</div>
            <div style={{ fontSize: 11, color: MUTED }}>足関節捻挫 復帰準備スコア</div>
          </div>
        </a>
        <a href="/rehab" style={{ fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 600 }}>← リハビリへ戻る</a>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* (a) 概要 */}
        <Card style={{ borderColor: `${BLUE}50`, background: "#f4f9fd" }}>
          <SectionLabel>Ankle-GOとは</SectionLabel>
          <p style={{ fontSize: 13, color: "#2a4060", lineHeight: 1.9, margin: 0 }}>
            足関節捻挫からの<strong>競技復帰（RTS）準備</strong>を客観的に確認するスコアです（Picot 2023/2024）。
            <strong>6項目・満点25点</strong>で、身体機能4テスト（最大18点）と質問紙3項目（最大7点）から構成されます。
            <br /><br />
            研究では<strong>受傷後2か月時点</strong>のスコアが、その後の経過（1年後にcoper＝再受傷なく機能良好になれるか）を予測する重要なチェックポイントとされています。
            あくまで<strong>参考の自己評価ツール</strong>であり、最終的な復帰判断は医療者と行ってください。
          </p>
        </Card>

        {/* (b) モード切替 */}
        <Card>
          <SectionLabel>モード</SectionLabel>
          <button
            onClick={() => setSkip((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "12px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${skip ? OK_BORD : BORDER}`, background: skip ? OK_BG : "transparent",
              color: skip ? GREEN : MUTED2, fontSize: 14, fontWeight: 600, textAlign: "left",
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, fontSize: 13, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: skip ? GREEN : "#eef2f5", color: skip ? "#fff" : MUTED2,
            }}>{skip ? "✓" : ""}</span>
            質問紙をスキップ（身体機能のみ・最大18点で採点）
          </button>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
            ※ 質問紙（FAAM・ALR-RSI）が未実施でも、身体機能だけで部分評価ができます。ただし正式なカットオフは25点満点版に基づきます。
          </p>
        </Card>

        {/* (c) 身体機能4テスト */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: "8px 0 4px" }}>① 身体機能テスト（最大18点）</h2>
          <p style={{ fontSize: 12, color: MUTED }}>各テストとも患側で実施。サイドホップ・フィギュアエイトは健側でも測り、左右差10%以内（LSI≧90%）を目安に。</p>
        </div>

        {/* SLS */}
        <Card>
          <SectionLabel>SLS 片脚立位（最大3点）／ 現在 {slsScore}点</SectionLabel>
          <SvgSLS />
          <p style={{ fontSize: 12.5, color: MUTED2, margin: "12px 0", lineHeight: 1.7 }}>
            患側で30秒の片脚立位を行い、バランスの崩れ（足を着く・支持脚がずれる・大きくふらつく等）を<strong>エラー数</strong>として数えます。
            採点：エラー <strong>3超→0点</strong>／<strong>1〜3→1点</strong>／<strong>0→2点</strong>。
          </p>
          <NumberField label="エラー数（回）" suffix="回" value={slsErr} onChange={setSlsErr} placeholder="例：0" />
          <StableCheck checked={slsStable} onChange={setSlsStable} />
        </Card>

        {/* mSEBT */}
        <Card>
          <SectionLabel>mSEBT（最大7点）／ 現在 {sebtScore}点</SectionLabel>
          <SvgSEBT />
          <p style={{ fontSize: 12.5, color: MUTED2, margin: "12px 0", lineHeight: 1.7 }}>
            片脚立位で <strong>ANT（前）・PM（後内）・PL（後外）</strong> の3方向へできるだけ遠くリーチします。
            v1では、下肢長で正規化済みの <strong>COMP%（3方向の総合）・ANT%・PM%</strong> を直接入力してください。
            採点：COMP <strong>&lt;90→0／90〜95→2／&gt;95→4</strong>、ANT&gt;60で+1、PM&gt;90で+1。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            <NumberField label="COMP %" suffix="%" value={comp} onChange={setComp} />
            <NumberField label="ANT %" suffix="%" value={ant} onChange={setAnt} />
            <NumberField label="PM %" suffix="%" value={pm} onChange={setPm} />
          </div>
          <StableCheck checked={sebtStable} onChange={setSebtStable} />
        </Card>

        {/* SHT */}
        <Card>
          <SectionLabel>SHT サイドホップ（最大5点）／ 現在 {shtScore}点</SectionLabel>
          <SvgSHT />
          <p style={{ fontSize: 12.5, color: MUTED2, margin: "12px 0", lineHeight: 1.7 }}>
            一定幅（30cm）を片脚で左右に連続10往復（計10回）し、<strong>所要時間（秒）</strong>を計測します。
            採点：<strong>13秒超→0／10〜13→2／10未満→4</strong>。
          </p>
          <NumberField label="所要時間（秒）" suffix="秒" value={sht} onChange={setSht} placeholder="例：9.5" />
          <StableCheck checked={shtStable} onChange={setShtStable} />
        </Card>

        {/* F8T */}
        <Card>
          <SectionLabel>F8T フィギュアエイト（最大3点）／ 現在 {f8tScore}点</SectionLabel>
          <SvgF8T />
          <p style={{ fontSize: 12.5, color: MUTED2, margin: "12px 0", lineHeight: 1.7 }}>
            5m間隔のコーン2つを<strong>8の字</strong>に片脚で2周し、<strong>所要時間（秒）</strong>を計測します。
            採点：<strong>18秒超→0／13〜18→1／13未満→2</strong>。
          </p>
          <NumberField label="所要時間（秒）" suffix="秒" value={f8t} onChange={setF8t} placeholder="例：12.0" />
          <StableCheck checked={f8tStable} onChange={setF8tStable} />
        </Card>

        {/* (d) 質問紙 */}
        {!skip && (
          <>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "8px 0 4px" }}>② 質問紙（最大7点）</h2>
              <p style={{ fontSize: 12, color: MUTED }}>v1では各質問紙の合計％を直接入力します（設問の埋め込みはv2予定）。</p>
            </div>
            <Card>
              <SectionLabel>FAAM-ADL（最大2点）／ 現在 {scoreFaamAdl(num(adl))}点</SectionLabel>
              <p style={{ fontSize: 12.5, color: MUTED2, marginBottom: 12, lineHeight: 1.7 }}>
                日常生活の足部・足関節機能（％）。採点：<strong>&lt;90→0／90〜95→1／&gt;95→2</strong>。
              </p>
              <NumberField label="FAAM-ADL スコア" suffix="%" value={adl} onChange={setAdl} />
            </Card>
            <Card>
              <SectionLabel>FAAM-Sport（最大2点）／ 現在 {scoreFaamSport(num(sport))}点</SectionLabel>
              <p style={{ fontSize: 12.5, color: MUTED2, marginBottom: 12, lineHeight: 1.7 }}>
                スポーツ時の足部・足関節機能（％）。採点：<strong>&lt;80→0／80〜95→1／&gt;95→2</strong>。
              </p>
              <NumberField label="FAAM-Sport スコア" suffix="%" value={sport} onChange={setSport} />
            </Card>
            <Card>
              <SectionLabel>ALR-RSI（最大3点）／ 現在 {scoreAlrRsi(num(rsi))}点</SectionLabel>
              <p style={{ fontSize: 12.5, color: MUTED2, marginBottom: 12, lineHeight: 1.7 }}>
                復帰への心理的準備（Ankle Ligament Reconstruction-Return to Sport after Injury／％）。
                採点：<strong>&lt;55→0／55〜63→1／63〜76→2／&gt;76→3</strong>。
              </p>
              <NumberField label="ALR-RSI スコア" suffix="%" value={rsi} onChange={setRsi} />
            </Card>
          </>
        )}

        {/* (e) 結果 */}
        <Card style={{ borderColor: skip ? BORDER : interp.color, borderWidth: 2 }}>
          <SectionLabel>📊 結果</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: skip ? TEXT : interp.color, lineHeight: 1 }}>{b.total}</span>
            <span style={{ fontSize: 18, color: MUTED, fontWeight: 700 }}>／ {b.maxTotal} 点</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: MUTED2 }}>
              身体機能 {b.physical}/18{!skip && ` ・ 質問紙 ${b.questionnaire}/7`}
            </span>
          </div>

          {/* 内訳 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, margin: "10px 0 14px" }}>
            {[
              ["SLS", b.sls, 3], ["mSEBT", b.sebt, 7], ["サイドホップ", b.sht, 5], ["フィギュア8", b.f8t, 3],
              ...(!skip ? [["FAAM-ADL", b.faamAdl, 2], ["FAAM-Sport", b.faamSport, 2], ["ALR-RSI", b.alrRsi, 3]] as [string, number, number][] : []),
            ].map(([name, sc, mx]) => (
              <div key={name as string} style={{ background: "#f7fafc", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: MUTED2 }}>{name}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{sc} <span style={{ fontSize: 11, color: MUTED2 }}>/ {mx}</span></div>
              </div>
            ))}
          </div>

          {/* 解釈 */}
          {!skip ? (
            <div style={{ padding: "12px 14px", borderRadius: 10, background: `${interp.color}14`, border: `1px solid ${interp.color}55` }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: interp.color, marginBottom: 4 }}>{interp.title}</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.8 }}>{interp.desc}</div>
            </div>
          ) : (
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fff8e8", border: "1px solid #d4a020" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#7a5000", marginBottom: 4 }}>身体機能スコア {b.physical} / 18（参考・部分評価）</div>
              <div style={{ fontSize: 13, color: "#7a5000", lineHeight: 1.8 }}>
                正式なカットオフ（11点超で復帰準備良好 等）は<strong>全6項目・25点満点版</strong>に基づくため、この部分評価には直接適用できません。
                確実なRTS判断には<strong>質問紙も実施</strong>してください。
              </div>
            </div>
          )}

          {/* 共通注記 */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.7, background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px" }}>
              ⚧ <strong>女性はcoperになりにくい傾向</strong>があり、より慎重なRTS判断が必要です。
            </div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.7, background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px" }}>
              📐 <strong>LSI（左右差）補助基準：</strong>RTSの補助として<strong>健側比（LSI）90%以上</strong>が望ましい。
              サイドホップ・フィギュアエイトは健側でも計測し、<strong>左右差10%以内</strong>を目安に確認してください。
              mSEBTのCOMP%判定にも左右差の考え方が反映されています。
            </div>
          </div>

          {/* 出典 */}
          <p style={{ fontSize: 10.5, color: MUTED2, marginTop: 12, lineHeight: 1.6 }}>
            出典：Picot B, et al. Sports Health. 2024;16(1):47-57. ／ Picot B, et al. Br J Sports Med. 2024;58:1115-1122.
          </p>
        </Card>

        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <a href="/rehab" style={{
            flex: 1, textAlign: "center", textDecoration: "none",
            padding: "13px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            background: "transparent", color: "#007a6a", border: `1.5px solid #b0ccc8`,
          }}>← リハビリプランへ戻る</a>
        </div>
      </div>
    </div>
  );
}
