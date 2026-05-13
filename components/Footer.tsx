'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, AtSign, Camera, Play, Globe } from 'lucide-react';

export default function Footer() {
  const [mounted, setMounted] = React.useState(false);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sections = [
    {
      title: 'Platform',
      links: [
        { label: 'Live Scores', href: '/' },
        { label: 'Leagues', href: '/leagues' },
        { label: 'Predictions', href: '/predictions' },
        { label: 'Battle Mode', href: '/prediction-battle' },
        { label: 'Leaderboard', href: '/leaderboard' },
      ],
    },
    {
      title: 'Major Events',
      links: [
        { label: 'World Cup 2026', href: '/world-cup' },
        { label: 'Champions League', href: '/league/champions-league' },
        { label: 'Premier League', href: '/league/premier-league' },
        { label: 'La Liga', href: '/league/la-liga' },
        { label: 'Venues', href: '/world-cup/venues' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Features', href: '/#features' },
        { label: 'Community', href: '/community' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Responsible Play', href: '/responsible' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0A0C14] border-t border-[var(--border-strong)] pt-20 pb-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo icon.png"
                alt="ActiveSports"
                width={48}
                height={48}
                className="drop-shadow-[0_0_12px_rgba(33,150,243,0.5)] transition-transform group-hover:scale-110"
              />
              <span className="font-display font-black text-xl tracking-tight">
                <span className="text-white tracking-tighter">ACTIVE</span>
                <span className="text-[var(--brand)] tracking-tighter ml-[3px]">SPORTS</span>
              </span>
            </Link>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
              The ultimate destination for real-time football intelligence, AI-powered insights, and community-driven predictions.
            </p>
            <div className="flex items-center gap-4">
              {[MessageSquare, AtSign, Camera, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--brand)] transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-white text-xs font-black uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Directories */}
        <div className="pt-8 border-t border-[var(--border)] mb-8">
          <div className="flex flex-col md:flex-row gap-6 text-sm">
            <div className="flex-1">
              <span className="text-white font-semibold mr-4">Teams A–Z</span>
              <div className="inline-flex flex-wrap gap-x-3 gap-y-1">
                {'abcdefghijklmnopqrstuvwxyz'.split('').map(l => (
                  <Link key={l} href={`/teams/${l}`} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-semibold mr-4">Players A–Z</span>
              <div className="inline-flex flex-wrap gap-x-3 gap-y-1">
                {'abcdefghijklmnopqrstuvwxyz'.split('').map(l => (
                  <Link key={l} href={`/players/${l}`} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-semibold mr-4">Leagues A–Z</span>
              <div className="inline-flex flex-wrap gap-x-3 gap-y-1">
                {'abcdefghijklmnopqrstuvwxyz'.split('').map(l => (
                  <Link key={l} href={`/leagues/${l}`} className="text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            <Globe className="w-3 h-3" />
            <span>English (US)</span>
            <span className="mx-2 text-[var(--border)]">|</span>
            <span>All times are displayed in your local timezone.</span>
          </div>
          <div className="text-[var(--text-muted)] text-xs font-semibold">
            © {mounted ? currentYear : '2024'} ActiveSports Global Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
