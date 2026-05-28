import { redirect } from "next/navigation";

import { HostOverview } from "@/components/dashboard/host-overview";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { getHostAnalytics } from "@/lib/dashboard/analytics";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

export default async function HostPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) {
    redirect("/auth?callbackUrl=/host");
  }
  const [data, listings] = await Promise.all([
    getHostAnalytics(session.user.id),
    listingsRepository.listByOwner(session.user.id),
  ]);
  return <HostOverview data={data} listingCount={listings.length} />;
}
