import { createHash } from "node:crypto";

import type { TripMode } from "@/lib/concierge/types";

const MAX_ENTRIES = 64;
const TTL_MS = 45 * 60_000;

type CacheEntry = {
  text: string;
  createdAt: number;
  mode: TripMode;
  city?: string;
};

const store = new Map<string, CacheEntry>();

function normalizeMessage(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildResponseCacheKey(message: string, mode: TripMode, city?: string): string {
  const payload = `${mode}|${city ?? ""}|${normalizeMessage(message)}`;
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

function prune(now: number): void {
  for (const [key, entry] of store) {
    if (now - entry.createdAt > TTL_MS) store.delete(key);
  }
  if (store.size <= MAX_ENTRIES) return;
  const sorted = [...store.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  for (let i = 0; i < sorted.length - MAX_ENTRIES; i++) {
    store.delete(sorted[i][0]);
  }
}

export function getCachedConciergeResponse(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.text;
}

export function setCachedConciergeResponse(
  key: string,
  text: string,
  mode: TripMode,
  city?: string,
): void {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 40) return;
  prune(Date.now());
  store.set(key, { text: trimmed, createdAt: Date.now(), mode, city });
}

export function getConciergeCacheStats(): { size: number; ttlMs: number } {
  prune(Date.now());
  return { size: store.size, ttlMs: TTL_MS };
}
