import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getStorageConfig } from "@/lib/storage/config";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const { url, serviceKey, configured } = getStorageConfig();
  if (!configured || !url || !serviceKey) return null;
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
