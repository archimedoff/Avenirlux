"use client";

import type { AvailabilityStatus, LuxuryCategory } from "@/lib/hotel-types";
import { LUXURY_AMENITY_OPTIONS, type HotelsFilterState } from "@/lib/hotels-filter";

const CATEGORY_OPTIONS: { id: LuxuryCategory; label: string }[] = [
  { id: "beachfront", label: "Beachfront" },
  { id: "spa", label: "Spa" },
  { id: "villa", label: "Villa" },
  { id: "resort", label: "Resort" },
  { id: "penthouse", label: "Penthouse" },
];

const STAR_OPTIONS = [
  { value: "", label: "Any stars" },
  { value: "4", label: "4★+" },
  { value: "4.5", label: "4.5★+" },
  { value: "5", label: "5★ only" },
];

type Props = {
  filters: HotelsFilterState;
  onChange: (next: HotelsFilterState) => void;
  onClear: () => void;
  className?: string;
};

export function HotelsFiltersPanel({ filters, onChange, onClear, className = "" }: Props) {
  const set = (patch: Partial<HotelsFilterState>) => onChange({ ...filters, ...patch });

  const toggleCategory = (cat: LuxuryCategory) => {
    const current = filters.categories || [];
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    set({ categories: next.length ? next : undefined });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    const next = current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity];
    set({ amenities: next.length ? next : undefined });
  };

  return (
    <div className={`hotels-filters glass-card ${className}`}>
      <div className="hotels-filters__head">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Refine</p>
        <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={onClear}>Clear</button>
      </div>

      <label className="hotels-filters__group">
        <span>Price range (USD / night)</span>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Min" className="input-premium" value={filters.minPrice ?? ""} onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
          <input type="number" placeholder="Max" className="input-premium" value={filters.maxPrice ?? ""} onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </label>

      <label className="hotels-filters__group">
        <span>Guest rating</span>
        <select className="input-premium" value={filters.minRating ?? ""} onChange={(e) => set({ minRating: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">Any</option>
          <option value="4.5">4.5+</option>
          <option value="4.7">4.7+</option>
          <option value="4.9">4.9+</option>
        </select>
      </label>

      <label className="hotels-filters__group">
        <span>Star rating</span>
        <select className="input-premium" value={filters.minStars ?? ""} onChange={(e) => set({ minStars: e.target.value ? Number(e.target.value) : undefined })}>
          {STAR_OPTIONS.map((o) => (
            <option key={o.value || "any"} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label className="hotels-filters__group">
        <span>Availability</span>
        <select className="input-premium" value={filters.availability ?? ""} onChange={(e) => set({ availability: (e.target.value || undefined) as AvailabilityStatus | undefined })}>
          <option value="">Any</option>
          <option value="available">Available</option>
          <option value="limited">Limited</option>
        </select>
      </label>

      <div className="hotels-filters__group">
        <span>Luxury style</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(({ id, label }) => {
            const active = filters.categories?.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggleCategory(id)} className={`hotels-filter-chip ${active ? "hotels-filter-chip--active" : ""}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hotels-filters__group">
        <span>Amenities</span>
        <div className="flex flex-wrap gap-2">
          {LUXURY_AMENITY_OPTIONS.map((amenity) => {
            const active = filters.amenities?.includes(amenity);
            return (
              <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`hotels-filter-chip ${active ? "hotels-filter-chip--active" : ""}`}>
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
