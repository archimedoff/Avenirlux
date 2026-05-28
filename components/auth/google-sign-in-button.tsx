"use client";

import { signIn } from "next-auth/react";

import { ProviderIcon } from "@/components/auth/provider-icons";

type Props = {
  label?: string;
  className?: string;
};

export function GoogleSignInButton({
  label = "Continue with Google",
  className = "btn-social",
}: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void signIn("google", { callbackUrl: "/" });
      }}
    >
      <span className="btn-social__icon">
        <ProviderIcon id="google" />
      </span>
      <span className="btn-social__label">{label}</span>
    </button>
  );
}
