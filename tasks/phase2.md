# Phase 2 — Backlog

> Items deferred from scraper build (March 2026). Prioritise before frontend goes live.

---

## S1 — Live Cash Value Pricing (High Priority / Trust-Critical)

**Problem:** Hardcoded `est_cash_value_inr` values (e.g. Marriott Cat 7 peak = ₹75,000) are
seasonal averages. Cash rates in India swing wildly — wedding season (Nov–Feb) vs. monsoon
(Jul–Aug) can be 3× apart. A user who sees "₹75,000 cash value → 1.5 CPP" but finds the room
at ₹20,000 on the day they look will lose trust immediately.

**Tasks:**

- [ ] **Air India & Marriott — route/hotel price scraper**
  Build scrapers that pull live/near-live cash prices for top routes and properties rather than
  using static averages. For Air India: scrape lowest published economy + business fares on
  popular India routes (DEL-LHR, BOM-DXB, etc.) at T+30/T+60. For Marriott: pull rack rates
  for key India properties (JW Mumbai, St Regis, Westin Chennai etc.) at T+30.
  Update `est_cash_value_inr` dynamically on each scraper run.

- [ ] **Accor ALL — T+60/T+90 hotel price fetch**
  For each staged Accor property tier, fetch current cash rates at 60–90 days out (typical
  redemption planning horizon). Store as a rolling 30-day average to smooth noise.
  Flag spots where live CPP drops below ₹1.20 as stale.

- [ ] **Stale CPP alert in Supabase**
  Add a computed or updated column `cpp_last_checked_at`. If older than 30 days, admin
  dashboard should flag it. Prevents old CPP values from going stale quietly.

---

## S2 — UI Trust & Transparency Layer

**Problem:** Users need to understand that redemption values are estimates, not guarantees.
Without this, a single bad experience tanks trust.

**Tasks:**

- [ ] **Universal disclaimer on hardcoded sweet spots**
  Wherever `needs_review = false` but data is hardcoded (KrisFlyer, Hyatt, Air India,
  Marriott, Accor), show:
  > *"Redemption deals are dynamic and can change based on demand, availability, and peak
  > pricing. T&C of the respective loyalty program apply. Verify availability before
  > transferring points."*
  Style as a subtle inline note, not a scary modal.

- [ ] **"Report This Deal" button**
  Let users flag a sweet spot as inaccurate (wrong points cost, wrong cash value, no longer
  available). Writes to a `spot_reports` table: `spot_id`, `reported_by`, `reason` (enum:
  points_changed / cash_value_wrong / deal_expired / other), `notes`, `created_at`.
  Admin reviews in Supabase Table Editor.

- [ ] **Club Confidence Meter** *(Garvit's idea)*
  A visual indicator (e.g. 3-bar meter or percentage) on each sweet spot card showing how
  reliable the deal is. Score is computed from:
  - **Admin confidence** (set manually when approving spot, 1–5)
  - **Crowd reports** (each "report" docks confidence; reports resolved as false positives restore it)
  - **Freshness** (CPP verified < 7 days = full confidence, > 30 days = partial)
  Formula TBD — keep simple for MVP of this feature.
  Display as: "🟢 High", "🟡 Medium", "🔴 Verify before booking"

---

## S3 — Scraper Subagent Architecture

**Problem:** As scraper count grows (7 now, more coming), the main context window gets
cluttered. Scraping logic, scheduling, error handling, and new-source research should be
isolated.

**Tasks:**

- [ ] **Dedicated scraper subagent**
  Define a standalone Claude agent responsible for:
  - Running all scheduled scrapes (monthly for award charts, weekly for promos)
  - Handling new scraper requests end-to-end (research → code → test → stage)
  - Monitoring for scraper failures and suggesting fixes
  - Keeping `tasks/phase2.md` updated with newly discovered sources
  Design the agent's SKILL.md / system prompt so it understands the Supabase schema,
  the `upsertSweetSpots` pattern, and the CPP filter threshold.

- [ ] **Scheduled scraper runs**
  Set up a cron-style scheduled task (via Claude scheduled tasks or a simple GitHub Action):
  - 1st of every month: Flying Blue (promos refresh), LFAL
  - Quarterly: KrisFlyer, Air India, Hyatt, Marriott, Accor (award charts are stable)
  Flying Blue requires the local Chrome binary (`channel:'chrome'`), so it must run on
  Garvit's machine, not a CI server. Document this constraint clearly.

---

## Parking Lot (Evaluate Later)

- British Airways Avios — distance-based chart, good for short-haul Europe
- Emirates Skywards — popular with Indian cardholders, complex award chart
- Etihad Guest — already has UUID, straightforward to add
- Aeroplan (Air Canada) — useful for Star Alliance redemptions from India
- Dynamic CPP comparison: show user "your card transfers at X:1, so effective CPP is Y"
