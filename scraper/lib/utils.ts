// ============================================================
// Shared utilities for all scrapers
// ============================================================

import { supabase } from './supabase';

// ── Program UUIDs (from supabase/seed.sql + migration 002) ────
// Use these constants so scrapers don't have hardcoded UUID strings.

export const PROGRAM_IDS = {
  AIR_INDIA:    '00000000-0000-0000-0002-000000000001',
  KRISFLYER:    '00000000-0000-0000-0002-000000000002',
  AVIOS:        '00000000-0000-0000-0002-000000000003',
  MARRIOTT:     '00000000-0000-0000-0002-000000000004',
  HYATT:        '00000000-0000-0000-0002-000000000005',
  ACCOR:        '00000000-0000-0000-0002-000000000006',
  FLYING_BLUE:  '00000000-0000-0000-0002-000000000007',
  UNITED:       '00000000-0000-0000-0002-000000000008',
  AEROPLAN:     '00000000-0000-0000-0002-000000000009',
  SKYWARDS:     '00000000-0000-0000-0002-000000000010',
  ASIA_MILES:   '00000000-0000-0000-0002-000000000011',
  QATAR:        '00000000-0000-0000-0002-000000000012',
  ETIHAD:       '00000000-0000-0000-0002-000000000015',
} as const;

// ── Insert type (matches actual sweet_spots schema) ──────────

export type SweetSpotCategory =
  | 'economy'
  | 'business'
  | 'first'
  | 'hotel_standard'
  | 'hotel_suite';

export interface SweetSpotInsert {
  program_id:          string;               // UUID — use PROGRAM_IDS constants
  title:               string;               // e.g. "Paris → Bordeaux Economy Promo"
  route_or_property:   string;               // e.g. "CDG–BOD" or "Park Hyatt Mumbai"
  points_required:     number;               // > 0  (miles/points to redeem)
  est_cash_value_inr:  number;               // ₹ equivalent cash value
  source_value_native?: number;              // nullable — raw value in source currency
  source_currency?:    string;               // nullable — e.g. "USD", "EUR"
  category:            SweetSpotCategory;
  destination_url?:    string;               // booking URL or program page
  status:              'pending';            // always 'pending' from scraper
  needs_review?:       boolean;             // true = scraped dynamic data, must verify manually
  last_verified_at?:   string;               // ISO timestamp, defaults to NOW()
}

// ── Upsert helper ──────────────────────────────────────────

/**
 * Insert sweet spots into Supabase.
 * Clears existing 'pending' rows for the program first to avoid
 * duplicates on re-runs (approved/live rows are preserved).
 *
 * All inserts land at status='pending' — Garvit approves in Table Editor.
 */
export async function upsertSweetSpots(
  spots: SweetSpotInsert[],
  programId: string
): Promise<void> {
  if (spots.length === 0) {
    console.log('  No spots to insert.');
    return;
  }

  // Delete existing pending rows for this program (won't touch approved/live)
  const { error: delError } = await supabase
    .from('sweet_spots')
    .delete()
    .eq('program_id', programId)
    .eq('status', 'pending');

  if (delError) {
    // Non-fatal — log and continue (inserts may create duplicates but that's ok)
    console.warn(`  Warning: could not clear pending rows: ${delError.message}`);
  }

  const { error } = await supabase
    .from('sweet_spots')
    .insert(spots);

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`  ✅ Inserted ${spots.length} sweet spots (status=pending)`);
}

// ── Logging ──────────────────────────────────────────────────

export function log(scraper: string, msg: string): void {
  console.log(`[${scraper}] ${msg}`);
}

export function logError(scraper: string, err: unknown): void {
  console.error(`[${scraper}] ERROR:`, err instanceof Error ? err.message : err);
}
