"use client";

import { AvailabilityCalendar } from "@/components/list-property/availability-calendar";
import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  form: ListingFormState;
  onChange: (patch: Partial<ListingFormState>) => void;
};

export function StepAvailability({ form, onChange }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="space-y-6">
      <AvailabilityCalendar
        unavailableDates={form.unavailableDates}
        minNights={form.minNights}
        instantBooking={form.instantBooking}
        onUnavailableChange={(unavailableDates) => onChange({ unavailableDates })}
        onMinNightsChange={(minNights) => onChange({ minNights })}
        onInstantBookingChange={(instantBooking) => onChange({ instantBooking })}
      />
      <label className="dash-field">
        <span>{t("fields.cancellationPolicy")}</span>
        <textarea
          className="input-premium min-h-[80px]"
          value={form.cancellationPolicy}
          onChange={(e) => onChange({ cancellationPolicy: e.target.value })}
        />
      </label>
    </div>
  );
}
