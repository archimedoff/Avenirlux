export default function HotelDetailLoading() {
  return (
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section className="skeleton-card skeleton-shimmer">
        <div className="h-[24rem] w-full sm:h-[30rem]" />
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-10">
        <div className="space-y-6">
          <div className="glass-card p-7 sm:p-10 skeleton-shimmer">
            <div className="skeleton-card__line h-8 w-3/4" />
            <div className="skeleton-card__line mt-3 w-full" />
            <div className="skeleton-card__line mt-2 w-[90%]" />
            <div className="skeleton-card__line mt-2 w-[70%]" />
          </div>
          <div className="glass-card p-7 sm:p-10 skeleton-shimmer">
            <div className="skeleton-card__line w-40" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-card__line h-11 w-full" />
              ))}
            </div>
          </div>
        </div>
        <aside className="glass-card p-6 sm:p-8 skeleton-shimmer">
          <div className="skeleton-card__line w-24" />
          <div className="skeleton-card__line mt-4 h-10 w-44" />
          <div className="skeleton-card__line mt-5 h-20 w-full" />
          <div className="skeleton-card__line mt-3 h-10 w-full" />
          <div className="skeleton-card__line mt-3 h-10 w-full" />
        </aside>
      </section>
    </main>
  );
}
