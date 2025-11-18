"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("inicio");

  // Auth guard: require session and admin role
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/iniciar-sesion");
      return;
    }
    if (user.role !== "admin") {
      // Redirigir según el rol
      if (user.role === "client") {
        router.replace("/dashboard/cliente");
      } else if (user.role === "professional") {
        router.replace("/dashboard/profesional");
      } else {
        router.replace("/iniciar-sesion");
      }
    }
  }, [user, loading, router]);

  // Actualizar activeItem basado en la ruta actual
  useEffect(() => {
    if (pathname.includes("/clientes")) {
      setActiveItem("clientes");
    } else if (pathname.includes("/profesionales")) {
      setActiveItem("profesionales");
    } else if (pathname.includes("/sesiones")) {
      setActiveItem("sesiones");
    } else if (pathname.includes("/valoraciones")) {
      setActiveItem("valoraciones");
    } else if (pathname.includes("/pagos")) {
      setActiveItem("pagos");
    } else if (pathname.includes("/soporte")) {
      setActiveItem("soporte");
    } else if (pathname.includes("/ajustes")) {
      setActiveItem("ajustes");
    } else {
      setActiveItem("inicio");
    }
  }, [pathname]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);

    // Navegar a diferentes páginas según el item seleccionado
    switch (item) {
      case "inicio":
        router.push("/dashboard/admin");
        break;
      case "clientes":
        router.push("/dashboard/admin/clientes");
        break;
      case "profesionales":
        router.push("/dashboard/admin/profesionales");
        break;
      case "usuarios":
        // Si está expandido, no navegar, solo expandir/colapsar
        // Si está colapsado, navegar a clientes por defecto
        if (activeItem !== "clientes" && activeItem !== "profesionales") {
          router.push("/dashboard/admin/clientes");
        }
        break;
      case "sesiones":
        router.push("/dashboard/admin/sesiones");
        break;
      case "valoraciones":
        router.push("/dashboard/admin/valoraciones");
        break;
      case "pagos":
        router.push("/dashboard/admin/pagos");
        break;
      case "soporte":
        router.push("/dashboard/admin/soporte");
        break;
      case "ajustes":
        router.push("/dashboard/admin/ajustes");
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

  // Si no hay usuario o no es admin, no mostrar nada (el redirect se maneja en el useEffect)
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
