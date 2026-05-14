import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getPlayer, getTrophies, getTransfers, getInjuries, getSidelined, getPlayersSearch, getCoach, CURRENT_SEASON, getTopScorers } from '@/lib/apifootball';
import AsyncSection from '@/components/AsyncSection';
import { generatePersonLD, generateBreadcrumbLD } from '@/lib/json-ld';
import { captureCatch } from '@/lib/utils';
import { isFullBuild } from '@/lib/build-params';
import { generatePlayerAbout } from '@/lib/content-generator';
import { toSlug } from '@/lib/slug';
import { getPlayerSlugMap, getPlayerIdToSlug } from '@/lib/slug-maps';
import { User, Globe, Ruler, Weight, Trophy, RefreshCcw, Activity, ArrowRight, BookOpen, Briefcase, TrendingUp, Zap, Shield, Target } from 'lucide-react';
import PlayerRadarChart from '@/components/PlayerRadarChart';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ refresh?: string }>;
}

export async function generateStaticParams() {
  if (!isFullBuild()) return [];
  const slugMap = await getPlayerSlugMap();
  return [...slugMap.keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  let playerId: number | undefined;
  if (/^\d+$/.test(param)) {
    playerId = Number(param);
  } else {
    const slugMap = await getPlayerSlugMap();
    playerId = slugMap.get(param);
  }
  if (!playerId) return { title: 'Player Not Found' };
  const players = await captureCatch(getPlayer(playerId, CURRENT_SEASON), []);
  const player = players[0]?.player;
  if (!player) return { title: 'Athlete Profile' };
  
  const teamName = players[0]?.statistics[0]?.team?.name ?? 'Independent';
  
  return {
    title: `${player.name} — ${teamName} Stats, Bio & Transfers`,
    description: `Explore the complete tactical profile of ${player.name} at ${teamName}. Real-time 2024/25 stats, career history, and market value analysis.`,
    alternates: { canonical: `https://activesports.live/player/${param}` },
    openGraph: {
      title: `${player.name} Profile | ActiveSports`,
      description: `Tactical insights and performance metrics for ${player.name}.`,
      images: [{ url: player.photo }],
    }
  };
}

async function StatsSection({ playerId, forceRefresh }: { playerId: number, forceRefresh?: boolean }) {
  const players = await captureCatch(getPlayer(playerId, CURRENT_SEASON, forceRefresh), []);
  const statistics = players[0]?.statistics ?? [];
  const mainStats = statistics[0];

  if (!mainStats) return null;

  return (
    <section className="card p-6 sm:p-8 relative overflow-hidden group fade-up">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Activity size={160} />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center border border-[var(--brand)]/20 shadow-inner">
            <Activity className="w-6 h-6 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white">Season Performance</h2>
            <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Tactical metrics for {CURRENT_SEASON}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Profile</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Rating', val: mainStats.games.rating || '—', color: 'var(--brand)' },
          { label: 'Goals', val: mainStats.goals.total || 0, color: '#10b981' },
          { label: 'Assists', val: mainStats.goals.assists || 0, color: '#3b82f6' },
          { label: 'Appearances', val: mainStats.games.appearances || 0, color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} className="relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-display font-black text-white" style={{ color: stat.val !== '—' ? stat.color : undefined }}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-8">
        <div className="space-y-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--brand)]" /> Performance breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Dribbles', val: `${mainStats.dribbles.success || 0}` },
              { label: 'Duels Won', val: `${mainStats.duels.won || 0}` },
              { label: 'Pass Acc.', val: `${mainStats.passes.accuracy || 0}%` },
              { label: 'Tackles', val: `${mainStats.tackles.total || 0}` }
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{s.label}</span>
                <span className="text-xs font-black text-white">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <PlayerRadarChart stats={mainStats} />
        </div>
      </div>
    </section>
  );
}

async function DetailedStatsSection({ playerId }: { playerId: number }) {
  const players = await captureCatch(getPlayer(playerId, CURRENT_SEASON), []);
  const mainStats = players[0]?.statistics?.[0];
  if (!mainStats) return null;

  const categories = [
    {
      title: 'Attack',
      icon: <Target className="w-4 h-4 text-[var(--danger)]" />,
      items: [
        { label: 'Total Shots', value: mainStats.shots.total },
        { label: 'Shots on Target', value: mainStats.shots.on },
        { label: 'Dribble Attempts', value: mainStats.dribbles.attempts },
        { label: 'Successful Dribbles', value: mainStats.dribbles.success },
        { label: 'Penalties Won', value: mainStats.penalty.won },
        { label: 'Penalties Scored', value: mainStats.penalty.scored },
      ]
    },
    {
      title: 'Distribution',
      icon: <RefreshCcw className="w-4 h-4 text-[var(--accent)]" />,
      items: [
        { label: 'Total Passes', value: mainStats.passes.total },
        { label: 'Key Passes', value: mainStats.passes.key },
        { label: 'Accuracy', value: mainStats.passes.accuracy ? `${mainStats.passes.accuracy}%` : null },
        { label: 'Crosses', value: null },
        { label: 'Through Balls', value: null },
      ]
    },
    {
      title: 'Defense',
      icon: <Shield className="w-4 h-4 text-[var(--success)]" />,
      items: [
        { label: 'Tackles', value: mainStats.tackles.total },
        { label: 'Interceptions', value: mainStats.tackles.interceptions },
        { label: 'Blocks', value: mainStats.tackles.blocks },
        { label: 'Duels Won', value: mainStats.duels.won },
        { label: 'Aerials Won', value: null },
      ]
    },
    {
      title: 'Discipline',
      icon: <Activity className="w-4 h-4 text-[var(--warning)]" />,
      items: [
        { label: 'Yellow Cards', value: mainStats.cards.yellow },
        { label: 'Red Cards', value: mainStats.cards.red },
        { label: 'Fouls Committed', value: mainStats.fouls.committed },
        { label: 'Fouls Drawn', value: mainStats.fouls.drawn },
      ]
    }
  ];

  return (
    <section className="card mb-6 fade-up">
      <h2 className="section-title">Detailed Statistical Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div key={cat.title} className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] w-fit">
              {cat.icon}
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{cat.title}</span>
            </div>
            <div className="space-y-2">
              {cat.items.map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm py-1 border-b border-white/[0.03]">
                  <span className="text-[var(--text-muted)] text-xs">{item.label}</span>
                  <span className="font-bold text-white">{item.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function TrophiesSection({ playerId }: { playerId: number }) {
  const trophyList = await captureCatch(getTrophies(playerId), []);

  return (
    <AsyncSection
      error={null}
      isEmpty={!trophyList.length}
      emptyIcon={<Trophy className="w-7 h-7 text-[var(--warning)] mb-2"/>}
      emptyMessage="No trophy data available for this player."
    >
      {trophyList.length > 0 && (
        <section className="card mb-6 fade-up">
          <h2 className="section-title flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--warning)]" />
            Trophy Cabinet ({trophyList.filter(t => t.place === 'Winner').length} titles)
          </h2>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {trophyList.filter(t => t.place === 'Winner').map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="font-medium text-[var(--text-body)]">{t.league}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{t.country}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--warning)]">{t.season}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AsyncSection>
  );
}

async function InjuriesSection({ playerId }: { playerId: number }) {
  const injuryList = await captureCatch(getInjuries(undefined, undefined, undefined, playerId), []);

  return (
    <AsyncSection
      error={null}
      isEmpty={!injuryList.length}
      emptyIcon={<Activity className="w-7 h-7 text-[var(--danger)] mb-2"/>}
      emptyMessage="No injury history available for this player."
    >
      {injuryList.length > 0 && (
        <section className="card mb-6 fade-up">
          <h2 className="section-title flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--danger)]" />
            Injury History
          </h2>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {injuryList.map((inj, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="font-medium text-[var(--text-body)]">{inj.player?.reason || 'Unknown Reason'}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{inj.fixture?.date?.split('T')[0] || 'Unknown Date'}</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-[4px] bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  {inj.team?.name || 'Unknown Team'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AsyncSection>
  );
}

async function SidelinedSection({ playerId }: { playerId: number }) {
  const sidelinedList = await captureCatch(getSidelined(playerId), []);

  return (
    <AsyncSection
      error={null}
      isEmpty={!sidelinedList.length}
      emptyIcon={<Activity className="w-7 h-7 text-[var(--warning)] mb-2"/>}
      emptyMessage="No records for this player."
    >
      {sidelinedList.length > 0 && (
        <section className="card mb-6 fade-up">
          <h2 className="section-title flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--warning)]" />
            Suspensions & Sidelined
          </h2>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {sidelinedList.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="font-medium text-[var(--text-body)]">{s.player?.reason || s.player?.type || 'Unknown'}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{s.team?.name || 'Unknown Team'}</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-[4px] bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  {s.player?.type || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AsyncSection>
  );
}

async function PlayerAboutSection({ player, teamName }: { player: any, teamName: string }) {
  const about = await generatePlayerAbout(player.name, player.nationality, teamName, player.age);
  if (!about) return null;

  return (
    <section className="card mb-6 fade-up">
      <h2 className="section-title flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[var(--brand)]" />
        About {player.name}
      </h2>
      <p className="text-sm leading-relaxed text-[var(--text-body)] italic opacity-80">
        &quot;{about}&quot;
      </p>
    </section>
  );
}

async function TransfersSection({ playerId }: { playerId: number }) {
  const transferList = await captureCatch(getTransfers(playerId), []);

  return (
    <AsyncSection
      error={null}
      isEmpty={!transferList.length}
      emptyIcon={<RefreshCcw className="w-7 h-7 text-[var(--accent)] mb-2"/>}
      emptyMessage="No transfer history available."
    >
      {transferList.length > 0 && (
        <section className="card fade-up">
          <h2 className="section-title">Transfer History</h2>
          <div className="space-y-1">
            {transferList[0]?.transfers.slice(0, 8).map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs w-24 shrink-0 text-[var(--text-muted)]">{t.date}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {t.teams.out.logo && <Image src={t.teams.out.logo} alt="" width={16} height={16} />}
                  <span className="text-[var(--text-muted)] truncate">{t.teams.out.name}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--border)] shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {t.teams.in.logo && <Image src={t.teams.in.logo} alt="" width={16} height={16} />}
                  <span className="text-[var(--text-body)] font-medium truncate">{t.teams.in.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)] shrink-0">
                  {t.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AsyncSection>
  );
}

async function CoachSection({ playerId }: { playerId: number }) {
  const coach = await captureCatch(getCoach(playerId), []);
  if (!coach.length) return null;
  const c = coach[0];

  return (
    <section className="card mb-6 fade-up">
      <h2 className="section-title flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-[var(--accent)]" />
        Management Career
      </h2>
      <div className="space-y-4">
        {c.career.slice(0, 5).map((job, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center border border-white/5">
              {job.team.logo && <Image src={job.team.logo} alt="" width={24} height={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate group-hover:text-[var(--brand)] transition-colors">
                {job.team.name}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">
                {job.start} — {job.end || 'Present'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function PlayerPage({ params, searchParams }: Props) {
  const param = (await params).slug;
  const { refresh } = await searchParams;
  const isRefresh = refresh === 'true';

  if (/^\d+$/.test(param)) {
    const idToSlug = await getPlayerIdToSlug();
    const slug = idToSlug.get(Number(param));
    if (slug) redirect(`/player/${slug}`);
    notFound();
  }

  const slugMap = await getPlayerSlugMap();
  let playerId = slugMap.get(param);
  let isCoachFallback = false;

  if (!playerId) {
    const searchName = param.replace(/-/g, ' ');
    let searchResults = await captureCatch(getPlayersSearch(searchName), []);
    if (!searchResults.length && searchName.split(' ').length > 2) {
      const simplerName = searchName.split(' ').slice(0, 2).join(' ');
      searchResults = await captureCatch(getPlayersSearch(simplerName), []);
    }

    if (searchResults.length > 0) {
      playerId = searchResults[0].player.id;
    } else {
      let coachResults = await captureCatch(getCoach(undefined, undefined, searchName), []);
      if (!coachResults.length && searchName.split(' ').length > 2) {
        const simplerName = searchName.split(' ').slice(0, 2).join(' ');
        coachResults = await captureCatch(getCoach(undefined, undefined, simplerName), []);
      }
      if (coachResults.length > 0) {
        playerId = coachResults[0].id;
        isCoachFallback = true;
      }
    }
  }

  if (!playerId) notFound();

  let players: { player: any; statistics: any[] }[] = [];
  const seasonsToTry = [CURRENT_SEASON, CURRENT_SEASON - 1, 2022, 2021, 2020];
  if (!isCoachFallback) {
    for (const s of seasonsToTry) {
      players = await captureCatch(getPlayer(playerId, s, isRefresh), []);
      if (players.length) break;
    }
  }

  let player: any = null;
  let statistics: any[] = [];
  if (players.length) {
    player = players[0].player;
    statistics = players[0].statistics;
  } else {
    const coachData = await captureCatch(getCoach(playerId, undefined, undefined, isRefresh), []);
    if (coachData.length) {
      const c = coachData[0];
      player = { id: c.id, name: c.name, firstname: c.firstname, lastname: c.lastname, age: c.age, nationality: c.nationality, photo: c.photo, height: null, weight: null };
      isCoachFallback = true;
    } else {
       notFound();
    }
  }

  const mainStats = statistics[0];
  const playerLD = generatePersonLD({
    name: `${player.firstname} ${player.lastname}`,
    image: player.photo,
    url: `https://activesports.live/player/${param}`,
    jobTitle: isCoachFallback ? 'Football Coach' : 'Professional Athlete',
    nationality: player.nationality,
    ...(mainStats?.team && { 
      affiliation: { 
        name: mainStats.team.name, 
        url: `https://activesports.live/team/${toSlug(mainStats.team.name)}` 
      } 
    }),
    height: player.height,
    weight: player.weight,
  });

  const breadcrumbLd = generateBreadcrumbLD([
    { name: 'Home', item: 'https://activesports.live' },
    { name: 'Players', item: 'https://activesports.live/players' },
    { name: player.name, item: `https://activesports.live/player/${param}` },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <JsonLd data={playerLD} />
      <JsonLd data={breadcrumbLd} />

      <div className="card mb-8 fade-up border-b-2 border-b-[var(--brand)]/20 p-6 sm:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-[var(--bg-subtle)] ring-4 ring-white/5 overflow-hidden shadow-2xl">
              <Image src={player.photo} alt={player.name} width={128} height={128} className="object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[var(--brand)] flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0a]">
              <span className="text-black font-black text-sm">#{mainStats?.games?.number || '—'}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-center md:justify-start gap-3 mb-6">
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
                {player.firstname} <span className="text-[var(--brand)]">{player.lastname}</span>
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1 opacity-80">
                {mainStats?.team?.logo && <Image src={mainStats.team.logo} alt="" width={24} height={24} />}
                <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{mainStats?.team?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto md:mx-0">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--text-muted)] bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg">
                <User className="w-3.5 h-3.5 text-[var(--brand)]" /> <span className="font-bold text-white">Age {player.age}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--text-muted)] bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-[var(--brand)]" /> <span className="font-bold text-white">{player.nationality}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--text-muted)] bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg">
                <Ruler className="w-3.5 h-3.5 text-[var(--brand)]" /> <span className="font-bold text-white">{player.height || '—'}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-[var(--text-muted)] bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg">
                <Weight className="w-3.5 h-3.5 text-[var(--brand)]" /> <span className="font-bold text-white">{player.weight || '—'}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Current Season</div>
            <div className="text-5xl font-display font-black text-white/5 tracking-tighter">{CURRENT_SEASON}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Suspense fallback={<div className="card h-64 skeleton" />}>
            <StatsSection playerId={playerId} forceRefresh={isRefresh} />
          </Suspense>
          <Suspense fallback={<div className="card h-48 skeleton" />}>
            <DetailedStatsSection playerId={playerId} />
          </Suspense>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<div className="card h-48 skeleton" />}>
              <InjuriesSection playerId={playerId} />
            </Suspense>
            <Suspense fallback={<div className="card h-48 skeleton" />}>
              <SidelinedSection playerId={playerId} />
            </Suspense>
          </div>
          <Suspense fallback={<div className="card h-60 skeleton" />}>
            <TransfersSection playerId={playerId} />
          </Suspense>
        </div>

        <div className="space-y-6">
           <Suspense fallback={<div className="card h-40 skeleton" />}>
             <PlayerAboutSection player={player} teamName={mainStats?.team?.name || 'Independent'} />
           </Suspense>
           <Suspense fallback={<div className="card h-48 skeleton" />}>
             <TrophiesSection playerId={playerId} />
           </Suspense>
           <Suspense fallback={null}>
             <CoachSection playerId={playerId} />
           </Suspense>
           <section className="card bg-gradient-to-br from-[var(--brand)]/10 to-transparent border-[var(--brand)]/20">
             <h2 className="text-xs font-black uppercase tracking-widest text-[var(--brand)] mb-4">Quick Navigation</h2>
             <div className="space-y-2">
               {[{ href: '/stats/leaders', label: 'League Leaders' }, { href: '/transfers', label: 'Transfer Center' }, { href: '/injuries', label: 'Medical Room' }].map(link => (
                 <Link key={link.href} href={link.href} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                   <span className="text-sm font-bold text-white">{link.label}</span>
                   <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors" />
                 </Link>
               ))}
             </div>
           </section>
        </div>
      </div>

      <Suspense fallback={<div className="mt-12 h-64 skeleton" />}>
        <PopularPlayersSection />
      </Suspense>
    </div>
  );
}
async function PopularPlayersSection() {
  const topPlayers = await captureCatch(getTopScorers(39, CURRENT_SEASON), []);
  
  return (
    <section className="mt-12 fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-black text-white">Popular Players</h2>
          <p className="text-sm text-[var(--text-muted)]">Trending stars across European leagues</p>
        </div>
        <Link href="/stats/leaders" className="text-xs font-black text-[var(--brand)] uppercase tracking-widest hover:underline">
          View All Leaders
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {topPlayers.slice(0, 6).map(p => (
          <Link 
            key={p.player.id} 
            href={`/player/${toSlug(p.player.name)}`}
            className="card group hover:border-[var(--brand)]/30 transition-all p-3"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--bg-subtle)] ring-1 ring-white/5">
              <Image src={p.player.photo} alt={p.player.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="text-sm font-bold text-white truncate">{p.player.name}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-[var(--text-muted)] truncate flex-1">{p.statistics[0].team.name}</span>
              <span className="text-[10px] font-black text-[var(--brand)]">{p.statistics[0].games.rating || '—'}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
