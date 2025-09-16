"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ProfessionalSidebar from "@/components/dashboard/ProfessionalSidebar";

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("inicio");

  // Auth guard: require session and correct role
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/iniciar-sesion");
      return;
    }
    if (user.role !== "profesional") {
      router.replace("/dashboard/cliente");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (pathname.includes("/citas")) {
      setActiveItem("citas");
    } else if (pathname.includes("/pagos")) {
      setActiveItem("pagos");
    } else if (pathname.includes("/perfil")) {
      setActiveItem("perfil");
    } else if (pathname.includes("/soporte")) {
      setActiveItem("contacto");
    } else {
      setActiveItem("inicio");
    }
  }, [pathname]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);

    // Navigate to different pages based on the selected item
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
      case "contacto":
        router.push("/dashboard/profesional/soporte");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/iniciar-sesion");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ProfessionalSidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Profesional
            </h1>
          </div>
        </header>

        {/* Main Content Area with simple page transition */}
        <main className="flex-1 overflow-y-auto p-6">
          <div key={pathname} className="page-anim">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
