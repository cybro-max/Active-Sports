/**
 * OutrightOddsTable — shows outright winner odds for the World Cup 2026.
 *
 * Fetches from the `/odds` endpoint (outright market, bet name = "Winner").
 * Gracefully degrades when no data is available.
 */

import Image from 'next/image';
import { LineChart } from 'lucide-react';

interface OutrightEntry {
  teamName: string;
  teamLogo?: string;
  odd: string;
}

interface OutrightOddsTableProps {
  entries: OutrightEntry[];
}

export default function OutrightOddsTable({ entries }: OutrightOddsTableProps) {
  if (entries.length === 0) {
    return (
      <div
        className="card p-5 text-center"
        style={{ border: '1px dashed var(--border)' }}
      >
        <LineChart className="w-8 h-8 text-[var(--brand)] mx-auto mb-2" />
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Outright Odds
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Available closer to the tournament
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5 bg-[var(--bg-elevated)] border border-[var(--border)]">
      <h2 className="font-display font-bold mb-5 flex items-center gap-2 text-white">
        <span><LineChart className="w-5 h-5 text-[var(--brand)] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]"/></span>
        <span>Winner Odds</span>
      </h2>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const oddNum = parseFloat(entry.odd);
          const implied = oddNum > 0 ? Math.round((1 / oddNum) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3 group">
              <span
                className="w-6 text-sm font-display font-bold text-center shrink-0"
                style={{
                  color:
                    i === 0
                      ? 'var(--warning)'
                      : i < 3
                      ? 'var(--brand)'
                      : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </span>
              {entry.teamLogo && (
                <Image
                  src={entry.teamLogo}
                  alt={entry.teamName}
                  width={20}
                  height={20}
                  className="shrink-0"
                />
              )}
              <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text-body)' }}>
                {entry.teamName}
              </span>
              {/* Implied probability bar */}
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: 48,
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(implied, 100)}%`,
                      background:
                        i === 0
                          ? 'var(--warning)'
                          : i < 3
                          ? 'var(--brand)'
                          : 'var(--text-muted)',
                      boxShadow: i === 0 ? '0 0 8px rgba(255,179,0,0.5)' : i < 3 ? '0 0 8px rgba(0,230,118,0.3)' : 'none'
                    }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)', minWidth: 28 }}>
                  {implied}%
                </span>
              </div>
              <span
                className="font-display font-bold text-base shrink-0"
                style={{
                  color: i === 0 ? 'var(--warning)' : 'var(--text-muted)',
                }}
              >
                {entry.odd}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
        Decimal odds · Updates every 30s
      </p>
    </div>
  );
}
