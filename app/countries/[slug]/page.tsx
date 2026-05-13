import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLeagues, getTeamsSearch, getCountries, CURRENT_SEASON } from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { toSlug } from '@/lib/slug';
import { Globe, Trophy, Users, MapPin, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 86400;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  const countryName = param.replace(/-/g, ' ');
  return {
    title: `${countryName} — Football Leagues & Teams`,
    description: `Browse football leagues, teams, and competitions from ${countryName}.`,
  };
}

export default async function CountryPage({ params }: Props) {
  const param = (await params).slug;
  const countryName = param.replace(/-/g, ' ');

  const leagueResults = await captureCatch(
    getLeagues({ country: countryName, current: true }),
    []
  );

  if (!leagueResults.length) notFound();

  const teamResults = await captureCatch(getTeamsSearch(countryName), []);
  const countryInfo = leagueResults[0]?.country;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <nav className="text-xs mb-6 flex items-center gap-2 text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/countries" className="hover:text-[var(--brand)] transition-colors">Countries</Link>
        <span>/</span>
        <span className="text-[var(--text-body)]">{countryName}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8 fade-up">
        {countryInfo?.flag && (
          <Image src={countryInfo.flag} alt={countryName} width={48} height={32} className="rounded object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary)]">{countryName}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {leagueResults.length} leagues · {teamResults.length} teams
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="fade-up">
          <h2 className="section-title flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--brand)]" />
            Leagues & Competitions
          </h2>
          <div className="space-y-2">
            {leagueResults.map(l => (
              <Link
                key={l.league.id}
                href={`/league/${toSlug(l.league.name)}`}
                className="card p-4 flex items-center gap-4 group hover:bg-[var(--bg-elevated)] transition-all"
              >
                <Image src={l.league.logo} alt={l.league.name} width={36} height={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-body)] group-hover:text-[var(--brand)] transition-colors truncate">
                    {l.league.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{l.league.type} · Season {l.seasons[0]?.year}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand)]" />
              </Link>
            ))}
          </div>
        </section>

        <section className="fade-up">
          <h2 className="section-title flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent)]" />
            Teams
          </h2>
          <div className="space-y-2">
            {teamResults.slice(0, 50).map(t => (
              <Link
                key={t.team.id}
                href={`/team/${toSlug(t.team.name)}`}
                className="card p-4 flex items-center gap-4 group hover:bg-[var(--bg-elevated)] transition-all"
              >
                <Image src={t.team.logo} alt={t.team.name} width={32} height={32} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-body)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {t.team.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t.venue?.city && <><MapPin className="w-3 h-3 inline mr-1" />{t.venue.city}</>}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
