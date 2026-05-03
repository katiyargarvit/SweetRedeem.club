'use client';

// ============================================================
// Header -- frosted glass top nav, hide-on-scroll-down
// Matches Figma Make design (03-May)
// ============================================================

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut]   = useState(false);
  const [hidden, setHidden]           = useState(false);
  const lastScrollY                   = useRef(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 10) setHidden(true);
      else setHidden(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  const initial    = user?.email?.[0]?.toUpperCase() ?? '?';
  const emailShort = user?.email
    ? user.email.length > 22 ? user.email.slice(0, 20) + '...' : user.email
    : '';

  return (
    <header
      style={{
        position:   'sticky',
        top:        0,
        zIndex:     50,
        width:      '100%',
        paddingTop: 'env(safe-area-inset-top)',
        transform:  hidden ? 'translateY(-110%)' : 'translateY(0)',
        transition: 'transform 300ms ease-out',
      }}
    >
      {/* Frosted glass backdrop */}
      <div style={{
        position:             'absolute',
        inset:                0,
        background:           'rgba(255,255,255,0.82)',
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom:         '1px solid rgba(255,255,255,0.5)',
        boxShadow:            '0 4px 24px rgba(0,0,0,0.05)',
        pointerEvents:        'none',
      }} />

      <div style={{
        position:       'relative',
        maxWidth:       480,
        margin:         '0 auto',
        padding:        '0 20px',
        height:         54,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>

        {/* Wordmark */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{
            fontSize:      18,
            fontWeight:    800,
            letterSpacing: '-0.03em',
            color:         '#0f172a',
            fontFamily:    "'Inter', system-ui, sans-serif",
          }}>
            SweetRedeem
          </span>
          <span style={{
            fontSize:      15,
            fontWeight:    400,
            color:         '#2563EB',
            fontFamily:    "Georgia, 'Times New Roman', serif",
            fontStyle:     'italic',
            letterSpacing: '-0.01em',
          }}>
            .club
          </span>
        </Link>

        {/* Right CTA */}
        {authLoading ? (
          <div style={{ width: 72, height: 32, borderRadius: 9999, background: '#F1F5F9' }} />

        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width:          30,
              height:         30,
              borderRadius:   '50%',
              background:     '#0f172a',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       12,
              fontWeight:     800,
              color:          '#fff',
              flexShrink:     0,
            }}>
              {initial}
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title={`Signed in as ${emailShort}`}
              style={{
                padding:      '7px 14px',
                borderRadius: 9999,
                background:   'transparent',
                border:       '1px solid #E2E8F0',
                color:        '#64748b',
                fontSize:     12,
                fontWeight:   600,
                cursor:       signingOut ? 'wait' : 'pointer',
                fontFamily:   "'Inter', system-ui, sans-serif",
              }}
            >
              {signingOut ? '...' : 'Sign out'}
            </button>
          </div>

        ) : (
          <Link
            href="/signup"
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            5,
              padding:        '8px 18px',
              borderRadius:   9999,
              background:     'rgba(15,23,42,0.9)',
              color:          '#fff',
              fontSize:       13,
              fontWeight:     700,
              textDecoration: 'none',
              letterSpacing:  '-0.01em',
              fontFamily:     "'Inter', system-ui, sans-serif",
              boxShadow:      '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Sign up
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
