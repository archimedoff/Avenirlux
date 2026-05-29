"use client";

import { PROPERTY_TYPES } from "@/lib/listing/types";
import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepType({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--foreground-muted)]">{t("fields.propertyType")}</p>
      <div className="property-type-grid">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt.id}
            type="button"
            className={`property-type-card ${form.propertyType === pt.id ? "property-type-card--active" : ""}`}
            onClick={() => onChange({ propertyType: pt.id })}
          >
            <span className="property-type-card__icon" aria-hidden>{pt.icon}</span>
            <span className="property-type-card__label">{t(`propertyTypes.${pt.labelKey}.title`)}</span>
            <span className="property-type-card__subtitle">{t(`propertyTypes.${pt.labelKey}.subtitle`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
