'use client';

// ============================================================
// CuratedDeals — Roame-style deal cards with category filter pills
// ============================================================

import { useState } from 'react';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';
import DealDrawer from '@/components/ui/DealDrawer';

type FilterKey = 'all' | 'business' | 'economy' | 'hotel' | 'flash';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All'         },
  { key: 'business', label: 'Business ✈️' },
  { key: 'economy',  label: 'Economy'     },
  { key: 'hotel',    label: 'Hotels 🏨'   },
  { key: 'flash',    label: 'Flash ⚡'    },
];

// Colour for class badge
const classBadgeStyle = (category: string): React.CSSProperties => {
  if (category === 'business' || category === 'first') {
    return {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 700,
      background: 'rgba(197,160,89,0.12)', color: '#C5A059',
      border: '1px solid rgba(197,160,89,0.3)',
    };
  }
  if (category === 'hotel_suite' || category === 'hotel_standard') {
    return {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 700,
      background: 'rgba(0,200,133,0.1)', color: '#00A86B',
      border: '1px solid rgba(0,200,133,0.25)',
    };
  }
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 9999,
    fontSize: 11, fontWeight: 700,
    background: 'rgba(37,99,235,0.08)', color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.2)',
  };
};

const classBadgeLabel = (category: string) => {
  if (category === 'business') return '👑 Business';
  if (category === 'first')    return '🌟 First Class';
  if (category.startsWith('hotel')) return '🏨 Hotel';
  return '✈ Economy';
};

const barColor = (category: string) =>
  category === 'business' || category === 'first'
    ? 'linear-gradient(90deg, #C5A059, rgba(197,160,89,0.3))'
    : 'linear-gradient(90deg, #2563eb, rgba(37,99,235,0.3))';

// Fake metadata for Roame-style display (supplement until DB has this)
const FAKE_META: Record<string, { date: string; time: string; duration: string; stops: string; airline: string }> = {
  'mock-sin':      { date: 'Apr 14 · Mon', time: '20:55 — 08:30 +1', duration: '8h 05m', stops: 'Non-stop', airline: 'Singapore Airlines · SQ412' },
  'mock-lhr':      { date: 'Apr 16 · Wed', time: '01:40 — 07:55',    duration: '10h 15m', stops: '1 stop AUH', airline: 'Etihad Airways · EY203' },
  'mock-yyz':      { date: 'Apr 20 · Sun', time: '22:15 — 04:30 +1', duration: '16h 15m', stops: '1 stop',    airline: 'Air Canada · AC045' },
  'mock-maldives': { date: 'Any night',    time: '— Hotel —',         duration: '',        stops: '',          airline: 'World of Hyatt · Cat 8' },
};

const TRANSFER_LABELS: Record<string, string> = {
  krisflyer: 'KrisFlyer ✈',
  etihad:    'Etihad Guest ✈',
  aeroplan:  'Aeroplan 🍁',
  hyatt:     'World of Hyatt 🏨',
};

interface Props {
  spots: SweetSpotRow[];
}

export default function CuratedDeals({ spots }: Props) {
  const [filter, setFilter]           = useState<FilterKey>('all');
  const [selectedSpot, setSelectedSpot] = useState<SweetSpotRow | null>(null);

  const filtered = spots.filter((s) => {
    if (filter === 'all')      return true;
    if (filter === 'business') return s.category === 'business' || s.category === 'first';
    if (filter === 'economy')  return s.category === 'economy';
    if (filter === 'hotel')    return s.category.startsWith('hotel');
    if (filter === 'flash')    return s.cpp >= 2.5; // flash = very high CPP
    return true;
  });

  return (
    <>
      {/* Section header */}
      <div className="section-head" style={{ marginTop: 28, marginBottom: 10 }}>
        <span className="section-title">Curated for you</span>
        <span className="see-all">See all</span>
      </div>

      {/* Filter pills */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, padding: '0 20px', overflowX: 'auto', marginBottom: 16 }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="pill"
            data-active={filter === key ? 'true' : 'false'}
            style={{ flexShrink: 0 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Deal cards */}
      <div style={{ padding: '0 20px' }}>
        {filtered.map((spot) => {
          const meta = FAKE_META[spot.id];
          const isHotel = spot.category.startsWith('hotel');
          return (
            <div
              key={spot.id}
              className="curated-card"
              onClick={() => setSelectedSpot(spot)}
              style={{ cursor: 'pointer' }}
            >
              {/* Top section */}
              <div style={{ padding: '14px 16px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>{meta?.date ?? 'Verified Mar 2026'}</p>
                    <p style={{ fontSize: 10, color: '#666', marginTop: 2 }}>⏱ Updated recently</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {isHotel ? (
                      <span style={classBadgeStyle(spot.category)}>{classBadgeLabel(spot.category)}</span>
                    ) : (
                      <>
                        <p style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#000' }}>
                          {meta?.time ?? '—'}
                        </p>
                        <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{meta?.airline ?? spot.program_name}</p>
                      </>
                    )}
                  </div>
                </div>

                {!isHotel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={classBadgeStyle(spot.category)}>{classBadgeLabel(spot.category)}</span>
                    <p style={{ fontSize: 12, color: '#666' }}>{meta?.duration} · {meta?.stops}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>{spot.route_or_property}</p>
                  </div>
                )}

                {isHotel && (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#000', marginTop: 4 }}>{spot.title}</p>
                    <p style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{spot.route_or_property}</p>
                  </>
                )}

                {/* Route progress bar */}
                <div style={{
                  height: 3,
                  borderRadius: 2,
                  background: barColor(spot.category),
                  width: '65%',
                  marginTop: 10,
                }} />
              </div>

              {/* Bottom section */}
              <div style={{
                padding: '11px 16px 13px',
                borderTop: '1px solid #EAEAEA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: 'linear-gradient(135deg, #1a3a5c, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, color: '#93C5FD',
                    flexShrink: 0,
                  }}>H</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>HDFC</span>
                  <span style={{ fontSize: 12, color: '#666' }}>→</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#00C885' }}>
                    {TRANSFER_LABELS[spot.program_id] ?? spot.program_name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>
                    {formatPoints(spot.points_required)} pts
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#00C885', marginTop: 1 }}>
                    {formatINRFull(spot.est_cash_value_inr)} value
                  </p>
                  <p style={{ fontSize: 10, color: '#666' }}>
                    ₹{spot.cpp.toFixed(2)}/pt
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Drawer */}
      {selectedSpot && (
        <DealDrawer spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
    </>
  );
}
