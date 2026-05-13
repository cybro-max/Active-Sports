import Image from 'next/image';
import Link from 'next/link';
import { toSlug } from '@/lib/slug';
import type { PlayerResponse } from '@/lib/apifootball';

type StatKey = 'goals' | 'assists' | 'yellow' | 'red';

interface PlayerStatsTableProps {
  players: PlayerResponse[];
  statKey: StatKey;
  label?: string;
  emptyMessage?: string;
}

const STAT_LABELS: Record<StatKey, { label: string; color: string }> = {
  goals: { label: 'G', color: 'var(--success)' },
  assists: { label: 'A', color: 'var(--accent)' },
  yellow: { label: 'YC', color: 'var(--warning)' },
  red: { label: 'RC', color: 'var(--danger)' },
};

export default function PlayerStatsTable({ players, statKey, label, emptyMessage }: PlayerStatsTableProps) {
  if (!players.length) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-6 text-center">
        {emptyMessage || `No ${statKey} data available.`}
      </p>
    );
  }

  const { label: shortLabel, color } = STAT_LABELS[statKey];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-elevated)] border-b border-[var(--border-strong)]">
            <th className="text-left py-3 px-4 font-bold w-8">#</th>
            <th className="text-left py-3 px-3 font-bold">Player</th>
            <th className="text-left py-3 px-3 font-bold hidden sm:table-cell">Team</th>
            <th className="text-center py-3 px-4 font-bold" style={{ color }}>{label || shortLabel}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const stat = p.statistics[0];
            const value =
              statKey === 'goals' ? stat?.goals?.total ?? 0
              : statKey === 'assists' ? stat?.goals?.assists ?? 0
              : statKey === 'yellow' ? stat?.cards?.yellow ?? 0
              : stat?.cards?.red ?? 0;

            return (
              <tr
                key={p.player.id}
                className="border-t border-[var(--border)] transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <td className="py-3 px-4">
                  <span className={`font-display font-bold ${i < 3 ? 'text-lg' : 'text-sm'}`}
                    style={{
                      color: i === 0 ? 'var(--warning)' : i < 3 ? color : 'var(--text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <Link
                    href={`/player/${toSlug(p.player.name)}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={p.player.photo}
                      alt={p.player.name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                    <span className="font-semibold text-white truncate max-w-[160px]">
                      {p.player.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-3 hidden sm:table-cell">
                  {stat?.team && (
                    <Link
                      href={`/team/${toSlug(stat.team.name)}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Image src={stat.team.logo} alt={stat.team.name} width={18} height={18} />
                      <span className="text-[var(--text-muted)] truncate max-w-[120px] text-xs">
                        {stat.team.name}
                      </span>
                    </Link>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="font-display font-black text-lg"
                    style={{ color }}
                  >
                    {value}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
