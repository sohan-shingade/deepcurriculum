import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/courses");

export interface CourseMetadata {
  slug: string;
  title: string;
  code: string;
  description: string;
  quarterLength: number;
  weeks: WeekMetadata[];
}

export interface WeekMetadata {
  weekNumber: number;
  slug: string;
  title: string;
  description: string;
  lessons: LessonMetadata[];
}

export interface LessonMetadata {
  slug: string;
  title: string;
  type: string;
  order: number;
  estimatedMinutes: number;
}

export interface LectureFrontmatter {
  title: string;
  week: number;
  lecture: number;
  estimatedMinutes: number;
}

export interface ConceptCheck {
  id: string;
  type: "multiple_choice" | "fill_code";
  question: string;
  options?: string[];
  correct?: number;
  explanation: string;
  starterCode?: string;
  solution?: string;
}

export interface Exercise {
  id: string;
  title: string;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  testCode: string;
  hints: string[];
}

export interface ProblemSet {
  title: string;
  exercises: Exercise[];
}

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "code_output" | "fill_code";
  points: number;
  question: string;
  options?: string[];
  correct: number | string;
  explanation: string;
  code?: string;
  starterCode?: string;
  solution?: string;
}

export interface Quiz {
  title: string;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface Reading {
  title: string;
  authors: string;
  url: string;
  note: string;
}

export function getAllCourses(): CourseMetadata[] {
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const courses: CourseMetadata[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const courseJsonPath = path.join(CONTENT_DIR, entry.name, "course.json");
    if (fs.existsSync(courseJsonPath)) {
      const content = fs.readFileSync(courseJsonPath, "utf-8");
      courses.push(JSON.parse(content));
    }
  }
  return courses;
}

export function getCourse(slug: string): CourseMetadata {
  const filePath = path.join(CONTENT_DIR, slug, "course.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getWeeks(courseSlug: string): WeekMetadata[] {
  const course = getCourse(courseSlug);
  return course.weeks;
}

export function getLecture(
  courseSlug: string,
  weekSlug: string,
  lectureSlug: string
): { frontmatter: LectureFrontmatter; content: string } {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    `${lectureSlug}.mdx`
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as LectureFrontmatter,
    content,
  };
}

export function getProblemSet(
  courseSlug: string,
  weekSlug: string
): ProblemSet {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    "problem-set.json"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getQuiz(courseSlug: string, weekSlug: string): Quiz {
  const filePath = path.join(CONTENT_DIR, courseSlug, weekSlug, "quiz.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getMidterm(courseSlug: string, weekSlug: string): Quiz {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    "midterm.json"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getFinal(courseSlug: string, weekSlug: string): Quiz {
  const filePath = path.join(CONTENT_DIR, courseSlug, weekSlug, "final.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getCapstone(
  courseSlug: string,
  weekSlug: string
): Record<string, unknown> {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    "capstone.json"
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getConceptChecks(
  courseSlug: string,
  weekSlug: string,
  lectureNum: number
): ConceptCheck[] {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    `concept-checks-0${lectureNum}.json`
  );
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.checks || [];
  } catch {
    return [];
  }
}

export interface ProjectMilestone {
  id: string;
  title: string;
  week: number;
  points: number;
  description: string;
  objectives: string[];
  starterCode: string;
  solutionCode: string;
  testCode: string;
  hints: string[];
}

export interface GuidedProject {
  id: string;
  title: string;
  description: string;
  weeks: string;
  totalPoints: number;
  milestones: ProjectMilestone[];
  rubric: Record<string, number>;
}

export function getProjects(courseSlug: string): GuidedProject[] {
  const projectsDir = path.join(CONTENT_DIR, courseSlug, "projects");
  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    const projects: GuidedProject[] = [];
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".json")) {
        const content = fs.readFileSync(
          path.join(projectsDir, entry.name),
          "utf-8"
        );
        projects.push(JSON.parse(content));
      }
    }
    return projects.sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

export function getProject(
  courseSlug: string,
  projectId: string
): GuidedProject | null {
  const projects = getProjects(courseSlug);
  return projects.find((p) => p.id === projectId) || null;
}

export function getReadings(courseSlug: string, weekSlug: string): Reading[] {
  const filePath = path.join(
    CONTENT_DIR,
    courseSlug,
    weekSlug,
    "readings.json"
  );
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.readings || [];
  } catch {
    return [];
  }
}

export function getLessonContent(
  courseSlug: string,
  weekSlug: string,
  lessonSlug: string,
  lessonType: string
) {
  switch (lessonType) {
    case "lecture": {
      const lectureNum = parseInt(lessonSlug.replace("lecture-", ""), 10);
      const lecture = getLecture(courseSlug, weekSlug, lessonSlug);
      const conceptChecks = getConceptChecks(
        courseSlug,
        weekSlug,
        lectureNum
      );
      return { type: "lecture" as const, ...lecture, conceptChecks };
    }
    case "problem_set":
      return {
        type: "problem_set" as const,
        ...getProblemSet(courseSlug, weekSlug),
      };
    case "quiz":
      return { type: "quiz" as const, ...getQuiz(courseSlug, weekSlug) };
    case "midterm":
      return { type: "midterm" as const, ...getMidterm(courseSlug, weekSlug) };
    case "final":
      return { type: "final" as const, ...getFinal(courseSlug, weekSlug) };
    case "capstone":
      return {
        type: "capstone" as const,
        ...getCapstone(courseSlug, weekSlug),
      };
    default:
      throw new Error(`Unknown lesson type: ${lessonType}`);
  }
}
