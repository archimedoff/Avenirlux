"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { BookingRequestRecord } from "@/lib/db/types";
import { formatCurrency } from "@/lib/dashboard/format";

const hostNav = [
  { href: "/host", label: "Overview", icon: "◈" },
  { href: "/host/listings", label: "Listings", icon: "◇" },
  { href: "/host/bookings", label: "Bookings", icon: "◉" },
  { href: "/host/calendar", label: "Calendar", icon: "◌" },
  { href: "/host/analytics", label: "Analytics", icon: "◎" },
  { href: "/list-property", label: "Add property", icon: "＋" },
];

export function HostBookingsClient({ requests }: { requests: BookingRequestRecord[] }) {
  const router = useRouter();
  const [items, setItems] = useState(requests);

  const setStatus = async (id: string, status: "confirmed" | "declined") => {
    const res = await fetch(`/api/host/booking-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((r) => (r.id === id ? data.request : r)));
      router.refresh();
    }
  };

  return (
    <DashboardShell title="Reservations" subtitle="Manage guest requests and confirmed stays" nav={hostNav} badge="Host">
      {items.length === 0 ? (
        <div className="dash-panel py-12 text-center text-sm text-[var(--foreground-muted)]">No reservations yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <article key={r.id} className="dash-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{r.guestName}</p>
                  {r.kind === "guest_booking" && (
                    <span className="rounded-full border border-[rgba(201,169,98,0.35)] px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--luxury-gold-muted)]">
                      Instant
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">{r.guestEmail}</p>
                <p className="mt-2 text-sm">{r.checkIn} → {r.checkOut} · {r.guests} guests · {r.roomName}</p>
                {r.confirmationRef && (
                  <p className="mt-1 font-mono text-xs text-[var(--foreground-subtle)]">Ref {r.confirmationRef}</p>
                )}
                <p className="mt-1 font-semibold">{formatCurrency(r.total)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`dash-status dash-status--${r.status === "pending" ? "pending_review" : r.status}`}>{r.status}</span>
                {r.kind !== "guest_booking" && r.status === "pending" && (
                  <>
                    <button type="button" className="btn-primary text-sm" onClick={() => setStatus(r.id, "confirmed")}>Accept</button>
                    <button type="button" className="btn-ghost text-sm" onClick={() => setStatus(r.id, "declined")}>Decline</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
