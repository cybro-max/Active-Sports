'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Search, Heart, Menu, X, User, ChevronDown, Globe, Trophy, Swords, BarChart3, Radio, Calendar, Clock, RefreshCcw, Activity } from 'lucide-react';
import { useSearchOverlay } from '@/components/SearchOverlay';
import { DEFAULT_TIMEZONE, TZ_COOKIE_NAME } from '@/lib/utils';

function setTzCookie(tz: string) {
  const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `${TZ_COOKIE_NAME}=${encodeURIComponent(tz)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getTzCookie() {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${TZ_COOKIE_NAME}=`))
    ?.split('=')[1];
}

interface DropdownItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownSection {
  label: string;
  icon?: React.ReactNode;
  items: DropdownItem[];
}

const leftLinks = [
  { href: '/', label: 'Live', icon: <Radio className="w-4 h-4" /> },
  { href: '/fixtures', label: 'Fixtures', icon: <Calendar className="w-4 h-4" /> },
];

const dropdowns: (DropdownSection & { trigger: string })[] = [
  {
    trigger: 'Leagues',
    icon: <Trophy className="w-4 h-4" />,
    label: 'Competitions',
    items: [
      { href: '/leagues', label: 'Leagues A-Z', icon: <Globe className="w-4 h-4" />, description: 'Browse all football leagues' },
      { href: '/teams', label: 'Teams', icon: <Trophy className="w-4 h-4" />, description: 'Explore football clubs' },
      { href: '/players', label: 'Players', icon: <User className="w-4 h-4" />, description: 'Pro athlete database' },
      { href: '/countries', label: 'Countries', icon: <Globe className="w-4 h-4" />, description: 'Football by nation' },
      { href: '/world-cup', label: 'World Cup', icon: <Trophy className="w-4 h-4" />, description: 'World Cup 2026 hub' },
    ],
  },
  {
    trigger: 'Insights',
    icon: <BarChart3 className="w-4 h-4" />,
    label: 'Football Hubs',
    items: [
      { href: '/stats/leaders', label: 'Stats Leaders', icon: <Trophy className="w-4 h-4" />, description: 'Top scorers & playmakers' },
      { href: '/transfers', label: 'Transfer Center', icon: <RefreshCcw className="w-4 h-4" />, description: 'Latest market movements' },
      { href: '/injuries', label: 'Injury Report', icon: <Activity className="w-4 h-4" />, description: 'Medical room updates' },
    ],
  },
  {
    trigger: 'More',
    label: 'Features',
    items: [
      { href: '/predictions', label: 'Predictions', icon: <BarChart3 className="w-4 h-4" />, description: 'AI-powered match predictions' },
      { href: '/odds', label: 'Odds', icon: <BarChart3 className="w-4 h-4" />, description: 'Compare bookmaker odds' },
      { href: '/prediction-battle', label: 'Battle', icon: <Swords className="w-4 h-4" />, description: 'Compete with friends' },
      { href: '/leaderboard', label: 'Ranking', icon: <BarChart3 className="w-4 h-4" />, description: 'Top predictors leaderboard' },
      { href: '/community', label: 'Community', icon: <Globe className="w-4 h-4" />, description: 'Join the conversation' },
    ],
  },
];

