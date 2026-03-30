// ============================================================
// Flying Blue Promo Rewards Scraper
//
// Source: https://www.flyingblue.com/en/spend/flights/rewards
//         (promo-rewards URL redirects here — same page)
// Runs: Monthly (1st of each month — new promos released)
// Method: Playwright via channel:'chrome' (system Chrome binary)
//
// Why channel:'chrome' instead of bundled Chromium:
//   Flying Blue uses Akamai Bot Manager which detects Playwright's
//   bundled Chromium via TLS fingerprint and drops the connection.
//   The user's installed Chrome has a real TLS fingerprint that
//   Akamai does not block. headless:false keeps the window visible
//   (acceptable for a monthly manual run) and further reduces detection.
//
// Data is in the Angular DOM — no separate JSON API exists.
// DOM selectors confirmed working: March 2026.
//
// Flying Blue transfers 1:1 from HDFC Infinia, Axis Atlas (1:2),
// Axis Olympus (1:4). Economy promos at 7,500 miles ≈ ₹2 CPP.
//
// All spots staged with needs_review=true — verify before going live.
// ============================================================

import { chromium } from 'playwright';
import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, SweetSpotCategory, PROGRAM_IDS,
} from '../lib/utils';

const PAGE_URL = 'https://www.flyingblue.com/en/spend/flights/rewards';

// Estimated one-way cash value used to compute CPP for display.
// Short-haul economy ≈ ₹15k, long-haul economy ≈ ₹35k, business ≈ ₹80k.
// These are rough — all spots are marked needs_review so Garvit verifies.
const CASH_VALUE_INR: Record<string, number> = {
  'economy':  20000,  // blended short/long haul average
  'business': 80000,
  'first':   150000,
};

// Flying Blue cabin labels (innerText) → our DB category enum
const CABIN_MAP: Record<string, SweetSpotCategory> = {
  'economy':  'economy',
  'business': 'business',
  'first':    'first',
  'premium':  'economy',  // Premium Economy → maps to economy tier
};

interface PromoCard {
  origin:      string;
  destination: string;
  miles:       number;
  cabin:       string; // raw label from DOM e.g. "Economy", "Business", "Premium"
}

// ── DOM extraction (verified live March 2026) ─────────────────
// Cards use `.group.w-full.h-full.rounded` — 44 cards on the page.
// innerText gives clean multi-line text; we parse origin, destination,
// miles and cabin from the text lines.

async function extractFromDom(page: import('playwright').Page): Promise<PromoCard[]> {
  // Scroll to bottom so any lazy-loaded cards render, then back to top
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  return page.evaluate((): PromoCard[] => {
    const cards  = document.querySelectorAll('.group.w-full.h-full.rounded');
    const NOISE  = new Set([
      '-25 %', '-30 %', '-50 %', 'extra', 'Exclusive',
      'Starting from :', 'Business', 'Economy', 'First', 'Premium',
      'KLM', 'Air France', '', 'Promo', 'One-way',
    ]);
    const results: PromoCard[] = [];

    cards.forEach((card) => {
      const lines = (card as HTMLElement).innerText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      // Miles line: "Starting from : 18,750 Miles (Business)"
      const milesLine  = lines.find((l) => l.includes('Miles'));
      const milesMatch = milesLine?.match(/([\d,]+)\s*Miles.*\((\w+)\)/i);
      if (!milesMatch) return;

      const miles = parseInt(milesMatch[1].replace(',', ''), 10);
      const cabin = milesMatch[2]; // raw: "Economy" | "Business" | "First" | "Premium"

      // Guard: parseInt can return NaN if the regex matched something unexpected
      if (isNaN(miles) || miles <= 0) return;

      // City names: filter out noise labels, keep capitalised short strings
      const cityLines = lines.filter(
        (l) =>
          !NOISE.has(l) &&
          !l.includes('Miles') &&
          !l.includes('%') &&
          !l.includes('Exclusive') &&
          !l.includes('extra') &&
          !l.includes('One-way') &&
          l.length > 1 &&
          l.length < 50 &&
          /^[A-Z]/.test(l),
      );

      if (cityLines.length < 2) return;

      // Strip DOM control characters and normalise whitespace.
      // Keeps valid chars: letters, digits, spaces, hyphens, commas, parens, slashes.
      const cleanCity = (s: string): string =>
        s
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // control chars
          .replace(/\s+/g, ' ')                          // collapse whitespace
          .trim();

      const origin      = cleanCity(cityLines[0]);
      const destination = cleanCity(cityLines[1]);

      // Skip clearly malformed entries
      if (!origin || !destination) return;
      if (origin === destination) return;
      if (origin === 'One-way' || destination === 'One-way') return;

      results.push({ origin, destination, miles, cabin });
    });

    return results;
  });
}

