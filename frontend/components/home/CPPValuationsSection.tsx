'use client';

// CPPValuationsSection — "We know what your points are worth."
// TOP click  → applies card on bank portal (new tab)
// BOTTOM click → sweet spot details page

import { useRouter } from 'next/navigation';

const CORAL = '#FF6B4A';
const GREEN = '#00A86B';
const BLUE  = '#2563EB';

const CARDS = [
  { card: 'HDFC Infinia',    bank: 'hdfcbank.com',        cpp: 5.85, ret: 19.5, route: 'DEL → LHR', cabin: 'Business',   program: 'Avios (BA)',         photo: '/cards/hdfc-infinia.png',        applyUrl: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card',                      spot: '/sweet-spots' },
  { card: 'Amex Platinum T.', bank: 'americanexpress.com', cpp: 4.66, ret: 15.6, route: 'DEL → NRT', cabin: 'First Class', program: 'ANA Mileage Club',   photo: '/cards/amex-platinum-travel.png', applyUrl: 'https://www.americanexpress.com/en-in/credit-cards/platinum-travel-credit-card/', spot: '/sweet-spots' },
  { card: 'Axis Atlas',      bank: 'axisbank.com',         cpp: 4.40, ret: 14.7, route: 'BOM → CDG', cabin: 'Business',   program: 'Flying Blue',        photo: '/cards/axis-atlas.png',          applyUrl: 'https://www.axisbank.com/retail/cards/credit-card/atlas-credit-card',                               spot: '/sweet-spots' },
  { card: 'Axis Magnus',     bank: 'axisbank.com',         cpp: 4.14, ret: 13.8, route: 'DEL → JFK', cabin: 'QSuites',    program: 'Qatar Privilege Club', photo: '/cards/axis-magnus.png',        applyUrl: 'https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card',                              spot: '/sweet-spots' },
  { card: 'Axis Olympus',    bank: 'axisbank.com',         cpp: 3.68, ret: 12.3, route: 'SIN → LHR', cabin: 'First Class', program: 'KrisFlyer',          photo: '/cards/axis-olympus.png',        applyUrl: 'https://www.axisbank.com/retail/cards/credit-card/axis-bank-olympus-credit-card',                   spot: '/sweet-spots' },
  { card: 'HDFC Regalia',    bank: 'hdfcbank.com',         cpp: 2.88, ret:  9.6, route: 'DEL → BKK', cabin: 'Business',   program: 'Thai ROP',           photo: '/cards/hdfc-regalia.png',        applyUrl: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card',                      spot: '/sweet-spots' },
];

const retColor = (r: number) => r >= 14 ? GREEN : r >= 10 ? BLUE : '#64748b';
const retBg    = (r: number) => r >= 14 ? 'rgba(0,168,107,0.10)' : r >= 10 ? 'rgba(37,99,235,0.10)' : 'rgba(100,116,139,0.10)';

export default function CPPValuationsSection() {
  const router = useRouter();

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9', paddingTop: 40, paddingBottom: 40 }}>

      {/* Bounce + hover styles */}
      <style>{`
        @keyframes srBounce {
          0%,100% { transform: translateY(0); }
          30%     { transform: translateY(-6px); }
          60%     { transform: translateY(-3px); }
        }
        .sr-cta-bounce { animation: srBounce 1.6s ease-in-out infinite; }
        .sr-top:hover  { opacity: 0.9; }
        .sr-bot:hover  { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#0f172a', margin: 0 }}>
            We know what your<br />points are worth.
          </h2>

          {/* Bouncing CTA nudge */}
          <div className="sr-cta-bounce" style={{ flexShrink: 0, marginTop: 4, textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.3, color: CORAL, margin: '0 0 2px' }}>
              Click a card<br />to apply
            </p>
            <svg width="24" height="18" viewBox="0 0 28 22" fill="none">
              <path d="M22 2 C18 2,6 4,4 14 C3 18,6 20,8 19" stroke={CORAL} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 14 L8 19 L11 15"                   stroke={CORAL} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Find your perfect travel buddy</p>
      </div>

      {/* Horizontal card strip */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 12, padding: '4px 20px 8px', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' } as React.CSSProperties}>
        {CARDS.map((c) => (
          <div key={c.card} style={{ flex: '0 0 auto', width: 160, borderRadius: 18, overflow: 'hidden', border: '1px solid #E2E8F0', background: '#fff', scrollSnapAlign: 'start' }}>

            {/* TOP — click to apply card */}
            <div className="sr-top" onClick={() => window.open(c.applyUrl, '_blank', 'noopener,noreferrer')}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}>

              {/* Card image — full bleed */}
              <div style={{ height: 101, overflow: 'hidden' }}>
                <img src={c.photo} alt={`${c.card} credit card`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              </div>

              {/* Bank logo + card name */}
              <div style={{ padding: '14px 12px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://cdn.brandfetch.io/${c.bank}/icon`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: '#CBD5E1', lineHeight: 1.2 }}>
                    {c.card}
                  </p>
                </div>

                {/* CPP */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>₹{c.cpp.toFixed(2)}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>per point</span>
                </div>
              </div>
            </div>

            {/* BOTTOM — click to view sweet spot details */}
            <div className="sr-bot" onClick={() => router.push(c.spot)}
              style={{ padding: '10px 12px 14px', cursor: 'pointer', transition: 'background 0.15s', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Best Redemption</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.25, margin: 0 }}>{c.route}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.25, marginBottom: 10 }}>{c.cabin} · {c.program}</p>
              <span style={{ fontSize: 9, fontWeight: 800, color: retColor(c.ret), background: retBg(c.ret), padding: '3px 8px', borderRadius: 9999 }}>
                {c.ret}% return
              </span>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
