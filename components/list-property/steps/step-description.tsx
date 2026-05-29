"use client";

import { generateLuxuryDescription } from "@/lib/listing/generate-description";
import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepDescription({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="space-y-4">
      <label className="dash-field">
        <span>{t("fields.shortDescription")}</span>
        <input
          className="input-premium"
          placeholder={t("fields.shortPlaceholder")}
          value={form.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.fullDescription")}</span>
        <textarea
          className="input-premium min-h-[160px]"
          placeholder={t("fields.fullPlaceholder")}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>
      <button
        type="button"
        className="btn-secondary text-sm"
        onClick={() => {
          const { short, full } = generateLuxuryDescription(form);
          onChange({ shortDescription: short, description: full });
        }}
      >
        {t("fields.generateDescription")}
      </button>
    </div>
  );
}
