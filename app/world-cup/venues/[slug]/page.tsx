import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { WC_VENUES } from '@/lib/wc-venues';
import { Users, Activity, Leaf, MapPin, ArrowLeft, Info, Calendar, Globe } from 'lucide-react';
import { toSlug } from '@/lib/slug';
import { VENUE_SLUG_MAP, VENUE_ID_TO_SLUG } from '@/lib/slug-maps';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return WC_VENUES.map((v) => ({ slug: toSlug(v.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const param = (await params).slug;
  const venueId = VENUE_SLUG_MAP.get(param);
  const venue = venueId ? WC_VENUES.find((v) => v.id === venueId) : null;
  if (!venue) {
    // Fallback: try old ID format
    const oldVenue = WC_VENUES.find((v) => v.id === param);
    if (!oldVenue) return { title: 'Venue Not Found' };
    return {
      title: `${oldVenue.name} — FIFA World Cup 2026 Venue`,
      description: `${oldVenue.name} in ${oldVenue.city}, ${oldVenue.country}. Capacity ${oldVenue.capacity.toLocaleString()}. Hosting ${oldVenue.matchesHosted} World Cup 2026 matches.`,
      alternates: { canonical: `https://activesports.live/world-cup/venues/${toSlug(oldVenue.name)}` },
    };
  }
  return {
    title: `${venue.name} — FIFA World Cup 2026 Venue`,
    description: `${venue.name} in ${venue.city}, ${venue.country}. Capacity ${venue.capacity.toLocaleString()}. Hosting ${venue.matchesHosted} World Cup 2026 matches.`,
    alternates: { canonical: `https://activesports.live/world-cup/venues/${param}` },
  };
}

export default async function VenueDetailPage({ params }: Props) {
  const param = (await params).slug;

  // Backward compat: old venue ID format
  let venueId = VENUE_SLUG_MAP.get(param);
  if (!venueId) {
    const oldSlug = VENUE_ID_TO_SLUG.get(param);
    if (oldSlug) redirect(`/world-cup/venues/${oldSlug}`);
  }

  const venue = venueId ? WC_VENUES.find((v) => v.id === venueId) : null;
  if (!venue) notFound();

  const countryColor: Record<string, string> = {
    USA: 'var(--accent)',
    Canada: 'var(--danger)',
    Mexico: 'var(--success)',
  };

  const nearby = WC_VENUES.filter((v) => v.country === venue.country && v.id !== venue.id).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/world-cup/venues"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues
      </Link>

      <WorldCupNav />

      <div
        className="card p-0 mb-8 fade-up relative overflow-hidden"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="relative w-full h-64 sm:h-80">
          <Image
            src={
              venue.country === 'USA'
                ? '/media/imgi_41_FIFA_FWC26_Host-Country-thumbnail_USA_Option-1.jpg'
                : venue.country === 'Canada'
                ? '/media/imgi_28_FIFA_FWC26_Host-Country-thumbnail_Can_Option-1.jpg'
                : '/media/imgi_35_FIFA_FWC26_Host-Country-thumbnail_Mex_Option-3.jpg'
            }
            alt={venue.name}
            fill
            className="object-cover opacity-60 rounded-t-[15px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{
                  background: `${countryColor[venue.country]}20`,
                  color: countryColor[venue.country],
                  border: `1px solid ${countryColor[venue.country]}40`,
                }}
              >
                {venue.country}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
              >
                Official Venue
              </span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-black mb-2 text-white"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <MapPin className="w-4 h-4 text-[var(--brand)]" />
              <span className="text-sm font-medium">{venue.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 fade-up fade-up-delay-1">
        {[
          { icon: <Users className="w-6 h-6 mx-auto text-[var(--brand)]"/>, label: 'Capacity', value: venue.capacity.toLocaleString() },
          { icon: <Activity className="w-6 h-6 mx-auto text-[var(--warning)]"/>, label: 'WC Matches', value: `${venue.matchesHosted ?? '\u2014'}` },
          { icon: <Leaf className="w-6 h-6 mx-auto text-[var(--success)]"/>, label: 'Surface', value: venue.surface },
          { icon: <MapPin className="w-6 h-6 mx-auto text-[var(--danger)]"/>, label: 'City', value: venue.city.split(',')[0] },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-4 text-center"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div
              className="font-bold text-base mb-0.5"
              style={{ fontFamily: 'var(--font-inter), sans-serif', color: 'var(--text-body)' }}
            >
              {s.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-8">
          <section className="card p-8 fade-up fade-up-delay-2" style={{ background: 'var(--bg-surface)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--brand)]" /> Stadium Profile & History
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--text-muted)] space-y-4">
              <p>
                {venue.name} is not just a stadium; it is a monument to sporting excellence in {venue.city}. As one of the premier venues selected for the FIFA World Cup 2026, it represents the pinnacle of modern stadium design and fan experience.
              </p>
              <p>
                The stadium has a storied history, having hosted numerous high-profile sporting events and cultural spectacles. Its inclusion in the 2026 tournament highlights its strategic importance within the North American sports landscape. With a capacity of {venue.capacity.toLocaleString()} seats, it is perfectly equipped to handle the massive influx of international fans expected for the {venue.matchesHosted} matches it will host.
              </p>
              <p>
                Technologically, the venue is at the forefront of the industry. From high-speed connectivity for fans to advanced pitch management systems that ensure a perfect playing surface (currently {venue.surface}), every detail has been meticulously planned to meet FIFA&apos;s rigorous standards.
              </p>
            </div>
          </section>

          <section className="card p-8 fade-up fade-up-delay-3" style={{ background: 'var(--bg-surface)' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--success)]" /> About the Host City: {venue.city}
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--text-muted)] space-y-4">
              <p>
                {venue.city} is a vibrant metropolis that reflects the diverse culture and passion of {venue.country}. Known for its rich history, culinary excellence, and unwavering support for local sports teams, it is the ideal host for the beautiful game&apos;s greatest tournament.
              </p>
              <p>
                Fans traveling to {venue.city} will find a city that is fully prepared to welcome the world. Extensive public transport networks, a wide range of accommodation options, and world-class attractions ensure that the World Cup experience extends far beyond the stadium walls. Whether exploring local landmarks or gathering at official FIFA Fan Festivals, visitors will be immersed in an atmosphere of celebration and unity.
              </p>
            </div>
          </section>

          {/* Massive SEO Content Block */}
          <article className="prose prose-invert max-w-none fade-up text-[var(--text-muted)] space-y-8 border-t border-[var(--border)] pt-12">
            <h2 className="text-3xl font-black text-white">The Legacy of {venue.name} and the 2026 FIFA World Cup</h2>
            <p>
              The selection of {venue.name} as a host venue for the FIFA World Cup 2026 is a testament to its status as one of the world&apos;s premier sporting arenas. This stadium, located in the heart of {venue.city}, is poised to play a crucial role in what promises to be the most expansive and inclusive World Cup in history. With the tournament expanding to 48 teams, the demands on host venues have never been higher, and {venue.name} is more than ready to meet those challenges.
            </p>
            
            <h3 className="text-xl font-bold text-white">Unparalleled Fan Experience</h3>
            <p>
              One of the defining characteristics of {venue.name} is its commitment to the fan experience. The stadium&apos;s architecture is designed to provide excellent sightlines from every seat, ensuring that every spectator feels part of the action. The integration of modern technology, such as massive high-definition video boards and seamless mobile connectivity, further enhances the viewing experience. For the 2026 World Cup, these features will be leveraged to provide fans with real-time stats, replays, and interactive content, setting a new standard for international football tournaments.
            </p>

            <h3 className="text-xl font-bold text-white">Sustainability and Innovation</h3>
            <p>
              In alignment with FIFA&apos;s sustainability goals, {venue.name} has implemented several green initiatives. These include energy-efficient lighting systems, comprehensive waste recycling programs, and water conservation measures. The stadium&apos;s management team has worked tirelessly to minimize the venue&apos;s environmental impact, making it a model for sustainable stadium operations. This commitment to the environment ensures that the legacy of the 2026 World Cup at {venue.name} will be one of responsibility and forward-thinking innovation.
            </p>

            <h3 className="text-xl font-bold text-white">Economic and Cultural Impact</h3>
            <p>
              Hosting the World Cup will have a profound impact on {venue.city}. The influx of international visitors is expected to provide a significant boost to the local economy, benefiting businesses in the hospitality, retail, and transport sectors. Beyond the economic benefits, the tournament will foster a sense of pride and unity within the community. The cultural exchange that occurs when fans from all over the world gather in one city is a unique aspect of the World Cup that leaves a lasting impression on hosts and visitors alike.
            </p>

            <h3 className="text-xl font-bold text-white">Matchday Atmosphere and Local Culture</h3>
            <p>
              The matchday experience at {venue.name} will be deeply influenced by the local flavor of {venue.city}. From the passionate pre-match gatherings in the city&apos;s historic districts to the vibrant energy within the stadium concourses, every moment will be a celebration of {venue.country}&apos;s unique contribution to football culture. Fans can expect a festival-like atmosphere, with local music, cuisine, and traditions playing a central role in the festivities. Whether it&apos;s the roar of the crowd after a goal or the shared anticipation of a penalty shootout, the memories made at {venue.name} during the 2026 World Cup will last a lifetime.
            </p>

            <p>
              As the world&apos;s gaze turns to {venue.country} in 2026, {venue.name} will stand as a symbol of the nation&apos;s passion for sport and its ability to host the world&apos;s most prestigious events. Every match played on its hallowed turf will be a chapter in a new era of football history, and we invite you to be part of that journey right here on ActiveSports.
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="card p-6 fade-up" style={{ background: 'var(--bg-surface)' }}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--warning)]" /> Tournament Role
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-[15px] bg-[var(--bg-subtle)] border border-[var(--border)]">
                <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">Matches Hosted</p>
                <p className="text-2xl font-black text-[var(--brand)]">{venue.matchesHosted}</p>
              </div>
              <div className="p-4 rounded-[15px] bg-[var(--bg-subtle)] border border-[var(--border)]">
                <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">Key Matchups</p>
                <p className="text-sm">Group Stage, Round of 32, and more to be announced.</p>
              </div>
            </div>
          </div>

          {nearby.length > 0 && (
            <section className="fade-up">
              <h2 className="font-bold mb-4 px-2">Other {venue.country} Venues</h2>
              <div className="space-y-3">
                {nearby.map((v) => (
                  <Link key={v.id} href={`/world-cup/venues/${toSlug(v.name)}`} className="card p-4 group block hover:border-[var(--brand)] transition-colors">
                    <h3 className="font-semibold text-sm group-hover:text-[var(--brand)] transition-colors">
                      {v.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {v.city}
                      </p>
                      <p className="text-xs font-bold" style={{ color: 'var(--brand)' }}>
                        {v.capacity.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
