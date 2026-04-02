"use client";

import { useState } from "react";
import type { GuidedProject } from "@/lib/content/loader";
import CodeBlock from "@/components/lesson/CodeBlock";

interface ProjectPageClientProps {
  project: GuidedProject;
  courseSlug: string;
}

export default function ProjectPageClient({
  project,
}: ProjectPageClientProps) {
  const [openMilestone, setOpenMilestone] = useState<string | null>(
    project.milestones?.[0]?.id || null
  );
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(
    new Set()
  );

  const milestones = project.milestones || [];
  // Support both tracks-based capstone projects and milestone-based projects
  const tracks = (project as unknown as Record<string, unknown>).tracks as
    | Array<{ id: string; title: string; description: string; milestones?: Array<{ id: string; title: string; week: number; description: string }> }>
    | undefined;

  function toggleMilestone(id: string) {
    setOpenMilestone((prev) => (prev === id ? null : id));
  }

  function markComplete(id: string) {
    setCompletedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-mono text-[#6c5ce7] tracking-wider uppercase">
          {project.id.replace("-", " ")} &middot; Weeks {project.weeks}
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mt-1 mb-2">
          {project.title}
        </h1>
        <p className="text-[#8888a0] leading-relaxed max-w-2xl">
          {project.description}
        </p>

        <div className="flex items-center gap-6 mt-4 text-sm font-mono text-[#555]">
          <span>{milestones.length || (tracks ? `${tracks.length} tracks` : 0)} {milestones.length ? "milestones" : ""}</span>
          <span>{project.totalPoints} total points</span>
          <span>
            {completedMilestones.size}/{milestones.length} completed
          </span>
        </div>
      </div>

      {project.rubric && (
        <div className="bg-[#12121a] border border-[#2a2a3e] rounded-lg p-5 mb-8">
          <h3 className="text-sm font-mono text-[#8888a0] uppercase tracking-wider mb-3">
            Grading Rubric
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(project.rubric).map(([category, weight]) => (
              <div key={category}>
                <span className="text-2xl font-mono text-[#6c5ce7]">
                  {weight as number}%
                </span>
                <p className="text-xs text-[#8888a0] capitalize mt-1">
                  {category.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl text-white">
            Milestones
          </h2>
          {milestones.map((milestone, idx) => {
            const isOpen = openMilestone === milestone.id;
            const isComplete = completedMilestones.has(milestone.id);

            return (
              <div
                key={milestone.id}
                className="border border-[#2a2a3e] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className="w-full flex items-center justify-between p-4 bg-[#12121a] hover:bg-[#1a1a2e] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markComplete(milestone.id);
                      }}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                        isComplete
                          ? "bg-[#00b894] border-[#00b894] text-white"
                          : "border-[#2a2a3e] hover:border-[#6c5ce7]"
                      }`}
                    >
                      {isComplete && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <div>
                      <span className="text-xs font-mono text-[#6c5ce7]">
                        Milestone {idx + 1} &middot; Week {milestone.week} &middot;{" "}
                        {milestone.points} pts
                      </span>
                      <h3 className="font-[family-name:var(--font-heading)] text-lg text-white">
                        {milestone.title}
                      </h3>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#8888a0] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-[#2a2a3e] bg-[#0e0e16] p-6 space-y-6">
                    <p className="text-[#c8c6c3] leading-relaxed">
                      {milestone.description}
                    </p>

                    {milestone.objectives && (
                      <div>
                        <h4 className="text-sm font-mono text-[#8888a0] uppercase tracking-wider mb-2">
                          Objectives
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-[#c8c6c3]">
                          {milestone.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {milestone.hints && milestone.hints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-mono text-[#fdcb6e] uppercase tracking-wider mb-2">
                          Hints
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-[#8888a0]">
                          {milestone.hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {milestone.starterCode && (
                      <div>
                        <h4 className="text-sm font-mono text-[#8888a0] uppercase tracking-wider mb-2">
                          Starter Code
                        </h4>
                        <CodeBlock code={milestone.starterCode} language="python" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tracks && (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl text-white">
            Choose a Track
          </h2>
          {tracks.map((track) => (
            <div
              key={track.id}
              className="border border-[#2a2a3e] rounded-lg bg-[#12121a] p-6"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-lg text-white mb-2">
                {track.title}
              </h3>
              <p className="text-sm text-[#8888a0] leading-relaxed mb-4">
                {track.description}
              </p>
              {track.milestones && (
                <div className="space-y-2">
                  {track.milestones.map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="font-mono text-[#6c5ce7] mt-0.5">
                        W{m.week}
                      </span>
                      <div>
                        <span className="text-white">{m.title}</span>
                        <p className="text-xs text-[#555] mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
