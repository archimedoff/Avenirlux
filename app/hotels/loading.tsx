export default function HotelsLoading() {
  return (
    <div className="hotels-page pb-10">
      <section className="hotels-hero glass-card skeleton-shimmer p-8 sm:p-10">
        <div className="skeleton-card__line w-32" />
        <div className="skeleton-card__line mt-4 h-10 w-4/5 max-w-md" />
        <div className="skeleton-card__line mt-3 w-2/3 max-w-lg" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card__line h-12 w-full" />
          ))}
        </div>
      </section>
      <div className="hotels-layout mt-8">
        <aside className="hidden lg:block">
          <div className="glass-card skeleton-shimmer h-96 w-full max-w-[280px]" />
        </aside>
        <ul className="hotels-results-grid flex-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="skeleton-card skeleton-shimmer overflow-hidden rounded-[var(--radius-card)]">
              <div className="skeleton-card__media aspect-[5/3]" />
              <div className="skeleton-card__body">
                <div className="skeleton-card__line skeleton-card__line--med" />
                <div className="skeleton-card__line w-full" />
                <div className="skeleton-card__line skeleton-card__line--short" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
