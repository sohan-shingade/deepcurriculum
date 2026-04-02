import { db } from ".";
import { eq, and, asc } from "drizzle-orm";
import {
  courses,
  weeks,
  lessons,
  lessonProgress,
  exerciseSubmissions,
  userProfiles,
} from "./schema";

export async function getCourseBySlug(slug: string) {
  const result = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getWeeksByCourse(courseId: string) {
  return db
    .select()
    .from(weeks)
    .where(eq(weeks.courseId, courseId))
    .orderBy(asc(weeks.weekNumber));
}

export async function getLessonsByWeek(weekId: string) {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.weekId, weekId))
    .orderBy(asc(lessons.orderIndex));
}

export async function getUserProfile(userId: string) {
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getLessonProgressForUser(userId: string) {
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}

export async function getLessonProgressForLesson(
  userId: string,
  lessonId: string
) {
  const result = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function upsertLessonProgress(data: {
  userId: string;
  lessonId: string;
  completed?: boolean;
  score?: number;
  timeSpentSeconds?: number;
}) {
  const existing = await getLessonProgressForLesson(data.userId, data.lessonId);

  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        completed: data.completed ?? existing.completed,
        score: data.score ?? existing.score,
        completedAt: data.completed ? new Date() : existing.completedAt,
        timeSpentSeconds:
          (existing.timeSpentSeconds ?? 0) + (data.timeSpentSeconds ?? 0),
      })
      .where(eq(lessonProgress.id, existing.id));
    return { ...existing, ...data };
  }

  const result = await db
    .insert(lessonProgress)
    .values({
      userId: data.userId,
      lessonId: data.lessonId,
      completed: data.completed ?? false,
      score: data.score,
      startedAt: new Date(),
      completedAt: data.completed ? new Date() : undefined,
      timeSpentSeconds: data.timeSpentSeconds ?? 0,
    })
    .returning();
  return result[0];
}

export async function saveExerciseSubmission(data: {
  userId: string;
  lessonId: string;
  exerciseIndex: number;
  code: string;
  passed: boolean;
  testResults?: unknown;
}) {
  const result = await db
    .insert(exerciseSubmissions)
    .values({
      userId: data.userId,
      lessonId: data.lessonId,
      exerciseIndex: data.exerciseIndex,
      code: data.code,
      passed: data.passed,
      testResults: data.testResults,
    })
    .returning();
  return result[0];
}

export async function getExerciseSubmissions(
  userId: string,
  lessonId: string
) {
  return db
    .select()
    .from(exerciseSubmissions)
    .where(
      and(
        eq(exerciseSubmissions.userId, userId),
        eq(exerciseSubmissions.lessonId, lessonId)
      )
    );
}

export async function updateUserXp(userId: string, xpToAdd: number) {
  const profile = await getUserProfile(userId);
  if (profile) {
    await db
      .update(userProfiles)
      .set({
        totalXp: (profile.totalXp ?? 0) + xpToAdd,
        lastActiveAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  }
}
