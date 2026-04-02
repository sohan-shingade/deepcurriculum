"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WARP_SIZE = 32;
const THREAD_W = 18;
const THREAD_H = 22;
const GAP = 3;
const PAD = 24;
const SVG_W = PAD * 2 + WARP_SIZE * (THREAD_W + GAP) - GAP;

type Mode = "custom" | "uniform" | "divergent";

export default function GPUWarpsSim() {
  const [threshold, setThreshold] = useState(16);
  const [mode, setMode] = useState<Mode>("custom");

  const effectiveThreshold = mode === "uniform" ? -1 : mode === "divergent" ? 16 : threshold;

  const threads = useMemo(() => {
    return Array.from({ length: WARP_SIZE }, (_, i) => ({
      id: i,
      pathA: i > effectiveThreshold,
    }));
  }, [effectiveThreshold]);

  const pathACount = threads.filter((t) => t.pathA).length;
  const pathBCount = WARP_SIZE - pathACount;
  const isDivergent = pathACount > 0 && pathBCount > 0;
  const totalPasses = isDivergent ? 2 : 1;
  const efficiency = isDivergent
    ? Math.round(((Math.max(pathACount, pathBCount)) / WARP_SIZE) * 100)
    : 100;

  const threadX = (i: number) => PAD + i * (THREAD_W + GAP);

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-5 font-mono text-sm">
      <div className="text-[#c8c6c3] text-base font-semibold mb-1">GPU Warp Execution Simulator</div>
      <div className="text-[#8888a0] text-xs mb-4">
        Kernel: <code className="text-[#a29bfe]">if (threadIdx &gt; threshold) path_A else path_B</code>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          {(["custom", "uniform", "divergent"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                mode === m
                  ? "bg-[#6c5ce7] text-white"
                  : "bg-[#1a1a2e] text-[#8888a0] hover:text-[#c8c6c3]"
              }`}
            >
              {m === "custom" ? "Custom" : m === "uniform" ? "Uniform" : "Divergent"}
            </button>
          ))}
        </div>
        {mode === "custom" && (
          <div className="flex items-center gap-2">
            <span className="text-[#8888a0] text-xs">threshold:</span>
            <input
              type="range"
              min={-1}
              max={31}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-40 accent-[#6c5ce7]"
            />
            <span className="text-[#a29bfe] w-6 text-right">{threshold}</span>
          </div>
        )}
      </div>

      {/* SVG visualization */}
      <svg
        viewBox={`0 0 ${SVG_W} ${isDivergent ? 200 : 120}`}
        className="w-full mb-4"
        style={{ maxHeight: isDivergent ? 220 : 140 }}
      >
        {/* Pass 1 label */}
        <text x={PAD} y={16} fill="#8888a0" fontSize={10}>
          {isDivergent ? "Pass 1 — path_B (threadIdx \u2264 threshold)" : "Single Pass — all threads active"}
        </text>

        {/* Pass 1 threads */}
        {threads.map((t, i) => {
          const active = isDivergent ? !t.pathA : true;
          return (
            <motion.rect
              key={`p1-${t.id}`}
              x={threadX(i)}
              y={24}
              width={THREAD_W}
              height={THREAD_H}
              rx={3}
              fill={active ? (t.pathA ? "#4ade80" : "#6c5ce7") : "#1a1a2e"}
              stroke={active ? (t.pathA ? "#4ade80" : "#6c5ce7") : "#2a2a3e"}
              strokeWidth={1}
              opacity={active ? 1 : 0.25}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: active ? 1 : 0.25 }}
              transition={{ delay: i * 0.015, duration: 0.2 }}
            />
          );
        })}

        {/* Active mask labels pass 1 */}
        {threads.map((t, i) => {
          const active = isDivergent ? !t.pathA : true;
          return (
            <text
              key={`m1-${t.id}`}
              x={threadX(i) + THREAD_W / 2}
              y={38}
              textAnchor="middle"
              fill={active ? "#fff" : "#333"}
              fontSize={7}
              fontFamily="monospace"
            >
              {active ? "1" : "0"}
            </text>
          );
        })}

        {/* Pass 2 (divergent only) */}
        <AnimatePresence>
          {isDivergent && (
            <>
              {/* Serialization arrow */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <line x1={SVG_W / 2} y1={52} x2={SVG_W / 2} y2={72} stroke="#6c5ce7" strokeWidth={1.5} strokeDasharray="4 3" />
                <polygon points={`${SVG_W / 2 - 4},68 ${SVG_W / 2 + 4},68 ${SVG_W / 2},76`} fill="#6c5ce7" />
                <text x={SVG_W / 2 + 10} y={66} fill="#6c5ce7" fontSize={8}>serialized</text>
              </motion.g>

              {/* Pass 2 label */}
              <text x={PAD} y={92} fill="#8888a0" fontSize={10}>
                Pass 2 — path_A (threadIdx &gt; threshold)
              </text>

              {/* Pass 2 threads */}
              {threads.map((t, i) => (
                <motion.rect
                  key={`p2-${t.id}`}
                  x={threadX(i)}
                  y={100}
                  width={THREAD_W}
                  height={THREAD_H}
                  rx={3}
                  fill={t.pathA ? "#4ade80" : "#1a1a2e"}
                  stroke={t.pathA ? "#4ade80" : "#2a2a3e"}
                  strokeWidth={1}
                  opacity={t.pathA ? 1 : 0.25}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: t.pathA ? 1 : 0.25 }}
                  transition={{ delay: i * 0.015 + 0.3, duration: 0.2 }}
                />
              ))}

              {threads.map((t, i) => (
                <text
                  key={`m2-${t.id}`}
                  x={threadX(i) + THREAD_W / 2}
                  y={114}
                  textAnchor="middle"
                  fill={t.pathA ? "#fff" : "#333"}
                  fontSize={7}
                  fontFamily="monospace"
                >
                  {t.pathA ? "1" : "0"}
                </text>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Thread index labels */}
        {[0, 7, 15, 23, 31].map((i) => (
          <text
            key={`lbl-${i}`}
            x={threadX(i) + THREAD_W / 2}
            y={isDivergent ? 144 : 62}
            textAnchor="middle"
            fill="#555"
            fontSize={8}
            fontFamily="monospace"
          >
            T{i}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-[#8888a0]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#6c5ce7] inline-block" /> path_B
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#4ade80] inline-block" /> path_A
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#1a1a2e] border border-[#2a2a3e] inline-block" /> inactive
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Path A threads", value: pathACount },
          { label: "Path B threads", value: pathBCount },
          { label: "Execution passes", value: totalPasses },
          {
            label: "SIMT efficiency",
            value: `${efficiency}%`,
            color: efficiency === 100 ? "#4ade80" : efficiency >= 75 ? "#facc15" : "#f87171",
          },
        ].map((s) => (
          <div key={s.label} className="bg-[#12121a] rounded px-3 py-2">
            <div className="text-[#8888a0] text-[10px] uppercase tracking-wider">{s.label}</div>
            <div className="text-lg font-bold" style={{ color: (s as { color?: string }).color ?? "#c8c6c3" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
