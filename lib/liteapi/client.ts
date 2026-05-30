import "server-only";
import { getLiteApiBaseUrl, getLiteApiKey } from "@/lib/liteapi/config";

export class LiteApiError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "LiteApiError";
    this.status = status;
    this.body = body;
  }
}

export async function liteApiRequest<T>(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string> }
): Promise<T> {
  const base = getLiteApiBaseUrl().replace(/\/$/, "");
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (init?.searchParams) {
    Object.entries(init.searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const timeoutMs = Number(process.env.LITE_API_TIMEOUT_MS || "25000") || 25000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": getLiteApiKey(),
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new LiteApiError("LiteAPI request timed out", 504, "");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  if (!response.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error("[LiteAPI]", response.status, path, text.slice(0, 500));
    } else {
      console.error("[LiteAPI]", response.status, path);
    }
    throw new LiteApiError(`LiteAPI request failed (${response.status})`, response.status, text);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}
