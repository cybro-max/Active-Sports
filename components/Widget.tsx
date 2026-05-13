'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WidgetProps {
  type: string;
  id?: number | string;
  league?: number | string;
  season?: number | string;
  team?: number | string;
  theme?: string;
  [key: string]: any;
}

function WidgetSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-white/5" />
          <div className="h-2 w-1/4 rounded bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-white/5" />
          <div className="h-4 w-1/2 rounded bg-white/5" />
          <div className="h-4 w-2/3 rounded bg-white/5" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-2/3 rounded bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-white/5" />
          <div className="h-4 w-1/2 rounded bg-white/5" />
        </div>
      </div>
      <div className="h-20 rounded-lg bg-white/5" />
    </div>
  );
}

function WidgetError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm font-bold text-[var(--text-muted)] mb-1">Widget failed to load</p>
      <p className="text-xs text-[var(--text-muted)]/60 mb-4">The external content could not be displayed.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export default function Widget({ type, id, league, season, team, theme = 'dark', ...props }: WidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    setHasError(false);
  }, [retryKey]);

  useEffect(() => {
    if (!mounted) return;
    const el = document.querySelector(`[data-widget-id="${type}-${id || team || league || ''}"]`);
    if (!el) return;
    const handler = () => setHasError(true);
    el.addEventListener('error', handler);
    return () => el.removeEventListener('error', handler);
  }, [mounted, type, id, team, league, retryKey]);

  const handleRetry = () => {
    setHasError(false);
    setRetryKey(k => k + 1);
  };

  if (!mounted) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden min-h-[200px]">
        <WidgetSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <WidgetError onRetry={handleRetry} />
      </div>
    );
  }

  const attrs: Record<string, any> = {
    'data-type': type,
    'data-theme': theme,
    'data-widget-id': `${type}-${id || team || league || ''}`,
  };

  if (id) attrs['data-id'] = id;
  if (league) attrs['data-league'] = league;
  if (season) attrs['data-season'] = season;
  if (team) attrs['data-team'] = team;

  Object.keys(props).forEach(key => {
    if (key.startsWith('data-')) {
      attrs[key] = props[key];
    }
  });

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10">
      <api-sports-widget {...attrs}></api-sports-widget>
    </div>
  );
}
