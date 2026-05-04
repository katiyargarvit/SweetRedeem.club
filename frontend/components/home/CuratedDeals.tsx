'use client';

// CuratedDeals — "Sweet-spots" section (Figma Make design, 03-May)
// Lookups keyed on UUID program_id (from PROGRAM_IDS in scraper/lib/utils.ts)
// Images served from /public/programs/ (no spaces)

import { useRouter } from 'next/navigation';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatPoints } from '@/lib/supabase-queries';

const CORAL   = '#FF6B4A';
const NAVY    = '#0B1120';
const GREEN   = '#00A86B';
const CURSIVE = "'Caveat', cursive";

// UUIDs from scraper/lib/utils.ts PROGRAM_IDS
const P = {
  AIR_INDIA:   '00000000-0000-0000-0002-000000000001',
  KRISFLYER:   '00000000-0000-0000-0002-000000000002',
  AVIOS:       '00000000-0000-0000-0002-000000000003',
  MARRIOTT:    '00000000-0000-0000-0002-000000000004',
  HYATT:       '00000000-0000-0000-0002-000000000005',
  ACCOR:       '00000000-0000-0000-0002-000000000006',
  FLYING_BLUE: '00000000-0000-0000-0002-000000000007',
  UNITED:      '00000000-0000-0000-0002-000000000008',
  AEROPLAN:    '00000000-0000-0000-0002-000000000009',
  SKYWARDS:    '00000000-0000-0000-0002-000000000010',
  ASIA_MILES:  '00000000-0000-0000-0002-000000000011',
  QATAR:       '00000000-0000-0000-0002-000000000012',
  HILTON:      '00000000-0000-0000-0002-000000000013',
  ITC_HOTELS:  '00000000-0000-0000-0002-000000000014',
  ETIHAD:      '00000000-0000-0000-0002-000000000015',
  TURKISH:     '00000000-0000-0000-0002-000000000016',
  IHG:         '00000000-0000-0000-0002-000000000017',
} as const;

// program_id UUID → local loyalty program PNG (served from /public/programs/)
const PROGRAM_LOGO: Record<string, string> = {
  [P.AIR_INDIA]:   '/programs/air-india-maharaja-club.png',
  [P.KRISFLYER]:   '/programs/SIA-Krisflyer.png',
  [P.AVIOS]:       '/programs/British-airways-avios.png',
  [P.MARRIOTT]:    '/programs/Marriott-Bonvoy.png',
  [P.HYATT]:       '/programs/Hyatt.png',
  [P.ACCOR]:       '/programs/All-accor.png',
  [P.FLYING_BLUE]: '/programs/KLM-Airfrance-FlyingBlue.png',
  [P.UNITED]:      '/programs/United-Milage-Plus.png',
  [P.AEROPLAN]:    '/programs/Air-Canada-Aeroplan.png',
  [P.SKYWARDS]:    '/programs/Emirates-Skywards.png',
  [P.ASIA_MILES]:  '/programs/Cathy-Pacific-AsiaMiles.png',
  [P.QATAR]:       '/programs/qatar-privilege-club.png',
  [P.HILTON]:      '/programs/Hilton-honors.png',
  [P.ITC_HOTELS]:  '/programs/club-ITC.png',
  [P.ETIHAD]:      '/programs/Etihad-guest.png',
  [P.TURKISH]:     '/programs/Turkish-Miles-Smiles.png',
  [P.IHG]:         '/programs/IHG-OneRewards.png',
};

// program_id UUID → clearbit domain (for 64×64 airline icon, top slot)
const PROGRAM_DOMAIN: Record<string, string> = {
  [P.AIR_INDIA]:   'airindia.com',
  [P.KRISFLYER]:   'singaporeair.com',
  [P.AVIOS]:       'britishairways.com',
  [P.MARRIOTT]:    'marriott.com',
  [P.HYATT]:       'hyatt.com',
  [P.ACCOR]:       'accor.com',
  [P.FLYING_BLUE]: 'klm.com',
  [P.UNITED]:      'united.com',
  [P.AEROPLAN]:    'aircanada.com',
  [P.SKYWARDS]:    'emirates.com',
  [P.ASIA_MILES]:  'cathaypacific.com',
  [P.QATAR]:       'qatarairways.com',
  [P.HILTON]:      'hilton.com',
  [P.ITC_HOTELS]:  'itchotels.com',
  [P.ETIHAD]:      'etihad.com',
  [P.TURKISH]:     'turkishairlines.com',
  [P.IHG]:         'ihg.com',
};

