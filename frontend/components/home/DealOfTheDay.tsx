'use client';

// ============================================================
// DealOfTheDay — carousel powered by live Supabase sweet spots
// City photo · dark info panel · points pills · VS comparison
// ============================================================

import { useState } from 'react';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';

// ── Destination IATA code → Unsplash photo URL ───────────────
// All photos are freely available on Unsplash (no API key needed for direct CDN links)
const DEST_IMAGE_MAP: Record<string, string> = {
  // Southeast Asia
  SIN: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80', // Singapore Marina Bay
  BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80', // Bangkok temples
  KUL: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80', // KL Petronas

  // East Asia
  NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80', // Tokyo skyline
  HND: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  ICN: 'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=900&q=80', // Seoul

  // Europe
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80', // London Tower Bridge
  CDG: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', // Paris Eiffel
  FRA: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=900&q=80', // Frankfurt
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=900&q=80', // Amsterdam canals
  ZRH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=900&q=80', // Zurich

  // Middle East
  DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80', // Dubai Burj Khalifa
  AUH: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80', // Abu Dhabi

  // North America
  JFK: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80', // NYC skyline
  NYC: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  EWR: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  YYZ: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=900&q=80', // Toronto
  LAX: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=900&q=80', // LA
  SFO: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80', // Golden Gate
  ORD: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80', // Chicago

  // Oceania
  SYD: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80', // Sydney Opera House
  MEL: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=900&q=80', // Melbourne

  // Island / Resort (hotels)
  hotel: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80', // Luxury hotel pool
  MLE:  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80',  // Maldives overwater bungalow

  // Fallback — airplane in flight
  default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
};

// ── Gradient fallbacks (used while image loads / on error) ───
const FALLBACK_GRADIENTS = [
  'linear-gradient(160deg,#1c1c1c,#374151)',
  'linear-gradient(160deg,#1a1a2e,#16213e,#533483)',
  'linear-gradient(160deg,#0f2027,#203a43,#2c5364)',
  'linear-gradient(160deg,#360033,#0b8793)',
  'linear-gradient(160deg,#0d0d0d,#1a3a1a)',
];

// ── Program brand colours (chip badges) ─────────────────────
const PROGRAM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  krisflyer:      { bg: '#003366', text: '#fff', label: 'SQ'  },
  etihad:         { bg: '#bd8b13', text: '#fff', label: 'EY'  },
  aeroplan:       { bg: '#d32b2b', text: '#fff', label: 'AC'  },
  hyatt:          { bg: '#0041a0', text: '#fff', label: 'WoH' },
  ana:            { bg: '#003b91', text: '#fff', label: 'ANA' },
  flyingblue:     { bg: '#0065ae', text: '#fff', label: 'FB'  },
  emirates:       { bg: '#c60c30', text: '#fff', label: 'EK'  },
  virginatlantic: { bg: '#e2001a', text: '#fff', label: 'VS'  },
  qatar:          { bg: '#5c0632', text: '#fff', label: 'QR'  },
  marriott:       { bg: '#a3291e', text: '#fff', label: 'MBV' },
  hilton:         { bg: '#0039a6', text: '#fff', label: 'HHN' },
  united:         { bg: '#002244', text: '#fff', label: 'UA'  },
  delta:          { bg: '#003366', text: '#fff', label: 'DL'  },
  asiamiles:      { bg: '#006564', text: '#fff', label: 'CX'  },
};

// ── Helpers ──────────────────────────────────────────────────

/** Parse the destination IATA code from "BOM → SIN" style strings */
function parseDestCode(route: string): string {
  const m = route.match(/[→>]\s*([A-Z]{3})/);
  return m ? m[1] : 'default';
}

/** Get a city background image URL for a given sweet spot */
function getCityImage(spot: SweetSpotRow): string {
  if (spot.category.startsWith('hotel')) return DEST_IMAGE_MAP.hotel;
  const code = parseDestCode(spot.route_or_property);
  return DEST_IMAGE_MAP[code] ?? DEST_IMAGE_MAP.default;
}

// ── Component ────────────────────────────────────────────────

interface Props {
  spots: SweetSpotRow[];
}

