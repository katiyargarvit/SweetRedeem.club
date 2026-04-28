'use client';

// ============================================================
// Discover page — V3 Quiet Luxury
// Shows Roame-style deal cards ranked by CPP, with filters.
// Falls back to mock data if Supabase is not yet configured.
// ============================================================

import { useState, useEffect } from 'react';
import { fetchSweetSpotsWithBestReturn, formatINR, formatPoints } from '@/lib/supabase-queries';
import { supabase } from '@/lib/supabase';
import type { SweetSpotBestReturnRow } from '@/lib/database.types';
import DealDrawer from '@/components/ui/DealDrawer';

// ── Mock data (shown when Supabase is not yet configured) ────
const _MOCK_DEFAULTS = { last_verified_at: new Date().toISOString(), destination_url: null };
const MOCK_SPOTS: SweetSpotBestReturnRow[] = [
  { ..._MOCK_DEFAULTS, sweet_spot_id: '1', program_id: 'p1', program_name: 'KrisFlyer',      program_type: 'flight', title: 'BOM → SIN Business',         route_or_property: 'BOM → SIN',          category: 'business',    points_required: 55000, est_cash_value_inr: 140000, cpp: 2.55, best_return_pct: 8.49, best_card_name: 'HDFC Infinia',          best_card_slug: 'hdfc-infinia' },
  { ..._MOCK_DEFAULTS, sweet_spot_id: '2', program_id: 'p2', program_name: 'Flying Blue',    program_type: 'flight', title: 'DEL → CDG Economy Flash',     route_or_property: 'DEL → CDG',          category: 'economy',     points_required: 12000, est_cash_value_inr: 35000,  cpp: 2.92, best_return_pct: 9.72, best_card_name: 'HDFC Infinia',          best_card_slug: 'hdfc-infinia' },
  { ..._MOCK_DEFAULTS, sweet_spot_id: '3', program_id: 'p3', program_name: 'Aeroplan',       program_type: 'flight', title: 'BOM → YYZ Business',          route_or_property: 'BOM → YYZ',          category: 'business',    points_required: 70000, est_cash_value_inr: 175000, cpp: 2.50, best_return_pct: 8.33, best_card_name: 'HDFC Infinia',          best_card_slug: 'hdfc-infinia' },
  { ..._MOCK_DEFAULTS, sweet_spot_id: '4', program_id: 'p4', program_name: 'KrisFlyer',      program_type: 'flight', title: 'SIN → LHR First Class',       route_or_property: 'SIN → LHR',          category: 'first',       points_required: 95000, est_cash_value_inr: 350000, cpp: 3.68, best_return_pct: 12.26, best_card_name: 'HDFC Infinia',         best_card_slug: 'hdfc-infinia' },
  { ..._MOCK_DEFAULTS, sweet_spot_id: '5', program_id: 'p5', program_name: 'Marriott Bonvoy', program_type: 'hotel', title: 'Park Hyatt Maldives — Peak',  route_or_property: 'Park Hyatt Maldives', category: 'hotel_suite', points_required: 35000, est_cash_value_inr: 95000,  cpp: 2.71, best_return_pct: 9.03, best_card_name: 'Axis Magnus (Burgundy)', best_card_slug: 'axis-magnus-burgundy' },
  { ..._MOCK_DEFAULTS, sweet_spot_id: '6', program_id: 'p6', program_name: 'Avios',           program_type: 'flight', title: 'DEL → LHR Business via BA',  route_or_property: 'DEL → LHR',          category: 'business',    points_required: 40000, est_cash_value_inr: 234000, cpp: 5.85, best_return_pct: 19.49, best_card_name: 'HDFC Infinia',         best_card_slug: 'hdfc-infinia' },
];

// ── Filter config ────────────────────────────────────────────
type FilterType = 'All' | 'Flights' | 'Hotels';
type FilterCabin = 'All Cabins' | 'Economy' | 'Business' | 'First';
type FilterPrice = 'All Prices' | 'Under ₹1L' | '₹1L–₹2L' | '₹2L+';

const TYPE_FILTERS: FilterType[]  = ['All', 'Flights', 'Hotels'];
const CABIN_FILTERS: FilterCabin[] = ['All Cabins', 'Economy', 'Business', 'First'];
const PRICE_FILTERS: FilterPrice[] = ['All Prices', 'Under ₹1L', '₹1L–₹2L', '₹2L+'];

