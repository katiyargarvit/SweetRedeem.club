// ============================================================
// World of Hyatt Award Chart Scraper
//
// Source: Hardcoded — chart is stable, rarely changes
// Runs:   When Hyatt updates categories (annually at most)
//
// What we capture: 8 hotel categories × 3 rate tiers
// (off_peak / standard / peak). Hyatt moved to a 5-tier system
// from May 2025 (Lowest/Low/Moderate/Upper/Top) within categories,
// but the category caps and example properties remain the same.
//
// Sweet spot logic:
//   Axis Olympus transfers 1:4 to Hyatt (best Indian card ratio).
//   Category 4–6 Indian properties (Park Hyatt, Alila, Grand Hyatt)
//   at standard 15–25k pts = ₹1.7–₹2.0 CPP vs ₹0.50 cash.
//
// ⚠️  Verify cash value estimates against current rates before approving.
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, PROGRAM_IDS,
} from '../lib/utils';

interface HyattRow {
  category:          number;
  off_peak_pts:      number;
  standard_pts:      number;
  peak_pts:          number;
  cash_off_peak_inr: number;  // ₹ cash value at off-peak occupancy
  cash_standard_inr: number;  // ₹ cash value standard night
  cash_peak_inr:     number;  // ₹ cash value peak (weekend/holiday)
  examples:          string;
  booking_url?:      string;
}

const AWARD_CHART: HyattRow[] = [
  {
    category: 1, off_peak_pts: 3500,  standard_pts: 5000,  peak_pts: 8000,
    cash_off_peak_inr: 5000,  cash_standard_inr: 7000,  cash_peak_inr: 10000,
    examples: 'Hyatt Place / Hyatt House select-service properties',
  },
  {
    category: 2, off_peak_pts: 6500,  standard_pts: 8000,  peak_pts: 12000,
    cash_off_peak_inr: 8000,  cash_standard_inr: 11000, cash_peak_inr: 16000,
    examples: 'Hyatt Place India (Pune, Kolkata)',
  },
  {
    category: 3, off_peak_pts: 9000,  standard_pts: 12000, peak_pts: 17000,
    cash_off_peak_inr: 12000, cash_standard_inr: 16000, cash_peak_inr: 22000,
    examples: 'Hyatt Regency India select properties',
  },
  {
    category: 4, off_peak_pts: 12000, standard_pts: 15000, peak_pts: 20000,
    cash_off_peak_inr: 18000, cash_standard_inr: 25000, cash_peak_inr: 35000,
    examples: 'Grand Hyatt Goa, Alila Diwa Goa',
    booking_url: 'https://www.hyatt.com/en-US/hotel/india',
  },
  {
    category: 5, off_peak_pts: 17000, standard_pts: 20000, peak_pts: 25000,
    cash_off_peak_inr: 25000, cash_standard_inr: 35000, cash_peak_inr: 48000,
    examples: 'Park Hyatt Chennai, Park Hyatt Hyderabad, Hyatt Regency Mumbai',
    booking_url: 'https://www.hyatt.com/en-US/hotel/india',
  },
  {
    category: 6, off_peak_pts: 21000, standard_pts: 25000, peak_pts: 30000,
    cash_off_peak_inr: 35000, cash_standard_inr: 50000, cash_peak_inr: 70000,
    examples: 'Park Hyatt Mumbai, Alila Fort Bishangarh (Rajasthan)',
    booking_url: 'https://www.hyatt.com/en-US/hotel/india',
  },
  {
    category: 7, off_peak_pts: 25000, standard_pts: 30000, peak_pts: 40000,
    cash_off_peak_inr: 55000, cash_standard_inr: 80000, cash_peak_inr: 120000,
    examples: 'Park Hyatt Paris-Vendôme, Andaz Munich, flagship properties',
    booking_url: 'https://world.hyatt.com',
  },
  {
    category: 8, off_peak_pts: 35000, standard_pts: 40000, peak_pts: 50000,
    cash_off_peak_inr: 90000, cash_standard_inr: 120000, cash_peak_inr: 180000,
    examples: 'Alila Jabal Akhdar (Oman), Park Hyatt Maldives, ultra-luxury properties',
    booking_url: 'https://world.hyatt.com',
  },
];

type TierKey = 'off_peak' | 'standard' | 'peak';

const TIERS: Array<{
  key: TierKey;
  label: string;
  ptsField: keyof HyattRow;
  cashField: keyof HyattRow;
}> = [
  { key: 'off_peak', label: 'Off-Peak',  ptsField: 'off_peak_pts', cashField: 'cash_off_peak_inr' },
  { key: 'standard', label: 'Standard',  ptsField: 'standard_pts', cashField: 'cash_standard_inr' },
  { key: 'peak',     label: 'Peak',      ptsField: 'peak_pts',     cashField: 'cash_peak_inr'     },
];

async function scrapeHyatt(): Promise<void> {
  log('Hyatt', 'Building sweet spots from award chart...');

  const today = new Date().toISOString().split('T')[0];
  const spots: SweetSpotInsert[] = [];

  for (const row of AWARD_CHART) {
    for (const tier of TIERS) {
      const pts  = row[tier.ptsField] as number;
      const cash = row[tier.cashField] as number;
      const cpp  = cash / pts;

      // Only stage spots with CPP ≥ ₹1.20 (better than cash redemption)
      if (cpp < 1.20) continue;

      // Determine hotel category type
      const catType = row.category <= 5 ? 'hotel_standard' : 'hotel_suite';

      spots.push({
        program_id:         PROGRAM_IDS.HYATT,
        title:              `Hyatt Category ${row.category} — ${tier.label} Night`,
        route_or_property:  `Category ${row.category}: ${row.examples}`,
        points_required:    pts,
        est_cash_value_inr: cash,
        category:           catType,
        destination_url:    row.booking_url ?? 'https://world.hyatt.com',
        status:             'pending',
        last_verified_at:   today,
      });
    }
  }

  await upsertSweetSpots(spots, PROGRAM_IDS.HYATT);
  log('Hyatt', `Done — ${spots.length} spots staged for review.`);
}

if (require.main === module) {
  scrapeHyatt().catch((err) => {
    logError('Hyatt', err);
    process.exit(1);
  });
}

export { scrapeHyatt };
