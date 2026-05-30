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
    <section className="space-y-5">
      <p className="eyebrow eyebrow-gold">Recently viewed</p>
      <div className="luxury-scrollbar flex snap-x gap-5 overflow-x-auto pb-2">
        {items.map((h) => (
          <Link
            key={h.id}
            href={`/hotel/${h.id}`}
            className="group min-w-[78%] snap-start overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] sm:min-w-[42%] lg:min-w-[30%]"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={h.image} alt="" className="h-full w-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.05]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080807]/80 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="eyebrow text-white/55">{h.city}</p>
                <p className="font-display mt-1 text-lg font-light tracking-[-0.02em] text-white">{h.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
