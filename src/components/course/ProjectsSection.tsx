"use client";

import Link from "next/link";
import type { GuidedProject } from "@/lib/content/loader";

interface ProjectsSectionProps {
  courseSlug: string;
  projects: GuidedProject[];
}

export default function ProjectsSection({
  courseSlug,
  projects,
}: ProjectsSectionProps) {
  return (
    <div className="mb-10">
      <h2 className="font-[family-name:var(--font-heading)] text-xl text-white mb-1">
        Guided Projects
      </h2>
      <p className="text-sm text-[#8888a0] mb-4">
        Multi-week projects with milestones. Build real systems.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/courses/${courseSlug}/projects/${project.id}`}
            className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-5 hover:border-[#6c5ce7]/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#6c5ce7] tracking-wider uppercase">
                {project.id.replace("-", " ")}
              </span>
              <span className="text-xs font-mono text-[#555]">
                Weeks {project.weeks}
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-white group-hover:text-[#a29bfe] transition-colors mb-1">
              {project.title}
            </h3>
            <p className="text-sm text-[#8888a0] leading-relaxed mb-3 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#555]">
              <span>{project.milestones?.length || 0} milestones</span>
              <span>{project.totalPoints} pts</span>
              {project.rubric && (
                <span>
                  {Object.keys(project.rubric).length} rubric categories
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
