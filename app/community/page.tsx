import Link from 'next/link';
import { Users, MessageSquare, Trophy, Globe, ChevronRight, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Join the ActiveSports community. Connect with football fans worldwide, explore stats, and discuss the beautiful game.',
};

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero */}
      <section className="relative pt-0 pb-16 mb-16 fade-up">
        <div className="absolute inset-0 rounded-[30px] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-elevated)] via-black to-[var(--bg-base)] overflow-hidden -z-10 shadow-[var(--shadow-md)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Users className="w-96 h-96 -mr-20 -mt-20 text-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-30" />
        </div>
        <div className="relative z-10 p-8 sm:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-dim)] border border-[var(--brand)] text-[var(--brand)] text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-current" /> Connect With Fans
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-black text-white mb-6 tracking-tight leading-[0.95]">
            Our <span className="text-[var(--brand)]">Community</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Football is better together. Join thousands of passionate fans in prediction battles, live match discussions, and global leaderboards.
          </p>
        </div>
      </section>

      {/* Community Features */}
      <section className="mb-16 fade-up">
        <div className="premium-heading mb-10">
          <div className="heading-accent" />
          <h2>How to <span className="text-[var(--brand)]">Get Involved</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Follow Live Scores',
              desc: 'Stay on top of every match with real-time scores, stats, lineups, and events across all major leagues and competitions worldwide.',
              href: '/',
            },
            {
              step: '02',
              title: 'Explore Stats & Standings',
              desc: 'Dive deep into team standings, player stats, top scorers, and head-to-head records powered by live API data from global football leagues.',
              href: '/leaderboard',
            },
            {
              step: '03',
              title: 'Join the Conversation',
              desc: 'Connect with fans from around the world. Share your passion for football and discover new perspectives on the beautiful game.',
              href: '/',
            },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="card p-8 space-y-6 group">
              <div className="flex items-center justify-between">
                <span className="text-5xl font-display font-black text-white/5 group-hover:text-[var(--brand)]/10 transition-colors">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--brand)]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-[var(--text-body)] leading-[1.8] text-[15px]">{item.desc}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
                Get Started <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Stats */}
      <section className="mb-16 fade-up">
        <div className="card p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, value: '12,400+', label: 'Active Members' },
            { icon: MessageSquare, value: '50K+', label: 'Daily Fixtures' },
            { icon: Trophy, value: '190+', label: 'Countries Covered' },
            { icon: Globe, value: '100+', label: 'Leagues' },
          ].map((stat, i) => (
            <div key={i} className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-dim)] border border-[var(--brand)]/20 flex items-center justify-center mx-auto">
                <stat.icon className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">{stat.label}</div>
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
              Ready to <span className="text-[var(--brand)]">Join?</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Sign in to start making predictions, earning points, and connecting with the global football community.
            </p>
            <Link href="/leaderboard" className="card px-8 py-4 bg-[var(--brand)] text-black font-black inline-flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(33,150,243,0.3)]">
              View Standings <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
