/**
 * KnockoutBracket — renders the FIFA World Cup 2026 knockout stage.
 *
 * When the tournament is in the knockout phase, it parses fixture `round`
 * names to build a horizontal bracket from Round of 32 → Final.
 *
 * Before the tournament starts (or when no knockout data exists),
 * it renders a beautiful placeholder bracket so the page is always engaging.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { toSlug, matchSlug } from '@/lib/slug';
import type { Fixture } from '@/lib/apifootball';

// ─── Round ordering ───────────────────────────────────────────────────────────
const ROUND_ORDER = [
  'Round of 32',
  'Round of 16',
  'Quarter-finals',
  'Semi-finals',
  'Final',
];

const ROUND_LABELS: Record<string, string> = {
  'Round of 32': 'R32',
  'Round of 16': 'R16',
  'Quarter-finals': 'QF',
  'Semi-finals': 'SF',
  'Final': 'Final',
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BracketMatch {
  fixtureId?: number;
  date?: string;
  home?: { id: number; name: string; logo: string; score: number | null; winner: boolean | null };
  away?: { id: number; name: string; logo: string; score: number | null; winner: boolean | null };
}

interface BracketRound {
  name: string;
  label: string;
  matches: BracketMatch[];
}

// ─── Placeholder data ─────────────────────────────────────────────────────────
const PLACEHOLDER_ROUNDS: BracketRound[] = [
  {
    name: 'Round of 32',
    label: 'R32',
    matches: Array.from({ length: 16 }, () => ({ fixtureId: undefined, home: undefined, away: undefined })),
  },
  {
    name: 'Round of 16',
    label: 'R16',
    matches: Array.from({ length: 8 }, () => ({})),
  },
  {
    name: 'Quarter-finals',
    label: 'QF',
    matches: Array.from({ length: 4 }, () => ({})),
  },
  {
    name: 'Semi-finals',
    label: 'SF',
    matches: Array.from({ length: 2 }, () => ({})),
  },
  {
    name: 'Final',
    label: 'Final',
    matches: [{}],
  },
];

// ─── Parse fixtures into bracket rounds ──────────────────────────────────────
function parseBracket(fixtures: Fixture[]): BracketRound[] {
  const knockoutFixtures = fixtures.filter((f) =>
    ROUND_ORDER.some((r) => f.league.round?.includes(r))
  );

  if (knockoutFixtures.length === 0) return PLACEHOLDER_ROUNDS;

  const roundMap: Record<string, BracketMatch[]> = {};

  for (const f of knockoutFixtures) {
    const roundKey = ROUND_ORDER.find((r) => f.league.round?.includes(r));
    if (!roundKey) continue;
    if (!roundMap[roundKey]) roundMap[roundKey] = [];

    roundMap[roundKey].push({
      fixtureId: f.fixture.id,
      date: f.fixture.date,
      home: {
        id: f.teams.home.id,
        name: f.teams.home.name,
        logo: f.teams.home.logo,
        score: f.goals.home,
        winner: f.teams.home.winner,
      },
      away: {
        id: f.teams.away.id,
        name: f.teams.away.name,
        logo: f.teams.away.logo,
        score: f.goals.away,
        winner: f.teams.away.winner,
      },
    });
  }

  return ROUND_ORDER.filter((r) => roundMap[r] || r === 'Final').map((r) => ({
    name: r,
    label: ROUND_LABELS[r],
    matches: roundMap[r] ?? [{}],
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TeamSlot({
  team,
  isWinner,
  isPlaceholder,
}: {
  team?: BracketMatch['home'];
  isWinner?: boolean | null;
  isPlaceholder?: boolean;
}) {
  const content = (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
      style={{
        background: isWinner
          ? 'rgba(34,197,94,0.12)'
          : isPlaceholder
          ? 'var(--bg-subtle)'
          : 'var(--bg-subtle)',
        border: isWinner
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid var(--border)',
        minWidth: 0,
      }}
    >
      {team?.logo ? (
        <Image
          src={team.logo}
          alt={team.name}
          width={20}
          height={20}
          className="shrink-0"
        />
      ) : (
        <div
          className="w-5 h-5 rounded-full shrink-0"
          style={{ background: 'var(--bg-surface)' }}
        />
      )}
      <span
        className="text-xs font-medium truncate flex-1"
        style={{
          color: isPlaceholder ? 'var(--text-muted)' : 'var(--text-body)',
          maxWidth: 90,
        }}
      >
        {team?.name ?? 'TBD'}
      </span>
      {team?.score !== null && team?.score !== undefined && (
        <span
          className="text-xs font-bold shrink-0 ml-1"
          style={{
            color: isWinner ? 'var(--success)' : 'var(--text-muted)',
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          {team.score}
        </span>
      )}
    </div>
  );

  if (team && !isPlaceholder) {
    return (
      <Link href={`/world-cup/team/${toSlug(team.name)}`} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}

function MatchSlot({ match, isPlaceholder }: { match: BracketMatch; isPlaceholder: boolean }) {
  const inner = (
    <div className="space-y-1">
      <TeamSlot team={match.home} isWinner={match.home?.winner ?? null} isPlaceholder={isPlaceholder || !match.home} />
      <TeamSlot team={match.away} isWinner={match.away?.winner ?? null} isPlaceholder={isPlaceholder || !match.away} />
    </div>
  );

  if (match.fixtureId && !isPlaceholder) {
    return (
      <Link href={`/match/${match.fixtureId ? (match.home && match.away ? matchSlug(match.home.name, match.away.name) : match.fixtureId) : '#'}`} className="block rounded-xl transition-all hover:scale-[1.02]" style={{ outline: 'none' }}>
        {inner}
      </Link>
    );
  }
  return <div className="rounded-xl">{inner}</div>;
}

// ─── Main component ───────────────────────────────────────────────────────────
interface KnockoutBracketProps {
  fixtures: Fixture[];
}

export default function KnockoutBracket({ fixtures }: KnockoutBracketProps) {
  const rounds = parseBracket(fixtures);
  const isPlaceholder = fixtures.length === 0;

  return (
    <section className="fade-up">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-5 h-5 text-[var(--warning)]" />
        <h2 className="text-lg font-bold">Knockout Bracket</h2>
        {isPlaceholder && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            Available when knockout stage begins
          </span>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {rounds.map((round, rIdx) => (
            <div key={round.name} className="flex flex-col" style={{ width: 180 }}>
              {/* Round header */}
              <div
                className="text-center text-xs font-bold px-3 py-2 rounded-lg mb-3 shrink-0"
                style={{
                  background:
                    round.name === 'Final'
                      ? 'rgba(245,158,11,0.2)'
                      : 'var(--bg-subtle)',
                  color: round.name === 'Final' ? 'var(--warning)' : 'var(--text-muted)',
                  border: round.name === 'Final' ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                }}
              >
                {round.label}
                <div className="text-[10px] opacity-60 font-normal mt-0.5">{round.matches.length} match{round.matches.length !== 1 ? 'es' : ''}</div>
              </div>

              {/* Matches in this round, vertically distributed */}
              <div
                className="flex flex-col flex-1"
                style={{
                  gap: rIdx === 0 ? 8 : `${Math.pow(2, rIdx) * 8}px`,
                  justifyContent: 'space-around',
                }}
              >
                {round.matches.map((match, mIdx) => (
                  <div
                    key={mIdx}
                    className="card p-2 relative"
                    style={{
                      opacity: isPlaceholder ? 0.5 : 1,
                    }}
                  >
                    <MatchSlot match={match} isPlaceholder={isPlaceholder} />
                    {match.date && !isPlaceholder && (
                      <div
                        className="text-center text-[10px] mt-1.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {new Date(match.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPlaceholder && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          The knockout bracket will auto-populate once the group stage concludes (Jul 1, 2026).
        </p>
      )}
    </section>
  );
}
