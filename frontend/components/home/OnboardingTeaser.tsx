'use client';

// ============================================================
// OnboardingTeaser -- "65% Fly at the front." dark section
// Figma Make reference design, Framer Motion animations
// ============================================================

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  useScroll, useMotionValueEvent,
  motion, AnimatePresence,
} from 'framer-motion';
import { supabase } from '@/lib/supabase';

const NAVY = '#0B1120';
const SPRING = { type: 'spring', damping: 28, stiffness: 220 } as const;

// ── Text blocks (scroll-driven word reveal) ───────────────────
const R_BODY  = 'card holders waste points on cashback instead of flying business class to Europe!'.split(' ');
const R_STOP  = ['Stop', 'letting', 'the', 'banks', 'win.'];
const R_FLY   = ['Fly', 'at', 'the', 'front.'];
const R_TOTAL_W = R_BODY.length + R_STOP.length + R_FLY.length;
const R_BODY_I  = R_BODY.map((w, i) => ({ w, idx: i }));
const R_STOP_I  = R_STOP.map((w, i) => ({ w, idx: R_BODY.length + i }));
const R_FLY_I   = R_FLY.map((w, i) => ({ w, idx: R_BODY.length + R_STOP.length + i }));

// ── Form option data ──────────────────────────────────────────
const GOAL_OPTIONS = [
  'Long-Haul Business Class',
  'Frequent Domestic Escapes',
  'Luxury 5-Star Stays',
  'Airport Lounges',
  'Curated Experiences',
];
const SPEND_OPTIONS = ['Under ₹50,000', '₹50,000 – ₹1 Lakh', '₹1 Lakh – ₹3 Lakhs', '₹3 Lakhs+'];
const SPEND_FILL: Record<string, string> = {
  'Under ₹50,000':             '50,000',
  '₹50,000 – ₹1 Lakh':  '75,000',
  '₹1 Lakh – ₹3 Lakhs': '2,00,000',
  '₹3 Lakhs+':                 '3,00,000+',
};

