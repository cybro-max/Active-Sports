import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Target, Shield, ArrowLeft, Star, Award } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Stats — Top Scorers & Team Records | ActiveSports',
  description: 'Comprehensive statistics for the 2026 FIFA World Cup. Top scorers, most assists, clean sheets, and team performance metrics in the 48-nation era.',
};

export default function WorldCupStatsPage() {
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
          <BarChart3 className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-4">Statistical Leaders</h1>
          <p className="text-lg text-[var(--text-muted)] mb-8">
            The numbers behind the glory. Tracking every goal, assist, and defensive masterclass across 104 tournament matches.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                <span className="text-sm font-medium">Real-time Data</span>
             </div>
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-medium">Golden Boot Race</span>
             </div>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
         {/* Top Scorers Placeholder */}
         <section className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-[var(--danger)]" /> Top Scorers</h2>
            <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--text-muted)]">#{i}</span>
                        <div>
                           <p className="text-sm font-bold text-white opacity-40">TBD Player</p>
                           <p className="text-[10px] text-[var(--text-muted)]">TBD Nation</p>
                        </div>
                     </div>
                     <span className="text-xl font-black text-[var(--warning)]">0</span>
                  </div>
               ))}
            </div>
         </section>

         {/* Most Assists Placeholder */}
         <section className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-[var(--brand)]" /> Most Assists</h2>
            <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--text-muted)]">#{i}</span>
                        <div>
                           <p className="text-sm font-bold text-white opacity-40">TBD Player</p>
                           <p className="text-[10px] text-[var(--text-muted)]">TBD Nation</p>
                        </div>
                     </div>
                     <span className="text-xl font-black text-[var(--brand)]">0</span>
                  </div>
               ))}
            </div>
         </section>

         {/* Clean Sheets Placeholder */}
         <section className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-[var(--success)]" /> Clean Sheets</h2>
            <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--text-muted)]">#{i}</span>
                        <div>
                           <p className="text-sm font-bold text-white opacity-40">TBD Keeper</p>
                           <p className="text-[10px] text-[var(--text-muted)]">TBD Nation</p>
                        </div>
                     </div>
                     <span className="text-xl font-black text-[var(--success)]">0</span>
                  </div>
               ))}
            </div>
         </section>
      </div>

      {/* SEO Content Section */}
      <article className="prose prose-invert max-w-4xl mx-auto text-[var(--text-muted)] space-y-12 pb-20">
         <h2 className="text-4xl font-display font-black text-white">The Power of Performance: Analyzing 2026 World Cup Statistics</h2>
         
         <p className="text-xl leading-relaxed">
            In the modern era of football, statistics are the backbone of analysis. The 2026 FIFA World Cup, with its expanded format, will generate more data points than any sporting event in history. From expected goals (xG) and pass completion rates to high-intensity sprints and defensive recoveries, the numbers provide a deeper understanding of why certain nations succeed while others falter.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Golden Boot Race: A Test of Endurance</h3>
         <p className="text-lg leading-relaxed">
            The race for the Golden Boot (the tournament&apos;s top scorer) takes on a new dimension with 104 matches. A player reaching the final will play eight games, providing more opportunities to break the all-time single-tournament scoring record (currently held by Just Fontaine with 13 goals in 1958). However, the expanded format also means facing a wider variety of defensive systems, requiring strikers to be more clinical and adaptable than ever before.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Advanced Metrics: Beyond Goals and Assists</h3>
         <p className="text-lg leading-relaxed">
            While goals win matches, advanced metrics reveal the &quot;invisible&quot; work that makes victory possible. We track metrics like &quot;Progressive Carries,&quot; which measure a player&apos;s ability to move the ball into attacking zones, and &quot;Successful Pressures,&quot; which highlight the defensive intensity of modern high-pressing systems. In 2026, we expect to see a surge in the importance of &quot;Second-Assist&quot; data—the pass that leads to the assist—illustrating the creative depth of the world&apos;s top midfields.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Team Efficiency: The Art of the Counter-Attack</h3>
         <p className="text-lg leading-relaxed">
            Team statistics often highlight tactical trends. We analyze metrics such as &quot;Direct Speed,&quot; which measures how quickly a team moves the ball forward during a transition. Emerging nations often rely on clinical counter-attacking efficiency, while traditional powerhouses focus on &quot;Possession Value,&quot; ensuring that every minute on the ball translates into a scoring threat. The 2026 World Cup will be a clash of these two statistical philosophies.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Goalkeeping Excellence: The Golden Glove</h3>
         <p className="text-lg leading-relaxed">
            The Golden Glove award is given to the tournament&apos;s best goalkeeper, often determined by the number of clean-sheets. However, modern analysis also looks at &quot;Goals Prevented&quot;—a metric based on the quality of shots faced. A goalkeeper in a less-favored nation might win the Golden Glove by making a high volume of difficult saves, even if they concede more goals than a keeper behind a world-class defense. 
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Physical Data: The 104-Match Marathon</h3>
         <p className="text-lg leading-relaxed">
            The 2026 schedule puts a premium on physical recovery. Stats like &quot;Total Distance Covered&quot; and &quot;Number of Sprints&quot; are monitored by sports scientists to manage player load. Teams that can maintain high physical output in the final 15 minutes of matches are statistically more likely to find late winners, especially in the high-stakes environment of the knockout stages.
         </p>

         <p className="text-lg leading-relaxed italic bg-[var(--bg-subtle)] p-6 rounded-[15px] border border-[var(--border)]">
            ActiveSports is committed to providing the most detailed statistical breakdown of the 2026 FIFA World Cup. Our data is sourced from official FIFA partners and enhanced by our proprietary analysis models to give you the most accurate picture of the tournament&apos;s performers.
         </p>
      </article>
    </div>
  );
}
