import { getTodayFixtures, getLiveFixtures, Fixture } from '@/lib/apifootball';
import { DEFAULT_TIMEZONE, TZ_COOKIE_NAME, formatMatchTime } from '@/lib/utils';
import MatchCard from '@/components/MatchCard';
import FallbackState from '@/components/FallbackState';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Activity, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import HeroCarousel from '@/components/home/HeroCarousel';
import TransferHub from '../components/home/TransferHub'; // Using relative path to troubleshoot
import TopStandings from '@/components/home/TopStandings';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Live Football Scores & Official Match Insights | ActiveSports',
  description: 'Real-time football scores, official match insights, predictions, and advanced stats — all in one fast experience.',
  alternates: {
    canonical: '/',
  },
};

interface HomeProps {
  searchParams?: Promise<{ tz?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const selectedTz = sp?.tz || cookieStore.get(TZ_COOKIE_NAME)?.value || DEFAULT_TIMEZONE;

  let liveFixtures: Fixture[] = [];
  let todayFixtures: Fixture[] = [];
  let fetchError: string | null = null;

  try {
    [liveFixtures, todayFixtures] = await Promise.all([
      getLiveFixtures(selectedTz),
      getTodayFixtures(selectedTz),
    ]);
  } catch (err) {
    Sentry.captureException(err);
    fetchError = err instanceof Error ? err.message : 'Failed to load fixtures';
  }

  const fixturesByLeague = todayFixtures.reduce<Record<string, Fixture[]>>(
    (acc, f) => {
      const key = `${f.league.id}__${f.league.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24 mb-20">

      {/* 1. Hero Carousel */}
      <HeroCarousel liveFixtures={liveFixtures} todayFixtures={todayFixtures} timezone={selectedTz} />

      {/* 2. Live Now */}
      {liveFixtures.length > 0 && (
        <section className="fade-up">
          <div className="flex items-center justify-between mb-8">
            <div className="premium-heading">
               <div className="heading-accent" />
               <h2 className="flex items-center gap-4">
                  Live <span className="text-[var(--brand)]">Now</span>
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                  </span>
               </h2>
            </div>
            <Link href="/fixtures" className="hidden sm:flex items-center gap-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--brand)] uppercase tracking-widest transition-colors">
              Full Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {liveFixtures.slice(0, 8).map((f) => (
              <MatchCard key={f.fixture.id} fixture={f} timezone={selectedTz} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Today's Fixtures by League */}
      {!fetchError && Object.keys(fixturesByLeague).length > 0 && (
        <section className="fade-up">
          <div className="flex items-center justify-between mb-8">
            <div className="premium-heading">
              <div className="heading-accent" />
              <h2>Today&apos;s <span className="text-[var(--brand)]">Fixtures</span></h2>
            </div>
            <Link
              href="/fixtures"
              className="hidden sm:flex items-center gap-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--brand)] uppercase tracking-widest transition-colors"
            >
              Full Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(fixturesByLeague).slice(0, 9).map(([key, fixtures]) => {
              const league = fixtures[0].league;
              const liveCount = fixtures.filter(f => ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short)).length;
              const firstKickoff = Math.min(...fixtures.map(f => new Date(f.fixture.date).getTime()));
              return (
                <Link
                  key={key}
                  href={`/league/${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="card group relative overflow-hidden border border-[var(--border)] hover:border-[var(--brand)]/40 transition-all rounded-2xl p-5"
                >
                  {/* Subtle league logo watermark */}
                  {league.logo && (
                    <div className="absolute -top-4 -right-4 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500">
                      <img src={league.logo} alt="" width={100} height={100} />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      {league.logo && <img src={league.logo} alt={league.name} width={22} height={22} className="shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white truncate group-hover:text-[var(--brand)] transition-colors">{league.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {liveCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest">
                            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" /></span>
                            {liveCount} Live
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">{fixtures.length}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {fixtures.slice(0, 5).map(f => {
                        const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short);
                        const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short);
                        return (
                          <div key={f.fixture.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                            <span className={`w-12 text-[10px] font-bold font-mono text-center ${
                              isLive ? 'text-red-400' : isFinished ? 'text-[var(--text-muted)]' : 'text-white/60'
                            }`}>
                              {isLive ? `${f.fixture.status.elapsed}'` : isFinished ? 'FT' : formatMatchTime(f.fixture.date, selectedTz)}
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <img src={f.teams.home.logo} alt="" width={14} height={14} className="shrink-0" />
                              <span className={`text-[11px] truncate ${isFinished && f.teams.home.winner === false ? 'text-[var(--text-muted)]' : 'text-[var(--text-body)]'}`}>{f.teams.home.name}</span>
                            </div>
                            <span className={`text-[11px] font-bold font-mono min-w-[28px] text-center ${
                              isLive ? 'text-white' : isFinished ? (f.teams.home.winner ? 'text-[var(--brand)]' : f.teams.away.winner ? 'text-[var(--brand)]' : 'text-white') : 'text-[var(--text-muted)]'
                            }`}>
                              {isFinished || isLive ? `${f.goals.home ?? 0}–${f.goals.away ?? 0}` : 'vs'}
                            </span>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                              <span className={`text-[11px] truncate ${isFinished && f.teams.away.winner === false ? 'text-[var(--text-muted)]' : 'text-[var(--text-body)]'}`}>{f.teams.away.name}</span>
                              <img src={f.teams.away.logo} alt="" width={14} height={14} className="shrink-0" />
                            </div>
                          </div>
                        );
                      })}
                      {fixtures.length > 5 && (
                        <div className="text-[10px] text-center text-[var(--text-muted)] font-bold pt-1 opacity-0 group-hover:opacity-100 transition-all">
                          View all {fixtures.length} matches →
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {Object.keys(fixturesByLeague).length > 9 && (
            <div className="mt-8 text-center">
              <Link
                href="/fixtures"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all"
              >
                View All {Object.keys(fixturesByLeague).length} Leagues <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 4. Global Transfer Hub */}
      <section className="fade-up">
         <div className="premium-heading mb-8">
            <div className="heading-accent" />
            <h2>Transfer <span className="text-[var(--brand)]">Market</span></h2>
         </div>
         <TransferHub />
      </section>

      {/* 5. Top Leagues */}
      <section className="fade-up">
         <div className="premium-heading mb-8">
            <div className="heading-accent" />
            <h2>League <span className="text-[var(--brand)]">Standings</span></h2>
         </div>
         <TopStandings />
      </section>

      {/* Error State */}
      {fetchError && (
        <section className="fade-up">
          <FallbackState
            icon={<Activity />}
            title="Unable to load fixtures"
            message={fetchError}
            variant="error"
          />
        </section>
      )}

    </div>
  );
}
