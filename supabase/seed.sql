-- ============================================================
-- Project Maximize — Seed Data  (v2 — March 2026)
-- ============================================================
-- Run order:
--   1. schema.sql
--   2. migrations/001_add_cash_redemption_cpp.sql
--   3. seed.sql  ← this file
--
-- ⚠️  VERIFY BEFORE EACH PUBLIC LAUNCH:
-- All transfer ratios personally verified by Garvit (Founder) in March 2026
-- against live bank portals and India-specific loyalty community sources.
-- Loyalty programs devalue without notice. Re-verify before launch and use
-- the needs_review mechanism to flag stale benchmarks.
--
-- AXIS TRANSFER GROUPINGS (do not build into Phase 1 calculator):
-- Axis Bank enforces annual EDGE Mile transfer caps per group:
--   Group A (KrisFlyer, Marriott):  30,000 EDGE Miles / year
--   Group B (Air India, Accor etc): 1,20,000 EDGE Miles / year
-- Surface this as an informational note in the UI (Phase 2).
--
-- UUIDs are pre-set for cross-referencing — do not regenerate.
-- ============================================================


-- ============================================================
-- SECTION 1 — CARDS (14 cards)
-- ============================================================
-- cash_redemption_cpp = ₹ per point for statement credit / bank portal.
-- This is the "bad redemption" baseline the calculator contrasts against.

INSERT INTO cards (id, name, issuer, points_currency_name, base_earn_rate, cash_redemption_cpp) VALUES

-- ── HDFC BANK ─────────────────────────────────────────────────
-- Infinia: 5 RP per ₹150 ≈ 3.33/₹100. SmartBuy = ₹1/RP for flights (but
-- statement credit is ₹0.50). We use statement credit as the "lazy" baseline.
('00000000-0000-0000-0001-000000000001', 'HDFC Infinia',           'HDFC Bank', 'Reward Points', 3.33, 0.50),
-- Diners Club Black/Metal: identical earn and transfer structure to Infinia
('00000000-0000-0000-0001-000000000002', 'HDFC Diners Club Black', 'HDFC Bank', 'Reward Points', 3.33, 0.50),
-- BizBlack: 1:1 KrisFlyer only. All other partners unavailable.
('00000000-0000-0000-0001-000000000012', 'HDFC BizBlack',          'HDFC Bank', 'Reward Points', 3.33, 0.50),
-- Regalia Gold: upper-mid-tier. Worse ratios than Infinia (2:1 & 3:1).
-- VERIFY earn rate: 4 RP per ₹150 = 2.67/₹100
('00000000-0000-0000-0001-000000000011', 'HDFC Regalia Gold',      'HDFC Bank', 'Reward Points', 2.67, 0.50),

-- ── AXIS BANK ─────────────────────────────────────────────────
-- Atlas: 5 EDGE Miles/₹100 travel, 2 others. Direct cash value ~₹0.20/mile.
-- Transfer value is the entire story for this card (1:2 for airlines).
('00000000-0000-0000-0001-000000000003', 'Axis Atlas',             'Axis Bank', 'EDGE Miles',         2.00, 0.20),
-- Olympus (formerly Citi Prestige): 1:4 ratio — the best transfer rate in India.
-- VERIFY earn rate. cash_cpp same as Atlas (EDGE Miles).
('00000000-0000-0000-0001-000000000007', 'Axis Olympus',           'Axis Bank', 'EDGE Miles',         2.00, 0.20),
-- Magnus Burgundy (Burgundy banking customers only): 5:4 ratio.
-- Earns EDGE Reward Points (different from EDGE Miles on Atlas/Olympus).
-- VERIFY earn rate.
('00000000-0000-0000-0001-000000000008', 'Axis Magnus (Burgundy)', 'Axis Bank', 'EDGE Reward Points', 4.00, 0.20),
-- Magnus Standard & Reserve: 5:2 — a big drop-off from Burgundy.
('00000000-0000-0000-0001-000000000009', 'Axis Magnus',            'Axis Bank', 'EDGE Reward Points', 3.00, 0.20),
('00000000-0000-0000-0001-000000000010', 'Axis Reserve',           'Axis Bank', 'EDGE Reward Points', 3.00, 0.20),

