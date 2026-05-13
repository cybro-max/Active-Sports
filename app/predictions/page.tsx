import { auth } from '@/auth';
import PredictionClient from '@/components/predictions/PredictionClient';
import { Metadata } from 'next';
import { getTodayFixtures } from '@/lib/apifootball';
import Link from 'next/link';
import { Zap, Target, Trophy, ChevronRight, Users, BarChart3, Brain, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prediction Battles | ActiveSports',
  description: 'Predict match outcomes, enter the leaderboard, and win PRO Points.',
  openGraph: {
    title: 'Prediction Battles | ActiveSports',
    description: 'Go head-to-head with the global community. Predict scores and climb the leaderboard.',
  },
};

const predictionStats = [
  { icon: Users, label: 'Active Predictors', value: '12,400+' },
  { icon: Target, label: 'Matches Today', value: '50+' },
  { icon: Trophy, label: 'PRO Points Pool', value: '500+' },
  { icon: BarChart3, label: 'Accuracy Rate', value: '34%' },
];

interface Props {
  searchParams?: Promise<{ tz?: string }>;
}

export default async function PredictionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tz = sp?.tz;
  const session = await auth();
  const fixtures = await getTodayFixtures(tz);
  const featuredMatch = fixtures.find(f => f.league.id === 39 || f.league.id === 2) || fixtures[0];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Target className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>

        <div className="relative z-10 p-8 sm:p-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3 fill-current" /> Compete. Predict. Win.
              </div>

              <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
                Prediction <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
                  Battles
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed max-w-xl">
                Go head-to-head with football fans worldwide. Predict match scores, earn PRO Points for accuracy, and climb the global rankings to prove you are the ultimate football oracle.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="#predict-now" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                  Start Predicting <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/leaderboard" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                  <Trophy className="w-5 h-5" /> View Rankings
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[var(--border)] pt-8">
                {predictionStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-[var(--brand)]" />
                    </div>
                    <div>
                      <div className="text-white font-black text-lg leading-none">{stat.value}</div>
                      <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="card p-8 w-80 space-y-6 -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Leaderboard</span>
                  <Star className="w-4 h-4 text-[var(--warning)]" />
                </div>
                {[
                  { name: 'Alex M.', points: '2,450', streak: '8W' },
                  { name: 'Sarah K.', points: '2,310', streak: '5W' },
                  { name: 'James R.', points: '2,180', streak: '3W' },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{user.streak} streak</p>
                    </div>
                    <span className="text-sm font-black text-[var(--brand)]">{user.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREDICTION INTERFACE ───────────────────────────────── */}
      <section id="predict-now" className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Tonight&apos;s <span className="text-[var(--brand)]">Featured Battle</span>
          </h2>
        </div>
        <PredictionClient isLoggedIn={!!session?.user} featuredMatch={featuredMatch} />
      </section>

      {/* ── HOW PREDICTIONS WORK ───────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            How It <span className="text-[var(--brand)]">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Pick Your Match',
              desc: 'Browse today\'s fixtures across all major leagues. We automatically feature the biggest clash of the day, but you can predict on any match you follow closely.',
            },
            {
              step: '02',
              title: 'Lock In Your Score',
              desc: 'Enter your predicted final score before kick-off. The closer your prediction to the actual result, the more PRO Points you earn. Exact scores earn massive bonuses.',
            },
            {
              step: '03',
              title: 'Climb the Ranks',
              desc: 'Accumulate points across the season. Maintain winning streaks for multiplier bonuses. Finish in the top tiers to earn exclusive badges and bragging rights.',
            },
          ].map((item, i) => (
            <div key={i} className="card p-8 space-y-6 group">
              <div className="flex items-center justify-between">
                <span className="text-5xl font-display font-black text-white/5 group-hover:text-[var(--brand)]/10 transition-colors">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[var(--brand)]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCORING SYSTEM ─────────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Scoring <span className="text-[var(--brand)]">System</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Exact Score Prediction',
              points: '100 PRO',
              desc: 'Nail the exact final scoreline and earn the maximum reward. This is the holy grail of prediction accuracy — difficult to achieve but massively rewarding when it happens.',
              color: 'var(--success)',
            },
            {
              title: 'Correct Result + Goal Difference',
              points: '75 PRO',
              desc: 'Predict the correct winner and the exact margin of victory. For example, predicting 2-0 when the actual result is 3-1. Shows deep understanding of team dynamics.',
              color: 'var(--brand)',
            },
            {
              title: 'Correct Result Only',
              points: '50 PRO',
              desc: 'Simply pick the right winner (or draw). Even if the score is off, reading the match outcome correctly still earns solid points and keeps your streak alive.',
              color: 'var(--warning)',
            },
            {
              title: 'Streak Multipliers',
              points: 'Up to 3x',
              desc: 'Chain consecutive correct predictions to unlock multiplier bonuses. A 5-game streak doubles your points. A 10-game streak triples them. Consistency is king.',
              color: 'var(--accent)',
            },
          ].map((item, i) => (
            <div key={i} className="card p-8 flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                <span className="text-lg font-black" style={{ color: item.color }}>{item.points}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-[var(--text-body)] leading-[1.7] text-[15px]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="fade-up">
        <div className="relative rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden p-10 sm:p-16 text-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy className="w-64 h-64 -mr-10 -mt-10 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)] text-[var(--accent)] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Join the Elite
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.95]">
              Think You Know <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
                Football?
              </span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Thousands of fans are already competing. Sign in, make your first prediction, and start your journey to the top of the global leaderboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/prediction-battle" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                Enter Battle Mode <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/leaderboard" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                <Trophy className="w-5 h-5" /> View Rankings
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
