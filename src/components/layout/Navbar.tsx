"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { useAuth } from "@/hooks/useAuth";
import { usePublicSpecialties } from "@/hooks/usePublicSpecialties";

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
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuButtonRef = useRef<HTMLButtonElement>(null);
  const {
    specialties: backendSpecialties,
    loading: loadingSpecialties,
    loadServicesForSpecialty,
    getServicesForSpecialty,
    isLoadingServices,
  } = usePublicSpecialties();
  const [hoveredSpecialtyId, setHoveredSpecialtyId] = useState<string | null>(
    null
  );
  const [servicesBySpecialty, setServicesBySpecialty] = useState<
    Record<string, Array<{ label: string; href: string }>>
  >({});
  const [activeDesktopCategory, setActiveDesktopCategory] = useState<
    string | null
  >(null);
  const desktopCategoryHoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const dashboardHref =
    user?.role === "professional"
      ? "/dashboard/profesional"
      : "/dashboard/cliente";

  // Considerar que el rol de admin no cuenta como "usuario logeado" para la navbar
  const isPublicLoggedIn = !!user && user.role !== "admin";

  // Usar especialidades del backend si están disponibles, sino usar las hardcodeadas
  // Solo mostrar hardcodeadas si NO está cargando Y no hay categorías del backend
  // Necesitamos mapear las especialidades hardcodeadas para incluir specialtyId
  const SERVICE_CATEGORIES_TO_USE: (ServiceCategory & {
    specialtyId?: string;
  })[] =
    loadingSpecialties
      ? [] // Mientras carga, no mostrar ninguna categoría (se mostrará skeleton)
      : backendSpecialties.length > 0
      ? backendSpecialties.map((cat) => ({
          ...cat,
          specialtyId: cat.specialtyId,
        }))
      : SERVICE_CATEGORIES.map((cat) => ({
          ...cat,
          specialtyId: cat.key, // Usar key como ID para las hardcodeadas
        }));

  // Función para manejar el hover sobre una especialidad
  const handleSpecialtyHover = async (
    specialtyIdOrKey: string,
    realSpecialtyId?: string
  ) => {
    setHoveredSpecialtyId(specialtyIdOrKey);

    // Determinar el ID real a usar para cargar servicios
    // Si se proporciona realSpecialtyId, usarlo (viene del backend)
    // Si no, buscar la especialidad para obtener su specialtyId
    let idToUseForLoading: string;
    if (realSpecialtyId) {
      idToUseForLoading = realSpecialtyId;
    } else {
      // Buscar la especialidad para obtener su ID numérico
      const specialty = SERVICE_CATEGORIES_TO_USE.find(
        (s) => s.specialtyId === specialtyIdOrKey || s.key === specialtyIdOrKey
      );
      idToUseForLoading = specialty?.specialtyId || specialtyIdOrKey;
    }

    // Usar specialtyIdOrKey como clave para el cache (puede ser key o specialtyId)
    const cacheKey = specialtyIdOrKey;

    // Si ya tenemos los servicios en cache, no hacer nada
    if (
      servicesBySpecialty[cacheKey] &&
      servicesBySpecialty[cacheKey].length > 0
    ) {
      return;
    }

    // Cargar servicios usando el ID real del backend
    const servicios = await loadServicesForSpecialty(idToUseForLoading);

    // Mapear servicios al formato del navbar
    const mappedServices = servicios.map((servicio, index) => {
      // El backend usa nombre_servicio, no nombre
      const serviceName =
        servicio.nombre_servicio ??
        servicio.nombre ??
        servicio.name ??
        `Servicio ${index + 1}`;

      // Generar slug del nombre del servicio
      const serviceSlug = servicio.slug ?? generateSlug(serviceName);

      const specialtyFound = SERVICE_CATEGORIES_TO_USE.find(
        (s) => s.specialtyId === specialtyIdOrKey || s.key === specialtyIdOrKey
      );
      const baseHref = specialtyFound?.href || `/${specialtyIdOrKey}`;

      // Usar el ID del servicio solo para la key de React, no en la URL
      const serviceId = String(
        servicio.id_servicio ?? servicio.id ?? servicio.uuid ?? index
      );

      return {
        label: serviceName,
        href: `${baseHref}/${serviceSlug}`,
        id: serviceId, // Incluir ID para usar como key único en React
      };
    });

    // Guardar usando el cacheKey (puede ser key o specialtyId) para que coincida con el hover
    setServicesBySpecialty((prev) => ({
      ...prev,
      [cacheKey]: mappedServices,
    }));
  };

  // Función auxiliar para generar slugs (duplicada del hook, pero necesaria aquí también)
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cerrar menú de desktop cuando cambia la ruta
  useEffect(() => {
    setIsDesktopMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearDesktopCategoryHoverTimeout();
    };
  }, []);

  // Cerrar menú de desktop cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDesktopMenuOpen &&
        desktopMenuRef.current &&
        desktopMenuButtonRef.current &&
        !desktopMenuRef.current.contains(event.target as Node) &&
        !desktopMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsDesktopMenuOpen(false);
      }
    };

    if (isDesktopMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopMenuOpen]);

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

  const clearDesktopCategoryHoverTimeout = () => {
    if (desktopCategoryHoverTimeout.current) {
      clearTimeout(desktopCategoryHoverTimeout.current);
      desktopCategoryHoverTimeout.current = null;
    }
  };

  const handleDesktopCategoryEnter = (
    displayKey: string,
    specialtyId?: string
  ) => {
    clearDesktopCategoryHoverTimeout();
    setActiveDesktopCategory(displayKey);
    handleSpecialtyHover(displayKey, specialtyId || undefined);
  };

  const handleDesktopCategoryLeave = () => {
    clearDesktopCategoryHoverTimeout();
    desktopCategoryHoverTimeout.current = setTimeout(() => {
      setActiveDesktopCategory(null);
    }, 150);
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
    <motion.div
      className="w-full sticky top-0 z-40"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
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
                  type="button"
                  aria-label={
                    isUserMenuOpen ? "Cerrar menú de usuario" : "Abrir menú de usuario"
                  }
                  aria-expanded={isUserMenuOpen}
                  aria-controls="mobile-user-menu"
                >
                  {isUserMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </button>

                {/* Menú desplegable de usuario */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      id="mobile-user-menu"
                      className="absolute left-0 mt-3 w-72 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-50 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="py-2">
                        {!loading && isPublicLoggedIn ? (
                          <>
                            <Link
                              href={dashboardHref}
                              onClick={closeUserMenu}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                              aria-label="Mi panel"
                            >
                              <User className="h-5 w-5" aria-hidden="true" />
                              <span className="text-sm font-medium">
                                Mi panel
                              </span>
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                closeUserMenu();
                              }}
                              className="w-full text-left flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                              aria-label="Cerrar sesión"
                            >
                              <X className="h-5 w-5" aria-hidden="true" />
                              <span className="text-sm font-medium">
                                Cerrar sesión
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <a
                              href="/iniciar-sesion"
                              onClick={closeUserMenu}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                            >
                              <LogIn className="h-5 w-5" aria-hidden="true" />
                              Iniciar sesion
                            </a>
                            <Link
                              href="/registro"
                              onClick={closeUserMenu}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                              aria-label="Regístrate como Usuario"
                            >
                              <UserPlus className="h-5 w-5" aria-hidden="true" />
                              <span className="text-sm font-medium">
                                Regístrate como Usuario
                              </span>
                            </Link>
                            <Link
                              href="/registro-profesional"
                              onClick={closeUserMenu}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                              aria-label="Regístrate como Profesional"
                            >
                              <Briefcase className="h-5 w-5" aria-hidden="true" />
                              <span className="text-sm font-medium">
                                Regístrate como Profesional
                              </span>
                            </Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                type="button"
                aria-label={
                  isMobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-primary-menu"
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
                  ref={desktopMenuButtonRef}
                  onClick={toggleDesktopMenu}
                  className={`${
                    isDesktopMenuOpen
                      ? "bg-gray-100 ring-1 ring-gray-200 rounded-lg"
                      : ""
                  } text-gray-800 hover:text-gray-600 focus:outline-none p-2 transition-colors`}
                  type="button"
                  aria-label={
                    isDesktopMenuOpen
                      ? "Cerrar menú de navegación"
                      : "Abrir menú de navegación"
                  }
                  aria-expanded={isDesktopMenuOpen}
                  aria-controls="desktop-primary-menu"
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
                {!loading && isPublicLoggedIn ? (
                  <>
                    <Link
                      href={dashboardHref}
                      className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                      aria-label="Mi panel"
                    >
                      <span className="text-sm font-medium">Mi panel</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 transition-colors px-3 py-2"
                      aria-label="Cerrar sesión"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                      <span className="text-sm font-medium">Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/iniciar-sesion"
                      className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 transition-colors px-3 py-2"
                    >
                      <User className="h-5 w-5" aria-hidden="true" />
                      Iniciar sesion
                    </a>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <Link
                      href="/registro-profesional"
                      className="flex items-center space-x-2 bg-primary-foreground hover:bg-primary-foreground/80 text-white px-4 py-2 rounded-lg transition-colors"
                      aria-label="Regístrate como profesional"
                    >
                      <span className="text-sm font-medium">
                        Regístrate como profesional
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/registro"
                      className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
                      aria-label="Regístrate"
                    >
                      <span className="text-sm font-medium">Regístrate</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Menú desplegable de desktop */}
            <AnimatePresence>
              {isDesktopMenuOpen && (
                <motion.div
                  ref={desktopMenuRef}
                  id="desktop-primary-menu"
                  className="hidden lg:block absolute left-4 top-16 w-72 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="py-2">
                    <Link
                      href="/como-funciona"
                      onClick={() => {
                        closeDesktopMenu();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Cómo funciona</span>
                    </Link>
                    <Link
                      href="/servicios"
                      onClick={() => {
                        closeDesktopMenu();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                    >
                      <Building2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Servicios</span>
                    </Link>
                    <Link
                      href="/preguntas-frecuentes"
                      onClick={() => {
                        closeDesktopMenu();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Preguntas Frecuentes
                      </span>
                    </Link>
                    <Link
                      href="/acerca-de"
                      onClick={() => {
                        closeDesktopMenu();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Acerca de</span>
                    </Link>
                    <Link
                      href="/contacto"
                      onClick={() => {
                        closeDesktopMenu();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-sm font-medium">Contacto</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menú hamburguesa desplegable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200"
              id="mobile-primary-menu"
            >
              {/* Categorías de servicios */}
              <div className="py-2">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Servicios
                </h3>
                <div className="space-y-1">
                  {loadingSpecialties ? (
                    // Skeleton para móvil mientras cargan las categorías
                    Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={`mobile-skeleton-${idx}`}
                        className="px-3 py-2 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    SERVICE_CATEGORIES_TO_USE.map((category) => {
                    const Icon = category.Icon;
                    const displayKey = category.specialtyId || category.key;
                    const displayItems =
                      servicesBySpecialty[displayKey] &&
                      servicesBySpecialty[displayKey].length > 0
                        ? servicesBySpecialty[displayKey]
                        : category.items;

                    return (
                      <div key={category.key} className="rounded-lg">
                        <button
                          type="button"
                          onClick={async () => {
                            const newState =
                              openMobileCategory === category.key
                                ? null
                                : category.key;
                            setOpenMobileCategory(newState);

                            // Cargar servicios cuando se expande la categoría
                            if (newState === category.key) {
                              const idToLoad =
                                category.specialtyId || category.key;
                              await handleSpecialtyHover(
                                idToLoad,
                                category.specialtyId || undefined
                              );
                            }
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                          aria-expanded={openMobileCategory === category.key}
                          aria-controls={`mobile-category-panel-${category.key}`}
                        >
                          <span className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              {category.title}
                            </span>
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openMobileCategory === category.key
                                ? "rotate-180"
                                : "rotate-0"
                            }`}
                          />
                        </button>
                        {openMobileCategory === category.key && (
                          <div
                            className="pl-9 pr-3 pb-2 space-y-1"
                            id={`mobile-category-panel-${category.key}`}
                            role="region"
                            aria-label={`Servicios para ${category.title}`}
                          >
                            {isLoadingServices(
                              category.specialtyId || category.key
                            ) ? (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                Cargando servicios...
                              </div>
                            ) : displayItems.length > 0 ? (
                              displayItems.map((item, idx) => {
                                const itemKey =
                                  (item as any).id ||
                                  item.href ||
                                  `mobile-item-${idx}`;
                                return (
                                  <Link
                                    key={itemKey}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                    className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                                  >
                                    {item.label}
                                  </Link>
                                );
                              })
                            ) : (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                No hay servicios disponibles
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                  )}
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
                    href="/preguntas-frecuentes"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Preguntas Frecuentes
                    </span>
                  </Link>
                  <Link
                    href="/acerca-de"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Acerca de</span>
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
          <div className="grid grid-cols-6 gap-3 py-4">
            {loadingSpecialties ? (
              // Skeleton mientras cargan las categorías
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="relative text-center pt-2"
                >
                  <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
                </div>
              ))
            ) : (
              SERVICE_CATEGORIES_TO_USE.map(
              ({ key, title, href, items, specialtyId }) => {
                // Para mostrar items: usar specialtyId si existe (backend), sino key (hardcodeadas)
                const displayKey = specialtyId || key;
                const displayItems =
                  servicesBySpecialty[displayKey] &&
                  servicesBySpecialty[displayKey].length > 0
                    ? servicesBySpecialty[displayKey]
                    : items;

                const isActive = activeDesktopCategory === displayKey;
                return (
                  <div
                    key={key}
                    className="relative text-center pt-2"
                    onMouseEnter={() =>
                      handleDesktopCategoryEnter(displayKey, specialtyId)
                    }
                    onMouseLeave={handleDesktopCategoryLeave}
                  >
                    <span className="text-gray-800 hover:text-purple-600 text-sm font-medium transition-colors px-2 inline-block cursor-default whitespace-nowrap">
                      {title}
                    </span>
                    <div
                      className={`transition-opacity duration-150 absolute top-full left-1/2 -translate-x-1/2 ${
                        key === "legales" ? "w-80" : "w-72"
                      } bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/60 ring-1 ring-black/5 z-50 text-left mt-2 ${
                        isActive
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="py-2">
                        {isLoadingServices(specialtyId || key) ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            Cargando servicios...
                          </div>
                        ) : displayItems.length > 0 ? (
                          displayItems.map((item, idx) => {
                            const itemHref = item.href;
                            const itemKey =
                              (item as any).id || itemHref || `item-${idx}`;
                            return (
                              <Link
                                key={itemKey}
                                href={itemHref}
                                onClick={() => {
                                  setIsDesktopMenuOpen(false);
                                }}
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-purple-600 text-sm"
                              >
                                {item.label}
                              </Link>
                            );
                          })
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No hay servicios disponibles
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
