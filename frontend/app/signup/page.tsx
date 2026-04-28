'use client';

// ============================================================
// Signup page — V3 Quiet Luxury
// Passwordless magic-link auth via Supabase Auth.
// Also subscribes the email to the newsletter_subscribers table
// so we capture leads even before the project is fully live.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { subscribeEmail } from '@/lib/supabase-queries';

type Stage = 'idle' | 'loading' | 'sent' | 'error';

// localStorage key for newsletter consent (set on this device at signup)
const NL_KEY = 'sr_nl_opted_in';

const PERKS = [
  { icon: '🔍', text: 'See all sweet spots — not just the top 4' },
  { icon: '⚡', text: 'Get alert when Flying Blue flash sales drop' },
  { icon: '📊', text: 'Track your points balance across all cards' },
  { icon: '✦',  text: 'First access to new routes as they are verified' },
];

export default function SignupPage() {
  const [email, setEmail]           = useState('');
  const [stage, setStage]           = useState<Stage>('idle');
  const [error, setError]           = useState('');
  const [nlConsent, setNlConsent]   = useState(true); // default opt-in

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStage('loading');
    setError('');

    const trimmedEmail = email.trim();

    try {
      // 1. Newsletter — only subscribe if user explicitly opted in
      if (nlConsent) {
        try {
          await subscribeEmail(trimmedEmail);
          // Persist consent on this device so NewsletterSignup doesn't re-appear
          if (typeof window !== 'undefined') {
            localStorage.setItem(NL_KEY, trimmedEmail);
          }
        } catch (_) { /* fail silently — auth must not be blocked by this */ }
      }

      // 2. Send Supabase magic link (passwordless)
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          // Redirect back to home after clicking the magic link
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/`,
          shouldCreateUser: true,
        },
      });

      if (authError) throw authError;

      setStage('sent');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setStage('error');
    }
  }

  return (
    <div style={{ padding: '32px 24px 0', background: '#F9F6F0', minHeight: '100vh' }}>

      {/* ── Back nav ─────────────────────────────────────────── */}
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 12, fontWeight: 700, color: '#999',
        textDecoration: 'none', marginBottom: 28,
      }}>
        ← Back
      </Link>

      {/* ── Logo mark ────────────────────────────────────────── */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#121212',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 22, color: '#C5A059' }}>✦</span>
      </div>

      {stage === 'sent' ? (
        /* ── Success state ──────────────────────────────────── */
        <div>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28, fontWeight: 700, color: '#000',
            lineHeight: 1.2, marginBottom: 12,
          }}>
            Check your inbox ✉️
          </h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
            We've sent a magic link to{' '}
            <strong style={{ color: '#000' }}>{email}</strong>.{' '}
            Click it to sign in — no password needed, ever.
          </p>
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
            padding: '16px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>
              Didn't get it? Check your spam folder. The link expires in 1 hour.
              You can also close this tab and click "Sign up" again to resend.
            </p>
          </div>
          <button
            onClick={() => { setStage('idle'); setEmail(''); }}
            style={{
              fontSize: 13, fontWeight: 700, color: '#C5A059',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            Use a different email →
          </button>
        </div>

      ) : (
        /* ── Form state ─────────────────────────────────────── */
        <>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28, fontWeight: 700, color: '#000',
            lineHeight: 1.2, marginBottom: 8,
          }}>
            Unlock the full picture.
          </h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
            Free account. No credit card. No password — just a magic link.
          </p>

          {/* ── Perks list ─────────────────────────────────── */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
            padding: '16px', marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PERKS.map((perk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(197,160,89,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {perk.icon}
                  </div>
                  <p style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{perk.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sign-up form ────────────────────────────────── */}
          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 6,
            }}>
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              style={{
                display: 'block', width: '100%',
                padding: '14px 16px', borderRadius: 12,
                border: `1px solid ${error ? '#E03E3E' : '#EAEAEA'}`,
                background: '#fff', fontSize: 16, color: '#000',
                outline: 'none', fontFamily: 'Inter, sans-serif',
                marginBottom: 12,
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#C5A059'; }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#E03E3E' : '#EAEAEA'; }}
            />

            {/* Newsletter consent checkbox */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 16, cursor: 'pointer',
            }}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                <input
                  type="checkbox"
                  checked={nlConsent}
                  onChange={(e) => setNlConsent(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#C5A059', cursor: 'pointer' }}
                />
              </div>
              <span style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                Send me sweet spot alerts — flash sales, bonus transfers &amp; new routes.
                <span style={{ color: '#C5A059', fontWeight: 700 }}> Recommended ✓</span>
              </span>
            </label>

            {/* Error message */}
            {stage === 'error' && (
              <p style={{
                fontSize: 12, color: '#E03E3E',
                marginBottom: 12, lineHeight: 1.5,
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || stage === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '14px',
                borderRadius: 12, border: 'none',
                background: isValid && stage !== 'loading' ? '#121212' : '#E0D8CC',
                color: isValid && stage !== 'loading' ? '#fff' : '#999',
                fontSize: 15, fontWeight: 800,
                cursor: isValid && stage !== 'loading' ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              {stage === 'loading' ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                  Sending magic link…
                </>
              ) : (
                'Get my free account →'
              )}
            </button>
          </form>

          {/* ── Legal ────────────────────────────────────────── */}
          <p style={{
            fontSize: 11, color: '#ccc', marginTop: 16, lineHeight: 1.6,
          }}>
            By signing up you agree to our{' '}
            <Link href="/terms" style={{ color: '#999', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#999', textDecoration: 'underline' }}>Privacy Policy</Link>.
            We'll only email you about your points — never spam.
          </p>

          {/* ── Existing user ────────────────────────────────── */}
          <p style={{ fontSize: 12, color: '#999', marginTop: 20, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#C5A059', fontWeight: 700, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
