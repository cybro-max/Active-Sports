import { getLeaderboard } from '@/app/actions/leaderboard';
import { auth } from '@/auth';
import { Trophy, Medal, Star, Zap, Target, Crown, TrendingUp, Users, Award, ChevronRight, Flame, Swords } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const session = await auth();
  const { success, data: leaderboard = [] } = await getLeaderboard();

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Crown className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--warning)] to-transparent opacity-30" />
        </div>

        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Flame className="w-3 h-3 fill-current" /> Global Competition
          </div>

          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--warning)] to-[var(--brand)]">
              Rankings
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed max-w-2xl mx-auto">
            The ultimate hall of fame. Lock in your predictions, earn PRO Points for accuracy, and cement your legacy among the world&apos;s most skilled football forecasters.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/predictions" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
              Start Predicting <Target className="w-5 h-5" />
            </Link>
            <Link href="/prediction-battle" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
              <Zap className="w-5 h-5" /> Enter Battle
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[var(--border)] pt-8">
            {[
              { icon: Users, label: 'Total Players', value: '12,400+' },
              { icon: Trophy, label: 'PRO Points Awarded', value: '2.1M+' },
              { icon: Target, label: 'Predictions Made', value: '840K+' },
              { icon: TrendingUp, label: 'Top Accuracy', value: '78%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-[var(--warning)]" />
                </div>
                <div className="text-white font-black text-lg leading-none">{stat.value}</div>
                <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP 3 PODIUM ───────────────────────────────────────── */}
      {top3.length > 0 && (
        <section className="mb-16 fade-up">
          <div className="premium-heading mb-10 justify-center">
            <div className="heading-accent" />
            <h2>
              The <span className="text-[var(--warning)]">Podium</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {top3.map((user, index) => {
              const isCurrentUser = session?.user?.id === user.id;
              const heights = ['h-64', 'h-80', 'h-56'];
              const positions = ['2nd', '1st', '3rd'];
              const colors = ['text-gray-300', 'text-yellow-400', 'text-orange-400'];
              const bgColors = ['from-gray-400/10', 'from-yellow-400/15', 'from-orange-400/10'];

              return (
                <div
                  key={user.id}
                  className={`card p-6 text-center space-y-4 ${heights[index]} flex flex-col justify-between border-2 ${index === 1 ? 'border-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.1)]' : 'border-[var(--border)]'}`}
                >
                  <div className="space-y-3">
                    <div className={`text-4xl font-display font-black ${colors[index]}`}>
                      {positions[index]}
                    </div>
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-white overflow-hidden border-2 ${index === 1 ? 'border-yellow-400' : 'border-[var(--border)]'} shadow-lg bg-gradient-to-b ${bgColors[index]} to-transparent`}>
                      {user.image ? (
                        <Image src={user.image} alt={user.name} width={80} height={80} />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                        {user.name}
                        {isCurrentUser && (
                          <span className="text-[9px] px-2 py-0.5 bg-[var(--brand)] text-black rounded uppercase tracking-widest font-black">You</span>
                        )}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-medium">{user.streak} win streak</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="text-3xl font-display font-black text-white">{user.points}</div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1">PRO Points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── FULL LEADERBOARD TABLE ─────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Full <span className="text-[var(--brand)]">Standings</span>
          </h2>
        </div>

        <div className="card p-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)] rounded-[24px]">
          <div className="grid grid-cols-12 gap-4 p-6 bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Fan</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-right pr-4">Points</div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {leaderboard.length === 0 ? (
              <div className="p-16 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">No rankings yet. Be the first!</p>
                <Link href="/predictions" className="inline-flex items-center gap-2 mt-6 card px-6 py-3 bg-[var(--brand)] text-black font-black text-xs hover:scale-105 transition-all">
                  Make First Prediction <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              leaderboard.map((user, index) => {
                const isTop3 = index < 3;
                const isCurrentUser = session?.user?.id === user.id;

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 gap-4 p-5 items-center transition-all hover:bg-white/5 ${isCurrentUser ? 'bg-[var(--brand)]/10 border-l-4 border-[var(--brand)]' : ''}`}
                  >
                    <div className="col-span-2 flex justify-center">
                      {isTop3 ? (
                        <Medal className={`w-6 h-6 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />
                      ) : (
                        <span className="text-lg font-black text-[var(--text-muted)]">#{index + 1}</span>
                      )}
                    </div>

                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden shadow-lg">
                        {user.image ? (
                          <Image src={user.image} alt={user.name} width={40} height={40} />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <span className={`text-sm font-bold truncate ${isTop3 ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-[9px] px-2 py-0.5 bg-[var(--brand)] text-black rounded uppercase tracking-widest font-black">You</span>
                        )}
                      </span>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="text-xs font-black text-[var(--warning)] flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3" /> {user.streak}W
                      </span>
                    </div>

                    <div className="col-span-2 text-right pr-4">
                      <span className="text-sm font-black text-white tracking-widest">{user.points}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── RANKING SYSTEM ─────────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Ranking <span className="text-[var(--brand)]">System</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Target,
              title: 'Accuracy is Everything',
              body: 'The ActiveSports leaderboard is a pure meritocracy. Every prediction is scored based on accuracy — exact scores earn the most, correct results earn solid points, and incorrect calls earn nothing. There are no shortcuts, no participation trophies. Only those who truly understand football rise to the top.',
            },
            {
              icon: TrendingUp,
              title: 'Streak Multipliers',
              body: 'Consistency separates the elite from the casual. Chain together consecutive correct predictions to unlock powerful streak multipliers. A 5-game correct streak doubles your points. Reach 10 in a row and you enter triple-point territory. These multipliers can propel you from the mid-table to the podium in a single weekend.',
            },
            {
              icon: Award,
              title: 'Seasonal Resets & Championships',
              body: 'Each season brings a fresh start. While all-time rankings honor sustained excellence, seasonal championships ensure that newcomers always have a path to glory. Win a monthly championship and earn a permanent badge on your profile. Win the annual title and enter the ActiveSports Hall of Fame.',
            },
            {
              icon: Users,
              title: 'Community & Rivalries',
              body: 'Football is better with rivals. Follow friends, track their predictions, and compete in private leagues. The global leaderboard is the ultimate test, but private rivalries add personal stakes to every matchday. Bragging rights are earned, not given.',
            },
          ].map((item, i) => (
            <article key={i} className="card p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[var(--brand)]" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.body}</p>
            </article>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30 text-[var(--warning)] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Your Journey Starts Now
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.95]">
              Climb to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--warning)] to-[var(--brand)]">
                Top
              </span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Every prediction is a step toward greatness. The leaderboard is waiting. The question is — do you have what it takes to reach the summit?
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/predictions" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
                Start Predicting <Target className="w-5 h-5" />
              </Link>
              <Link href="/prediction-battle" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                <Swords className="w-5 h-5" /> Enter Battle
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

