'use client';

// ============================================================
// Calculator page — V3 Quiet Luxury
// Users pick a card + enter points → see value across
// redemption categories and top transfer partners.
// ============================================================

import { useState, useEffect } from 'react';
import {
  fetchCards, fetchCardRoutes,
  formatINR, formatINRFull, formatPoints, cppTier,
  type PartnerRoute,
} from '@/lib/supabase-queries';
import type { CardRow } from '@/lib/database.types';

// ── Static card metadata (visual / marketing info) ───────────
// Keyed by the exact UUID from seed.sql (00000000-0000-0000-0001-XXXXXXXXXXXX).
// Supabase cards table stores financial data; we enrich with visuals + best-CPP.
const CARD_META: Record<string, {
  colour: string; accent: string; tier: string;
  best_cpp: number; top_partners: string[];
  description: string;
}> = {
  // HDFC Infinia
  '00000000-0000-0000-0001-000000000001': {
    colour: '#1A3A5C', accent: '#3B82F6', tier: 'Ultra Premium',
    best_cpp: 2.10, top_partners: ['KrisFlyer', 'Flying Blue', 'Aeroplan'],
    description: '3.33 RP / ₹100. Transfers 1:1 to all major programmes. Best all-rounder.',
  },
  // HDFC Diners Club Black
  '00000000-0000-0000-0001-000000000002': {
    colour: '#0A0A0A', accent: '#94A3B8', tier: 'Ultra Premium',
    best_cpp: 2.10, top_partners: ['KrisFlyer', 'Flying Blue', 'Aeroplan'],
    description: 'Identical earn and transfer structure to Infinia. Co-branded with Diners Club.',
  },
  // Axis Atlas
  '00000000-0000-0000-0001-000000000003': {
    colour: '#1C1432', accent: '#7C3AED', tier: 'Premium',
    best_cpp: 1.85, top_partners: ['KrisFlyer', 'Aeroplan', 'Qatar Privilege'],
    description: '2 EDGE Miles / ₹100. Best for Aeroplan via 1:2 transfer ratio.',
  },
  // SBI Aurum
  '00000000-0000-0000-0001-000000000004': {
    colour: '#1A1200', accent: '#FBBF24', tier: 'Premium',
    best_cpp: 1.40, top_partners: ['Marriott Bonvoy', 'Hilton Honors'],
    description: 'Strong hotel transfers. Best for Marriott aspirational redemptions.',
  },
  // ICICI Emeralde Private
  '00000000-0000-0000-0001-000000000005': {
    colour: '#0C1A0C', accent: '#22C55E', tier: 'Ultra Premium',
    best_cpp: 1.50, top_partners: ['Air India', 'iShop Flights', 'iShop Hotels'],
    description: '1 RP = ₹1 on iShop for flights — highest direct value of any card in India.',
  },
  // Amex Platinum Travel
  '00000000-0000-0000-0001-000000000006': {
    colour: '#1C1A14', accent: '#D97706', tier: 'Ultra Premium',
    best_cpp: 1.60, top_partners: ['BA Avios', 'Marriott Bonvoy'],
    description: '2:1 to Avios, then 1:1 Avios → Qatar. Powerful niche routing.',
  },
  // Axis Olympus (formerly Citi Prestige)
  '00000000-0000-0000-0001-000000000007': {
    colour: '#0E1A2B', accent: '#38BDF8', tier: 'Super Premium',
    best_cpp: 2.20, top_partners: ['Aeroplan', 'KrisFlyer', 'Flying Blue'],
    description: '1:4 transfer ratio — the best multiplier of any card in India. Former Citi Prestige.',
  },
  // Axis Magnus (Burgundy)
  '00000000-0000-0000-0001-000000000008': {
    colour: '#2D1010', accent: '#EF4444', tier: 'Super Premium',
    best_cpp: 1.95, top_partners: ['Flying Blue', 'Aeroplan', 'United MileagePlus'],
    description: '5:4 transfer to Flying Blue & Aeroplan. Stack with flash sales for elite CPP.',
  },
  // Axis Magnus (Standard)
  '00000000-0000-0000-0001-000000000009': {
    colour: '#1A0A14', accent: '#F43F5E', tier: 'Premium',
    best_cpp: 1.75, top_partners: ['Flying Blue', 'Aeroplan', 'KrisFlyer'],
    description: '5:2 transfer ratio. Significantly weaker than Burgundy tier. Good base earner.',
  },
  // Axis Reserve
  '00000000-0000-0000-0001-000000000010': {
    colour: '#0A100A', accent: '#A3E635', tier: 'Ultra Premium',
    best_cpp: 1.75, top_partners: ['Flying Blue', 'Aeroplan', 'KrisFlyer'],
    description: '5:2 transfer ratio. Reserved for Burgundy wealth clients. Airport access perks.',
  },
  // HDFC Regalia Gold
  '00000000-0000-0000-0001-000000000011': {
    colour: '#1A0C00', accent: '#F59E0B', tier: 'Mid-Premium',
    best_cpp: 1.60, top_partners: ['KrisFlyer', 'Club Vistara', 'Marriott Bonvoy'],
    description: 'Weaker 2:1 & 3:1 ratios vs Infinia. Good stepping-stone card before upgrading.',
  },
  // HDFC BizBlack
  '00000000-0000-0000-0001-000000000012': {
    colour: '#080808', accent: '#64748B', tier: 'Ultra Premium',
    best_cpp: 1.80, top_partners: ['KrisFlyer'],
    description: '1:1 KrisFlyer only. All other transfer partners unavailable. Business card.',
  },
  // HSBC Premier
  '00000000-0000-0000-0001-000000000013': {
    colour: '#0D1C0D', accent: '#10B981', tier: 'Premium',
    best_cpp: 1.80, top_partners: ['KrisFlyer', 'Flying Blue', 'Accor'],
    description: '1:1 to KrisFlyer and Flying Blue. 1:1 to Accor — better than HDFC\'s 2:1 Accor rate.',
  },
  // HSBC TravelOne
  '00000000-0000-0000-0001-000000000014': {
    colour: '#0D150D', accent: '#34D399', tier: 'Premium',
    best_cpp: 1.80, top_partners: ['KrisFlyer', 'Flying Blue', 'Accor'],
    description: 'Same transfer partners as HSBC Premier. Strong travel-focused earning structure.',
  },
};

