// ============================================================
// KrisFlyer Award Chart -- Hardcoded Sweet Spots
//
// Rates: Singapore Airlines one-way Saver awards, effective 1 Nov 2025
// Source PDF: singaporeair.com → KrisFlyer → Award Charts →
//   "SingaporeAirlinesOne-WayAdvantageSaverAwardChartupdated1Nov25.pdf"
//
// ⚠️  IMPORTANT — Dynamic pricing caveat:
//   SIA introduced dynamic award pricing in Nov 2025.
//   The numbers below are the MINIMUM Saver-bucket rates from the
//   published chart.  What users see on singaporeair.com is usually
//   the dynamic/Advantage price (1.5–3× higher) because Saver-level
//   seats are scarce.  Always verify actual availability on-site before
//   approving a spot — the hardcoded miles may be the floor, not reality.
//
// Zone 3 = Indian Subcontinent
//
// Route expansion:
//   Specific city pairs instead of zone labels so Discover feed
//   shows "DEL -> LHR" rather than "India -> Europe".
//   Points cost is the same for all Indian origins (same zone).
//
//   India -> SIN (Zone 1): nonstop from DEL/BOM/BLR/MAA/CCU/HYD
//   India -> SE Asia excl SIN (Zone 2): 1-stop via SIN
//   India -> Europe (Zone 11): 1-stop via SIN (+5% vs pre-Nov 2025)
//   India -> North America (Zone 12): 1-stop via SIN (+5% vs pre-Nov 2025)
//
// Last manually verified against published PDF: May 2026
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';

const OPERATING_AIRLINE = 'Singapore Airlines';
const REDEEM_URL        = 'https://www.singaporeair.com/en_UK/in/home';
const MIN_CPP           = 1.20;

interface KFRoute {
  origin:             string;
  destination:        string;
  origin_region:      string;
  destination_region: string;
  cabin:              SweetSpotCategory;
  miles:              number;
  est_cash_value_inr: number;
  stops:              number;
}

// Cash value estimates (one-way INR) -- all verified to clear CPP >= 1.20
const CASH_INR: Record<string, Partial<Record<SweetSpotCategory, number>>> = {
  SIN:  { economy: 22000,  business: 55000 },
  BKK:  { economy: 28000,  business: 60000 },
  KUL:  { economy: 28000,  business: 60000 },
  LHR:  { economy: 50000,  business: 200000, first: 450000 },
  CDG:  { economy: 45000,  business: 180000, first: 400000 },
  FRA:  { economy: 45000,  business: 180000, first: 400000 },
  AMS:  { economy: 45000,  business: 180000, first: 400000 },
  FCO:  { economy: 45000,  business: 175000 },
  JFK:  { economy: 65000,  business: 300000 },
  ORD:  { economy: 60000,  business: 290000 },
  SFO:  { economy: 65000,  business: 300000 },
  LAX:  { economy: 65000,  business: 300000 },
  YYZ:  { economy: 60000,  business: 275000 },
};

const INDIA_SIN_ORIGINS    = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD'];
const INDIA_EUROPE_ORIGINS = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU'];
const INDIA_EUROPE_DESTS   = ['LHR', 'CDG', 'FRA', 'AMS', 'FCO'];

const INDIA_SEASIA_PAIRS: [string, string][] = [
  ['DEL', 'BKK'], ['DEL', 'KUL'],
  ['BOM', 'BKK'], ['BOM', 'KUL'],
  ['BLR', 'BKK'],
];

const INDIA_NORTHAM_PAIRS: [string, string][] = [
  ['DEL', 'JFK'], ['DEL', 'ORD'], ['DEL', 'SFO'], ['DEL', 'LAX'], ['DEL', 'YYZ'],
  ['BOM', 'JFK'], ['BOM', 'SFO'], ['BOM', 'YYZ'],
];

const ROUTES: KFRoute[] = [];

// India -> Singapore (nonstop)
for (const origin of INDIA_SIN_ORIGINS) {
  ROUTES.push(
    { origin, destination: 'SIN', origin_region: 'India',
      destination_region: 'Southeast Asia', cabin: 'economy',
      miles: 17000, est_cash_value_inr: CASH_INR['SIN'].economy!, stops: 0 },
    { origin, destination: 'SIN', origin_region: 'India',
      destination_region: 'Southeast Asia', cabin: 'business',
      miles: 33000, est_cash_value_inr: CASH_INR['SIN'].business!, stops: 0 },
  );
}

