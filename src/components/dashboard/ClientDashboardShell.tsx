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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <ClientSidebar
          id="client-sidebar"
          activeItem={activeItem}
          onItemClick={handleItemClick}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto w-full lg:w-auto" role="main">
        <div className="lg:hidden bg-white border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
            aria-controls="client-sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-base md:text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10" />
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}



