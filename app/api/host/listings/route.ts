import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";
import type { ListingMetadata } from "@/lib/listing/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const listings = await listingsRepository.listByOwner(session.user.id);
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const categories = Array.isArray(body.categories) ? body.categories.map(String) : ["resort"];
  const propertyType = body.metadata?.propertyType ?? body.propertyType;
  if (propertyType && !categories.includes(String(propertyType))) {
    categories.unshift(String(propertyType));
  }
  const metadata = (body.metadata ?? {}) as ListingMetadata;
  if (propertyType && !metadata.propertyType) {
    metadata.propertyType = propertyType;
  }

  const listing = await listingsRepository.create(session.user.id, {
    name: String(body.name || "Untitled residence"),
    city: String(body.city || ""),
    country: String(body.country || ""),
    location: String(body.location || ""),
    description: String(body.description || ""),
    image: String(body.image || ""),
    gallery: Array.isArray(body.gallery) ? body.gallery : [],
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    categories,
    pricePerNight: Number(body.pricePerNight) || 0,
    rooms: Array.isArray(body.rooms) ? body.rooms : [],
    coordinates: body.coordinates || { lat: 0, lng: 0 },
    cancellationPolicy: String(body.cancellationPolicy || ""),
    status: body.status,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  });
  return NextResponse.json({ listing }, { status: 201 });
}
