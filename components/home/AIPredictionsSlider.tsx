'use client';

import { Sparkles, BrainCircuit, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const MOCK_INSIGHTS = [
  {
    id: 1,
    teams: { home: 'Arsenal', away: 'Man City', homeLogo: 'https://media.api-sports.io/football/teams/42.png', awayLogo: 'https://media.api-sports.io/football/teams/50.png' },
    probability: { home: 38, draw: 25, away: 37 },
    insight: "High-intensity tactical battle expected. Home advantage plays a key factor in this match-up.",
    tag: "MATCH OF THE WEEK"
  },
  {
    id: 2,
    teams: { home: 'Real Madrid', away: 'Barcelona', homeLogo: 'https://media.api-sports.io/football/teams/541.png', awayLogo: 'https://media.api-sports.io/football/teams/529.png' },
    probability: { home: 45, draw: 20, away: 35 },
    insight: "Clasico Intensity: Fast transitions are predicted to be the deciding factor for both sides.",
    tag: "EL CLASICO"
  },
  {
    id: 3,
    teams: { home: 'Liverpool', away: 'Chelsea', homeLogo: 'https://media.api-sports.io/football/teams/40.png', awayLogo: 'https://media.api-sports.io/football/teams/49.png' },
    probability: { home: 55, draw: 22, away: 23 },
    insight: "High press expected to dominate the midfield battle. Momentum favors the home side.",
    tag: "TACTICAL BATTLE"
  }
];

export default function AIPredictionsSlider() {
  return (
    <section className="fade-up fade-up-delay-2">
      <div className="snap-slider pb-4">
        {MOCK_INSIGHTS.map((match) => (
          <div key={match.id} className="snap-slide w-[340px] shrink-0">
            <div className="card p-6 bg-[var(--bg-surface)] border border-[var(--border)] group hover:border-[var(--brand)] transition-all h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] font-black px-2 py-1 bg-[var(--brand-dim)] text-[var(--brand)] rounded border border-[var(--brand)] uppercase tracking-tighter">
                  {match.tag}
                </span>
                <Sparkles className="w-4 h-4 text-[var(--warning)] animate-pulse" />
              </div>

              <div className="flex items-center justify-between mb-8 px-2">
                <div className="text-center group-hover:scale-110 transition-transform">
                  <Image src={match.teams.homeLogo} alt={match.teams.home} width={40} height={40} className="mx-auto mb-2 drop-shadow-lg" />
                  <p className="text-[10px] font-bold text-white uppercase">{match.teams.home}</p>
                </div>
                <div className="text-center">
                   <div className="text-xs font-black text-[var(--text-muted)] mb-1 italic">VS</div>
                   <div className="h-px w-8 bg-[var(--border)] mx-auto" />
                </div>
                <div className="text-center group-hover:scale-110 transition-transform">
                  <Image src={match.teams.awayLogo} alt={match.teams.away} width={40} height={40} className="mx-auto mb-2 drop-shadow-lg" />
                  <p className="text-[10px] font-bold text-white uppercase">{match.teams.away}</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${match.probability.home}%` }} />
                    <div className="h-full bg-[var(--text-muted)] opacity-20" style={{ width: `${match.probability.draw}%` }} />
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${match.probability.away}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                   <span className="text-[var(--brand)]">{match.probability.home}% Win</span>
                   <span className="text-[var(--text-muted)]">Draw</span>
                   <span className="text-[var(--accent)]">{match.probability.away}% Win</span>
                </div>
                
                <p className="text-xs text-[var(--text-muted)] leading-relaxed italic line-clamp-3 bg-[var(--bg-elevated)] p-3 rounded-lg border-l-2 border-[var(--brand)]">
                  &quot;{match.insight}&quot;
                </p>
              </div>

              <button className="mt-6 w-full py-3 bg-white/5 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl">
                 Join Prediction Battle <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
