import Image from 'next/image';
import Link from 'next/link';
import { getFormColor } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
export { getFormColor };

interface StandingsTableProps {
  standings: import('@/lib/apifootball').Standing[];
  leagueId: number;
}

export default function StandingsTable({ standings, leagueId }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-elevated)] border-b border-[var(--border-strong)]">
            <th className="text-left py-3 px-4 font-bold w-10">#</th>
            <th className="text-left py-3 px-3 font-bold">Team</th>
            <th className="text-center py-3 px-2 font-bold">P</th>
            <th className="text-center py-3 px-2 font-bold">W</th>
            <th className="text-center py-3 px-2 font-bold">D</th>
            <th className="text-center py-3 px-2 font-bold">L</th>
            <th className="text-center py-3 px-2 font-bold">GD</th>
            <th className="text-center py-3 px-3 font-bold">Pts</th>
            <th className="text-right py-3 px-4 font-bold hidden md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr
              key={s.team.id}
              className="border-t border-[var(--border)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              {/* Rank + zone color bar */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-[3px] h-5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                    style={{
                      background:
                        s.rank <= 4 ? 'var(--brand)' :
                        s.rank <= 6 ? 'var(--warning)' :
                        s.rank >= standings.length - 2 ? 'var(--danger)' :
                        'var(--bg-elevated)',
                      boxShadow: s.rank <= 4 ? '0 0 8px rgba(0,230,118,0.4)' : s.rank >= standings.length - 2 ? '0 0 8px rgba(255,61,87,0.4)' : 'none'
                    }}
                  />
                  <span className="text-[var(--text-muted)] font-display font-bold w-4">{s.rank}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <Link
                  href={`/team/${toSlug(s.team.name)}?league=${leagueId}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Image src={s.team.logo} alt={s.team.name} width={24} height={24} className="drop-shadow-md" />
                  <span className="font-bold text-white truncate" style={{ maxWidth: 140 }}>{s.team.name}</span>
                </Link>
              </td>
              <td className="py-3 px-2 text-center text-[var(--text-muted)] font-display font-semibold">{s.all.played}</td>
              <td className="py-3 px-2 text-center text-[var(--success)] font-display font-semibold">{s.all.win}</td>
              <td className="py-3 px-2 text-center text-[var(--warning)] font-display font-semibold">{s.all.draw}</td>
              <td className="py-3 px-2 text-center text-[var(--danger)] font-display font-semibold">{s.all.lose}</td>
              <td
                className="py-3 px-2 text-center font-display font-semibold"
                style={{ color: s.goalsDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}
              >
                {s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}
              </td>
              <td className="py-3 px-3 text-center font-display font-bold text-[var(--primary)] text-base">{s.points}</td>
              <td className="py-3 px-4 text-right hidden md:table-cell">
                <div className="flex gap-1.5 justify-end">
                  {s.form?.slice(-5).split('').map((r, idx) => (
                    <span
                      key={idx}
                      className="flex items-center justify-center rounded-sm font-display font-bold text-[10px] text-[var(--bg-base)] shadow-sm"
                      style={{
                        background:
                          r === 'W' ? 'var(--success)' :
                          r === 'L' ? 'var(--danger)' :
                          'var(--warning)',
                        width: 20,
                        height: 20,
                        boxShadow: r === 'W' ? '0 0 8px rgba(0,230,118,0.3)' : 'none'
                      }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}