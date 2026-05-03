'use client';

// ============================================================
// DealOfTheDay -- Figma Make approved design (03-May)
// Pills ABOVE card, IATA->city names, brandfetch logos
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';

// ── IATA code -> City name ────────────────────────────────────
const IATA_CITY: Record<string, string> = {
  // India
  BOM: 'Mumbai',    DEL: 'Delhi',       BLR: 'Bengaluru',  CCU: 'Kolkata',
  MAA: 'Chennai',   HYD: 'Hyderabad',   AMD: 'Ahmedabad',  GOI: 'Goa',
  PNQ: 'Pune',      COK: 'Kochi',       JAI: 'Jaipur',     IXC: 'Chandigarh',
  // Asia Pacific
  SIN: 'Singapore', BKK: 'Bangkok',     KUL: 'Kuala Lumpur', NRT: 'Tokyo',
  HND: 'Tokyo',     ICN: 'Seoul',       HKG: 'Hong Kong',  PEK: 'Beijing',
  PVG: 'Shanghai',  SYD: 'Sydney',      MEL: 'Melbourne',  BNE: 'Brisbane',
  AKL: 'Auckland',  MNL: 'Manila',      CGK: 'Jakarta',    BKI: 'Kota Kinabalu',
  // Middle East
  DXB: 'Dubai',     AUH: 'Abu Dhabi',   DOH: 'Doha',       KWI: 'Kuwait',
  BAH: 'Bahrain',   RUH: 'Riyadh',      AMM: 'Amman',
  // Europe
  LHR: 'London',    LGW: 'London',      CDG: 'Paris',      FRA: 'Frankfurt',
  AMS: 'Amsterdam', ZRH: 'Zurich',      FCO: 'Rome',       BCN: 'Barcelona',
  MXP: 'Milan',     MAD: 'Madrid',      MUC: 'Munich',     VIE: 'Vienna',
  CPH: 'Copenhagen',ARN: 'Stockholm',   OSL: 'Oslo',       HEL: 'Helsinki',
  BRU: 'Brussels',  LIS: 'Lisbon',      ATH: 'Athens',     IST: 'Istanbul',
  // North America
  JFK: 'New York',  EWR: 'New York',    LAX: 'Los Angeles',SFO: 'San Francisco',
  ORD: 'Chicago',   MIA: 'Miami',       BOS: 'Boston',     ATL: 'Atlanta',
  DFW: 'Dallas',    SEA: 'Seattle',     DEN: 'Denver',     IAD: 'Washington DC',
  YYZ: 'Toronto',   YVR: 'Vancouver',   YUL: 'Montreal',
  // South America & Africa
  GRU: 'Sao Paulo', EZE: 'Buenos Aires',BOG: 'Bogota',     LIM: 'Lima',
  NBO: 'Nairobi',   JNB: 'Johannesburg',CPT: 'Cape Town',  ADD: 'Addis Ababa',
  // Indian Ocean & South Asia
  MLE: 'Maldives',  CMB: 'Colombo',     DAC: 'Dhaka',      KTM: 'Kathmandu',
  ISB: 'Islamabad', KHI: 'Karachi',
};

// ── Destination image map ─────────────────────────────────────
const DEST_IMAGE_MAP: Record<string, string> = {
  SIN: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80',
  BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  KUL: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
  NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  HND: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  ICN: 'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=900&q=80',
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
  LGW: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
  CDG: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  FRA: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=900&q=80',
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=900&q=80',
  ZRH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=900&q=80',
  DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  AUH: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  DOH: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=900&q=80',
  JFK: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  EWR: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  LAX: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=900&q=80',
  SFO: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80',
  YYZ: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=900&q=80',
  SYD: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80',
  MEL: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=900&q=80',
  MLE: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80',
  hotel: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
};

// Loyalty program -> brandfetch domain
const PROGRAM_DOMAIN: Record<string, string> = {
  krisflyer:      'singaporeair.com',
  etihad:         'etihad.com',
  aeroplan:       'aircanada.com',
  hyatt:          'hyatt.com',
  ana:            'ana.co.jp',
  flyingblue:     'klm.com',
  emirates:       'emirates.com',
  virginatlantic: 'virginatlantic.com',
  qatar:          'qatarairways.com',
  marriott:       'marriott.com',
  hilton:         'hilton.com',
  united:         'united.com',
  delta:          'delta.com',
  asiamiles:      'cathaypacific.com',
  airindia:       'airindia.com',
  vistara:        'airvistara.com',
  indigo:         'goindigo.in',
  spicejet:       'spicejet.com',
  britishairways: 'britishairways.com',
  qantas:         'qantas.com',
};

