import { redirect } from "next/navigation";

import { HostBookingsClient } from "@/components/dashboard/host-bookings";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { bookingRequestsRepository } from "@/lib/db/repositories/booking-requests-repository";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

export default async function HostBookingsPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) redirect("/auth");
  const listings = await listingsRepository.listByOwner(session.user.id);
  if (listings[0]) await bookingRequestsRepository.seedIfEmpty(session.user.id, listings[0].id);
  const requests = await bookingRequestsRepository.listByOwner(session.user.id);
  return <HostBookingsClient requests={requests} />;
}
