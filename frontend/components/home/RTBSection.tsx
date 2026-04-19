'use client';

// ============================================================
// RTBSection — "THE SWEETREDEEM EDGE · Why it works."
// 4 feature items with icons, headings, descriptions, CTAs
// ============================================================

// Figma CDN icon assets (valid ~7 days — replace with your own)
const ICONS = [
  'https://www.figma.com/api/mcp/asset/15fc9529-3561-4827-beda-d68eab3984b8',   // unlock/star
  'https://www.figma.com/api/mcp/asset/531d9679-00d1-4b85-a61b-da6484c786a0',   // lightning
  'https://www.figma.com/api/mcp/asset/5618a1a0-0ac8-4c80-a788-aa59194ffde0',   // shield/verified
  'https://www.figma.com/api/mcp/asset/30be85c7-aaa9-4d7f-9f1c-f8bc26b0c2c7',   // key/insider
];

const EMOJI_FALLBACKS = ['⭐', '⚡', '🛡️', '🗝️'];

const ITEMS = [
  {
    heading: 'Unlock True Award Seats',
    body: 'Stop settling for basic statement credits. Real value lives in exclusive, limited airline inventories.',
  },
  {
    heading: 'Zero Math, Total Clarity',
    body: 'Airline alliances and bank transfer ratios are literally designed to confuse you. We fix that.',
  },
  {
    heading: 'Verified by the Club',
    body: "You aren't flying solo. Our community of expert optimizers actively uncovers the industry's best redemptions.",
  },
  {
    heading: 'Get the Insider Edge',
    body: "Banks want you to redeem your hard-earned points for pennies. We help you demand rupees.",
  },
];

export default function RTBSection() {
  return (
    <div style={{ background: '#fff', padding: '40px 20px 32px', position: 'relative', overflow: 'hidden' }}>

      {/* ── Subtle radial glow ──────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: '15%',
        width: 300, height: 180,
        borderRadius: 9999,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Label ─────────────────────────────────────── */}
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#90a1b9',
        letterSpacing: '1.1px', textTransform: 'uppercase',
        margin: '0 0 12px',
      }}>
        THE SWEETREDEEM EDGE
      </p>

      {/* ── Watermark heading ────────────────────────── */}
      <h2 style={{
        fontSize: 42, fontWeight: 800,
        color: 'rgba(15,23,42,0.13)',
        letterSpacing: '-0.84px',
        lineHeight: 1.08,
        margin: '0 0 32px',
      }}>
        Why it works.
      </h2>

      {/* ── Feature list ──────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: i < ITEMS.length - 1 ? '0.75px solid #f1f5f9' : 'none',
              paddingBottom: i < ITEMS.length - 1 ? 28 : 0,
              display: 'flex', gap: 16, alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 9999,
              background: 'rgba(15,23,42,0.04)',
              border: '0.75px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              marginTop: 4,
            }}>
              <img
                src={ICONS[i]}
                alt=""
                style={{ width: 20, height: 20 }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const span = document.createElement('span');
                  span.style.fontSize = '16px';
                  span.textContent = EMOJI_FALLBACKS[i];
                  el.parentElement?.appendChild(span);
                }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              {/* Heading — rendered as faint watermark text */}
              <h3 style={{
                fontSize: 20, fontWeight: 800,
                color: 'rgba(15,23,42,0.14)',
                letterSpacing: '-0.2px',
                margin: '0 0 8px',
              }}>
                {item.heading}
              </h3>
              <p style={{
                fontSize: 13, fontWeight: 500, color: '#64748b',
                lineHeight: 1.65, margin: '0 0 10px',
                maxWidth: 320,
              }}>
                {item.body}
              </p>
              <button style={{
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#2563eb',
                  letterSpacing: '0.48px',
                }}>See how?</span>
                <span style={{ fontSize: 12, color: '#2563eb' }}>↓</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
