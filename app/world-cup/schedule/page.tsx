import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowLeft, Filter, Search, ChevronRight } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Schedule — Full Match Calendar | ActiveSports',
  description: 'View the complete 104-match schedule for the 2026 FIFA World Cup. Filter by date, venue, city, and host nation. Stay updated with kick-off times and locations.',
};

const DATES = [
  { date: 'June 11, 2026', matches: 2, event: 'Opening Match (Mexico City)' },
  { date: 'June 12, 2026', matches: 3, event: 'Opening Match (Toronto & LA)' },
  { date: 'June 13 – June 27, 2026', matches: 72, event: 'Group Stage' },
  { date: 'June 28 – July 3, 2026', matches: 16, event: 'Round of 32' },
  { date: 'July 4 – July 7, 2026', matches: 8, event: 'Round of 16' },
  { date: 'July 9 – July 11, 2026', matches: 4, event: 'Quarter-Finals' },
  { date: 'July 14 – July 15, 2026', matches: 2, event: 'Semi-Finals' },
  { date: 'July 18, 2026', matches: 1, event: 'Third Place Play-off' },
  { date: 'July 19, 2026', matches: 1, event: 'FIFA World Cup Final' },
];

export default function WorldCupSchedulePage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <Calendar className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-4">The Master Schedule</h1>
          <p className="text-lg text-[var(--text-muted)] mb-8">
            104 matches across 16 cities and 3 nations. The most ambitious tournament calendar in sporting history.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-sm font-medium">39 Days of Football</span>
             </div>
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--danger)]" />
                <span className="text-sm font-medium">16 Host Cities</span>
             </div>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Schedule Table */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
        {/* Filters */}
        <aside className="space-y-6">
          <div className="card p-6 bg-[var(--bg-elevated)] border border-[var(--border)]">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block">Host Nation</label>
                   <div className="flex flex-col gap-2">
                      {['All Nations', 'USA', 'Mexico', 'Canada'].map(n => (
                         <button key={n} className="text-sm text-left px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--brand)] transition-colors">
                            {n}
                         </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block">Tournament Stage</label>
                   <div className="flex flex-col gap-2">
                      {['Group Stage', 'Knockout Rounds', 'Finals'].map(s => (
                         <button key={s} className="text-sm text-left px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--brand)] transition-colors">
                            {s}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </aside>

        {/* List */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-display font-black text-white">Full Match Calendar</h2>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                 <input type="text" placeholder="Search by city or venue..." className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)] w-64" />
              </div>
           </div>

           <div className="space-y-4">
              {DATES.map((d, i) => (
                 <div key={i} className="card p-6 flex items-center justify-between group hover:bg-[var(--bg-hover)] transition-all cursor-pointer border border-[var(--border)]">
                    <div className="flex items-center gap-6">
                       <div className="bg-[var(--bg-subtle)] p-4 rounded-xl text-center min-w-[100px]">
                          <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">{d.date.split(',')[0]}</div>
                          <div className="text-xl font-black text-white">{d.date.split(',')[1]?.trim() || '2026'}</div>
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-[var(--brand)] transition-colors">{d.event}</h3>
                          <p className="text-sm text-[var(--text-muted)]">{d.matches} Matches Scheduled</p>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-all" />
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <article className="prose prose-invert max-w-4xl mx-auto text-[var(--text-muted)] space-y-12 pb-20">
         <h2 className="text-4xl font-display font-black text-white">The Logistics of Legend: Decoding the FIFA World Cup 2026 Schedule</h2>
         
         <p className="text-xl leading-relaxed">
            The 2026 FIFA World Cup schedule is a masterpiece of modern sports logistics. With 48 teams competing in 104 matches across three host nations and four time zones, the task of organizing this tournament was unprecedented. From the high-altitude opening in Mexico City to the coastal finale in New Jersey, every aspect of the calendar has been designed to maximize fan engagement while minimizing travel fatigue for the athletes.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">A Revolutionary Format: 104 Matches over 39 Days</h3>
         <p className="text-lg leading-relaxed">
            Originally proposed as 80 matches with three-team groups, FIFA pivoted to a 104-match format featuring four-team groups. This decision ensures that every team plays at least three matches and preserves the integrity of the group stage finales, where simultaneous kick-offs prevent collusion. The 2026 schedule extends the tournament duration to 39 days, providing sufficient rest periods between matches—a critical factor for player welfare in a tournament of this scale.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Geographic Clustering and the Round of 32</h3>
         <p className="text-lg leading-relaxed">
            To minimize travel, FIFA has organized the schedule around geographic clusters. Teams will primarily play their group stage matches within specific regions—West, Central, or East. For example, a team assigned to the West cluster might play in Vancouver, Seattle, and San Francisco. This strategy is essential for fans traveling on a budget and for maintaining the peak physical condition of the players. The introduction of the Round of 32 means that the knockout stage is now longer and more perilous than ever, with no room for error from the very first post-group match.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Kick-off Times and Global Broadcasting</h3>
         <p className="text-lg leading-relaxed">
            The 2026 World Cup schedule must balance the needs of local fans with a global television audience. With matches taking place in four time zones (Pacific, Mountain, Central, and Eastern), kick-off times are being meticulously planned. Early afternoon starts in the East will cater to European audiences in the evening, while late matches in the West will capture the Asian market in their morning. This &quot;24-hour football cycle&quot; will make the 2026 World Cup the most-watched event in history.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Road to the Final: MetLife Stadium</h3>
         <p className="text-lg leading-relaxed">
            The tournament concludes on July 19, 2026, at MetLife Stadium in East Rutherford, New Jersey. The path to this final is a grueling test of endurance. A team reaching the final will have played eight matches—one more than in previous 32-team tournaments. This additional match adds a layer of depth to the tactical requirements of the squads, favoring those with the strongest benches and the best medical and recovery staff.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Cultural Milestones within the Calendar</h3>
         <p className="text-lg leading-relaxed">
            The schedule also respects the cultural milestones of the host nations. Matches held on July 4 in the USA or during Mexico&apos;s Independence Day celebrations will feature heightened security and a festive atmosphere. The opening match at the Estadio Azteca on June 11 is particularly significant, as it marks the stadium&apos;s record-breaking third time hosting a World Cup opening.
         </p>

         <p className="text-lg leading-relaxed font-bold text-white mt-12">
            Stay tuned to ActiveSports for real-time updates to the 2026 schedule, including confirmed kick-off times, broadcast partners, and venue-specific fan guides. The road to immortality begins on June 11, 2026.
         </p>
      </article>
    </div>
  );
}
