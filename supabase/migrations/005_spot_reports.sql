-- ============================================================
-- Migration 005: spot_reports table
-- SweetRedeem.club — April 2026
-- ============================================================
-- Run order: after 004_live_prices.sql
--
-- What this migration adds:
--   spot_reports — community deal-reporting table.
--   Users (and anon visitors) can flag a sweet spot as expired,
--   wrong price, or confirmed. Powers the Confidence Meter (Phase 4).
--
-- RLS notes:
--   • Anyone (incl. anon) can INSERT a report
--   • Users can SELECT only their own reports (auth.uid() = user_id)
--   • Anon reports (user_id IS NULL) are visible only to service-role
-- ============================================================

CREATE TABLE IF NOT EXISTS spot_reports (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sweet_spot_id  UUID        NOT NULL REFERENCES sweet_spots(id) ON DELETE CASCADE,
  user_id        UUID        REFERENCES auth.users(id),  -- nullable: allows anon reports
  report_type    VARCHAR     NOT NULL CHECK (report_type IN ('expired', 'wrong_price', 'confirmed')),
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE spot_reports IS
  'Community-sourced deal reports. Feeds the Confidence Meter on deal cards. '
  '"confirmed" reports raise confidence; "expired" / "wrong_price" lower it.';

COMMENT ON COLUMN spot_reports.user_id IS
  'NULL for anonymous reporters. Used to show users their own report history.';

COMMENT ON COLUMN spot_reports.report_type IS
  'expired = offer no longer available; wrong_price = price in listing is incorrect; '
  'confirmed = reporter successfully used this redemption.';

-- Index: aggregate reports per sweet spot (used by Confidence Meter)
CREATE INDEX IF NOT EXISTS idx_spot_reports_spot
  ON spot_reports(sweet_spot_id, report_type);

-- RLS
ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can submit a report
CREATE POLICY "Anyone can insert"
  ON spot_reports
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users can read their own reports
-- Anon reports (user_id IS NULL) are not selectable by users — admin only via service role
CREATE POLICY "Users see own reports"
  ON spot_reports
  FOR SELECT
  USING (auth.uid() = user_id);
