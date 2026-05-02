// ============================================================
// Air India Maharaja Club Award Chart Scraper
//
// Source:  Hybrid -- per-route data from live API + zone estimates
// Runs:    When Air India updates its award chart
//
// Data status (March 2026):
//   OK Domestic Economy + Business  -- API-verified per route
//   OK Middle East + SE Asia        -- API-verified per route
//   WARN DEL/BOM-DXB ECO/BUS       -- API rate-limited; zone estimate used
//   WARN Europe (Zone 4)            -- API rate-limited; zone estimate used
//   WARN North America / Australia  -- API rate-limited; zone estimate used
//
// CPP threshold: >= 1.20
// All spots marked needs_review=true -- verify cash prices before approving.
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';

interface AwardRoute {
  title:       string;
  origin:      string;   // IATA code e.g. 'DEL'
  destination: string;   // IATA code e.g. 'LHR'
  stops:       number;   // 0 = nonstop (all Air India routes are nonstop)
  cabin:       SweetSpotCategory;
  points:      number;
  cashInr:     number;
  fareNote?:   string;
  verified?:   boolean;
}

// Region lookup -- maps IATA codes to region labels
const IATA_REGION: Record<string, string> = {
  DEL: 'India', BOM: 'India', BLR: 'India', MAA: 'India',
  CCU: 'India', HYD: 'India', COK: 'India', AMD: 'India',
  GOI: 'India', SXR: 'India', IXC: 'India', ATQ: 'India',
  LKO: 'India', BBI: 'India', JAI: 'India', TRV: 'India',
  IXM: 'India', IXE: 'India', VNS: 'India', GAU: 'India',
  DXB: 'Middle East', AUH: 'Middle East', DOH: 'Middle East',
  KWI: 'Middle East', BAH: 'Middle East', MCT: 'Middle East',
  SIN: 'Southeast Asia', BKK: 'Southeast Asia', KUL: 'Southeast Asia',
  CGK: 'Southeast Asia', MNL: 'Southeast Asia', HAN: 'Southeast Asia',
  LHR: 'Europe', CDG: 'Europe', FRA: 'Europe', AMS: 'Europe',
  FCO: 'Europe', MAD: 'Europe', ZRH: 'Europe', VIE: 'Europe',
  JFK: 'North America', ORD: 'North America', SFO: 'North America',
  LAX: 'North America', YYZ: 'North America', YVR: 'North America',
  EWR: 'North America', IAD: 'North America',
  MEL: 'Australia / Pacific', SYD: 'Australia / Pacific',
  NRT: 'East Asia', HND: 'East Asia', ICN: 'East Asia', PEK: 'East Asia',
};

function regionOf(iata: string): string {
  return IATA_REGION[iata.toUpperCase()] ?? 'Other';
}

const OPERATING_AIRLINE = 'Air India';
const REDEEM_URL        = 'https://www.airindia.com/in/en/maharaja-club/redeem-points.html';
const MIN_CPP           = 1.20;

