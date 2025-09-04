"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  LogIn,
  UserPlus,
  Briefcase,
  CheckCircle,
  Heart,
  Mic,
  Zap,
  FileText,
  HelpCircle,
  Mail,
  Building2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Logo from "@/assets/PNG-01.png";
import Image from "next/image";

type ServiceItem = { label: string; href: string };
type ServiceCategory = {
  key: string;
  title: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: ServiceItem[];
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    key: "dietas",
    title: "Dietas elaboradas por nutricionistas",
    href: "/dietas",
    Icon: CheckCircle,
    items: [
      { label: "Pérdida de peso", href: "/dietas/perdida-de-peso" },
      { label: "Deportiva", href: "/dietas/deportiva" },
      {
        label: "Vegetarianos y veganos",
        href: "/dietas/vegetarianos-y-veganos",
      },
      {
        label: "TCAs (trastornos de la conducta alimentaria)",
        href: "/dietas/tcas-trastornos-conducta-alimentaria",
      },
      { label: "Embarazo y lactancia", href: "/dietas/embarazo-y-lactancia" },
      { label: "Nutrición infantil", href: "/dietas/nutricion-infantil" },
      { label: "Aumento de peso", href: "/dietas/aumento-de-peso" },
      { label: "Menopausia", href: "/dietas/menopausia" },
      { label: "Salud intestinal", href: "/dietas/salud-intestinal" },
      { label: "SIBO y dieta FODMAP", href: "/dietas/sibo-y-fodmap" },
      { label: "Obesidad", href: "/dietas/obesidad" },
      { label: "Tiroides", href: "/dietas/tiroides" },
      {
        label: "Alergias–intolerancias",
        href: "/dietas/alergias-e-intolerancias",
      },
      { label: "Nutrición clínica", href: "/dietas/nutricion-clinica" },
      {
        label: "Nutricionista oncológico",
        href: "/dietas/nutricionista-oncologico",
      },
    ],
  },
  {
    key: "terapias",
    title: "Terapias con psicólogos",
    href: "/terapias",
    Icon: Heart,
    items: [
      { label: "Depresión", href: "/terapias/depresion" },
      { label: "Ansiedad", href: "/terapias/ansiedad" },
      { label: "Fobias", href: "/terapias/fobias" },
      { label: "Terapia de pareja", href: "/terapias/pareja" },
      {
        label: "Trastornos de conducta alimentaria",
        href: "/terapias/trastornos-conducta-alimentaria",
      },
      { label: "Duelo: pérdida de un ser querido", href: "/terapias/duelo" },
      { label: "Baja autoestima", href: "/terapias/baja-autoestima" },
      { label: "Obsesiones", href: "/terapias/obsesiones" },
      {
        label: "Trauma y TEPT (trastorno de estrés post-traumático)",
        href: "/terapias/trauma-y-tept",
      },
      { label: "Problemas sexuales", href: "/terapias/problemas-sexuales" },
      { label: "Psico–oncología", href: "/terapias/psico-oncologia" },
    ],
  },
  {
    key: "logopedas",
    title: "Logopedas online para adultos",
    href: "/logopedas",
    Icon: Mic,
    items: [
      {
        label: "Trastornos del habla",
        href: "/logopedas/trastornos-del-habla",
      },
      {
        label: "Trastornos del lenguaje",
        href: "/logopedas/trastornos-del-lenguaje",
      },
      {
        label: "Trastornos auditivos",
        href: "/logopedas/trastornos-auditivos",
      },
      {
        label: "Dificultades de origen neurológico",
        href: "/logopedas/dificultades-neurologicas",
      },
      {
        label: "Dificultades de aprendizaje",
        href: "/logopedas/dificultades-de-aprendizaje",
      },
      {
        label: "Problemas de deglución",
        href: "/logopedas/problemas-de-deglucion",
      },
    ],
  },
  {
    key: "desarrollo",
    title: "Desarrollo personal",
    href: "/desarrollo-personal",
    Icon: Zap,
    items: [
      { label: "Liderazgo", href: "/desarrollo-personal/liderazgo" },
      {
        label: "Habilidades sociales",
        href: "/desarrollo-personal/habilidades-sociales",
      },
      {
        label: "Hablar en público",
        href: "/desarrollo-personal/hablar-en-publico",
      },
      {
        label: "Comunicación no verbal",
        href: "/desarrollo-personal/comunicacion-no-verbal",
      },
      {
        label: "Relaciones de pareja",
        href: "/desarrollo-personal/relaciones-de-pareja",
      },
      {
        label: "Relaciones interpersonales",
        href: "/desarrollo-personal/relaciones-interpersonales",
      },
    ],
  },
  {
    key: "legales",
    title: "Consultas legales",
    href: "/consultas-legales",
    Icon: FileText,
    items: [
      { label: "Divorcio", href: "/consultas-legales/divorcio" },
      {
        label: "Compraventa de inmuebles",
        href: "/consultas-legales/compraventa-inmuebles",
      },
      { label: "Herencias", href: "/consultas-legales/herencias" },
      {
        label: "Tramitación de NIE para comunitarios",
        href: "/consultas-legales/nie-comunitarios",
      },
      { label: "Custodia", href: "/consultas-legales/custodia" },
      {
        label: "Reclamación de pensiones",
        href: "/consultas-legales/reclamacion-pensiones",
      },
      {
        label: "Matrimonio y filiaciones",
        href: "/consultas-legales/matrimonio-y-filiaciones",
      },
      {
        label: "Contrato de alquiler",
        href: "/consultas-legales/contrato-de-alquiler",
      },
      { label: "Desahucios", href: "/consultas-legales/desahucios" },
      {
        label: "Estafas inmobiliarias",
        href: "/consultas-legales/estafas-inmobiliarias",
      },
      {
        label: "Comunidades de propietarios",
        href: "/consultas-legales/comunidades-de-propietarios",
      },
      {
        label: "Testamento notarial",
        href: "/consultas-legales/testamento-notarial",
      },
      { label: "Donaciones", href: "/consultas-legales/donaciones" },
      {
        label: "Fiscalidad de herencias",
        href: "/consultas-legales/fiscalidad-de-herencias",
      },
      {
        label: "Reclamación de herencias",
        href: "/consultas-legales/reclamacion-de-herencias",
      },
      {
        label: "Renuncia de herencias",
        href: "/consultas-legales/renuncia-de-herencias",
      },
      {
        label: "Nacionalidad española",
        href: "/consultas-legales/nacionalidad-espanola",
      },
      {
        label: "Residencia para extranjeros no comunitarios",
        href: "/consultas-legales/residencia-extranjeros-no-comunitarios",
      },
    ],
  },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(
    null
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false); // Cerrar menú de usuario si está abierto
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false); // Cerrar menú hamburguesa si está abierto
  };

  const toggleDesktopMenu = () => {
    setIsDesktopMenuOpen(!isDesktopMenuOpen);
    setIsUserMenuOpen(false); // Cerrar menú de usuario si está abierto
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const closeDesktopMenu = () => {
    setIsDesktopMenuOpen(false);
  };

  return (
    <div className="w-full">
      {/* Barra superior gris */}
      <div className="w-full h-1 bg-gray-800"></div>

      {/* Navegación principal */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Layout móvil: Menú usuario (izq), Logo (centro), Hamburguesa (der) */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Menú de usuario - Izquierda */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`${
                    isUserMenuOpen
                      ? "bg-gray-100 ring-1 ring-gray-200 rounded-lg"
                      : ""
                  } text-gray-800 hover:text-gray-600 focus:outline-none p-2 transition-colors`}
                >
                  {isUserMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </button>

                {/* Menú desplegable de usuario */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-3 w-72 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-50 overflow-hidden">
                    <div className="py-2">
                      <Link
                        href="/login"
                        onClick={closeUserMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <LogIn className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Iniciar Sesión
                        </span>
                      </Link>

                      <Link
                        href="/register"
                        onClick={closeUserMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <UserPlus className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Regístrate como Usuario
                        </span>
                      </Link>

                      <Link
                        href="/register-professional"
                        onClick={closeUserMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Regístrate como Profesional
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo - Centro */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Image
                    src={Logo}
                    alt="Naxine logo"
                    width={128}
                    height={32}
                    className="h-6 w-auto"
                    priority
                  />
                </div>
              </Link>

              {/* Menú hamburguesa - Derecha */}
              <button
                onClick={toggleMobileMenu}
                className="text-gray-800 hover:text-gray-600 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Layout desktop: Hamburguesa (izq), Logo (centro), Usuario (der) */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Menú hamburguesa - Izquierda */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDesktopMenu}
                  className={`${
                    isDesktopMenuOpen
                      ? "bg-gray-100 ring-1 ring-gray-200 rounded-lg"
                      : ""
                  } text-gray-800 hover:text-gray-600 focus:outline-none p-2 transition-colors`}
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Image
                      src={Logo}
                      alt="Naxine logo"
                      width={144}
                      height={36}
                      className="h-7 w-auto"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Navegación de usuario - Derecha */}
              <div className="flex items-center space-x-4">
                {/* Iniciar Sesión */}
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 transition-colors px-3 py-2"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Iniciar Sesión</span>
                </Link>

                {/* Separador */}
                <div className="h-6 w-px bg-gray-300"></div>

                {/* Botón Registrarse como Profesional */}
                <Link
                  href="/register-professional"
                  className="flex items-center space-x-2 bg-primary-foreground hover:bg-primary-foreground/80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">
                    Regístrate como profesional
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Botón Registrarse */}
                <Link
                  href="/register"
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">Regístrate</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Menú desplegable de desktop */}
            {isDesktopMenuOpen && (
              <div className="hidden lg:block absolute left-4 top-16 w-72 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-50 overflow-hidden">
                <div className="py-2">
                  <Link
                    href="/como-funciona"
                    onClick={closeDesktopMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Cómo funciona</span>
                  </Link>
                  <Link
                    href="/servicios"
                    onClick={closeDesktopMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Servicios</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={closeDesktopMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">FAQ</span>
                  </Link>
                  <Link
                    href="/contacto"
                    onClick={closeDesktopMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Contacto</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú hamburguesa desplegable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {/* Categorías de servicios */}
              <div className="py-2">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Servicios
                </h3>
                <div className="space-y-1">
                  {/* Dietas */}
                  <div className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "dietas" ? null : "dietas"
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-expanded={openMobileCategory === "dietas"}
                    >
                      <span className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Dietas elaboradas por nutricionistas
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileCategory === "dietas"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </button>
                    {openMobileCategory === "dietas" && (
                      <div className="pl-9 pr-3 pb-2 space-y-1">
                        <Link
                          href="/dietas/perdida-de-peso"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Pérdida de peso
                        </Link>
                        <Link
                          href="/dietas/deportiva"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Deportiva
                        </Link>
                        <Link
                          href="/dietas/vegetarianos-y-veganos"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Vegetarianos y veganos
                        </Link>
                        <Link
                          href="/dietas/tcas-trastornos-conducta-alimentaria"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          TCAs (trastornos de la conducta alimentaria)
                        </Link>
                        <Link
                          href="/dietas/embarazo-y-lactancia"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Embarazo y lactancia
                        </Link>
                        <Link
                          href="/dietas/nutricion-infantil"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Nutrición infantil
                        </Link>
                        <Link
                          href="/dietas/aumento-de-peso"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Aumento de peso
                        </Link>
                        <Link
                          href="/dietas/menopausia"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Menopausia
                        </Link>
                        <Link
                          href="/dietas/salud-intestinal"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Salud intestinal
                        </Link>
                        <Link
                          href="/dietas/sibo-y-fodmap"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          SIBO y dieta FODMAP
                        </Link>
                        <Link
                          href="/dietas/obesidad"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Obesidad
                        </Link>
                        <Link
                          href="/dietas/tiroides"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Tiroides
                        </Link>
                        <Link
                          href="/dietas/alergias-e-intolerancias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Alergias–intolerancias
                        </Link>
                        <Link
                          href="/dietas/nutricion-clinica"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Nutrición clínica
                        </Link>
                        <Link
                          href="/dietas/nutricionista-oncologico"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Nutricionista oncológico
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Terapias */}
                  <div className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "terapias" ? null : "terapias"
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-expanded={openMobileCategory === "terapias"}
                    >
                      <span className="flex items-center space-x-3">
                        <Heart className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Terapias con psicólogos
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileCategory === "terapias"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </button>
                    {openMobileCategory === "terapias" && (
                      <div className="pl-9 pr-3 pb-2 space-y-1">
                        <Link
                          href="/terapias/depresion"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Depresión
                        </Link>
                        <Link
                          href="/terapias/ansiedad"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Ansiedad
                        </Link>
                        <Link
                          href="/terapias/fobias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Fobias
                        </Link>
                        <Link
                          href="/terapias/pareja"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Terapia de pareja
                        </Link>
                        <Link
                          href="/terapias/trastornos-conducta-alimentaria"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Trastornos de conducta alimentaria
                        </Link>
                        <Link
                          href="/terapias/duelo"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Duelo: pérdida de un ser querido
                        </Link>
                        <Link
                          href="/terapias/baja-autoestima"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Baja autoestima
                        </Link>
                        <Link
                          href="/terapias/obsesiones"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Obsesiones
                        </Link>
                        <Link
                          href="/terapias/trauma-y-tept"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Trauma y TEPT (trastorno de estrés post-traumático)
                        </Link>
                        <Link
                          href="/terapias/problemas-sexuales"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Problemas sexuales
                        </Link>
                        <Link
                          href="/terapias/psico-oncologia"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Psico–oncología
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Logopedas */}
                  <div className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "logopedas"
                            ? null
                            : "logopedas"
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-expanded={openMobileCategory === "logopedas"}
                    >
                      <span className="flex items-center space-x-3">
                        <Mic className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Logopedas online para adultos
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileCategory === "logopedas"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </button>
                    {openMobileCategory === "logopedas" && (
                      <div className="pl-9 pr-3 pb-2 space-y-1">
                        <Link
                          href="/logopedas/trastornos-del-habla"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Trastornos del habla
                        </Link>
                        <Link
                          href="/logopedas/trastornos-del-lenguaje"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Trastornos del lenguaje
                        </Link>
                        <Link
                          href="/logopedas/trastornos-auditivos"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Trastornos auditivos
                        </Link>
                        <Link
                          href="/logopedas/dificultades-neurologicas"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Dificultades de origen neurológico
                        </Link>
                        <Link
                          href="/logopedas/dificultades-de-aprendizaje"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Dificultades de aprendizaje
                        </Link>
                        <Link
                          href="/logopedas/problemas-de-deglucion"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Problemas de deglución
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Desarrollo personal */}
                  <div className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "desarrollo"
                            ? null
                            : "desarrollo"
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-expanded={openMobileCategory === "desarrollo"}
                    >
                      <span className="flex items-center space-x-3">
                        <Zap className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Desarrollo personal
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileCategory === "desarrollo"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </button>
                    {openMobileCategory === "desarrollo" && (
                      <div className="pl-9 pr-3 pb-2 space-y-1">
                        <Link
                          href="/desarrollo-personal/liderazgo"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Liderazgo
                        </Link>
                        <Link
                          href="/desarrollo-personal/habilidades-sociales"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Habilidades sociales
                        </Link>
                        <Link
                          href="/desarrollo-personal/hablar-en-publico"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Hablar en público
                        </Link>
                        <Link
                          href="/desarrollo-personal/comunicacion-no-verbal"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Comunicación no verbal
                        </Link>
                        <Link
                          href="/desarrollo-personal/relaciones-de-pareja"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Relaciones de pareja
                        </Link>
                        <Link
                          href="/desarrollo-personal/relaciones-interpersonales"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Relaciones interpersonales
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Consultas legales */}
                  <div className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "legales" ? null : "legales"
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-expanded={openMobileCategory === "legales"}
                    >
                      <span className="flex items-center space-x-3">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Consultas legales
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileCategory === "legales"
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </button>
                    {openMobileCategory === "legales" && (
                      <div className="pl-9 pr-3 pb-2 space-y-1">
                        <Link
                          href="/consultas-legales/divorcio"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Divorcio
                        </Link>
                        <Link
                          href="/consultas-legales/compraventa-inmuebles"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Compraventa de inmuebles
                        </Link>
                        <Link
                          href="/consultas-legales/herencias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Herencias
                        </Link>
                        <Link
                          href="/consultas-legales/nie-comunitarios"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Tramitación de NIE para comunitarios
                        </Link>
                        <Link
                          href="/consultas-legales/custodia"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Custodia
                        </Link>
                        <Link
                          href="/consultas-legales/reclamacion-pensiones"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Reclamación de pensiones
                        </Link>
                        <Link
                          href="/consultas-legales/matrimonio-y-filiaciones"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Matrimonio y filiaciones
                        </Link>
                        <Link
                          href="/consultas-legales/contrato-de-alquiler"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Contrato de alquiler
                        </Link>
                        <Link
                          href="/consultas-legales/desahucios"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Desahucios
                        </Link>
                        <Link
                          href="/consultas-legales/estafas-inmobiliarias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Estafas inmobiliarias
                        </Link>
                        <Link
                          href="/consultas-legales/comunidades-de-propietarios"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Comunidades de propietarios
                        </Link>
                        <Link
                          href="/consultas-legales/testamento-notarial"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Testamento notarial
                        </Link>
                        <Link
                          href="/consultas-legales/donaciones"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Donaciones
                        </Link>
                        <Link
                          href="/consultas-legales/fiscalidad-de-herencias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Fiscalidad de herencias
                        </Link>
                        <Link
                          href="/consultas-legales/reclamacion-de-herencias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Reclamación de herencias
                        </Link>
                        <Link
                          href="/consultas-legales/renuncia-de-herencias"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Renuncia de herencias
                        </Link>
                        <Link
                          href="/consultas-legales/nacionalidad-espanola"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Nacionalidad española
                        </Link>
                        <Link
                          href="/consultas-legales/residencia-extranjeros-no-comunitarios"
                          onClick={closeMobileMenu}
                          className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                        >
                          Residencia para extranjeros no comunitarios
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Páginas adicionales */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Información
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/como-funciona"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Cómo funciona</span>
                  </Link>
                  <Link
                    href="/servicios"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Servicios</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">FAQ</span>
                  </Link>
                  <Link
                    href="/contacto"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Contacto</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Categorías de servicios - Solo visible en desktop */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 gap-4 py-4">
            {SERVICE_CATEGORIES.map(({ key, title, href, items }) => (
              <div key={key} className="relative group text-center pt-2">
                <Link
                  href={href}
                  className="text-gray-800 hover:text-purple-600 text-sm font-medium transition-colors px-2 inline-block"
                >
                  {title}
                </Link>
                <div
                  className={`opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 absolute top-full left-1/2 -translate-x-1/2 ${
                    key === "legales" ? "w-80" : "w-72"
                  } bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-40 text-left`}
                >
                  <div className="py-2">
                    {items.map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-purple-600 text-sm"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
