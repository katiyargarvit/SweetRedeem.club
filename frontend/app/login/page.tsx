'use client';

// ============================================================
// Login page — V3 Quiet Luxury
// Passwordless magic-link sign-in via Supabase Auth.
// Same mechanism as signup — signInWithOtp creates or signs in.
// Returning users land here from the header after signing out.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Stage = 'idle' | 'loading' | 'sent' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStage('loading');
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          // shouldCreateUser: false → only sign in existing users.
          // Set to true so a mistyped URL doesn't silently fail for new users.
          shouldCreateUser: false,
        },
      });

      if (authError) throw authError;
      setStage('sent');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      // Surface the "user not found" case with a friendly redirect hint
      const friendly =
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('no user') ||
        msg.toLowerCase().includes('signups not allowed')
          ? 'No account found for that email. Try signing up instead.'
          : msg;
      setError(friendly);
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
            Magic link sent ✉️
          </h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
            Check your inbox at{' '}
            <strong style={{ color: '#000' }}>{email}</strong>.
            Click the link to sign in — it expires in 1 hour.
          </p>
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
            padding: '14px 16px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>
              Didn't get it? Check spam, or click "Use a different email" to resend.
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
            Welcome back.
          </h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 28 }}>
            Enter your email and we'll send you a magic link.
            No password. Ever.
          </p>

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
                border: `1px solid ${stage === 'error' ? '#E03E3E' : '#EAEAEA'}`,
                background: '#fff', fontSize: 16, color: '#000',
                outline: 'none', fontFamily: 'Inter, sans-serif',
                marginBottom: 12,
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#C5A059'; }}
              onBlur={(e) => { e.target.style.borderColor = stage === 'error' ? '#E03E3E' : '#EAEAEA'; }}
            />

            {stage === 'error' && (
              <p style={{ fontSize: 12, color: '#E03E3E', marginBottom: 12, lineHeight: 1.5 }}>
                {error}
                {error.includes('signing up') && (
                  <>
                    {' '}
                    <Link href="/signup" style={{ color: '#C5A059', fontWeight: 700, textDecoration: 'none' }}>
                      Sign up here →
                    </Link>
                  </>
                )}
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
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                  Sending…
                </>
              ) : (
                'Send magic link →'
              )}
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#999', marginTop: 20, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#C5A059', fontWeight: 700, textDecoration: 'none' }}>
              Sign up free →
            </Link>
          </p>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
