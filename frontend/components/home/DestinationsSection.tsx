// ============================================================
// DestinationsSection — "Where your points take you furthest"
// Horizontal scroll city cards with CPP / value overlay
// ============================================================

const DESTINATIONS = [
  {
    city: 'Seoul',
    country: 'South Korea',
    highlight: 'ANA The Room · 75K pts',
    cpp: '₹2.1/pt',
    gradient: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)',
    // Replace with real photo: https://your-cdn.com/seoul.jpg
    image: null as string | null,
  },
  {
    city: 'London',
    country: 'United Kingdom',
    highlight: 'Virgin Atlantic · 29K pts',
    cpp: '₹2.8/pt',
    gradient: 'linear-gradient(160deg, #1a1a2e, #16213e, #0f3460)',
    image: null as string | null,
  },
  {
    city: 'Dubai',
    country: 'UAE',
    highlight: 'Emirates First · 102K pts',
    cpp: '₹2.4/pt',
    gradient: 'linear-gradient(160deg, #373b44, #4286f4)',
    image: null as string | null,
  },
];

export default function DestinationsSection() {
  return (
    <div style={{ paddingTop: 40 }}>

      {/* ── Section header ───────────────────────────────── */}
      <div style={{ padding: '0 20px 16px' }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#90a1b9',
          letterSpacing: '1.1px', textTransform: 'uppercase',
          margin: '0 0 6px',
        }}>
          Handpicked routes
        </p>
        <h2 style={{
          fontSize: 22, fontWeight: 800, color: '#0f172b',
          letterSpacing: '-0.5px', lineHeight: 1.25, margin: 0,
        }}>
          Where your points<br />take you furthest
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, marginBottom: 0 }}>
          Browse top sweet spots by destination
        </p>
      </div>

      {/* ── Horizontal scroll ────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 12,
        padding: '0 20px 8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {DESTINATIONS.map((dest, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 180,
              height: 220,
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              background: dest.gradient,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {/* Background image if available */}
            {dest.image && (
              <img
                src={dest.image}
                alt={dest.city}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)',
            }} />

            {/* CPP badge */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
              padding: '4px 10px',
              borderRadius: 9999,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#bfff00' }}>
                {dest.cpp}
              </span>
            </div>

            {/* City info */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '16px 14px',
            }}>
              <p style={{
                fontSize: 20, fontWeight: 800, color: '#fff',
                letterSpacing: '-0.4px', margin: '0 0 2px',
              }}>
                {dest.city}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: '0 0 6px' }}>
                {dest.country}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600, margin: 0 }}>
                {dest.highlight}
              </p>
            </div>
          </div>
        ))}

        {/* See all card */}
        <div style={{
          flexShrink: 0, width: 100, height: 220,
          borderRadius: 20,
          border: '1.5px dashed #e2e8f0',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, cursor: 'pointer',
          color: '#90a1b9',
        }}>
          <span style={{ fontSize: 24 }}>→</span>
          <p style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
            All<br />Routes
          </p>
        </div>
      </div>

    </div>
  );
}
