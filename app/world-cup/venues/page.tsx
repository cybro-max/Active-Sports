import Link from 'next/link';
import Image from 'next/image';
import { WC_VENUES } from '@/lib/wc-venues';
import { MapPin, Map, ArrowLeft } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';
import { toSlug } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 — Venues',
  description:
    'All 16 official FIFA World Cup 2026 stadiums across the USA, Canada, and Mexico — capacity, city, surface, and match count.',
};

const COUNTRY_COLORS: Record<string, string> = {
  USA: 'rgba(59,130,246,0.15)',
  Canada: 'rgba(239,68,68,0.15)',
  Mexico: 'rgba(34,197,94,0.15)',
};
const COUNTRY_TEXT: Record<string, string> = {
  USA: 'var(--accent)',
  Canada: 'var(--danger)',
  Mexico: 'var(--success)',
};

export default function WorldCupVenuesPage() {
  const byCountry: Record<string, typeof WC_VENUES> = {};
  for (const v of WC_VENUES) {
    if (!byCountry[v.country]) byCountry[v.country] = [];
    byCountry[v.country].push(v);
  }

  const countryOrder = ['USA', 'Canada', 'Mexico'] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/world-cup"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to World Cup Hub
      </Link>

      {/* Hero */}
      <div
        className="card p-8 sm:p-10 mb-10 text-center fade-up relative overflow-hidden"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <MapPin className="w-12 h-12 text-[var(--brand)] mx-auto mb-4" />
        <h1 className="text-3xl sm:text-5xl font-black mb-2" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
          World Cup 2026 Venues
        </h1>
        <p className="text-lg mb-6" style={{ color: 'var(--text-muted)' }}>
          16 Stadiums · 3 Host Countries · 104 Matches
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {countryOrder.map((c) => (
            <div key={c} className="text-center">
              <div className="text-2xl">{byCountry[c]?.[0]?.flag}</div>
              <div className="text-sm font-semibold mt-1">{c}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {byCountry[c]?.length} stadiums
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorldCupNav />

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 fade-up fade-up-delay-1">
        {[
          { label: 'Total Stadiums', value: WC_VENUES.length },
          {
            label: 'Largest Capacity',
            value: Math.max(...WC_VENUES.map((v) => v.capacity)).toLocaleString(),
          },
          {
            label: 'Total Capacity',
            value: WC_VENUES.reduce((s, v) => s + v.capacity, 0).toLocaleString(),
          },
          { label: 'Host Nations', value: 3 },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-4 text-center"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div
              className="text-2xl font-black mb-1"
              style={{ fontFamily: 'var(--font-inter), sans-serif', color: 'var(--accent)' }}
            >
              {s.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Venues by country */}
      {countryOrder.map((country) => {
        const venues = byCountry[country] ?? [];
        return (
          <section key={country} className="mb-10 fade-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-24 h-16 shrink-0 overflow-hidden rounded-[15px] border border-[var(--border)]">
                <Image
                  src={
                    country === 'USA'
                      ? '/media/imgi_41_FIFA_FWC26_Host-Country-thumbnail_USA_Option-1.jpg'
                      : country === 'Canada'
                      ? '/media/imgi_28_FIFA_FWC26_Host-Country-thumbnail_Can_Option-1.jpg'
                      : '/media/imgi_35_FIFA_FWC26_Host-Country-thumbnail_Mex_Option-3.jpg'
                  }
                  alt={country}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{venues[0]?.flag}</span>
                  <h2 className="text-2xl font-black">{country}</h2>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: COUNTRY_COLORS[country],
                      color: COUNTRY_TEXT[country],
                      border: `1px solid ${COUNTRY_TEXT[country]}40`,
                    }}
                  >
                    {venues.length} venue{venues.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Host Nation Highlights & Stadium Guide
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/world-cup/venues/${toSlug(venue.name)}`}
                  className="card group transition-all hover:border-[var(--brand)] overflow-hidden"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  {/* Capacity bar */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-base group-hover:text-[var(--brand)] transition-colors">
                          {venue.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {venue.city}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                      >
                        {venue.matchesHosted} matches
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
                        <span className="font-semibold">{venue.capacity.toLocaleString()}</span>
                      </div>
                      {/* Relative capacity bar */}
                      <div
                        className="h-2 rounded-full"
                        style={{ background: 'var(--bg-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${(venue.capacity / 90000) * 100}%`,
                            background: COUNTRY_TEXT[country],
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Surface</span>
                        <span className="font-medium" style={{ color: 'var(--text-body)' }}>{venue.surface}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Note about interactive map */}
      <div
        className="card p-8 text-center fade-up mb-16"
        style={{ background: 'var(--bg-surface)' }}
      >
        <Map className="w-12 h-12 text-[var(--brand)] mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Interactive Venue Map</h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
          We are currently building a fully interactive 3D map featuring all 16 host stadiums, travel routes, and city guides. Stay tuned for updates!
        </p>
      </div>

      {/* Comprehensive SEO Content for Venues */}
      <article className="mt-20 prose prose-invert max-w-4xl mx-auto fade-up text-[var(--text-muted)] space-y-10 pb-20 border-t border-[var(--border)] pt-20">
        <header>
          <h2 className="text-4xl font-display font-black text-white mb-6">Stadiums of the Future: A Guide to the FIFA World Cup 2026 Venues</h2>
          <p className="text-xl leading-relaxed font-medium">
            The 2026 FIFA World Cup is set to be a landmark event in sporting history, not only for its expanded 48-team format but also for the architectural marvels that will host the 104 matches. Across the United States, Canada, and Mexico, 16 world-class stadiums have been selected to provide the backdrop for the beautiful game&apos;s greatest spectacle.
          </p>
        </header>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4">The United States: A Blend of Modernity and Scale</h3>
          <p className="leading-relaxed mb-4">
            The United States will host the majority of the tournament&apos;s matches, utilizing 11 state-of-the-art stadiums that are icons of North American sports architecture. From the colossal MetLife Stadium in New Jersey to the technologically advanced SoFi Stadium in Los Angeles, the US venues are designed to accommodate massive crowds while providing an unparalleled viewing experience.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>MetLife Stadium (New York/New Jersey):</strong> With a capacity of 82,500, this stadium is the crown jewel of the New York metropolitan area. It has been selected to host the 2026 World Cup Final, a testament to its world-class facilities and ability to handle events of global significance. Its open-air design ensures an electrifying atmosphere, especially under the lights during high-stakes knockout matches.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>AT&T Stadium (Dallas):</strong> Known as &quot;Jerry World,&quot; this stadium is a marvel of engineering. Its retractable roof and massive center-hung high-definition video screen make it one of the most distinctive venues in the world. With a flexible capacity that can exceed 90,000 for major events, it will host a semi-final, ensuring that fans in Texas witness some of the tournament&apos;s most critical moments.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>SoFi Stadium (Los Angeles):</strong> The most expensive stadium ever built, SoFi is a masterpiece of design. Its translucent roof and open-sided architecture allow for natural cooling and a unique &quot;indoor-outdoor&quot; feel. Located in Inglewood, it serves as the home for two NFL teams and will provide a futuristic setting for the opening US match of the tournament.
          </p>
          <p className="leading-relaxed">
            Other key US venues include the <strong>Mercedes-Benz Stadium</strong> in Atlanta, famous for its pinwheel retractable roof, and the <strong>Lumen Field</strong> in Seattle, renowned for having one of the loudest atmospheres in professional sports due to its unique roof design that reflects sound back onto the pitch.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Mexico: Cathedral of Football History</h3>
          <p className="leading-relaxed mb-4">
            Mexico&apos;s inclusion as a host nation brings a deep sense of tradition and passion to the 2026 World Cup. The three selected venues are steeped in football lore, none more so than the Estadio Azteca.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>Estadio Azteca (Mexico City):</strong> A true cathedral of world football, the Azteca will make history by becoming the first stadium to host matches in three different World Cup editions (1970, 1986, and 2026). It was here that Pelé cemented his legacy and Maradona scored the &quot;Hand of God.&quot; With a capacity of over 87,000, its atmosphere is legendary, and it will host the tournament&apos;s opening match, a symbolic nod to its historical importance.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>Estadio Akron (Guadalajara):</strong> One of the most visually stunning stadiums in the world, the Akron is designed to look like a volcano, with its grassy slopes blending into the surrounding landscape. It is the home of Chivas, one of Mexico&apos;s most popular clubs, and will provide a vibrant, culturally rich setting for group stage matches.
          </p>
          <p className="leading-relaxed">
            <strong>Estadio BBVA (Monterrey):</strong> Known as &quot;El Gigante de Acero&quot; (The Steel Giant), this stadium is famous for its breathtaking view of the Cero de la Silla mountain. Its steep stands ensure that every fan has a close-up view of the action, making it one of the most intimate large-scale venues in the tournament.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Canada: The Emerging Frontier</h3>
          <p className="leading-relaxed mb-4">
            Canada hosts the men&apos;s FIFA World Cup for the first time, reflecting the sport&apos;s rapid growth in the Great White North. The two selected cities, Toronto and Vancouver, offer diverse, cosmopolitan environments and world-class facilities.
          </p>
          <p className="leading-relaxed mb-4">
            <strong>BC Place (Vancouver):</strong> Located on the edge of False Creek, BC Place is famous for its retractable roof and spectacular views of the Vancouver skyline. It underwent a massive renovation in 2011 and is widely considered one of the best stadiums in North America for spectator comfort and technological integration.
          </p>
          <p className="leading-relaxed">
            <strong>BMO Field (Toronto):</strong> The home of Toronto FC, BMO Field is an intimate, football-specific stadium that is being expanded for the 2026 World Cup. Located at Exhibition Place, it offers a classic &quot;European-style&quot; atmosphere where the fans are right on top of the action, providing a stark contrast to some of the massive NFL-style arenas in the US.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4">The Selection Process and Global Standards</h3>
          <p className="leading-relaxed mb-4">
            The selection of the 16 host cities was the culmination of a multi-year process that evaluated everything from stadium infrastructure and training facilities to public transport and sustainability initiatives. FIFA&apos;s goal was to ensure that each venue could not only host a world-class sporting event but also leave a lasting positive legacy for the local community.
          </p>
          <p className="leading-relaxed mb-4">
            Sustainability was a core pillar of the selection criteria. Many of the stadiums, such as the Mercedes-Benz Stadium in Atlanta, have achieved LEED Platinum certification, featuring advanced rainwater harvesting systems, solar energy panels, and waste reduction programs. The 2026 World Cup aims to be the most environmentally responsible mega-event ever held.
          </p>
          <p className="leading-relaxed">
            Furthermore, the geographic spread of the venues presents a unique logistical challenge. Spanning four time zones and thousands of miles, the tournament will require a sophisticated transport network. FIFA has worked closely with host cities to optimize travel schedules, ensuring that teams and fans can move efficiently between matches while minimizing their carbon footprint.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Fan Experience: Beyond the 90 Minutes</h3>
          <p className="leading-relaxed mb-4">
            Attending a World Cup match is a bucket-list experience for many fans, and the 2026 host cities are preparing to offer more than just football. Each city will feature &quot;FIFA Fan Festivals,&quot; large-scale public viewing areas where fans without tickets can gather to watch matches, enjoy live music, and experience local food and culture.
          </p>
          <p className="leading-relaxed mb-4">
            The cultural diversity of North America will be on full display. Fans traveling to Mexico City can explore ancient Aztec ruins before heading to the stadium, while those in Seattle can enjoy the city&apos;s famous music scene and coffee culture. The 2026 World Cup is designed to be a &quot;World Cup for everyone,&quot; celebrating the unique heritage of each host nation.
          </p>
          <p className="leading-relaxed">
            As we count down to the opening whistle at the Estadio Azteca on June 11, 2026, the 16 host venues stand ready. They are more than just concrete and steel; they are the stages where new legends will be born, where tears will be shed, and where the world will come together in a shared celebration of the beautiful game.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-white mt-12 mb-4">Sustainability and Legacy</h3>
          <p className="leading-relaxed mb-4">
            A key focus for the 2026 organizers is the environmental and social legacy of the venues. Unlike previous tournaments that saw the construction of &quot;white elephants,&quot; 2026 utilizes existing, world-class infrastructure. Most stadiums are home to NFL or MLS teams, ensuring they remain vibrant community hubs long after the final whistle.
          </p>
          <p className="leading-relaxed mb-4">
            Efforts are underway to achieve net-zero carbon operations for many of the matchday events. This includes investments in renewable energy, zero-waste initiatives, and significant upgrades to public transit access around the stadiums. The goal is to set a new benchmark for how global mega-events can be hosted responsibly in the 21st century.
          </p>
        </section>

        <section className="bg-[var(--bg-elevated)] p-8 rounded-[15px] border border-[var(--border)] mt-12">
          <h3 className="text-xl font-bold text-white mb-6">Key Venue Statistics at a Glance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-bold text-[var(--brand)] mb-2 uppercase tracking-wider">USA (11)</h4>
              <ul className="space-y-1 opacity-80">
                <li>Atlanta - Mercedes-Benz Stadium</li>
                <li>Boston - Gillette Stadium</li>
                <li>Dallas - AT&T Stadium</li>
                <li>Houston - NRG Stadium</li>
                <li>Kansas City - Arrowhead Stadium</li>
                <li>Los Angeles - SoFi Stadium</li>
                <li>Miami - Hard Rock Stadium</li>
                <li>New York/NJ - MetLife Stadium</li>
                <li>Philadelphia - Lincoln Financial</li>
                <li>San Francisco - Levi&apos;s Stadium</li>
                <li>Seattle - Lumen Field</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[var(--brand)] mb-2 uppercase tracking-wider">Mexico (3)</h4>
              <ul className="space-y-1 opacity-80">
                <li>Mexico City - Estadio Azteca</li>
                <li>Guadalajara - Estadio Akron</li>
                <li>Monterrey - Estadio BBVA</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[var(--brand)] mb-2 uppercase tracking-wider">Canada (2)</h4>
              <ul className="space-y-1 opacity-80">
                <li>Toronto - BMO Field</li>
                <li>Vancouver - BC Place</li>
              </ul>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
