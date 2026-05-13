import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  getTeam,
  getSquad,
  getStandings,
  getFixturesByLeague,
  getTopScorers,
  WORLD_CUP_LEAGUE_ID,
  WORLD_CUP_SEASON,
} from '@/lib/apifootball';
import MatchCard from '@/components/MatchCard';
import { captureCatch } from '@/lib/utils';
import { Users, Activity, Calendar, ArrowLeft, Trophy, Target, Star, Shield, Globe } from 'lucide-react';
import { toSlug } from '@/lib/slug';
import { getTeamSlugMap, getTeamIdToSlug } from '@/lib/slug-maps';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  const slugMap = await getTeamSlugMap();
  const teamId = slugMap.get(param);
  if (!teamId) return { title: 'National Team — World Cup 2026' };
  const teams = await captureCatch(getTeam(teamId), []);
  const team = teams[0]?.team;
  return {
    title: team
      ? `${team.name} — FIFA World Cup 2026 | ActiveSports`
      : 'National Team — World Cup 2026',
    description: team
      ? `${team.name} World Cup 2026 profile: squad, group standing, fixtures, form, and top scorers.`
      : undefined,
    ...(team ? {} : { robots: { index: false } as const }),
  };
}

export default async function WorldCupTeamPage({ params }: Props) {
  const param = (await params).slug;

  // Backward compat: old numeric ID
  if (/^\d+$/.test(param)) {
    const idToSlug = await getTeamIdToSlug();
    const slug = idToSlug.get(Number(param));
    if (slug) redirect(`/world-cup/team/${slug}`);
    notFound();
  }

  const slugMap = await getTeamSlugMap();
  const teamId = slugMap.get(param);
  if (!teamId) notFound();

  const [teamRes, squadRes, standingsRes, fixturesRes, scorersRes] = await Promise.allSettled([
    getTeam(teamId),
    getSquad(teamId),
    getStandings(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
    getFixturesByLeague(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
    getTopScorers(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
  ]);

  const teamList = teamRes.status === 'fulfilled' ? teamRes.value : [];
  if (!teamList.length) notFound();

  const { team } = teamList[0];
  const squadData =
    squadRes.status === 'fulfilled' && squadRes.value[0] ? squadRes.value[0].players : [];

  let groupStanding: import('@/lib/apifootball').Standing | null = null;
  let groupName = '';
  let groupTeams: import('@/lib/apifootball').Standing[] = [];
  if (standingsRes.status === 'fulfilled') {
    for (const group of standingsRes.value[0]?.league?.standings ?? []) {
      const match = group.find((s) => s.team.id === teamId);
      if (match) {
        groupStanding = match;
        groupName = match.group;
        groupTeams = group;
        break;
      }
    }
  }

  const allFixtures =
    fixturesRes.status === 'fulfilled' ? fixturesRes.value : [];
  const teamFixtures = allFixtures.filter(
    (f) => f.teams.home.id === teamId || f.teams.away.id === teamId
  );
  const now = new Date();
  const recentResults = teamFixtures
    .filter((f) => new Date(f.fixture.date) < now)
    .slice(-5)
    .reverse();
  const upcomingFixtures = teamFixtures
    .filter((f) => f.fixture.status.short === 'NS')
    .slice(0, 5);

  const allScorers = scorersRes.status === 'fulfilled' ? scorersRes.value : [];
  const nationScorers = allScorers
    .filter((s) => s.statistics[0]?.team?.id === teamId)
    .slice(0, 5);

  const formString = groupStanding?.form ?? '';

  const byPosition: Record<string, typeof squadData> = {};
  squadData.forEach((p) => {
    const pos = p.position || 'Unknown';
    if (!byPosition[pos]) byPosition[pos] = [];
    byPosition[pos].push(p);
  });
  const posOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Link
        href="/world-cup"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to World Cup Hub
      </Link>

      <div
        className="card p-0 mb-8 relative overflow-hidden fade-up"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)] to-transparent z-10" />
          <Image
            src={team.logo}
            alt=""
            fill
            className="object-contain scale-150 blur-3xl"
          />
        </div>
        
        <div className="relative z-20 p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative group">
            <div className="absolute inset-0 bg-[var(--brand)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Image
              src={team.logo}
              alt={team.name}
              width={120}
              height={120}
              className="relative z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                National Team Profile
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-[var(--brand)] text-white">
                World Cup 2026
              </span>
            </div>
            
            <h1
              className="text-4xl sm:text-6xl font-black mb-3 text-white leading-tight"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {team.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--brand)]" />
                <span>{team.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--warning)]" />
                <span>FIFA Ranking: Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {groupStanding && (
              <div className="bg-[var(--bg-subtle)] p-4 rounded-[15px] border border-[var(--border)] min-w-[160px]">
                <p className="text-[10px] uppercase tracking-widest font-black text-[var(--text-muted)] mb-1">{groupName}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">#{groupStanding.rank}</span>
                  <span className="text-xs font-bold text-[var(--accent)]">{groupStanding.points} PTS</span>
                </div>
              </div>
            )}
            {formString && (
              <div className="flex items-center justify-center gap-1.5 p-2 bg-[var(--bg-subtle)] rounded-full border border-[var(--border)]">
                {formString.slice(-5).split('').map((r, i) => (
                  <span
                    key={i}
                    className="flex items-center justify-center rounded-full font-bold text-white"
                    style={{
                      background:
                        r === 'W' ? 'var(--success)' : r === 'L' ? 'var(--danger)' : 'var(--warning)',
                      width: 24,
                      height: 24,
                      fontSize: 10,
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <WorldCupNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {squadData.length > 0 ? (
            <section className="card p-5 fade-up">
              <h2 className="font-bold mb-5">Squad ({squadData.length} players)</h2>
              {posOrder.map((pos) => {
                const players = byPosition[pos];
                if (!players?.length) return null;
                return (
                  <div key={pos} className="mb-5">
                    <h3
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {pos}s
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {players.map((p) => (
                        <Link
                          key={p.id}
                          href={`/player/${toSlug(p.name)}`}
                          className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                        >
                          <Image
                            src={p.photo}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="rounded-full shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{p.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              #{p.number} · Age {p.age}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            <div
              className="card p-8 text-center fade-up"
              style={{ border: '1px dashed var(--border)' }}
            >
              <Users className="w-12 h-12 text-[var(--brand)] mx-auto mb-3" />
              <p style={{ color: 'var(--text-muted)' }}>Squad announced closer to the tournament</p>
            </div>
          )}

          {groupTeams.length > 0 && (
            <section className="card p-5 fade-up">
              <h2 className="font-bold mb-4">{groupName} Standings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <th className="text-left py-2 px-3 font-medium w-8">#</th>
                      <th className="text-left py-2 px-3 font-medium">Team</th>
                      <th className="text-center py-2 px-2 font-medium">P</th>
                      <th className="text-center py-2 px-2 font-medium">W</th>
                      <th className="text-center py-2 px-2 font-medium">D</th>
                      <th className="text-center py-2 px-2 font-medium">L</th>
                      <th className="text-center py-2 px-2 font-medium">GD</th>
                      <th className="text-center py-2 px-2 font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupTeams.map((s) => (
                      <tr
                        key={s.team.id}
                        className="border-t transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          background:
                            s.team.id === teamId
                              ? 'rgba(59,130,246,0.08)'
                              : undefined,
                        }}
                      >
                        <td className="py-2.5 px-3 font-medium" style={{ color: s.rank <= 2 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {s.rank}
                        </td>
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/world-cup/team/${toSlug(s.team.name)}`}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <Image src={s.team.logo} alt={s.team.name} width={20} height={20} />
                            <span className="font-medium truncate" style={{ maxWidth: 140 }}>
                              {s.team.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-2.5 px-2 text-center" style={{ color: 'var(--text-muted)' }}>{s.all.played}</td>
                        <td className="py-2.5 px-2 text-center" style={{ color: 'var(--success)' }}>{s.all.win}</td>
                        <td className="py-2.5 px-2 text-center" style={{ color: 'var(--warning)' }}>{s.all.draw}</td>
                        <td className="py-2.5 px-2 text-center" style={{ color: 'var(--danger)' }}>{s.all.lose}</td>
                        <td className="py-2.5 px-2 text-center" style={{ color: s.goalsDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Top 2 teams advance to Round of 32
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6">

          {nationScorers.length > 0 && (
            <div className="card p-5 fade-up">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-[var(--brand)]"/> Top Scorers</h2>
              <div className="space-y-3">
                {nationScorers.map((s, i) => {
                  const stat = s.statistics[0];
                  return (
                    <Link
                      key={s.player.id}
                      href={`/player/${toSlug(s.player.name)}`}
                      className="flex items-center gap-3 group"
                    >
                      <span
                        className="w-5 text-xs font-bold text-center shrink-0"
                        style={{ color: i === 0 ? 'var(--warning)' : 'var(--text-muted)' }}
                      >
                        {i + 1}
                      </span>
                      <Image
                        src={s.player.photo}
                        alt={s.player.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--brand)] transition-colors">
                          {s.player.name}
                        </p>
                      </div>
                      <span
                        className="font-bold shrink-0"
                        style={{ fontFamily: 'var(--font-inter), sans-serif', color: 'var(--warning)' }}
                      >
                        {stat?.goals?.total ?? 0}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {recentResults.length > 0 && (
            <div className="card p-4 fade-up">
              <h3 className="font-semibold mb-3 text-sm">Recent Results</h3>
              <div className="space-y-2">
                {recentResults.map((f) => (
                  <MatchCard key={f.fixture.id} fixture={f} compact />
                ))}
              </div>
            </div>
          )}

          {upcomingFixtures.length > 0 && (
            <div className="card p-4 fade-up fade-up-delay-1">
              <h3 className="font-semibold mb-3 text-sm">Upcoming</h3>
              <div className="space-y-2">
                {upcomingFixtures.map((f) => (
                  <MatchCard key={f.fixture.id} fixture={f} compact />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Extensive SEO Content Block for Team */}
          <article className="mt-12 prose prose-invert max-w-none fade-up text-[var(--text-muted)] space-y-8 border-t border-[var(--border)] pt-12">
            <h2 className="text-3xl font-black text-white">{team.name}: Ambitions and Legacy at the 2026 FIFA World Cup</h2>
            <p>
              As the global football community prepares for the spectacle of the 2026 FIFA World Cup in North America, {team.name} stands as a beacon of national pride and footballing excellence. This tournament represents a unique opportunity for the team to etch its name into the history books, competing against the world&apos;s best on the biggest stage of all.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-12">
              <div className="card p-6 border-l-4 border-[var(--brand)]">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> Tactical Identity</h3>
                <p className="text-sm">
                  {team.name} is known for a dynamic and adaptable style of play. Under the current coaching staff, the team has developed a philosophy centered on high-intensity pressing and clinical transitions. This tactical flexibility will be crucial in navigating the diverse challenges presented by the 48-team World Cup format.
                </p>
              </div>
              <div className="card p-6 border-l-4 border-[var(--warning)]">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Star className="w-5 h-5" /> Historical Context</h3>
                <p className="text-sm">
                  The history of {team.name} in the FIFA World Cup is a tapestry of memorable moments, heartbreaking exits, and triumphant victories. Each previous appearance has contributed to the team&apos;s growing pedigree on the international stage, building a legacy that inspires the current generation of players.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white">The Road to 2026</h3>
            <p>
              The journey to the 2026 World Cup has been a rigorous test of resilience and skill for {team.name}. Qualifying campaigns are often a rollercoaster of emotions, requiring consistency over a long period. The team&apos;s successful qualification is a testament to the depth of talent available and the strength of the national footballing infrastructure. As they prepare for the group stages, the focus shifts to fine-tuning the squad and analyzing their opponents in {groupName}.
            </p>

            <h3 className="text-xl font-bold text-white">Key Players and Emerging Talents</h3>
            <p>
              The current {team.name} squad features a blend of experienced veterans and exciting young prospects. Leadership on and off the pitch will be vital, with senior players expected to guide the younger members through the pressures of a global tournament. Keep a close eye on the stars mentioned in our squad breakdown, as their performance could determine how far the team progresses in the knockout rounds.
            </p>

            <h3 className="text-xl font-bold text-white">Expectations and Prospects</h3>
            <p>
              Expectations for {team.name} are higher than ever. Fans across the nation and around the world are eagerly anticipating their opening match. While the competition is fierce, the team&apos;s recent form and tactical evolution suggest they have the potential to go deep into the tournament. Whether it&apos;s a dream run to the final or a statement performance against a traditional powerhouse, the 2026 World Cup promises to be a defining moment for the future of football in the country.
            </p>

            <p className="italic bg-[var(--bg-subtle)] p-6 rounded-[15px] border border-[var(--border)]">
              &quot;Every World Cup is a new beginning. For {team.name}, 2026 is the year where potential meets opportunity. We are ready to show the world the true spirit of our football.&quot; - ActiveSports Editorial Team
            </p>

            <div className="mt-12 p-8 rounded-[15px] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-subtle)] border border-[var(--border)]">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-[var(--brand)]" /> Team Statistical Overview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Squad Size</p>
                  <p className="text-2xl font-black text-white">{squadData.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Top Scorer</p>
                  <p className="text-sm font-bold text-[var(--warning)] truncate">{nationScorers[0]?.player?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Group Position</p>
                  <p className="text-2xl font-black text-[var(--accent)]">{groupStanding?.rank ? `#${groupStanding.rank}` : 'TBD'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Recent Form</p>
                  <p className="text-sm font-bold text-[var(--success)]">{formString.slice(-3) || 'N/A'}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
    </div>
  );
}
