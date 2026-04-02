"use client";

import { useState, useMemo, useCallback } from "react";

function floatToBits(value: number): number[] {
  const buf = new ArrayBuffer(4);
  const dv = new DataView(buf);
  dv.setFloat32(0, value, false);
  const int = dv.getUint32(0, false);
  const bits: number[] = [];
  for (let i = 31; i >= 0; i--) bits.push((int >> i) & 1);
  return bits;
}

function bitsToFloat(bits: number[]): number {
  let int = 0;
  for (let i = 0; i < 32; i++) int = (int << 1) | bits[i];
  const buf = new ArrayBuffer(4);
  const dv = new DataView(buf);
  dv.setUint32(0, int >>> 0, false);
  return dv.getFloat32(0, false);
}

function bitsToHex(bits: number[]): string {
  let int = 0;
  for (let i = 0; i < 32; i++) int = (int << 1) | bits[i];
  return "0x" + (int >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function classify(bits: number[]): string {
  const exp = parseInt(bits.slice(1, 9).join(""), 2);
  const mantZero = bits.slice(9).every(b => b === 0);
  if (exp === 0 && mantZero) return bits[0] ? "-0" : "+0";
  if (exp === 0) return "Denormalized";
  if (exp === 255 && mantZero) return bits[0] ? "-Infinity" : "+Infinity";
  if (exp === 255) return "NaN";
  return "Normalized";
}

const COLORS = { sign: "#ef4444", exp: "#6c9ceb", mant: "#10b981" };

export default function IEEE754Sim() {
  const [bits, setBits] = useState<number[]>(() => floatToBits(6.5));
  const [inputText, setInputText] = useState("6.5");

  const floatVal = useMemo(() => bitsToFloat(bits), [bits]);
  const cls = useMemo(() => classify(bits), [bits]);

  const sign = bits[0];
  const expBits = bits.slice(1, 9);
  const mantBits = bits.slice(9);
  const expVal = parseInt(expBits.join(""), 2);
  const isNorm = expVal > 0 && expVal < 255;
  const isDenorm = expVal === 0 && !mantBits.every(b => b === 0);

  const mantFrac = useMemo(() => {
    let f = 0;
    for (let i = 0; i < 23; i++) f += mantBits[i] * Math.pow(2, -(i + 1));
    return f;
  }, [mantBits]);

  const handleInput = useCallback((text: string) => {
    setInputText(text);
    const num = parseFloat(text);
    if (!isNaN(num)) { setBits(floatToBits(num)); return; }
    if (text === "Infinity" || text === "+Infinity") { setBits(floatToBits(Infinity)); return; }
    if (text === "-Infinity") { setBits(floatToBits(-Infinity)); return; }
    if (text.toLowerCase() === "nan") {
      setBits([0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    }
  }, []);

  const toggleBit = useCallback((idx: number) => {
    setBits(prev => {
      const next = [...prev];
      next[idx] = next[idx] ? 0 : 1;
      const val = bitsToFloat(next);
      setInputText(isNaN(val) ? "NaN" : isFinite(val) ? val.toString() : val > 0 ? "Infinity" : "-Infinity");
      return next;
    });
  }, []);

  function bitColor(i: number): string {
    if (i === 0) return COLORS.sign;
    if (i < 9) return COLORS.exp;
    return COLORS.mant;
  }

  function bitGroup(i: number): string {
    if (i === 0) return "sign";
    if (i < 9) return "exponent";
    return "mantissa";
  }

  const presets: [string, string][] = [
    ["0", "0"], ["-0", "-0"], ["1", "1"], ["-1", "-1"],
    ["0.1", "0.1"], ["3.14", "3.14"], ["Inf", "Infinity"], ["NaN", "NaN"],
  ];

  return (
    <div style={{ background: "#0e0e16", border: "1px solid #2a2a3e", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#8888a0", textTransform: "uppercase", letterSpacing: 1.5 }}>Interactive Simulation</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e0ddd8" }}>IEEE 754 Float Explorer</span>
      </div>

      {/* Decimal input */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, fontFamily: "monospace", color: "#8888a0" }}>Decimal:</label>
        <input type="text" value={inputText} onChange={e => handleInput(e.target.value)}
          style={{ background: "#12121a", border: "1px solid #2a2a3e", color: "white", padding: "6px 12px", borderRadius: 4, fontFamily: "monospace", fontSize: 13, width: 140, outline: "none" }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {presets.map(([label, val]) => (
            <button key={label} onClick={() => handleInput(val)}
              style={{ padding: "4px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace", background: "#1e1e2e", color: "#8888a0", border: "1px solid #2a2a3e", cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bit display */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <span style={{ width: 28, textAlign: "center", fontSize: 10, fontFamily: "monospace", color: COLORS.sign }}>S</span>
          <span style={{ flex: "0 0 auto", width: 8 * 24 - 4, textAlign: "center", fontSize: 10, fontFamily: "monospace", color: COLORS.exp }}>Exponent (8 bits)</span>
          <span style={{ flex: 1, textAlign: "center", fontSize: 10, fontFamily: "monospace", color: COLORS.mant }}>Mantissa (23 bits)</span>
        </div>

        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {bits.map((bit, i) => {
            const col = bitColor(i);
            return (
              <button key={i} onClick={() => toggleBit(i)} title={`Bit ${31 - i} (${bitGroup(i)})`}
                style={{
                  width: i === 0 ? 28 : 22, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace", fontSize: 13, borderRadius: 3, cursor: "pointer",
                  background: bit ? `${col}22` : "#12121a",
                  border: `1px solid ${bit ? col : "#2a2a3e"}`,
                  color: bit ? col : "#555",
                }}>
                {bit}
              </button>
            );
          })}
        </div>

        {/* Bit indices */}
        <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
          {bits.map((_, i) => (
            <div key={i} style={{ width: i === 0 ? 28 : 22, textAlign: "center", fontSize: 7, fontFamily: "monospace", color: "#444" }}>
              {31 - i}
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown cards */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #2a2a3e" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ background: "#12121a", borderRadius: 6, padding: 12, border: "1px solid #2a2a3e" }}>
            <div style={{ fontSize: 11, color: COLORS.sign, marginBottom: 4 }}>Sign bit</div>
            <div style={{ fontSize: 22, color: "white", fontFamily: "monospace" }}>{sign}</div>
            <div style={{ fontSize: 11, color: "#8888a0", fontFamily: "monospace" }}>(-1)^{sign} = {sign ? "-1" : "+1"}</div>
          </div>
          <div style={{ background: "#12121a", borderRadius: 6, padding: 12, border: "1px solid #2a2a3e" }}>
            <div style={{ fontSize: 11, color: COLORS.exp, marginBottom: 4 }}>Exponent</div>
            <div style={{ fontSize: 22, color: "white", fontFamily: "monospace" }}>{expVal} <span style={{ fontSize: 11, color: "#8888a0" }}>(biased)</span></div>
            <div style={{ fontSize: 11, color: "#8888a0", fontFamily: "monospace" }}>
              {isNorm ? `2^(${expVal}-127) = 2^${expVal - 127}` : isDenorm ? "2^(-126) denorm" : expVal === 0 ? "zero" : "special (255)"}
            </div>
          </div>
          <div style={{ background: "#12121a", borderRadius: 6, padding: 12, border: "1px solid #2a2a3e" }}>
            <div style={{ fontSize: 11, color: COLORS.mant, marginBottom: 4 }}>Mantissa</div>
            <div style={{ fontSize: 22, color: "white", fontFamily: "monospace" }}>{isNorm ? "1" : "0"}.{mantFrac.toFixed(6).slice(2)}</div>
            <div style={{ fontSize: 11, color: "#8888a0", fontFamily: "monospace" }}>
              {isNorm ? `1 + ${mantFrac.toFixed(6)}` : `0 + ${mantFrac.toFixed(6)}`}
            </div>
          </div>
        </div>

        {/* Formula */}
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 13, fontFamily: "monospace", background: "#12121a", borderRadius: 6, padding: 12, border: "1px solid #2a2a3e" }}>
          <span style={{ color: COLORS.sign }}>(-1)^{sign}</span>
          <span style={{ color: "#8888a0" }}> * </span>
          <span style={{ color: COLORS.exp }}>2^{isNorm ? String(expVal - 127) : isDenorm ? "(-126)" : "?"}</span>
          <span style={{ color: "#8888a0" }}> * </span>
          <span style={{ color: COLORS.mant }}>{isNorm ? (1 + mantFrac).toFixed(6) : mantFrac.toFixed(6)}</span>
          <span style={{ color: "#8888a0" }}> = </span>
          <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
            {isNaN(floatVal) ? "NaN" : !isFinite(floatVal) ? (floatVal > 0 ? "+Infinity" : "-Infinity") : floatVal.toString()}
          </span>
        </div>
      </div>

      {/* Classification + Hex */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a3e", background: "#12121a" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 12, fontFamily: "monospace" }}>
          <div>
            <span style={{ color: "#8888a0" }}>Class: </span>
            <span style={{
              color: cls === "Normalized" ? "#10b981" : cls === "Denormalized" ? "#f59e0b" : cls.includes("0") ? "#8888a0" : "#ef4444",
            }}>{cls}</span>
          </div>
          <div>
            <span style={{ color: "#8888a0" }}>Hex: </span>
            <span style={{ color: "#a29bfe" }}>{bitsToHex(bits)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
