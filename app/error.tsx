'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-[var(--primary)] mb-4">Something went wrong</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary px-6 py-2.5 text-sm">
        Try again
      </button>
    </div>
  );
}
