# DeepCurriculum

**Live:** [coursecarl.vercel.app](https://coursecarl.vercel.app)

An interactive course platform delivering graduate-level CS courses with university depth. Dense lectures with LaTeX math, in-browser Python exercises via Pyodide, interactive simulations, and Mermaid diagrams -- all pre-generated at build time with zero runtime LLM calls.

## Courses

### CS 291: Production AI Engineering (10 weeks)
LLM fundamentals, RAG architectures, multi-agent systems, deployment, observability, and evaluation.

### CS 101: Fundamentals of Compute (20 weeks)
Computation from transistor physics to supercomputer architecture. Covers digital logic, processor design, memory hierarchies, GPU programming, FPGA-based high-frequency trading, and HPC.

- **40 lectures** (127,000+ words)
- **71 coding exercises** across 18 problem sets
- **18 quizzes** + midterm + final exam (35 questions)
- **6 guided projects** with milestones, starter code, and rubrics
- **149 Mermaid diagrams** inline in lectures
- **15 interactive simulations** (MOSFET, pipeline, cache, branch predictor, Tomasulo's, GPU warps, MESI coherence, order book, and more)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Database | Neon (Serverless Postgres) |
| ORM | Drizzle |
| Auth | Auth.js v5 |
| Code Editor | Monaco Editor |
| Python Execution | Pyodide (WASM) |
| Styling | Tailwind CSS + shadcn/ui |
| Math | KaTeX |
| Syntax Highlighting | Shiki |
| Diagrams | Mermaid.js |
| Simulations | React + SVG + Framer Motion |
| Content | MDX + JSON (static, versioned) |
| Deploy | Vercel |

## Architecture

```
Content (static, generated at dev time):
  src/content/courses/{course-slug}/
    course.json, week-01/ through week-N/
    Each week: lecture-01.mdx, lecture-02.mdx, concept-checks, problem-set.json, quiz.json, readings.json

Runtime (zero LLM calls):
  Load MDX/JSON -> Render with KaTeX + Shiki + Mermaid
  -> Monaco editor -> Pyodide runs Python in browser
  -> Tests validate locally -> Progress saved to Neon
```

## Interactive Simulations

15 PhET-style simulations embedded inline in lectures:

| Simulation | Concept |
|---|---|
| MOSFET | V_GS/V_DS sliders, animated electron channel, drain current |
| CMOS Inverter | PMOS/NMOS switching, voltage transfer curve |
| Logic Gates | Build NOT/AND/OR/XOR from NAND only |
| IEEE 754 | Clickable 32-bit float, toggle bits, special values |
| Half/Full Adder | Gate-level circuit with signal propagation |
| FSM | Traffic light state machine with input buttons |
| Pipeline | 5-stage with hazards, forwarding, stalls |
| Cache | Configurable cache, address decomposition, hit/miss |
| Branch Predictor | 2-bit saturating counter state machine |
| Memory Hierarchy | Latency pyramid with animated requests |
| Tomasulo | Reservation stations, CDB, cycle-by-cycle |
| GPU Warps | 32-thread warp, divergence, SIMT efficiency |
| Cache Coherence | 4-core MESI protocol with bus snooping |
| Order Book | Bid/ask ladder, auto-play market feed |
| Virtual Memory | TLB lookup, page table walk, address translation |

## Getting Started

```bash
pnpm install
cp .env.example .env.local  # Add your DATABASE_URL, NEXTAUTH_SECRET
pnpm dev
```

### Environment Variables

```
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm drizzle-kit push # Push schema to database
pnpm tsx scripts/seed-db.ts  # Seed courses from JSON
```

## License

MIT
