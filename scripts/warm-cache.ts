/**
 * Post-deploy cache warming script.
 * Hits all major URLs to populate the ISR cache + CDN edge cache
 * so the first real visitor gets a fast response, not a cold start.
 *
 * Usage:  npx tsx scripts/warm-cache.ts
 * Env:    BASE_URL defaults to https://activesports.live
 *
 * Also pings Google to notify about sitemap updates.
 */

import 'dotenv/config';

const BASE_URL = process.env.BASE_URL || 'https://activesports.live';
const CONCURRENCY = 10;

const staticPaths = [
  '/', '/leagues', '/world-cup', '/odds',
  '/leaderboard', '/search', '/favorites', '/world-cup/venues',
  '/teams', '/players',
];

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

function leagueSlug(id: number): string {
  const map: Record<number, string> = {
    2: 'champions-league', 3: 'europa-league', 39: 'premier-league',
    61: 'ligue-1', 78: 'bundesliga', 135: 'serie-a', 140: 'la-liga', 1: 'world-cup',
  };
  return map[id] || String(id);
}
const alphabetUrls = [
  ...letters.map(l => `/teams/${l}`),
  ...letters.map(l => `/players/${l}`),
];

const API_KEY = process.env.FOOTBALL_API_KEY;
const HEADERS: Record<string, string> = {};
if (API_KEY) HEADERS['x-apisports-key'] = API_KEY;

async function warm(urls: string[]): Promise<{ ok: number; fail: number }> {
  let ok = 0;
  let fail = 0;

  const run = async (url: string) => {
    try {
      const res = await fetch(`${BASE_URL}${url}`, { headers: HEADERS });
      if (res.ok) ok++;
      else fail++;
      if (ok % 30 === 0) console.log(`[Warm] ${ok} ok, ${fail} fail (${url})`);
    } catch {
      fail++;
    }
  };

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    await Promise.all(urls.slice(i, i + CONCURRENCY).map(run));
  }

  return { ok, fail };
}

async function pingGoogle() {
  try {
    const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(BASE_URL + '/sitemap.xml')}`;
    await fetch(url);
    console.log('[Warm] Google sitemap ping sent');
  } catch {
    console.warn('[Warm] Google sitemap ping failed');
  }
}

async function main() {
  console.log(`[Warm] Warming cache at ${BASE_URL}...`);

  const allUrls = [
    ...staticPaths,
    ...[2, 3, 39, 61, 78, 135, 140, 1].map(id => `/league/${leagueSlug(id)}`),
    ...alphabetUrls,
  ];

  console.log(`[Warm] ${allUrls.length} URLs to warm`);

  const { ok, fail } = await warm(allUrls);
  console.log(`[Warm] Complete — ${ok} ok, ${fail} fail`);

  await pingGoogle();
}

main().catch((err) => {
  console.error('[Warm] Failed:', err);
  process.exit(1);
});
