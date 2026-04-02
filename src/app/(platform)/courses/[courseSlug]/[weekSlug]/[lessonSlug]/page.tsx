import { getCourse, getLessonContent } from "@/lib/content/loader";
import Header from "@/components/layout/Header";
import LessonPageClient from "./LessonPageClient";

interface LessonPageProps {
  params: Promise<{
    courseSlug: string;
    weekSlug: string;
    lessonSlug: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, weekSlug, lessonSlug } = await params;
  const course = getCourse(courseSlug);

  const week = course.weeks.find((w) => w.slug === weekSlug);
  if (!week) {
    return <div className="p-8 text-[#ff6b6b]">Week not found</div>;
  }

  const lesson = week.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) {
    return <div className="p-8 text-[#ff6b6b]">Lesson not found</div>;
  }

  const content = getLessonContent(courseSlug, weekSlug, lessonSlug, lesson.type);

  // Compute nav links
  const allLessons: { weekSlug: string; slug: string; title: string }[] = [];
  for (const w of course.weeks) {
    for (const l of w.lessons) {
      allLessons.push({ weekSlug: w.slug, slug: l.slug, title: l.title });
    }
  }
  const currentIndex = allLessons.findIndex(
    (l) => l.weekSlug === weekSlug && l.slug === lessonSlug
  );
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div>
      <Header
        breadcrumbs={[
          { label: course.code, href: `/courses/${courseSlug}` },
          { label: `Week ${week.weekNumber}` },
          { label: lesson.title },
        ]}
        lessonType={lesson.type}
      />
      <div className="p-8 max-w-4xl mx-auto">
        <LessonPageClient
          content={content}
          lessonTitle={lesson.title}
          prevHref={
            prev
              ? `/courses/${courseSlug}/${prev.weekSlug}/${prev.slug}`
              : undefined
          }
          nextHref={
            next
              ? `/courses/${courseSlug}/${next.weekSlug}/${next.slug}`
              : undefined
          }
          prevLabel={prev?.title}
          nextLabel={next?.title}
        />
      </div>
    </div>
  );
}
