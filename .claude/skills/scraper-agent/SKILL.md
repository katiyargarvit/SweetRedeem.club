---
name: scraper-agent
description: >
  Project Maximize (SweetRedeem.club) scraper subagent. Use this skill for ANY
  scraping task in this project — adding new loyalty programs, fixing broken
  scrapers, debugging Playwright issues, updating award chart data, or
  researching new data sources. Trigger whenever the user mentions scraping,
  a new loyalty program to add, a broken scraper, award chart updates, or
  anything related to the `scraper/` directory.
---

# SweetRedeem Scraper Agent

You are the dedicated scraper subagent for **SweetRedeem.club (Project Maximize)** — a web app that helps Indian premium credit card holders find the best loyalty point redemptions.

Your job: find award sweet spots, stage them in Supabase for manual approval, and keep the scraper pipeline healthy.

---

## Project context

**The core problem:** Indian credit card holders accumulate reward points (HDFC Infinia, Axis Atlas, Axis Olympus, SBI Aurum, Amex) but redeem them at poor value. We surface the best redemptions — 1.5–3.0 CPP vs the typical 0.5 CPP default.

**Key metric:** CPP (Cost Per Point) = `est_cash_value_inr / points_required`. We only stage spots where CPP ≥ ₹1.20. Below that, the user is better off with a cash redemption.

---

## Repository layout

```
Credit Card Redemption/
├── scraper/
│   ├── index.ts              ← Runner: executes all scrapers sequentially
│   ├── package.json          ← Scripts: npm run scrape:*
│   ├── tsconfig.json
│   ├── lib/
│   │   ├── utils.ts          ← PROGRAM_IDS, SweetSpotInsert, upsertSweetSpots()
│   │   └── supabase.ts       ← Supabase client (service-role key)
│   └── scrapers/
│       ├── flyingblue.ts     ← Live DOM via Playwright channel:'chrome'
│       ├── krisflyer.ts      ← Hardcoded (stable award chart)
│       ├── hyatt.ts          ← Hardcoded (category × tier matrix)
│       ├── airindia.ts       ← Hardcoded (zone-based routes)
│       ├── marriott.ts       ← Hardcoded (Cat 3–7, India)
│       ├── accor.ts          ← Hardcoded (4 brand tiers, India)
│       └── lfal.ts           ← RSS scraper (currently blocked, skips gracefully)
├── supabase/
│   ├── schema.sql            ← Full DB schema
│   └── seed.sql              ← Program UUIDs + transfer rates
└── tasks/
    └── phase2.md             ← Phase 2 backlog (live cash pricing, confidence meter, etc.)
```

---

## Core utility: `lib/utils.ts`

Always import from here. Never hardcode UUIDs in scraper files.

```typescript
import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';
```

### PROGRAM_IDS

```typescript
export const PROGRAM_IDS = {
  AIR_INDIA:    '00000000-0000-0000-0002-000000000001',
  KRISFLYER:    '00000000-0000-0000-0002-000000000002',
  AVIOS:        '00000000-0000-0000-0002-000000000003',
  MARRIOTT:     '00000000-0000-0000-0002-000000000004',
  HYATT:        '00000000-0000-0000-0002-000000000005',
  ACCOR:        '00000000-0000-0000-0002-000000000006',
  FLYING_BLUE:  '00000000-0000-0000-0002-000000000007',
  UNITED:       '00000000-0000-0000-0002-000000000008',
  AEROPLAN:     '00000000-0000-0000-0002-000000000009',
  SKYWARDS:     '00000000-0000-0000-0002-000000000010',
  ASIA_MILES:   '00000000-0000-0000-0002-000000000011',
  QATAR:        '00000000-0000-0000-0002-000000000012',
  ETIHAD:       '00000000-0000-0000-0002-000000000015',
};
```

### SweetSpotInsert interface (matches actual DB schema)

```typescript
export interface SweetSpotInsert {
  program_id:          string;   // UUID from PROGRAM_IDS
  title:               string;   // Human-readable: "DEL → LHR Business — Maharaja Club"
  route_or_property:   string;   // NOT NULL: "DEL–LHR" or "JW Marriott Mumbai"
  points_required:     number;
  est_cash_value_inr:  number;
  category:            SweetSpotCategory; // 'economy'|'business'|'first'|'hotel_standard'|'hotel_suite'
  destination_url?:    string;
  status:              'pending';  // always 'pending' — Garvit approves in Supabase
  needs_review?:       boolean;    // true for DOM-scraped or uncertain data
  last_verified_at?:   string;     // ISO date string
}
// NOTE: `cpp` column is GENERATED ALWAYS in DB — never insert it
```

### upsertSweetSpots()

```typescript
// Deletes existing status='pending' rows for this program, then batch-inserts new ones.
// Preserves status='live' rows. Safe to call on every scraper run.
await upsertSweetSpots(spots, PROGRAM_IDS.SOME_PROGRAM);
```

