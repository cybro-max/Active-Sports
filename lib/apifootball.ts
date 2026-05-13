/**
 * API-Football v3 client with in-memory + Upstash Redis caching
 * Pro tier: 7500 req/day → every request goes through cache first
 *
 * TTL Strategy:
 *   live fixtures  → 60s  (client-side refresh handles "live feel")
 *   today fixtures → 120s
 *   standings      → 300s (5 min)
 *   player stats   → 3600s (1 hr)
 *   static data    → 86400s (24 hr)
 */

import { Redis } from '@upstash/redis';
import axios from 'axios';
import * as Sentry from '@sentry/nextjs';
import { DEFAULT_TIMEZONE, getTodayDate } from '@/lib/utils';

// ─── Redis client (null-safe for local dev without Upstash) ──────────────────
const redis =
  process.env.UPSTASH_REDIS_REST_URL?.startsWith('http') && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

// Simple in-memory fallback when Redis isn't configured
const memCache = new Map<string, { data: unknown; expires: number }>();

async function getCache<T>(key: string): Promise<T | null> {
  // 1. Try Redis first
  if (redis) {
    const data = await redis.get<T>(key);
    if (data) return data;
  }

  // 2. Try in-memory fallback
  const entry = memCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;

  // 3. Try Prisma (Persistent Fallback)
  try {
    const { prisma: p } = await import('./prisma');
    const prisma = p as any; // Cast to any for the model access to resolve IDE drift
    
    if (!prisma?.apiCache) {
      return null;
    }

    const dbEntry = await prisma.apiCache.findUnique({
      where: { key },
    });
    
    if (dbEntry && dbEntry.expiresAt > new Date()) {
      const data = dbEntry.data as T;
      // Backfill memory cache
      memCache.set(key, { data, expires: dbEntry.expiresAt.getTime() });
      return data;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[AFS Cache] Prisma get error for ${key}:`, err);
  }
  
  return null;
}

async function setCache(key: string, data: unknown, ttlSeconds: number) {
  // 1. Set Redis
  if (redis) {
    await redis.set(key, data, { ex: ttlSeconds }).catch(() => {});
  }

  // 2. Set In-memory
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memCache.set(key, { data, expires: expiresAt });

  // 3. Set Prisma (Persistent)
  // Only persist data with long TTLs (Static Metadata, Player Stats) to avoid DB bloat
  if (ttlSeconds >= 3600) {
    try {
      const { prisma: p } = await import('./prisma');
      const prisma = p as any; // Cast to any for the model access to resolve IDE drift
      
      if (!prisma?.apiCache) return;

      await prisma.apiCache.upsert({
        where: { key },
        update: {
          data: data as any,
          expiresAt: new Date(expiresAt),
        },
        create: {
          key,
          data: data as any,
          expiresAt: new Date(expiresAt),
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[AFS Cache] Prisma set error for ${key}:`, err);
    }
  }
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `https://${process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io'}`,
  headers: {
    'x-apisports-key': process.env.FOOTBALL_API_KEY || '',
  },
  timeout: 10000,
});

// ─── Quota budget tracking ─────────────────────────────────────────────────────
// Track request counts in memory to avoid burning the daily quota
let requestCountToday = 0;
let quotaExhausted = false;
let quotaResetTime = Date.now() + 24 * 60 * 60 * 1000;

function resetQuotaIfNeeded() {
  if (Date.now() > quotaResetTime) {
    requestCountToday = 0;
    quotaExhausted = false;
    quotaResetTime = Date.now() + 24 * 60 * 60 * 1000;
  }
}

function canMakeRequest(): boolean {
  resetQuotaIfNeeded();
  // Budget: 7500 daily. Use 7400 as a safety margin.
  return requestCountToday < 7400 && !quotaExhausted;
}

function recordRequest() {
  requestCountToday++;
  if (requestCountToday >= 7400) {
    quotaExhausted = true;
    // eslint-disable-next-line no-console
    console.warn(`[AFS Quota] 7400/7500 daily requests used — entering quota save mode`);
  }
}

