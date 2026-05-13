import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-[var(--primary)] mb-4">404</h1>
      <h2 className="text-xl font-semibold text-[var(--text-body)] mb-2">Page not found</h2>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary px-6 py-2.5 text-sm">
        Go home
      </Link>
    </div>
  );
}
