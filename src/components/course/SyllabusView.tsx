"use client";

import { useState } from "react";
import WeekAccordion from "./WeekAccordion";
import ProgressBar from "./ProgressBar";

interface Lesson {
  slug: string;
  title: string;
  type: string;
  order: number;
  estimatedMinutes: number;
}

interface Week {
  weekNumber: number;
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface SyllabusViewProps {
  courseSlug: string;
  weeks: Week[];
  completedLessons?: Set<string>;
}

export default function SyllabusView({
  courseSlug,
  weeks,
  completedLessons = new Set(),
}: SyllabusViewProps) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));

  const totalLessons = weeks.reduce((sum, w) => sum + w.lessons.length, 0);
  const totalCompleted = weeks.reduce(
    (sum, w) =>
      sum + w.lessons.filter((l) => completedLessons.has(l.slug)).length,
    0
  );

  function toggleWeek(weekNumber: number) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono text-[#8888a0] uppercase tracking-wider">
            Course Progress
          </h3>
          <span className="text-sm font-mono text-[#8888a0]">
            {totalCompleted}/{totalLessons} lessons
          </span>
        </div>
        <ProgressBar value={totalCompleted} max={totalLessons} />
      </div>

      <div className="space-y-3">
        {weeks.map((week) => (
          <WeekAccordion
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            weekSlug={week.slug}
            title={week.title}
            description={week.description}
            lessons={week.lessons}
            courseSlug={courseSlug}
            isOpen={openWeeks.has(week.weekNumber)}
            onToggle={() => toggleWeek(week.weekNumber)}
            completedLessons={completedLessons}
          />
        ))}
      </div>
    </div>
  );
}
