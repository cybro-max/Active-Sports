'use client';

import { Trophy, TrendingUp, Users, HeartHandshake, Smile, ArrowRight } from 'lucide-react';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useSession } from 'next-auth/react';
import { Fixture } from '@/lib/apifootball';
import { useRouter } from 'next/navigation';

interface EngagementGridProps {
  featuredMatch?: Fixture;
}

export default function EngagementGrid({ featuredMatch }: EngagementGridProps) {
  const { openAuthModal } = useAuthModal();
  const { data: session } = useSession();
  const router = useRouter();

  // Eventually we'll fetch these from Prisma, but for now we'll dynamically
  // render the structure that will be populated by DB data.
  const leaderboards = [
    { name: 'SakaFan99', streak: 12, rank: 1, color: 'text-yellow-500' },
    { name: 'Kloppite', streak: 8, rank: 2, color: 'text-gray-400' },
    { name: 'BlueMoon', streak: 7, rank: 3, color: 'text-orange-500' },
  ];

  const matchTitle = featuredMatch 
    ? `${featuredMatch.teams.home.name} vs ${featuredMatch.teams.away.name}` 
    : 'Match Reaction Hub';

  const referralCode = session?.user?.id 
    ? `ACT-${session.user.id.substring(0,6).toUpperCase()}`
    : 'ACT-JOIN-NOW';

  const handleRestrictedAction = (callback?: () => void) => {
    if (!session) {
      openAuthModal();
    } else if (callback) {
      callback();
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-up">
      {/* Prediction Streak */}
      <div className="card p-8 border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)] opacity-[0.03] blur-[40px] pointer-events-none group-hover:opacity-10 transition-opacity" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="p-3 rounded-2xl bg-[var(--brand-dim)] text-[var(--brand)]">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Prediction Streaks</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-6 relative z-10">Top 1% Predictors</h3>
        
        <div className="space-y-4 flex-1 relative z-10">
          {leaderboards.map((user) => (
            <div key={user.name} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] group/item hover:border-[var(--brand)] transition-all">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-black ${user.color}`}>#{user.rank}</span>
                <span className="text-sm font-bold text-white">{user.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-[var(--brand)]">{user.streak}W STREAK</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => handleRestrictedAction(() => router.push('/predictions'))}
          className="mt-8 w-full py-3 bg-[var(--brand)] text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all relative z-10"
        >
          Join Battle & Win Badges
        </button>
      </div>

      {/* Live Reactions */}
      <div className="card p-8 border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] blur-[40px] pointer-events-none group-hover:opacity-10 transition-opacity" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="p-3 rounded-2xl bg-[var(--accent-dim)] text-[var(--accent)]">
            <Smile className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Live Fan Sentiment</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 truncate relative z-10" title={matchTitle}>
          {matchTitle}
        </h3>

        <div className="flex flex-wrap gap-3 mb-8 relative z-10">
          {['🔥 4.2k', '😭 1.1k', '🤡 850', 'GOAT 3.1k', 'VAR 🚮 2.2k'].map(emoji => (
            <button 
              key={emoji} 
              onClick={() => handleRestrictedAction()}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-bold text-white hover:bg-white/10 hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex-1 relative z-10">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]" />
              <div className="flex-1">
                 <div className="h-2 w-24 bg-white/10 rounded mb-1" />
                 <div className="h-2 w-full bg-white/5 rounded" />
              </div>
           </div>
           <p className="text-[11px] text-[var(--text-muted)] italic">Join 12,400+ fans in the live chat rooms during big matches.</p>
        </div>

        <button 
          onClick={() => handleRestrictedAction(() => router.push(featuredMatch ? `/match/${featuredMatch.fixture.id}/reactions` : '/predictions'))}
          className="mt-8 w-full py-3 bg-white/5 border border-[var(--border)] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all relative z-10 flex items-center justify-center gap-2"
        >
           Open Reaction Hub <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Referral / Rewards */}
      <div className="card p-8 border border-[var(--border)] bg-[var(--bg-surface)] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-[0.03] blur-[40px] pointer-events-none group-hover:opacity-10 transition-opacity" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Viral Referral</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 relative z-10">Invite Your Squad</h3>
        <p className="text-sm text-[var(--text-muted)] mb-8 relative z-10">Get Premium badges & leaderboard boosts for every friend who joins.</p>

        <div className="relative p-6 rounded-2xl bg-black border border-[var(--border-strong)] mb-6 flex-1 overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <HeartHandshake className="w-20 h-20 text-purple-400" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter mb-1">Your Referral Code</p>
              {session ? (
                <p className="text-2xl font-black text-white tracking-widest">{referralCode}</p>
              ) : (
                <div 
                  onClick={() => openAuthModal()}
                  className="text-2xl font-black text-white/20 tracking-widest blur-sm cursor-pointer hover:blur-none transition-all"
                  title="Click to reveal"
                >
                  {referralCode}
                </div>
              )}
           </div>
        </div>

        <div className="flex items-center gap-2 mb-6 relative z-10">
           <div className="flex -space-x-2">
              {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800" />)}
           </div>
           <span className="text-[10px] font-bold text-[var(--text-muted)]">+ 12 friends joined this week</span>
        </div>

        <button 
          onClick={() => handleRestrictedAction()}
          className="w-full py-4 bg-white/5 border border-[var(--border)] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 relative z-10"
        >
           Share Link <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
