"use client";

import { useState, useMemo, useCallback } from "react";

type Outcome = "T" | "N";

const DEFAULT_PATTERN: Outcome[] = ["T","T","T","T","N","T","T","T","T","N"];

const STATE_SHORT  = ["SNT", "WNT", "WT", "ST"] as const;
const STATE_COLORS = ["#ef4444", "#f59e0b", "#a29bfe", "#10b981"];

const STATE_POS = [
  { x: 90,  y: 150 },
  { x: 90,  y: 55  },
  { x: 290, y: 55  },
  { x: 290, y: 150 },
];

interface StepResult {
  actual: Outcome;
  predicted: Outcome;
  correct: boolean;
  stateBefore: number;
  stateAfter: number;
}

function nextState(state: number, actual: Outcome): number {
  return actual === "T" ? Math.min(state + 1, 3) : Math.max(state - 1, 0);
}

function predict(state: number): Outcome {
  return state >= 2 ? "T" : "N";
}

function runSimulation(pattern: Outcome[], upTo: number): StepResult[] {
  const results: StepResult[] = [];
  let state = 0;
  for (let i = 0; i <= Math.min(upTo, pattern.length - 1); i++) {
    const actual = pattern[i];
    const predicted = predict(state);
    const before = state;
    state = nextState(state, actual);
    results.push({ actual, predicted, correct: predicted === actual, stateBefore: before, stateAfter: state });
  }
  return results;
}

const TRANSITIONS = [
  { from: 0, to: 0, label: "N" }, { from: 0, to: 1, label: "T" },
  { from: 1, to: 0, label: "N" }, { from: 1, to: 2, label: "T" },
  { from: 2, to: 1, label: "N" }, { from: 2, to: 3, label: "T" },
  { from: 3, to: 2, label: "N" }, { from: 3, to: 3, label: "T" },
];

function SelfLoop({ cx, cy, side, top, label, active }: { cx: number; cy: number; side: "left"|"right"; top: boolean; label: string; active: boolean }) {
  const R = 28;
  const dx = side === "left" ? -1 : 1;
  const dy = top ? -1 : 1;
  const sx = cx + dx * R;
  const sy = cy;
  const ex = cx;
  const ey = cy + dy * R;
  const cpx = cx + dx * 48;
  const cpy = cy + dy * 42;
  const col = active ? "#6c5ce7" : "#2a2a3e";
  const sw = active ? 2.5 : 1.2;
  return (
    <g>
      <path d={`M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`} fill="none" stroke={col} strokeWidth={sw} markerEnd={active ? "url(#arrAct)" : "url(#arr)"} />
      <text x={cpx + dx * 6} y={cpy + (top ? -4 : 12)} textAnchor="middle" fill={col} fontSize={9} fontFamily="monospace">{label}</text>
    </g>
  );
}

