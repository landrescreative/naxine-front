"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import GlobalCTA from "./GlobalCTA";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Verificar si estamos en una ruta de dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard/");
  // Zonas aisladas: admin
  const isAdminZone = pathname.startsWith("/admin");

  if (isDashboardRoute || isAdminZone) {
    // Para rutas de dashboard, solo mostrar el contenido
    return <>{children}</>;
  }

  // Para el resto de rutas, mostrar navbar y footer
  return (
    <>
      <Navbar />
      {children}
      <GlobalCTA />
      <Footer />
    </>
  );
}
