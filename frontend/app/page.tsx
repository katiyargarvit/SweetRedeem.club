// ============================================================
// SweetRedeem.club -- Home Page (Figma V3 design)
// Server Component with ISR (5-min revalidation)
// ============================================================

import { Suspense } from 'react';
import { fetchSweetSpots } from '@/lib/supabase-queries';

// -- Home sections --------------------------------------------
import HeroSection          from '@/components/home/HeroSection';
import DealOfTheDay         from '@/components/home/DealOfTheDay';
import CuratedDeals         from '@/components/home/CuratedDeals';
import DestinationsSection  from '@/components/home/DestinationsSection';
import CPPValuationsSection from '@/components/home/CPPValuationsSection';
import RTBSection           from '@/components/home/RTBSection';
import OnboardingTeaser     from '@/components/home/OnboardingTeaser';
import FaqSection           from '@/components/home/FaqSection';
import SiteFooter           from '@/components/home/SiteFooter';

import type { SweetSpotRow } from '@/lib/database.types';

// Revalidate every 5 minutes (ISR)
export const revalidate = 300;

// -- Fallback mock data ----------------------------------------
const MOCK_SPOTS: SweetSpotRow[] = [
  {
    id: 'mock-sin', program_id: 'krisflyer', program_name: 'KrisFlyer', program_type: 'flight',
    title: 'Singapore Airlines Business Class', route_or_property: 'BOM -> SIN',
    category: 'business', points_required: 55000, est_cash_value_inr: 210000, cpp: 2.10,
    destination_url: 'https://www.singaporeair.com/krisflyer', status: 'live' as const,
    source_value_native: null, source_currency: null, is_active: true,
    last_verified_at: '2026-03-28T00:00:00Z', needs_review: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-03-28T00:00:00Z',
  },
  {
    id: 'mock-lhr', program_id: 'etihad', program_name: 'Etihad Guest', program_type: 'flight',
    title: 'Etihad Business Studio', route_or_property: 'BOM -> LHR',
    category: 'business', points_required: 58000, est_cash_value_inr: 240000, cpp: 1.96,
    destination_url: 'https://www.etihad.com', status: 'live' as const,
    source_value_native: null, source_currency: null, is_active: true,
    last_verified_at: '2026-03-28T00:00:00Z', needs_review: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-03-28T00:00:00Z',
  },
  {
    id: 'mock-yyz', program_id: 'aeroplan', program_name: 'Aeroplan', program_type: 'flight',
    title: 'Air Canada Business Class', route_or_property: 'BOM -> YYZ',
    category: 'business', points_required: 70000, est_cash_value_inr: 250000, cpp: 2.04,
    destination_url: 'https://www.aircanada.com/aeroplan', status: 'live' as const,
    source_value_native: null, source_currency: null, is_active: true,
    last_verified_at: '2026-03-28T00:00:00Z', needs_review: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-03-28T00:00:00Z',
  },
  {
    id: 'mock-maldives', program_id: 'hyatt', program_name: 'World of Hyatt', program_type: 'hotel',
    title: 'Park Hyatt Maldives', route_or_property: 'Park Panoramic per night',
    category: 'hotel_suite', points_required: 35000, est_cash_value_inr: 95000, cpp: 2.71,
    destination_url: 'https://world.hyatt.com', status: 'live' as const,
    source_value_native: null, source_currency: null, is_active: true,
    last_verified_at: '2026-03-28T00:00:00Z', needs_review: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-03-28T00:00:00Z',
  },
];

export default async function HomePage() {
  let spots: SweetSpotRow[] = [];
  try {
    spots = await fetchSweetSpots({ limit: 6 });
    if (spots.length === 0) spots = MOCK_SPOTS;
  } catch {
    spots = MOCK_SPOTS;
  }

  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Deal of the Day */}
      <DealOfTheDay spots={spots} />

      {/* 3. Sweet-spots */}
      <Suspense fallback={<div style={{ height: 200 }} />}>
        <CuratedDeals spots={spots} />
      </Suspense>

      {/* 4. Destinations */}
      <DestinationsSection />

      {/* 5. CPP Valuations */}
      <CPPValuationsSection />

      {/* 6. RTB */}
      <RTBSection />

      {/* 7. Onboarding teaser */}
      <OnboardingTeaser />

      {/* 8. FAQ */}
      <FaqSection />

      {/* 9. Footer */}
      <SiteFooter />
    </>
  );
}
