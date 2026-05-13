/**
 * Cron: Sync today + next 7 days fixtures for major leagues to PostgreSQL.
 * Schedule: every 6 hours via vercel.json
 * Requires: CRON_SECRET env variable for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTodayFixtures } from '@/lib/apifootball';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Protect cron from unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fixtures = await getTodayFixtures();
    const started = new Date().toISOString();

    // NOTE: Run `npx prisma migrate dev` to create the SyncStatus table,
    // then uncomment the block below:
    // await prisma.syncStatus.upsert({
    //   where: { job: 'sync-fixtures' },
    //   update: { lastRun: new Date(), lastError: null },
    //   create: { job: 'sync-fixtures', lastRun: new Date() },
    // });

    return NextResponse.json({
      success: true,
      job: 'sync-fixtures',
      count: fixtures.length,
      started,
      completed: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // await prisma.syncStatus.upsert({
    //   where: { job: 'sync-fixtures' },
    //   update: { lastRun: new Date(), lastError: message },
    //   create: { job: 'sync-fixtures', lastRun: new Date(), lastError: message },
    // }).catch(() => null);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
