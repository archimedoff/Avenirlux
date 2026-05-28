import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { favoritesRepository } from "@/lib/db/repositories/favorites-repository";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hotelIds = await favoritesRepository.list(session.user.id);
  return NextResponse.json({ hotelIds });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const hotelId = typeof body.hotelId === "string" ? body.hotelId : "";
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });
  const hotelIds = await favoritesRepository.add(session.user.id, hotelId);
  return NextResponse.json({ hotelIds });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId");
  if (!hotelId) return NextResponse.json({ error: "hotelId required" }, { status: 400 });
  const hotelIds = await favoritesRepository.remove(session.user.id, hotelId);
  return NextResponse.json({ hotelIds });
}
