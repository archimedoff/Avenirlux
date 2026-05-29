"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { HostListingRecord } from "@/lib/db/types";
import { formatCurrency } from "@/lib/dashboard/format";
import { useTranslations } from "@/lib/i18n/use-translations";

export function HostListingsClient({ listings }: { listings: HostListingRecord[] }) {
  const router = useRouter();
  const { t } = useTranslations("host");
  const { t: tList } = useTranslations("listProperty");
  const [items, setItems] = useState(listings);

  const hostNav = useMemo(
    () => [
      { href: "/host", label: t("overview"), icon: "◈" },
      { href: "/host/listings", label: t("listings"), icon: "◇" },
      { href: "/host/bookings", label: t("bookings"), icon: "◉" },
      { href: "/host/calendar", label: t("calendar"), icon: "◌" },
      { href: "/host/analytics", label: t("analytics"), icon: "◎" },
      { href: "/list-property", label: t("addProperty"), icon: "＋" },
    ],
    [t],
  );

  const remove = async (id: string) => {
    if (!confirm(t("removeConfirm"))) return;
    await fetch(`/api/host/listings/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((l) => l.id !== id));
    router.refresh();
  };

  const propertyTypeLabel = (listing: HostListingRecord) => {
    const pt = listing.metadata?.propertyType;
    if (!pt) return null;
    return tList(`propertyTypes.${pt}.title`);
  };

  return (
    <DashboardShell title={t("listingsTitle")} subtitle={t("listingsSubtitle")} nav={hostNav} badge={t("badge")}>
      <div className="mb-6 flex justify-end">
        <Link href="/list-property" className="btn-primary">
          {t("addProperty")}
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="dash-panel text-center py-12">
          <p className="text-[var(--foreground-muted)]">{t("noProperties")}</p>
          <Link href="/list-property" className="btn-primary mt-4 inline-flex">
            {t("startListing")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((listing) => (
            <article key={listing.id} className="dash-listing-card">
              <img
                src={listing.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                alt=""
                className="dash-listing-thumb"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-medium">{listing.name}</h3>
                  <span className={`dash-status dash-status--${listing.status}`}>
                    {listing.status.replace("_", " ")}
                  </span>
                  {propertyTypeLabel(listing) ? (
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                      {propertyTypeLabel(listing)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {listing.city}, {listing.country}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {t("fromPerNight", { amount: formatCurrency(listing.pricePerNight) })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link href={`/host/listings/${listing.id}`} className="btn-secondary text-sm">
                  {t("edit")}
                </Link>
                <button type="button" onClick={() => remove(listing.id)} className="btn-ghost text-sm text-red-700">
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
