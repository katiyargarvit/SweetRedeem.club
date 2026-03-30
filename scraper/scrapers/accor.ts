// ============================================================
// Accor ALL (Accor Live Limitless) Award Chart Scraper
//
// Source: Hardcoded — Accor Reward Night tier structure (India)
// Runs:   When Accor updates hotel tier assignments
//
// Sweet spot logic:
//   Accor ALL has one of the best India CPPs among hotel programs.
//   HSBC Premier transfers 1:1 (exceptional — most cards are worse).
//   Axis Olympus transfers 1:4 (4 ALL points per ₹1 Edge Mile).
//   India has hundreds of Accor properties across all tiers.
//
//   Reward Night costs below are per night (standard season, India).
//   Actual costs vary by property and season — use as guide only.
//
// India brand tier → Reward Night cost:
//   Budget  (ibis, ibis Styles, Greet)             : ~1,500–2,500 pts
//   Standard (Novotel, Mercure, Grand Mercure)      : ~2,500–4,000 pts
//   Upper   (Pullman, Mövenpick, Swissôtel)        : ~4,000–6,500 pts
//   Luxury  (Sofitel, SO/ Hotels)                  : ~5,500–9,000 pts
//
// Transfer partners (India cards):
//   HSBC Premier:   1:1 (best ratio — most valuable)
//   Axis Olympus:   1:4  (4 ALL pts per Edge Mile)
//   SBI Aurum:      1:4
//   Amex Platinum:  1:3 (approximate)
//
// ⚠️  All spots marked needs_review=true. Accor reward costs vary
//     significantly by property — verify before approving at:
//     https://all.accor.com
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, PROGRAM_IDS,
} from '../lib/utils';

interface AccorTier {
  brandTier:   string;
  brands:      string;   // representative brand names
  examples:    string;   // example India properties
  points:      number;   // mid-range estimate for standard season
  cashInr:     number;   // estimated cash rate for equivalent night
}

const AWARD_CHART: AccorTier[] = [
  {
    brandTier: 'Budget',
    brands:    'ibis, ibis Styles, Greet Hotel',
    examples:  'ibis Bangalore, ibis Mumbai, ibis Styles Goa',
    points:    2_000,
    cashInr:   6_500,
  },
  {
    brandTier: 'Standard',
    brands:    'Novotel, Mercure, Grand Mercure',
    examples:  'Novotel Hyderabad, Grand Mercure Bangalore, Mercure Chennai',
    points:    3_500,
    cashInr:   12_000,
  },
  {
    brandTier: 'Upper',
    brands:    'Pullman, Mövenpick, Swissôtel',
    examples:  'Pullman New Delhi, Swissôtel Kolkata',
    points:    5_500,
    cashInr:   22_000,
  },
  {
    brandTier: 'Luxury',
    brands:    'Sofitel, SO/ Hotels',
    examples:  'Sofitel Mumbai BKC, Sofitel Chennai IT Highway',
    points:    7_500,
    cashInr:   40_000,
  },
];

const MIN_CPP = 1.20;

async function scrapeAccor(): Promise<void> {
  log('Accor', 'Building sweet spots from ALL Reward Night chart...');

  const today = new Date().toISOString().split('T')[0];
  const spots: SweetSpotInsert[] = [];

  for (const tier of AWARD_CHART) {
    const cpp = tier.cashInr / tier.points;
    if (cpp < MIN_CPP) continue;

    // Pullman and Sofitel → hotel_suite; budget/standard → hotel_standard
    const catType = tier.brandTier === 'Upper' || tier.brandTier === 'Luxury'
      ? 'hotel_suite'
      : 'hotel_standard';

    spots.push({
      program_id:         PROGRAM_IDS.ACCOR,
      title:              `Accor ${tier.brandTier} Tier — Reward Night (India)`,
      route_or_property:  `${tier.brands}: ${tier.examples}`,
      points_required:    tier.points,
      est_cash_value_inr: tier.cashInr,
      category:           catType,
      destination_url:    'https://all.accor.com',
      status:             'pending',
      needs_review:       true,
      last_verified_at:   today,
    });
  }

  await upsertSweetSpots(spots, PROGRAM_IDS.ACCOR);
  log('Accor', `Done — ${spots.length} spots staged (CPP ≥ ₹${MIN_CPP}).`);
}

if (require.main === module) {
  scrapeAccor().catch((err) => {
    logError('Accor', err);
    process.exit(1);
  });
}

export { scrapeAccor };
