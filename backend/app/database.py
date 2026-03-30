"""
database.py — Supabase client singleton
────────────────────────────────────────
Two clients are exposed:

  supabase_admin   Uses the service role key. Bypasses RLS.
                   Use for server-side reads (calculator, routing).
                   NEVER expose this key to the frontend.

  supabase_client  Uses the anon key. Respects RLS.
                   Use when acting on behalf of an authenticated user.
"""

from supabase import create_client, Client
from app.config import settings

# Server-side client — full access, bypasses RLS
supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)

# User-facing client — respects RLS policies
supabase_client: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)