// Popular Indian-origin destinations as shortcodes
const DEST_OPTIONS = ['All', 'SIN', 'LHR', 'CDG', 'YYZ', 'DOH', 'BKK', 'NRT', 'SYD'];

// Destination → gradient for the card image strip
const DEST_GRADIENTS: Record<string, string> = {
  SIN: 'linear-gradient(135deg, #0f1c35 0%, #1a3a5c 50%, #0a1f38 100%)',
  LHR: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  CDG: 'linear-gradient(135deg, #1a1200 0%, #3d2e00 50%, #1a1000 100%)',
  YYZ: 'linear-gradient(135deg, #0d1c1a 0%, #0d3330 50%, #0a1e1d 100%)',
  DOH: 'linear-gradient(135deg, #1a0d00 0%, #3d2200 50%, #1a1000 100%)',
  BKK: 'linear-gradient(135deg, #1a0d30 0%, #2d1a56 50%, #1a0d30 100%)',
  HOTEL: 'linear-gradient(135deg, #1a1200 0%, #3a2a00 40%, #1a1200 100%)',
};

function getGradient(spot: SweetSpotBestReturnRow): string {
  if (spot.program_type === 'hotel') return DEST_GRADIENTS.HOTEL;
  const dest = (spot.route_or_property ?? '').split('→').pop()?.trim().substring(0, 3).toUpperCase() ?? '';
  return DEST_GRADIENTS[dest] ?? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)';
}

function cabinEmoji(cat: string): string {
  if (cat === 'first')  return '✦';
  if (cat === 'business') return '◈';
  if (cat === 'economy') return '◇';
  return '🏨';
}

// ── Return % tier colours ─────────────────────────────────────
function returnTierColour(pct: number): { bg: string; text: string; border: string } {
  if (pct >= 15) return { bg: 'rgba(0,200,133,0.12)', text: '#00A86B', border: 'rgba(0,200,133,0.25)' };
  if (pct >= 8)  return { bg: 'rgba(0,200,133,0.07)', text: '#00A86B', border: 'rgba(0,200,133,0.15)' };
  if (pct >= 5)  return { bg: 'rgba(224,138,0,0.10)',  text: '#E08A00', border: 'rgba(224,138,0,0.22)' };
  return               { bg: 'rgba(224,62,62,0.10)',  text: '#C0392B', border: 'rgba(224,62,62,0.20)' };
}

