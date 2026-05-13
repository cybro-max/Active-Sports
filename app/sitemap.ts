import { MetadataRoute } from 'next';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';
import { prisma } from '@/lib/prisma';

/**
 * Dynamic Sitemap Generator for ActiveSports.
 * Automatically indexes new players and teams as they are synced to our DB.
 * Supports up to 50,000 URLs (Search Console limit for a single sitemap).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://activesports.live';
  const now = new Date();
  const db = prisma as any;

  // 1. Static Core Pages
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

  // 2. Dynamic Leagues (From DB with fallback to Config)
  let leaguePages: any[] = [];
  try {
    const leagues = await db.league.findMany({
      select: { name: true, updatedAt: true }
    });
    
    if (leagues.length > 0) {
      leaguePages = leagues.map((l: any) => ({
        url: `${baseUrl}/league/${toSlug(l.name)}`,
        lastModified: l.updatedAt || now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    } else {
      throw new Error('No leagues in DB');
    }
  } catch (err) {
    leaguePages = MAJOR_LEAGUES.map((l) => ({
      url: `${baseUrl}/league/${toSlug(l.name)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  // 3. Dynamic Teams (Top 5,000)
  let teamPages: any[] = [];
  try {
    const teams = await db.team.findMany({
      take: 5000,
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

  // 4. Dynamic Players (Top 20,000)
  let playerPages: any[] = [];
  try {
    const players = await db.player.findMany({
      take: 20000,
      orderBy: { updatedAt: 'desc' },
      select: { name: true, updatedAt: true }
    });
    playerPages = players.map((p: any) => ({
      url: `${baseUrl}/player/${toSlug(p.name)}`,
      lastModified: p.updatedAt || now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch (err) {
    console.error('[Sitemap] Player fetch failed:', err);
  }

  return [...staticPages, ...leaguePages, ...teamPages, ...playerPages];
}
