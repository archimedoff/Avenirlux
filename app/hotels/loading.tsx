export default function HotelsLoading() {
  return (
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section className="glass-card p-8 sm:p-10 skeleton-shimmer">
        <div className="skeleton-card__line w-28" />
        <div className="skeleton-card__line mt-4 h-8 w-72 max-w-full" />
        <div className="skeleton-card__line mt-4 w-[28rem] max-w-full" />
      </section>
      <section className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton-card skeleton-shimmer">
            <div className="skeleton-card__media" />
            <div className="skeleton-card__body">
              <div className="skeleton-card__line skeleton-card__line--med" />
              <div className="skeleton-card__line skeleton-card__line--short" />
              <div className="skeleton-card__line w-full" />
              <div className="skeleton-card__line mt-2 w-[55%]" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
