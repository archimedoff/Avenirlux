import { NextResponse } from "next/server";

import { getSocialProviderCatalog } from "@/lib/auth/providers-meta";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { providers: getSocialProviderCatalog() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
