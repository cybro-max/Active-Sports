import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toSlug } from '@/lib/slug';

/**
 * Global Search API
 * Performs concurrent searches across Players, Teams, and Leagues.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ players: [], teams: [], leagues: [] });
  }

  try {
    const [players, teams] = await Promise.all([
      // 1. Search Players
      (prisma as any).player.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nationality: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { name: true, photo: true, nationality: true },
      }),
      // 2. Search Teams
      (prisma as any).team.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 3,
        select: { name: true, logo: true, country: true },
      }),
    ]);

    // Format for frontend
    return NextResponse.json({
      players: players.map((p: any) => ({
        name: p.name,
        photo: p.photo,
        subtitle: p.nationality,
        url: `/player/${toSlug(p.name)}`,
        type: 'player',
      })),
      teams: teams.map((t: any) => ({
        name: t.name,
        photo: t.logo,
        subtitle: t.country,
        url: `/team/${toSlug(t.name)}`,
        type: 'team',
      })),
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
