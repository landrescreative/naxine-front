"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface ClientSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export default function ClientSidebar({
  activeItem = "inicio",
  onItemClick,
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
    <div className="w-64 bg-white h-screen flex flex-col shadow-lg">
      {/* Logo and User Profile Section */}
      <div className="px-6 py-8 text-center">
        {/* Platform Logo */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/PNG-03.png"
            alt="Naxine logo"
            width={48}
            height={48}
            priority
          />
        </div>

        {/* User Name */}
        <h2 className="text-lg font-bold text-blue-900 mb-1">
          {user?.name || "Juan Pérez"}
        </h2>

        {/* User Role */}
        <p className="text-sm text-primary font-medium">Cliente</p>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 mx-6"></div>

      {/* Navigation Section */}
      <div className="px-6 py-6">
        <h3 className="text-sm font-bold text-blue-900 mb-4">Labels</h3>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative">
              {activeItem === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full z-10 -translate-x-5"></div>
              )}
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors relative ${
                  activeItem === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-blue-900 hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">{item.icon}</div>

                {/* Label */}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Action Buttons */}
      <div className="px-6 py-6 space-y-3">
        <button
          onClick={() => handleItemClick("contacto")}
          className="w-full bg-primary hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Contacto
        </button>

        <button
          onClick={() => handleItemClick("logout")}
          className="w-full bg-primary/50 hover:bg-primary/60 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