// India -> SE Asia (1-stop via SIN)
for (const [origin, dest] of INDIA_SEASIA_PAIRS) {
  ROUTES.push(
    { origin, destination: dest, origin_region: 'India',
      destination_region: 'Southeast Asia', cabin: 'economy',
      miles: 22000, est_cash_value_inr: CASH_INR[dest]?.economy ?? 16000, stops: 1 },
    { origin, destination: dest, origin_region: 'India',
      destination_region: 'Southeast Asia', cabin: 'business',
      miles: 42000, est_cash_value_inr: CASH_INR[dest]?.business ?? 55000, stops: 1 },
  );
}

// India -> Europe (1-stop via SIN)
for (const origin of INDIA_EUROPE_ORIGINS) {
  for (const dest of INDIA_EUROPE_DESTS) {
    ROUTES.push(
      { origin, destination: dest, origin_region: 'India',
        destination_region: 'Europe', cabin: 'economy',
        miles: 33500, est_cash_value_inr: CASH_INR[dest]?.economy ?? 40000, stops: 1 },
      { origin, destination: dest, origin_region: 'India',
        destination_region: 'Europe', cabin: 'business',
        miles: 62000, est_cash_value_inr: CASH_INR[dest]?.business ?? 180000, stops: 1 },
    );
  }
}

// First Class: DEL/BOM -> LHR/CDG/FRA only
for (const origin of ['DEL', 'BOM']) {
  for (const dest of ['LHR', 'CDG', 'FRA']) {
    ROUTES.push(
      { origin, destination: dest, origin_region: 'India',
        destination_region: 'Europe', cabin: 'first',
        miles: 92000, est_cash_value_inr: CASH_INR[dest]?.first ?? 450000, stops: 1 },
    );
  }
}

// India -> North America (1-stop via SIN)
for (const [origin, dest] of INDIA_NORTHAM_PAIRS) {
  ROUTES.push(
    { origin, destination: dest, origin_region: 'India',
      destination_region: 'North America', cabin: 'economy',
      miles: 47500, est_cash_value_inr: CASH_INR[dest]?.economy ?? 55000, stops: 1 },
    { origin, destination: dest, origin_region: 'India',
      destination_region: 'North America', cabin: 'business',
      miles: 87500, est_cash_value_inr: CASH_INR[dest]?.business ?? 300000, stops: 1 },
  );
}

async function scrapeKrisFlyer(): Promise<void> {
  log('KrisFlyer', 'Loading hardcoded award chart sweet spots...');

  const today = new Date().toISOString().split('T')[0];
  let skipped = 0;

  const spots: SweetSpotInsert[] = ROUTES.flatMap((r) => {
    const cpp = r.est_cash_value_inr / r.miles;
    if (cpp < MIN_CPP) { skipped++; return []; }

    const cabinLabel = r.cabin === 'first' ? 'First'
      : r.cabin === 'business' ? 'Business' : 'Economy';
    const stopLabel  = r.stops === 0 ? 'Nonstop' : `${r.stops}-Stop via SIN`;

    return [{
      program_id:         PROGRAM_IDS.KRISFLYER,
      title:              `${r.origin} -> ${r.destination} ${cabinLabel} Saver (${stopLabel})`,
      route_or_property:  `${r.origin}-${r.destination} on Singapore Airlines`,
      points_required:    r.miles,
      est_cash_value_inr: r.est_cash_value_inr,
      category:           r.cabin,
      destination_url:    REDEEM_URL,
      status:             'pending' as const,
      needs_review:       true,  // verify Saver availability on-site before approving
      last_verified_at:   today,
      origin_iata:        r.origin,
      destination_iata:   r.destination,
      origin_region:      r.origin_region,
      destination_region: r.destination_region,
      operating_airline:  OPERATING_AIRLINE,
      stops:              r.stops,
    }];
  });

  await upsertSweetSpots(spots, PROGRAM_IDS.KRISFLYER);
  log('KrisFlyer', `Done -- ${spots.length} spots staged (${skipped} below CPP Rs.${MIN_CPP} skipped).`);
}

if (require.main === module) {
  scrapeKrisFlyer().catch((err) => {
    logError('KrisFlyer', err);
    process.exit(1);
  });
}

export { scrapeKrisFlyer };
