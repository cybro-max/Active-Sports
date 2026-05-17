import { prisma } from './prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

/**
 * Syncs a single team's basic info to the database.
 */
export async function syncTeam(data: Record<string, unknown>) {
  const t = data.team as { id: number; name: string; logo: string; country?: string; leagueId?: number; leagueName?: string } | undefined;
  const v = data.venue as { name?: string; id?: number } | undefined;
  if (!t?.id) return;
  
  return await db.team.upsert({
    where: { id: t.id },
    update: {
      name: t.name,
      logo: t.logo,
      country: t.country,
      leagueId: t.leagueId,
      leagueName: t.leagueName,
      venueName: v?.name,
      venueId: v?.id,
    },
    create: {
      id: t.id,
      name: t.name,
      logo: t.logo,
      country: t.country,
      leagueId: t.leagueId,
      leagueName: t.leagueName,
      venueName: v?.name,
      venueId: v?.id,
    },
  });
}

/**
 * Syncs a full squad and its players to the database.
 */
export async function syncSquad(teamId: number, data: Record<string, unknown>) {
  const players = data.players as Array<{ id: number; name: string; age?: number; number?: number; position?: string; photo?: string }> | undefined;
  if (!players) return;
  
  const t = data.team as { name: string; logo: string } | undefined;
  
  await db.team.upsert({
    where: { id: teamId },
    update: {
      leagueName: data.leagueName as string | undefined,
    },
    create: {
      id: teamId,
      name: t?.name ?? 'Unknown',
      logo: t?.logo ?? '',
      leagueName: data.leagueName as string | undefined,
    }
  });

  const batch = players.map((p) => 
    db.player.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        age: p.age,
        number: p.number,
        position: p.position,
        photo: p.photo,
        teamId: teamId,
      },
      create: {
        id: p.id,
        name: p.name,
        age: p.age,
        number: p.number,
        position: p.position,
        photo: p.photo,
        teamId: teamId,
      }
    })
  );

  return await Promise.all(batch);
}

/**
 * Syncs player profile data (usually from /players endpoint).
 */
export async function syncPlayer(data: Record<string, unknown>) {
  const player = data.player as { id: number; name: string; firstname?: string; lastname?: string; age?: number; nationality?: string; height?: string; weight?: string; photo?: string } | undefined;
  const statistics = data.statistics as Array<{ team?: { id: number; name: string; logo: string }; games?: { position?: string; number?: number } }> | undefined;
  if (!player?.id) return;
  const stats = statistics?.[0];
  
  if (stats?.team?.id) {
    await db.team.upsert({
      where: { id: stats.team.id },
      update: { name: stats.team.name, logo: stats.team.logo },
      create: { id: stats.team.id, name: stats.team.name, logo: stats.team.logo }
    });
  }

  return await db.player.upsert({
    where: { id: player.id },
    update: {
      name: player.name,
      firstname: player.firstname,
      lastname: player.lastname,
      age: player.age,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      photo: player.photo,
      teamId: stats?.team?.id,
      position: stats?.games?.position,
      number: stats?.games?.number,
    },
    create: {
      id: player.id,
      name: player.name,
      firstname: player.firstname,
      lastname: player.lastname,
      age: player.age,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      photo: player.photo,
      teamId: stats?.team?.id,
      position: stats?.games?.position,
      number: stats?.games?.number,
    }
  });
}

/**
 * High-level sync function to be called from the search API.
 * Syncs multiple players/teams at once.
 */
export async function syncSearchResults(results: Record<string, unknown>[]) {
  const promises = results.map(r => {
    if (r.player) return syncPlayer(r);
    if (r.team) return syncTeam(r);
    return null;
  }).filter(Boolean);
  
  return await Promise.all(promises);
}
