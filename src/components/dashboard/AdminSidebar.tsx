"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";
import {
  Users,
  ChevronUp,
  FileText,
  Star,
  ShoppingCart,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export default function AdminSidebar({
  activeItem,
  onItemClick,
}: AdminSidebarProps) {
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleUsersClick = () => {
    if (!isCollapsed) {
      setIsUsersExpanded(!isUsersExpanded);
    }
    onItemClick("usuarios");
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setIsUsersExpanded(false);
    }
  };

  return (
    <nav
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      aria-label="Menú principal del administrador"
      id="admin-sidebar"
    >
      {/* Logo Section */}
      <div
        className={`${
          isCollapsed ? "p-3" : "p-6"
        } border-b border-gray-100 relative`}
      >
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <div className="relative w-36 h-10">
              <Image
                src="/PNG-03.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`absolute ${
            isCollapsed ? "top-2 right-2" : "top-4 right-4"
          } p-2 rounded-lg hover:bg-gray-100 transition-colors`}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div
        className={`flex-1 ${
          isCollapsed ? "px-2 py-4" : "px-4 py-6"
        } space-y-2`}
        role="navigation"
        aria-label="Secciones del dashboard"
      >
        {/* Usuarios Section */}
        <div>
          <button
            onClick={handleUsersClick}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-2" : "justify-between px-3"
            } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
              activeItem === "usuarios" || (isUsersExpanded && !isCollapsed)
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            title={isCollapsed ? "Usuarios" : undefined}
            aria-expanded={!isCollapsed ? isUsersExpanded : undefined}
            aria-controls={!isCollapsed ? "admin-users-submenu" : undefined}
          >
            <div
              className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}
            >
              <Users className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
              {!isCollapsed && <span className="font-medium">Usuarios</span>}
            </div>
            {!isCollapsed && (
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isUsersExpanded ? "rotate-0" : "rotate-180"
                }`}
                aria-hidden="true"
              />
            )}
          </button>

          {/* Submenu */}
          {isUsersExpanded && !isCollapsed && (
            <div
              className="ml-8 mt-2 space-y-1"
              id="admin-users-submenu"
              role="group"
              aria-label="Gestión de usuarios"
            >
              <button
                onClick={() => onItemClick("clientes")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeItem === "clientes"
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-current={activeItem === "clientes" ? "page" : undefined}
              >
                Clientes
              </button>
              <button
                onClick={() => onItemClick("profesionales")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeItem === "profesionales"
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                aria-current={activeItem === "profesionales" ? "page" : undefined}
              >
                Profesionales
              </button>
            </div>
          )}
        </div>

        {/* Lista de Sesiones */}
        <button
          onClick={() => onItemClick("sesiones")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
            activeItem === "sesiones"
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Lista de Sesiones" : undefined}
          aria-current={activeItem === "sesiones" ? "page" : undefined}
        >
          <FileText className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && (
            <span className="font-medium">Lista de Sesiones</span>
          )}
        </button>

        {/* Valoraciones */}
        <button
          onClick={() => onItemClick("valoraciones")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
            activeItem === "valoraciones"
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Valoraciones" : undefined}
          aria-current={activeItem === "valoraciones" ? "page" : undefined}
        >
          <Star className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && <span className="font-medium">Valoraciones</span>}
        </button>

        {/* Pagos */}
        <button
          onClick={() => onItemClick("pagos")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
            activeItem === "pagos"
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Pagos" : undefined}
          aria-current={activeItem === "pagos" ? "page" : undefined}
        >
          <ShoppingCart className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && <span className="font-medium">Pagos</span>}
        </button>

        {/* Soporte */}
        <button
          onClick={() => onItemClick("soporte")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
            activeItem === "soporte"
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Soporte" : undefined}
          aria-current={activeItem === "soporte" ? "page" : undefined}
        >
          <Shield className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && <span className="font-medium">Soporte</span>}
        </button>

        {/* Ajustes */}
        <button
          onClick={() => onItemClick("ajustes")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } ${isCollapsed ? "py-4" : "py-3"} rounded-lg transition-colors ${
            activeItem === "ajustes"
              ? "bg-primary/10 text-primary"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          title={isCollapsed ? "Ajustes" : undefined}
          aria-current={activeItem === "ajustes" ? "page" : undefined}
        >
          <Settings className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && <span className="font-medium">Ajustes</span>}
        </button>
      </div>

      {/* Cerrar Sesión Button */}
      <div
        className={`${
          isCollapsed ? "px-2 py-4" : "px-4 py-4"
        } border-t border-gray-200`}
      >
        <button
          onClick={async () => {
            try {
              // Llamar al logout que hace la petición a la API y limpia la sesión
              await logout();
              // Redirigir a la página de inicio después del logout
              router.push("/");
            } catch (error) {
              logger.error(
                "Error durante el logout",
                error,
                "AdminSidebar"
              );
              // Aún así, redirigir a la página de inicio si hay error
              router.push("/");
            }
          }}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } py-3 rounded-lg transition-colors bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700`}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          aria-label="Cerrar sesión"
        >
          <LogOut className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} aria-hidden="true" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </nav>
  );
}