-- ── SBI CARD ──────────────────────────────────────────────────
-- Aurum: 4 RP/₹100. Poor airline transfer (5:1). Value mainly in lifestyle.
('00000000-0000-0000-0001-000000000004', 'SBI Aurum',              'SBI Card',          'Reward Points',       4.00, 0.25),

-- ── AMERICAN EXPRESS ──────────────────────────────────────────
-- All Amex India cards share the same Membership Rewards (MR) transfer ratios.
-- Best IN-India sweet spot: 1:1 to Marriott. Amex Taj voucher (24,000 MR →
-- ₹14,000 Taj voucher ≈ ₹0.58/MR) noted as sweet spot in Section 5.
-- VERIFY earn rate: Platinum Travel earns ~3 MR/₹100 on most spends.
('00000000-0000-0000-0001-000000000006', 'Amex Platinum Travel',   'American Express',  'Membership Rewards',  3.00, 0.25),

-- ── HSBC ──────────────────────────────────────────────────────
-- HSBC transfers Accor at 1:1 — significantly better than HDFC's 2:1 Accor ratio.
-- VERIFY earn rates for both Premier and TravelOne.
('00000000-0000-0000-0001-000000000013', 'HSBC Premier',           'HSBC Bank',         'Reward Points',       2.00, 0.25),
('00000000-0000-0000-0001-000000000014', 'HSBC TravelOne',         'HSBC Bank',         'Reward Points',       2.00, 0.25),

-- ── ICICI ─────────────────────────────────────────────────────
-- Emeralde: iShop portal gives 1 RP = ₹1 for flights/hotels — highest direct
-- redemption value of any card in this list. Transfer to Air India at 1:1.
('00000000-0000-0000-0001-000000000005', 'ICICI Emeralde Private', 'ICICI Bank',        'Reward Points',       3.00, 1.00);


-- ============================================================
-- SECTION 2 — LOYALTY PROGRAMS (14 programs)
-- ============================================================

INSERT INTO loyalty_programs (id, name, full_name, type, currency_name, min_transfer_in, transfer_processing_days, website_url) VALUES

-- ── FLIGHT ────────────────────────────────────────────────────
('00000000-0000-0000-0002-000000000001',
 'Maharaja Club',     'Air India Maharaja Club',
 'flight', 'Maharaja Points', 1000, 3,
 'https://www.airindia.com/in/en/maharaja-club.html'),

('00000000-0000-0000-0002-000000000002',
 'KrisFlyer',         'Singapore Airlines KrisFlyer',
 'flight', 'KrisFlyer Miles', 1000, 3,
 'https://www.singaporeair.com/krisflyer'),

('00000000-0000-0000-0002-000000000003',
 'Avios',             'British Airways Executive Club (Avios)',
 'flight', 'Avios', 1000, 5,
 'https://www.britishairways.com/en-gb/executive-club'),
-- Note: Finnair Plus also uses Avios — HDFC DCB "Finnair Plus" transfers
-- land here as Avios (same network, same redemption value).

('00000000-0000-0000-0002-000000000007',
 'Flying Blue',       'Air France / KLM Flying Blue',
 'flight', 'Miles', 1000, 5,
 'https://www.flyingblue.com'),

('00000000-0000-0000-0002-000000000008',
 'United MileagePlus','United Airlines MileagePlus',
 'flight', 'Miles', 1000, 5,
 'https://www.united.com/ual/en/us/fly/mileageplus.html'),

('00000000-0000-0000-0002-000000000009',
 'Aeroplan',          'Air Canada Aeroplan',
 'flight', 'Points', 1000, 5,
 'https://www.aircanada.com/aeroplan'),

('00000000-0000-0000-0002-000000000010',
 'Skywards',          'Emirates Skywards',
 'flight', 'Miles', 1000, 5,
 'https://www.emirates.com/skywards'),

('00000000-0000-0000-0002-000000000011',
 'Asia Miles',        'Cathay Pacific Asia Miles',
 'flight', 'Miles', 1000, 5,
 'https://www.asiamiles.com'),

('00000000-0000-0000-0002-000000000012',
 'Privilege Club',    'Qatar Airways Privilege Club',
 'flight', 'Qmiles', 1000, 5,
 'https://www.qatarairways.com/privilegeclub'),

