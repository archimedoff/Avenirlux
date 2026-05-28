import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const listing = await listingsRepository.update(id, session.user.id, body);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await listingsRepository.remove(id, session.user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
