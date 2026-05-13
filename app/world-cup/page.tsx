import Image from 'next/image';
import Link from 'next/link';
import { Globe, Trophy, MapPin, Activity, BarChart, LineChart, Award, ArrowRight, Calendar, Users, History, LayoutGrid } from 'lucide-react';
import {
  getStandings,
  getTopScorers,
  getFixturesByLeague,
  getOdds,
  WORLD_CUP_LEAGUE_ID,
  WORLD_CUP_SEASON,
} from '@/lib/apifootball';
import WorldCupCountdown from '@/components/WorldCupCountdown';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import KnockoutBracket from '@/components/KnockoutBracket';
import OutrightOddsTable from '@/components/OutrightOddsTable';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 — Hub',
  description:
    'Live scores, groups, knockout bracket, top scorers, outright odds, and more for FIFA World Cup 2026. USA · Canada · Mexico. 48 teams, 104 matches.',
  openGraph: {
    title: 'FIFA World Cup 2026 Hub',
    description: 'Live scores, groups, knockout bracket, top scorers, and outright winner odds.',
    type: 'website',
  },
};

const WC_HOSTS = [
  { country: 'USA', flag: '🇺🇸', stadiums: 11, city: 'New York, LA, Dallas…', image: '/media/imgi_41_FIFA_FWC26_Host-Country-thumbnail_USA_Option-1.jpg' },
  { country: 'Canada', flag: '🇨🇦', stadiums: 2, city: 'Toronto, Vancouver', image: '/media/imgi_28_FIFA_FWC26_Host-Country-thumbnail_Can_Option-1.jpg' },
  { country: 'Mexico', flag: '🇲🇽', stadiums: 3, city: 'Mexico City, Guadalajara', image: '/media/imgi_35_FIFA_FWC26_Host-Country-thumbnail_Mex_Option-3.jpg' },
];

const MASCOTS = [
  { name: 'Clutch', image: '/media/imgi_21_Clutch.jpg', desc: 'Bringing the energy to every match.' },
  { name: 'Maple', image: '/media/imgi_7_Maple.jpg', desc: 'The spirit of the north, representing Canada.' },
  { name: 'Zayu', image: '/media/imgi_8_Zayu.jpg', desc: 'Speed, agility, and the heart of the game.' },
];

// ─── Parse outright odds from API response ─────────────────────────────────────
function parseOutrightOdds(
  oddsData: import('@/lib/apifootball').OddsResponse[]
): { teamName: string; teamLogo?: string; odd: string }[] {
  if (!oddsData || oddsData.length === 0) return [];

  // Find the "Winner" bet across all bookmakers
  const entries: { teamName: string; odd: string }[] = [];
  for (const fixture of oddsData) {
    for (const bookmaker of fixture.bookmakers ?? []) {
      for (const bet of bookmaker.bets ?? []) {
        if (bet.name?.toLowerCase().includes('winner') || bet.id === 186) {
          for (const v of bet.values ?? []) {
            if (!entries.find((e) => e.teamName === v.value)) {
              entries.push({ teamName: v.value, odd: v.odd });
            }
          }
        }
      }
    }
  }

  return entries
    .sort((a, b) => parseFloat(a.odd) - parseFloat(b.odd))
    .slice(0, 15);
}