// program_id UUID → airline/brand display name (meta row)
const AIRLINE_NAME: Record<string, string> = {
  [P.AIR_INDIA]:   'Air India',
  [P.KRISFLYER]:   'Singapore Airlines',
  [P.AVIOS]:       'British Airways',
  [P.MARRIOTT]:    'Marriott Bonvoy',
  [P.HYATT]:       'World of Hyatt',
  [P.ACCOR]:       'Accor Hotels',
  [P.FLYING_BLUE]: 'Air France/KLM',
  [P.UNITED]:      'United Airlines',
  [P.AEROPLAN]:    'Air Canada',
  [P.SKYWARDS]:    'Emirates',
  [P.ASIA_MILES]:  'Cathay Pacific',
  [P.QATAR]:       'Qatar Airways',
  [P.HILTON]:      'Hilton Hotels',
  [P.ITC_HOTELS]:  'ITC Hotels',
  [P.ETIHAD]:      'Etihad Airways',
  [P.TURKISH]:     'Turkish Airlines',
  [P.IHG]:         'IHG Hotels',
};

// IATA code → city name
const CITY: Record<string, string> = {
  DEL: 'Delhi',       BOM: 'Mumbai',       BLR: 'Bengaluru',  MAA: 'Chennai',
  CCU: 'Kolkata',     HYD: 'Hyderabad',    AMD: 'Ahmedabad',  GOI: 'Goa',
  LHR: 'London',      LGW: 'London',       CDG: 'Paris',      FRA: 'Frankfurt',
  AMS: 'Amsterdam',   ZRH: 'Zurich',       FCO: 'Rome',       MAD: 'Madrid',
  BCN: 'Barcelona',   MUC: 'Munich',       VIE: 'Vienna',     IST: 'Istanbul',
  NRT: 'Tokyo',       HND: 'Tokyo',        KIX: 'Osaka',      ICN: 'Seoul',
  PEK: 'Beijing',     PVG: 'Shanghai',     HKG: 'Hong Kong',  TPE: 'Taipei',
  SIN: 'Singapore',   KUL: 'Kuala Lumpur', BKK: 'Bangkok',    MNL: 'Manila',
  CGK: 'Jakarta',     SYD: 'Sydney',       MEL: 'Melbourne',  AKL: 'Auckland',
  DXB: 'Dubai',       DOH: 'Doha',         AUH: 'Abu Dhabi',  RUH: 'Riyadh',
  JFK: 'New York',    EWR: 'New York',     LAX: 'Los Angeles',SFO: 'San Francisco',
  ORD: 'Chicago',     MIA: 'Miami',        BOS: 'Boston',     SEA: 'Seattle',
  YYZ: 'Toronto',     YVR: 'Vancouver',    GRU: 'Sao Paulo',  GIG: 'Rio de Janeiro',
  NBO: 'Nairobi',     JNB: 'Johannesburg', CUN: 'Cancun',     MEX: 'Mexico City',
};

function toCity(code: string): string {
  return CITY[code.toUpperCase()] ?? code;
}

function parseRoute(r: string): [string, string] {
  // Flight: "DEL-JFK", "BOM–SIN on Singapore Airlines", "DEL → LHR"
  // Hotel:  "Hyatt Regency Dehradun, Uttarakhand"
  const flight = r.match(/^([A-Z]{3})\s*[\u2013\u2192>\-]\s*([A-Z]{3})/);
  if (flight) return [toCity(flight[1]), toCity(flight[2])];
  // Hotel — show property name only (before comma)
  const hotel = r.split(',');
  return [hotel[0]?.trim() ?? r, hotel[1]?.trim() ?? ''];
}

function stopsLabel(spot: SweetSpotRow): string | null {
  const t = (spot.title ?? '').toLowerCase();
  if (t.includes('non-stop') || t.includes('nonstop')) return 'Non-stop';
  const m = t.match(/(\d+)\s*stop/);
  return m ? `${m[1]} stop` : null;
}

const classLabel = (cat: string) => {
  if (cat === 'first')          return 'First Class';
  if (cat === 'business')       return 'Business';
  if (cat === 'hotel_suite')    return 'Hotel Suite';
  if (cat === 'hotel_standard') return 'Hotel';
  return 'Economy';
};

const classColor = (cat: string) => {
  if (cat === 'business' || cat === 'first') return '#F59E0B';
  if (cat.startsWith('hotel'))               return GREEN;
  return '#2563EB';
};

interface Props { spots: SweetSpotRow[] }