// Category -> readable label
const CATEGORY_LABEL: Record<string, string> = {
  first:          'First Class',
  business:       'Business',
  economy:        'Economy',
  hotel_suite:    'Suite',
  hotel_standard: 'Standard Room',
  premium_eco:    'Premium Eco',
};

const CORAL = '#FF6B4A';

// Parse route -> [fromCode, toCode]
// Handles: "BOM-SIN on Singapore Airlines", "BOM->SIN", "BOM SIN"
function parseRoute(route: string): [string, string] {
  // Strip trailing airline name ("on Singapore Airlines")
  const clean = route.replace(/\s+on\s+.+$/i, '').trim();
  // Split on any separator
  const parts = clean.split(/\s*[→–\-]{1,2}>\s*|\s*–\s*|\s*->\s*|\s*→\s*|\s*-\s*/).map(p => p.trim());
  const fromCode = (parts[0] ?? '').slice(0, 3).toUpperCase();
  const toCode   = ((parts[1] ?? '').split(/\s/)[0] ?? '').slice(0, 3).toUpperCase();
  return [fromCode, toCode];
}

function codeToCity(code: string): string {
  return IATA_CITY[code] ?? code;
}

function getCityImage(spot: SweetSpotRow): string {
  if (spot.category.startsWith('hotel')) return DEST_IMAGE_MAP.hotel;
  const [, toCode] = parseRoute(spot.route_or_property);
  return DEST_IMAGE_MAP[toCode] ?? DEST_IMAGE_MAP.default;
}

function getProgramDomain(spot: SweetSpotRow): string {
  return PROGRAM_DOMAIN[spot.program_id] ?? `${spot.program_id.replace(/_/g, '')}.com`;
}

interface Props { spots: SweetSpotRow[]; }

