"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Verificar el entorno
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";
  const isProductionMode = appEnv === "production";

  // Verificar si estamos en una ruta de dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard/");
  // Zonas aisladas: admin
  const isAdminZone = pathname.startsWith("/admin");

  // En modo producción, NO mostrar navbar ni footer
  // Solo mostrar el contenido de las páginas
  if (isProductionMode) {
    return <>{children}</>;
  }

  // Para rutas de dashboard o admin, solo mostrar el contenido
  if (isDashboardRoute || isAdminZone) {
    return <>{children}</>;
  }

  // Para el resto de rutas (desarrollo/staging), mostrar navbar y footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
