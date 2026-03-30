// ============================================================
// Air India Maharaja Club Award Chart Scraper
//
// Source:  Hybrid — per-route data from live API + zone estimates
// API:     https://api-loyalty.airindia.com/loyalty-core/v4/get-points
//          (requires Ocp-Apim-Subscription-Key — captured from calculator page)
// Runs:    When Air India updates its award chart
//
// Fare types (Economy only):
//   Value Fare  — lowest points, requires advance booking (6+ weeks)
//   Prime Fare  — higher points, always available (last-minute / peak)
//   Business / First — single flat rate (no VAL/PRM split)
//
// Data status (March 2026):
//   ✅ Domestic Economy + Business  — API-verified per route
//   ✅ Middle East + SE Asia        — API-verified per route
//   ⚠️  DEL/BOM–DXB ECO/BUS        — API rate-limited; zone estimate used
//   ⚠️  Europe (Zone 4)            — API rate-limited; zone estimate used
//   ⚠️  North America / Australia   — API rate-limited; zone estimate used
//   → Re-run API fetch for ⚠️ routes when rate limit resets
//
// CPP threshold: ≥ 1.20  (only stages spots better than cash redemption)
//
// ⚠️  All spots marked needs_review=true — verify cash prices against
//     live market before approving in Supabase.
//     Redeem page: https://www.airindia.com/in/en/maharaja-club/redeem-points.html
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';

interface AwardRoute {
  title:     string;
  route:     string;         // route_or_property field
  cabin:     SweetSpotCategory;
  points:    number;         // Value fare min (Economy) or flat rate (Business/First)
  cashInr:   number;         // estimated cash equivalent, one-way
  fareNote?: string;         // e.g. "Value fare — advance booking"
  verified?: boolean;        // true = API-confirmed; false = zone estimate
}

const REDEEM_URL = 'https://www.airindia.com/in/en/maharaja-club/redeem-points.html';
const MIN_CPP    = 1.20;

// ─── DOMESTIC — Economy Value fare (API-verified, March 2026) ────────────────
//
//  Route         Value pts   Prime pts   Business pts
//  DEL–BOM       5,000–7,500   9,500      23,000
//  DEL–BLR       7,500–8,000  12,000      31,000
//  DEL–HYD       5,000–7,500  10,000      25,000
//  DEL–GOI         9,000      10,500      29,000
//  DEL–CCU       5,000–8,500  10,500      27,000
//  DEL–MAA       7,500–9,000  11,000      30,000
//  BOM–BLR         4,000       6,000      21,000
//  DEL–SXR         6,500      10,000         —
//  DEL–AMD       4,000–5,500   7,000         —
//
// We stage the minimum Value fare pts (best deal) per route.
// Prime fare CPPs are mostly < 1.20 on domestic, so not staged.

