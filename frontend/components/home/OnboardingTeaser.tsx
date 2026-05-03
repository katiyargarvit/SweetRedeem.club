'use client';

// ============================================================
// OnboardingTeaser -- "65% Fly at the front." dark section
// Figma Make design (03-May): goals + spend form
// ============================================================

import { useState } from 'react';

const NAVY = '#0B1120';

const GOAL_OPTIONS = [
  'Long-Haul Business Class',
  'Frequent Domestic Escapes',
  'Luxury 5-Star Stays',
  'Airport Lounges',
  'Curated Experiences',
];

const SPEND_OPTIONS = [
  'Under Rs.50,000',
  'Rs.50,000 - Rs.1 Lakh',
  'Rs.1 Lakh - Rs.3 Lakhs',
  'Rs.3 Lakhs+',
];

const SPEND_FILL: Record<string, string> = {
  'Under Rs.50,000':           '50000',
  'Rs.50,000 - Rs.1 Lakh':    '75000',
  'Rs.1 Lakh - Rs.3 Lakhs':   '200000',
  'Rs.3 Lakhs+':               '300000',
};

const pillStyle = (active: boolean): React.CSSProperties => ({
  borderRadius: 9999,
  border:       active ? '2px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(255,255,255,0.13)',
  background:   active ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)',
  color:        active ? '#fff' : 'rgba(255,255,255,0.62)',
  padding:      '9px 16px',
  fontSize:     13,
  fontWeight:   600,
  whiteSpace:   'nowrap',
  transition:   'all 0.18s ease',
  cursor:       'pointer',
});

export default function OnboardingTeaser() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSpend, setSelectedSpend] = useState<string | null>(null);
  const [customSpend,   setCustomSpend]   = useState('');
  const [showEmail,     setShowEmail]     = useState(false);
  const [email,         setEmail]         = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  const toggleGoal = (g: string) =>
    setSelectedGoals((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);

  const handleSpend = (opt: string) => {
    setCustomSpend(SPEND_FILL[opt] || opt);
    setSelectedSpend(opt);
    setShowEmail(true);
  };

  const canSubmit = selectedGoals.length > 0 && showEmail && email.length > 0;

  const handleJoin = async () => {
    if (!canSubmit) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      await (supabase as any).from('newsletter_subscribers').upsert({ email }, { onConflict: 'email' });
    } catch { /* non-blocking */ }
    setSubmitted(true);
  };

  return (
    <section style={{ background: '#fff', position: 'relative' }}>
      <div style={{
        background:   NAVY,
        borderRadius: '40px 40px 0 0',
        overflow:     'hidden',
        position:     'relative',
        marginTop:    40,
      }}>
        {/* Ambient glow */}
        <div style={{
          position:      'absolute',
          top:           0,
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         320,
          height:        200,
          borderRadius:  9999,
          background:    'radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ padding: '48px 20px 0', position: 'relative' }}>

          {/* 65% stat */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize:      78,
              fontWeight:    800,
              color:         '#BFFF00',
              letterSpacing: '-0.025em',
              lineHeight:    1,
              marginBottom:  12,
              textShadow:    '0 0 40px rgba(191,255,0,0.35)',
              display:       'inline-flex',
              alignItems:    'flex-start',
            }}>
              65%
              <sup style={{ fontSize: 30, lineHeight: 1, marginTop: 14, marginLeft: 2, color: '#BFFF00', fontWeight: 800 }}>
                ^
              </sup>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
              card holders waste points on cashback instead of flying business class to Europe!
            </p>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

          {/* Fly at the front */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 19, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
              Stop letting the banks win.
            </p>
            <h2 style={{ fontSize: 52, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.025em', lineHeight: 1.08, margin: 0 }}>
              Fly at the front.
            </h2>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 0 24px' }} />

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0 48px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>You&apos;re on the list!</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                We&apos;ll notify you when your spot opens up.
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.9)', lineHeight: 1.35, margin: '0 0 6px' }}>
                Claim your spot in the members-only club.
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
                Drop your details below to secure access.
              </p>

              {/* Section 1: Travel goal */}
              <h3 style={{ fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 16px' }}>
                Picture your ultimate redemption.{' '}
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>What does it look like?</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {GOAL_OPTIONS.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)} style={pillStyle(selectedGoals.includes(g))}>
                    {g}
                  </button>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />

              {/* Section 2: Monthly spend */}
              <h3 style={{ fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 16px' }}>
                What is your average monthly{' '}
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>credit card spends?</span>
              </h3>

              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{
                  position:  'absolute',
                  left:      20,
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  fontSize:  14, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                }}>Rs.</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customSpend}
                  onChange={(e) => setCustomSpend(e.target.value)}
                  style={{
                    width:       '100%',
                    boxSizing:   'border-box',
                    padding:     '14px 20px 14px 44px',
                    borderRadius: 9999,
                    border:      '1.5px solid rgba(255,255,255,0.13)',
                    background:  'rgba(255,255,255,0.06)',
                    color:       'rgba(255,255,255,0.8)',
                    fontSize:    14,
                    fontWeight:  500,
                    outline:     'none',
                    fontFamily:  "'Inter', system-ui, sans-serif",
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                {SPEND_OPTIONS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleSpend(tier)}
                    style={pillStyle(selectedSpend === tier)}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {showEmail && (
                <div style={{ marginBottom: 20 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width:        '100%',
                      boxSizing:    'border-box',
                      padding:      '14px 20px',
                      borderRadius: 9999,
                      border:       '1.5px solid rgba(255,255,255,0.13)',
                      background:   'rgba(255,255,255,0.06)',
                      color:        'rgba(255,255,255,0.8)',
                      fontSize:     14,
                      fontWeight:   500,
                      outline:      'none',
                      fontFamily:   "'Inter', system-ui, sans-serif",
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={!canSubmit}
                style={{
                  width:         '100%',
                  padding:       '16px',
                  borderRadius:  9999,
                  border:        'none',
                  background:    canSubmit
                    ? 'linear-gradient(135deg, #155dfc, #615fff)'
                    : 'rgba(255,255,255,0.10)',
                  color:         canSubmit ? '#fff' : 'rgba(255,255,255,0.28)',
                  fontSize:      15,
                  fontWeight:    700,
                  cursor:        canSubmit ? 'pointer' : 'default',
                  letterSpacing: '-0.01em',
                  transition:    'background 0.2s',
                  fontFamily:    "'Inter', system-ui, sans-serif",
                }}
              >
                Join the club
              </button>
            </>
          )}
        </div>

        <div style={{ height: 48 }} />
      </div>
    </section>
  );
}
