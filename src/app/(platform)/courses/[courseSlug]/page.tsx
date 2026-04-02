import { getCourse, getProjects } from "@/lib/content/loader";
import SyllabusView from "@/components/course/SyllabusView";
import ProjectsSection from "@/components/course/ProjectsSection";
import Header from "@/components/layout/Header";

interface SyllabusPageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function SyllabusPage({ params }: SyllabusPageProps) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  const projects = getProjects(courseSlug);

  return (
    <div>
      <Header
        breadcrumbs={[
          { label: "Courses", href: "/courses" },
          { label: `${course.code}: ${course.title}` },
        ]}
      />
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-mono text-[#6c5ce7] tracking-wider">
            {course.code}
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mt-1 mb-2">
            {course.title}
          </h1>
          <p className="text-[#8888a0] leading-relaxed max-w-2xl">
            {course.description}
          </p>
        </div>

        {projects.length > 0 && (
          <ProjectsSection courseSlug={courseSlug} projects={projects} />
        )}

        <SyllabusView courseSlug={courseSlug} weeks={course.weeks} />
      </div>
    </div>
  );
}
