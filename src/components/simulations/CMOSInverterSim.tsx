"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VDD = 1.8;
const VTH_N = 0.5;
const VTH_P = 0.5; // |Vthp|

export default function CMOSInverterSim() {
  const [vIn, setVIn] = useState(0);

  const pmosOn = vIn < VDD - VTH_P;
  const nmosOn = vIn > VTH_N;
  const inTransition = pmosOn && nmosOn;

  // Simplified VTC model (piecewise)
  const vOut = useMemo(() => {
    if (vIn <= VTH_N) return VDD;
    if (vIn >= VDD - VTH_P) return 0;
    // Transition region: smooth sigmoid-like curve
    const mid = VDD / 2;
    const slope = -VDD / (VDD - VTH_N - VTH_P);
    const raw = VDD / 2 + slope * (vIn - mid);
    return Math.max(0, Math.min(VDD, raw));
  }, [vIn]);

  // Short-circuit current peaks at VDD/2
  const shortCircuitCurrent = useMemo(() => {
    if (!inTransition) return 0;
    const dist = Math.abs(vIn - VDD / 2);
    const maxRange = (VDD - VTH_N - VTH_P) / 2;
    return Math.max(0, 1 - dist / maxRange);
  }, [vIn, inTransition]);

  const power = shortCircuitCurrent * 0.5; // mW scale factor

  // VTC curve points
  const vtcPoints = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= VDD; v += 0.02) {
      let vo: number;
      if (v <= VTH_N) vo = VDD;
      else if (v >= VDD - VTH_P) vo = 0;
      else {
        const mid = VDD / 2;
        const slope = -VDD / (VDD - VTH_N - VTH_P);
        vo = Math.max(0, Math.min(VDD, VDD / 2 + slope * (v - mid)));
      }
      const px = 20 + (v / VDD) * 100;
      const py = 80 - (vo / VDD) * 60;
      pts.push(`${px},${py}`);
    }
    return pts.join(" ");
  }, []);

  // Current marker position on VTC
  const markerX = 20 + (vIn / VDD) * 100;
  const markerY = 80 - (vOut / VDD) * 60;

  const pmosColor = pmosOn ? "#00b894" : "#ff6b6b";
  const nmosColor = nmosOn ? "#00b894" : "#ff6b6b";
  const pmosOpacity = pmosOn ? 1 : 0.3;
  const nmosOpacity = nmosOn ? 1 : 0.3;

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
        <span className="text-xs font-mono text-[#6c5ce7]">CMOS Inverter</span>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-4">
          <label className="text-sm font-mono text-[#8888a0] w-12">
            V<sub>in</sub>
          </label>
          <input
            type="range"
            min={0}
            max={1.8}
            step={0.01}
            value={vIn}
            onChange={(e) => setVIn(parseFloat(e.target.value))}
            className="flex-1 accent-[#6c5ce7] h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6c5ce7]"
          />
          <span className="text-sm font-mono text-white w-16 text-right">
            {vIn.toFixed(2)} V
          </span>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="p-4 flex gap-4 flex-col md:flex-row">
        {/* CMOS Circuit SVG */}
        <div className="flex-1">
          <svg viewBox="0 0 280 360" className="w-full max-w-xs mx-auto">
            <defs>
              <marker id="cmos-arrow-down" viewBox="0 0 10 10" refX="5" refY="10" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 0 L 5 10 z" fill="#00b894" />
              </marker>
              <marker id="cmos-arrow-up" viewBox="0 0 10 10" refX="5" refY="0" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 10 L 10 10 L 5 0 z" fill="#00b894" />
              </marker>
            </defs>

            {/* VDD rail */}
            <line x1="80" y1="20" x2="200" y2="20" stroke="#c8c6c3" strokeWidth="2" />
            <text x="140" y="14" textAnchor="middle" fill="#c8c6c3" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">VDD = 1.8V</text>

            {/* VDD to PMOS connection */}
            <line x1="140" y1="20" x2="140" y2="60" stroke="#c8c6c3" strokeWidth="1.5" />

            {/* PMOS transistor body */}
            <motion.rect
              x="105" y="60" width="70" height="55" rx="4"
              fill={pmosOn ? "rgba(0,184,148,0.12)" : "rgba(255,107,107,0.06)"}
              stroke={pmosColor}
              strokeWidth="1.5"
              animate={{ opacity: pmosOpacity }}
              transition={{ duration: 0.2 }}
            />
            <text x="140" y="82" textAnchor="middle" fill={pmosColor} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">PMOS</text>
            {/* PMOS bubble (indicates inversion) */}
            <circle cx="105" cy="88" r="5" fill="none" stroke={pmosColor} strokeWidth="1.5" />
            <motion.text
              x="140" y="106" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono"
              fill={pmosColor}
              animate={{ opacity: pmosOpacity }}
            >
              {pmosOn ? "ON" : "OFF"}
            </motion.text>

            {/* Gate input to PMOS */}
            <line x1="40" y1="88" x2="100" y2="88" stroke="#a29bfe" strokeWidth="1.5" />

            {/* PMOS to output node */}
            <line x1="140" y1="115" x2="140" y2="160" stroke="#c8c6c3" strokeWidth="1.5" />

            {/* Output node */}
            <circle cx="140" cy="180" r="10" fill="#12121a" stroke="#6c5ce7" strokeWidth="2" />
            <text x="140" y="184" textAnchor="middle" fill="#6c5ce7" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">Out</text>

            {/* Output wire */}
            <line x1="150" y1="180" x2="240" y2="180" stroke="#6c5ce7" strokeWidth="1.5" />
            <text x="250" y="184" fill="#c8c6c3" fontSize="12" fontFamily="JetBrains Mono">
              {vOut.toFixed(2)}V
            </text>

            {/* Output to NMOS */}
            <line x1="140" y1="190" x2="140" y2="225" stroke="#c8c6c3" strokeWidth="1.5" />

            {/* NMOS transistor body */}
            <motion.rect
              x="105" y="225" width="70" height="55" rx="4"
              fill={nmosOn ? "rgba(0,184,148,0.12)" : "rgba(255,107,107,0.06)"}
              stroke={nmosColor}
              strokeWidth="1.5"
              animate={{ opacity: nmosOpacity }}
              transition={{ duration: 0.2 }}
            />
            <text x="140" y="247" textAnchor="middle" fill={nmosColor} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">NMOS</text>
            <motion.text
              x="140" y="270" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono"
              fill={nmosColor}
              animate={{ opacity: nmosOpacity }}
            >
              {nmosOn ? "ON" : "OFF"}
            </motion.text>

            {/* Gate input to NMOS */}
            <line x1="40" y1="253" x2="105" y2="253" stroke="#a29bfe" strokeWidth="1.5" />

            {/* Connect gate inputs vertically */}
            <line x1="40" y1="88" x2="40" y2="253" stroke="#a29bfe" strokeWidth="1.5" />
            <text x="25" y="175" textAnchor="middle" fill="#a29bfe" fontSize="11" fontFamily="JetBrains Mono" transform="rotate(-90,25,175)">
              V_in = {vIn.toFixed(2)}V
            </text>

            {/* NMOS to GND */}
            <line x1="140" y1="280" x2="140" y2="320" stroke="#c8c6c3" strokeWidth="1.5" />

            {/* GND rail */}
            <line x1="80" y1="320" x2="200" y2="320" stroke="#c8c6c3" strokeWidth="2" />
            <line x1="95" y1="327" x2="185" y2="327" stroke="#c8c6c3" strokeWidth="1.5" />
            <line x1="110" y1="334" x2="170" y2="334" stroke="#c8c6c3" strokeWidth="1" />
            <text x="140" y="350" textAnchor="middle" fill="#c8c6c3" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">GND</text>

            {/* Current path animation: VDD -> PMOS -> output (when PMOS on, NMOS off) */}
            <AnimatePresence>
              {pmosOn && !nmosOn && (
                <motion.line
                  x1="140" y1="25" x2="140" y2="165"
                  stroke="#00b894" strokeWidth="2" strokeDasharray="6 4"
                  markerEnd="url(#cmos-arrow-down)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {/* Current path animation: output -> NMOS -> GND (when NMOS on, PMOS off) */}
            <AnimatePresence>
              {nmosOn && !pmosOn && (
                <motion.line
                  x1="140" y1="195" x2="140" y2="315"
                  stroke="#00b894" strokeWidth="2" strokeDasharray="6 4"
                  markerEnd="url(#cmos-arrow-down)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {/* Short-circuit current warning */}
            <AnimatePresence>
              {inTransition && (
                <>
                  <motion.line
                    x1="145" y1="25" x2="145" y2="315"
                    stroke="#ff6b6b" strokeWidth="2" strokeDasharray="4 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: shortCircuitCurrent * 0.7 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.text
                    x="215" y="140" fill="#ff6b6b" fontSize="10" fontFamily="JetBrains Mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: shortCircuitCurrent }}
                    exit={{ opacity: 0 }}
                  >
                    Short-circuit
                  </motion.text>
                  <motion.text
                    x="215" y="153" fill="#ff6b6b" fontSize="10" fontFamily="JetBrains Mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: shortCircuitCurrent }}
                    exit={{ opacity: 0 }}
                  >
                    current!
                  </motion.text>
                </>
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* VTC Curve */}
        <div className="w-full md:w-44 flex-shrink-0">
          <div className="text-xs font-mono text-[#8888a0] mb-2 text-center">Voltage Transfer Characteristic</div>
          <svg viewBox="0 0 140 100" className="w-full bg-[#12121a] rounded border border-[#2a2a3e]">
            {/* Axes */}
            <line x1="20" y1="80" x2="130" y2="80" stroke="#444" strokeWidth="0.5" />
            <line x1="20" y1="80" x2="20" y2="15" stroke="#444" strokeWidth="0.5" />
            <text x="75" y="97" textAnchor="middle" fill="#8888a0" fontSize="7" fontFamily="JetBrains Mono">V_in</text>
            <text x="8" y="50" textAnchor="middle" fill="#8888a0" fontSize="7" fontFamily="JetBrains Mono" transform="rotate(-90,8,50)">V_out</text>
            {/* Tick marks */}
            <text x="20" y="92" textAnchor="middle" fill="#666" fontSize="6" fontFamily="JetBrains Mono">0</text>
            <text x="120" y="92" textAnchor="middle" fill="#666" fontSize="6" fontFamily="JetBrains Mono">1.8</text>
            <text x="16" y="82" textAnchor="end" fill="#666" fontSize="6" fontFamily="JetBrains Mono">0</text>
            <text x="16" y="22" textAnchor="end" fill="#666" fontSize="6" fontFamily="JetBrains Mono">1.8</text>

            {/* VTC curve */}
            <polyline points={vtcPoints} fill="none" stroke="#6c5ce7" strokeWidth="1.5" />

            {/* Current position marker */}
            <motion.circle
              cx={markerX} cy={markerY} r="3"
              fill="#6c5ce7" stroke="#fff" strokeWidth="1"
              animate={{ cx: markerX, cy: markerY }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Dashed crosshairs */}
            <motion.line
              x1={markerX} y1="80" x2={markerX} y2={markerY}
              stroke="#6c5ce7" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.5"
              animate={{ x1: markerX, x2: markerX, y2: markerY }}
            />
            <motion.line
              x1="20" y1={markerY} x2={markerX} y2={markerY}
              stroke="#6c5ce7" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.5"
              animate={{ y1: markerY, x2: markerX, y2: markerY }}
            />

            {/* Threshold markers */}
            <line x1={20 + (VTH_N / VDD) * 100} y1="78" x2={20 + (VTH_N / VDD) * 100} y2="82" stroke="#ff6b6b" strokeWidth="0.8" />
            <text x={20 + (VTH_N / VDD) * 100} y="88" textAnchor="middle" fill="#ff6b6b" fontSize="5" fontFamily="JetBrains Mono">Vtn</text>
            <line x1={20 + ((VDD - VTH_P) / VDD) * 100} y1="78" x2={20 + ((VDD - VTH_P) / VDD) * 100} y2="82" stroke="#ff6b6b" strokeWidth="0.8" />
            <text x={20 + ((VDD - VTH_P) / VDD) * 100} y="88" textAnchor="middle" fill="#ff6b6b" fontSize="5" fontFamily="JetBrains Mono">Vdd-Vtp</text>
          </svg>
        </div>
      </div>

      {/* Readouts */}
      <div className="px-5 py-4 border-t border-[#2a2a3e] grid grid-cols-5 gap-3">
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">V<sub>in</sub></div>
          <div className="text-base font-mono text-white">{vIn.toFixed(2)}V</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">V<sub>out</sub></div>
          <div className="text-base font-mono text-white">{vOut.toFixed(2)}V</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">PMOS</div>
          <div className={`text-base font-mono ${pmosOn ? "text-[#00b894]" : "text-[#ff6b6b]"}`}>
            {pmosOn ? "ON" : "OFF"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">NMOS</div>
          <div className={`text-base font-mono ${nmosOn ? "text-[#00b894]" : "text-[#ff6b6b]"}`}>
            {nmosOn ? "ON" : "OFF"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">P<sub>short</sub></div>
          <div className={`text-base font-mono ${inTransition ? "text-[#ff6b6b]" : "text-[#00b894]"}`}>
            {(power).toFixed(2)} mW
          </div>
        </div>
      </div>

      {/* Region description */}
      <div className="px-5 py-3 border-t border-[#2a2a3e] bg-[#12121a]">
        <div className="text-xs font-mono text-[#8888a0] text-center">
          {!pmosOn && nmosOn && (
            <span>V<sub>in</sub> &gt; V<sub>DD</sub> - |V<sub>tp</sub>| : PMOS off, NMOS pulls output to GND (logic 0)</span>
          )}
          {pmosOn && !nmosOn && (
            <span>V<sub>in</sub> &lt; V<sub>tn</sub> : NMOS off, PMOS pulls output to V<sub>DD</sub> (logic 1)</span>
          )}
          {inTransition && (
            <span className="text-[#ff6b6b]">Transition region: both transistors partially on -- short-circuit path V<sub>DD</sub> to GND</span>
          )}
        </div>
      </div>
    </div>
  );
}