/**
 * Priority levels for API requests.
 * HIGH: user-facing live data (live scores, events)
 * MEDIUM: recent data (standings, today's fixtures)
 * LOW: static metadata (leagues, countries, venues)
 */
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

const PRIORITY_TTL: Record<Priority, number> = {
  HIGH: 30,
  MEDIUM: 120,
  LOW: 86400,
};

// Check if a TTL is long enough that stale cache is acceptable
function isStaleAcceptable(ttl: number): boolean {
  return ttl >= 300; // 5+ min stale data is acceptable
}

// ─── Core fetcher ─────────────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  ttl = 300,
  priority: Priority = 'MEDIUM',
  forceRefresh = false
): Promise<T> {
  const cacheKey = `afs:${endpoint}:${JSON.stringify(params)}`;

  // 1. Try cache first (unless forceRefresh is true)
  let cachedData: T | null = null;
  if (!forceRefresh) {
    cachedData = await getCache<T>(cacheKey);
    if (cachedData) return cachedData;
  }

  // 2. Check quota budget
  if (!canMakeRequest()) {
    // If we have stale data and quota is hit, use it as a fallback
    if (!cachedData) cachedData = await getCache<T>(cacheKey);
    if (isStaleAcceptable(ttl) && cachedData) {
      return cachedData;
    }
    // For HIGH priority, override quota if absolutely needed
    if (priority === 'HIGH') {
      // eslint-disable-next-line no-console
      console.warn(`[AFS Quota] Override for HIGH priority request: ${endpoint}`);
    } else {
      throw new Error('API quota limit reached. Data unavailable until budget resets.');
    }
  }

  try {
    const { data } = await api.get(endpoint, { params });
    
    // Check for API-Football internal errors (they often return 200 OK with errors in payload)
    if (data.errors && Object.keys(data.errors).length > 0) {
      if (data.errors.requests) {
        quotaExhausted = true;
        throw new Error('API rate limit reached. Please try again later.');
      }
      throw new Error(`API returned error: ${JSON.stringify(data.errors)}`);
    }

    const result = data.response as T;
    recordRequest();
    // Use provided TTL or priority-based TTL
    const effectiveTtl = ttl || PRIORITY_TTL[priority];
    await setCache(cacheKey, result, effectiveTtl);
    return result;
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: { endpoint, priority, cacheKey },
      extra: { params },
    });
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        quotaExhausted = true;
        throw new Error('API rate limit reached. Please try again later.');
      }
      throw new Error(`API Error ${error.response?.status}: ${endpoint}`);
    }
    throw error;
  }
}

// ─── TTL Constants ────────────────────────────────────────────────────────────
const TTL = {
  LIVE: 30,
  TODAY: 60,
  STANDINGS: 180,
  MATCH: 60,
  PLAYER: 600,
  SQUAD: 3600,
  STATIC: 86400,
};

// ─── STATUS ───────────────────────────────────────────────────────────────────
export async function getApiStatus() {
  const { data } = await api.get('/status');
  return data.response;
}

// ─── COUNTRIES ────────────────────────────────────────────────────────────────
export async function getCountries() {
  return apiFetch<FootballCountry[]>('/countries', {}, TTL.STATIC);
}

// ─── LEAGUES ─────────────────────────────────────────────────────────────────
export async function getLeagues(params: {
  country?: string;
  season?: number;
  current?: boolean;
  type?: 'league' | 'cup';
}) {
  return apiFetch<LeagueResponse[]>('/leagues', params as Record<string, string | number | boolean>, TTL.STATIC);
}

export async function getLeagueById(id: number) {
  try {
    return await apiFetch<LeagueResponse[]>('/leagues', { id }, TTL.STATIC);
  } catch (err: any) {
    if (err.message?.includes('limit')) {
      const major = MAJOR_LEAGUES.find(l => l.id === id);
      if (major) {
        return [{
          league: { id: major.id, name: major.name, type: 'League', logo: major.logo },
          country: { name: major.country, code: '', flag: '' },
          seasons: [{ year: CURRENT_SEASON, start: '', end: '', current: true }]
        }] as LeagueResponse[];
      }
    }
    throw err;
  }
}

