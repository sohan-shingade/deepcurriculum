"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LatexText from "./LatexText";
import CodeBlock from "./CodeBlock";

interface QuizQuestion {
  id: string;
  type: string;
  points: number;
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
  code?: string;
}

interface QuizProps {
  title: string;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}

export default function Quiz({
  title,
  timeLimit,
  passingScore,
  questions,
  onComplete,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    let earned = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        earned += q.points;
      }
    });

    const score = Math.round((earned / totalPoints) * 100);
    onComplete?.(score);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  let earnedPoints = 0;
  if (submitted) {
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        earnedPoints += q.points;
      }
    });
  }
  const score = Math.round((earnedPoints / totalPoints) * 100);
  const passed = score >= passingScore;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          {submitted ? (
            <Badge
              className={`text-lg px-4 py-1 ${
                passed
                  ? "bg-[#00b894]/15 text-[#00b894]"
                  : "bg-[#ff6b6b]/15 text-[#ff6b6b]"
              }`}
            >
              {score}%{passed ? " — Passed" : " — Not Passed"}
            </Badge>
          ) : (
            <div
              className={`font-mono text-lg ${
                timeLeft < 60 ? "text-[#ff6b6b]" : "text-[#8888a0]"
              }`}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          const isCorrect = answers[q.id] === q.correct;

          return (
            <div
              key={q.id}
              className={`bg-[#12121a] border rounded-lg p-6 ${
                submitted
                  ? isCorrect
                    ? "border-[#00b894]/30"
                    : "border-[#ff6b6b]/30"
                  : "border-[#2a2a3e]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="text-xs font-mono text-[#8888a0] mb-2 block">
                    Question {qIdx + 1} — {q.points} pts
                  </span>
                  <div className="text-[#e8e6e3] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.question}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {q.code && (
                <CodeBlock code={q.code} language="python" />
              )}

              {q.options && (
                <div className="space-y-2 mt-4">
                  {q.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() =>
                        !submitted &&
                        setAnswers((a) => ({ ...a, [q.id]: oIdx }))
                      }
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${
                        submitted
                          ? oIdx === q.correct
                            ? "border-[#00b894] bg-[#00b894]/10 text-[#00b894]"
                            : oIdx === answers[q.id]
                            ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                            : "border-[#2a2a3e] text-[#555]"
                          : answers[q.id] === oIdx
                          ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-white"
                          : "border-[#2a2a3e] text-[#c8c6c3] hover:border-[#3a3a4e]"
                      }`}
                      disabled={submitted}
                    >
                      <span className="font-mono mr-2 opacity-60">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <LatexText text={option} />
                    </button>
                  ))}
                </div>
              )}

              {submitted && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isCorrect
                      ? "bg-[#00b894]/10 border border-[#00b894]/20"
                      : "bg-[#ff6b6b]/10 border border-[#ff6b6b]/20"
                  }`}
                >
                  <p className="text-sm text-[#c8c6c3]">
                    <LatexText text={q.explanation} />
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white px-8"
          >
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
