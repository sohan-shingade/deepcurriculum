"use client";

import LectureRenderer from "@/components/lesson/LectureRenderer";
import ProblemSet from "@/components/lesson/ProblemSet";
import Quiz from "@/components/lesson/Quiz";
import LessonNav from "@/components/lesson/LessonNav";
import ReactMarkdown from "react-markdown";

interface LessonPageClientProps {
  content: Record<string, unknown>;
  lessonTitle: string;
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
}

export default function LessonPageClient({
  content,
  lessonTitle,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
}: LessonPageClientProps) {
  const type = content.type as string;

  return (
    <div>
      {type === "lecture" && (
        <>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-8">
            {(content.frontmatter as Record<string, unknown>)?.title as string || lessonTitle}
          </h1>
          <LectureRenderer
            content={content.content as string}
            conceptChecks={
              (content.conceptChecks as Array<{
                id: string;
                type: "multiple_choice" | "fill_code";
                question: string;
                options?: string[];
                correct?: number;
                explanation: string;
                starterCode?: string;
                solution?: string;
              }>) || []
            }
          />
        </>
      )}

      {type === "problem_set" && (
        <ProblemSet
          title={content.title as string}
          exercises={
            content.exercises as Array<{
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
            }>
          }
        />
      )}

      {(type === "quiz" || type === "midterm" || type === "final") && (
        <Quiz
          title={content.title as string}
          timeLimit={content.timeLimit as number}
          passingScore={content.passingScore as number}
          questions={
            content.questions as Array<{
              id: string;
              type: string;
              points: number;
              question: string;
              options?: string[];
              correct: number | string;
              explanation: string;
              code?: string;
            }>
          }
        />
      )}

      {type === "capstone" && (
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-8">
            {lessonTitle}
          </h1>
          <div className="prose-lecture max-w-none">
            <ReactMarkdown>
              {(content.description as string) ||
                JSON.stringify(content, null, 2)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <LessonNav
        prevHref={prevHref}
        nextHref={nextHref}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
      />
    </div>
  );
}
