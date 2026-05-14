import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  getLeagueById, getLeaguesSearch, getStandings, getFixturesByLeague,
  getTopScorers, getTopAssists, getTopYellowCards, getTopRedCards,
  getFixtureRounds, getSeasons,
  CURRENT_SEASON
} from '@/lib/apifootball';
import { ClipboardList, Calendar, Activity, ChevronDown, Users, Trophy, Flag, Clock, Award } from 'lucide-react';
import StandingsTable from '@/components/StandingsTable';
import MatchCard from '@/components/MatchCard';
import PlayerStatsTable from '@/components/PlayerStatsTable';
import { SkeletonTable, SkeletonFixtureList } from '@/components/Skeleton';
import AsyncSection from '@/components/AsyncSection';
import { generateSportsOrgLD, generateBreadcrumbLD } from '@/lib/json-ld';
import { captureCatch } from '@/lib/utils';
import { generateLeagueOverview } from '@/lib/content-generator';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';
import { LEAGUE_SLUG_MAP, LEAGUE_ID_TO_SLUG } from '@/lib/slug-maps';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ round?: string; season?: string; tz?: string }>;
}

export async function generateStaticParams() {
  return MAJOR_LEAGUES.map((l) => ({ slug: toSlug(l.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  let id = LEAGUE_SLUG_MAP.get(param);

  if (!id && !/^\d+$/.test(param)) {
    const fallback = await captureCatch(
      getLeaguesSearch(param.replace(/-/g, ' ')),
      []
    );
    id = fallback[0]?.league?.id ?? undefined;
  }

  if (!id) return { title: 'League', robots: { index: false } as const };
  const leagues = await captureCatch(getLeagueById(id), []);
  const league = leagues[0]?.league;
  return {
    title: league ? `${league.name} — Standings & Fixtures` : 'League',
    description: `Standings, top scorers, fixtures and results for ${league?.name ?? 'this league'}.`,
    alternates: { canonical: `https://activesports.live/league/${param}` },
    ...(league ? {} : { robots: { index: false } as const }),
  };
}

// ─── Streaming sections ───────────────────────────────────────────

async function StandingsSection({ leagueId }: { leagueId: number }) {
  const standingsData = await captureCatch(getStandings(leagueId, CURRENT_SEASON), []);
  const standings = standingsData[0]?.league?.standings ?? [];

  return (
    <AsyncSection
      error={null}
      isEmpty={standings.length === 0 || standings[0]?.length === 0}
      emptyIcon={<ClipboardList className="w-7 h-7 text-[var(--brand)] mb-2" />}
      emptyMessage="No standings available for this league."
      title="Standings"
    >
      {standings.map((group, i) => (
        <section key={i} className="card fade-up">
          {standings.length > 1 && (
            <h3 className="text-sm font-semibold text-[var(--primary)] mb-4">
              {group[0]?.group || `Group ${String.fromCharCode(65 + i)}`}
            </h3>
          )}
          <StandingsTable standings={group} leagueId={leagueId} />
        </section>
      ))}
    </AsyncSection>
  );
}

async function FixturesSection({ leagueId, timezone }: { leagueId: number; timezone?: string | undefined }) {
  const fixtureList = await captureCatch(getFixturesByLeague(leagueId, CURRENT_SEASON, timezone), []);
  const now = new Date();
  const recent = fixtureList
    .filter(f => new Date(f.fixture.date) < now && f.fixture.status.short === 'FT')
    .slice(-5).reverse();
  const upcoming = fixtureList
    .filter(f => f.fixture.status.short === 'NS')
    .slice(0, 5);

  return (
    <AsyncSection
      error={null}
      isEmpty={recent.length === 0 && upcoming.length === 0}
      emptyIcon={<Calendar className="w-7 h-7 text-[var(--brand)] mb-2"/>}
      emptyMessage="No fixtures available for this league yet."
    >
      {recent.length > 0 && (
        <section className="fade-up fade-up-delay-1">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-3">Recent Results</h2>
          <div className="space-y-2">
            {recent.map(f => <MatchCard key={f.fixture.id} fixture={f} compact timezone={timezone} />)}
          </div>
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="fade-up fade-up-delay-2 mt-6">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-3">Upcoming Fixtures</h2>
          <div className="space-y-2">
            {upcoming.map(f => <MatchCard key={f.fixture.id} fixture={f} compact timezone={timezone} />)}
          </div>
        </section>
      )}
    </AsyncSection>
  );
}

async function LeagueOverviewSection({ leagueName, country, type, season }: { leagueName: string; country: string; type: string; season: number }) {
  const overview = await generateLeagueOverview(leagueName, country, type, season);

  if (!overview) return null;

  return (
    <section className="card p-8 mt-8 mb-6 fade-up [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:text-[#fff] [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-base [&_strong]:text-white">
      <div dangerouslySetInnerHTML={{ __html: overview }} />
    </section>
  );
}

async function SeasonSelector({ leagueId, selectedSeason }: { leagueId: number; selectedSeason: number }) {
  const seasons = await captureCatch(getSeasons(), []);
  const leagueSeasons = await captureCatch(
    getLeagueById(leagueId).then(r => r[0]?.seasons?.map(s => s.year) ?? []),
    []
  );
  const available = leagueSeasons.length ? leagueSeasons : seasons.slice(-5);

  return (
    <div className="card p-3 mb-8 fade-up">
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="w-4 h-4 text-[var(--brand)]" />
        <span className="text-xs font-black text-white uppercase tracking-widest mr-2">Season:</span>
        {available.map(year => (
          <Link
            key={year}
            href={`?season=${year}`}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedSeason === year
                ? 'bg-[var(--brand)] text-black'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {year}
          </Link>
        ))}
      </div>
    </div>
  );
}

async function RoundSelector({ leagueId, selectedRound }: { leagueId: number; selectedRound?: string }) {
  const rounds = await captureCatch(getFixtureRounds(leagueId, CURRENT_SEASON), []);

  if (!rounds.length) return null;

  return (
    <div className="card p-4 fade-up">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-[var(--brand)]" />
        <span className="text-xs font-black text-white uppercase tracking-widest">Filter by Round</span>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {rounds.map(round => {
          const isSelected = selectedRound === round || (!selectedRound && rounds.indexOf(round) === rounds.length - 1);
          return (
            <Link
              key={round}
              href={`?round=${encodeURIComponent(round)}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[var(--brand)] text-black'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {round.replace('Regular Season - ', '')}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

async function TopScorersSection({ leagueId }: { leagueId: number }) {
  const scorers = (await captureCatch(getTopScorers(leagueId, CURRENT_SEASON), [])) ?? [];
  return (
    <div className="card fade-up fade-up-delay-1">
      <h2 className="section-title">Top Scorers</h2>
      <PlayerStatsTable players={scorers.slice(0, 10)} statKey="goals" emptyMessage="No top scorer data available." />
    </div>
  );
}

async function TopAssistsSection({ leagueId }: { leagueId: number }) {
  const assists = (await captureCatch(getTopAssists(leagueId, CURRENT_SEASON), [])) ?? [];
  return (
    <div className="card fade-up fade-up-delay-2 mt-6">
      <h2 className="section-title">Top Assists</h2>
      <PlayerStatsTable players={assists.slice(0, 10)} statKey="assists" emptyMessage="No top assists data available." />
    </div>
  );
}

async function TopYellowCardsSection({ leagueId }: { leagueId: number }) {
  const yellows = (await captureCatch(getTopYellowCards(leagueId, CURRENT_SEASON), [])) ?? [];
  return (
    <div className="card fade-up fade-up-delay-3 mt-6">
      <h2 className="section-title">Top Yellow Cards</h2>
      <PlayerStatsTable players={yellows.slice(0, 10)} statKey="yellow" emptyMessage="No yellow card data available." />
    </div>
  );
}

async function TopRedCardsSection({ leagueId }: { leagueId: number }) {
  const reds = (await captureCatch(getTopRedCards(leagueId, CURRENT_SEASON), [])) ?? [];
  return (
    <div className="card fade-up fade-up-delay-4 mt-6">
      <h2 className="section-title">Top Red Cards</h2>
      <PlayerStatsTable players={reds.slice(0, 10)} statKey="red" emptyMessage="No red card data available." />
    </div>
  );
}

export default async function LeaguePage({ params, searchParams }: Props) {
  const param = (await params).slug;
  const sp = await searchParams;
  const selectedRound = sp?.round;
  const selectedSeason = sp?.season ? Number(sp.season) : CURRENT_SEASON;
  const tz = sp?.tz;

  if (/^\d+$/.test(param)) {
    const slug = LEAGUE_ID_TO_SLUG.get(Number(param));
    if (slug) redirect(`/league/${slug}`);
    notFound();
  }

  let leagueId = LEAGUE_SLUG_MAP.get(param);

  if (!leagueId) {
    const fallback = await captureCatch(
      getLeaguesSearch(param.replace(/-/g, ' ')),
      []
    );
    leagueId = fallback[0]?.league?.id ?? null;
  }

  if (!leagueId) notFound();

  let leagueList: import('@/lib/apifootball').LeagueResponse[] = [];
  let error: string | null = null;

  try {
    leagueList = await getLeagueById(leagueId);
  } catch (err: any) {
    error = err.message || 'API Error';
  }

  if (error || !leagueList.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="card p-12 max-w-md mx-auto">
          <Activity className="w-12 h-12 text-[var(--danger)] mx-auto mb-4 opacity-50" />
          <h1 className="text-xl font-bold mb-2">Data Unavailable</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {error?.includes('limit')
              ? 'The API request limit has been reached for today. Please try again later or configure a persistent cache.'
              : 'We are currently unable to fetch data for this league. Please check your connection or try again later.'}
          </p>
          <Link href="/" className="btn-primary inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  const leagueInfo = leagueList[0];
  const jsonLd = generateSportsOrgLD({
    name: leagueInfo.league.name,
    logo: leagueInfo.league.logo,
    url: `https://activesports.live/league/${param}`,
    country: leagueInfo.country.name,
    description: `${leagueInfo.league.name} standings, top scorers, fixtures and results.`,
  });

  const breadcrumbLd = generateBreadcrumbLD([
    { name: 'Home', item: 'https://activesports.live' },
    { name: 'Leagues', item: 'https://activesports.live/leagues' },
    { name: leagueInfo.league.name, item: `https://activesports.live/league/${param}` },
  ]);

  const [standingsData, scorersRes, assistsRes, currentRoundRes] = await Promise.all([
    captureCatch(getStandings(leagueId, selectedSeason), []),
    captureCatch(getTopScorers(leagueId, selectedSeason), []),
    captureCatch(getTopAssists(leagueId, selectedSeason), []),
    captureCatch(getFixtureRounds(leagueId, selectedSeason, true), []),
  ]);

  const standings = standingsData[0]?.league?.standings ?? [];
  const allTeams = standings.flat();
  const numTeams = allTeams.length;
  const leader = allTeams.find(t => t.rank === 1);
  const topScorer = scorersRes?.[0];
  const topAssistant = assistsRes?.[0];
  const currentRound = currentRoundRes?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Cinematic Hero Section */}
      <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] mb-6 sm:mb-10 card border-0 group fade-up">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/media/hero/stadium.png" 
            alt="Background" 
            fill 
            className="object-cover opacity-20 grayscale scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-base)] via-[var(--bg-base)]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-base)]/50 to-[var(--bg-base)]" />
        </div>

        <div className="relative z-10 p-5 sm:p-10 lg:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Logo Wrapper */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="absolute -inset-4 bg-[var(--brand)]/10 blur-2xl rounded-full opacity-50" />
              <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 sm:p-6 shadow-2xl flex items-center justify-center">
                <Image
                  src={leagueInfo.league.logo}
                  alt={leagueInfo.league.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] text-[10px] font-black uppercase tracking-wider border border-[var(--brand)]/20 backdrop-blur-sm">
                  {leagueInfo.league.type}
                </span>
                {leagueInfo.country.name !== 'World' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    {leagueInfo.country.flag && (
                      <Image src={leagueInfo.country.flag} alt={leagueInfo.country.name} width={16} height={12} className="rounded-[2px]" />
                    )}
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      {leagueInfo.country.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Season {selectedSeason}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight sm:leading-[1.1]">
                {leagueInfo.league.name}
              </h1>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-start gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <Users className="w-5 h-5 text-[var(--brand)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Teams</p>
                    <p className="text-lg font-bold text-white leading-none">{numTeams || '--'}</p>
                  </div>
                </div>

                {leader && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Trophy className="w-5 h-5 text-[var(--warning)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Leader</p>
                      <p className="text-lg font-bold text-white leading-none truncate max-w-[120px] sm:max-w-none">
                        {leader.team.name}
                      </p>
                    </div>
                  </div>
                )}

                {topScorer && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Award className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Top Scorer</p>
                      <p className="text-lg font-bold text-white leading-none truncate max-w-[120px] sm:max-w-none">
                        {topScorer.player.name} ({topScorer.statistics[0].goals.total})
                      </p>
                    </div>
                  </div>
                )}

                {topAssistant && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Activity className="w-5 h-5 text-[var(--brand)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Top Assists</p>
                      <p className="text-lg font-bold text-white leading-none truncate max-w-[120px] sm:max-w-none">
                        {topAssistant.player.name} ({topAssistant.statistics[0].goals.assists})
                      </p>
                    </div>
                  </div>
                )}

                {currentRound && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Flag className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Current Round</p>
                      <p className="text-lg font-bold text-white leading-none truncate max-w-[120px] sm:max-w-none">
                        {currentRound.replace('Regular Season - ', '')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="card p-3 mb-8"><div className="skeleton h-6 w-48" /></div>}>
        <SeasonSelector leagueId={leagueId} selectedSeason={selectedSeason} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<div className="card"><SkeletonTable rows={10} /></div>}>
            <StandingsSection leagueId={leagueId} />
          </Suspense>
          <Suspense fallback={<div className="card p-4"><div className="skeleton h-8 w-full" /></div>}>
            <RoundSelector leagueId={leagueId} {...(selectedRound ? { selectedRound } : {})} />
          </Suspense>
          <Suspense fallback={<div className="space-y-2"><SkeletonFixtureList count={5} /></div>}>
            <FixturesSection leagueId={leagueId} timezone={tz} />
          </Suspense>
        </div>
        <aside className="fade-up fade-up-delay-1 space-y-6">
          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-5 w-5 rounded" /><div className="skeleton h-7 w-7 rounded-full" /><div className="skeleton h-4 flex-1" /><div className="skeleton h-5 w-7" /></div>)}</div>}>
            <TopScorersSection leagueId={leagueId} />
          </Suspense>
          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-5 w-5 rounded" /><div className="skeleton h-7 w-7 rounded-full" /><div className="skeleton h-4 flex-1" /><div className="skeleton h-5 w-7" /></div>)}</div>}>
            <TopAssistsSection leagueId={leagueId} />
          </Suspense>
          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-5 w-5 rounded" /><div className="skeleton h-7 w-7 rounded-full" /><div className="skeleton h-4 flex-1" /><div className="skeleton h-5 w-7" /></div>)}</div>}>
            <TopYellowCardsSection leagueId={leagueId} />
          </Suspense>
          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="skeleton h-5 w-5 rounded" /><div className="skeleton h-7 w-7 rounded-full" /><div className="skeleton h-4 flex-1" /><div className="skeleton h-5 w-7" /></div>)}</div>}>
            <TopRedCardsSection leagueId={leagueId} />
          </Suspense>
        </aside>
      </div>

      <Suspense fallback={
        <div className="card p-6 mb-6 fade-up">
          <div className="skeleton h-4 w-3/4 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-5/6 mb-2" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      }>
        <LeagueOverviewSection
          leagueName={leagueInfo.league.name}
          country={leagueInfo.country.name}
          type={leagueInfo.league.type}
          season={selectedSeason}
        />
      </Suspense>
    </div>
  );
}
