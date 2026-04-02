"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

type MESIState = "M" | "E" | "S" | "I";

interface CacheLine {
  state: MESIState;
  value: number;
}

interface LogEntry {
  id: number;
  core: number;
  action: "Read" | "Write";
  bus: string;
  transitions: string;
}

const STATE_COLORS: Record<MESIState, string> = {
  M: "#f87171",
  E: "#60a5fa",
  S: "#4ade80",
  I: "#555",
};

const STATE_LABELS: Record<MESIState, string> = {
  M: "Modified",
  E: "Exclusive",
  S: "Shared",
  I: "Invalid",
};

const CORE_POSITIONS = [
  { x: 80, y: 30 },
  { x: 260, y: 30 },
  { x: 440, y: 30 },
  { x: 620, y: 30 },
];

const BUS_Y = 145;
const BOX_W = 120;
const BOX_H = 80;

function initCaches(): CacheLine[] {
  return Array.from({ length: 4 }, () => ({ state: "I" as MESIState, value: 0 }));
}

export default function CacheCoherenceSim() {
  const [caches, setCaches] = useState<CacheLine[]>(initCaches);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logCounter, setLogCounter] = useState(0);
  const [busActive, setBusActive] = useState<{ from: number; to: number[] } | null>(null);
  const [flashCore, setFlashCore] = useState<number | null>(null);

  const addLog = useCallback(
    (entry: Omit<LogEntry, "id">) => {
      setLogCounter((c) => {
        const newId = c + 1;
        setLog((prev) => [{ ...entry, id: newId }, ...prev].slice(0, 8));
        return newId;
      });
    },
    [],
  );

  const animateBus = useCallback((from: number, targets: number[]) => {
    setBusActive({ from, to: targets });
    setTimeout(() => setBusActive(null), 600);
  }, []);

  const flashCoreAnim = useCallback((core: number) => {
    setFlashCore(core);
    setTimeout(() => setFlashCore(null), 500);
  }, []);

  const handleRead = useCallback(
    (core: number) => {
      setCaches((prev) => {
        const next = prev.map((c) => ({ ...c }));
        const current = next[core];

        if (current.state === "M" || current.state === "E" || current.state === "S") {
          addLog({ core, action: "Read", bus: "None (cache hit)", transitions: `Core ${core}: ${current.state} -> ${current.state}` });
          flashCoreAnim(core);
          return next;
        }

        // State is Invalid -- need bus read
        const sharedCores = next.map((c, i) => (i !== core && c.state !== "I" ? i : -1)).filter((i) => i >= 0);

        if (sharedCores.length === 0) {
          // No other core has it -- get from memory
          next[core] = { state: "E", value: next[core].value };
          addLog({ core, action: "Read", bus: "BusRd -> Memory", transitions: `Core ${core}: I -> E` });
          animateBus(core, []);
        } else {
          // Another core has it
          const supplier = sharedCores[0];
          const supplierState = next[supplier].state;

          if (supplierState === "M") {
            // Modified -> flush to memory, both become Shared
            next[core] = { state: "S", value: next[supplier].value };
            next[supplier] = { ...next[supplier], state: "S" };
            addLog({
              core, action: "Read", bus: `BusRd -> Core ${supplier} flush`,
              transitions: `Core ${core}: I -> S, Core ${supplier}: M -> S`,
            });
          } else if (supplierState === "E") {
            next[core] = { state: "S", value: next[supplier].value };
            next[supplier] = { ...next[supplier], state: "S" };
            addLog({
              core, action: "Read", bus: `BusRd -> Core ${supplier} share`,
              transitions: `Core ${core}: I -> S, Core ${supplier}: E -> S`,
            });
          } else {
            // Shared
            next[core] = { state: "S", value: next[supplier].value };
            addLog({
              core, action: "Read", bus: "BusRd -> shared supply",
              transitions: `Core ${core}: I -> S`,
            });
          }
          animateBus(core, sharedCores);
        }
        flashCoreAnim(core);
        return next;
      });
    },
    [addLog, animateBus, flashCoreAnim],
  );

  const handleWrite = useCallback(
    (core: number) => {
      setCaches((prev) => {
        const next = prev.map((c) => ({ ...c }));
        const current = next[core];
        const newVal = current.value + 1;
        const others = next.map((_, i) => i).filter((i) => i !== core && next[i].state !== "I");

        if (current.state === "M") {
          next[core] = { state: "M", value: newVal };
          addLog({ core, action: "Write", bus: "None (already M)", transitions: `Core ${core}: M -> M (val=${newVal})` });
          flashCoreAnim(core);
          return next;
        }

        if (current.state === "E") {
          next[core] = { state: "M", value: newVal };
          addLog({ core, action: "Write", bus: "None (silent upgrade)", transitions: `Core ${core}: E -> M (val=${newVal})` });
          flashCoreAnim(core);
          return next;
        }

        // Shared or Invalid -- need to invalidate others
        const invalidated: string[] = [];
        others.forEach((i) => {
          invalidated.push(`Core ${i}: ${next[i].state} -> I`);
          next[i] = { ...next[i], state: "I" };
        });

        next[core] = { state: "M", value: newVal };
        const busMsg = others.length > 0 ? `BusRdX -> invalidate [${others.join(",")}]` : "BusRdX -> Memory";
        const transitions = [`Core ${core}: ${current.state} -> M`, ...invalidated].join(", ");
        addLog({ core, action: "Write", bus: busMsg, transitions });
        if (others.length > 0) animateBus(core, others);
        flashCoreAnim(core);
        return next;
      });
    },
    [addLog, animateBus, flashCoreAnim],
  );

  const handleReset = () => {
    setCaches(initCaches());
    setLog([]);
  };

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-5 font-mono text-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[#c8c6c3] text-base font-semibold">MESI Cache Coherence Simulator</div>
        <button onClick={handleReset} className="text-xs text-[#8888a0] hover:text-[#c8c6c3] px-2 py-1 bg-[#1a1a2e] rounded transition-colors">
          Reset
        </button>
      </div>
      <div className="text-[#8888a0] text-xs mb-4">4 cores sharing cache line for address X</div>

      {/* SVG */}
      <svg viewBox="0 0 740 180" className="w-full mb-4" style={{ maxHeight: 200 }}>
        {/* Bus line */}
        <line x1={40} y1={BUS_Y} x2={700} y2={BUS_Y} stroke="#2a2a3e" strokeWidth={3} />
        <text x={16} y={BUS_Y + 4} fill="#555" fontSize={9}>BUS</text>

        {/* Bus animation */}
        {busActive && busActive.to.map((target) => (
          <motion.line
            key={`bus-${target}`}
            x1={CORE_POSITIONS[busActive.from].x + BOX_W / 2}
            y1={BUS_Y}
            x2={CORE_POSITIONS[target].x + BOX_W / 2}
            y2={BUS_Y}
            stroke="#6c5ce7"
            strokeWidth={2}
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 0.6 }}
          />
        ))}

        {/* Cores */}
        {CORE_POSITIONS.map((pos, i) => {
          const cache = caches[i];
          const isFlashing = flashCore === i;
          return (
            <g key={i}>
              {/* Connection to bus */}
              <line x1={pos.x + BOX_W / 2} y1={pos.y + BOX_H} x2={pos.x + BOX_W / 2} y2={BUS_Y} stroke="#2a2a3e" strokeWidth={1.5} />

              {/* Cache box */}
              <motion.rect
                x={pos.x}
                y={pos.y}
                width={BOX_W}
                height={BOX_H}
                rx={6}
                fill="#12121a"
                stroke={isFlashing ? "#6c5ce7" : STATE_COLORS[cache.state]}
                strokeWidth={isFlashing ? 2.5 : 1.5}
                animate={{ strokeWidth: isFlashing ? [1.5, 2.5, 1.5] : 1.5 }}
                transition={{ duration: 0.4 }}
              />

              {/* Core label */}
              <text x={pos.x + BOX_W / 2} y={pos.y + 16} textAnchor="middle" fill="#8888a0" fontSize={10}>
                Core {i}
              </text>

              {/* State badge */}
              <motion.rect
                x={pos.x + BOX_W / 2 - 22}
                y={pos.y + 24}
                width={44}
                height={20}
                rx={4}
                fill={STATE_COLORS[cache.state]}
                opacity={cache.state === "I" ? 0.3 : 0.85}
                animate={{ fill: STATE_COLORS[cache.state] }}
                transition={{ duration: 0.3 }}
              />
              <text x={pos.x + BOX_W / 2} y={pos.y + 38} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold">
                {cache.state}
              </text>

              {/* Value */}
              <text x={pos.x + BOX_W / 2} y={pos.y + 60} textAnchor="middle" fill="#8888a0" fontSize={9}>
                val={cache.value}
              </text>

              {/* Snoop dot at bus */}
              <circle cx={pos.x + BOX_W / 2} cy={BUS_Y} r={4} fill={STATE_COLORS[cache.state]} opacity={cache.state === "I" ? 0.2 : 0.7} />
            </g>
          );
        })}
      </svg>

      {/* Per-core buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-1">
            <button
              onClick={() => handleRead(i)}
              className="flex-1 px-2 py-1.5 rounded text-xs bg-[#1a1a2e] text-[#4ade80] hover:bg-[#222240] transition-colors"
            >
              Read X
            </button>
            <button
              onClick={() => handleWrite(i)}
              className="flex-1 px-2 py-1.5 rounded text-xs bg-[#1a1a2e] text-[#f87171] hover:bg-[#222240] transition-colors"
            >
              Write X
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-[10px] text-[#8888a0]">
        {(["M", "E", "S", "I"] as MESIState[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: STATE_COLORS[s], opacity: s === "I" ? 0.4 : 1 }} />
            {STATE_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Transaction log */}
      <div className="bg-[#12121a] rounded p-3 max-h-44 overflow-y-auto">
        <div className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Bus Transaction Log</div>
        {log.length === 0 ? (
          <div className="text-[#555] text-xs">No transactions yet. Click Read or Write on any core.</div>
        ) : (
          log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs mb-1.5 border-l-2 pl-2 py-0.5"
              style={{ borderColor: entry.action === "Write" ? "#f87171" : "#4ade80" }}
            >
              <span className="text-[#8888a0]">Core {entry.core}</span>{" "}
              <span className={entry.action === "Write" ? "text-[#f87171]" : "text-[#4ade80]"}>{entry.action}</span>{" "}
              <span className="text-[#555]">| {entry.bus}</span>
              <div className="text-[#6c5ce7] text-[10px]">{entry.transitions}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
