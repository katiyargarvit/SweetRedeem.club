-- ============================================================
-- Migration 002: International Partners Expansion
-- Project Maximize — March 2026
-- ============================================================
-- Run order:
--   1. schema.sql
--   2. migrations/001_add_cash_redemption_cpp.sql
--   3. seed.sql
--   4. migrations/002_international_partners.sql  ← this file
--
-- What this migration adds:
--   1. Etihad Guest as a new loyalty program (#15) + benchmarks
--   2. ~33 missing transfer links across Axis and HSBC cards
--      (Flying Blue/Aeroplan/United/Avios/Qatar/Etihad gaps)
--   3. First program→program link: Avios → Qatar Privilege Club (1:1)
--      Seeds the Phase 2 multi-hop chain for the Amex MR → Avios → Qsuites
--      bypass strategy (avoids Amex's terrible 3:1 direct Qatar rate)
--   4. New international sweet spots (3 curated deals)
--
-- ⚠️  VERIFY before launch:
--   All Axis and HSBC transfer ratios in this file are directionally correct
--   based on Garvit's review (March 2026). Re-verify against live bank portals
--   before launch — loyalty programs devalue without notice.
--
-- AXIS TRANSFER GROUPINGS (informational — NOT enforced in Phase 1 calculator):
--   Group A (KrisFlyer, Aeroplan, United, Marriott, Qatar):  30,000 EDGE Miles/year
--   Group B (Air India, Flying Blue, Etihad, Accor, others): 1,20,000 EDGE Miles/year
-- ============================================================


-- ============================================================
-- STEP 1 — ETIHAD GUEST (new loyalty program #15)
-- ============================================================
-- Etihad Guest is NEW to our dataset. Transfer partners:
--   Axis Atlas 1:2, Axis Olympus 1:4, Axis Magnus Burgundy 5:4,
--   Axis Magnus Standard 5:2, Axis Reserve 5:2, HSBC 1:1
-- Note: HDFC Infinia does NOT transfer to Etihad Guest (not a partner).
-- Best sweet spot: AUH Business Class to Europe or Australia.

INSERT INTO loyalty_programs (id, name, full_name, type, currency_name, min_transfer_in, transfer_processing_days, website_url) VALUES
('00000000-0000-0000-0002-000000000015',
 'Etihad Guest',  'Etihad Airways Etihad Guest',
 'flight', 'Miles', 1000, 5,
 'https://www.etihad.com/en/etihad-guest');


-- ============================================================
-- STEP 2 — ETIHAD GUEST REDEMPTION BENCHMARKS
-- ============================================================
-- Economy: BOM→AUH on Etihad is ~15k miles; cash ~₹12k → ~₹0.80/mile
-- Business: AUH→LHR or AUH→SYD Business Suite → very strong value
-- ⚠️  VERIFY: cpp_inr conservative estimates — Etihad devalued in 2024.

INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000015', 'economy',  0.7500, NOW()),
('00000000-0000-0000-0002-000000000015', 'business', 1.5000, NOW());


-- ============================================================
-- STEP 3 — MISSING TRANSFER LINKS (33 links, #061 → #093)
-- ============================================================
-- Numbering continues from seed.sql which ended at #060.
-- Formula reminder: floor((points_in / source_qty) * dest_qty)
--
-- ⚠️  VERIFY = Directionally correct per Garvit review (March 2026)
-- ✅   = High confidence
-- ============================================================


-- ── AXIS ATLAS (card 0003) — 5 missing links ─────────────────
-- Already seeded: KrisFlyer 1:2, Air India 1:2, Avios 1:2, Marriott 2:1
-- Adding: Flying Blue (Group B!), Aeroplan (Group A), United (Group A),
--         Qatar (Group A), Etihad (Group B)

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000061', 'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000007',
 1, 2, 5000, 5), -- → Flying Blue 1:2 ✅ Group B (massive 1.2L/yr cap — huge advantage)

('00000000-0000-0000-0003-000000000062', 'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000009',
 1, 2, 5000, 5), -- → Aeroplan 1:2 ✅ Group A (30k/yr cap; no-surcharge routes)

('00000000-0000-0000-0003-000000000063', 'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000008',
 1, 2, 5000, 5), -- → United MileagePlus 1:2 ✅ Group A (no fuel surcharges)

('00000000-0000-0000-0003-000000000064', 'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000012',
 1, 2, 5000, 5), -- → Qatar Privilege Club 1:2 ⚠️ VERIFY (Group A)

('00000000-0000-0000-0003-000000000065', 'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000015',
 1, 2, 5000, 5); -- → Etihad Guest 1:2 ⚠️ VERIFY (Group B)


-- ── AXIS OLYMPUS (card 0007) — 4 missing links ───────────────
-- Already seeded: KrisFlyer 1:4, Air India 1:4, Marriott 1:4, Accor 1:4,
--                 Flying Blue 1:4, United 1:4
-- Adding: Aeroplan, Avios, Qatar, Etihad

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000066', 'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000009',
 1, 4, 5000, 5), -- → Aeroplan 1:4 ✅ (1:4 + no-surcharge = elite combo)

('00000000-0000-0000-0003-000000000067', 'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000003',
 1, 4, 5000, 5), -- → Avios 1:4 ⚠️ VERIFY

('00000000-0000-0000-0003-000000000068', 'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000012',
 1, 4, 5000, 5), -- → Qatar Privilege Club 1:4 ⚠️ VERIFY

('00000000-0000-0000-0003-000000000069', 'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000015',
 1, 4, 5000, 5); -- → Etihad Guest 1:4 ⚠️ VERIFY


-- ── AXIS MAGNUS BURGUNDY (card 0008) — 5 missing links ───────
-- Already seeded: KrisFlyer 5:4, Air India 5:4, Marriott 5:4, Accor 5:4
-- Adding: Flying Blue, Aeroplan, United, Avios, Etihad

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000070', 'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000007',
 5, 4, 5000, 5), -- → Flying Blue 5:4 ✅ Group B

('00000000-0000-0000-0003-000000000071', 'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000009',
 5, 4, 5000, 5), -- → Aeroplan 5:4 ✅ Group A

('00000000-0000-0000-0003-000000000072', 'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000008',
 5, 4, 5000, 5), -- → United MileagePlus 5:4 ✅ Group A

('00000000-0000-0000-0003-000000000073', 'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000003',
 5, 4, 5000, 5), -- → Avios 5:4 ⚠️ VERIFY

('00000000-0000-0000-0003-000000000074', 'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000015',
 5, 4, 5000, 5); -- → Etihad Guest 5:4 ⚠️ VERIFY


-- ── AXIS MAGNUS STANDARD (card 0009) — 5 missing links ───────
-- Already seeded: KrisFlyer 5:2, Air India 5:2, Marriott 5:2, Accor 5:2
-- Adding: Flying Blue, Aeroplan, United, Avios, Etihad

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000075', 'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000007',
 5, 2, 5000, 5), -- → Flying Blue 5:2 ✅

