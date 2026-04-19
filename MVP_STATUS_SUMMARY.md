# Project Maximize (SweetRedeem.club) — MVP Status Summary
**Last updated:** April 14, 2026  
**Project Lead:** Garvit  
**Status:** Phase 1 MVP complete; Phase 2 features in backlog

---

## Quick Summary

**SweetRedeem.club** is a credit card redemption value aggregator for Indian users. The MVP showcases the highest-value award redemptions across 15 international loyalty programs (airlines + hotels), calculates redemption value in INR, and recommends the best transfers from 14 Indian credit cards.

**Current users:** Pre-launch beta (sign-up waitlist with magic link authentication)  
**Live features:** Home, Discover feed, CPP calculator, auth flows  
**Architecture:** Next.js frontend + Supabase backend + TypeScript scrapers

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14.2.3 with React 18
- **Styling:** Tailwind CSS 3.4.4
- **Database client:** @supabase/supabase-js 2.43.4
- **Language:** TypeScript 5
- **Auth:** Supabase Magic Link (passwordless, email-based)

### Backend
- **Database:** Supabase PostgreSQL (hosted)
- **Auth system:** Supabase Auth (managed)
- **Scrapers:** TypeScript + Playwright (for Flying Blue Chrome automation)
- **Admin server:** Python FastAPI (separate, not yet deployed)

### Scrapers (Production-Ready)
- **KrisFlyer** — Zone-based award chart parsing
- **Flying Blue** — Monthly promo scraping (Playwright headless browser)
- **Hyatt** — Category-based redemption rates
- **LFAL** — Weekly RSS feed alerts
- **Marriott, Air India, Accor** — Static award charts
- **SaveSage** — Point transaction upload parser (Excel)

---

## Supabase Schema — Key Tables

### Reference Data (Static, seeded manually)
| Table | Rows | Purpose |
|-------|------|---------|
| `cards` | 14 | Premium Indian credit cards (HDFC Infinia, ICICI Apex, etc.) |
| `loyalty_programs` | 15 | International programs (KrisFlyer, Marriott, Hyatt, etc.) |
| `transfer_links` | 40+ | Card→Program and Program→Program transfer ratios (2:1, 1:1, etc.) |

### Live Data (Scraper output + manual review)
| Table | Rows | Purpose |
|-------|------|---------|
| `sweet_spots` | ~100 | Curated high-value redemptions (the core product). Statuses: `pending` (scraped, awaiting review) → `approved` (reviewed, not public) → `live` (published to users) |
| `transfer_bonuses` | Variable | Limited-time bonus promotions (e.g., "25% extra miles on Air India transfer in May") |
| `redemption_benchmarks` | ~50 | Reference CPP values (cost per point in ₹) for each program/category |
| `scraped_signals` | Logs | Raw text from Reddit/blogs/crawls flagged by scrapers for manual review |

### User Data
| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created on signup via trigger; maps `auth.users` → display name |
| `user_cards` | Users' selected cards; denormalized cache of point balance |
| `point_transactions` | **Append-only ledger** of earned/redeemed/expired points; immutability enforced at DB level |
| `point_expirations` | Tracks upcoming point expirations for alert system (Phase 2) |

### Telemetry (Privacy-preserving)
| Table | Purpose |
|-------|---------|
| `anonymous_sessions` | Session ID from first visit; links to user_id on signup |
| `search_events` | What cards/programs users query (for trending insights) |
| `outbound_clicks` | Attribution: which sweet spot drove users to airline/hotel sites |

### Row-Level Security (RLS)
- **Public tables** (cards, programs, transfers, sweet_spots): Any user can read; no auth required
- **User tables** (profiles, user_cards, transactions, expirations): Users see only their own data
- **Newsletter**: Anon users can INSERT (waitlist), no UPDATE/DELETE

---

## Current Features (Live)

### Home Page (`/`)
- **Hero section** with value proposition ("Find the best credit card deals")
- **Milestone tracker** ("14 cards, 15 programs, 100+ sweet spots")
- **Featured deals carousel** (top 5 sweet spots from `sweet_spots` table)
- **FAQ** on credit card points, transfers, redemptions

### Discover Feed (`/discover`)
- **Deal cards** in a masonry grid, each showing:
  - Program name, logo, sweet spot title
  - Points required + estimated cash value in ₹
  - CPP (Cost Per Point) calculation: `cash_value / points`
  - "See details" link to sweet spot (Phase 2)
- **Data source:** Supabase `sweet_spots` table filtered by `status = 'live'` + `is_active = true`
- **Fallback:** 6 mock deals if Supabase is not configured (for dev UX)

