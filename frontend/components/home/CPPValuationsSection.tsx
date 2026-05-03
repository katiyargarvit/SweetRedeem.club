'use client';

// ============================================================
// CPPValuationsSection — "We know what your points are worth."
// Horizontal scroll cards showing top credit card → best CPP
// Figma Make design (03-May)
// Uses brandfetch.io / clearbit for bank & program logos
// ============================================================

import { useRouter } from 'next/navigation';

const BLUE  = '#2563EB';
const CORAL = '#FF6B4A';
const GREEN = '#00A86B';

const CPP_CARDS = [
  {
    card:       'HDFC Infinia',
    bankDomain: 'hdfcbank.com',
    cpp:        5.85,
    returnPct:  19.5,
    route:      'DEL → LHR',
    program:    'Avios (BA)',
    cabin:      'Business',
    photo:      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=400&q=80',
  },
  {
    card:       'Amex Platinum T.',
    bankDomain: 'americanexpress.com',
    cpp:        4.66,
    returnPct:  15.6,
    route:      'DEL → NRT',
    program:    'ANA Mileage Club',
    cabin:      'First Class',
    photo:      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
  },
  {
    card:       'Axis Atlas',
    bankDomain: 'axisbank.com',
    cpp:        4.40,
    returnPct:  14.7,
    route:      'BOM → CDG',
    program:    'Flying Blue',
    cabin:      'Business',
    photo:      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
  },
  {
    card:       'Axis Magnus',
    bankDomain: 'axisbank.com',
    cpp:        4.14,
    returnPct:  13.8,
    route:      'DEL → JFK',
    program:    'Qatar Privilege Club',
    cabin:      'QSuites',
    photo:      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80',
  },
  {
    card:       'Axis Olympus',
    bankDomain: 'axisbank.com',
    cpp:        3.68,
    returnPct:  12.3,
    route:      'SIN → LHR',
    program:    'KrisFlyer',
    cabin:      'First Class',
    photo:      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80',
  },
  {
    card:       'HDFC Regalia',
    bankDomain: 'hdfcbank.com',
    cpp:        2.88,
    returnPct:   9.6,
    route:      'DEL → BKK',
    program:    'Thai ROP',
    cabin:      'Business',
    photo:      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80',
  },
];

function returnColor(pct: number) {
  if (pct >= 14) return GREEN;
  if (pct >= 10) return BLUE;
  return '#64748b';
}
function returnBg(pct: number) {
  if (pct >= 14) return 'rgba(0,168,107,0.10)';
  if (pct >= 10) return 'rgba(37,99,235,0.10)';
  return 'rgba(100,116,139,0.10)';
}

export default function CPPValuationsSection() {
  const router = useRouter();

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', paddingTop: 40, paddingBottom: 40 }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{
            fontSize:      26,
            fontWeight:    800,
            letterSpacing: '-0.025em',
            lineHeight:    1.1,
            color:         '#0f172a',
            margin:        0,
          }}>
            We know what your<br />points are worth.
          </h2>

          {/* Animated nudge arrow */}
          <div style={{ flexShrink: 0, marginTop: 4, textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.3, color: CORAL, margin: '0 0 2px' }}>
              Click a card<br />to apply
            </p>
            <svg width="24" height="18" viewBox="0 0 28 22" fill="none">
              <path d="M22 2 C18 2, 6 4, 4 14 C3 18, 6 20, 8 19" stroke={CORAL} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 14 L8 19 L11 15" stroke={CORAL} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Find your perfect travel buddy</p>
      </div>

      {/* ── Horizontal card strip ───────────────────────── */}
      <div style={{
        display:       'flex',
        overflowX:     'auto',
        gap:           12,
        padding:       '4px 20px 8px',
        scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory',
      } as React.CSSProperties}>
        {CPP_CARDS.map((item, i) => (
          <div
            key={item.card}
            onClick={() => router.push('/discover')}
            style={{
              flex:           '0 0 auto',
              width:          160,
              borderRadius:   18,
              overflow:       'hidden',
              border:         '1px solid #E2E8F0',
              cursor:         'pointer',
              scrollSnapAlign: 'start',
              background:     '#fff',
              transition:     'transform 0.15s',
            }}
          >
            {/* Photo */}
            <div style={{
              height:     101,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
              overflow:   'hidden',
            }}>
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.card}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ padding: '14px 12px 14px', display: 'flex', flexDirection: 'column' }}>
              {/* Card name — with bank logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4, overflow: 'hidden',
                  flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={`https://cdn.brandfetch.io/${item.bankDomain}/icon`}
                    alt={item.card}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <p style={{
                  fontSize:          12,
                  fontWeight:        700,
                  color:             '#0f172a',
                  margin:            0,
                  textDecoration:    'underline',
                  textUnderlineOffset: 3,
                  textDecorationColor: '#CBD5E1',
                  lineHeight:        1.2,
                }}>
                  {item.card}
                </p>
              </div>

              {/* CPP */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  ₹{item.cpp.toFixed(2)}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>per point</span>
              </div>

              <div style={{ height: 1, background: '#f1f5f9', marginBottom: 10 }} />

              {/* Best redemption */}
              <p style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>
                Best Redemption
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.25, margin: 0 }}>{item.route}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.25 }}>
                {item.cabin} · {item.program}
              </p>

              {/* Return pill */}
              <div style={{ marginTop: 10 }}>
                <span style={{
                  fontSize:     9,
                  fontWeight:   800,
                  color:        returnColor(item.returnPct),
                  background:   returnBg(item.returnPct),
                  padding:      '3px 8px',
                  borderRadius: 9999,
                }}>
                  {item.returnPct}% return
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
