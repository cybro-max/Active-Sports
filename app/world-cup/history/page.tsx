import Link from 'next/link';
import { History, Trophy, Star, ArrowLeft, Calendar, Globe, Target } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History of the FIFA World Cup — 1930 to 2026',
  description: 'Explore the complete history of the FIFA World Cup. From the inaugural 1930 tournament in Uruguay to the 2026 expansion. Iconic moments, legends, and records.',
};

export default function WorldCupHistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/world-cup"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to World Cup Hub
      </Link>

      {/* Hero */}
      <div className="card p-10 mb-10 bg-gradient-to-br from-[var(--bg-elevated)] to-black border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <History className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-4">A Century of Glory</h1>
          <p className="text-lg text-[var(--text-muted)] mb-8">
            From the docks of Montevideo in 1930 to the futuristic stadiums of 2026, the FIFA World Cup has evolved into the world&apos;s greatest sporting narrative.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-medium">22 Tournaments Held</span>
             </div>
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-sm font-medium">8 Winning Nations</span>
             </div>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Timeline Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="md:col-span-2 space-y-12">
          <h2 className="text-3xl font-display font-black text-white">The Defining Eras</h2>
          
          <div className="relative pl-8 border-l-2 border-[var(--border)] space-y-12">
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[var(--brand)] border-4 border-black" />
              <h3 className="text-xl font-bold text-white mb-2">1930 – 1950: The Early Pioneers</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                The inaugural tournament in Uruguay (1930) featured only 13 teams. Despite the logistical challenges of the era, it established the World Cup as a global priority. The era was interrupted by WWII, but the 1950 &quot;Maracanazo&quot; in Brazil remains one of the most shocking upsets in history.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[var(--accent)] border-4 border-black" />
              <h3 className="text-xl font-bold text-white mb-2">1958 – 1970: The Age of Pelé</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Brazil dominated this era, winning three titles in four editions. This period saw the rise of the first global superstar, Pelé, and the perfection of the &quot;Samba&quot; style. The 1970 final in Mexico City is widely regarded as the greatest collective performance in tournament history.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[var(--success)] border-4 border-black" />
              <h3 className="text-xl font-bold text-white mb-2">1974 – 1990: Tactical Revolutions</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Total Football introduced by the Netherlands in 1974 changed the game forever, even though they never won. This era also belonged to Diego Maradona, whose &quot;Goal of the Century&quot; in 1986 defined an entire generation of football fans.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[var(--warning)] border-4 border-black" />
              <h3 className="text-xl font-bold text-white mb-2">1994 – 2022: The Modern Spectacle</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                The game went truly global with USA 94, followed by the expansion to 32 teams in 1998. Spain&apos;s Tiki-Taka, Germany&apos;s efficiency, and Lionel Messi&apos;s ultimate triumph in Qatar (2022) have brought us to the doorstep of the 48-team era.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6 bg-[var(--bg-elevated)] border border-[var(--border)]">
            <h3 className="font-bold text-white mb-4">All-Time Champions</h3>
            <div className="space-y-4">
              {[
                { nation: 'Brazil', titles: 5, years: '1958, 1962, 1970, 1994, 2002' },
                { nation: 'Italy', titles: 4, years: '1934, 1938, 1982, 2006' },
                { nation: 'Germany', titles: 4, years: '1954, 1974, 1990, 2014' },
                { nation: 'Argentina', titles: 3, years: '1978, 1986, 2022' },
                { nation: 'France', titles: 2, years: '1998, 2018' },
                { nation: 'Uruguay', titles: 2, years: '1930, 1950' },
                { nation: 'England', titles: 1, years: '1966' },
                { nation: 'Spain', titles: 1, years: '2010' },
              ].map(c => (
                <div key={c.nation} className="flex items-center justify-between border-b border-[var(--border)] pb-2 last:border-0">
                  <div>
                    <div className="font-bold text-sm text-white">{c.nation}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{c.years}</div>
                  </div>
                  <div className="text-[var(--warning)] font-black">{c.titles}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* SEO Content Article */}
      <article className="prose prose-invert max-w-4xl mx-auto text-[var(--text-muted)] space-y-12 pb-20">
        <h2 className="text-4xl font-display font-black text-white">The Evolution of the World&apos;s Game: A Deep Dive into World Cup History</h2>
        
        <p className="text-xl leading-relaxed">
          The FIFA World Cup is more than just a football tournament; it is a cultural phenomenon that captures the collective imagination of the planet every four years. Since its inception in 1930, it has served as a mirror to the world&apos;s geopolitical shifts, technological advancements, and the relentless evolution of athletic excellence. Understanding the history of the World Cup is essential to appreciating the magnitude of what awaits us in 2026.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">1930: The Birth of a Legend in Montevideo</h3>
        <p className="text-lg leading-relaxed">
          In 1930, the vision of Jules Rimet became a reality. Uruguay, having won the previous two Olympic football titles, was chosen as the host. The tournament was a logistical nightmare for European nations, many of whom declined to participate due to the three-week sea voyage required to reach South America. Only four European teams made the trip. Uruguay eventually defeated Argentina 4-2 in the final, cementing their place as the first-ever World Cup champions. This inaugural event proved that there was a global appetite for a dedicated football championship, separate from the Olympic Games.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Post-War Renaissance and the 1950 Miracle</h3>
        <p className="text-lg leading-relaxed">
          After a 12-year hiatus caused by World War II, the tournament returned in 1950 in Brazil. This edition is remembered for the &quot;Maracanazo,&quot; where Uruguay shocked the host nation in front of nearly 200,000 fans at the Maracanã Stadium. Brazil only needed a draw to win the title, but Uruguay&apos;s 2-1 victory plunged the entire country into mourning. This match is often cited as the most significant in football history, illustrating the deep emotional connection between a nation and its national team.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Pelé Era: 1958 – 1970</h3>
        <p className="text-lg leading-relaxed">
          The 1958 tournament in Sweden introduced the world to a 17-year-old named Pelé. His brilliance led Brazil to their first title, and he would go on to win two more in 1962 and 1970. The 1970 Brazil team is often voted as the greatest squad in history, featuring legends like Jairzinho, Tostão, Rivelino, and Carlos Alberto. Their style of play, &quot;Joga Bonito&quot; (The Beautiful Game), remains the gold standard for attacking football. It was also the first tournament broadcast in color, bringing the vibrant yellow of Brazil and the emerald green of the pitches into living rooms around the world.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Tactical Masterclasses: 1974 – 1982</h3>
        <p className="text-lg leading-relaxed">
          The 1970s saw a shift towards tactical sophistication. The 1974 World Cup in West Germany showcased &quot;Total Football,&quot; a system where any outfield player could take over the role of any other player in the team. Led by Johan Cruyff and coached by Rinus Michels, the Netherlands reached the final but lost to the efficient West Germans. This era also saw the rise of Argentina, who won their first title on home soil in 1978, followed by Italy&apos;s defensive masterclass and Paolo Rossi&apos;s clinical finishing in 1982.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Maradona&apos;s Magic: Mexico 1986</h3>
        <p className="text-lg leading-relaxed">
          If 1970 belonged to Brazil as a team, 1986 belonged to Diego Armando Maradona as an individual. His performance against England in the quarter-finals remains the most debated and celebrated in history. In a single match, he scored the &quot;Hand of God&quot; goal followed by the &quot;Goal of the Century,&quot; where he dribbled past five English players before slotting the ball home. Maradona&apos;s influence led Argentina to their second title and secured his place in the pantheon of all-time greats.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Global Expansion: 1994 – 2010</h3>
        <p className="text-lg leading-relaxed">
          The 1994 World Cup in the United States proved that football could thrive in &quot;non-traditional&quot; markets, setting attendance records that still stand today. The expansion to 32 teams in 1998 allowed for greater representation from Africa and Asia. France won their first title at home in 1998, led by Zinedine Zidane. The 2002 tournament in South Korea and Japan was the first to be held in Asia, highlighting the sport&apos;s growing global footprint. Spain&apos;s dominance in 2010 with their &quot;Tiki-Taka&quot; passing style proved that technical proficiency could overcome physical strength.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Era of Modern Legends: 2014 – 2022</h3>
        <p className="text-lg leading-relaxed">
          The recent decade has been defined by the rivalry between Lionel Messi and Cristiano Ronaldo, though the World Cup remained elusive for both for many years. Germany&apos;s 7-1 demolition of Brazil in 2014 and their subsequent title win showed the power of collective planning. France&apos;s 2018 victory featured a new superstar, Kylian Mbappé, the first teenager since Pelé to score in a final. Finally, in 2022, Lionel Messi achieved his lifelong dream, leading Argentina to glory in Qatar in what is widely considered the greatest final ever played.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Road to 48: Looking Ahead to 2026</h3>
        <p className="text-lg leading-relaxed">
          As we look towards 2026, the tournament enters its most ambitious phase. Expanding to 48 teams across three massive host nations—USA, Mexico, and Canada—will redefine the scale of the World Cup. It is a transition from a centralized tournament to a continental festival. The history of the World Cup tells us one thing: no matter the format or the location, the tournament will produce moments of drama, controversy, and brilliance that will be talked about for the next century.
        </p>

        <div className="bg-[var(--bg-elevated)] p-8 rounded-[15px] border border-[var(--border)] not-prose mt-16">
          <h3 className="text-xl font-bold text-white mb-6">Key World Cup Records</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-2">Most Goals (Individual)</p>
              <p className="text-lg font-bold text-white">Miroslav Klose (Germany)</p>
              <p className="text-sm text-[var(--brand)]">16 Goals in 24 matches</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-2">Most Wins (Team)</p>
              <p className="text-lg font-bold text-white">Brazil</p>
              <p className="text-sm text-[var(--brand)]">76 Wins across 22 editions</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-2">Most Appearances</p>
              <p className="text-lg font-bold text-white">Lionel Messi (Argentina)</p>
              <p className="text-sm text-[var(--brand)]">26 Matches (2006-2022)</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] mb-2">Largest Attendance</p>
              <p className="text-lg font-bold text-white">173,850</p>
              <p className="text-sm text-[var(--brand)]">Brazil vs Uruguay (1950)</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
