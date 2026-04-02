"use client";

import { useState, useCallback } from "react";

interface ProgressState {
  completed: boolean;
  score?: number;
}

export function useLessonProgress(lessonId: string) {
  const [progress, setProgress] = useState<ProgressState>({
    completed: false,
  });
  const [saving, setSaving] = useState(false);

  const markComplete = useCallback(
    async (score?: number) => {
      setSaving(true);
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            completed: true,
            score,
          }),
        });

        if (res.ok) {
          setProgress({ completed: true, score });
        }
      } finally {
        setSaving(false);
      }
    },
    [lessonId]
  );

  const saveSubmission = useCallback(
    async (data: {
      exerciseIndex: number;
      code: string;
      passed: boolean;
      testResults?: unknown;
    }) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            submission: data,
          }),
        });
      } catch {
        // silent fail for submissions
      }
    },
    [lessonId]
  );

  return { progress, markComplete, saveSubmission, saving };
}
