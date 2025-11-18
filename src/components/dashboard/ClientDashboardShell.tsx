"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ClientSidebar from "./ClientSidebar";

interface ClientDashboardShellProps {
  children: React.ReactNode;
}

export default function ClientDashboardShell({
  children,
}: ClientDashboardShellProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("inicio");
  const [loggingOut, setLoggingOut] = useState(false);

  // Auth guard: require session and client role
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/iniciar-sesion");
      return;
    }

    if (user.role !== "client") {
      if (user.role === "admin") {
        router.replace("/dashboard/admin");
      } else if (user.role === "professional") {
        router.replace("/dashboard/profesional");
      } else {
        router.replace("/iniciar-sesion");
      }
    }
  }, [user, loading, router]);

  // Update active sidebar item based on pathname
  useEffect(() => {
    if (pathname.includes("/citas")) {
      setActiveItem("citas");
    } else if (pathname.includes("/pagos")) {
      setActiveItem("pagos");
    } else if (pathname.includes("/perfil")) {
      setActiveItem("perfil");
    } else {
      setActiveItem("inicio");
    }
  }, [pathname]);

  const handleItemClick = async (item: string) => {
    switch (item) {
      case "inicio":
        setActiveItem("inicio");
        router.push("/dashboard/cliente");
        break;
      case "citas":
        setActiveItem("citas");
        router.push("/dashboard/cliente/citas");
        break;
      case "pagos":
        setActiveItem("pagos");
        router.push("/dashboard/cliente/pagos");
        break;
      case "perfil":
        setActiveItem("perfil");
        router.push("/dashboard/cliente/perfil");
        break;
      case "contacto":
        router.push("/dashboard/cliente/soporte");
        break;
      case "logout":
        if (!loggingOut) {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            router.replace("/iniciar-sesion");
          }
        }
        break;
      default:
        break;
    }
  };

  if (loading || loggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}


