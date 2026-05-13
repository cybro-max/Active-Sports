import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { toSlug } from '../lib/slug';

const prisma = new PrismaClient();
const BASE_URL = 'https://activesports.live';
const DAILY_QUOTA = 180; 

async function advancedPing() {
  console.log('🛡️ Starting Advanced Google Indexing Discovery...');

  // 1. Auth Setup
  let authClient: any;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const keys = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      authClient = new google.auth.JWT({
        email: keys.client_email,
        key: keys.private_key,
        scopes: ['https://www.googleapis.com/auth/indexing']
      });
    } catch (e: any) {
      console.error('❌ Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
      process.exit(1);
    }
  } else {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON not found in environment.');
    process.exit(1);
  }

  const indexing = google.indexing('v3');
  let pingCount = 0;

  async function sendPing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
    if (pingCount >= DAILY_QUOTA) return false;
    try {
      await indexing.urlNotifications.publish({
        auth: authClient,
        requestBody: { url, type },
      });
      pingCount++;
      return true;
    } catch (err: any) {
      console.error(`  ❌ Failed to ping ${url}: ${err.message}`);
      return false;
    }
  }

  // 2. Discover URLs to Ping
  const targets: { url: string; model?: string; id?: number }[] = [];

  // A. Static High-Priority Pages
  const statics = ['', '/fixtures', '/leagues', '/teams', '/players', '/world-cup', '/stats/leaders'];
  statics.forEach(s => targets.push({ url: `${BASE_URL}${s}` }));

  // B. Modified Leagues
  try {
    const leagues = await (prisma.league as any).findMany({
      where: {
        OR: [
          { lastPingedAt: null },
          { updatedAt: { gt: (prisma.league as any).fields?.lastPingedAt || new Date(0) } }
        ]
      },
      take: 50,
    });
    leagues.forEach((l: any) => targets.push({ url: `${BASE_URL}/league/${toSlug(l.name)}`, model: 'league', id: l.id }));
  } catch (e) {
    console.warn('⚠️ Could not fetch leagues for indexing (types might be stale).');
  }

  // C. Modified Teams
  try {
    const teams = await (prisma.team as any).findMany({
      where: {
        OR: [
          { lastPingedAt: null },
          { updatedAt: { gt: (prisma.team as any).fields?.lastPingedAt || new Date(0) } }
        ]
      },
      take: 100,
    });
    teams.forEach((t: any) => targets.push({ url: `${BASE_URL}/team/${toSlug(t.name)}`, model: 'team', id: t.id }));
  } catch (e) {
    console.warn('⚠️ Could not fetch teams for indexing.');
  }

  // D. Modified Players
  try {
    const players = await (prisma.player as any).findMany({
      where: {
        OR: [
          { lastPingedAt: null },
          { updatedAt: { gt: (prisma.player as any).fields?.lastPingedAt || new Date(0) } }
        ]
      },
      take: 200,
    });
    players.forEach((p: any) => targets.push({ url: `${BASE_URL}/player/${toSlug(p.name)}`, model: 'player', id: p.id }));
  } catch (e) {
    console.warn('⚠️ Could not fetch players for indexing.');
  }

  console.log(`🔎 Found ${targets.length} potential targets. Quota: ${DAILY_QUOTA}`);

  // 3. Execute Pings
  for (const target of targets) {
    if (pingCount >= DAILY_QUOTA) {
      console.log('⚠️ Quota reached for today.');
      break;
    }

    const success = await sendPing(target.url);
    if (success && target.model && target.id) {
      const now = new Date();
      try {
        if (target.model === 'league') {
          await (prisma.league as any).update({ where: { id: target.id }, data: { lastPingedAt: now } });
        } else if (target.model === 'team') {
          await (prisma.team as any).update({ where: { id: target.id }, data: { lastPingedAt: now } });
        } else if (target.model === 'player') {
          await (prisma.player as any).update({ where: { id: target.id }, data: { lastPingedAt: now } });
        }
        console.log(`  ✅ Pinged & Logged: ${target.url}`);
      } catch (e) {
        console.error(`  ⚠️ Pinged but failed to log in DB: ${target.url}`);
      }
    } else if (success) {
      console.log(`  ✅ Pinged (Static): ${target.url}`);
    }
  }

  console.log(`🏁 Finished. Total pings sent: ${pingCount}`);
}

advancedPing()
  .catch(err => {
    console.error('💥 Critical Error in Advanced Ping:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
