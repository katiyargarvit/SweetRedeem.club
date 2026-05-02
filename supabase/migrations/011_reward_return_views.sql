-- ============================================================
-- Migration 011: Reward Return % views
-- SweetRedeem.club — April 2026
-- ============================================================
-- No schema changes — base_earn_rate already on cards (schema.sql),
-- cpp already a STORED generated column on sweet_spots (migration 003).
--
-- Creates two read-only views so the frontend never computes
-- reward_return_pct in JavaScript.
--
-- Formula:
--   reward_return_pct = base_earn_rate × (dest_qty / source_qty) × cpp
--
--   base_earn_rate  — card points earned per ₹100 spent (cards.base_earn_rate)
--   dest_qty/source_qty — effective program points per card point (transfer_links)
--   cpp             — redemption value per program point in ₹ (sweet_spots.cpp)
--
-- Example: HDFC Infinia (3.33 pts/₹100) × 1:1 transfer × ₹1.80 CPP = 6.0%
-- ============================================================


-- ── View 1: one row per (sweet_spot × card) combination ──────────────────
-- Use this view for logged-in users to show their personal % Return
-- based on the cards they actually hold.

CREATE OR REPLACE VIEW sweet_spot_returns AS
SELECT
  ss.id                                                           AS sweet_spot_id,
  ss.title,
  ss.program_id,
  ss.cpp,
  c.id                                                            AS card_id,
  c.name                                                          AS card_name,
  c.slug                                                          AS card_slug,
  c.base_earn_rate,
  tl.dest_qty::NUMERIC / tl.source_qty::NUMERIC                  AS transfer_ratio,
  ROUND(
    c.base_earn_rate
    * (tl.dest_qty::NUMERIC / tl.source_qty::NUMERIC)
    * ss.cpp,
    2
  )                                                               AS reward_return_pct
FROM sweet_spots ss
JOIN transfer_links tl
  ON  tl.dest_id     = ss.program_id
  AND tl.source_type = 'card'
  AND tl.is_active   = TRUE
JOIN cards c
  ON  c.id        = tl.source_id
  AND c.is_active = TRUE
WHERE ss.is_active = TRUE
  AND ss.status   = 'live';

COMMENT ON VIEW sweet_spot_returns IS
  'Reward Return % for every (sweet spot × card) pair reachable via transfer_links. '
  'Formula: base_earn_rate × (dest_qty/source_qty) × cpp. '
  'NEVER compute reward_return_pct in frontend JS — always read from this view.';


-- ── View 2: best card per sweet spot (guest / logged-out display) ─────────
-- Use this view on the public Discover feed.
-- Shows the single highest % Return achievable for each sweet spot
-- and which card achieves it — so guests see "6.0% · Best with HDFC Infinia".

CREATE OR REPLACE VIEW sweet_spot_best_return AS
SELECT
  sweet_spot_id,
  title,
  program_id,
  cpp,
  MAX(reward_return_pct)                                                AS best_return_pct,
  (ARRAY_AGG(card_name ORDER BY reward_return_pct DESC NULLS LAST))[1] AS best_card_name,
  (ARRAY_AGG(card_slug ORDER BY reward_return_pct DESC NULLS LAST))[1] AS best_card_slug
FROM sweet_spot_returns
GROUP BY sweet_spot_id, title, program_id, cpp;

COMMENT ON VIEW sweet_spot_best_return IS
  'Per sweet spot: the highest reward_return_pct achievable across all linked cards, '
  'and which card achieves it. Used on the public Discover feed for guest users. '
  'Logged-in users with saved cards should query sweet_spot_returns filtered to their card IDs.';
