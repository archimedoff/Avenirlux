"use client";

import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepLocation({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="dash-field">
          <span>{t("fields.country")}</span>
          <input className="input-premium" value={form.country} onChange={(e) => onChange({ country: e.target.value })} />
        </label>
        <label className="dash-field">
          <span>{t("fields.city")}</span>
          <input className="input-premium" value={form.city} onChange={(e) => onChange({ city: e.target.value })} />
        </label>
        <label className="dash-field sm:col-span-2">
          <span>{t("fields.district")}</span>
          <input className="input-premium" value={form.district} onChange={(e) => onChange({ district: e.target.value })} />
        </label>
        <label className="dash-field sm:col-span-2">
          <span>{t("fields.address")}</span>
          <input className="input-premium" value={form.address} onChange={(e) => onChange({ address: e.target.value })} />
        </label>
        <label className="dash-field sm:col-span-2">
          <span>{t("fields.landmarks")}</span>
          <input
            className="input-premium"
            placeholder={t("fields.landmarksPlaceholder")}
            value={form.landmarks}
            onChange={(e) => onChange({ landmarks: e.target.value })}
          />
        </label>
      </div>
      <div className="listing-map-placeholder" role="img" aria-label={t("fields.mapPlaceholder")}>
        <p className="text-sm text-[var(--foreground-muted)]">{t("fields.mapPlaceholder")}</p>
      </div>
    </div>
  );
}
