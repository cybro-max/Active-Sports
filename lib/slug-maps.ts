import { toSlug, matchSlug } from './slug';
import { MAJOR_LEAGUES, CURRENT_SEASON } from '@/config/leagues';
import { getTeamIndex, getPlayerIndexLite, isFullBuild, getPlayerIndexFull } from './build-params';
import { getFixturesByLeague } from './apifootball';
import { WC_VENUES } from './wc-venues';

// ─── Leagues (static — no API calls) ───────────────────────────────

export const LEAGUE_SLUG_MAP = new Map<string, number>(
  MAJOR_LEAGUES.map((l) => [toSlug(l.name), l.id])
);

export const LEAGUE_ID_TO_SLUG = new Map<number, string>(
  MAJOR_LEAGUES.map((l) => [l.id, toSlug(l.name)])
);

// ─── Teams (lazy, module-level cached) ──────────────────────────────

let teamSlugPromise: Promise<Map<string, number>> | null = null;
let teamIdToSlugPromise: Promise<Map<number, string>> | null = null;

export function getTeamSlugMap(): Promise<Map<string, number>> {
  if (!teamSlugPromise) {
    teamSlugPromise = (async () => {
      const index = await getTeamIndex();
      const map = new Map<string, number>();
      for (const [, entries] of index) {
        for (const e of entries) map.set(toSlug(e.name), e.id);
      }
      return map;
    })();
  }
  return teamSlugPromise;
}

export async function getTeamIdToSlug(): Promise<Map<number, string>> {
  if (!teamIdToSlugPromise) {
    teamIdToSlugPromise = (async () => {
      const map = new Map<number, string>();
      const index = await getTeamIndex();
      for (const [, entries] of index) {
        for (const e of entries) {
          if (!map.has(e.id)) map.set(e.id, toSlug(e.name));
        }
      }
      return map;
    })();
  }
  return teamIdToSlugPromise;
}

// ─── Players (lazy, module-level cached) ────────────────────────────

let playerSlugPromise: Promise<Map<string, number>> | null = null;
let playerIdToSlugPromise: Promise<Map<number, string>> | null = null;

export function getPlayerSlugMap(): Promise<Map<string, number>> {
  if (!playerSlugPromise) {
    playerSlugPromise = (async () => {
      const index = isFullBuild() ? await getPlayerIndexFull() : await getPlayerIndexLite();
      const map = new Map<string, number>();
      for (const [, entries] of index) {
        for (const e of entries) map.set(toSlug(e.name), e.id);
      }
      return map;
    })();
  }
  return playerSlugPromise;
}

export async function getPlayerIdToSlug(): Promise<Map<number, string>> {
  if (!playerIdToSlugPromise) {
    playerIdToSlugPromise = (async () => {
      const map = new Map<number, string>();
      const index = isFullBuild() ? await getPlayerIndexFull() : await getPlayerIndexLite();
      for (const [, entries] of index) {
        for (const e of entries) {
          if (!map.has(e.id)) map.set(e.id, toSlug(e.name));
        }
      }
      return map;
    })();
  }
  return playerIdToSlugPromise;
}

// ─── Matches (lazy, module-level cached) ────────────────────────────

let matchSlugPromise: Promise<Map<string, number>> | null = null;

export function getMatchSlugMap(): Promise<Map<string, number>> {
  if (!matchSlugPromise) {
    matchSlugPromise = (async () => {
      const map = new Map<string, number>();
      const results = await Promise.allSettled(
        MAJOR_LEAGUES.map((l) => getFixturesByLeague(l.id, CURRENT_SEASON))
      );
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        for (const f of r.value) {
          const slug = matchSlug(f.teams.home.name, f.teams.away.name);
          map.set(slug, f.fixture.id);
        }
      }
      return map;
    })();
  }
  return matchSlugPromise;
}

// ─── WC Venues (static — no API calls) ──────────────────────────────

export const VENUE_SLUG_MAP = new Map<string, string>(
  WC_VENUES.map((v) => [toSlug(v.name), v.id])
);

export const VENUE_ID_TO_SLUG = new Map<string, string>(
  WC_VENUES.map((v) => [v.id, toSlug(v.name)])
);
