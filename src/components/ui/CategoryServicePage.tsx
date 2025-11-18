"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import PurpleSection from "@/components/ui/PurpleSection";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import { categoriesData, ServiceData } from "@/data/categories";
import { PublicSpecialty, PublicService } from "@/services/api/specialties";
import { professionalsService } from "@/services/api/professionals";
import type { ApiProfessional } from "@/services/types/api";

interface CategoryServicePageProps {
  categorySlug: string;
  serviceSlug?: string;
  specialtyData?: PublicSpecialty;
  serviceData?: PublicService;
}

export default function CategoryServicePage({
  categorySlug,
  serviceSlug,
  specialtyData,
  serviceData,
}: CategoryServicePageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const professionalsPerPage = 15; // 5 filas x 3 columnas = 15 profesionales
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [totalProfessionals, setTotalProfessionals] = useState(0);
  // Filtros
  const [filterModalidad, setFilterModalidad] = useState<string>("");
  const [filterUbicacion, setFilterUbicacion] = useState<string>("");
  const [filterHorario, setFilterHorario] = useState<string>("");

  // Intentar usar datos del backend primero, sino usar datos hardcodeados como fallback
  const categoryData = categoriesData[categorySlug];

  // Si tenemos datos del backend, usarlos para el título y subtítulo
  let pageTitle: string;
  let pageSubtitle: string;
  let searchPlaceholder: string;
  let backgroundImage: string | undefined;

  if (serviceData && specialtyData) {
    // Usar datos dinámicos del backend
    const serviceName =
      serviceData.nombre_servicio ||
      serviceData.nombre ||
      serviceData.name ||
      "Servicio";
    const specialtyName =
      specialtyData.nombre || specialtyData.name || "Especialidad";

    pageTitle = serviceName;
    pageSubtitle = `Profesionales especializados en ${serviceName}`;
    searchPlaceholder = `Buscar profesionales de ${serviceName}`;
    backgroundImage = undefined; // El backend no tiene imagen por ahora
  } else if (specialtyData) {
    // Solo tenemos datos de la especialidad
    const specialtyName =
      specialtyData.nombre || specialtyData.name || "Especialidad";
    pageTitle = specialtyName;
    pageSubtitle = `Profesionales especializados en ${specialtyName}`;
    searchPlaceholder = `Buscar profesionales de ${specialtyName}`;
    backgroundImage = undefined;
  } else if (categoryData) {
    // Usar datos hardcodeados como fallback
    if (serviceSlug) {
      const serviceDataHardcoded = categoryData.services.find(
        (service) => service.id === serviceSlug
      );
      if (serviceDataHardcoded) {
        pageTitle = serviceDataHardcoded.title;
        pageSubtitle = serviceDataHardcoded.subtitle;
        searchPlaceholder = serviceDataHardcoded.searchPlaceholder;
        backgroundImage = serviceDataHardcoded.backgroundImage;
      } else {
        pageTitle = categoryData.title;
        pageSubtitle = categoryData.subtitle;
        searchPlaceholder = categoryData.searchPlaceholder;
        backgroundImage = categoryData.backgroundImage;
      }
    } else {
      pageTitle = categoryData.title;
      pageSubtitle = categoryData.subtitle;
      searchPlaceholder = categoryData.searchPlaceholder;
      backgroundImage = categoryData.backgroundImage;
    }
  } else {
    // No hay datos disponibles
    notFound();
  }

  // Cargar profesionales desde el backend si tenemos datos de especialidad
  useEffect(() => {
    const loadProfessionals = async () => {
      if (specialtyData) {
        const specialtyId = String(
          specialtyData.id_especialidad || specialtyData.id || ""
        );
        if (specialtyId) {
          setLoadingProfessionals(true);
          try {
            const response =
              await professionalsService.getPublicProfessionalsBySpecialtyId(
                specialtyId,
                {
                  page: currentPage,
                  limit: professionalsPerPage, // 15 profesionales por página
                }
              );

            if (response.success && response.data) {
              const professionalsData = (response.data.data ||
                []) as ApiProfessional[];
              const paginationData = (response.data.pagination || {}) as Record<
                string,
                any
              >;

              console.log(
                `[CategoryServicePage] Profesionales cargados:`,
                professionalsData.length
              );
              console.log(`[CategoryServicePage] Paginación:`, paginationData);

              setProfessionals(professionalsData);
              setTotalProfessionals(
                Number(paginationData.total ?? professionalsData.length ?? 0)
              );
            } else {
              console.error(
                "[CategoryServicePage] Error loading professionals:",
                response.error
              );
              setProfessionals([]);
              setTotalProfessionals(0);
            }
          } catch (error) {
            console.error("Error loading professionals:", error);
            setProfessionals([]);
            setTotalProfessionals(0);
          } finally {
            setLoadingProfessionals(false);
          }
        }
      } else if (categoryData) {
        // Fallback a datos hardcodeados si no hay datos del backend
        setProfessionals(
          (categoryData.professionals as unknown as ApiProfessional[]) || []
        );
        setTotalProfessionals(categoryData.professionals?.length || 0);
        setLoadingProfessionals(false);
      } else {
        setProfessionals([]);
        setTotalProfessionals(0);
        setLoadingProfessionals(false);
      }
    };

    loadProfessionals();
  }, [specialtyData, currentPage, professionalsPerPage, categoryData]);

  // Enriquecer profesionales con precios mínimos e imagen si faltan (fetch por profesional)
  useEffect(() => {
    const enrichMissingData = async () => {
      const API_BASE_URL = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");
      // Evitar reintentar enriquecimiento para los mismos IDs
      if (!enrichmentAttemptedIdsRef.current) {
        enrichmentAttemptedIdsRef.current = new Set<string>();
      }
      const attempted = enrichmentAttemptedIdsRef.current;
      // Seleccionar los que no tienen precios y que no se hayan intentado ya
      const targets = professionals.filter((p) => {
        const noPrices = !Array.isArray(p.precios) || p.precios.length === 0;
        const id = String(p.id || "");
        return noPrices && id && !attempted.has(id);
      });
      if (targets.length === 0) return;
      try {
        // Marcar como intentados inmediatamente para evitar bucles incluso si la respuesta no trae precios
        targets.forEach((p) => {
          const id = String(p.id || "");
          if (id) attempted.add(id);
        });
        const results = await Promise.allSettled(
          targets.map(async (p) => {
            const id = p.id;
            const res = await fetch(`${API_BASE_URL}/profesionales/${id}`);
            if (!res.ok) return null;
            const data = await res.json().catch(() => ({}));
            const profData =
              data?.data?.profesional || data?.profesional || data || null;
            if (!profData) return null;
            const preciosRaw = Array.isArray(profData.precios)
              ? profData.precios
              : [];
            const mappedPrices = preciosRaw.map((precio: any) => ({
              id_precio: precio.id_precio ?? precio.id ?? 0,
              nombre_servicio:
                precio.nombre_servicio ||
                precio.nombre_paquete ||
                precio.nombre ||
                "Servicio",
              descripcion: precio.descripcion ?? "",
              precio:
                typeof precio.precio === "number"
                  ? precio.precio
                  : Number(precio.precio) || 0,
              moneda: precio.moneda || "MXN",
              duracion:
                precio.duracion ||
                (precio.duracion_minutos
                  ? `${precio.duracion_minutos} min`
                  : undefined),
            }));
            const foto =
              profData.foto_perfil ||
              profData.imagen_perfil ||
              p.profileImage ||
              null;
            return { id, precios: mappedPrices, profileImage: foto };
          })
        );
        const enriched = results
          .filter(
            (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
          )
          .map((r) => r.value)
          .filter(Boolean);
        if (enriched.length) {
          setProfessionals((prev) =>
            prev.map((p) => {
              const found = enriched.find((e) => e.id === p.id);
              if (!found) return p;
              return {
                ...p,
                precios: Array.isArray(found.precios)
                  ? found.precios
                  : p.precios,
                profileImage: found.profileImage || p.profileImage,
              };
            })
          );
        }
      } catch (e) {
        console.warn(
          "[CategoryServicePage] No se pudo enriquecer precios/imagen:",
          e
        );
      }
    };
    if (!loadingProfessionals && professionals.length > 0) {
      enrichMissingData();
    }
  }, [professionals, loadingProfessionals]);

  // Guardar IDs de profesionales ya intentados para enriquecimiento (evita spam de peticiones)
  const enrichmentAttemptedIdsRef = useRef<Set<string>>(new Set());

  // Lógica de paginación
  const totalPages = Math.ceil(totalProfessionals / professionalsPerPage);
  // Aplicar filtros en cliente
  const currentProfessionals = professionals.filter((prof) => {
    // Modalidad: 'Presencial' | 'Online' | 'Híbrida' | 'A domicilio'
    if (filterModalidad) {
      const modalidad = filterModalidad.toLowerCase();
      const modalidades = (prof.modalidadesSesiones || []).map((m) =>
        m.toLowerCase()
      );
      const matchesModalidad =
        modalidad === "todas" ||
        modalidades.includes(modalidad) ||
        // Soporte de alias
        (modalidad === "online" &&
          (modalidades.includes("en linea") ||
            modalidades.includes("en línea"))) ||
        (modalidad === "híbrida" &&
          modalidades.includes("presencial") &&
          (modalidades.includes("en linea") ||
            modalidades.includes("en línea")));
      if (!matchesModalidad) return false;
    }

    // Ubicación: match por ciudad o direccion; 'Online' filtra a quienes tienen modalidad en línea
    if (filterUbicacion) {
      const ubi = filterUbicacion.toLowerCase();
      if (ubi === "todas") {
        // no-op
      } else if (ubi === "online") {
        const modalidades = (prof.modalidadesSesiones || []).map((m) =>
          m.toLowerCase()
        );
        if (
          !(
            modalidades.includes("en linea") || modalidades.includes("en línea")
          )
        )
          return false;
      } else {
        const city = (prof.city || "").toLowerCase();
        const address = (prof.direccion || "").toLowerCase();
        if (!city.includes(ubi) && !address.includes(ubi)) return false;
      }
    }

    // Horario: usar disponibilidad.horario si existe
    if (filterHorario) {
      const f = filterHorario.toLowerCase();
      if (f === "todos") {
        // no-op
      } else {
        const availability: any = prof.availability || {};
        const horario = availability?.horario;
        const dias = availability?.dias || [];
        let matches = false;

        if (f === "fines de semana") {
          matches = dias.some((d: string) =>
            ["sabado", "sábado", "domingo"].includes((d || "").toLowerCase())
          );
        } else if (horario?.desde && horario?.hasta) {
          // Parse horas HH:MM or HH:MM:SS
          const parseHour = (s: string) => {
            const parts = s.split(":");
            const h = parseInt(parts[0] || "0", 10);
            return isNaN(h) ? 0 : h;
          };
          const hStart = parseHour(horario.desde);
          const hEnd = parseHour(horario.hasta);
          // Considerar rangos básicos
          if (f === "mañana") {
            matches = hStart < 12;
          } else if (f === "tarde") {
            matches = hStart >= 12 && hStart < 18;
          } else if (f === "noche") {
            matches = hStart >= 18 || hEnd >= 20;
          }
        }

        if (!matches) return false;
      }
    }

    return true;
  });

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple Section */}
      <PurpleSection
        title={pageTitle}
        subtitle={pageSubtitle}
        searchPlaceholder={searchPlaceholder}
        backgroundImage={backgroundImage}
      />

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-purple-600">
              Profesionales Disponibles
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-6">
            <div className="relative w-full sm:w-auto">
              <select
                className="w-full appearance-none px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-600 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
                value={filterModalidad}
                onChange={(e) => setFilterModalidad(e.target.value)}
              >
                <option value="" disabled>
                  Modalidad
                </option>
                <option value="Todas">Todas</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
                <option value="Híbrida">Híbrida</option>
                <option value="A domicilio">A domicilio</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                className="w-full appearance-none px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-600 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
                value={filterUbicacion}
                onChange={(e) => setFilterUbicacion(e.target.value)}
              >
                <option value="" disabled>
                  Ubicación
                </option>
                <option value="Todas">Todas</option>
                <option value="Online">Online</option>
                <option>A Coruña</option>
                <option>Álava</option>
                <option>Albacete</option>
                <option>Alcalá de Henares</option>
                <option>Alcobendas</option>
                <option>Alcorcón</option>
                <option>Algeciras</option>
                <option>Almería</option>
                <option>Alzira</option>
                <option>Antequera</option>
                <option>Arrecife</option>
                <option>Ávila</option>
                <option>Badajoz</option>
                <option>Badalona</option>
                <option>Baeza</option>
                <option>Barcelona</option>
                <option>Barakaldo</option>
                <option>Bilbao</option>
                <option>Burgos</option>
                <option>Cáceres</option>
                <option>Cádiz</option>
                <option>Cartagena</option>
                <option>Castellón de la Plana</option>
                <option>Ceuta</option>
                <option>Ciudad Real</option>
                <option>Córdoba</option>
                <option>Cuenca</option>
                <option>Donostia-San Sebastián</option>
                <option>Dos Hermanas</option>
                <option>Elche</option>
                <option>Ferrol</option>
                <option>Fuenlabrada</option>
                <option>Gandía</option>
                <option>Getafe</option>
                <option>Gijón</option>
                <option>Girona</option>
                <option>Granada</option>
                <option>Guadalajara</option>
                <option>Huelva</option>
                <option>Huesca</option>
                <option>Ibiza</option>
                <option>Jaén</option>
                <option>Jerez de la Frontera</option>
                <option>Las Palmas de Gran Canaria</option>
                <option>Leganés</option>
                <option>León</option>
                <option>Lérida</option>
                <option>Linares</option>
                <option>Logroño</option>
                <option>Lorca</option>
                <option>Lugo</option>
                <option>Madrid</option>
                <option>Málaga</option>
                <option>Marbella</option>
                <option>Mataró</option>
                <option>Melilla</option>
                <option>Mérida</option>
                <option>Mijas</option>
                <option>Móstoles</option>
                <option>Murcia</option>
                <option>Ourense</option>
                <option>Oviedo</option>
                <option>Palencia</option>
                <option>Palma de Mallorca</option>
                <option>Pamplona</option>
                <option>Parla</option>
                <option>Pontevedra</option>
                <option>Pozuelo de Alarcón</option>
                <option>Reus</option>
                <option>Sabadell</option>
                <option>Salamanca</option>
                <option>San Cristóbal de La Laguna</option>
                <option>San Fernando</option>
                <option>San Sebastián de los Reyes</option>
                <option>Santa Coloma de Gramenet</option>
                <option>Santa Cruz de Tenerife</option>
                <option>Santander</option>
                <option>Santiago de Compostela</option>
                <option>Segovia</option>
                <option>Sevilla</option>
                <option>Soria</option>
                <option>Tarragona</option>
                <option>Telde</option>
                <option>Teruel</option>
                <option>Toledo</option>
                <option>Torrelavega</option>
                <option>Torrevieja</option>
                <option>Valencia</option>
                <option>Valladolid</option>
                <option>Vélez-Málaga</option>
                <option>Vigo</option>
                <option>Vitoria-Gasteiz</option>
                <option>Zamora</option>
                <option>Zaragoza</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                className="w-full appearance-none px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-600 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
                value={filterHorario}
                onChange={(e) => setFilterHorario(e.target.value)}
              >
                <option value="" disabled>
                  Horario
                </option>
                <option value="Todos">Todos</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Fines de semana">Fines de semana</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professionals Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {loadingProfessionals ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Cargando profesionales...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {currentProfessionals.map((professional) => {
                // Usar el serviceSlug si existe, sino usar el slug de la especialidad
                const effectiveServiceSlug = serviceSlug || categorySlug;

                // Mapear ApiProfessional al formato que espera ProfessionalCard
                // Los datos ya vienen mapeados del servicio, solo necesitamos adaptarlos al formato del card
                const minPrice = (() => {
                  const prices = Array.isArray(professional.precios)
                    ? professional.precios
                    : [];
                  if (prices.length > 0) {
                    const values = prices
                      .map((p) =>
                        typeof p.precio === "number"
                          ? p.precio
                          : Number(p.precio) || 0
                      )
                      .filter((v) => v > 0);
                    if (values.length > 0) {
                      return Number(Math.min(...values).toFixed(2));
                    }
                  }
                  if (professional.tarifaPorHora) {
                    return Number(
                      Number(professional.tarifaPorHora).toFixed(2)
                    );
                  }
                  return 0;
                })();

                const cardImage =
                  professional.profileImage &&
                  professional.profileImage.trim().length > 0
                    ? professional.profileImage
                    : "/placeholder-professional.jpg";

                const mappedProfessional = {
                  id: professional.id || "",
                  name:
                    professional.name || professional.fullName || "Profesional",
                  title: professional.specialty || "Especialista",
                  description: professional.bio || "",
                  rating: professional.rating || 0,
                  reviewCount: professional.totalSessions || 0, // Usar totalSessions como reviewCount
                  price: minPrice,
                  image: cardImage,
                  isPopular:
                    professional.status === "activo" &&
                    (professional.rating || 0) >= 4.5, // Popular si está activo y tiene buena calificación
                  specialties: professional.specialty
                    ? [professional.specialty]
                    : [],
                  slug: professional.id || "", // Usar ID como slug si no hay slug
                };

                return (
                  <ProfessionalCard
                    key={mappedProfessional.id}
                    professional={mappedProfessional}
                    categorySlug={categorySlug}
                    serviceSlug={effectiveServiceSlug}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 sm:mt-12 flex justify-center">
                <nav
                  className="flex flex-wrap items-center justify-center gap-2"
                  aria-label="Paginación"
                >
                  {/* Botón Anterior */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Mostrar solo algunas páginas alrededor de la actual
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage) {
                          // Mostrar puntos suspensivos si hay gap
                          if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-3 py-2 text-sm text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}

            {/* Información de paginación */}
            {totalProfessionals > 0 && (
              <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
                Mostrando {(currentPage - 1) * professionalsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * professionalsPerPage,
                  totalProfessionals
                )}{" "}
                de {totalProfessionals} profesionales
              </div>
            )}
          </>
        )}
      </div>

      {/* Empty State */}
      {!loadingProfessionals && totalProfessionals === 0 && (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay profesionales disponibles
            </h3>
            <p className="text-gray-500">
              Pronto tendremos profesionales disponibles en esta categoría.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
