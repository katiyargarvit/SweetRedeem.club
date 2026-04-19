// ============================================================
// SweetRedeem.club — Supabase Query Functions
//
// All data fetching goes through here.
// Components import from this file, never from supabase.ts directly.
//
// Table name reference (schema.sql + migrations):
//   cards                 → fetchCards, fetchCard
//   loyalty_programs      → fetchPrograms             (was "transfer_programs" — fixed)
//   transfer_links        → fetchCardRoutes            (was "card_transfer_partners" — fixed)
//   transfer_bonuses      → (Phase 2 — not used in MVP)
//   sweet_spots           → fetchSweetSpots, fetchDealOfTheDay
//   newsletter_subscribers→ subscribeEmail
//
// Naming convention:
//   fetch*  → async, throws on error, returns data
//   mutate* → async, throws on error, returns void | id
// ============================================================

import { supabase } from './supabase';
import type { CardRow, LoyaltyProgramRow, SweetSpotRow, UserCardHoldingRow } from './database.types';

// ── Cards ─────────────────────────────────────────────────────

/** Fetch all active credit cards, ordered by name */
export async function fetchCards(): Promise<CardRow[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw new Error(`fetchCards: ${error.message}`);
  return data ?? [];
}

/** Fetch a single card by ID */
export async function fetchCard(id: string): Promise<CardRow | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`fetchCard: ${error.message}`);
  return data ?? null;
}

// ── Loyalty Programs ──────────────────────────────────────────
// Schema table: loyalty_programs (not "transfer_programs")

/** Fetch all active loyalty programmes, optionally filtered by type */
export async function fetchPrograms(
  type?: 'flight' | 'hotel',
): Promise<LoyaltyProgramRow[]> {
  let query = supabase
    .from('loyalty_programs')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) throw new Error(`fetchPrograms: ${error.message}`);
  return data ?? [];
}

// ── Sweet Spots ───────────────────────────────────────────────

export interface SweetSpotFilters {
  category?: 'economy' | 'business' | 'first' | 'hotel_standard' | 'hotel_suite' | 'all';
  program_type?: 'flight' | 'hotel';
  min_cpp?: number;
  limit?: number;
  offset?: number;
}

/**
 * Fetch live sweet spots joined with their programme name + type.
 * Default: top 20 by CPP descending.
 *
 * RLS note: the anon key can only see rows where status = 'live' AND is_active = TRUE.
 * The status filter below is redundant but makes the intent explicit.
 */
export async function fetchSweetSpots(
  filters: SweetSpotFilters = {},
): Promise<SweetSpotRow[]> {
  const {
    category,
    min_cpp,
    limit = 20,
    offset = 0,
  } = filters;

  let query = supabase
    .from('sweet_spots')
    .select(`
      *,
      loyalty_programs ( name, type )
    `)
    .eq('status', 'live')
    .eq('is_active', true)
    .eq('needs_review', false)
    .order('cpp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'all') query = query.eq('category', category);
  if (min_cpp !== undefined)          query = query.gte('cpp', min_cpp);

  const { data, error } = await query;
  if (error) throw new Error(`fetchSweetSpots: ${error.message}`);

  // Flatten joined loyalty_programs fields onto each row
  return (data ?? []).map((row: any) => ({
    ...row,
    program_name: row.loyalty_programs?.name ?? null,
    program_type: row.loyalty_programs?.type ?? null,
    loyalty_programs: undefined,
  })) as SweetSpotRow[];
}

/** Fetch a single sweet spot by ID */
export async function fetchSweetSpotById(id: string): Promise<SweetSpotRow | null> {
  const { data, error } = await supabase
    .from('sweet_spots')
    .select(`*, loyalty_programs ( name, type )`)
    .eq('id', id)
    .eq('status', 'live')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`fetchSweetSpotById: ${error.message}`);
  if (!data) return null;

  return {
    ...(data as any),
    program_name: (data as any).loyalty_programs?.name ?? null,
    program_type: (data as any).loyalty_programs?.type ?? null,
    loyalty_programs: undefined,
  } as SweetSpotRow;
}

/** Fetch the single highest-CPP live sweet spot (Deal of the Day) */
export async function fetchDealOfTheDay(): Promise<SweetSpotRow | null> {
  const { data, error } = await supabase
    .from('sweet_spots')
    .select(`*, loyalty_programs ( name, type )`)
    .eq('status', 'live')
    .eq('is_active', true)
    .eq('needs_review', false)
    .order('cpp', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`fetchDealOfTheDay: ${error.message}`);
  if (!data) return null;

  return {
    ...(data as any),
    program_name: (data as any).loyalty_programs?.name ?? null,
    program_type: (data as any).loyalty_programs?.type ?? null,
    loyalty_programs: undefined,
  } as SweetSpotRow;
}

