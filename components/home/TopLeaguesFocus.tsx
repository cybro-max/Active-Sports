
import NextLink from 'next/link';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function TopLeaguesFocus() {
  // Focus on Premier League (39), Champions League (2), World Cup (1)
  const focusedIds = [39, 2, 1];
  const focusedLeagues = MAJOR_LEAGUES.filter(l => focusedIds.includes(l.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {focusedLeagues.map((league) => (
        <NextLink
          key={league.id}
          href={league.id === 1 ? '/world-cup' : `/league/${toSlug(league.name)}`}
          className="card group relative overflow-hidden p-8 border border-[var(--border)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] hover:border-[var(--brand)] transition-all rounded-[24px]"
        >
          {/* Background Logo Watermark */}
          <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Image src={league.logo} alt="" width={180} height={180} />
          </div>

          <div className="relative z-10">
            <Image src={league.logo} alt={league.name} width={48} height={48} className="mb-4" />
            <h3 className="text-lg font-black text-white mb-1 group-hover:text-[var(--brand)] transition-colors uppercase tracking-tight">{league.name}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6 font-medium uppercase tracking-widest">{league.country}</p>
            
            <div className="flex items-center gap-4 text-[10px] font-bold">
               <span className="px-2 py-1 rounded bg-black/50 border border-[var(--border)] text-white">LIVE HUB</span>
               <span className="px-2 py-1 rounded bg-black/50 border border-[var(--border)] text-[var(--brand)] font-black">OFFICIAL STATS</span>
            </div>
          </div>
          
          <div className="absolute top-8 right-8 p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </NextLink>
      ))}
    </div>
  );
}