('00000000-0000-0000-0003-000000000076', 'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000009',
 5, 2, 5000, 5), -- → Aeroplan 5:2 ✅

('00000000-0000-0000-0003-000000000077', 'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000008',
 5, 2, 5000, 5), -- → United MileagePlus 5:2 ✅

('00000000-0000-0000-0003-000000000078', 'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000003',
 5, 2, 5000, 5), -- → Avios 5:2 ⚠️ VERIFY

('00000000-0000-0000-0003-000000000079', 'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000015',
 5, 2, 5000, 5); -- → Etihad Guest 5:2 ⚠️ VERIFY


-- ── AXIS RESERVE (card 0010) — 5 missing links ───────────────
-- Already seeded: KrisFlyer 5:2, Air India 5:2, Marriott 5:2, Accor 5:2
-- Adding: Flying Blue, Aeroplan, United, Avios, Etihad
-- (Same 5:2 ratio structure as Magnus Standard)

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000080', 'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000007',
 5, 2, 5000, 5), -- → Flying Blue 5:2 ✅

('00000000-0000-0000-0003-000000000081', 'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000009',
 5, 2, 5000, 5), -- → Aeroplan 5:2 ✅

('00000000-0000-0000-0003-000000000082', 'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000008',
 5, 2, 5000, 5), -- → United MileagePlus 5:2 ✅

('00000000-0000-0000-0003-000000000083', 'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000003',
 5, 2, 5000, 5), -- → Avios 5:2 ⚠️ VERIFY

('00000000-0000-0000-0003-000000000084', 'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000015',
 5, 2, 5000, 5); -- → Etihad Guest 5:2 ⚠️ VERIFY


-- ── HSBC PREMIER (card 0013) — 4 missing links ───────────────
-- Already seeded: Air India 1:1, Avios 1:1, Accor ALL 1:1
-- Adding: KrisFlyer, Flying Blue, United (HSBC "undisputed king" at 1:1), Etihad
-- HSBC Premier = 1:1 across the board; every addition here is 1:1.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000085', 'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000002',
 1, 1, 1000, 3), -- → KrisFlyer 1:1 ✅

('00000000-0000-0000-0003-000000000086', 'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000007',
 1, 1, 1000, 5), -- → Flying Blue 1:1 ✅

