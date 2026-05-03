'use client';

// ============================================================
// DealOfTheDay -- Figma Make design (03-May)
// Live Supabase data, brandfetch.io logos, carousel
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';

const DEST_IMAGE_MAP: Record<string, string> = {
  SIN: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80',
  BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
  KUL: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
  NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  HND: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  ICN: 'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=900&q=80',
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
  CDG: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  FRA: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=900&q=80',
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=900&q=80',
  ZRH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=900&q=80',
  DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  AUH: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  JFK: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  NYC: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  EWR: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=900&q=80',
  YYZ: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=900&q=80',
  LAX: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=900&q=80',
  SFO: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80',
  ORD: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
  SYD: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80',
  MEL: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=900&q=80',
  MLE: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80',
  hotel: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
};

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
};

const CORAL = '#FF6B4A';

function parseDestCode(route: string): string {
  const m = route.match(/[>]\s*([A-Z]{3})/);
  return m ? m[1] : 'default';
}

function getCityImage(spot: SweetSpotRow): string {
  if (spot.category.startsWith('hotel')) return DEST_IMAGE_MAP.hotel;
  const code = parseDestCode(spot.route_or_property);
  return DEST_IMAGE_MAP[code] ?? DEST_IMAGE_MAP.default;
}

function getProgramDomain(spot: SweetSpotRow): string {
  return PROGRAM_DOMAIN[spot.program_id] ?? `${spot.program_id.replace(/_/g, '')}.com`;
}

interface Props {
  spots: SweetSpotRow[];
}

