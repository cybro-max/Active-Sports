/**
 * AsyncSection — Renders one of four states based on data fetching status:
 * 1. Loading → skeleton
 * 2. Error → fallback with retry
 * 3. Empty → "No data" fallback
 * 4. Success → children
 */

import { AlertTriangle } from 'lucide-react';
import FallbackState from './FallbackState';

interface AsyncSectionProps {
  /** True while data is being fetched (for client components) */
  isLoading?: boolean;
  /** Error message if fetch failed */
  error?: string | null;
  /** True if data was fetched successfully but is empty */
  isEmpty?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Custom empty state icon */
  emptyIcon?: string | React.ReactNode;
  /** Custom error message */
  errorMessage?: string;
  /** Skeleton component to show during loading */
  skeleton?: React.ReactNode;
  /** The actual content */
  children: React.ReactNode;
  /** Title for empty/error states */
  title?: string;
}

export default function AsyncSection({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
    emptyIcon = <AlertTriangle className="w-6 h-6 text-[var(--text-muted)]" />,
  errorMessage,
  skeleton,
  children,
  title,
}: AsyncSectionProps) {
  // Loading state
  if (isLoading) {
    return skeleton ? (
      <>{skeleton}</>
    ) : (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <FallbackState
        icon={<AlertTriangle className="w-6 h-6 text-[var(--danger)]" />}
        variant="error"
        title={title || 'Failed to load'}
        message={errorMessage || error || 'An unexpected error occurred'}
        action={{
          label: 'Try Again',
          onClick: () => typeof window !== 'undefined' && window.location.reload(),
        }}
      />
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <FallbackState
        icon={emptyIcon}
        variant="empty"
        title={title || 'Nothing to show'}
        message={emptyMessage || 'No data is available at this time.'}
      />
    );
  }

  // Success state — render children
  return <>{children}</>;
}