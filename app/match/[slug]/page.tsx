import Link from 'next/link';
import { Search, Zap, Calendar, Trophy } from 'lucide-react';
import {
  getFixtureById, getFixtureStatistics, getFixtureEvents,
  getFixtureLineups, getPredictions, getOdds, getLiveOdds,
  getLiveFixtures, getTodayFixtures, getHeadToHead
} from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import type { Metadata } from 'next';
import { toSlug, matchSlug } from '@/lib/slug';
import MatchContent from '@/components/MatchContent';
import { generateSportsEventLD, generateBreadcrumbLD } from '@/lib/json-ld';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ tz?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  const fixtureId = await resolveFixtureId(param);
  
  if (!fixtureId) return { title: 'Match Not Found', robots: { index: false } };
  
  const fixtures = await captureCatch(getFixtureById(fixtureId), []);
  if (!fixtures.length) return { title: 'Match Not Found', robots: { index: false } };
  
  const f = fixtures[0];
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short);
  const homeName = f.teams.home.name;
  const awayName = f.teams.away.name;
  
  const title = isLive 
    ? `LIVE: ${homeName} ${f.goals.home ?? 0}-${f.goals.away ?? 0} ${awayName} | Score & Stats` 
    : `${homeName} vs ${awayName} | Match Preview, Score & Lineups`;

  return {
    title,
    description: `Real-time ${f.league.name} coverage: ${homeName} vs ${awayName}. Live scores, detailed statistics, starting lineups, and tactical analysis.`,
    keywords: [`${homeName} vs ${awayName}`, `${homeName} live score`, `${awayName} stats`, f.league.name, 'football results'],
    openGraph: {
      title,
      description: `Track ${homeName} vs ${awayName} live on ActiveSports.`,
      images: [f.league.logo],
    },
    alternates: {
      canonical: `https://activesports.live/match/${param}`,
    },
  };
}

async function resolveFixtureId(param: string): Promise<number | null> {
  // 1. Check if ID directly
  if (/^\d+$/.test(param)) return Number(param);

  // 2. Check live fixtures first (High priority for real-time clicks)
  try {
    const { getLiveFixtures } = await import('@/lib/apifootball');
    const live = await getLiveFixtures();
    for (const fx of live) {
      if (matchSlug(fx.teams.home.name, fx.teams.away.name) === param) {
        return fx.fixture.id;
      }
    }
  } catch (err) {
    console.error('Live resolution failed:', err);
  }

  // 3. Check Slug Map (Cached index)
  try {
    const { getMatchSlugMap } = await import('@/lib/slug-maps');
    const matchMap = await getMatchSlugMap();
    const idFromMap = matchMap.get(param);
    if (idFromMap) return idFromMap;
  } catch {}

  // 4. Deep Fallback: Team Search + H2H
  const parts = param.split('-vs-');
  if (parts.length !== 2) return null;

  const [homeSlugPart, awaySlugPart] = parts;
  const homeSearch = homeSlugPart.replace(/-/g, ' ');
  const awaySearch = awaySlugPart.replace(/-/g, ' ');

  try {
    const { getTeamsSearch, getHeadToHead, getFixturesByTeam, CURRENT_SEASON } = await import('@/lib/apifootball');
    const [homeResults, awayResults] = await Promise.allSettled([
      getTeamsSearch(homeSearch),
      getTeamsSearch(awaySearch),
    ]);

    const homeTeams = homeResults.status === 'fulfilled' ? homeResults.value : [];
    const awayTeams = awayResults.status === 'fulfilled' ? awayResults.value : [];

    if (homeTeams.length && awayTeams.length) {
      const homeId = homeTeams[0].team.id;
      const awayId = awayTeams[0].team.id;

      // Check current season fixtures for these teams
      const [homeRecent, h2h] = await Promise.all([
        getFixturesByTeam(homeId, CURRENT_SEASON),
        getHeadToHead(`${homeId}-${awayId}`, 5)
      ]);

      const allPossible = [...h2h, ...homeRecent];
      for (const fx of allPossible) {
        if (matchSlug(fx.teams.home.name, fx.teams.away.name) === param) {
          return fx.fixture.id;
        }
      }
    }
  } catch (err) {
    console.error('Deep resolution failed:', err);
  }

  return null;
}