('00000000-0000-0000-0003-000000000087', 'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000008',
 1, 1, 1000, 5), -- → United MileagePlus 1:1 ✅ (undisputed king for United)

('00000000-0000-0000-0003-000000000088', 'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000015',
 1, 1, 1000, 5); -- → Etihad Guest 1:1 ✅


-- ── HSBC TRAVELONE (card 0014) — 4 missing links ─────────────
-- Already seeded: Air India 1:1, Avios 1:1, Accor ALL 1:1
-- Adding: KrisFlyer, Flying Blue, United, Etihad
-- (Same 1:1 structure as HSBC Premier)

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES

('00000000-0000-0000-0003-000000000089', 'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000002',
 1, 1, 1000, 3), -- → KrisFlyer 1:1 ✅

('00000000-0000-0000-0003-000000000090', 'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000007',
 1, 1, 1000, 5), -- → Flying Blue 1:1 ✅

('00000000-0000-0000-0003-000000000091', 'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000008',
 1, 1, 1000, 5), -- → United MileagePlus 1:1 ✅

('00000000-0000-0000-0003-000000000092', 'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000015',
 1, 1, 1000, 5); -- → Etihad Guest 1:1 ✅


-- ============================================================
-- STEP 4 — AVIOS → QATAR PRIVILEGE CLUB (program→program link)
-- ============================================================
-- This is the first program→program link in the transfer graph.
-- It seeds the Phase 2 multi-hop chain:
--   Amex MR → Avios (2:1) → Qatar Qsuites (1:1)
-- This bypasses Amex's terrible direct Qatar rate (3:1), effectively
-- converting Amex MR to Qmiles at a 2:1 rate instead of 3:1.
-- source_type = 'program' uses the same transfer_links table — the schema
-- was designed as a directed graph from Day 1 to support this exact case.
-- Phase 1 routing engine ignores program→program links (single-hop only).
-- Phase 2 multi-hop engine will traverse these edges.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000093', 'program',
 '00000000-0000-0000-0002-000000000003', -- source: Avios (British Airways Exec Club)
 '00000000-0000-0000-0002-000000000012', -- dest:   Qatar Privilege Club (Qsuites)
 1, 1, 1000, 1); -- Avios → Qmiles 1:1 (near-instant, same oneworld family)


-- ============================================================
-- STEP 5 — INTERNATIONAL SWEET SPOTS (3 curated deals)
-- ============================================================
-- These complement the existing 6 India-focused sweet spots in seed.sql.
-- destination_url = direct booking link in Phase 1; affiliate URL in Phase 2.
-- ⚠️  Points required change with program updates — verify before each launch.

INSERT INTO sweet_spots (
    program_id, title, route_or_property,
    points_required, est_cash_value_inr,
    source_value_native, source_currency,
    category, destination_url, status, last_verified_at
) VALUES

-- Aeroplan: BOM → YYZ / DEL → YYZ (no fuel surcharges — biggest differentiator)
-- Best use case: transfer HDFC Infinia / Axis Olympus → Aeroplan, book Star Alliance
-- ~70k points BOM→YYZ Business; cash equivalent ~₹2.5L–₹3L
('00000000-0000-0000-0002-000000000009',
 'Mumbai → Toronto Business Class (No Surcharges)',
 'BOM–YYZ on Air Canada or Star Alliance partner',
 70000, 250000.00, NULL, NULL, 'business',
 'https://www.aircanada.com/aeroplan/redeem/air-travel',
 'approved', NOW()),

-- Flying Blue: DEL → CDG / BOM → AMS Economy Promo (monthly Flash Sales)
-- Air France/KLM runs promo pricing on economy; can drop to 8k–15k miles
-- Very strong value for Europe economy — especially useful for Axis Group B holders
('00000000-0000-0000-0002-000000000007',
 'India → Paris / Amsterdam Economy (Flash Sale)',
 'DEL–CDG / BOM–AMS on Air France or KLM',
 12000, 35000.00, NULL, NULL, 'economy',
 'https://www.flyingblue.com/en/promo-awards',
 'approved', NOW()),

-- Etihad Guest: BOM → AUH → LHR Business Studio
-- Etihad Business is dramatically underpriced vs EK for similar routing
-- ~58k miles BOM→LHR via AUH; cash equivalent ~₹2.2L–₹2.8L
-- Best accessed via Axis Olympus (1:4!) or HSBC 1:1
('00000000-0000-0000-0002-000000000015',
 'Mumbai → London Business Class via Abu Dhabi',
 'BOM–AUH–LHR on Etihad Airways (Business Studio)',
 58000, 240000.00, NULL, NULL, 'business',
 'https://www.etihad.com/en/fly-etihad/etihad-guest/redeem',
 'approved', NOW());
