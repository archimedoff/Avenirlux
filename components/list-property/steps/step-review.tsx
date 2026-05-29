"use client";

import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";
import { formatCurrency } from "@/lib/dashboard/format";

type Props = {
  form: ListingFormState;
};

export function StepReview({ form }: Props) {
  const { t } = useTranslations("listProperty");
  const location = [form.district, form.city, form.country].filter(Boolean).join(", ");
  const amenityLabels = form.amenities
    .slice(0, 8)
    .map((id) => t(`amenities.${id}`))
    .join(" · ");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-display text-xl">{t("review.title")}</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t("review.body")}</p>
      </div>
      <article className="listing-review-card">
        <div className="listing-review-card__media">
          <img src={form.image} alt="" className="h-full w-full object-cover" />
          <span className="listing-review-card__badge">{t(`propertyTypes.${form.propertyType}.title`)}</span>
        </div>
        <div className="listing-review-card__body">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            {t("review.curatedResidences")}
          </p>
          <h4 className="font-display mt-1 text-2xl font-medium tracking-[-0.02em]">{form.name || "—"}</h4>
          {form.tagline ? <p className="mt-1 text-sm text-[var(--foreground-muted)]">{form.tagline}</p> : null}
          {form.shortDescription ? <p className="mt-3 text-sm leading-relaxed">{form.shortDescription}</p> : null}
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--foreground-muted)]">{t("fields.city")}</dt>
              <dd className="font-medium">{location || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">{t("fields.basePrice")}</dt>
              <dd className="font-medium">
                {formatCurrency(form.pricePerNight)}
                {form.weekendPrice ? ` · ${t("fields.weekendPrice")} ${formatCurrency(form.weekendPrice)}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">{t("fields.guestCapacity")}</dt>
              <dd className="font-medium">{form.guestCapacity}</dd>
            </div>
            <div>
              <dt className="text-[var(--foreground-muted)]">{t("fields.minNights")}</dt>
              <dd className="font-medium">{form.minNights}</dd>
            </div>
          </dl>
          {amenityLabels ? (
            <p className="mt-4 text-xs leading-relaxed text-[var(--foreground-muted)]">{amenityLabels}</p>
          ) : null}
        </div>
      </article>
      <p className="text-center text-xs text-[var(--foreground-subtle)]">{t("review.publishNote")}</p>
    </div>
  );
}
