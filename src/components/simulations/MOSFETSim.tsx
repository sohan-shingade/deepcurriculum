"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VTH = 0.5; // Threshold voltage

export default function MOSFETSim() {
  const [vgs, setVgs] = useState(0);
  const [vds, setVds] = useState(1.0);

  const isOn = vgs >= VTH;
  const inSaturation = isOn && vds >= vgs - VTH;
  const inLinear = isOn && vds < vgs - VTH;

  // Drain current calculation (simplified square-law)
  const kn = 500; // μA/V² (W/L * μn * Cox)
  const id = useMemo(() => {
    if (!isOn) return 0;
    if (inSaturation) {
      return (kn / 2) * Math.pow(vgs - VTH, 2);
    }
    return kn * ((vgs - VTH) * vds - 0.5 * vds * vds);
  }, [vgs, vds, isOn, inSaturation]);

  // Channel electron density (for visualization)
  const channelDensity = isOn ? Math.min((vgs - VTH) / 1.0, 1) : 0;
  const electronCount = Math.round(channelDensity * 16);

  // Current arrow opacity
  const currentOpacity = id > 0 ? Math.min(id / 300, 1) : 0;

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
        <span className="text-xs font-mono text-[#6c5ce7]">N-Channel MOSFET</span>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-b border-[#2a2a3e] space-y-3">
        <div className="flex items-center gap-4">
          <label className="text-sm font-mono text-[#8888a0] w-12">V<sub>GS</sub></label>
          <input
            type="range"
            min={0}
            max={1.8}
            step={0.01}
            value={vgs}
            onChange={(e) => setVgs(parseFloat(e.target.value))}
            className="flex-1 accent-[#6c5ce7] h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6c5ce7]"
          />
          <span className="text-sm font-mono text-white w-16 text-right">
            {vgs.toFixed(2)} V
          </span>
          <span
            className={`text-xs font-mono px-2 py-1 rounded ${
              isOn
                ? "bg-[#00b894]/20 text-[#00b894]"
                : "bg-[#ff6b6b]/20 text-[#ff6b6b]"
            }`}
          >
            {isOn ? "ON" : "OFF"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-mono text-[#8888a0] w-12">V<sub>DS</sub></label>
          <input
            type="range"
            min={0}
            max={1.8}
            step={0.01}
            value={vds}
            onChange={(e) => setVds(parseFloat(e.target.value))}
            className="flex-1 accent-[#a29bfe] h-2 bg-[#2a2a3e] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#a29bfe]"
          />
          <span className="text-sm font-mono text-white w-16 text-right">
            {vds.toFixed(2)} V
          </span>
        </div>
      </div>

      {/* MOSFET Cross-Section Visualization */}
      <div className="relative p-6">
        <svg viewBox="0 0 600 380" className="w-full max-w-xl mx-auto">
          {/* P-type Substrate */}
          <rect x="40" y="200" width="520" height="160" rx="4" fill="#1a3a2a" stroke="#2ecc71" strokeWidth="1" strokeOpacity="0.3" />
          <text x="300" y="310" textAnchor="middle" fill="#2ecc71" fontSize="14" fontFamily="JetBrains Mono" opacity="0.6">P-type substrate (body)</text>
          <text x="300" y="330" textAnchor="middle" fill="#2ecc71" fontSize="11" fontFamily="JetBrains Mono" opacity="0.4">Majority carriers: holes (+)</text>

          {/* N+ Source */}
          <rect x="60" y="180" width="130" height="80" rx="3" fill="#1a2a4a" stroke="#3498db" strokeWidth="1.5" />
          <text x="125" y="215" textAnchor="middle" fill="#3498db" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">N+ source</text>
          <text x="125" y="235" textAnchor="middle" fill="#3498db" fontSize="11" fontFamily="JetBrains Mono" opacity="0.7">Electrons</text>

          {/* N+ Drain */}
          <rect x="410" y="180" width="130" height="80" rx="3" fill="#1a2a4a" stroke="#3498db" strokeWidth="1.5" />
          <text x="475" y="215" textAnchor="middle" fill="#3498db" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">N+ drain</text>
          <text x="475" y="235" textAnchor="middle" fill="#3498db" fontSize="11" fontFamily="JetBrains Mono" opacity="0.7">Electrons</text>

          {/* Gate Oxide */}
          <rect x="150" y="155" width="300" height="25" rx="2" fill="#3d3520" stroke="#f39c12" strokeWidth="1" strokeOpacity="0.5" />
          <text x="300" y="172" textAnchor="middle" fill="#f39c12" fontSize="10" fontFamily="JetBrains Mono" opacity="0.8">
            Gate oxide (SiO₂ / HfO₂)
          </text>

          {/* Gate Electrode */}
          <rect x="160" y="110" width="280" height="40" rx="3" fill="#2a1a3a" stroke="#9b59b6" strokeWidth="1.5" />
          <text x="300" y="135" textAnchor="middle" fill="#c8c6c3" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">Gate electrode</text>

          {/* Terminal Labels */}
          <text x="125" y="170" textAnchor="middle" fill="#8888a0" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">S</text>
          <circle cx="125" cy="175" r="3" fill="#8888a0" />
          <line x1="125" y1="178" x2="125" y2="185" stroke="#8888a0" strokeWidth="1" />

          <text x="300" y="95" textAnchor="middle" fill="#8888a0" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">G</text>
          <circle cx="300" cy="100" r="3" fill="#8888a0" />
          <line x1="300" y1="103" x2="300" y2="110" stroke="#8888a0" strokeWidth="1" />

          <text x="475" y="170" textAnchor="middle" fill="#8888a0" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono">D</text>
          <circle cx="475" cy="175" r="3" fill="#8888a0" />
          <line x1="475" y1="178" x2="475" y2="185" stroke="#8888a0" strokeWidth="1" />

          {/* Channel Region */}
          <AnimatePresence>
            {isOn && (
              <motion.rect
                x="190"
                y="180"
                width="220"
                height="12"
                rx="2"
                fill="#3498db"
                initial={{ opacity: 0 }}
                animate={{ opacity: channelDensity * 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Electrons in channel */}
          <AnimatePresence>
            {isOn &&
              Array.from({ length: electronCount }).map((_, i) => {
                const x = 195 + (i / electronCount) * 210;
                return (
                  <motion.circle
                    key={`e-${i}`}
                    cx={x}
                    cy={186}
                    r={4}
                    fill="#3498db"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 0.9,
                      scale: 1,
                      x: currentOpacity > 0 ? [0, 3, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      opacity: { duration: 0.2, delay: i * 0.02 },
                      scale: { duration: 0.2, delay: i * 0.02 },
                      x: {
                        duration: 0.8 + Math.random() * 0.4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05,
                      },
                    }}
                  />
                );
              })}
          </AnimatePresence>

          {/* Current flow arrows (drain to source for conventional current) */}
          <AnimatePresence>
            {currentOpacity > 0 && (
              <>
                <motion.path
                  d="M 470 195 L 140 195"
                  stroke="#00b894"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowGreen)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentOpacity }}
                  exit={{ opacity: 0 }}
                  strokeDasharray="6 3"
                  transition={{ duration: 0.3 }}
                />
                <defs>
                  <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#00b894" />
                  </marker>
                </defs>
                <motion.text
                  x="300"
                  y="210"
                  textAnchor="middle"
                  fill="#00b894"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentOpacity * 0.8 }}
                  exit={{ opacity: 0 }}
                >
                  I_D →
                </motion.text>
              </>
            )}
          </AnimatePresence>

          {/* Vth marker */}
          <line x1="30" y1="186" x2="148" y2="186" stroke="#ff6b6b" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
          <text x="25" y="190" textAnchor="end" fill="#ff6b6b" fontSize="10" fontFamily="JetBrains Mono" opacity="0.6">V<tspan baselineShift="sub" fontSize="8">th</tspan></text>
        </svg>
      </div>

      {/* Readouts */}
      <div className="px-5 py-4 border-t border-[#2a2a3e] grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">Drain Current</div>
          <div className="text-lg font-mono text-white">
            {id < 1 ? `${(id * 1000).toFixed(0)} nA` : id < 1000 ? `${id.toFixed(0)} μA` : `${(id / 1000).toFixed(2)} mA`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">Region</div>
          <div className={`text-lg font-mono ${!isOn ? "text-[#ff6b6b]" : inSaturation ? "text-[#6c5ce7]" : "text-[#00b894]"}`}>
            {!isOn ? "Cutoff" : inSaturation ? "Saturation" : "Linear"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8888a0] mb-1">V<sub>GS</sub> - V<sub>th</sub></div>
          <div className="text-lg font-mono text-white">
            {(vgs - VTH).toFixed(2)} V
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="px-5 py-3 border-t border-[#2a2a3e] bg-[#12121a]">
        <div className="text-xs font-mono text-[#8888a0] text-center">
          {!isOn && (
            <span>I<sub>D</sub> = 0 &nbsp;(V<sub>GS</sub> &lt; V<sub>th</sub> = {VTH}V)</span>
          )}
          {inSaturation && (
            <span>I<sub>D</sub> = ½k<sub>n</sub>(V<sub>GS</sub> - V<sub>th</sub>)² = {id.toFixed(0)} μA &nbsp;(saturation: V<sub>DS</sub> ≥ V<sub>GS</sub> - V<sub>th</sub>)</span>
          )}
          {inLinear && (
            <span>I<sub>D</sub> = k<sub>n</sub>[(V<sub>GS</sub> - V<sub>th</sub>)V<sub>DS</sub> - ½V<sub>DS</sub>²] = {id.toFixed(0)} μA &nbsp;(linear)</span>
          )}
        </div>
      </div>
    </div>
  );
}
