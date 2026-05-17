import Link from 'next/link';
import Image from 'next/image';
import { Globe, ArrowRight, Zap, Trophy } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative p-5 sm:p-16 mb-10 fade-up">
      {/* Background Container - Handles border, radius, bg, and clips internal decor */}
      <div className="absolute inset-0 rounded-[24px] sm:rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Trophy className="w-64 h-64 sm:w-96 sm:h-96 -mr-16 -mt-16 text-white" />
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
        <div className="flex-1 max-w-2xl relative z-30 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)]/30 text-[var(--brand)] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap className="w-3 h-3 fill-current" /> Fast. AI-Powered. Addictive.
          </div>
          
          <h1 className="text-3xl sm:text-7xl font-display font-black text-white mb-5 sm:mb-8 tracking-tight leading-[1.1] sm:leading-[0.95]">
            Live Football Scores <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Without Delay.
            </span>
          </h1>
          
          <p className="text-sm sm:text-xl text-[var(--text-muted)] mb-8 sm:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Real-time scores, AI-powered match insights, predictions, and advanced football stats — all in one fast experience.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-5">
            <Link href="#live" className="card px-6 py-3 sm:px-8 sm:py-4 bg-[var(--brand)] text-black text-xs sm:text-base font-black flex items-center gap-2 sm:gap-3 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(0,230,118,0.2)]">
              Explore Live <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="/world-cup" className="card px-6 py-3 sm:px-8 sm:py-4 bg-[var(--bg-surface)] text-white text-xs sm:text-base font-bold border border-white/10 flex items-center gap-2 sm:gap-3 hover:bg-[var(--bg-hover)] transition-all">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> World Cup Hub
            </Link>
          </div>
        </div>
        
        {/* Absolute positioned image breaking out of container */}
        <div className="hidden lg:block absolute bottom-0 right-4 w-[50%] h-[115%] pointer-events-none z-20">
          <Image 
            src="/media/homepage/playersgroup.png" 
            alt="ActiveSports Players" 
            fill 
            className="object-contain object-bottom drop-shadow-2xl pointer-events-auto hover:scale-105 transition-transform duration-700 origin-bottom"
            priority
          />
        </div>
      </div>
    </section>
  );
}
