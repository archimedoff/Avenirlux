/** Shared limits for property image uploads (client + server). */
export const PROPERTY_IMAGE_BUCKET = "property-images";

export const MAX_PROPERTY_IMAGES = 10;

export const MAX_PROPERTY_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_PROPERTY_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedPropertyImageMime = (typeof ALLOWED_PROPERTY_IMAGE_TYPES)[number];
