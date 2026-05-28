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

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": getLiteApiKey(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("[LiteAPI]", response.status, path, text.slice(0, 500));
    throw new LiteApiError(`LiteAPI request failed (${response.status})`, response.status, text);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}
