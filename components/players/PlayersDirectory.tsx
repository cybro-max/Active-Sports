'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, Globe, Trophy, Calendar, Star, Activity } from 'lucide-react';
import { toSlug } from '@/lib/slug';

interface Player {
  id: number;
  name: string;
  photo: string;
  team: { name: string; logo: string };
  leagueName: string;
  position: string;
  age: number;
  isElite?: boolean;
}

export default function PlayersDirectory({ initialPlayers }: { initialPlayers: Player[] }) {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All Positions');
  const [leagueFilter, setLeagueFilter] = useState('All Leagues');
  const [ageFilter, setAgeFilter] = useState('All Ages');
  const [sortOrder, setSortOrder] = useState<'name' | 'priority'>('priority');

  const leagues = useMemo(() => {
    const set = new Set(initialPlayers.map(p => p.leagueName));
    return ['All Leagues', ...Array.from(set).sort()];
  }, [initialPlayers]);

  const ageGroups = ['All Ages', 'U21', '21-30', '30+'];

  const filtered = useMemo(() => {
    let list = initialPlayers.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.name.toLowerCase().includes(search.toLowerCase())
    );

    if (posFilter !== 'All Positions') {
      list = list.filter(p => p.position === posFilter);
    }

    if (leagueFilter !== 'All Leagues') {
      list = list.filter(p => p.leagueName === leagueFilter);
    }

    if (ageFilter === 'U21') {
      list = list.filter(p => p.age < 21);
    } else if (ageFilter === '21-30') {
      list = list.filter(p => p.age >= 21 && p.age <= 30);
    } else if (ageFilter === '30+') {
      list = list.filter(p => p.age > 30);
    }

    if (sortOrder === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Priority: Elite players first, then by position
      const posOrder: Record<string, number> = {
        'Attacker': 1,
        'Midfielder': 2,
        'Defender': 3,
        'Goalkeeper': 4
      };
      list.sort((a, b) => {
        if (a.isElite !== b.isElite) return a.isElite ? -1 : 1;
        return (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
      });
    }

    return list;
  }, [initialPlayers, search, posFilter, leagueFilter, ageFilter, sortOrder]);

  const positions = ['All Positions', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  const [displayLimit, setDisplayLimit] = useState(60);

  return (
    <div className="space-y-10">
      {/* ── ADVANCED FILTERING SYSTEM ──────────────────────────── */}
      <div className="flex flex-col gap-6 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Search: Compact width */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search player..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDisplayLimit(60); // Reset limit on search
              }}
            />
          </div>

          <div className="h-[1px] lg:h-8 w-full lg:w-[1px] bg-white/10" />

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            {/* Position */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--brand)]" />
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-8 text-xs font-bold text-white focus:outline-none focus:border-[var(--brand)] appearance-none transition-all cursor-pointer group-hover:bg-white/10"
                value={posFilter}
                onChange={(e) => {
                  setPosFilter(e.target.value);
                  setDisplayLimit(60);
                }}
              >
                {positions.map(pos => <option key={pos} value={pos} className="bg-[#0a0a0a]">{pos}</option>)}
              </select>
            </div>

            {/* League */}
            <div className="relative group">
              <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--accent)]" />
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-8 text-xs font-bold text-white focus:outline-none focus:border-[var(--brand)] appearance-none transition-all cursor-pointer group-hover:bg-white/10"
                value={leagueFilter}
                onChange={(e) => {
                  setLeagueFilter(e.target.value);
                  setDisplayLimit(60);
                }}
              >
                {leagues.map(l => <option key={l} value={l} className="bg-[#0a0a0a]">{l}</option>)}
              </select>
            </div>

            {/* Age */}
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-8 text-xs font-bold text-white focus:outline-none focus:border-[var(--brand)] appearance-none transition-all cursor-pointer group-hover:bg-white/10"
                value={ageFilter}
                onChange={(e) => {
                  setAgeFilter(e.target.value);
                  setDisplayLimit(60);
                }}
              >
                {ageGroups.map(age => <option key={age} value={age} className="bg-[#0a0a0a]">{age}</option>)}
              </select>
            </div>

            {/* Sorting */}
            <button
              onClick={() => {
                setSortOrder(prev => prev === 'name' ? 'priority' : 'name');
                setDisplayLimit(60);
              }}
              className="flex items-center justify-between bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'name' ? 'A-Z' : 'Elite Rank'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PLAYER GRID (PREVIOUS STYLE) ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filtered.slice(0, displayLimit).map((p: Player, i) => (
          <Link 
            key={p.id} 
            href={`/player/${toSlug(p.name)}`}
            className="group relative bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.07] hover:border-[var(--brand)]/30 transition-all p-5 text-center fade-up shadow-lg"
            style={{ animationDelay: `${(i % 12) * 50}ms` }}
          >
             {/* Circular Profile Avatar */}
             <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 bg-[var(--brand)] rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="w-full h-full rounded-full bg-white/5 border-2 border-white/10 overflow-hidden relative group-hover:border-[var(--brand)] transition-colors duration-500">
                   <img 
                    src={p.photo || '/media/placeholder-player.png'} 
                    alt={p.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700" 
                   />
                </div>
                {p.isElite && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--brand)] rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-xl">
                    <Star className="w-3 h-3 text-black fill-current" />
                  </div>
                )}
             </div>

             <h3 className="text-sm font-black text-white truncate mb-2 group-hover:text-[var(--brand)] transition-colors tracking-tight">
              {p.name}
             </h3>
             
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                   {p.team?.logo && <img src={p.team.logo} alt="" className="w-3 h-3 opacity-60" />}
                   <span className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[100px] uppercase tracking-widest">{p.team?.name}</span>
                </div>
                <span className="text-[9px] font-black text-[var(--brand)] uppercase tracking-tighter bg-[var(--brand)]/10 px-2.5 py-1 rounded-full border border-[var(--brand)]/20 shadow-sm">
                  {p.position}
                </span>
             </div>

             {/* Hover Detail */}
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{p.age} Y/O</div>
             </div>
          </Link>
        ))}
      </div>

      {filtered.length > displayLimit && (
        <div className="text-center py-16">
          <button 
            onClick={() => setDisplayLimit(prev => prev + 60)}
            className="group relative inline-flex items-center gap-3 px-12 py-4 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:border-[var(--brand)] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand)]/0 via-[var(--brand)]/10 to-[var(--brand)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Activity className="w-4 h-4 text-[var(--brand)] group-hover:rotate-180 transition-transform duration-500" />
            Discover More Athletes
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-24 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
          <Globe className="w-16 h-16 text-white/5 mx-auto mb-6" />
          <h3 className="text-xl font-black text-white mb-2">No results matching your intelligence query</h3>
          <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">Try refining your filters for position, league, or age group.</p>
        </div>
      )}
    </div>
  );
}
