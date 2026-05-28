import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { auth } from "@/auth";
import { canAccessAdmin } from "@/lib/auth/roles";
import { getAdminAnalytics } from "@/lib/dashboard/analytics";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    redirect("/auth?callbackUrl=/admin");
  }
  const data = await getAdminAnalytics();
  return <AdminDashboard data={data} />;
}
