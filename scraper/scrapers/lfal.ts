// ============================================================
// Loyalty Frequent Flyer (LFAL) RSS Alert Scraper
//
// Source: https://loyaltyfrequentflyer.com/feed/
// Runs:   Weekly — publishes transfer bonus alerts and award deals
//
// All LFAL spots are staged with needs_review=true so they never
// go live without manual verification in Supabase Table Editor.
// ============================================================

import { XMLParser } from 'fast-xml-parser';
import {
  upsertSweetSpots, log, logError,
  SweetSpotInsert, PROGRAM_IDS,
} from '../lib/utils';

const FEED_URL = 'https://loyaltyfrequentflyer.com/feed/';

const RELEVANT_KEYWORDS = [
  'krisflyer', 'singapore airlines',
  'flying blue', 'air france', 'klm',
  'marriott', 'bonvoy',
  'hyatt', 'world of hyatt',
  'british airways', 'avios',
  'etihad', 'etihad guest',
  'aeroplan', 'air canada',
  'transfer bonus', 'bonus miles', 'bonus points',
  'flash sale', 'promo reward', 'award sale',
];

const EXCLUDE_KEYWORDS = [
  'credit card application', 'welcome bonus', 'sign-up bonus',
  'referral', 'annual fee',
];

const PROGRAM_KEYWORD_MAP: Array<{ kw: string; id: string }> = [
  { kw: 'krisflyer',       id: PROGRAM_IDS.KRISFLYER },
  { kw: 'singapore airlines', id: PROGRAM_IDS.KRISFLYER },
  { kw: 'flying blue',     id: PROGRAM_IDS.FLYING_BLUE },
  { kw: 'air france',      id: PROGRAM_IDS.FLYING_BLUE },
  { kw: 'klm',             id: PROGRAM_IDS.FLYING_BLUE },
  { kw: 'marriott',        id: PROGRAM_IDS.MARRIOTT },
  { kw: 'bonvoy',          id: PROGRAM_IDS.MARRIOTT },
  { kw: 'hyatt',           id: PROGRAM_IDS.HYATT },
  { kw: 'avios',           id: PROGRAM_IDS.AVIOS },
  { kw: 'british airways', id: PROGRAM_IDS.AVIOS },
  { kw: 'etihad',          id: PROGRAM_IDS.ETIHAD },
  { kw: 'aeroplan',        id: PROGRAM_IDS.AEROPLAN },
];

// ── Fetch RSS ─────────────────────────────────────────────────
// LFAL blocks all server-side fetches at the TLS/Cloudflare layer.
// Proxy fallbacks (rss2json, allorigins) also return 500/522.
// Single direct attempt — fail fast and skip gracefully.

async function fetchDirect(): Promise<string> {
  const res = await fetch(FEED_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept':     'application/rss+xml, application/xml, text/xml',
    },
  });
  if (!res.ok) throw new Error(`Direct RSS fetch failed: HTTP ${res.status}`);
  return res.text();
}

// ── Parse RSS ─────────────────────────────────────────────────

interface RssItem {
  title:       string;
  link:        string;
  description: string;
  pubDate:     string;
}

function parseRss(xml: string): RssItem[] {
  const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata' });
  const parsed = parser.parse(xml);
  const items  = parsed?.rss?.channel?.item ?? [];
  const arr    = Array.isArray(items) ? items : [items];

  return arr.map((item: Record<string, unknown>) => {
    const extract = (val: unknown): string => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object') {
        const o = val as Record<string, unknown>;
        if (o.__cdata) return String(o.__cdata);
        if (o['#text']) return String(o['#text']);
      }
      return '';
    };
    return {
      title:       extract(item.title),
      link:        extract(item.link),
      description: extract(item.description),
      pubDate:     extract(item.pubDate),
    };
  });
}

// ── Relevance + program detection ────────────────────────────

function isRelevant(item: RssItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (EXCLUDE_KEYWORDS.some((kw) => text.includes(kw))) return false;
  return RELEVANT_KEYWORDS.some((kw) => text.includes(kw));
}

function detectProgramId(text: string): string {
  const lower = text.toLowerCase();
  for (const { kw, id } of PROGRAM_KEYWORD_MAP) {
    if (lower.includes(kw)) return id;
  }
  return PROGRAM_IDS.FLYING_BLUE;
}

function estimateCashValue(item: RssItem): number {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const bonusMatch = text.match(/(\d+)%\s*(transfer\s*)?bonus/);
  if (bonusMatch) {
    return Math.round(35000 * (1 + parseInt(bonusMatch[1], 10) / 100));
  }
  if (text.includes('flash sale') || text.includes('award sale')) return 40000;
  return 30000;
}

function estimatePoints(item: RssItem): number {
  const text = `${item.title} ${item.description}`;
  const match = text.match(/(\d[\d,]+)\s*(miles?|points?|km)/i);
  if (match) return parseInt(match[1].replace(/,/g, ''), 10);
  return 25000;
}

// ── Main ──────────────────────────────────────────────────────

async function scrapeLfal(): Promise<void> {
  log('LFAL', 'Fetching RSS feed...');

  let items: RssItem[];
  try {
    const xml = await fetchDirect();
    items = parseRss(xml);
    log('LFAL', `Fetch OK — ${items.length} items`);
  } catch (e) {
    // LFAL blocks all server-side requests at Cloudflare level — skip gracefully.
    log('LFAL', `Fetch blocked (${e instanceof Error ? e.message : e}). Skipping — nice-to-have source.`);
    return;
  }

  const relevant = items.filter(isRelevant);
  log('LFAL', `${relevant.length} items match India-relevant keywords`);

  if (relevant.length === 0) {
    log('LFAL', 'No relevant items — nothing to stage.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const byProgram = new Map<string, SweetSpotInsert[]>();

  for (const item of relevant) {
    const programId = detectProgramId(`${item.title} ${item.description}`);
    const spot: SweetSpotInsert = {
      program_id:         programId,
      title:              item.title.substring(0, 200),
      route_or_property:  'Alert — see source URL',
      points_required:    estimatePoints(item),
      est_cash_value_inr: estimateCashValue(item),
      category:           'economy',
      destination_url:    item.link,
      status:             'pending',
      needs_review:       true,   // Always flag LFAL alerts for manual review
      last_verified_at:   today,
    };
    if (!byProgram.has(programId)) byProgram.set(programId, []);
    byProgram.get(programId)!.push(spot);
  }

  for (const [programId, spots] of byProgram.entries()) {
    await upsertSweetSpots(spots, programId);
  }

  log('LFAL', `Done — ${relevant.length} alerts staged across ${byProgram.size} programs.`);
}

if (require.main === module) {
  scrapeLfal().catch((err) => {
    logError('LFAL', err);
    process.exit(1);
  });
}

export { scrapeLfal };
