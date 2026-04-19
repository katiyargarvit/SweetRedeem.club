-- ============================================================
-- Migration: Credit Card Details (savesage.club data)
-- ============================================================
-- Run in Supabase SQL Editor BEFORE running savesage-upload.ts
-- ============================================================

-- Add slug to cards table for stable upsert key
ALTER TABLE cards ADD COLUMN IF NOT EXISTS slug            TEXT UNIQUE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS joining_fee_inr INT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_url       TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS overview        TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS best_suited     TEXT[];
ALTER TABLE cards ADD COLUMN IF NOT EXISTS return_pct_text TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS savesage_id     INT;

-- ── 1. Earn Categories (many per card) ───────────────────────
CREATE TABLE IF NOT EXISTS card_earn_categories (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id       UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,    -- e.g. "Base Rewards", "Hotels", "Grocery"
    earn_text     TEXT NOT NULL,    -- e.g. "Earn 5 Reward Points per ₹150 spent"
    -- Parsed fields (NULL if parsing fails — graceful degradation)
    points_earned NUMERIC(8,2),     -- e.g. 5
    per_inr       INT,              -- e.g. 150 (meaning per ₹150)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (card_id, category_name)
);

CREATE INDEX IF NOT EXISTS idx_earn_categories_card ON card_earn_categories(card_id);

-- ── 2. Benefits & Offers (many per card) ─────────────────────
CREATE TABLE IF NOT EXISTS card_benefits (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id    UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    main_title TEXT NOT NULL,   -- e.g. "BookMyShow", "Golf", "Insurance"
    detail     TEXT NOT NULL,   -- e.g. "25% discount on movie tickets upto ₹150"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_benefits_card ON card_benefits(card_id);

-- ── 3. Lounge Access (many per card) ─────────────────────────
CREATE TABLE IF NOT EXISTS card_lounge_access (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    lounge_type TEXT NOT NULL,   -- e.g. "Domestic lounge", "International lounge"
    limits      TEXT[],          -- e.g. ["2 per quarter"]
    eligibility TEXT[],          -- e.g. ["Spend ₹75k in previous calendar quarter."]
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lounge_access_card ON card_lounge_access(card_id);

-- ── 4. Milestones (many per card) ────────────────────────────
CREATE TABLE IF NOT EXISTS card_milestones (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id          UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    milestone_number INT NOT NULL,
    spend_target_inr INT NOT NULL,   -- in paise-less INR, e.g. 300000 = ₹3 lakh
    cycle_type       TEXT,           -- e.g. "STATEMENT", "YEAR"
    milestone_type   TEXT,           -- e.g. "YEAR", "QUARTER"
    benefits_text    TEXT NOT NULL,  -- e.g. "3,000 RPs."
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (card_id, milestone_number)
);

CREATE INDEX IF NOT EXISTS idx_card_milestones_card ON card_milestones(card_id);

-- ── RLS Policies (public read, consistent with existing tables) ──
ALTER TABLE card_earn_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_benefits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_lounge_access    ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_milestones       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read earn categories"
    ON card_earn_categories FOR SELECT USING (TRUE);

CREATE POLICY "Public read benefits"
    ON card_benefits FOR SELECT USING (TRUE);

CREATE POLICY "Public read lounge access"
    ON card_lounge_access FOR SELECT USING (TRUE);

CREATE POLICY "Public read milestones"
    ON card_milestones FOR SELECT USING (TRUE);
