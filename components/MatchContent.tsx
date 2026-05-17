'use client';

import { Zap, Users, RefreshCcw, Info, Swords, MapPin, Activity } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMatchTime } from '@/lib/utils';
import { LiveMatchProvider, useMatchLive } from './LiveMatchProvider';
import MoreMatchesSection from './MoreMatchesSection';
import OddsTable from './OddsTable';
import { toSlug } from '@/lib/slug';
import type { Fixture, FixtureEvent, FixtureStatistics, FixtureLineup, Prediction, OddsResponse } from '@/lib/apifootball';

interface MatchContentProps {
  fixtureId: number;
  fixture: Fixture;
  stats: FixtureStatistics[];
  events: FixtureEvent[];
  lineups: FixtureLineup[];
  h2hFixtures: Fixture[];
  predictionData: Prediction | null;
  oddsData: OddsResponse | null;
  liveOddsData: OddsResponse[];
  isLive: boolean;
  moreLive: Fixture[];
  moreToday: Fixture[];
  slug: string;
  timezone?: string | undefined;
}

export default function MatchContent(props: MatchContentProps) {
  const { fixture: f, teams, league } = props.fixture;
  const fixtureId = props.fixtureId;
  const isLive = props.isLive;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${teams.home.name} vs ${teams.away.name}`,
    startDate: f.date,
    location: { '@type': 'Place', name: f.venue?.name || 'TBD', address: f.venue?.city || '' },
    homeTeam: { '@type': 'SportsTeam', name: teams.home.name },
    awayTeam: { '@type': 'SportsTeam', name: teams.away.name },
  };

  return (
    <LiveMatchProvider
      fixtureId={fixtureId}
      initialFixture={props.fixture}
      initialEvents={props.events}
      initialStatistics={props.stats}
      initiallyLive={isLive}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-xs mb-6 flex items-center gap-2 text-[var(--text-muted)] fade-up">
        <Link href="/" className="hover:text-[var(--brand)] transition-colors font-bold uppercase tracking-wider">Scores</Link>
        <span className="opacity-40">/</span>
        <Link href={`/league/${toSlug(league.name)}`} className="hover:text-[var(--brand)] transition-colors font-bold uppercase tracking-wider">{league.name}</Link>
        <span className="opacity-40">/</span>
        <span className="text-white/60">{teams.home.name} vs {teams.away.name}</span>
      </nav>

      {/* Hero Scoreboard */}
      <LiveHeroScoreboard timezone={props.timezone} />

      {/* Quick Stats Summary */}
      <LiveQuickStats />

      {/* Match Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Match Timeline (goals only) */}
          <LiveTimelineSection />

          {/* Match Events */}
          <LiveEventsSection />

          {/* Match Stats */}
          <LiveStatsSection />

          {/* Lineups */}
          <section className="card fade-up">
            <h2 className="section-title flex items-center gap-2"><Users className="w-4 h-4 text-[var(--brand)]" /> Lineups</h2>
            <LineupView lineups={props.lineups} />
          </section>

        </div>

        {/* Sidebar - 1/3 */}
        <aside className="space-y-6">
          {/* Head to Head */}
          <section className="card fade-up">
            <h2 className="section-title flex items-center gap-2"><Swords className="w-4 h-4 text-[var(--brand)]" /> Head to Head</h2>
            <H2HFixtures fixtures={props.h2hFixtures} teamIds={{ home: teams.home.id, away: teams.away.id }} />
          </section>

          {/* Match Info */}
          <section className="card fade-up">
            <h2 className="section-title flex items-center gap-2"><Info className="w-4 h-4 text-[var(--brand)]" /> Match Info</h2>
            <div className="space-y-2 text-sm">
              {league.country && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Country</span>
                  <span className="text-xs font-bold text-white">{league.country}</span>
                </div>
              )}
              {league.round && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Round</span>
                  <span className="text-xs font-bold text-white">{league.round}</span>
                </div>
              )}
            </div>
          </section>

          {/* Substitutions */}
          {props.events.filter(e => e.type === 'subst').length > 0 && (
            <section className="card fade-up">
              <h2 className="section-title flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-[var(--brand)]" /> Substitutions</h2>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {[teams.home, teams.away].map(team => {
                  const subs = props.events.filter(e => e.type === 'subst' && e.team.id === team.id);
                  if (!subs.length) return null;
                  return (
                    <div key={team.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <Image src={team.logo} alt={team.name} width={14} height={14} />
                        <span className="text-[10px] font-bold text-white">{team.name}</span>
                      </div>
                      <div className="space-y-1.5">
                        {subs.map((sub, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] bg-white/[0.02] rounded-lg px-2.5 py-1.5">
                            <span className="text-[var(--text-muted)] font-mono font-bold min-w-[28px]">{sub.time.elapsed}&apos;</span>
                            <span className="text-[var(--brand)] font-bold">↑</span>
                            <span className="font-bold text-white flex-1 truncate">{sub.player.name}</span>
                            {sub.assist?.name && (
                              <>
                                <span className="text-red-400 font-bold">↓</span>
                                <span className="text-[var(--text-muted)] truncate max-w-[80px]">{sub.assist.name}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Venue */}
          {f.venue?.name && (
            <section className="card fade-up">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand)] shrink-0" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">{f.venue.name}</h3>
                  {f.venue.city && <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">{f.venue.city}</p>}
                </div>
              </div>
            </section>
          )}

          {/* Team Links */}
          <section className="card fade-up">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Teams</h3>
            <div className="space-y-2">
              {[teams.home, teams.away].map(t => (
                <Link key={t.id} href={`/team/${toSlug(t.name)}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <Image src={t.logo} alt={t.name} width={24} height={24} />
                  <span className="text-xs font-bold text-[var(--text-body)]">{t.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Odds */}
          {props.oddsData?.bookmakers && props.oddsData.bookmakers.length > 0 && (
            <section className="card fade-up overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <h2 className="section-title mb-0">Match Odds</h2>
              </div>
              <OddsTable bookmakers={props.oddsData.bookmakers} />
            </section>
          )}

          {/* Live Odds */}
          {isLive && props.liveOddsData.length > 0 && props.liveOddsData[0]?.bookmakers && props.liveOddsData[0].bookmakers.length > 0 && (
            <section className="card fade-up overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
                <h2 className="section-title mb-0">Live Odds (In-Play)</h2>
              </div>
              <OddsTable bookmakers={props.liveOddsData[0].bookmakers} />
            </section>
          )}

          {/* Prediction Insight */}
          {props.predictionData && (
            <section className="card fade-up">
              <h2 className="section-title">AI Prediction</h2>
              {props.predictionData.advice && (
                <p className="text-sm mb-4 italic text-[var(--text-muted)] leading-relaxed">
                  &ldquo;{props.predictionData.advice}&rdquo;
                </p>
              )}
              <div className="flex gap-3">
                {[
                  { label: 'Home', pct: props.predictionData.percent?.home, color: 'var(--brand)' },
                  { label: 'Draw', pct: props.predictionData.percent?.draw, color: 'var(--warning)' },
                  { label: 'Away', pct: props.predictionData.percent?.away, color: 'var(--accent)' },
                ].map(item => (
                  <div key={item.label} className="flex-1 text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-lg font-black font-display mb-1" style={{ color: item.color }}>
                      {item.pct || '—'}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* More Live Matches */}
      <div className="mt-8 pt-8 border-t border-white/5">
        <MoreMatchesSection liveFixtures={props.moreLive} todayFixtures={props.moreToday} timezone={props.timezone} />
      </div>
    </LiveMatchProvider>
  );
}

function LiveHeroScoreboard({ timezone }: { timezone?: string | undefined }) {
  const { live, connected } = useMatchLive();
  const f = live.fixture;
  if (!f) return null;

  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] mb-8 bg-[#0a0a0a] border border-white/5 shadow-2xl">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--brand)]/10 rounded-full blur-[100px] opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="relative px-3 sm:px-8 py-6 sm:py-12">
        <div className="flex flex-col items-center">
          {/* League Info */}
          <div className="flex items-center gap-2 mb-6 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Image src={f.league.logo} alt={f.league.name} width={12} height={12} className="opacity-80" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{f.league.name}</span>
          </div>

          <div className="w-full flex items-center justify-between max-w-4xl mx-auto">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-32 sm:h-32 relative mb-3 sm:mb-6 group">
                <div className="absolute inset-0 bg-white/5 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 blur-xl opacity-0 group-hover:opacity-100" />
                <Image src={f.teams.home.logo} alt={f.teams.home.name} fill className="object-contain relative drop-shadow-2xl" />
              </div>
              <h2 className="text-[9px] sm:text-xl font-black text-white tracking-tight uppercase max-w-[65px] sm:max-w-[160px] leading-tight line-clamp-2">{f.teams.home.name}</h2>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center px-1 sm:px-12 shrink-0 min-w-[80px]">
              <div className="flex items-center gap-2 sm:gap-8 mb-3 sm:mb-4">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={f.goals.home}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl sm:text-8xl font-black font-display tracking-tighter text-white"
                  >
                    {f.goals.home ?? 0}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xl sm:text-4xl font-black text-white/10 mt-1 sm:mt-2">:</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={f.goals.away}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl sm:text-8xl font-black font-display tracking-tighter text-white"
                  >
                    {f.goals.away ?? 0}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-center">
                <div className={`px-2 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl border flex items-center gap-1 sm:gap-2 ${
                  isLive ? 'bg-[var(--brand)]/10 border-[var(--brand)]/20' : 'bg-white/5 border-white/10'
                }`}>
                  {isLive && (
                    <span className="relative flex h-1 w-1 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1 w-1 sm:h-2 sm:w-2 bg-[var(--brand)]" />
                    </span>
                  )}
                  <span className={`text-[7px] sm:text-[10px] font-black uppercase tracking-widest ${
                    isLive ? 'text-[var(--brand)]' : 'text-white/60'
                  }`}>
                    {f.fixture.status.short === 'NS' 
                      ? formatMatchTime(f.fixture.date, timezone)
                      : f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : f.fixture.status.long}
                  </span>
                </div>
                {isLive && !connected && (
                  <span className="text-[7px] text-white/20 mt-1 uppercase font-bold tracking-widest animate-pulse">Syncing...</span>
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-32 sm:h-32 relative mb-3 sm:mb-6 group">
                <div className="absolute inset-0 bg-white/5 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 blur-xl opacity-0 group-hover:opacity-100" />
                <Image src={f.teams.away.logo} alt={f.teams.away.name} fill className="object-contain relative drop-shadow-2xl" />
              </div>
              <h2 className="text-[9px] sm:text-xl font-black text-white tracking-tight uppercase max-w-[65px] sm:max-w-[160px] leading-tight line-clamp-2">{f.teams.away.name}</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveQuickStats() {
  const { live } = useMatchLive();
  const stats = live.statistics;
  if (!stats.length) return null;

  const getStat = (teamIdx: number, type: string) => {
    return stats[teamIdx]?.statistics.find(s => s.type === type)?.value || 0;
  };

  const types = [
    { label: 'Ball Possession', key: 'Ball Possession' },
    { label: 'Shots on Goal', key: 'Shots on Goal' },
    { label: 'Corner Kicks', key: 'Corner Kicks' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {types.map(type => {
        const homeVal = getStat(0, type.key);
        const awayVal = getStat(1, type.key);
        const hNum = typeof homeVal === 'string' ? parseInt(homeVal) || 0 : (homeVal as number);
        const aNum = typeof awayVal === 'string' ? parseInt(awayVal) || 0 : (awayVal as number);
        const total = hNum + aNum || 1;
        const hPct = Math.round((hNum / total) * 100);

        return (
          <div key={type.label} className="card p-4 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">{type.label}</span>
            <div className="w-full flex items-center justify-between mb-2 px-2">
              <span className="text-lg font-black text-white">{homeVal}</span>
              <span className="text-lg font-black text-white">{awayVal}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
              <div className="h-full bg-[var(--brand)] transition-all duration-1000" style={{ width: `${hPct}%` }} />
              <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${100 - hPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LiveTimelineSection() {
  const { live } = useMatchLive();
  const events = live.events || [];
  if (!events.length) return null;

  return (
    <div className="card p-6 mb-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-4 h-4 text-[var(--brand)]" />
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Match Momentum</h3>
      </div>
      <div className="relative h-12 flex items-center px-4">
        <div className="absolute left-4 right-4 h-0.5 bg-white/5" />
        {events.map((e, i) => {
          if (e.type !== 'Goal') return null;
          const pos = (e.time.elapsed / 90) * 100;
          return (
            <div 
              key={i} 
              className="absolute group" 
              style={{ left: `${Math.min(pos, 100)}%` }}
            >
              <div className="w-4 h-4 -ml-2 bg-[var(--brand)] rounded-full flex items-center justify-center border-2 border-black cursor-pointer transform group-hover:scale-125 transition-transform">
                <Zap className="w-2 h-2 text-black fill-black" />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-1 rounded text-[9px] font-bold text-white backdrop-blur-sm pointer-events-none">
                {e.player.name} ({e.time.elapsed}&apos;)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveEventsSection() {
  const { live } = useMatchLive();
  const events = [...(live.events || [])].reverse();

  if (!events.length) return (
    <div className="card p-12 flex flex-col items-center justify-center text-center opacity-50">
      <Zap className="w-8 h-8 text-[var(--brand)] mb-4" />
      <p className="text-sm font-bold text-white uppercase tracking-widest">No events recorded yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="card p-4 flex items-center gap-4 group hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
            <span className="text-xs font-black text-white">{e.time.elapsed}'</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {e.type === 'Goal' && <Zap className="w-3 h-3 text-[var(--brand)] fill-[var(--brand)]" />}
              {e.type === 'Card' && (
                <div className={`w-2 h-3 rounded-sm ${e.detail === 'Yellow Card' ? 'bg-yellow-400' : 'bg-red-500'}`} />
              )}
              {e.type === 'subst' && <RefreshCcw className="w-3 h-3 text-blue-400" />}
              <span className="text-xs font-black text-white uppercase tracking-tight">{e.detail}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
              <span className="text-white">{e.player.name}</span>
              {e.assist?.name && (
                <>
                  <span className="opacity-30">•</span>
                  <span>Assist: {e.assist.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <Image src={e.team.logo} alt={e.team.name} width={24} height={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
}


function LiveStatsSection() {
  const { live } = useMatchLive();
  const stats = live.statistics;
  if (!stats.length) return null;

  const getStat = (teamIdx: number, type: string) => {
    return stats[teamIdx]?.statistics.find(s => s.type === type)?.value || 0;
  };

  const statTypes = [
    'Shots on Goal', 'Shots off Goal', 'Total Shots', 'Blocked Shots',
    'Shots insidebox', 'Shots outsidebox', 'Fouls', 'Corner Kicks',
    'Offsides', 'Ball Possession', 'Yellow Cards', 'Red Cards',
    'Goalkeeper Saves', 'Total passes', 'Passes accurate', 'Passes %'
  ];

  return (
    <div className="space-y-6">
      {statTypes.map(type => {
        const homeVal = getStat(0, type);
        const awayVal = getStat(1, type);
        
        const parseValue = (v: string | number | null): number => {
          if (typeof v === 'string' && v.includes('%')) return parseInt(v) || 0;
          if (typeof v === 'string') return parseInt(v) || 0;
          return v ?? 0;
        };

        const hNum = parseValue(homeVal);
        const aNum = parseValue(awayVal);
        const total = hNum + aNum || 1;
        const hPct = (hNum / total) * 100;

        return (
          <div key={type} className="group">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-sm font-black text-white">{homeVal}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-white transition-colors">{type}</span>
              <span className="text-sm font-black text-white">{awayVal}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[var(--brand)] transition-all duration-1000 ease-out" 
                style={{ width: `${hPct}%` }} 
              />
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out" 
                style={{ width: `${100 - hPct}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineupView({ lineups }: { lineups: FixtureLineup[] }) {
  if (!lineups || !lineups.length) return (
    <div className="card p-12 flex flex-col items-center justify-center text-center opacity-50">
      <Users className="w-8 h-8 text-[var(--brand)] mb-4" />
      <p className="text-sm font-bold text-white uppercase tracking-widest">Lineups not announced yet</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {lineups.map((l, i) => (
        <div key={i} className="space-y-6">
          <div className="flex items-center justify-between mb-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Image src={l.team.logo} alt={l.team.name} width={32} height={32} />
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{l.team.name}</h3>
                <p className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-widest">{l.formation}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Coach</p>
              <p className="text-xs font-bold text-white">{l.coach.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 ml-1">Starting XI</h4>
            {l.startXI.map((p: { player: { id: number; number: number; name: string; pos: string } }) => (
              <div key={p.player.id} className="card p-3 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                    <span className="text-xs font-black text-[var(--brand)]">{p.player.number}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[var(--brand)] transition-colors">{p.player.name}</p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{p.player.pos}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {l.substitutes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 mt-8 ml-1">Substitutes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {l.substitutes.map((p: { player: { id: number; number: number; name: string } }) => (
                  <div key={p.player.id} className="bg-white/5 p-2 rounded-xl border border-white/5 flex items-center gap-3">
                    <span className="text-[10px] font-black text-white/20 w-4 text-center">{p.player.number}</span>
                    <span className="text-[11px] font-bold text-white/60 truncate">{p.player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function H2HFixtures({ fixtures, teamIds }: { fixtures: Fixture[], teamIds: { home: number; away: number } }) {
  if (!fixtures || !fixtures.length) return (
    <div className="p-4 text-center opacity-50">
      <p className="text-[10px] font-black uppercase tracking-widest">No previous match history</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {fixtures.slice(0, 5).map((f, i) => (
        <div key={i} className="flex items-center justify-between group hover:bg-white/5 transition-colors p-2 rounded-xl">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-center w-10 shrink-0">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                {new Date(f.fixture.date).getFullYear()}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-right">
                <span className={`text-[11px] font-bold ${f.teams.home.id === teamIds.home ? 'text-white' : 'text-white/40'}`}>{f.teams.home.name}</span>
              </div>
              <div className="bg-black/40 px-2 py-0.5 rounded border border-white/5">
                <span className="text-[11px] font-black text-[var(--brand)]">
                  {f.goals.home} - {f.goals.away}
                </span>
              </div>
              <div className="flex-1 text-left">
                <span className={`text-[11px] font-bold ${f.teams.away.id === teamIds.away ? 'text-white' : 'text-white/40'}`}>{f.teams.away.name}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
