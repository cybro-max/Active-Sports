import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  RefreshCcw, 
  ArrowRight, 
  TrendingUp, 
  Search,
  Zap,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { 
  getTransfers, 
  MAJOR_LEAGUES, 
  CURRENT_SEASON 
} from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Transfer Center — ActiveSports',
  description: 'Track the latest football transfer news, rumors, and confirmed signings across Europe\'s top leagues.',
};

// Popular teams for the "Global Feed"
const TRANSFER_GIANTS = [
  { id: 33, name: 'Manchester United' },
  { id: 50, name: 'Manchester City' },
  { id: 40, name: 'Liverpool' },
  { id: 42, name: 'Arsenal' },
  { id: 541, name: 'Real Madrid' },
  { id: 529, name: 'Barcelona' },
  { id: 157, name: 'Bayern Munich' },
  { id: 85, name: 'PSG' },
  { id: 496, name: 'Juventus' },
  { id: 492, name: 'Napoli' },
];

async function GlobalTransferFeed() {
  const allTransfers = await Promise.all(
    TRANSFER_GIANTS.map(team => captureCatch(getTransfers(undefined, team.id), []))
  );

  // Flatten and sort by date
  const flattened = allTransfers.flat().sort((a, b) => {
    const dateA = a.transfers[0]?.date || '';
    const dateB = b.transfers[0]?.date || '';
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="space-y-4">
      {flattened.slice(0, 15).map((t, i) => {
        const transfer = t.transfers?.[0];
        if (!transfer) return null;

        return (
          <div key={`${t.player.id}-${i}`} className="card group hover:border-[var(--brand)]/30 transition-all fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                 <div className="w-12 h-12 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center border border-white/5 overflow-hidden">
                   <Image src={`https://media.api-sports.io/football/players/${t.player.id}.png`} alt="" width={48} height={48} className="object-cover" />
                 </div>
                 <div className="min-w-0">
                    <Link href={`/player/${toSlug(t.player.name)}`} className="text-base font-bold text-white hover:text-[var(--brand)] transition-colors block truncate">
                      {t.player.name}
                    </Link>
                    <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">
                      {transfer.type} · {transfer.date}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex-1 justify-center sm:justify-start">
                 <div className="flex flex-col items-center gap-1 flex-1 text-center">
                   {transfer.teams.out?.logo && <Image src={transfer.teams.out.logo} alt="" width={20} height={20} />}
                   <span className="text-[10px] font-bold text-[var(--text-muted)] truncate w-full">{transfer.teams.out?.name || 'Unknown'}</span>
                 </div>
                 <div className="px-2 py-1 rounded-full bg-[var(--brand)]/10">
                   <ArrowRight className="w-4 h-4 text-[var(--brand)]" />
                 </div>
                 <div className="flex flex-col items-center gap-1 flex-1 text-center">
                   {transfer.teams.in?.logo && <Image src={transfer.teams.in.logo} alt="" width={20} height={20} />}
                   <span className="text-[10px] font-bold text-white truncate w-full">{transfer.teams.in?.name || 'Unknown'}</span>
                 </div>
              </div>

              <Link href={`/player/${toSlug(t.player.name)}`} className="hidden sm:flex w-10 h-10 rounded-full border border-white/10 items-center justify-center group-hover:bg-[var(--brand)] group-hover:border-[var(--brand)] transition-all">
                <ArrowUpRight className="w-4 h-4 text-white group-hover:text-black" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function TransfersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative p-8 sm:p-12 mb-12 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <RefreshCcw className="w-96 h-96 -mr-20 -mt-20 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-current" /> Market Insights
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-6 tracking-tight">
            The Global <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Transfer Center
            </span>
          </h1>
          
          <p className="text-[var(--text-muted)] max-w-xl text-lg leading-relaxed mb-8">
            The market never sleeps. Track the biggest moves, loan spells, and free agent signings from Europe's elite clubs.
          </p>

          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">15+</span>
                <span className="text-[10px] text-[var(--brand)] font-black uppercase tracking-widest">Recent Moves tracked</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">Daily</span>
                <span className="text-[10px] text-[var(--brand)] font-black uppercase tracking-widest">Update Frequency</span>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── FEED ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--brand)]" />
            Latest Confirmed Signings
          </h2>
          <Suspense fallback={<div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-24 skeleton" />)}</div>}>
            <GlobalTransferFeed />
          </Suspense>
        </div>

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <aside className="space-y-8">
           <div className="card bg-[var(--bg-elevated)] border-[var(--border)] p-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--brand)]" />
                Club Directory
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Want to see transfers for a specific team? Search for your club to view their full market history.
              </p>
              <Link href="/teams" className="button-primary w-full text-center">
                Browse Teams
              </Link>
           </div>

           <div className="card p-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--accent)]" />
                Market Trends
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-[var(--text-muted)]">Most Active League</span>
                    <span className="text-xs font-bold text-white">Premier League</span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-xs text-[var(--text-muted)]">Highest Spend</span>
                    <span className="text-xs font-bold text-white">Real Madrid</span>
                 </div>
                 <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-[var(--text-muted)]">Window Status</span>
                    <span className="text-xs font-bold text-[var(--success)]">Open</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
