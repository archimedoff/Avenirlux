import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { userRepository } from "@/lib/db/repositories/user-repository";
import type { ConciergePreferences } from "@/lib/db/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await userRepository.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { passwordHash: _, ...publicUser } = user;
  return NextResponse.json({ user: publicUser });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  let user = null;

  if (body.profile) {
    user = await userRepository.updateProfile(session.user.id, body.profile);
  }
  if (body.conciergePreferences) {
    user = await userRepository.updateConcierge(session.user.id, body.conciergePreferences as Partial<ConciergePreferences>);
  }

  if (!user) return NextResponse.json({ error: "Update failed" }, { status: 400 });
  return NextResponse.json({ user });
}
