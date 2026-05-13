'use client';
import { Activity } from 'lucide-react';

/**
 * FallbackState — Displays a consistent empty/error/loading state
 * Used across all pages when API data is unavailable or an error occurs.
 */

interface FallbackStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'empty' | 'error' | 'info';
}

export default function FallbackState({
  icon = <Activity className="w-6 h-6 text-[var(--brand)]" />,
  title = 'No data available',
  message = 'Information could not be loaded. This may be due to API limits or a temporary outage.',
  action,
  variant = 'empty',
}: FallbackStateProps) {
  const colors = {
    empty: {
      background: 'var(--bg-subtle)',
      iconBg: 'var(--bg-subtle)',
    },
    error: {
      background: 'rgba(220,38,38,0.06)',
      iconBg: 'rgba(220,38,38,0.1)',
    },
    info: {
      background: 'rgba(30,64,175,0.06)',
      iconBg: 'rgba(30,64,175,0.1)',
    },
  };

  const c = colors[variant];

  return (
    <div
      className="rounded-[8px] p-8 text-center"
      style={{ background: c.background }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: c.iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-1 text-[var(--primary)]">
        {title}
      </h3>
      <p className="text-sm max-w-md mx-auto text-[var(--text-muted)]">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary mt-4"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}