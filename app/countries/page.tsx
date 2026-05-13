import Link from 'next/link';
import Image from 'next/image';
import { getCountries } from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
import { Globe, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Countries — Browse Football Leagues by Country',
  description: 'Browse all available football leagues and competitions by country. Find live scores, standings, and fixtures from every region.',
};

export default async function CountriesPage() {
  const countries = await captureCatch(getCountries(), []);

  const grouped = countries.reduce<Record<string, typeof countries>>((acc, c) => {
    const first = c.name.charAt(0).toUpperCase();
    if (!acc[first]) acc[first] = [];
    acc[first].push(c);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <div className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-8 h-8 text-[var(--brand)]" />
          <h1 className="text-3xl font-bold text-[var(--primary)]">Countries</h1>
        </div>
        <p className="text-[var(--text-muted)]">
          Browse football leagues and competitions by country.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map(l => (
          <a key={l} href={`#letter-${l}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-dim)] transition-all"
          >
            {l}
          </a>
        ))}
      </div>

      {letters.map(letter => (
        <section key={letter} id={`letter-${letter}`} className="mb-8 fade-up">
          <h2 className="text-lg font-bold text-[var(--brand)] mb-4 border-b border-[var(--border)] pb-2">{letter}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {grouped[letter].map(c => (
              <Link
                key={c.name}
                href={`/countries/${toSlug(c.name)}`}
                className="card p-4 flex items-center gap-4 group hover:bg-[var(--bg-elevated)] transition-all"
              >
                {c.flag && (
                  <Image src={c.flag} alt={c.name} width={24} height={16} className="rounded object-cover" />
                )}
                <span className="font-semibold text-[var(--text-body)] group-hover:text-[var(--brand)] transition-colors flex-1">
                  {c.name}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
