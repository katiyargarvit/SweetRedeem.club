-- ============================================================
-- Migration 010 -- IHG One Rewards
-- ============================================================
-- Adds IHG One Rewards to loyalty_programs and wires HDFC
-- Infinia + HDFC Diners Club Black at 1:1 ratio.
--
-- Transfer ratio: 1:1 (HDFC pts -> IHG points)
-- Confirmed from HDFC Bank transfer partner table, April 2026.
--
-- Run order:
--   schema.sql -> seed.sql -> 001 -> ... -> 009 -> 010
-- ============================================================

INSERT INTO loyalty_programs
  (id, name, full_name, type, currency_name, min_transfer_in, transfer_processing_days, website_url)
VALUES
('00000000-0000-0000-0002-000000000017',
 'IHG One Rewards',  'IHG One Rewards (InterContinental Hotels Group)',
 'hotel', 'Points', 2000, 5,
 'https://www.ihg.com/onerewards');

-- ── Transfer links ────────────────────────────────────────────────────────────
-- HDFC Infinia -> IHG One Rewards  1:1
INSERT INTO transfer_links
  (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days)
VALUES
('00000000-0000-0000-0003-000000000096', 'card',
 '00000000-0000-0000-0001-000000000001',
 '00000000-0000-0000-0002-000000000017',
 1, 1, 2000, 5),  -- HDFC Infinia 1:1

('00000000-0000-0000-0003-000000000097', 'card',
 '00000000-0000-0000-0001-000000000002',
 '00000000-0000-0000-0002-000000000017',
 1, 1, 2000, 5);  -- HDFC Diners Club Black 1:1

-- ── Redemption benchmarks ─────────────────────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000017', 'hotel_standard', 0.5000, NOW()),
('00000000-0000-0000-0002-000000000017', 'hotel_suite',    1.3000, NOW());
