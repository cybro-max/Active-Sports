'use client';

import Link from 'next/link';
import { Fixture } from '@/lib/apifootball';
import { formatMatchTime, getStatusLabel } from '@/lib/utils';
import { matchSlug } from '@/lib/slug';
import { ChevronRight, Zap } from 'lucide-react';

interface LiveMatchRowProps {
  fixture: Fixture;
  timezone?: string;
}

export default function LiveMatchRow({ fixture: f, timezone }: LiveMatchRowProps) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short);
  const isNS = f.fixture.status.short === 'NS';
  const slug = matchSlug(f.teams.home.name, f.teams.away.name);

  return (
    <Link 
      href={`/match/${slug}`}
      className="group relative flex items-center gap-4 p-3 sm:p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--brand)]/30 transition-all rounded-xl"
    >
      {/* Time / Status */}
      <div className="w-16 sm:w-20 flex flex-col items-center justify-center shrink-0">
        <span className={`text-[11px] font-black font-mono tracking-tight ${
          isLive ? 'text-red-400' : isNS ? 'text-white/60' : 'text-[var(--text-muted)]'
        }`}>
          {isLive ? `${f.fixture.status.elapsed}'` : isFinished ? 'FT' : formatMatchTime(f.fixture.date, timezone)}
        </span>
        {isLive && (
          <span className="flex h-1 w-1 mt-1">
            <span className="animate-ping absolute inline-flex h-1 w-1 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500" />
          </span>
        )}
      </div>

      {/* Teams Container */}
      <div className="flex-1 flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
          <span className={`text-xs sm:text-sm font-bold truncate text-right ${
            isFinished && f.teams.home.winner === false ? 'text-[var(--text-muted)]' : 'text-white'
          }`}>
            {f.teams.home.name}
          </span>
          <img src={f.teams.home.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" />
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
          {isNS ? (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">VS</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-black tabular-nums ${
                f.teams.home.winner ? 'text-[var(--brand)]' : 'text-white'
              }`}>{f.goals.home ?? 0}</span>
              <span className="text-white/10 text-xs font-black">–</span>
              <span className={`text-lg sm:text-xl font-black tabular-nums ${
                f.teams.away.winner ? 'text-[var(--brand)]' : 'text-white'
              }`}>{f.goals.away ?? 0}</span>
            </div>
          )}
          {f.fixture.status.short === 'HT' && (
             <span className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-0.5">Half Time</span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
          <img src={f.teams.away.logo} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain shrink-0" />
          <span className={`text-xs sm:text-sm font-bold truncate text-left ${
            isFinished && f.teams.away.winner === false ? 'text-[var(--text-muted)]' : 'text-white'
          }`}>
            {f.teams.away.name}
          </span>
        </div>
      </div>

      {/* Action/Chevron */}
      <div className="hidden sm:flex items-center justify-end w-10 shrink-0">
        <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all" />
      </div>

      {/* Progress Bar (Live only) */}
      {isLive && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-red-500/20 w-full overflow-hidden rounded-b-xl">
           <div 
             className="h-full bg-red-500" 
             style={{ width: `${Math.min(((f.fixture.status.elapsed || 0) / 90) * 100, 100)}%` }} 
           />
        </div>
      )}
    </Link>
  );
}
