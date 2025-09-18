"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  ChevronUp,
  FileText,
  Star,
  ShoppingCart,
  Shield,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
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
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
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
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <div
        className={`flex-1 ${
          isCollapsed ? "px-2 py-4" : "px-4 py-6"
        } space-y-2`}
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
          >
            <div
              className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}
            >
              <Users className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
              {!isCollapsed && <span className="font-medium">Usuarios</span>}
            </div>
            {!isCollapsed && (
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isUsersExpanded ? "rotate-0" : "rotate-180"
                }`}
              />
            )}
          </button>

          {/* Submenu */}
          {isUsersExpanded && !isCollapsed && (
            <div className="ml-8 mt-2 space-y-1">
              <button
                onClick={() => onItemClick("clientes")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeItem === "clientes"
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
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
        >
          <FileText className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
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
        >
          <Star className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
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
        >
          <ShoppingCart className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
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
        >
          <Shield className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
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
        >
          <Settings className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
          {!isCollapsed && <span className="font-medium">Ajustes</span>}
        </button>
      </div>

      {/* User Profile Section */}
      <div
        className={`${isCollapsed ? "p-2" : "p-4"} border-t border-gray-100`}
      >
        <div
          className={`bg-primary rounded-lg ${
            isCollapsed ? "p-3" : "p-4"
          } flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}
        >
          {/* Avatar */}
          <div
            className={`${
              isCollapsed ? "w-12 h-12" : "w-10 h-10"
            } bg-white rounded-full flex items-center justify-center`}
          >
            <div
              className={`${
                isCollapsed ? "w-10 h-10" : "w-8 h-8"
              } bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center`}
            >
              <span
                className={`text-white ${
                  isCollapsed ? "text-base" : "text-sm"
                } font-medium`}
              >
                AC
              </span>
            </div>
          </div>

          {/* User Info */}
          {!isCollapsed && (
            <div className="flex-1 text-primary-foreground">
              <div className="font-medium text-sm">Anita Cruz</div>
              <div className="text-xs text-primary-foreground/80">
                anita@commerce.com
              </div>
            </div>
          )}

          {/* More Options */}
          {!isCollapsed && (
            <button className="text-primary-foreground hover:opacity-90 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