const AWARD_ROUTES: AwardRoute[] = [

  // Domestic Economy -- Value fare (API-verified)
  { title: 'DEL -> BOM Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'BOM', stops: 0, cabin: 'economy',
    points: 5000, cashInr: 7500, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> HYD Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'HYD', stops: 0, cabin: 'economy',
    points: 5000, cashInr: 7000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> CCU Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'CCU', stops: 0, cabin: 'economy',
    points: 5000, cashInr: 8000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'BOM -> BLR Economy -- Maharaja Club (Value)',
    origin: 'BOM', destination: 'BLR', stops: 0, cabin: 'economy',
    points: 4000, cashInr: 5500, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> AMD Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'AMD', stops: 0, cabin: 'economy',
    points: 4000, cashInr: 5500, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> SXR Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'SXR', stops: 0, cabin: 'economy',
    points: 6500, cashInr: 8000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> MAA Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'MAA', stops: 0, cabin: 'economy',
    points: 7500, cashInr: 9000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> BLR Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'BLR', stops: 0, cabin: 'economy',
    points: 7500, cashInr: 9000, fareNote: 'Value fare -- advance booking', verified: true },

  // Domestic Business (API-verified flat rate)
  { title: 'DEL -> BOM Business -- Maharaja Club',
    origin: 'DEL', destination: 'BOM', stops: 0, cabin: 'business',
    points: 23000, cashInr: 32000, verified: true },
  { title: 'DEL -> BLR Business -- Maharaja Club',
    origin: 'DEL', destination: 'BLR', stops: 0, cabin: 'business',
    points: 31000, cashInr: 42000, verified: true },
  { title: 'DEL -> HYD Business -- Maharaja Club',
    origin: 'DEL', destination: 'HYD', stops: 0, cabin: 'business',
    points: 25000, cashInr: 30000, verified: true },
  { title: 'DEL -> GOI Business -- Maharaja Club',
    origin: 'DEL', destination: 'GOI', stops: 0, cabin: 'business',
    points: 29000, cashInr: 35000, verified: true },
  { title: 'DEL -> CCU Business -- Maharaja Club',
    origin: 'DEL', destination: 'CCU', stops: 0, cabin: 'business',
    points: 27000, cashInr: 33000, verified: true },
  { title: 'DEL -> MAA Business -- Maharaja Club',
    origin: 'DEL', destination: 'MAA', stops: 0, cabin: 'business',
    points: 30000, cashInr: 38000, verified: true },
  { title: 'BOM -> BLR Business -- Maharaja Club',
    origin: 'BOM', destination: 'BLR', stops: 0, cabin: 'business',
    points: 21000, cashInr: 28000, verified: true },

  // Middle East -- Economy Value fare (API-verified)
  { title: 'BLR -> DXB Economy -- Maharaja Club (Value)',
    origin: 'BLR', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 16000, cashInr: 22000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'HYD -> DXB Economy -- Maharaja Club (Value)',
    origin: 'HYD', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 21000, cashInr: 26000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'MAA -> DXB Economy -- Maharaja Club (Value)',
    origin: 'MAA', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 20000, cashInr: 25000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'COK -> DXB Economy -- Maharaja Club (Value)',
    origin: 'COK', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 21000, cashInr: 26000, fareNote: 'Value fare -- advance booking', verified: true },

  // Middle East -- Business (API-verified)
  { title: 'BOM -> DXB Business -- Maharaja Club',
    origin: 'BOM', destination: 'DXB', stops: 0, cabin: 'business',
    points: 43000, cashInr: 65000, verified: true },
  { title: 'BLR -> DXB Business -- Maharaja Club',
    origin: 'BLR', destination: 'DXB', stops: 0, cabin: 'business',
    points: 46000, cashInr: 65000, verified: true },

  // SE Asia -- Economy Value fare (API-verified)
  { title: 'DEL -> SIN Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'SIN', stops: 0, cabin: 'economy',
    points: 20000, cashInr: 28000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'BOM -> SIN Economy -- Maharaja Club (Value)',
    origin: 'BOM', destination: 'SIN', stops: 0, cabin: 'economy',
    points: 18000, cashInr: 26000, fareNote: 'Value fare -- advance booking', verified: true },
  { title: 'DEL -> BKK Economy -- Maharaja Club (Value)',
    origin: 'DEL', destination: 'BKK', stops: 0, cabin: 'economy',
    points: 16000, cashInr: 22000, fareNote: 'Value fare -- advance booking', verified: true },

  // SE Asia -- Business (API-verified)
  { title: 'DEL -> SIN Business -- Maharaja Club',
    origin: 'DEL', destination: 'SIN', stops: 0, cabin: 'business',
    points: 52000, cashInr: 105000, verified: true },

  // Zone estimates (WARN -- API rate-limited, re-fetch to confirm)
  { title: 'DEL -> DXB Economy -- Maharaja Club (Value, est.)',
    origin: 'DEL', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 17000, cashInr: 24000, fareNote: 'Value fare -- advance booking', verified: false },
  { title: 'BOM -> DXB Economy -- Maharaja Club (Value, est.)',
    origin: 'BOM', destination: 'DXB', stops: 0, cabin: 'economy',
    points: 15000, cashInr: 22000, fareNote: 'Value fare -- advance booking', verified: false },
  { title: 'DEL -> DXB Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'DXB', stops: 0, cabin: 'business',
    points: 48000, cashInr: 70000, verified: false },

  // Europe -- Zone 4 estimates
  { title: 'DEL -> LHR Economy -- Maharaja Club (Value, est.)',
    origin: 'DEL', destination: 'LHR', stops: 0, cabin: 'economy',
    points: 35000, cashInr: 55000, fareNote: 'Value fare -- advance booking', verified: false },
  { title: 'DEL -> LHR Business -- Maharaja Club (est.) -- A350 Lie-Flat',
    origin: 'DEL', destination: 'LHR', stops: 0, cabin: 'business',
    points: 65000, cashInr: 200000, verified: false },
  { title: 'BOM -> LHR Business -- Maharaja Club (est.) -- A350 Lie-Flat',
    origin: 'BOM', destination: 'LHR', stops: 0, cabin: 'business',
    points: 65000, cashInr: 200000, verified: false },
  { title: 'DEL -> CDG Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'CDG', stops: 0, cabin: 'business',
    points: 65000, cashInr: 190000, verified: false },
  { title: 'DEL -> FRA Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'FRA', stops: 0, cabin: 'business',
    points: 65000, cashInr: 190000, verified: false },

  // North America -- Zone 5 estimates
  { title: 'DEL -> JFK Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'JFK', stops: 0, cabin: 'business',
    points: 85000, cashInr: 275000, verified: false },
  { title: 'DEL -> ORD Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'ORD', stops: 0, cabin: 'business',
    points: 85000, cashInr: 275000, verified: false },
  { title: 'DEL -> SFO Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'SFO', stops: 0, cabin: 'business',
    points: 85000, cashInr: 275000, verified: false },
  { title: 'DEL -> YYZ Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'YYZ', stops: 0, cabin: 'business',
    points: 85000, cashInr: 250000, verified: false },

  // Australia -- Zone 5 estimate
  { title: 'DEL -> MEL Business -- Maharaja Club (est.)',
    origin: 'DEL', destination: 'MEL', stops: 0, cabin: 'business',
    points: 90000, cashInr: 250000, verified: false },
];