// ── Card × Transfer partner routes ───────────────────────────
// Schema table: transfer_links (not "card_transfer_partners")
// transfer_links is a directed graph: source_type='card' + source_id=card_id
// → dest_id (loyalty_programs.id) with source_qty:dest_qty ratio.

export interface PartnerRoute {
  program_id:      string;
  program_name:    string;
  program_type:    'flight' | 'hotel' | 'hybrid';
  ratio_from:      number;   // source_qty — e.g. 1 in "1:2"
  ratio_to:        number;   // dest_qty   — e.g. 2 in "1:2"
  website_url:     string | null;
  processing_days: number;
  has_bonus?:      boolean;  // true when a live transfer bonus is active
}

/**
 * Fetch all active transfer partner routes for a given card.
 * Joins with loyalty_programs to get the programme name and type.
 */
export async function fetchCardRoutes(card_id: string): Promise<PartnerRoute[]> {
  const { data, error } = await supabase
    .from('transfer_links')
    .select(`
      source_qty,
      dest_qty,
      processing_days,
      loyalty_programs!dest_id ( id, name, type, website_url )
    `)
    .eq('source_type', 'card')
    .eq('source_id', card_id)
    .eq('is_active', true);

  if (error) throw new Error(`fetchCardRoutes: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    program_id:      row.loyalty_programs?.id          ?? '',
    program_name:    row.loyalty_programs?.name        ?? '',
    program_type:    row.loyalty_programs?.type        ?? 'flight',
    ratio_from:      row.source_qty,
    ratio_to:        row.dest_qty,
    website_url:     row.loyalty_programs?.website_url ?? null,
    processing_days: row.processing_days,
  }));
}

// ── Newsletter ────────────────────────────────────────────────
// Table added in migration 003.
// Anon key can INSERT (RLS policy: "Anyone can subscribe").
// No SELECT policy — only service-role can read the list.

/**
 * Subscribe an email to the waitlist.
 * Uses upsert so duplicate submissions silently no-op.
 */
export async function subscribeEmail(email: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('newsletter_subscribers')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

  if (error) throw new Error(`subscribeEmail: ${error.message}`);
}

// ── User Card Holdings ────────────────────────────────────────
// Table: user_card_holdings (migration needed — see database.types.ts for DDL)
// Falls back gracefully if the table doesn't exist yet.

/**
 * Fetch all card holdings for the authenticated user.
 * Returns [] if the table doesn't exist yet (pre-migration).
 */
export async function fetchUserHoldings(userId: string): Promise<UserCardHoldingRow[]> {
  const { data, error } = await (supabase as any)
    .from('user_card_holdings')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  // Gracefully handle missing table (42P01 = undefined_table in Postgres)
  if (error) {
    if (error.code === '42P01' || error.message?.includes('does not exist')) return [];
    throw new Error(`fetchUserHoldings: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Upsert a single card holding for the authenticated user.
 * Sets points_balance for (user_id, card_id), updating if the row exists.
 */
export async function saveUserHolding(
  userId: string,
  cardId: string,
  pointsBalance: number,
): Promise<void> {
  const { error } = await (supabase as any)
    .from('user_card_holdings')
    .upsert(
      { user_id: userId, card_id: cardId, points_balance: pointsBalance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,card_id' },
    );

  if (error) throw new Error(`saveUserHolding: ${error.message}`);
}

/**
 * Delete a card holding (user removed the card from their portfolio).
 */
export async function deleteUserHolding(userId: string, cardId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('user_card_holdings')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId);

  if (error) throw new Error(`deleteUserHolding: ${error.message}`);
}

// ── Formatting helpers ────────────────────────────────────────

/** Format a number as abbreviated INR (e.g. ₹2.4L, ₹85K) */
export function formatINR(value: number): string {
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (value >= 1_000)    return `₹${Math.round(value / 1_000)}K`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Format a full INR value with Indian comma grouping (e.g. ₹2,40,000) */
export function formatINRFull(value: number): string {
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

/** Format points with Indian number system (e.g. 1,00,000) */
export function formatPoints(n: number): string {
  return n.toLocaleString('en-IN');
}

/** CPP → value tier label */
export function cppTier(cpp: number): { label: string; badgeClass: string } {
  if (cpp >= 2.0) return { label: 'Elite Value', badgeClass: 'badge-elite' };
  if (cpp >= 1.2) return { label: 'High Value',  badgeClass: 'badge-high'  };
  if (cpp >= 0.8) return { label: 'Good Value',  badgeClass: 'badge-good'  };
  return              { label: 'Poor Value',  badgeClass: 'badge-poor'  };
}

/** Category key → human label */
export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    economy:        'Economy',
    business:       'Business',
    first:          'First Class',
    hotel_standard: 'Standard Room',
    hotel_suite:    'Suite',
  };
  return map[category] ?? category;
}
