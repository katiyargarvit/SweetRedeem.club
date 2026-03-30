// ============================================================
// Project Maximize — API Client
// Base URL resolves to:
//   Dev:  /api/backend  (proxied → FastAPI via next.config.js rewrite)
//   Prod: process.env.NEXT_PUBLIC_API_URL/api/v1
//
// Router prefix map (must match backend/app/main.py):
//   Calculator  → /calculator/cards, /calculator/calculate
//   Routing     → /routing/recommend
//   Sweet Spots → /sweet-spots/
//   Click track → /calculator/track-click
// ============================================================

import type {
  Card,
  CalculateRequest,
  CalculateResponse,
  RecommendRequest,
  RecommendResponse,
  SweetSpot,
} from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : '/api/backend';   // dev proxy set in next.config.js rewrites

// ── Shared fetch wrapper ──────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',   // sends pm_session_id cookie
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Cards ─────────────────────────────────────────────────────

export async function getCards(): Promise<Card[]> {
  return apiFetch<Card[]>('/calculator/cards');
}

// ── Calculator ────────────────────────────────────────────────

export async function calculate(
  payload: CalculateRequest,
): Promise<CalculateResponse> {
  return apiFetch<CalculateResponse>('/calculator/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Recommendations ───────────────────────────────────────────

export async function recommend(
  payload: RecommendRequest,
): Promise<RecommendResponse> {
  return apiFetch<RecommendResponse>('/routing/recommend', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Sweet Spots ───────────────────────────────────────────────

export interface SweetSpotsParams {
  program_id?: string;
  category?: string;
  program_type?: 'flight' | 'hotel';
  limit?: number;
  offset?: number;
}

export async function getSweetSpots(
  params: SweetSpotsParams = {},
): Promise<SweetSpot[]> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiFetch<SweetSpot[]>(`/sweet-spots/${qs ? `?${qs}` : ''}`);
}

// ── Click tracking (fire-and-forget, never blocks UI) ─────────

export async function trackClick(payload: {
  sweet_spot_id: string;
  destination_url: string;
  destination_partner?: string;
}): Promise<void> {
  apiFetch<void>('/calculator/track-click', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently ignore — telemetry should never break UX
  });
}

// ── Formatting helpers ────────────────────────────────────────

/** Format a number as Indian Rupees, abbreviated (e.g. ₹2.4L, ₹85K) */
export function formatINR(value: number): string {
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(1)}L`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(0)}K`;
  }
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/** Format points with Indian number system (e.g. 1,00,000) */
export function formatPoints(n: number): string {
  return n.toLocaleString('en-IN');
}

/** CPP → value tier label and colour class */
export function cppTier(cpp: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (cpp >= 2.0)  return { label: 'Elite Value',  color: 'text-value-elite',  bg: 'bg-value-elite/10'  };
  if (cpp >= 1.2)  return { label: 'High Value',   color: 'text-value-high',   bg: 'bg-value-high/10'   };
  if (cpp >= 0.8)  return { label: 'Good Value',   color: 'text-value-mid',    bg: 'bg-value-mid/10'    };
  if (cpp >= 0.5)  return { label: 'Fair Value',   color: 'text-value-low',    bg: 'bg-value-low/10'    };
  return             { label: 'Poor Value',   color: 'text-value-poor',   bg: 'bg-value-poor/10'   };
}

/** Category key → human-readable label */
export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    economy:        'Economy Class',
    business:       'Business Class',
    first:          'First Class',
    hotel_standard: 'Standard Room',
    hotel_suite:    'Suite',
  };
  return map[category] ?? category;
}