function NavDropdown({ section, pathname }: { section: DropdownSection & { trigger: string }; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = section.items.some(
    item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(o => !o);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
          isActive || open
            ? 'text-white bg-white/10 shadow-lg'
            : 'text-[var(--text-muted)] hover:text-white'
        }`}
      >
        {section.trigger}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-2 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-3xl shadow-2xl shadow-black/50 fade-up"
          role="menu"
        >
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]/60 border-b border-white/5 mb-1">
            {section.label}
          </div>
          {section.items.map(item => {
            const itemActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  itemActive
                    ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`${itemActive ? 'text-[var(--brand)]' : 'text-white/30'}`}>
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold">{item.label}</span>
                  {item.description && (
                    <span className="text-[10px] text-[var(--text-muted)]/50">{item.description}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);
  const tzRef = useRef<HTMLDivElement>(null);
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchOverlay();

  const [currentTz, setCurrentTz] = useState(DEFAULT_TIMEZONE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tzParam = params.get('tz');
    const tzCookie = getTzCookie();
    
    // 1. Priority: URL Param -> Cookie -> Auto-detect -> Default
    let detectedTz = tzParam || tzCookie;
    
    if (!detectedTz) {
      try {
        detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detectedTz) setTzCookie(detectedTz);
      } catch (e) {
        detectedTz = DEFAULT_TIMEZONE;
      }
    } else if (tzParam) {
      // Sync param to cookie
      setTzCookie(tzParam);
    }
    
    if (detectedTz && detectedTz !== currentTz) {
      setCurrentTz(detectedTz);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) setTzOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTzOpen(false);
    };
    if (tzOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [tzOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = useCallback((href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }, [pathname]);

  const timezones = [
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dhaka', 'Asia/Dubai', 'Asia/Kolkata',
    'America/New_York', 'America/Chicago', 'America/Los_Angeles',
    'Australia/Sydney',
  ];

  function formatTz(tz: string) {
    return tz.split('/').pop()?.replace(/_/g, ' ') || tz;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <nav className="max-w-screen-2xl mx-auto px-6 flex items-center justify-between" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105">
              <Image
                src="/logo icon.png"
                alt="ActiveSports"
                width={40}
                height={40}
                className="drop-shadow-[0_0_8px_rgba(33,150,243,0.4)] transition-all duration-300"
              />
            </div>
            <span className="font-display font-black text-xl tracking-tight hidden sm:block">
              <span className="text-white tracking-tighter">ACTIVE</span>
              <span className="text-[var(--brand)] tracking-tighter ml-[3px]">SPORTS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center bg-white/5 border border-white/5 rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-md">
            {leftLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-white bg-white/10 shadow-lg'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {dropdowns.map(section => (
              <NavDropdown key={section.trigger} section={section} pathname={pathname} />
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div ref={tzRef} className="relative hidden sm:block">
              <button
                onClick={() => setTzOpen(o => !o)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
                aria-label="Change timezone"
              >
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">{formatTz(currentTz)}</span>
              </button>
              {tzOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-3xl shadow-2xl shadow-black/50 z-50 fade-up">
                  {timezones.map(tz => {
                    const isSelected = currentTz === tz;
                    const targetUrl = pathname + (pathname.includes('?') ? `&tz=${encodeURIComponent(tz)}` : `?tz=${encodeURIComponent(tz)}`);
                    return (
                      <Link
                        key={tz}
                        href={targetUrl}
                        onClick={() => {
                          setTzCookie(tz);
                          setCurrentTz(tz);
                          setTzOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                          isSelected ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-bold' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTz(tz)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline-block text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 opacity-40 group-hover:opacity-100 transition-opacity">
                ⌘K
              </span>
            </button>

            {session ? (
              <div className="flex items-center gap-3">
                 <Link href="/favorites" className="hidden sm:flex p-2.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Heart className="w-5 h-5" />
                 </Link>
                 <Link href="/profile" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden group-hover:border-[var(--brand)] transition-all">
                       {session.user?.image ? (
                         <Image src={session.user.image} alt="User" width={36} height={36} />
                       ) : (
                         <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                         </div>
                       )}
                    </div>
                 </Link>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[var(--brand)] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Sign In
              </button>
            )}

            <button
              className="lg:hidden p-2.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 mx-4 p-4 rounded-3xl bg-black/90 border border-white/10 backdrop-blur-3xl shadow-2xl fade-up">
            {/* Main links */}
            <div className="space-y-1 mb-4 pb-4 border-b border-white/5">
              {[...leftLinks, ...dropdowns.flatMap(d => d.items)].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                    isActive(link.href)
                      ? 'text-[var(--brand)] bg-[var(--brand)]/10'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {'icon' in link && link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
            {session && (
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="w-full text-left px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </header>

    </>
  );
}

