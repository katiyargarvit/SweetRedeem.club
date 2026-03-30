# SweetRedeem.club — Setup Guide

Complete setup from zero to a running local dev environment with live Supabase data.

---

## Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account

---

## Step 1 — Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `sweetredeem-club` | Region: `ap-south-1` (Mumbai, lowest latency from India)
3. Generate a strong database password and save it somewhere safe
4. Wait ~2 minutes for provisioning

---

## Step 2 — Run the schema and migrations

In the Supabase dashboard, go to **SQL Editor** and run each file **in order**:

```
1. supabase/schema.sql
2. supabase/migrations/001_add_cash_redemption_cpp.sql
3. supabase/seed.sql
4. supabase/migrations/002_international_partners.sql
5. supabase/migrations/003_cpp_column_and_newsletter.sql
```

Each file is idempotent — if something fails, read the error, fix it, and re-run only that file.

> **After step 3 (seed.sql):** The `sweet_spots` table will be populated with status = `'approved'`.
> Run migration 003 before testing the app so the `cpp` column exists.
> Then manually update status to `'live'` for any spots you want to show publicly:
> ```sql
> UPDATE sweet_spots SET status = 'live' WHERE status = 'approved';
> ```

---

## Step 3 — Configure Supabase Auth

In the Supabase dashboard → **Authentication** → **Settings**:

1. **Site URL**: `http://localhost:3000` (dev) → change to your production domain before launch
2. **Redirect URLs**: Add `http://localhost:3000/**` and your production URL
3. **Email provider**: Enabled by default. No config needed for magic links.
4. **Confirm emails**: Set to **OFF** for magic links (users click the link = confirmed)

---

## Step 4 — Get your API keys

In the Supabase dashboard → **Project Settings** → **API**:

| Key | Where to find it |
|-----|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |

---

## Step 5 — Configure the frontend

```bash
cd "Credit Card Redemption/frontend"
cp .env.local.example .env.local
```

Open `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 6 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app renders with **mock data** even before Supabase is configured (no blank screens).
Once `.env.local` is filled in and the schema is applied, it switches to live data.

---

## Step 7 — Generate TypeScript types (optional but recommended)

Once the Supabase project is provisioned and migrations are applied:

```bash
npm install -g supabase
supabase gen types typescript --project-id your-project-id > frontend/lib/database.types.ts
```

This replaces the hand-written `database.types.ts` with an auto-generated, always-accurate version.

---

## Verifying the setup

After running the app, check these in order:

| Check | Where | Expected |
|-------|-------|----------|
| Home page loads | `/` | Hero, milestone, deals, FAQ all visible |
| Discover feed | `/discover` | Deal cards from Supabase (or 6 mocks) |
| Calculator | `/calculator` | Card tabs load from Supabase |
| Sign up | `/signup` | Magic link email arrives in inbox |
| Auth header | any page | "Sign out" appears after clicking magic link |

---

## Database table quick-reference

| Table | Purpose |
|-------|---------|
| `cards` | 14 premium Indian credit cards |
| `loyalty_programs` | 15 airline + hotel programmes (KrisFlyer, Aeroplan, etc.) |
| `transfer_links` | Card→Programme transfer ratios (directed graph) |
| `transfer_bonuses` | Limited-time bonus promotions (Phase 2) |
| `sweet_spots` | Curated high-value redemptions (the core product) |
| `newsletter_subscribers` | Pre-launch email waitlist |
| `profiles` | Auth user profiles (auto-created via trigger) |

---

## RLS policies summary

| Table | Anon can read | Anon can write |
|-------|--------------|----------------|
| `cards` | ✓ All active | ✗ |
| `loyalty_programs` | ✓ All active | ✗ |
| `transfer_links` | ✓ All active | ✗ |
| `sweet_spots` | ✓ status=live only | ✗ |
| `newsletter_subscribers` | ✗ | ✓ INSERT only |
| `profiles` | ✓ Own row only | ✓ Own row only |

---

## Troubleshooting

**"relation does not exist" errors** — run the schema + migrations in order (Step 2).

**Magic link not arriving** — check spam. In Supabase Auth settings, verify the Site URL matches where you're running the app.

**Sweet spots not showing** — check `status = 'live'` AND `is_active = true`. Run:
```sql
SELECT id, title, status, is_active FROM sweet_spots LIMIT 10;
```

**Calculator shows no partners** — `transfer_links` may be empty. Confirm the seed + migration 002 ran successfully:
```sql
SELECT COUNT(*) FROM transfer_links;  -- should be > 40
```
