# DeepCurriculum — Claude Code Superprompt

## Pre-Setup (Do This Before Pasting)

**1. Neon database** — Create free project at neon.tech, copy connection string.

**2. Create project folder:**
```
mkdir deepcurriculum && cd deepcurriculum
```

**3. Create .env.local:**
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASS@ep-YOUR-ID.us-east-2.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=PASTE_OUTPUT_OF_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
```

**4. Drop CLAUDE.md in the folder.**

**5. Paste everything below the line into Claude Code.**

---
---
---

Read CLAUDE.md thoroughly. It contains the full architecture, schema, stack, file formats, and quality standards for this project.

You are building DeepCurriculum: an interactive university course platform. The MVP has one full 10-week course (CS 291: Production AI Engineering) with 20 lectures, 9 problem sets, 10 quizzes, a midterm, a final, and a capstone spec.

**All course content is pre-generated at build time.** There are zero runtime LLM API calls. You will write every lecture, exercise, quiz, and exam as static MDX/JSON files.

**CRITICAL ARCHITECTURE DECISION: You must use subagents (subtasks) for content generation.** The course content is ~80,000+ words across 100+ files. You will hit context limits if you try to generate it all in one session. Instead:

1. **This main session** handles: project scaffold, database, auth, UI components, content loader, Pyodide engine, seed script, and orchestrating content generation.
2. **Dedicated subagent per week** handles: writing all content for that week (lectures, concept checks, problem set, quiz). Each subagent gets a fresh context window with detailed instructions and the exact file formats.

Execute the following steps in order.

---

## PHASE 1: SCAFFOLD (Main Session)

### Step 1: Initialize Project

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Install all dependencies from CLAUDE.md:
```bash
pnpm add @neondatabase/serverless drizzle-orm next-auth@beta @auth/drizzle-adapter @monaco-editor/react pyodide next-mdx-remote react-markdown remark-math remark-gfm rehype-katex rehype-highlight zustand zod bcryptjs
pnpm add -D drizzle-kit @types/bcryptjs
```

Set up:
- tailwind.config.ts: dark mode class strategy, extend colors (bg: #0a0a0f, surface: #12121a, accent: #6c5ce7, accentLight: #a29bfe, success: #00b894, warning: #fdcb6e, error: #ff6b6b)
- Google Fonts in layout.tsx: Instrument Serif, Source Serif 4, JetBrains Mono
- shadcn/ui init (new-york style, slate base, CSS variables)
- The full directory structure from CLAUDE.md
- drizzle.config.ts pointing to DATABASE_URL
- next.config.ts (no special MDX config needed since we use next-mdx-remote at runtime)

### Step 2: Database & Auth

Implement the full Drizzle schema from CLAUDE.md. Then:

- src/lib/db/index.ts: Neon serverless client + Drizzle instance
- src/lib/auth.ts: Auth.js v5 config with Drizzle adapter, CredentialsProvider (email + bcrypt password hash)
- src/app/api/auth/[...nextauth]/route.ts
- src/app/(auth)/login/page.tsx and signup/page.tsx: dark-themed forms
- Middleware: protect /dashboard and /courses/* (redirect to /login if unauthenticated)
- On signup: hash password with bcrypt, create user + userProfile row
- Generate and push migrations: `pnpm drizzle-kit generate && pnpm drizzle-kit push`

### Step 3: Content Loader

Build src/lib/content/loader.ts:

```typescript
// Read static content from src/content/ at server-side
export async function getCourse(slug: string): Promise<Course>
export async function getWeeks(courseSlug: string): Promise<Week[]>
export async function getLecture(courseSlug: string, weekSlug: string, lectureSlug: string): Promise<{ frontmatter: object, content: string }>
export async function getProblemSet(courseSlug: string, weekSlug: string): Promise<ProblemSet>
export async function getQuiz(courseSlug: string, weekSlug: string): Promise<Quiz>
export async function getConceptChecks(courseSlug: string, weekSlug: string, lectureNum: number): Promise<ConceptCheck[]>
```

Use Node fs (readFileSync/readFile) for JSON. Use gray-matter for MDX frontmatter parsing. Validate JSON files with Zod schemas matching the formats in CLAUDE.md.

### Step 4: Pyodide Code Execution Engine

Build:
- src/lib/pyodide/worker.ts: Web Worker that loads Pyodide, installs numpy/pandas via micropip, exposes execute(code) and runTests(studentCode, testCode) functions. 10 second timeout. Reset namespace between runs.
- src/lib/pyodide/engine.ts: Wrapper that creates/manages the worker, handles message passing.
- src/hooks/useCodeExecution.ts: React hook — { execute, runTests, output, testResults, isLoading, isReady }
- src/components/editor/CodeEditor.tsx: Monaco wrapper with dynamic import (ssr: false), Python language, dark theme
- src/components/editor/OutputPanel.tsx: stdout/stderr/test results display
- src/components/editor/PythonRunner.tsx: Combines CodeEditor + run/submit buttons + OutputPanel

### Step 5: UI Components

Build all components using the dark theme (bg #0a0a0f, surface #12121a, accent #6c5ce7). Use Instrument Serif for headings, Source Serif 4 for body, JetBrains Mono for code/monospace.

**Layout:**
- src/components/layout/Sidebar.tsx: collapsible, shows course weeks, lessons within expanded week, completion indicators, XP display at bottom
- src/components/layout/Header.tsx: breadcrumb (Course > Week N > Lesson), lesson type badge
- src/app/(platform)/layout.tsx: sidebar + header + main content area

**Course components:**
- src/components/course/SyllabusView.tsx: 10 week accordions, each expands to show lessons with completion state and lock icons
- src/components/course/WeekAccordion.tsx: single week with lesson list
- src/components/course/ProgressBar.tsx: animated progress bar

**Lesson components:**
- src/components/lesson/LectureRenderer.tsx: renders MDX string with react-markdown + remark-math + remark-gfm + rehype-katex + rehype-highlight. Must handle: headings, paragraphs, code blocks with syntax highlighting, inline/block LaTeX, blockquotes for key insights, and <ConceptCheck> markers (replace with interactive component)
- src/components/lesson/ConceptCheck.tsx: inline in lectures. Multiple choice or fill-in-code. Shows feedback + explanation on submit. Tracks completion.
- src/components/lesson/CodeExercise.tsx: single exercise view. Instructions (markdown) + Monaco editor with starter code + hints (progressive reveal) + Run button + Submit button + Output/TestResults panel + pass/fail indicator
- src/components/lesson/ProblemSet.tsx: multi-exercise view. Exercise selector (tabs or sidebar) + CodeExercise for active one + overall progress "3/5 passed"
- src/components/lesson/Quiz.tsx: timer, questions (MC radio, code-output MC, fill-code mini-editor), submit + grade + show explanations with score
- src/components/lesson/LessonNav.tsx: previous/next buttons + "Mark Complete" button

**Zustand store** (src/store/lesson-store.ts): activeTab, exercise code state, quiz answers, output history.

### Step 6: Pages

**Landing (/)**: Hero — "CS 291: Production AI Engineering", subtitle "A complete graduate-level course taught interactively", stats (10 weeks, 20 lectures, 35+ exercises), CTA buttons (Sign Up, View Syllabus). Dark, editorial feel.

**Dashboard (/dashboard)**: Course card with progress bar, XP count, streak counter, "Continue" button linking to next incomplete lesson.

**Syllabus (/courses/cs291-ai-engineering)**: Course header + SyllabusView. Shows all 10 weeks.

**Lesson (/courses/[courseSlug]/[weekSlug]/[lessonSlug])**: Dynamic page that renders based on lesson type:
- type "lecture" → LectureRenderer with ConceptChecks + LessonNav
- type "problem_set" → ProblemSet component
- type "quiz" / "midterm" / "final" → Quiz component
- type "capstone" → Markdown render of capstone spec

### Step 7: Progress API

POST /api/progress/route.ts: Save/update lesson progress, exercise submissions. Calculate and update XP:
- Complete lecture: +50 XP
- Pass exercise: +100 XP (+50 first-try bonus)
- Quiz: score * 2 XP
- Midterm/Final: score * 5 XP

Sequential unlock logic:
- Within a week: lectures in order → all lectures done unlocks problem set → 60%+ on problem set unlocks quiz
- Weeks unlock after completing previous week's quiz

### Step 8: Seed Script

Create scripts/seed-db.ts that reads src/content/courses/cs291-ai-engineering/course.json and upserts all courses, weeks, and lessons into Neon. Idempotent. Each lesson row gets a contentPath pointing to its file.

---

## PHASE 2: CONTENT GENERATION (Subagents)

Now generate all course content. **Use a separate subagent (subtask) for each week** to avoid hitting context limits. Each subagent gets a fresh context window dedicated to writing that week's content.

First, create the course.json metadata file, then spawn subagents for each week.

### Step 9: Create course.json

Create src/content/courses/cs291-ai-engineering/course.json with:

```json
{
  "slug": "cs291-ai-engineering",
  "title": "Production AI Engineering",
  "code": "CS 291",
  "description": "A comprehensive graduate-level course covering the end-to-end lifecycle of building production AI systems. From LLM fundamentals and RAG architectures to multi-agent systems, deployment, and observability — with rigorous mathematical foundations and hands-on coding throughout.",
  "quarterLength": 10,
  "weeks": [
    {
      "weekNumber": 1,
      "slug": "week-01",
      "title": "Foundations of LLM Systems",
      "description": "Transformer architecture, LLM capabilities and limitations, working with LLM APIs in production.",
      "lessons": [
        { "slug": "lecture-01", "title": "The LLM Landscape: Architecture, Capabilities, and Limitations", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Working with LLM APIs: Engineering for Production", "type": "lecture", "order": 2, "estimatedMinutes": 45 },
        { "slug": "problem-set", "title": "Problem Set 1: LLM Fundamentals", "type": "problem_set", "order": 3, "estimatedMinutes": 90 },
        { "slug": "quiz", "title": "Quiz 1: LLM Foundations", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 2,
      "slug": "week-02",
      "title": "Retrieval-Augmented Generation",
      "description": "RAG from first principles, embedding models, vector databases, failure modes, and evaluation.",
      "lessons": [
        { "slug": "lecture-01", "title": "RAG from First Principles", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "RAG Failure Modes and Evaluation", "type": "lecture", "order": 2, "estimatedMinutes": 45 },
        { "slug": "problem-set", "title": "Problem Set 2: Building RAG Systems", "type": "problem_set", "order": 3, "estimatedMinutes": 120 },
        { "slug": "quiz", "title": "Quiz 2: RAG Fundamentals", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 3,
      "slug": "week-03",
      "title": "Advanced Retrieval & Context Engineering",
      "description": "Chunking strategies, hybrid search, re-ranking, prompt engineering, and structured outputs.",
      "lessons": [
        { "slug": "lecture-01", "title": "Chunking, Hybrid Search, and Re-Ranking", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Context Engineering and Prompt Management", "type": "lecture", "order": 2, "estimatedMinutes": 45 },
        { "slug": "problem-set", "title": "Problem Set 3: Advanced Retrieval", "type": "problem_set", "order": 3, "estimatedMinutes": 120 },
        { "slug": "quiz", "title": "Quiz 3: Retrieval & Context Engineering", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 4,
      "slug": "week-04",
      "title": "Agents and Tool Use",
      "description": "Agent architecture, ReAct paradigm, tool integration, memory systems, and evaluation.",
      "lessons": [
        { "slug": "lecture-01", "title": "Agent Architecture: From ReAct to Production", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Tool Use, Memory, and Evaluation for Agents", "type": "lecture", "order": 2, "estimatedMinutes": 50 },
        { "slug": "problem-set", "title": "Problem Set 4: Building Agents", "type": "problem_set", "order": 3, "estimatedMinutes": 120 },
        { "slug": "quiz", "title": "Quiz 4: Agents & Tool Use", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 5,
      "slug": "week-05",
      "title": "Agentic RAG & Midterm",
      "description": "Self-RAG, corrective RAG, agentic RAG, MCP protocol, deep research agents. Midterm exam.",
      "lessons": [
        { "slug": "lecture-01", "title": "From Basic RAG to Agentic RAG", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Deep Research Agents", "type": "lecture", "order": 2, "estimatedMinutes": 45 },
        { "slug": "problem-set", "title": "Problem Set 5: Agentic RAG", "type": "problem_set", "order": 3, "estimatedMinutes": 90 },
        { "slug": "quiz", "title": "Quiz 5: Agentic RAG & MCP", "type": "quiz", "order": 4, "estimatedMinutes": 15 },
        { "slug": "midterm", "title": "Midterm Exam", "type": "midterm", "order": 5, "estimatedMinutes": 45 }
      ]
    },
    {
      "weekNumber": 6,
      "slug": "week-06",
      "title": "Multi-Agent Systems",
      "description": "Multi-agent architectures, coordination, A2A protocol, debugging and evaluation.",
      "lessons": [
        { "slug": "lecture-01", "title": "Multi-Agent Architectures", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Inter-Agent Communication, Synchronization, and Debugging", "type": "lecture", "order": 2, "estimatedMinutes": 50 },
        { "slug": "problem-set", "title": "Problem Set 6: Multi-Agent Systems", "type": "problem_set", "order": 3, "estimatedMinutes": 120 },
        { "slug": "quiz", "title": "Quiz 6: Multi-Agent Systems", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 7,
      "slug": "week-07",
      "title": "Deployment and Production Systems",
      "description": "Docker, FastAPI, Kubernetes, CI/CD with eval gates, performance, cost, and security.",
      "lessons": [
        { "slug": "lecture-01", "title": "Deploying AI Applications", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Performance, Cost, and Security", "type": "lecture", "order": 2, "estimatedMinutes": 45 },
        { "slug": "problem-set", "title": "Problem Set 7: Deployment & Security", "type": "problem_set", "order": 3, "estimatedMinutes": 120 },
        { "slug": "quiz", "title": "Quiz 7: Production Systems", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 8,
      "slug": "week-08",
      "title": "Observability and Evaluation (LLMOps)",
      "description": "AI observability, tracing, evaluation frameworks, RAGAS, continuous evaluation.",
      "lessons": [
        { "slug": "lecture-01", "title": "Observability for AI Systems", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "Systematic Evaluation", "type": "lecture", "order": 2, "estimatedMinutes": 50 },
        { "slug": "problem-set", "title": "Problem Set 8: LLMOps", "type": "problem_set", "order": 3, "estimatedMinutes": 90 },
        { "slug": "quiz", "title": "Quiz 8: Observability & Evaluation", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 9,
      "slug": "week-09",
      "title": "System Design and Case Studies",
      "description": "Real-world AI system architectures, system design framework, interview preparation.",
      "lessons": [
        { "slug": "lecture-01", "title": "Real-World AI System Case Studies", "type": "lecture", "order": 1, "estimatedMinutes": 50 },
        { "slug": "lecture-02", "title": "AI System Design Framework", "type": "lecture", "order": 2, "estimatedMinutes": 50 },
        { "slug": "problem-set", "title": "Problem Set 9: System Design", "type": "problem_set", "order": 3, "estimatedMinutes": 90 },
        { "slug": "quiz", "title": "Quiz 9: System Design", "type": "quiz", "order": 4, "estimatedMinutes": 20 }
      ]
    },
    {
      "weekNumber": 10,
      "slug": "week-10",
      "title": "Capstone and Final",
      "description": "Production readiness, future of AI engineering, capstone project, final exam.",
      "lessons": [
        { "slug": "lecture-01", "title": "Production Readiness and Engineering Excellence", "type": "lecture", "order": 1, "estimatedMinutes": 40 },
        { "slug": "lecture-02", "title": "The Future of AI Engineering", "type": "lecture", "order": 2, "estimatedMinutes": 35 },
        { "slug": "capstone", "title": "Capstone Project", "type": "capstone", "order": 3, "estimatedMinutes": 0 },
        { "slug": "final", "title": "Final Exam", "type": "final", "order": 4, "estimatedMinutes": 60 }
      ]
    }
  ]
}
```

### Step 10: Generate Content with Subagents

**For each week (1-10), spawn a dedicated subagent/subtask** with a fresh context window. Each subagent's job is ONLY to write the content files for that single week. This prevents context overflow.

Use this pattern for each subagent. Adapt the topic details per week as specified below.

**SUBAGENT DISPATCH PATTERN:**

For each week N, create a subtask with the following prompt structure. The subtask should write all files to the appropriate `src/content/courses/cs291-ai-engineering/week-{NN}/` directory.

---

#### WEEK 1 SUBAGENT PROMPT:

```
You are writing content for Week 1 of a graduate-level AI engineering course. Write ALL files listed below. This is a real university course — every lecture must be 2000-5000 words of dense, rigorous technical content with LaTeX math and runnable Python examples.

OUTPUT DIRECTORY: src/content/courses/cs291-ai-engineering/week-01/

=== FILE: lecture-01.mdx ===
Title: "The LLM Landscape: Architecture, Capabilities, and Limitations"
Content requirements:
- Transformer architecture recap with FULL math: Q,K,V matrices, scaled dot-product attention formula Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V, multi-head attention
- Pre-training objectives: next-token prediction, cross-entropy loss over vocabulary
- Scaling laws: Kaplan et al. (2020), Chinchilla optimal (Hoffmann et al. 2022)
- Tokenization: BPE algorithm step by step, SentencePiece
- Context windows: KV-cache mechanics, why context length matters
- Fundamental limitations: hallucination (why — probabilistic sampling from distribution), knowledge cutoff, reasoning failures (examples), stochastic nature
- Include 2-4 places for concept checks marked as <ConceptCheck id="cc-1" /> etc.
- All code examples must be complete runnable Python
- 3000-5000 words

=== FILE: lecture-02.mdx ===
Title: "Working with LLM APIs: Engineering for Production"
Content requirements:
- API design patterns: OpenAI, Anthropic, Google chat completion formats, system/user/assistant roles
- Token economics: input vs output pricing, how to count tokens, cost formulas per 1M tokens
- Rate limiting: exponential backoff with jitter (include Python implementation), circuit breaker pattern
- Streaming: SSE protocol explanation, async generator patterns
- Structured outputs: JSON mode, function calling / tool use, Pydantic integration
- Temperature and sampling: top-p, top-k — what they do to the probability distribution (include the math: sampling from softmax(logits / T))
- Latency optimization: prompt caching, batching, parallel calls
- Error handling patterns for production
- 2000-4000 words

=== FILE: concept-checks-01.json ===
3-4 concept checks for lecture 1. Format:
{"checks": [{"id": "cc-1", "type": "multiple_choice", "question": "...", "options": [...], "correct": N, "explanation": "..."}]}
Types: multiple_choice, fill_code (with starterCode + solution fields)
Questions must test genuine comprehension, not trivia.

=== FILE: concept-checks-02.json ===
3-4 concept checks for lecture 2. Same format.

=== FILE: problem-set.json ===
Title: "Problem Set 1: LLM Fundamentals"
3 exercises:
1. "Token Counter" — Implement a simplified BPE tokenizer that merges the most frequent byte pairs. Difficulty: intermediate. Include 6 test assertions.
2. "API Cost Estimator" — Build a function estimating monthly costs across 3 providers given usage patterns. Difficulty: beginner. Include 5 test assertions.
3. "Retry Engine" — Implement exponential backoff with jitter and a circuit breaker. Difficulty: intermediate. Include 6 test assertions.
Every exercise must have: id, title, points, difficulty, description, instructions, starterCode (complete with imports), solutionCode (complete working solution), testCode (assertions ending with print('All tests passed!')), hints (array of 2-3 strings).
All code must be runnable in Pyodide (use math, time, json, collections, dataclasses — NO external API calls).

=== FILE: quiz.json ===
Title: "Quiz 1: LLM Foundations"
10 questions, timeLimit: 20, passingScore: 70.
Mix: 7 multiple_choice, 2 code_output (show code, ask what it prints), 1 fill_code.
Every question: id, type, points (total 100), question, options, correct, explanation.
Explanations must teach the concept, not just state the answer.

=== FILE: readings.json ===
{"readings": [{"title": "Attention Is All You Need", "authors": "Vaswani et al. 2017", "url": "https://arxiv.org/abs/1706.03762", "note": "The original transformer paper"}, ...]}
Include 3-5 relevant papers/resources.
```

---

#### WEEK 2 SUBAGENT: RAG from First Principles + RAG Evaluation
- Lecture 1: RAG formulation P(answer|q,D), full pipeline, embedding models (CLS/mean pooling, InfoNCE loss, MTEB benchmarks), vector similarity metrics (cosine/dot/euclidean with geometric intuition), vector databases (HNSW algorithm with math, IVF-PQ), naive vs advanced vs modular RAG
- Lecture 2: 5 failure modes with examples, precision@k/recall@k/MRR/NDCG (full math), RAGAS framework, LLM-as-judge patterns, synthetic eval data generation, evals-first philosophy
- Problem Set (4 exercises): cosine similarity + mini vector store, BM25 from scratch, retrieval metrics implementation, complete naive RAG pipeline
- Quiz: 10 questions on RAG architecture, failure modes, metrics

#### WEEK 3 SUBAGENT: Advanced Retrieval & Context Engineering
- Lecture 1: Chunking strategies (fixed/recursive/semantic/structure-aware, chunk size vs precision/recall analysis), contextual embeddings (Anthropic approach), hybrid search (BM25 + dense), RRF formula, cross-encoder re-ranking (vs bi-encoder architecture), ColBERT, retrieve-then-rerank with latency budgets
- Lecture 2: Context window management, prompt design patterns (few-shot/CoT/self-consistency/ToT), lost-in-the-middle (Liu et al. 2023), prompt versioning, Pydantic structured outputs, data extraction, DSPy concepts
- Problem Set (4 exercises): 3 chunking strategies comparison, hybrid search with RRF, prompt template engine with versioning, structured invoice extractor
- Quiz: 10 questions

#### WEEK 4 SUBAGENT: Agents and Tool Use
- Lecture 1: Agent formal definition, ReAct (Yao et al. 2022), observe-think-act loops, planning strategies, architecture patterns (ReAct/plan-then-execute/LLM-compiler), failure modes, when NOT to use agents
- Lecture 2: Tool design (granularity/naming/typing), tool registry, parallel calling, security/sandboxing. Memory types (sensory/working/episodic/semantic), summarization, management. Evaluation (trajectory/outcome/efficiency), Reflexion pattern, eval harnesses
- Problem Set (4 exercises): ReAct agent from scratch, tool registry with dispatch, conversation memory with summarization, agent evaluation harness
- Quiz: 10 questions

#### WEEK 5 SUBAGENT: Agentic RAG + Midterm
- Lecture 1: Evolution basic→self→corrective→agentic RAG, query decomposition, adaptive retrieval, iterative retrieval, HITL patterns, fault tolerance (retry/circuit breaker/checkpoint), MCP protocol (hosts/clients/servers/resources/tools)
- Lecture 2: Deep research agent architecture (planner/searcher/reader/synthesizer), research planning, source selection, fact-checking, citation tracking, comparison to Perplexity/OpenAI, advanced HITL (active learning, preference learning)
- Problem Set (3 exercises): self-RAG with quality checking, HITL approval gates, mini research agent
- Quiz: 8 questions (lighter due to midterm)
- **midterm.json**: 18 questions, 45 minutes, comprehensive weeks 1-5. Mix of MC, code output, code completion, and 1-2 system design short-answer questions. Must test deep understanding, not memorization.

#### WEEK 6 SUBAGENT: Multi-Agent Systems
- Lecture 1: When/why MAS, architectures (hierarchical/peer-to-peer/pipeline/blackboard), decision framework, coordination overhead, task decomposition/delegation, coordinator pattern, anti-patterns
- Lecture 2: Shared state (blackboard/vector stores/queues), conflict resolution, consistency models, A2A protocol (Agent Cards/task lifecycle/messaging vs MCP), debugging (distributed tracing/replay/isolation), evaluation (task success/coordination efficiency/cost attribution)
- Problem Set (4 exercises): coordinator-worker system, shared blackboard, A2A Agent Cards + routing, multi-agent trace analyzer
- Quiz: 10 questions

#### WEEK 7 SUBAGENT: Deployment and Production
- Lecture 1: Deployment architectures (monolith vs microservices), Docker (multi-stage builds, layer caching), FastAPI patterns, Kubernetes basics, serverless, health checks, blue-green/canary, CI/CD with eval quality gates, prompt versioning in CI
- Lecture 2: Latency optimization (async/streaming/prompt compression/model routing), cost optimization (token budgets/semantic caching with similarity thresholds/hierarchical caching), security (prompt injection direct+indirect, OWASP LLM Top 10, defense-in-depth, trust boundaries)
- Problem Set (4 exercises): production Dockerfile, semantic cache, smart model router, prompt injection detector
- Quiz: 10 questions

#### WEEK 8 SUBAGENT: LLMOps
- Lecture 1: Why AI needs specialized observability, three pillars adapted (traces/metrics/logs), OpenTelemetry for AI, trace decorators, cost tracking, dashboards, anomaly detection
- Lecture 2: Evaluation as foundation, offline eval (test sets/synthetic data/BLEU/ROUGE limitations/reference-free/LLM-as-judge/RAGAS/human eval), online eval (A/B testing for AI/shadow mode/interleaving), continuous eval, eval as code in CI
- Problem Set (3 exercises): LLM call tracer, RAGAS-style metrics, eval pipeline
- Quiz: 10 questions

#### WEEK 9 SUBAGENT: System Design
- Lecture 1: Case studies with architecture analysis: GitHub Copilot, Cursor, Perplexity, ChatGPT tools/memory, enterprise support bots. For each: architecture, decisions, tradeoffs, scale numbers.
- Lecture 2: System design framework (requirements→components→data flow→API→storage→evaluation). Walk through 3 designs: RAG customer support, code review agent, content moderation pipeline. Full requirements→architecture→tradeoffs for each.
- Problem Set (2 exercises, free-form): RAG customer support architecture document, multi-agent code review pipeline design
- Quiz: 10 questions

#### WEEK 10 SUBAGENT: Capstone + Final
- Lecture 1: Production readiness checklist (testing/docs/monitoring/deployment), GitHub presentation best practices, what hiring managers look for
- Lecture 2: Future of AI engineering (model commoditization, agentic mainstream, multimodal, regulation), AI engineer career paths
- **capstone.json**: Full project spec with 4 options (Document Analyst, Code Review Agent, Research Assistant, Customer Support Bot), requirements, suggested architecture, grading rubric, stretch goals
- **final.json**: 22 questions, 60 minutes, comprehensive all weeks. Heavier on system design and integration. Same format as midterm but broader and deeper.
- No problem set for week 10 (students work on capstone)
- No weekly quiz (final replaces it)

---

### CONTENT QUALITY RULES (Include in every subagent prompt):

1. Lectures: 2000-5000 words of real technical content. Not outlines. Full paragraphs.
2. Math with LaTeX: $inline$ and $$block$$. Derive formulas, don't just state them.
3. Every code example: complete runnable Python with imports, type hints, realistic names.
4. Exercises: starter code + solution code + 4-8 test assertions + 2-3 progressive hints. All code runs in Pyodide (numpy, pandas, math, collections, json, dataclasses only — no external APIs).
5. Quiz explanations must teach the concept.
6. Concept checks: genuine comprehension checks, not trivia.
7. Cite papers by name: "Vaswani et al. (2017)" not "the attention paper".
8. Be opinionated on tradeoffs.
9. Difficulty builds: week 1 exercises are guided, week 9 assumes mastery of everything prior.
10. MDX frontmatter must include: title, week, lecture (number), estimatedMinutes.

---

## PHASE 3: VERIFICATION (Main Session)

After all 10 subagents complete:

### Step 11: Verify Content Completeness

Check that all expected files exist:
- 20 lecture MDX files (2 per week)
- 20 concept check JSON files (2 per week, except week 10)
- 9 problem set JSON files (weeks 1-9)
- 9 quiz JSON files (weeks 1-9, week 5 has lighter quiz)
- 1 midterm.json (week 5)
- 1 capstone.json (week 10)
- 1 final.json (week 10)
- 10 readings.json files

Verify each lecture MDX is substantial (> 2000 words, not placeholder).
Verify each problem set has exercises with starterCode, solutionCode, and testCode.
Verify each quiz has questions with explanations.

If any content is missing or placeholder, re-run the subagent for that week.

### Step 12: Seed Database

Run `pnpm tsx scripts/seed-db.ts` to populate Neon with course structure from course.json.

### Step 13: Final Build and Test

```bash
pnpm build
```

Verify:
- [ ] Build succeeds
- [ ] Auth works (signup/login/protected routes)
- [ ] Syllabus renders all 10 weeks
- [ ] Lecture pages render MDX with math (KaTeX) and syntax highlighting
- [ ] Concept checks work inline
- [ ] Code exercises: Monaco editor loads, Pyodide runs Python, tests validate
- [ ] Quizzes: render questions, grade on submit, show explanations
- [ ] Progress saves to database
- [ ] Sequential unlock logic works
- [ ] XP system tracks correctly
- [ ] Sidebar shows progress state
