import { notFound, redirect } from "next/navigation";

import { HostListingEditor } from "@/components/dashboard/host-listing-editor";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { listingsRepository } from "@/lib/db/repositories/listings-repository";

type Props = { params: Promise<{ id: string }> };

export default async function HostListingEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) redirect("/auth");
  const { id } = await params;
  const listing = await listingsRepository.findById(id);
  if (!listing || listing.ownerId !== session.user.id) notFound();
  return <HostListingEditor listing={listing} />;
}
