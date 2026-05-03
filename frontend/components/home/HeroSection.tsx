'use client';

// ============================================================
// HeroSection — Figma Make design (03-May)
// Badge → Headline → Subtitle → Stats row
// ============================================================

import { useEffect, useState } from 'react';

const STATS = [
  { value: '₹2.1L+',  label: 'Avg Value\nper 100K pts' },
  { value: '50K+',    label: 'Routes\nAnalyzed'        },
  { value: '₹1.5Cr+', label: 'Value\nUnlocked'         },
];

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section style={{
      background:     '#fff',
      padding:        '32px 20px 28px',
      textAlign:      'center',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
    }}>

      {/* ── Badge ──────────────────────────────────────────── */}
      <div style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           6,
        padding:       '6px 14px',
        borderRadius:  9999,
        background:    '#EFF6FF',
        border:        '1px solid #DBEAFE',
        marginBottom:  24,
        opacity:       mounted ? 1 : 0,
        transform:     mounted ? 'translateY(0)' : 'translateY(8px)',
        transition:    'opacity 0.45s ease, transform 0.45s ease',
      }}>
        {/* Sparkles icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
          <path d="M5 3l.7 1.8L7.5 5l-1.8.7L5 7.5l-.7-1.8L2.5 5l1.8-.7z" />
          <path d="M19 17l.7 1.8L21.5 19l-1.8.7L19 21.5l-.7-1.8L16.5 19l1.8-.7z" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.01em' }}>
          India&apos;s Premium Points Optimizer
        </span>
      </div>

      {/* ── Headline ───────────────────────────────────────── */}
      <h1 style={{
        fontSize:      36,
        fontWeight:    800,
        letterSpacing: '-0.025em',
        lineHeight:    1.15,
        color:         '#0f172a',
        margin:        '0 0 16px',
        opacity:       mounted ? 1 : 0,
        transform:     mounted ? 'translateY(0)' : 'translateY(10px)',
        transition:    'opacity 0.5s ease 0.06s, transform 0.5s ease 0.06s',
      }}>
        Unlock the True Value<br />of Your Points.{' '}
        <span style={{
          background: 'linear-gradient(90deg, #2563EB 0%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
        }}>
          Instantly.
        </span>
      </h1>

      {/* ── Subtitle ───────────────────────────────────────── */}
      <p style={{
        fontSize:   14,
        color:      '#64748b',
        lineHeight: 1.65,
        maxWidth:   300,
        margin:     '0 auto 32px',
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.55s ease 0.12s, transform 0.55s ease 0.12s',
      }}>
        Unlock free flights and dream vacations—while getting up to{' '}
        <strong style={{ color: '#059669', fontWeight: 700 }}>4x more value</strong> from your points.
      </p>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        width:          '100%',
        opacity:        mounted ? 1 : 0,
        transform:      mounted ? 'translateY(0)' : 'translateY(10px)',
        transition:     'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                fontSize:      22,
                fontWeight:    800,
                letterSpacing: '-0.03em',
                color:         '#0f172a',
                marginBottom:  2,
              }}>
                {s.value}
              </span>
              <span style={{
                fontSize:       9,
                fontWeight:     700,
                color:          '#64748b',
                textTransform:  'uppercase',
                letterSpacing:  '0.08em',
                lineHeight:     1.4,
                whiteSpace:     'pre-line',
              }}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div style={{ width: 1, background: '#E2E8F0', alignSelf: 'center', height: 36, flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

    </section>
  );
}