export default function OnboardingTeaser() {
  const router     = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  

  // ── Scroll-driven word reveal ─────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const [revealProg, setRevealProg] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', setRevealProg);

  const BAND_S = 0.04, BAND_E = 0.45;
  const getOp = (idx: number) => {
    const p    = isNaN(revealProg) ? 0 : revealProg;
    const span = BAND_E - BAND_S;
    const ws   = BAND_S + (idx / R_TOTAL_W) * span;
    const we   = ws + (span / R_TOTAL_W) * 2.8;
    return Math.min(1, Math.max(0.13, (p - ws) / (we - ws)));
  };

  // ── Form state ────────────────────────────────────────────────
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSpend, setSelectedSpend] = useState<string | null>(null);
  const [customSpend,   setCustomSpend]   = useState('');
  const [showEmail,     setShowEmail]     = useState(false);
  const [email,         setEmail]         = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  const toggleGoal  = (g: string) =>
    setSelectedGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const revealEmail = () => setShowEmail(true);
  const handleSpend = (opt: string) => {
    setCustomSpend(SPEND_FILL[opt] ?? opt);
    setSelectedSpend(opt);
    revealEmail();
  };

  const handleJoin = async () => {
    if (!email) return;
    try {
      await (supabase as any).from('newsletter_subscribers').upsert({
        email,
        goals: selectedGoals,
        monthly_spend: selectedSpend ?? customSpend,
        source: 'onboarding_teaser',
      }, { onConflict: 'email' });
    } catch (_) { /* best-effort */ }
    setSubmitted(true);
    setTimeout(() => router.push('/sweet-spots'), 2600);
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    borderRadius: 100,
    border:     active ? '2px solid rgba(255,255,255,0.85)'  : '1.5px solid rgba(255,255,255,0.13)',
    background: active ? 'rgba(255,255,255,0.13)'            : 'rgba(255,255,255,0.06)',
    color:      active ? '#fff'                              : 'rgba(255,255,255,0.62)',
    padding: '9px 16px', fontSize: 13, fontWeight: 600,
    whiteSpace: 'nowrap', transition: 'all 0.18s ease', cursor: 'pointer',
  });

  const canSubmit = selectedGoals.length > 0 && showEmail && email.length > 0;

  return (
    <section style={{ background: '#fff' }} ref={sectionRef}>
      <div style={{
        padding: '48px 20px 32px', position: 'relative', overflow: 'hidden',
        background: NAVY, borderRadius: '40px 40px 0 0',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 200, borderRadius: 9999, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }} />

        {/* ── Stat block ─────────────────────────────────────── */}
        <div style={{ marginBottom: 32, position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRING}
          >
            {/* 65% */}
            <div style={{
              color: '#BFFF00', fontSize: 78, fontWeight: 800, lineHeight: 1,
              letterSpacing: '-0.03em', marginBottom: 16,
              textShadow: '0 0 40px rgba(191,255,0,0.35), 0 0 80px rgba(191,255,0,0.15)',
              display: 'flex', alignItems: 'flex-start',
            }}>
              65%
              <sup style={{ fontSize: 30, lineHeight: 1, marginTop: 14, marginLeft: 2, color: '#BFFF00', fontWeight: 800 }}>^</sup>
            </div>

            {/* Body copy — scroll-driven word reveal */}
            <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0 }}>
              {R_BODY_I.map(({ w, idx }) => (
                <React.Fragment key={idx}>
                  <span style={{
                    color: `rgba(255,255,255,${getOp(idx)})`,
                    transition: 'color 0.08s linear', fontWeight: 400,
                  }}>{w}</span>
                  {' '}
                </React.Fragment>
              ))}
            </p>
          </motion.div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '0 0 32px' }} />

        {/* ── "Stop letting the banks win. Fly at the front." ── */}
        <div style={{ marginBottom: 40, position: 'relative', zIndex: 10 }}>
          <p style={{ lineHeight: 1.35, marginBottom: 14 }}>
            {R_STOP_I.map(({ w, idx }) => (
              <span key={idx} style={{
                color: `rgba(255,255,255,${getOp(idx)})`,
                marginRight: '0.32em', fontSize: 19, fontWeight: 700,
                transition: 'color 0.08s linear',
              }}>{w}</span>
            ))}
          </p>
          <div style={{ lineHeight: 1.08, overflow: 'hidden' }}>
            {R_FLY_I.map(({ w, idx }) => (
              <span key={idx} style={{
                color: `rgba(255,255,255,${getOp(idx)})`,
                fontSize: 52, fontWeight: 800, letterSpacing: '-0.025em',
                marginRight: '0.18em', display: 'inline-block',
                transition: 'color 0.08s linear',
              }}>{w}</span>
            ))}
          </div>
        </div>

        {/* ── Q1: Claim your spot ─────────────────────────── */}
        <div style={{ marginBottom: 32, position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 24 }} />
            <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.9)', lineHeight: 1.3, margin: '0 0 6px' }}>
              Claim your spot in the members-only club.
            </p>
            <p style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Drop your details below to secure access.
            </p>
          </div>

          <h3 style={{ fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 20px' }}>
            Picture your ultimate redemption.{' '}
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>What does it look like?</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_OPTIONS.map(g => (
              <button key={g} onClick={() => toggleGoal(g)} style={pillStyle(selectedGoals.includes(g))}>{g}</button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 32px', position: 'relative', zIndex: 10 }} />

        {/* ── Q2: Monthly spend ───────────────────────────── */}
        <div style={{ marginBottom: 28, position: 'relative', zIndex: 10 }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 20px' }}>
            What is your average monthly{' '}
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>credit card spends?</span>
          </h3>

          {/* Free-text input */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: 700, pointerEvents: 'none',
            }}>₹</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              value={customSpend}
              onChange={e => { setCustomSpend(e.target.value); setSelectedSpend(null); }}
              onBlur={() => { if (customSpend) revealEmail(); }}
              style={{
                width: '100%', padding: '12px 52px 12px 36px', borderRadius: 100,
                background: 'rgba(255,255,255,0.06)', outline: 'none',
                border: customSpend ? '1.5px solid rgba(255,255,255,0.55)' : '1.5px solid rgba(255,255,255,0.13)',
                color: '#fff', fontSize: 14, fontWeight: 500, boxSizing: 'border-box',
              }}
            />
            {customSpend && (
              <span style={{
                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.35)', fontSize: 12, pointerEvents: 'none',
              }}>/month</span>
            )}
          </div>

          {/* Quick-select pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPEND_OPTIONS.map(opt => (
              <button key={opt} onClick={() => handleSpend(opt)} style={pillStyle(selectedSpend === opt)}>{opt}</button>
            ))}
          </div>

          {/* Email reveal */}
          <AnimatePresence>
            {showEmail && (
              <motion.div
                key="email-field"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.35 }}
                  style={{ marginBottom: 10 }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 19, fontWeight: 700, display: 'block', marginBottom: 4, letterSpacing: '-0.01em' }}>
                    Drop your email to secure your exclusive waitlist spot
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 400 }}>
                    and reveal your wallet&apos;s true hidden value.
                  </span>
                </motion.p>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 20px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.06)', outline: 'none',
                    border: email ? '1.5px solid rgba(255,255,255,0.55)' : '1.5px solid rgba(255,255,255,0.18)',
                    color: '#fff', fontSize: 14, fontWeight: 500, boxSizing: 'border-box',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CTA ─────────────────────────────────────────── */}
        <motion.div layout style={{ position: 'relative', zIndex: 10, marginBottom: 24 }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}
              >
                <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 22, fontWeight: 800, textAlign: 'center', lineHeight: 1.4, letterSpacing: '-0.02em', margin: 0 }}>
                  Invite locked.{' '}
                  <span style={{ color: '#BFFF00' }}>Now, let&apos;s see what&apos;s fueling your next upgrade&hellip;</span>
                  <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4, verticalAlign: 'middle' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#BFFF00' }}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                      />
                    ))}
                  </span>
                </p>
              </motion.div>
            ) : (
              <motion.button
                key="cta"
                onClick={handleJoin}
                whileTap={{ scale: 0.97 }}
                disabled={!canSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  width: '100%', padding: 15, borderRadius: 100, border: 'none',
                  background: canSubmit ? '#fff' : 'rgba(255,255,255,0.10)',
                  color:      canSubmit ? NAVY  : 'rgba(255,255,255,0.28)',
                  fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  cursor: canSubmit ? 'pointer' : 'default',
                  transition: 'background 0.25s ease, color 0.25s ease',
                }}
              >
                Join the club
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
