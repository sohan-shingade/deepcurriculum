import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").unique().notNull(),
  displayName: text("display_name"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  totalXp: integer("total_xp").default(0),
  streakDays: integer("streak_days").default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  quarterLength: integer("quarter_length").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeks = pgTable(
  "weeks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .references(() => courses.id)
      .notNull(),
    slug: text("slug").notNull(),
    weekNumber: integer("week_number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
  },
  (table) => [uniqueIndex("weeks_course_slug_idx").on(table.courseId, table.slug)]
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekId: uuid("week_id")
      .references(() => weeks.id)
      .notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    orderIndex: integer("order_index").notNull(),
    contentPath: text("content_path").notNull(),
    estimatedMinutes: integer("estimated_minutes").default(30),
  },
  (table) => [uniqueIndex("lessons_week_slug_idx").on(table.weekId, table.slug)]
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id)
      .notNull(),
    completed: boolean("completed").default(false),
    score: integer("score"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
  },
  (table) => [
    uniqueIndex("lesson_progress_user_lesson_idx").on(
      table.userId,
      table.lessonId
    ),
  ]
);

export const exerciseSubmissions = pgTable("exercise_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id)
    .notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  code: text("code").notNull(),
  passed: boolean("passed").default(false),
  testResults: jsonb("test_results"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});
