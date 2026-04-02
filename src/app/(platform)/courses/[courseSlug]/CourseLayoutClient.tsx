"use client";

import Sidebar from "@/components/layout/Sidebar";
import type { CourseMetadata } from "@/lib/content/loader";

interface CourseLayoutClientProps {
  course: CourseMetadata;
  children: React.ReactNode;
}

export default function CourseLayoutClient({
  course,
  children,
}: CourseLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        courseSlug={course.slug}
        courseCode={course.code}
        weeks={course.weeks.map((w) => ({
          weekNumber: w.weekNumber,
          slug: w.slug,
          title: w.title,
          lessons: w.lessons.map((l) => ({
            slug: l.slug,
            title: l.title,
            type: l.type,
          })),
        }))}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
