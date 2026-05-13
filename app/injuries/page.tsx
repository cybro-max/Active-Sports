import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { 
  getInjuries, 
  MAJOR_LEAGUES, 
  CURRENT_SEASON 
} from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Injury Report — ActiveSports',
  description: 'The definitive injury tracker for all major European leagues. Stay updated on sidelined players, return dates, and team medical reports.',
};

interface PageProps {
  searchParams: Promise<{ league?: string }>;
}

export default async function InjuriesPage({ searchParams }: PageProps) {
  const { league: leagueParam } = await searchParams;
  const leagueId = leagueParam ? Number(leagueParam) : 39; // Default to PL
  const currentLeague = MAJOR_LEAGUES.find(l => l.id === leagueId) || MAJOR_LEAGUES[0];

  const injuries = await captureCatch(getInjuries(undefined, leagueId, CURRENT_SEASON), []);

  // Group by team
  const byTeam: Record<string, { logo: string; players: any[] }> = {};
  for (const inj of injuries) {
    if (!byTeam[inj.team.name]) {
      byTeam[inj.team.name] = { logo: inj.team.logo, players: [] };
    }
    byTeam[inj.team.name].players.push(inj);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative p-8 sm:p-12 mb-12 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Activity className="w-96 h-96 -mr-20 -mt-20 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <AlertCircle className="w-3 h-3" /> Live Medical Report
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-6 tracking-tight">
            The <span className="text-red-500">Medical</span> <br/>
            Room Dashboard
          </h1>
          
          <p className="text-[var(--text-muted)] max-w-xl text-lg leading-relaxed mb-8">
            Critical updates for fantasy managers and fans. Track every sidelined player across the {currentLeague.name}.
          </p>

          <div className="flex flex-wrap gap-2">
            {MAJOR_LEAGUES.slice(0, 6).map(l => (
              <Link
                key={l.id}
                href={`/injuries?league=${l.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  leagueId === l.id 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── INJURY LIST ────────────────────────────────────────── */}
      <div className="space-y-8">
        {!injuries.length ? (
          <div className="card p-12 text-center border border-dashed border-white/10">
             <Stethoscope className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
             <h2 className="text-xl font-bold text-white mb-2">No active injuries reported</h2>
             <p className="text-[var(--text-muted)]">Check back later or select another league.</p>
          </div>
        ) : (
          Object.entries(byTeam).map(([teamName, data]) => (
            <div key={teamName} className="fade-up">
              <div className="flex items-center gap-3 mb-4">
                <Image src={data.logo} alt={teamName} width={24} height={24} />
                <h2 className="text-lg font-black uppercase tracking-widest text-white">{teamName}</h2>
                <span className="text-xs text-[var(--text-muted)] font-bold">({data.players.length} players)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.players.map((inj, i) => (
                  <div key={i} className="card group hover:border-red-500/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Image 
                          src={inj.player.photo} 
                          alt={inj.player.name} 
                          width={48} 
                          height={48} 
                          className="rounded-full grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/player/${toSlug(inj.player.name)}`}
                          className="text-sm font-bold text-white hover:text-red-400 block truncate"
                        >
                          {inj.player.name}
                        </Link>
                        <div className="text-[10px] text-red-400 font-black uppercase tracking-widest mt-1">
                          {inj.player.reason}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                           <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-bold">
                             <Clock className="w-3 h-3" /> {new Date(inj.fixture.date).toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-bold">
                             <ShieldCheck className="w-3 h-3" /> {inj.player.type}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── FOOTER STATS ────────────────────────────────────────── */}
      <section className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="card bg-red-500/5 border-red-500/10 p-8">
            <h3 className="text-white font-bold mb-2">Fantasy Alert</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Always check the official lineups 60 minutes before kick-off. Our injury data is sourced from team medical bulletins and press conferences.
            </p>
         </div>
         <div className="card p-8 flex flex-col justify-center text-center">
            <div className="text-3xl font-display font-black text-white">{injuries.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Total Injured Players</div>
         </div>
         <div className="card p-8 flex flex-col justify-center text-center">
            <div className="text-3xl font-display font-black text-white">{Object.keys(byTeam).length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Affected Teams</div>
         </div>
      </section>
    </div>
  );
}
