"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { StepAmenities } from "@/components/list-property/steps/step-amenities";
import { StepAvailability } from "@/components/list-property/steps/step-availability";
import { StepBasics } from "@/components/list-property/steps/step-basics";
import { StepDescription } from "@/components/list-property/steps/step-description";
import { StepLocation } from "@/components/list-property/steps/step-location";
import { StepPhotos } from "@/components/list-property/steps/step-photos";
import { StepPricing } from "@/components/list-property/steps/step-pricing";
import { StepReview } from "@/components/list-property/steps/step-review";
import { clearPhotoDraft } from "@/components/list-property/photo-uploader";
import { StepType } from "@/components/list-property/steps/step-type";
import { WIZARD_STEP_KEYS, WizardNav } from "@/components/list-property/wizard-nav";
import { createInitialListingForm } from "@/lib/listing/defaults";
import { listingFormToApiPayload } from "@/lib/listing/to-api-payload";
import type { ListingFormState } from "@/lib/listing/types";
import { useTranslations } from "@/lib/i18n/use-translations";

const STEP_COMPONENTS = [
  StepType,
  StepBasics,
  StepDescription,
  StepAmenities,
  StepPhotos,
  StepLocation,
  StepPricing,
  StepAvailability,
  StepReview,
] as const;

export function ListPropertyWizard() {
  const { t: tCommon } = useTranslations("common");
  const { t } = useTranslations("listProperty");
  const { data: session } = useSession();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingFormState>(createInitialListingForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const patch = useCallback((p: Partial<ListingFormState>) => {
    setForm((prev) => ({ ...prev, ...p }));
  }, []);

  const submit = async (status: "draft" | "pending_review") => {
    if (!session?.user) {
      openAuth("signup");
      return;
    }
    if (status === "pending_review" && !form.name.trim()) {
      setSubmitError(t("errors.nameRequired"));
      return;
    }
    if (status === "pending_review" && !form.city.trim()) {
      setSubmitError(t("errors.cityRequired"));
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const payload = listingFormToApiPayload({ ...form, status });
    const res = await fetch("/api/host/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(t("errors.submitFailed"));
      return;
    }
    const data = await res.json();
    clearPhotoDraft();
    router.push(`/host/listings/${data.listing.id}`);
  };

  const StepView = STEP_COMPONENTS[step];
  const progress = ((step + 1) / WIZARD_STEP_KEYS.length) * 100;
  const isLast = step === WIZARD_STEP_KEYS.length - 1;

  return (
    <div className="list-wizard page-enter mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <WizardNav step={step} doneThrough={step} onStep={setStep} progress={progress} />
      <div className="glass-card mt-8 space-y-4 p-6 sm:p-10">
        {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p>}
        <StepView form={form} onChange={patch} />
        <div className="flex flex-wrap justify-between gap-3 pt-4">
          <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            {tCommon("back")}
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={submitting}
              onClick={() => void submit("draft")}
            >
              {tCommon("saveDraft")}
            </button>
            {!isLast ? (
              <button type="button" className="btn-primary" onClick={() => setStep((s) => s + 1)}>
                {tCommon("continue")}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={submitting}
                onClick={() => void submit("pending_review")}
              >
                {submitting ? tCommon("submitting") : t("publishListing")}
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/host">{t("hostDashboard")}</Link>
      </p>
    </div>
  );
}
