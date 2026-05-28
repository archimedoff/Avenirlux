import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { favoritesRepository } from "@/lib/db/repositories/favorites-repository";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const hotelIds = Array.isArray(body.hotelIds) ? body.hotelIds.filter((id: unknown) => typeof id === "string") : [];
  const merged = await favoritesRepository.merge(session.user.id, hotelIds);
  return NextResponse.json({ hotelIds: merged });
}
