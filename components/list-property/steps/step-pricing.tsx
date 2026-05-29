"use client";

import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

const CURRENCIES = ["USD", "EUR", "GBP", "AED"];

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepPricing({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="dash-field">
        <span>{t("fields.basePrice")}</span>
        <input
          type="number"
          min={0}
          className="input-premium"
          value={form.pricePerNight}
          onChange={(e) => onChange({ pricePerNight: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.weekendPrice")}</span>
        <input
          type="number"
          min={0}
          className="input-premium"
          value={form.weekendPrice}
          onChange={(e) => onChange({ weekendPrice: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.cleaningFee")}</span>
        <input
          type="number"
          min={0}
          className="input-premium"
          value={form.cleaningFee}
          onChange={(e) => onChange({ cleaningFee: Number(e.target.value) })}
        />
      </label>
      <label className="dash-field">
        <span>{t("fields.currency")}</span>
        <select
          className="input-premium"
          value={form.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
