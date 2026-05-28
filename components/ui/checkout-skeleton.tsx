export function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
      <section className="glass-card space-y-6 p-6 sm:p-8 skeleton-shimmer">
        <div className="skeleton-card__line w-48" />
        <div className="skeleton-card__line mt-6 h-10 w-full" />
        <div className="skeleton-card__line mt-3 h-10 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="skeleton-card__line h-10 w-full" />
          <div className="skeleton-card__line h-10 w-full" />
        </div>
        <div className="skeleton-card__line h-24 w-full" />
      </section>
      <aside className="glass-card p-6 sm:p-8 skeleton-shimmer">
        <div className="skeleton-card__line w-32" />
        <div className="skeleton-card__line mt-4 h-10 w-40" />
        <div className="skeleton-card__line mt-5 h-28 w-full" />
        <div className="skeleton-card__line mt-6 h-12 w-full" />
      </aside>
    </div>
  );
}