export default async function MatchPage({ params, searchParams }: Props) {
  const param = (await params).slug;
  const sp = await searchParams;
  const tz = sp?.tz;
  const fixtureId = await resolveFixtureId(param);

  if (!fixtureId) {
    return <MatchNotFound slug={param} />;
  }

  const [fixtures, statsRes, eventsRes, lineupsRes, predictionsRes, oddsRes, liveOddsRes] = await Promise.allSettled([
    getFixtureById(fixtureId),
    getFixtureStatistics(fixtureId),
    getFixtureEvents(fixtureId),
    getFixtureLineups(fixtureId),
    getPredictions(fixtureId),
    getOdds(fixtureId),
    getLiveOdds(fixtureId),
  ]);

  const fixtureList = fixtures.status === 'fulfilled' ? fixtures.value : [];
  if (!fixtureList.length) {
    return <MatchNotFound slug={param} />;
  }

  const fixture = fixtureList[0];
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.fixture.status.short);

  const stats = statsRes.status === 'fulfilled' ? statsRes.value : [];
  const events = eventsRes.status === 'fulfilled' ? eventsRes.value : [];
  const lineups = lineupsRes.status === 'fulfilled' ? lineupsRes.value : [];
  const predictionData = predictionsRes.status === 'fulfilled' ? predictionsRes.value[0] : null;
  const oddsData = oddsRes.status === 'fulfilled' ? oddsRes.value[0] : null;
  const liveOddsData = liveOddsRes.status === 'fulfilled' ? liveOddsRes.value : [];

  const h2hFixtures = await captureCatch(
    getHeadToHead(`${fixture.teams.home.id}-${fixture.teams.away.id}`, 5),
    []
  );

  const [moreLive, moreToday] = await Promise.allSettled([
    getLiveFixtures(),
    getTodayFixtures(tz),
  ]);

  const jsonLd = generateSportsEventLD({
    name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    startDate: fixture.fixture.date,
    location: fixture.fixture.venue.name,
    homeTeam: { 
      name: fixture.teams.home.name, 
      logo: fixture.teams.home.logo,
      url: `https://activesports.live/team/${toSlug(fixture.teams.home.name)}`
    },
    awayTeam: { 
      name: fixture.teams.away.name, 
      logo: fixture.teams.away.logo,
      url: `https://activesports.live/team/${toSlug(fixture.teams.away.name)}`
    },
    url: `https://activesports.live/match/${param}`,
    description: `Watch ${fixture.teams.home.name} vs ${fixture.teams.away.name} live score and stats.`,
    eventStatus: fixture.fixture.status.short === 'FT' ? 'EventScheduled' : 'EventScheduled', // Simplified for now
  });

  const breadcrumbLd = generateBreadcrumbLD([
    { name: 'Home', item: 'https://activesports.live' },
    { name: 'Fixtures', item: 'https://activesports.live/fixtures' },
    { name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`, item: `https://activesports.live/match/${param}` },
  ]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <MatchContent
        fixtureId={fixtureId}
        fixture={fixture}
        stats={stats}
        events={events}
        lineups={lineups}
        h2hFixtures={h2hFixtures}
        predictionData={predictionData}
        oddsData={oddsData}
        liveOddsData={liveOddsData}
        isLive={isLive}
        moreLive={moreLive.status === 'fulfilled' ? moreLive.value : []}
        moreToday={moreToday.status === 'fulfilled' ? moreToday.value : []}
        slug={param}
        timezone={tz}
      />
    </div>
  );
}

function MatchNotFound({ slug }: { slug: string }) {
  const isNumeric = /^\d+$/.test(slug);
  const parts = slug.split('-vs-');
  const hasTeams = parts.length === 2;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-3xl fade-up">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-body)] to-black" />
        <div className="relative px-8 sm:px-12 py-16 sm:py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--brand-dim)] to-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(33,150,243,0.15)]">
            <Search className="w-10 h-10 text-[var(--brand)]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-4 tracking-tight">
            Match <span className="text-[var(--brand)]">Not Found</span>
          </h1>

          <p className="text-[var(--text-muted)] max-w-lg mx-auto mb-8 leading-relaxed text-sm">
            {isNumeric
              ? `We couldn&apos;t find a match with fixture ID ${slug}. It may have been removed or the ID might be incorrect.`
              : hasTeams
              ? `We couldn&apos;t find a match between &ldquo;${parts[0].replace(/-/g, ' ')}&rdquo; and &ldquo;${parts[1].replace(/-/g, ' ')}&rdquo;. The match may not be in our database yet, or the teams might be from a league we haven&apos;t indexed.`
              : `We couldn&apos;t find a match for &ldquo;${slug}&rdquo;. The URL might be incorrect or the match data is temporarily unavailable.`}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link
              href="/"
              className="px-8 py-4 bg-[var(--brand)] text-black font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]"
            >
              <Zap className="w-5 h-5" /> Live Scores
            </Link>
            <Link
              href="/fixtures"
              className="px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all"
            >
              <Calendar className="w-5 h-5" /> Match Schedule
            </Link>
            <Link
              href="/leagues"
              className="px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all"
            >
              <Trophy className="w-5 h-5" /> Browse Leagues
            </Link>
          </div>

          {hasTeams && (
            <div className="border-t border-white/5 pt-8">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-4">
                Try searching for these teams
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/search?q=${encodeURIComponent(parts[0].replace(/-/g, ' '))}`}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-white/10 text-sm font-bold text-white hover:border-[var(--brand)] transition-colors"
                >
                  {parts[0].replace(/-/g, ' ')}
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(parts[1].replace(/-/g, ' '))}`}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-white/10 text-sm font-bold text-white hover:border-[var(--brand)] transition-colors"
                >
                  {parts[1].replace(/-/g, ' ')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
