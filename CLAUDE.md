## Identity
You are building **SweetRedeem.club** (internal codename: Project Maximize) — India's first
credit card redemption value aggregator. We help premium Indian credit card holders find
loyalty point redemptions worth 1.5–3.0× more.

## Tech stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database:** Supabase PostgreSQL (hosted, ap-south-1)
- **Auth:** Supabase Magic Link (passwordless)
- **Scrapers:** TypeScript + Playwright (in scraper/ directory)
- **Backend:** Python FastAPI (not yet deployed — planned for Phase 2)
- **Hosting:** Vercel (frontend) + Supabase (DB/auth)

## Sub-agents
Route tasks to the correct agent:
- **Frontend agent** → UI, pages, components, Tailwind, Supabase client queries
- **Scraper agent** → new scrapers, fixing broken ones, Playwright, award charts
- **Data agent** → schema changes, migrations, seed data, transfer link math
- **Ops agent** → deployment, environment, cron jobs, monitoring, notifications

## What NOT to do
- Don't build Phase 2 features unless explicitly asked (scope creep)
- Don't modify schema.sql directly — always create numbered migrations
- Don't scrape behind login walls (legal risk) — public pages only
- Don't store API keys in code — use .env files only

## Workflow Orchestration
1. Plan Mode Default
Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
If something goes sideways, STOP and re-plan immediately
Use plan mode for verification steps, not just building
Write detailed specs upfront to reduce ambiguity
2. Subagent Strategy
Use subagents liberally to keep main context window clean
Offload research, exploration, and parallel analysis to subagents
For complex problems, throw more compute at it via subagents
One task per subagent for focused execution
3. Self-Improvement Loop
After ANY correction from the user: update tasks/lessons.md with the pattern
Write rules for yourself that prevent the same mistake
Ruthlessly iterate on these lessons until mistake rate drops
Review lessons at session start for relevant project
4. Verification Before Done
Never mark a task complete without proving it works
Diff behavior between main and your changes when relevant
Ask yourself: "Would a staff engineer approve this?"
Run tests, check logs, demonstrate correctness
5. Demand Elegance (Balanced)
For non-trivial changes: pause and ask "is there a more elegant way?"
If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
Skip this for simple, obvious fixes -- don't over-engineer
Challenge your own work before presenting it
6. Autonomous Bug Fixing
When given a bug report: just fix it. Don't ask for hand-holding
Point at logs, errors, failing tests -- then resolve them
Zero context switching required from the user
Go fix failing CI tests without being told how
Task Management
Plan First: Write plan to tasks/todo.md with checkable items
Verify Plan: Check in before starting implementation
Track Progress: Mark items complete as you go
Explain Changes: High-level summary at each step
Document Results: Add review section to tasks/todo.md
Capture Lessons: Update tasks/lessons.md after corrections
Core Principles
Simplicity First: Make every change as simple as possible. Impact minimal code.
No Laziness: Find root causes. No temporary fixes. Senior developer standards.
Minimal Impact: Only touch what's necessary. No side effects with new bugs.