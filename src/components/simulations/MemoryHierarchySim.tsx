"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MemLevel {
  name: string;
  size: string;
  latency: number;
  latencyLabel: string;
  color: string;
  width: number;
}

const LEVELS: MemLevel[] = [
  { name: "Registers", size: "~1 KB", latency: 0.3, latencyLabel: "0.3 ns", color: "#6c5ce7", width: 80 },
  { name: "L1 Cache", size: "64 KB", latency: 1, latencyLabel: "1 ns", color: "#a29bfe", width: 130 },
  { name: "L2 Cache", size: "256 KB", latency: 4, latencyLabel: "4 ns", color: "#74b9ff", width: 190 },
  { name: "L3 Cache", size: "8 MB", latency: 12, latencyLabel: "12 ns", color: "#00cec9", width: 260 },
  { name: "DRAM", size: "16 GB", latency: 80, latencyLabel: "80 ns", color: "#fdcb6e", width: 340 },
  { name: "SSD", size: "1 TB", latency: 50000, latencyLabel: "50 \u00b5s", color: "#e17055", width: 410 },
  { name: "HDD", size: "4 TB", latency: 5000000, latencyLabel: "5 ms", color: "#d63031", width: 470 },
];

const LEVEL_Y_START = 28;
const LEVEL_HEIGHT = 36;
const SVG_CENTER = 260;

interface AccessResult {
  hitLevel: number;
  totalLatency: number;
  path: boolean[];
}

