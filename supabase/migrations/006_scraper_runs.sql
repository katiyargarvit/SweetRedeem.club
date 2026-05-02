-- ============================================================
-- Migration 006: scraper_runs audit log
-- SweetRedeem.club — April 2026
-- ============================================================
-- Run order: after 005_spot_reports.sql
--
-- What this migration adds:
--   scraper_runs — execution audit log for all scrapers.
--   Each scraper writes a row at start (status='running') and
--   updates it on completion with result stats.
--   Powers the Scraper Health tab in the Admin Panel (Phase 2).
--
-- RLS note:
--   No RLS needed — this is internal admin data only.
--   Scrapers write via service-role key; admin panel reads via service-role.
--   Anon / authenticated users have no access to this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS scraper_runs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_name    VARCHAR     NOT NULL,
  status          VARCHAR     NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  spots_found     INTEGER     DEFAULT 0,
  spots_upserted  INTEGER     DEFAULT 0,
  error_message   TEXT,
  duration_ms     INTEGER,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

COMMENT ON TABLE scraper_runs IS
  'Audit log for scraper executions. One row per run. '
  'Scrapers INSERT at start with status=''running'', UPDATE on completion. '
  'Admin panel Scraper Health tab queries latest row per scraper_name.';

COMMENT ON COLUMN scraper_runs.scraper_name IS
  'Logical scraper identifier, e.g. ''airindia'', ''marriott'', ''skywards''.';

COMMENT ON COLUMN scraper_runs.status IS
  'running = in progress; success = all spots fetched; '
  'partial = some routes/properties failed; failed = no data retrieved.';

COMMENT ON COLUMN scraper_runs.spots_found IS
  'Total sweet spot opportunities identified by the scraper.';

COMMENT ON COLUMN scraper_runs.spots_upserted IS
  'Rows actually written to sweet_spots (new inserts + updates).';

-- Index: latest run per scraper — the query pattern for Scraper Health tab
CREATE INDEX IF NOT EXISTS idx_scraper_runs_name
  ON scraper_runs(scraper_name, started_at DESC);
