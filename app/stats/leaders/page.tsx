import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, 
  Target, 
  Zap, 
  ShieldAlert, 
  ChevronRight, 
  Star,
  Users
} from 'lucide-react';
import { 
  getTopScorers, 
  getTopAssists, 
  getTopYellowCards, 
  getTopRedCards, 
  MAJOR_LEAGUES, 
  CURRENT_SEASON 
} from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Stats Leaders — ActiveSports',
  description: 'Track the top scorers, assist kings, and discipline records across all major European leagues.',
};

interface PageProps {
  searchParams: Promise<{ league?: string }>;
}

async function LeaderCard({ 
  title, 
  icon: Icon, 
  data, 
  statLabel 
}: { 
  title: string; 
  icon: any; 
  data: any[]; 
  statLabel: string;
}) {
  return (
    <div className="card fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] flex items-center justify-center border border-[var(--brand)]/20">
          <Icon className="w-5 h-5 text-[var(--brand)]" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {data.slice(0, 5).map((p: any, i: number) => {
          const stats = p.statistics?.[0];
          if (!stats) return null;
          
          let value = 0;
          if (statLabel === 'Goals') value = stats.goals?.total || 0;
          if (statLabel === 'Assists') value = stats.goals?.assists || 0;
          if (statLabel === 'Yellow') value = stats.cards?.yellow || 0;
          if (statLabel === 'Red') value = stats.cards?.red || 0;

          return (
            <div key={p.player.id} className="flex items-center gap-4 group">
              <span className="text-sm font-black text-[var(--text-muted)] w-4">{i + 1}</span>
              <div className="relative">
                <Image 
                  src={p.player.photo} 
                  alt={p.player.name} 
                  width={40} 
                  height={40} 
                  className="rounded-full ring-1 ring-white/10 group-hover:ring-[var(--brand)]/30 transition-all"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/player/${toSlug(p.player.name)}`} 
                  className="text-sm font-bold text-white hover:text-[var(--brand)] transition-colors block truncate"
                >
                  {p.player.name}
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  {stats.team?.logo && <Image src={stats.team.logo} alt="" width={12} height={12} />}
                  <span className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                    {stats.team?.name || 'Unknown Team'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-display font-black text-white">{value}</div>
                <div className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">{statLabel}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <button className="text-[10px] font-black uppercase tracking-widest text-[var(--brand)] hover:underline flex items-center gap-1">
          View Full List <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default async function LeadersPage({ searchParams }: PageProps) {
  const { league: leagueParam } = await searchParams;
  const leagueId = leagueParam ? Number(leagueParam) : 39; // Default to Premier League
  const currentLeague = MAJOR_LEAGUES.find((l: { id: number }) => l.id === leagueId) || MAJOR_LEAGUES[0];

  const [scorers, assists, yellow, red] = await Promise.all([
    captureCatch(getTopScorers(leagueId, CURRENT_SEASON), []),
    captureCatch(getTopAssists(leagueId, CURRENT_SEASON), []),
    captureCatch(getTopYellowCards(leagueId, CURRENT_SEASON), []),
    captureCatch(getTopRedCards(leagueId, CURRENT_SEASON), []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative p-8 sm:p-12 mb-12 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Trophy className="w-96 h-96 -mr-20 -mt-20 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Star className="w-3 h-3 fill-current" /> Season Leaders {CURRENT_SEASON}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-6 tracking-tight">
            The Elite <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Stats Dashboard
            </span>
          </h1>
          
          <p className="text-[var(--text-muted)] max-w-xl text-lg leading-relaxed mb-8">
            Tracking the top performers across {MAJOR_LEAGUES.length} major competitions. Goals, assists, and discipline records updated in real-time.
          </p>

          <div className="flex flex-wrap gap-2">
            {MAJOR_LEAGUES.slice(0, 5).map((l: any) => (
              <Link
                key={l.id}
                href={`/stats/leaders?league=${l.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  leagueId === l.id 
                    ? 'bg-[var(--brand)] border-[var(--brand)] text-black' 
                    : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeaderCard title="Top Scorers" icon={Target} data={scorers} statLabel="Goals" />
        <LeaderCard title="Playmakers" icon={Zap} data={assists} statLabel="Assists" />
        <LeaderCard title="Yellow Cards" icon={ShieldAlert} data={yellow} statLabel="Yellow" />
        <LeaderCard title="Red Cards" icon={ShieldAlert} data={red} statLabel="Red" />
      </div>

      {/* ── INFO SECTION ───────────────────────────────────────── */}
      <section className="mt-20 card p-10 bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden relative">
        <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Users className="w-64 h-64 -mr-10 -mt-10 text-white" />
        </div>
        
        <div className="max-w-3xl relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4">How we track these stats</h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-6">
            Our data is synchronized every 15 minutes with the official league records. This dashboard highlights the individual excellence of players within {currentLeague.name}. For deeper analysis, visit individual player profiles to see heatmap data, shot accuracy, and key passes per 90 minutes.
          </p>
          <div className="flex gap-4">
             <div className="flex flex-col">
               <span className="text-xl font-bold text-white">{scorers.length > 0 ? scorers[0].player.name : '\u2014'}</span>
               <span className="text-[10px] text-[var(--brand)] font-black uppercase tracking-widest">Current League Leader</span>
             </div>
             <div className="w-px h-10 bg-white/10 mx-4" />
             <div className="flex flex-col">
               <span className="text-xl font-bold text-white">{CURRENT_SEASON}</span>
               <span className="text-[10px] text-[var(--brand)] font-black uppercase tracking-widest">Active Season</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
