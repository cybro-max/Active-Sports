import { getTodayFixtures, getLiveFixtures, getFixturesByDate, Fixture } from '@/lib/apifootball';
import { DEFAULT_TIMEZONE, TZ_COOKIE_NAME, getTodayDate } from '@/lib/utils';
import LiveMatchRow from '@/components/LiveMatchRow';
import FallbackState from '@/components/FallbackState';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Calendar, ChevronLeft, ChevronRight, LayoutGrid, ListFilter, Zap, PlayCircle, Globe } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Live Match Center | Real-Time Scores & Schedule',
  description: 'The ultimate live football command center. Track matches, scores, and schedules across every major league in real-time.',
};

interface Props {
  searchParams?: Promise<{ date?: string; status?: string; tz?: string }>;
}

function formatDateLabel(dateStr: string, timezone = DEFAULT_TIMEZONE): string {
  const today = getTodayDate(timezone);
  const now = new Date();
  const yesterday = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone }).format(new Date(now.getTime() - 86400000));
  const tomorrow = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone }).format(new Date(now.getTime() + 86400000));
  
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';
  try {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default async function FixturesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const tz = sp?.tz || cookieStore.get(TZ_COOKIE_NAME)?.value || DEFAULT_TIMEZONE;
  const selectedDate = sp?.date || getTodayDate(tz);
  const statusFilter = sp?.status || 'all';

  let liveFixtures: Fixture[] = [];
  let dateFixtures: Fixture[] = [];
  let fetchError: string | null = null;

  try {
    [liveFixtures, dateFixtures] = await Promise.all([
      getLiveFixtures(tz),
      selectedDate === getTodayDate(tz)
        ? getTodayFixtures(tz)
        : getFixturesByDate(selectedDate, tz),
    ]);
  } catch (err) {
    Sentry.captureException(err);
    fetchError = err instanceof Error ? err.message : 'Failed to load fixtures';
  }

  const dateNav = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const statusFilterFn = (f: Fixture) => {
    const short = f.fixture.status.short;
    if (statusFilter === 'live') return ['1H', '2H', 'HT', 'ET', 'P'].includes(short);
    if (statusFilter === 'upcoming') return short === 'NS' || short === 'TBD';
    if (statusFilter === 'finished') return ['FT', 'AET', 'PEN'].includes(short);
    return true;
  };

  const combined = [...liveFixtures, ...dateFixtures.filter(f => f.fixture.status.short !== 'LIVE')];
  const unique = combined.filter((f, i, a) => a.findIndex(x => x.fixture.id === f.fixture.id) === i);
  const filtered = unique.filter(statusFilterFn);

  const fixturesByLeague = filtered.reduce<Record<string, Fixture[]>>((acc, f) => {
    const key = `${f.league.id}__${f.league.name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* ── IMMERSIVE HERO ────────────────────────────────────── */}
      <section className="relative h-[350px] sm:h-[400px] rounded-[40px] overflow-hidden mb-16 fade-up group shadow-2xl">
         <div className="absolute inset-0 bg-black">
            <Image 
              src="/media/hero/stadium.png" 
              alt="Stadium" 
              fill 
              className="object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.1),transparent_70%)]" />
         </div>
         
         <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
               <Zap className="w-3 h-3 text-[var(--brand)] fill-current" /> Live Data Stream 3.1
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
               MATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-cyan-400">CENTER</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
               Real-time scores, tactical insights, and comprehensive schedules for every major competition worldwide.
            </p>

            <div className="absolute bottom-8 flex items-center gap-8 px-8 py-4 rounded-3xl bg-white/[0.03] backdrop-blur-3xl border border-white/5">
               <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white">{liveFixtures.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Live</span>
               </div>
               <div className="w-[1px] h-8 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white">{filtered.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Matches</span>
               </div>
               <div className="w-[1px] h-8 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-white">{Object.keys(fixturesByLeague).length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Leagues</span>
               </div>
            </div>
         </div>
      </section>

      {/* Quick Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 fade-up">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
          {(['all', 'live', 'upcoming', 'finished'] as const).map(s => (
            <Link
              key={s}
              href={`/fixtures?date=${selectedDate}&status=${s}`}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s 
                  ? 'bg-[var(--brand)] text-black shadow-lg shadow-[var(--brand)]/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-xl">
          <Link href={`/fixtures?date=${dateNav(-1)}&status=${statusFilter}`} className="p-2.5 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="px-6 flex items-center gap-3 min-w-[160px] justify-center">
             <Calendar className="w-4 h-4 text-[var(--brand)]" />
             <span className="text-[11px] font-black uppercase tracking-widest text-white">{formatDateLabel(selectedDate, tz)}</span>
          </div>
          <Link href={`/fixtures?date=${dateNav(1)}&status=${statusFilter}`} className="p-2.5 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-16">
        {Object.keys(fixturesByLeague).length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center fade-up">
            <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6">
              <LayoutGrid className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-xs text-center">We couldn&apos;t find any matches matching your criteria for this date.</p>
          </div>
        ) : (
          Object.entries(fixturesByLeague).map(([key, fixtures]) => {
            const league = fixtures[0].league;
            return (
              <section key={key} className="fade-up">
                {/* League Header */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {league.logo && (
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                        <img src={league.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <Link href={`/league/${league.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-[var(--brand)] transition-colors">
                        {league.name}
                      </Link>
                      <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{league.country}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-black text-white/40">{fixtures.length} MATCHES</span>
                </div>

                {/* Match List */}
                <div className="grid grid-cols-1 gap-3">
                  {fixtures.map(f => (
                    <LiveMatchRow key={f.fixture.id} fixture={f} timezone={tz} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-24 pt-12 border-t border-white/5 text-center fade-up">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">ActiveSports Real-Time Data Engine v3.1</p>
      </div>
    </div>
  );
}
