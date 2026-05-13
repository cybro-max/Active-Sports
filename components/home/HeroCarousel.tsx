'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fixture } from '@/lib/apifootball';
import { formatMatchDate, formatMatchTime, getStatusLabel } from '@/lib/utils';
import { matchSlug } from '@/lib/slug';
import { ChevronLeft, ChevronRight, Zap, Calendar, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroCarouselProps {
  liveFixtures?: Fixture[];
  todayFixtures?: Fixture[];
  timezone?: string;
}

export default function HeroCarousel({ liveFixtures = [], todayFixtures = [], timezone }: HeroCarouselProps) {
  const matches = liveFixtures.length > 0 ? liveFixtures : todayFixtures.slice(0, 8);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % matches.length);
  }, [matches.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent(c => (c + newDirection + matches.length) % matches.length);
  };

  useEffect(() => {
    if (isPaused || matches.length <= 1) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [isPaused, matches.length, next]);

  if (!matches.length) {
    return (
      <section className="relative h-[550px] rounded-[48px] overflow-hidden mb-16 group shadow-2xl">
        <div className="absolute inset-0 bg-black">
          <Image 
            src="/media/hero/stadium.png" 
            alt="Stadium" 
            fill 
            className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,230,118,0.1),transparent_70%)]" />
        </div>
        <div className="relative h-full flex flex-col justify-center px-10 sm:px-20 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
          >
            <Zap className="w-3 h-3 text-[var(--brand)] fill-current" /> Next-Gen Football Intelligence
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl sm:text-[100px] font-black text-white mb-10 tracking-tighter leading-[0.85]"
          >
            THE GLOBAL <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] via-cyan-400 to-emerald-400">
              GAME HUB.
            </span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-6"
          >
            <Link href="/fixtures" className="group/btn bg-white text-black px-12 py-5 rounded-[24px] font-black flex items-center gap-4 hover:bg-[var(--brand)] transition-all shadow-xl">
              Live Scores <PlayCircle className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
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
      x: direction > 0 ? 800 : -800,
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 800 : -800,
      opacity: 0,
      scale: 1.05,
      filter: "blur(10px)",
    }),
  };

  return (
    <section 
      className="relative h-[550px] sm:h-[620px] rounded-[48px] overflow-hidden mb-20 select-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.7 }
          }}
          className="absolute inset-0"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-black">
            <Image 
              src={isLive ? "/media/hero/live.png" : "/media/hero/stadium.png"}
              alt="Background" 
              fill 
              className={`object-cover opacity-50 transition-all duration-1000 ${isLive ? 'mix-blend-overlay' : 'grayscale mix-blend-luminosity brightness-75'}`}
            />
            {/* Dynamic Pitch Glow */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${isLive ? 'rgba(239,68,68,0.15)' : 'rgba(0,230,118,0.1)'},transparent_80%)]`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className={`absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/90`} />
          </div>

          {/* Content Layer */}
          <Link href={link} className="relative h-full flex flex-col items-center justify-center px-4 sm:px-12">
            {/* League Tag */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-12 flex items-center gap-4"
            >
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
                {m.league.logo && <img src={m.league.logo} alt="" className="w-6 h-6 object-contain" />}
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">{m.league.name}</span>
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 w-full max-w-7xl">
              {/* Home Team */}
              <motion.div 
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="relative group/logo">
                   <div className="absolute inset-0 bg-white rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity" />
                   <img src={m.teams.home.logo} alt={m.teams.home.name} className="w-32 h-32 sm:w-44 sm:h-44 object-contain relative drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-110 duration-700" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white text-center max-w-[240px] tracking-tight drop-shadow-2xl">{m.teams.home.name}</h2>
              </motion.div>

              {/* Score / Time */}
              <div className="flex flex-col items-center justify-center z-10">
                {m.fixture.status.short === 'NS' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-8xl sm:text-[140px] font-black text-white tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-none">
                      {formatMatchTime(m.fixture.date, timezone)}
                    </div>
                    <div className="flex items-center gap-4 mt-8 px-8 py-3 rounded-2xl bg-[var(--brand)] text-black font-black uppercase tracking-[0.4em] text-xs shadow-2xl">
                      <Calendar className="w-5 h-5" /> {formatMatchDate(m.fixture.date, timezone)}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-8 sm:gap-16">
                      <span className="text-8xl sm:text-[160px] font-black text-white drop-shadow-[0_20px_60px_rgba(0,0,0,1)] tabular-nums leading-none">{m.goals.home ?? 0}</span>
                      <span className="text-6xl sm:text-8xl text-white/20 font-black mb-8 animate-pulse">:</span>
                      <span className="text-8xl sm:text-[160px] font-black text-white drop-shadow-[0_20px_60px_rgba(0,0,0,1)] tabular-nums leading-none">{m.goals.away ?? 0}</span>
                    </div>
                    <div className={`mt-10 px-10 py-3 rounded-full border backdrop-blur-2xl transition-all ${
                        isLive ? 'bg-red-500/20 border-red-500/40' : 'bg-white/10 border-white/20'
                    }`}>
                      <span className={`text-xs font-black uppercase tracking-[0.5em] ${isLive ? 'text-red-400' : 'text-[var(--brand)]'}`}>
                        {getStatusLabel(m.fixture.status.short, m.fixture.status.elapsed)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Away Team */}
              <motion.div 
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="relative group/logo">
                   <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity" />
                   <img src={m.teams.away.logo} alt={m.teams.away.name} className="w-32 h-32 sm:w-44 sm:h-44 object-contain relative drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-110 duration-700" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white text-center max-w-[240px] tracking-tight drop-shadow-2xl">{m.teams.away.name}</h2>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Glass Controls */}
      {matches.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-40 p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-white hover:bg-[var(--brand)] hover:text-black hover:border-[var(--brand)] transition-all group shadow-2xl"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); paginate(1); }}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-40 p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-white hover:bg-[var(--brand)] hover:text-black hover:border-[var(--brand)] transition-all group shadow-2xl"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
            {matches.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-700 rounded-full h-2 ${
                  i === current ? 'w-16 bg-[var(--brand)] shadow-[0_0_20px_rgba(0,230,118,0.5)]' : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Atmospheric Overlays */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
    </section>
  );
}
