"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = ["IF", "ID", "EX", "MEM", "WB"] as const;
const STAGE_COLORS: Record<string, string> = {
  IF: "#3b82f6", ID: "#8b5cf6", EX: "#f59e0b", MEM: "#10b981", WB: "#ef4444",
};

interface Instruction {
  name: string; op: string; rd?: string; rs1?: string; rs2?: string; imm?: string; color: string;
}

const INSTRUCTIONS: Instruction[] = [
  { name: "add x1, x2, x3",  op: "add",  rd: "x1", rs1: "x2", rs2: "x3", color: "#6c5ce7" },
  { name: "lw x4, 0(x1)",    op: "lw",   rd: "x4", rs1: "x1", imm: "0",  color: "#00cec9" },
  { name: "sub x5, x4, x2",  op: "sub",  rd: "x5", rs1: "x4", rs2: "x2", color: "#fdcb6e" },
  { name: "beq x5, x0, 8",   op: "beq",  rs1: "x5", rs2: "x0", imm: "8", color: "#e17055" },
  { name: "add x6, x1, x3",  op: "add",  rd: "x6", rs1: "x1", rs2: "x3", color: "#55efc4" },
  { name: "sw x6, 4(x1)",    op: "sw",   rs1: "x6", rs2: "x1", imm: "4", color: "#74b9ff" },
  { name: "add x7, x2, x5",  op: "add",  rd: "x7", rs1: "x2", rs2: "x5", color: "#ff7675" },
];

type HazardType = "data" | "load-use" | "control" | null;
interface PipelineSlot { instrIdx: number | null; hazard: HazardType; bubble: boolean; flushed: boolean; }

function buildPipeline(maxCycle: number) {
  const timeline: PipelineSlot[][] = [];
  let pc = 0;
  let stallNextCycle = false;
  let flushCount = 0;

  for (let cycle = 0; cycle < maxCycle; cycle++) {
    const row: PipelineSlot[] = Array.from({ length: 5 }, () => ({
      instrIdx: null, hazard: null, bubble: false, flushed: false,
    }));

    if (stallNextCycle) {
      row[0] = { instrIdx: null, hazard: "load-use", bubble: true, flushed: false };
      stallNextCycle = false;
    } else if (flushCount > 0) {
      row[0] = { instrIdx: null, hazard: "control", bubble: false, flushed: true };
      flushCount--;
    }

    timeline.push(row);

    // Check for hazards when instruction enters ID
    if (pc < INSTRUCTIONS.length) {
      const instr = INSTRUCTIONS[pc];
      // Load-use: lw followed by consumer
      if (pc > 0 && INSTRUCTIONS[pc - 1].op === "lw" && INSTRUCTIONS[pc - 1].rd &&
          (instr.rs1 === INSTRUCTIONS[pc - 1].rd || instr.rs2 === INSTRUCTIONS[pc - 1].rd)) {
        stallNextCycle = true;
      }
      // Control hazard on beq
      if (instr.op === "beq") {
        flushCount = 1;
      }
      pc++;
    }
  }
  return timeline;
}

