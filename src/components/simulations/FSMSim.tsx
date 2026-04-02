"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type StateId = "GREEN" | "YELLOW" | "RED" | "WALK";
type InputType = "Timer Expired" | "Pedestrian Button" | "Emergency";
type MachineMode = "Moore" | "Mealy";

interface FSMState {
  id: StateId;
  label: string;
  cx: number;
  cy: number;
  outputs: { green: boolean; yellow: boolean; red: boolean; walk: boolean };
}

interface Transition {
  from: StateId;
  to: StateId;
  input: InputType;
  mealyOutput?: string;
}

const STATES: FSMState[] = [
  { id: "GREEN", label: "GREEN", cx: 140, cy: 100, outputs: { green: true, yellow: false, red: false, walk: false } },
  { id: "YELLOW", label: "YELLOW", cx: 380, cy: 100, outputs: { green: false, yellow: true, red: false, walk: false } },
  { id: "RED", label: "RED", cx: 380, cy: 260, outputs: { green: false, yellow: false, red: true, walk: false } },
  { id: "WALK", label: "WALK", cx: 140, cy: 260, outputs: { green: false, yellow: false, red: true, walk: true } },
];

const TRANSITIONS: Transition[] = [
  { from: "GREEN", to: "YELLOW", input: "Timer Expired", mealyOutput: "G->Y" },
  { from: "YELLOW", to: "RED", input: "Timer Expired", mealyOutput: "Y->R" },
  { from: "RED", to: "GREEN", input: "Timer Expired", mealyOutput: "R->G" },
  { from: "RED", to: "WALK", input: "Pedestrian Button", mealyOutput: "Activate Walk" },
  { from: "WALK", to: "RED", input: "Timer Expired", mealyOutput: "W->R" },
  { from: "GREEN", to: "RED", input: "Emergency", mealyOutput: "EMERGENCY" },
  { from: "YELLOW", to: "RED", input: "Emergency", mealyOutput: "EMERGENCY" },
  { from: "WALK", to: "RED", input: "Emergency", mealyOutput: "EMERGENCY" },
];

interface LogEntry {
  from: StateId;
  to: StateId;
  input: InputType;
  step: number;
}

function getTransition(from: StateId, input: InputType): Transition | undefined {
  return TRANSITIONS.find((t) => t.from === from && t.input === input);
}

function getArrowPath(from: FSMState, to: FSMState, idx: number): { path: string; labelX: number; labelY: number; angle: number } {
  if (from.id === to.id) {
    const lx = from.cx, ly = from.cy - 55;
    return { path: `M${from.cx - 12},${from.cy - 28} C${from.cx - 30},${from.cy - 65} ${from.cx + 30},${from.cy - 65} ${from.cx + 12},${from.cy - 28}`, labelX: lx, labelY: ly - 8, angle: 0 };
  }
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist, ny = dy / dist;
  const perpX = -ny * 12 * (idx % 2 === 0 ? 1 : -1);
  const perpY = nx * 12 * (idx % 2 === 0 ? 1 : -1);
  const sx = from.cx + nx * 32 + perpX, sy = from.cy + ny * 32 + perpY;
  const ex = to.cx - nx * 32 + perpX, ey = to.cy - ny * 32 + perpY;
  const mx = (sx + ex) / 2 + perpX, my = (sy + ey) / 2 + perpY;
  return { path: `M${sx},${sy} Q${mx},${my} ${ex},${ey}`, labelX: mx, labelY: my - 8, angle: Math.atan2(ey - sy, ex - sx) * (180 / Math.PI) };
}

