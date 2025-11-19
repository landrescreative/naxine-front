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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for close event from sidebar
  useEffect(() => {
    const handleCloseMenu = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("closeMobileMenu", handleCloseMenu);
    return () => {
      window.removeEventListener("closeMobileMenu", handleCloseMenu);
    };
  }, []);

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
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <ProfessionalSidebar
          id="professional-sidebar"
          activeItem={activeItem}
          onItemClick={(item) => {
            handleItemClick(item);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>


      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full lg:w-auto" role="main">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
            aria-controls="professional-sidebar"
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
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

