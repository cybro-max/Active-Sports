import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { toSlug } from '../lib/slug';

const prisma = new PrismaClient();
const BASE_URL = 'https://activesports.live';
const DAILY_QUOTA = 180; // Leaving some buffer (Google limit is usually 200)

async function advancedPing() {
  console.log('🛡️ Starting Advanced Google Indexing Discovery...');

  // 1. Auth Setup
  let authClient;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const keys = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    authClient = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );
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

  // A. Static High-Priority Pages (Always ping these)
  const statics = ['', '/fixtures', '/leagues', '/teams', '/players', '/world-cup', '/stats/leaders'];
  statics.forEach(s => targets.push({ url: `${BASE_URL}${s}` }));

  // B. Modified Leagues
  const leagues = await prisma.league.findMany({
    where: {
      OR: [
        { lastPingedAt: null },
        { updatedAt: { gt: prisma.league.fields.lastPingedAt } }
      ]
    },
    take: 50,
  });
  leagues.forEach(l => targets.push({ url: `${BASE_URL}/league/${toSlug(l.name)}`, model: 'league', id: l.id }));

  // C. Modified Teams
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { lastPingedAt: null },
        { updatedAt: { gt: prisma.team.fields.lastPingedAt } }
      ]
    },
    take: 100,
  });
  teams.forEach(t => targets.push({ url: `${BASE_URL}/team/${toSlug(t.name)}`, model: 'team', id: t.id }));

  // D. Modified Players
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { lastPingedAt: null },
        { updatedAt: { gt: prisma.player.fields.lastPingedAt } }
      ]
    },
    take: 200,
  });
  players.forEach(p => targets.push({ url: `${BASE_URL}/player/${toSlug(p.name)}`, model: 'player', id: p.id }));

  console.log(`🔎 Found ${targets.length} potential targets. Quota: ${DAILY_QUOTA}`);

  // 3. Execute Pings
  for (const target of targets) {
    if (pingCount >= DAILY_QUOTA) {
      console.log('⚠️ Quota reached for today.');
      break;
    }

    const success = await sendPing(target.url);
    if (success && target.model && target.id) {
      // Update DB state
      const now = new Date();
      if (target.model === 'league') {
        await prisma.league.update({ where: { id: target.id }, data: { lastPingedAt: now } });
      } else if (target.model === 'team') {
        await prisma.team.update({ where: { id: target.id }, data: { lastPingedAt: now } });
      } else if (target.model === 'player') {
        await prisma.player.update({ where: { id: target.id }, data: { lastPingedAt: now } });
      }
      console.log(`  ✅ Pinged & Logged: ${target.url}`);
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
