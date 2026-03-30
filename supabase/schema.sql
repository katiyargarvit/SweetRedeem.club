-- ============================================================
-- Project Maximize — Supabase PostgreSQL Schema
-- ============================================================
-- Run this file once against your Supabase project via:
--   supabase db push  OR  Supabase SQL Editor
--
-- Tables are created in dependency order.
-- auth.users is managed by Supabase Auth — not defined here.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. CORE REFERENCE TABLES (static, seeded manually)
-- ============================================================

CREATE TABLE cards (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                 TEXT NOT NULL,            -- e.g. "HDFC Infinia"
    issuer               TEXT NOT NULL,            -- e.g. "HDFC Bank"
    points_currency_name TEXT NOT NULL,            -- e.g. "Reward Points"
    base_earn_rate       NUMERIC(5,2),             -- points per ₹100 spent
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_programs (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                     TEXT NOT NULL,        -- e.g. "KrisFlyer"
    full_name                TEXT,                 -- e.g. "Singapore Airlines KrisFlyer"
    type                     TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'hybrid')),
    currency_name            TEXT NOT NULL,        -- e.g. "Miles"
    min_transfer_in          INT NOT NULL DEFAULT 1000,
    transfer_processing_days INT NOT NULL DEFAULT 3,
    website_url              TEXT,
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Directed graph edges: card→program OR program→program
-- Supports Phase 1 single-hop and Phase 2 multi-hop chain engine.
CREATE TABLE transfer_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type     TEXT NOT NULL CHECK (source_type IN ('card', 'program')),
    source_id       UUID NOT NULL,
    dest_type       TEXT NOT NULL DEFAULT 'program' CHECK (dest_type IN ('program')),
    dest_id         UUID NOT NULL REFERENCES loyalty_programs(id),
    -- Integer ratio — NO floats. e.g. 2:1 = source_qty=2, dest_qty=1
    -- Transfer formula: floor((points_in / source_qty) * dest_qty)
    source_qty      INT NOT NULL CHECK (source_qty > 0),
    dest_qty        INT NOT NULL CHECK (dest_qty > 0),
    min_points      INT NOT NULL DEFAULT 1000,
    transfer_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
    processing_days INT NOT NULL DEFAULT 3,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_transfer CHECK (
        NOT (source_type = 'program' AND source_id = dest_id)
    )
);

CREATE INDEX idx_transfer_links_source ON transfer_links(source_type, source_id);
CREATE INDEX idx_transfer_links_dest   ON transfer_links(dest_id);
CREATE INDEX idx_transfer_links_active ON transfer_links(is_active) WHERE is_active = TRUE;


-- ============================================================
-- 2. LIVE DATA LAYER (scraper output + manual review)
-- ============================================================

CREATE TABLE transfer_bonuses (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_link_id UUID NOT NULL REFERENCES transfer_links(id),
    bonus_pct        INT NOT NULL CHECK (bonus_pct > 0),   -- 25 = 25% bonus
    valid_from       TIMESTAMPTZ NOT NULL,
    valid_to         TIMESTAMPTZ NOT NULL,
    source_url       TEXT,
    -- All bonuses pass through manual review before going live
    status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'live', 'expired')),
    reviewed_by      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (valid_to > valid_from)
);

CREATE INDEX idx_transfer_bonuses_status ON transfer_bonuses(status);
CREATE INDEX idx_transfer_bonuses_link   ON transfer_bonuses(transfer_link_id);
CREATE INDEX idx_transfer_bonuses_live   ON transfer_bonuses(valid_to)
    WHERE status = 'live';

CREATE TABLE redemption_benchmarks (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id           UUID NOT NULL REFERENCES loyalty_programs(id),
    category             TEXT NOT NULL CHECK (category IN (
                             'economy', 'business', 'first',
                             'hotel_standard', 'hotel_suite'
                         )),
    cpp_inr              NUMERIC(8,4) NOT NULL,  -- cost per point in ₹ (higher = better)
    -- Audit trail: if value was originally in a foreign currency, record it here.
    -- Frontend always displays cpp_inr — never does live currency conversion.
    source_value_native  NUMERIC(12,2),          -- NULL if originally in INR
    source_currency      CHAR(3),                -- ISO 4217, e.g. 'USD'. NULL if INR.
    last_verified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    needs_review         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (program_id, category)
);

CREATE INDEX idx_benchmarks_program    ON redemption_benchmarks(program_id);
CREATE INDEX idx_benchmarks_review     ON redemption_benchmarks(needs_review)
    WHERE needs_review = TRUE;

CREATE TABLE sweet_spots (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id          UUID NOT NULL REFERENCES loyalty_programs(id),
    title               TEXT NOT NULL,            -- e.g. "BOM→SIN Business Class"
    route_or_property   TEXT NOT NULL,            -- e.g. "BOM-SIN" or "Park Hyatt Mumbai"
    points_required     INT NOT NULL CHECK (points_required > 0),
    est_cash_value_inr  NUMERIC(12,2) NOT NULL,   -- always stored in ₹
    source_value_native NUMERIC(12,2),            -- NULL if originally in INR
    source_currency     CHAR(3),                  -- NULL if originally in INR
    category            TEXT NOT NULL CHECK (category IN (
                            'economy', 'business', 'first',
                            'hotel_standard', 'hotel_suite'
                        )),
    -- Seeded as NULL in Phase 1 (direct URLs).
    -- Swapped for affiliate URLs in Phase 2 with zero schema change.
    destination_url     TEXT,
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'live')),
    last_verified_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    needs_review        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sweet_spots_program ON sweet_spots(program_id);
