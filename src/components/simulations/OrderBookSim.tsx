"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Level {
  price: number; // in cents
  quantity: number;
  orders: number;
}

function initBook() {
  const mid = 15000; // $150.00
  const bids: Level[] = Array.from({ length: 10 }, (_, i) => ({
    price: mid - (i + 1) * 5,
    quantity: Math.floor(Math.random() * 400) + 50,
    orders: Math.floor(Math.random() * 8) + 1,
  }));
  const asks: Level[] = Array.from({ length: 10 }, (_, i) => ({
    price: mid + (i + 1) * 5,
    quantity: Math.floor(Math.random() * 400) + 50,
    orders: Math.floor(Math.random() * 8) + 1,
  }));
  return { bids, asks };
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrderBookSim() {
  const [book, setBook] = useState(initBook);
  const [latency, setLatency] = useState(0);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bestBid = book.bids[0]?.price ?? 0;
  const bestAsk = book.asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const maxQty = Math.max(...book.bids.map((l) => l.quantity), ...book.asks.map((l) => l.quantity), 1);

  const totalBidDepth = book.bids.reduce((s, l) => s + l.quantity, 0);
  const totalAskDepth = book.asks.reduce((s, l) => s + l.quantity, 0);

  // VWAP of top 5 levels each side
  const vwapNum = [...book.bids.slice(0, 5), ...book.asks.slice(0, 5)].reduce((s, l) => s + l.price * l.quantity, 0);
  const vwapDen = [...book.bids.slice(0, 5), ...book.asks.slice(0, 5)].reduce((s, l) => s + l.quantity, 0);
  const vwap = vwapDen > 0 ? vwapNum / vwapDen : midPrice;

  const logEvent = useCallback((msg: string) => {
    setEventLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const simLatency = () => {
    const ns = Math.floor(Math.random() * 80) + 12;
    setLatency(ns);
    return ns;
  };

  const addBuyOrder = useCallback(() => {
    const ns = simLatency();
    setBook((prev) => {
      const bids = prev.bids.map((l) => ({ ...l }));
      const idx = Math.floor(Math.random() * Math.min(5, bids.length));
      const qty = Math.floor(Math.random() * 100) + 10;
      bids[idx] = { ...bids[idx], quantity: bids[idx].quantity + qty, orders: bids[idx].orders + 1 };
      logEvent(`BUY +${qty} @ ${formatPrice(bids[idx].price)} [${ns}ns]`);
      return { ...prev, bids };
    });
  }, [logEvent]);

  const addSellOrder = useCallback(() => {
    const ns = simLatency();
    setBook((prev) => {
      const asks = prev.asks.map((l) => ({ ...l }));
      const idx = Math.floor(Math.random() * Math.min(5, asks.length));
      const qty = Math.floor(Math.random() * 100) + 10;
      asks[idx] = { ...asks[idx], quantity: asks[idx].quantity + qty, orders: asks[idx].orders + 1 };
      logEvent(`SELL +${qty} @ ${formatPrice(asks[idx].price)} [${ns}ns]`);
      return { ...prev, asks };
    });
  }, [logEvent]);

  const cancelOrder = useCallback(() => {
    const ns = simLatency();
    setBook((prev) => {
      const side = Math.random() > 0.5 ? "bids" : "asks";
      const levels = prev[side].map((l) => ({ ...l }));
      const idx = Math.floor(Math.random() * levels.length);
      const removeQty = Math.min(levels[idx].quantity, Math.floor(Math.random() * 80) + 10);
      levels[idx] = { ...levels[idx], quantity: Math.max(1, levels[idx].quantity - removeQty), orders: Math.max(1, levels[idx].orders - 1) };
      logEvent(`CANCEL -${removeQty} @ ${formatPrice(levels[idx].price)} (${side === "bids" ? "bid" : "ask"}) [${ns}ns]`);
      return { ...prev, [side]: levels };
    });
  }, [logEvent]);

  const executeOrder = useCallback(() => {
    const ns = simLatency();
    setBook((prev) => {
      const bids = prev.bids.map((l) => ({ ...l }));
      const asks = prev.asks.map((l) => ({ ...l }));
      if (bids.length === 0 || asks.length === 0) return prev;

      const matchQty = Math.min(bids[0].quantity, asks[0].quantity, Math.floor(Math.random() * 60) + 5);
      const price = asks[0].price;
      bids[0] = { ...bids[0], quantity: bids[0].quantity - matchQty };
      asks[0] = { ...asks[0], quantity: asks[0].quantity - matchQty };

      const newBids = bids[0].quantity <= 0 ? bids.slice(1) : bids;
      const newAsks = asks[0].quantity <= 0 ? asks.slice(1) : asks;

      logEvent(`EXEC ${matchQty} @ ${formatPrice(price)} [${ns}ns]`);
      return { bids: newBids, asks: newAsks };
    });
  }, [logEvent]);

  const randomEvent = useCallback(() => {
    const r = Math.random();
    if (r < 0.3) addBuyOrder();
    else if (r < 0.6) addSellOrder();
    else if (r < 0.8) cancelOrder();
    else executeOrder();
  }, [addBuyOrder, addSellOrder, cancelOrder, executeOrder]);

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(randomEvent, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay, randomEvent]);

  const BAR_MAX = 160;
  const ROW_H = 22;
  const SVG_W = 680;
  const CENTER_X = SVG_W / 2;
  const SVG_H = ROW_H * 10 + 40;

  return (
    <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-5 font-mono text-sm">
      <div className="text-[#c8c6c3] text-base font-semibold mb-1">FPGA Order Book Simulator</div>
      <div className="text-[#8888a0] text-xs mb-4">Hardware-accelerated matching engine with nanosecond latency</div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: "Add Buy", fn: addBuyOrder, color: "#4ade80" },
          { label: "Add Sell", fn: addSellOrder, color: "#f87171" },
          { label: "Cancel", fn: cancelOrder, color: "#facc15" },
          { label: "Execute", fn: executeOrder, color: "#6c5ce7" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.fn}
            className="px-3 py-1.5 rounded text-xs transition-colors bg-[#1a1a2e] hover:bg-[#222240]"
            style={{ color: btn.color }}
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={() => setAutoPlay((p) => !p)}
          className={`px-3 py-1.5 rounded text-xs transition-colors ${autoPlay ? "bg-[#6c5ce7] text-white" : "bg-[#1a1a2e] text-[#8888a0] hover:text-[#c8c6c3]"}`}
        >
          {autoPlay ? "Stop" : "Auto-play"}
        </button>
        <button
          onClick={() => { setBook(initBook()); setEventLog([]); }}
          className="px-3 py-1.5 rounded text-xs bg-[#1a1a2e] text-[#8888a0] hover:text-[#c8c6c3] transition-colors ml-auto"
        >
          Reset
        </button>
      </div>

      {/* SVG order book */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full mb-4" style={{ maxHeight: 320 }}>
        {/* Column headers */}
        <text x={CENTER_X - BAR_MAX - 50} y={14} fill="#4ade80" fontSize={9} textAnchor="end">QTY</text>
        <text x={CENTER_X - 10} y={14} fill="#4ade80" fontSize={9} textAnchor="end">BID</text>
        <text x={CENTER_X + 10} y={14} fill="#f87171" fontSize={9}>ASK</text>
        <text x={CENTER_X + BAR_MAX + 50} y={14} fill="#f87171" fontSize={9}>QTY</text>

        {/* Spread marker */}
        <line x1={CENTER_X} y1={20} x2={CENTER_X} y2={SVG_H} stroke="#2a2a3e" strokeWidth={1} strokeDasharray="3 3" />

        {/* Bid levels */}
        <AnimatePresence>
          {book.bids.slice(0, 10).map((level, i) => {
            const y = 24 + i * ROW_H;
            const barW = (level.quantity / maxQty) * BAR_MAX;
            const isBest = i === 0;
            return (
              <g key={`bid-${level.price}`}>
                <motion.rect
                  x={CENTER_X - 4 - barW}
                  y={y}
                  width={barW}
                  height={ROW_H - 3}
                  rx={2}
                  fill={isBest ? "#4ade8033" : "#4ade8018"}
                  initial={{ width: 0 }}
                  animate={{ width: barW, x: CENTER_X - 4 - barW }}
                  transition={{ duration: 0.2 }}
                />
                <text x={CENTER_X - 10} y={y + 14} textAnchor="end" fill={isBest ? "#4ade80" : "#4ade80aa"} fontSize={10} fontWeight={isBest ? "bold" : "normal"}>
                  {formatPrice(level.price)}
                </text>
                <text x={CENTER_X - BAR_MAX - 16} y={y + 14} textAnchor="end" fill="#8888a0" fontSize={9}>
                  {level.quantity}
                </text>
                <text x={CENTER_X - BAR_MAX - 50} y={y + 14} textAnchor="end" fill="#555" fontSize={8}>
                  [{level.orders}]
                </text>
              </g>
            );
          })}
        </AnimatePresence>

        {/* Ask levels */}
        <AnimatePresence>
          {book.asks.slice(0, 10).map((level, i) => {
            const y = 24 + i * ROW_H;
            const barW = (level.quantity / maxQty) * BAR_MAX;
            const isBest = i === 0;
            return (
              <g key={`ask-${level.price}`}>
                <motion.rect
                  x={CENTER_X + 4}
                  y={y}
                  width={barW}
                  height={ROW_H - 3}
                  rx={2}
                  fill={isBest ? "#f8717133" : "#f8717118"}
                  initial={{ width: 0 }}
                  animate={{ width: barW }}
                  transition={{ duration: 0.2 }}
                />
                <text x={CENTER_X + 10} y={y + 14} fill={isBest ? "#f87171" : "#f87171aa"} fontSize={10} fontWeight={isBest ? "bold" : "normal"}>
                  {formatPrice(level.price)}
                </text>
                <text x={CENTER_X + BAR_MAX + 16} y={y + 14} fill="#8888a0" fontSize={9}>
                  {level.quantity}
                </text>
                <text x={CENTER_X + BAR_MAX + 50} y={y + 14} fill="#555" fontSize={8}>
                  [{level.orders}]
                </text>
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {[
          { label: "Mid Price", value: formatPrice(midPrice) },
          { label: "Spread", value: formatPrice(spread), color: spread <= 10 ? "#4ade80" : spread <= 20 ? "#facc15" : "#f87171" },
          { label: "Bid Depth", value: totalBidDepth.toLocaleString(), color: "#4ade80" },
          { label: "Ask Depth", value: totalAskDepth.toLocaleString(), color: "#f87171" },
          { label: "VWAP", value: formatPrice(vwap) },
        ].map((s) => (
          <div key={s.label} className="bg-[#12121a] rounded px-3 py-2">
            <div className="text-[#555] text-[10px] uppercase tracking-wider">{s.label}</div>
            <div className="text-sm font-bold" style={{ color: (s as { color?: string }).color ?? "#c8c6c3" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Latency + event log */}
      <div className="flex gap-3">
        <div className="bg-[#12121a] rounded px-3 py-2 shrink-0">
          <div className="text-[#555] text-[10px] uppercase tracking-wider">Latency</div>
          <div className="text-[#6c5ce7] text-lg font-bold">{latency}<span className="text-xs font-normal text-[#8888a0]"> ns</span></div>
        </div>
        <div className="bg-[#12121a] rounded px-3 py-2 flex-1 max-h-28 overflow-y-auto">
          <div className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Event Feed</div>
          {eventLog.length === 0 ? (
            <div className="text-[#555] text-xs">Awaiting orders...</div>
          ) : (
            eventLog.map((msg, i) => (
              <motion.div key={`${msg}-${i}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-[#8888a0]">
                {msg}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
