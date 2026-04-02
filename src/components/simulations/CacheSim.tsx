"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_SEQUENCES: Record<string, number[]> = {
  "Spatial Locality":   [0x00, 0x10, 0x20, 0x30, 0x04, 0x14, 0x24, 0x34],
  "Temporal Locality":  [0x00, 0x40, 0x80, 0x00, 0x40, 0x80, 0x00, 0x40],
  "Thrashing (Conflict)":[0x00, 0x100, 0x200, 0x00, 0x100, 0x200, 0x00, 0x100],
  "Sequential Scan":    [0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90],
};

interface CacheBlock { valid: boolean; tag: number; lastUsed: number; }
type MissType = "cold" | "conflict" | "capacity" | null;
interface AccessResult { addr: number; tag: number; index: number; offset: number; hit: boolean; missType: MissType; evictedTag: number | null; way: number; }

export default function CacheSim() {
  const [cacheSize, setCacheSize] = useState(256);
  const [blockSize, setBlockSize] = useState(16);
  const [assoc, setAssoc] = useState(1);
  const [addresses, setAddresses] = useState<number[]>(PRESET_SEQUENCES["Spatial Locality"]);
  const [addrInput, setAddrInput] = useState("");
  const [step, setStep] = useState(-1);

  const numBlocks = cacheSize / blockSize;
  const numSets = numBlocks / assoc;
  const offsetBits = Math.log2(blockSize);
  const indexBits = Math.log2(numSets);
  const tagBits = 16 - offsetBits - indexBits;

  // Simulate up to current step
  const { cache, results } = useMemo(() => {
    const c: CacheBlock[][] = Array.from({ length: numSets }, () =>
      Array.from({ length: assoc }, () => ({ valid: false, tag: -1, lastUsed: -1 }))
    );
    const r: AccessResult[] = [];
    const totalBlocksEverSeen = new Set<string>();

    for (let i = 0; i <= Math.min(step, addresses.length - 1); i++) {
      const addr = addresses[i];
      const offset = addr & ((1 << offsetBits) - 1);
      const index = (addr >> offsetBits) & ((1 << indexBits) - 1);
      const tag = addr >> (offsetBits + indexBits);

      const set = c[index];
      let hit = false;
      let evictedTag: number | null = null;
      let way = -1;
      const blockKey = `${index}-${tag}`;
      const wasSeenBefore = totalBlocksEverSeen.has(blockKey);

      // Check for hit
      for (let w = 0; w < assoc; w++) {
        if (set[w].valid && set[w].tag === tag) {
          hit = true; way = w; set[w].lastUsed = i; break;
        }
      }

      let missType: MissType = null;
      if (!hit) {
        // Find empty or LRU slot
        let emptyWay = set.findIndex(b => !b.valid);
        if (emptyWay !== -1) {
          way = emptyWay;
          missType = "cold";
        } else {
          // LRU eviction
          let minUsed = Infinity, minWay = 0;
          for (let w = 0; w < assoc; w++) {
            if (set[w].lastUsed < minUsed) { minUsed = set[w].lastUsed; minWay = w; }
          }
          way = minWay;
          evictedTag = set[way].tag;
          missType = wasSeenBefore ? "conflict" :
            (totalBlocksEverSeen.size >= numBlocks ? "capacity" : "cold");
        }
        set[way] = { valid: true, tag, lastUsed: i };
      }

      totalBlocksEverSeen.add(blockKey);
      r.push({ addr, tag, index, offset, hit, missType, evictedTag, way });
    }
    return { cache: c, results: r };
  }, [step, addresses, numSets, assoc, offsetBits, indexBits, numBlocks]);

  const hits = results.filter(r => r.hit).length;
  const misses = results.filter(r => !r.hit).length;
  const hitRate = results.length > 0 ? ((hits / results.length) * 100).toFixed(1) : "--";
  const amat = results.length > 0 ? (1 + (misses / results.length) * 100).toFixed(1) : "--";
  const current = step >= 0 && step < results.length ? results[step] : null;

  const addAddress = useCallback(() => {
    const val = parseInt(addrInput, 16);
    if (!isNaN(val) && val >= 0 && val <= 0xFFFF) {
      setAddresses(prev => [...prev, val]);
      setAddrInput("");
    }
  }, [addrInput]);

  const reset = useCallback(() => { setStep(-1); }, []);
  const nextAccess = useCallback(() => { setStep(s => Math.min(s + 1, addresses.length - 1)); }, [addresses]);

  const svgW = Math.max(assoc * 90 + 60, 320);
  const svgH = numSets * 44 + 30;

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6c5ce7]" />
          <span className="text-xs font-mono text-[#8888a0] uppercase tracking-wider">Interactive Simulation</span>
        </div>
        <span className="text-sm font-semibold text-[#e0ddd8]">Cache Hit/Miss Simulator</span>
      </div>

      {/* Config Controls */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] grid grid-cols-3 gap-3">
        {([
          { label: "Cache Size", value: cacheSize, set: setCacheSize, opts: [256, 512, 1024], fmt: (v: number) => v >= 1024 ? `${v / 1024}KB` : `${v}B` },
          { label: "Block Size", value: blockSize, set: setBlockSize, opts: [16, 32, 64], fmt: (v: number) => `${v}B` },
          { label: "Associativity", value: assoc, set: setAssoc, opts: [1, 2, 4], fmt: (v: number) => `${v}-way` },
        ] as const).map(c => (
          <div key={c.label}>
            <div className="text-xs text-[#8888a0] font-mono mb-1">{c.label}</div>
            <div className="flex gap-1">
              {c.opts.map(o => (
                <button key={o} onClick={() => { c.set(o); setStep(-1); }}
                  className={`px-2 py-1 rounded text-xs font-mono transition-colors ${c.value === o ? "bg-[#6c5ce7] text-white" : "bg-[#1e1e2e] text-[#8888a0] border border-[#2a2a3e] hover:border-[#6c5ce7]"}`}>
                  {c.fmt(o)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Address input + presets */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-end gap-3 flex-wrap">
        <div>
          <div className="text-xs text-[#8888a0] font-mono mb-1">Add Address (hex)</div>
          <div className="flex gap-1">
            <span className="text-xs font-mono text-[#8888a0] py-1">0x</span>
            <input value={addrInput} onChange={e => setAddrInput(e.target.value.replace(/[^0-9a-fA-F]/g, ""))}
              onKeyDown={e => e.key === "Enter" && addAddress()} maxLength={4}
              className="w-16 px-2 py-1 rounded text-xs font-mono bg-[#1e1e2e] text-[#c8c6c3] border border-[#2a2a3e] focus:border-[#6c5ce7] outline-none" />
            <button onClick={addAddress}
              className="px-2 py-1 rounded text-xs font-mono bg-[#6c5ce7] text-white hover:bg-[#5a4bd6]">Add</button>
          </div>
        </div>
        <div>
          <div className="text-xs text-[#8888a0] font-mono mb-1">Presets</div>
          <div className="flex gap-1 flex-wrap">
            {Object.keys(PRESET_SEQUENCES).map(name => (
              <button key={name} onClick={() => { setAddresses(PRESET_SEQUENCES[name]); setStep(-1); }}
                className="px-2 py-1 rounded text-xs font-mono bg-[#1e1e2e] text-[#8888a0] border border-[#2a2a3e] hover:border-[#6c5ce7] transition-colors">
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step controls + address sequence */}
      <div className="px-5 py-3 border-b border-[#2a2a3e] flex items-center gap-3">
        <button onClick={nextAccess} disabled={step >= addresses.length - 1}
          className="px-3 py-1.5 rounded text-xs font-mono bg-[#6c5ce7] text-white hover:bg-[#5a4bd6] disabled:opacity-40">
          Next Access
        </button>
        <button onClick={reset}
          className="px-3 py-1.5 rounded text-xs font-mono bg-[#1e1e2e] text-[#c8c6c3] border border-[#2a2a3e] hover:border-[#6c5ce7]">
          Reset
        </button>
        <div className="flex gap-1 flex-wrap ml-2">
          {addresses.map((a, i) => (
            <span key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono transition-colors ${
              i === step ? "bg-[#6c5ce7] text-white" : i < step ? "bg-[#1e1e2e] text-[#8888a0]" : "text-[#555]"}`}>
              0x{a.toString(16).toUpperCase().padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>

      {/* Address decomposition */}
      {current && (
        <div className="px-5 py-3 border-b border-[#2a2a3e]">
          <div className="text-xs font-mono text-[#8888a0] mb-2">
            Address 0x{current.addr.toString(16).toUpperCase().padStart(4, "0")} decomposition:
          </div>
          <div className="flex gap-0 font-mono text-sm">
            <span className="px-2 py-1 bg-[#e17055] text-white rounded-l" title="Tag">
              Tag: {current.tag.toString(2).padStart(tagBits, "0")}
            </span>
            <span className="px-2 py-1 bg-[#6c5ce7] text-white" title="Index">
              Idx: {current.index.toString(2).padStart(indexBits, "0")}
            </span>
            <span className="px-2 py-1 bg-[#00cec9] text-white rounded-r" title="Offset">
              Off: {current.offset.toString(2).padStart(offsetBits, "0")}
            </span>
            <span className="ml-3 py-1 font-bold text-sm" style={{ color: current.hit ? "#10b981" : "#ef4444" }}>
              {current.hit ? "HIT" : `MISS (${current.missType})`}
            </span>
          </div>
        </div>
      )}

      {/* Cache SVG */}
      <div className="px-5 py-4 overflow-x-auto">
        <svg width={svgW} height={svgH} className="mx-auto">
          {/* Set labels */}
          {Array.from({ length: numSets }, (_, si) => (
            <g key={`set-${si}`}>
              <text x={8} y={24 + si * 44 + 18} fill="#8888a0" fontSize={10} fontFamily="monospace">
                S{si}
              </text>
              {Array.from({ length: assoc }, (_, wi) => {
                const block = cache[si]?.[wi];
                const isCurrentTarget = current && current.index === si && current.way === wi;
                const isHit = isCurrentTarget && current.hit;
                const isMiss = isCurrentTarget && !current.hit;
                const x = 40 + wi * 88;
                const y = 24 + si * 44;
                const borderColor = isHit ? "#10b981" : isMiss ? "#ef4444" : "#2a2a3e";
                const bgColor = isHit ? "#10b98118" : isMiss ? "#ef444418" : "#12121a";

                return (
                  <motion.g key={`${si}-${wi}`}
                    animate={isCurrentTarget ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}>
                    <rect x={x} y={y} width={80} height={36} rx={4}
                      fill={bgColor} stroke={borderColor} strokeWidth={isCurrentTarget ? 2 : 1} />
                    {block?.valid ? (
                      <>
                        <text x={x + 40} y={y + 15} textAnchor="middle" fill="#c8c6c3" fontSize={10} fontFamily="monospace">
                          Tag: 0x{block.tag.toString(16).toUpperCase()}
                        </text>
                        <text x={x + 40} y={y + 28} textAnchor="middle" fill="#8888a0" fontSize={8} fontFamily="monospace">
                          LRU: {block.lastUsed}
                        </text>
                      </>
                    ) : (
                      <text x={x + 40} y={y + 22} textAnchor="middle" fill="#555" fontSize={10} fontFamily="monospace">
                        empty
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Stats bar */}
      <div className="px-5 py-3 border-t border-[#2a2a3e] grid grid-cols-4 gap-4">
        {[
          { label: "Hits", value: hits, color: "#10b981" },
          { label: "Misses", value: misses, color: "#ef4444" },
          { label: "Hit Rate", value: `${hitRate}%`, color: "#6c5ce7" },
          { label: "AMAT (cycles)", value: amat, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-lg font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#8888a0] font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Access history table */}
      {results.length > 0 && (
        <div className="px-5 py-3 border-t border-[#2a2a3e] max-h-36 overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[#8888a0]">
                <th className="text-left py-1">#</th><th className="text-left">Addr</th>
                <th className="text-left">Tag</th><th className="text-left">Set</th>
                <th className="text-left">Way</th><th className="text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={i === step ? "bg-[#6c5ce710]" : ""}>
                  <td className="py-0.5 text-[#555]">{i}</td>
                  <td className="text-[#c8c6c3]">0x{r.addr.toString(16).toUpperCase().padStart(2, "0")}</td>
                  <td className="text-[#e17055]">0x{r.tag.toString(16).toUpperCase()}</td>
                  <td className="text-[#6c5ce7]">{r.index}</td>
                  <td className="text-[#8888a0]">{r.way}</td>
                  <td style={{ color: r.hit ? "#10b981" : "#ef4444" }}>
                    {r.hit ? "Hit" : `Miss (${r.missType})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
