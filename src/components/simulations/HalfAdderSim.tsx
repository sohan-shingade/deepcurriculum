"use client";

import { useState, useMemo } from "react";

const HIGH = "#10b981";
const LOW  = "#ef4444";
const sig = (v: boolean) => (v ? HIGH : LOW);

function GateShape({ x, y, type, a, b, out, label }: { x: number; y: number; type: "XOR" | "AND" | "OR"; a: boolean; b: boolean; out: boolean; label?: string }) {
  const isXor = type === "XOR";
  const isOr  = type === "OR";
  return (
    <g>
      {/* Gate body */}
      {isXor || isOr ? (
        <>
          <path d={`M ${x} ${y - 16} Q ${x + 12} ${y} ${x} ${y + 16} Q ${x + 16} ${y + 16} ${x + 36} ${y} Q ${x + 16} ${y - 16} ${x} ${y - 16}`}
            fill="#1a1a2e" stroke="#c8c6c3" strokeWidth={1.2} />
          {isXor && <path d={`M ${x - 5} ${y - 16} Q ${x + 7} ${y} ${x - 5} ${y + 16}`} fill="none" stroke="#c8c6c3" strokeWidth={1.2} />}
        </>
      ) : (
        <path d={`M ${x} ${y - 16} L ${x} ${y + 16} L ${x + 18} ${y + 16} A 16 16 0 0 0 ${x + 18} ${y - 16} Z`}
          fill="#1a1a2e" stroke="#c8c6c3" strokeWidth={1.2} />
      )}
      {/* Input wires */}
      <line x1={x - 20} y1={y - 8} x2={x + (isXor || isOr ? 3 : 0)} y2={y - 8} stroke={sig(a)} strokeWidth={2} />
      <line x1={x - 20} y1={y + 8} x2={x + (isXor || isOr ? 3 : 0)} y2={y + 8} stroke={sig(b)} strokeWidth={2} />
      {/* Output wire */}
      <line x1={x + (isXor || isOr ? 36 : 34)} y1={y} x2={x + 56} y2={y} stroke={sig(out)} strokeWidth={2} />
      {/* Dots */}
      <circle cx={x - 20} cy={y - 8} r={2.5} fill={sig(a)} />
      <circle cx={x - 20} cy={y + 8} r={2.5} fill={sig(b)} />
      <circle cx={x + 56} cy={y} r={2.5} fill={sig(out)} />
      {/* Label */}
      {label && <text x={x + (isXor || isOr ? 16 : 14)} y={y + 3} textAnchor="middle" fill="#8888a0" fontSize={7} fontFamily="monospace">{label}</text>}
    </g>
  );
}

function BitBtn({ label, value, onClick }: { label: string; value: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 4, fontFamily: "monospace", fontSize: 13, cursor: "pointer",
        background: value ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        border: `1px solid ${value ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"}`,
        color: value ? HIGH : LOW,
      }}>
      {label} = {value ? "1" : "0"}
    </button>
  );
}