-- ── HOTEL ─────────────────────────────────────────────────────
('00000000-0000-0000-0002-000000000004',
 'Marriott Bonvoy',   'Marriott Bonvoy',
 'hotel', 'Bonvoy Points', 2000, 5,
 'https://www.marriott.com/loyalty.mi'),

('00000000-0000-0000-0002-000000000005',
 'World of Hyatt',    'World of Hyatt',
 'hotel', 'Hyatt Points', 1000, 5,
 'https://www.hyatt.com/world-of-hyatt'),

('00000000-0000-0000-0002-000000000006',
 'Accor ALL',         'Accor Live Limitless (ALL)',
 'hotel', 'ALL Points', 2000, 7,
 'https://all.accor.com'),

('00000000-0000-0000-0002-000000000013',
 'Hilton Honors',     'Hilton Honors',
 'hotel', 'Points', 2000, 5,
 'https://www.hilton.com/honors'),

('00000000-0000-0000-0002-000000000014',
 'Club ITC',          'Club ITC (ITC Hotels)',
 'hotel', 'Points', 1000, 5,
 'https://www.itchotels.com/clubitc');


-- ============================================================
-- SECTION 3 — TRANSFER LINKS
-- ============================================================
-- Formula (from utils/points.py):
--   points_out = floor((points_in / source_qty) * dest_qty)
--
-- ✅ = Personally verified by Garvit (Founder), March 2026
-- ⚠️ VERIFY = Directionally correct; confirm ratio before launch

-- ── HDFC INFINIA ─────────────────────────────────────────────

-- ✅ 1:1 partners (best Infinia transfers)
INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000001', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002',
 1, 1, 1000, 3), -- → KrisFlyer ✅

('00000000-0000-0000-0003-000000000002', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000007',
 1, 1, 1000, 5), -- → Flying Blue ✅

('00000000-0000-0000-0003-000000000003', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000003',
 1, 1, 1000, 5), -- → Avios (incl. Finnair Plus) ✅

-- ✅ 2:1 partners (post-devaluation)
('00000000-0000-0000-0003-000000000004', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001',
 2, 1, 2000, 3), -- → Air India Maharaja Club ✅

('00000000-0000-0000-0003-000000000005', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000004',
 2, 1, 2000, 5), -- → Marriott Bonvoy ✅

('00000000-0000-0000-0003-000000000006', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000006',
 2, 1, 2000, 7), -- → Accor ALL ✅

('00000000-0000-0000-0003-000000000007', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000009',
 2, 1, 2000, 5), -- → Aeroplan ✅

('00000000-0000-0000-0003-000000000008', 'card',
 '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000008',
 2, 1, 2000, 5); -- → United MileagePlus ✅

-- ── HDFC DINERS CLUB BLACK ────────────────────────────────────
-- Exact same partner matrix as Infinia ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000009',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000002',
 1, 1, 1000, 3), -- → KrisFlyer 1:1

('00000000-0000-0000-0003-000000000010',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000007',
 1, 1, 1000, 5), -- → Flying Blue 1:1

('00000000-0000-0000-0003-000000000011',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000003',
 1, 1, 1000, 5), -- → Avios 1:1

('00000000-0000-0000-0003-000000000012',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000001',
 2, 1, 2000, 3), -- → Air India Maharaja Club 2:1

('00000000-0000-0000-0003-000000000013',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000004',
 2, 1, 2000, 5), -- → Marriott Bonvoy 2:1

('00000000-0000-0000-0003-000000000014',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000006',
 2, 1, 2000, 7), -- → Accor ALL 2:1

('00000000-0000-0000-0003-000000000015',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000009',
 2, 1, 2000, 5), -- → Aeroplan 2:1

('00000000-0000-0000-0003-000000000016',  'card',
 '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000008',
 2, 1, 2000, 5); -- → United MileagePlus 2:1

-- ── HDFC BIZBLACK ─────────────────────────────────────────────
-- 1:1 to KrisFlyer ONLY. No other transfer partners available. ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000017',  'card',
 '00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0002-000000000002',
 1, 1, 1000, 3); -- → KrisFlyer 1:1 (only partner)

