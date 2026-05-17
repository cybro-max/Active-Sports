'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Shield, Command, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SearchResult {
  name: string;
  photo: string;
  subtitle: string;
  url: string;
  type: 'player' | 'team' | 'league';
}

interface SearchContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchContext.Provider value={{ isOpen, setOpen: setIsOpen, open: isOpen }}>
      {children}
      <SearchOverlayContent />
    </SearchContext.Provider>
  );
}

export function useSearchOverlay() {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearchOverlay must be used within a SearchProvider');
  return context;
}

function SearchOverlayContent() {
  const { isOpen, setOpen } = useSearchOverlay();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ players: SearchResult[], teams: SearchResult[] }>({ players: [], teams: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults({ players: [], teams: [] });
  }, [setOpen]);

  // Hotkey listener (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') closeSearch();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const allResults = [...results.teams, ...results.players];

  const handleNavigate = (url: string) => {
    router.push(url);
    closeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (allResults.length || 1)) % (allResults.length || 1));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      handleNavigate(allResults[selectedIndex].url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeSearch} />

          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 relative z-10"
            onKeyDown={handleKeyDown}
          >
            <div className="relative flex items-center p-6 border-b border-white/5 bg-white/[0.02]">
              <Search className="w-6 h-6 text-[var(--text-muted)] mr-4" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players, teams, or leagues..."
                className="w-full bg-transparent border-none outline-none text-xl font-display font-medium text-white placeholder:text-white/20"
              />
              <div className="flex items-center gap-2">
                {isLoading && <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  ESC
                </kbd>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {!query && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Command className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">Command Intelligence</h3>
                  <p className="text-sm text-[var(--text-muted)]">Type to instantly jump to any player or club profile</p>
                </div>
              )}

              {query && allResults.length === 0 && !isLoading && (
                <div className="py-12 text-center text-[var(--text-muted)]">
                  No results found for &ldquo;<span className="text-white">{query}</span>&rdquo;
                </div>
              )}

              {results.teams.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Football Clubs</span>
                  </div>
                  <div className="space-y-1">
                    {results.teams.map((t, i) => {
                      const isActive = i === selectedIndex;
                      return (
                        <button
                          key={t.url}
                          onClick={() => handleNavigate(t.url)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--brand)]/10 ring-1 ring-[var(--brand)]/20' : 'hover:bg-white/5'}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-2">
                            <Image src={t.photo} alt="" width={24} height={24} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-white">{t.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t.subtitle}</div>
                          </div>
                          {isActive && <ArrowRight className="w-4 h-4 text-[var(--brand)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.players.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Athletes</span>
                  </div>
                  <div className="space-y-1">
                    {results.players.map((p, i) => {
                      const idx = results.teams.length + i;
                      const isActive = idx === selectedIndex;
                      return (
                        <button
                          key={p.url}
                          onClick={() => handleNavigate(p.url)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/20' : 'hover:bg-white/5'}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden">
                            <Image src={p.photo} alt="" width={40} height={40} className="object-cover" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-white">{p.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{p.subtitle}</div>
                          </div>
                          {isActive && <ArrowRight className="w-4 h-4 text-[var(--accent)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><kbd className="px-1 py-0.5 rounded bg-white/10 text-white">↵</kbd> Select</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1 py-0.5 rounded bg-white/10 text-white">↑↓</kbd> Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                ActiveSports Intelligence <div className="w-1 h-1 rounded-full bg-[var(--brand)] animate-pulse" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Default export is the provider
export default SearchProvider;
