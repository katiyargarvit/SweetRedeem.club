'use client';

// ============================================================
// Admin Panel — /admin
//
// Protected to katiyargarvit@gmail.com only.
// Two tabs:
//   1. Pending Spots — approve / go-live / reject + inline price edit
//   2. Scraper Health — last run per scraper with status colour
//
// Auth model:
//   - Client checks session email on mount; redirects to /login if wrong
//   - All API calls include the JWT in the Authorization header
//   - API routes verify the JWT server-side using the service role key
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────

interface PendingSpot {
  id:                 string;
  title:              string;
  program_name:       string | null;
  program_type:       string | null;
  category:           string;
  route_or_property:  string;
  points_required:    number;
  est_cash_value_inr: number;
  cpp:                number;
  source_value_native?: number | null;
  source_currency?:    string | null;
  destination_url:    string | null;
  needs_review:       boolean;
  created_at:         string;
}

interface ScraperRun {
  id:             string;
  scraper_name:   string;
  status:         'success' | 'partial' | 'failed';
  spots_found:    number;
  spots_upserted: number;
  error_message:  string | null;
  duration_ms:    number | null;
  started_at:     string;
  completed_at:   string | null;
}

type Tab = 'spots' | 'scrapers';
type LoadState = 'loading' | 'ready' | 'error';

// ── Helpers ───────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function formatPoints(n: number): string {
  return n.toLocaleString('en-IN');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function categoryLabel(c: string): string {
  const map: Record<string, string> = {
    economy: 'Eco', business: 'Biz', first: '1st',
    hotel_standard: 'Std', hotel_suite: 'Suite',
  };
  return map[c] ?? c;
}

function cppColor(cpp: number): string {
  if (cpp >= 2.0) return '#1a7a4a';
  if (cpp >= 1.2) return '#b25f00';
  return '#999';
}

// India airport codes + cities — used for "India routes" filter
const INDIA_KEYWORDS = [
  'DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'GOI', 'COK', 'PNQ',
  'IXC', 'IXB', 'JAI', 'NAG', 'IDR', 'PAT', 'BBI', 'SXR', 'TRV', 'GAU',
  'India', 'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Kolkata', 'Ahmedabad', 'Goa', 'Kochi', 'Pune', 'Jaipur',
];

function isIndiaRoute(route: string): boolean {
  const r = route.toUpperCase();
  return INDIA_KEYWORDS.some((k) => r.includes(k.toUpperCase()));
}

type FilterType     = 'all' | 'flight' | 'hotel' | 'hybrid';
type FilterIndia    = 'all' | 'india';
type FilterClass    = 'all' | 'economy' | 'business' | 'first' | 'hotel_standard' | 'hotel_suite';

function statusBadge(status: ScraperRun['status']): { label: string; bg: string; color: string } {
  if (status === 'success') return { label: 'OK',      bg: '#e8f5ee', color: '#1a7a4a' };
  if (status === 'partial') return { label: 'PARTIAL', bg: '#fff3e0', color: '#b25f00' };
  return                           { label: 'FAILED',  bg: '#fce8e8', color: '#c0392b' };
}

