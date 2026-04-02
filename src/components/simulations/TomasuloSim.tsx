"use client";

import { useState, useCallback } from "react";

type Op = "MUL" | "ADD" | "SUB";

interface Instruction {
  op: Op; dest: string; src1: string; src2: string;
  issued: number | null; execStart: number | null; execEnd: number | null; written: number | null;
}

interface RS {
  name: string; busy: boolean; op: Op | ""; vj: string; vk: string; qj: string; qk: string;
  instrIdx: number | null; countdown: number;
}

const LATENCY: Record<Op, number> = { ADD: 2, SUB: 2, MUL: 10 };
const ALL_REGS = ["F0", "F2", "F4", "F6", "F8", "F10", "F14"];

const REG_VALS: Record<string, number> = { F0: 0, F2: 2.5, F4: 4.0, F6: 0, F8: 8.0, F10: 10.0, F14: 14.0 };

function initInstrs(): Instruction[] {
  return [
    { op: "MUL", dest: "F0",  src1: "F2",  src2: "F4",  issued: null, execStart: null, execEnd: null, written: null },
    { op: "ADD", dest: "F6",  src1: "F0",  src2: "F8",  issued: null, execStart: null, execEnd: null, written: null },
    { op: "SUB", dest: "F8",  src1: "F10", src2: "F14", issued: null, execStart: null, execEnd: null, written: null },
    { op: "ADD", dest: "F2",  src1: "F0",  src2: "F6",  issued: null, execStart: null, execEnd: null, written: null },
  ];
}

function initRS(): RS[] {
  return [
    { name: "Add1", busy: false, op: "", vj: "", vk: "", qj: "", qk: "", instrIdx: null, countdown: 0 },
    { name: "Add2", busy: false, op: "", vj: "", vk: "", qj: "", qk: "", instrIdx: null, countdown: 0 },
    { name: "Add3", busy: false, op: "", vj: "", vk: "", qj: "", qk: "", instrIdx: null, countdown: 0 },
    { name: "Mul1", busy: false, op: "", vj: "", vk: "", qj: "", qk: "", instrIdx: null, countdown: 0 },
    { name: "Mul2", busy: false, op: "", vj: "", vk: "", qj: "", qk: "", instrIdx: null, countdown: 0 },
  ];
}

function initRegStat(): Record<string, string> {
  const s: Record<string, string> = {};
  ALL_REGS.forEach(r => s[r] = "");
  return s;
}

type HlKind = "issue" | "execute" | "writeback" | null;

function hlBorder(k: HlKind): string {
  if (k === "issue") return "#eab308";
  if (k === "execute") return "#6c5ce7";
  if (k === "writeback") return "#22c55e";
  return "transparent";
}

function hlBg(k: HlKind): string {
  if (k === "issue") return "rgba(234,179,8,0.08)";
  if (k === "execute") return "rgba(108,92,231,0.08)";
  if (k === "writeback") return "rgba(34,197,94,0.08)";
  return "transparent";
}