// ── Static redemption scenarios (bar chart breakdown) ────────
// These are shown per 1,00,000 points of the selected card.
function buildScenarios(cashCpp: number, bestCpp: number) {
  return [
    { label: 'Cash / Statement', value: 100000 * cashCpp, color: '#E03E3E', pct: 0 },
    { label: 'Bank Portal', value: 100000 * Math.min(cashCpp * 1.4, 0.75), color: '#E08A00', pct: 0 },
    { label: 'Economy Flights', value: 100000 * 1.40, color: '#00A86B', pct: 0 },
    { label: 'Business Flights', value: 100000 * 2.10, color: '#00C885', pct: 0 },
    { label: 'First Class ✦', value: 100000 * bestCpp, color: '#C5A059', pct: 0 },
  ].map((s) => ({ ...s, pct: Math.round((s.value / (100000 * bestCpp)) * 100) }));
}

function fmtVal(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  return `₹${Math.round(n / 1000)}K`;
}

// ── CPP badge ─────────────────────────────────────────────────
function CppBadge({ cpp }: { cpp: number }) {
  const { label } = cppTier(cpp);
  const colours: Record<string, { bg: string; text: string }> = {
    'Elite Value': { bg: 'rgba(0,200,133,0.12)', text: '#00A86B' },
    'High Value':  { bg: 'rgba(0,200,133,0.08)', text: '#00A86B' },
    'Good Value':  { bg: 'rgba(224,138,0,0.10)',  text: '#E08A00' },
    'Poor Value':  { bg: 'rgba(224,62,62,0.10)',  text: '#C0392B' },
  };
  const c = colours[label] ?? colours['Good Value'];
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 10, fontWeight: 700, color: c.text, background: c.bg,
    }}>
      {label}
    </span>
  );
}

// ── Card selector tab ─────────────────────────────────────────
function CardTab({ card, selected, onClick }: {
  card: CardRow; selected: boolean; onClick: () => void;
}) {
  const meta = CARD_META[card.id];
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 9999, flexShrink: 0,
      fontSize: 12, fontWeight: 700,
      border: `1px solid ${selected ? '#121212' : '#EAEAEA'}`,
      background: selected ? '#121212' : '#fff',
      color: selected ? '#fff' : '#666',
      cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
    }}>
      {card.name}
      {meta && (
        <span style={{
          marginLeft: 6, fontSize: 9, fontWeight: 700,
          color: selected ? '#C5A059' : '#999',
        }}>
          {meta.tier.split(' ')[0].toUpperCase()}
        </span>
      )}
    </button>
  );
}

