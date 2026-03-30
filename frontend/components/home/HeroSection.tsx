'use client';

// ============================================================
// HeroSection — animated rotating showcase headline
// "Redeem [X] [Card] points for a sweet [deal] worth ₹Y"
// Sentence fades as one block; value counts up independently.
// ============================================================

import { useEffect, useRef, useState } from 'react';

const SHOWCASE = [
  { pts: '50K',  card: 'HDFC Infinia',        deal: 'flight', value: 240000 },
  { pts: '20K',  card: 'Axis Atlas',           deal: 'hotel',  value: 104000 },
  { pts: '100K', card: 'Amex Travel Platinum', deal: 'flight', value: 175000 },
];

const FADE_MS    = 1500;
const ROTATE_MS  = 4000;
const COUNTUP_MS = 1400;

function formatINRFull(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export default function HeroSection() {
  const [idx,       setIdx]       = useState(0);
  const [opacity,   setOpacity]   = useState(1);
  const [displayed, setDisplayed] = useState(SHOWCASE[0]);
  const [value,     setValue]     = useState(SHOWCASE[0].value);

  const rafRef      = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Count-up animation
  function countUp(from: number, to: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / COUNTUP_MS, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else { setValue(to); rafRef.current = null; }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function nextSlide() {
    setIdx((prev) => {
      const next = (prev + 1) % SHOWCASE.length;
      const data = SHOWCASE[next];

      // Fade out
      setOpacity(0);

      // After fade-out: swap text + fade in
      setTimeout(() => {
        setDisplayed(data);
        setOpacity(1);
      }, FADE_MS);

      // Count-up starts at 60% of fade duration
      setTimeout(() => {
        setValue((cur) => { countUp(cur, data.value); return cur; });
      }, FADE_MS * 0.6);

      return next;
    });
  }

  useEffect(() => {
    // Initial count-up from 0
    countUp(0, SHOWCASE[0].value);
    intervalRef.current = setInterval(nextSlide, ROTATE_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current)      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ padding: '28px 20px 0', textAlign: 'center' }}>

      {/* Eyebrow */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: '#C5A059' }}>✦</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#C5A059',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          SweetRedeem.club
        </span>
      </div>

      {/* Main headline */}
      <h1 style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 30,
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: '#000',
        marginBottom: 6,
      }}>
        Unlock the True Value<br />of Your Points.{' '}
        <em style={{ fontStyle: 'italic' }}>Instantly.</em>
      </h1>

      {/* Animated rotating subheading */}
      <div style={{ marginTop: 14, minHeight: 90 }}>

        {/* Sentence fades as one block */}
        <p style={{
          fontSize: 13,
          color: '#666',
          lineHeight: 1.8,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
          opacity,
        }}>
          Redeem{' '}
          <strong style={{ color: '#000' }}>{displayed.pts}</strong>{' '}
          <strong style={{ color: '#000' }}>{displayed.card}</strong>{' '}
          points for a sweet{' '}
          <strong style={{ color: '#000' }}>{displayed.deal}</strong>
        </p>

        {/* "worth ₹X" — never fades, counts up */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          justifyContent: 'center',
          marginTop: 6,
        }}>
          <em style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#666',
            fontStyle: 'italic',
          }}>
            worth
          </em>
          <span style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#00C885',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {formatINRFull(value)}
          </span>
        </div>

      </div>
    </section>
  );
}
