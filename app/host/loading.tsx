export default function HostLoading() {
  return (
    <div className="dash-root space-y-8 pb-safe">
      <div className="glass-card p-8 skeleton-shimmer">
        <div className="skeleton-card__line w-28" />
        <div className="skeleton-card__line mt-4 h-9 w-56 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-6 skeleton-shimmer">
            <div className="skeleton-card__line h-32 w-full" />
            <div className="skeleton-card__line mt-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
