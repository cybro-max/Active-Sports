import { getTodayFixtures } from '@/lib/apifootball';
import { DEFAULT_TIMEZONE, TZ_COOKIE_NAME, formatMatchTime } from '@/lib/utils';
import PredictionWidget from '@/components/PredictionWidget';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Swords, Trophy, Users, TrendingUp, Zap, Target, ChevronRight, Star, Shield, Flame, Crown } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Tonight\'s Featured Battle | ActiveSports',
  description: 'Enter the ultimate clash, predict the score and earn PRO points.',
  openGraph: {
    title: 'Tonight\'s Featured Battle | ActiveSports',
    description: 'The biggest match of the day. Predict the score and compete globally.',
  },
};

const battleStats = [
  { icon: Users, label: 'Fans Entered', value: '12,402+' },
  { icon: Trophy, label: 'PRO Points', value: '500' },
  { icon: Flame, label: 'Battle Heat', value: 'Hot' },
  { icon: Crown, label: 'Top Streak', value: '12W' },
];

interface Props {
  searchParams?: Promise<{ tz?: string }>;
}

export default async function PredictionBattlePage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const tz = sp?.tz || cookieStore.get(TZ_COOKIE_NAME)?.value || DEFAULT_TIMEZONE;
  const fixtures = await getTodayFixtures(tz);
  const battleMatch = fixtures.find(f => [39, 140, 61, 78, 135].includes(f.league.id)) || fixtures[0];

  if (!battleMatch) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-0 pb-20">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center card">
          <Swords className="w-16 h-16 text-[var(--text-muted)] mb-4" />
          <h1 className="text-2xl font-black text-white">No Battles Today</h1>
          <p className="text-[var(--text-muted)]">Check back tomorrow for the next big clash.</p>
          <Link href="/" className="btn-primary mt-6">Go Home</Link>
        </div>
      </div>
    );
  }

  const session = await auth();
  const existingPrediction = session?.user?.id ? await prisma.prediction.findUnique({
    where: { userId_fixtureId: { userId: session.user.id, fixtureId: battleMatch.fixture.id } }
  }) : null;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Swords className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--danger)] to-transparent opacity-30" />
        </div>

        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Flame className="w-3 h-3 fill-current" /> Tonight&apos;s Main Event
          </div>

          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            The <span className="text-[var(--danger)]">Ultimate</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Clash
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed max-w-2xl mx-auto">
            The biggest match of the day deserves your best prediction. Enter the battle, lock in your score, and compete against thousands of fans worldwide for PRO Points and glory.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#battle-arena" className="card px-8 py-4 bg-[var(--danger)] text-white font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,61,87,0.3)]">
              Enter Arena <Swords className="w-5 h-5" />
            </Link>
            <Link href="/leaderboard" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
              <Trophy className="w-5 h-5" /> View Rankings
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[var(--border)] pt-8">
            {battleStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-[var(--danger)]" />
                </div>
                <div className="text-white font-black text-lg leading-none">{stat.value}</div>
                <div className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BATTLE CARD ────────────────────────────────────────── */}
      <section id="battle-arena" className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Battle <span className="text-[var(--danger)]">Arena</span>
          </h2>
        </div>

        <div className="card p-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--brand-dim)_0%,_transparent_70%)] opacity-20 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-12 relative z-10">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-6 text-center flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[var(--brand)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <Image src={battleMatch.teams.home.logo} alt={battleMatch.teams.home.name} width={140} height={140} className="relative z-10 drop-shadow-2xl" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{battleMatch.teams.home.name}</h2>
                <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Home</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-7xl font-display font-black text-white/10 italic">VS</div>
                <div className="px-4 py-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] shadow-inner">
                  <div className="text-sm font-black text-[var(--text-muted)]">
                    {formatMatchTime(battleMatch.fixture.date, tz)}
                  </div>
                </div>
                <span className="text-[10px] font-black text-[var(--danger)] uppercase tracking-widest flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {battleMatch.league.name}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-6 text-center flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <Image src={battleMatch.teams.away.logo} alt={battleMatch.teams.away.name} width={140} height={140} className="relative z-10 drop-shadow-2xl" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{battleMatch.teams.away.name}</h2>
                <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Away</span>
              </div>
            </div>
          </div>

          {/* Prediction Interface */}
          <div className="border-t border-[var(--border)] bg-black/40 p-8 sm:p-10">
            <PredictionWidget
              fixtureId={battleMatch.fixture.id}
              homeTeam={battleMatch.teams.home.name}
              awayTeam={battleMatch.teams.away.name}
              existingPrediction={existingPrediction}
              isResolved={existingPrediction?.resolved ?? false}
              matchStatus={battleMatch.fixture.status.short}
            />
          </div>
        </div>
      </section>

      {/* ── BATTLE STATS ───────────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Battle <span className="text-[var(--brand)]">Intel</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: 'Head-to-Head Record',
              desc: 'Historical meetings between these two sides often reveal patterns. Some teams consistently dominate specific opponents due to tactical matchups, psychological edges, or stylistic advantages that persist across seasons.',
            },
            {
              icon: TrendingUp,
              title: 'Current Form Index',
              desc: 'Recent results provide crucial context. A team on a five-match winning streak carries momentum and confidence, while a side struggling for goals may find it difficult to break down organized defenses regardless of reputation.',
            },
            {
              icon: Shield,
              title: 'Tactical Breakdown',
              desc: 'The clash of styles often determines outcomes. High-pressing teams tend to overwhelm possession-based sides, while counter-attacking specialists excel against aggressive opponents who leave space in behind.',
            },
          ].map((item, i) => (
            <div key={i} className="card p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY BATTLE MATTERS ─────────────────────────────────── */}
      <section className="mb-24 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>
            Why <span className="text-[var(--brand)]">Battle?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'The Thrill of Competition',
              body: 'There is something primal about predicting a football match correctly while thousands of others get it wrong. The Battle mode distills this thrill into its purest form — one match, one prediction, winner takes all. Every correct call sends you soaring up the leaderboard. Every near-miss fuels your determination to nail the next one.',
            },
            {
              title: 'Community Rivalry',
              body: 'Football has always been about rivalry — club against club, nation against nation, fan against fan. The Battle mode channels this energy into a positive, competitive arena where your football knowledge is your weapon. Challenge friends, climb past rivals, and earn the respect of the global ActiveSports community.',
            },
            {
              title: 'Skill Over Luck',
              body: 'Unlike random chance games, football prediction rewards genuine expertise. The fans who consistently top our leaderboard are not lucky — they understand tactics, track form, analyze statistics, and read the game at a deeper level. Battle mode is where expertise meets opportunity.',
            },
            {
              title: 'Rewards That Matter',
              body: 'Every correct prediction earns PRO Points that contribute to your seasonal ranking. Accumulate enough points and you unlock exclusive badges, featured profile placement, and entry into special high-stakes battles with amplified point pools. Your knowledge literally pays dividends.',
            },
          ].map((item, i) => (
            <article key={i} className="card p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-[var(--accent)]" />
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
            <Crown className="w-64 h-64 -mr-10 -mt-10 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Your Move
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[0.95]">
              Enter the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--danger)] to-[var(--accent)]">
                Arena
              </span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              The battle is live. Thousands have already made their predictions. Lock in your score before kick-off and prove you have what it takes to conquer the leaderboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="#battle-arena" className="card px-8 py-4 bg-[var(--danger)] text-white font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,61,87,0.3)]">
                Lock In Prediction <Swords className="w-5 h-5" />
              </Link>
              <Link href="/predictions" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
                <Target className="w-5 h-5" /> More Matches
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