export default function MemoryHierarchySim() {
  const [hitRates, setHitRates] = useState({ l1: 95, l2: 80, l3: 90 });
  const [animating, setAnimating] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [animPhase, setAnimPhase] = useState<"down" | "up" | "idle">("idle");
  const [hitAt, setHitAt] = useState<number | null>(null);
  const [latencyCounter, setLatencyCounter] = useState<number>(0);
  const [accessLog, setAccessLog] = useState<AccessResult[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hitRateForLevel = (level: number): number => {
    if (level === 0) return 100;
    if (level === 1) return hitRates.l1;
    if (level === 2) return hitRates.l2;
    if (level === 3) return hitRates.l3;
    if (level === 4) return 95;
    if (level === 5) return 90;
    return 100;
  };

  const amat = (() => {
    const l1Miss = (100 - hitRates.l1) / 100;
    const l2Miss = (100 - hitRates.l2) / 100;
    const l3Miss = (100 - hitRates.l3) / 100;
    return LEVELS[1].latency + l1Miss * (LEVELS[2].latency + l2Miss * (LEVELS[3].latency + l3Miss * LEVELS[4].latency));
  })();

  const avgAccessTime = accessLog.length > 0
    ? accessLog.reduce((sum, a) => sum + a.totalLatency, 0) / accessLog.length
    : 0;

  const simulateAccess = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setAnimPhase("down");
    setLatencyCounter(0);
    setHitAt(null);

    let resolvedLevel = LEVELS.length - 1;
    const path: boolean[] = [];
    for (let i = 0; i < LEVELS.length; i++) {
      const roll = Math.random() * 100;
      if (roll < hitRateForLevel(i)) {
        resolvedLevel = i;
        break;
      }
      path.push(false);
    }
    const totalLevels = resolvedLevel + 1;
    let totalLatency = 0;
    for (let i = 0; i <= resolvedLevel; i++) totalLatency += LEVELS[i].latency;

    let step = 0;
    const downDelay = 300;
    const tick = () => {
      if (step <= resolvedLevel) {
        setActiveLevel(step);
        if (step < resolvedLevel) {
          setAnimPhase("down");
        }
        const fraction = LEVELS.slice(0, step + 1).reduce((s, l) => s + l.latency, 0);
        setLatencyCounter(fraction);
        step++;
        setTimeout(tick, downDelay);
      } else {
        setHitAt(resolvedLevel);
        setAnimPhase("up");
        setTimeout(() => {
          let upStep = resolvedLevel;
          const upTick = () => {
            if (upStep >= 0) {
              setActiveLevel(upStep);
              upStep--;
              setTimeout(upTick, 200);
            } else {
              setActiveLevel(null);
              setAnimPhase("idle");
              setAnimating(false);
              setLatencyCounter(totalLatency);
              setAccessLog((prev) => [...prev.slice(-49), { hitLevel: resolvedLevel, totalLatency, path }]);
            }
          };
          upTick();
        }, 400);
      }
    };
    tick();
  }, [animating, hitRates]);

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-5 font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#c8c6c3] font-semibold text-base tracking-tight">Memory Hierarchy Latency Visualizer</h3>
        <button onClick={simulateAccess} disabled={animating}
          className={`px-4 py-1.5 rounded text-xs transition-all ${animating
            ? "bg-[#1a1a2e] text-[#3a3a5e] cursor-not-allowed"
            : "bg-[#6c5ce7] text-white hover:bg-[#5a4bd6]"}`}>
          {animating ? "Accessing..." : "Request Data"}
        </button>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* SVG Hierarchy Pyramid */}
        <div className="flex-1 bg-[#12121a] rounded-lg border border-[#2a2a3e] overflow-hidden">
          <svg viewBox="0 0 520 310" className="w-full h-auto">
            <defs>
              <filter id="mem-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* CPU label */}
            <text x={SVG_CENTER} y={20} textAnchor="middle" fill="#c8c6c3" fontSize="11" fontWeight="bold">CPU</text>

            {LEVELS.map((level, i) => {
              const y = LEVEL_Y_START + i * LEVEL_HEIGHT;
              const halfW = level.width / 2;
              const isActive = activeLevel === i;
              const isHit = hitAt === i;

              return (
                <g key={level.name}>
                  {/* Bar */}
                  <motion.rect x={SVG_CENTER - halfW} y={y} width={level.width} height={LEVEL_HEIGHT - 4}
                    rx={4} fill={isActive ? level.color + "30" : "#1a1a2e"}
                    stroke={isActive ? level.color : "#2a2a3e"} strokeWidth={isActive ? 2 : 1}
                    filter={isHit ? "url(#mem-glow)" : undefined}
                    animate={{ opacity: isActive ? [0.7, 1, 0.7] : 1 }}
                    transition={isActive ? { duration: 0.3, repeat: 2 } : {}} />

                  {/* Name */}
                  <text x={SVG_CENTER - halfW + 8} y={y + (LEVEL_HEIGHT - 4) / 2 + 1}
                    dominantBaseline="middle" fill={isActive ? "#fff" : "#8888a0"} fontSize="10" fontWeight="600">
                    {level.name}
                  </text>

                  {/* Size */}
                  <text x={SVG_CENTER + halfW - 8} y={y + (LEVEL_HEIGHT - 4) / 2 - 5}
                    dominantBaseline="middle" textAnchor="end" fill="#6a6a8e" fontSize="8">
                    {level.size}
                  </text>

                  {/* Latency */}
                  <text x={SVG_CENTER + halfW - 8} y={y + (LEVEL_HEIGHT - 4) / 2 + 7}
                    dominantBaseline="middle" textAnchor="end" fill={level.color} fontSize="9">
                    {level.latencyLabel}
                  </text>

                  {/* Hit/Miss indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.text x={SVG_CENTER + halfW + 16} y={y + (LEVEL_HEIGHT - 4) / 2 + 1}
                        dominantBaseline="middle" fill={isHit ? "#22c55e" : "#ef4444"} fontSize="10" fontWeight="bold"
                        initial={{ opacity: 0, x: SVG_CENTER + halfW + 30 }}
                        animate={{ opacity: 1, x: SVG_CENTER + halfW + 16 }}
                        exit={{ opacity: 0 }}>
                        {isHit ? "HIT" : animPhase === "down" ? "MISS" : ""}
                      </motion.text>
                    )}
                  </AnimatePresence>

                  {/* Animated request dot traveling down/up */}
                  {isActive && (
                    <motion.circle cx={SVG_CENTER - halfW - 14} cy={y + (LEVEL_HEIGHT - 4) / 2}
                      r={4} fill={animPhase === "down" ? "#ef4444" : "#22c55e"}
                      initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.3 }} />
                  )}
                </g>
              );
            })}

            {/* Connecting vertical lines */}
            {LEVELS.slice(0, -1).map((_, i) => {
              const y1 = LEVEL_Y_START + i * LEVEL_HEIGHT + LEVEL_HEIGHT - 4;
              const y2 = LEVEL_Y_START + (i + 1) * LEVEL_HEIGHT;
              return <line key={i} x1={SVG_CENTER} y1={y1} x2={SVG_CENTER} y2={y2} stroke="#2a2a3e" strokeWidth={1} strokeDasharray="3,3" />;
            })}
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-60 flex flex-col gap-3">
          {/* Hit rate sliders */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-3">Hit Rates</div>
            {([
              { label: "L1 Cache", key: "l1" as const, color: "#a29bfe" },
              { label: "L2 Cache", key: "l2" as const, color: "#74b9ff" },
              { label: "L3 Cache", key: "l3" as const, color: "#00cec9" },
            ]).map(({ label, key, color }) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color }}>{label}</span>
                  <span className="text-[#c8c6c3]">{hitRates[key]}%</span>
                </div>
                <input type="range" min={0} max={100} value={hitRates[key]}
                  onChange={(e) => setHitRates((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${hitRates[key]}%, #2a2a3e ${hitRates[key]}%)` }} />
              </div>
            ))}
          </div>

          {/* AMAT calculation */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-2">AMAT (calculated)</div>
            <div className="text-[#6c5ce7] text-xl font-bold text-center">{amat.toFixed(2)} ns</div>
            <div className="text-[#3a3a5e] text-[9px] text-center mt-1">
              T<sub>L1</sub> + MR<sub>L1</sub>(T<sub>L2</sub> + MR<sub>L2</sub>(T<sub>L3</sub> + MR<sub>L3</sub> * T<sub>DRAM</sub>))
            </div>
          </div>

          {/* Live counter */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3 text-center">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-1">Last Access Latency</div>
            <AnimatePresence mode="wait">
              <motion.div key={latencyCounter}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-[#c8c6c3] text-lg font-bold">
                {latencyCounter < 1000 ? `${latencyCounter.toFixed(1)} ns`
                  : latencyCounter < 1000000 ? `${(latencyCounter / 1000).toFixed(1)} \u00b5s`
                  : `${(latencyCounter / 1000000).toFixed(1)} ms`}
              </motion.div>
            </AnimatePresence>
            {hitAt !== null && (
              <div className="text-[10px] mt-1" style={{ color: LEVELS[hitAt].color }}>
                Hit at {LEVELS[hitAt].name}
              </div>
            )}
          </div>

          {/* Running average */}
          <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3 text-center">
            <div className="text-[#6a6a8e] text-[10px] uppercase tracking-widest mb-1">Avg Access ({accessLog.length} reqs)</div>
            <div className="text-[#a29bfe] text-base font-bold">
              {accessLog.length === 0 ? "--" :
                avgAccessTime < 1000 ? `${avgAccessTime.toFixed(2)} ns` :
                avgAccessTime < 1000000 ? `${(avgAccessTime / 1000).toFixed(2)} \u00b5s` :
                `${(avgAccessTime / 1000000).toFixed(2)} ms`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
