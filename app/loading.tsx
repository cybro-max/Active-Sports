export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 w-48 rounded mb-8" style={{ background: 'var(--bg-surface)' }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Card skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {/* Sidebar skeletons */}
          <div className="card p-5 h-64" />
          <div className="card p-5 h-48" />
        </div>
      </div>
    </div>
  );
}
