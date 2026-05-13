
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
// We'll add apifootball functions for searching: getTeamsSearch, getLeaguesSearch, getPlayersSearch
import { Search } from 'lucide-react';
import { getTeamsSearch, getLeaguesSearch, getPlayersSearch } from '@/lib/apifootball';
import { toSlug } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Search — ActiveSports',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  if (!q) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Search ActiveSports</h1>
        <form action="/search" method="GET" className="flex items-center max-w-md mx-auto relative">
          <input
            type="text"
            name="q"
            placeholder="Search teams, leagues, players..."
            className="w-full h-12 px-4 pr-12 rounded-xl border focus:outline-none focus:border-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            autoFocus
          />
          <button type="submit" className="absolute right-3 top-3" style={{ color: 'var(--text-muted)' }}>
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  const [teamsRes, leaguesRes, playersRes] = await Promise.allSettled([
    getTeamsSearch(q),
    getLeaguesSearch(q),
    getPlayersSearch(q),
  ]);

  const teams = teamsRes.status === 'fulfilled' ? teamsRes.value : [];
  const leagues = leaguesRes.status === 'fulfilled' ? leaguesRes.value : [];
  const players = playersRes.status === 'fulfilled' ? playersRes.value : [];

  const isEmpty = teams.length === 0 && leagues.length === 0 && players.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-up">
        <form action="/search" method="GET" className="flex items-center max-w-md relative mb-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search teams, leagues, players..."
            className="w-full h-12 px-4 pr-12 rounded-xl border focus:outline-none focus:border-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          />
          <button type="submit" className="absolute right-3 top-3" style={{ color: 'var(--text-muted)' }}>
            <Search className="w-4 h-4" />
          </button>
        </form>
        <h1 className="text-2xl font-bold">
          Search results for &ldquo;{q}&rdquo;
        </h1>
      </div>

      {isEmpty ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <p className="text-lg">No results found for &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-2">Try checking your spelling or use more general terms.</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Teams */}
          {teams.length > 0 && (
            <section className="fade-up">
              <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Teams</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {teams.slice(0, 10).map(({ team }) => (
                  <Link key={team.id} href={`/team/${toSlug(team.name)}`} className="card p-4 flex flex-col items-center text-center group hover:border-[var(--brand)]/30">
                    <Image src={team.logo} alt={team.name} width={48} height={48} className="mb-3 transition-transform group-hover:scale-110" />
                    <span className="font-semibold text-sm group-hover:text-[var(--brand)]">{team.name}</span>
                    <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{team.country}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Leagues */}
          {leagues.length > 0 && (
            <section className="fade-up">
              <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Leagues & Competitions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {leagues.slice(0, 6).map(({ league, country }) => (
                  <Link key={league.id} href={`/league/${toSlug(league.name)}`} className="card p-4 flex items-center gap-4 group hover:border-[var(--brand)]/30">
                    <Image src={league.logo} alt={league.name} width={40} height={40} className="transition-transform group-hover:scale-110" />
                    <div>
                      <span className="font-semibold text-sm block group-hover:text-[var(--brand)]">{league.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{country.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Players */}
          {players.length > 0 && (
            <section className="fade-up">
              <h2 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Players</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.slice(0, 9).map(({ player, statistics }) => (
                  <Link key={player.id} href={`/player/${toSlug(player.name)}`} className="card p-4 flex items-center gap-4 group hover:border-[var(--brand)]/30">
                    <Image src={player.photo} alt={player.name} width={48} height={48} className="rounded-full transition-transform group-hover:scale-110" />
                    <div className="min-w-0">
                      <span className="font-semibold text-sm block group-hover:text-[var(--brand)] truncate">{player.name}</span>
                      <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {statistics[0]?.team?.name || player.nationality}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
