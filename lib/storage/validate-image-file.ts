import {
  ALLOWED_PROPERTY_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  MAX_PROPERTY_IMAGES,
} from "@/lib/storage/property-image-limits";

export type ImageFileValidationError =
  | "too_many"
  | "too_large"
  | "invalid_type"
  | "empty";

export function validateImageFile(
  file: File,
  currentCount: number,
): ImageFileValidationError | null {
  if (currentCount >= MAX_PROPERTY_IMAGES) return "too_many";
  if (!file.size) return "empty";
  if (file.size > MAX_PROPERTY_IMAGE_BYTES) return "too_large";
  const mimeOk = ALLOWED_PROPERTY_IMAGE_TYPES.includes(
    file.type as (typeof ALLOWED_PROPERTY_IMAGE_TYPES)[number],
  );
  if (!mimeOk) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "invalid_type";
  }
  return null;
}

export function validateImageUrl(url: string): boolean {
  if (!url.trim() || url.startsWith("data:")) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
