-- ============================================================
-- Migration 003: CPP generated column + newsletter_subscribers
-- SweetRedeem.club — March 2026
-- ============================================================
-- Run order:
--   1. schema.sql
--   2. migrations/001_add_cash_redemption_cpp.sql
--   3. seed.sql
--   4. migrations/002_international_partners.sql
--   5. migrations/003_cpp_column_and_newsletter.sql  ← this file
--
-- What this migration adds:
--   1. sweet_spots.cpp — stored generated column (est_cash_value_inr / points_required)
--      Allows the frontend to ORDER BY cpp without computing in app code.
--   2. newsletter_subscribers — email waitlist table for pre-launch sign-ups.
--      No auth required. Unique constraint prevents duplicates.
-- ============================================================


-- ============================================================
-- STEP 1 — Add cpp generated column to sweet_spots
-- ============================================================
-- NUMERIC GENERATED ALWAYS AS ... STORED is computed at write-time
-- and physically stored, so reads are free and the index is usable.
-- Formula: ₹ per source card point (est_cash_value_inr / points_required)

ALTER TABLE sweet_spots
    ADD COLUMN cpp NUMERIC(8,4)
    GENERATED ALWAYS AS (est_cash_value_inr / points_required) STORED;

COMMENT ON COLUMN sweet_spots.cpp IS
    'Effective CPP in INR: est_cash_value_inr ÷ points_required. '
    'Stored generated column — computed at INSERT/UPDATE time. '
    'Higher is better. Used to rank sweet spots in the Discover feed.';

-- Index to support ORDER BY cpp DESC efficiently
CREATE INDEX idx_sweet_spots_cpp ON sweet_spots(cpp DESC)
    WHERE status = 'live' AND is_active = TRUE;


-- ============================================================
-- STEP 2 — newsletter_subscribers table
-- ============================================================

CREATE TABLE newsletter_subscribers (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

COMMENT ON TABLE newsletter_subscribers IS
    'Pre-launch email waitlist. Populated via the homepage sign-up form '
    'and the /signup page. No Supabase Auth required — anon key can INSERT.';

-- RLS: anyone can subscribe (INSERT), nobody can read the list (no SELECT policy)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
    ON newsletter_subscribers
    FOR INSERT
    WITH CHECK (TRUE);

-- Note: no SELECT policy is intentional.
-- Only service-role key (used by admin scripts) can read the subscriber list.
