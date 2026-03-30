// ============================================================
// SweetRedeem.club — Scraper Runner
//
// Usage:
//   npm run scrape              → Run all scrapers
//   npm run scrape:flyingblue   → Flying Blue only
//   npm run scrape:krisflyer    → KrisFlyer only
//   npm run scrape:hyatt        → Hyatt only
//   npm run scrape:lfal         → LFAL RSS only
//   npm run scrape:airindia     → Air India Maharaja Club only
//   npm run scrape:marriott     → Marriott Bonvoy only
//   npm run scrape:accor        → Accor ALL only
//
// After running, open Supabase Table Editor → sweet_spots
// Filter by status = 'pending' and approve deals you want live.
// Change status to 'live' to publish to the app.
// ============================================================

import { scrapeFlyingBlue } from './scrapers/flyingblue';
import { scrapeKrisFlyer }  from './scrapers/krisflyer';
import { scrapeHyatt }      from './scrapers/hyatt';
import { scrapeLfal }       from './scrapers/lfal';
import { scrapeAirIndia }   from './scrapers/airindia';
import { scrapeMarriott }   from './scrapers/marriott';
import { scrapeAccor }      from './scrapers/accor';

const SCRAPERS: Array<{ name: string; fn: () => Promise<void> }> = [
  { name: 'KrisFlyer',    fn: scrapeKrisFlyer },
  { name: 'Air India',    fn: scrapeAirIndia },
  { name: 'Flying Blue',  fn: scrapeFlyingBlue },
  { name: 'Hyatt',        fn: scrapeHyatt },
  { name: 'Marriott',     fn: scrapeMarriott },
  { name: 'Accor ALL',    fn: scrapeAccor },
  { name: 'LFAL RSS',     fn: scrapeLfal },
];

async function runAll(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  SweetRedeem Scraper — starting all jobs  ');
  console.log(`  ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════');
  console.log('');

  const results: Array<{ name: string; status: 'ok' | 'error'; error?: string }> = [];

  for (const scraper of SCRAPERS) {
    console.log(`▶ Running: ${scraper.name}`);
    try {
      await scraper.fn();
      results.push({ name: scraper.name, status: 'ok' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${scraper.name} failed: ${msg}`);
      results.push({ name: scraper.name, status: 'error', error: msg });
    }
    console.log('');
  }

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════');
  for (const r of results) {
    const icon = r.status === 'ok' ? '✅' : '❌';
    console.log(`  ${icon} ${r.name}${r.error ? ` — ${r.error}` : ''}`);
  }
  console.log('');
  console.log('Next step → Supabase Table Editor → filter status=pending → approve deals');
  console.log('');
}

runAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
