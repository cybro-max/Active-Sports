'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { toSlug } from '@/lib/slug';
import { Search, ChevronRight, MapPin } from 'lucide-react';

interface LeagueRow {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  flag: string | null;
  code: string | null;
  season: number;
}

function getCountryFlag(league: LeagueRow): string {
  if (league.flag) return league.flag;
  const flagMap: Record<string, string> = {
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'World': '🌍',
    'Europe': '🌍',
  };
  return flagMap[league.country] || '🌍';
}

const PAGE_SIZE = 60;

export default function LeaguesGrid({ leagues }: { leagues: LeagueRow[] }) {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [page, setPage] = useState(1);

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of leagues) {
      counts.set(l.country, (counts.get(l.country) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);
  }, [leagues]);

  const filtered = useMemo(() => {
    return leagues.filter(l => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.country.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === 'all' || l.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [leagues, search, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  return (
    <div suppressHydrationWarning>
      {/* ── FILTERS ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 fade-up">
        <div className="relative flex-1 max-w-lg w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={`Search ${leagues.length} leagues...`}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)]/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          <button
            onClick={() => {
              setCountryFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              countryFilter === 'all'
                ? 'bg-[var(--brand)] text-black'
                : 'bg-white/5 text-[var(--text-muted)] hover:text-white border border-white/10'
            }`}
          >
            All ({leagues.length})
          </button>
          {countries.slice(0, 20).map(c => (
            <button
              key={c}
              onClick={() => {
                setCountryFilter(c);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                countryFilter === c
                  ? 'bg-[var(--brand)] text-black'
                  : 'bg-white/5 text-[var(--text-muted)] hover:text-white border border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── LEAGUE GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 fade-up">
        {paginated.map(league => (
          <Link
            key={league.id}
            href={`/league/${toSlug(league.name)}`}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.10] transition-all p-4 flex items-center gap-3 overflow-hidden"
          >
            <div className="relative w-14 h-14 rounded-xl bg-white/[0.07] flex items-center justify-center p-2.5 shrink-0">
              <Image
                src={league.logo}
                alt={league.name}
                width={40}
                height={40}
                className="transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-[10px] text-white group-hover:text-[var(--brand)] transition-colors truncate uppercase tracking-wider">
                {league.name}
              </h3>
              <p className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {league.country}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* ── PAGINATION ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10 fade-up">
        <p className="text-sm text-[var(--text-muted)]">
          Showing {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = startPage + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  p === page
                    ? 'bg-[var(--brand)] text-black'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--text-muted)]">No leagues match your search. Try a different filter.</p>
        </div>
      )}
    </div>
  );
}
