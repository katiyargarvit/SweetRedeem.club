'use client';

// ============================================================
// Header — auth-aware client component
//
// States:
//   loading  → no CTA shown (avoids sign-in/sign-out flicker on load)
//   signed-out → "Sign in →" pill
//   signed-in  → user initial avatar + email chip + "Sign out" on tap
//
// Uses supabase.auth.onAuthStateChange so it reacts instantly after
// a magic link is clicked (session is set by the Supabase client from
// the URL hash, triggering SIGNED_IN here automatically).
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // Initialise from existing session (handles magic-link hash on first load)
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    // Keep in sync for the duration of the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    // onAuthStateChange fires → sets user to null → CTA flips back to "Sign in"
  }

  // User's display initial (first char of email or display name)
  const initial = user?.email?.[0]?.toUpperCase() ?? '?';
  // Abbreviated email for the chip (trim to 20 chars)
  const emailShort = user?.email
    ? user.email.length > 22
      ? user.email.slice(0, 20) + '…'
      : user.email
    : '';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(249,246,240,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #EAEAEA',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* ── Wordmark ─────────────────────────────────────── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#121212',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, color: '#C5A059' }}>✦</span>
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: '#000' }}>
            SweetRedeem<span style={{ color: '#C5A059' }}>.club</span>
          </span>
        </Link>

        {/* ── Right CTA ─────────────────────────────────────── */}
        {authLoading ? (
          /* Skeleton placeholder — no CTA flicker */
          <div style={{ width: 72, height: 28, borderRadius: 9999, background: '#EAEAEA' }} />

        ) : user ? (
          /* Signed-in state */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Avatar initial */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#121212',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#C5A059',
              flexShrink: 0,
            }}>
              {initial}
            </div>

            {/* Sign-out button */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: 'transparent',
                border: '1px solid #EAEAEA',
                color: '#666',
                fontSize: 12, fontWeight: 700,
                cursor: signingOut ? 'wait' : 'pointer',
                transition: 'all 0.12s',
              }}
              title={`Signed in as ${emailShort}`}
            >
              {signingOut ? '…' : 'Sign out'}
            </button>
          </div>

        ) : (
          /* Signed-out state */
          <Link
            href="/signup"
            style={{
              padding: '7px 16px',
              borderRadius: 9999,
              background: '#121212',
              color: '#fff',
              fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            Sign up →
          </Link>
        )}
      </div>
    </header>
  );
}
