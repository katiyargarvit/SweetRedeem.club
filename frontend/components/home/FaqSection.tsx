'use client';

// ============================================================
// FaqSection — "Decoding the Club" accordion FAQ
// ============================================================

import { useState } from 'react';

const FAQS = [
  {
    q: 'Why do most card holders redeem poorly?',
    a: 'Most credit card holders default to statement credits or cashback because it\'s the path of least resistance. Banks make these options prominent because they cost less. SweetRedeem helps you find the redemptions banks don\'t advertise — worth 2–4× more.',
  },
  {
    q: 'Do you have verified deals or an algorithm?',
    a: 'Both. Our community verifies sweet spots manually, and we track live award availability across 30+ loyalty programmes. Every deal shows its last verification date so you know how fresh it is.',
  },
  {
    q: 'How should I use SweetRedeem for best results?',
    a: 'Start with the CPP Calculator — enter your card and points, and we\'ll show you the highest-value redemptions available. Focus on deals with CPP ≥ 2.0 for meaningful uplift over bank portal rates.',
  },
  {
    q: 'What cards does SweetRedeem work with?',
    a: 'Currently: HDFC Infinia, HDFC Regalia, Axis Atlas, Axis Magnus, Amex Platinum Travel, HSBC Premier, and SBI Aurum. More cards are added regularly — sign up to be notified.',
  },
  {
    q: 'What does SweetRedeem cost?',
    a: 'Core discovery and sweet spot browsing are completely free. A premium Club tier with real-time alerts, personalised CPP analysis, and early access to flash deals is coming. Founding members get priority access.',
  },
  {
    q: 'Is it safe to use? Why do I need an account?',
    a: 'We never access your bank account or card details. An optional account lets us remember your cards and send alerts when new sweet spots match your profile. You can browse anonymously forever.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ padding: '40px 20px 0' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#90a1b9',
          letterSpacing: '1.1px', textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          Got questions?
        </p>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: '#0f172b',
          letterSpacing: '-0.5px', margin: 0,
        }}>
          Decoding the Club.
        </h2>
      </div>

      {/* ── FAQ items ────────────────────────────────────── */}
      {FAQS.map((faq, i) => (
        <div
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            marginBottom: 8,
            cursor: 'pointer',
            boxShadow: open === i ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.15s',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '14px 16px',
          }}>
            <p style={{
              fontSize: 13, fontWeight: 600, color: '#0f172b',
              flex: 1, paddingRight: 8, margin: 0, lineHeight: 1.45,
            }}>
              {faq.q}
            </p>
            <span style={{
              fontSize: 18, color: open === i ? '#2563eb' : '#90a1b9',
              transition: 'transform 0.2s, color 0.15s',
              transform: open === i ? 'rotate(90deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}>
              ›
            </span>
          </div>
          {open === i && (
            <div style={{
              padding: '0 16px 14px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: 12,
            }}>
              <p style={{
                fontSize: 13, color: '#64748b',
                lineHeight: 1.7, margin: 0,
              }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}

    </div>
  );
}
