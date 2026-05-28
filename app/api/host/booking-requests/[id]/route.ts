import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const status = body.status;
  if (status !== "confirmed" && status !== "declined") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const requestRecord = await bookingRequestsRepository.updateStatus(id, session.user.id, status);
  if (!requestRecord) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ request: requestRecord });
}
