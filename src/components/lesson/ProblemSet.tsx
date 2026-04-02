"use client";

import { useLessonStore } from "@/store/lesson-store";
import CodeExercise from "./CodeExercise";
import { Badge } from "@/components/ui/badge";

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

interface ProblemSetProps {
  title: string;
  exercises: Exercise[];
}

export default function ProblemSet({ title, exercises }: ProblemSetProps) {
  const { activeTab, setActiveTab, completedExercises, markExerciseComplete } =
    useLessonStore();

  const activeIndex = parseInt(activeTab.replace("exercise-", ""), 10) || 0;
  const passedCount = exercises.filter((ex) =>
    completedExercises.has(ex.id)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white">
          {title}
        </h2>
        <Badge
          variant="outline"
          className={`font-mono ${
            passedCount === exercises.length
              ? "border-[#00b894] text-[#00b894]"
              : "border-[#2a2a3e] text-[#8888a0]"
          }`}
        >
          {passedCount}/{exercises.length} passed
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {exercises.map((ex, idx) => {
          const isComplete = completedExercises.has(ex.id);
          const isActive = idx === activeIndex;

          return (
            <button
              key={ex.id}
              onClick={() => setActiveTab(`exercise-${idx}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#6c5ce7]/20 border border-[#6c5ce7] text-white"
                  : "bg-[#12121a] border border-[#2a2a3e] text-[#8888a0] hover:border-[#3a3a4e]"
              }`}
            >
              {isComplete && (
                <span className="w-2 h-2 rounded-full bg-[#00b894]" />
              )}
              Ex {idx + 1}
            </button>
          );
        })}
      </div>

      {exercises[activeIndex] && (
        <CodeExercise
          exercise={exercises[activeIndex]}
          onPass={() => markExerciseComplete(exercises[activeIndex].id)}
        />
      )}
    </div>
  );
}
