'use client';

// ============================================================
// RTBSection -- "Why it works."
// Figma Make design: WHITE bg, scroll-driven word reveal,
// Framer Motion accordion.  Layout unchanged from original.
// ============================================================

import { useState, useRef } from 'react';
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, ShieldCheck, Key, ChevronDown } from 'lucide-react';

const BLUE = '#2563EB';

// ── Spring presets ────────────────────────────────────────────
const SPRING      = { type: 'spring', damping: 28, stiffness: 220 } as const;
const SPRING_FAST = { type: 'spring', damping: 22, stiffness: 280 } as const;

// ── RTB data — continuous word-index space 0-18 ───────────────
// 3 title words + 4 items x 4 heading words = 19 total
const RTB_TITLE = ['Why', 'it', 'works.'];
const RTB_ITEMS = [
  {
    id: 0, icon: Star,
    headingWords: ['Unlock', 'True', 'Award', 'Seats'],
    wordStart: 3,
    subtext: 'Stop settling for basic statement credits. Real value lives in exclusive, limited airline inventories.',
    seeHow: 'Standard portals like SmartBuy just buy cash fares, capping your points at 1x. We find hidden award tickets that multiply your yield up to 6x.',
  },
  {
    id: 1, icon: Zap,
    headingWords: ['Zero', 'Math,', 'Total', 'Clarity'],
    wordStart: 7,
    subtext: 'Airline alliances and bank transfer ratios are literally designed to confuse you. We fix that.',
    seeHow: 'We do the heavy lifting. By decoding every card, loyalty program, and transfer ratio, we reveal the exact true rupee value of your points instantly.',
  },
  {
    id: 2, icon: ShieldCheck,
    headingWords: ['Verified', 'by', 'the', 'Club'],
    wordStart: 11,
    subtext: "You aren't flying solo. Our community of expert optimizers actively uncovers the industry's best redemptions.",
    seeHow: "Spot a massive value? Our members hunt, test, and upvote the smartest flight sweetspots daily, ensuring you only spend points on deals that actually work.",
  },
  {
    id: 3, icon: Key,
    headingWords: ['Get', 'the', 'Insider', 'Edge'],
    wordStart: 15,
    subtext: 'Banks want you to redeem your hard-earned points for pennies. We help you demand rupees.',
    seeHow: 'Join a private community of optimizers securing verified, high-yield luxury redemptions that standard credit card travel portals actively try to keep hidden from you.',
  },
];
const RTB_TOTAL = 19; // 3 + 4*4

export default function RTBSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const [prog, setProg] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setProg(isNaN(v) ? 0 : v));

  const [expanded, setExpanded] = useState<number | null>(null);

  // Per-word opacity — same ripple math as the reference
  const BAND_S = 0.04, BAND_E = 0.52;
  const opacity = (idx: number) => {
    const span = BAND_E - BAND_S;
    const ws   = BAND_S + (idx / RTB_TOTAL) * span;
    const we   = ws + (span / RTB_TOTAL) * 2.8;
    return Math.min(1, Math.max(0.14, (prog - ws) / (we - ws)));
  };

  return (
    <div
      ref={ref}
      style={{ background: '#ffffff', borderTop: '1px solid #F1F5F9', position: 'relative', overflow: 'hidden', padding: '40px 20px 48px' }}
    >
      {/* Ambient blue glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 180, borderRadius: 9999, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)',
      }} />

      {/* Section label */}
      <p style={{
        fontSize: 10, fontWeight: 700, color: '#94a3b8',
        letterSpacing: '1.1px', textTransform: 'uppercase', margin: '0 0 8px', position: 'relative',
      }}>
        THE SWEETREDEEM EDGE
      </p>

      {/* "Why it works." — scroll-driven word reveal */}
      <div style={{ marginBottom: 36, position: 'relative', lineHeight: 1.08 }}>
        {RTB_TITLE.map((w, i) => (
          <span
            key={i}
            style={{
              color:        `rgba(15,23,42,${opacity(i)})`,
              fontSize:     42,
              fontWeight:   800,
              letterSpacing: '-0.025em',
              marginRight:  '0.18em',
              display:      'inline-block',
              transition:   'color 0.08s linear',
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* RTB item list */}
      <div style={{ position: 'relative' }}>
        {RTB_ITEMS.map((item) => {
          const Icon = item.icon;
          const open = expanded === item.id;

          return (
            <div
              key={item.id}
              style={{
                borderBottom:  item.id < RTB_ITEMS.length - 1 ? '1px solid #f1f5f9' : 'none',
                paddingBottom: item.id < RTB_ITEMS.length - 1 ? 28 : 0,
                marginBottom:  item.id < RTB_ITEMS.length - 1 ? 28 : 0,
                display:       'flex',
                gap:           16,
                alignItems:    'flex-start',
              }}
            >
              {/* Icon badge */}
              <div style={{
                width: 40, height: 40, borderRadius: 9999,
                background: 'rgba(15,23,42,0.04)', border: '0.75px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 4, color: '#94a3b8',
              }}>
                <Icon size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Heading — each word gets its own opacity */}
                <div style={{ marginBottom: 8, lineHeight: 1.2 }}>
                  {item.headingWords.map((w, wi) => (
                    <span
                      key={wi}
                      style={{
                        color:        `rgba(15,23,42,${opacity(item.wordStart + wi)})`,
                        fontSize:     20,
                        fontWeight:   700,
                        letterSpacing: '-0.01em',
                        marginRight:  '0.25em',
                        display:      'inline-block',
                        transition:   'color 0.08s linear',
                      }}
                    >
                      {w}
                    </span>
                  ))}
                </div>

                {/* Subtext — static */}
                <p style={{
                  color: '#64748b', fontSize: 13, fontWeight: 500,
                  lineHeight: 1.65, marginBottom: 10, maxWidth: 320,
                }}>
                  {item.subtext}
                </p>

                {/* See how? toggle */}
                <button
                  onClick={() => setExpanded(open ? null : item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: BLUE, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                  }}
                >
                  See how?
                  <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={SPRING_FAST}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </button>

                {/* Accordion drawer */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SPRING}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        color: '#334155', fontSize: 13, fontWeight: 500,
                        lineHeight: 1.65, maxWidth: 320,
                        marginTop: 12, paddingTop: 12,
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        {item.seeHow}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