-- ── HDFC REGALIA GOLD ─────────────────────────────────────────
-- Two-tier ratio structure: 2:1 for some, 3:1 for others. ✅
-- Significantly worse than Infinia — the calculator will show this clearly.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000018',  'card',
 '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000002',
 2, 1, 2000, 3), -- → KrisFlyer 2:1

('00000000-0000-0000-0003-000000000019',  'card',
 '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000007',
 2, 1, 2000, 5), -- → Flying Blue 2:1 (⚠️ VERIFY)

('00000000-0000-0000-0003-000000000020',  'card',
 '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000006',
 2, 1, 2000, 7), -- → Accor ALL 2:1

('00000000-0000-0000-0003-000000000021',  'card',
 '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000001',
 3, 1, 3000, 3), -- → Air India Maharaja Club 3:1

('00000000-0000-0000-0003-000000000022',  'card',
 '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000004',
 3, 1, 3000, 5); -- → Marriott Bonvoy 3:1

-- ── AXIS ATLAS ───────────────────────────────────────────────
-- 1 EDGE Mile = 2 partner miles for airlines (1:2) ✅
-- Exception: Marriott at 2:1 (2 EDGE Miles = 1 Bonvoy point) ✅
-- Annual group caps apply (Group A: 30k, Group B: 1.2L) — surfaced in UI Phase 2.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000023',  'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000002',
 1, 2, 5000, 3), -- → KrisFlyer 1:2 (Group A, 30k/yr cap)

('00000000-0000-0000-0003-000000000024',  'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000001',
 1, 2, 5000, 3), -- → Air India Maharaja Club 1:2 (Group B, 1.2L/yr cap)

('00000000-0000-0000-0003-000000000025',  'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000003',
 1, 2, 5000, 5), -- → Avios 1:2 (⚠️ VERIFY group assignment)

('00000000-0000-0000-0003-000000000026',  'card',
 '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000004',
 2, 1, 10000, 5); -- → Marriott Bonvoy 2:1 ✅ (worse ratio, by design)

-- ── AXIS OLYMPUS (formerly Citi Prestige) ────────────────────
-- 1:4 — the single best transfer ratio available on any Indian card. ✅
-- 1 EDGE Mile converts to 4 partner miles/points across all listed partners.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000027',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000002',
 1, 4, 5000, 3), -- → KrisFlyer 1:4

('00000000-0000-0000-0003-000000000028',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000001',
 1, 4, 5000, 3), -- → Air India Maharaja Club 1:4

('00000000-0000-0000-0003-000000000029',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000004',
 1, 4, 5000, 5), -- → Marriott Bonvoy 1:4

('00000000-0000-0000-0003-000000000030',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000006',
 1, 4, 5000, 7), -- → Accor ALL 1:4

('00000000-0000-0000-0003-000000000031',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000007',
 1, 4, 5000, 5), -- → Flying Blue 1:4

('00000000-0000-0000-0003-000000000032',  'card',
 '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000008',
 1, 4, 5000, 5); -- → United MileagePlus 1:4

-- ── AXIS MAGNUS (BURGUNDY TIER) ──────────────────────────────
-- 5 EDGE Reward Points = 4 partner miles (5:4) ✅
-- Burgundy banking customers only. Significantly better than Standard Magnus.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000033',  'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000002',
 5, 4, 5000, 3), -- → KrisFlyer 5:4

('00000000-0000-0000-0003-000000000034',  'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000001',
 5, 4, 5000, 3), -- → Air India Maharaja Club 5:4

('00000000-0000-0000-0003-000000000035',  'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000004',
 5, 4, 5000, 5), -- → Marriott Bonvoy 5:4

('00000000-0000-0000-0003-000000000036',  'card',
 '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000006',
 5, 4, 5000, 7); -- → Accor ALL 5:4

-- ── AXIS MAGNUS (STANDARD) ───────────────────────────────────
-- 5 EDGE Reward Points = 2 partner miles (5:2) ✅
-- Massive drop vs Burgundy. The calculator will expose this value gap clearly.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000037',  'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000002',
 5, 2, 5000, 3), -- → KrisFlyer 5:2

('00000000-0000-0000-0003-000000000038',  'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000001',
 5, 2, 5000, 3), -- → Air India Maharaja Club 5:2