export default function HalfAdderSim() {
  const [mode, setMode] = useState<"half" | "full">("half");
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [cIn, setCIn] = useState(false);

  const ha1Sum   = a !== b;
  const ha1Carry = a && b;
  const ha2Sum   = ha1Sum !== cIn;
  const ha2Carry = ha1Sum && cIn;
  const fullCarry = ha1Carry || ha2Carry;

  const finalSum   = mode === "full" ? ha2Sum   : ha1Sum;
  const finalCarry = mode === "full" ? fullCarry : ha1Carry;

  const truthTable = useMemo(() => {
    const rows: { a: boolean; b: boolean; c: boolean; sum: boolean; carry: boolean }[] = [];
    for (const av of [false, true])
      for (const bv of [false, true]) {
        if (mode === "full") {
          for (const cv of [false, true]) {
            const s1 = av !== bv, c1 = av && bv;
            const s2 = s1 !== cv, c2 = (s1 && cv) || c1;
            rows.push({ a: av, b: bv, c: cv, sum: s2, carry: c2 });
          }
        } else {
          rows.push({ a: av, b: bv, c: false, sum: av !== bv, carry: av && bv });
        }
      }
    return rows;
  }, [mode]);

  return (
    <div style={{ background: "#0e0e16", border: "1px solid #2a2a3e", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", textTransform: "uppercase", letterSpacing: 1.5 }}>Interactive Simulation</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd8" }}>{mode === "half" ? "Half Adder" : "Full Adder"}</span>
      </div>

      {/* Controls */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => { setMode(m => m === "half" ? "full" : "half"); setCIn(false); }}
          style={{
            padding: "6px 14px", borderRadius: 4, fontFamily: "monospace", fontSize: 12, cursor: "pointer",
            background: mode === "full" ? "rgba(108,92,231,0.15)" : "#1e1e2e",
            border: `1px solid ${mode === "full" ? "#6c5ce7" : "#2a2a3e"}`,
            color: mode === "full" ? "#a29bfe" : "#8888a0",
          }}>
          {mode === "half" ? "Half Adder" : "Full Adder"}
        </button>
        <div style={{ width: 1, height: 24, background: "#2a2a3e" }} />
        <BitBtn label="A" value={a} onClick={() => setA(!a)} />
        <BitBtn label="B" value={b} onClick={() => setB(!b)} />
        {mode === "full" && <BitBtn label="C_in" value={cIn} onClick={() => setCIn(!cIn)} />}
      </div>

      {/* Circuit + Truth table */}
      <div style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Circuit SVG */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {mode === "half" ? (
            <svg viewBox="0 0 320 170" style={{ width: "100%", maxWidth: 400, margin: "0 auto", display: "block" }}>
              {/* Labels */}
              <text x={10} y={58} fill={sig(a)} fontSize={13} fontFamily="monospace" fontWeight="bold">A</text>
              <text x={10} y={122} fill={sig(b)} fontSize={13} fontFamily="monospace" fontWeight="bold">B</text>
              {/* Wires to XOR */}
              <line x1={26} y1={54} x2={80} y2={62} stroke={sig(a)} strokeWidth={2} />
              <line x1={26} y1={118} x2={80} y2={78} stroke={sig(b)} strokeWidth={2} />
              <GateShape x={100} y={70} type="XOR" a={a} b={b} out={ha1Sum} label="XOR" />
              <text x={172} y={64} fill={sig(ha1Sum)} fontSize={12} fontFamily="monospace" fontWeight="bold">Sum = {ha1Sum ? "1" : "0"}</text>
              {/* Wires to AND */}
              <line x1={26} y1={54} x2={26} y2={107} stroke={sig(a)} strokeWidth={1.5} opacity={0.5} />
              <line x1={26} y1={107} x2={80} y2={112} stroke={sig(a)} strokeWidth={2} />
              <line x1={26} y1={118} x2={26} y2={128} stroke={sig(b)} strokeWidth={1.5} opacity={0.5} />
              <line x1={26} y1={128} x2={80} y2={128} stroke={sig(b)} strokeWidth={2} />
              <GateShape x={100} y={120} type="AND" a={a} b={b} out={ha1Carry} label="AND" />
              <text x={172} y={114} fill={sig(ha1Carry)} fontSize={12} fontFamily="monospace" fontWeight="bold">Carry = {ha1Carry ? "1" : "0"}</text>
              {/* Bounding box */}
              <rect x={76} y={40} width={94} height={110} rx={4} fill="none" stroke="#2a2a3e" strokeWidth={1} strokeDasharray="4 2" />
              <text x={123} y={162} textAnchor="middle" fill="#8888a0" fontSize={8} fontFamily="monospace">Half Adder</text>
            </svg>
          ) : (
            <svg viewBox="0 0 460 240" style={{ width: "100%", maxWidth: 520, margin: "0 auto", display: "block" }}>
              {/* Input labels */}
              <text x={6} y={53} fill={sig(a)} fontSize={12} fontFamily="monospace" fontWeight="bold">A</text>
              <text x={6} y={103} fill={sig(b)} fontSize={12} fontFamily="monospace" fontWeight="bold">B</text>
              <text x={6} y={193} fill={sig(cIn)} fontSize={10} fontFamily="monospace" fontWeight="bold">C_in</text>
              {/* HA1 box */}
              <rect x={66} y={26} width={104} height={114} rx={4} fill="none" stroke="#2a2a3e" strokeWidth={1} strokeDasharray="4 2" />
              <text x={118} y={150} textAnchor="middle" fill="#8888a0" fontSize={7} fontFamily="monospace">HA1</text>
              {/* HA1 wires */}
              <line x1={20} y1={50} x2={68} y2={57} stroke={sig(a)} strokeWidth={2} />
              <line x1={20} y1={100} x2={68} y2={73} stroke={sig(b)} strokeWidth={2} />
              <GateShape x={86} y={65} type="XOR" a={a} b={b} out={ha1Sum} label="XOR" />
              <line x1={20} y1={50} x2={20} y2={107} stroke={sig(a)} strokeWidth={1} />
              <line x1={20} y1={107} x2={68} y2={107} stroke={sig(a)} strokeWidth={2} />
              <line x1={20} y1={100} x2={20} y2={123} stroke={sig(b)} strokeWidth={1} />
              <line x1={20} y1={123} x2={68} y2={123} stroke={sig(b)} strokeWidth={2} />
              <GateShape x={86} y={115} type="AND" a={a} b={b} out={ha1Carry} label="AND" />
              {/* HA2 box */}
              <rect x={206} y={26} width={104} height={134} rx={4} fill="none" stroke="#2a2a3e" strokeWidth={1} strokeDasharray="4 2" />
              <text x={258} y={172} textAnchor="middle" fill="#8888a0" fontSize={7} fontFamily="monospace">HA2</text>
              {/* HA1 Sum -> HA2 */}
              <line x1={142} y1={65} x2={190} y2={65} stroke={sig(ha1Sum)} strokeWidth={2} />
              <line x1={190} y1={65} x2={190} y2={57} stroke={sig(ha1Sum)} strokeWidth={1.5} />
              <line x1={190} y1={57} x2={208} y2={57} stroke={sig(ha1Sum)} strokeWidth={2} />
              {/* C_in -> HA2 */}
              <line x1={20} y1={190} x2={190} y2={190} stroke={sig(cIn)} strokeWidth={2} />
              <line x1={190} y1={190} x2={190} y2={73} stroke={sig(cIn)} strokeWidth={1.5} />
              <line x1={190} y1={73} x2={208} y2={73} stroke={sig(cIn)} strokeWidth={2} />
              <GateShape x={226} y={65} type="XOR" a={ha1Sum} b={cIn} out={ha2Sum} label="XOR" />
              {/* HA2 AND */}
              <line x1={190} y1={65} x2={190} y2={117} stroke={sig(ha1Sum)} strokeWidth={1} />
              <line x1={190} y1={117} x2={208} y2={117} stroke={sig(ha1Sum)} strokeWidth={2} />
              <line x1={190} y1={133} x2={208} y2={133} stroke={sig(cIn)} strokeWidth={2} />
              <line x1={190} y1={133} x2={190} y2={190} stroke={sig(cIn)} strokeWidth={1} />
              <GateShape x={226} y={125} type="AND" a={ha1Sum} b={cIn} out={ha2Carry} label="AND" />
              {/* Sum output */}
              <line x1={282} y1={65} x2={370} y2={65} stroke={sig(ha2Sum)} strokeWidth={2} />
              <text x={380} y={69} fill={sig(ha2Sum)} fontSize={12} fontFamily="monospace" fontWeight="bold">Sum = {ha2Sum ? "1" : "0"}</text>
              {/* OR gate for carry */}
              <line x1={142} y1={115} x2={158} y2={115} stroke={sig(ha1Carry)} strokeWidth={2} />
              <line x1={158} y1={115} x2={158} y2={192} stroke={sig(ha1Carry)} strokeWidth={1.5} />
              <line x1={158} y1={192} x2={328} y2={192} stroke={sig(ha1Carry)} strokeWidth={2} />
              <line x1={282} y1={125} x2={306} y2={125} stroke={sig(ha2Carry)} strokeWidth={2} />
              <line x1={306} y1={125} x2={306} y2={208} stroke={sig(ha2Carry)} strokeWidth={1.5} />
              <line x1={306} y1={208} x2={328} y2={208} stroke={sig(ha2Carry)} strokeWidth={2} />
              <GateShape x={346} y={200} type="OR" a={ha1Carry} b={ha2Carry} out={fullCarry} label="OR" />
              <text x={416} y={204} fill={sig(fullCarry)} fontSize={12} fontFamily="monospace" fontWeight="bold">C_out = {fullCarry ? "1" : "0"}</text>
            </svg>
          )}
        </div>

        {/* Truth table */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", marginBottom: 8, textAlign: "center" }}>Truth Table</div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            <table style={{ width: "100%", fontSize: 12, fontFamily: "monospace", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3e" }}>
                  <th style={{ padding: 4, color: "#8888a0" }}>A</th>
                  <th style={{ padding: 4, color: "#8888a0" }}>B</th>
                  {mode === "full" && <th style={{ padding: 4, color: "#8888a0" }}>Cin</th>}
                  <th style={{ padding: 4, color: "#8888a0" }}>S</th>
                  <th style={{ padding: 4, color: "#8888a0" }}>Co</th>
                </tr>
              </thead>
              <tbody>
                {truthTable.map((row, i) => {
                  const cur = row.a === a && row.b === b && (mode === "half" || row.c === cIn);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(42,42,62,0.4)", background: cur ? "rgba(108,92,231,0.12)" : "transparent" }}>
                      <td style={{ padding: 4, textAlign: "center", color: sig(row.a) }}>{row.a ? "1" : "0"}</td>
                      <td style={{ padding: 4, textAlign: "center", color: sig(row.b) }}>{row.b ? "1" : "0"}</td>
                      {mode === "full" && <td style={{ padding: 4, textAlign: "center", color: sig(row.c) }}>{row.c ? "1" : "0"}</td>}
                      <td style={{ padding: 4, textAlign: "center", fontWeight: 700, color: sig(row.sum) }}>{row.sum ? "1" : "0"}</td>
                      <td style={{ padding: 4, textAlign: "center", fontWeight: 700, color: sig(row.carry) }}>{row.carry ? "1" : "0"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Binary addition readout */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #2a2a3e", background: "#12121a" }}>
        <div style={{ fontSize: 13, fontFamily: "monospace", textAlign: "center" }}>
          <span style={{ color: "#8888a0" }}>Binary: </span>
          <span style={{ color: sig(a) }}>{a ? "1" : "0"}</span>
          <span style={{ color: "#8888a0" }}> + </span>
          <span style={{ color: sig(b) }}>{b ? "1" : "0"}</span>
          {mode === "full" && <>
            <span style={{ color: "#8888a0" }}> + </span>
            <span style={{ color: sig(cIn) }}>{cIn ? "1" : "0"}</span>
          </>}
          <span style={{ color: "#8888a0" }}> = </span>
          <span style={{ color: "white", fontWeight: 700 }}>{finalCarry ? "1" : "0"}{finalSum ? "1" : "0"}</span>
          <span style={{ color: "#8888a0" }}> (decimal {(finalCarry ? 2 : 0) + (finalSum ? 1 : 0)})</span>
        </div>
      </div>
    </div>
  );
}
