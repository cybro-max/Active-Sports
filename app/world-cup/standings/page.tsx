import Link from 'next/link';
import { LayoutGrid, Trophy, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Standings — Groups A to L | ActiveSports',
  description: 'Track the live standings for all 12 groups in the 2026 FIFA World Cup. Real-time updates on points, goal difference, and qualification status for the Round of 32.',
};

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function WorldCupStandingsPage() {
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
          <LayoutGrid className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-4">Group Standings</h1>
          <p className="text-lg text-[var(--text-muted)] mb-8">
            Live points, goal differences, and qualification tracking for the 48 nations competing for the ultimate prize.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-medium">12 Groups of 4</span>
             </div>
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Info className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-sm font-medium">Top 2 + 8 Best 3rds Advance</span>
             </div>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
         {GROUPS.map(g => (
            <div key={g} className="card p-5 border border-[var(--border)] bg-[var(--bg-surface)]">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                  <h3 className="text-xl font-black text-white font-display">Group {g}</h3>
                  <Link href={`/world-cup/schedule?group=${g}`} className="text-[10px] uppercase font-bold text-[var(--brand)] hover:underline">View Matches</Link>
               </div>
               <div className="space-y-2">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="w-4 text-xs font-bold text-[var(--text-muted)]">{i}</span>
                           <div className="w-6 h-4 bg-[var(--bg-elevated)] rounded border border-[var(--border)]" />
                           <span className="font-medium text-white opacity-40 italic">TBD Nation</span>
                        </div>
                        <div className="flex items-center gap-4 text-[var(--text-muted)] font-mono text-xs">
                           <span className="w-4 text-center">0</span>
                           <span className="w-4 text-center font-bold text-white">0</span>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                     <span className="text-[9px] text-[var(--text-muted)]">Qualifying Zone</span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* SEO Content Section */}
      <article className="prose prose-invert max-w-4xl mx-auto text-[var(--text-muted)] space-y-12 pb-20">
         <h2 className="text-4xl font-display font-black text-white">Understanding the 2026 World Cup Qualification Matrix</h2>
         
         <p className="text-xl leading-relaxed">
            The expansion to 48 teams has necessitated a significant change to the group stage standings and qualification rules. In the 2026 FIFA World Cup, nations are divided into 12 groups of four teams each. This return to the four-team group format (after a brief proposal for three-team groups) preserves the excitement of the final matchday and ensures a fair path to the Round of 32.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">How Teams Advance: The Math of the Round of 32</h3>
         <p className="text-lg leading-relaxed">
            The qualification process is straightforward yet competitive. The top two teams from each of the 12 groups automatically advance to the Round of 32. This accounts for 24 teams. To fill the remaining eight spots, the eight best-ranked third-placed teams from across all 12 groups will also progress. This means that even a third-place finish can lead to a knockout spot, keeping hope alive for teams until the very last whistle of the group stage.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Tie-Breaking Criteria: Every Goal Matters</h3>
         <p className="text-lg leading-relaxed">
            In the event of teams being level on points at the end of the group stage, FIFA employs a strict set of tie-breaking criteria. The first tie-breaker is total goal difference across all group matches, followed by the total number of goals scored. If teams are still level, their head-to-head record is considered. Finally, fair play points (based on yellow and red cards) and, as a last resort, a drawing of lots will determine the standing. This hierarchy emphasizes attacking football and disciplined play.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Advantage of Winning the Group</h3>
         <p className="text-lg leading-relaxed">
            While finishing second or even third might be enough to advance, winning the group provides a significant tactical advantage. Group winners are typically paired with second or third-place teams from other groups in the Round of 32, potentially offering a &quot;path of least resistance&quot; towards the quarter-finals. Furthermore, group winners often benefit from more favorable travel schedules and longer recovery times between matches.
         </p>

         <h3 className="text-2xl font-bold text-white mt-12 mb-4">Group Stage Dynamics: The Power of the Fourth Team</h3>
         <p className="text-lg leading-relaxed">
            With four teams per group, every match is a high-stakes encounter. The opening match sets the tone, the second match often determines survival, and the final match is the ultimate decider. The 2026 standings will be updated in real-time on ActiveSports, allowing fans to track &quot;as-it-stands&quot; scenarios during simultaneous kick-offs. The drama of the group stage remains the heart of the World Cup experience.
         </p>

         <div className="bg-[var(--bg-elevated)] p-8 rounded-[15px] border border-[var(--border)] not-prose mt-16 flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-[var(--brand)] shrink-0 mt-1" />
            <div>
               <h4 className="text-lg font-bold text-white mb-2">Qualification FAQ</h4>
               <ul className="space-y-3 text-sm">
                  <li>
                     <span className="font-bold text-[var(--brand)]">Q: How many teams advance from each group?</span><br/>
                     <span className="text-[var(--text-muted)]">A: The top 2 teams advance directly. The 8 best 3rd-place teams also advance.</span>
                  </li>
                  <li>
                     <span className="font-bold text-[var(--brand)]">Q: What is the first tie-breaker?</span><br/>
                     <span className="text-[var(--text-muted)]">A: Total goal difference in all group matches is the primary tie-breaker.</span>
                  </li>
                  <li>
                     <span className="font-bold text-[var(--brand)]">Q: Does fair play affect standings?</span><br/>
                     <span className="text-[var(--text-muted)]">A: Yes, fair play points are used as the 7th tie-breaking criteria.</span>
                  </li>
               </ul>
            </div>
         </div>
      </article>
    </div>
  );
}
