'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight, DollarSign, Zap, Globe, Shield } from 'lucide-react';

const MOCK_TRANSFERS = [
  { id: 1, name: 'Kylian Mbappé', from: 'PSG', to: 'Real Madrid', value: '€180M', status: 'Confirmed', type: 'Free', logo: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 2, name: 'Jude Bellingham', from: 'Dortmund', to: 'Real Madrid', value: '€103M', status: 'Confirmed', type: 'Fixed', logo: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 3, name: 'Harry Kane', from: 'Tottenham', to: 'Bayern Munich', value: '€100M', status: 'Confirmed', type: 'Fixed', logo: 'https://media.api-sports.io/football/teams/157.png' },
];

const TRENDING_PLAYERS = [
  { id: 1, name: 'Erling Haaland', team: 'Man City', value: '€180M', rating: 9.2, trend: '+4.2%', photo: 'https://media.api-sports.io/football/players/1100.png' },
  { id: 2, name: 'Lamine Yamal', team: 'Barcelona', value: '€120M', rating: 8.8, trend: '+15.5%', photo: 'https://media.api-sports.io/football/players/358826.png' },
  { id: 3, name: 'Vinícius Júnior', team: 'Real Madrid', value: '€150M', rating: 9.0, trend: '+2.1%', photo: 'https://media.api-sports.io/football/players/730.png' },
];

export default function TransferHub() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Market Pulse (Large Bento) */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Confirmed Deals */}
         <div className="card bg-gradient-to-br from-[var(--bg-elevated)] to-black border border-white/5 p-6 rounded-[32px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-700">
               <DollarSign className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                     <Shield className="w-4 h-4 text-[var(--brand)]" /> Confirmed Deals
                  </h3>
                  <span className="text-[10px] font-bold text-[var(--brand)] bg-[var(--brand-dim)] px-2 py-0.5 rounded-full border border-[var(--brand)]/30">Live Update</span>
               </div>
               <div className="space-y-4">
                  {MOCK_TRANSFERS.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <img src={t.logo} alt="" className="w-8 h-8 object-contain" />
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-white">{t.name}</span>
                             <span className="text-[9px] text-[var(--text-muted)] font-medium">To {t.to}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-black text-[var(--brand)]">{t.value}</div>
                          <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">{t.type}</div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                  Full Transfer Log
               </button>
            </div>
         </div>

         {/* Market Analysis */}
         <div className="card bg-[var(--bg-surface)] border border-white/5 p-6 rounded-[32px] flex flex-col justify-between">
            <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-6">
                  <Zap className="w-4 h-4 text-yellow-400" /> Market Analysis
               </h3>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                    "The summer window is seeing an unprecedented rise in young talent valuation. Lamine Yamal's market surge has redefined the 17-year-old benchmark."
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                     <div className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest">Total Spend</div>
                     <div className="text-lg font-black text-white">€1.42B</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                     <div className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest">Avg Value</div>
                     <div className="text-lg font-black text-white">€24.1M</div>
                  </div>
               </div>
            </div>
            <Link href="/stats" className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand)] hover:translate-x-1 transition-transform">
               Market Deep Dive <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </div>

      {/* 2. Trending Players (Sidebar Style) */}
      <div className="card bg-black border border-white/5 p-6 rounded-[32px] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10">
            <TrendingUp className="w-48 h-48 text-[var(--brand)]" />
         </div>
         <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-8">
               <TrendingUp className="w-4 h-4 text-[var(--brand)]" /> Trending Now
            </h3>
            <div className="space-y-6 flex-1">
               {TRENDING_PLAYERS.map((p) => (
                 <div key={p.id} className="flex items-center gap-4 group">
                    <div className="relative">
                       <div className="absolute inset-0 bg-[var(--brand)] rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                       <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                          <img src={p.photo} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                       <span className="text-xs font-black text-white truncate">{p.name}</span>
                       <span className="text-[10px] text-[var(--text-muted)] font-bold">{p.team}</span>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-black text-[var(--brand)]">{p.trend}</div>
                       <div className="text-[11px] font-bold text-white/40">{p.value}</div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
               <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Global Scout</span>
                     <span className="text-[9px] text-white/40 font-medium">Tracking 4,265 active players</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
