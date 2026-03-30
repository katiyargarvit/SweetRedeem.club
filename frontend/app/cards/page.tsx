'use client';

// ============================================================
// Cards page — V3 Quiet Luxury
// Card museum: visual card, stats, top partners.
// Transfer ratio reference table with filter.
// ============================================================

import { useState } from 'react';

// ── Card data ─────────────────────────────────────────────────
const CARDS = [
  {
    id: 'hdfc-infinia',
    name: 'HDFC Infinia',
    issuer: 'HDFC Bank',
    currency: 'Reward Points',
    cpp_base: 0.50,
    annual_fee: 12500,
    colour: '#1A3A5C',
    accent: '#3B82F6',
    tier: 'Ultra Premium',
    top_partners: ['KrisFlyer', 'Flying Blue', 'Aeroplan'],
    best_cpp: 2.10,
    description: '5 RP / ₹100 earn rate. Transfers 1:1 to all major programmes. The benchmark card for India.',
  },
  {
    id: 'axis-atlas',
    name: 'Axis Atlas',
    issuer: 'Axis Bank',
    currency: 'EDGE Miles',
    cpp_base: 0.42,
    annual_fee: 5000,
    colour: '#1C1432',
    accent: '#7C3AED',
    tier: 'Premium',
    top_partners: ['KrisFlyer', 'Aeroplan', 'Qatar Privilege'],
    best_cpp: 1.85,
    description: '5 EDGE Miles / ₹200 on travel, 2 / ₹200 otherwise. Group A cap: 30K / yr per partner.',
  },
  {
    id: 'axis-magnus',
    name: 'Axis Magnus (Burgundy)',
    issuer: 'Axis Bank',
    currency: 'EDGE Miles',
    cpp_base: 0.42,
    annual_fee: 10000,
    colour: '#2D1010',
    accent: '#EF4444',
    tier: 'Super Premium',
    top_partners: ['Flying Blue', 'Aeroplan', 'United MileagePlus'],
    best_cpp: 1.95,
    description: '5:4 transfer to Flying Blue and Aeroplan. Flash-sale stack with Flying Blue is extremely potent.',
  },
  {
    id: 'amex-plat',
    name: 'Amex Platinum Travel',
    issuer: 'American Express',
    currency: 'Membership Rewards',
    cpp_base: 0.45,
    annual_fee: 60000,
    colour: '#1C1A14',
    accent: '#D97706',
    tier: 'Ultra Premium',
    top_partners: ['BA Avios', 'Marriott Bonvoy'],
    best_cpp: 1.60,
    description: '2:1 to Avios, then 1:1 Avios → Qatar. Bypasses the 3:1 direct Qatar rate. Niche but powerful.',
  },
  {
    id: 'hsbc-premier',
    name: 'HSBC Premier',
    issuer: 'HSBC Bank',
    currency: 'Reward Points',
    cpp_base: 0.50,
    annual_fee: 0,
    colour: '#0D1C0D',
    accent: '#10B981',
    tier: 'Premium',
    top_partners: ['KrisFlyer', 'Flying Blue', 'United MileagePlus'],
    best_cpp: 1.80,
    description: '1:1 transfers to KrisFlyer and Flying Blue. No annual fee with Premier banking. Hidden gem.',
  },
  {
    id: 'sbi-aurum',
    name: 'SBI Aurum',
    issuer: 'SBI Card',
    currency: 'Reward Points',
    cpp_base: 0.35,
    annual_fee: 9999,
    colour: '#1A1200',
    accent: '#FBBF24',
    tier: 'Premium',
    top_partners: ['Marriott Bonvoy', 'Hilton Honors'],
    best_cpp: 1.40,
    description: 'Strong hotel transfer partnerships. Solid for Marriott Bonvoy aspirational redemptions.',
  },
];

// ── Transfer table ────────────────────────────────────────────
const TRANSFERS = [
  { from: 'HDFC Infinia',          to: 'KrisFlyer',          ratio: '1:1',   verdict: 'elite', cpp: 2.10 },
  { from: 'HDFC Infinia',          to: 'Flying Blue',         ratio: '1:1',   verdict: 'elite', cpp: 1.90 },
  { from: 'HDFC Infinia',          to: 'Aeroplan',            ratio: '1:1',   verdict: 'elite', cpp: 1.85 },
  { from: 'HDFC Infinia',          to: 'Marriott Bonvoy',     ratio: '1:1',   verdict: 'good',  cpp: 0.90 },
  { from: 'Axis Atlas',            to: 'KrisFlyer',           ratio: '5:2',   verdict: 'high',  cpp: 1.68 },
  { from: 'Axis Atlas',            to: 'Aeroplan',            ratio: '1:2',   verdict: 'elite', cpp: 1.85 },
  { from: 'Axis Atlas',            to: 'Qatar Privilege',     ratio: '1:2',   verdict: 'elite', cpp: 1.95 },
  { from: 'Axis Magnus (Burgundy)',to: 'Flying Blue',         ratio: '5:4',   verdict: 'elite', cpp: 1.92 },
  { from: 'Axis Magnus (Burgundy)',to: 'Aeroplan',            ratio: '5:4',   verdict: 'elite', cpp: 1.88 },
  { from: 'Amex Platinum Travel',  to: 'BA Avios',            ratio: '2:1',   verdict: 'high',  cpp: 1.60 },
  { from: 'Amex Platinum Travel',  to: 'Marriott Bonvoy',     ratio: '1:1.25',verdict: 'good',  cpp: 0.95 },
  { from: 'HSBC Premier',          to: 'KrisFlyer',           ratio: '1:1',   verdict: 'elite', cpp: 2.10 },
  { from: 'HSBC Premier',          to: 'Flying Blue',         ratio: '1:1',   verdict: 'elite', cpp: 1.90 },
  { from: 'HSBC Premier',          to: 'Etihad Guest',        ratio: '1:1',   verdict: 'high',  cpp: 1.50 },
  { from: 'SBI Aurum',             to: 'Marriott Bonvoy',     ratio: '1:1',   verdict: 'good',  cpp: 0.90 },
  { from: 'SBI Aurum',             to: 'Hilton Honors',       ratio: '1:2',   verdict: 'good',  cpp: 0.85 },
];

