// ============================================================
// SweetRedeem.club — Supabase Database Types
//
// Auto-generate the full version with:
//   npx supabase gen types typescript --project-id <your-id> > lib/database.types.ts
//
// This hand-written version mirrors schema.sql + all migrations and is
// sufficient for the MVP. Replace with the generated version once the
// Supabase project is provisioned and migrations are applied.
//
// Run order:
//   schema.sql → 001 → seed.sql → 002 → 003
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {

      // ── cards ────────────────────────────────────────────────
      // Added: cash_redemption_cpp (migration 001)
      cards: {
        Row: {
          id: string;
          name: string;
          issuer: string;
          points_currency_name: string;
          base_earn_rate: number;
          is_active: boolean;
          cash_redemption_cpp: number;   // migration 001
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
      };

      // ── loyalty_programs ─────────────────────────────────────
      // Schema table name: loyalty_programs (not "transfer_programs")
      // type can be 'flight' | 'hotel' | 'hybrid'
      loyalty_programs: {
        Row: {
          id: string;
          name: string;
          full_name: string | null;
          type: 'flight' | 'hotel' | 'hybrid';
          currency_name: string;
          min_transfer_in: number;
          transfer_processing_days: number;
          website_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loyalty_programs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['loyalty_programs']['Insert']>;
      };

      // ── transfer_links ───────────────────────────────────────
      // Directed graph edges: card→program or program→program.
      // Schema table name: transfer_links (not "card_transfer_partners")
      // source_type = 'card'  → source_id is a cards.id
      // source_type = 'program' → source_id is a loyalty_programs.id
      // Transfer formula: floor((points_in / source_qty) * dest_qty)
      transfer_links: {
        Row: {
          id: string;
          source_type: 'card' | 'program';
          source_id: string;
          dest_type: 'program';
          dest_id: string;           // FK → loyalty_programs.id
          source_qty: number;        // e.g. 1 in "1:2"
          dest_qty: number;          // e.g. 2 in "1:2"
          min_points: number;
          transfer_fee: number;
          processing_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transfer_links']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transfer_links']['Insert']>;
      };

      // ── transfer_bonuses ─────────────────────────────────────
      // Limited-time bonus transfer promotions (e.g. Flying Blue 30% bonus).
      // Separate from transfer_links to keep the core graph stable.
      transfer_bonuses: {
        Row: {
          id: string;
          transfer_link_id: string;
          bonus_pct: number;          // 25 = +25% bonus miles
          valid_from: string;
          valid_to: string;
          source_url: string | null;
          status: 'pending' | 'approved' | 'live' | 'expired';
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['transfer_bonuses']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['transfer_bonuses']['Insert']>;
      };

      // ── sweet_spots ──────────────────────────────────────────
      // Curated high-value redemption opportunities.
      // cpp is a STORED generated column (est_cash_value_inr / points_required).
      // status lifecycle: pending → approved → live (RLS only exposes 'live').
      sweet_spots: {
        Row: {
          id: string;
          program_id: string;          // FK → loyalty_programs.id
          title: string;               // e.g. "BOM → SIN Business Class"
          route_or_property: string;   // e.g. "BOM-SIN" or "Park Hyatt Mumbai"
          category: 'economy' | 'business' | 'first' | 'hotel_standard' | 'hotel_suite';
          points_required: number;
          est_cash_value_inr: number;  // always stored in ₹
          source_value_native: number | null;
          source_currency: string | null;
          cpp: number;                 // GENERATED: est_cash_value_inr / points_required
          destination_url: string | null;
          status: 'pending' | 'approved' | 'live';
          last_verified_at: string;
          is_active: boolean;
          needs_review: boolean;
          created_at: string;
          updated_at: string;
          // ── virtual: populated from JOIN with loyalty_programs ──
          program_name?: string | null;
          program_type?: 'flight' | 'hotel' | 'hybrid' | null;
        };
        Insert: Omit<
          Database['public']['Tables']['sweet_spots']['Row'],
          'id' | 'cpp' | 'created_at' | 'updated_at' | 'program_name' | 'program_type'
        >;
        Update: Partial<Database['public']['Tables']['sweet_spots']['Insert']>;
      };

      // ── newsletter_subscribers ───────────────────────────────
      // Added in migration 003. No auth required to INSERT (anon key works).
      // No SELECT RLS policy — only service-role can read the list.
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: { email: string };
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
      };

      // ── profiles ─────────────────────────────────────────────
      // Auto-created via trigger when a Supabase Auth user is created.
      profiles: {
        Row: {
          id: string;   // = auth.users.id
          display_name: string | null;
          created_at: string;
        };
        Insert: { id: string; display_name?: string | null };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      // ── user_card_holdings ───────────────────────────────────
      // Stores a user's self-reported points balance per credit card.
      // Migration needed:
      //   CREATE TABLE user_card_holdings (
      //     id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      //     user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      //     card_id    uuid NOT NULL REFERENCES cards(id),
      //     points_balance bigint NOT NULL DEFAULT 0,
      //     updated_at timestamptz NOT NULL DEFAULT now(),
      //     UNIQUE (user_id, card_id)
      //   );
      //   ALTER TABLE user_card_holdings ENABLE ROW LEVEL SECURITY;
      //   CREATE POLICY "Users manage own holdings"
      //     ON user_card_holdings FOR ALL USING (auth.uid() = user_id);
      user_card_holdings: {
        Row: {
          id:             string;
          user_id:        string;
          card_id:        string;
          points_balance: number;
          updated_at:     string;
        };
        Insert: { user_id: string; card_id: string; points_balance: number };
        Update: Partial<Database['public']['Tables']['user_card_holdings']['Insert']>;
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Convenience row type aliases ──────────────────────────────
export type CardRow             = Database['public']['Tables']['cards']['Row'];
export type LoyaltyProgramRow   = Database['public']['Tables']['loyalty_programs']['Row'];
export type TransferLinkRow     = Database['public']['Tables']['transfer_links']['Row'];
export type SweetSpotRow        = Database['public']['Tables']['sweet_spots']['Row'];
export type ProfileRow          = Database['public']['Tables']['profiles']['Row'];
export type UserCardHoldingRow  = Database['public']['Tables']['user_card_holdings']['Row'];
