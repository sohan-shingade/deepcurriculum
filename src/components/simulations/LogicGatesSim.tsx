"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

type GateType = "NAND" | "NOT" | "AND" | "OR" | "XOR";

const GATE_OPTIONS: GateType[] = ["NAND", "NOT", "AND", "OR", "XOR"];

const HIGH = "#00b894";
const LOW = "#ff6b6b";

function sigColor(v: boolean) {
  return v ? HIGH : LOW;
}

// NAND gate shape as an SVG group, positioned at (x,y) with given input/output values
function NandGateShape({ x, y, a, b, out, label }: { x: number; y: number; a: boolean; b: boolean; out: boolean; label?: string }) {
  return (
    <g>
      {/* Gate body */}
      <path
        d={`M ${x} ${y - 18} L ${x} ${y + 18} L ${x + 22} ${y + 18} A 18 18 0 0 0 ${x + 22} ${y - 18} Z`}
        fill="#1a1a2e" stroke="#c8c6c3" strokeWidth="1.2"
      />
      {/* Bubble */}
      <circle cx={x + 42} cy={y} r="4" fill="#1a1a2e" stroke="#c8c6c3" strokeWidth="1.2" />
      {/* Input wires */}
      <line x1={x - 18} y1={y - 9} x2={x} y2={y - 9} stroke={sigColor(a)} strokeWidth="2" />
      <line x1={x - 18} y1={y + 9} x2={x} y2={y + 9} stroke={sigColor(b)} strokeWidth="2" />
      {/* Output wire */}
      <line x1={x + 46} y1={y} x2={x + 64} y2={y} stroke={sigColor(out)} strokeWidth="2" />
      {/* Input dots */}
      <circle cx={x - 18} cy={y - 9} r="2.5" fill={sigColor(a)} />
      <circle cx={x - 18} cy={y + 9} r="2.5" fill={sigColor(b)} />
      {/* Output dot */}
      <circle cx={x + 64} cy={y} r="2.5" fill={sigColor(out)} />
      {label && (
        <text x={x + 14} y={y + 4} textAnchor="middle" fill="#8888a0" fontSize="8" fontFamily="JetBrains Mono">{label}</text>
      )}
    </g>
  );
}

function nand(a: boolean, b: boolean) { return !(a && b); }

