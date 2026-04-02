"use client";

import { useState } from "react";
import type { ConceptCheck as ConceptCheckType } from "@/lib/content/loader";
import { Button } from "@/components/ui/button";
import LatexText from "./LatexText";

interface ConceptCheckProps {
  check: ConceptCheckType;
}

export default function ConceptCheck({ check }: ConceptCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [codeAnswer, setCodeAnswer] = useState(check.starterCode ?? "");

  const isCorrect =
    check.type === "multiple_choice"
      ? selected === check.correct
      : codeAnswer.trim() === check.solution?.trim();

  function handleSubmit() {
    setSubmitted(true);
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-[#6c5ce7]/20 flex items-center justify-center">
          <span className="text-[#6c5ce7] text-xs font-bold">?</span>
        </div>
        <span className="text-xs font-mono text-[#6c5ce7] uppercase tracking-wider">
          Concept Check
        </span>
      </div>

      <p className="text-[#e8e6e3] mb-4 leading-relaxed">
        <LatexText text={check.question} />
      </p>

      {check.type === "multiple_choice" && check.options && (
        <div className="space-y-2 mb-4">
          {check.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                submitted
                  ? idx === check.correct
                    ? "border-[#00b894] bg-[#00b894]/10 text-[#00b894]"
                    : idx === selected
                    ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                    : "border-[#2a2a3e] text-[#8888a0]"
                  : selected === idx
                  ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-white"
                  : "border-[#2a2a3e] text-[#c8c6c3] hover:border-[#3a3a4e]"
              }`}
              disabled={submitted}
            >
              <span className="font-mono text-sm mr-2 opacity-60">
                {String.fromCharCode(65 + idx)}.
              </span>
              <LatexText text={option} />
            </button>
          ))}
        </div>
      )}

      {check.type === "fill_code" && (
        <div className="mb-4">
          <textarea
            value={codeAnswer}
            onChange={(e) => !submitted && setCodeAnswer(e.target.value)}
            className="w-full bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-4 font-mono text-sm text-[#c8c6c3] resize-none focus:border-[#6c5ce7] focus:outline-none"
            rows={4}
            disabled={submitted}
          />
        </div>
      )}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={
            check.type === "multiple_choice"
              ? selected === null
              : !codeAnswer.trim()
          }
          size="sm"
          className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white"
        >
          Check Answer
        </Button>
      ) : (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isCorrect
              ? "bg-[#00b894]/10 border-[#00b894]/30"
              : "bg-[#ff6b6b]/10 border-[#ff6b6b]/30"
          }`}
        >
          <p
            className={`font-medium text-sm mb-1 ${
              isCorrect ? "text-[#00b894]" : "text-[#ff6b6b]"
            }`}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          <p className="text-[#c8c6c3] text-sm">
            <LatexText text={check.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}
