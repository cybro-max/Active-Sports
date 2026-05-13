/**
 * Build-time param generators for generateStaticParams.
 * Optimized for Premium API Plan (5,000+ req/day).
 * 
 * Strategy:
 *   Standard Build: Pre-render all teams in major leagues + full squads for top 5 leagues.
 *   Full Build:    Pre-render all teams + all players across all indexed leagues.
 *   `dynamicParams: true` → Long-tail players/retired legends fall back to SSR + ISR.
 */

import {
  getStandings,
  getTopScorers,
  getTopAssists,
  MAJOR_LEAGUES,
  CURRENT_SEASON,
} from '@/lib/apifootball';

/** Popular team IDs for free-tier pre-rendering (uses 0 additional API calls) */
export const POPULAR_TEAM_IDS: number[] = [
  // Premier League
  42,  // Arsenal
  47,  // Spurs
  40,  // Liverpool
  50,  // Man City
  33,  // Man United
  49,  // Chelsea
  66,  // Aston Villa
  46,  // Leicester
  // La Liga
  529, // Barcelona
  541, // Real Madrid
  530, // Atletico Madrid
  // Serie A
  505, // Inter
  489, // AC Milan
  496, // Juventus
  499, // Napoli
  // Bundesliga
  157, // Bayern
  165, // Dortmund
  160, // Leverkusen
  // Ligue 1
  96,  // PSG
  81,  // Marseille
  // Other
  85,  // Ajax
  211, // Porto
];

/** Gather all team IDs from major league standings (~7 API calls on free tier) */
export async function getAllTeamIds(): Promise<Set<number>> {
  const ids = new Set<number>();
  const results = await Promise.allSettled(
    MAJOR_LEAGUES.map((l) => getStandings(l.id, CURRENT_SEASON))
  );
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const group of r.value) {
      for (const standing of group.league.standings) {
        for (const s of standing) ids.add(s.team.id);
      }
    }
  }
  return ids;
}

/** Free-tier safe: returns a fixed popular team set (0 API calls) */
export function getPopularTeamIds(): number[] {
  return POPULAR_TEAM_IDS;
}

/** Gather player IDs from top scorers + assists per league (~14 API calls) */
export async function getPlayerIdsLite(): Promise<Set<number>> {
  const ids = new Set<number>();

  const leagueIds = MAJOR_LEAGUES.map((l) => l.id);
  const promises: Promise<unknown>[] = [];

  for (const id of leagueIds) {
    promises.push(
      getTopScorers(id, CURRENT_SEASON).then((players) => {
        for (const p of players) ids.add(p.player.id);
      })
    );
    promises.push(
      getTopAssists(id, CURRENT_SEASON).then((players) => {
        for (const p of players) ids.add(p.player.id);
      })
    );
  }

  await Promise.allSettled(promises);
  return ids;
}

/** Gather all player IDs by fetching squad per team (200+ API calls — paid plan only) */
export async function getPlayerIdsFull(): Promise<Set<number>> {
  const { getSquad } = await import('@/lib/apifootball');
  const teamIds = await getAllTeamIds();
  const ids = new Set<number>();

  const batchSize = 10;
  const teams = [...teamIds];
  for (let i = 0; i < teams.length; i += batchSize) {
    const batch = teams.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map((id) => getSquad(id)));
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const squad of r.value) {
        for (const p of squad.players) ids.add(p.id);
      }
    }
    if (i + batchSize < teams.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return ids;
}

/** Check if we're in a full build (all pages) vs dev/free build */
export function isFullBuild(): boolean {
  return process.env.BUILD_GENERATION === 'full';
}

// ─── Index Page Helpers ───────────────────────────────────────────

export interface IndexEntry {
  id: number;
  name: string;
}

/** Build A-Z team index from major league standings (~7 API calls) */
export async function getTeamIndex(): Promise<Map<string, IndexEntry[]>> {
  const map = new Map<string, IndexEntry[]>();
  const ids = new Set<number>(); // deduplicate teams that appear in multiple leagues

  const results = await Promise.allSettled(
    MAJOR_LEAGUES.map((l) => getStandings(l.id, CURRENT_SEASON))
  );
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const group of r.value) {
      for (const standing of group.league.standings) {
        for (const s of standing) {
          if (ids.has(s.team.id)) continue;
          ids.add(s.team.id);
          const letter = s.team.name[0].toLowerCase();
          if (!map.has(letter)) map.set(letter, []);
          map.get(letter)!.push({ id: s.team.id, name: s.team.name });
        }
      }
    }
  }

  // Sort entries alphabetically within each letter
  for (const [, entries] of map) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/** Build player index for standard build (full squads for top 5 leagues + others via top scorers) */