('00000000-0000-0000-0003-000000000039',  'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000004',
 5, 2, 5000, 5), -- → Marriott Bonvoy 5:2

('00000000-0000-0000-0003-000000000040',  'card',
 '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000006',
 5, 2, 5000, 7); -- → Accor ALL 5:2

-- ── AXIS RESERVE ─────────────────────────────────────────────
-- Same 5:2 structure as Magnus Standard ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000041',  'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000002',
 5, 2, 5000, 3),  -- → KrisFlyer 5:2

('00000000-0000-0000-0003-000000000042',  'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000001',
 5, 2, 5000, 3),  -- → Air India Maharaja Club 5:2

('00000000-0000-0000-0003-000000000043',  'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000004',
 5, 2, 5000, 5),  -- → Marriott Bonvoy 5:2

('00000000-0000-0000-0003-000000000044',  'card',
 '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000006',
 5, 2, 5000, 7);  -- → Accor ALL 5:2

-- ── SBI AURUM ─────────────────────────────────────────────────
-- 5:1 — the worst airline transfer ratio in this dataset. ✅
-- The app will correctly surface this as a very poor transfer choice.

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000045',  'card',
 '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000001',
 5, 1, 500, 3);   -- → Air India Maharaja Club 5:1

-- ── AMERICAN EXPRESS ──────────────────────────────────────────
-- All Amex India cards (Platinum Travel, Platinum Charge, Gold, MRCC)
-- share identical Membership Rewards transfer ratios. ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
-- 1:1 (Amex's best sweet spot in India)
('00000000-0000-0000-0003-000000000046',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000004',
 1, 1, 1000, 5),  -- → Marriott Bonvoy 1:1 ✅

-- 10:9 (Hilton Honors — "1:0.9" as integers)
('00000000-0000-0000-0003-000000000047',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000013',
 10, 9, 1000, 5), -- → Hilton Honors 10:9 ✅

-- 2:1 airline partners
('00000000-0000-0000-0003-000000000048',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000002',
 2, 1, 1000, 3),  -- → KrisFlyer 2:1 ✅

('00000000-0000-0000-0003-000000000049',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000011',
 2, 1, 1000, 5),  -- → Asia Miles 2:1 ✅

('00000000-0000-0000-0003-000000000050',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000003',
 2, 1, 1000, 5),  -- → Avios 2:1 ✅

('00000000-0000-0000-0003-000000000051',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000010',
 2, 1, 1000, 5),  -- → Emirates Skywards 2:1 ✅

-- 3:1 airline partners (Amex's weakest transfers)
('00000000-0000-0000-0003-000000000052',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000001',
 3, 1, 1000, 3),  -- → Air India Maharaja Club 3:1 ✅

('00000000-0000-0000-0003-000000000053',  'card',
 '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000012',
 3, 1, 1000, 5);  -- → Qatar Privilege Club 3:1 ✅

-- ── HSBC PREMIER ─────────────────────────────────────────────
-- 1:1 across the board. The Accor 1:1 is a standout vs HDFC's 2:1. ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000054',  'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000001',
 1, 1, 1000, 3),  -- → Air India Maharaja Club 1:1

('00000000-0000-0000-0003-000000000055',  'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000003',
 1, 1, 1000, 5),  -- → Avios 1:1

('00000000-0000-0000-0003-000000000056',  'card',
 '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0002-000000000006',
 1, 1, 1000, 7);  -- → Accor ALL 1:1 ✅ (best Accor rate in this dataset)

-- ── HSBC TRAVELONE ───────────────────────────────────────────
-- Same 1:1 structure as HSBC Premier

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000057',  'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000001',
 1, 1, 1000, 3),  -- → Air India Maharaja Club 1:1

('00000000-0000-0000-0003-000000000058',  'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000003',
 1, 1, 1000, 5),  -- → Avios 1:1

('00000000-0000-0000-0003-000000000059',  'card',
 '00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0002-000000000006',
 1, 1, 1000, 7);  -- → Accor ALL 1:1

-- ── ICICI EMERALDE PRIVATE METAL ─────────────────────────────
-- 1:1 to Air India only. Primary value is iShop portal (1 RP = ₹1). ✅

