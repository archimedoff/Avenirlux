"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/use-translations";

type Props = {
  unavailableDates: string[];
  minNights: number;
  instantBooking: boolean;
  onUnavailableChange: (dates: string[]) => void;
  onMinNightsChange: (n: number) => void;
  onInstantBookingChange: (v: boolean) => void;
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function AvailabilityCalendar({
  unavailableDates,
  minNights,
  instantBooking,
  onUnavailableChange,
  onMinNightsChange,
  onInstantBookingChange,
}: Props) {
  const { t } = useTranslations("listProperty");
  const [cursor, setCursor] = useState(() => new Date());

  const days = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    const last = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [cursor]);

  const toggle = (d: Date) => {
    const key = isoDay(d);
    if (unavailableDates.includes(key)) {
      onUnavailableChange(unavailableDates.filter((x) => x !== key));
    } else {
      onUnavailableChange([...unavailableDates, key]);
    }
  };

  const label = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="availability-calendar space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="dash-field max-w-[8rem]">
          <span>{t("fields.minNights")}</span>
          <input
            type="number"
            min={1}
            className="input-premium"
            value={minNights}
            onChange={(e) => onMinNightsChange(Number(e.target.value) || 1)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={instantBooking}
            onChange={(e) => onInstantBookingChange(e.target.checked)}
          />
          {t("fields.instantBooking")}
        </label>
      </div>
      <div className="availability-calendar__nav">
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          ‹
        </button>
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          ›
        </button>
      </div>
      <p className="text-[0.6875rem] text-[var(--foreground-subtle)]">{t("fields.unavailableDates")}</p>
      <div className="availability-calendar__grid" data-month={monthKey(cursor)}>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
          <span key={w} className="availability-calendar__weekday">
            {w}
          </span>
        ))}
        {days.map((d, i) =>
          d ? (
            <button
              key={isoDay(d)}
              type="button"
              className={`availability-calendar__day ${
                unavailableDates.includes(isoDay(d)) ? "availability-calendar__day--blocked" : ""
              }`}
              onClick={() => toggle(d)}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={`pad-${i}`} className="availability-calendar__day availability-calendar__day--empty" />
          ),
        )}
      </div>
    </div>
  );
}