export async function getPlayerIndexLite(): Promise<Map<string, IndexEntry[]>> {
  const { getSquad } = await import('@/lib/apifootball');
  const map = new Map<string, IndexEntry[]>();
  const ids = new Set<number>();

  const TOP_5_LEAGUES = [39, 140, 78, 135, 61]; // PL, La Liga, Bundesliga, Serie A, Ligue 1
  const OTHER_LEAGUES = MAJOR_LEAGUES.filter(l => !TOP_5_LEAGUES.includes(l.id)).map(l => l.id);

  // 1. Fetch ALL players for top 5 leagues via standings -> teams -> squads
  const topTeams = new Set<number>();
  const standings = await Promise.allSettled(TOP_5_LEAGUES.map(id => getStandings(id, CURRENT_SEASON)));
  for (const r of standings) {
    if (r.status === 'fulfilled') {
      for (const group of r.value) {
        for (const standing of group.league.standings) {
          for (const s of standing) topTeams.add(s.team.id);
        }
      }
    }
  }

  // Fetch squads for these ~100 teams
  const squadResults = await Promise.allSettled([...topTeams].map(id => getSquad(id)));
  for (const r of squadResults) {
    if (r.status === 'fulfilled') {
      for (const squad of r.value) {
        for (const p of squad.players) {
          if (ids.has(p.id)) continue;
          ids.add(p.id);
          const letter = p.name[0].toLowerCase();
          if (!map.has(letter)) map.set(letter, []);
          map.get(letter)!.push({ id: p.id, name: p.name });
        }
      }
    }
  }

  // 2. Fetch only Top Scorers/Assists for other leagues to save build time
  const promises: Promise<void>[] = [];
  for (const id of OTHER_LEAGUES) {
    promises.push(
      getTopScorers(id, CURRENT_SEASON).then((players) => {
        for (const p of players) {
          if (ids.has(p.player.id)) continue;
          ids.add(p.player.id);
          const letter = p.player.name[0].toLowerCase();
          if (!map.has(letter)) map.set(letter, []);
          map.get(letter)!.push({ id: p.player.id, name: p.player.name });
        }
      })
    );
    promises.push(
      getTopAssists(id, CURRENT_SEASON).then((players) => {
        for (const p of players) {
          if (ids.has(p.player.id)) continue;
          ids.add(p.player.id);
          const letter = p.player.name[0].toLowerCase();
          if (!map.has(letter)) map.set(letter, []);
          map.get(letter)!.push({ id: p.player.id, name: p.player.name });
        }
      })
    );
  }

  await Promise.allSettled(promises);

  for (const [, entries] of map) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/** Build A-Z player index from squad per team (paid plan only) */
export async function getPlayerIndexFull(): Promise<Map<string, IndexEntry[]>> {
  const { getSquad } = await import('@/lib/apifootball');
  const teamIds = await getAllTeamIds();
  const map = new Map<string, IndexEntry[]>();
  const ids = new Set<number>();

  const batchSize = 10;
  const teams = [...teamIds];
  for (let i = 0; i < teams.length; i += batchSize) {
    const batch = teams.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map((id) => getSquad(id)));
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const squad of r.value) {
        for (const p of squad.players) {
          if (ids.has(p.id)) continue;
          ids.add(p.id);
          const letter = p.name[0].toLowerCase();
          if (!map.has(letter)) map.set(letter, []);
          map.get(letter)!.push({ id: p.id, name: p.name });
        }
      }
    }
    if (i + batchSize < teams.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  for (const [, entries] of map) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/** Build A-Z league index from all available leagues (~1 API call) */
export async function getLeagueIndex(): Promise<Map<string, IndexEntry[]>> {
  const { getLeagues } = await import('@/lib/apifootball');
  const map = new Map<string, IndexEntry[]>();
  const leagues = await getLeagues({ current: true });

  for (const l of leagues) {
    const letter = l.league.name[0].toLowerCase();
    // Only index letters a-z
    if (!/^[a-z]$/.test(letter)) continue;
    
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push({ id: l.league.id, name: l.league.name });
  }

  for (const [, entries] of map) {
    entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}
