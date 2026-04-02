import { getCourse } from "@/lib/content/loader";
import CourseLayoutClient from "./CourseLayoutClient";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);

  return (
    <CourseLayoutClient course={course}>{children}</CourseLayoutClient>
  );
}
