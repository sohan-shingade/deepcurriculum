"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Lesson {
  slug: string;
  title: string;
  type: string;
}

interface Week {
  weekNumber: number;
  slug: string;
  title: string;
  lessons: Lesson[];
}

interface SidebarProps {
  courseSlug: string;
  courseCode: string;
  weeks: Week[];
  completedLessons?: Set<string>;
  totalXp?: number;
}

const typeAbbrev: Record<string, string> = {
  lecture: "LEC",
  problem_set: "PS",
  quiz: "QUIZ",
  midterm: "MID",
  final: "FIN",
  capstone: "CAP",
};

export default function Sidebar({
  courseSlug,
  courseCode,
  weeks,
  completedLessons = new Set(),
  totalXp = 0,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const pathname = usePathname();

  if (collapsed) {
    return (
      <div className="w-12 bg-[#0e0e16] border-r border-[#2a2a3e] flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-[#8888a0] hover:text-white p-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#0e0e16] border-r border-[#2a2a3e] flex flex-col h-full">
      <div className="p-4 border-b border-[#2a2a3e] flex items-center justify-between">
        <Link
          href={`/courses/${courseSlug}`}
          className="font-[family-name:var(--font-heading)] text-lg text-white hover:text-[#a29bfe] transition-colors"
        >
          {courseCode}
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="text-[#8888a0] hover:text-white p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {weeks.map((week) => {
          const isExpanded = expandedWeek === week.weekNumber;
          const weekCompleted = week.lessons.every((l) =>
            completedLessons.has(l.slug)
          );

          return (
            <div key={week.weekNumber}>
              <button
                onClick={() =>
                  setExpandedWeek(isExpanded ? null : week.weekNumber)
                }
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#12121a] transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    weekCompleted ? "bg-[#00b894]" : "bg-[#2a2a3e]"
                  }`}
                />
                <span className="font-mono text-xs text-[#6c5ce7]">
                  W{week.weekNumber}
                </span>
                <span className="text-sm text-[#c8c6c3] truncate flex-1">
                  {week.title}
                </span>
                <svg
                  className={`w-3 h-3 text-[#555] transition-transform ${
                    isExpanded ? "rotate-180" : ""
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
              </button>

              {isExpanded && (
                <div className="ml-4 border-l border-[#2a2a3e]">
                  {week.lessons.map((lesson) => {
                    const lessonPath = `/courses/${courseSlug}/${week.slug}/${lesson.slug}`;
                    const isActive = pathname === lessonPath;
                    const isCompleted = completedLessons.has(lesson.slug);

                    return (
                      <Link
                        key={lesson.slug}
                        href={lessonPath}
                        className={`flex items-center gap-2 pl-4 pr-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[#6c5ce7]/10 text-white border-l-2 border-[#6c5ce7] -ml-px"
                            : isCompleted
                            ? "text-[#555] hover:text-[#8888a0]"
                            : "text-[#8888a0] hover:text-[#c8c6c3] hover:bg-[#12121a]"
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-60 w-8">
                          {typeAbbrev[lesson.type] ?? "?"}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#2a2a3e]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#8888a0]">XP</span>
          <span className="text-sm font-mono text-[#6c5ce7] font-bold">
            {totalXp.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
