// SweetRedeem.club -- Scraper Runner
//
// Usage:
//   npm run scrape              -- Run all scrapers (award charts + live prices)
//   npm run scrape:krisflyer    -- KrisFlyer only
//   npm run scrape:airindia     -- Air India Maharaja Club only
//   npm run scrape:skywards     -- Emirates Skywards only
//   npm run scrape:avios        -- British Airways Avios + JAL (via Finnair) only
//   npm run scrape:etihad       -- Etihad Guest only
//   npm run scrape:aeroplan     -- Aeroplan (Star Alliance partner chart) only
//   npm run scrape:turkish      -- Turkish Airlines Miles&Smiles only
//   npm run scrape:ihg          -- IHG One Rewards (Six Senses / IC resorts) only
//   npm run scrape:flyingblue   -- Flying Blue only (opens Chrome window)
//   npm run scrape:hyatt        -- Hyatt only
//   npm run scrape:hilton       -- Hilton Honors only
//   npm run scrape:itchotels    -- ITC Hotels (Club ITC) only
//   npm run scrape:marriott     -- Marriott Bonvoy award chart only
//   npm run scrape:accor        -- Accor ALL only
//   npm run scrape:lfal         -- LFAL RSS only
//
// -- Phase 5 -- Live price scrapers --
//   npm run scrape:liveprices   -- Flight live prices via SerpAPI (weekly; needs SERPAPI_KEY)
//   npm run scrape:airlive      -- alias for scrape:liveprices
//   npm run scrape:marriottlive -- Marriott live room rates (Mon + Thu)
//
// After award chart run: open /admin -> Pending Spots -> approve / go-live
// After live price run:  live_prices table updated; "Live CPP" badge appears on Discover

import { scrapeFlyingBlue }    from './scrapers/flyingblue';
import { scrapeKrisFlyer }     from './scrapers/krisflyer';
import { scrapeHyatt }         from './scrapers/hyatt';
import { scrapeLfal }          from './scrapers/lfal';
import { scrapeAirIndia }      from './scrapers/airindia';
import { scrapeMarriott }      from './scrapers/marriott';
import { scrapeAccor }         from './scrapers/accor';
import { scrapeEmirates }      from './scrapers/skywards';
import { scrapeAvios }         from './scrapers/avios';
import { scrapeEtihad }        from './scrapers/etihad';
import { scrapeAeroplan }      from './scrapers/aeroplan';
import { scrapeTurkish }       from './scrapers/turkish';
import { scrapeIHG }           from './scrapers/ihg';
import { scrapeHiltonHonors }  from './scrapers/hilton';
import { scrapeITCHotels }     from './scrapers/itchotels';
// Phase 5 -- live price scrapers
import { scrapeAirIndiaLive }  from './scrapers/air-india-live';
import { scrapeMarriottLive }  from './scrapers/marriott-live';
import { supabase }            from './lib/supabase';

const SCRAPERS: Array<{ name: string; fn: () => Promise<void>; note?: string }> = [
  // -- Award chart scrapers (run when charts update -- monthly/quarterly) --
  { name: 'KrisFlyer',              fn: scrapeKrisFlyer },
  { name: 'Air India',              fn: scrapeAirIndia },
  { name: 'Emirates Skywards',      fn: scrapeEmirates },
  { name: 'Avios (BA/QR/JAL)',      fn: scrapeAvios },
  { name: 'Etihad Guest',           fn: scrapeEtihad },
  { name: 'Aeroplan',               fn: scrapeAeroplan },
  { name: 'Turkish M&S',            fn: scrapeTurkish },
  { name: 'IHG One Rewards',        fn: scrapeIHG },
  { name: 'Flying Blue',            fn: scrapeFlyingBlue },
  { name: 'Hyatt',                  fn: scrapeHyatt },
  { name: 'Hilton Honors',          fn: scrapeHiltonHonors },
  { name: 'ITC Hotels',             fn: scrapeITCHotels },
  { name: 'Marriott',               fn: scrapeMarriott },
  { name: 'Accor ALL',              fn: scrapeAccor },
  { name: 'LFAL RSS',               fn: scrapeLfal },
  // -- Live price scrapers (Phase 5 -- run daily / twice weekly via cron) --
  // Included here so a full `npm run scrape` keeps live prices fresh too.
  // These open a visible Chrome window -- expected behaviour (not a bug).
  { name: 'Air India Live Prices',  fn: scrapeAirIndiaLive,  note: 'weekly — SerpAPI Google Flights' },
  { name: 'Marriott Live Rates',    fn: scrapeMarriottLive,  note: 'mon+thu' },
];

// -- Scraper run logger ----------------------------------------

async function logRun(
  runId: string,
  scraperName: string,
  startedAt: string,
  status: 'success' | 'partial' | 'failed',
  durationMs: number,
  errorMessage?: string,
): Promise<void> {
  try {
    await supabase
      .from('scraper_runs')
      .update({
        status,
        duration_ms: durationMs,
        error_message: errorMessage ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
  } catch (e) {
    // Don't let logging failures break the runner
    console.warn(`  [warn] Failed to update scraper_run ${runId}:`, e);
  }
}

async function startRun(scraperName: string): Promise<{ runId: string; startedAt: string } | null> {
  try {
    const { data, error } = await supabase
      .from('scraper_runs')
      .insert({
        scraper_name: scraperName,
        status: 'partial',  // optimistic -- updated to success/failed on completion
        spots_found: 0,
        spots_upserted: 0,
      })
      .select('id, started_at')
      .single();

    if (error || !data) {
      console.warn(`  [warn] Failed to create scraper_run for ${scraperName}:`, error?.message);
      return null;
    }
    return { runId: data.id as string, startedAt: data.started_at as string };
  } catch (e) {
    console.warn(`  [warn] scraper_runs insert failed:`, e);
    return null;
  }
}

// -- Runner ---------------------------------------------------

async function runAll(): Promise<void> {
  console.log('');
  console.log('===========================================');
  console.log('  SweetRedeem Scraper -- starting all jobs');
  console.log('  ' + new Date().toLocaleString());
  console.log('===========================================');
  console.log('');

  const results: Array<{ name: string; status: 'ok' | 'error'; error?: string }> = [];

  for (const scraper of SCRAPERS) {
    console.log('> Running: ' + scraper.name);
    const t0 = Date.now();

    // Insert a scraper_run row at start
    const run = await startRun(scraper.name);

    try {
      await scraper.fn();
      const durationMs = Date.now() - t0;

      // Update run to success
      if (run) await logRun(run.runId, scraper.name, run.startedAt, 'success', durationMs);

      results.push({ name: scraper.name, status: 'ok' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const durationMs = Date.now() - t0;

      console.error('  x ' + scraper.name + ' failed: ' + msg);

      // Update run to failed
      if (run) await logRun(run.runId, scraper.name, run.startedAt, 'failed', durationMs, msg);

      results.push({ name: scraper.name, status: 'error', error: msg });
    }
    console.log('');
  }

  console.log('===========================================');
  console.log('  Summary');
  console.log('===========================================');
  for (const r of results) {
    const icon = r.status === 'ok' ? '[OK]' : '[FAIL]';
    console.log('  ' + icon + ' ' + r.name + (r.error ? ' -- ' + r.error : ''));
  }
  console.log('');
  console.log('Next step: /admin -> Pending Spots -> approve / go-live');
  console.log('');
}

runAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