// Redemption goals
const GOALS = [
  {
    goal: 'Singapore Airlines Business Class',
    verdict: 'HDFC Infinia or HSBC Premier',
    why: '1:1 to KrisFlyer — no ratio loss. 55K miles for BOM→SIN Business = ₹2.1L value.',
    color: '#00A86B',
  },
  {
    goal: 'Flying Blue Flash Sale (DEL→CDG)',
    verdict: 'Axis Magnus Burgundy',
    why: '5:4 to Flying Blue + stacks with Flash Sale promo. 12K miles for ~₹35K = ₹2.9/pt.',
    color: '#00A86B',
  },
  {
    goal: 'Canada via Aeroplan (BOM→YYZ)',
    verdict: 'HDFC Infinia or Axis Atlas',
    why: 'Aeroplan 1:1 from Infinia. Axis gives 1:2 bonus ratio (best in class). 70K miles for Business.',
    color: '#E08A00',
  },
  {
    goal: 'Marriott / Hyatt Hotels',
    verdict: 'SBI Aurum or HDFC Infinia',
    why: '1:1 Marriott Bonvoy from both. Hyatt via Amex transfer chain.',
    color: '#E08A00',
  },
  {
    goal: 'Simple statement credit / flexibility',
    verdict: 'Any card — lowest CPP option',
    why: 'Worst CPP (₹0.35–0.50/pt) but zero effort. Use only for small balances < 5K pts.',
    color: '#E03E3E',
  },
];

const VERDICT_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  elite: { bg: 'rgba(0,200,133,0.10)', text: '#00A86B',  border: 'rgba(0,200,133,0.25)' },
  high:  { bg: 'rgba(0,168,107,0.07)', text: '#007A4D',  border: 'rgba(0,168,107,0.15)' },
  good:  { bg: 'rgba(224,138,0,0.10)', text: '#E08A00',  border: 'rgba(224,138,0,0.22)' },
  poor:  { bg: 'rgba(224,62,62,0.10)', text: '#C0392B',  border: 'rgba(224,62,62,0.20)' },
};

const VERDICT_LABELS: Record<string, string> = {
  elite: 'Elite', high: 'High', good: 'Good', poor: 'Poor',
};

