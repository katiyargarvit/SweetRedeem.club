// ============================================================
// Admin API — /api/admin/scrapers
//
// GET → latest scraper_run per scraper_name (service role)
//
// Auth: verifies Supabase JWT, email must be katiyargarvit@gmail.com.
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

// ── GET — latest run per scraper ──────────────────────────────
export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch last 100 runs ordered by time desc, then deduplicate by name in JS.
  // This avoids a DISTINCT ON query that Supabase's JS client doesn't support natively.
  const { data, error } = await supabaseAdmin
    .from('scraper_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Keep only the most recent run per scraper_name
  const seen = new Set<string>();
  const latest = (data ?? []).filter((row) => {
    if (seen.has(row.scraper_name)) return false;
    seen.add(row.scraper_name);
    return true;
  });

  return NextResponse.json(latest);
}
