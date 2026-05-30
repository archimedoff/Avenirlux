import "server-only";

import { randomUUID } from "crypto";

import { getStorageConfig } from "@/lib/storage/config";
import { getSupabaseAdmin } from "@/lib/storage/supabase-admin";
import {
  ALLOWED_PROPERTY_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
} from "@/lib/storage/property-image-limits";

export type UploadResult = { url: string; path: string };

export async function uploadPropertyImage(
  file: Blob,
  opts: { mimeType: string; ownerId: string; propertyId?: string },
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("STORAGE_NOT_CONFIGURED");

  const mime = normalizeMime(opts.mimeType, file);
  if (!ALLOWED_PROPERTY_IMAGE_TYPES.includes(mime as (typeof ALLOWED_PROPERTY_IMAGE_TYPES)[number])) {
    throw new Error("INVALID_FILE_TYPE");
  }
  if (file.size > MAX_PROPERTY_IMAGE_BYTES) throw new Error("FILE_TOO_LARGE");

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const folder = opts.propertyId ? `${opts.ownerId}/${opts.propertyId}` : `${opts.ownerId}/drafts`;
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { bucket } = getStorageConfig();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mime,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function normalizeMime(declared: string, file: Blob): string {
  if (ALLOWED_PROPERTY_IMAGE_TYPES.includes(declared as (typeof ALLOWED_PROPERTY_IMAGE_TYPES)[number])) {
    return declared;
  }
  if (file instanceof File) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (ext === ".png") return "image/png";
    if (ext === ".webp") return "image/webp";
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  }
  return declared || "image/jpeg";
}

export function isAllowedImageUrl(url: string): boolean {
  if (!url || url.startsWith("data:")) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeImageUrls(urls: string[]): string[] {
  return urls.filter(isAllowedImageUrl);
}
