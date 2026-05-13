import { prisma } from '@/lib/prisma';
import { MAJOR_LEAGUES } from '@/config/leagues';
import type { Metadata } from 'next';
import LeaguesGrid from './LeaguesGrid';
import Image from 'next/image';
import { Globe, Shield, Zap } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Global Football Leagues',
  description: 'Browse every major football competition worldwide. Standings, fixtures, and tactical insights for the world\'s best leagues.',
};

export default async function LeaguesPage() {
  let leagues = await prisma.league.findMany({
    orderBy: { country: 'asc' },
  });

  if (!leagues.length) {
    leagues = MAJOR_LEAGUES.map(l => ({
      id: l.id,
      name: l.name,
      type: 'League',
      logo: l.logo,
      country: l.country,
      flag: null,
      code: null,
      season: 2024,
      updatedAt: new Date(),
    }));
  }

  const countriesCount = new Set(leagues.map(l => l.country)).size;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── CINEMATIC HERO ────────────────────────────────────── */}
      <section className="relative h-[400px] sm:h-[500px] rounded-[48px] overflow-hidden mb-16 fade-up group shadow-2xl border border-white/5">
         <div className="absolute inset-0 bg-black">
            <Image 
              src="/media/hero/stadium.png" 
              alt="Stadium" 
              fill 
              className="object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(33,150,243,0.1),transparent_70%)]" />
         </div>
         
         <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pb-20 sm:pb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
               <Globe className="w-3 h-3 text-cyan-400 fill-current" /> Global Competition Hub
            </div>
            
            <h1 className="text-4xl sm:text-8xl font-black text-white mb-6 tracking-tighter leading-none uppercase">
               World <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">Leagues</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
               From the Premier League to the Libertadores—track every competition, every match, and every trophy across the globe.
            </p>

            <div className="absolute bottom-6 sm:bottom-10 flex items-center gap-6 sm:gap-10 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-[28px] bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-2xl">
               <div className="flex flex-col items-center">
                  <span className="text-base sm:text-xl font-black text-white">{countriesCount}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-cyan-400">Countries</span>
               </div>
               <div className="w-[1px] h-8 sm:h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-base sm:text-xl font-black text-white">{leagues.length}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/40">Competitions</span>
               </div>
               <div className="w-[1px] h-8 sm:h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-base sm:text-xl font-black text-white">2024/25</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/40">Season</span>
               </div>
            </div>
         </div>
      </section>

      <LeaguesGrid leagues={leagues as any} />
    </div>
  );
}