INSERT INTO transfer_links (id, source_type, source_id, dest_id, source_qty, dest_qty, min_points, processing_days) VALUES
('00000000-0000-0000-0003-000000000060',  'card',
 '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000001',
 1, 1, 1000, 3);  -- → Air India Maharaja Club 1:1


-- ============================================================
-- SECTION 4 — REDEMPTION BENCHMARKS
-- ============================================================
-- cpp_inr = conservative ₹ per point for India-origin travellers.
-- All foreign values converted at USD 1 = ₹84 / SGD 1 = ₹62.
-- Source: PointsMath, TechnoFino, LiveFromALounge, NerdWallet, Desipoints
-- (March 2026). Updated by APScheduler staleness job (30-day TTL).

-- ── MAHARAJA CLUB (Air India) ─────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000001', 'economy',  0.7000, NOW()),
('00000000-0000-0000-0002-000000000001', 'business', 1.8000, NOW());

-- ── KRISFLYER ────────────────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000002', 'economy',  0.8500, NOW()),
-- BOM→SIN Business Saver: ~35k miles, cash ~₹65k → ₹1.86/mile
('00000000-0000-0000-0002-000000000002', 'business', 2.2000, NOW()),
-- SQ Suites / First (aspirational, highest-value redemption in this dataset)
('00000000-0000-0000-0002-000000000002', 'first',    4.0000, NOW());

-- ── AVIOS (British Airways / Iberia / Qatar via Avios) ────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000003', 'economy',  0.7000, NOW()),
('00000000-0000-0000-0002-000000000003', 'business', 1.5000, NOW());

-- ── FLYING BLUE (Air France / KLM) ───────────────────────────
-- Dynamic pricing since 2023; conservative estimate
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000007', 'economy',  0.6500, NOW()),
('00000000-0000-0000-0002-000000000007', 'business', 1.6000, NOW());

-- ── UNITED MILEAGEPLUS ───────────────────────────────────────
-- Dynamic pricing; best value on Star Alliance partner awards
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000008', 'economy',  0.6500, NOW()),
('00000000-0000-0000-0002-000000000008', 'business', 1.4000, NOW());

-- ── AEROPLAN (Air Canada) ────────────────────────────────────
-- Strong partner award availability; good for Star Alliance
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000009', 'economy',  0.7500, NOW()),
('00000000-0000-0000-0002-000000000009', 'business', 1.8000, NOW());

-- ── EMIRATES SKYWARDS ────────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000010', 'economy',  0.7000, NOW()),
('00000000-0000-0000-0002-000000000010', 'business', 1.5000, NOW()),
('00000000-0000-0000-0002-000000000010', 'first',    2.8000, NOW());

-- ── ASIA MILES (Cathay Pacific) ───────────────────────────────
-- CX Business is premium; strong value for HKG-connecting routes
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000011', 'economy',  0.7500, NOW()),
('00000000-0000-0000-0002-000000000011', 'business', 2.0000, NOW()),
('00000000-0000-0000-0002-000000000011', 'first',    3.5000, NOW());

-- ── QATAR PRIVILEGE CLUB ─────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000012', 'economy',  0.6500, NOW()),
('00000000-0000-0000-0002-000000000012', 'business', 1.6000, NOW());

-- ── MARRIOTT BONVOY ───────────────────────────────────────────
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, source_value_native, source_currency, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000004', 'hotel_standard', 0.6000, 0.0071, 'USD', NOW()),
('00000000-0000-0000-0002-000000000004', 'hotel_suite',    0.9000, 0.0107, 'USD', NOW());

-- ── WORLD OF HYATT ────────────────────────────────────────────
-- India properties (Dehradun, Jaipur, Goa, Bangalore) consistently
-- yield ₹1.50–₹3.00+ per point. Conservative floor used here.
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, source_value_native, source_currency, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000005', 'hotel_standard', 1.5000, 0.0179, 'USD', NOW()),
('00000000-0000-0000-0002-000000000005', 'hotel_suite',    2.5000, 0.0298, 'USD', NOW());

-- ── ACCOR ALL ─────────────────────────────────────────────────
-- Novotel, Mercure, Pullman, Sofitel, MGallery in India
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000006', 'hotel_standard', 0.5000, NOW()),
('00000000-0000-0000-0002-000000000006', 'hotel_suite',    0.7500, NOW());

