import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};

  // ── PostgreSQL check ─────────────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = 'ok';
  } catch {
    checks.postgres = 'error';
  }

  // ── Redis (Upstash) check ────────────────────────────────────────────────
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'ok'; // in-memory fallback is always available
    }
  } catch {
    checks.redis = 'error';
  }

  // ── API-Football check ───────────────────────────────────────────────────
  try {
    const res = await axios.get(
      `https://${process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io'}/status`,
      {
        headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY || '' },
        timeout: 5000,
      }
    );
    checks.apifootball = res.status === 200 ? 'ok' : 'error';
  } catch {
    checks.apifootball = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status }
  );
}
