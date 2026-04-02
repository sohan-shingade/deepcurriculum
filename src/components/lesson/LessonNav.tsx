"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LessonNavProps {
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
  onMarkComplete?: () => void;
  isComplete?: boolean;
  saving?: boolean;
}

export default function LessonNav({
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  onMarkComplete,
  isComplete,
  saving,
}: LessonNavProps) {
  return (
    <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#2a2a3e]">
      <div>
        {prevHref && (
          <Link href={prevHref}>
            <Button
              variant="outline"
              className="border-[#2a2a3e] text-[#8888a0] hover:text-white hover:bg-[#1a1a2e]"
            >
              &larr; {prevLabel || "Previous"}
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onMarkComplete && (
          <Button
            onClick={onMarkComplete}
            disabled={isComplete || saving}
            className={
              isComplete
                ? "bg-[#00b894]/20 text-[#00b894] border border-[#00b894]/30 cursor-default"
                : "bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white"
            }
          >
            {isComplete
              ? "Completed"
              : saving
              ? "Saving..."
              : "Mark Complete"}
          </Button>
        )}

        {nextHref && (
          <Link href={nextHref}>
            <Button className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white">
              {nextLabel || "Next"} &rarr;
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
