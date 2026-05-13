import Link from 'next/link';
import Image from 'next/image';
import { Globe, ArrowRight, Zap, Trophy } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative p-8 sm:p-16 mb-10 fade-up">
      {/* Background Container - Handles border, radius, bg, and clips internal decor */}
      <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Trophy className="w-96 h-96 -mr-20 -mt-20 text-white" />
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center">
        <div className="flex-1 max-w-2xl relative z-30">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-current" /> Fast. AI-Powered. Addictive.
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            Live Football Scores <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">
              Without Delay.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed">
            Real-time scores, AI-powered match insights, predictions, and advanced football stats — all in one fast experience. Built for the modern fan.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="#live" className="card px-8 py-4 bg-[var(--brand)] text-black font-black flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              Explore Live Matches <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/world-cup" className="card px-8 py-4 bg-[var(--bg-surface)] text-white font-bold border border-[var(--border)] flex items-center gap-3 hover:bg-[var(--bg-hover)] transition-all">
              <Globe className="w-5 h-5" /> World Cup Hub
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
