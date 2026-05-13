import Image from 'next/image';
import Link from 'next/link';
import { Fixture } from '@/lib/apifootball';
import { formatMatchTime, getStatusLabel } from '@/lib/utils';
import { matchSlug } from '@/lib/slug';

interface MatchCardProps {
  fixture: Fixture;
  compact?: boolean;
  timezone?: string | undefined;
}

export default function MatchCard({ fixture, compact = false, timezone }: MatchCardProps) {
  const { fixture: f, teams, goals, league } = fixture;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.status.short);
  const isUpcoming = f.status.short === 'NS' || f.status.short === 'TBD';

  return (
    <Link
      href={`/match/${matchSlug(teams.home.name, teams.away.name)}`}
      className="card block group relative overflow-hidden bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] transition-all p-5 shadow-sm hover:shadow-[0_0_30px_rgba(0,230,118,0.15)] group"
    >
      {/* Dynamic Background */}
      {isLive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-dim)] to-transparent opacity-10 pointer-events-none" />
      )}
      
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {!compact && (
            <div className="bg-white/5 p-1 rounded-md border border-white/10">
              <Image src={league.logo} alt={league.name} width={14} height={14} className="opacity-90" />
            </div>
          )}
          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest truncate max-w-[140px]">
            {league.name}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border transition-colors ${
          isLive 
            ? 'bg-[var(--brand-dim)] border-[var(--brand-dim)] text-[var(--brand)]' 
            : 'bg-black/20 border-white/5 text-[var(--text-muted)]'
        }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />}
          {getStatusLabel(f.status.short, f.status.elapsed)}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-5 relative z-10">
        {/* Teams with integrated scores */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative group-hover:scale-110 transition-transform duration-300">
               <Image src={teams.home.logo} alt={teams.home.name} width={40} height={40} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight uppercase truncate w-full ${isFinished && teams.home.winner === false ? 'text-[var(--text-muted)]' : 'text-white'}`}>
              {teams.home.name}
            </span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center justify-center min-w-[60px]">
            {isUpcoming ? (
              <span className="text-sm font-black text-white/40 tracking-tighter">
                {formatMatchTime(f.date, timezone)}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-xl sm:text-2xl font-display font-black ${teams.home.winner ? 'text-[var(--brand)]' : 'text-white'}`}>
                  {goals.home ?? 0}
                </span>
                <span className="text-white/20 text-xs font-black">-</span>
                <span className={`text-xl sm:text-2xl font-display font-black ${teams.away.winner ? 'text-[var(--brand)]' : 'text-white'}`}>
                  {goals.away ?? 0}
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative group-hover:scale-110 transition-transform duration-300">
               <Image src={teams.away.logo} alt={teams.away.name} width={40} height={40} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight uppercase truncate w-full ${isFinished && teams.away.winner === false ? 'text-[var(--text-muted)]' : 'text-white'}`}>
              {teams.away.name}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      {!isUpcoming && (
        <div className="mt-5 pt-3 border-t border-white/5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9px] font-black text-[var(--brand)] uppercase tracking-[0.2em]">View Match Center →</span>
        </div>
      )}
    </Link>
  );
}