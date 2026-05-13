/**
 * OddsTable — reusable component for displaying 1X2 odds across bookmakers.
 * Extracted from match/[id]/page.tsx for reuse in /odds hub.
 */

interface OddsValue {
  value: string;
  odd: string;
}

interface Bet {
  id: number;
  name: string;
  values: OddsValue[];
}

interface Bookmaker {
  id: number;
  name: string;
  bets: Bet[];
}

interface OddsTableProps {
  bookmakers: Bookmaker[];
  compact?: boolean;
}

const BET_1X2_ID = 1; // Match Winner bet ID in API-Football

function getOddsColor(odd: string): string {
  const n = parseFloat(odd);
  if (n <= 1.5) return 'var(--brand)';
  if (n <= 2.5) return 'var(--warning)';
  return 'var(--danger)';
}

export default function OddsTable({ bookmakers, compact = false }: OddsTableProps) {
  if (!bookmakers || bookmakers.length === 0) {
    return (
      <div
        className="text-center py-6"
        style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Odds not available for this match
        </p>
      </div>
    );
  }

  // Pick up to 4 bookmakers, extract 1X2 bet
  const selected = bookmakers.slice(0, compact ? 2 : 4);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-strong)]">
          <tr className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider">
            <th className="text-left py-3 px-4 font-bold">Bookmaker</th>
            <th className="text-center py-3 px-3 font-bold">Home</th>
            <th className="text-center py-3 px-3 font-bold">Draw</th>
            <th className="text-center py-3 px-3 font-bold">Away</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((bm) => {
            const bet1x2 = bm.bets.find((b) => b.id === BET_1X2_ID);
            if (!bet1x2) return null;
            const home = bet1x2.values.find((v) => v.value === 'Home');
            const draw = bet1x2.values.find((v) => v.value === 'Draw');
            const away = bet1x2.values.find((v) => v.value === 'Away');
            return (
              <tr
                key={bm.id}
                className="border-t transition-colors hover:bg-[var(--bg-subtle)]"
                style={{ borderColor: 'var(--border)' }}
              >
                <td className="py-3 px-4 font-bold text-white text-xs tracking-tight" style={{ maxWidth: 120 }}>
                  <span className="truncate block">{bm.name}</span>
                </td>
                {[home, draw, away].map((v, i) => (
                  <td key={i} className="py-3 px-3 text-center">
                    {v ? (
                      <span
                        className="font-display font-bold text-sm bg-[var(--bg-elevated)] px-2.5 py-1 rounded"
                        style={{
                          color: getOddsColor(v.odd),
                          boxShadow: parseFloat(v.odd) <= 1.5 ? 'inset 0 0 0 1px rgba(0,230,118,0.2)' : 'none'
                        }}
                      >
                        {v.odd}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
