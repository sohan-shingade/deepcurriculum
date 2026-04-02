import { getCourse, getProject } from "@/lib/content/loader";
import Header from "@/components/layout/Header";
import ProjectPageClient from "./ProjectPageClient";

interface ProjectPageProps {
  params: Promise<{ courseSlug: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { courseSlug, projectId } = await params;
  const course = getCourse(courseSlug);
  const project = getProject(courseSlug, projectId);

  if (!project) {
    return <div className="p-8 text-[#ff6b6b]">Project not found</div>;
  }

  return (
    <div>
      <Header
        breadcrumbs={[
          { label: course.code, href: `/courses/${courseSlug}` },
          { label: "Projects" },
          { label: project.title },
        ]}
      />
      <div className="p-8 max-w-4xl mx-auto">
        <ProjectPageClient project={project} courseSlug={courseSlug} />
      </div>
    </div>
  );
}
