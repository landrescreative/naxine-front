import AdminSystemOverview from "@/components/dashboard/AdminSystemOverview";
import { getPlatformDiagnostics } from "@/lib/admin-diagnostics";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const diagnostics = await getPlatformDiagnostics();

  return <AdminSystemOverview initialDiagnostics={diagnostics} />;
}

