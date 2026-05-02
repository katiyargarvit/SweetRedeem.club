-- ============================================================
-- Migration 004: live_prices table
-- SweetRedeem.club — April 2026
-- ============================================================
-- Run order:
--   1. schema.sql
--   2. migrations/001_add_cash_redemption_cpp.sql
--   3. seed.sql
--   4. migrations/002_international_partners.sql
--   5. migrations/003_cpp_column_and_newsletter.sql
--   6. migrations/004_live_prices.sql  ← this file
--
-- What this migration adds:
--   live_prices — stores real-time T+30 / T+60 cash prices fetched by scrapers.
--   Enables "Live CPP" badge on Discover feed when a row is < 24h old.
--   Public read via RLS (no auth required to view prices).
-- ============================================================

CREATE TABLE IF NOT EXISTS live_prices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sweet_spot_id  UUID        NOT NULL REFERENCES sweet_spots(id) ON DELETE CASCADE,
  cash_price_inr NUMERIC     NOT NULL,
  search_date    DATE        NOT NULL,   -- T+30 or T+60 departure date
  fetched_at     TIMESTAMPTZ DEFAULT now(),
  source         VARCHAR     DEFAULT 'scraper'
);

COMMENT ON TABLE live_prices IS
  'Real-time cash prices fetched by scrapers (Air India daily, Marriott 2×/wk). '
  'A row < 24h old on a sweet spot triggers the "Live CPP" badge on the Discover feed.';

COMMENT ON COLUMN live_prices.search_date IS
  'Departure date searched — typically today+30 or today+60.';

COMMENT ON COLUMN live_prices.source IS
  'Scraper identifier, e.g. ''airindia'', ''marriott''.';

-- Index: latest price per sweet spot — the most common query pattern
CREATE INDEX IF NOT EXISTS idx_live_prices_spot
  ON live_prices(sweet_spot_id, fetched_at DESC);

-- RLS: anyone can read live prices (public data)
ALTER TABLE live_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON live_prices
  FOR SELECT
  USING (true);
