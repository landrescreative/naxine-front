import type { Metadata } from "next";
import ProfessionalDashboardShell from "@/components/dashboard/ProfessionalDashboardShell";

export const metadata: Metadata = {
  title: "Dashboard Profesional",
  description:
    "Gestiona tus citas, pagos y perfil profesional en tu dashboard de NAXINE.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfesionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfessionalDashboardShell>{children}</ProfessionalDashboardShell>;
}
