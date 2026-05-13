import { getStandings, CURRENT_SEASON } from '@/lib/apifootball';
import { MAJOR_LEAGUES } from '@/config/leagues';
import { toSlug } from '@/lib/slug';
import Image from 'next/image';
import Link from 'next/link';
import { captureCatch } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const TOP_LEAGUE_IDS = [39, 140, 135, 78, 61];

const leagueMeta = MAJOR_LEAGUES.filter(l => TOP_LEAGUE_IDS.includes(l.id));

export default async function TopStandings() {
  const results = await Promise.allSettled(
    leagueMeta.map(l => getStandings(l.id, CURRENT_SEASON))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {leagueMeta.map((league, i) => {
        const data = results[i].status === 'fulfilled' ? results[i].value : [];
        const standings = data[0]?.league?.standings?.[0] ?? [];
        return (
          <Link
            key={league.id}
            href={`/league/${toSlug(league.name)}`}
            className="card group relative overflow-hidden border border-[var(--border)] hover:border-[var(--brand)]/40 transition-all rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                <Image src={league.logo} alt={league.name} width={20} height={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white truncate group-hover:text-[var(--brand)] transition-colors">{league.name}</h3>
                <span className="text-[10px] text-[var(--text-muted)] font-bold">{league.country}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
            </div>

            {standings.length > 0 ? (
              <div className="space-y-1">
                {standings.slice(0, 5).map((s, idx) => (
                  <div
                    key={s.team.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className={`w-5 text-center text-[10px] font-bold font-mono ${
                      s.rank <= 4 ? 'text-[var(--brand)]' :
                      s.rank >= standings.length - 2 ? 'text-red-400' :
                      'text-[var(--text-muted)]'
                    }`}>
                      {s.rank}
                    </span>
                    <Image src={s.team.logo} alt={s.team.name} width={16} height={16} className="shrink-0" />
                    <span className="text-[11px] text-[var(--text-body)] truncate flex-1">{s.team.name}</span>
                    <span className="text-[11px] font-bold font-display text-white tabular-nums">{s.points}</span>
                  </div>
                ))}
                {standings.length > 5 && (
                  <div className="text-[10px] text-center text-[var(--text-muted)] font-bold pt-1 opacity-0 group-hover:opacity-100 transition-all">
                    View full table →
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <span className="text-[11px] text-[var(--text-muted)]">Standings not available</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
