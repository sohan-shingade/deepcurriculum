"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  lessonType?: string;
}

const typeBadgeStyles: Record<string, string> = {
  lecture: "bg-[#a29bfe]/15 text-[#a29bfe]",
  problem_set: "bg-[#00b894]/15 text-[#00b894]",
  quiz: "bg-[#fdcb6e]/15 text-[#fdcb6e]",
  midterm: "bg-[#ff6b6b]/15 text-[#ff6b6b]",
  final: "bg-[#ff6b6b]/15 text-[#ff6b6b]",
  capstone: "bg-[#6c5ce7]/15 text-[#6c5ce7]",
};

const typeLabels: Record<string, string> = {
  lecture: "Lecture",
  problem_set: "Problem Set",
  quiz: "Quiz",
  midterm: "Midterm Exam",
  final: "Final Exam",
  capstone: "Capstone",
};

export default function Header({ breadcrumbs = [], lessonType }: HeaderProps) {
  return (
    <header className="h-14 bg-[#0e0e16] border-b border-[#2a2a3e] flex items-center px-6">
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-[#555]">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-[#8888a0] hover:text-[#a29bfe] transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#c8c6c3]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {lessonType && (
        <Badge
          className={`ml-4 text-xs ${
            typeBadgeStyles[lessonType] ?? "bg-[#1a1a2e] text-[#8888a0]"
          }`}
        >
          {typeLabels[lessonType] ?? lessonType}
        </Badge>
      )}
    </header>
  );
}
