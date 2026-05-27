export default function RootLoading() {
  return (
    <main className="space-y-10 pb-8 sm:space-y-12 sm:pb-10">
      <section className="skeleton-card skeleton-shimmer">
        <div className="h-[30rem] w-full sm:h-[36rem]" />
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-card skeleton-shimmer">
            <div className="skeleton-card__media" />
            <div className="skeleton-card__body">
              <div className="skeleton-card__line skeleton-card__line--short" />
              <div className="skeleton-card__line skeleton-card__line--med" />
              <div className="skeleton-card__line w-full" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