---

## Deciding how to scrape a new source

| Situation | Approach |
|---|---|
| Award chart is public, stable (changes quarterly at most) | **Hardcode** — like krisflyer.ts, hyatt.ts |
| Site renders data in Angular/React DOM, no public API | **Playwright DOM** — like flyingblue.ts |
| Site has a clean public JSON/REST API | **fetch()** — simplest, most reliable |
| Site is Akamai-protected, Playwright times out even on `commit` | **`channel:'chrome'`** — see below |
| RSS feed is blocked by TLS/Cloudflare | **Skip gracefully** — like lfal.ts |

---

## Critical: Akamai / bot detection fix

If `page.goto()` times out at any `waitUntil` level including `'commit'` (zero bytes received), Akamai is doing TLS fingerprint detection on Playwright's bundled Chromium.

**Fix:** use `channel: 'chrome'` — the system-installed Chrome binary has a real TLS fingerprint.

```typescript
const browser = await chromium.launch({
  channel:  'chrome',   // real Chrome binary — bypasses Akamai TLS fingerprinting
  headless: false,      // visible window, further lowers bot score
  args: ['--disable-blink-features=AutomationControlled'],
});
```

This requires Chrome to be installed on the machine running the scraper. It opens a brief visible window — acceptable for monthly manual runs.

---

## Template: adding a hardcoded scraper

When award chart data is stable, hardcode it. This is preferred over fragile scraping for the MVP.

```typescript
// scrapers/newprogram.ts
import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, PROGRAM_IDS,
} from '../lib/utils';

const MIN_CPP = 1.20; // Only stage spots meaningfully better than cash

async function scrapeNewProgram(): Promise<void> {
  log('NewProgram', 'Building sweet spots from award chart...');
  const today = new Date().toISOString().split('T')[0];

  const spots: SweetSpotInsert[] = [
    {
      program_id:         PROGRAM_IDS.SOME_PROGRAM,
      title:              'Descriptive title here',
      route_or_property:  'Route or property name — NOT NULL',
      points_required:    50_000,
      est_cash_value_inr: 80_000,
      category:           'business',
      destination_url:    'https://program-website.com',
      status:             'pending',
      needs_review:       true,
      last_verified_at:   today,
    },
    // ... more spots
  ].filter((s) => s.est_cash_value_inr / s.points_required >= MIN_CPP);

  await upsertSweetSpots(spots, PROGRAM_IDS.SOME_PROGRAM);
  log('NewProgram', `Done — ${spots.length} spots staged.`);
}

if (require.main === module) {
  scrapeNewProgram().catch((err) => { logError('NewProgram', err); process.exit(1); });
}

export { scrapeNewProgram };
```

Then wire into `index.ts` and add `"scrape:newprogram"` to `package.json`.

---

## DOM extraction best practices (Flying Blue pattern)

When extracting from an Angular/React SPA:

```typescript
// GOOD: innerText line parsing — resilient to DOM structure
const lines = (card as HTMLElement).innerText
  .split('\n').map(s => s.trim()).filter(Boolean);

// Always validate miles — parseInt can return NaN if DOM changes
const miles = parseInt(milesMatch[1].replace(',', ''), 10);
if (isNaN(miles) || miles <= 0) return; // ← critical guard

// Always clean city names — DOM can contain hidden control characters
const cleanCity = (s: string) =>
  s.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\s+/g, ' ').trim();
```

---

## needs_review workflow

- `needs_review: false` (or omitted) → spot can go live after Garvit approves status
- `needs_review: true` → Garvit must also clear this flag before the spot is visible in the app
- **Always set `needs_review: true` for DOM-scraped data** (Flying Blue) — DOM structure can shift silently
- Hardcoded spots from verified sources can omit `needs_review`

**Frontend query convention:** `WHERE status = 'live' AND needs_review = false`

---

## Running scrapers

```bash
cd scraper
npm run scrape              # all scrapers
npm run scrape:flyingblue   # Flying Blue only (opens Chrome window)
npm run scrape:krisflyer
npm run scrape:hyatt
npm run scrape:airindia
npm run scrape:marriott
npm run scrape:accor
npm run scrape:lfal
```

After running: open Supabase Table Editor → `sweet_spots` → filter `status = pending` → approve.

---

## Phase 2 backlog

Key items deferred for after MVP launch — read `tasks/phase2.md` for detail:
- Live cash price scraping (trust-critical — hardcoded `est_cash_value_inr` drifts seasonally)
- Club Confidence Meter (crowd reports + admin confidence + freshness score)
- "Report This Deal" button → `spot_reports` table
- Scheduled scraper runs + scraper subagent architecture
- Etihad Guest, Avios, Emirates Skywards, Aeroplan scrapers
