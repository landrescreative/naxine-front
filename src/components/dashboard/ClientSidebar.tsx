"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface ClientSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  onCloseMobileMenu?: () => void;
  id?: string;
}

export default function ClientSidebar({
  activeItem = "inicio",
  onItemClick,
  onCloseMobileMenu,
  id,
}: ClientSidebarProps) {
  const { user } = useAuth();

  const handleItemClick = (item: string) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const navigationItems = [
    {
      id: "inicio",
      label: "Inicio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "citas",
      label: "Citas",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 14l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "pagos",
      label: "Pagos",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="6"
            width="20"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="14" width="6" height="2" rx="1" fill="currentColor" />
          <circle cx="8" cy="16" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M5 20a7 7 0 0 1 14 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      id={id}
      className="w-64 md:w-72 lg:w-64 bg-white h-full flex flex-col shadow-lg overflow-y-auto"
      aria-label="Menú principal del cliente"
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-2 md:p-3 border-b border-gray-200 sticky top-0 z-10 bg-white">
        <h2 className="text-base md:text-lg font-semibold text-blue-900">
          Menú
        </h2>
        <button
          onClick={() => onCloseMobileMenu?.()}
          className="p-1.5 md:p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Cerrar menú"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Logo and User Profile Section */}
      <div className="px-3 md:px-4 lg:px-6 py-4 md:py-6 border-b border-gray-200 text-center">
        <div className="mb-3 flex justify-center">
          <div
            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gray-100 flex items-center justify-center"
            role="img"
            aria-label="Logo de Naxine"
          >
            <Image
              src="/PNG-03.png"
              alt="Naxine logo"
              width={48}
              height={48}
              priority
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
          </div>
        </div>

        <h2 className="text-base md:text-lg font-bold text-blue-900 mb-0.5 truncate px-2">
          {user?.name || "Juan Pérez"}
        </h2>
        <p className="text-xs md:text-sm text-primary font-medium">Cliente</p>
      </div>

      {/* Navigation Section */}
      <div className="px-3 md:px-4 lg:px-6 py-4 md:py-6 flex-1 overflow-y-auto">
        <h3
          className="text-xs md:text-sm font-bold text-blue-900 mb-3 md:mb-4 px-1 md:px-0"
          id="client-navigation-heading"
        >
          Navegación
        </h3>

        <div
          className="space-y-1.5 md:space-y-2"
          role="group"
          aria-labelledby="client-navigation-heading"
        >
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-2 md:space-x-3 px-2.5 md:px-3 py-2.5 md:py-3 rounded-lg transition-colors relative touch-manipulation ${
                activeItem === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-blue-900 hover:bg-gray-50 active:bg-gray-100"
              }`}
              aria-current={activeItem === item.id ? "page" : undefined}
              aria-label={item.label}
            >
              <div
                className={`flex-shrink-0 ${
                  activeItem === item.id ? "text-primary" : "text-gray-400"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs md:text-sm font-medium truncate">
                {item.label}
              </span>
              {activeItem === item.id && (
                <div className="absolute right-2 md:right-3 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 lg:bg-white">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleItemClick("contacto")}
            className="w-full sm:flex-1 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-medium py-2 md:py-2.5 px-3 rounded-lg transition-colors text-sm"
            aria-label="Abrir soporte o contacto"
          >
            Contacto
          </button>

          <button
            onClick={() => handleItemClick("logout")}
            className="w-full sm:flex-1 bg-primary/50 hover:bg-primary/60 active:bg-primary/70 text-white font-medium py-2 md:py-2.5 px-3 rounded-lg transition-colors text-sm"
            aria-label="Cerrar sesión"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
