-- ============================================================
-- Migration 014: Add logo_url to loyalty_programs and cards
-- ============================================================
-- Stores the canonical logo image URL for each program / card.
-- Frontend reads this field — no hardcoded logo maps in components.
--
-- Sources used:
--   Airlines  → Google Flights CDN (gstatic.com) — reliable, no auth needed
--               Format: https://www.gstatic.com/flights/airline_logos/70px/{IATA}.png
--   Hotels    → Clearbit Logo API — resolves by company domain, free tier
--               Format: https://logo.clearbit.com/{domain}
--   Banks     → Clearbit Logo API (same pattern)
-- ============================================================

-- ── 1. Add columns ──────────────────────────────────────────

ALTER TABLE loyalty_programs
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN loyalty_programs.logo_url IS
    'Public URL to the programme logo image. '
    'Airlines use gstatic.com IATA CDN; hotels/banks use Clearbit logo API.';

ALTER TABLE cards
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN cards.logo_url IS
    'Public URL to the card issuer logo image (Clearbit by bank domain).';

-- ── 2. Seed loyalty_programs logo_url ───────────────────────
-- Airlines: Google Flights CDN (70px square PNGs, always up to date)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/AI.png'
WHERE id = '00000000-0000-0000-0002-000000000001';  -- Maharaja Club (Air India)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png'
WHERE id = '00000000-0000-0000-0002-000000000002';  -- KrisFlyer (Singapore Airlines)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/BA.png'
WHERE id = '00000000-0000-0000-0002-000000000003';  -- Avios (British Airways)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/AF.png'
WHERE id = '00000000-0000-0000-0002-000000000007';  -- Flying Blue (Air France / KLM)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/UA.png'
WHERE id = '00000000-0000-0000-0002-000000000008';  -- United MileagePlus

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/AC.png'
WHERE id = '00000000-0000-0000-0002-000000000009';  -- Aeroplan (Air Canada)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/EK.png'
WHERE id = '00000000-0000-0000-0002-000000000010';  -- Emirates Skywards

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/CX.png'
WHERE id = '00000000-0000-0000-0002-000000000011';  -- Asia Miles (Cathay Pacific)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/QR.png'
WHERE id = '00000000-0000-0000-0002-000000000012';  -- Privilege Club (Qatar Airways)

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/EY.png'
WHERE id = '00000000-0000-0000-0002-000000000015';  -- Etihad Guest

UPDATE loyalty_programs SET logo_url = 'https://www.gstatic.com/flights/airline_logos/70px/TK.png'
WHERE id = '00000000-0000-0000-0002-000000000016';  -- Turkish Miles & Smiles

-- Hotels: Clearbit Logo API (resolves company logo by domain)

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/marriott.com'
WHERE id = '00000000-0000-0000-0002-000000000004';  -- Marriott Bonvoy

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/hyatt.com'
WHERE id = '00000000-0000-0000-0002-000000000005';  -- World of Hyatt

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/all.accor.com'
WHERE id = '00000000-0000-0000-0002-000000000006';  -- Accor ALL

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/hilton.com'
WHERE id = '00000000-0000-0000-0002-000000000013';  -- Hilton Honors

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/itchotels.com'
WHERE id = '00000000-0000-0000-0002-000000000014';  -- Club ITC

UPDATE loyalty_programs SET logo_url = 'https://logo.clearbit.com/ihg.com'
WHERE id = '00000000-0000-0000-0002-000000000017';  -- IHG One Rewards

-- ── 3. Seed cards logo_url ───────────────────────────────────
-- Bank logos via Clearbit (issuer domain)

-- HDFC Bank
UPDATE cards SET logo_url = 'https://logo.clearbit.com/hdfcbank.com'
WHERE issuer = 'HDFC Bank';

-- Axis Bank
UPDATE cards SET logo_url = 'https://logo.clearbit.com/axisbank.com'
WHERE issuer = 'Axis Bank';

-- SBI Card
UPDATE cards SET logo_url = 'https://logo.clearbit.com/sbicard.com'
WHERE issuer = 'SBI Card';

-- American Express
UPDATE cards SET logo_url = 'https://logo.clearbit.com/americanexpress.com'
WHERE issuer = 'American Express';

-- HSBC Bank (India domain resolves better)
UPDATE cards SET logo_url = 'https://logo.clearbit.com/hsbc.co.in'
WHERE issuer = 'HSBC Bank';

-- ICICI Bank
UPDATE cards SET logo_url = 'https://logo.clearbit.com/icicibank.com'
WHERE issuer = 'ICICI Bank';

-- ── 4. Verify ───────────────────────────────────────────────
SELECT id, name, type, logo_url
FROM loyalty_programs
ORDER BY type, name;

SELECT id, name, issuer, logo_url
FROM cards
ORDER BY issuer, name;
