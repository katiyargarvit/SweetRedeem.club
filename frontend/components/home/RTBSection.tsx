'use client';

// ============================================================
// RTBSection -- "Why it works." feature list
// Figma Make design (03-May): expandable items with inline SVG icons
// ============================================================

import { useState } from 'react';

const BLUE = '#2563EB';

const ITEMS = [
  {
    heading: 'Unlock True Award Seats',
    body:    'Stop settling for basic statement credits. Real value lives in exclusive, limited airline inventories.',
    detail:  'Standard portals like SmartBuy just buy cash fares, capping your points at 1x. We find hidden award tickets that multiply your yield up to 6x.',
    icon:    StarIcon,
  },
  {
    heading: 'Zero Math, Total Clarity',
    body:    'Airline alliances and bank transfer ratios are literally designed to confuse you. We fix that.',
    detail:  'We do the heavy lifting. By decoding every card, loyalty program, and transfer ratio, we reveal the exact true rupee value of your points instantly.',
    icon:    ZapIcon,
  },
  {
    heading: 'Verified by the Club',
    body:    "You aren't flying solo. Our community of expert optimizers actively uncovers the industry's best redemptions.",
    detail:  'Our members hunt, test, and upvote the smartest flight sweetspots daily, ensuring you only spend points on deals that actually work.',
    icon:    ShieldIcon,
  },
  {
    heading: 'Get the Insider Edge',
    body:    'Banks want you to redeem your hard-earned points for pennies. We help you demand rupees.',
    detail:  'Join a private community of optimizers securing verified, high-yield luxury redemptions that standard credit card travel portals try to keep hidden.',
    icon:    KeyIcon,
  },
];

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function RTBSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section style={{
      background:   '#fff',
      borderTop:    '1px solid #F1F5F9',
      padding:      '40px 20px 48px',
      position:     'relative',
      overflow:     'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position:      'absolute',
        top:           0,
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         300,
        height:        180,
        borderRadius:  9999,
        background:    'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ marginBottom: 36, position: 'relative' }}>
        <p style={{
          fontSize:      10,
          fontWeight:    700,
          color:         '#94a3b8',
          letterSpacing: '1.1px',
          textTransform: 'uppercase',
          margin:        '0 0 8px',
        }}>
          THE SWEETREDEEM EDGE
        </p>
        <h2 style={{
          fontSize:      42,
          fontWeight:    800,
          color:         'rgba(15,23,42,0.12)',
          letterSpacing: '-0.025em',
          lineHeight:    1.08,
          margin:        0,
        }}>
          Why it works.
        </h2>
      </div>

      {/* Feature items */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const open = expanded === i;

          return (
            <div key={i} style={{
              borderBottom:  i < ITEMS.length - 1 ? '1px solid #f1f5f9' : 'none',
              paddingBottom: i < ITEMS.length - 1 ? 28 : 0,
              marginBottom:  i < ITEMS.length - 1 ? 28 : 0,
              display:       'flex',
              gap:           16,
              alignItems:    'flex-start',
            }}>
              {/* Icon */}
              <div style={{
                width:          40,
                height:         40,
                borderRadius:   9999,
                background:     'rgba(15,23,42,0.04)',
                border:         '0.75px solid #e2e8f0',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                marginTop:      4,
                color:          '#94a3b8',
              }}>
                <Icon />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize:      20,
                  fontWeight:    700,
                  color:         'rgba(15,23,42,0.14)',
                  letterSpacing: '-0.01em',
                  margin:        '0 0 8px',
                  lineHeight:    1.2,
                }}>
                  {item.heading}
                </h3>
                <p style={{
                  fontSize:   13,
                  fontWeight: 500,
                  color:      '#64748b',
                  lineHeight: 1.65,
                  margin:     '0 0 10px',
                  maxWidth:   320,
                }}>
                  {item.body}
                </p>

                <button
                  onClick={() => setExpanded(open ? null : i)}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           4,
                    background:    'none',
                    border:        'none',
                    padding:       0,
                    cursor:        'pointer',
                    color:         BLUE,
                    fontSize:      12,
                    fontWeight:    700,
                    letterSpacing: '0.04em',
                  }}
                >
                  See how?
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {open && (
                  <p style={{
                    fontSize:   13,
                    fontWeight: 500,
                    color:      '#334155',
                    lineHeight: 1.65,
                    margin:     '12px 0 0',
                    paddingTop: 12,
                    borderTop:  '1px solid rgba(0,0,0,0.06)',
                    maxWidth:   320,
                  }}>
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
