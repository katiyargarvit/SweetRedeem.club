-- ============================================================
-- Migration 013: Structured flight fields on sweet_spots
-- SweetRedeem.club — April 2026
-- ============================================================
-- Adds per-flight metadata so the frontend can filter by
-- origin/destination, show airline name, and badge stop count.
-- All columns are nullable — hotels leave them NULL.
--
-- Design decisions:
--   origin_iata / destination_iata — specific IATA codes for
--     point-to-point routes (Air India, Etihad).  NULL for
--     zone-based programs (KrisFlyer "India → Europe").
--   origin_region / destination_region — human region label.
--     Always set for flight spots; NULL for hotel spots.
--     Values: 'India', 'Southeast Asia', 'Europe', 'Middle East',
--             'North America', 'Australia / Pacific'
--   operating_airline — carrier name for display.  NULL for hotels.
--   stops — 0 = nonstop, 1 = 1-stop, etc.  NULL for hotels.
--   is_india_route — GENERATED; TRUE when either region = 'India'.
--     Powers the "India routes" filter on the Discover page.
-- ============================================================

ALTER TABLE sweet_spots
  ADD COLUMN IF NOT EXISTS origin_iata          CHAR(3),
  ADD COLUMN IF NOT EXISTS destination_iata     CHAR(3),
  ADD COLUMN IF NOT EXISTS origin_region        TEXT,
  ADD COLUMN IF NOT EXISTS destination_region   TEXT,
  ADD COLUMN IF NOT EXISTS operating_airline    TEXT,
  ADD COLUMN IF NOT EXISTS stops                SMALLINT CHECK (stops >= 0);

-- GENERATED column: TRUE when origin OR destination is India.
-- COALESCE handles hotels (both regions NULL → FALSE, not NULL).
ALTER TABLE sweet_spots
  ADD COLUMN IF NOT EXISTS is_india_route BOOLEAN GENERATED ALWAYS AS (
    COALESCE(origin_region = 'India', FALSE)
    OR COALESCE(destination_region = 'India', FALSE)
  ) STORED;

-- Index: fast filter for India-route feed
CREATE INDEX IF NOT EXISTS idx_sweet_spots_india
  ON sweet_spots(is_india_route)
  WHERE is_india_route = TRUE;

-- Index: origin/destination IATA lookups (point-to-point route pages)
CREATE INDEX IF NOT EXISTS idx_sweet_spots_origin_iata
  ON sweet_spots(origin_iata)
  WHERE origin_iata IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sweet_spots_dest_iata
  ON sweet_spots(destination_iata)
  WHERE destination_iata IS NOT NULL;
