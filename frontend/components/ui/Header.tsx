'use client';

// ============================================================
// Header — auth-aware client component
// Figma-matched: white background, clean minimal nav
//
// States:
//   loading  → no CTA shown (avoids sign-in/sign-out flicker on load)
//   signed-out → "Sign up →" pill (dark bg)
//   signed-in  → user initial avatar + "Sign out" on tap
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
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

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
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';
  const emailShort = user?.email
    ? user.email.length > 22 ? user.email.slice(0, 20) + '…' : user.email
    : '';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #F0F0F0',
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
          {/* Brand icon: dark square with gold star */}
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#121212',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontSize: 13, color: '#C5A059', lineHeight: 1 }}>✦</span>
          </span>
          {/* Brand name */}
          <span style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#0A0A0A',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            SweetRedeem
            <span style={{ color: '#C5A059' }}>.club</span>
          </span>
        </Link>

        {/* ── Right CTA ─────────────────────────────────────── */}
        {authLoading ? (
          /* Skeleton */
          <div style={{ width: 72, height: 30, borderRadius: 9999, background: '#F0F0F0' }} />

        ) : user ? (
          /* Signed-in state */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Avatar initial */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#121212',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#C5A059',
              flexShrink: 0,
            }}>
              {initial}
            </div>
            {/* Sign-out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                padding: '6px 13px',
                borderRadius: 9999,
                background: 'transparent',
                border: '1px solid #E8E8E8',
                color: '#555',
                fontSize: 12, fontWeight: 600,
                cursor: signingOut ? 'wait' : 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'border-color 0.15s',
              }}
              title={`Signed in as ${emailShort}`}
            >
              {signingOut ? '…' : 'Sign out'}
            </button>
          </div>

        ) : (
          /* Signed-out state — dark pill CTA matching Figma */
          <Link
            href="/signup"
            style={{
              padding: '8px 18px',
              borderRadius: 9999,
              background: '#121212',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              transition: 'opacity 0.15s',
            }}
          >
            Sign up →
          </Link>
        )}
      </div>
    </header>
  );
}
