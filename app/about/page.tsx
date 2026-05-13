import Link from 'next/link';
import { Trophy, Globe, Zap, Users, Target, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about ActiveSports — the ultimate platform for real-time football intelligence, AI-powered insights, and community-driven predictions.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>
        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-current" /> Our Mission
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            About <span className="text-[var(--brand)]">ActiveSports</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Built by football fans, for football fans. We combine real-time data, AI-powered insights, and community engagement to create the most complete football experience on the web.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mb-16 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>Our <span className="text-[var(--brand)]">Story</span></h2>
        </div>
        <div className="card p-8 sm:p-10 space-y-6">
          <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">
            ActiveSports was born from a simple frustration: football fans deserve better. Too many platforms offer either raw statistics without context or shallow commentary without substance. We set out to build something different — a platform that combines the depth of professional analytics with the excitement of community-driven engagement.
          </p>
          <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">
            What began as a passion project has evolved into a comprehensive football intelligence platform serving thousands of fans worldwide. From Premier League die-hards tracking every tactical nuance to casual supporters looking for quick match updates, ActiveSports delivers a premium experience tailored to how modern fans consume football.
          </p>
          <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">
            Our AI-powered match insights, prediction battles, and real-time odds comparisons give fans tools that were once reserved for professional analysts. We believe every supporter deserves access to the best football intelligence available.
          </p>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mb-16 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>What We <span className="text-[var(--brand)]">Offer</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Globe, title: 'Global Coverage', desc: 'From the Premier League to the World Cup, we cover every major competition with real-time data, standings, and fixtures.' },
            { icon: Zap, title: 'Real-Time Updates', desc: 'Live scores, instant match events, and dynamic odds that refresh automatically so you never miss a moment.' },
            { icon: Target, title: 'AI-Powered Insights', desc: 'Advanced machine learning models generate tactical breakdowns, win probability analysis, and match predictions.' },
            { icon: Users, title: 'Community Engagement', desc: 'Compete in prediction battles, climb global leaderboards, and connect with fans who share your passion.' },
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

      {/* CTA */}
      <section className="fade-up">
        <div className="relative rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden p-10 sm:p-16 text-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy className="w-64 h-64 -mr-10 -mt-10 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Join the <span className="text-[var(--brand)]">Movement</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Thousands of fans are already experiencing football differently. Start your journey today.
            </p>
            <Link href="/" className="card px-8 py-4 bg-[var(--brand)] text-black font-black inline-flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
              Explore Live Scores <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
