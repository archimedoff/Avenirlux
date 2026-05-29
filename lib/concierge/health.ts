import { isOpenAiConfigured } from "@/lib/concierge/config";
import type { OpenAiFailureCode } from "@/lib/concierge/errors";

export type OpenAiHealthStatus = "available" | "unavailable" | "unconfigured";

export type OpenAiHealthSnapshot = {
  status: OpenAiHealthStatus;
  configured: boolean;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastFailureCode: OpenAiFailureCode | null;
  unavailableUntil: number | null;
  consecutiveFailures: number;
};

const COOLDOWN_MS: Record<OpenAiFailureCode, number> = {
  quota_exceeded: 15 * 60_000,
  rate_limited: 3 * 60_000,
  auth: 60 * 60_000,
  network: 90_000,
  server: 2 * 60_000,
  unknown: 2 * 60_000,
};

let state: OpenAiHealthSnapshot = {
  status: "unconfigured",
  configured: false,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastFailureCode: null,
  unavailableUntil: null,
  consecutiveFailures: 0,
};

function refreshConfigured(): void {
  state = {
    ...state,
    configured: isOpenAiConfigured(),
    status: isOpenAiConfigured()
      ? state.unavailableUntil && Date.now() < state.unavailableUntil
        ? "unavailable"
        : "available"
      : "unconfigured",
  };
}

export function getOpenAiHealth(): OpenAiHealthSnapshot {
  refreshConfigured();
  if (!state.configured) {
    return { ...state, status: "unconfigured" };
  }
  if (state.unavailableUntil && Date.now() < state.unavailableUntil) {
    return { ...state, status: "unavailable" };
  }
  return { ...state, status: "available" };
}

export function isOpenAiHealthy(): boolean {
  return getOpenAiHealth().status === "available";
}

export function markOpenAiSuccess(): void {
  refreshConfigured();
  state = {
    ...state,
    status: "available",
    lastSuccessAt: Date.now(),
    unavailableUntil: null,
    consecutiveFailures: 0,
    lastFailureCode: null,
  };
}

export function markOpenAiFailure(code: OpenAiFailureCode): void {
  refreshConfigured();
  const failures = state.consecutiveFailures + 1;
  const baseCooldown = COOLDOWN_MS[code] ?? COOLDOWN_MS.unknown;
  const cooldown = Math.min(baseCooldown * Math.min(failures, 3), 30 * 60_000);

  state = {
    ...state,
    status: "unavailable",
    lastFailureAt: Date.now(),
    lastFailureCode: code,
    unavailableUntil: Date.now() + cooldown,
    consecutiveFailures: failures,
  };
}
