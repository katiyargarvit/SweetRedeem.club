'use client';

// ============================================================
// FaqSection — accordion FAQ items (one open at a time)
// ============================================================

import { useState } from 'react';

const FAQS = [
  {
    q: 'What is SweetRedeem.club?',
    a: 'SweetRedeem.club helps premium credit card holders (HDFC Infinia, Axis Atlas, Amex, HSBC and more) maximise the value of their reward points. We find the best transfer partners and redemption sweet spots — often 2–4× better than your bank\'s default portal.',
  },
  {
    q: 'How are point values calculated?',
    a: 'We track live award availability across 30+ loyalty programmes, compare cash ticket prices, and compute the Cost Per Point (CPP) for each redemption. Values are updated frequently so you always see the freshest data.',
  },
  {
    q: 'Which credit cards do you support?',
    a: 'Currently: HDFC Infinia, HDFC Regalia, Axis Atlas, Axis Magnus, Amex Platinum Travel, HSBC Premier, and SBI Aurum. More cards are added regularly — sign up for alerts to be notified.',
  },
  {
    q: 'Are the redemption values guaranteed?',
    a: 'No. All values are estimates based on publicly available award charts and community-verified data. Actual availability and prices vary. Always verify on the loyalty programme\'s website before transferring points — transfers are irreversible.',
  },
  {
    q: 'Is SweetRedeem.club free to use?',
    a: 'The core discovery features are free. A premium tier with real-time alerts, CPP optimiser, and statement analysis is in the works. Sign up now to be a founding member.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <h2 style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 22, fontWeight: 700, color: '#000', marginBottom: 16,
      }}>
        Frequently Asked
      </h2>

      {FAQS.map((faq, i) => (
        <div
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #EAEAEA',
            overflow: 'hidden',
            marginBottom: 8,
            cursor: 'pointer',
            boxShadow: open === i ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#000', flex: 1, paddingRight: 8 }}>{faq.q}</p>
            <span style={{
              fontSize: 18,
              color: '#666',
              transition: 'transform 0.2s',
              transform: open === i ? 'rotate(90deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}>
              ›
            </span>
          </div>
          {open === i && (
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid #EAEAEA', paddingTop: 12 }}>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65 }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