export default function DealOfTheDay({ spots }: Props) {
  const [active, setActive] = useState(0);

  if (!spots.length) return null;

  // Show up to 5 slides
  const slides = spots.slice(0, 5);
  const spot = slides[active];

  const progInfo = PROGRAM_COLORS[spot.program_id] ?? {
    bg: '#1e3a5c',
    text: '#fff',
    label: (spot.program_name ?? 'PT').substring(0, 3).toUpperCase(),
  };
  const cityImg = getCityImage(spot);
  const fallbackGradient = FALLBACK_GRADIENTS[active % FALLBACK_GRADIENTS.length];

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ padding: '0 16px' }}>
        <div style={{
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '0.75px solid #f1f5f9',
        }}>

          {/* ── City photo ──────────────────────────────────── */}
          <div style={{
            height: 210,
            overflow: 'hidden',
            position: 'relative',
            background: fallbackGradient,
          }}>
            <img
              key={cityImg}
              src={cityImg}
              alt={spot.route_or_property}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Dark gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
            }} />
            {/* Route badge */}
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              padding: '5px 12px',
              borderRadius: 9999,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.2px' }}>
                ✈ {spot.route_or_property}
              </span>
            </div>
            {/* Category badge */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: spot.cpp >= 2.0 ? 'rgba(0,153,102,0.85)' : 'rgba(224,138,0,0.85)',
              backdropFilter: 'blur(6px)',
              padding: '4px 10px',
              borderRadius: 9999,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                ₹{spot.cpp.toFixed(2)}/pt
              </span>
            </div>
          </div>

          {/* ── Dark info panel ─────────────────────────────── */}
          <div style={{ background: '#111', padding: '20px 20px 0' }}>

            <h2 style={{
              fontSize: 26, fontWeight: 800, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.26px',
              lineHeight: 1.25,
              margin: '0 0 8px',
            }}>
              Exceptional Value,<br />Right Now
            </h2>

            <p style={{ fontSize: 11, color: '#90a1b9', margin: '0 0 16px' }}>
              Hand-picked premium sweetspots updated daily!
            </p>

            {/* Points selector pills — one per slide */}
            <div style={{
              display: 'flex', gap: 6,
              overflowX: 'auto', paddingBottom: 4,
              marginBottom: 16,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties}>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 14,
                    border: 'none',
                    background: active === i ? '#2d2d2d' : 'transparent',
                    color: active === i ? '#fff' : '#62748e',
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {formatPoints(s.points_required)} pts
                </button>
              ))}
            </div>

            {/* ── White comparison card ────────────────────── */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px',
              marginBottom: 0,
            }}>

              {/* SweetRedeem pts ← VS → Retail Price */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                {/* Left: SweetRedeem points */}
                <div>
                  <p style={{
                    fontSize: 9, fontWeight: 700, color: '#90a1b9',
                    letterSpacing: '0.9px', textTransform: 'uppercase',
                    margin: '0 0 4px',
                  }}>Sweetredeem</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: 26, fontWeight: 800, color: '#0f172b',
                      letterSpacing: '-0.5px',
                    }}>
                      {formatPoints(spot.points_required)}
                    </span>
                    <span style={{ fontSize: 13, color: '#90a1b9' }}>pts</span>
                  </div>
                </div>

                {/* VS badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9999,
                  background: '#0f172b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>VS</span>
                </div>

                {/* Right: Est. Cash Value (strikethrough) */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: 9, fontWeight: 700, color: '#90a1b9',
                    letterSpacing: '0.9px', textTransform: 'uppercase',
                    margin: '0 0 4px',
                  }}>Retail Price</p>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      fontSize: 22, fontWeight: 800, color: '#0f172b',
                      letterSpacing: '-0.5px', display: 'block',
                    }}>
                      {formatINRFull(spot.est_cash_value_inr)}
                    </span>
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      top: '48%', height: 2, background: '#ff2e93',
                    }} />
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

              {/* Transfer path: Bank Points → Program */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {/* Bank points chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #1e3a5c, #2d5a8e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
                      PTS
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#314158', lineHeight: 1.2, margin: 0 }}>Credit Card</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#314158', lineHeight: 1.2, margin: 0 }}>Points</p>
                  </div>
                </div>

                {/* Arrow */}
                <span style={{ fontSize: 16, color: '#90a1b9', flexShrink: 0 }}>→</span>

                {/* Program logo / chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: spot.program_logo_url ? '#f8fafc' : progInfo.bg,
                    border: spot.program_logo_url ? '1px solid #e2e8f0' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}>
                    {spot.program_logo_url ? (
                      <img
                        src={spot.program_logo_url}
                        alt={spot.program_name ?? ''}
                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{
                        fontSize: progInfo.label.length > 2 ? 7 : 10,
                        fontWeight: 800, color: progInfo.text,
                        letterSpacing: '-0.3px',
                      }}>
                        {progInfo.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: '#314158',
                      lineHeight: 1.2, margin: 0,
                    }}>
                      {spot.program_name}
                    </p>
                    <p style={{ fontSize: 11, color: '#90a1b9', lineHeight: 1.2, margin: 0 }}>
                      {spot.program_type === 'hotel' ? 'hotel points' : 'miles program'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route + class chip */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#314158' }}>
                  {spot.route_or_property}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: spot.cpp >= 2.0 ? '#009966' : '#E08A00',
                  background: spot.cpp >= 2.0 ? 'rgba(0,153,102,0.08)' : 'rgba(224,138,0,0.08)',
                  padding: '3px 8px', borderRadius: 6,
                  border: `1px solid ${spot.cpp >= 2.0 ? 'rgba(0,153,102,0.2)' : 'rgba(224,138,0,0.2)'}`,
                }}>
                  ₹{spot.cpp.toFixed(2)}/pt
                </span>
              </div>
            </div>
          </div>

          {/* ── Navigation dots + counter ────────────────────── */}
          <div style={{
            background: '#111',
            padding: '12px 20px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    width: i === active ? 28 : 8,
                    height: 8,
                    borderRadius: 100,
                    background: i === active ? '#e55a2b' : '#cbd5e1',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>

            {/* Next slide counter */}
            <button
              onClick={() => setActive((active + 1) % slides.length)}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: '#111',
                border: '2px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {active + 1}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
