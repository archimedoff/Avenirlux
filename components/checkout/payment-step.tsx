"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";

type Props = {
  onSuccess: (paymentIntentId?: string) => void;
  onError: (message: string) => void;
  totalLabel: string;
  mockMode?: boolean;
  onMockPay?: () => void;
};

export function PaymentStep({ onSuccess, onError, totalLabel, mockMode, onMockPay }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mockMode && onMockPay) {
      setProcessing(true);
      onMockPay();
      return;
    }
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: `${window.location.origin}/confirmation` },
    });
    setProcessing(false);
    if (error) {
      onError(error.message ?? "Payment failed");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-gold">Secure payment</p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Apple Pay, Google Pay, and card accepted. Encrypted end-to-end.
        </p>
      </div>
      {mockMode ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-6 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">Stripe not configured — development mock payment</p>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">Configure Stripe env vars for live payments.</p>
          )}
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      )}
      <button type="submit" disabled={processing || (!mockMode && (!stripe || !elements))} className="btn-primary w-full py-3.5 disabled:opacity-60">
        {processing ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/80" />
            Processing…
          </span>
        ) : (
          `Complete booking · ${totalLabel}`
        )}
      </button>
    </form>
  );
}
