import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isStorageConfigured } from "@/lib/storage/config";
import { ensurePropertyImagesBucket } from "@/lib/storage/ensure-bucket";
import { MAX_PROPERTY_IMAGE_BYTES } from "@/lib/storage/property-image-limits";
import { uploadPropertyImage } from "@/lib/storage/upload-property-image";

export const runtime = "nodejs";

export async function GET() {
  if (!isStorageConfigured()) {
    return NextResponse.json({ configured: false });
  }
  const bucket = await ensurePropertyImagesBucket();
  return NextResponse.json({ configured: bucket.ok, message: bucket.message });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error: "Storage not configured",
        hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; run npm run storage:ensure-bucket",
      },
      { status: 503 },
    );
  }

  const bucket = await ensurePropertyImagesBucket();
  if (!bucket.ok) {
    return NextResponse.json({ error: bucket.message }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const propertyId = form.get("propertyId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const result = await uploadPropertyImage(file, {
      mimeType: file.type || "image/jpeg",
      ownerId: session.user.id,
      propertyId: typeof propertyId === "string" && propertyId ? propertyId : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    if (message === "FILE_TOO_LARGE") {
      return NextResponse.json(
        { error: `File exceeds ${MAX_PROPERTY_IMAGE_BYTES / (1024 * 1024)}MB limit` },
        { status: 413 },
      );
    }
    if (message === "INVALID_FILE_TYPE") {
      return NextResponse.json({ error: "Only JPG, PNG, and WebP are allowed" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