const AWARD_ROUTES: AwardRoute[] = [

  // ── Domestic Economy — Value fare ────────────────────────────────────────
  {
    title: 'DEL → BOM Economy — Maharaja Club (Value)',
    route: 'DEL–BOM', cabin: 'economy',
    points: 5_000, cashInr: 7_500,         // CPP 1.50
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → HYD Economy — Maharaja Club (Value)',
    route: 'DEL–HYD', cabin: 'economy',
    points: 5_000, cashInr: 7_000,         // CPP 1.40
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → CCU Economy — Maharaja Club (Value)',
    route: 'DEL–CCU', cabin: 'economy',
    points: 5_000, cashInr: 8_000,         // CPP 1.60
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'BOM → BLR Economy — Maharaja Club (Value)',
    route: 'BOM–BLR', cabin: 'economy',
    points: 4_000, cashInr: 5_500,         // CPP 1.38
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → AMD Economy — Maharaja Club (Value)',
    route: 'DEL–AMD', cabin: 'economy',
    points: 4_000, cashInr: 5_500,         // CPP 1.38
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → SXR Economy — Maharaja Club (Value)',
    route: 'DEL–SXR', cabin: 'economy',
    points: 6_500, cashInr: 8_000,         // CPP 1.23
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → MAA Economy — Maharaja Club (Value)',
    route: 'DEL–MAA', cabin: 'economy',
    points: 7_500, cashInr: 9_000,         // CPP 1.20
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → BLR Economy — Maharaja Club (Value)',
    route: 'DEL–BLR', cabin: 'economy',
    points: 7_500, cashInr: 9_000,         // CPP 1.20
    fareNote: 'Value fare — advance booking', verified: true,
  },

  // ── Domestic Business (API-verified flat rate) ────────────────────────────
  {
    title: 'DEL → BOM Business — Maharaja Club',
    route: 'DEL–BOM', cabin: 'business',
    points: 23_000, cashInr: 32_000,       // CPP 1.39
    verified: true,
  },
  {
    title: 'DEL → BLR Business — Maharaja Club',
    route: 'DEL–BLR', cabin: 'business',
    points: 31_000, cashInr: 42_000,       // CPP 1.35
    verified: true,
  },
  {
    title: 'DEL → HYD Business — Maharaja Club',
    route: 'DEL–HYD', cabin: 'business',
    points: 25_000, cashInr: 30_000,       // CPP 1.20
    verified: true,
  },
  {
    title: 'DEL → GOI Business — Maharaja Club',
    route: 'DEL–GOI', cabin: 'business',
    points: 29_000, cashInr: 35_000,       // CPP 1.21
    verified: true,
  },
  {
    title: 'DEL → CCU Business — Maharaja Club',
    route: 'DEL–CCU', cabin: 'business',
    points: 27_000, cashInr: 33_000,       // CPP 1.22
    verified: true,
  },
  {
    title: 'DEL → MAA Business — Maharaja Club',
    route: 'DEL–MAA', cabin: 'business',
    points: 30_000, cashInr: 38_000,       // CPP 1.27
    verified: true,
  },
  {
    title: 'BOM → BLR Business — Maharaja Club',
    route: 'BOM–BLR', cabin: 'business',
    points: 21_000, cashInr: 28_000,       // CPP 1.33
    verified: true,
  },

  // ── Middle East — Economy Value fare (API-verified) ───────────────────────
  {
    title: 'BLR → DXB Economy — Maharaja Club (Value)',
    route: 'BLR–DXB', cabin: 'economy',
    points: 16_000, cashInr: 22_000,       // CPP 1.38
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'HYD → DXB Economy — Maharaja Club (Value)',
    route: 'HYD–DXB', cabin: 'economy',
    points: 21_000, cashInr: 26_000,       // CPP 1.24
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'MAA → DXB Economy — Maharaja Club (Value)',
    route: 'MAA–DXB', cabin: 'economy',
    points: 20_000, cashInr: 25_000,       // CPP 1.25
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'COK → DXB Economy — Maharaja Club (Value)',
    route: 'COK–DXB', cabin: 'economy',
    points: 21_000, cashInr: 26_000,       // CPP 1.24
    fareNote: 'Value fare — advance booking', verified: true,
  },

  // ── Middle East — Business (API-verified flat rate) ───────────────────────
  {
    title: 'BOM → DXB Business — Maharaja Club',
    route: 'BOM–DXB', cabin: 'business',
    points: 43_000, cashInr: 65_000,       // CPP 1.51
    verified: true,
  },
  {
    title: 'BLR → DXB Business — Maharaja Club',
    route: 'BLR–DXB', cabin: 'business',
    points: 46_000, cashInr: 65_000,       // CPP 1.41
    verified: true,
  },

  // ── SE Asia — Economy Value fare (API-verified) ───────────────────────────
  {
    title: 'DEL → SIN Economy — Maharaja Club (Value)',
    route: 'DEL–SIN', cabin: 'economy',
    points: 20_000, cashInr: 28_000,       // CPP 1.40
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'BOM → SIN Economy — Maharaja Club (Value)',
    route: 'BOM–SIN', cabin: 'economy',
    points: 18_000, cashInr: 26_000,       // CPP 1.44
    fareNote: 'Value fare — advance booking', verified: true,
  },
  {
    title: 'DEL → BKK Economy — Maharaja Club (Value)',
    route: 'DEL–BKK', cabin: 'economy',
    points: 16_000, cashInr: 22_000,       // CPP 1.38
    fareNote: 'Value fare — advance booking', verified: true,
  },

  // ── SE Asia — Business (API-verified flat rate) ───────────────────────────
  {
    title: 'DEL → SIN Business — Maharaja Club',
    route: 'DEL–SIN', cabin: 'business',
    points: 52_000, cashInr: 1_05_000,    // CPP 2.02 ← standout value
    verified: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ⚠️  ZONE ESTIMATES — API rate-limited in last run (March 2026)
  //     These use zone-chart estimates; re-fetch via API to confirm exact pts.
  //     DEL/BOM–DXB ECO+BUS, all Europe, all North America, Australia.
  // ─────────────────────────────────────────────────────────────────────────

  // ── Middle East — DEL/BOM–DXB (zone estimate) ────────────────────────────
  {
    title: 'DEL → DXB Economy — Maharaja Club (Value, est.)',
    route: 'DEL–DXB', cabin: 'economy',
    points: 17_000, cashInr: 24_000,       // CPP 1.41 (est. based on zone peers)
    fareNote: 'Value fare — advance booking', verified: false,
  },
  {
    title: 'BOM → DXB Economy — Maharaja Club (Value, est.)',
    route: 'BOM–DXB', cabin: 'economy',
    points: 15_000, cashInr: 22_000,       // CPP 1.47 (est.)
    fareNote: 'Value fare — advance booking', verified: false,
  },
  {
    title: 'DEL → DXB Business — Maharaja Club (est.)',
    route: 'DEL–DXB', cabin: 'business',
    points: 48_000, cashInr: 70_000,       // CPP 1.46 (est.)
    verified: false,
  },

  // ── Europe — Zone 4 estimates ─────────────────────────────────────────────
  {
    title: 'DEL → LHR Economy — Maharaja Club (Value, est.)',
    route: 'DEL–LHR', cabin: 'economy',
    points: 35_000, cashInr: 55_000,       // CPP 1.57 (est.)
    fareNote: 'Value fare — advance booking', verified: false,
  },
  {
    title: 'DEL → LHR Business — Maharaja Club (est.) — A350 Lie-Flat',
    route: 'DEL–LHR', cabin: 'business',
    points: 65_000, cashInr: 2_00_000,    // CPP 3.08 ← headline sweet spot
    verified: false,
  },
  {
    title: 'BOM → LHR Business — Maharaja Club (est.) — A350 Lie-Flat',
    route: 'BOM–LHR', cabin: 'business',
    points: 65_000, cashInr: 2_00_000,    // CPP 3.08 (est.)
    verified: false,
  },
  {
    title: 'DEL → CDG/FRA Business — Maharaja Club (est.)',
    route: 'DEL–CDG / DEL–FRA', cabin: 'business',
    points: 65_000, cashInr: 1_90_000,    // CPP 2.92 (est.)
    verified: false,
  },

  // ── North America — Zone 5 estimates ──────────────────────────────────────
  {
    title: 'DEL → JFK/ORD/SFO Business — Maharaja Club (est.) — B777/A350',
    route: 'DEL–JFK / DEL–ORD / DEL–SFO', cabin: 'business',
    points: 85_000, cashInr: 2_75_000,    // CPP 3.24 (est.)
    verified: false,
  },
  {
    title: 'DEL → YYZ Business — Maharaja Club (est.)',
    route: 'DEL–YYZ', cabin: 'business',
    points: 85_000, cashInr: 2_50_000,    // CPP 2.94 (est.)
    verified: false,
  },

  // ── Australia — Zone 5 estimate ───────────────────────────────────────────
  {
    title: 'DEL → MEL Business — Maharaja Club (est.)',
    route: 'DEL–MEL', cabin: 'business',
    points: 90_000, cashInr: 2_50_000,    // CPP 2.78 (est.)
    verified: false,
  },
];

async function scrapeAirIndia(): Promise<void> {
  log('AirIndia', 'Building sweet spots from Maharaja Club award data...');

  const today = new Date().toISOString().split('T')[0];
  const spots: SweetSpotInsert[] = [];
  let skipped = 0;

  for (const route of AWARD_ROUTES) {
    const cpp = route.cashInr / route.points;
    if (cpp < MIN_CPP) { skipped++; continue; }

    const titleSuffix = route.verified ? '' : ' ⚠️ est.';

    spots.push({
      program_id:         PROGRAM_IDS.AIR_INDIA,
      title:              route.title,
      route_or_property:  route.route,
      points_required:    route.points,
      est_cash_value_inr: route.cashInr,
      category:           route.cabin,
      destination_url:    REDEEM_URL,
      status:             'pending',
      needs_review:       true,   // always true — verify cash prices before going live
      last_verified_at:   today,
    });
  }

  await upsertSweetSpots(spots, PROGRAM_IDS.AIR_INDIA);
  log('AirIndia', `Done — ${spots.length} spots staged (${skipped} below CPP ₹${MIN_CPP} skipped).`);

  const verified   = spots.filter((_, i) => AWARD_ROUTES.find(r => r.route === spots[i].route_or_property)?.verified !== false).length;
  const estimated  = spots.length - verified;
  log('AirIndia', `  API-verified: ${verified} | Zone estimates (⚠️ needs re-fetch): ${estimated}`);
}

if (require.main === module) {
  scrapeAirIndia().catch((err) => {
    logError('AirIndia', err);
    process.exit(1);
  });
}

export { scrapeAirIndia };
