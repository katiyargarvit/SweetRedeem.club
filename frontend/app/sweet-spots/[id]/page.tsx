// ============================================================
// SweetRedeem.club — Flight / Hotel Deal Details Page
// Figma ref: node 8:1547 "SweetRedeem.club/flight-details"
// Server Component with ISR (5-min revalidation)
// ============================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchSweetSpotById, formatPoints, formatINRFull } from '@/lib/supabase-queries';
import type { SweetSpotRow } from '@/lib/database.types';
import FlightDetailsClient from '@/components/deal/FlightDetailsClient';

export const revalidate = 300;

// ── Mock spot fallback ────────────────────────────────────────
const MOCK_SPOT_ANA: SweetSpotRow = {
  id: 'mock-ana',
  program_id: 'ana',
  program_name: 'ANA Mileage Club',
  program_type: 'flight',
  title: 'ANA Business Class — San Francisco to Cancun',
  route_or_property: 'SFO → CUN',
  category: 'business',
  points_required: 75000,
  est_cash_value_inr: 615500,
  cpp: 4.5,
  destination_url: 'https://www.ana.co.jp',
  status: 'live' as const,
  source_value_native: null,
  source_currency: null,
  is_active: true,
  last_verified_at: '2026-04-01T00:00:00Z',
  needs_review: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
};

// Figma CDN hero images per destination (replace with permanent URLs)
const HERO_IMAGES: Record<string, string> = {
  // Default cherry blossom Japan / ANA image from Figma
  default: 'https://www.figma.com/api/mcp/asset/b4d1c09f-f13b-439a-944c-b2208ef86af2',
  SIN: 'https://www.figma.com/api/mcp/asset/b4d1c09f-f13b-439a-944c-b2208ef86af2',
  CUN: 'https://www.figma.com/api/mcp/asset/b4d1c09f-f13b-439a-944c-b2208ef86af2',
};

function getHeroImage(route: string): string {
  const dest = route.split('→').pop()?.trim().substring(0, 3).toUpperCase() ?? '';
  return HERO_IMAGES[dest] ?? HERO_IMAGES.default;
}

// ── Program color map ─────────────────────────────────────────
const PROGRAM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  krisflyer:  { bg: '#003366', text: '#fff', label: 'SQ'  },
  etihad:     { bg: '#bd8b13', text: '#fff', label: 'EY'  },
  aeroplan:   { bg: '#d32b2b', text: '#fff', label: 'AC'  },
  hyatt:      { bg: '#0041a0', text: '#fff', label: 'WoH' },
  ana:        { bg: '#005bbb', text: '#fff', label: 'ANA' },
  flyingblue: { bg: '#0065ae', text: '#fff', label: 'FB'  },
  emirates:   { bg: '#c60c30', text: '#fff', label: 'EK'  },
};

// ── Transfer options (mock until DB has transfer_links wired up)
const TRANSFER_OPTIONS = [
  {
    id: 'amex-membership',
    sourceName: 'Membership\nRewards',
    sourceLabel: 'AMEX',
    sourceBg: '#006fcf',
    ratio: '1:1',
    bonus: '+50% Bonus',
    bonusColor: '#137333',
    bonusBg: '#e0f2e9',
    isInstant: true,
    isSweetRedeemPick: true,
    pointsRequired: 35000,
  },
  {
    id: 'hdfc-infinia',
    sourceName: 'HDFC\nInfinia',
    sourceLabel: 'HDFC',
    sourceBg: '#00437a',
    ratio: '1:2',
    bonus: null,
    bonusColor: null,
    bonusBg: null,
    isInstant: false,
    isSweetRedeemPick: false,
    pointsRequired: 37500,
  },
  {
    id: 'axis-atlas',
    sourceName: 'Axis\nAtlas',
    sourceLabel: 'AXIS',
    sourceBg: '#851c2c',
    ratio: '2:1',
    bonus: null,
    bonusColor: null,
    bonusBg: null,
    isInstant: false,
    isSweetRedeemPick: false,
    pointsRequired: 150000,
  },
];

interface Props {
  params: { id: string };
}

export default async function FlightDetailsPage({ params }: Props) {
  let spot: SweetSpotRow | null = null;

  try {
    spot = await fetchSweetSpotById(params.id);
  } catch {
    // Fall through to mock
  }

  // If not found in DB, check if it's a mock ID
  if (!spot) {
    if (params.id === 'mock-ana' || params.id === 'mock-sin' || params.id === 'mock-lhr' ||
        params.id === 'mock-yyz' || params.id === 'mock-maldives') {
      spot = { ...MOCK_SPOT_ANA, id: params.id };
    } else {
      notFound();
    }
  }

  const isHotel = spot.category.startsWith('hotel');
  const progInfo = PROGRAM_COLORS[spot.program_id] ?? {
    bg: '#1e3a5c', text: '#fff',
    label: (spot.program_name ?? 'PT').substring(0, 3).toUpperCase(),
  };
  const heroImage = getHeroImage(spot.route_or_property);
  const origin    = spot.route_or_property.split('→')[0]?.trim() ?? '';
  const dest      = spot.route_or_property.split('→')[1]?.trim() ?? spot.route_or_property;

  return (
    <FlightDetailsClient
      spot={spot}
      progInfo={progInfo}
      heroImage={heroImage}
      origin={origin}
      dest={dest}
      isHotel={isHotel}
      transferOptions={TRANSFER_OPTIONS}
    />
  );
}
