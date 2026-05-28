"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { HostListingRecord } from "@/lib/db/types";

const hostNav = [
  { href: "/host", label: "Overview", icon: "◈" },
  { href: "/host/listings", label: "Listings", icon: "◇" },
  { href: "/host/bookings", label: "Bookings", icon: "◉" },
  { href: "/host/calendar", label: "Calendar", icon: "◌" },
  { href: "/host/analytics", label: "Analytics", icon: "◎" },
  { href: "/list-property", label: "Add property", icon: "＋" },
];

const TABS = ["Details", "Images", "Rooms", "Pricing", "Availability"] as const;

export function HostListingEditor({ listing }: { listing: HostListingRecord }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Details");
  const [form, setForm] = useState(listing);
  const [saving, setSaving] = useState(false);
  const [galleryInput, setGalleryInput] = useState("");
  const [roomDraft, setRoomDraft] = useState({ name: "", pricePerNight: 400, maxGuests: 2, description: "" });

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

  const publish = () => save({ status: "pending_review" });

  return (
    <DashboardShell title={form.name} subtitle="Manage your residence" nav={hostNav} badge="Host">
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`dash-tab ${tab === t ? "dash-tab--active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>Name</span>
            <input className="input-premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="dash-field">
            <span>Description</span>
            <textarea className="input-premium min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="dash-field">
            <span>Location</span>
            <input className="input-premium" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="dash-field">
              <span>City</span>
              <input className="input-premium" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="dash-field">
              <span>Country</span>
              <input className="input-premium" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </label>
          </div>
          <label className="dash-field">
            <span>Amenities (comma-separated)</span>
            <input className="input-premium" value={form.amenities.join(", ")} onChange={(e) => setForm({ ...form, amenities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </label>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ name: form.name, description: form.description, location: form.location, city: form.city, country: form.country, amenities: form.amenities })}>
            Save details
          </button>
        </div>
      )}

      {tab === "Images" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>Cover image URL</span>
            <input className="input-premium" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          {form.image && <img src={form.image} alt="" className="aspect-video w-full max-w-md rounded-[var(--radius-lg)] object-cover" />}
          <label className="dash-field">
            <span>Add gallery URL</span>
            <div className="flex gap-2">
              <input className="input-premium flex-1" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="https://..." />
              <button type="button" className="btn-secondary" onClick={() => { if (galleryInput) { setForm({ ...form, gallery: [...form.gallery, galleryInput] }); setGalleryInput(""); } }}>Add</button>
            </div>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {form.gallery.map((url, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" className="absolute right-1 top-1 rounded bg-black/50 px-1 text-xs text-white" onClick={() => setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })}>×</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ image: form.image, gallery: form.gallery })}>Save images</button>
        </div>
      )}

      {tab === "Rooms" && (
        <div className="dash-panel space-y-4">
          {form.rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-[var(--border)] p-4">
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{formatCurrency(room.pricePerNight)}/night · {room.maxGuests} guests</p>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input-premium" placeholder="Room name" value={roomDraft.name} onChange={(e) => setRoomDraft({ ...roomDraft, name: e.target.value })} />
            <input className="input-premium" type="number" placeholder="Price/night" value={roomDraft.pricePerNight} onChange={(e) => setRoomDraft({ ...roomDraft, pricePerNight: Number(e.target.value) })} />
          </div>
          <button type="button" className="btn-secondary" onClick={() => {
            const id = `room-${Date.now()}`;
            const rooms = [...form.rooms, { id, ...roomDraft, description: roomDraft.description || "Premium room" }];
            setForm({ ...form, rooms });
            setRoomDraft({ name: "", pricePerNight: 400, maxGuests: 2, description: "" });
            save({ rooms });
          }}>Add room</button>
        </div>
      )}

      {tab === "Pricing" && (
        <div className="dash-panel space-y-4">
          <label className="dash-field">
            <span>Base price per night (USD)</span>
            <input type="number" className="input-premium" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
          </label>
          <p className="text-sm text-[var(--foreground-muted)]">Commission rate: {(form.commissionRate * 100).toFixed(0)}% — marketplace fee applied on booking.</p>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ pricePerNight: form.pricePerNight })}>Save pricing</button>
        </div>
      )}

      {tab === "Availability" && (
        <div className="dash-panel space-y-4">
          <p className="text-sm text-[var(--foreground-muted)]">Block dates and control inventory — full calendar sync in production.</p>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 28 }, (_, i) => (
              <button key={i} type="button" className="rounded-md border border-[var(--border)] py-2 hover:bg-[var(--surface-muted)]">
                {i + 1}
              </button>
            ))}
          </div>
          <label className="dash-field">
            <span>Cancellation policy</span>
            <textarea className="input-premium" rows={3} value={form.cancellationPolicy} onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })} />
          </label>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => save({ cancellationPolicy: form.cancellationPolicy })}>Save policy</button>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {form.status === "draft" && (
          <button type="button" className="btn-primary" onClick={publish}>Submit for review</button>
        )}
        <Link href="/host/listings" className="btn-ghost">← Back</Link>
      </div>
    </DashboardShell>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
