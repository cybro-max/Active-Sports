/**
 * Reusable skeleton loader components using the existing `.skeleton` CSS class.
 * Provides visual feedback during data fetching across all pages.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`card p-4 space-y-3 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPlayerCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`card p-8 space-y-4 ${className}`}>
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-subtle)' }}>
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFixtureList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 justify-end">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
            <div className="flex flex-col items-center min-w-[72px] gap-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}