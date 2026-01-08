"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Template para el grupo (web)
 *
 * Este template se ejecuta en TODAS las páginas del grupo (web) y maneja
 * la redirección en el lado del cliente cuando estamos en producción.
 *
 * Esto complementa el middleware y el ProductionGuard del servidor.
 */
export default function WebTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Verificar el entorno
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";
    const isProductionMode = appEnv === "production";

    // Si no estamos en producción, no hacer nada
    if (!isProductionMode) return;

    // Lista de rutas permitidas en producción
    const allowedRoutes = ["/proximamente", "/registro-profesional"];

    // Verificar si la ruta actual está permitida
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

    // Si no está permitida, redirigir a /registro-profesional
    if (!isAllowed) {
      console.log(
        `[WebTemplate] Redirigiendo desde ${pathname} a /registro-profesional`
      );
      router.replace("/registro-profesional");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
