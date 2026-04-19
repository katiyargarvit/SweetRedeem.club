'use client';

// ============================================================
// HeroSection — animated hero matching Figma / V3 prototype
//
// Animations:
//   - Rotating showcase: sentence fades as one block
//     "Redeem [pts] [card] points for a sweet [deal]"
//   - Value counter: counts up to the new value on each cycle
//   - Stats row: slide-up on mount
// ============================================================

import { useEffect, useState, useRef } from 'react';

// ── Rotating showcase data ──────────────────────────────────
const SHOWCASE = [
  { pts: '1,00,000', card: 'HDFC Infinia',  deal: 'Business Class flight', value: '₹2,40,000' },
  { pts: '50,000',   card: 'Axis Atlas',    deal: 'flight to Singapore',   value: '₹1,05,000' },
  { pts: '30,000',   card: 'Amex MRCC',     deal: 'premium hotel stay',    value: '₹78,000'   },
  { pts: '75,000',   card: 'Axis Olympus',  deal: 'First Class upgrade',   value: '₹1,80,000' },
];

// ── Tiny number counter hook ───────────────────────────────
function useCountUp(target: string, duration = 900) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    if (target === prevRef.current) return;
    prevRef.current = target;

    // Extract numeric part for animation (strip ₹ commas)
    const raw = parseInt(target.replace(/[₹,]/g, ''), 10);
    const prevRaw = parseInt(display.replace(/[₹,]/g, ''), 10) || 0;
    const hasRupee = target.startsWith('₹');

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(prevRaw + (raw - prevRaw) * ease);
      const formatted = hasRupee
        ? '₹' + current.toLocaleString('en-IN')
        : current.toLocaleString('en-IN');
      setDisplay(formatted);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export default function HeroSection() {
  const [idx, setIdx]     = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const current = SHOWCASE[idx];
  const valueDisplay = useCountUp(current.value);

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate showcase every 3.5 s with a 400 ms fade-out/in
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % SHOWCASE.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '32px 20px 28px',
      textAlign: 'center',
    }}>

      {/* ── Eyebrow badge ──────────────────────────────────── */}
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px 6px 10px',
          borderRadius: 9999,
          background: '#F5F7FF',
          border: '0.75px solid #E0E7FF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <span style={{ fontSize: 13, color: '#4F46E5' }}>✦</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', letterSpacing: '0.01em' }}>
          India&apos;s Premium Points Optimizer
        </span>
      </div>

      {/* ── Main headline ───────────────────────────────────── */}
      <div
        style={{
          marginBottom: 16,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
        }}
      >
        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-1.2px',
          color: '#0A0A0A',
          margin: 0,
        }}>
          Unlock the True Value
        </h1>
        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: '-1.2px',
          margin: '2px 0 0',
        }}>
          of Your Points.{' '}
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Instantly.
          </span>
        </h1>
      </div>

      {/* ── Animated showcase ───────────────────────────────── */}
      <div
        style={{
          minHeight: 100,
          marginBottom: 4,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}
      >
        {/* Rotating sentence — fades as one block */}
        <p
          style={{
            fontSize: 13,
            color: '#596475',
            lineHeight: 1.85,
            margin: '0 auto',
            maxWidth: 340,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.35s ease',
          }}
        >
          Redeem{' '}
          <strong style={{ color: '#0A0A0A', fontWeight: 800 }}>{current.pts}</strong>
          {' '}<strong style={{ color: '#0A0A0A', fontWeight: 800 }}>{current.card}</strong>
          {' '}points for a sweet{' '}
          <strong style={{ color: '#0A0A0A', fontWeight: 800 }}>{current.deal}</strong>
        </p>

        {/* "worth ₹X" — value counts up, never fades */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
          justifyContent: 'center', marginTop: 10,
        }}>
          <em style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            color: '#8A9FB1',
            fontStyle: 'italic',
          }}>
            worth
          </em>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#00A86B',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
          }}>
            {valueDisplay}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex', gap: 5, justifyContent: 'center', marginTop: 12,
        }}>
          {SHOWCASE.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 250); }}
              style={{
                width: i === idx ? 16 : 5,
                height: 5,
                borderRadius: 9999,
                background: i === idx ? '#4F46E5' : '#E2E8F0',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Show example ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: '1px solid #F1F5F9',
          marginTop: 8,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.65s ease 0.35s, transform 0.65s ease 0.35s',
        }}
      >
        <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>
          <p style={{
            fontSize: 24, fontWeight: 800,
            color: '#0A0A0A', letterSpacing: '-0.6px',
            lineHeight: 1, margin: 0,
          }}>₹2.1L+</p>
          <p style={{
            fontSize: 9, fontWeight: 700, color: '#62748E',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginTop: 5, marginBottom: 0, lineHeight: 1.3,
          }}>Avg Value<br />per 100K pts</p>
        </div>

        <div style={{ width: 1, height: 36, background: '#E8EDF2', flexShrink: 0 }} />

        <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>
          <p style={{
            fontSize: 24, fontWeight: 800,
            color: '#0A0A0A', letterSpacing: '-0.6px',
            lineHeight: 1, margin: 0,
          }}>50K+</p>
          <p style={{
            fontSize: 9, fontWeight: 700, color: '#62748E',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginTop: 5, marginBottom: 0, lineHeight: 1.3,
          }}>Routes<br />Analyzed</p>
        </div>

        <div style={{ width: 1, height: 36, background: '#E8EDF2', flexShrink: 0 }} />

        <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>
          <p style={{
            fontSize: 24, fontWeight: 800,
            color: '#0A0A0A', letterSpacing: '-0.6px',
            lineHeight: 1, margin: 0,
          }}>₹1.5Cr+</p>
          <p style={{
            fontSize: 9, fontWeight: 700, color: '#62748E',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            marginTop: 5, marginBottom: 0, lineHeight: 1.3,
          }}>Value<br />Unlocked</p>
        </div>
      </div>

    </section>
  );
}
