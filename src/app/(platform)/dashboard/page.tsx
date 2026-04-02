import Link from "next/link";
import { getAllCourses } from "@/lib/content/loader";
import ProgressBar from "@/components/course/ProgressBar";

export default function DashboardPage() {
  const courses = getAllCourses();

  return (
    <div className="min-h-screen">
      <header className="h-14 bg-[#0e0e16] border-b border-[#2a2a3e] flex items-center justify-between px-8">
        <span className="font-[family-name:var(--font-heading)] text-lg text-white">
          DeepCurriculum
        </span>
        <Link
          href="/courses"
          className="text-sm text-[#8888a0] hover:text-[#a29bfe] transition-colors"
        >
          All Courses
        </Link>
      </header>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mb-2">
          Dashboard
        </h1>
        <p className="text-[#8888a0] mb-8">Your learning progress</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-4 text-center">
            <div className="text-xl font-mono text-white">0</div>
            <div className="text-xs text-[#8888a0] font-mono mt-1">
              Day Streak
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-4 text-center">
            <div className="text-xl font-mono text-white">
              {courses.length}
            </div>
            <div className="text-xs text-[#8888a0] font-mono mt-1">
              Courses Available
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-4 text-center">
            <div className="text-2xl font-[family-name:var(--font-heading)] text-[#6c5ce7]">
              0
            </div>
            <div className="text-xs font-mono text-[#8888a0] mt-1">XP</div>
          </div>
        </div>

        <h2 className="font-[family-name:var(--font-heading)] text-xl text-white mb-4">
          Your Courses
        </h2>

        <div className="space-y-4">
          {courses.map((course) => {
            const totalLessons = course.weeks.reduce(
              (sum, w) => sum + w.lessons.length,
              0
            );
            const firstLesson = course.weeks[0]?.lessons[0];
            const continueHref = firstLesson
              ? `/courses/${course.slug}/${course.weeks[0].slug}/${firstLesson.slug}`
              : `/courses/${course.slug}`;

            return (
              <div
                key={course.slug}
                className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono text-[#6c5ce7] tracking-wider">
                      {course.code}
                    </span>
                    <h3 className="font-[family-name:var(--font-heading)] text-xl text-white mt-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#8888a0] mt-1 max-w-lg">
                      {course.description.length > 150
                        ? course.description.slice(0, 150) + "..."
                        : course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#555]">
                    <span>{course.quarterLength} wk</span>
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>

                <ProgressBar value={0} max={totalLessons} className="mb-4" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8888a0] font-mono">
                    0/{totalLessons} lessons completed
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="border border-[#2a2a3e] hover:border-[#3a3a4e] text-[#8888a0] hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Syllabus
                    </Link>
                    <Link
                      href={continueHref}
                      className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
