'use client';

// ============================================================
// DestinationsSection — "Where your points take you furthest"
// Figma Make design (03-May): horizontal city photo cards
// ============================================================

const CORAL = '#FF6B4A';
const SERIF = "'Playfair Display', Georgia, serif";

const DESTINATIONS = [
  {
    city:    'Seoul',
    country: 'South Korea',
    pricePt: '₹2.1/pt',
    airline: 'ANA The Room',
    points:  '75K pts',
    src:     'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    city:    'London',
    country: 'United Kingdom',
    pricePt: '₹2.8/pt',
    airline: 'Virgin Atlantic',
    points:  '29K pts',
    src:     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  },
  {
    city:    'Dubai',
    country: 'UAE',
    pricePt: '₹3.2/pt',
    airline: 'Emirates',
    points:  '45K pts',
    src:     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  },
  {
    city:    'Singapore',
    country: 'Singapore',
    pricePt: '₹2.5/pt',
    airline: 'KrisFlyer',
    points:  '55K pts',
    src:     'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  },
  {
    city:    'Maldives',
    country: 'Maldives',
    pricePt: '₹2.7/pt',
    airline: 'World of Hyatt',
    points:  '35K pts',
    src:     'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=600&q=80',
  },
];

export default function DestinationsSection() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #F1F5F9', paddingTop: 40, paddingBottom: 40 }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <h2 style={{
          fontSize:      28,
          fontWeight:    800,
          letterSpacing: '-0.025em',
          lineHeight:    1.25,
          color:         '#0f172a',
          margin:        '0 0 4px',
        }}>
          Where your points<br />take you furthest
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Explore by destination</p>
      </div>

      {/* ── Horizontal scroll city cards ──────────────── */}
      <div style={{
        display:       'flex',
        overflowX:     'auto',
        gap:           12,
        padding:       '4px 20px 8px',
        scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory',
      } as React.CSSProperties}>
        {DESTINATIONS.map((d) => (
          <div
            key={d.city}
            style={{
              flex:           '0 0 auto',
              width:          200,
              height:         260,
              borderRadius:   20,
              overflow:       'hidden',
              position:       'relative',
              scrollSnapAlign: 'start',
              cursor:         'pointer',
            }}
          >
            {/* Photo */}
            <img
              src={d.src}
              alt={d.city}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Gradient overlay */}
            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%)',
            }} />

            {/* CPP badge */}
            <div style={{
              position:     'absolute',
              top:          12,
              right:        12,
              background:   CORAL,
              borderRadius: 9999,
              padding:      '4px 10px',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{d.pricePt}</span>
            </div>

            {/* City info */}
            <div style={{
              position:      'absolute',
              bottom:        0,
              left:          0,
              right:         0,
              padding:       '0 16px 16px',
            }}>
              <h3 style={{
                fontFamily:    SERIF,
                fontSize:      26,
                fontWeight:    700,
                color:         '#fff',
                lineHeight:    1.1,
                margin:        '0 0 2px',
              }}>
                {d.city}
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>{d.country}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  {d.airline} · {d.points}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
