// ============================================================
// Admin API — /api/admin/spots
//
// GET  → list all pending sweet spots (service role, bypasses RLS)
// PATCH → update status or est_cash_value_inr for a single spot
//
// Auth: verifies the Supabase JWT from the Authorization header
//       and confirms email === katiyargarvit@gmail.com.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return false;
  return user.email === 'katiyargarvit@gmail.com';
}

// ── GET — pending spots ───────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('sweet_spots')
    .select('*, loyalty_programs!program_id(name, type)')
    .eq('status', 'pending')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const spots = (data ?? []).map((row: any) => ({
    ...row,
    program_name: row.loyalty_programs?.name ?? null,
    program_type: row.loyalty_programs?.type ?? null,
    loyalty_programs: undefined,
  }));

  return NextResponse.json(spots);
}

// ── PATCH — update status or price ───────────────────────────
// Body: { id: string, action?: 'approve'|'go_live'|'reject', est_cash_value_inr?: number }
export async function PATCH(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    id: string;
    action?: 'approve' | 'go_live' | 'reject';
    est_cash_value_inr?: number;
  };

  const { id, action, est_cash_value_inr } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (action === 'approve') {
    updates.status = 'approved';
  } else if (action === 'go_live') {
    updates.status = 'live';
    updates.needs_review = false;
    updates.last_verified_at = new Date().toISOString();
  } else if (action === 'reject') {
    updates.is_active = false;
  }

  if (est_cash_value_inr !== undefined) {
    updates.est_cash_value_inr = est_cash_value_inr;
  }

  const { error } = await supabaseAdmin
    .from('sweet_spots')
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
