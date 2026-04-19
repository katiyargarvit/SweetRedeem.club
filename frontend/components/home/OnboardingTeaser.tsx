'use client';

// ============================================================
// OnboardingTeaser — "65% Fly at the front" dark section
// Waitlist / membership interest capture form
// ============================================================

import { useState } from 'react';

const TRAVEL_GOALS = [
  'Long-Haul Business Class',
  'Frequent Domestic Escapes',
  'Luxury 5-Star Stays',
  'Airport Lounges',
  'Curated Experiences',
];

const SPEND_TIERS = [
  'Under ₹50,000',
  '₹50,000 – ₹1 Lakh',
  '₹1 Lakh – ₹3 Lakhs',
  '₹3 Lakhs+',
];

export default function OnboardingTeaser() {
  const [selectedGoals, setSelectedGoals]   = useState<string[]>([]);
  const [selectedSpend, setSelectedSpend]   = useState<string | null>(null);
  const [spendAmount,   setSpendAmount]     = useState('');
  const [submitted,     setSubmitted]       = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleJoin = () => {
    if (selectedGoals.length === 0 && !selectedSpend) return;
    setSubmitted(true);
  };

  // Pill styles
  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 9999,
    border: `1.5px solid ${active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.13)'}`,
    background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
    color: active ? '#fff' : 'rgba(255,255,255,0.62)',
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      background: '#0b1120',
      borderRadius: '40px 40px 0 0',
      overflow: 'hidden',
      position: 'relative',
      marginTop: 40,
    }}>
      {/* ── Radial glow ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: '12%',
        width: 320, height: 200,
        borderRadius: 9999,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Divider ─────────────────────────────────────── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 20px' }} />

      <div style={{ padding: '48px 20px 0' }}>

        {/* ── 65% stat ──────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            <span style={{
              fontSize: 78, fontWeight: 800, color: '#bfff00',
              letterSpacing: '-1.95px', lineHeight: 1,
            }}>65%</span>
            <span style={{
              fontSize: 30, fontWeight: 800, color: '#bfff00',
              letterSpacing: '-1.95px', lineHeight: 1,
              marginTop: -2,
            }}>^</span>
          </div>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65, marginTop: 12, marginBottom: 0,
          }}>
            card holders waste points on cashback instead of flying business class to Europe!
          </p>
        </div>

        {/* ── Divider ─────────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

        {/* ── "Fly at the front." ──────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 19, fontWeight: 700,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '-0.1px', margin: '0 0 4px',
          }}>
            Stop letting the banks win.
          </p>
          <h2 style={{
            fontSize: 52, fontWeight: 800,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '-1.04px',
            lineHeight: 1.08,
            margin: 0,
          }}>
            Fly at the front.
          </h2>
        </div>

        {/* ── Divider ─────────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 0 24px' }} />

        {/* ── CTA heading ──────────────────────────────── */}
        <h3 style={{
          fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.35, margin: '0 0 8px',
        }}>
          Claim your spot in the members-only club.
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
          Drop your details below to secure access.
        </p>

        {submitted ? (
          /* ── Success state ── */
          <div style={{
            textAlign: 'center', padding: '32px 0 48px',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
              You&apos;re on the list!
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              We&apos;ll notify you when your spot opens up.
            </p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Travel goal ──────────────────── */}
            <h3 style={{
              fontSize: 19, fontWeight: 700, color: '#fff',
              lineHeight: 1.35, margin: '0 0 16px',
            }}>
              Picture your ultimate redemption.{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>What does it look like?</span>
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {TRAVEL_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  style={pillStyle(selectedGoals.includes(goal))}
                >
                  {goal}
                </button>
              ))}
            </div>

            {/* ── Divider ──────────────────────────────── */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />

            {/* ── Section 2: Monthly spend ─────────────── */}
            <h3 style={{
              fontSize: 19, fontWeight: 700, color: '#fff',
              lineHeight: 1.35, margin: '0 0 16px',
            }}>
              What is your average monthly{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>credit card spends?</span>
            </h3>

            {/* ₹ text input */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{
                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
              }}>₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 20px 14px 36px',
                  borderRadius: 9999,
                  border: '1.5px solid rgba(255,255,255,0.13)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 14, fontWeight: 500,
                  outline: 'none',
                }}
              />
            </div>

            {/* Spend tier pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {SPEND_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedSpend(selectedSpend === tier ? null : tier)}
                  style={pillStyle(selectedSpend === tier)}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* ── Join the club CTA ──────────────────────── */}
            <button
              onClick={handleJoin}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 9999,
                border: 'none',
                background: selectedGoals.length > 0 || selectedSpend
                  ? 'linear-gradient(135deg, #155dfc, #615fff)'
                  : 'rgba(255,255,255,0.1)',
                color: selectedGoals.length > 0 || selectedSpend
                  ? '#fff'
                  : 'rgba(255,255,255,0.28)',
                fontSize: 15, fontWeight: 700,
                cursor: selectedGoals.length > 0 || selectedSpend ? 'pointer' : 'default',
                letterSpacing: '-0.15px',
                transition: 'background 0.2s',
              }}
            >
              Join the club
            </button>
          </>
        )}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 48 }} />
    </div>
  );
}
