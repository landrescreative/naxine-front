"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

interface ProfessionalSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  id?: string;
}

export default function ProfessionalSidebar({
  activeItem = "inicio",
  onItemClick,
  id,
}: ProfessionalSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

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
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "citas",
      label: "Citas",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "pagos",
      label: "Pagos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      id={id}
      className="w-64 md:w-72 lg:w-64 bg-white shadow-lg flex flex-col h-full overflow-y-auto"
      aria-label="Menú principal del profesional"
    >
      {/* Mobile Header with Close Button - Compact in Landscape */}
      <div className="lg:hidden flex items-center justify-between p-2 md:p-3 lg:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-base md:text-lg font-semibold text-blue-900">
          Menú
        </h2>
        <button
          onClick={() => {
            // Close will be handled by parent via overlay click
            const event = new CustomEvent("closeMobileMenu");
            window.dispatchEvent(event);
          }}
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

      {/* User Profile Section - Very Compact in Landscape */}
      <div className="p-2 md:p-3 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col items-center">
          {/* Avatar - Smaller in Landscape */}
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-200 rounded-full mb-2 md:mb-3 lg:mb-4 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Name - Compact in Landscape */}
          <h2 className="text-sm md:text-base lg:text-lg font-semibold text-blue-900 mb-0.5 md:mb-1 text-center truncate w-full px-2">
            {user?.name || "Juan Pérez"}
          </h2>

          {/* Role - Hidden in very small landscape */}
          <p className="text-[10px] md:text-xs lg:text-sm text-primary font-medium hidden md:block">
            Profesional
          </p>
        </div>
      </div>

      {/* Navigation Section - Optimized for Landscape */}
      <div className="flex-1 px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-6 overflow-y-auto min-h-0">
        <h3
          className="text-[10px] md:text-xs lg:text-sm font-semibold text-blue-900 mb-2 md:mb-3 lg:mb-4 px-1 md:px-2 lg:px-0"
          id="professional-navigation-heading"
        >
          Navegación
        </h3>

        <div
          className="space-y-1 md:space-y-1.5 lg:space-y-2"
          role="group"
          aria-labelledby="professional-navigation-heading"
        >
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-2 md:space-x-3 px-2 md:px-3 py-2 md:py-2.5 lg:py-3 rounded-lg transition-colors relative touch-manipulation ${
                activeItem === item.id
                  ? "bg-purple-50 text-purple-700"
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
              <span className="font-medium text-xs md:text-sm lg:text-base truncate">
                {item.label}
              </span>
              {activeItem === item.id && (
                <div className="absolute right-2 md:right-3 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons - Compact in Landscape */}
      <div className="p-2 md:p-3 lg:p-4 space-y-1.5 md:space-y-2 lg:space-y-3 border-t border-gray-200 bg-gray-50 lg:bg-white flex-shrink-0">
        <button
          onClick={() => handleItemClick("soporte")}
          className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-medium py-2 md:py-2.5 lg:py-3 px-3 md:px-4 rounded-lg transition-colors touch-manipulation text-xs md:text-sm lg:text-base"
          aria-label="Abrir soporte"
        >
          Soporte
        </button>

        <button
          onClick={async () => {
            try {
              // Llamar al logout que hace la petición a la API y limpia la sesión
              await logout();
              // Redirigir al login después del logout
              router.push("/iniciar-sesion");
            } catch (error) {
              logger.error(
                "Error durante el logout",
                error,
                "ProfessionalSidebar"
              );
              // Aún así, redirigir al login si hay error
              router.push("/iniciar-sesion");
            }
          }}
          className="w-full bg-primary/40 hover:bg-primary/50 active:bg-primary/60 text-white font-medium py-2 md:py-2.5 lg:py-3 px-3 md:px-4 rounded-lg transition-colors touch-manipulation text-xs md:text-sm lg:text-base"
          aria-label="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
