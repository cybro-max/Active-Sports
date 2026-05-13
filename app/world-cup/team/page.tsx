import Image from 'next/image';
import Link from 'next/link';
import { Globe, Trophy, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import WorldCupNav from '@/components/WorldCupNav';
import type { Metadata } from 'next';
import { toSlug } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Teams — 48 Nations',
  description: 'Explore the 48 nations competing in the 2026 FIFA World Cup. Team profiles, tactical analysis, and road to qualification for USA, Mexico, Canada, and more.',
};

const TEAMS = [
  { name: 'USA', flag: '🇺🇸', rank: 13, group: 'A', status: 'Qualified (Host)' },
  { name: 'Mexico', flag: '🇲🇽', rank: 15, group: 'A', status: 'Qualified (Host)' },
  { name: 'Canada', flag: '🇨🇦', rank: 49, group: 'A', status: 'Qualified (Host)' },
  { name: 'Argentina', flag: '🇦🇷', rank: 1, group: 'B', status: 'Defending Champions' },
  { name: 'France', flag: '🇫🇷', rank: 2, group: 'B', status: 'Top Contender' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rank: 4, group: 'C', status: 'Top Contender' },
  { name: 'Brazil', flag: '🇧🇷', rank: 5, group: 'C', status: 'Top Contender' },
  { name: 'Belgium', flag: '🇧🇪', rank: 3, group: 'D', status: 'Qualified' },
  { name: 'Portugal', flag: '🇵🇹', rank: 6, group: 'D', status: 'Qualified' },
  { name: 'Netherlands', flag: '🇳🇱', rank: 7, group: 'E', status: 'Qualified' },
  { name: 'Spain', flag: '🇪🇸', rank: 8, group: 'E', status: 'Qualified' },
  { name: 'Italy', flag: '🇮🇹', rank: 9, group: 'F', status: 'Qualified' },
  { name: 'Croatia', flag: '🇭🇷', rank: 10, group: 'F', status: 'Qualified' },
  { name: 'Germany', flag: '🇩🇪', rank: 16, group: 'G', status: 'Qualified' },
  { name: 'Morocco', flag: '🇲🇦', rank: 12, group: 'G', status: 'Qualified' },
  { name: 'Uruguay', flag: '🇺🇾', rank: 11, group: 'H', status: 'Qualified' },
  { name: 'Japan', flag: '🇯🇵', rank: 18, group: 'H', status: 'Qualified' },
  { name: 'South Korea', flag: '🇰🇷', rank: 23, group: 'I', status: 'Qualified' },
  { name: 'Australia', flag: '🇦🇺', rank: 24, group: 'I', status: 'Qualified' },
  { name: 'Senegal', flag: '🇸🇳', rank: 17, group: 'J', status: 'Qualified' },
  { name: 'Nigeria', flag: '🇳🇬', rank: 30, group: 'J', status: 'Qualified' },
  { name: 'Switzerland', flag: '🇨🇭', rank: 19, group: 'K', status: 'Qualified' },
  { name: 'Denmark', flag: '🇩🇰', rank: 21, group: 'K', status: 'Qualified' },
  { name: 'Colombia', flag: '🇨🇴', rank: 14, group: 'L', status: 'Qualified' },
];

