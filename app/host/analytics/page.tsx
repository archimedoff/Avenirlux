import { redirect } from "next/navigation";

import { HostAnalyticsView } from "@/components/dashboard/host-analytics";
import { auth } from "@/auth";
import { canAccessHost } from "@/lib/auth/roles";
import { getHostAnalytics } from "@/lib/dashboard/analytics";

export default async function HostAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || !canAccessHost(session.user.role)) redirect("/auth");
  const data = await getHostAnalytics(session.user.id);
  return <HostAnalyticsView data={data} />;
}
