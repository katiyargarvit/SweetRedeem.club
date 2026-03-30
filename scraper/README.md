# SweetRedeem Scraper

Finds award sweet spots and stages them as `status='pending'` in Supabase for Garvit to review and approve.

---

## First-time setup

```bash
cd scraper/
npm install
npx playwright install chromium   # Downloads headless Chromium for Flying Blue
```

`.env.local` is read from `../frontend/.env.local` — no separate env file needed.

---

## Running scrapers

```bash
# Run all 4 scrapers
npm run scrape

# Run individually
npm run scrape:flyingblue   # Monthly promos (~44 deals)
npm run scrape:krisflyer    # Zone-based award chart (9 sweet spots)
npm run scrape:hyatt        # Category award chart (16 spots)
npm run scrape:lfal         # Weekly RSS deal alerts
```

---

## After running

1. Open **Supabase Table Editor → sweet_spots**
2. Filter: `status = pending`
3. Review each row — verify the CPP makes sense
4. Change `status` to `live` to publish to the app
5. Change `status` to `approved` to park it (visible to you, not users)

---

## Scraper schedule

| Scraper    | When to run         | Why                                  |
|------------|---------------------|--------------------------------------|
| Flying Blue | 1st of each month  | New promos published every month     |
| KrisFlyer  | When SIA changes chart (~1-2× /year) | Rate devaluation check |
| Hyatt      | When Hyatt updates categories (~1× /year) | Category reassignments |
| LFAL RSS   | Weekly              | Transfer bonus and deal alerts       |

---

## Notes

- All inserts land at `status='pending'`. Existing `pending` rows for the program are deleted before each run to avoid duplicates. `approved` and `live` rows are never touched.
- CPP is auto-calculated by Supabase: `est_cash_value_inr / points_required`
- Flying Blue scraper launches headless Chromium (Angular SPA, no SSR)
- KrisFlyer tries to download the SIA PDF first; falls back to hardcoded rates if unavailable
- LFAL scraper estimates points/cash from article text — always review before approving
