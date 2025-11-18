"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "client" | "professional" | "admin";
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 * Verifica roles si se especifica requiredRole
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Esperar a que termine la verificación de autenticación
    if (loading) {
      return;
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      const loginUrl = `/iniciar-sesion?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // Si se requiere un rol específico, verificar que el usuario lo tenga
    if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
      // Admin tiene acceso a todo, otros roles deben coincidir
      router.push("/");
      return;
    }
  }, [loading, isAuthenticated, user, requiredRole, router, pathname]);

  // Mostrar fallback o nada mientras carga o verifica
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    );
  }

  // Si no está autenticado, no renderizar nada (ya se está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Si requiere un rol específico y el usuario no lo tiene, no renderizar
  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return null;
  }

  // Usuario autenticado y con el rol correcto, renderizar children
  return <>{children}</>;
}

