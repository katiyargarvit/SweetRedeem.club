// ============================================================
// KrisFlyer Award Chart — Hardcoded Sweet Spots
//
// Rates: Singapore Airlines one-way Saver awards, effective 1 Nov 2025
// Zone 3 = Indian Subcontinent (India, Sri Lanka, Maldives, Nepal)
//
// Phase 1: Hardcoded known rates (same pattern as hyatt.ts).
// Phase 2: Parse the SIA PDF to extract all zone-to-zone rates dynamically.
//
// Sweet spot logic:
//   HDFC Infinia / Axis Atlas transfer 1:1 to KrisFlyer.
//   Axis Olympus transfers 1:4 (best Indian card ratio).
//   Business Class to Europe at ~62k miles = ₹3.2 CPP vs ₹0.50 cash.
//
// ⚠️  Verify rates before approving in Table Editor — SIA devalued Nov 2025.
// ============================================================

import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';

interface KFRoute {
  title:              string;
  route:              string;
  cabin:              SweetSpotCategory;
  miles:              number;
  est_cash_value_inr: number;
  destination_url:    string;
}

const KNOWN_SWEET_SPOTS: KFRoute[] = [
  // ─── India ↔ Singapore (Zone 3 → Zone 1) ───────────────────
  {
    title: 'India → Singapore Economy Saver',
    route: 'India–Singapore',
    cabin: 'economy', miles: 17000, est_cash_value_inr: 12000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  {
    title: 'India → Singapore Business Saver',
    route: 'India–Singapore',
    cabin: 'business', miles: 33000, est_cash_value_inr: 50000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  // ─── India ↔ Southeast Asia (Zone 3 → Zone 2) ───────────────
  {
    title: 'India → Southeast Asia Economy Saver',
    route: 'India–Southeast Asia',
    cabin: 'economy', miles: 22000, est_cash_value_inr: 18000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  {
    title: 'India → Southeast Asia Business Saver',
    route: 'India–Southeast Asia',
    cabin: 'business', miles: 42000, est_cash_value_inr: 80000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  // ─── India ↔ Europe (Zone 3 → Zone 5) ──────────────────────
  {
    title: 'India → Europe Economy Saver',
    route: 'India–Europe',
    cabin: 'economy', miles: 33500, est_cash_value_inr: 38000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  {
    title: 'India → Europe Business Class Saver',
    route: 'India–Europe',
    cabin: 'business', miles: 62000, est_cash_value_inr: 200000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  {
    title: 'India → Europe First Class Saver',
    route: 'India–Europe',
    cabin: 'first', miles: 92000, est_cash_value_inr: 450000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  // ─── India ↔ North America (Zone 3 → Zone 6) ────────────────
  {
    title: 'India → USA / Canada Economy Saver',
    route: 'India–North America',
    cabin: 'economy', miles: 47500, est_cash_value_inr: 55000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
  {
    title: 'India → USA / Canada Business Class Saver',
    route: 'India–North America',
    cabin: 'business', miles: 87500, est_cash_value_inr: 300000,
    destination_url: 'https://www.singaporeair.com/en_UK/in/home',
  },
];

async function scrapeKrisFlyer(): Promise<void> {
  log('KrisFlyer', 'Loading hardcoded award chart sweet spots...');

  const today = new Date().toISOString().split('T')[0];

  const spots: SweetSpotInsert[] = KNOWN_SWEET_SPOTS.map((r) => ({
    program_id:         PROGRAM_IDS.KRISFLYER,
    title:              r.title,
    route_or_property:  r.route,
    points_required:    r.miles,
    est_cash_value_inr: r.est_cash_value_inr,
    category:           r.cabin,
    destination_url:    r.destination_url,
    status:             'pending',
    needs_review:       false,  // Hardcoded data — review once, not every run
    last_verified_at:   today,
  }));

  await upsertSweetSpots(spots, PROGRAM_IDS.KRISFLYER);
  log('KrisFlyer', `Done — ${spots.length} spots staged for review.`);
}

if (require.main === module) {
  scrapeKrisFlyer().catch((err) => {
    logError('KrisFlyer', err);
    process.exit(1);
  });
}

export { scrapeKrisFlyer };
