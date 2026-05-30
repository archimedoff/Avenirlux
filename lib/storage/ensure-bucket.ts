
import { getStorageConfig } from "@/lib/storage/config";
import { getSupabaseAdmin } from "@/lib/storage/supabase-admin";
import {
  ALLOWED_PROPERTY_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGE_BUCKET,
} from "@/lib/storage/property-image-limits";

export async function ensurePropertyImagesBucket(): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      message: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    };
  }

  const { bucket } = getStorageConfig();
  const bucketName = bucket || PROPERTY_IMAGE_BUCKET;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) return { ok: false, message: listError.message };

  const exists = buckets?.some((b) => b.name === bucketName);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: MAX_PROPERTY_IMAGE_BYTES,
      allowedMimeTypes: [...ALLOWED_PROPERTY_IMAGE_TYPES],
    });
    if (createError) return { ok: false, message: createError.message };
  }

  return { ok: true, message: `Bucket "${bucketName}" is ready (public)` };
}
