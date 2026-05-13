/**
 * Fetches all current leagues from API-Football and upserts them into Postgres.
 * Run: `npx tsx scripts/sync-leagues.ts`
 *
 * Once seeded, the /leagues page reads from DB with zero API calls.
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { getLeagues } from '@/lib/apifootball';

async function main() {
  console.log('[SyncLeagues] Fetching all current leagues from API-Football...');

  const leagues = await getLeagues({ current: true });
  console.log(`[SyncLeagues] Received ${leagues.length} leagues from API`);

  // Get existing league IDs
  const existing = await prisma.league.findMany({ select: { id: true, season: true } });
  const existingMap = new Map(existing.map(l => [l.id, l.season]));

  const toCreate: {
    id: number; name: string; type: string; logo: string;
    country: string; flag: string | null; code: string | null; season: number;
  }[] = [];
  let updated = 0;

  for (const item of leagues) {
    const season = item.seasons.find(s => s.current) ?? item.seasons[0];
    if (!season) continue;

    const existingSeason = existingMap.get(item.league.id);

    if (existingSeason === undefined) {
      toCreate.push({
        id: item.league.id,
        name: item.league.name,
        type: item.league.type,
        logo: item.league.logo,
        country: item.country.name,
        flag: item.country.flag || null,
        code: item.country.code || null,
        season: season.year,
      });
    } else if (existingSeason !== season.year) {
      await prisma.league.update({
        where: { id: item.league.id },
        data: {
          name: item.league.name,
          type: item.league.type,
          logo: item.league.logo,
          country: item.country.name,
          flag: item.country.flag || null,
          code: item.country.code || null,
          season: season.year,
        },
      });
      updated++;
    }
  }

  // Batch create new leagues
  if (toCreate.length > 0) {
    const BATCH_SIZE = 100;
    for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
      const batch = toCreate.slice(i, i + BATCH_SIZE);
      await prisma.league.createMany({ data: batch, skipDuplicates: true });
      console.log(`[SyncLeagues] Inserted batch ${i + batch.length}/${toCreate.length}...`);
    }
  }

  // Record sync status
  await prisma.syncStatus.upsert({
    where: { job: 'sync-leagues' },
    create: { job: 'sync-leagues', lastRun: new Date() },
    update: { lastRun: new Date(), lastError: null },
  });

  const total = await prisma.league.count();
  console.log(`[SyncLeagues] Done. ${total} leagues in DB (${toCreate.length} created, ${updated} updated).`);
}

main()
  .catch(err => {
    console.error('[SyncLeagues] Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