export default function TomasuloSim() {
  const [cycle, setCycle] = useState(0);
  const [instrs, setInstrs] = useState(initInstrs);
  const [stations, setStations] = useState(initRS);
  const [regStat, setRegStat] = useState(initRegStat);
  const [cdb, setCdb] = useState<string | null>(null);
  const [hl, setHl] = useState<Record<string, HlKind>>({});
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setCycle(0); setInstrs(initInstrs()); setStations(initRS()); setRegStat(initRegStat());
    setCdb(null); setHl({}); setDone(false);
  }, []);

  const step = useCallback(() => {
    if (done) return;
    const nc = cycle + 1;
    const ins = instrs.map(i => ({ ...i }));
    const rs = stations.map(s => ({ ...s }));
    const rS = { ...regStat };
    const h: Record<string, HlKind> = {};
    let cdbVal: string | null = null;

    // Phase 1: Write-back (one CDB broadcast per cycle)
    for (const s of rs) {
      if (s.busy && s.instrIdx !== null && s.countdown === 0 && ins[s.instrIdx].execEnd !== null && ins[s.instrIdx].written === null) {
        ins[s.instrIdx].written = nc;
        cdbVal = s.name;
        h[`i-${s.instrIdx}`] = "writeback";
        h[s.name] = "writeback";
        for (const o of rs) {
          if (o.qj === s.name) { o.qj = ""; o.vj = "Rdy"; }
          if (o.qk === s.name) { o.qk = ""; o.vk = "Rdy"; }
        }
        if (rS[ins[s.instrIdx].dest] === s.name) rS[ins[s.instrIdx].dest] = "";
        s.busy = false; s.op = ""; s.vj = ""; s.vk = ""; s.qj = ""; s.qk = ""; s.instrIdx = null;
        break;
      }
    }

    // Phase 2: Execute
    for (const s of rs) {
      if (s.busy && s.instrIdx !== null && ins[s.instrIdx].issued !== null && ins[s.instrIdx].execEnd === null) {
        if (s.qj === "" && s.qk === "") {
          if (ins[s.instrIdx].execStart === null) {
            ins[s.instrIdx].execStart = nc;
            s.countdown = LATENCY[s.op as Op] - 1;
            h[s.name] = "execute"; h[`i-${s.instrIdx}`] = "execute";
          } else if (s.countdown > 0) {
            s.countdown--;
            h[s.name] = "execute"; h[`i-${s.instrIdx}`] = "execute";
          } else {
            ins[s.instrIdx].execEnd = nc;
            h[s.name] = "execute"; h[`i-${s.instrIdx}`] = "execute";
          }
        }
      }
    }

    // Phase 3: Issue
    const nextI = ins.findIndex(i => i.issued === null);
    if (nextI >= 0) {
      const instr = ins[nextI];
      const isAS = instr.op === "ADD" || instr.op === "SUB";
      const avail = rs.find(s => !s.busy && (isAS ? s.name.startsWith("Add") : s.name.startsWith("Mul")));
      if (avail) {
        avail.busy = true; avail.op = instr.op; avail.instrIdx = nextI;
        instr.issued = nc;
        if (rS[instr.src1] && rS[instr.src1] !== "") { avail.qj = rS[instr.src1]; avail.vj = ""; }
        else { avail.qj = ""; avail.vj = String(REG_VALS[instr.src1] ?? 0); }
        if (rS[instr.src2] && rS[instr.src2] !== "") { avail.qk = rS[instr.src2]; avail.vk = ""; }
        else { avail.qk = ""; avail.vk = String(REG_VALS[instr.src2] ?? 0); }
        rS[instr.dest] = avail.name;
        h[avail.name] = "issue"; h[`i-${nextI}`] = "issue";
      }
    }

    const allDone = ins.every(i => i.written !== null);
    setCycle(nc); setInstrs(ins); setStations(rs); setRegStat(rS); setCdb(cdbVal); setHl(h);
    if (allDone) setDone(true);
  }, [cycle, instrs, stations, regStat, done]);

  const cellStyle = (borderColor?: string, bg?: string): React.CSSProperties => ({
    padding: "6px 8px", textAlign: "center", borderBottom: "1px solid #1e1e2e",
    borderLeft: borderColor ? `2px solid ${borderColor}` : undefined,
    background: bg || "transparent", transition: "background 0.3s",
  });

  const thStyle: React.CSSProperties = { padding: "6px 8px", textAlign: "center", color: "#6a6a8e", fontWeight: 400, fontSize: 11 };

  return (
    <div style={{ background: "#0e0e16", border: "1px solid #2a2a3e", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", textTransform: "uppercase", letterSpacing: 1.5 }}>Interactive Simulation</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd8" }}>Tomasulo&apos;s Algorithm</span>
      </div>

      {/* Controls */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#8888a0" }}>
          Cycle: <span style={{ color: "#6c5ce7", fontWeight: 700, fontSize: 16 }}>{cycle}</span>
        </div>
        <button onClick={step} disabled={done}
          style={{ padding: "6px 16px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: done ? "#1a1a2e" : "#6c5ce7", color: done ? "#3a3a5e" : "white", border: "none", cursor: done ? "not-allowed" : "pointer" }}>
          {done ? "Complete" : "Step"}
        </button>
        <button onClick={reset}
          style={{ padding: "6px 12px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: "#1e1e2e", color: "#8888a0", border: "1px solid #2a2a3e", cursor: "pointer" }}>
          Reset
        </button>
        <div style={{ display: "flex", gap: 12, marginLeft: "auto", fontSize: 10 }}>
          {([["Issue", "#eab308"], ["Execute", "#6c5ce7"], ["Write-back", "#22c55e"]] as const).map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ color: "#6a6a8e" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latencies info */}
      <div style={{ padding: "8px 20px", borderBottom: "1px solid #2a2a3e", fontSize: 11, fontFamily: "monospace", color: "#555" }}>
        Latencies: ADD=2, SUB=2, MUL=10 cycles
      </div>

      <div style={{ padding: 16, display: "flex", gap: 16, flexDirection: "column" }}>
        {/* Instruction Queue */}
        <div style={{ background: "#12121a", borderRadius: 8, border: "1px solid #2a2a3e", padding: 12 }}>
          <div style={{ fontSize: 10, color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Instruction Status</div>
          <table style={{ width: "100%", fontSize: 12, fontFamily: "monospace", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Instruction</th>
                <th style={thStyle}>Issue</th>
                <th style={thStyle}>Execute</th>
                <th style={thStyle}>Write</th>
              </tr>
            </thead>
            <tbody>
              {instrs.map((instr, i) => {
                const k = hl[`i-${i}`] || null;
                return (
                  <tr key={i}>
                    <td style={cellStyle(hlBorder(k), hlBg(k))}><span style={{ color: "#3a3a5e" }}>{i + 1}</span></td>
                    <td style={{ ...cellStyle(hlBorder(k), hlBg(k)), textAlign: "left" }}>
                      <span style={{ color: "#a29bfe" }}>{instr.op}</span>{" "}
                      <span style={{ color: "#e8845c" }}>{instr.dest}</span>, {instr.src1}, {instr.src2}
                    </td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#eab308" }}>{instr.issued ?? ""}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}>
                      <span style={{ color: "#6c5ce7" }}>
                        {instr.execStart && instr.execEnd ? `${instr.execStart}-${instr.execEnd}` : instr.execStart ? `${instr.execStart}...` : ""}
                      </span>
                    </td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#22c55e" }}>{instr.written ?? ""}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reservation Stations */}
        <div style={{ background: "#12121a", borderRadius: 8, border: "1px solid #2a2a3e", padding: 12 }}>
          <div style={{ fontSize: 10, color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Reservation Stations</div>
          <table style={{ width: "100%", fontSize: 12, fontFamily: "monospace", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Busy</th>
                <th style={thStyle}>Op</th>
                <th style={thStyle}>Vj</th>
                <th style={thStyle}>Vk</th>
                <th style={thStyle}>Qj</th>
                <th style={thStyle}>Qk</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(s => {
                const k = hl[s.name] || null;
                return (
                  <tr key={s.name}>
                    <td style={cellStyle(s.busy ? (hlBorder(k) || "#3a3a5e") : undefined, hlBg(k))}>
                      <span style={{ color: "#a29bfe", fontWeight: 600 }}>{s.name}</span>
                    </td>
                    <td style={cellStyle(undefined, hlBg(k))}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: s.busy ? "#eab308" : "#2a2a3e" }} />
                    </td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#c8c6c3" }}>{s.op || "--"}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#8888a0" }}>{s.vj || "--"}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#8888a0" }}>{s.vk || "--"}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#e8845c" }}>{s.qj || "--"}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}><span style={{ color: "#e8845c" }}>{s.qk || "--"}</span></td>
                    <td style={cellStyle(undefined, hlBg(k))}>
                      <span style={{ color: "#6c5ce7", fontWeight: 700 }}>{s.busy && s.countdown > 0 ? s.countdown : "--"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CDB + Register Status side by side */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* CDB */}
          <div style={{
            flex: "0 0 auto", background: cdb ? "rgba(34,197,94,0.06)" : "#12121a",
            borderRadius: 8, border: `1px solid ${cdb ? "#22c55e" : "#2a2a3e"}`, padding: 12, textAlign: "center", minWidth: 180,
          }}>
            <div style={{ fontSize: 10, color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Common Data Bus</div>
            {cdb ? (
              <div style={{ color: "#22c55e", fontWeight: 700, fontFamily: "monospace", fontSize: 13 }}>Broadcasting from {cdb}</div>
            ) : (
              <div style={{ color: "#3a3a5e", fontFamily: "monospace", fontSize: 13 }}>Idle</div>
            )}
          </div>

          {/* Register Status */}
          <div style={{ flex: 1, background: "#12121a", borderRadius: 8, border: "1px solid #2a2a3e", padding: 12 }}>
            <div style={{ fontSize: 10, color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Register Result Status</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${ALL_REGS.length}, 1fr)`, gap: 6 }}>
              {ALL_REGS.map(reg => {
                const producing = regStat[reg];
                return (
                  <div key={reg} style={{
                    borderRadius: 4, padding: "6px 4px", textAlign: "center",
                    border: `1px solid ${producing ? "rgba(232,132,92,0.25)" : "#1e1e2e"}`,
                    background: producing ? "rgba(232,132,92,0.04)" : "#0e0e16",
                  }}>
                    <div style={{ fontSize: 9, color: "#8888a0" }}>{reg}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: producing ? "#e8845c" : "#3a3a5e" }}>
                      {producing || "--"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div style={{ background: "#12121a", borderRadius: 8, border: "1px solid #2a2a3e", padding: 12 }}>
          <div style={{ fontSize: 10, color: "#6a6a8e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Data Dependencies (RAW)</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, fontFamily: "monospace" }}>
            {[
              { from: 1, to: 2, reg: "F0", desc: "MUL F0 \u2192 ADD src1" },
              { from: 1, to: 4, reg: "F0", desc: "MUL F0 \u2192 ADD src1" },
              { from: 2, to: 4, reg: "F6", desc: "ADD F6 \u2192 ADD src2" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8888a0" }}>
                <span style={{ color: "#e8845c" }}>I{d.from}</span>
                <svg width={30} height={10}><line x1={0} y1={5} x2={26} y2={5} stroke="#6c5ce7" strokeWidth={1} strokeDasharray="3,2" /><polygon points="24,2 28,5 24,8" fill="#6c5ce7" /></svg>
                <span style={{ color: "#e8845c" }}>I{d.to}</span>
                <span style={{ color: "#3a3a5e", fontSize: 10 }}>({d.reg})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