### CPP Calculator (`/calculator`)
- **Input:** User selects a card from dropdown (15+ cards loaded from DB)
- **Output:** Ranked list of programs they can transfer to, sorted by CPP (highest first)
- **Logic:** Reads `cards`, `transfer_links`, `sweet_spots` tables; computes effective CPP for each route
- **Fully functional for anon users** — no signup required

### Authentication (`/login`, `/signup`)
- **Magic link flow:** User enters email → Supabase sends magic link → User clicks link → Session created
- **No passwords:** Sessionless, managed by Supabase Auth JWT
- **User table:** Auto-populated via trigger on `auth.users` INSERT

### Navigation
- Public pages: Home, Discover, Calculator, Login, Terms, Privacy
- Auth-protected: User profile (Phase 2), saved cards (Phase 2)

---

## Data Flow — How Scrapers → UI Works

```
1. Scraper runs (e.g., npm run scrape:krisflyer)
   ↓
2. Parses award chart → extracts sweet spots with:
   - program_id, title, points_required, est_cash_value_inr
   - calculated CPP = cash_value / points
   - status = 'pending', needs_review = true/false
   ↓
3. UPSERTS into sweet_spots table (deletes old pending rows, keeps approved/live)
   ↓
4. Garvit opens Supabase → views pending spots → manual review
   - Checks: are points/cash values realistic?
   - Verifies on airline/hotel website
   ↓
5. Garvit sets status = 'live' (or 'approved' to park)
   ↓
6. Frontend queries:
   SELECT * FROM sweet_spots WHERE status = 'live' AND is_active = true
   → Appears on /discover immediately
```

---

## Environment Setup

### Frontend `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Scraper (reads from frontend .env.local)
No separate env file; uses `../frontend/.env.local`

### Database schema init order (must be run once in SQL Editor)
1. `supabase/schema.sql` — all tables + RLS policies
2. `supabase/migrations/001_add_cash_redemption_cpp.sql` — CPP column
3. `supabase/seed.sql` — 14 cards + 15 programs + 40+ transfer links
4. `supabase/migrations/002_international_partners.sql` — partner program details
5. `supabase/migrations/003_cpp_column_and_newsletter.sql` — newsletter subscribers table

---

## Phase 2 Roadmap (Not Yet Started)

### S1 — Live Cash Value Pricing (High Priority)
**Problem:** Sweet spot cash values are seasonal averages; actual prices vary 3×  
**Solution:** Build scrapers for live Air India/Marriott/Accor pricing (T+30/T+60)
- [ ] Air India & Marriott price scrapers
- [ ] Accor hotel rate scraper
- [ ] Stale CPP detection in admin dashboard

### S2 — UI Trust & Transparency
**Problem:** Users may distrust single redemptions without confidence metrics
**Solution:** Add disclaimers, "Report Deal" button, Confidence Meter
- [ ] Universal disclaimer on hardcoded spots
- [ ] "Report This Deal" button → `spot_reports` table
- [ ] 3-bar Confidence Meter (admin confidence + crowd reports + freshness)

### S3 — Scraper Subagent Architecture
**Problem:** 7 scrapers → main context window clutter
**Solution:** Dedicated Claude agent for scraper maintenance + monthly cron runs
- [ ] Subagent SKILL.md design
- [ ] Scheduled runs (1st of month for Flying Blue, quarterly for award charts)

### Parking Lot
- British Airways Avios, Emirates Skywards, Etihad Guest, Aeroplan
- Dynamic CPP: show user "your card transfers at X:1, effective CPP is Y"

---

## Key Design Decisions

### 1. Append-Only Points Ledger
- `point_transactions` table has immutability enforced at DB level
- **Why:** Audit trail for regulatory compliance + fraud prevention
- **How:** Trigger prevents UPDATE/DELETE; corrections are new compensating rows

### 2. Denormalized Balance Cache
- `user_cards.cached_balance` duplicates ledger total
- **Why:** Fast read for UI; full audit trail preserved
- **Update trigger:** Every INSERT into `point_transactions` updates cache + `balance_as_of`

### 3. CPP as First-Class Metric
- `redemption_benchmarks` and `sweet_spots` tables both store estimated cash value in ₹
- Frontend calculates CPP = `cash_value / points`
- **Why:** CPP is the universal comparison metric; storing cash values allows flexibility

### 4. Status Workflow: pending → approved → live
- `pending`: Scraped, awaiting review
- `approved`: Reviewed (good data), but not shown to public
- `live`: Public; visible on /discover
- **Why:** Garvit can curate before launch; can park deals without deleting