export default function LogicGatesSim() {
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [gate, setGate] = useState<GateType>("NAND");

  const result = useMemo(() => {
    switch (gate) {
      case "NAND": return nand(inputA, inputB);
      case "NOT": return !inputA;
      case "AND": return inputA && inputB;
      case "OR": return inputA || inputB;
      case "XOR": return inputA !== inputB;
    }
  }, [gate, inputA, inputB]);

  const gateCount = useMemo(() => {
    switch (gate) {
      case "NAND": return 1;
      case "NOT": return 1;
      case "AND": return 2;
      case "OR": return 3;
      case "XOR": return 4;
    }
  }, [gate]);

  // Intermediate signals for each configuration
  const signals = useMemo(() => {
    const a = inputA;
    const b = inputB;
    switch (gate) {
      case "NAND": return { nand1: nand(a, b) };
      case "NOT": return { not1: nand(a, a) };
      case "AND": return { nand1: nand(a, b), not1: !nand(a, b) };
      case "OR": {
        const notA = nand(a, a);
        const notB = nand(b, b);
        return { notA, notB, or: nand(notA, notB) };
      }
      case "XOR": {
        const nab = nand(a, b);
        const x1 = nand(a, nab);
        const x2 = nand(b, nab);
        return { nab, x1, x2, out: nand(x1, x2) };
      }
    }
  }, [gate, inputA, inputB]);

  // Truth table for selected gate
  const truthTable = useMemo(() => {
    const rows: { a: boolean; b: boolean; out: boolean }[] = [];
    const vals = [false, true];
    for (const a of vals) {
      for (const b of vals) {
        let out: boolean;
        switch (gate) {
          case "NAND": out = nand(a, b); break;
          case "NOT": out = !a; break;
          case "AND": out = a && b; break;
          case "OR": out = a || b; break;
          case "XOR": out = a !== b; break;
        }
        rows.push({ a, b, out });
      }
    }
    return rows;
  }, [gate]);

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
        <span className="text-xs font-mono text-[#6c5ce7]">Logic Gates from NAND</span>
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-b border-[#2a2a3e] flex flex-wrap items-center gap-4">
        {/* Input toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInputA(!inputA)}
            className={`px-3 py-1.5 rounded font-mono text-sm border transition-colors ${
              inputA
                ? "bg-[#00b894]/20 border-[#00b894] text-[#00b894]"
                : "bg-[#ff6b6b]/20 border-[#ff6b6b] text-[#ff6b6b]"
            }`}
          >
            A = {inputA ? "1" : "0"}
          </button>
          {gate !== "NOT" && (
            <button
              onClick={() => setInputB(!inputB)}
              className={`px-3 py-1.5 rounded font-mono text-sm border transition-colors ${
                inputB
                  ? "bg-[#00b894]/20 border-[#00b894] text-[#00b894]"
                  : "bg-[#ff6b6b]/20 border-[#ff6b6b] text-[#ff6b6b]"
              }`}
            >
              B = {inputB ? "1" : "0"}
            </button>
          )}
        </div>

        {/* Gate selector */}
        <select
          value={gate}
          onChange={(e) => setGate(e.target.value as GateType)}
          className="bg-[#12121a] border border-[#2a2a3e] text-[#c8c6c3] px-3 py-1.5 rounded font-mono text-sm focus:outline-none focus:border-[#6c5ce7]"
        >
          {GATE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <div className="text-xs font-mono text-[#8888a0]">
          Gates used: <span className="text-[#6c5ce7]">{gateCount}</span>
        </div>
      </div>

      {/* SVG circuit + truth table */}
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Circuit diagram */}
        <div className="flex-1">
          <svg viewBox="0 0 400 220" className="w-full max-w-lg mx-auto">
            {/* Input labels */}
            <text x="10" y="73" fill={sigColor(inputA)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">A={inputA ? "1" : "0"}</text>
            {gate !== "NOT" && (
              <text x="10" y="153" fill={sigColor(inputB)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">B={inputB ? "1" : "0"}</text>
            )}

            {/* Draw circuits based on gate type */}
            {gate === "NAND" && (
              <g>
                {/* Input wires to gate */}
                <line x1="40" y1="70" x2="132" y2="101" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="40" y1="150" x2="132" y2="119" stroke={sigColor(inputB)} strokeWidth="2" />
                <NandGateShape x={150} y={110} a={inputA} b={inputB} out={signals.nand1 as boolean} />
                <text x="230" y="114" fill={sigColor(result)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Out={result ? "1" : "0"}</text>
              </g>
            )}

            {gate === "NOT" && (
              <g>
                {/* Single input tied to both */}
                <line x1="40" y1="70" x2="132" y2="101" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="40" y1="70" x2="40" y2="125" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="40" y1="125" x2="132" y2="119" stroke={sigColor(inputA)} strokeWidth="2" />
                <NandGateShape x={150} y={110} a={inputA} b={inputA} out={signals.not1 as boolean} label="NAND" />
                <text x="230" y="114" fill={sigColor(result)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Out={result ? "1" : "0"}</text>
                <text x="85" y="95" fill="#8888a0" fontSize="8" fontFamily="JetBrains Mono">tied</text>
              </g>
            )}

            {gate === "AND" && (
              <g>
                {/* NAND then NOT */}
                <line x1="40" y1="70" x2="82" y2="81" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="40" y1="150" x2="82" y2="99" stroke={sigColor(inputB)} strokeWidth="2" />
                <NandGateShape x={100} y={90} a={inputA} b={inputB} out={signals.nand1 as boolean} label="1" />
                {/* NAND output to NOT (self-tied NAND) */}
                <line x1="164" y1="90" x2="200" y2="90" stroke={sigColor(signals.nand1 as boolean)} strokeWidth="2" />
                <line x1="200" y1="90" x2="200" y2="71" stroke={sigColor(signals.nand1 as boolean)} strokeWidth="1.5" />
                <line x1="200" y1="71" x2="220" y2="81" stroke={sigColor(signals.nand1 as boolean)} strokeWidth="2" />
                <line x1="200" y1="90" x2="200" y2="109" stroke={sigColor(signals.nand1 as boolean)} strokeWidth="1.5" />
                <line x1="200" y1="109" x2="220" y2="99" stroke={sigColor(signals.nand1 as boolean)} strokeWidth="2" />
                <NandGateShape x={238} y={90} a={signals.nand1 as boolean} b={signals.nand1 as boolean} out={signals.not1 as boolean} label="2" />
                <text x="318" y="94" fill={sigColor(result)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Out={result ? "1" : "0"}</text>
              </g>
            )}

            {gate === "OR" && (
              <g>
                {/* NOT A (gate 1) */}
                <line x1="40" y1="60" x2="60" y2="60" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="60" y1="60" x2="60" y2="41" stroke={sigColor(inputA)} strokeWidth="1.5" />
                <line x1="60" y1="41" x2="80" y2="51" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="60" y1="60" x2="60" y2="69" stroke={sigColor(inputA)} strokeWidth="1.5" />
                <line x1="60" y1="69" x2="80" y2="69" stroke={sigColor(inputA)} strokeWidth="2" />
                <NandGateShape x={80} y={60} a={inputA} b={inputA} out={signals.notA as boolean} label="1" />

                {/* NOT B (gate 2) */}
                <line x1="40" y1="150" x2="60" y2="150" stroke={sigColor(inputB)} strokeWidth="2" />
                <line x1="60" y1="150" x2="60" y2="131" stroke={sigColor(inputB)} strokeWidth="1.5" />
                <line x1="60" y1="131" x2="80" y2="141" stroke={sigColor(inputB)} strokeWidth="2" />
                <line x1="60" y1="150" x2="60" y2="159" stroke={sigColor(inputB)} strokeWidth="1.5" />
                <line x1="60" y1="159" x2="80" y2="159" stroke={sigColor(inputB)} strokeWidth="2" />
                <NandGateShape x={80} y={150} a={inputB} b={inputB} out={signals.notB as boolean} label="2" />

                {/* NAND(notA, notB) = OR (gate 3) */}
                <line x1="144" y1="60" x2="200" y2="60" stroke={sigColor(signals.notA as boolean)} strokeWidth="2" />
                <line x1="200" y1="60" x2="200" y2="96" stroke={sigColor(signals.notA as boolean)} strokeWidth="1.5" />
                <line x1="200" y1="96" x2="222" y2="96" stroke={sigColor(signals.notA as boolean)} strokeWidth="2" />
                <line x1="144" y1="150" x2="200" y2="150" stroke={sigColor(signals.notB as boolean)} strokeWidth="2" />
                <line x1="200" y1="150" x2="200" y2="114" stroke={sigColor(signals.notB as boolean)} strokeWidth="1.5" />
                <line x1="200" y1="114" x2="222" y2="114" stroke={sigColor(signals.notB as boolean)} strokeWidth="2" />
                <NandGateShape x={240} y={105} a={signals.notA as boolean} b={signals.notB as boolean} out={signals.or as boolean} label="3" />
                <text x="320" y="109" fill={sigColor(result)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Out={result ? "1" : "0"}</text>
              </g>
            )}

            {gate === "XOR" && (
              <g>
                {/* Gate 1: NAND(A,B) */}
                <line x1="40" y1="60" x2="62" y2="71" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="40" y1="150" x2="62" y2="89" stroke={sigColor(inputB)} strokeWidth="2" />
                <NandGateShape x={80} y={80} a={inputA} b={inputB} out={(signals as { nab: boolean }).nab} label="1" />

                {/* Gate 2: NAND(A, nab) */}
                <line x1="40" y1="60" x2="40" y2="38" stroke={sigColor(inputA)} strokeWidth="1.5" />
                <line x1="40" y1="38" x2="172" y2="38" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="172" y1="38" x2="172" y2="21" stroke={sigColor(inputA)} strokeWidth="1.5" />
                <line x1="172" y1="21" x2="190" y2="31" stroke={sigColor(inputA)} strokeWidth="2" />
                <line x1="144" y1="80" x2="165" y2="80" stroke={sigColor((signals as { nab: boolean }).nab)} strokeWidth="2" />
                <line x1="165" y1="80" x2="165" y2="49" stroke={sigColor((signals as { nab: boolean }).nab)} strokeWidth="1.5" />
                <line x1="165" y1="49" x2="190" y2="49" stroke={sigColor((signals as { nab: boolean }).nab)} strokeWidth="2" />
                <NandGateShape x={190} y={40} a={inputA} b={(signals as { nab: boolean }).nab} out={(signals as { x1: boolean }).x1} label="2" />

                {/* Gate 3: NAND(B, nab) */}
                <line x1="40" y1="150" x2="40" y2="172" stroke={sigColor(inputB)} strokeWidth="1.5" />
                <line x1="40" y1="172" x2="172" y2="172" stroke={sigColor(inputB)} strokeWidth="2" />
                <line x1="172" y1="172" x2="172" y2="159" stroke={sigColor(inputB)} strokeWidth="1.5" />
                <line x1="172" y1="159" x2="190" y2="141" stroke={sigColor(inputB)} strokeWidth="2" />
                <line x1="165" y1="80" x2="165" y2="159" stroke={sigColor((signals as { nab: boolean }).nab)} strokeWidth="1.5" />
                <line x1="165" y1="159" x2="190" y2="159" stroke={sigColor((signals as { nab: boolean }).nab)} strokeWidth="2" />
                <NandGateShape x={190} y={150} a={inputB} b={(signals as { nab: boolean }).nab} out={(signals as { x2: boolean }).x2} label="3" />

                {/* Gate 4: NAND(x1, x2) */}
                <line x1="254" y1="40" x2="280" y2="40" stroke={sigColor((signals as { x1: boolean }).x1)} strokeWidth="2" />
                <line x1="280" y1="40" x2="280" y2="86" stroke={sigColor((signals as { x1: boolean }).x1)} strokeWidth="1.5" />
                <line x1="280" y1="86" x2="300" y2="86" stroke={sigColor((signals as { x1: boolean }).x1)} strokeWidth="2" />
                <line x1="254" y1="150" x2="280" y2="150" stroke={sigColor((signals as { x2: boolean }).x2)} strokeWidth="2" />
                <line x1="280" y1="150" x2="280" y2="104" stroke={sigColor((signals as { x2: boolean }).x2)} strokeWidth="1.5" />
                <line x1="280" y1="104" x2="300" y2="104" stroke={sigColor((signals as { x2: boolean }).x2)} strokeWidth="2" />
                <NandGateShape x={300} y={95} a={(signals as { x1: boolean }).x1} b={(signals as { x2: boolean }).x2} out={(signals as { out: boolean }).out} label="4" />
                <text x="380" y="99" fill={sigColor(result)} fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Out={result ? "1" : "0"}</text>
              </g>
            )}
          </svg>
        </div>

        {/* Truth table */}
        <div className="w-full md:w-40 flex-shrink-0">
          <div className="text-xs font-mono text-[#8888a0] mb-2 text-center">Truth Table ({gate})</div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2a2a3e]">
                <th className="py-1 text-[#8888a0]">A</th>
                {gate !== "NOT" && <th className="py-1 text-[#8888a0]">B</th>}
                <th className="py-1 text-[#8888a0]">Out</th>
              </tr>
            </thead>
            <tbody>
              {truthTable.map((row, i) => {
                const isCurrentRow =
                  row.a === inputA && (gate === "NOT" || row.b === inputB);
                return (
                  <motion.tr
                    key={i}
                    className={`border-b border-[#2a2a3e]/50 ${
                      isCurrentRow ? "bg-[#6c5ce7]/15" : ""
                    }`}
                    animate={{
                      backgroundColor: isCurrentRow ? "rgba(108,92,231,0.15)" : "rgba(0,0,0,0)",
                    }}
                  >
                    <td className={`py-1 text-center ${row.a ? "text-[#00b894]" : "text-[#ff6b6b]"}`}>
                      {row.a ? "1" : "0"}
                    </td>
                    {gate !== "NOT" && (
                      <td className={`py-1 text-center ${row.b ? "text-[#00b894]" : "text-[#ff6b6b]"}`}>
                        {row.b ? "1" : "0"}
                      </td>
                    )}
                    <td className={`py-1 text-center font-bold ${row.out ? "text-[#00b894]" : "text-[#ff6b6b]"}`}>
                      {row.out ? "1" : "0"}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula */}
      <div className="px-5 py-3 border-t border-[#2a2a3e] bg-[#12121a]">
        <div className="text-xs font-mono text-[#8888a0] text-center">
          {gate === "NAND" && <span>NAND(A, B) = NOT(A AND B) -- universal gate, 1 NAND gate</span>}
          {gate === "NOT" && <span>NOT(A) = NAND(A, A) -- 1 NAND gate with inputs tied</span>}
          {gate === "AND" && <span>AND(A, B) = NOT(NAND(A, B)) -- 2 NAND gates</span>}
          {gate === "OR" && <span>OR(A, B) = NAND(NOT(A), NOT(B)) -- 3 NAND gates (De Morgan&apos;s)</span>}
          {gate === "XOR" && <span>XOR(A, B) = NAND(NAND(A, NAND(A,B)), NAND(B, NAND(A,B))) -- 4 NAND gates</span>}
        </div>
      </div>
    </div>
  );
}
