'use client';

import { useState } from 'react';
import { Flame, Share2, MessageSquare, Quote, RefreshCw } from 'lucide-react';
import { getAIMatchRoast } from '@/app/actions/ai';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useSession } from 'next-auth/react';
import { Fixture } from '@/lib/apifootball';

interface AIMatchRoastProps {
  featuredMatch?: Fixture;
}

export default function AIMatchRoast({ featuredMatch }: AIMatchRoastProps) {
  const { openAuthModal } = useAuthModal();
  const { data: session } = useSession();
  
  const matchData = featuredMatch ? {
    home: featuredMatch.teams.home.name,
    away: featuredMatch.teams.away.name,
    score: `${featuredMatch.goals.home ?? 0} - ${featuredMatch.goals.away ?? 0}`
  } : {
    home: 'Manchester United',
    away: 'Liverpool',
    score: '0 - 4'
  };

  const [roastText, setRoastText] = useState(`${matchData.home} defended like traffic cones tonight. Truly a masterclass in social distancing from success.`);
  const [loading, setLoading] = useState(false);

  async function refreshRoast() {
    if (!session) {
      openAuthModal();
      return;
    }

    setLoading(true);
    try {
      const newRoast = await getAIMatchRoast(matchData.home, matchData.away, matchData.score);
      setRoastText(newRoast);
    } catch (error) {
      console.error("Failed to fetch roast:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRestrictedAction = () => {
    if (!session) openAuthModal();
  };

  return (
    <section className="fade-up fade-up-delay-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)]">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-2xl font-display font-black text-white">The Daily Roast</h2>
          <span className="text-[10px] font-black px-2 py-0.5 bg-[var(--danger)] text-white rounded uppercase tracking-tighter">
            SAVAGE MODE
          </span>
        </div>
        <button 
          onClick={refreshRoast}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Regenerate Roast
        </button>
      </div>

      <div className="card relative overflow-hidden p-8 sm:p-12 border border-[var(--danger)]/20 bg-gradient-to-br from-[#1a0a0a] via-black to-black shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <Quote className="absolute top-8 right-8 w-24 h-24 text-[var(--danger)]/5 rotate-12" />

        <div className="max-w-2xl relative z-10">
          <p className="text-xs font-bold text-[var(--danger)] uppercase tracking-widest mb-4 flex items-center gap-2">
            Match Recap: {matchData.home} {matchData.score} {matchData.away}
          </p>
          
          <h3 className="text-2xl sm:text-4xl font-display font-black text-white mb-8 leading-tight min-h-[3em]">
            {loading ? (
              <span className="opacity-20 animate-pulse">Sharpening the knives...</span>
            ) : (
              `"${roastText}"`
            )}
          </h3>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={handleRestrictedAction} className="btn-primary bg-[var(--danger)] hover:bg-red-600 text-white border-none px-6 py-3 flex items-center gap-2 text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <Share2 className="w-4 h-4" /> Share to Reels / TikTok
            </button>
            <button onClick={handleRestrictedAction} className="px-6 py-3 rounded-xl border border-[var(--border)] bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> View Fan Reactions
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-t border-white/5 pt-6">
           <span>{loading ? '...' : '4.2k'} Shares</span>
           <span className="w-1 h-1 rounded-full bg-[var(--danger)]" />
           <span>Trending in Football</span>
        </div>
      </div>
    </section>
  );
}
