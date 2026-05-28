export default function AdminLoading() {
  return (
    <div className="dash-root space-y-8 pb-safe">
      <div className="glass-card p-8 skeleton-shimmer">
        <div className="skeleton-card__line w-32" />
        <div className="skeleton-card__line mt-4 h-9 w-64 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 skeleton-shimmer">
            <div className="skeleton-card__line w-20" />
            <div className="skeleton-card__line mt-3 h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="glass-card h-64 skeleton-shimmer" />
    </div>
  );
}
