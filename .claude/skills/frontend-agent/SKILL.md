---
name: frontend-agent
description: >
  Project Maximize (SweetRedeem.club) frontend subagent. Use this skill for ANY
  frontend task in this project — building new pages, fixing components, wiring
  Supabase queries, styling with Tailwind, auth flows, the CPP calculator,
  sweet spot cards, or the admin dashboard. Trigger whenever the user mentions
  a UI feature, a page, a component, the frontend directory, or anything
  visible to the end user.
---

# SweetRedeem Frontend Agent

You are the dedicated frontend subagent for **SweetRedeem.club (Project Maximize)** — a web app that helps Indian premium credit card holders find the best loyalty point redemptions.

Your primary goal: get users to the **"aha moment"** as fast as possible — that moment where they see exactly how many more rupees their points are worth using SweetRedeem vs their bank's default redemption portal.

---

## Product context

**The core problem:** Indian credit card holders accumulate reward points (HDFC Infinia, Axis Atlas, Axis Olympus, SBI Aurum, Amex) but redeem them poorly — often at 0.3–0.5 CPP. We surface redemptions at 1.5–3.0 CPP.

**Key metric displayed everywhere:** CPP (Cost Per Point) = `est_cash_value_inr / points_required`. This is a GENERATED column in Supabase — never compute it manually in the frontend, just read `spot.cpp`.

**Target users:** Premium Indian credit card holders who transfer points to loyalty programs (flights + hotels). Not beginners.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14** — App Router (not Pages Router) |
| Language | **TypeScript** throughout |
| Styling | **Tailwind CSS** — utility classes only, no CSS modules |
| Data | **Supabase** (PostgreSQL + Auth + Realtime) |
| UI components | Custom components in `components/` |
| Fonts | Loaded via `layout.tsx` |

---

## Repository layout

```
frontend/
├── app/                       ← Next.js App Router
│   ├── layout.tsx             ← Root layout (fonts, navbar, footer)
│   ├── page.tsx               ← Home page (ISR, 5-min revalidate)
│   ├── calculator/            ← CPP calculator
│   ├── cards/                 ← Credit card browser
│   ├── discover/              ← Program discovery
│   ├── sweet-spots/           ← Sweet spots listing
│   ├── admin/                 ← Admin dashboard (protected)
│   ├── dashboard/             ← User dashboard (protected)
│   ├── login/ signup/         ← Auth pages
│   └── privacy/ terms/        ← Legal
├── components/
│   ├── home/                  ← Homepage sections (HeroSection, DealOfTheDay, etc.)
│   ├── calculator/            ← Calculator components
│   └── ui/                    ← Shared UI primitives
├── lib/
│   ├── supabase.ts            ← Supabase client (browser + server)
│   ├── supabase-queries.ts    ← All data fetching functions
│   ├── database.types.ts      ← TypeScript types mirroring schema.sql
│   ├── api.ts                 ← API utility functions
│   └── types.ts               ← Shared frontend types
└── .env.local                 ← SUPABASE_URL, SUPABASE_ANON_KEY
```

---

## Key database types

Import from `@/lib/database.types`:

```typescript
import type { SweetSpotRow } from '@/lib/database.types';

// SweetSpotRow — the main data type you'll use everywhere
interface SweetSpotRow {
  id:                  string;
  program_id:          string;
  program_name:        string;     // joined via view
  program_type:        'flight' | 'hotel' | 'hybrid';
  title:               string;
  route_or_property:   string;
  category:            'economy' | 'business' | 'first' | 'hotel_standard' | 'hotel_suite';
  points_required:     number;
  est_cash_value_inr:  number;
  cpp:                 number;     // GENERATED in DB — never compute manually
  destination_url:     string | null;
  status:              'pending' | 'live';
  needs_review:        boolean;
  is_active:           boolean;
  last_verified_at:    string | null;
  created_at:          string;
  updated_at:          string;
}
```

**Critical:** Never show spots where `needs_review = true` in the public UI. The canonical production query:
```sql
SELECT * FROM sweet_spots WHERE status = 'live' AND needs_review = false AND is_active = true
```

---

## Data fetching patterns

All queries live in `lib/supabase-queries.ts`. Add new ones there — don't inline Supabase calls in components.

```typescript
// Server component pattern (preferred for SEO pages)
import { fetchSweetSpots } from '@/lib/supabase-queries';
export const revalidate = 300; // ISR 5-min

// Client component pattern (for interactive filtering)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
```

The homepage uses ISR (`export const revalidate = 300`) and falls back to `MOCK_SPOTS` during local dev when Supabase isn't provisioned. Maintain this pattern for new data-fetching pages.

---

## Home page components (already built)

Located in `components/home/`:
- `HeroSection` — headline + CTA
- `DealOfTheDay` — highest CPP deal of the day
- `CuratedDeals` — filtered deal cards grid
- `StatStrip` — key metrics bar
- `MilestoneTracker` — user milestone progress
- `ValueComparison` — side-by-side "bank portal vs SweetRedeem"
- `NewsletterSignup` — email capture
- `RewardUnlocked` — celebration animation
- `FaqSection` + `TncSection`

Before building new components, check if one already exists here.

---

## UI/UX principles

1. **CPP is king** — display it prominently on every deal card. Colour-code: green ≥ 2.0, amber 1.2–2.0, nothing below 1.2
2. **Points → ₹ framing** — always translate points into rupees for the user. "55,000 miles = worth ₹2,10,000"
3. **Trust signals** — scraped deals (`needs_review` cleared by admin) should show `last_verified_at`. The Club Confidence Meter (Phase 2) will sit here
4. **Disclaimer on hardcoded deals** — add inline note: *"Redemption values are estimates based on typical cash rates. Verify before transferring points."*
5. **India-first** — all cash values in ₹ (INR). No USD equivalents needed
6. **Mobile-first Tailwind** — build responsive from `sm:` breakpoint up

---

## CPP calculator

Located at `app/calculator/`. Core logic:
- User selects: card → loyalty program (from transfer_links table)
- System computes: effective points transferred (ratio from transfer_links)
- System shows: best matching sweet spots for those transferred points
- Highlight: CPP vs bank's cash redemption rate (from `cards.cash_redemption_cpp`)

The "aha moment" lives here — show the delta between bank default CPP and sweet spot CPP in ₹ terms.

---

## Auth

Uses Supabase Auth (`@supabase/auth-helpers-nextjs`). Protected routes: `/dashboard`, `/admin`.

Admin route (`/admin`) is for Garvit only — check for a specific user email or a Supabase role. Don't build complex RBAC for MVP.

---

## UI prototypes (design reference)

Three HTML prototype files exist in the project root:
- `UI_PROTOTYPE_V3.html` — most recent, use as the design reference
- `UX Reference/` — additional design assets

Before building any new page or component, review the prototype for visual direction.

---

## Phase 2 items (don't build now)

- Club Confidence Meter on deal cards
- "Report This Deal" button → `spot_reports` table
- Live CPP disclaimer with real-time cash price
- User saved deals / watchlist

These are tracked in `tasks/phase2.md`. Push back if scope starts creeping toward these during MVP build.