export default async function WorldCupPage() {
  const now = new Date();
  const wcStartDate = new Date('2026-06-11T00:00:00Z');
  const wcStarted = now >= wcStartDate;

  let groups: import('@/lib/apifootball').Standing[][] = [];
  let topScorers: import('@/lib/apifootball').PlayerResponse[] = [];
  let fixtures: import('@/lib/apifootball').Fixture[] = [];
  let outrightOdds: { teamName: string; teamLogo?: string; odd: string }[] = [];

  if (wcStarted) {
    const [standingsRes, scorersRes, fixturesRes] = await Promise.allSettled([
      getStandings(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
      getTopScorers(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
      getFixturesByLeague(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
    ]);

    // Try outright odds separately (may not be available on free tier)
    const oddsRes = await Promise.allSettled([
      getOdds(WORLD_CUP_LEAGUE_ID), // this will gracefully fail / return []
    ]);

    if (standingsRes.status === 'fulfilled' && standingsRes.value[0]) {
      groups = standingsRes.value[0].league.standings;
    }
    if (scorersRes.status === 'fulfilled') {
      topScorers = scorersRes.value.slice(0, 10);
    }
    if (fixturesRes.status === 'fulfilled') {
      fixtures = fixturesRes.value;
    }
    if (oddsRes[0].status === 'fulfilled') {
      const raw = oddsRes[0].value;
      outrightOdds = parseOutrightOdds(Array.isArray(raw) ? raw : []);
    }
  }

  const liveMatches = fixtures.filter((f) =>
    ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short)
  );
  const upcoming = fixtures.filter((f) => f.fixture.status.short === 'NS').slice(0, 5);
  const knockoutFixtures = fixtures.filter((f) =>
    ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'].some((r) =>
      f.league.round?.includes(r)
    )
  );
  const hasKnockout = knockoutFixtures.length > 0;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero section */}
      <div
        className="card p-8 sm:p-16 mb-10 text-center relative overflow-hidden fade-up border border-[var(--border)] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        <video 
          src="/media/FIFA-promo_video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[var(--bg-base)] z-0" />
        
        <div className="relative z-10">
          <Image src="/media/fifalogo.png" alt="FIFA World Cup 2026 Logo" width={160} height={160} className="mb-6 mx-auto drop-shadow-[0_0_20px_rgba(0,230,118,0.4)]" />
          <h1
            className="text-5xl sm:text-7xl font-display font-black mb-2 text-white tracking-tight drop-shadow-lg"
          >
            FIFA World Cup
          </h1>
          <p className="text-3xl sm:text-4xl font-display font-bold text-[var(--brand)] mb-5 drop-shadow-[0_0_12px_rgba(0,230,118,0.3)]">2026</p>
          <p className="text-lg font-medium mb-4 text-white drop-shadow-md">
            June 11 – July 19, 2026
          </p>
          <div className="flex justify-center gap-6 mb-6">
            {WC_HOSTS.map((h) => (
              <div key={h.country} className="text-center">
                <div className="text-2xl drop-shadow-md">{h.flag}</div>
                <div className="text-xs mt-1 text-white/90 drop-shadow-md">
                  {h.country}
                </div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center justify-center mt-6">
            <Image src="/media/fifatrophy.png" alt="FIFA World Cup Trophy" width={80} height={180} className="mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
            <WorldCupCountdown />
          </div>

          <div
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-white/90 drop-shadow-md"
          >
            <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-[var(--brand)] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" /> 48 Teams</span>
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[var(--brand)] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" /> 16 Stadiums</span>
            <span className="flex items-center gap-2"><Activity className="w-5 h-5 text-[var(--brand)] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" /> 104 Matches</span>
            <span className="flex items-center gap-2"><Globe className="w-5 h-5 text-[var(--brand)] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" /> 3 Host Countries</span>
            <Link
              href="/world-cup/venues"
              className="underline hover:text-white transition-colors"
            >
              View venue map <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Pre-tournament info cards */}
      {!wcStarted && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 fade-up fade-up-delay-1">
          {WC_HOSTS.map((h) => (
            <div
              key={h.country}
              className="card text-center flex flex-col border border-[var(--border)] p-3"
              style={{
                background: 'var(--bg-surface)',
              }}
            >
              <div className="h-48 relative w-full mb-4">
                <Image src={h.image} alt={h.country} fill className="object-cover rounded-[15px]" />
              </div>
              <div className="p-4 pt-0">
                <div className="text-4xl mb-3">{h.flag}</div>
                <h3 className="font-bold text-lg mb-1 text-white">{h.country}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {h.stadiums} stadiums
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {h.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live during tournament */}
      {wcStarted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Live matches */}
            {liveMatches.length > 0 && (
              <section className="fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="live-dot" />
                  <h2 className="text-lg font-bold">Live Matches</h2>
                </div>
                <div className="space-y-2">
                  {liveMatches.map((f) => (
                    <MatchCard key={f.fixture.id} fixture={f} />
                  ))}
                </div>
              </section>
            )}

            {/* Knockout Bracket (shown when knockout stage begins) */}
            {hasKnockout && (
              <KnockoutBracket fixtures={knockoutFixtures} />
            )}

            {groups.length > 0 && (
              <section className="fade-up">
                <h2 className="text-xl font-display font-bold mb-5 text-white">Group Stage</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {groups.map((group, i) => (
                    <div key={i} className="card p-5 bg-[var(--bg-elevated)] border border-[var(--border)]">
                      <h3
                        className="font-bold mb-4 text-sm text-[var(--brand)] uppercase tracking-wider drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]"
                      >
                        {group[0]?.group ?? `Group ${String.fromCharCode(65 + i)}`}
                      </h3>
                      {/* Link each team to their World Cup nation hub */}
                      <StandingsTable standings={group} leagueId={WORLD_CUP_LEAGUE_ID} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="fade-up">
                <h2 className="text-lg font-bold mb-4">Upcoming Matches</h2>
                <div className="space-y-2">
                  {upcoming.map((f) => (
                    <MatchCard key={f.fixture.id} fixture={f} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 fade-up fade-up-delay-1">
            {/* Outright Winner Odds */}
            <OutrightOddsTable entries={outrightOdds} />

            {/* Golden Boot */}
            {topScorers.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[var(--warning)]" /> Golden Boot Race</h2>
                <div className="space-y-3">
                  {topScorers.map((s, i) => {
                    const stat = s.statistics[0];
                    return (
                      <Link
                        key={s.player.id}
                        href={`/player/${s.player.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <span
                          className="w-6 text-xs font-bold text-center shrink-0"
                          style={{
                            color:
                              i === 0
                                ? 'var(--warning)'
                                : i < 3
                                ? 'var(--accent)'
                                : 'var(--text-muted)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <Image
                          src={s.player.photo}
                          alt={s.player.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-[var(--brand)] transition-colors">
                            {s.player.name}
                          </p>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            {s.player.nationality}
                          </p>
                        </div>
                        <span
                          className="font-display font-black text-2xl shrink-0"
                          style={{ color: 'var(--warning)' }}
                        >
                          {stat?.goals?.total ?? 0}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Pre-tournament placeholder bracket */}
      {!wcStarted && (
        <div className="space-y-8">
          <div className="card p-6 fade-up fade-up-delay-1">
            <KnockoutBracket fixtures={[]} />
          </div>

          {/* What to Expect */}
          <div className="card p-8 text-center fade-up fade-up-delay-2">
            <h2 className="text-2xl font-bold mb-4">What to Expect</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: <BarChart className="w-8 h-8 mx-auto" />, label: 'Live Group Tables', desc: 'All 12 groups updated live' },
                { icon: <Trophy className="w-8 h-8 mx-auto text-[var(--warning)]" />, label: 'Knockout Bracket', desc: 'Round of 32 to the Final' },
                { icon: <Activity className="w-8 h-8 mx-auto text-[var(--brand)]" />, label: 'Golden Boot', desc: 'Top scorers race' },
                { icon: <LineChart className="w-8 h-8 mx-auto text-[var(--success)]" />, label: 'Live Odds', desc: 'Outright winner odds' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--bg-subtle)' }}
                >
                  <div className="mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm mb-1">{item.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              Until the tournament begins, enjoy all club football from{' '}
              <Link href="/"               className="underline hover:text-[var(--brand)] transition-colors">
                the scores hub
              </Link>
              .
            </p>
          </div>
        </div>
      )}
      {/* Mascots Section */}
      <div className="mt-16 space-y-12">
        <section className="fade-up">
            <h2 className="text-2xl font-display font-black text-white mb-6">Meet the 2026 Ambassadors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {MASCOTS.map((m) => (
                <div key={m.name} className="card p-5 border border-[var(--border)] bg-[var(--bg-surface)]">
                  <div className="h-48 relative w-full mb-4 overflow-hidden rounded-[15px]">
                    <Image src={m.image} alt={m.name} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{m.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
      </div>

      {/* Comprehensive SEO Content */}
      <article className="mt-24 prose prose-invert max-w-4xl mx-auto fade-up text-[var(--text-muted)] space-y-8 pb-20">
        <h2 className="text-4xl font-display font-black text-white mb-6">The Dawn of a New Era: FIFA World Cup 2026</h2>
        
        <p className="text-lg leading-relaxed">
          The FIFA World Cup is the pinnacle of international football, capturing the hearts and minds of billions of fans across the globe. As we look towards the 2026 edition, anticipation is reaching unprecedented heights. For the first time in the tournament&apos;s storied history, the World Cup will be hosted by three nations: the United States, Canada, and Mexico. This monumental event is not just a celebration of football; it&apos;s a testament to the unifying power of the beautiful game, bridging cultures, languages, and borders across the North American continent.
        </p>

        <p className="text-lg leading-relaxed">
          The 2026 FIFA World Cup promises to be the largest, most inclusive, and potentially the most spectacular iteration ever conceived. With an expanded format featuring 48 teams—a significant leap from the traditional 32-team structure—the tournament is set to bring more nations, more fans, and more unforgettable moments to the global stage. From the bustling streets of Mexico City to the iconic skyline of New York and the breathtaking scenery of Vancouver, the entire continent is preparing to roll out the red carpet for the world&apos;s greatest sporting spectacle.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Historic 48-Team Format</h3>
        <p className="text-lg leading-relaxed">
          One of the most significant changes introduced for the 2026 tournament is the expansion from 32 to 48 participating nations. This bold move by FIFA was designed to globalize the game further, providing opportunities for emerging footballing nations to showcase their talent on the grandest stage. The new format ensures greater representation from continents like Africa, Asia, and North America, democratizing access to the World Cup and fostering the growth of the sport worldwide.
        </p>
        <p className="text-lg leading-relaxed">
          Under the revised structure, the 48 teams will be divided into 12 groups of four. This means that the tournament will feature an astonishing 104 matches, significantly up from the 64 matches played in previous editions. The top two teams from each group, along with the eight best third-placed teams, will advance to a newly introduced Round of 32. This extended knockout phase guarantees high-stakes, do-or-die football right from the early stages of the tournament, keeping fans on the edge of their seats for over a month of non-stop action.
        </p>
        <p className="text-lg leading-relaxed">
          The expansion has not been without its critics, who argue that it might dilute the quality of the competition. However, proponents believe that the increased participation will lead to inspiring underdog stories, akin to the magical runs we&apos;ve witnessed in the past. It offers a platform for unheralded heroes to make a name for themselves, reminding us that in football, the impossible is always possible.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">United by Football: The Three Host Nations</h3>
        <p className="text-lg leading-relaxed">
          The collaborative bid between the United States, Canada, and Mexico, known as the &quot;United 2026&quot; bid, successfully won the right to host the tournament, marking the first time three countries will co-host a World Cup. Each nation brings its unique flavor, rich footballing heritage, and state-of-the-art infrastructure to the table.
        </p>
        <p className="text-lg leading-relaxed">
          <strong>The United States:</strong> Returning as a host after the highly successful 1994 World Cup, the US has seen a massive surge in football&apos;s popularity over the last three decades. With top-tier stadiums, unparalleled commercial power, and a diverse population that passionately supports teams from all corners of the globe, the US will host the lion&apos;s share of the matches, including the majority of the knockout stage and the highly anticipated Final. The legacy of &apos;94 lives on, but 2026 is poised to shatter all previous attendance and viewership records.
        </p>
        <p className="text-lg leading-relaxed">
          <strong>Mexico:</strong> A country where football is almost a religion, Mexico makes history by becoming the first nation to host the World Cup for a third time, following the legendary tournaments of 1970 and 1986. The iconic Estadio Azteca, a cathedral of world football, will once again echo with the roar of passionate fans. Mexican supporters are renowned for their vibrant culture, colorful attire, and unwavering passion, ensuring that the matches held south of the border will be an absolute festival of football.
        </p>
        <p className="text-lg leading-relaxed">
          <strong>Canada:</strong> Hosting the men&apos;s World Cup for the very first time, Canada represents the emerging frontier of North American football. Fresh off their impressive qualification for the 2022 tournament, the Canadian national team has galvanized a nation traditionally known for its love of ice hockey. Cities like Toronto and Vancouver will provide spectacular backdrops, welcoming international fans with renowned Canadian hospitality and showcasing a country that has truly fallen in love with the beautiful game.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The 16 Host Cities and Iconic Stadiums</h3>
        <p className="text-lg leading-relaxed">
          To accommodate 104 matches and millions of traveling fans, the tournament will be spread across 16 world-class cities. The selection process was rigorous, focusing on stadium capacity, infrastructure, and the ability to host global events of this magnitude.
        </p>
        <p className="text-lg leading-relaxed">
          In the United States, 11 cities have been chosen: Atlanta, Boston, Dallas, Houston, Kansas City, Los Angeles, Miami, New York/New Jersey, Philadelphia, San Francisco Bay Area, and Seattle. These cities boast some of the most technologically advanced and massive stadiums in the world. For instance, the MetLife Stadium in New Jersey and the AT&T Stadium in Dallas are colossal arenas capable of hosting over 80,000 screaming fans, providing an electrifying atmosphere for the most crucial matches of the tournament.
        </p>
        <p className="text-lg leading-relaxed">
          Mexico will host matches in three cities: the sprawling metropolis of Mexico City, the cultural hub of Guadalajara, and the industrial powerhouse of Monterrey. The Estadio Azteca in Mexico City stands as a monument to football history, having witnessed Pelé&apos;s triumph in 1970 and Diego Maradona&apos;s &quot;Hand of God&quot; and &quot;Goal of the Century&quot; in 1986. It is a stadium steeped in myth and legend, ready to write its third chapter in World Cup lore.
        </p>
        <p className="text-lg leading-relaxed">
          Canada&apos;s contribution comes from Toronto and Vancouver. BMO Field in Toronto is undergoing significant expansion to meet FIFA&apos;s capacity requirements, while BC Place in Vancouver, famous for its stunning setting and unique retractable roof, will offer fans an unforgettable matchday experience surrounded by majestic mountains and the Pacific Ocean.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Qualification Process and Regional Slots</h3>
        <p className="text-lg leading-relaxed">
          The road to 2026 is long and arduous, with national teams from all six FIFA confederations battling it out for the coveted 48 spots. As co-hosts, the United States, Mexico, and Canada have received automatic qualification, leaving 45 spots up for grabs.
        </p>
        <p className="text-lg leading-relaxed">
          The allocation of slots has been significantly altered to reflect the tournament&apos;s expansion. UEFA (Europe) will now send 16 teams, an increase of three. CAF (Africa) sees a massive boost, with nine guaranteed spots and a chance for a tenth via the intercontinental playoff. AFC (Asia) receives eight direct slots, while CONMEBOL (South America) gets six. CONCACAF (North, Central America, and the Caribbean) will have six slots (including the three hosts), and OFC (Oceania) gets one guaranteed spot, ensuring global representation. The final two spots will be decided by a six-team intercontinental playoff tournament, adding an extra layer of drama and excitement to the qualification cycle.
        </p>
        <p className="text-lg leading-relaxed">
          This reshuffling means that fans will likely see new faces making their World Cup debuts. Nations that have consistently fallen just short in previous grueling qualification campaigns now have a realistic path to glory, inspiring a new generation of players and fans in their respective countries.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Impact on Global Football</h3>
        <p className="text-lg leading-relaxed">
          The 2026 World Cup is more than a tournament; it&apos;s a catalyst for the sport&apos;s global development. By bringing the event back to North America, FIFA aims to solidify football&apos;s footprint in one of the world&apos;s most lucrative and dynamic sporting markets. The economic impact is expected to be staggering, generating billions of dollars in revenue and creating thousands of jobs across the host nations.
        </p>
        <p className="text-lg leading-relaxed">
          Beyond the economics, the legacy of 2026 will be measured by grassroots growth. The excitement generated by the tournament is anticipated to drive youth participation rates to record highs, fostering domestic leagues and unearthing future stars. Moreover, the focus on sustainability and inclusivity in the &quot;United 2026&quot; bid sets a new standard for mega-events, prioritizing environmental responsibility and social impact.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Traveler&apos;s Guide: Navigating North America</h3>
        <p className="text-lg leading-relaxed">
          For fans traveling from overseas, navigating three massive countries requires careful planning. The 2026 World Cup will be organized into regional clusters—West, Central, and East—to minimize travel fatigue for players and fans alike. 
        </p>
        <ul className="list-disc pl-6 space-y-2 text-lg">
          <li><strong>West Cluster:</strong> Vancouver, Seattle, San Francisco, Los Angeles.</li>
          <li><strong>Central Cluster:</strong> Guadalajara, Mexico City, Monterrey, Houston, Dallas, Kansas City.</li>
          <li><strong>East Cluster:</strong> Atlanta, Miami, Toronto, Boston, Philadelphia, New York/New Jersey.</li>
        </ul>
        <p className="text-lg leading-relaxed">
          Fans are encouraged to book accommodation early, as host cities expect record-breaking occupancy. Transport between cities will largely be handled by air travel, though the East Coast offers reliable rail links via Amtrak between cities like New York, Philadelphia, and Boston.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Ticketing and Fan Fest</h3>
        <p className="text-lg leading-relaxed">
          FIFA will host official &quot;Fan Festivals&quot; in every host city, offering free public viewing of matches, live music, and interactive football experiences. These hubs are the heart of the tournament for those without stadium tickets. Regarding official match tickets, ensure you only purchase through FIFA&apos;s official portal to avoid scams. The ticketing process usually involves a random selection draw followed by a first-come, first-served phase.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Frequently Asked Questions (FAQ)</h3>
        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">When exactly will the 2026 World Cup take place?</h4>
            <p>The tournament is scheduled to run from June 11 to July 19, 2026, encompassing a 39-day festival of football.</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">How many teams will compete?</h4>
            <p>For the first time in history, 48 teams will compete, a significant expansion from the traditional 32-team format used since 1998.</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">Which cities are hosting the matches?</h4>
            <p>There are 16 host cities: 11 in the USA (including New York/New Jersey, Los Angeles, Dallas, Miami), 3 in Mexico (Mexico City, Guadalajara, Monterrey), and 2 in Canada (Toronto, Vancouver).</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">Where will the final match be played?</h4>
            <p>The grand finale of the 2026 World Cup will be held at the MetLife Stadium in New Jersey (New York area) on July 19, 2026.</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">How does the new format work?</h4>
            <p>The 48 teams will be divided into 12 groups of four. The top two teams from each group, along with the eight best third-placed teams, will advance to a new Round of 32 knockout stage.</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">Will the host nations have to qualify?</h4>
            <p>No, all three host nations (USA, Canada, and Mexico) have been granted automatic qualification for the tournament.</p>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6 rounded-xl border border-[var(--border)]">
            <h4 className="text-white font-bold text-lg mb-2">Where can I buy tickets?</h4>
            <p>Ticket information will be released by FIFA closer to the tournament. Fans are encouraged to register their interest on the official FIFA website to receive updates on ticket sales phases.</p>
          </div>
        </div>
      </article>

    </div>
  );
}
