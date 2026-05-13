import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getTeam, getTeamsSearch, getSquad, getFixturesByLeague,
  getTransfers, getTeamStatistics, getCoach, MAJOR_LEAGUES, CURRENT_SEASON
} from '@/lib/apifootball';
import { SkeletonFixtureList } from '@/components/Skeleton';
import AsyncSection from '@/components/AsyncSection';
import { generateSportsTeamLD } from '@/lib/json-ld';
import { Users, Calendar, RefreshCcw, ArrowRight } from 'lucide-react';
import MatchCard from '@/components/MatchCard';
import FavoriteButton from '@/components/FavoriteButton';
import Widget from '@/components/Widget';
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
      title: `${team.name} Official Profile | ActiveSports`,
      description: `Tactical insights and performance metrics for ${team.name}.`,
      images: [{ url: team.logo }],
    }
  };
}

// ─── Streaming sections ───────────────────────────────────────────

function SquadSection({ teamId }: { teamId: number }) {
  return (
    <section className="card fade-up">
      <h2 className="section-title">Squad</h2>
      <Widget 
        type="squad" 
        team={teamId} 
      />
    </section>
  );
}

function FormSection({ teamId }: { teamId: number }) {
  return (
    <section className="card fade-up">
      <h2 className="section-title">Team Form</h2>
      <Widget 
        type="team-form" 
        team={teamId} 
      />
    </section>
  );
}

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

  const teamList =
    mappedId
      ? await captureCatch(getTeam(mappedId), [])
      : await captureCatch(getTeamsSearch(param.replace(/-/g, ' ')), []);
  if (!teamList.length) notFound();

  const { team, venue } = teamList[0];
  const teamId = team.id;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <JsonLd data={teamLD} />

      <div className="card mb-8 relative overflow-hidden fade-up">
        <div className="flex items-center gap-6">
          <Image
            src={team.logo}
            alt={team.name}
            width={80}
            height={80}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[var(--primary)]">{team.name}</h1>
              <FavoriteButton type="team" entityId={team.id} name={team.name} logo={team.logo} />
            </div>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                {team.country} · Founded {team.founded}
              </p>
              <div className="flex gap-4 text-sm text-[var(--text-body)]">
                <div>
                  <span className="text-[var(--text-muted)]">Stadium: </span>
                  <Link href={`/venue/${venue.id}`} className="hover:text-[var(--brand)] transition-colors">
                    {venue.name}
                  </Link>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Capacity: </span>
                  <span>{venue.capacity?.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/teams" className="text-xs text-[var(--brand)] hover:underline mt-2 inline-block">
                Browse all teams A–Z →
              </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={squadSkeleton}>
            <SquadSection teamId={teamId} />
          </Suspense>
          <FormSection teamId={teamId} />
          <Suspense fallback={<div className="card space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-[6px]" />)}</div>}>
            <CoachSection teamId={teamId} />
          </Suspense>
          {venue.image && (
            <Link href={`/venue/${venue.id}`} className="block card overflow-hidden fade-up p-0 hover:ring-2 hover:ring-[var(--brand)]/30 transition-all">
              <Image
                src={venue.image}
                alt={venue.name}
                width={800}
                height={300}
                className="w-full object-cover"
                style={{ height: 200 }}
              />
              <div className="p-5">
                <h3 className="text-base font-semibold text-[var(--primary)]">{venue.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {venue.address}, {venue.city} · Capacity {venue.capacity?.toLocaleString()}
                </p>
              </div>
            </Link>
          )}
        </div>
        <aside className="space-y-6">
          <Suspense fallback={fixturesSkeleton}>
            <FixturesSection teamId={teamId} leagueId={leagueId} timezone={tz} />
          </Suspense>
          <Suspense fallback={<div className="card space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-[6px]" />)}</div>}>
            <TeamStatsSection teamId={teamId} leagueId={leagueId} />
          </Suspense>
          <Suspense fallback={transfersSkeleton}>
            <TransfersSection teamId={teamId} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