// ── Main ─────────────────────────────────────────────────────

async function scrapeFlyingBlue(): Promise<void> {
  log('FlyingBlue', 'Launching Chrome (system install) — a window will briefly appear...');

  // channel:'chrome' uses the system Chrome binary, not Playwright's Chromium.
  // This gives us a real TLS fingerprint that Akamai's bot detection accepts.
  const browser = await chromium.launch({
    channel:  'chrome',
    headless: false,  // visible window — real fingerprint, much lower bot score
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale:   'en-US',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });
  const page = await context.newPage();

  try {
    log('FlyingBlue', `Loading ${PAGE_URL}`);
    try {
      await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    } catch (e) {
      log('FlyingBlue', `page.goto failed (${e instanceof Error ? e.message : e}) — skipping.`);
      return;
    }

    // Dismiss cookie banner if it appears
    const cookieBtn = page.locator('button:has-text("Reject"), button:has-text("Disagree")');
    try {
      await cookieBtn.first().waitFor({ timeout: 6_000 });
      await cookieBtn.first().click();
      log('FlyingBlue', 'Cookie banner dismissed');
    } catch { /* banner may not appear every run */ }

    // Wait for Angular to render the first promo card
    log('FlyingBlue', 'Waiting for promo cards...');
    const cardSelector = '.group.w-full.h-full.rounded';
    try {
      await page.waitForSelector(cardSelector, { timeout: 30_000 });
    } catch {
      const title = await page.title().catch(() => 'unknown');
      log('FlyingBlue', `Cards not found (page: "${title}") — skipping.`);
      return;
    }

    log('FlyingBlue', 'Cards detected — extracting...');
    const rawCards = await extractFromDom(page);
    log('FlyingBlue', `Extracted ${rawCards.length} cards from DOM`);

    const now       = new Date();
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today     = now.toISOString().split('T')[0];

    // Final clean pass on strings coming out of page.evaluate —
    // ensures no stray whitespace survives into the DB.
    const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

    const spots: SweetSpotInsert[] = rawCards
      .filter((c) => c.origin && c.destination && c.miles > 0 && !isNaN(c.miles))
      .map((c) => {
        const origin      = clean(c.origin);
        const destination = clean(c.destination);
        const cabinKey    = CABIN_MAP[c.cabin.toLowerCase()] ?? 'economy';
        const cashValue   = CASH_VALUE_INR[cabinKey] ?? 20000;

        return {
          program_id:         PROGRAM_IDS.FLYING_BLUE,
          title:              `${origin} → ${destination} ${c.cabin} Promo — ${monthYear}`,
          route_or_property:  `${origin}–${destination}`,
          points_required:    c.miles,
          est_cash_value_inr: cashValue,
          category:           cabinKey,
          destination_url:    PAGE_URL,
          status:             'pending',
          needs_review:       true,
          last_verified_at:   today,
        };
      });

    await upsertSweetSpots(spots, PROGRAM_IDS.FLYING_BLUE);
    log('FlyingBlue', `Done — ${spots.length} spots staged for review.`);

  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  scrapeFlyingBlue().catch((err) => {
    logError('FlyingBlue', err);
    process.exit(1);
  });
}

export { scrapeFlyingBlue };
