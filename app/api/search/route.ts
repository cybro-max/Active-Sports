import { NextResponse } from 'next/server';
import { getTeamsSearch, getPlayersSearch } from '@/lib/apifootball';
import { toSlug } from '@/lib/slug';
import { prisma } from '@/lib/prisma';

/**
 * Global Search API
 * Performs concurrent searches across Players and Teams.
 * Optimized Strategy: Check DB first for instant local results, 
 * then fall back to API if local data is insufficient.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ players: [], teams: [] });
  }

  try {
    const db = prisma as any; // Cast to any to bypass temporary IDE model drift

    // 1. Try Local Database Search (Structured & Fast)
    const [dbPlayers, dbTeams] = await Promise.all([
      db.player.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 5,
        include: { team: true }
      }),
      db.team.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 5
      })
    ]);

    // 2. If we have enough local results, return them immediately
    if (dbPlayers.length >= 3 && dbTeams.length >= 2) {
      return NextResponse.json({
        players: dbPlayers.map((p: any) => ({
          name: p.name,
          photo: p.photo,
          subtitle: p.team?.name || p.nationality,
          url: `/player/${toSlug(p.name)}`,
          type: 'player',
        })),
        teams: dbTeams.map((t: any) => ({
          name: t.name,
          photo: t.logo,
          subtitle: t.country,
          url: `/team/${toSlug(t.name)}`,
          type: 'team',
        })),
      });
    }

    // 3. Fallback: Hit API-Football for discovery and sync back to DB
    const [apiPlayers, apiTeams] = await Promise.all([
      getPlayersSearch(query).catch(() => []),
      getTeamsSearch(query).catch(() => []),
    ]);

    // Deduplicate and combine (API results are usually more comprehensive for new data)
    const players = apiPlayers.slice(0, 5).map((p: any) => ({
      name: p.player.name,
      photo: p.player.photo,
      subtitle: p.statistics?.[0]?.team?.name || p.player.nationality,
      url: `/player/${toSlug(p.player.name)}`,
      type: 'player',
    }));

    const teams = apiTeams.slice(0, 5).map((t: any) => ({
      name: t.team.name,
      photo: t.team.logo,
      subtitle: t.team.country,
      url: `/team/${toSlug(t.team.name)}`,
      type: 'team',
    }));

    return NextResponse.json({ players, teams });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