export default function PipelineSim() {
  const [cycle, setCycle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalCycles = INSTRUCTIONS.length + STAGES.length + 3;
  const pipeline = useRef(buildPipeline(totalCycles)).current;

  // Build the actual grid: which instruction is at which stage at which cycle
  const grid = useRef<(PipelineSlot)[][]>([]);
  if (grid.current.length === 0) {
    const g: PipelineSlot[][] = [];
    let instrStage: number[] = []; // current stage index for each issued instruction
    let issueQueue: number[] = [];
    let stallCycles = 0;
    let flushCycles = 0;

    for (let i = 0; i < INSTRUCTIONS.length; i++) issueQueue.push(i);

    for (let c = 0; c < totalCycles; c++) {
      const row: PipelineSlot[] = Array.from({ length: 5 }, () => ({
        instrIdx: null, hazard: null, bubble: false, flushed: false,
      }));

      // Advance all in-flight instructions
      for (let i = instrStage.length - 1; i >= 0; i--) {
        if (instrStage[i] < 5) {
          const stg = instrStage[i];
          let hazard: HazardType = null;

          // Detect data hazard (forwarding) at EX stage
          if (stg === 2) {
            const instr = INSTRUCTIONS[i];
            for (let j = i - 1; j >= Math.max(0, i - 2); j--) {
              if (instrStage[j] >= 2 && instrStage[j] <= 4 && INSTRUCTIONS[j].rd &&
                  (instr.rs1 === INSTRUCTIONS[j].rd || instr.rs2 === INSTRUCTIONS[j].rd) &&
                  INSTRUCTIONS[j].op !== "lw") {
                hazard = "data";
              }
            }
          }

          row[stg] = { instrIdx: i, hazard, bubble: false, flushed: false };
          instrStage[i]++;
        }
      }

      // Issue new instruction
      if (stallCycles > 0) {
        row[0] = { instrIdx: null, hazard: "load-use", bubble: true, flushed: false };
        stallCycles--;
      } else if (flushCycles > 0) {
        row[0] = { instrIdx: null, hazard: "control", bubble: false, flushed: true };
        flushCycles--;
      } else if (issueQueue.length > 0) {
        const idx = issueQueue.shift()!;
        instrStage.push(0);
        const instr = INSTRUCTIONS[idx];

        // Load-use: lw result needed next cycle
        if (idx > 0 && INSTRUCTIONS[idx - 1].op === "lw" && INSTRUCTIONS[idx - 1].rd &&
            (instr.rs1 === INSTRUCTIONS[idx - 1].rd || instr.rs2 === INSTRUCTIONS[idx - 1].rd)) {
          stallCycles = 1;
        }
        if (instr.op === "beq") {
          flushCycles = 1;
        }

        row[0] = { instrIdx: idx, hazard: null, bubble: false, flushed: false };
        instrStage[instrStage.length - 1] = 1;
      }

      g.push(row);
    }
    grid.current = g;
  }

  const step = useCallback(() => {
    setCycle(c => Math.min(c + 1, totalCycles - 1));
  }, [totalCycles]);

  const reset = useCallback(() => {
    setCycle(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(step, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, step]);

  useEffect(() => {
    if (cycle >= totalCycles - 1) setPlaying(false);
  }, [cycle, totalCycles]);

  // Count stats
  let bubbles = 0, flushes = 0;
  for (let c = 0; c <= cycle; c++) {
    for (const slot of grid.current[c] || []) {
      if (slot.bubble) bubbles++;
      if (slot.flushed) flushes++;
    }
  }
  const completedInstrs = grid.current.slice(0, cycle + 1)
    .reduce((acc, row) => acc + (row[4]?.instrIdx !== null ? 1 : 0), 0);
  const cpi = completedInstrs > 0 ? ((cycle + 1) / completedInstrs).toFixed(2) : "--";

  const stageW = 110, stageH = 56, gapX = 12, gapY = 6;
  const svgW = STAGES.length * (stageW + gapX) + 40;
  const visibleCycles = Math.min(cycle + 1, 10);
  const startCycle = Math.max(0, cycle - 9);
  const svgH = 50 + visibleCycles * (stageH + gapY) + 20;

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6c5ce7]" />
          <span className="text-xs font-mono text-[#8888a0] uppercase tracking-wider">
            Interactive Simulation
          </span>
        </div>
        <span className="text-sm font-semibold text-[#e0ddd8]">5-Stage Pipeline</span>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-center gap-3 flex-wrap">
        <button onClick={() => setPlaying(!playing)}
          className="px-3 py-1.5 rounded text-xs font-mono bg-[#6c5ce7] text-white hover:bg-[#5a4bd6] transition-colors">
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={step} disabled={playing || cycle >= totalCycles - 1}
          className="px-3 py-1.5 rounded text-xs font-mono bg-[#1e1e2e] text-[#c8c6c3] border border-[#2a2a3e] hover:border-[#6c5ce7] disabled:opacity-40 transition-colors">
          Step
        </button>
        <button onClick={reset}
          className="px-3 py-1.5 rounded text-xs font-mono bg-[#1e1e2e] text-[#c8c6c3] border border-[#2a2a3e] hover:border-[#6c5ce7] transition-colors">
          Reset
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#8888a0] font-mono">Speed</span>
          <input type="range" min={200} max={2000} step={100} value={2200 - speed}
            onChange={e => setSpeed(2200 - Number(e.target.value))}
            className="w-24 accent-[#6c5ce7]" />
        </div>
      </div>

      {/* Instruction list */}
      <div className="px-5 py-2 border-b border-[#2a2a3e] flex gap-2 flex-wrap">
        {INSTRUCTIONS.map((inst, i) => (
          <span key={i} className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ backgroundColor: inst.color + "20", color: inst.color, border: `1px solid ${inst.color}40` }}>
            {inst.name}
          </span>
        ))}
      </div>

      {/* SVG Pipeline */}
      <div className="px-5 py-4 overflow-x-auto">
        <svg width={svgW} height={svgH} className="mx-auto">
          {/* Stage headers */}
          {STAGES.map((s, i) => (
            <g key={s}>
              <rect x={20 + i * (stageW + gapX)} y={4} width={stageW} height={28} rx={4}
                fill={STAGE_COLORS[s] + "30"} stroke={STAGE_COLORS[s]} strokeWidth={1} />
              <text x={20 + i * (stageW + gapX) + stageW / 2} y={23}
                textAnchor="middle" fill={STAGE_COLORS[s]} fontSize={12} fontFamily="monospace" fontWeight="bold">
                {s}
              </text>
              {/* Pipeline register bar between stages */}
              {i < STAGES.length - 1 && (
                <rect x={20 + (i + 1) * (stageW + gapX) - gapX / 2 - 2} y={4} width={4} height={28}
                  rx={1} fill="#2a2a3e" />
              )}
            </g>
          ))}

          {/* Cycle rows */}
          <AnimatePresence>
            {Array.from({ length: visibleCycles }, (_, ri) => {
              const c = startCycle + ri;
              const row = grid.current[c] || [];
              const y = 44 + ri * (stageH + gapY);
              return (
                <g key={`cycle-${c}`}>
                  <text x={4} y={y + stageH / 2 + 4} fill="#8888a0" fontSize={9} fontFamily="monospace">
                    C{c}
                  </text>
                  {row.map((slot, si) => {
                    const x = 20 + si * (stageW + gapX);
                    if (slot.bubble) {
                      return (
                        <motion.g key={`${c}-${si}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <rect x={x} y={y} width={stageW} height={stageH} rx={4}
                            fill="#ef444420" stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                          <text x={x + stageW / 2} y={y + stageH / 2 + 4}
                            textAnchor="middle" fill="#ef4444" fontSize={10} fontFamily="monospace">
                            STALL
                          </text>
                        </motion.g>
                      );
                    }
                    if (slot.flushed) {
                      return (
                        <motion.g key={`${c}-${si}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <rect x={x} y={y} width={stageW} height={stageH} rx={4}
                            fill="#f59e0b20" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,3" />
                          <text x={x + stageW / 2} y={y + stageH / 2 + 4}
                            textAnchor="middle" fill="#f59e0b" fontSize={10} fontFamily="monospace">
                            FLUSH
                          </text>
                        </motion.g>
                      );
                    }
                    if (slot.instrIdx === null) {
                      return (
                        <rect key={`${c}-${si}`} x={x} y={y} width={stageW} height={stageH} rx={4}
                          fill="#12121a" stroke="#1e1e2e" strokeWidth={1} />
                      );
                    }
                    const instr = INSTRUCTIONS[slot.instrIdx];
                    const hazardBorder = slot.hazard === "data" ? "#facc15" : instr.color;
                    return (
                      <motion.g key={`${c}-${si}`}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}>
                        <rect x={x} y={y} width={stageW} height={stageH} rx={4}
                          fill={instr.color + "18"} stroke={hazardBorder} strokeWidth={slot.hazard ? 2 : 1} />
                        <text x={x + stageW / 2} y={y + 20}
                          textAnchor="middle" fill={instr.color} fontSize={10} fontFamily="monospace" fontWeight="bold">
                          {instr.op}
                        </text>
                        <text x={x + stageW / 2} y={y + 36}
                          textAnchor="middle" fill="#8888a0" fontSize={9} fontFamily="monospace">
                          {instr.rd || instr.rs1 || ""}
                        </text>
                        {slot.hazard === "data" && (
                          <text x={x + stageW / 2} y={y + stageH - 4}
                            textAnchor="middle" fill="#facc15" fontSize={8} fontFamily="monospace">
                            FWD
                          </text>
                        )}
                      </motion.g>
                    );
                  })}
                  {/* Pipeline register bars between stages */}
                  {[0, 1, 2, 3].map(si => (
                    <rect key={`pr-${c}-${si}`}
                      x={20 + (si + 1) * (stageW + gapX) - gapX / 2 - 2} y={y}
                      width={4} height={stageH} rx={1} fill="#2a2a3e" opacity={0.6} />
                  ))}
                </g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 py-2 border-t border-[#2a2a3e] flex gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-mono text-[#8888a0]">
          <span className="w-3 h-3 rounded-sm border-2 border-[#facc15] bg-[#facc1520]" /> Data Hazard (FWD)
        </span>
        <span className="flex items-center gap-1.5 text-xs font-mono text-[#8888a0]">
          <span className="w-3 h-3 rounded-sm border border-dashed border-[#ef4444] bg-[#ef444420]" /> Load-Use Stall
        </span>
        <span className="flex items-center gap-1.5 text-xs font-mono text-[#8888a0]">
          <span className="w-3 h-3 rounded-sm border border-dashed border-[#f59e0b] bg-[#f59e0b20]" /> Control Flush
        </span>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 border-t border-[#2a2a3e] grid grid-cols-4 gap-4">
        {[
          { label: "Clock Cycle", value: cycle },
          { label: "Completed", value: completedInstrs },
          { label: "Stalls + Flushes", value: `${bubbles} + ${flushes}` },
          { label: "CPI", value: cpi },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-lg font-mono text-[#6c5ce7]">{s.value}</div>
            <div className="text-xs text-[#8888a0] font-mono">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