// ── Main component ────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [authState, setAuthState] = useState<'checking' | 'ok' | 'denied'>('checking');
  const [token, setToken]         = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('spots');

  // Spots state
  const [spots, setSpots]       = useState<PendingSpot[]>([]);
  const [spotsLoad, setSpotsLoad] = useState<LoadState>('loading');
  const [spotsError, setSpotsError] = useState('');

  // Scrapers state
  const [scrapers, setScrapers]       = useState<ScraperRun[]>([]);
  const [scrapersLoad, setScrapersLoad] = useState<LoadState>('loading');
  const [scrapersError, setScrapersError] = useState('');

  // ── Filter state ─────────────────────────────────────────────
  const [filterType,    setFilterType]    = useState<FilterType>('all');
  const [filterIndia,   setFilterIndia]   = useState<FilterIndia>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterClass,   setFilterClass]   = useState<FilterClass>('all');

  // Per-row editing state: spotId → edited value string
  const [editingPrice,  setEditingPrice]  = useState<Record<string, string>>({});
  const [editingPoints, setEditingPoints] = useState<Record<string, string>>({});
  // Per-row saving state (action in flight)
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // ── Auth check on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'katiyargarvit@gmail.com') {
        setAuthState('denied');
        router.replace('/login');
        return;
      }
      setToken(session.access_token);
      setAuthState('ok');
    })();
  }, [router]);

  // ── Fetch spots ───────────────────────────────────────────────
  const fetchSpots = useCallback(async (jwt: string) => {
    setSpotsLoad('loading');
    try {
      const res = await fetch('/api/admin/spots', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data: PendingSpot[] = await res.json();
      setSpots(data);
      setSpotsLoad('ready');
    } catch (e) {
      setSpotsError(e instanceof Error ? e.message : 'Failed to load spots');
      setSpotsLoad('error');
    }
  }, []);

  // ── Fetch scrapers ────────────────────────────────────────────
  const fetchScrapers = useCallback(async (jwt: string) => {
    setScrapersLoad('loading');
    try {
      const res = await fetch('/api/admin/scrapers', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data: ScraperRun[] = await res.json();
      setScrapers(data);
      setScrapersLoad('ready');
    } catch (e) {
      setScrapersError(e instanceof Error ? e.message : 'Failed to load scraper runs');
      setScrapersLoad('error');
    }
  }, []);

  // Fetch data once auth is confirmed
  useEffect(() => {
    if (authState === 'ok' && token) {
      fetchSpots(token);
      fetchScrapers(token);
    }
  }, [authState, token, fetchSpots, fetchScrapers]);

  // ── Spot action ───────────────────────────────────────────────
  async function handleAction(
    spot: PendingSpot,
    action: 'approve' | 'go_live' | 'reject',
  ) {
    if (!token) return;
    setSaving((s) => ({ ...s, [spot.id + action]: true }));

    const body: Record<string, unknown> = { id: spot.id, action };

    // Bundle any pending field edits into the same request
    const editedPrice = editingPrice[spot.id];
    if (editedPrice !== undefined) {
      const parsed = parseFloat(editedPrice);
      if (!isNaN(parsed) && parsed > 0) body.est_cash_value_inr = parsed;
    }

    const editedPoints = editingPoints[spot.id];
    if (editedPoints !== undefined) {
      const parsed = parseInt(editedPoints, 10);
      if (!isNaN(parsed) && parsed > 0) body.points_required = parsed;
    }

    try {
      const res = await fetch('/api/admin/spots', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());

      // Remove the spot from the pending list
      setSpots((prev) => prev.filter((s) => s.id !== spot.id));
      setEditingPrice((prev)  => { const n = { ...prev }; delete n[spot.id]; return n; });
      setEditingPoints((prev) => { const n = { ...prev }; delete n[spot.id]; return n; });
    } catch (e) {
      alert('Action failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setSaving((s) => { const n = { ...s }; delete n[spot.id + action]; return n; });
    }
  }

  // ── Save price edit only (no status change) ───────────────────
  async function handlePriceSave(spot: PendingSpot) {
    if (!token) return;
    const editedPrice = editingPrice[spot.id];
    if (editedPrice === undefined) return;
    const parsed = parseFloat(editedPrice);
    if (isNaN(parsed) || parsed <= 0) return;

    setSaving((s) => ({ ...s, [spot.id + 'price']: true }));
    try {
      const res = await fetch('/api/admin/spots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: spot.id, est_cash_value_inr: parsed }),
      });
      if (!res.ok) throw new Error(await res.text());

      setSpots((prev) => prev.map((s) =>
        s.id === spot.id ? { ...s, est_cash_value_inr: parsed, cpp: parsed / s.points_required } : s,
      ));
      setEditingPrice((prev) => { const n = { ...prev }; delete n[spot.id]; return n; });
    } catch (e) {
      alert('Price save failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setSaving((s) => { const n = { ...s }; delete n[spot.id + 'price']; return n; });
    }
  }

  // ── Save points edit only (no status change) ──────────────────
  async function handlePointsSave(spot: PendingSpot) {
    if (!token) return;
    const editedPoints = editingPoints[spot.id];
    if (editedPoints === undefined) return;
    const parsed = parseInt(editedPoints, 10);
    if (isNaN(parsed) || parsed <= 0) return;

    setSaving((s) => ({ ...s, [spot.id + 'points']: true }));
    try {
      const res = await fetch('/api/admin/spots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: spot.id, points_required: parsed }),
      });
      if (!res.ok) throw new Error(await res.text());

      setSpots((prev) => prev.map((s) =>
        s.id === spot.id ? { ...s, points_required: parsed, cpp: s.est_cash_value_inr / parsed } : s,
      ));
      setEditingPoints((prev) => { const n = { ...prev }; delete n[spot.id]; return n; });
    } catch (e) {
      alert('Points save failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setSaving((s) => { const n = { ...s }; delete n[spot.id + 'points']; return n; });
    }
  }

  // ── Derived filter options + filtered list ────────────────────
  const programOptions = useMemo(() => {
    const names = spots
      .map((s) => s.program_name)
      .filter((n): n is string => !!n);
    return Array.from(new Set(names)).sort();
  }, [spots]);

  const filteredSpots = useMemo(() => {
    return spots.filter((s) => {
      if (filterType !== 'all' && s.program_type !== filterType) return false;
      if (filterIndia === 'india' && !isIndiaRoute(s.route_or_property)) return false;
      if (filterProgram !== 'all' && s.program_name !== filterProgram) return false;
      if (filterClass !== 'all' && s.category !== filterClass) return false;
      return true;
    });
  }, [spots, filterType, filterIndia, filterProgram, filterClass]);

  // ── Auth states ───────────────────────────────────────────────
  if (authState === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: 14, color: '#999' }}>Checking access…</div>
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: 14, color: '#E03E3E' }}>Access denied — redirecting…</div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ background: '#F9F6F0', minHeight: '100vh', padding: '24px 20px' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#121212', color: '#C5A059',
          borderRadius: 8, padding: '6px 12px', marginBottom: 12,
          fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
        }}>
          ✦ ADMIN
        </div>
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 26, fontWeight: 700, color: '#000',
          margin: 0, lineHeight: 1.2,
        }}>
          SweetRedeem Admin
        </h1>
        <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          {filteredSpots.length} of {spots.length} spot{spots.length !== 1 ? 's' : ''} · logged in as katiyargarvit@gmail.com
        </p>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        borderBottom: '1px solid #E8E0D5', paddingBottom: 0,
      }}>
        {([
          { key: 'spots' as Tab,    label: `Pending Spots (${filteredSpots.length}${filteredSpots.length !== spots.length ? `/${spots.length}` : ''})` },
          { key: 'scrapers' as Tab, label: 'Scraper Health' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === key ? '#121212' : '#999',
              borderBottom: activeTab === key ? '2px solid #121212' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}

        {/* Refresh button */}
        <button
          onClick={() => token && (fetchSpots(token), fetchScrapers(token))}
          style={{
            marginLeft: 'auto', fontSize: 12, color: '#C5A059', fontWeight: 700,
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Pending Spots Tab ────────────────────────────────── */}
      {activeTab === 'spots' && (
        <div>

          {/* ── Filter bar ──────────────────────────────────────── */}
          {spotsLoad === 'ready' && spots.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
              background: '#fff', border: '1px solid #E8E0D5',
              borderRadius: 12, padding: '10px 14px',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>
                Filter
              </span>

              {/* 1. Type — Hotel / Airline / Hybrid */}
              <FilterSelect
                label="Type"
                value={filterType}
                onChange={(v) => setFilterType(v as FilterType)}
                options={[
                  { value: 'all',    label: 'All Types' },
                  { value: 'flight', label: '✈ Airline' },
                  { value: 'hotel',  label: '🏨 Hotel' },
                  { value: 'hybrid', label: '⚡ Hybrid' },
                ]}
              />

              {/* 2. India routes */}
              <FilterSelect
                label="Routes"
                value={filterIndia}
                onChange={(v) => setFilterIndia(v as FilterIndia)}
                options={[
                  { value: 'all',   label: 'All Routes' },
                  { value: 'india', label: '🇮🇳 India Routes' },
                ]}
              />

              {/* 3. Program / loyalty program / hotel chain */}
              <FilterSelect
                label="Program"
                value={filterProgram}
                onChange={setFilterProgram}
                options={[
                  { value: 'all', label: 'All Programs' },
                  ...programOptions.map((p) => ({ value: p, label: p })),
                ]}
              />

              {/* 4. Class / category */}
              <FilterSelect
                label="Class"
                value={filterClass}
                onChange={(v) => setFilterClass(v as FilterClass)}
                options={[
                  { value: 'all',            label: 'All Classes' },
                  { value: 'economy',        label: 'Economy' },
                  { value: 'business',       label: 'Business' },
                  { value: 'first',          label: 'First' },
                  { value: 'hotel_standard', label: 'Hotel Standard' },
                  { value: 'hotel_suite',    label: 'Hotel Suite' },
                ]}
              />

              {/* Clear all */}
              {(filterType !== 'all' || filterIndia !== 'all' || filterProgram !== 'all' || filterClass !== 'all') && (
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterIndia('all');
                    setFilterProgram('all');
                    setFilterClass('all');
                  }}
                  style={{
                    marginLeft: 'auto', fontSize: 11, color: '#c0392b',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: 700, padding: '4px 0',
                  }}
                >
                  ✕ Clear filters
                </button>
              )}
            </div>
          )}

          {spotsLoad === 'loading' && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>
              Loading pending spots…
            </div>
          )}
          {spotsLoad === 'error' && (
            <div style={{ background: '#fce8e8', borderRadius: 12, padding: 16, color: '#c0392b', fontSize: 13 }}>
              Error: {spotsError}
            </div>
          )}
          {spotsLoad === 'ready' && spots.length === 0 && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: 40,
              textAlign: 'center', border: '1px solid #E8E0D5',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <p style={{ color: '#666', fontSize: 14 }}>No pending spots — all clear!</p>
            </div>
          )}
          {spotsLoad === 'ready' && spots.length > 0 && filteredSpots.length === 0 && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: 32,
              textAlign: 'center', border: '1px solid #E8E0D5',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
              <p style={{ color: '#666', fontSize: 14 }}>No spots match the current filters.</p>
            </div>
          )}
          {spotsLoad === 'ready' && filteredSpots.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredSpots.map((spot) => {
                const editedPrice  = editingPrice[spot.id];
                const editedPoints = editingPoints[spot.id];
                // Recompute CPP live as either field changes
                const livePrice  = editedPrice  !== undefined ? (parseFloat(editedPrice)  || 0) : spot.est_cash_value_inr;
                const livePoints = editedPoints !== undefined ? (parseInt(editedPoints, 10) || spot.points_required) : spot.points_required;
                const displayCpp = livePoints > 0 ? livePrice / livePoints : 0;
                const isSavingAny = saving[spot.id + 'approve'] || saving[spot.id + 'go_live'] || saving[spot.id + 'reject'];

                return (
                  <div key={spot.id} style={{
                    background: '#fff',
                    border: '1px solid #E8E0D5',
                    borderRadius: 16,
                    padding: 16,
                    opacity: isSavingAny ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    {/* Row 1: Title + meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#121212', marginBottom: 2 }}>
                          {spot.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {spot.program_name ?? '—'} · {categoryLabel(spot.category)} · {spot.route_or_property}
                        </div>
                      </div>
                      {/* CPP badge */}
                      <div style={{
                        flexShrink: 0, marginLeft: 12,
                        fontSize: 16, fontWeight: 800,
                        color: cppColor(displayCpp),
                      }}>
                        ₹{displayCpp.toFixed(2)}
                        <span style={{ fontSize: 10, fontWeight: 400, color: '#999', display: 'block', textAlign: 'right' }}>
                          /pt
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Editable Points → Editable Cash Value */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>

                      {/* Editable points */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          value={editedPoints ?? spot.points_required}
                          onChange={(e) => setEditingPoints((prev) => ({ ...prev, [spot.id]: e.target.value }))}
                          style={{
                            width: 100, padding: '4px 8px', borderRadius: 6,
                            border: editedPoints !== undefined ? '1px solid #C5A059' : '1px solid #E8E0D5',
                            fontSize: 12, fontWeight: 700, color: '#121212',
                            background: '#fff', outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#666' }}>pts</span>
                        {editedPoints !== undefined && (
                          <button
                            onClick={() => handlePointsSave(spot)}
                            disabled={!!saving[spot.id + 'points']}
                            style={{
                              fontSize: 11, padding: '4px 8px', borderRadius: 6,
                              background: '#C5A059', color: '#fff', border: 'none',
                              cursor: 'pointer', fontWeight: 700,
                            }}
                          >
                            Save pts
                          </button>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: '#666' }}>→</div>

                      {/* Editable cash value */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>₹</span>
                        <input
                          type="number"
                          value={editedPrice ?? spot.est_cash_value_inr}
                          onChange={(e) => setEditingPrice((prev) => ({ ...prev, [spot.id]: e.target.value }))}
                          style={{
                            width: 90, padding: '4px 8px', borderRadius: 6,
                            border: editedPrice !== undefined ? '1px solid #C5A059' : '1px solid #E8E0D5',
                            fontSize: 12, fontWeight: 700, color: '#121212',
                            background: '#fff', outline: 'none',
                          }}
                        />
                        {editedPrice !== undefined && (
                          <button
                            onClick={() => handlePriceSave(spot)}
                            disabled={!!saving[spot.id + 'price']}
                            style={{
                              fontSize: 11, padding: '4px 8px', borderRadius: 6,
                              background: '#C5A059', color: '#fff', border: 'none',
                              cursor: 'pointer', fontWeight: 700,
                            }}
                          >
                            Save ₹
                          </button>
                        )}
                      </div>

                      {spot.destination_url && (
                        <a
                          href={spot.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: '#C5A059', textDecoration: 'none', marginLeft: 'auto' }}
                        >
                          Verify ↗
                        </a>
                      )}
                    </div>

                    {/* Row 3: Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionButton
                        label="Approve"
                        onClick={() => handleAction(spot, 'approve')}
                        loading={!!saving[spot.id + 'approve']}
                        style={{ background: '#e8f5ee', color: '#1a7a4a' }}
                      />
                      <ActionButton
                        label="✓ Go Live"
                        onClick={() => handleAction(spot, 'go_live')}
                        loading={!!saving[spot.id + 'go_live']}
                        style={{ background: '#121212', color: '#fff' }}
                      />
                      <ActionButton
                        label="✗ Reject"
                        onClick={() => handleAction(spot, 'reject')}
                        loading={!!saving[spot.id + 'reject']}
                        style={{ background: '#fce8e8', color: '#c0392b', marginLeft: 'auto' }}
                      />
                    </div>

                    {/* Created at */}
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 8 }}>
                      Added {timeAgo(spot.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Scraper Health Tab ───────────────────────────────── */}
      {activeTab === 'scrapers' && (
        <div>
          {scrapersLoad === 'loading' && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>
              Loading scraper runs…
            </div>
          )}
          {scrapersLoad === 'error' && (
            <div style={{ background: '#fce8e8', borderRadius: 12, padding: 16, color: '#c0392b', fontSize: 13 }}>
              Error: {scrapersError}
            </div>
          )}
          {scrapersLoad === 'ready' && scrapers.length === 0 && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: 40,
              textAlign: 'center', border: '1px solid #E8E0D5',
            }}>
              <p style={{ color: '#666', fontSize: 14 }}>No scraper runs recorded yet.</p>
              <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                Run a scraper with <code style={{ background: '#F0EBE3', padding: '2px 6px', borderRadius: 4 }}>npm run scrape</code> to see data here.
              </p>
            </div>
          )}
          {scrapersLoad === 'ready' && scrapers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scrapers.map((run) => {
                const badge = statusBadge(run.status);
                return (
                  <div key={run.id} style={{
                    background: '#fff',
                    border: '1px solid #E8E0D5',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    {/* Status badge */}
                    <div style={{
                      flexShrink: 0,
                      background: badge.bg, color: badge.color,
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                      borderRadius: 6, padding: '3px 8px',
                      minWidth: 52, textAlign: 'center',
                    }}>
                      {badge.label}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#121212', marginBottom: 2 }}>
                        {run.scraper_name}
                      </div>
                      {run.error_message && (
                        <div style={{
                          fontSize: 11, color: '#c0392b',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}>
                          {run.error_message}
                        </div>
                      )}
                      {!run.error_message && (
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {run.spots_upserted} upserted · {run.spots_found} found
                          {run.duration_ms ? ` · ${(run.duration_ms / 1000).toFixed(1)}s` : ''}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ flexShrink: 0, fontSize: 11, color: '#bbb', textAlign: 'right' }}>
                      {timeAgo(run.started_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const isActive = value !== 'all';
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      style={{
        fontSize: 12, fontWeight: isActive ? 800 : 600,
        padding: '5px 8px', borderRadius: 8,
        border: isActive ? '1.5px solid #C5A059' : '1px solid #E8E0D5',
        background: isActive ? '#FFF8EC' : '#FAFAF8',
        color: isActive ? '#8B6914' : '#555',
        cursor: 'pointer', outline: 'none',
        appearance: 'auto',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ActionButton({
  label, onClick, loading, style,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '7px 14px',
        borderRadius: 8,
        border: 'none',
        fontSize: 12,
        fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {loading ? '…' : label}
    </button>
  );
}
