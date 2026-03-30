// ============================================================
// ValueComparison — bar chart showing what 1L HDFC Infinia
// points are worth across different redemption categories.
// ============================================================

const BARS = [
  { label: 'Statement\nCredit', value: 50000,  color: 'rgba(224,62,62,0.3)',    height: '14%',  topColor: '#E03E3E' },
  { label: 'Cash\nback',        value: 65000,  color: 'rgba(224,138,0,0.25)',   height: '19%',  topColor: '#E08A00' },
  { label: 'Bank\nPortal',      value: 75000,  color: 'rgba(224,138,0,0.2)',    height: '21%',  topColor: '#E08A00' },
  { label: 'Economy\nFlights',  value: 140000, color: 'rgba(0,200,133,0.2)',    height: '40%',  topColor: '#00A86B' },
  { label: 'Business\nFlights', value: 210000, color: 'rgba(0,200,133,0.35)',   height: '60%',  topColor: '#00C885' },
  { label: 'First\nClass ✦',    value: 350000, color: 'rgba(197,160,89,0.45)', height: '100%', topColor: '#C5A059' },
];

function fmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  return `₹${Math.round(n / 1000)}K`;
}

export default function ValueComparison() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #EAEAEA', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>

      {/* Gold header */}
      <div style={{ background: 'linear-gradient(135deg, #E8D5B5 0%, #F4ECD8 50%, #EDD9A3 100%)', padding: '18px 18px 14px' }}>
        <p className="label-tag" style={{ color: '#7A5C00', marginBottom: 6 }}>The SweetRedeem.club edge</p>
        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 20, fontWeight: 700, color: '#3A2800', lineHeight: 1.25 }}>
          Your points could be<br />worth much more
        </p>
        <p style={{ fontSize: 11, color: '#8A6A00', marginTop: 6 }}>Based on 1,00,000 HDFC Infinia points</p>
      </div>

      {/* Bar chart */}
      <div style={{ padding: '20px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 104 }}>
          {BARS.map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
              <div style={{ width: '100%', height: bar.height, background: bar.color, borderRadius: '5px 5px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 800, whiteSpace: 'nowrap', color: bar.topColor }}>
                  {fmt(bar.value)}
                </span>
              </div>
              <p style={{ fontSize: 8, color: i === BARS.length - 1 ? '#C5A059' : '#666', textAlign: 'center', lineHeight: 1.3, fontWeight: 600, whiteSpace: 'pre-line' }}>
                {bar.label}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #EAEAEA' }}>
          <p style={{ fontSize: 11, color: '#666' }}>AI-recommended by</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 13 }}>🤖</span>
            <span style={{ fontSize: 13 }}>🔮</span>
          </div>
        </div>

        <a href="/calculator" className="btn-dark" style={{ display: 'block', textAlign: 'center', marginTop: 12, textDecoration: 'none' }}>
          Calculate my points →
        </a>
      </div>
    </div>
  );
}
