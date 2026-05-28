const DASHBOARD_PREFIXES = ["/admin", "/host"] as const;

export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Only allow same-origin relative paths (open redirect safe). */
/** Auth.js redirect target — runs through /auth so guest favorites merge after OAuth. */
export function oauthCallbackUrl(target?: string): string {
  const safe = safeCallbackUrl(target);
  return `/auth?callbackUrl=${encodeURIComponent(safe)}`;
}

export function safeCallbackUrl(raw: string | null | undefined, fallback = "/account"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  try {
    const url = new URL(trimmed, "http://n");
    if (url.hostname !== "n") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
