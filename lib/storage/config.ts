import "server-only";

const BUCKET = "property-images";

export function getStorageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    url,
    serviceKey,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || BUCKET,
    configured: Boolean(url && serviceKey),
  };
}

export function isStorageConfigured() {
  return getStorageConfig().configured;
}
