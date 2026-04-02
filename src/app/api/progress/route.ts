import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  upsertLessonProgress,
  saveExerciseSubmission,
  updateUserXp,
  getLessonProgressForLesson,
} from "@/lib/db/queries";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { lessonId, completed, score, submission } = body;

  if (!lessonId) {
    return NextResponse.json(
      { error: "lessonId required" },
      { status: 400 }
    );
  }

  // Handle exercise submission
  if (submission) {
    const sub = await saveExerciseSubmission({
      userId,
      lessonId,
      exerciseIndex: submission.exerciseIndex,
      code: submission.code,
      passed: submission.passed,
      testResults: submission.testResults,
    });

    // Award XP for passing exercise
    if (submission.passed) {
      const existing = await getLessonProgressForLesson(userId, lessonId);
      const isFirstPass = !existing?.completed;
      const xp = isFirstPass ? 150 : 100; // +50 first-try bonus
      await updateUserXp(userId, xp);
    }

    return NextResponse.json({ submission: sub });
  }

  // Handle lesson completion
  if (completed !== undefined) {
    const progress = await upsertLessonProgress({
      userId,
      lessonId,
      completed,
      score,
    });

    // Award XP based on lesson type
    if (completed) {
      const lessonRows = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      const lesson = lessonRows[0];

      if (lesson) {
        let xp = 0;
        switch (lesson.type) {
          case "lecture":
            xp = 50;
            break;
          case "problem_set":
            xp = 0; // XP awarded per exercise
            break;
          case "quiz":
            xp = (score ?? 0) * 2;
            break;
          case "midterm":
          case "final":
            xp = (score ?? 0) * 5;
            break;
        }
        if (xp > 0) {
          await updateUserXp(userId, xp);
        }
      }
    }

    return NextResponse.json({ progress });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