export default function TeamsPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="card p-10 mb-10 bg-gradient-to-br from-[var(--bg-elevated)] to-black border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white mb-4">The 48 Nations</h1>
          <p className="text-lg text-[var(--text-muted)] mb-8">
            Explore the tactical identities, historical legacies, and squad profiles of every nation competing in the largest FIFA World Cup in history.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                <span className="text-sm font-medium">104 Matches Total</span>
             </div>
             <div className="bg-[var(--bg-subtle)] px-4 py-2 rounded-full border border-[var(--border)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-medium">48 Participating Teams</span>
             </div>
          </div>
        </div>
      </div>

      <WorldCupNav />

      {/* Team Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-display">Participating Teams</h2>
          <div className="relative max-w-xs w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search nations..." 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAMS.map((t) => (
            <Link 
              key={t.name}
              href={`/world-cup/team/${toSlug(t.name)}`}
              className="card p-5 group hover:bg-[var(--bg-hover)] transition-all border border-[var(--border)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-6xl">{t.flag}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{t.flag}</div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-[var(--brand)] transition-colors">{t.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">FIFA Rank: #{t.rank}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-[var(--border)]">
                <span className="font-medium text-[var(--text-muted)]">Group {t.group}</span>
                <span className="text-[var(--accent)] font-semibold">{t.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO Content Section */}
      <article className="mt-24 prose prose-invert max-w-4xl mx-auto space-y-12 pb-20 text-[var(--text-muted)]">
        <h2 className="text-4xl font-display font-black text-white">The Road to 48: Global Representation Redefined</h2>
        
        <p className="text-lg leading-relaxed">
          The 2026 FIFA World Cup marks a revolutionary expansion in the tournament&apos;s history, increasing the field from 32 to 48 nations. This change isn&apos;t just about more matches; it&apos;s about global inclusion. By opening the doors to 16 additional countries, FIFA has ensured that every continent has a stronger voice and a better chance at immortality. For nations across Africa, Asia, and the Americas, the &quot;Road to 2026&quot; has become a symbol of hope and progress.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Allocation of Slots by Confederation</h3>
        <p className="text-lg leading-relaxed">
          The allocation of slots for the 48-team tournament has been redesigned to favor broader participation. Here is how the slots are distributed across the six continental confederations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          {[
            { conf: 'AFC (Asia)', slots: '8.5 Slots', desc: 'A massive boost for Asian football, doubling their previous representation.' },
            { conf: 'CAF (Africa)', slots: '9.5 Slots', desc: 'Africa finally receives the representation its talent deserves with 9 direct spots.' },
            { conf: 'CONCACAF (North America)', slots: '6.5 Slots', desc: 'Including the 3 hosts, ensuring a strong presence for the home continent.' },
            { conf: 'CONMEBOL (South America)', slots: '6.5 Slots', desc: 'The most competitive region now sees over 60% of its members qualify.' },
            { conf: 'OFC (Oceania)', slots: '1.5 Slots', desc: 'Guaranteed representation for the first time in tournament history.' },
            { conf: 'UEFA (Europe)', slots: '16 Slots', desc: 'The traditional powerhouse remains strong with 16 guaranteed places.' },
          ].map(c => (
            <div key={c.conf} className="card p-5 bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="font-bold text-white mb-1">{c.conf}</div>
              <div className="text-[var(--brand)] font-display font-black text-xl mb-2">{c.slots}</div>
              <div className="text-xs leading-relaxed text-[var(--text-muted)]">{c.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Tactical Trends in the 48-Team Era</h3>
        <p className="text-lg leading-relaxed">
          With more teams comes a greater variety of tactical philosophies. We expect to see a clash of styles like never before. The high-pressing systems favored by European heavyweights will meet the creative, flair-driven play of South American giants and the disciplined, counter-attacking mastery of emerging Asian and African nations. 
        </p>
        <p className="text-lg leading-relaxed">
          The 48-team format also changes the group stage dynamics. With three teams per group (as originally proposed, though later reverted to four per group), every single goal becomes critical. Teams can no longer afford &quot;slow starts.&quot; The intensity will be dialed to 100% from the opening whistle in Mexico City to the final match in New Jersey.
        </p>

        <h3 className="text-2xl font-bold text-white mt-12 mb-4">Historical Legacies: Past Meets Present</h3>
        <p className="text-lg leading-relaxed">
          While the expansion welcomes newcomers, the tournament remains anchored by its giants. Argentina, the defending champions, look to solidify their dynasty. Brazil aims to reclaim their crown and end their decades-long drought. France, under a new generation of superstars, seeks to become the most successful team of the modern era. Meanwhile, the hosts—USA, Mexico, and Canada—are looking to leverage home-field advantage to pull off the greatest upsets in sporting history.
        </p>
      </article>
    </div>
  );
}
