"use client";

import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepBasics({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="dash-field sm:col-span-2">
        <span>{t("fields.name")}</span>
        <input
          className="input-premium"
          placeholder={t("fields.namePlaceholder")}
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>
      <label className="dash-field sm:col-span-2">
        <span>{t("fields.tagline")}</span>
        <input
          className="input-premium"
          placeholder={t("fields.taglinePlaceholder")}
          value={form.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.guestCapacity")}</span>
        <input
          type="number"
          min={1}
          className="input-premium"
          value={form.guestCapacity}
          onChange={(e) => onChange({ guestCapacity: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.bedrooms")}</span>
        <input
          type="number"
          min={0}
          className="input-premium"
          value={form.bedrooms}
          onChange={(e) => onChange({ bedrooms: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.beds")}</span>
        <input
          type="number"
          min={1}
          className="input-premium"
          value={form.beds}
          onChange={(e) => onChange({ beds: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.bathrooms")}</span>
        <input
          type="number"
          min={1}
          step={0.5}
          className="input-premium"
          value={form.bathrooms}
          onChange={(e) => onChange({ bathrooms: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.squareMeters")}</span>
        <input
          type="number"
          min={0}
          className="input-premium"
          value={form.squareMeters || ""}
          onChange={(e) => onChange({ squareMeters: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.floor")}</span>
        <input
          type="number"
          className="input-premium"
          placeholder="—"
          value={form.floor ?? ""}
          onChange={(e) =>
            onChange({ floor: e.target.value === "" ? undefined : Number(e.target.value) })
          }
        />
      </label>
    </div>
  );
}
