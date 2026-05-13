import { prisma } from './prisma';

const db = prisma as any;

/**
 * Syncs a single team's basic info to the database.
 */
export async function syncTeam(data: any) {
  if (!data?.team?.id) return;
  const { team, venue } = data;
  
  return await db.team.upsert({
    where: { id: team.id },
    update: {
      name: team.name,
      logo: team.logo,
      country: team.country,
      leagueId: team.leagueId,
      leagueName: team.leagueName,
      venueName: venue?.name,
      venueId: venue?.id,
    },
    create: {
      id: team.id,
      name: team.name,
      logo: team.logo,
      country: team.country,
      leagueId: team.leagueId,
      leagueName: team.leagueName,
      venueName: venue?.name,
      venueId: venue?.id,
    },
  });
}

/**
 * Syncs a full squad and its players to the database.
 */
export async function syncSquad(teamId: number, data: any) {
  if (!data?.players) return;
  
  // 1. Ensure team exists (minimal)
  await db.team.upsert({
    where: { id: teamId },
    update: {
      leagueName: data.leagueName,
    },
    create: {
      id: teamId,
      name: data.team.name,
      logo: data.team.logo,
      leagueName: data.leagueName,
    }
  });

  // 2. Upsert all players in the squad
  const batch = data.players.map((p: any) => 
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
export async function syncPlayer(data: any) {
  if (!data?.player?.id) return;
  const { player, statistics } = data;
  const stats = statistics?.[0];
  
  // Sync team first if available
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
export async function syncSearchResults(results: any[]) {
  const promises = results.map(r => {
    if (r.player) return syncPlayer(r);
    if (r.team) return syncTeam(r);
    return null;
  }).filter(Boolean);
  
  return await Promise.all(promises);
}
