"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("usuarios");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin");
      return;
    }
    if (user.role !== "administracion") {
      router.replace("/iniciar-sesion");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Set active item based on current path
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
      setActiveItem("usuarios");
    }
  }, [pathname]);

  const handleItemClick = (item: string) => {
    setActiveItem(item);

    // Navigate to different pages based on the selected item
    switch (item) {
      case "usuarios":
      case "clientes":
        router.push("/dashboard/admin/clientes");
        break;
      case "profesionales":
        router.push("/dashboard/admin/profesionales");
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div key={pathname} className="page-anim">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
