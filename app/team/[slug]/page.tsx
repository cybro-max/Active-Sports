import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTeam, getTeamsSearch, getSquad, getFixturesByLeague,
  getTransfers, getTeamStatistics, getCoach, getStandings, MAJOR_LEAGUES, CURRENT_SEASON
} from '@/lib/apifootball';
import { SkeletonFixtureList } from '@/components/Skeleton';
import AsyncSection from '@/components/AsyncSection';
import { generateSportsTeamLD, generateBreadcrumbLD } from '@/lib/json-ld';
import { Users, Calendar, RefreshCcw, ArrowRight } from 'lucide-react';
import MatchCard from '@/components/MatchCard';
import FavoriteButton from '@/components/FavoriteButton';
import { captureCatch } from '@/lib/utils';
import { getAllTeamIds, getPopularTeamIds, isFullBuild } from '@/lib/build-params';
import { generateTeamDescription } from '@/lib/content-generator';
import { toSlug } from '@/lib/slug';
import { getTeamSlugMap, getTeamIdToSlug } from '@/lib/slug-maps';
import TeamPerformanceChart from '@/components/TeamPerformanceChart';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ league?: string; tz?: string }>;
}

export async function generateStaticParams() {
  const ids = isFullBuild() ? await getAllTeamIds() : new Set(getPopularTeamIds());
  const slugMap = await getTeamSlugMap();
  return [...slugMap.entries()]
    .filter(([, id]) => ids.has(id))
    .map(([slug]) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  let teamId: number | undefined;
  if (/^\d+$/.test(param)) {
    const idToSlug = await getTeamIdToSlug();
    teamId = Number(param);
  } else {
    const slugMap = await getTeamSlugMap();
    teamId = slugMap.get(param);
  }
  if (!teamId) return { title: 'Team Profile' };
  const teams = await captureCatch(getTeam(teamId), []);
  const team = teams[0]?.team;
  if (!team) return { title: 'Club Directory' };
  
  const desc = await generateTeamDescription(team.name, team.country, '');
  return {
    title: `${team.name} — Squad, 2024/25 Fixtures & Tactical Stats`,
    description: desc || `Complete tactical profile for ${team.name}. Real-time squad updates, 2024/25 fixture schedule, and comprehensive club analytics.`,
    alternates: { canonical: `https://activesports.live/team/${param}` },
    openGraph: {
      title: `${team.name} Official Profile`,
      description: `Tactical insights and performance metrics for ${team.name}.`,
      images: [{ url: team.logo }],
    }
  };
}

// ─── Streaming sections ───────────────────────────────────────────

async function SquadSection({ teamId }: { teamId: number }) {
  const squadRes = await captureCatch(getSquad(teamId), []);
  if (!squadRes.length) return null;
  const players = squadRes[0].players;
  
  const byPos = {
    Goalkeeper: players.filter(p => p.position === 'Goalkeeper'),
    Defender: players.filter(p => p.position === 'Defender'),
    Midfielder: players.filter(p => p.position === 'Midfielder'),
    Attacker: players.filter(p => p.position === 'Attacker'),
  };

  return (
    <section className="card fade-up">
      <h2 className="section-title">Active Squad</h2>
      <div className="space-y-8">
        {Object.entries(byPos).map(([pos, list]) => list.length > 0 && (
          <div key={pos}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{pos}s</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map(p => (
                <Link key={p.id} href={`/player/${toSlug(p.name)}`} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--brand)]/30 hover:bg-white/10 transition-all group">
                   <div className="relative w-12 h-12 shrink-0">
                     <Image 
                      src={p.photo} 
                      alt={p.name} 
                      width={48} 
                      height={48} 
                      className="rounded-xl bg-white/5 object-cover" 
                      unoptimized
                    />
                     {p.number && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg bg-[var(--brand)] text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)]">
                          {p.number}
                        </span>
                     )}
                   </div>
                   <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-white truncate group-hover:text-[var(--brand)] transition-colors">{p.name}</p>
                     <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Age {p.age}</p>
                   </div>
                   <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Form is now integrated into analytics section

async function CoachSection({ teamId }: { teamId: number }) {
  const coachList = await captureCatch(getCoach(undefined, teamId), []);

  if (!coachList.length) return null;

  const coach = coachList[0];

  return (
    <section className="card fade-up">
      <h2 className="section-title">Coach</h2>
      <div className="flex items-center gap-4">
        {coach.photo && (
          <Image
            src={coach.photo}
            alt={coach.name}
            width={56}
            height={56}
            className="rounded-full object-cover ring-2 ring-[var(--brand)]/20"
          />
        )}
        <div>
          <p className="font-bold text-[var(--primary)]">{coach.name}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {coach.nationality} · Age {coach.age}
          </p>
        </div>
      </div>
      {coach.career && coach.career.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Career</p>
          {coach.career.slice(0, 5).map((c, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {c.team.logo && <Image src={c.team.logo} alt={c.team.name} width={18} height={18} />}
              <span className="text-[var(--text-body)] flex-1">{c.team.name}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {c.start} – {c.end || 'Present'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

async function FixturesSection({ teamId, leagueId, timezone }: { teamId: number; leagueId: number; timezone?: string | undefined }) {
  const fixtureList = await captureCatch(getFixturesByLeague(leagueId, CURRENT_SEASON, timezone), []);
  const teamFixtures = fixtureList.filter(f => f.teams.home.id === teamId || f.teams.away.id === teamId);
  const now = new Date();
  const recent = teamFixtures.filter(f => new Date(f.fixture.date) < now && f.fixture.status.short === 'FT').slice(-5).reverse();
  const upcoming = teamFixtures.filter(f => f.fixture.status.short === 'NS').slice(0, 5);

  return (
    <AsyncSection
      error={null}
      isEmpty={recent.length === 0 && upcoming.length === 0}
      emptyIcon={<Calendar className="w-7 h-7 text-[var(--brand)] mb-2"/>}
      emptyMessage="No fixtures history yet."
    >
      {recent.length > 0 && (
        <div className="card fade-up">
          <h3 className="text-sm font-semibold text-[var(--primary)] mb-3">Recent Results</h3>
          <div className="space-y-2">
            {recent.map(f => <MatchCard key={f.fixture.id} fixture={f} compact />)}
          </div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="card fade-up fade-up-delay-1">
          <h3 className="text-sm font-semibold text-[var(--primary)] mb-3">Upcoming</h3>
          <div className="space-y-2">
            {upcoming.map(f => <MatchCard key={f.fixture.id} fixture={f} compact />)}
          </div>
        </div>
      )}
    </AsyncSection>
  );
}

async function TeamStatsSection({ teamId, leagueId }: { teamId: number; leagueId: number }) {
  const stats = await captureCatch(getTeamStatistics(teamId, leagueId, CURRENT_SEASON), null);
  if (!stats) return null;

  return (
    <section className="card fade-up">
      <h2 className="section-title">Performance Analytics</h2>
      
      {stats.form && (
        <div className="flex items-center gap-1.5 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mr-2">Recent Form</span>
          {stats.form.slice(-8).split('').map((r, i) => (
            <span
              key={i}
              className="w-5 h-5 flex items-center justify-center rounded-[4px] text-[10px] font-black"
              style={{
                background:
                  r === 'W' ? 'var(--success)' :
                  r === 'L' ? 'var(--danger)' :
                  'var(--warning)',
                color: 'var(--bg-base)',
              }}
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <TeamPerformanceChart stats={stats} />
    </section>
  );
}

async function TransfersSection({ teamId }: { teamId: number }) {
  const transferList = await captureCatch(getTransfers(undefined, teamId), []).then(r => r.slice(0, 5));

  return (
    <AsyncSection
      error={null}
      isEmpty={!transferList.length}
      emptyIcon={<RefreshCcw className="w-7 h-7 text-[var(--brand)] mb-2"/>}
      emptyMessage="No recent transfers."
    >
      {transferList.length > 0 && (
        <div className="card fade-up fade-up-delay-2">
          <h3 className="text-sm font-semibold text-[var(--primary)] mb-3">Latest Transfers</h3>
          <div className="space-y-3">
            {transferList.map((t, i) => (
              <div key={i} className="text-sm">
                <Link
                  href={`/player/${toSlug(t.player.name)}`}
                  className="font-medium text-[var(--text-body)] hover:text-[var(--brand)] transition-colors"
                >
                  {t.player.name}
                </Link>
                {t.transfers.slice(0, 1).map((tr, j) => (
                  <div key={j} className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                    <Image src={tr.teams.out.logo} alt="" width={14} height={14} />
                    <span><ArrowRight className="w-3 h-3 inline" /></span>
                    <Image src={tr.teams.in.logo} alt="" width={14} height={14} />
                    <span>{tr.type} · {tr.date}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </AsyncSection>
  );
}

export default async function TeamPage({ params, searchParams }: Props) {
  const param = (await params).slug;
  const { league: leagueParam, tz } = await searchParams;

  // Backward compat: old numeric ID
  if (/^\d+$/.test(param)) {
    const idToSlug = await getTeamIdToSlug();
    const slug = idToSlug.get(Number(param));
    if (slug) redirect(`/team/${slug}${leagueParam ? `?league=${leagueParam}` : ''}`);
    notFound();
  }

  const slugMap = await getTeamSlugMap();
  const mappedId = slugMap.get(param);
  const leagueId = leagueParam ? Number(leagueParam) : MAJOR_LEAGUES[0].id;

  const [teamList, standingsRes] = await Promise.all([
    mappedId
      ? captureCatch(getTeam(mappedId), [])
      : captureCatch(getTeamsSearch(param.replace(/-/g, ' ')), []),
    captureCatch(getStandings(leagueId, CURRENT_SEASON), [])
  ]);

  if (!teamList.length) notFound();

  const { team, venue } = teamList[0];
  const teamId = team.id;
  const teamStanding = standingsRes[0]?.league?.standings.flat().find(s => s.team.id === teamId);
  const leagueName = MAJOR_LEAGUES.find(l => l.id === leagueId)?.name;
  const teamLD = generateSportsTeamLD({
    name: team.name,
    logo: team.logo,
    url: `https://activesports.live/team/${param}`,
    country: team.country,
    foundingDate: team.founded,
    ...(leagueName && { memberOf: { name: leagueName } }),
  });

  const squadSkeleton = <div className="card space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-[6px]" />)}</div>;
  const fixturesSkeleton = <div className="space-y-2"><SkeletonFixtureList count={3} /></div>;
  const transfersSkeleton = <div className="card space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-1"><div className="skeleton h-3.5 w-24" /><div className="skeleton h-3 w-36" /></div>)}</div>;

  const breadcrumbLd = generateBreadcrumbLD([
    { name: 'Home', item: 'https://activesports.live' },
    { name: 'Teams', item: 'https://activesports.live/teams' },
    { name: team.name, item: `https://activesports.live/team/${param}` },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <JsonLd data={teamLD} />
      <JsonLd data={breadcrumbLd} />

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
                  src={team.logo}
                  alt={team.name}
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
                  Professional Club
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    {team.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Est. {team.founded}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-[1.1]">
                  {team.name}
                </h1>
                <FavoriteButton type="team" entityId={team.id} name={team.name} logo={team.logo} />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-start gap-4 sm:gap-8">
                {teamStanding && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <span className="text-xl font-black text-[var(--brand)]">#{teamStanding.rank}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Rank</p>
                      <p className="text-lg font-bold text-white leading-none">{teamStanding.points} pts</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <Users className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Stadium</p>
                    <p className="text-lg font-bold text-white leading-none truncate max-w-[150px] sm:max-w-none">
                      {venue.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                    <RefreshCcw className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Capacity</p>
                    <p className="text-lg font-bold text-white leading-none">{venue.capacity?.toLocaleString() || '--'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: High Priority Dynamic Data */}
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={fixturesSkeleton}>
            <FixturesSection teamId={teamId} leagueId={leagueId} timezone={tz} />
          </Suspense>

          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-[6px]" />)}</div>}>
            <TeamStatsSection teamId={teamId} leagueId={leagueId} />
          </Suspense>

          <Suspense fallback={squadSkeleton}>
            <SquadSection teamId={teamId} />
          </Suspense>
        </div>

        {/* Sidebar: Supporting Information */}
        <aside className="space-y-6">
          <Suspense fallback={<div className="card space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-[6px]" />)}</div>}>
            <CoachSection teamId={teamId} />
          </Suspense>

          <Suspense fallback={transfersSkeleton}>
            <TransfersSection teamId={teamId} />
          </Suspense>

          {venue.image && (
            <Link href={`/venue/${venue.id}`} className="block card overflow-hidden fade-up p-0 hover:ring-2 hover:ring-[var(--brand)]/30 transition-all">
              <Image
                src={venue.image}
                alt={venue.name}
                width={800}
                height={300}
                className="w-full object-cover aspect-[16/9]"
              />
              <div className="p-5">
                <h3 className="text-base font-semibold text-[var(--primary)]">{venue.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {venue.address}, {venue.city} · Capacity {venue.capacity?.toLocaleString()}
                </p>
              </div>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
