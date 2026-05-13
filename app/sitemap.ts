import { MetadataRoute } from 'next';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';

/**
 * Dynamic Sitemap Generator for ActiveSports.
 * Only includes static pages and major leagues.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://activesports.live';
  const now = new Date();

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
    '/prediction-battle',
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

  // 2. Leagues
  const leaguePages = MAJOR_LEAGUES.map((l) => ({
    url: `${baseUrl}/league/${toSlug(l.name)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...leaguePages];
}
