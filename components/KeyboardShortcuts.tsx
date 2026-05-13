'use client';

import { useEffect, useState } from 'react';
import { useSearchOverlay } from '@/components/SearchOverlay';

const SHORTCUTS = [
  { key: '/', description: 'Search teams, leagues & players' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'g then h', description: 'Go to Scores (home)' },
  { key: 'g then l', description: 'Go to Leagues' },
  { key: 'g then w', description: 'Go to World Cup' },
  { key: 'g then f', description: 'Go to Favorites' },
];

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const { setOpen: setSearchOpen } = useSearchOverlay();

  useEffect(() => {
    let pressedG = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      if (e.key === 'g' && !pressedG) {
        pressedG = true;
        setTimeout(() => { pressedG = false; }, 500);
        return;
      }

      if (pressedG) {
        pressedG = false;
        switch (e.key) {
          case 'h': window.location.href = '/'; break;
          case 'l': window.location.href = '/leagues'; break;
          case 'w': window.location.href = '/world-cup'; break;
          case 'f': window.location.href = '/favorites'; break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="card max-w-sm w-full mx-4 fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="section-title text-lg mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <kbd className="px-2 py-1 rounded-[4px] text-xs font-mono font-semibold bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-body)]">
                {s.key}
              </kbd>
              <span className="text-[var(--text-muted)] ml-4">{s.description}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowHelp(false)}
          className="btn-primary w-full mt-5 text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
