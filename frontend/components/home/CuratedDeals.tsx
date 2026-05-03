'use client';

// ============================================================
// CuratedDeals — "Sweet-spots" horizontal scroll cards
// Figma Make design (03-May)
// Uses clearbit logos for airlines + live Supabase spots
// ============================================================

import { useRouter } from 'next/navigation';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatPoints } from '@/lib/supabase-queries';

const CORAL  = '#FF6B4A';
const NAVY   = '#0B1120';
const GREEN  = '#00A86B';
const CURSIVE = "'Caveat', cursive";

// Map program_id → airline domain for logo fetching
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
};

function getProgramDomain(spot: SweetSpotRow): string {
  if (spot.program_logo_url) return ''; // will use logo_url directly
  return PROGRAM_DOMAIN[spot.program_id] ?? `${spot.program_id.replace(/_/g, '')}.com`;
}

function getLogoSrc(spot: SweetSpotRow): string {
  if (spot.program_logo_url) return spot.program_logo_url;
  const d = getProgramDomain(spot);
  return `https://cdn.brandfetch.io/${d}/icon`;
}

const classLabel = (category: string) => {
  if (category === 'first')          return 'First Class';
  if (category === 'business')       return 'Business';
  if (category === 'hotel_suite')    return 'Hotel Suite';
  if (category === 'hotel_standard') return 'Hotel';
  return 'Economy';
};

const classColor = (category: string) => {
  if (category === 'business' || category === 'first') return '#F59E0B';
  if (category.startsWith('hotel')) return GREEN;
  return '#2563EB';
};

interface Props {
  spots: SweetSpotRow[];
}

export default function CuratedDeals({ spots }: Props) {
  const router = useRouter();
  if (!spots.length) return null;

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #F1F5F9', paddingTop: 40, paddingBottom: 32 }}>

      {/* ── Section header ───────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <h2 style={{
          fontSize:      30,
          fontWeight:    800,
          letterSpacing: '-0.03em',
          lineHeight:    1,
          color:         '#0f172a',
          margin:        '0 0 4px',
        }}>
          Sweet-spots
        </h2>
        <div style={{
          fontFamily: CURSIVE,
          fontStyle:  'italic',
          fontSize:   20,
          color:      '#64748b',
        }}>
          handpicked by the club
        </div>
      </div>

      {/* ── Horizontal scrollable cards ──────────────────── */}
      <div style={{
        display:                 'flex',
        overflowX:               'auto',
        gap:                     12,
        padding:                 '4px 20px 12px',
        scrollbarWidth:          'none',
        scrollSnapType:          'x mandatory',
        scrollPaddingInlineStart: 20,
      } as React.CSSProperties}>
        {spots.slice(0, 6).map((spot) => {
          const [from, to] = spot.route_or_property.split(/→|>/).map((p) => p.trim());
          const logoSrc = getLogoSrc(spot);

          return (
            <div
              key={spot.id}
              onClick={() => router.push('/sweet-spots/' + spot.id)}
              style={{
                flex:        '0 0 auto',
                position:    'relative',
                width:       'calc(100vw - 40px)',
                maxWidth:    360,
                scrollSnapAlign: 'start',
                background:  '#fff',
                borderRadius: 22,
                border:      '1px solid #e2e8f0',
                boxShadow:   '0 2px 16px rgba(11,17,32,0.07)',
                cursor:      'pointer',
                overflow:    'visible',
              }}
            >
              {/* CPP badge — sits above card top edge */}
              <span style={{
                position:     'absolute',
                top:          0,
                right:        20,
                transform:    'translateY(-50%)',
                background:   GREEN,
                color:        '#fff',
                fontSize:     11,
                fontWeight:   800,
                padding:      '4px 10px',
                borderRadius: 9999,
                zIndex:       1,
              }}>
                ₹{spot.cpp.toFixed(2)}/pt
              </span>

              <div style={{ padding: 20 }}>
                {/* Airline row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {/* Logo */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 14, overflow: 'hidden',
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, padding: 8,
                  }}>
                    <img
                      src={logoSrc}
                      alt={spot.program_name ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          parent.style.background = '#1a1a2e';
                          parent.innerHTML = `<span style="color:white;font-size:11px;font-weight:800;text-align:center">${(spot.program_name ?? 'PT').substring(0, 3).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  </div>

                  {/* Route + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{from}</span>
                      <span style={{ fontSize: 13, color: '#cbd5e1' }}>✈</span>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: '#0f172a',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{to}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{spot.program_name}</span>
                      <span style={{ color: '#e2e8f0' }}>·</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: classColor(spot.category),
                      }}>
                        {classLabel(spot.category)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

                {/* Bottom: transfer + points */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Generic card icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                        <rect x="1" y="1" width="18" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" fill="white" />
                        <rect x="1" y="5" width="18" height="3" fill="#e2e8f0" />
                        <rect x="3" y="10" width="5" height="1.5" rx="0.75" fill="#cbd5e1" />
                      </svg>
                    </div>
                    {/* Arrow */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {/* Program logo small */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, overflow: 'hidden',
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 4,
                    }}>
                      <img
                        src={logoSrc}
                        alt={spot.program_name ?? ''}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
                      />
                    </div>
                  </div>

                  {/* Points count */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>
                      SWEETREDEEM
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
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

      {/* ── Discover more CTA ────────────────────────────── */}
      <div style={{ padding: '8px 20px 0' }}>
        <button
          onClick={() => router.push('/discover')}
          style={{
            width:          '100%',
            padding:        '16px',
            borderRadius:   16,
            border:         'none',
            background:     NAVY,
            color:          '#fff',
            fontSize:       15,
            fontWeight:     700,
            letterSpacing:  '-0.01em',
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
          }}
        >
          Discover more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </section>
  );
}
