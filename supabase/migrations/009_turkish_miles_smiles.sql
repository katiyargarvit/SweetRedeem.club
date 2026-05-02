-- ============================================================
-- Migration 009 -- Turkish Airlines Miles&Smiles
-- ============================================================
-- Adds Turkish Airlines Miles&Smiles to loyalty_programs and
-- wires HDFC Infinia + HDFC Diners Club Black transfer links.
--
-- Transfer ratio: 2:1 (HDFC pts -> Turkish miles)
-- Confirmed from HDFC Bank transfer partner table, April 2026.
--
-- Why Turkish is exceptional for Indian travellers:
--   Turkish's partner award chart (region-based) charges FAR fewer
--   miles than Aeroplan for the same Star Alliance routes.
--   India->Europe Business: 45,000 Turkish miles vs 65,000 Aeroplan.
--   Even at 2:1 HDFC ratio (90k HDFC pts), beats Aeroplan (130k pts).
--   India->Japan Business via ANA: 35,000 miles -- outstanding value.
--
-- Run order:
--   schema.sql -> seed.sql -> 001 -> ... -> 008 -> 009
-- ============================================================

INSERT INTO loyalty_programs
  (id, name, full_name, type, currency_name, min_transfer_in, transfer_processing_days, website_url)
VALUES
('00000000-0000-0000-0002-000000000016',
 'Miles&Smiles',  'Turkish Airlines Miles&Smiles',
 'flight', 'Miles', 1000, 5,
 'https://www.turkishairlines.com/en-in/miles-and-smiles/');

-- ── Transfer links ────────────────────────────────────────────────────────────
-- HDFC Infinia -> Turkish Airlines Miles&Smiles  2:1
INSERT INTO transfer_links
  (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days)
VALUES
('00000000-0000-0000-0003-000000000094', 'card',
 '00000000-0000-0000-0001-000000000001',
 '00000000-0000-0000-0002-000000000016',
 2, 1, 2000, 5),  -- HDFC Infinia 2:1

('00000000-0000-0000-0003-000000000095', 'card',
 '00000000-0000-0000-0001-000000000002',
 '00000000-0000-0000-0002-000000000016',
 2, 1, 2000, 5);  -- HDFC Diners Club Black 2:1

-- ── Redemption benchmarks ─────────────────────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000016', 'economy',  1.5000, NOW()),
('00000000-0000-0000-0002-000000000016', 'business', 4.0000, NOW()),
('00000000-0000-0000-0002-000000000016', 'first',    6.0000, NOW());