// ── Credit card visual ────────────────────────────────────────
function CardVisual({ card }: { card: typeof CARDS[0] }) {
  return (
    <div style={{
      width: '100%', aspectRatio: '1.586 / 1',
      borderRadius: 16,
      background: `linear-gradient(135deg, ${card.colour} 0%, ${card.accent}44 100%)`,
      border: `1px solid ${card.accent}44`,
      boxShadow: `0 12px 40px ${card.accent}22, 0 4px 12px rgba(0,0,0,0.15)`,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Chip + tier badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 28, borderRadius: 4,
          background: `linear-gradient(135deg, ${card.accent}88, ${card.accent}44)`,
          border: `1px solid ${card.accent}66`,
        }} />
        <span style={{
          fontSize: 9, fontWeight: 800, color: card.accent,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          background: `${card.accent}22`, padding: '3px 8px',
          borderRadius: 9999, border: `1px solid ${card.accent}44`,
        }}>
          {card.tier}
        </span>
      </div>

      {/* Decorative circles */}
      <div aria-hidden style={{
        position: 'absolute', right: -30, bottom: -30,
        width: 130, height: 130, borderRadius: '50%',
        border: `1px solid ${card.accent}18`,
      }} />
      <div aria-hidden style={{
        position: 'absolute', right: -10, bottom: -10,
        width: 90, height: 90, borderRadius: '50%',
        border: `1px solid ${card.accent}28`,
      }} />

      {/* Card details */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
          {card.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          {card.issuer} · {card.currency}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Best CPP</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: card.accent }}>₹{card.best_cpp.toFixed(2)}/pt</div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Annual Fee</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
              {card.annual_fee === 0 ? 'Free' : `₹${card.annual_fee.toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState(CARDS[0]);
  const [filterFrom, setFilterFrom] = useState('All');

  const cardNames = ['All', ...CARDS.map((c) => c.name)];
  const filteredTransfers = filterFrom === 'All'
    ? TRANSFERS
    : TRANSFERS.filter((t) => t.from.includes(filterFrom.split(' ')[0]));

  const multiplier = (selectedCard.best_cpp / selectedCard.cpp_base).toFixed(1);

  return (
    <div style={{ padding: '20px', background: '#F9F6F0', minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#C5A059',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
        }}>Cards</p>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 26, fontWeight: 700, color: '#000', lineHeight: 1.2, marginBottom: 4,
        }}>
          Your card arsenal
        </h1>
        <p style={{ fontSize: 12, color: '#666' }}>
          Every premium Indian card — transfer ratios, partners, and optimal redemption paths.
        </p>
      </div>

      {/* ── Card selector tabs ────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 20,
      }} className="hide-scrollbar">
        {CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card)}
            style={{
              padding: '8px 16px', borderRadius: 9999, flexShrink: 0,
              fontSize: 12, fontWeight: 700,
              border: `1px solid ${selectedCard.id === card.id ? card.accent : '#EAEAEA'}`,
              background: selectedCard.id === card.id ? `${card.accent}18` : '#fff',
              color: selectedCard.id === card.id ? card.accent : '#666',
              cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {card.name}
          </button>
        ))}
      </div>

      {/* ── Card visual + stats ───────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <CardVisual card={selectedCard} />

        {/* Stat chips below card */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8, marginTop: 12,
        }}>
          {[
            { label: 'Best CPP', value: `₹${selectedCard.best_cpp}`, color: '#00A86B' },
            { label: 'Base CPP', value: `₹${selectedCard.cpp_base}`, color: '#E03E3E' },
            { label: 'Multiplier', value: `${multiplier}×`, color: '#C5A059' },
            { label: 'Annual Fee', value: selectedCard.annual_fee === 0 ? 'Free' : `₹${(selectedCard.annual_fee / 1000).toFixed(0)}K`, color: '#000' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #EAEAEA',
              padding: '10px 8px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: 9, color: '#999', marginTop: 2 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card description ──────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
        padding: '16px', marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6, marginBottom: 12 }}>
          {selectedCard.description}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {selectedCard.top_partners.map((p) => (
            <span key={p} style={{
              padding: '4px 12px', borderRadius: 9999,
              fontSize: 11, fontWeight: 700,
              background: 'rgba(0,200,133,0.08)',
              border: '1px solid rgba(0,200,133,0.2)',
              color: '#00A86B',
            }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Redemption goals optimizer ────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 12,
        }}>
          Which card for which goal?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GOALS.map((goal, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid #EAEAEA',
              borderLeft: `3px solid ${goal.color}`,
              padding: '12px 14px',
            }}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 3 }}>Goal</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 4 }}>{goal.goal}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <p style={{ fontSize: 11, color: '#666', lineHeight: 1.5, flex: 1 }}>{goal.why}</p>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Use this</p>
                  <p style={{ fontSize: 11, fontWeight: 800, color: goal.color }}>{goal.verdict}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transfer ratio table ──────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#000' }}>Transfer ratios</p>
          <select
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid #EAEAEA', background: '#fff',
              fontSize: 11, fontWeight: 700, color: '#000',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {cardNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
          overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 60px 60px',
            padding: '10px 16px', borderBottom: '1px solid #F4F4F4',
            fontSize: 9, fontWeight: 700, color: '#999',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <span>From Card</span>
            <span>To Partner</span>
            <span style={{ textAlign: 'center' }}>Ratio</span>
            <span style={{ textAlign: 'right' }}>CPP</span>
          </div>

          {/* Rows */}
          {filteredTransfers.map((t, i) => {
            const col = VERDICT_COLOURS[t.verdict] ?? VERDICT_COLOURS.good;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 60px 60px',
                padding: '11px 16px',
                borderBottom: i < filteredTransfers.length - 1 ? '1px solid #F9F6F0' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#000' }}>{t.from}</span>
                <span style={{ fontSize: 11, color: '#666' }}>{t.to}</span>
                <span style={{
                  textAlign: 'center',
                  fontSize: 11, fontWeight: 800, color: '#C5A059',
                  fontFamily: 'monospace',
                }}>
                  {t.ratio}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px', borderRadius: 6,
                    fontSize: 10, fontWeight: 800,
                    background: col.bg, border: `1px solid ${col.border}`,
                    color: col.text,
                  }}>
                    ₹{t.cpp.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredTransfers.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: 12 }}>
              No transfer routes found for this card.
            </div>
          )}
        </div>

        <p style={{ fontSize: 10, color: '#ccc', marginTop: 10 }}>
          * Effective CPP accounts for transfer ratio. Verified March 2026.
          Always confirm current rates before transferring — they can change.
        </p>
      </div>
    </div>
  );
}
