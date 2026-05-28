"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthModal } from "@/components/auth/auth-modal-provider";

const STEPS = ["Property", "Images", "Amenities", "Pricing", "Location", "Rooms", "Publish"] as const;
const AMENITY_OPTIONS = ["Pool", "Spa", "Concierge", "Private beach", "Fine dining", "Butler service"];

export function ListPropertyWizard() {
  const { data: session } = useSession();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    country: "",
    location: "",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery: [] as string[],
    amenities: [] as string[],
    pricePerNight: 450,
    rooms: [{ id: "room-1", name: "Signature Suite", description: "Premium suite", pricePerNight: 450, maxGuests: 2 }],
    cancellationPolicy: "Flexible cancellation up to 7 days before arrival.",
  });
  const [galleryUrl, setGalleryUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const publish = async () => {
    if (!session?.user) {
      openAuth("signup");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/host/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "pending_review",
        categories: ["resort"],
        coordinates: { lat: 0, lng: 0 },
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/host/listings/${data.listing.id}`);
    }
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="list-wizard page-enter">
      <div className="list-wizard-header">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">List property</p>
        <h1 className="font-display mt-2 text-3xl font-medium tracking-[-0.03em]">Share your residence</h1>
        <div className="list-wizard-progress mt-6"><div className="list-wizard-progress-bar" style={{ width: `${progress}%` }} /></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button key={s} type="button" onClick={() => setStep(i)} className={`list-wizard-step ${i === step ? "list-wizard-step--active" : ""}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="glass-card mt-8 space-y-4 p-6 sm:p-10">
        {current === "Property" && (
          <>
            <label className="dash-field"><span>Name</span><input className="input-premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="dash-field"><span>Description</span><textarea className="input-premium min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          </>
        )}
        {current === "Images" && (
          <>
            <label className="dash-field"><span>Cover URL</span><input className="input-premium" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
            <div className="flex gap-2">
              <input className="input-premium flex-1" value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} />
              <button type="button" className="btn-secondary" onClick={() => galleryUrl && (setForm({ ...form, gallery: [...form.gallery, galleryUrl] }), setGalleryUrl(""))}>Add</button>
            </div>
          </>
        )}
        {current === "Amenities" && (
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button key={a} type="button" className={`rounded-full border px-4 py-2 text-sm ${form.amenities.includes(a) ? "bg-[var(--luxury-ink)] text-white" : ""}`} onClick={() => setForm({ ...form, amenities: form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a] })}>{a}</button>
            ))}
          </div>
        )}
        {current === "Pricing" && (
          <label className="dash-field"><span>Price/night</span><input type="number" className="input-premium max-w-xs" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} /></label>
        )}
        {current === "Location" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="dash-field"><span>City</span><input className="input-premium" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label className="dash-field"><span>Country</span><input className="input-premium" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
            <label className="dash-field sm:col-span-2"><span>Area</span><input className="input-premium" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
          </div>
        )}
        {current === "Rooms" && <p className="text-sm text-[var(--foreground-muted)]">Signature suite included. Add rooms after publish.</p>}
        {current === "Publish" && <p className="text-center text-sm">Submit for AvenirLux curation review.</p>}
        <div className="flex justify-between pt-4">
          <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)}>Continue</button>
          ) : (
            <button type="button" className="btn-primary" disabled={submitting} onClick={publish}>{submitting ? "Submitting…" : "Publish"}</button>
          )}
        </div>
      </div>
      <p className="mt-6 text-center text-sm"><Link href="/host">Host dashboard</Link></p>
    </div>
  );
}
