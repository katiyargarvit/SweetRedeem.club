-- ============================================================
-- Migration 008 — Etihad Guest loyalty program
-- ============================================================
-- Adds Etihad Guest to loyalty_programs so scrapers/etihad.ts
-- can stage sweet spots into sweet_spots.
--
-- Transfer links: NONE added here.
--   No Indian credit card has been confirmed as a direct
--   Etihad Guest transfer partner (verified April 2026).
--   Etihad Guest miles are primarily earned by flying Etihad
--   or via Etihad's own co-branded cards (not available in India).
--
--   ⚠️  If any Indian card adds Etihad as a future partner,
--   insert transfer_links here in migration 009+.
--
-- Run order:
--   schema.sql → seed.sql → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008
-- ============================================================

INSERT INTO loyalty_programs
  (id, name, full_name, type, currency_name, min_transfer_in, transfer_processing_days, website_url)
VALUES
('00000000-0000-0000-0002-000000000015',
 'Etihad Guest',  'Etihad Airways Etihad Guest',
 'flight', 'Guest Miles', 1000, 5,
 'https://www.etihad.com/en-in/etihad-guest');

-- ── Redemption benchmarks ─────────────────────────────────────────────────────
-- CPP estimates for India-origin travellers redeeming on Etihad metal.
-- Business to Europe/USA is the primary sweet spot (A380 on AUH routes).
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000015', 'economy',  0.7500, NOW()),
('00000000-0000-0000-0002-000000000015', 'business', 2.0000, NOW()),
('00000000-0000-0000-0002-000000000015', 'first',    3.5000, NOW());
