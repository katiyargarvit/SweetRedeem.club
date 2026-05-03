'use client';

// ============================================================
// HeroSection -- Figma Make design (03-May)
// Staggered CSS animations: badge, headline words, subtitle, stats
// ============================================================

const STATS = [
  { value: '₹2.1L+',  label: 'Avg Value\nper 100K pts' },
  { value: '50K+',         label: 'Routes\nAnalyzed'        },
  { value: '₹1.5Cr+', label: 'Value\nUnlocked'         },
];

export default function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes srSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes srFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .sr-word {
          display: inline-block;
          opacity: 0;
          animation: srSlideUp 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .sr-badge {
          opacity: 0;
          animation: srFadeIn 0.4s ease forwards;
          animation-delay: 0ms;
        }
        .sr-subtitle {
          opacity: 0;
          animation: srSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          animation-delay: 480ms;
        }
        .sr-stats {
          opacity: 0;
          animation: srSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
          animation-delay: 600ms;
        }
      `}</style>

      <section style={{
        background:    '#fff',
        padding:       '32px 20px 28px',
        textAlign:     'center',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
      }}>

        {/* ── Badge ──────────────────────────────────────────── */}
        <div className="sr-badge" style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          6,
          padding:      '6px 14px',
          borderRadius: 9999,
          background:   '#EFF6FF',
          border:       '1px solid #DBEAFE',
          marginBottom: 24,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            <path d="M5 3l.7 1.8L7.5 5l-1.8.7L5 7.5l-.7-1.8L2.5 5l1.8-.7z" />
            <path d="M19 17l.7 1.8L21.5 19l-1.8.7L19 21.5l-.7-1.8L16.5 19l1.8-.7z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.01em' }}>
            India&apos;s Premium Points Optimizer
          </span>
        </div>

        {/* ── Headline (word-by-word stagger) ────────────────── */}
        <h1 style={{
          fontSize:      36,
          fontWeight:    800,
          letterSpacing: '-0.025em',
          lineHeight:    1.15,
          color:         '#0f172a',
          margin:        '0 0 16px',
        }}>
          {/* Line 1: "Unlock the True Value" */}
          {['Unlock', 'the', 'True', 'Value'].map((word, i) => (
            <span key={word} className="sr-word" style={{ animationDelay: `${60 + i * 75}ms`, marginRight: '0.22em' }}>
              {word}
            </span>
          ))}
          <br />
          {/* Line 2: "of Your Points." + gradient "Instantly." */}
          {['of', 'Your', 'Points.'].map((word, i) => (
            <span key={word} className="sr-word" style={{ animationDelay: `${60 + (4 + i) * 75}ms`, marginRight: '0.22em' }}>
              {word}
            </span>
          ))}
          {' '}
          <span className="sr-word" style={{
            animationDelay: `${60 + 7 * 75}ms`,
            background:               'linear-gradient(90deg, #2563EB 0%, #6366f1 100%)',
            WebkitBackgroundClip:     'text',
            WebkitTextFillColor:      'transparent',
            backgroundClip:           'text',
          }}>
            Instantly.
          </span>
        </h1>

        {/* ── Subtitle ───────────────────────────────────────── */}
        <p className="sr-subtitle" style={{
          fontSize:   14,
          color:      '#64748b',
          lineHeight: 1.65,
          maxWidth:   300,
          margin:     '0 auto 32px',
        }}>
          Unlock free flights and dream vacations&mdash;while getting up to{' '}
          <strong style={{ color: '#059669', fontWeight: 700 }}>4x more value</strong> from your points.
        </p>

        {/* ── Stats row ──────────────────────────────────────── */}
        <div className="sr-stats" style={{
          display:    'flex',
          alignItems: 'flex-start',
          width:      '100%',
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
                  fontSize:      9,
                  fontWeight:    700,
                  color:         '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  lineHeight:    1.4,
                  whiteSpace:    'pre-line',
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
    </>
  );
}
