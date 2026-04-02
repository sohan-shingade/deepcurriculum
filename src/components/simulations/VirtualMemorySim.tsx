"use client";

import { useState, useCallback, useMemo, useRef } from "react";

interface TLBEntry { vpn: number; ppn: number; lastUsed: number; }

type PageSize = "4KB" | "2MB";

const TLB_CAP = 4;

function randomPPN() { return Math.floor(Math.random() * 0xFFF) + 1; }

interface LookupResult {
  vpn: number; offset: number; ppn: number; physical: number;
  hit: boolean; evicted: number | null;
}

export default function VirtualMemorySim() {
  const [addrHex, setAddrHex] = useState("0x00403A10");
  const [pageSize, setPageSize] = useState<PageSize>("4KB");
  const [tlb, setTlb] = useState<TLBEntry[]>([]);
  const pageTableRef = useRef<Map<number, number>>(new Map());
  const [accessCount, setAccessCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [walkCount, setWalkCount] = useState(0);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "split" | "tlb" | "hit" | "miss" | "walk" | "done">("idle");

  const offsetBits = pageSize === "4KB" ? 12 : 21;

  const address = useMemo(() => {
    const p = parseInt(addrHex.replace(/^0x/i, ""), 16);
    return isNaN(p) ? 0 : p & 0xFFFFFFFF;
  }, [addrHex]);

  const vpn = address >>> offsetBits;
  const offset = address & ((1 << offsetBits) - 1);

  const translate = useCallback(() => {
    const curVPN = vpn;
    const curOff = offset;
    const pageTable = pageTableRef.current;

    setAccessCount(c => c + 1);
    setPhase("split");

    setTimeout(() => {
      setPhase("tlb");

      setTimeout(() => {
        setTlb(prev => {
          const entry = prev.find(e => e.vpn === curVPN);

          if (entry) {
            setHitCount(c => c + 1);
            setPhase("hit");
            const updated = prev.map(e => e.vpn === curVPN ? { ...e, lastUsed: Date.now() } : e);
            const phys = (entry.ppn << offsetBits) | curOff;
            setTimeout(() => {
              setResult({ vpn: curVPN, offset: curOff, ppn: entry.ppn, physical: phys, hit: true, evicted: null });
              setPhase("done");
            }, 400);
            return updated;
          }

          setPhase("miss");
          setWalkCount(c => c + 1);

          let ppn = pageTable.get(curVPN);
          if (ppn === undefined) { ppn = randomPPN(); pageTable.set(curVPN, ppn); }
          const finalPPN = ppn;

          setTimeout(() => {
            setPhase("walk");
            setTimeout(() => {
              setTlb(prev2 => {
                const newTlb = [...prev2];
                let evicted: number | null = null;
                if (newTlb.length >= TLB_CAP) {
                  const lruIdx = newTlb.reduce((mi, e, i, a) => e.lastUsed < a[mi].lastUsed ? i : mi, 0);
                  evicted = newTlb[lruIdx].vpn;
                  newTlb.splice(lruIdx, 1);
                }
                newTlb.push({ vpn: curVPN, ppn: finalPPN, lastUsed: Date.now() });
                const phys = (finalPPN << offsetBits) | curOff;
                setResult({ vpn: curVPN, offset: curOff, ppn: finalPPN, physical: phys, hit: false, evicted });
                setPhase("done");
                return newTlb;
              });
            }, 500);
          }, 400);

          return prev;
        });
      }, 400);
    }, 300);
  }, [vpn, offset, offsetBits]);

  const resetAll = useCallback(() => {
    setTlb([]); setResult(null); setAccessCount(0); setHitCount(0); setWalkCount(0); setPhase("idle");
    pageTableRef.current = new Map();
  }, []);

  const hitRate = accessCount > 0 ? ((hitCount / accessCount) * 100).toFixed(1) : "0.0";
  const vpnHex = `0x${vpn.toString(16).toUpperCase().padStart(pageSize === "4KB" ? 5 : 3, "0")}`;
  const offsetHex = `0x${offset.toString(16).toUpperCase().padStart(3, "0")}`;

  const isAnimating = phase !== "idle" && phase !== "done";

  // Quick address presets
  const presets = ["0x00403A10", "0x00403B20", "0x00501000", "0x00602C40", "0x00403A88"];

  return (
    <div style={{ background: "#0e0e16", border: "1px solid #2a2a3e", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", textTransform: "uppercase", letterSpacing: 1.5 }}>Interactive Simulation</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd8" }}>TLB / Page Table Lookup</span>
      </div>

      {/* Controls */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, fontFamily: "monospace", color: "#8888a0" }}>VA:</label>
        <input type="text" value={addrHex} onChange={e => setAddrHex(e.target.value)}
          style={{ background: "#12121a", border: "1px solid #2a2a3e", color: "#a29bfe", padding: "6px 10px", borderRadius: 4, fontFamily: "monospace", fontSize: 12, width: 130, outline: "none" }} />
        <div style={{ display: "flex", gap: 4 }}>
          {(["4KB", "2MB"] as PageSize[]).map(ps => (
            <button key={ps} onClick={() => { setPageSize(ps); resetAll(); }}
              style={{ padding: "5px 10px", borderRadius: 4, fontSize: 11, fontFamily: "monospace", cursor: "pointer", background: pageSize === ps ? "#6c5ce7" : "#1a1a2e", color: pageSize === ps ? "white" : "#8888a0", border: "none" }}>
              {ps}
            </button>
          ))}
        </div>
        <button onClick={translate} disabled={isAnimating}
          style={{ padding: "6px 16px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: isAnimating ? "#1a1a2e" : "#6c5ce7", color: isAnimating ? "#3a3a5e" : "white", border: "none", cursor: isAnimating ? "not-allowed" : "pointer" }}>
          Translate
        </button>
        <button onClick={resetAll}
          style={{ padding: "6px 12px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", background: "#1e1e2e", color: "#8888a0", border: "1px solid #2a2a3e", cursor: "pointer" }}>
          Reset
        </button>
      </div>

      {/* Quick address presets */}
      <div style={{ padding: "8px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", gap: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#555", marginRight: 4 }}>Try:</span>
        {presets.map(p => (
          <button key={p} onClick={() => setAddrHex(p)}
            style={{ padding: "3px 8px", borderRadius: 3, fontSize: 10, fontFamily: "monospace", background: "#1e1e2e", color: "#8888a0", border: "1px solid #2a2a3e", cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      {/* SVG visualization */}
      <div style={{ padding: "16px 20px" }}>
        <svg viewBox="0 0 680 260" style={{ width: "100%", maxHeight: 280 }}>
          <defs>
            <marker id="vmArr" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#555" />
            </marker>
            <marker id="vmArrG" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
            </marker>
            <marker id="vmArrR" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Virtual Address box */}
          <rect x={10} y={20} width={140} height={32} rx={4} fill="#12121a" stroke={phase !== "idle" ? "#6c5ce7" : "#2a2a3e"} strokeWidth={1} />
          <text x={80} y={26} textAnchor="middle" fill="#8888a0" fontSize={9}>Virtual Address</text>
          <text x={80} y={44} textAnchor="middle" fill="#c8c6c3" fontSize={12} fontFamily="monospace">
            0x{(address >>> 0).toString(16).toUpperCase().padStart(8, "0")}
          </text>

          {/* VPN | Offset split */}
          <rect x={10} y={64} width={80} height={22} rx={3} fill="rgba(108,92,231,0.12)" stroke="#6c5ce7" strokeWidth={phase !== "idle" ? 1.5 : 0.8} />
          <text x={50} y={79} textAnchor="middle" fill="#6c5ce7" fontSize={9} fontFamily="monospace">VPN {vpnHex}</text>
          <rect x={95} y={64} width={55} height={22} rx={3} fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth={0.8} />
          <text x={122} y={79} textAnchor="middle" fill="#4ade80" fontSize={9} fontFamily="monospace">Off {offsetHex}</text>

          {/* Arrow to TLB */}
          <line x1={150} y1={75} x2={200} y2={75} stroke="#555" strokeWidth={1} markerEnd="url(#vmArr)" />

          {/* TLB box */}
          <rect x={205} y={12} width={170} height={130} rx={6} fill="#12121a"
            stroke={phase === "tlb" ? "#eab308" : phase === "hit" ? "#10b981" : phase === "miss" ? "#ef4444" : "#2a2a3e"}
            strokeWidth={phase === "idle" || phase === "done" || phase === "split" ? 1 : 2} />
          <text x={290} y={28} textAnchor="middle" fill="#8888a0" fontSize={10}>TLB ({tlb.length}/{TLB_CAP})</text>

          {/* TLB entries */}
          {Array.from({ length: TLB_CAP }).map((_, i) => {
            const entry = tlb[i];
            const y = 36 + i * 24;
            const isMatch = result && entry && entry.vpn === result.vpn;
            return (
              <g key={i}>
                <rect x={212} y={y} width={156} height={20} rx={2} fill={isMatch ? "rgba(108,92,231,0.12)" : "#0e0e16"} stroke={isMatch ? "#6c5ce7" : "#1a1a2e"} strokeWidth={0.5} />
                {entry ? (
                  <>
                    <text x={232} y={y + 14} fill="#6c5ce7" fontSize={9} fontFamily="monospace">VPN 0x{entry.vpn.toString(16).toUpperCase()}</text>
                    <text x={308} y={y + 14} fill="#555" fontSize={9}>{"\u2192"}</text>
                    <text x={320} y={y + 14} fill="#f0abfc" fontSize={9} fontFamily="monospace">PPN 0x{entry.ppn.toString(16).toUpperCase()}</text>
                  </>
                ) : (
                  <text x={290} y={y + 14} textAnchor="middle" fill="#333" fontSize={9}>---</text>
                )}
              </g>
            );
          })}

          {/* TLB result */}
          {(phase === "hit" || (phase === "done" && result?.hit)) && (
            <text x={290} y={152} textAnchor="middle" fill="#10b981" fontSize={12} fontWeight="bold" fontFamily="monospace">HIT</text>
          )}
          {(phase === "miss" || phase === "walk" || (phase === "done" && result && !result.hit)) && (
            <text x={290} y={152} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight="bold" fontFamily="monospace">MISS</text>
          )}

          {/* Arrow from TLB hit -> Physical */}
          {phase === "done" && result?.hit && (
            <line x1={290} y1={160} x2={290} y2={195} stroke="#10b981" strokeWidth={1.5} markerEnd="url(#vmArrG)" />
          )}

          {/* Arrow TLB miss -> Page Table */}
          {(phase === "miss" || phase === "walk" || (phase === "done" && result && !result.hit)) && (
            <line x1={375} y1={75} x2={430} y2={75} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#vmArrR)" />
          )}

          {/* Page Table box */}
          <rect x={435} y={12} width={130} height={130} rx={6} fill="#12121a" stroke={phase === "walk" ? "#eab308" : "#2a2a3e"} strokeWidth={phase === "walk" ? 2 : 1} />
          <text x={500} y={28} textAnchor="middle" fill="#8888a0" fontSize={10}>Page Table</text>

          {/* Page table walk visualization */}
          {(["L2 Lookup", "L1 Lookup", "PTE"]).map((label, i) => {
            const y = 38 + i * 32;
            const active = phase === "walk" || (phase === "done" && !result?.hit);
            return (
              <g key={label}>
                <rect x={448} y={y} width={104} height={24} rx={3} fill={active ? "#1a1a2e" : "#0e0e16"} stroke={active ? "#555" : "#1a1a2e"} strokeWidth={0.5} />
                <text x={500} y={y + 15} textAnchor="middle" fill={active ? "#8888a0" : "#333"} fontSize={8} fontFamily="monospace">{label}</text>
                {i < 2 && <line x1={500} y1={y + 24} x2={500} y2={y + 32} stroke="#333" strokeWidth={0.5} />}
              </g>
            );
          })}

          {/* Arrow from Page Table walk -> Physical */}
          {phase === "done" && result && !result.hit && (
            <line x1={500} y1={142} x2={500} y2={170} stroke="#eab308" strokeWidth={1} />
          )}
          {phase === "done" && result && !result.hit && (
            <line x1={500} y1={170} x2={340} y2={195} stroke="#eab308" strokeWidth={1} markerEnd="url(#vmArr)" />
          )}

          {/* Physical Address output */}
          {phase === "done" && result && (
            <g>
              <text x={310} y={208} textAnchor="middle" fill="#8888a0" fontSize={10}>Physical Address</text>
              <rect x={220} y={214} width={180} height={30} rx={4} fill="#12121a" stroke="#10b981" strokeWidth={1} />
              <text x={310} y={234} textAnchor="middle" fill="#10b981" fontSize={12} fontWeight="bold" fontFamily="monospace">
                0x{(result.physical >>> 0).toString(16).toUpperCase().padStart(8, "0")}
              </text>

              {/* PPN | Offset */}
              <rect x={420} y={214} width={80} height={14} rx={2} fill="rgba(240,171,252,0.1)" stroke="#f0abfc" strokeWidth={0.5} />
              <text x={460} y={224} textAnchor="middle" fill="#f0abfc" fontSize={8} fontFamily="monospace">PPN 0x{result.ppn.toString(16).toUpperCase()}</text>
              <rect x={505} y={214} width={60} height={14} rx={2} fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth={0.5} />
              <text x={535} y={224} textAnchor="middle" fill="#4ade80" fontSize={8} fontFamily="monospace">Off {offsetHex}</text>
            </g>
          )}

          {/* Eviction notice */}
          {phase === "done" && result && result.evicted !== null && (
            <text x={290} y={166} textAnchor="middle" fill="#eab308" fontSize={8} fontFamily="monospace">
              LRU evicted VPN 0x{result.evicted.toString(16).toUpperCase()}
            </text>
          )}
        </svg>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a3e", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { label: "Lookups", value: String(accessCount), color: "#c8c6c3" },
          { label: "Hit Rate", value: `${hitRate}%`, color: parseFloat(hitRate) >= 50 ? "#10b981" : "#ef4444" },
          { label: "Page Walks", value: String(walkCount), color: "#ef4444" },
          { label: "TLB Entries", value: `${tlb.length}/${TLB_CAP}`, color: "#a29bfe" },
        ].map(s => (
          <div key={s.label} style={{ background: "#12121a", borderRadius: 6, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Page config info */}
      <div style={{ padding: "8px 20px", borderTop: "1px solid #2a2a3e", fontSize: 10, fontFamily: "monospace", color: "#555", textAlign: "center" }}>
        Page size: {pageSize} | {offsetBits}-bit offset | {TLB_CAP}-entry TLB with LRU eviction
      </div>
    </div>
  );
}
