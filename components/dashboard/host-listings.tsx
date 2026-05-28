"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { HostListingRecord } from "@/lib/db/types";
import { formatCurrency } from "@/lib/dashboard/format";

const hostNav = [
  { href: "/host", label: "Overview", icon: "◈" },
  { href: "/host/listings", label: "Listings", icon: "◇" },
  { href: "/host/bookings", label: "Bookings", icon: "◉" },
  { href: "/host/calendar", label: "Calendar", icon: "◌" },
  { href: "/host/analytics", label: "Analytics", icon: "◎" },
  { href: "/list-property", label: "Add property", icon: "＋" },
];

export function HostListingsClient({ listings }: { listings: HostListingRecord[] }) {
  const router = useRouter();
  const [items, setItems] = useState(listings);

  const remove = async (id: string) => {
    if (!confirm("Remove this listing?")) return;
    await fetch(`/api/host/listings/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((l) => l.id !== id));
    router.refresh();
  };

  return (
    <DashboardShell title="Your listings" subtitle="Edit pricing, rooms, and availability" nav={hostNav} badge="Host">
      <div className="mb-6 flex justify-end">
        <Link href="/list-property" className="btn-primary">Add property</Link>
      </div>
      {items.length === 0 ? (
        <div className="dash-panel text-center py-12">
          <p className="text-[var(--foreground-muted)]">No properties yet.</p>
          <Link href="/list-property" className="btn-primary mt-4 inline-flex">Start listing</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((listing) => (
            <article key={listing.id} className="dash-listing-card">
              <img src={listing.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"} alt="" className="dash-listing-thumb" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-medium">{listing.name}</h3>
                  <span className={`dash-status dash-status--${listing.status}`}>{listing.status.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">{listing.city}, {listing.country}</p>
                <p className="mt-1 text-sm font-semibold">From {formatCurrency(listing.pricePerNight)}/night</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link href={`/host/listings/${listing.id}`} className="btn-secondary text-sm">Edit</Link>
                <button type="button" onClick={() => remove(listing.id)} className="btn-ghost text-sm text-red-700">Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
