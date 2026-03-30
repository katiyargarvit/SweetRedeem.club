// ============================================================
// Marriott Bonvoy Award Chart Scraper
//
// Source: Hardcoded — Marriott dynamic pricing chart (India focus)
// Runs:   Quarterly or when Marriott adjusts category assignments
//
// Sweet spot logic:
//   Marriott Bonvoy has dynamic pricing within category bands
//   (off-peak / standard / peak). Best India value is Cat 6–7
//   (JW Marriott, St Regis, Ritz-Carlton) off-peak — cash rates
//   for these properties during peak season are ₹50k–₹1.3L/night
//   but off-peak redemptions require fewer points.
//
//   Key perk: 5th Night Free on award stays (book 5 nights,
//   pay points for 4). Adds ~25% to effective CPP.
//
// India properties by category (examples):
//   Cat 3: Fairfield by Marriott (multiple Tier-2 cities)
//   Cat 4: Courtyard by Marriott (Delhi, Mumbai, Bangalore)
//   Cat 5: Westin, Sheraton, Le Méridien India
//   Cat 6: JW Marriott (Mumbai, Delhi, Chandigarh, Mussoorie)
//   Cat 7: St Regis Mumbai, Ritz-Carlton Bengaluru (est.)
//
// Transfer partners (India cards):
//   HDFC Infinia: 1:1    HDFC Regalia: 1:1
//   SBI Aurum: 1:1       Axis Atlas: 1:1
//
// ⚠️  All spots marked needs_review=true. Dynamic pricing means
//     actual point costs vary — verify at:
//     https://www.marriott.com/loyalty.mi
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, PROGRAM_IDS,
} from '../lib/utils';

interface MarriottTier {
  category:    number;
  examples:    string;
  offPeakPts:  number;
  standardPts: number;
  peakPts:     number;
  cashOffPeak: number;  // ₹ off-peak night rate (India properties)
  cashStd:     number;
  cashPeak:    number;
}

const AWARD_CHART: MarriottTier[] = [
  {
    category: 3, examples: 'Fairfield by Marriott India (Tier-2 cities)',
    offPeakPts: 12_500, standardPts: 17_500, peakPts: 22_500,
    cashOffPeak: 7_000,  cashStd: 10_000,  cashPeak: 14_000,
  },
  {
    category: 4, examples: 'Courtyard by Marriott (Delhi, Mumbai, Bangalore)',
    offPeakPts: 17_500, standardPts: 25_000, peakPts: 32_000,
    cashOffPeak: 11_000, cashStd: 16_000,  cashPeak: 22_000,
  },
  {
    category: 5, examples: 'Westin / Sheraton / Le Méridien India',
    offPeakPts: 25_000, standardPts: 35_000, peakPts: 45_000,
    cashOffPeak: 20_000, cashStd: 28_000,  cashPeak: 45_000,
  },
  {
    category: 6, examples: 'JW Marriott (Mumbai, Delhi, Chandigarh)',
    offPeakPts: 35_000, standardPts: 50_000, peakPts: 65_000,
    cashOffPeak: 50_000, cashStd: 62_000,  cashPeak: 80_000,
  },
  {
    category: 7, examples: 'St Regis Mumbai, Ritz-Carlton Bengaluru',
    offPeakPts: 45_000, standardPts: 60_000, peakPts: 75_000,
    cashOffPeak: 75_000, cashStd: 1_00_000, cashPeak: 1_30_000,
  },
];

type TierDef = { label: string; ptsKey: keyof MarriottTier; cashKey: keyof MarriottTier };

const TIERS: TierDef[] = [
  { label: 'Off-Peak', ptsKey: 'offPeakPts', cashKey: 'cashOffPeak' },
  { label: 'Standard', ptsKey: 'standardPts', cashKey: 'cashStd'    },
  { label: 'Peak',     ptsKey: 'peakPts',     cashKey: 'cashPeak'   },
];

const MIN_CPP = 1.20;

async function scrapeMarriott(): Promise<void> {
  log('Marriott', 'Building sweet spots from Bonvoy award chart...');

  const today = new Date().toISOString().split('T')[0];
  const spots: SweetSpotInsert[] = [];

  for (const row of AWARD_CHART) {
    for (const tier of TIERS) {
      const pts  = row[tier.ptsKey]  as number;
      const cash = row[tier.cashKey] as number;
      const cpp  = cash / pts;

      if (cpp < MIN_CPP) continue;

      // Cat 6+ properties are hotel_suite territory
      const catType = row.category >= 6 ? 'hotel_suite' : 'hotel_standard';

      spots.push({
        program_id:         PROGRAM_IDS.MARRIOTT,
        title:              `Marriott Cat ${row.category} — ${tier.label} Night`,
        route_or_property:  `Category ${row.category}: ${row.examples}`,
        points_required:    pts,
        est_cash_value_inr: cash,
        category:           catType,
        destination_url:    'https://www.marriott.com/loyalty.mi',
        status:             'pending',
        needs_review:       true,
        last_verified_at:   today,
      });
    }
  }

  await upsertSweetSpots(spots, PROGRAM_IDS.MARRIOTT);
  log('Marriott', `Done — ${spots.length} spots staged (CPP ≥ ₹${MIN_CPP}). Tip: 5th night free adds ~25% to effective CPP.`);
}

if (require.main === module) {
  scrapeMarriott().catch((err) => {
    logError('Marriott', err);
    process.exit(1);
  });
}

export { scrapeMarriott };