function CurveArrow({ from, to, label, active }: { from: { x: number; y: number }; to: { x: number; y: number }; label: string; active: boolean }) {
  const R = 28;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const sx = from.x + ux * R, sy = from.y + uy * R;
  const ex = to.x - ux * R, ey = to.y - uy * R;
  const mx = (sx + ex) / 2 + uy * 20;
  const my = (sy + ey) / 2 - ux * 20;
  const col = active ? "#6c5ce7" : "#2a2a3e";
  const sw = active ? 2.5 : 1.2;
  return (
    <g>
      <path d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`} fill="none" stroke={col} strokeWidth={sw} markerEnd={active ? "url(#arrAct)" : "url(#arr)"} />
      <text x={mx} y={my - 5} textAnchor="middle" fill={col} fontSize={9} fontFamily="monospace">{label}</text>
    </g>
  );
}

export default function BranchPredictorSim() {
  const [pattern, setPattern] = useState<Outcome[]>([...DEFAULT_PATTERN]);
  const [step, setStep] = useState(-1);

  const results = useMemo(() => runSimulation(pattern, step), [pattern, step]);

  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : "--";
  const curState = results.length > 0 ? results[results.length - 1].stateAfter : 0;
  const curResult = step >= 0 && step < results.length ? results[step] : null;

  const advance = useCallback(() => setStep(s => Math.min(s + 1, pattern.length - 1)), [pattern]);
  const reset = useCallback(() => setStep(-1), []);

  const activeTransition = curResult
    ? { from: curResult.stateBefore, to: curResult.stateAfter, label: curResult.actual }
    : null;

  function isActive(t: { from: number; to: number; label: string }) {
    return activeTransition !== null && activeTransition.from === t.from && activeTransition.to === t.to && activeTransition.label === t.label;
  }

  return (
    <div style={{ background: "#0e0e16", border: "1px solid #2a2a3e", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", textTransform: "uppercase", letterSpacing: 1.5 }}>Interactive Simulation</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd8" }}>2-Bit Branch Predictor</span>
      </div>

      {/* Branch pattern */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e" }}>
        <div style={{ fontSize: 11, color: "#8888a0", fontFamily: "monospace", marginBottom: 6 }}>Branch Pattern (click to toggle)</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {pattern.map((o, i) => (
            <button key={i} onClick={() => { setPattern(p => { const n = [...p]; n[i] = n[i] === "T" ? "N" : "T"; return n; }); setStep(-1); }}
              style={{
                width: 32, height: 32, borderRadius: 4, fontSize: 12, fontFamily: "monospace", fontWeight: 700, cursor: "pointer",
                background: o === "T" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${o === "T" ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"}`,
                color: o === "T" ? "#10b981" : "#ef4444",
                outline: i === step ? "2px solid #6c5ce7" : "none", outlineOffset: 1,
              }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={advance} disabled={step >= pattern.length - 1}
          style={{ padding: "6px 16px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: "#6c5ce7", color: "white", border: "none", cursor: step >= pattern.length - 1 ? "not-allowed" : "pointer", opacity: step >= pattern.length - 1 ? 0.4 : 1 }}>
          Step
        </button>
        <button onClick={reset}
          style={{ padding: "6px 12px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: "#1e1e2e", color: "#c8c6c3", border: "1px solid #2a2a3e", cursor: "pointer" }}>
          Reset
        </button>
        {curResult && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace" }}>
            <span style={{ color: "#8888a0" }}>Predicted:</span>
            <span style={{ color: curResult.predicted === "T" ? "#10b981" : "#ef4444" }}>{curResult.predicted}</span>
            <span style={{ color: "#8888a0" }}>Actual:</span>
            <span style={{ color: curResult.actual === "T" ? "#10b981" : "#ef4444" }}>{curResult.actual}</span>
            <span style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 11,
              background: curResult.correct ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              color: curResult.correct ? "#10b981" : "#ef4444",
            }}>
              {curResult.correct ? "\u2713 Correct" : "\u2717 Miss"}
            </span>
          </div>
        )}
      </div>

      {/* State machine SVG */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "center" }}>
        <svg width={380} height={220} viewBox="0 0 380 220">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a3e" />
            </marker>
            <marker id="arrAct" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6c5ce7" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="g" />
              <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Self-loops */}
          <SelfLoop cx={STATE_POS[0].x} cy={STATE_POS[0].y} side="left" top={false} label="N" active={isActive(TRANSITIONS[0])} />
          <SelfLoop cx={STATE_POS[3].x} cy={STATE_POS[3].y} side="right" top={false} label="T" active={isActive(TRANSITIONS[7])} />

          {/* Cross arrows */}
          {TRANSITIONS.filter(t => t.from !== t.to).map((t, i) => (
            <CurveArrow key={i} from={STATE_POS[t.from]} to={STATE_POS[t.to]} label={t.label} active={isActive(t)} />
          ))}

          {/* State circles */}
          {STATE_POS.map((pos, i) => {
            const isCur = (step < 0 && i === 0) || (results.length > 0 && curState === i);
            return (
              <g key={i} filter={isCur ? "url(#glow)" : undefined}>
                <circle cx={pos.x} cy={pos.y} r={28}
                  fill={isCur ? STATE_COLORS[i] + "25" : "#12121a"}
                  stroke={isCur ? STATE_COLORS[i] : "#2a2a3e"}
                  strokeWidth={isCur ? 2.5 : 1.2} />
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill={isCur ? STATE_COLORS[i] : "#8888a0"} fontSize={11} fontFamily="monospace" fontWeight="bold">
                  {STATE_SHORT[i]}
                </text>
                <text x={pos.x} y={pos.y + 11} textAnchor="middle" fill={isCur ? STATE_COLORS[i] : "#555"} fontSize={8} fontFamily="monospace">
                  {i >= 2 ? "Pred T" : "Pred N"}
                </text>
              </g>
            );
          })}

          {/* Prediction region labels */}
          <text x={90} y={16} textAnchor="middle" fill="#ef444480" fontSize={9} fontFamily="monospace">Predict Not-Taken</text>
          <text x={290} y={16} textAnchor="middle" fill="#10b98180" fontSize={9} fontFamily="monospace">Predict Taken</text>
          <line x1={190} y1={22} x2={190} y2={198} stroke="#2a2a3e" strokeWidth={0.5} strokeDasharray="4 3" />
        </svg>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a3e", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { label: "Correct", value: correct, color: "#10b981" },
          { label: "Mispredictions", value: total - correct, color: "#ef4444" },
          { label: "Accuracy", value: `${accuracy}%`, color: "#6c5ce7" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontFamily: "monospace", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#8888a0", fontFamily: "monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* History table */}
      {results.length > 0 && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a3e", maxHeight: 180, overflowY: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, fontFamily: "monospace", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#8888a0" }}>
                <th style={{ textAlign: "left", padding: "4px 0" }}>#</th>
                <th style={{ textAlign: "left" }}>Before</th>
                <th style={{ textAlign: "left" }}>Predicted</th>
                <th style={{ textAlign: "left" }}>Actual</th>
                <th style={{ textAlign: "left" }}>Result</th>
                <th style={{ textAlign: "left" }}>After</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ background: i === step ? "rgba(108,92,231,0.06)" : "transparent" }}>
                  <td style={{ padding: "3px 0", color: "#555" }}>{i}</td>
                  <td style={{ color: STATE_COLORS[r.stateBefore] }}>{STATE_SHORT[r.stateBefore]}</td>
                  <td style={{ color: r.predicted === "T" ? "#10b981" : "#ef4444" }}>{r.predicted}</td>
                  <td style={{ color: r.actual === "T" ? "#10b981" : "#ef4444" }}>{r.actual}</td>
                  <td style={{ color: r.correct ? "#10b981" : "#ef4444" }}>{r.correct ? "\u2713" : "\u2717"}</td>
                  <td style={{ color: STATE_COLORS[r.stateAfter] }}>{STATE_SHORT[r.stateAfter]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
