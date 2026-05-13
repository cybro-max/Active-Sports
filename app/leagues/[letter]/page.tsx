import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLeagueIndex } from '@/lib/build-params';
import { toSlug } from '@/lib/slug';
import { Trophy, ChevronRight, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 86400; // 24h

interface Props {
  params: Promise<{ letter: string }>;
}

export async function generateStaticParams() {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return letters.map((letter) => ({ letter }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = (await params).letter.toLowerCase();
  return {
    title: `Leagues starting with ${letter.toUpperCase()} — Directory`,
    description: `Browse all football leagues and competitions starting with the letter ${letter.toUpperCase()}.`,
  };
}

export default async function LeagueDirectoryPage({ params }: Props) {
  const letter = (await params).letter.toLowerCase();
  if (!/^[a-z]$/.test(letter)) notFound();

  const index = await getLeagueIndex();
  const entries = index.get(letter) || [];

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 fade-up">
        <h1 className="text-4xl font-black mb-4 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[var(--brand)]" />
          Leagues: <span className="text-[var(--brand)]">{letter.toUpperCase()}</span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Browse our comprehensive directory of football leagues and competitions starting with the letter "{letter.toUpperCase()}". 
          Explore standings, fixtures, and detailed statistics for over 900+ global tournaments.
        </p>
      </div>

      {/* Alphabet Navigation */}
      <div className="flex flex-wrap gap-2 mb-12 fade-up fade-up-delay-1">
        {alphabet.map((l) => (
          <Link
            key={l}
            href={`/leagues/${l}`}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all border ${
              l === letter
                ? 'bg-[var(--brand)] text-black border-[var(--brand)] shadow-[0_0_15px_rgba(33,150,243,0.3)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--brand)] hover:text-white'
            }`}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="card p-16 text-center fade-up fade-up-delay-2">
          <Search className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold mb-2">No leagues found</h2>
          <p className="text-[var(--text-muted)]">
            We couldn't find any indexed leagues starting with "{letter.toUpperCase()}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up fade-up-delay-2">
          {entries.map((league) => (
            <Link
              key={league.id}
              href={`/league/${toSlug(league.name)}`}
              className="card p-5 flex items-center justify-between group hover:border-[var(--brand)] transition-all"
            >
              <span className="font-black text-[10px] text-white group-hover:text-[var(--brand)] transition-colors truncate uppercase tracking-wider">
                {league.name}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}

      {/* SEO Content */}
      <div className="mt-20 prose prose-invert max-w-none fade-up border-t border-[var(--border)] pt-12 text-[var(--text-muted)]">
        <h2 className="text-2xl font-bold text-white mb-6">Massive Global League Indexing</h2>
        <p>
          At ActiveSports, we pride ourselves on providing the most comprehensive coverage of football leagues around the world. 
          Our directory covers everything from the prestigious European top flights like the Premier League, La Liga, and Serie A, 
          to regional divisions and cup competitions in over 100 countries.
        </p>
        <p>
          Each league page provides a dedicated hub for fans, featuring real-time standings powered by our API-Football Pro integration, 
          upcoming fixtures, historical results, and top performer statistics. Whether you are tracking the race for the Champions League 
          or following a local promotion battle, our massive indexing ensures you never miss a beat.
        </p>
      </div>
    </div>
  );
}
