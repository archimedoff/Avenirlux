import { redirect } from "next/navigation";

import { HostListingsClient } from "@/components/dashboard/host-listings";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

export default async function HostListingsPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) redirect("/auth?callbackUrl=/host/listings");
  const listings = await listingsRepository.listByOwner(session.user.id);
  return <HostListingsClient listings={listings} />;
}