export default function FSMSim() {
  const [currentState, setCurrentState] = useState<StateId>("GREEN");
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [step, setStep] = useState(0);
  const [activeTransition, setActiveTransition] = useState<string | null>(null);
  const [mode, setMode] = useState<MachineMode>("Moore");

  const stateMap = Object.fromEntries(STATES.map((s) => [s.id, s])) as Record<StateId, FSMState>;
  const currentFSMState = stateMap[currentState];

  const handleInput = useCallback((input: InputType) => {
    const t = getTransition(currentState, input);
    if (!t) return;
    const key = `${t.from}-${t.to}-${input}`;
    setActiveTransition(key);
    setTimeout(() => {
      setCurrentState(t.to);
      setHistory((prev) => [{ from: t.from, to: t.to, input, step: step + 1 }, ...prev].slice(0, 10));
      setStep((s) => s + 1);
      setTimeout(() => setActiveTransition(null), 400);
    }, 500);
  }, [currentState, step]);

  const renderedArrows: { key: string; t: Transition; arrowData: ReturnType<typeof getArrowPath> }[] = [];
  const seen = new Set<string>();
  TRANSITIONS.forEach((t, i) => {
    const pairKey = [t.from, t.to].sort().join("-") + t.input;
    const idx = seen.has(`${t.from}-${t.to}`) ? 1 : 0;
    seen.add(`${t.from}-${t.to}`);
    const from = stateMap[t.from], to = stateMap[t.to];
    renderedArrows.push({ key: `${t.from}-${t.to}-${t.input}`, t, arrowData: getArrowPath(from, to, idx) });
  });

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-5 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#c8c6c3] font-semibold text-base tracking-tight">Finite State Machine Simulator</h3>
        <div className="flex gap-1 bg-[#1a1a2e] rounded-md p-0.5">
          {(["Moore", "Mealy"] as MachineMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-xs transition-colors ${mode === m ? "bg-[#6c5ce7] text-white" : "text-[#8888a0] hover:text-[#c8c6c3]"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* SVG State Diagram */}
        <div className="flex-1 bg-[#12121a] rounded-lg border border-[#2a2a3e] overflow-hidden">
          <svg viewBox="0 0 520 340" className="w-full h-auto">
            <defs>
              <marker id="fsm-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill="#6c5ce7" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Transition arrows */}
            {renderedArrows.map(({ key, t, arrowData }) => {
              const isActive = activeTransition === key;
              return (
                <g key={key}>
                  <motion.path d={arrowData.path} fill="none"
                    stroke={isActive ? "#a29bfe" : "#3a3a5e"} strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd="url(#fsm-arrow)"
                    animate={{ strokeOpacity: isActive ? [0.5, 1, 0.5] : 0.7 }}
                    transition={isActive ? { duration: 0.4, repeat: 2 } : {}} />
                  <text x={arrowData.labelX} y={arrowData.labelY} textAnchor="middle"
                    className="text-[9px]" fill={isActive ? "#a29bfe" : "#6c5ce7"}>
                    {t.input.replace("Pedestrian Button", "Ped.")}
                  </text>
                  {mode === "Mealy" && (
                    <text x={arrowData.labelX} y={arrowData.labelY + 12} textAnchor="middle"
                      className="text-[8px]" fill="#e8845c">
                      /{t.mealyOutput}
                    </text>
                  )}
                </g>
              );
            })}

            {/* State circles */}
            {STATES.map((s) => {
              const isCurrent = currentState === s.id;
              return (
                <g key={s.id}>
                  <motion.circle cx={s.cx} cy={s.cy} r={28} fill={isCurrent ? "#1e1e3a" : "#12121a"}
                    stroke={isCurrent ? "#6c5ce7" : "#3a3a5e"} strokeWidth={isCurrent ? 2.5 : 1.5}
                    filter={isCurrent ? "url(#glow)" : undefined}
                    animate={{ scale: isCurrent ? [1, 1.04, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }} />
                  {/* Inner circle for double-circle notation */}
                  {isCurrent && <circle cx={s.cx} cy={s.cy} r={23} fill="none" stroke="#6c5ce7" strokeWidth={0.8} opacity={0.5} />}
                  <text x={s.cx} y={s.cy - 4} textAnchor="middle" fill={isCurrent ? "#c8c6c3" : "#6a6a8e"} className="text-[11px] font-semibold">
                    {s.label}
                  </text>
                  {mode === "Moore" && (
                    <text x={s.cx} y={s.cy + 12} textAnchor="middle" fill="#e8845c" className="text-[8px]">
                      {[s.outputs.green && "G", s.outputs.yellow && "Y", s.outputs.red && "R", s.outputs.walk && "W"].filter(Boolean).join(",")}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls + Output Panel */}
        <div className="w-full lg:w-56 flex flex-col gap-3">
          {/* Input buttons */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-2">Inputs</div>
            <div className="flex flex-col gap-2">
              {(["Timer Expired", "Pedestrian Button", "Emergency"] as InputType[]).map((input) => {
                const valid = !!getTransition(currentState, input);
                return (
                  <button key={input} onClick={() => valid && handleInput(input)} disabled={!valid || !!activeTransition}
                    className={`px-3 py-2 rounded text-xs text-left transition-all
                      ${valid ? "bg-[#1a1a2e] text-[#c8c6c3] hover:bg-[#6c5ce7] hover:text-white border border-[#2a2a3e] hover:border-[#6c5ce7]"
                              : "bg-[#0e0e16] text-[#3a3a5e] border border-[#1a1a2e] cursor-not-allowed"}`}>
                    {input}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output lights */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-2">Outputs</div>
            <div className="flex items-center gap-3 justify-center">
              {[
                { key: "red", color: "#ef4444", on: currentFSMState.outputs.red },
                { key: "yellow", color: "#eab308", on: currentFSMState.outputs.yellow },
                { key: "green", color: "#22c55e", on: currentFSMState.outputs.green },
              ].map(({ key, color, on }) => (
                <motion.div key={key} className="w-7 h-7 rounded-full border-2" style={{
                  borderColor: on ? color : "#2a2a3e",
                  backgroundColor: on ? color : "transparent",
                  boxShadow: on ? `0 0 12px ${color}` : "none",
                }}
                  animate={{ opacity: on ? [0.8, 1, 0.8] : 0.3 }}
                  transition={on ? { duration: 1.2, repeat: Infinity } : {}} />
              ))}
              <div className="w-px h-6 bg-[#2a2a3e]" />
              <div className="flex flex-col items-center gap-1">
                <motion.div className="w-5 h-5 rounded border" style={{
                  borderColor: currentFSMState.outputs.walk ? "#f59e0b" : "#2a2a3e",
                  backgroundColor: currentFSMState.outputs.walk ? "#f59e0b" : "transparent",
                  boxShadow: currentFSMState.outputs.walk ? "0 0 8px #f59e0b" : "none",
                }}
                  animate={{ opacity: currentFSMState.outputs.walk ? [0.6, 1, 0.6] : 0.3 }}
                  transition={currentFSMState.outputs.walk ? { duration: 0.6, repeat: Infinity } : {}} />
                <span className="text-[8px] text-[#6a6a8e]">WALK</span>
              </div>
            </div>
          </div>

          {/* Current state */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3 text-center">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-1">Current State</div>
            <AnimatePresence mode="wait">
              <motion.div key={currentState}
                initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
                className="text-[#6c5ce7] text-lg font-bold">
                {currentState}
              </motion.div>
            </AnimatePresence>
            <div className="text-[#3a3a5e] text-[10px] mt-1">Step {step}</div>
          </div>
        </div>
      </div>

      {/* History log */}
      <div className="mt-4 bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
        <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-2">Transition History</div>
        <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
          {history.length === 0 ? (
            <div className="text-[#3a3a5e] text-xs text-center py-2">No transitions yet. Press an input button above.</div>
          ) : (
            history.map((entry, i) => (
              <motion.div key={`${entry.step}-${i}`} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 text-xs">
                <span className="text-[#3a3a5e] w-6 text-right">#{entry.step}</span>
                <span className="text-[#8888a0]">{entry.from}</span>
                <span className="text-[#6c5ce7]">--[{entry.input}]--&gt;</span>
                <span className="text-[#c8c6c3]">{entry.to}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
