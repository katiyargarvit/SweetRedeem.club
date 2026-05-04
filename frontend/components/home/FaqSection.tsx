'use client';

// ============================================================
// FaqSection -- "Decoding the Club." accordion
// Figma Make design (03-May): animated + / x toggle
// ============================================================

import { useState } from 'react';

const NAVY = '#0B1120';

const FAQ_ITEMS = [
  {
    q: "Why are your deals so much better than what I see on my bank's travel portal?",
    a: "Standard bank portals (like SmartBuy or Travel Edge) use your points to buy regular cash fares at fixed, low rates--usually capping your value at Rs.0.20 to Rs.1 per point. We don't do that. We track hidden Award Inventory--special seats released directly by airlines that cost a fraction of the points. We show you how to transfer your points to those specific airlines to unlock 3x to 6x more value.",
  },
  {
    q: "Are these real, confirmed tickets, or standby/budget flights?",
    a: "These are 100% confirmed, standard tickets on premium global airlines (like British Airways, Singapore Airlines, and Qatar Airways). You are flying the exact same First Class, Business, or Economy product as the person next to you who paid full retail price; you just used the smart money route to book it.",
  },
  {
    q: "Do I transfer my points to SweetRedeem or book directly on your site?",
    a: "No. You maintain total control of your points at all times. Think of us as your intelligence engine. We find the exact sweetspot, tell you which airline program to transfer your points to, and guide you on how to book it directly on the airline's official website.",
  },
  {
    q: "Which credit cards do I need to take advantage of these deals?",
    a: "The biggest wins come from credit cards that allow you to transfer points to multiple airline partners. If you hold premium cards like the HDFC Infinia, Axis Atlas, Amex Platinum/MR cards, or Axis Magnus, you are sitting on a goldmine. You can filter our platform to only show deals matching the cards in your wallet.",
  },
  {
    q: "What does the Value Boost or Multiplier actually mean?",
    a: "The math of transfer ratios can be exhausting, so we do it for you. The Multiplier shows you exactly how much extra value you are generating compared to a standard bank portal redemption. If a deal says 4x More Value, it means you are getting four times the actual rupee value for the exact same amount of points.",
  },
  {
    q: "Is there a catch? Why isn't everyone doing this?",
    a: "The catch is that it requires knowing the secret language of airline alliances, routing rules, and transfer ratios--which the banks and airlines intentionally make confusing so you settle for standard cashback. Most people simply don't have the time to do the math. We built SweetRedeem to do the math for you.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section style={{
      background:  '#fff',
      borderTop:   '1px solid #F1F5F9',
      padding:     '40px 20px 40px',
    }}>
      <h2 style={{
        fontSize:      30,
        fontWeight:    800,
        letterSpacing: '-0.025em',
        lineHeight:    1.15,
        color:         '#0f172a',
        margin:        '0 0 8px',
      }}>
        Decoding<br />the Club.
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 32px' }}>
        Everything you need to know before you redeem.
      </p>

      <div style={{
        borderRadius: 24,
        border:       '1px solid #f1f5f9',
        boxShadow:    '0 1px 4px rgba(0,0,0,0.06)',
        overflow:     'hidden',
      }}>
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? '1px solid #f1f5f9' : 'none' }}
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width:          '100%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                gap:            16,
                padding:        '18px 20px',
                textAlign:      'left',
                background:     'transparent',
                border:         'none',
                cursor:         'pointer',
              }}
            >
              <span style={{
                fontSize:     14,
                fontWeight:   600,
                color:        '#0f172a',
                flex:         1,
                lineHeight:   1.4,
                paddingRight: 8,
              }}>
                {item.q}
              </span>
              <div style={{
                width:          28,
                height:         28,
                borderRadius:   9999,
                border:         '1px solid #e2e8f0',
                background:     openIdx === i ? NAVY : 'transparent',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                transition:     'all 0.2s',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1v10M1 6h10"
                    stroke={openIdx === i ? '#fff' : '#94a3b8'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    style={{
                      transform:       openIdx === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      transformOrigin: '6px 6px',
                      transition:      'transform 0.2s',
                    }}
                  />
                </svg>
              </div>
            </button>

            {openIdx === i && (
              <p style={{
                padding:    '0 20px 18px',
                fontSize:   13,
                fontWeight: 400,
                color:      '#64748b',
                lineHeight: 1.7,
                margin:     0,
              }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
        Still have questions?{' '}
        <a
          href="mailto:hello@sweetredeem.club"
          style={{ color: '#0f172a', textDecoration: 'underline', fontWeight: 600, textUnderlineOffset: 2 }}
        >
          Contact our support team
        </a>
      </p>
    </section>
  );
}
