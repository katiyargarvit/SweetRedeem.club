'use client';

// ============================================================
// CuratedDeals — "Curated for you" section
// Figma-matched: section header, filter pills, deal cards
// Data comes from live Supabase sweet_spots table.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';

type FilterKey = 'all' | 'business' | 'economy' | 'hotel' | 'flash';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All'         },
  { key: 'business', label: '✈ Business'  },
  { key: 'economy',  label: 'Economy'     },
  { key: 'hotel',    label: '\U0001f3e8 Hotels'   },
  { key: 'flash',    label: '⚡ Flash'    },
];

const classBadgeLabel = (category: string) => {
  if (category === 'business')       return '\U0001f451 Business';
  if (category === 'first')          return '\U0001f31f First Class';
  if (category === 'hotel_suite')    return '\U0001f3e8 Suite';
  if (category === 'hotel_standard') return '\U0001f3e8 Hotel';
  return '✈ Economy';
};

const classBadgeColor = (category: string) => {
  if (category === 'business' || category === 'first')
    return { bg: 'rgba(254,154,0,0.1)', color: '#fe9a00', border: 'rgba(254,154,0,0.25)' };
  if (category.startsWith('hotel'))
    return { bg: 'rgba(0,200,133,0.1)', color: '#00a86b', border: 'rgba(0,200,133,0.25)' };
  return { bg: 'rgba(37,99,235,0.08)', color: '#2563eb', border: 'rgba(37,99,235,0.2)' };
};

// CPP colour coding: green >= 2.0, amber 1.2-2.0
const cppColor = (cpp: number) =>
  cpp >= 2.0 ? '#009966' : cpp >= 1.2 ? '#E08A00' : '#E03E3E';

// Program brand colours (chip badges)
const PROGRAM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  krisflyer:      { bg: '#003366', text: '#fff',    label: 'SQ'  },
  etihad:         { bg: '#bd8b13', text: '#fff',    label: 'EY'  },
  aeroplan:       { bg: '#d32b2b', text: '#fff',    label: 'AC'  },
  hyatt:          { bg: '#0041a0', text: '#fff',    label: 'WoH' },
  ana:            { bg: '#003b91', text: '#fff',    label: 'ANA' },
  flyingblue:     { bg: '#0065ae', text: '#fff',    label: 'FB'  },
  emirates:       { bg: '#c60c30', text: '#fff',    label: 'EK'  },
  virginatlantic: { bg: '#e2001a', text: '#fff',    label: 'VS'  },
  qatar:          { bg: '#5c0632', text: '#fff',    label: 'QR'  },
  marriott:       { bg: '#a3291e', text: '#fff',    label: 'MBV' },
  hilton:         { bg: '#0039a6', text: '#fff',    label: 'HHN' },
  united:         { bg: '#002244', text: '#fff',    label: 'UA'  },
  delta:          { bg: '#003366', text: '#fff',    label: 'DL'  },
  asiamiles:      { bg: '#006564', text: '#fff',    label: 'CX'  },
};

/** Category -> human-readable travel type */
const travelType = (category: string) => {
  if (category === 'first')          return 'First Class';
  if (category === 'business')       return 'Business Class';
  if (category === 'hotel_suite')    return 'Hotel Suite';
  if (category === 'hotel_standard') return 'Hotel Stay';
  return 'Economy';
};

interface Props {
  spots: SweetSpotRow[];
}

