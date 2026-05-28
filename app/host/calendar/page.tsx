import { redirect } from "next/navigation";

import { HostCalendarClient } from "@/components/dashboard/host-calendar";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

export default async function HostCalendarPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) redirect("/auth");
  const listings = await listingsRepository.listByOwner(session.user.id);
  const requests = await bookingRequestsRepository.listByOwner(session.user.id);
  return <HostCalendarClient listings={listings} requests={requests} />;
}