### 5. Public Read, Anon Login
- Calculator works **without signup** (public tables, no auth required)
- Newsletter signup is public (INSERT-only, no UPDATE/DELETE)
- User data tables are RLS-protected (see only own rows)
- **Why:** Lowers friction; trust is built by organic discovery, not forced signup

### 6. Stateless Frontend + Webhook-Ready Backend
- No server state; Frontend communicates directly with Supabase
- Backend server (Python FastAPI) can be added later for async jobs (email alerts, cron scrapes)
- **Why:** Simplicity + Supabase handles scale; backend only when needed

---

## Known Limitations (MVP Scope)

1. **Cash values are seasonal averages** — not live. Phase 2 will fix with scrapers.
2. **No user-facing profile dashboard yet** — can save cards, view points, but no UI.
3. **No affiliate links** — sweet spot URLs are direct links; Phase 2 will add affiliate tracking.
4. **Limited program coverage** — 15 programs seeded; more can be added by extending scraper.
5. **No transfer recommendations engine yet** — calculator shows top CPP, no personalized paths.
6. **Single-hop transfers only** — direct card→program; Phase 2 multi-hop (card→program→program).

---

## File Structure

```
Credit Card Redemption/
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── page.tsx             # Home
│   │   ├── discover/            # Deal feed
│   │   ├── calculator/          # CPP calculator
│   │   ├── login/               # Magic link
│   │   ├── signup/              # Waitlist + signup
│   │   ├── cards/               # User card management (Phase 2)
│   │   └── ...
│   ├── lib/
│   │   ├── supabase-client.ts   # Supabase instance
│   │   ├── database.types.ts    # Auto-generated types
│   │   └── ...
│   ├── package.json
│   └── .env.local               # SUPABASE_URL, ANON_KEY
│
├── scraper/                     # Playwright + Node scrapers
│   ├── scrapers/
│   │   ├── krisflyer.ts
│   │   ├── flyingblue.ts
│   │   ├── hyatt.ts
│   │   ├── lfal.ts
│   │   ├── marriott.ts
│   │   ├── airindia.ts
│   │   ├── accor.ts
│   │   └── savesage.ts
│   ├── index.ts                 # Runner
│   └── package.json
│
├── backend/                     # Python FastAPI (not yet deployed)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/              # Data models
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   └── scheduler/           # Cron jobs
│   └── requirements.txt
│
├── supabase/
│   ├── schema.sql               # Tables + RLS
│   ├── seed.sql                 # 14 cards, 15 programs, transfer links
│   ├── migrations/
│   │   ├── 001_add_cash_redemption_cpp.sql
│   │   ├── 002_international_partners.sql
│   │   └── 003_cpp_column_and_newsletter.sql
│
├── tasks/
│   ├── phase2.md                # Backlog (Phase 2 features)
│   └── lessons.md               # (for self-improvement loop)
│
├── CLAUDE.md                    # Project rules (workflow, subagents, etc.)
├── SETUP.md                     # Local dev setup guide
└── MVP_STATUS_SUMMARY.md        # This file
```

---

## Running Locally (Quick Start)

1. **Clone & install frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev  # Opens http://localhost:3000
   ```

2. **Set up Supabase:**
   - Create free project at supabase.com
   - Run schema + migrations (SETUP.md step 2)
   - Fill `.env.local` with keys (SETUP.md step 4–5)

3. **Run scrapers:**
   ```bash
   cd scraper
   npm install
   npx playwright install chromium
   npm run scrape
   ```

4. **Review & publish sweet spots:**
   - Open Supabase Table Editor → `sweet_spots`
   - Filter `status = 'pending'`
   - Change to `status = 'live'` to publish

---

## Key Contacts

- **Project Lead:** Garvit (katiyargarvit@gmail.com)
- **Architecture:** Garvit + Claude Agent
- **Data Review:** Garvit (manual review before "live" publish)

---

## Success Metrics (Phase 1 MVP)

- [ ] 14 cards seeded + 15 programs + 40+ transfer links live
- [ ] 100+ sweet spots curated + live on /discover
- [ ] Calculator works for all card→program pairs
- [ ] 50+ users on waitlist email signup
- [ ] Home page + Discover + Calculator fully functional
- [ ] Auth (magic link) working
- [ ] All RLS policies enforcing public/private access

---

## Next Steps

1. **Launch Phase 1 MVP** — publish /discover publicly once sweet spots are curated
2. **Monitor outbound clicks** — track which deals drive conversions
3. **Collect user feedback** — "Report Deal" button (Phase 2)
4. **Plan Phase 2** — live pricing + confidence metrics + subagent architecture
