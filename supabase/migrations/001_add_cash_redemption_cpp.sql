-- Migration 001: Add cash_redemption_cpp to cards
-- ─────────────────────────────────────────────────────────────
-- This is the CPP (₹ per point) for the card's worst-case redemption:
-- statement credit, cashback, or the bank's own portal.
--
-- It is the baseline used by the calculator to show:
-- "Your points are worth ₹X here vs ₹Y via KrisFlyer Business Class."
--
-- Typical values for our target cards:
--   HDFC Infinia     → 0.50  (₹0.50 per Reward Point on statement credit)
--   Axis Atlas       → 0.50  (₹0.50 per Edge Mile on portal)
--   SBI Aurum        → 0.25  (₹0.25 per Reward Point on statement credit)
--
-- Set when seeding card data. Defaults to 0.50 if not provided.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE cards
    ADD COLUMN cash_redemption_cpp NUMERIC(6,4) NOT NULL DEFAULT 0.50;

COMMENT ON COLUMN cards.cash_redemption_cpp IS
    'CPP in INR for worst-case redemption (statement credit / bank portal cashback). '
    'Used as the baseline in the calculator value comparison.';
