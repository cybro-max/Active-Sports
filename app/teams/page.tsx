import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Trophy, Zap, Globe } from 'lucide-react';
import { toSlug } from '@/lib/slug';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Global Football Teams Directory | ActiveSports',
  description: 'Browse every major football club worldwide. Stats, squads, fixtures, and tactical analysis for 130+ elite teams.',
};

export default async function TeamsPage() {
  const teamModel = (prisma as any).team;
  const teams = await teamModel.findMany({
    orderBy: { name: 'asc' },
    include: { league: true }
  });

  const countriesCount = new Set(teams.map((t: any) => t.country)).size;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── CINEMATIC HERO ────────────────────────────────────── */}
      <section className="relative h-[350px] sm:h-[420px] rounded-[48px] overflow-hidden mb-16 fade-up group shadow-2xl border border-white/5">
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
         
         <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
               <Shield className="w-3 h-3 text-cyan-400 fill-current" /> Global Club Directory
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
               ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">CLUBS</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
               From historical giants to modern tactical powerhouses—track every club, squad update, and performance metric.
            </p>

            <div className="absolute bottom-10 flex items-center gap-10 px-10 py-5 rounded-[28px] bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-2xl">
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">{teams.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Teams</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">{countriesCount}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Nations</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">45+</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Leagues</span>
               </div>
            </div>
         </div>
      </section>

      {/* Teams Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {teams.map((t: any) => (
          <Link 
            key={t.id} 
            href={`/team/${toSlug(t.name)}`}
            className="group relative bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.07] hover:border-blue-500/30 transition-all p-6 text-center"
          >
             <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                <img src={t.logo} alt={t.name} className="w-full h-full object-contain relative drop-shadow-xl transition-transform group-hover:scale-110 duration-500" />
             </div>
             <h3 className="text-sm font-black text-white truncate mb-1">{t.name}</h3>
             <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] truncate uppercase tracking-widest">{t.country}</span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 px-2 py-0.5 rounded-full mt-2">View Squad</span>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
