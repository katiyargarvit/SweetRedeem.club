'use client';

// ============================================================
// RTBSection -- "Why it works." + scroll-driven word reveal
// Figma Make design: "Fly at the Front." reveals word-by-word
// Animation mirrors Framer Motion useScroll pattern but in
// vanilla React so no extra dependency is needed.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';

const BLUE = '#2563EB';

// ── Animated headline copy (word index space is continuous) ──
const R_BODY  = ['Stop', 'settling', 'for', 'basic', 'statement', 'credits.'];
const R_STOP  = ['Real', 'value', 'lives', 'in', 'exclusive', 'award', 'seats.'];
const R_FLY   = ['Fly', 'at', 'the', 'Front.'];
const R_TOTAL = R_BODY.length + R_STOP.length + R_FLY.length;

// Band: words start lighting up at 4% scroll, finish at 52%
const BAND_S = 0.04;
const BAND_E = 0.52;

function getOp(idx: number, prog: number): number {
  const p    = isNaN(prog) ? 0 : prog;
  const span = BAND_E - BAND_S;
  const ws   = BAND_S + (idx / R_TOTAL) * span;
  const we   = ws + (span / R_TOTAL) * 2.8;
  return Math.min(1, Math.max(0.13, (p - ws) / (we - ws)));
}

// ── Feature items ────────────────────────────────────────────
const ITEMS = [
  {
    heading: 'Unlock True Award Seats',
    body:    'Stop settling for basic statement credits. Real value lives in exclusive, limited airline inventories.',
    detail:  'Standard portals like SmartBuy just buy cash fares, capping your points at 1x. We find hidden award tickets that multiply your yield up to 6x.',
    icon:    StarIcon,
  },
  {
    heading: 'Zero Math, Total Clarity',
    body:    'Airline alliances and bank transfer ratios are literally designed to confuse you. We fix that.',
    detail:  'We do the heavy lifting. By decoding every card, loyalty program, and transfer ratio, we reveal the exact true rupee value of your points instantly.',
    icon:    ZapIcon,
  },
  {
    heading: 'Verified by the Club',
    body:    "You aren't flying solo. Our community of expert optimizers actively uncovers the industry's best redemptions.",
    detail:  'Our members hunt, test, and upvote the smartest flight sweetspots daily, ensuring you only spend points on deals that actually work.',
    icon:    ShieldIcon,
  },
  {
    heading: 'Get the Insider Edge',
    body:    'Banks want you to redeem your hard-earned points for pennies. We help you demand rupees.',
    detail:  'Join a private community of optimizers securing verified, high-yield luxury redemptions that standard credit card travel portals try to keep hidden.',
    icon:    KeyIcon,
  },
];

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function RTBSection() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const sectionRef              = useRef<HTMLDivElement>(null);
  const [revealProg, setRevealProg] = useState(0);

  // Scroll progress: 0 = section bottom enters viewport, 1 = section top exits
  const onScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect    = el.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Normalize: 0 when bottom of section enters, 1 when top exits top of viewport
    const progress = 1 - rect.bottom / (windowH + rect.height);
    setRevealProg(Math.min(1, Math.max(0, progress)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // seed initial value
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Shared word renderer with continuous idx
  const WordSpan = ({ w, idx }: { w: string; idx: number }) => (
    <span style={{
      color:      `rgba(255,255,255,${getOp(idx, revealProg)})`,
      marginRight: '0.18em',
      display:    'inline-block',
      transition: 'color 0.08s linear',
    }}>
      {w}
    </span>
  );

  const r_body_i  = R_BODY.map((w, i) => ({ w, idx: i }));
  const r_stop_i  = R_STOP.map((w, i) => ({ w, idx: R_BODY.length + i }));
  const r_fly_i   = R_FLY.map((w, i)  => ({ w, idx: R_BODY.length + R_STOP.length + i }));

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#0B1120',
        padding:    '48px 20px 52px',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position:      'absolute',
        top:           0,
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         320,
        height:        200,
        borderRadius:  9999,
        background:    'radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Label */}
      <p style={{
        fontSize:      10,
        fontWeight:    700,
        color:         '#475569',
        letterSpacing: '1.1px',
        textTransform: 'uppercase',
        margin:        '0 0 20px',
        position:      'relative',
      }}>
        THE SWEETREDEEM EDGE
      </p>

      {/* ── Scroll-driven headline ──────────────────────── */}
      <div style={{ marginBottom: 44, position: 'relative', lineHeight: 1.22 }}>
        {/* Line 1 — body */}
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 2 }}>
          {r_body_i.map(({ w, idx }) => <WordSpan key={idx} w={w} idx={idx} />)}
        </div>
        {/* Line 2 — stop */}
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 2 }}>
          {r_stop_i.map(({ w, idx }) => <WordSpan key={idx} w={w} idx={idx} />)}
        </div>
        {/* Line 3 — "Fly at the Front." — gradient when fully lit */}
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em' }}>
          {r_fly_i.map(({ w, idx }) => {
            const op = getOp(idx, revealProg);
            const fullyLit = op >= 0.98;
            return (
              <span
                key={idx}
                style={{
                  marginRight:              '0.18em',
                  display:                  'inline-block',
                  transition:               'color 0.08s linear',
                  ...(fullyLit
                    ? {
                        background:               'linear-gradient(90deg,#2563EB 0%,#6366f1 100%)',
                        WebkitBackgroundClip:      'text',
                        WebkitTextFillColor:       'transparent',
                        backgroundClip:            'text',
                      }
                    : { color: `rgba(255,255,255,${op})` }),
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Feature items ───────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const open = expanded === i;

          return (
            <div key={i} style={{
              borderBottom:  i < ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              paddingBottom: i < ITEMS.length - 1 ? 28 : 0,
              marginBottom:  i < ITEMS.length - 1 ? 28 : 0,
              display:       'flex',
              gap:           16,
              alignItems:    'flex-start',
            }}>
              {/* Icon */}
              <div style={{
                width:          40,
                height:         40,
                borderRadius:   9999,
                background:     'rgba(255,255,255,0.06)',
                border:         '0.75px solid rgba(255,255,255,0.1)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                marginTop:      4,
                color:          '#64748b',
              }}>
                <Icon />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize:      18,
                  fontWeight:    700,
                  color:         '#f1f5f9',
                  letterSpacing: '-0.01em',
                  margin:        '0 0 8px',
                  lineHeight:    1.2,
                }}>
                  {item.heading}
                </h3>
                <p style={{
                  fontSize:   13,
                  fontWeight: 500,
                  color:      '#94a3b8',
                  lineHeight: 1.65,
                  margin:     '0 0 10px',
                  maxWidth:   320,
                }}>
                  {item.body}
                </p>

                <button
                  onClick={() => setExpanded(open ? null : i)}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           4,
                    background:    'none',
                    border:        'none',
                    padding:       0,
                    cursor:        'pointer',
                    color:         BLUE,
                    fontSize:      12,
                    fontWeight:    700,
                    letterSpacing: '0.04em',
                  }}
                >
                  See how?
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {open && (
                  <p style={{
                    fontSize:   13,
                    fontWeight: 500,
                    color:      '#cbd5e1',
                    lineHeight: 1.65,
                    margin:     '12px 0 0',
                    paddingTop: 12,
                    borderTop:  '1px solid rgba(255,255,255,0.08)',
                    maxWidth:   320,
                  }}>
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
