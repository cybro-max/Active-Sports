import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLeagues } from '@/lib/apifootball';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leagues = await getLeagues({ current: true });

    const existing = await prisma.league.findMany({ select: { id: true, season: true } });
    const existingMap = new Map(existing.map(l => [l.id, l.season]));

    let created = 0;
    let updated = 0;
    const toCreate: any[] = [];

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

    if (toCreate.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
        await prisma.league.createMany({
          data: toCreate.slice(i, i + BATCH_SIZE),
          skipDuplicates: true,
        });
      }
      created = toCreate.length;
    }

    await prisma.syncStatus.upsert({
      where: { job: 'sync-leagues' },
      create: { job: 'sync-leagues', lastRun: new Date() },
      update: { lastRun: new Date(), lastError: null },
    });

    const total = await prisma.league.count();

    return NextResponse.json({
      ok: true,
      total,
      created,
      updated,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
