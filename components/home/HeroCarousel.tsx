'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fixture } from '@/lib/apifootball';
import { formatMatchDate, formatMatchTime, getStatusLabel } from '@/lib/utils';
import { matchSlug } from '@/lib/slug';
import { ChevronLeft, ChevronRight, Zap, Calendar, PlayCircle, Trophy, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroCarouselProps {
  liveFixtures?: Fixture[];
  todayFixtures?: Fixture[];
  timezone?: string;
}

export default function HeroCarousel({ liveFixtures = [], todayFixtures = [], timezone }: HeroCarouselProps) {
  // ── PRIORITY SELECTION (Top 10) ───────────────────────────────
  const matches = useMemo(() => {
    const majorLeagueIds = [39, 140, 135, 78, 61, 2, 3, 1];
    
    // Combine and prioritize
    const combined = [...liveFixtures, ...todayFixtures];
    const sorted = combined.sort((a, b) => {
        // 1. Live matches first
        const isALive = ['1H', '2H', 'HT', 'ET', 'P'].includes(a.fixture.status.short);
        const isBLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(b.fixture.status.short);
        if (isALive !== isBLive) return isALive ? -1 : 1;
        
        // 2. Major leagues second
        const isAMajor = majorLeagueIds.includes(a.league.id);
        const isBMajor = majorLeagueIds.includes(b.league.id);
        if (isAMajor !== isBMajor) return isAMajor ? -1 : 1;
        
        // 3. Kickoff time third
        return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
    });

    return sorted.slice(0, 10);
  }, [liveFixtures, todayFixtures]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    if (matches.length <= 1) return;
    setDirection(1);
    setCurrent(c => (c + 1) % matches.length);
  }, [matches.length]);

  const prev = useCallback(() => {
    if (matches.length <= 1) return;
    setDirection(-1);
    setCurrent(c => (c - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent(c => (c + newDirection + matches.length) % matches.length);
  };

  useEffect(() => {
    if (isPaused || matches.length <= 1) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [isPaused, matches.length, next]);

  if (!matches.length) {
    return (
      <section className="relative h-[550px] rounded-[48px] overflow-hidden mb-16 group shadow-2xl">
        <div className="absolute inset-0 bg-[#0a0a0a]">
          <Image 
            src="/media/hero/stadium.png" 
            alt="Stadium" 
            fill 
            className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,230,118,0.15),transparent_70%)]" />
        </div>
        <div className="relative h-full flex flex-col justify-center px-10 sm:px-24 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.4em] mb-12"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--brand)] fill-current" /> Official Data Aggregator
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-7xl sm:text-[110px] font-black text-white mb-12 tracking-tight leading-[0.82] sm:tracking-tighter"
          >
            THE PREMIER <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] via-emerald-400 to-cyan-500 animate-gradient-x">
              ARENA.
            </span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6"
          >
            <Link href="/fixtures" className="group/btn relative px-14 py-6 rounded-[28px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-white group-hover/btn:bg-[var(--brand)] transition-colors duration-500" />
              <div className="relative flex items-center gap-4 text-black font-black text-sm uppercase tracking-widest">
                Explore Fixtures <PlayCircle className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  const m = matches[current];
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(m.fixture.status.short);
  const link = `/match/${matchSlug(m.teams.home.name, m.teams.away.name)}`;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <section 
      className="relative h-[600px] sm:h-[680px] rounded-[56px] overflow-hidden mb-24 select-none shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] border border-white/5 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 180, damping: 28 },
            opacity: { duration: 0.4 },
            rotateY: { duration: 0.6 }
          }}
          className="absolute inset-0"
        >
          {/* Background Layer with Parallax Effect */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <Image 
              src={m.fixture.venue.id ? `https://media.api-sports.io/football/venues/${m.fixture.venue.id}.png` : (isLive ? "/media/hero/live.png" : "/media/hero/stadium.png")}
              alt="Venue Background" 
              fill 
              priority
              className={`object-cover transition-all duration-[2000ms] scale-110 group-hover:scale-100 ${isLive ? 'opacity-40 mix-blend-screen' : 'opacity-30 grayscale brightness-50'}`}
              onError={(e: any) => {
                // Fallback if venue image is missing on the server
                e.target.src = isLive ? "/media/hero/live.png" : "/media/hero/stadium.png";
              }}
            />
            {/* Cinematic Overlays */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${isLive ? 'rgba(239,68,68,0.2)' : 'rgba(0,230,118,0.12)'},transparent_85%)]`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-transparent" />
            
            {/* Moving Light Beam */}
            <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-20deg] animate-shine pointer-events-none" />
          </div>

          {/* Content Layer */}
          <Link href={link} className="relative h-full flex flex-col items-center justify-center px-6 sm:px-16">
            {/* Floating Info Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 flex flex-col items-center gap-4"
            >
               <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl">
                  {isLive ? (
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500 rounded-full animate-pulse">
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter">LIVE</span>
                    </div>
                  ) : (
                    <Trophy className="w-4 h-4 text-[var(--brand)]" />
                  )}
                  <div className="w-[1px] h-4 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">{m.league.name}</span>
               </div>
            </motion.div>

            {/* Match Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center justify-center gap-10 md:gap-20 w-full max-w-7xl px-4">
              {/* Home Team */}
              <motion.div 
                initial={{ opacity: 0, x: -80, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex flex-col items-center gap-10 order-2 md:order-1"
              >
                <div className="relative group/logo">
                   <div className="absolute inset-0 bg-white rounded-full blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity" />
                   <img src={m.teams.home.logo} alt={m.teams.home.name} className="w-24 h-24 sm:w-48 sm:h-48 object-contain relative drop-shadow-[0_40px_80px_rgba(0,0,0,1)] transition-all group-hover:scale-110 group-hover:-rotate-3 duration-1000" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white text-center tracking-tighter leading-none max-w-[280px] drop-shadow-2xl">{m.teams.home.name}</h2>
              </motion.div>

              {/* Central Scoreboard */}
              <div className="flex flex-col items-center justify-center z-10 order-1 md:order-2">
                {m.fixture.status.short === 'NS' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-7xl sm:text-[160px] font-black text-white tracking-tighter drop-shadow-[0_30px_60px_rgba(0,0,0,1)] leading-[0.9]">
                      {formatMatchTime(m.fixture.date, timezone)}
                    </div>
                    <div className="mt-8 flex items-center gap-4 px-8 py-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-3xl border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl">
                      <Calendar className="w-4 h-4 text-[var(--brand)]" /> {formatMatchDate(m.fixture.date, timezone)}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-8 sm:gap-20">
                      <span className="text-7xl sm:text-[180px] font-black text-white drop-shadow-[0_30px_70px_rgba(0,0,0,1)] tabular-nums leading-none tracking-tighter">{m.goals.home ?? 0}</span>
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <span className="text-4xl sm:text-9xl text-white/10 font-black animate-pulse">:</span>
                      </div>
                      <span className="text-7xl sm:text-[180px] font-black text-white drop-shadow-[0_30px_70px_rgba(0,0,0,1)] tabular-nums leading-none tracking-tighter">{m.goals.away ?? 0}</span>
                    </div>
                    <div className={`mt-8 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full border backdrop-blur-3xl shadow-2xl transition-all ${
                        isLive ? 'bg-red-500/15 border-red-500/30' : 'bg-white/5 border-white/10'
                    }`}>
                      <span className={`flex items-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] ${isLive ? 'text-red-400' : 'text-[var(--brand)]'}`}>
                        {isLive && <Activity className="w-4 h-4 animate-spin-slow" />}
                        {getStatusLabel(m.fixture.status.short, m.fixture.status.elapsed)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Away Team */}
              <motion.div 
                initial={{ opacity: 0, x: 80, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex flex-col items-center gap-10 order-3"
              >
                <div className="relative group/logo">
                   <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-25 transition-opacity" />
                   <img src={m.teams.away.logo} alt={m.teams.away.name} className="w-24 h-24 sm:w-48 sm:h-48 object-contain relative drop-shadow-[0_40px_80px_rgba(0,0,0,1)] transition-all group-hover:scale-110 group-hover:rotate-3 duration-1000" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white text-center tracking-tighter leading-none max-w-[280px] drop-shadow-2xl">{m.teams.away.name}</h2>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Navigation Controls */}
      {matches.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 z-40 p-5 sm:p-8 rounded-[32px] bg-white/[0.02] backdrop-blur-3xl border border-white/5 text-white hover:bg-[var(--brand)] hover:text-black hover:border-[var(--brand)] transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <ChevronLeft className="w-6 h-6 sm:w-10 sm:h-10 group-hover:-translate-x-2 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-40 p-5 sm:p-8 rounded-[32px] bg-white/[0.02] backdrop-blur-3xl border border-white/5 text-white hover:bg-[var(--brand)] hover:text-black hover:border-[var(--brand)] transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10">
            {matches.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                   setDirection(i > current ? 1 : -1);
                   setCurrent(i);
                }}
                className={`transition-all duration-1000 rounded-full h-1.5 ${
                  i === current ? 'w-12 bg-[var(--brand)] shadow-[0_0_20px_rgba(0,230,118,0.8)]' : 'w-3 bg-white/10 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Atmosphere Gradients */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#0a0a0a]/60 to-transparent pointer-events-none" />
    </section>
  );
}
