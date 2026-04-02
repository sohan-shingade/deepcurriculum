import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

interface LessonMeta {
  slug: string;
  title: string;
  type: string;
  order: number;
  estimatedMinutes: number;
}

interface WeekMeta {
  weekNumber: number;
  slug: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
}

interface CourseMeta {
  slug: string;
  title: string;
  code: string;
  description: string;
  quarterLength: number;
  weeks: WeekMeta[];
}

async function seedCourse(courseData: CourseMeta) {
  // Upsert course
  const existingCourse = await db
    .select()
    .from(schema.courses)
    .where(eq(schema.courses.slug, courseData.slug))
    .limit(1);

  let courseId: string;

  if (existingCourse.length > 0) {
    courseId = existingCourse[0].id;
    await db
      .update(schema.courses)
      .set({
        title: courseData.title,
        code: courseData.code,
        description: courseData.description,
        quarterLength: courseData.quarterLength,
      })
      .where(eq(schema.courses.id, courseId));
    console.log(`  Updated course: ${courseData.code}`);
  } else {
    const result = await db
      .insert(schema.courses)
      .values({
        slug: courseData.slug,
        title: courseData.title,
        code: courseData.code,
        description: courseData.description,
        quarterLength: courseData.quarterLength,
      })
      .returning();
    courseId = result[0].id;
    console.log(`  Created course: ${courseData.code}`);
  }

  // Upsert weeks and lessons
  for (const weekData of courseData.weeks) {
    const existingWeek = await db
      .select()
      .from(schema.weeks)
      .where(eq(schema.weeks.slug, weekData.slug))
      .limit(1);

    let weekId: string;

    if (existingWeek.length > 0 && existingWeek[0].courseId === courseId) {
      weekId = existingWeek[0].id;
      await db
        .update(schema.weeks)
        .set({
          title: weekData.title,
          description: weekData.description,
          weekNumber: weekData.weekNumber,
        })
        .where(eq(schema.weeks.id, weekId));
      console.log(`  Updated week ${weekData.weekNumber}: ${weekData.title}`);
    } else {
      const result = await db
        .insert(schema.weeks)
        .values({
          courseId,
          slug: weekData.slug,
          weekNumber: weekData.weekNumber,
          title: weekData.title,
          description: weekData.description,
        })
        .returning();
      weekId = result[0].id;
      console.log(`  Created week ${weekData.weekNumber}: ${weekData.title}`);
    }

    for (const lessonData of weekData.lessons) {
      const contentPath = `${courseData.slug}/${weekData.slug}/${lessonData.slug}`;

      const existingLesson = await db
        .select()
        .from(schema.lessons)
        .where(eq(schema.lessons.slug, lessonData.slug))
        .limit(1);

      if (
        existingLesson.length > 0 &&
        existingLesson[0].weekId === weekId
      ) {
        await db
          .update(schema.lessons)
          .set({
            title: lessonData.title,
            type: lessonData.type,
            orderIndex: lessonData.order,
            contentPath,
            estimatedMinutes: lessonData.estimatedMinutes,
          })
          .where(eq(schema.lessons.id, existingLesson[0].id));
      } else {
        await db.insert(schema.lessons).values({
          weekId,
          slug: lessonData.slug,
          title: lessonData.title,
          type: lessonData.type,
          orderIndex: lessonData.order,
          contentPath,
          estimatedMinutes: lessonData.estimatedMinutes,
        });
      }
    }
    console.log(`    Seeded ${weekData.lessons.length} lessons`);
  }
}

async function seed() {
  console.log("Seeding database...\n");

  const coursesDir = path.join(process.cwd(), "src/content/courses");
  const entries = fs.readdirSync(coursesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const courseJsonPath = path.join(coursesDir, entry.name, "course.json");
    if (!fs.existsSync(courseJsonPath)) continue;

    const courseData: CourseMeta = JSON.parse(
      fs.readFileSync(courseJsonPath, "utf-8")
    );
    console.log(`Seeding ${courseData.code}: ${courseData.title}...`);
    await seedCourse(courseData);
    console.log("");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
