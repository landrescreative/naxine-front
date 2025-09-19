"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import { MessageCircle } from "lucide-react";

export default function ClienteLayout({
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
    if (user.role !== "cliente") {
      router.replace("/dashboard/profesional");
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
        router.push("/dashboard/cliente");
        break;
      case "citas":
        router.push("/dashboard/cliente/citas");
        break;
      case "pagos":
        router.push("/dashboard/cliente/pagos");
        break;
      case "perfil":
        router.push("/dashboard/cliente/perfil");
        break;
      case "contacto":
        router.push("/dashboard/cliente/soporte");
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

  const handleWhatsAppClick = () => {
    // WhatsApp number - you can change this to your business number
    const phoneNumber = "1234567890"; // Replace with actual WhatsApp number
    const message = "Hola, necesito ayuda con mi cuenta de cliente.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex h-screen bg-gray-50/20">
      {/* Sidebar */}
      <ClientSidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area with simple page transition */}
        <main className="flex-1 overflow-y-auto p-6">
          <div key={pathname} className="page-anim">
            {children}
          </div>
        </main>
      </div>

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Contactar por WhatsApp
        </div>
      </button>
    </div>
  );
}
