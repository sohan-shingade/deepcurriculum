"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Lesson {
  slug: string;
  title: string;
  type: string;
  order: number;
  estimatedMinutes: number;
}

interface WeekAccordionProps {
  weekNumber: number;
  weekSlug: string;
  title: string;
  description: string;
  lessons: Lesson[];
  courseSlug: string;
  isOpen: boolean;
  onToggle: () => void;
  completedLessons?: Set<string>;
}

const typeIcons: Record<string, string> = {
  lecture: "L",
  problem_set: "PS",
  quiz: "Q",
  midterm: "M",
  final: "F",
  capstone: "C",
};

const typeColors: Record<string, string> = {
  lecture: "text-[#a29bfe]",
  problem_set: "text-[#00b894]",
  quiz: "text-[#fdcb6e]",
  midterm: "text-[#ff6b6b]",
  final: "text-[#ff6b6b]",
  capstone: "text-[#6c5ce7]",
};

export default function WeekAccordion({
  weekNumber,
  weekSlug,
  title,
  description,
  lessons,
  courseSlug,
  isOpen,
  onToggle,
  completedLessons = new Set(),
}: WeekAccordionProps) {
  const completedCount = lessons.filter((l) =>
    completedLessons.has(l.slug)
  ).length;

  return (
    <div className="border border-[#2a2a3e] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-[#12121a] hover:bg-[#1a1a2e] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-[#6c5ce7] w-16">
            Week {weekNumber}
          </span>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-white">
              {title}
            </h3>
            <p className="text-xs text-[#8888a0] mt-0.5">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8888a0]">
            {completedCount}/{lessons.length}
          </span>
          <svg
            className={`w-4 h-4 text-[#8888a0] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#2a2a3e] bg-[#0e0e16]">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.has(lesson.slug);
            return (
              <Link
                key={lesson.slug}
                href={`/courses/${courseSlug}/${weekSlug}/${lesson.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#12121a] transition-colors border-b border-[#2a2a3e] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs w-6 ${
                      typeColors[lesson.type] ?? "text-[#8888a0]"
                    }`}
                  >
                    {typeIcons[lesson.type] ?? "?"}
                  </span>
                  <span
                    className={`text-sm ${
                      isCompleted ? "text-[#8888a0]" : "text-[#c8c6c3]"
                    }`}
                  >
                    {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lesson.estimatedMinutes > 0 && (
                    <span className="text-xs text-[#555] font-mono">
                      {lesson.estimatedMinutes}m
                    </span>
                  )}
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="border-[#00b894]/30 text-[#00b894] text-xs"
                    >
                      Done
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