export async function getLeaguesSearch(search: string) {
  return apiFetch<LeagueResponse[]>('/leagues', { search }, TTL.STATIC);
}

// ─── MOCK DATA FOR DEMO PURPOSES ─────────────────────────────────────────────
const MOCK_FIXTURES: Fixture[] = [
  {
    fixture: {
      id: 101,
      date: new Date().toISOString(),
      status: { long: 'Second Half', short: '2H', elapsed: 65 },
      venue: { id: 1, name: 'Old Trafford', city: 'Manchester' },
    },
    league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png', round: 'Regular Season', country: 'England' },
    teams: {
      home: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png', winner: false },
      away: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', winner: true },
    },
    goals: { home: 1, away: 2 },
    score: { halftime: { home: 0, away: 1 }, fulltime: { home: null, away: null } },
  },
  {
    fixture: {
      id: 102,
      date: new Date().toISOString(),
      status: { long: 'First Half', short: '1H', elapsed: 22 },
      venue: { id: 2, name: 'Camp Nou', city: 'Barcelona' },
    },
    league: { id: 140, name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png', round: 'Regular Season', country: 'Spain' },
    teams: {
      home: { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png', winner: null },
      away: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png', winner: null },
    },
    goals: { home: 0, away: 0 },
    score: { halftime: { home: null, away: null }, fulltime: { home: null, away: null } },
  }
];

export async function getLiveFixtures(timezone = DEFAULT_TIMEZONE) {
  try {
    return await apiFetch<Fixture[]>('/fixtures', { live: 'all', timezone }, TTL.LIVE);
  } catch {
    return MOCK_FIXTURES;
  }
}

export async function getTodayFixtures(timezone = DEFAULT_TIMEZONE) {
  const today = getTodayDate(timezone);
  try {
    return await apiFetch<Fixture[]>('/fixtures', { date: today, timezone }, TTL.TODAY);
  } catch {
    return MOCK_FIXTURES;
  }
}

export async function getFixturesByDate(date: string, timezone = DEFAULT_TIMEZONE) {
  try {
    return await apiFetch<Fixture[]>('/fixtures', { date, timezone }, TTL.TODAY);
  } catch {
    return [];
  }
}

export async function getFixturesByLeague(
  league: number,
  season: number,
  timezone = DEFAULT_TIMEZONE
) {
  try {
    return await apiFetch<Fixture[]>(
      '/fixtures',
      { league, season, timezone },
      TTL.TODAY
    );
  } catch {
    return [];
  }
}

export async function getFixtureById(id: number) {
  return apiFetch<Fixture[]>('/fixtures', { id }, TTL.MATCH);
}

export async function getFixturesByIds(ids: string) {
  return apiFetch<Fixture[]>('/fixtures', { ids }, TTL.MATCH);
}

export async function getHeadToHead(h2h: string, last = 10) {
  return apiFetch<Fixture[]>('/fixtures/headtohead', { h2h, last }, TTL.MATCH);
}

export async function getFixtureStatistics(fixture: number) {
  return apiFetch<FixtureStatistics[]>(
    '/fixtures/statistics',
    { fixture },
    // Use MATCH TTL for stats
    TTL.MATCH
  );
}

export async function getFixtureEvents(fixture: number) {
  return apiFetch<FixtureEvent[]>('/fixtures/events', { fixture }, TTL.LIVE);
}

export async function getFixtureLineups(fixture: number) {
  return apiFetch<FixtureLineup[]>('/fixtures/lineups', { fixture }, TTL.MATCH);
}

export async function getFixturePlayers(fixture: number) {
  return apiFetch<FixturePlayerStats[]>(
    '/fixtures/players',
    { fixture },
    TTL.MATCH
  );
}

export async function getFixturesByTeam(team: number, season: number) {
  try {
    const fixtures = await apiFetch<Fixture[]>(
      '/fixtures',
      { team, season },
      TTL.TODAY
    );
    return fixtures.slice(-10);
  } catch {
    return [];
  }
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────
export async function getStandings(league: number, season: number) {
  try {
    return await apiFetch<StandingsResponse[]>(
      '/standings',
      { league, season },
      TTL.STANDINGS
    );
  } catch {
    return [];
  }
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
export async function getPlayer(id: number, season: number, forceRefresh = false) {
  return apiFetch<PlayerResponse[]>('/players', { id, season }, TTL.PLAYER, 'MEDIUM', forceRefresh);
}

export async function getPlayersSearch(search: string) {
  const majorLeagues = [39, 140, 135, 78, 61];
  try {
    const results = await Promise.all(
      majorLeagues.map(league => 
        apiFetch<PlayerResponse[]>('/players', { search, league, season: CURRENT_SEASON }, TTL.STATIC)
      )
    );
    return results.flat().filter((p, i, self) => 
      self.findIndex(t => t.player.id === p.player.id) === i
    );
  } catch (err) {
    return [];
  }
}

export async function getTopScorers(league: number, season: number) {
  try {
    return await apiFetch<PlayerResponse[]>(
      '/players/topscorers',
      { league, season },
      TTL.STANDINGS
    );
  } catch {
    return [];
  }
}

export async function getTopAssists(league: number, season: number) {
  try {
    return await apiFetch<PlayerResponse[]>(
      '/players/topassists',
      { league, season },
      TTL.STANDINGS
    );
  } catch {
    return [];
  }
}

export async function getTopYellowCards(league: number, season: number) {
  try {
    return await apiFetch<PlayerResponse[]>(
      '/players/topyellowcards',
      { league, season },
      TTL.STANDINGS
    );
  } catch {
    return [];
  }
}

export async function getTopRedCards(league: number, season: number) {
  try {
    return await apiFetch<PlayerResponse[]>(
      '/players/topredcards',
      { league, season },
      TTL.STANDINGS
    );
  } catch {
    return [];
  }
}

export async function getSquad(team: number) {
  return apiFetch<SquadResponse[]>('/players/squads', { team }, TTL.SQUAD);
}

// ─── TEAMS ───────────────────────────────────────────────────────────────────
export async function getTeam(id: number) {
  return apiFetch<TeamResponse[]>('/teams', { id }, TTL.STATIC);
}

export async function getTeamsSearch(search: string) {
  return apiFetch<TeamResponse[]>('/teams', { search }, TTL.STATIC);
}

export async function getTeamStatistics(team: number, league: number, season: number) {
  return apiFetch<TeamStats>(
    '/teams/statistics',
    { team, league, season },
    TTL.STANDINGS
  );
}

// ─── TRANSFERS ───────────────────────────────────────────────────────────────
export async function getTransfers(player?: number, team?: number) {
  const params: Record<string, number> = {};
  if (player) params.player = player;
  if (team) params.team = team;
  return apiFetch<Transfer[]>('/transfers', params, TTL.STATIC);
}

// ─── INJURIES ────────────────────────────────────────────────────────────────
export async function getInjuries(fixture?: number, league?: number, season?: number, player?: number) {
  const params: Record<string, number> = {};
  if (fixture) params.fixture = fixture;
  if (league) params.league = league;
  if (season) params.season = season;
  if (player) params.player = player;
  return apiFetch<Injury[]>('/injuries', params, TTL.MATCH);
}

// ─── TROPHIES ────────────────────────────────────────────────────────────────
export async function getTrophies(player?: number, coach?: number) {
  const params: Record<string, number> = {};
  if (player) params.player = player;
  if (coach) params.coach = coach;
  return apiFetch<Trophy[]>('/trophies', params, TTL.PLAYER);
}

// ─── COACHES ─────────────────────────────────────────────────────────────────
export async function getCoach(id?: number, team?: number, search?: string, forceRefresh = false) {
  const params: Record<string, string | number> = {};
  if (id) params.id = id;
  if (team) params.team = team;
  if (search) params.search = search;
  return apiFetch<Coach[]>('/coachs', params, TTL.PLAYER, 'MEDIUM', forceRefresh);
}

// ─── PREDICTIONS ─────────────────────────────────────────────────────────────
export async function getPredictions(fixture: number) {
  return apiFetch<Prediction[]>('/predictions', { fixture }, TTL.MATCH);
}

// ─── ODDS ────────────────────────────────────────────────────────────────────
export async function getOdds(fixture: number) {
  return apiFetch<OddsResponse[]>('/odds', { fixture }, TTL.MATCH);
}

export async function getOddsByDate(date: string) {
  return apiFetch<OddsResponse[]>('/odds', { date }, TTL.MATCH);
}

export async function getLiveOdds(fixture?: number, league?: number) {
  const params: Record<string, number> = {};
  if (fixture) params.fixture = fixture;
  if (league) params.league = league;
  return apiFetch<OddsResponse[]>('/odds/live', params, TTL.LIVE);
}

export async function getBookmakers() {
  return apiFetch<Bookmaker[]>('/odds/bookmakers', {}, TTL.STATIC);
}

// ─── VENUES ──────────────────────────────────────────────────────────────────
export async function getVenue(id: number) {
  return apiFetch<Venue[]>('/venues', { id }, TTL.STATIC);
}

export async function getSidelined(player?: number, team?: number, league?: number, season?: number) {
  const params: Record<string, number> = {};
  if (player) params.player = player;
  if (team) params.team = team;
  if (league) params.league = league;
  if (season) params.season = season;
  return apiFetch<Sidelined[]>('/sidelined', params, TTL.MATCH);
}

export async function getTeamsByCountry(country: string) {
  return apiFetch<TeamResponse[]>('/teams', { search: country }, TTL.STATIC);
}

export async function getSeasons() {
  return apiFetch<number[]>('/leagues/seasons', {}, TTL.STATIC);
}

export async function getTimezones() {
  return apiFetch<string[]>('/timezone', {}, TTL.STATIC);
}

export async function getFixtureRounds(league: number, season: number, current?: boolean) {
  const params: Record<string, string | number | boolean> = { league, season };
  if (current) params.current = current;
  return apiFetch<string[]>('/fixtures/rounds', params, TTL.TODAY);
}

export async function getOddsLiveBets() {
  return apiFetch<LiveBet[]>('/odds/live/bets', {}, TTL.LIVE);
}

export async function getOddsMapping() {
  return apiFetch<OddsMapping[]>('/odds/mapping', {}, TTL.STATIC);
}

export interface Sidelined {
  player: { id: number; name: string; photo: string; type: string; reason: string };
  team: { id: number; name: string; logo: string };
  league: { id: number; season: number; name: string; logo: string };
}

export interface LiveBet {
  id: number;
  name: string;
}

export interface OddsMapping {
  fixture: { id: number };
  update: string;
  mappings: { id: number; name: string }[];
}

import { MAJOR_LEAGUES, CURRENT_SEASON, WORLD_CUP_SEASON, WORLD_CUP_LEAGUE_ID } from '@/config/leagues';

export { MAJOR_LEAGUES, CURRENT_SEASON, WORLD_CUP_SEASON, WORLD_CUP_LEAGUE_ID };

// ─── TYPE DEFINITIONS ────────────────────────────────────────────────────────
export interface FootballCountry {
  name: string;
  code: string;
  flag: string;
}

export interface LeagueResponse {
  league: { id: number; name: string; type: string; logo: string };
  country: { name: string; code: string; flag: string };
  seasons: { year: number; start: string; end: string; current: boolean }[];
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string; elapsed: number | null };
    venue: { id: number; name: string; city: string };
  };
  league: { id: number; name: string; logo: string; round: string; country: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

export interface FixtureStatistics {
  team: { id: number; name: string; logo: string };
  statistics: { type: string; value: string | number | null }[];
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface FixtureLineup {
  team: { id: number; name: string; logo: string; colors: unknown };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: { player: { id: number; name: string; number: number; pos: string; grid: string } }[];
  substitutes: { player: { id: number; name: string; number: number; pos: string; grid: string | null } }[];
}

export interface FixturePlayerStats {
  team: { id: number; name: string; logo: string; update: string };
  players: {
    player: { id: number; name: string; photo: string };
    statistics: {
      games: { minutes: number | null; rating: string | null; captain: boolean };
      goals: { total: number | null; assists: number | null };
      shots: { total: number | null; on: number | null };
      passes: { total: number | null; accuracy: string | null };
      tackles: { total: number | null; interceptions: number | null };
      cards: { yellow: number; red: number };
    }[];
  }[];
}

export interface StandingsResponse {
  league: {
    id: number;
    name: string;
    logo: string;
    standings: Standing[][];
  };
}

export interface Standing {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export interface PlayerResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    photo: string;
    height: string;
    weight: string;
  };
    statistics: {
      team: { id: number; name: string; logo: string };
      league: { id: number; name: string; logo: string; season: number };
      games: { appearances: number | null; minutes: number | null; rating: string | null; position: string; number: number | null; captain: boolean };
      substitutes: { in: number | null; out: number | null; bench: number | null };
      shots: { total: number | null; on: number | null };
      goals: { total: number | null; conceded: number | null; assists: number | null; saves: number | null };
      passes: { total: number | null; key: number | null; accuracy: string | number | null };
      tackles: { total: number | null; blocks: number | null; interceptions: number | null };
      duels: { total: number | null; won: number | null };
      dribbles: { attempts: number | null; success: number | null; past: number | null };
      fouls: { drawn: number | null; committed: number | null };
      cards: { yellow: number; yellowred: number; red: number };
      penalty: { won: number | null; commited: number | null; scored: number | null; missed: number | null; saved: number | null };
    }[];
}

export interface SquadResponse {
  team: { id: number; name: string; logo: string };
  players: { id: number; name: string; age: number; number: number; position: string; photo: string }[];
}

export interface TeamResponse {
  team: { id: number; name: string; logo: string; country: string; founded: number; national: boolean };
  venue: { id: number; name: string; address: string; city: string; capacity: number; image: string };
}

export interface TeamStats {
  league: { id: number; name: string; logo: string; season: number };
  team: { id: number; name: string; logo: string };
  form: string;
  fixtures: { played: { total: number }; wins: { total: number }; draws: { total: number }; loses: { total: number } };
  goals: { for: { total: { total: number } }; against: { total: { total: number } } };
}

export interface Transfer {
  player: { id: number; name: string };
  update: string;
  transfers: { date: string; type: string; teams: { in: { id: number; name: string; logo: string }; out: { id: number; name: string; logo: string } } }[];
}

export interface Injury {
  player: { id: number; name: string; photo: string; type: string; reason: string };
  team: { id: number; name: string; logo: string };
  fixture: { id: number; timezone: string; date: string };
  league: { id: number; season: number; name: string; logo: string };
}

export interface Trophy {
  league: string;
  country: string;
  season: string;
  place: string;
}

export interface Coach {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  photo: string;
  career: { team: { id: number; name: string; logo: string }; start: string; end: string | null }[];
}

export interface Prediction {
  winner: { id: number | null; comment: string; name: string | null };
  win_or_draw: boolean;
  under_over: string | null;
  goals: { home: string; away: string };
  advice: string;
  percent: { home: string; draw: string; away: string };
}

export interface OddsResponse {
  league: { id: number; name: string; logo: string; season: number };
  fixture: { id: number; timezone: string; date: string };
  update: string;
  bookmakers: {
    id: number;
    name: string;
    bets: { id: number; name: string; values: { value: string; odd: string }[] }[];
  }[];
}

export interface Bookmaker {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  surface: string;
  image: string;
}
