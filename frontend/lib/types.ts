// ============================================================
// Project Maximize — Shared TypeScript Types
// These mirror the actual Pydantic models in backend/app/models/
// ============================================================

// ── Card & Program ───────────────────────────────────────────

export interface Card {
  id: string;
  name: string;
  issuer: string;
  points_currency_name: string;
  base_earn_rate: number;
  cash_redemption_cpp: number;
}

export interface Program {
  id: string;
  name: string;
  full_name: string;
  type: 'flight' | 'hotel';
  currency_name: string;
  min_transfer_in: number;
  transfer_processing_days: number;
  website_url: string;
}

// ── Calculator ───────────────────────────────────────────────
// Field names match the backend response from calculator_service.py

export interface CalculateRequest {
  card_id: string;
  points_balance: number;
}

export interface CategoryValue {
  category: string;           // "business" | "economy" | "first" | "hotel_standard" | "hotel_suite"
  cpp_inr: number;            // program's benchmark CPP in ₹
  total_value_inr: number;    // total ₹ value at this category for the user's full balance
  effective_cpp_inr: number;  // ₹ per source card point after transfer ratio
}

export interface ProgramResult {
  // Nested program object (matches backend join)
  program: {
    id: string;
    name: string;
    full_name: string;
    type: 'flight' | 'hotel';
    currency_name: string;
    website_url: string;
  };
  program_points: number;       // partner miles/points received after transfer
  has_active_bonus: boolean;
  bonus_pct: number | null;
  categories: CategoryValue[];  // sorted best → worst by total_value_inr
  best_value_inr: number;       // highest total_value_inr across categories
  best_category: string;        // category key that gives best_value_inr
}

export interface BaselineComparison {
  label: string;                // "Statement Credit" | "Bank Rewards Portal"
  total_value_inr: number;
  cpp_inr: number;
}

export interface CalculateResponse {
  card_id: string;
  card_name: string;
  points_currency_name: string;
  points_balance: number;
  results: ProgramResult[];               // sorted best → worst
  baseline_comparisons: BaselineComparison[];
  max_value_inr: number;                  // best achievable ₹ value
  vs_baseline_multiplier: number;         // e.g. 2.8 (shown as "2.8×")
}

// ── Routing / Recommendations ────────────────────────────────

export type CategoryFilter = 'flight' | 'hotel' | 'all';

export interface RecommendRequest {
  card_id: string;
  points_balance: number;
  category_filter?: CategoryFilter;
}

export interface Recommendation {
  rank: number;
  program_name: string;
  program_type: 'flight' | 'hotel';
  transfer_ratio_label: string;
  miles_after_transfer: number;
  best_category: string;
  best_cpp: number;
  total_inr: number;
  vs_statement_credit: number;
  action_text: string;
  destination_url: string | null;
}

export interface RecommendResponse {
  card_name: string;
  points_balance: number;
  points_currency: string;
  recommendations: Recommendation[];
  baseline_inr: number;
}

// ── Sweet Spots ──────────────────────────────────────────────

export type SweetSpotCategory =
  | 'economy'
  | 'business'
  | 'first'
  | 'hotel_standard'
  | 'hotel_suite';

export type SweetSpotStatus =
  | 'approved'
  | 'pending_review'
  | 'stale'
  | 'expired';

export interface SweetSpot {
  id: string;
  program_id: string;
  program_name: string;
  program_type: 'flight' | 'hotel';
  title: string;
  route_or_property: string;
  points_required: number;
  est_cash_value_inr: number;
  cpp: number;                    // est_cash_value_inr / points_required
  category: SweetSpotCategory;
  destination_url: string | null;
  status: SweetSpotStatus;
  last_verified_at: string;       // ISO timestamp string
  needs_review: boolean;
}

// ── UI State ─────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  status?: number;
}