-- ── HILTON HONORS ─────────────────────────────────────────────
-- Lower value than Marriott/Hyatt due to high award pricing
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, source_value_native, source_currency, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000013', 'hotel_standard', 0.4000, 0.0048, 'USD', NOW()),
('00000000-0000-0000-0002-000000000013', 'hotel_suite',    0.5500, 0.0065, 'USD', NOW());

-- ── CLUB ITC ──────────────────────────────────────────────────
-- ITC Hotels are premium India-only properties; relatively strong value
-- VERIFY cpp: ITC Grand Chola Chennai, ITC Maurya Delhi, etc.
INSERT INTO redemption_benchmarks (program_id, category, cpp_inr, last_verified_at) VALUES
('00000000-0000-0000-0002-000000000014', 'hotel_standard', 0.5500, NOW()),
('00000000-0000-0000-0002-000000000014', 'hotel_suite',    0.8500, NOW());


-- ============================================================
-- SECTION 5 — SAMPLE SWEET SPOTS (6 deals, approved + live)
-- ============================================================
-- These make the app non-empty on first launch.
-- destination_url is a direct link in Phase 1; becomes affiliate URL in Phase 2.
-- ⚠️  Points required change with program updates — verify before each launch.

INSERT INTO sweet_spots (
    program_id, title, route_or_property,
    points_required, est_cash_value_inr,
    source_value_native, source_currency,
    category, destination_url, status, last_verified_at
) VALUES

-- KrisFlyer: BOM → SIN Business (classic India sweet spot)
('00000000-0000-0000-0002-000000000002',
 'Mumbai → Singapore Business Class (Saver)',
 'BOM–SIN on Singapore Airlines',
 35000, 65000.00, NULL, NULL, 'business',
 'https://www.singaporeair.com/en_UK/in/plan-travel/redeem-flights/',
 'approved', NOW()),

-- KrisFlyer: BOM → LHR Business
('00000000-0000-0000-0002-000000000002',
 'Mumbai → London Business Class (Saver)',
 'BOM–LHR on Singapore Airlines + partner',
 60500, 220000.00, NULL, NULL, 'business',
 'https://www.singaporeair.com/en_UK/in/plan-travel/redeem-flights/',
 'approved', NOW()),

-- Avios: DEL → DXB Economy (Avios distance-based short-haul sweet spot)
('00000000-0000-0000-0002-000000000003',
 'Delhi → Dubai Economy (Avios short-haul)',
 'DEL–DXB on British Airways / Qatar',
 11500, 18000.00, NULL, NULL, 'economy',
 'https://www.britishairways.com/en-in/information/avios',
 'approved', NOW()),

-- World of Hyatt: Hyatt Regency Dehradun (best India Hyatt sweet spot)
('00000000-0000-0000-0002-000000000005',
 'Hyatt Regency Dehradun — Standard Room',
 'Hyatt Regency Dehradun, Uttarakhand',
 17000, 25000.00, 298.00, 'USD', 'hotel_standard',
 'https://www.hyatt.com/en-US/hotel/india/hyatt-regency-dehradun/dehrd',
 'approved', NOW()),

-- Marriott Bonvoy: JW Marriott Mumbai Juhu
('00000000-0000-0000-0002-000000000004',
 'JW Marriott Mumbai Juhu — Standard Room',
 'JW Marriott Mumbai Juhu, Maharashtra',
 35000, 22000.00, 262.00, 'USD', 'hotel_standard',
 'https://www.marriott.com/hotels/travel/bomjw-jw-marriott-mumbai-juhu/',
 'approved', NOW()),

-- Amex-specific sweet spot: 24-Karat Gold Collection (Taj Hotels voucher)
-- 24,000 MR → ₹14,000 Taj voucher ≈ ₹0.58/MR
-- Not a program transfer — captured as a sweet spot for Amex users
('00000000-0000-0000-0002-000000000004', -- Using Marriott as placeholder program
 'Amex 24-Karat Gold — Taj Hotels Voucher',
 'Any Taj / SeleQtions / Vivanta property',
 24000, 14000.00, NULL, NULL, 'hotel_standard',
 'https://www.amextravel.in/rewards/24karat',
 'approved', NOW());
