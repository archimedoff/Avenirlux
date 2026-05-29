"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

export const WIZARD_STEP_KEYS = [
  "type",
  "basics",
  "description",
  "amenities",
  "photos",
  "location",
  "pricing",
  "availability",
  "review",
] as const;

export type WizardStepKey = (typeof WIZARD_STEP_KEYS)[number];

type Props = {
  step: number;
  doneThrough: number;
  onStep: (index: number) => void;
  progress: number;
};

export function WizardNav({ step, doneThrough, onStep, progress }: Props) {
  const { t } = useTranslations("listProperty");

  return (
    <div className="list-wizard-header mx-auto max-w-3xl px-4 sm:px-0">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{t("title")}</h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t("subtitle")}</p>
      <div className="list-wizard-progress mt-6">
        <div className="list-wizard-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="wizard-nav-pills mt-4 flex gap-2 overflow-x-auto pb-1">
        {WIZARD_STEP_KEYS.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => onStep(i)}
            className={`list-wizard-step shrink-0 ${
              i === step ? "list-wizard-step--active" : ""
            } ${i < doneThrough ? "list-wizard-step--done" : ""}`}
          >
            {t(`steps.${key}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