export default function CuratedDeals({ spots }: Props) {
  const router = useRouter();
  if (!spots.length) return null;

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #F1F5F9', paddingTop: 40, paddingBottom: 32 }}>

      {/* Section header */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: CORAL, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          Club Picks
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#0f172a', margin: '0 0 4px' }}>
          Sweet-spots
        </h2>
        <div style={{ fontFamily: CURSIVE, fontStyle: 'italic', fontSize: 20, color: '#64748b' }}>
          handpicked by the club
        </div>
      </div>

      {/* Scrollable cards */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 12,
        padding: '12px 20px 12px', scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory', overflowY: 'visible',
      } as React.CSSProperties}>
        {spots.slice(0, 6).map((spot) => {
          const pid         = spot.program_id;
          const [from, to]  = parseRoute(spot.route_or_property);
          const stops       = stopsLabel(spot);
          const domain      = PROGRAM_DOMAIN[pid] ?? `${pid}.com`;
          const iconSrc     = spot.program_logo_url ?? `https://logo.clearbit.com/${domain}`;
          const programLogo = PROGRAM_LOGO[pid] ?? null;
          const airline     = AIRLINE_NAME[pid] ?? (spot.program_name ?? '');
          const initials    = (spot.program_name ?? 'PT').substring(0, 3).toUpperCase();

          return (
            <div
              key={spot.id}
              onClick={() => router.push('/sweet-spots/' + spot.id)}
              style={{
                flex: '0 0 auto', position: 'relative',
                width: 'calc(100vw - 40px)', maxWidth: 360,
                scrollSnapAlign: 'start', background: '#fff',
                borderRadius: 22, border: '1px solid #e2e8f0',
                boxShadow: '0 2px 16px rgba(11,17,32,0.07)',
                cursor: 'pointer', overflow: 'visible',
              }}
            >
              {/* CPP badge */}
              <span style={{
                position: 'absolute', top: 0, right: 20,
                transform: 'translateY(-50%)', zIndex: 1,
                background: GREEN, color: '#fff',
                fontSize: 11, fontWeight: 800,
                padding: '4px 10px', borderRadius: 9999,
              }}>
                ₹{spot.cpp.toFixed(2)}/pt
              </span>

              <div style={{ padding: 20 }}>

                {/* Row 1: airline icon + route/meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>

                  {/* 64×64 full-bleed icon — white bg, no grey border */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 14, overflow: 'hidden',
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <img
                      src={iconSrc}
                      alt={spot.program_name ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        const p = img.parentElement;
                        if (p) {
                          p.style.background = '#1a1a2e';
                          p.innerHTML = `<span style="color:white;font-size:11px;font-weight:800;text-align:center;line-height:1.2;padding:4px">${initials}</span>`;
                        }
                      }}
                    />
                  </div>

                  {/* Route + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* City ✈ City + share */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{from}</span>
                        <span style={{ fontSize: 13, color: '#cbd5e1', flexShrink: 0 }}>✈</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{to}</span>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, color: '#cbd5e1', lineHeight: 1 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                    </div>
                    {/* Airline · stops · class */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#8A9FB1' }}>{airline}</span>
                      {stops && (
                        <>
                          <span style={{ color: '#e2e8f0' }}>·</span>
                          <span style={{ color: '#8A9FB1' }}>{stops}</span>
                        </>
                      )}
                      <span style={{ color: '#e2e8f0' }}>·</span>
                      <span style={{ fontWeight: 700, color: classColor(spot.category) }}>{classLabel(spot.category)}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

                {/* Row 2: card icon → program logo | points */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Generic credit card SVG */}
                    <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                        <rect x="2" y="5"    width="14" height="9" rx="1.5" fill="#CBD5E1"/>
                        <rect x="4" y="7"    width="14" height="9" rx="1.5" fill="white" fillOpacity="0.85" stroke="#94A3B8" strokeWidth="1.2"/>
                        <rect x="4" y="10"   width="14" height="1.8" fill="#94A3B8"/>
                        <rect x="6" y="12.5" width="4"  height="1.5" rx="0.5" fill="#CBD5E1"/>
                      </svg>
                    </div>
                    {/* Arrow */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    {/* 96×44 loyalty program wordmark */}
                    <div style={{ width: 96, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0, overflow: 'hidden' }}>
                      <img
                        src={programLogo ?? `https://logo.clearbit.com/${domain}`}
                        alt={spot.program_name ?? ''}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', objectPosition: 'left center' }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (programLogo && !img.src.includes('clearbit')) {
                            img.src = `https://logo.clearbit.com/${domain}`;
                          } else {
                            img.style.opacity = '0';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Points — left-aligned label + number */}
                  <div style={{ textAlign: 'left', flexShrink: 0 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>
                      SWEETREDEEM
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-start' }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {formatPoints(spot.points_required)}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>pts</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Discover more CTA */}
      <div style={{ padding: '8px 20px 0' }}>
        <button
          onClick={() => router.push('/discover')}
          style={{
            width: '100%', padding: 16, borderRadius: 16, border: 'none',
            background: NAVY, color: '#fff', fontSize: 15, fontWeight: 700,
            letterSpacing: '-0.01em', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Discover more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </section>
  );
}
