import { NextResponse } from "next/server";

import { logOAuthDebug, getOAuthDebugPayload } from "@/lib/auth/oauth-debug";
import { getSocialProviderCatalog } from "@/lib/auth/providers-meta";

/** UI catalog for social buttons — NOT NextAuth's `/api/auth/providers` (signIn depends on that). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  logOAuthDebug("GET /api/auth/social-catalog");

  const providers = getSocialProviderCatalog();

  return NextResponse.json(
    {
      providers,
      debug: getOAuthDebugPayload(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
