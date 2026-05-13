import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamIndex } from '@/lib/build-params';
import { toSlug } from '@/lib/slug';
import type { Metadata } from 'next';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

interface Props {
  params: Promise<{ letter: string }>;
}

export async function generateStaticParams() {
  return LETTERS.map((letter) => ({ letter }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter } = await params;
  return {
    title: `Teams — ${letter.toUpperCase()} | ActiveSports`,
    description: `Browse football teams starting with ${letter.toUpperCase()}. View squad, fixtures, stats and more.`,
    alternates: { canonical: `https://activesports.live/teams/${letter}` },
  };
}

export default async function TeamsByLetterPage({ params }: Props) {
  const { letter } = await params;
  if (!LETTERS.includes(letter)) notFound();

  const index = await getTeamIndex();
  const entries = index.get(letter) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 fade-up">
        <h1 className="text-3xl font-bold mb-1 text-[var(--primary)]">
          <span className="text-[var(--brand)]">Teams</span> A–Z
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {entries.length} team{entries.length !== 1 ? 's' : ''} starting with &ldquo;{letter.toUpperCase()}&rdquo;
        </p>
      </div>

      {/* Alphabet nav */}
      <nav className="flex flex-wrap gap-1 mb-8 fade-up">
        {LETTERS.map((l) => (
          <Link
            key={l}
            href={`/teams/${l}`}
            className={`w-8 h-8 flex items-center justify-center rounded-[6px] text-xs font-semibold transition-all ${
              l === letter
                ? 'bg-[var(--brand)] text-white'
                : index.has(l) && index.get(l)!.length > 0
                  ? 'text-[var(--text-body)] hover:bg-[var(--bg-subtle)]'
                  : 'text-[var(--text-placeholder)] pointer-events-none'
            }`}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </nav>

      {/* Team grid */}
      {entries.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)]">No teams found starting with &ldquo;{letter.toUpperCase()}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {entries.map((t) => (
            <Link
              key={t.id}
              href={`/team/${toSlug(t.name)}`}
              className={`card p-4 flex items-center gap-3 group fade-up`}
            >
              <Image
                src={`https://media.api-sports.io/football/teams/${t.id}.png`}
                alt={t.name}
                width={36}
                height={36}
                className="shrink-0 transition-transform group-hover:scale-110"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-body)] truncate group-hover:text-[var(--brand)] transition-colors">
                  {t.name}
                </p>
              </div>
              <svg className="w-4 h-4 shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
