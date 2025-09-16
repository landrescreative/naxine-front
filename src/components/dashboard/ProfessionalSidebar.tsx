"use client";

import { useAuth } from "@/hooks/useAuth";

interface ProfessionalSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export default function ProfessionalSidebar({
  activeItem = "inicio",
  onItemClick,
}: ProfessionalSidebarProps) {
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
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
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

          {/* Name */}
          <h2 className="text-lg font-semibold text-blue-900 mb-1">
            {user?.name || "Juan Pérez"}
          </h2>

          {/* Role */}
          <p className="text-sm text-primary font-medium">Profesional</p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-4">Labels</h3>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors relative ${
                activeItem === item.id
                  ? "bg-purple-50 text-purple-700"
                  : "text-blue-900 hover:bg-gray-50"
              }`}
            >
              <div
                className={`${
                  activeItem === item.id ? "text-primary" : "text-gray-400"
                }`}
              >
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <button
          onClick={() => handleItemClick("contacto")}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Contacto
        </button>

        <button
          onClick={() => handleItemClick("logout")}
          className="w-full bg-primary/40 hover:bg-primary/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