CREATE INDEX idx_sweet_spots_live    ON sweet_spots(status, is_active)
    WHERE status = 'live' AND is_active = TRUE;
CREATE INDEX idx_sweet_spots_review  ON sweet_spots(needs_review)
    WHERE needs_review = TRUE;

CREATE TABLE scraped_signals (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source      TEXT NOT NULL CHECK (source IN ('reddit', 'blog', 'site_crawl', 'news')),
    raw_text    TEXT NOT NULL,
    url         TEXT,
    scraped_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signal_type TEXT NOT NULL CHECK (signal_type IN ('bonus', 'sweet_spot', 'ratio_change')),
    status      TEXT NOT NULL DEFAULT 'unreviewed'
                CHECK (status IN ('unreviewed', 'converted', 'dismissed'))
);

CREATE INDEX idx_scraped_signals_status ON scraped_signals(status)
    WHERE status = 'unreviewed';


-- ============================================================
-- 3. USER LAYER
-- ============================================================

-- Supabase pattern: profiles references auth.users.
-- email and created_at live in auth.users — not duplicated here.
-- Automatically created via trigger below.
CREATE TABLE profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create a profiles row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE user_cards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    card_id         UUID NOT NULL REFERENCES cards(id),
    -- Denormalized read cache. Source of truth is point_transactions ledger.
    -- Must be updated on every INSERT into point_transactions.
    cached_balance  INT NOT NULL DEFAULT 0,
    balance_as_of   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, card_id)
);

CREATE INDEX idx_user_cards_user ON user_cards(user_id);

-- ─────────────────────────────────────────────────────────────
-- APPEND-ONLY LEDGER
-- CRITICAL RULE: No UPDATE or DELETE on this table. Ever.
-- To correct a balance, INSERT a new compensating row.
-- Enforced at the database level via trigger below.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE point_transactions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    card_id      UUID NOT NULL REFERENCES cards(id),
    timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Signed integer: positive = earned, negative = redeemed/expired
    points_delta INT NOT NULL,
    source       TEXT NOT NULL CHECK (source IN (
                     'manual_entry', 'statement_upload', 'manual_correction'
                 )),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_card ON point_transactions(user_id, card_id);
CREATE INDEX idx_transactions_timestamp ON point_transactions(timestamp DESC);

-- Enforce append-only immutability at the DB level
CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'point_transactions is append-only. '
        'INSERT a new compensating row instead of modifying existing ones.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ledger_immutability
    BEFORE UPDATE OR DELETE ON point_transactions
    FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

-- Seeded in Phase 1. Alert job activated in Phase 2.
CREATE TABLE point_expirations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_card_id    UUID NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
    points_expiring INT NOT NULL CHECK (points_expiring > 0),
    expiry_date     TIMESTAMPTZ NOT NULL,
    alert_sent      BOOLEAN NOT NULL DEFAULT FALSE,
    notified_at     TIMESTAMPTZ,             -- set when alert is dispatched
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index: only rows that still need alerts. Keeps the Phase 2 cron query fast.
CREATE INDEX idx_expirations_upcoming
    ON point_expirations(expiry_date, alert_sent)
    WHERE alert_sent = FALSE;


-- ============================================================
-- 4. TELEMETRY LAYER
-- ============================================================

-- Session ID generated on first site visit, stored in HTTP-only SameSite=Strict cookie.
-- user_id is NULL for anonymous visitors; set when they sign up (anonymous→auth merge).
CREATE TABLE anonymous_sessions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anon_sessions_user ON anonymous_sessions(user_id)
    WHERE user_id IS NOT NULL;

CREATE TABLE search_events (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id             UUID REFERENCES anonymous_sessions(id) ON DELETE SET NULL,
    user_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
    card_id                UUID REFERENCES cards(id) ON DELETE SET NULL,
    points_balance_queried INT,
    timestamp              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_events_session ON search_events(session_id);
CREATE INDEX idx_search_events_user    ON search_events(user_id)
    WHERE user_id IS NOT NULL;

-- Seeds affiliate conversion attribution from Day 1.
-- destination_url is a direct URL in Phase 1; becomes affiliate URL in Phase 2.
CREATE TABLE outbound_clicks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID REFERENCES anonymous_sessions(id) ON DELETE SET NULL,
    user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
    destination_partner TEXT NOT NULL,       -- e.g. 'krisflyer', 'marriott', 'hyatt'
    sweet_spot_id       UUID REFERENCES sweet_spots(id) ON DELETE SET NULL,
    recommendation_id   UUID,               -- FK to routing results (Phase 2)
    destination_url     TEXT NOT NULL,
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbound_clicks_session ON outbound_clicks(session_id);
CREATE INDEX idx_outbound_clicks_partner ON outbound_clicks(destination_partner, timestamp DESC);


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- User tables: strict — users see only their own data
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_expirations  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own cards"
    ON user_cards FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own transactions"
    ON point_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own transactions"
    ON point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own expirations"
    ON point_expirations FOR SELECT USING (
        user_card_id IN (
            SELECT id FROM user_cards WHERE user_id = auth.uid()
        )
    );

-- Reference + live tables: public read, no auth required.
-- The calculator works for anonymous visitors.
ALTER TABLE cards                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_links        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_bonuses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweet_spots           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cards"
    ON cards FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read programs"
    ON loyalty_programs FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read transfer links"
    ON transfer_links FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read live bonuses"
    ON transfer_bonuses FOR SELECT USING (status = 'live');

CREATE POLICY "Public read benchmarks"
    ON redemption_benchmarks FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read live sweet spots"
    ON sweet_spots FOR SELECT USING (status = 'live' AND is_active = TRUE);
