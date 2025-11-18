"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfessionalSidebar from "@/components/dashboard/ProfessionalSidebar";

interface ProfessionalDashboardShellProps {
  children: React.ReactNode;
}

export default function ProfessionalDashboardShell({
  children,
}: ProfessionalDashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("inicio");

  // Auth guard: require session and professional role
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/iniciar-sesion");
      return;
    }
    if (user.role !== "professional") {
      // Redirigir según el rol
      if (user.role === "client") {
        router.replace("/dashboard/cliente");
      } else if (user.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/iniciar-sesion");
      }
    }
  }, [user, loading, router]);

  // Actualizar activeItem basado en la ruta actual
  useEffect(() => {
    if (pathname.includes("/citas")) {
      setActiveItem("citas");
    } else if (pathname.includes("/pagos")) {
      setActiveItem("pagos");
    } else if (pathname.includes("/perfil")) {
      setActiveItem("perfil");
    } else if (pathname.includes("/soporte")) {
      setActiveItem("soporte");
    } else {
      setActiveItem("inicio");
    }
  }, [pathname]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);

    // Navegar a diferentes páginas según el item seleccionado
    switch (item) {
      case "inicio":
        router.push("/dashboard/profesional");
        break;
      case "citas":
        router.push("/dashboard/profesional/citas");
        break;
      case "pagos":
        router.push("/dashboard/profesional/pagos");
        break;
      case "perfil":
        router.push("/dashboard/profesional/perfil");
        break;
      case "soporte":
        router.push("/dashboard/profesional/soporte");
        break;
      default:
        break;
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario o no es profesional, no mostrar nada (el redirect se maneja en el useEffect)
  if (!user || user.role !== "professional") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <ProfessionalSidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