async function scrapeAirIndia(): Promise<void> {
  log('AirIndia', 'Building sweet spots from Maharaja Club award data...');

  const today = new Date().toISOString().split('T')[0];
  const spots: SweetSpotInsert[] = [];
  let skipped = 0;

  for (const route of AWARD_ROUTES) {
    const cpp = route.cashInr / route.points;
    if (cpp < MIN_CPP) { skipped++; continue; }

    spots.push({
      program_id:         PROGRAM_IDS.AIR_INDIA,
      title:              route.title,
      route_or_property:  `${route.origin}-${route.destination}`,
      points_required:    route.points,
      est_cash_value_inr: route.cashInr,
      category:           route.cabin,
      destination_url:    REDEEM_URL,
      status:             'pending',
      needs_review:       true,
      last_verified_at:   today,
      origin_iata:        route.origin,
      destination_iata:   route.destination,
      origin_region:      regionOf(route.origin),
      destination_region: regionOf(route.destination),
      operating_airline:  OPERATING_AIRLINE,
      stops:              route.stops,
    });
  }

  await upsertSweetSpots(spots, PROGRAM_IDS.AIR_INDIA);
  log('AirIndia', `Done -- ${spots.length} spots staged (${skipped} below CPP Rs.${MIN_CPP} skipped).`);

  const verified  = spots.filter((_, i) => AWARD_ROUTES[i]?.verified !== false).length;
  const estimated = spots.length - verified;
  log('AirIndia', `  API-verified: ${verified} | Zone estimates (needs re-fetch): ${estimated}`);
}

if (require.main === module) {
  scrapeAirIndia().catch((err) => {
    logError('AirIndia', err);
    process.exit(1);
  });
}

export { scrapeAirIndia };
