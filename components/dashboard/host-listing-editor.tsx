"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AmenityPicker } from "@/components/host/amenity-picker";
import { PhotoUploader } from "@/components/list-property/photo-uploader";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { HostListingRecord } from "@/lib/db/types";
import { formatCurrency } from "@/lib/dashboard/format";
import { PROPERTY_TYPES, type AmenityId, type PropertyType } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Tab = "details" | "images" | "rooms" | "pricing" | "availability";

export function HostListingEditor({ listing }: { listing: HostListingRecord }) {
  const router = useRouter();
  const { t } = useTranslations("host");
  const { t: tList } = useTranslations("listProperty");
  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState(listing);
  const [saving, setSaving] = useState(false);
  const [roomDraft, setRoomDraft] = useState({ name: "", pricePerNight: 400, maxGuests: 2, description: "" });

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

  const tabs: { id: Tab; label: string }[] = [
    { id: "details", label: t("tabDetails") },
    { id: "images", label: t("tabImages") },
    { id: "rooms", label: t("tabRooms") },
    { id: "pricing", label: t("tabPricing") },
    { id: "availability", label: t("tabAvailability") },
  ];

  const propertyType = (form.metadata?.propertyType ?? "hotel") as PropertyType;
  const amenityIds = (form.amenities.filter((a) => !a.includes(" ")) as AmenityId[]);

  const save = async (patch: Partial<HostListingRecord>) => {
    setSaving(true);
    const res = await fetch(`/api/host/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setForm(data.listing);
      router.refresh();
    }
  };

  const setPropertyType = (pt: PropertyType) => {
    setForm({
      ...form,
      metadata: { ...form.metadata, propertyType: pt },
      categories: [pt, ...(form.categories ?? []).filter((c) => c !== pt)],
    });
  };

  return (
    <DashboardShell title={form.name} subtitle={t("manageSubtitle")} nav={hostNav} badge={t("badge")}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`dash-status dash-status--${form.status}`}>{form.status.replace("_", " ")}</span>
        <span className="text-xs text-[var(--foreground-subtle)]">
          {form.status === "published" ? t("liveOnSite") : t("hiddenFromSite")}
        </span>
      </div>

      <div className="dash-tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`dash-tab ${tab === id ? "dash-tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>{tList("fields.name")}</span>
            <input className="input-premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="dash-field">
            <span>{tList("fields.fullDescription")}</span>
            <textarea
              className="input-premium min-h-[140px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div className="dash-field">
            <span>{t("propertyType")}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  className={`amenity-chip ${propertyType === pt.id ? "amenity-chip--active" : ""}`}
                  onClick={() => setPropertyType(pt.id)}
                >
                  {pt.icon} {tList(`propertyTypes.${pt.id}.title`)}
                </button>
              ))}
            </div>
          </div>
          <label className="dash-field">
            <span>{tList("fields.district")}</span>
            <input className="input-premium" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="dash-field">
              <span>{tList("fields.city")}</span>
              <input className="input-premium" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="dash-field">
              <span>{tList("fields.country")}</span>
              <input className="input-premium" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </label>
          </div>
          <div className="dash-field">
            <span>{tList("steps.amenities")}</span>
            <AmenityPicker
              value={amenityIds}
              onChange={(ids) => setForm({ ...form, amenities: ids })}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() =>
              save({
                name: form.name,
                description: form.description,
                location: form.location,
                city: form.city,
                country: form.country,
                amenities: form.amenities,
                metadata: { ...form.metadata, propertyType },
                categories: form.categories,
              })
            }
          >
            {t("saveDetails")}
          </button>
        </div>
      )}

      {tab === "images" && (
        <div className="dash-panel space-y-4">
          <PhotoUploader
            propertyId={listing.id}
            persistDraft={false}
            cover={form.image}
            gallery={form.gallery}
            onCoverChange={(image) => setForm({ ...form, image })}
            onGalleryChange={(gallery) => setForm({ ...form, gallery })}
          />
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ image: form.image, gallery: form.gallery })}>
            {t("saveImages")}
          </button>
        </div>
      )}

      {tab === "rooms" && (
        <div className="dash-panel space-y-4">
          {form.rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-[var(--border)] p-4">
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {formatCurrency(room.pricePerNight)}/night · {room.maxGuests} guests
              </p>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input-premium" placeholder="Room name" value={roomDraft.name} onChange={(e) => setRoomDraft({ ...roomDraft, name: e.target.value })} />
            <input className="input-premium" type="number" placeholder="Price/night" value={roomDraft.pricePerNight} onChange={(e) => setRoomDraft({ ...roomDraft, pricePerNight: Number(e.target.value) })} />
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const id = `room-${Date.now()}`;
              const rooms = [...form.rooms, { id, ...roomDraft, description: roomDraft.description || "Premium room" }];
              setForm({ ...form, rooms });
              setRoomDraft({ name: "", pricePerNight: 400, maxGuests: 2, description: "" });
              save({ rooms });
            }}
          >
            Add room
          </button>
        </div>
      )}

      {tab === "pricing" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>{tList("fields.basePrice")}</span>
            <input type="number" className="input-premium" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
          </label>
          <p className="text-sm text-[var(--foreground-muted)]">
            Commission: {(form.commissionRate * 100).toFixed(0)}%
          </p>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ pricePerNight: form.pricePerNight })}>
            {t("savePricing")}
          </button>
        </div>
      )}

      {tab === "availability" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>{tList("fields.minNights")}</span>
            <input
              type="number"
              min={1}
              className="input-premium w-32"
              value={form.metadata?.minNights ?? 1}
              onChange={(e) =>
                setForm({
                  ...form,
                  metadata: { ...form.metadata, propertyType, minNights: Number(e.target.value) },
                })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.metadata?.instantBooking ?? false}
              onChange={(e) =>
                setForm({
                  ...form,
                  metadata: { ...form.metadata, propertyType, instantBooking: e.target.checked },
                })
              }
            />
            {tList("fields.instantBooking")}
          </label>
          <label className="dash-field">
            <span>{tList("fields.cancellationPolicy")}</span>
            <textarea className="input-premium" rows={3} value={form.cancellationPolicy} onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })} />
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() =>
              save({
                cancellationPolicy: form.cancellationPolicy,
                metadata: {
                  ...form.metadata,
                  propertyType,
                  minNights: form.metadata?.minNights ?? 1,
                  instantBooking: form.metadata?.instantBooking ?? false,
                },
              })
            }
          >
            {t("savePolicy")}
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {form.status === "published" ? (
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => save({ status: "draft" })}>
            {t("unpublish")}
          </button>
        ) : (
          <>
            <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ status: "published" })}>
              {t("publish")}
            </button>
            {form.status === "draft" && (
              <button type="button" className="btn-secondary" disabled={saving} onClick={() => save({ status: "pending_review" })}>
                {t("submitReview")}
              </button>
            )}
          </>
        )}
        <Link href="/host/listings" className="btn-ghost">
          ← {t("back")}
        </Link>
      </div>
    </DashboardShell>
  );
}
