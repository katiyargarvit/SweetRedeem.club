// Shared utilities for all scrapers

import { supabase } from './supabase';

// Program UUIDs (from supabase/seed.sql + migrations)
// Use these constants so scrapers never hardcode UUID strings.

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
  HILTON:       '00000000-0000-0000-0002-000000000013',
  ITC_HOTELS:   '00000000-0000-0000-0002-000000000014',
  ETIHAD:       '00000000-0000-0000-0002-000000000015',
  TURKISH:      '00000000-0000-0000-0002-000000000016',
  IHG:          '00000000-0000-0000-0002-000000000017',
} as const;

// Insert type (matches actual sweet_spots schema)

export type SweetSpotCategory =
  | 'economy'
  | 'business'
  | 'first'
  | 'hotel_standard'
  | 'hotel_suite';

export interface SweetSpotInsert {
  program_id:           string;
  title:                string;
  route_or_property:    string;
  points_required:      number;
  est_cash_value_inr:   number;
  source_value_native?: number;
  source_currency?:     string;
  category:             SweetSpotCategory;
  destination_url?:     string;
  status:               'pending';
  needs_review?:        boolean;
  last_verified_at?:    string;

  // Structured flight metadata (migration 013)
  // Leave all fields undefined for hotel spots.
  //
  // origin_iata / destination_iata: specific IATA codes for
  //   point-to-point routes (e.g. 'DEL', 'LHR').
  //   Omit for zone-based programs (KrisFlyer "India to Europe").
  //
  // origin_region / destination_region: human region label.
  //   Values: 'India' | 'Southeast Asia' | 'Europe' |
  //           'Middle East' | 'North America' | 'Australia / Pacific'
  //
  // operating_airline: display name of the carrier.
  //   e.g. 'Air India', 'Singapore Airlines', 'Etihad Airways'
  //
  // stops: 0 = nonstop, 1 = 1-stop via hub, etc.
  //
  // is_india_route is a GENERATED column in the DB -- never insert it.
  origin_iata?:         string;
  destination_iata?:    string;
  origin_region?:       string;
  destination_region?:  string;
  operating_airline?:   string;
  stops?:               number;
}
// NOTE: cpp and is_india_route columns are GENERATED ALWAYS in DB -- never insert them

// Upsert helper
// Clears existing 'pending' rows for the program, then batch-inserts new ones.
// Preserves status='live' rows. Safe to call on every scraper run.

export async function upsertSweetSpots(
  spots: SweetSpotInsert[],
  programId: string
): Promise<void> {
  if (spots.length === 0) {
    console.log('  No spots to insert.');
    return;
  }

  const { error: delError } = await supabase
    .from('sweet_spots')
    .delete()
    .eq('program_id', programId)
    .eq('status', 'pending');

  if (delError) {
    console.warn(`  Warning: could not clear pending rows: ${delError.message}`);
  }

  const { error } = await supabase
    .from('sweet_spots')
    .insert(spots);

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  console.log(`  Inserted ${spots.length} sweet spots (status=pending)`);
}

// Live price helpers (Phase 5)
// Used by air-india-live.ts and marriott-live.ts to write real-time
// cash prices into the live_prices table.

export interface LivePriceInsert {
  sweet_spot_id:  string;
  cash_price_inr: number;
  search_date:    string;
  source:         string;
}

export async function upsertLivePrices(
  prices:  LivePriceInsert[],
  spotIds: string[],
  source:  string,
): Promise<void> {
  if (prices.length === 0) {
    console.log('  No live prices to insert.');
    return;
  }

  if (spotIds.length > 0) {
    const { error: delError } = await supabase
      .from('live_prices')
      .delete()
      .in('sweet_spot_id', spotIds)
      .eq('source', source);

    if (delError) {
      console.warn(`  Warning: could not clear stale live_prices: ${delError.message}`);
    }
  }

  const { error } = await supabase
    .from('live_prices')
    .insert(prices);

  if (error) {
    throw new Error(`live_prices insert failed: ${error.message}`);
  }

  console.log(`  Inserted ${prices.length} live price rows (source=${source})`);
}

// Logging

export function log(scraper: string, msg: string): void {
  console.log(`[${scraper}] ${msg}`);
}

export function logError(scraper: string, err: unknown): void {
  console.error(`[${scraper}] ERROR:`, err instanceof Error ? err.message : err);
}