// ── Partner route row ─────────────────────────────────────────
function PartnerRow({ route, points }: { route: PartnerRoute; points: number }) {
  const effPoints = points * (route.ratio_to / route.ratio_from);
  const { label } = cppTier(route.ratio_to / route.ratio_from * 1.8); // rough CPP estimate

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #F4F4F4',
      gap: 12,
    }}>
      {/* Partner type icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: route.program_type === 'hotel'
          ? 'rgba(224,138,0,0.1)' : 'rgba(0,168,107,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {route.program_type === 'hotel' ? '🏨' : '✈️'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 2 }}>
          {route.program_name}
          {route.has_bonus && (
            <span style={{
              marginLeft: 6, fontSize: 9, fontWeight: 800,
              background: 'rgba(197,160,89,0.15)', color: '#C5A059',
              padding: '1px 6px', borderRadius: 4,
            }}>BONUS</span>
          )}
        </p>
        <p style={{ fontSize: 11, color: '#999' }}>
          Transfer {route.ratio_from}:{route.ratio_to} →{' '}
          <strong style={{ color: '#000' }}>
            {formatPoints(Math.round(effPoints))} {route.program_name.split(' ')[0]} miles
          </strong>
        </p>
      </div>

      <CppBadge cpp={route.ratio_to / route.ratio_from * 1.8} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [pointsInput, setPointsInput] = useState('');
  const [routes, setRoutes] = useState<PartnerRoute[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Mock cards — use same UUIDs as seed.sql so CARD_META lookup works in fallback too
  const MOCK_CARDS: CardRow[] = [
    { id: '00000000-0000-0000-0001-000000000001', name: 'HDFC Infinia',          issuer: 'HDFC Bank',        points_currency_name: 'Reward Points',     base_earn_rate: 3.33, is_active: true, cash_redemption_cpp: 0.50, logo_url: null, created_at: '' },
    { id: '00000000-0000-0000-0001-000000000003', name: 'Axis Atlas',            issuer: 'Axis Bank',        points_currency_name: 'EDGE Miles',        base_earn_rate: 2.00, is_active: true, cash_redemption_cpp: 0.20, logo_url: null, created_at: '' },
    { id: '00000000-0000-0000-0001-000000000008', name: 'Axis Magnus (Burgundy)', issuer: 'Axis Bank',       points_currency_name: 'EDGE Reward Points', base_earn_rate: 4.00, is_active: true, cash_redemption_cpp: 0.20, logo_url: null, created_at: '' },
    { id: '00000000-0000-0000-0001-000000000006', name: 'Amex Platinum Travel',  issuer: 'American Express', points_currency_name: 'Membership Rewards', base_earn_rate: 3.00, is_active: true, cash_redemption_cpp: 0.25, logo_url: null, created_at: '' },
    { id: '00000000-0000-0000-0001-000000000013', name: 'HSBC Premier',          issuer: 'HSBC Bank',        points_currency_name: 'Reward Points',     base_earn_rate: 2.00, is_active: true, cash_redemption_cpp: 0.25, logo_url: null, created_at: '' },
    { id: '00000000-0000-0000-0001-000000000004', name: 'SBI Aurum',             issuer: 'SBI Card',         points_currency_name: 'Reward Points',     base_earn_rate: 4.00, is_active: true, cash_redemption_cpp: 0.25, logo_url: null, created_at: '' },
  ];

  useEffect(() => {
    fetchCards()
      .then((data) => {
        const list = data.length > 0 ? data : MOCK_CARDS;
        setCards(list);
        setSelectedId(list[0]?.id ?? '');
      })
      .catch(() => {
        setCards(MOCK_CARDS);
        setSelectedId(MOCK_CARDS[0].id);
      })
      .finally(() => setLoadingCards(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch transfer routes whenever card changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadingRoutes(true);
    fetchCardRoutes(selectedId)
      .then(setRoutes)
      .catch(() => setRoutes([]))
      .finally(() => setLoadingRoutes(false));
  }, [selectedId]);

  const selectedCard = cards.find((c) => c.id === selectedId);
  const meta = selectedId ? CARD_META[selectedId] : null;
  const points = parseInt(pointsInput.replace(/[^0-9]/g, ''), 10) || 0;
  const cashValue = points * (selectedCard?.cash_redemption_cpp ?? 0.50);
  const bestCpp = meta?.best_cpp ?? 2.10;
  const bestValue = points * bestCpp;
  const multiplier = bestCpp / (selectedCard?.cash_redemption_cpp ?? 0.50);
  const scenarios = meta ? buildScenarios(selectedCard?.cash_redemption_cpp ?? 0.50, meta.best_cpp) : [];

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPointsInput(raw ? Number(raw).toLocaleString('en-IN') : '');
  };

  return (
    <div style={{ padding: '20px', background: '#F9F6F0', minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#C5A059',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
        }}>Calculate</p>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 26, fontWeight: 700, color: '#000', lineHeight: 1.2, marginBottom: 4,
        }}>
          What are your points really worth?
        </h1>
        <p style={{ fontSize: 12, color: '#666' }}>
          Pick your card, enter your balance — see your true % return on spend.
        </p>
      </div>

      {/* ── Card selector ─────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 8 }}>Your card</p>
        {loadingCards ? (
          <div style={{ height: 36, background: '#F0F0F0', borderRadius: 9999, width: '60%' }} />
        ) : (
          <div style={{
            display: 'flex', gap: 8,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as any,
            paddingBottom: 8,
            marginBottom: -4,
            cursor: 'grab',
          }} className="hide-scrollbar">
            {cards.map((card) => (
              <CardTab
                key={card.id}
                card={card}
                selected={selectedId === card.id}
                onClick={() => { setSelectedId(card.id); setPointsInput(''); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Points input ──────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
        padding: '16px', marginBottom: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 8 }}>
          Your {selectedCard?.points_currency_name ?? 'Points'} balance
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            inputMode="numeric"
            value={pointsInput}
            onChange={handlePointsChange}
            placeholder="e.g. 1,00,000"
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12,
              border: '1px solid #EAEAEA', background: '#F9F6F0',
              fontSize: 18, fontWeight: 800, color: '#000',
              outline: 'none', fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em',
            }}
          />
          <span style={{ fontSize: 12, color: '#999', flexShrink: 0 }}>pts</span>
        </div>
        {points > 0 && (
          <p style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
            ≈ {formatPoints(points)} {selectedCard?.points_currency_name ?? 'points'}
          </p>
        )}
      </div>

      {/* ── Result — only show once points entered ────────────── */}
      {points >= 1000 && selectedCard && (
        <>
          {/* Headline value card */}
          <div style={{
            background: 'linear-gradient(135deg, #E8D5B5 0%, #F4ECD8 50%, #EDD9A3 100%)',
            borderRadius: 16, padding: '18px 16px', marginBottom: 16,
            border: '1px solid rgba(197,160,89,0.3)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#7A5C00',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Your points are worth up to
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 38, fontWeight: 700, color: '#3A2800',
                letterSpacing: '-0.02em',
              }}>
                {formatINRFull(bestValue)}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#00A86B',
                background: 'rgba(0,200,133,0.12)',
                padding: '3px 10px', borderRadius: 9999,
              }}>
                {multiplier.toFixed(1)}× your bank
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#7A5C00', marginTop: 6 }}>
              vs. just {formatINRFull(cashValue)} as statement credit
            </p>

            {/* % Return on Spend */}
            <div style={{
              marginTop: 12, paddingTop: 12,
              borderTop: '1px solid rgba(197,160,89,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div>
                <p style={{ fontSize: 9, color: '#7A5C00', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                  % Return on spend
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#3A2800', lineHeight: 1 }}>
                    {((selectedCard?.base_earn_rate ?? 3.33) * bestCpp).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 11, color: '#999' }}>
                    vs {((selectedCard?.base_earn_rate ?? 3.33) * (selectedCard?.cash_redemption_cpp ?? 0.50)).toFixed(1)}% cash
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar chart comparison */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
            padding: '16px', marginBottom: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 14 }}>
              Value comparison for {formatPoints(points)} pts
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scenarios.map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#666' }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>
                      {fmtVal(s.value)}
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#F4F4F4', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${s.pct}%`,
                      background: s.color, borderRadius: 9999,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, color: '#ccc', marginTop: 12 }}>
              Based on conservative benchmarks (India-origin travellers). First Class assumes {meta?.top_partners[0] ?? 'KrisFlyer'} sweet spot.
            </p>
          </div>

          {/* Transfer partners */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 10 }}>
              Best transfer partners for {selectedCard.name}
            </p>

            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
              overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}>
              {loadingRoutes ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 12 }}>
                  Loading partner routes…
                </div>
              ) : routes.length > 0 ? (
                routes.map((route) => (
                  <PartnerRow key={route.program_id} route={route} points={points} />
                ))
              ) : (
                /* Fallback: show meta top_partners if no Supabase data */
                meta?.top_partners.map((name, i) => (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < (meta.top_partners.length - 1) ? '1px solid #F4F4F4' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(0,168,107,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>✈️</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>{name}</p>
                      <p style={{ fontSize: 11, color: '#999' }}>Transfer 1:1</p>
                    </div>
                    <CppBadge cpp={meta.best_cpp} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CTA */}
          <a href="/discover" style={{
            display: 'block', textAlign: 'center',
            padding: '14px', borderRadius: 12,
            background: '#121212', color: '#fff',
            fontSize: 14, fontWeight: 700, textDecoration: 'none',
            marginBottom: 20,
          }}>
            Find the best deal to use your {selectedCard.name} points →
          </a>
        </>
      )}

      {/* Prompt when no points entered */}
      {points < 1000 && !loadingCards && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
        }}>
          <p style={{ fontSize: 28, marginBottom: 10 }}>⚡</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 4 }}>
            Enter your points balance
          </p>
          <p style={{ fontSize: 12, color: '#999' }}>
            Minimum 1,000 points to calculate value
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p style={{ fontSize: 10, color: '#ccc', textAlign: 'center', paddingBottom: 8 }}>
        Values are estimates. Points transfers are irreversible — always verify before transferring.
      </p>
    </div>
  );
}
