"use client";

import { AMENITY_IDS, type AmenityId } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  value: AmenityId[];
  onChange: (ids: AmenityId[]) => void;
};

export function AmenityPicker({ value, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  const toggle = (id: AmenityId) => {
    if (value.includes(id)) onChange(value.filter((a) => a !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {AMENITY_IDS.map((id) => {
        const active = value.includes(id);
        return (
          <button
            key={id}
            type="button"
            className={`amenity-chip ${active ? "amenity-chip--active" : ""}`}
            onClick={() => toggle(id)}
          >
            {t(`amenities.${id}`)}
          </button>
        );
      })}
    </div>
  );
}
