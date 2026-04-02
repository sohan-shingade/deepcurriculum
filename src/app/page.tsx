import Link from "next/link";
import { getAllCourses } from "@/lib/content/loader";

export default function LandingPage() {
  const courses = getAllCourses();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#2a2a3e]/50">
        <span className="font-[family-name:var(--font-heading)] text-xl text-white">
          DeepCurriculum
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-[#8888a0] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Enroll Free
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-[#6c5ce7]/30 bg-[#6c5ce7]/10">
          <span className="text-xs font-mono text-[#a29bfe] tracking-wider">
            GRADUATE LEVEL &middot; INTERACTIVE
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl text-white leading-tight mb-6">
          Learn by Building.
          <br />
          <span className="text-[#a29bfe]">For Real.</span>
        </h1>

        <p className="text-lg text-[#8888a0] max-w-2xl mx-auto mb-10 leading-relaxed font-[family-name:var(--font-serif)]">
          Graduate-level courses taught interactively. Rigorous mathematical
          foundations, hands-on coding in the browser, and real production
          engineering — not toy examples.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Start Learning
          </Link>
          <Link
            href="/courses"
            className="border border-[#2a2a3e] hover:border-[#3a3a4e] text-[#c8c6c3] hover:text-white px-8 py-3 rounded-lg text-base transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "First Principles",
              description:
                "Every concept derived from scratch with full mathematical foundations. Real LaTeX, real derivations.",
            },
            {
              title: "Learn by Building",
              description:
                "Write and run Python in your browser. Every week has problem sets with real coding exercises validated by automated tests.",
            },
            {
              title: "Production Focus",
              description:
                "Not toy examples. Real deployment patterns, observability, security, cost optimization, and system design.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-6"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-lg text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#8888a0] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white mb-8 text-center">
          Available Courses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const totalLessons = course.weeks.reduce(
              (sum, w) => sum + w.lessons.length,
              0
            );
            const lectureCount = course.weeks.reduce(
              (sum, w) =>
                sum + w.lessons.filter((l) => l.type === "lecture").length,
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
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-white mt-1 mb-2 group-hover:text-[#a29bfe] transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-[#8888a0] leading-relaxed mb-4">
                  {course.description.length > 200
                    ? course.description.slice(0, 200) + "..."
                    : course.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-[#555]">
                  <span>{course.quarterLength} weeks</span>
                  <span>{lectureCount} lectures</span>
                  <span>{totalLessons} lessons</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-[#2a2a3e] py-8">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-xs text-[#555]">
            DeepCurriculum &middot; Built with Next.js, Pyodide, and a lot of
            rigor.
          </p>
        </div>
      </footer>
    </div>
  );
}