export default function DealOfTheDay({ spots }: Props) {
  const router               = useRouter();
  const slides               = spots.slice(0, 5);
  const [active, setActive]  = useState(0);
  const scrollRef            = useRef<HTMLDivElement>(null);
  const timerRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const [imgKey, setImgKey]  = useState(0);

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
    <section style={{ background: '#fff', padding: '4px 16px 24px' }}>
      <div style={{
        borderRadius: 28,
        overflow:     'hidden',
        boxShadow:    '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
        border:       '0.75px solid #f1f5f9',
      }}>

        {/* City photo with crossfade */}
        <div style={{ height: 208, position: 'relative', overflow: 'hidden', background: '#1e293b' }}>
          <img
            key={imgKey}
            src={cityImg}
            alt={spot.route_or_property}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              display: 'block',
              animation: 'fadeIn 0.45s ease',
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          }} />
        </div>

        {/* Scrollable dark panels */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display:   'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        >
          {slides.map((s, i) => {
            const parts = s.route_or_property.split('>').map((p) => p.trim());
            const from = parts[0] ?? '';
            const to   = parts[1] ?? '';
            const sDomain = getProgramDomain(s);

            return (
              <div key={s.id} style={{ flex: '0 0 100%', scrollSnapAlign: 'center' }}>
                <div style={{ background: '#111111', padding: '20px 20px 0' }}>
                  <h2 style={{
                    fontSize:      26,
                    fontWeight:    800,
                    color:         '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight:    1.25,
                    margin:        '0 0 6px',
                  }}>
                    Exceptional Value,<br />Right Now
                  </h2>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 16px' }}>
                    Hand-picked premium sweetspots updated daily!
                  </p>

                  {/* Points selector pills */}
                  <div style={{
                    display: 'flex', gap: 4,
                    overflowX: 'auto', scrollbarWidth: 'none',
                    marginBottom: 16,
                  } as React.CSSProperties}>
                    {slides.map((d, pi) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(pi)}
                        style={{
                          padding:      '6px 12px',
                          borderRadius: 12,
                          border:       'none',
                          background:   active === pi ? '#2d2d2d' : 'transparent',
                          color:        active === pi ? '#fff' : '#64748b',
                          fontSize:     12,
                          fontWeight:   700,
                          cursor:       'pointer',
                          whiteSpace:   'nowrap',
                          flexShrink:   0,
                          transition:   'all 0.15s',
                        }}
                      >
                        {formatPoints(d.points_required)} pts
                      </button>
                    ))}
                  </div>

                  {/* White info card */}
                  <div
                    onClick={() => router.push('/sweet-spots/' + s.id)}
                    style={{
                      background:   '#fff',
                      borderRadius: 16,
                      padding:      16,
                      cursor:       'pointer',
                    }}
                  >
                    {/* Points VS Retail */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                          SweetRedeem
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                            {formatPoints(s.points_required)}
                          </span>
                          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>pts</span>
                        </div>
                      </div>

                      {/* VS badge */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 9999,
                        background: '#0f172a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, margin: '0 8px',
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>VS</span>
                      </div>

                      {/* Retail price with strikethrough */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                          Retail Price
                        </p>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                            {formatINRFull(s.est_cash_value_inr)}
                          </span>
                          <div style={{
                            position: 'absolute', left: 0, right: 0,
                            top: '50%', height: 2, background: '#FF2E93', transform: 'translateY(-50%)',
                          }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

                    {/* Transfer chain */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                            <rect x="1" y="1" width="18" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" fill="white" />
                            <rect x="1" y="5" width="18" height="3" fill="#e2e8f0" />
                            <rect x="3" y="10" width="5" height="1.5" rx="0.75" fill="#cbd5e1" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', lineHeight: 1.2, margin: 0 }}>Credit Card</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.2, margin: 0 }}>Points</p>
                        </div>
                      </div>

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                          background: s.program_logo_url ? '#f8fafc' : '#0f172a',
                          border: '1px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          padding: s.program_logo_url ? 2 : 0,
                        }}>
                          {s.program_logo_url ? (
                            <img
                              src={s.program_logo_url}
                              alt={s.program_name ?? ''}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://cdn.brandfetch.io/${sDomain}/icon`;
                              }}
                            />
                          ) : (
                            <img
                              src={`https://cdn.brandfetch.io/${sDomain}/icon`}
                              alt={s.program_name ?? ''}
                              style={{ width: 24, height: 24, objectFit: 'contain' }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', lineHeight: 1.2, margin: 0 }}>
                            {s.program_name}
                          </p>
                          <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.2, margin: 0 }}>
                            {s.program_type === 'hotel' ? 'hotel points' : 'miles program'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Route + CPP */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        <span>{from}</span>
                        <span style={{ color: '#cbd5e1', margin: '0 2px' }}>to</span>
                        <span>{to}</span>
                      </div>
                      <span style={{
                        fontSize:     11,
                        fontWeight:   700,
                        color:        s.cpp >= 2.0 ? '#009966' : '#E08A00',
                        background:   s.cpp >= 2.0 ? 'rgba(0,153,102,0.08)' : 'rgba(224,138,0,0.08)',
                        padding:      '3px 8px',
                        borderRadius: 6,
                        border:       `1px solid ${s.cpp >= 2.0 ? 'rgba(0,153,102,0.2)' : 'rgba(224,138,0,0.2)'}`,
                      }}>
                        Rs.{s.cpp.toFixed(2)}/pt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots + timer ring */}
        <div style={{
          background:     '#111111',
          padding:        '12px 20px 16px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  height:       8,
                  width:        i === active ? 28 : 8,
                  borderRadius: 100,
                  background:   i === active ? CORAL : '#cbd5e1',
                  border:       'none',
                  cursor:       'pointer',
                  padding:      0,
                  transition:   'width 0.25s ease, background 0.25s ease',
                }}
              />
            ))}
          </div>

          <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#2d2d2d" strokeWidth="2.5" />
              <circle
                key={`timer-${active}`}
                cx="20" cy="20" r="16"
                fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16}`}
                style={{ animation: 'countdown 3s linear forwards' }}
              />
              <style>{`@keyframes countdown { to { stroke-dashoffset: 0; } }`}</style>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9999,
                background: '#111111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{active + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