export default function CuratedDeals({ spots }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const router = useRouter();

  const filtered = spots.filter((s) => {
    if (filter === 'all')      return true;
    if (filter === 'business') return s.category === 'business' || s.category === 'first';
    if (filter === 'economy')  return s.category === 'economy';
    if (filter === 'hotel')    return s.category.startsWith('hotel');
    if (filter === 'flash')    return s.cpp >= 2.5;
    return true;
  });

  return (
    <>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 20px 0',
        borderTop: '0.75px solid #e2e8f0',
      }}>
        <div>
          <h2 style={{
            fontSize: 17, fontWeight: 700, color: '#0A0A0A',
            letterSpacing: '-0.3px', margin: 0,
          }}>
            Curated for you
          </h2>
        </div>
        <Link
          href="/sweet-spots"
          style={{
            fontSize: 13, fontWeight: 600, color: '#00A86B',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          See all
        </Link>
      </div>

      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 8,
        padding: '16px 20px 0',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              border: filter === key ? '1px solid #0f172b' : '1px solid #e2e8f0',
              background: filter === key ? '#0f172b' : '#fff',
              color: filter === key ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: filter === key ? 700 : 500,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Deal cards */}
      <div style={{ padding: '16px 20px 0' }}>
        {filtered.map((spot) => {
          const isHotel  = spot.category.startsWith('hotel');
          const badge    = classBadgeColor(spot.category);
          const progInfo = PROGRAM_COLORS[spot.program_id] ?? {
            bg: '#1e3a5c', text: '#fff',
            label: (spot.program_name ?? 'PT').substring(0, 3).toUpperCase(),
          };

          return (
            <div
              key={spot.id}
              onClick={() => router.push('/sweet-spots/' + spot.id)}
              style={{
                background: '#fff',
                borderRadius: 24,
                border: '0.75px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                marginBottom: 12,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {/* Card body */}
              <div style={{ padding: '20px 20px 16px' }}>

                {/* Top row: program icon + route/info + class badge */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>

                  {/* Program logo chip (56x56) */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: spot.program_logo_url ? '#f8fafc' : progInfo.bg,
                    border: spot.program_logo_url ? '1px solid #e2e8f0' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    padding: spot.program_logo_url ? 10 : 0,
                  }}>
                    {spot.program_logo_url ? (
                      <img
                        src={spot.program_logo_url}
                        alt={spot.program_name ?? ''}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{
                        fontSize: progInfo.label.length > 2 ? 9 : 12,
                        fontWeight: 800, color: progInfo.text,
                        letterSpacing: '-0.5px',
                      }}>{progInfo.label}</span>
                    )}
                  </div>

                  {/* Route + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700, color: '#0f172b',
                      letterSpacing: '-0.2px', margin: '0 0 4px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {spot.route_or_property}
                    </p>

                    <p style={{ fontSize: 14, fontWeight: 500, color: '#8a9fb1', margin: '0 0 6px' }}>
                      {spot.program_name}
                      <span style={{ color: '#cad5e2', margin: '0 4px' }}>{'·'}</span>
                      <span>{travelType(spot.category)}</span>
                    </p>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 8px', borderRadius: 9999,
                      fontSize: 11, fontWeight: 600,
                      background: badge.bg, color: badge.color,
                      border: '0.75px solid ' + badge.border,
                    }}>
                      {classBadgeLabel(spot.category)}
                    </span>
                  </div>
                </div>

                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

                {/* Bottom row: transfer path + CPP/points */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  {/* Transfer: Points -> Program */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Generic bank points chip */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 6,
                      background: 'linear-gradient(135deg, #1e3a5c, #2d5a8e)',
                      border: '0.75px solid rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', lineHeight: 1 }}>PTS</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#8a9fb1' }}>{'→'}</span>
                    {/* Program chip / logo (30x30) */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 6,
                      background: spot.program_logo_url ? '#f8fafc' : progInfo.bg,
                      border: spot.program_logo_url ? '0.75px solid #e2e8f0' : '0.75px solid rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, overflow: 'hidden',
                      padding: spot.program_logo_url ? 4 : 0,
                    }}>
                      {spot.program_logo_url ? (
                        <img
                          src={spot.program_logo_url}
                          alt={spot.program_name ?? ''}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: 8, fontWeight: 800, color: progInfo.text, letterSpacing: '-0.3px' }}>
                          {progInfo.label}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{
                        fontSize: 9, fontWeight: 600, color: '#8a9fb1',
                        textTransform: 'uppercase', letterSpacing: '0.25px',
                        margin: 0, lineHeight: 1.3,
                      }}>
                        {isHotel ? 'Hotel' : 'Miles'}<br />Program
                      </p>
                    </div>
                  </div>

                  {/* Points + CPP */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 9, fontWeight: 700, color: '#7d93b5',
                      textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px',
                    }}>SWEETREDEEM</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172b', letterSpacing: '-0.7px' }}>
                        {formatPoints(spot.points_required)}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#7d93b5' }}>pts</span>
                    </div>
                    <p style={{
                      fontSize: 11, fontWeight: 600,
                      color: cppColor(spot.cpp),
                      margin: '2px 0 0',
                    }}>
                      {'₹'}{spot.cpp.toFixed(2)}/pt {'·'} {formatINRFull(spot.est_cash_value_inr)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#90a1b9' }}>
            <p style={{ fontSize: 14 }}>No deals found for this filter.</p>
          </div>
        )}
      </div>

    </>
  );
}
