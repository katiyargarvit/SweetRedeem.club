'use client';

const PROGRAMS = [
  { name: 'KrisFlyer',       flag: '🇸🇬', color: '#10B981' },
  { name: 'Flying Blue',     flag: '🇫🇷', color: '#3B82F6' },
  { name: 'Aeroplan',        flag: '🇨🇦', color: '#EF4444' },
  { name: 'Avios',           flag: '🇬🇧', color: '#1D4ED8' },
  { name: 'United MileagePlus', flag: '🇺🇸', color: '#1E3A5F' },
  { name: 'Marriott Bonvoy', flag: '🏨', color: '#C2410C' },
  { name: 'World of Hyatt',  flag: '🏨', color: '#7C3AED' },
  { name: 'Etihad Guest',    flag: '🇦🇪', color: '#D97706' },
  { name: 'Qatar Privilege', flag: '🇶🇦', color: '#7C2D12' },
  { name: 'Asia Miles',      flag: '🇭🇰', color: '#166534' },
  { name: 'Accor ALL',       flag: '🏨', color: '#EA580C' },
  { name: 'Hilton Honors',   flag: '🏨', color: '#1E40AF' },
];

// Duplicate list so the marquee loops seamlessly
const DOUBLED = [...PROGRAMS, ...PROGRAMS];

export function PartnerMarquee() {
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(90deg, #0D0D0D, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(270deg, #0D0D0D, transparent)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          display: 'flex',
          gap: 12,
          animation: 'marquee 30s linear infinite',
          width: 'max-content',
        }}
      >
        {DOUBLED.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#141414',
              border: '1px solid #222222',
              borderRadius: 100,
              boxShadow: '2px 2px 0 #000',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16 }}>{p.flag}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF' }}>{p.name}</span>
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: p.color, flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
