import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Zap, BarChart3, Shield, ChevronRight, Activity, AlertTriangle, Target, Globe, Clock, Trophy, List } from 'lucide-react';
import { getTodayFixtures, getOddsByDate, getBookmakers, getOddsLiveBets, MAJOR_LEAGUES } from '@/lib/apifootball';
import { toSlug, matchSlug } from '@/lib/slug';
import OddsTable from '@/components/OddsTable';
import { captureCatch, DEFAULT_TIMEZONE, TZ_COOKIE_NAME, getTodayDate, formatMatchTime } from '@/lib/utils';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const revalidate = 180;

export const metadata: Metadata = {
  title: 'Odds Comparison Hub — ActiveSports',
  description:
    "Today's football match odds across major leagues. Compare 1X2 bookmaker odds for all matches. Updated every 3 minutes.",
  openGraph: {
    title: 'Odds Comparison Hub | ActiveSports',
    description: 'Compare real-time 1X2 odds across major bookmakers for every match.',
  },
};

interface MatchOdds {
  fixture: import('@/lib/apifootball').Fixture;
  bookmakers: import('@/lib/apifootball').OddsResponse['bookmakers'];
}

const oddsStats = [
  { icon: Globe, label: 'Leagues Covered', value: '8+' },
  { icon: Target, label: 'Daily Matches', value: '50+' },
  { icon: Clock, label: 'Update Frequency', value: '3 min' },
  { icon: BarChart3, label: 'Bookmakers', value: '15+' },
];

interface PageProps {
  searchParams?: Promise<{ bookmaker?: string; tz?: string }>;
}

