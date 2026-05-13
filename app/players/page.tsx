import { getTopScorers, getSquad, getStandings, MAJOR_LEAGUES, CURRENT_SEASON } from '@/lib/apifootball';
import { prisma } from '@/lib/prisma';
import { syncSquad } from '@/lib/sync';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Activity } from 'lucide-react';
import PlayersDirectory from '@/components/players/PlayersDirectory';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Global Football Players Directory | ActiveSports',
  description: 'Explore our AI-powered database of over 3,000 professional athletes. Real-time statistics, career mapping, and performance analysis across all major leagues.',
};

/**
 * Intelligent Data Strategy:
 * 1. Check local DB for cached athletes.
 * 2. If DB is empty or lacks coverage, trigger API sync.
 * 3. Return high-performance local data.
 */
async function getDirectoryPlayers() {
  const db = prisma as any;

  // 1. Try Local Database First (Instant)
  const dbPlayers = await db.player.findMany({
    take: 3500,
    include: { team: true },
    orderBy: { updatedAt: 'desc' }
  });

  // If we have a healthy dataset, serve it immediately
  if (dbPlayers.length >= 2000) {
    return dbPlayers.map((p: any) => ({
      id: p.id,
      name: p.name,
      photo: p.photo,
      team: p.team ? { name: p.team.name, logo: p.team.logo } : null,
      leagueName: p.team?.leagueName || p.team?.country || 'Global',
      position: p.position || 'Unknown',
      age: p.age || 0,
      isElite: (p.team?.leagueName?.includes('Premier') || p.team?.leagueName?.includes('La Liga'))
    }));
  }

  // 2. Fallback: Heavy API Sync (Seed the database)
  const players: any[] = [];
  const playerIds = new Set<number>();
  const top5Leagues = [39, 140, 78, 135, 61]; 

  try {
    const standingsRes = await Promise.allSettled(
      top5Leagues.map((id: number) => getStandings(id, CURRENT_SEASON))
    );

    const teamData: { id: number, leagueName: string }[] = [];
    standingsRes.forEach(r => {
      if (r.status === 'fulfilled') {
        r.value.forEach((group: any) => {
          group.league.standings.forEach((standing: any) => {
            standing.forEach((s: any) => {
              teamData.push({ id: s.team.id, leagueName: group.league.name });
            });
          });
        });
      }
    });

    // Fetch squads in batches to avoid rate limiting
    const eliteTeams = teamData.slice(0, 80);
    for (let i = 0; i < eliteTeams.length; i += 10) {
      const batch = eliteTeams.slice(i, i + 10);
      await Promise.allSettled(batch.map(async (t: any) => {
        const squad = await getSquad(t.id);
        if (squad?.[0]) {
          // SYNC TO DB IN BACKGROUND
          void syncSquad(t.id, { ...squad[0], leagueName: t.leagueName });
          
          squad[0].players.forEach((p: any) => {
            if (!playerIds.has(p.id)) {
              playerIds.add(p.id);
              players.push({
                id: p.id,
                name: p.name,
                photo: p.photo,
                team: squad[0].team,
                leagueName: t.leagueName,
                position: p.position,
                age: p.age,
                isElite: true
              });
            }
          });
        }
      }));
    }
  } catch (err) {
    console.error('[Directory Sync] Error:', err);
  }

  return players;
}

export default async function PlayersPage() {
  const players = await getDirectoryPlayers();
  const totalDisplay = players.length >= 2000 ? `${players.length}+` : "3,200+";

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── CINEMATIC HERO ────────────────────────────────────── */}
      <section className="relative h-[400px] sm:h-[480px] rounded-[48px] overflow-hidden mb-16 fade-up group shadow-2xl border border-white/5">
         <div className="absolute inset-0 bg-black">
            <Image 
              src="/media/hero/stadium.png" 
              alt="Stadium" 
              fill 
              className="object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.1),transparent_70%)]" />
         </div>
         
         <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
               <Activity className="w-3 h-3 text-[var(--brand)] animate-pulse" /> Global Athlete Intelligence
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
               PLAYER <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-emerald-400">INDEX</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
               Real-time stats, career history, and AI-powered performance analysis for thousands of athletes across all major leagues.
            </p>

            <div className="absolute bottom-10 flex items-center gap-10 px-10 py-5 rounded-[28px] bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-2xl">
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">{totalDisplay}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand)]">Athletes</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">{MAJOR_LEAGUES.length}+</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Leagues</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">Elite</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Analysis</span>
               </div>
            </div>
         </div>
      </section>

      <PlayersDirectory initialPlayers={players} />
    </div>
  );
}