export default function DealOfTheDay({ spots }: Props) {
  const router              = useRouter();
  const slides              = spots.slice(0, 5);
  const [active, setActive] = useState(0);
  const scrollRef           = useRef<HTMLDivElement>(null);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const [imgKey, setImgKey] = useState(0);

  if (!slides.length) return null;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ left: next * (scrollRef.current.offsetWidth), behavior: 'smooth' });
        setImgKey((k) => k + 1);
        return next;
      });
    }, 3000);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const handleSelect = (idx: number) => {
    setActive(idx);
    setImgKey((k) => k + 1);
    scrollRef.current?.scrollTo({ left: idx * (scrollRef.current?.offsetWidth ?? 0), behavior: 'smooth' });
    startTimer();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const c = e.currentTarget;
    const idx = Math.round(c.scrollLeft / c.offsetWidth);
    if (slides[idx] && idx !== active) { setActive(idx); setImgKey((k) => k + 1); }
  };

  const spot = slides[active];
  const cityImg = getCityImage(spot);

  return (
    <section style={{ background: '#fff', padding: '4px 16px 28px' }}>
      <style>{`
        @keyframes fadeIn    { from { opacity: 0 } to { opacity: 1 } }
        @keyframes countdown { to { stroke-dashoffset: 0; } }
        .dotd-scroll::-webkit-scrollbar { display: none; }
        .dotd-pills::-webkit-scrollbar  { display: none; }
      `}</style>

      {/* ── Section header ─────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#94a3b8',
          letterSpacing: '1.1px', textTransform: 'uppercase', margin: '0 0 2px',
        }}>
          FEATURED
        </p>
        <h2 style={{
          fontSize: 22, fontWeight: 800, color: '#0f172a',
          letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2,
        }}>
          Deal of the Day
        </h2>
      </div>

      {/* ── Points selector pills — OUTSIDE the card ───── */}
      <div className="dotd-pills" style={{
        display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12,
        paddingBottom: 2,
      } as React.CSSProperties}>
        {slides.map((d, pi) => (
          <button
            key={d.id}
            onClick={() => handleSelect(pi)}
            style={{
              padding: '7px 14px', borderRadius: 20,
              border: active === pi ? 'none' : '1px solid #e2e8f0',
              background: active === pi ? '#0f172a' : '#f8fafc',
              color: active === pi ? '#fff' : '#64748b',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {formatPoints(d.points_required)} pts
          </button>
        ))}
      </div>

      {/* ── Main card ───────────────────────────────────── */}
      <div style={{
        borderRadius: 24,
        overflow:     'hidden',
        boxShadow:    '0 20px 48px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
        border:       '1px solid rgba(0,0,0,0.06)',
      }}>

        {/* City photo with crossfade */}
        <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: '#1e293b' }}>
          <img
            key={imgKey}
            src={cityImg}
            alt={spot.route_or_property}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'fadeIn 0.5s ease' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)',
          }} />
        </div>

        {/* Scrollable dark panels — one per slide */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="dotd-scroll"
          style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {slides.map((s) => {
            const [fromCode, toCode] = parseRoute(s.route_or_property);
            const fromCity  = codeToCity(fromCode);
            const toCity    = codeToCity(toCode);
            const sDomain   = getProgramDomain(s);
            const classLabel = CATEGORY_LABEL[s.category] ?? s.category;
            const isHotel   = s.category.startsWith('hotel');

            return (
              <div key={s.id} style={{ flex: '0 0 100%', scrollSnapAlign: 'center' }}>
                <div style={{ background: '#111111', padding: '18px 18px 0' }}>
                  <h2 style={{
                    fontSize: 22, fontWeight: 800, color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '-0.01em',
                    lineHeight: 1.25, margin: '0 0 4px',
                  }}>
                    Exceptional Value,<br />Right Now
                  </h2>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 14px' }}>
                    Hand-picked premium sweetspots updated daily!
                  </p>

                  {/* White info card */}
                  <div
                    onClick={() => router.push('/sweet-spots/' + s.id)}
                    style={{ background: '#fff', borderRadius: 18, padding: '16px 16px 14px', cursor: 'pointer' }}
                  >
                    {/* Points VS Retail */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase', margin: '0 0 3px' }}>
                          SweetRedeem
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                            {formatPoints(s.points_required)}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>pts</span>
                        </div>
                      </div>

                      {/* VS badge */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#0f172a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>VS</span>
                      </div>

                      {/* Retail price with strikethrough */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase', margin: '0 0 3px' }}>
                          Retail Price
                        </p>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
                            {formatINRFull(s.est_cash_value_inr)}
                          </span>
                          <div style={{
                            position: 'absolute', left: 0, right: 0,
                            top: '52%', height: 2, background: '#FF2E93', transform: 'translateY(-50%)',
                          }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

                    {/* Transfer chain */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <svg width="18" height="14" viewBox="0 0 20 16" fill="none">
                            <rect x="1" y="1" width="18" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" fill="white" />
                            <rect x="1" y="5" width="18" height="3" fill="#e2e8f0" />
                            <rect x="3" y="10" width="5" height="1.5" rx="0.75" fill="#cbd5e1" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', lineHeight: 1.2, margin: 0 }}>Credit Card</p>
                          <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.2, margin: 0 }}>Points</p>
                        </div>
                      </div>

                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, overflow: 'hidden',
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          padding: 2,
                        }}>
                          <img
                            src={s.program_logo_url ?? `https://cdn.brandfetch.io/${sDomain}/icon`}
                            alt={s.program_name ?? ''}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (!img.src.includes('brandfetch')) {
                                img.src = `https://cdn.brandfetch.io/${sDomain}/icon`;
                              } else {
                                img.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', lineHeight: 1.2, margin: 0 }}>
                            {s.program_name}
                          </p>
                          <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.2, margin: 0 }}>
                            {isHotel ? 'hotel points' : 'frequent flyer'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Route: Mumbai -> London + Class */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{fromCity}</span>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>&#9992;</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{toCity}</span>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        background: '#0f172a', borderRadius: 6, padding: '3px 8px',
                      }}>
                        {classLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots + timer ring — bottom bar inside card */}
        <div style={{
          background: '#111111', padding: '12px 18px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => handleSelect(i)} style={{
                height: 7, width: i === active ? 26 : 7, borderRadius: 100,
                background: i === active ? CORAL : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }} />
            ))}
          </div>

          {/* Timer ring */}
          <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle
                key={`timer-${active}`}
                cx="20" cy="20" r="15"
                fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15}`}
                style={{ animation: 'countdown 3s linear forwards' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{active + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
