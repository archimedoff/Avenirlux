"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="An unexpected moment"
      message="Something interrupted your session. Try again or return to explore stays."
      reset={reset}
    />
  );
}
