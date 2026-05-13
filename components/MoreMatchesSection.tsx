'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Fixture } from '@/lib/apifootball';
import { formatMatchDate, formatMatchTime, getStatusLabel } from '@/lib/utils';
import { matchSlug } from '@/lib/slug';

interface MoreMatchesSectionProps {
  liveFixtures: Fixture[];
  todayFixtures: Fixture[];
  timezone?: string | undefined;
}

export default function MoreMatchesSection({ liveFixtures, todayFixtures, timezone }: MoreMatchesSectionProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  const combined = [...liveFixtures, ...todayFixtures.filter(f => !liveFixtures.some(l => l.fixture.id === f.fixture.id))];

  const filtered = combined.filter(f => {
    const s = f.fixture.status.short;
    if (statusFilter === 'live') return ['1H', '2H', 'HT', 'ET', 'P'].includes(s);
    if (statusFilter === 'finished') return ['FT', 'AET', 'PEN'].includes(s);
    if (statusFilter === 'scheduled') return s === 'NS' || s === 'TBD';
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'live', label: 'Live' },
    { key: 'finished', label: 'Finished' },
    { key: 'scheduled', label: 'Scheduled' },
  ];

  return (
    <section className="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-black font-display text-white">More <span className="text-[var(--brand)]">Matches</span></h2>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-0.5 self-start">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === t.key
                  ? 'bg-[var(--brand)] text-black shadow-lg'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {t.key === 'live' ? <span className="flex items-center gap-1.5"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" /></span>Live</span> : t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.slice(0, 12).map(f => {
          const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short);
          const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short);
          return (
            <Link
              key={f.fixture.id}
              href={`/match/${matchSlug(f.teams.home.name, f.teams.away.name)}`}
              className="card group relative overflow-hidden border border-[var(--border)] hover:border-[var(--brand)]/40 transition-all rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                {f.league.logo && <Image src={f.league.logo} alt={f.league.name} width={14} height={14} />}
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">{f.league.name}</span>
                <div className={`ml-auto px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border ${
                  isLive ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  isFinished ? 'bg-white/5 border-white/10 text-[var(--text-muted)]' :
                  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}>
                  {getStatusLabel(f.fixture.status.short, f.fixture.status.elapsed)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <Image src={f.teams.home.logo} alt={f.teams.home.name} width={28} height={28} />
                  <span className="text-[10px] font-bold text-center text-[var(--text-body)] truncate w-full">{f.teams.home.name}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
                  {isFinished || isLive ? (
                    <>
                      <span className="text-lg font-black font-display text-white">{f.goals.home ?? 0}–{f.goals.away ?? 0}</span>
                      {f.score.halftime.home !== null && (
                        <span className="text-[8px] text-[var(--text-muted)] font-bold">HT {f.score.halftime.home}–{f.score.halftime.away}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-white/60">{formatMatchTime(f.fixture.date, timezone)}</span>
                      <span className="text-[8px] text-[var(--text-muted)]">{formatMatchDate(f.fixture.date)}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <Image src={f.teams.away.logo} alt={f.teams.away.name} width={28} height={28} />
                  <span className="text-[10px] font-bold text-center text-[var(--text-body)] truncate w-full">{f.teams.away.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--text-muted)]">No matches found for the selected filter.</p>
        </div>
      )}
    </section>
  );
}
