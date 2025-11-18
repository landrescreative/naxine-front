import type { Metadata } from "next";
import ClientDashboardShell from "@/components/dashboard/ClientDashboardShell";

export const metadata: Metadata = {
  title: "Dashboard Cliente",
  description:
    "Gestiona tus citas, pagos y perfil en tu dashboard de cliente de NAXINE.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClienteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientDashboardShell>{children}</ClientDashboardShell>;
}
