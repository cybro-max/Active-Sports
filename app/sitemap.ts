import { MetadataRoute } from 'next';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';
import { prisma } from '@/lib/prisma';

/**
 * Dynamic Sitemap Generator for ActiveSports.
 * Automatically indexes new players and teams as they are synced to our DB.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://activesports.live';
  const now = new Date();
  const db = prisma as any;

  // 1. Static Pages
  const staticPages = [
    '',
    '/fixtures',
    '/leagues',
    '/teams',
    '/players',
    '/stats/leaders',
    '/transfers',
    '/injuries',
    '/odds',
    '/leaderboard',
    '/world-cup',
    '/world-cup/history',
    '/world-cup/schedule',
    '/world-cup/standings',
    '/world-cup/stats',
    '/world-cup/venues',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : (route.startsWith('/world-cup') ? 0.9 : 0.8),
  }));

  // 2. Dynamic Leagues
  const leaguePages = MAJOR_LEAGUES.map((l) => ({
    url: `${baseUrl}/league/${toSlug(l.name)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 3. Dynamic Players (Limit to top 3000 for sitemap performance)
  let playerPages: any[] = [];
  try {
    const players = await db.player.findMany({
      take: 3000,
      orderBy: { updatedAt: 'desc' },
      select: { name: true, updatedAt: true }
    });
    playerPages = players.map((p: any) => ({
      url: `${baseUrl}/player/${toSlug(p.name)}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[Sitemap] Player fetch failed:', err);
  }

  // 4. Dynamic Teams (Limit to top 1000)
  let teamPages: any[] = [];
  try {
    const teams = await db.team.findMany({
      take: 1000,
      orderBy: { updatedAt: 'desc' },
      select: { name: true, updatedAt: true }
    });
    teamPages = teams.map((t: any) => ({
      url: `${baseUrl}/team/${toSlug(t.name)}`,
      lastModified: t.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[Sitemap] Team fetch failed:', err);
  }

  return [...staticPages, ...leaguePages, ...playerPages, ...teamPages];
}
