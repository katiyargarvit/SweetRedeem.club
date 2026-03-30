// ============================================================
// Supabase client — uses SERVICE ROLE KEY to bypass RLS.
// This file is server/scraper only. Never expose to browser.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from the frontend directory (one level up)
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env.local') });

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Make sure frontend/.env.local exists and has both keys.'
  );
}

export const supabase = createClient(url, key);