// ── Roame-style deal card ─────────────────────────────────────
function DealCard({ spot, locked, onClick }: { spot: SweetSpotBestReturnRow; locked?: boolean; onClick?: () => void }) {
  const retColour = returnTierColour(spot.best_return_pct);
  const gradient = getGradient(spot);
  const dest = spot.program_type === 'hotel'
    ? (spot.route_or_property ?? '').substring(0, 20)
    : (spot.route_or_property ?? '');
  const origin = dest.split('→')[0]?.trim() ?? '';
  const arrival = dest.split('→')[1]?.trim() ?? '';

  return (
    <div
      onClick={!locked ? onClick : undefined}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #EAEAEA',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        position: 'relative',
        cursor: locked ? 'default' : 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
    >
      {/* Image strip */}
      <div style={{
        background: gradient,
        height: 88,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px 14px',
        filter: locked ? 'blur(3px)' : 'none',
      }}>
        {/* Programme name */}
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {spot.program_name}
        </span>

        {/* % Return badge top-right */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '3px 9px',
          background: retColour.bg,
          border: `1px solid ${retColour.border}`,
          borderRadius: 9999,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: retColour.text, display: 'block', lineHeight: 1.1 }}>
            {spot.best_return_pct.toFixed(1)}%
          </span>
          <span style={{ fontSize: 8, fontWeight: 600, color: retColour.text, opacity: 0.75, letterSpacing: '0.04em' }}>
            RETURN
          </span>
        </div>

        {/* Cabin badge top-left */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          padding: '2px 8px',
          background: 'rgba(0,0,0,0.45)',
          borderRadius: 9999,
          fontSize: 10, fontWeight: 700, color: '#fff',
          textTransform: 'capitalize',
        }}>
          {cabinEmoji(spot.category)} {spot.category?.replace('_', ' ') ?? 'Flight'}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', filter: locked ? 'blur(3px)' : 'none' }}>
        {/* Route bar */}
        {spot.program_type !== 'hotel' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>{origin}</span>
            <div style={{ flex: 1, height: 1, background: '#EAEAEA', position: 'relative' }}>
              <span style={{
                position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                fontSize: 11, color: '#C5A059',
              }}>✈</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>{arrival}</span>
          </div>
        ) : (
          <p style={{ fontSize: 14, fontWeight: 700, color: '#000', marginBottom: 10 }}>
            {spot.route_or_property}
          </p>
        )}

        {/* Transfer route label + Best with card */}
        <p style={{ fontSize: 11, color: '#666', marginBottom: 4, lineHeight: 1.4 }}>
          {spot.title}
        </p>
        <p style={{ fontSize: 10, color: '#C5A059', fontWeight: 700, marginBottom: 12 }}>
          Best with {spot.best_card_name}
        </p>

        {/* Points + value + % Return row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Points</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>
              {formatPoints(spot.points_required)}
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: '#EAEAEA' }} />
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Worth</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#00A86B' }}>
              {formatINR(spot.est_cash_value_inr)}
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: '#EAEAEA' }} />
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Return</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: retColour.text }}>
              {spot.best_return_pct.toFixed(1)}%
            </p>
            <p style={{ fontSize: 9, color: '#bbb', marginTop: 1 }}>₹{spot.cpp.toFixed(2)}/pt</p>
          </div>
        </div>
      </div>

      {/* Premium lock overlay */}
      {locked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(249,246,240,0.7)',
          backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>Members only</span>
          <a href="/signup" style={{
            padding: '7px 18px', borderRadius: 9999,
            background: '#121212', color: '#fff',
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
          }}>Sign up free →</a>
        </div>
      )}
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────
function DealSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA',
      overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: 88, background: '#F4F4F4' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 14, background: '#F0F0F0', borderRadius: 6, marginBottom: 10, width: '70%' }} />
        <div style={{ height: 11, background: '#F0F0F0', borderRadius: 6, marginBottom: 14, width: '50%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ height: 20, background: '#F0F0F0', borderRadius: 6, flex: 1 }} />
          <div style={{ height: 20, background: '#F0F0F0', borderRadius: 6, flex: 1 }} />
          <div style={{ height: 20, background: '#F0F0F0', borderRadius: 6, flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: 9999,
        fontSize: 12, fontWeight: 700,
        border: `1px solid ${active ? '#121212' : '#EAEAEA'}`,
        background: active ? '#121212' : '#fff',
        color: active ? '#fff' : '#666',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.12s',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [spots, setSpots]               = useState<SweetSpotBestReturnRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [typeFilter, setTypeFilter]     = useState<FilterType>('All');
  const [cabinFilter, setCabinFilter]   = useState<FilterCabin>('All Cabins');
  const [priceFilter, setPriceFilter]   = useState<FilterPrice>('All Prices');
  const [destFilter, setDestFilter]     = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<SweetSpotBestReturnRow | null>(null);

  useEffect(() => {
    // Check auth session
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    // Listen for auth changes (e.g. magic-link click in same tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchSweetSpotsWithBestReturn({ limit: 30 })
      .then((data) => setSpots(data.length > 0 ? data : MOCK_SPOTS))
      .catch(() => setSpots(MOCK_SPOTS))
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter
  const filtered = spots.filter((s) => {
    if (typeFilter === 'Flights' && s.program_type !== 'flight') return false;
    if (typeFilter === 'Hotels'  && s.program_type !== 'hotel')  return false;
    if (cabinFilter === 'Economy'  && s.category !== 'economy')  return false;
    if (cabinFilter === 'Business' && s.category !== 'business') return false;
    if (cabinFilter === 'First'    && s.category !== 'first')    return false;
    // Price range
    if (priceFilter === 'Under ₹1L'  && s.est_cash_value_inr >= 100000)  return false;
    if (priceFilter === '₹1L–₹2L'   && (s.est_cash_value_inr < 100000 || s.est_cash_value_inr >= 200000)) return false;
    if (priceFilter === '₹2L+'       && s.est_cash_value_inr < 200000)   return false;
    // Destination — match against the arrival leg of route_or_property
    if (destFilter !== 'All') {
      const arrival = (s.route_or_property ?? '').split('→').pop()?.trim().substring(0, 3).toUpperCase() ?? '';
      if (arrival !== destFilter) return false;
    }
    return true;
  });

  // Authenticated users see everything; guests see first 4 free + 2 teaser locked
  const visibleFree   = isAuthenticated ? filtered : filtered.slice(0, 4);
  const visibleLocked = isAuthenticated ? []       : filtered.slice(4, 6);

  return (
    <div style={{ padding: '20px 20px 0', background: '#F9F6F0', minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#C5A059',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
        }}>
          Discover
        </p>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 26, fontWeight: 700, color: '#000', lineHeight: 1.2, marginBottom: 4,
        }}>
          Curated sweet spots
        </h1>
        <p style={{ fontSize: 12, color: '#666' }}>
          Best-value awards right now — ranked by % return on spend
        </p>
      </div>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#fff', borderRadius: 14, border: '1px solid #EAEAEA',
        marginBottom: 20, overflow: 'hidden',
      }}>
        {[
          { value: spots.length || '30+', label: 'Sweet spots' },
          { value: '₹2.5L', label: 'Best this week' },
          { value: '14', label: 'Cards covered' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '12px 8px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid #EAEAEA' : 'none',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>{stat.value}</p>
            <p style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Sticky filter rows ───────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 20,
        background: 'rgba(249,246,240,0.95)',
        backdropFilter: 'blur(10px)',
        marginLeft: -20, marginRight: -20,
        padding: '10px 20px 8px',
        borderBottom: '1px solid #EAEAEA',
        marginBottom: 16,
      }}>
        {/* Row 1 — Type + Cabin */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}
             className="hide-scrollbar">
          {TYPE_FILTERS.map((f) => (
            <FilterPill key={f} label={f} active={typeFilter === f} onClick={() => setTypeFilter(f)} />
          ))}
          <div style={{ width: 1, background: '#EAEAEA', flexShrink: 0, alignSelf: 'stretch' }} />
          {CABIN_FILTERS.map((f) => (
            <FilterPill key={f} label={f} active={cabinFilter === f} onClick={() => setCabinFilter(f)} />
          ))}
        </div>
        {/* Row 2 — Price range + Destination */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 2 }}
             className="hide-scrollbar">
          <span style={{ fontSize: 10, fontWeight: 700, color: '#999', alignSelf: 'center', whiteSpace: 'nowrap', marginRight: 2 }}>
            VALUE
          </span>
          {PRICE_FILTERS.map((f) => (
            <FilterPill key={f} label={f} active={priceFilter === f} onClick={() => setPriceFilter(f)} />
          ))}
          <div style={{ width: 1, background: '#EAEAEA', flexShrink: 0, alignSelf: 'stretch' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#999', alignSelf: 'center', whiteSpace: 'nowrap', marginRight: 2 }}>
            DEST
          </span>
          {DEST_OPTIONS.map((d) => (
            <FilterPill key={d} label={d} active={destFilter === d} onClick={() => setDestFilter(d)} />
          ))}
        </div>
      </div>

      {/* ── Deal cards ───────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => <DealSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>No deals match this filter</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Try a different category or check back soon.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleFree.map((spot) => (
            <DealCard key={spot.sweet_spot_id} spot={spot} onClick={() => setSelectedSpot(spot)} />
          ))}

          {/* Locked teaser cards — guests only */}
          {visibleLocked.map((spot) => (
            <DealCard key={spot.sweet_spot_id} spot={spot} locked />
          ))}
        </div>
      )}

      {/* ── Footer note ──────────────────────────────────────── */}
      {!loading && (
        <p style={{ fontSize: 10, color: '#ccc', textAlign: 'center', marginTop: 24, paddingBottom: 8 }}>
          All values are estimates. Transfers are irreversible — always verify before transferring.
        </p>
      )}

      {/* ── Deal Drawer ───────────────────────────────────────── */}
      {selectedSpot && (
        <DealDrawer spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
    </div>
  );
}
