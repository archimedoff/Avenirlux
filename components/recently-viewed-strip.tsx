"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getRecentlyViewed, type RecentHotel } from "@/lib/recently-viewed";

export function RecentlyViewedStrip() {
  const [items, setItems] = useState<RecentHotel[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
        Recently viewed
      </p>
      <div className="luxury-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
        {items.map((h) => (
          <Link
            key={h.id}
            href={`/hotel/${h.id}`}
            className="group min-w-[72%] snap-start overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] sm:min-w-[40%] lg:min-w-[28%]"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img src={h.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">{h.city}</p>
              <p className="mt-1 font-display text-lg font-medium tracking-[-0.02em]">{h.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
