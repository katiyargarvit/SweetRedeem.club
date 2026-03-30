'use client';

// ============================================================
// NewsletterSignup — email input for sweet spot alerts.
//
// Auth-aware:
//  • If the signed-in user opted in during signup (stored in
//    localStorage under 'sr_nl_opted_in'), we skip the form
//    and show a subtle "already subscribed" badge instead.
//  • If they're signed in but never opted in (e.g. signed up
//    on a different device), the form is shown so they can
//    still subscribe.
//  • Anonymous visitors always see the form.
// ============================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { subscribeEmail } from '@/lib/supabase-queries';

type State = 'idle' | 'loading' | 'success' | 'error';

const NL_KEY = 'sr_nl_opted_in';

export default function NewsletterSignup() {
  const [email, setEmail]       = useState('');
  const [state, setState]       = useState<State>('idle');
  const [alreadyIn, setAlreadyIn] = useState(false);

  // Check localStorage for prior consent on this device
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(NL_KEY) : null;
    if (!stored) return;

    // If user is signed in, confirm the stored email matches their account
    supabase.auth.getSession().then(({ data }) => {
      const userEmail = data.session?.user?.email ?? '';
      if (stored === userEmail || stored === 'true') {
        setAlreadyIn(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('loading');
    try {
      await subscribeEmail(email);
      if (typeof window !== 'undefined') localStorage.setItem(NL_KEY, email);
      setState('success');
      setAlreadyIn(true);
      setEmail('');
    } catch {
      setState('error');
    }
  }

  // Already subscribed — show compact confirmation
  if (alreadyIn) {
    return (
      <div style={{
        borderRadius: 16,
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #F9F6F0, #F4ECD8)',
        border: '1px solid #EAEAEA',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>✓</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#00A86B' }}>You&apos;re on the list!</p>
          <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            We&apos;ll alert you when flash sales &amp; sweet spots drop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 16,
      padding: 18,
      background: 'linear-gradient(135deg, #F9F6F0, #F4ECD8)',
      border: '1px solid #EAEAEA',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    }}>
      <p className="label-tag" style={{ color: '#C5A059' }}>Stay ahead</p>
      <h3 style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 18, fontWeight: 700, marginTop: 6, lineHeight: 1.25, color: '#000',
      }}>
        Sweet spot alerts before they expire
      </h3>
      <p style={{ fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.5 }}>
        Flash sales, bonuses, and new routes — straight to your inbox.
      </p>

      {state === 'success' ? (
        <p style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: '#00A86B' }}>
          ✓ You&apos;re in! We&apos;ll alert you when sweet spots go live.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%', marginTop: 12,
              padding: '12px 14px', borderRadius: 12,
              border: '1px solid #EAEAEA', background: '#fff',
              fontSize: 14, color: '#000', outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            type="submit"
            className="btn-dark"
            disabled={state === 'loading'}
            style={{ marginTop: 10, opacity: state === 'loading' ? 0.6 : 1 }}
          >
            {state === 'loading' ? 'Sending…' : 'Get Alerts →'}
          </button>
          {state === 'error' && (
            <p style={{ fontSize: 12, color: '#E03E3E', marginTop: 6 }}>
              Something went wrong — please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
