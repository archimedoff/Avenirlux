"use client";

import { AMENITY_IDS, type ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepAmenities({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  const toggle = (id: (typeof AMENITY_IDS)[number]) => {
    const next = form.amenities.includes(id)
      ? form.amenities.filter((a) => a !== id)
      : [...form.amenities, id];
    onChange({ amenities: next });
  };

  return (
    <div className="amenities-grid">
      {AMENITY_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`amenity-chip ${form.amenities.includes(id) ? "amenity-chip--active" : ""}`}
          onClick={() => toggle(id)}
        >
          {t(`amenities.${id}`)}
        </button>
      ))}
    </div>
  );
}
