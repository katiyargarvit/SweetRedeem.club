-- ============================================================
-- Migration 012: Reward Return views v2
-- SweetRedeem.club — April 2026
-- ============================================================
-- Run in Supabase SQL Editor AFTER 011_reward_return_views.sql
--
-- PostgreSQL cannot rename view columns via CREATE OR REPLACE VIEW.
-- We DROP both views first (dependency order: best_return first,
-- then returns), then recreate with the full column list including
-- program_name, program_type, destination_url.
-- ============================================================

-- Drop in dependency order (best_return depends on returns)
DROP VIEW IF EXISTS sweet_spot_best_return;
DROP VIEW IF EXISTS sweet_spot_returns;

CREATE VIEW sweet_spot_returns AS
SELECT
  ss.id                                                           AS sweet_spot_id,
  ss.title,
  ss.program_id,
  lp.name                                                         AS program_name,
  lp.type                                                         AS program_type,
  ss.route_or_property,
  ss.category,
  ss.points_required,
  ss.est_cash_value_inr,
  ss.cpp,
  ss.destination_url,
  ss.last_verified_at,
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
JOIN loyalty_programs lp ON lp.id = ss.program_id
JOIN transfer_links tl
  ON  tl.dest_id     = ss.program_id
  AND tl.source_type = 'card'
  AND tl.is_active   = TRUE
JOIN cards c
  ON  c.id        = tl.source_id
  AND c.is_active = TRUE
WHERE ss.is_active      = TRUE
  AND ss.status         = 'live'
  AND ss.needs_review   = FALSE;

COMMENT ON VIEW sweet_spot_returns IS
  'Reward Return % for every (sweet spot × card) pair reachable via transfer_links. '
  'Formula: base_earn_rate × (dest_qty/source_qty) × cpp. '
  'Includes program_name and program_type from loyalty_programs. '
  'NEVER compute reward_return_pct in frontend JS — always read from this view.';


CREATE VIEW sweet_spot_best_return AS
SELECT
  sweet_spot_id,
  title,
  program_id,
  program_name,
  program_type,
  route_or_property,
  category,
  points_required,
  est_cash_value_inr,
  cpp,
  destination_url,
  last_verified_at,
  MAX(reward_return_pct)                                                AS best_return_pct,
  (ARRAY_AGG(card_name ORDER BY reward_return_pct DESC NULLS LAST))[1] AS best_card_name,
  (ARRAY_AGG(card_slug ORDER BY reward_return_pct DESC NULLS LAST))[1] AS best_card_slug
FROM sweet_spot_returns
GROUP BY sweet_spot_id, title, program_id, program_name, program_type,
         route_or_property, category, points_required, est_cash_value_inr,
         cpp, destination_url, last_verified_at;

COMMENT ON VIEW sweet_spot_best_return IS
  'Per sweet spot: best_return_pct achievable across all linked cards, '
  'and which card achieves it. Full spot details included for the Discover feed. '
  'Used for guest/logged-out display. Logged-in users query sweet_spot_returns '
  'filtered to their own card IDs.';
