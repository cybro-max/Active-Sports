import { getStandings, getTopScorers, getTopAssists } from '@/lib/apifootball';
import { MAJOR_LEAGUES, CURRENT_SEASON } from '@/config/leagues';
import { Trophy, Medal, Goal, ArrowUpDown, ChevronRight, Crown, BarChart3, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toSlug } from '@/lib/slug';
import type { Standing, PlayerResponse } from '@/lib/apifootball';

const TOP_5 = MAJOR_LEAGUES.filter(l => [39, 140, 135, 78, 61].includes(l.id));

export default async function LeaderboardPage() {
  const [standingsResults, scorersResults, assistsResults] = await Promise.all([
    Promise.allSettled(TOP_5.map(l => getStandings(l.id, CURRENT_SEASON))),
    Promise.allSettled(TOP_5.map(l => getTopScorers(l.id, CURRENT_SEASON))),
    Promise.allSettled(TOP_5.map(l => getTopAssists(l.id, CURRENT_SEASON))),
  ]);

  const leagueStandings = TOP_5.map((l, i) => ({
    league: l,
    data: standingsResults[i].status === 'fulfilled' ? standingsResults[i].value : [],
  }));

  const topScorers = TOP_5.map((l, i) => ({
    league: l,
    data: scorersResults[i].status === 'fulfilled' ? scorersResults[i].value : [],
  }));

  const topAssists = TOP_5.map((l, i) => ({
    league: l,
    data: assistsResults[i].status === 'fulfilled' ? assistsResults[i].value : [],
  }));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>

        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/30 text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Crown className="w-3 h-3 fill-current" /> Live Football Data
          </div>

          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Leaderboard
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed max-w-2xl mx-auto">
            Real-time standings, top scorers, and playmakers across the world&apos;s biggest football leagues.
            All data powered by official API feeds.
          </p>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[var(--border)] pt-8">
            {[
              { icon: Trophy, label: 'Leagues Tracked', value: `${TOP_5.length}+` },
              { icon: Users, label: 'Teams', value: `${TOP_5.length * 20}+` },
              { icon: Goal, label: 'Players', value: '500+' },
              { icon: BarChart3, label: 'Live Stats', value: '24/7' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <div className="text-white font-black text-lg leading-none">{stat.value}</div>
                <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAGUE STANDINGS ─────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            League <span className="text-[var(--brand)]">Standings</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {leagueStandings.map(({ league, data }) => {
            const table = data[0]?.league?.standings?.[0] || [];
            return (
              <div key={league.id} className="card p-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] rounded-[24px]">
                <div className="flex items-center gap-3 p-5 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                  <Image src={league.logo} alt={league.name} width={28} height={28} />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{league.name}</h3>
                  <Link href={`/league/${toSlug(league.name)}`} className="ml-auto text-[10px] font-black text-[var(--brand)] uppercase tracking-widest hover:underline">
                    Full Table
                  </Link>
                </div>

                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-black/30 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border)]">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Team</div>
                  <div className="col-span-1 text-center">P</div>
                  <div className="col-span-1 text-center">W</div>
                  <div className="col-span-1 text-center">D</div>
                  <div className="col-span-1 text-center">L</div>
                  <div className="col-span-1 text-center">GD</div>
                  <div className="col-span-1 text-right">Pts</div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {table.slice(0, 10).map((row: Standing) => (
                    <div key={row.rank} className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors">
                      <div className="col-span-1 flex items-center">
                        {row.rank <= 3 ? (
                          <Medal className={`w-4 h-4 ${row.rank === 1 ? 'text-yellow-400' : row.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
                        ) : (
                          <span className="text-xs font-bold text-[var(--text-muted)]">{row.rank}</span>
                        )}
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <Image src={row.team.logo} alt={row.team.name} width={18} height={18} />
                        <Link href={`/team/${toSlug(row.team.name)}`} className="text-xs font-bold text-white truncate hover:text-[var(--brand)] transition-colors">
                          {row.team.name}
                        </Link>
                      </div>
                      <div className="col-span-1 text-center text-xs font-bold text-[var(--text-muted)]">{row.all.played}</div>
                      <div className="col-span-1 text-center text-xs font-bold text-[var(--text-muted)]">{row.all.win}</div>
                      <div className="col-span-1 text-center text-xs font-bold text-[var(--text-muted)]">{row.all.draw}</div>
                      <div className="col-span-1 text-center text-xs font-bold text-[var(--text-muted)]">{row.all.lose}</div>
                      <div className="col-span-1 text-center text-xs font-bold text-[var(--text-muted)]">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</div>
                      <div className="col-span-1 text-right text-xs font-black text-white">{row.points}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TOP SCORERS ──────────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Top <span className="text-[var(--brand)]">Scorers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {topScorers.map(({ league, data }) => (
            <div key={league.id} className="card p-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] rounded-[24px]">
              <div className="flex items-center gap-3 p-5 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                <Image src={league.logo} alt={league.name} width={24} height={24} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{league.name}</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {data.slice(0, 10).map((p: PlayerResponse, i: number) => {
                  const stats = p.statistics?.[0];
                  return (
                    <div key={p.player.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-xs font-black text-[var(--text-muted)] w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden shrink-0">
                        <Image src={p.player.photo} alt={p.player.name} width={32} height={32} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/player/${toSlug(p.player.name)}`} className="text-xs font-bold text-white truncate block hover:text-[var(--brand)] transition-colors">
                          {p.player.name}
                        </Link>
                        {stats?.team?.name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Image src={stats.team.logo} alt={stats.team.name} width={12} height={12} />
                            <span className="text-[9px] text-[var(--text-muted)] font-medium truncate">{stats.team.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-white">{stats?.goals?.total ?? 0}</div>
                        <div className="text-[8px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Goals</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.length > 10 && (
                <Link href={`/stats/leaders`} className="flex items-center justify-center gap-1 p-4 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest border-t border-[var(--border)] hover:bg-white/[0.02] transition-colors">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP ASSISTS ──────────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Top <span className="text-[var(--accent)]">Assists</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {topAssists.map(({ league, data }) => (
            <div key={league.id} className="card p-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] rounded-[24px]">
              <div className="flex items-center gap-3 p-5 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                <Image src={league.logo} alt={league.name} width={24} height={24} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{league.name}</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {data.slice(0, 10).map((p: PlayerResponse, i: number) => {
                  const stats = p.statistics?.[0];
                  return (
                    <div key={p.player.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <span className="text-xs font-black text-[var(--text-muted)] w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden shrink-0">
                        <Image src={p.player.photo} alt={p.player.name} width={32} height={32} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/player/${toSlug(p.player.name)}`} className="text-xs font-bold text-white truncate block hover:text-[var(--brand)] transition-colors">
                          {p.player.name}
                        </Link>
                        {stats?.team?.name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Image src={stats.team.logo} alt={stats.team.name} width={12} height={12} />
                            <span className="text-[9px] text-[var(--text-muted)] font-medium truncate">{stats.team.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-white">{stats?.goals?.assists ?? 0}</div>
                        <div className="text-[8px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Assists</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.length > 10 && (
                <Link href={`/stats/leaders`} className="flex items-center justify-center gap-1 p-4 text-[10px] font-black text-[var(--accent)] uppercase tracking-widest border-t border-[var(--border)] hover:bg-white/[0.02] transition-colors">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="fade-up">
        <div className="relative rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden p-10 sm:p-16 text-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BarChart3 className="w-64 h-64 -mr-10 -mt-10 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.95]">
              Deeper <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">Stats</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Explore comprehensive player statistics, team profiles, and head-to-head records across every major league.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/stats/leaders" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                <BarChart3 className="w-5 h-5" /> All Stats Leaders
              </Link>
              <Link href="/players" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                <Users className="w-5 h-5" /> Browse Players
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
