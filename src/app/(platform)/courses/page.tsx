import Link from "next/link";
import { getAllCourses } from "@/lib/content/loader";

export default function CoursesPage() {
  const courses = getAllCourses();

  return (
    <div className="min-h-screen">
      <header className="h-14 bg-[#0e0e16] border-b border-[#2a2a3e] flex items-center px-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#8888a0] hover:text-[#a29bfe] transition-colors"
        >
          &larr; Dashboard
        </Link>
      </header>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-2">
          Course Catalog
        </h1>
        <p className="text-[#8888a0] mb-8">
          Graduate-level courses taught interactively
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const totalLessons = course.weeks.reduce(
              (sum, w) => sum + w.lessons.length,
              0
            );

            return (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#6c5ce7]/50 transition-colors group"
              >
                <span className="text-xs font-mono text-[#6c5ce7] tracking-wider">
                  {course.code}
                </span>
                <h2 className="font-[family-name:var(--font-heading)] text-xl text-white mt-1 mb-2 group-hover:text-[#a29bfe] transition-colors">
                  {course.title}
                </h2>
                <p className="text-sm text-[#8888a0] leading-relaxed mb-4">
                  {course.description.length > 180
                    ? course.description.slice(0, 180) + "..."
                    : course.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-[#555]">
                  <span>{course.quarterLength} weeks</span>
                  <span>{totalLessons} lessons</span>
                  <span>
                    {course.weeks.reduce(
                      (sum, w) =>
                        sum +
                        w.lessons.filter((l) => l.type === "lecture").length,
                      0
                    )}{" "}
                    lectures
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
