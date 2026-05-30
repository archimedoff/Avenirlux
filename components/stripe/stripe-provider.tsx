"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";
import { useMemo } from "react";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

type Props = {
  publishableKey: string | null;
  clientSecret: string | null;
  children: ReactNode;
};

export function StripeProvider({ publishableKey, clientSecret, children }: Props) {
  const stripe = useMemo(() => (publishableKey ? getStripePromise(publishableKey) : null), [publishableKey]);

  if (!publishableKey || !clientSecret || !stripe) return <>{children}</>;

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#c9a962",
            colorBackground: "#121110",
            colorText: "#f5f2eb",
            colorDanger: "#f87171",
            fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": { border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)" },
            ".Label": { color: "#a8a29e", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "11px" },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