export default async function OddsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedBookmaker = params?.bookmaker;
  const cookieStore = await cookies();
  const tz = params?.tz || cookieStore.get(TZ_COOKIE_NAME)?.value || DEFAULT_TIMEZONE;

  const fixtures = await getTodayFixtures(tz).catch(() => []);

  const majorLeagueIds = new Set(MAJOR_LEAGUES.map((l) => l.id));
  const majorFixtures = fixtures
    .filter(
      (f) =>
        majorLeagueIds.has(f.league.id) &&
        ['NS', '1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short)
    )
    .slice(0, 20);

  const todayStr = getTodayDate(tz);
  const [allOdds, bookmakersList, liveBets] = await Promise.all([
    getOddsByDate(todayStr).catch(() => []),
    captureCatch(getBookmakers(), []),
    captureCatch(getOddsLiveBets(), []),
  ]);
  const oddsMap = new Map<number, import('@/lib/apifootball').OddsResponse['bookmakers']>();
  for (const odd of allOdds) {
    oddsMap.set(odd.fixture.id, odd.bookmakers);
  }

  const matchesWithOdds: MatchOdds[] = majorFixtures.map((fixture) => {
    let bookmakers = oddsMap.get(fixture.fixture.id) || [];
    if (selectedBookmaker) {
      bookmakers = bookmakers.filter(b => b.name.toLowerCase().includes(selectedBookmaker.toLowerCase()));
    }
    return { fixture, bookmakers };
  }).filter(m => selectedBookmaker ? m.bookmakers.length > 0 : true);

  const byLeague: Record<string, MatchOdds[]> = {};
  for (const m of matchesWithOdds) {
    const key = `${m.fixture.league.id}:${m.fixture.league.name}`;
    if (!byLeague[key]) byLeague[key] = [];
    byLeague[key].push(m);
  }

  const hasData = matchesWithOdds.length > 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <TrendingUp className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>

        <div className="relative z-10 p-8 sm:p-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3 fill-current" /> Live Odds. Real-Time Data.
              </div>

              <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
                Odds <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
                  Comparison Hub
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed max-w-xl">
                Compare 1X2 odds across major bookmakers in real-time. Make informed decisions with up-to-the-minute data from the world&apos;s top football competitions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="#odds-live" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                  View Live Odds <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/predictions" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                  <Target className="w-5 h-5" /> Make Predictions
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[var(--border)] pt-8">
                {oddsStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-[var(--brand)]" />
                    </div>
                    <div>
                      <div className="text-white font-black text-lg leading-none">{stat.value}</div>
                      <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="card p-8 w-80 space-y-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">1X2 Odds</span>
                  <span className="text-[10px] font-bold text-[var(--success)] flex items-center gap-1"><Activity className="w-3 h-3" /> Live</span>
                </div>
                {[
                  { home: '1.85', draw: '3.40', away: '4.20', match: 'Man City vs Arsenal' },
                  { home: '2.10', draw: '3.25', away: '3.60', match: 'Real Madrid vs Barça' },
                  { home: '1.55', draw: '4.00', away: '6.50', match: 'Bayern vs Dortmund' },
                ].map((row, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[11px] font-bold text-[var(--text-muted)]">{row.match}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center border border-[var(--border)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">1</div>
                        <div className="text-sm font-black text-[var(--success)]">{row.home}</div>
                      </div>
                      <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center border border-[var(--border)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">X</div>
                        <div className="text-sm font-black text-[var(--warning)]">{row.draw}</div>
                      </div>
                      <div className="bg-[var(--bg-base)] rounded-lg p-2 text-center border border-[var(--border)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">2</div>
                        <div className="text-sm font-black text-[var(--danger)]">{row.away}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEGEND ─────────────────────────────────────────────── */}
      <section id="odds-live" className="mb-8 fade-up">
        <div className="card p-5 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--brand)]" />
            <span className="font-black text-white uppercase tracking-widest">Odds Guide</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded">1.xx</span>
            <span className="text-[var(--text-muted)]">Heavy favourite</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-1 rounded">2.xx</span>
            <span className="text-[var(--text-muted)]">Moderate chance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded">3.xx+</span>
            <span className="text-[var(--text-muted)]">Underdog</span>
          </div>
          <span className="ml-auto text-[var(--text-muted)] font-medium">Decimal format (European)</span>
        </div>
      </section>

      {/* ── LIVE BET TYPES ───────────────────────────────────── */}
      {liveBets.length > 0 && (
        <section className="mb-8 fade-up">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-[var(--brand)]" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Available Live Bet Types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {liveBets.map(b => (
                <span key={b.id} className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-muted)]">
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOOKMAKER FILTER ──────────────────────────────────── */}
      {bookmakersList.length > 0 && (
        <section className="mb-8 fade-up">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[var(--brand)]" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Filter by Bookmaker</span>
              {selectedBookmaker && (
                <Link href="/odds" className="ml-auto text-xs text-[var(--brand)] hover:underline">
                  Clear filter
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/odds"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !selectedBookmaker
                    ? 'bg-[var(--brand)] text-black'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                }`}
              >
                All
              </Link>
              {bookmakersList.slice(0, 20).map(bm => (
                <Link
                  key={bm.id}
                  href={`/odds?bookmaker=${encodeURIComponent(bm.name)}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedBookmaker?.toLowerCase() === bm.name.toLowerCase()
                      ? 'bg-[var(--brand)] text-black'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  {bm.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ODDS DATA ──────────────────────────────────────────── */}
      {!hasData ? (
        <div className="card p-16 text-center fade-up border border-dashed border-[var(--border)]">
          <div className="w-20 h-20 rounded-2xl bg-[var(--brand-dim)] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-[var(--warning)]" />
          </div>
          <h2 className="text-2xl font-display font-black text-white mb-3">No Odds Available Today</h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8 leading-relaxed">
            Odds data may not be available on the free API tier, or there are no major matches scheduled for today. Check back during matchdays.
          </p>
          <Link href="/" className="card px-8 py-4 bg-[var(--brand)] text-black font-black inline-flex items-center gap-3 hover:scale-105 transition-all">
            View Today&apos;s Matches <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(byLeague).map(([leagueKey, matches], lIdx) => {
            const [leagueIdStr, leagueName] = leagueKey.split(':');
            const leagueLogo = matches[0]?.fixture.league.logo;

            return (
              <section key={leagueKey} className={`fade-up fade-up-delay-${lIdx % 3}`}>
                <div className="flex items-center gap-4 mb-6">
                  {leagueLogo && (
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center p-2">
                      <Image src={leagueLogo} alt={leagueName} width={32} height={32} />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/league/${toSlug(leagueName)}`}
                      className="font-bold text-xl text-white hover:text-[var(--brand)] transition-colors"
                    >
                      {leagueName}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      {matches.length} match{matches.length !== 1 ? 'es' : ''} with live odds
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {matches.map(({ fixture, bookmakers }) => {
                    const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(
                      fixture.fixture.status.short
                    );
                    return (
                      <div key={fixture.fixture.id} className="card p-0 overflow-hidden">
                        {/* Match Header */}
                        <div className="p-5 flex items-center gap-4 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                            <span className="text-sm font-bold text-white truncate text-right hidden sm:block">
                              {fixture.teams.home.name}
                            </span>
                            <Image
                              src={fixture.teams.home.logo}
                              alt={fixture.teams.home.name}
                              width={32}
                              height={32}
                              className="shrink-0"
                            />
                            <span className="text-sm font-bold text-white truncate text-right sm:hidden">
                              {fixture.teams.home.name}
                            </span>
                          </div>

                          <Link
                            href={`/match/${matchSlug(fixture.teams.home.name, fixture.teams.away.name)}`}
                            className="flex flex-col items-center gap-1 min-w-[80px]"
                          >
                            {fixture.fixture.status.short === 'NS' ? (
                              <span className="text-sm font-black text-[var(--text-muted)]">
                                {formatMatchTime(fixture.fixture.date, tz)}
                              </span>
                            ) : (
                              <span className="text-2xl font-display font-black text-white tracking-tighter">
                                {fixture.goals.home ?? 0} <span className="text-lg opacity-50">–</span> {fixture.goals.away ?? 0}
                              </span>
                            )}
                            {isLive && (
                              <span className="flex items-center gap-1.5 text-xs font-black" style={{ color: 'var(--danger)' }}>
                                <span className="live-dot" />
                                LIVE
                              </span>
                            )}
                          </Link>

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Image
                              src={fixture.teams.away.logo}
                              alt={fixture.teams.away.name}
                              width={32}
                              height={32}
                              className="shrink-0"
                            />
                            <span className="text-sm font-bold text-white truncate hidden sm:block">
                              {fixture.teams.away.name}
                            </span>
                            <span className="text-sm font-bold text-white truncate sm:hidden">
                              {fixture.teams.away.name}
                            </span>
                          </div>
                        </div>

                        {/* Odds Table */}
                        <div className="p-5">
                          {bookmakers.length > 0 ? (
                            <OddsTable bookmakers={bookmakers} compact />
                          ) : (
                            <p className="text-sm text-center py-4 text-[var(--text-muted)]">
                              Odds unavailable —{' '}
                              <Link
                                href={`/match/${matchSlug(fixture.teams.home.name, fixture.teams.away.name)}`}
                                className="text-[var(--brand)] hover:underline font-bold"
                              >
                                view match details
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <p className="text-xs text-center text-[var(--text-muted)] font-medium">
            Showing first {matchesWithOdds.length} matches with odds to preserve API quota ·
            <Link href="/" className="ml-1 text-[var(--brand)] hover:underline font-bold">
              View all today&apos;s matches
            </Link>
          </p>
        </div>
      )}

      {/* ── HOW ODDS WORK ──────────────────────────────────────── */}
      <section className="mt-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Understanding <span className="text-[var(--brand)]">Football Odds</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Decimal Odds Explained',
              body: 'Decimal odds represent the total return for every unit staked, including your original wager. Odds of 2.50 mean a $10 bet returns $25 total ($15 profit plus your $10 stake). Lower odds indicate a higher probability of that outcome occurring, while higher odds suggest a less likely result but greater potential returns. This European format is the most intuitive for comparing value across different bookmakers instantly.',
            },
            {
              title: 'Implied Probability',
              body: 'Every set of odds carries an implied probability calculated as 1 divided by the decimal odds. For example, odds of 2.00 imply a 50% chance, while odds of 4.00 suggest only a 25% probability. Smart bettors compare implied probability against their own assessment of the true likelihood. When your estimated probability exceeds the implied probability, you have identified a value opportunity — the foundation of profitable betting strategy.',
            },
            {
              title: 'The 1X2 Market',
              body: 'The classic three-way betting market offers wagers on a home win (1), draw (X), or away win (2). This is the most popular football betting format globally because it captures the essence of the sport — three possible outcomes after ninety minutes. Bookmakers adjust these odds based on team form, injuries, historical head-to-head records, and betting volume to balance their books while maintaining a mathematical edge known as the overround.',
            },
            {
              title: 'Odds Movement & Timing',
              body: 'Odds are not static — they fluctuate based on news, injuries, weather conditions, and betting patterns. A star striker ruled out through injury can shift home win odds from 1.80 to 2.20 within minutes. Professional bettors monitor these movements closely, often placing bets early when they believe the market has undervalued a team, or waiting for late money to create better prices on the opposite side.',
            },
          ].map((item, i) => (
            <article key={i} className="card p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="mt-24 fade-up">
        <div className="relative rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden p-10 sm:p-16 text-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Target className="w-64 h-64 -mr-10 -mt-10 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Take the Next Step
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.95]">
              Ready to Test Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
                Knowledge?
              </span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Put your football insights to the test. Make predictions, compete on the global leaderboard, and prove you know the game better than anyone.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/predictions" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                Start Predicting <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/leaderboard" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                <Trophy className="w-5 h-5" /> View Rankings
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

