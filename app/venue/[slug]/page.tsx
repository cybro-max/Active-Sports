import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getVenue, getTeam, MAJOR_LEAGUES, CURRENT_SEASON } from '@/lib/apifootball';
import { captureCatch } from '@/lib/utils';
import { MapPin, Users, Globe, Ruler } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 86400;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  const venueId = Number(param);
  if (!venueId) return { title: 'Venue', robots: { index: false } as const };
  const venues = await captureCatch(getVenue(venueId), []);
  const venue = venues[0];
  if (!venue) return { title: 'Venue', robots: { index: false } as const };
  return {
    title: `${venue.name} — Stadium Info`,
    description: `${venue.name} in ${venue.city}, ${venue.country}. Capacity: ${venue.capacity?.toLocaleString()}. Surface: ${venue.surface}.`,
    alternates: { canonical: `https://activesports.live/venue/${param}` },
  };
}

export default async function VenuePage({ params }: Props) {
  const param = (await params).slug;
  const venueId = Number(param);
  if (!venueId) notFound();

  const venues = await captureCatch(getVenue(venueId), []);
  const venue = venues[0];
  if (!venue) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
      <nav className="text-xs mb-6 flex items-center gap-2 text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--text-body)]">{venue.name}</span>
      </nav>

      {venue.image && (
        <div className="card overflow-hidden mb-8 fade-up p-0">
          <Image
            src={venue.image}
            alt={venue.name}
            width={900}
            height={400}
            className="w-full object-cover"
            style={{ height: 300 }}
          />
        </div>
      )}

      <div className="card mb-8 fade-up">
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">{venue.name}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: 'City', value: `${venue.city}, ${venue.country}` },
            { icon: Users, label: 'Capacity', value: venue.capacity?.toLocaleString() },
            { icon: Ruler, label: 'Surface', value: venue.surface || 'N/A' },
            { icon: Globe, label: 'Address', value: venue.address || 'N/A' },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] p-4 bg-[var(--bg-subtle)]">
              <s.icon className="w-4 h-4 text-[var(--brand)] mb-2" />
              <div className="text-lg font-bold text-[var(--primary)]">{s.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-8 text-center fade-up">
        <MapPin className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
        <h2 className="text-lg font-bold text-[var(--primary)] mb-2">Venue Information</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          {venue.name} is located in {venue.city}, {venue.country} with a seating capacity of {venue.capacity?.toLocaleString()}. 
          The playing surface is {venue.surface || 'standard turf'}.
        </p>
      </div>
    </div>
  );
}
