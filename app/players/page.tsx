import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { User, Zap, TrendingUp, Search } from 'lucide-react';
import { toSlug } from '@/lib/slug';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Football Players Directory | ActiveSports',
  description: 'Explore our comprehensive database of over 4,000 professional football players. Stats, bios, and market values.',
};

export default async function PlayersPage() {
  const playerModel = (prisma as any).player;
  
  const players = await playerModel.findMany({
    take: 48,
    orderBy: { name: 'asc' },
    include: { team: true }
  });

  const totalPlayers = await playerModel.count();

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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.1),transparent_70%)]" />
         </div>
         
         <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
               <User className="w-3 h-3 text-[var(--brand)] fill-current" /> Professional Athlete Hub
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
               ELITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-emerald-400">PLAYERS</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
               Real-time stats, career history, and AI-powered performance analysis for thousands of athletes across all major leagues.
            </p>

            <div className="absolute bottom-10 flex items-center gap-10 px-10 py-5 rounded-[28px] bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-2xl">
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">{totalPlayers.toLocaleString()}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand)]">Indexed</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">45+</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Leagues</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white">Top 1%</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Coverage</span>
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {players.map((p: any) => (
          <Link 
            key={p.id} 
            href={`/player/${toSlug(p.name)}`}
            className="group relative bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.07] hover:border-[var(--brand)]/30 transition-all p-4 text-center"
          >
             <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-[var(--brand)] rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                   <img src={p.photo || '/media/placeholder-player.png'} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
             </div>
             <h3 className="text-sm font-black text-white truncate mb-1">{p.name}</h3>
             <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] truncate uppercase tracking-widest">{p.team?.name}</span>
                <span className="text-[9px] font-black text-[var(--brand)] uppercase tracking-tighter bg-[var(--brand-dim)] px-2 py-0.5 rounded-full">{p.position}</span>
             </div>
          </Link>
        ))}
      </div>

      {/* Pagination / Load More (Placeholder) */}
      <div className="mt-16 text-center">
         <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
            Showing first 48 of {totalPlayers.toLocaleString()} players
         </p>
         <div className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest cursor-not-allowed opacity-50">
            Load More <TrendingUp className="w-4 h-4" />
         </div>
      </div>
    </div>
  );
}
