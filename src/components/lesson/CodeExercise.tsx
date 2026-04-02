"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import PythonRunner from "@/components/editor/PythonRunner";
import CodeBlock from "./CodeBlock";
import LatexText from "./LatexText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessonStore } from "@/store/lesson-store";

interface Exercise {
  id: string;
  title: string;
  points: number;
  difficulty: string;
  description: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  testCode: string;
  hints: string[];
}

interface CodeExerciseProps {
  exercise: Exercise;
  onPass?: () => void;
}

export default function CodeExercise({ exercise, onPass }: CodeExerciseProps) {
  const [passed, setPassed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const { revealedHints, revealNextHint, exerciseCode, setExerciseCode } =
    useLessonStore();

  const hintsRevealed = revealedHints[exercise.id] ?? 0;

  function handleTestResult(result: boolean) {
    if (result) {
      setPassed(true);
      onPass?.();
    }
  }

  const difficultyColor =
    exercise.difficulty === "beginner"
      ? "bg-[#00b894]/15 text-[#00b894]"
      : exercise.difficulty === "intermediate"
      ? "bg-[#fdcb6e]/15 text-[#fdcb6e]"
      : "bg-[#ff6b6b]/15 text-[#ff6b6b]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-xl text-white">
            {exercise.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={difficultyColor}>
              {exercise.difficulty}
            </Badge>
            <span className="text-xs text-[#8888a0] font-mono">
              {exercise.points} pts
            </span>
            {passed && (
              <Badge className="bg-[#00b894]/15 text-[#00b894] border-0">
                Passed
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="prose-lecture max-w-none text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {exercise.instructions}
        </ReactMarkdown>
      </div>

      <PythonRunner
        initialCode={exerciseCode[exercise.id] ?? exercise.starterCode}
        testCode={exercise.testCode}
        onCodeChange={(code) => setExerciseCode(exercise.id, code)}
        onTestResult={handleTestResult}
        height="350px"
      />

      <div className="flex items-center gap-3">
        {exercise.hints.length > 0 && hintsRevealed < exercise.hints.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => revealNextHint(exercise.id)}
            className="border-[#2a2a3e] text-[#8888a0] hover:text-white hover:bg-[#1a1a2e]"
          >
            Reveal Hint ({hintsRevealed}/{exercise.hints.length})
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSolution(!showSolution)}
          className="border-[#2a2a3e] text-[#8888a0] hover:text-white hover:bg-[#1a1a2e]"
        >
          {showSolution ? "Hide Solution" : "Show Solution"}
        </Button>
      </div>

      {hintsRevealed > 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, hintsRevealed).map((hint, idx) => (
            <div
              key={idx}
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg p-3 text-sm text-[#c8c6c3]"
            >
              <span className="text-[#fdcb6e] font-mono text-xs mr-2">
                Hint {idx + 1}:
              </span>
              <LatexText text={hint} />
            </div>
          ))}
        </div>
      )}

      {showSolution && (
        <div>
          <p className="text-xs font-mono text-[#6c5ce7] uppercase tracking-wider mb-2">
            Solution
          </p>
          <CodeBlock code={exercise.solutionCode} language="python" />
        </div>
      )}
    </div>
  );
}
