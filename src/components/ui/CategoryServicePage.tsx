"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import PurpleSection from "@/components/ui/PurpleSection";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import { categoriesData, ServiceData } from "@/data/categories";
import { PublicSpecialty, PublicService } from "@/services/api/specialties";
import { professionalsService } from "@/services/api/professionals";
import type { ApiProfessional } from "@/services/types/api";

// Genera un slug SEO-friendly basado solo en el nombre del profesional.
// Ejemplo: name = "María López Pérez" -> "maria-lopez-perez"
function createProfessionalSlug(name: string): string {
  const baseName = (name || "").trim();

  const slugifiedName =
    baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "profesional";

  return slugifiedName;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const professionalsPerPage = 15; // 5 filas x 3 columnas = 15 profesionales
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [totalProfessionals, setTotalProfessionals] = useState(0);
  // Filtros - Leer de la URL o usar valor por defecto
  const [filterModalidad, setFilterModalidad] = useState<string>(() => {
    const modalidadFromUrl = searchParams.get("modalidad");
    return modalidadFromUrl || "presencial";
  });
  const hasInitializedModalidad = useRef(false);

  // Inicializar modalidad en la URL si no existe
  useEffect(() => {
    if (!hasInitializedModalidad.current) {
      const modalidadFromUrl = searchParams.get("modalidad");
      if (!modalidadFromUrl) {
        // Si no hay modalidad en la URL, establecer la por defecto
        const params = new URLSearchParams(searchParams.toString());
        params.set("modalidad", filterModalidad);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
      hasInitializedModalidad.current = true;
    }
  }, []);

  // Sincronizar modalidad con la URL cuando cambie desde fuera (navegación del navegador)
  useEffect(() => {
    if (!hasInitializedModalidad.current) return;
    const modalidadFromUrl = searchParams.get("modalidad");
    if (modalidadFromUrl && modalidadFromUrl !== filterModalidad) {
      setFilterModalidad(modalidadFromUrl);
    }
  }, [searchParams]);

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
      // Si el filtro es "a_domicilio", también intentar cargar precios para profesionales
      // que podrían tener precios de domicilio pero aún no se han cargado
      const targets = professionals.filter((p) => {
        const noPrices = !Array.isArray(p.precios) || p.precios.length === 0;
        const id = String(p.id || "");
        // Si el filtro es a_domicilio y el profesional tiene codigosPostalesDomicilio,
        // intentar cargar precios aunque ya se haya intentado antes (para recargar)
        const shouldRetry = 
          filterModalidad === "a_domicilio" && 
          (p as any).codigosPostalesDomicilio && 
          noPrices;
        return id && (noPrices && !attempted.has(id) || shouldRetry);
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
              moneda: precio.moneda || "EUR",
              duracion:
                precio.duracion ||
                (precio.duracion_minutos
                  ? `${precio.duracion_minutos} min`
                  : undefined),
              modalidad: precio.modalidad || undefined,
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
  }, [professionals, loadingProfessionals, filterModalidad]); // Agregar filterModalidad para recargar cuando cambia el filtro

  // Limpiar el ref de enriquecimiento cuando cambia el filtro para permitir recargar precios
  // Esto es especialmente importante para "a_domicilio" donde los precios pueden no estar cargados inicialmente
  useEffect(() => {
    if (enrichmentAttemptedIdsRef.current && filterModalidad === "a_domicilio") {
      console.log(`[CategoryServicePage] Limpiando ref de enriquecimiento al cambiar filtro a: ${filterModalidad}`);
      // Limpiar el ref para permitir recargar precios cuando cambia a a_domicilio
      enrichmentAttemptedIdsRef.current.clear();
    }
  }, [filterModalidad]);

  // Guardar IDs de profesionales ya intentados para enriquecimiento (evita spam de peticiones)
  const enrichmentAttemptedIdsRef = useRef<Set<string>>(new Set());

  // Aplicar filtros en cliente
  const currentProfessionals = professionals.filter((prof) => {
    // Modalidad: filtrar según la modalidad seleccionada
    const modalidad = filterModalidad.toLowerCase();
    const modalidades = (prof.modalidadesSesiones || []).map((m) =>
      m.toLowerCase()
    );

    // Verificar si el profesional tiene precios cargados
    const tienePreciosCargados =
      prof.precios && Array.isArray(prof.precios) && prof.precios.length > 0;

    let matchesModalidad = false;

    // Debug: Log para entender qué está pasando con el filtro
    if (modalidad === "a_domicilio") {
      console.log(`[CategoryServicePage] Filtrando profesional ${prof.id} para a_domicilio:`, {
        modalidadesSesiones: prof.modalidadesSesiones,
        modoAtencion: prof.modoAtencion,
        tienePreciosCargados,
        precios: prof.precios,
        preciosCount: prof.precios?.length || 0,
      });
    }

    if (modalidad === "presencial" || modalidad === "en_linea") {
      // Presencial y en_linea muestran los mismos profesionales
      // Verificar modalidades de sesión
      matchesModalidad = modalidades.some(
        (m) =>
          m.includes("presencial") ||
          m.includes("en linea") ||
          m.includes("en línea") ||
          m.includes("online")
      );
      // También verificar si hay precios con modalidad presencial, virtual, ambas, o sin modalidad
      if (!matchesModalidad && tienePreciosCargados) {
        matchesModalidad = prof.precios.some((p: any) => {
          const precioModalidad = (p.modalidad || "").toLowerCase().trim();
          // Incluir precios sin modalidad (aplican para ambas)
          if (!precioModalidad) {
            return true;
          }
          // "ambas" aplica para presencial y en_linea
          return (
            precioModalidad === "presencial" ||
            precioModalidad === "virtual" ||
            precioModalidad === "en_linea" ||
            precioModalidad === "online" ||
            precioModalidad === "ambas"
          );
        });
      }
      // Si no tiene precios cargados todavía, incluir temporalmente si tiene la modalidad en modalidadesSesiones
      // (esto evita que desaparezcan mientras se cargan los precios)
      if (!matchesModalidad && !tienePreciosCargados) {
        matchesModalidad = modalidades.some(
          (m) =>
            m.includes("presencial") ||
            m.includes("en linea") ||
            m.includes("en línea") ||
            m.includes("online")
        );
      }
    } else if (modalidad === "a_domicilio") {
      // PRIORIDAD 1: Si tiene precios cargados, verificar primero los precios
      // Esto es más confiable que depender de modalidadesSesiones o modoAtencion
      if (tienePreciosCargados) {
        console.log(`[CategoryServicePage] Verificando precios para profesional ${prof.id}:`, {
          precios: prof.precios,
        });
        matchesModalidad = prof.precios.some((p: any) => {
          // Extraer modalidad desde diferentes ubicaciones posibles
          const precioModalidad = (
            p.modalidad ||
            (p as any).raw?.modalidad ||
            p.raw?.modalidad ||
            ""
          )
            .toLowerCase()
            .trim();

          // "ambas" NO aplica para domicilio, solo para presencial/virtual
          // Solo buscar "domicilio" o "a_domicilio"
          const matches =
            precioModalidad === "a_domicilio" ||
            precioModalidad === "domicilio";

          // Debug: loggear todos los precios para ver qué modalidades tienen
          console.log(`[CategoryServicePage] Precio del profesional ${prof.id}:`, {
            precioModalidad,
            precioCompleto: p,
            matches,
          });

          return matches;
        });
      }

      // PRIORIDAD 2: Verificar si tiene códigos postales de domicilio
      // Si tiene codigos_postales_domicilio, significa que ofrece servicio a domicilio
      if (!matchesModalidad && (prof as any).codigosPostalesDomicilio) {
        const codigosPostales = String((prof as any).codigosPostalesDomicilio || "").trim();
        if (codigosPostales.length > 0) {
          console.log(`[CategoryServicePage] Profesional ${prof.id} tiene códigos postales de domicilio:`, codigosPostales);
          matchesModalidad = true;
        }
      }

      // PRIORIDAD 3: Verificar modalidadesSesiones
      if (!matchesModalidad) {
        matchesModalidad = modalidades.some(
          (m) => m.includes("domicilio") || m.includes("a domicilio")
        );
      }

      // PRIORIDAD 4: Verificar modoAtencion del profesional
      if (
        !matchesModalidad &&
        prof.modoAtencion &&
        Array.isArray(prof.modoAtencion)
      ) {
        matchesModalidad = prof.modoAtencion.some((m: string) => {
          const modoLower = (m || "").toLowerCase().trim();
          return modoLower === "a_domicilio" || modoLower === "domicilio";
        });
      }
    }

    // Debug final
    if (modalidad === "a_domicilio" && !matchesModalidad) {
      console.log(`[CategoryServicePage] Profesional ${prof.id} NO coincide con a_domicilio después de todas las verificaciones`);
    } else if (modalidad === "a_domicilio" && matchesModalidad) {
      console.log(`[CategoryServicePage] ✅ Profesional ${prof.id} SÍ coincide con a_domicilio`);
    }

    if (!matchesModalidad) return false;

    return true;
  });

  // Lógica de paginación - usar el total de profesionales filtrados
  const totalProfessionalsFiltrados = currentProfessionals.length;
  const startIndex = (currentPage - 1) * professionalsPerPage;
  const endIndex = startIndex + professionalsPerPage;
  const currentProfessionalsPaginated = currentProfessionals.slice(
    startIndex,
    endIndex
  );
  const totalPages = Math.ceil(
    totalProfessionalsFiltrados / professionalsPerPage
  );

  // Debug: Log para verificar el filtrado
  useEffect(() => {
    console.log(`[CategoryServicePage] Filtro de modalidad: "${filterModalidad}"`, {
      totalProfesionales: professionals.length,
      profesionalesFiltrados: totalProfessionalsFiltrados,
      profesionalesPagina: currentProfessionalsPaginated.length,
      paginaActual: currentPage,
      totalPaginas: totalPages,
    });
  }, [filterModalidad, totalProfessionalsFiltrados, currentProfessionalsPaginated.length, currentPage, totalPages, professionals.length]);

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
    <main className="min-h-screen bg-gray-50" aria-labelledby="category-title">
      <h1 id="category-title" className="sr-only">
        {pageTitle}
      </h1>
      {/* Purple Section */}
      <PurpleSection
        title={pageTitle}
        subtitle={pageSubtitle}
        searchPlaceholder={searchPlaceholder}
        backgroundImage={backgroundImage}
      />

      {/* Filter Bar */}
      <section
        className="bg-white border-b border-gray-200"
        aria-labelledby="filter-title"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <h2
              id="filter-title"
              className="text-lg font-semibold text-purple-600"
            >
              Profesionales Disponibles
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-6">
            <div className="relative w-full sm:w-auto">
              <label htmlFor="modalidad-filter" className="sr-only">
                Filtrar por modalidad
              </label>
              <select
                id="modalidad-filter"
                className="w-full appearance-none px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-gray-600 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[140px]"
                value={filterModalidad}
                onChange={(e) => {
                  const nuevaModalidad = e.target.value;
                  setFilterModalidad(nuevaModalidad);
                  // Resetear a la página 1 cuando cambia el filtro
                  setCurrentPage(1);
                  // Actualizar la URL con la nueva modalidad
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("modalidad", nuevaModalidad);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}
                aria-label="Modalidad de sesión"
              >
                <option value="presencial">Presencial</option>
                <option value="en_linea">En Línea</option>
                <option value="a_domicilio">A Domicilio</option>
              </select>
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                aria-hidden="true"
              >
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
      </section>

      {/* Professionals Grid */}
      <section
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12"
        aria-labelledby="professionals-list-title"
      >
        <h2 id="professionals-list-title" className="sr-only">
          Lista de profesionales
        </h2>
        {loadingProfessionals ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
              aria-hidden="true"
            ></div>
            <p className="mt-4 text-gray-600">Cargando profesionales...</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              role="list"
              aria-label="Profesionales disponibles"
            >
              {currentProfessionalsPaginated.map((professional) => {
                // Usar el serviceSlug si existe, sino usar el slug de la especialidad
                const effectiveServiceSlug = serviceSlug || categorySlug;

                // Mapear ApiProfessional al formato que espera ProfessionalCard
                // Los datos ya vienen mapeados del servicio, solo necesitamos adaptarlos al formato del card
                // Calcular precio mínimo filtrando por la modalidad seleccionada
                const minPrice = (() => {
                  const prices = Array.isArray(professional.precios)
                    ? professional.precios
                    : [];
                  
                  if (prices.length > 0) {
                    // Filtrar precios según la modalidad seleccionada
                    let preciosFiltrados = prices;
                    const modalidadLower = filterModalidad.toLowerCase();
                    
                    if (modalidadLower === "presencial" || modalidadLower === "en_linea") {
                      // Para presencial/en_linea: incluir presencial, virtual, ambas, y sin modalidad
                      preciosFiltrados = prices.filter((p: any) => {
                        const precioModalidad = (p.modalidad || "").toLowerCase().trim();
                        return (
                          !precioModalidad ||
                          precioModalidad === "presencial" ||
                          precioModalidad === "virtual" ||
                          precioModalidad === "en_linea" ||
                          precioModalidad === "online" ||
                          precioModalidad === "ambas"
                        );
                      });
                    } else if (modalidadLower === "a_domicilio") {
                      // Para domicilio: solo incluir precios de domicilio
                      preciosFiltrados = prices.filter((p: any) => {
                        const precioModalidad = (p.modalidad || "").toLowerCase().trim();
                        return (
                          precioModalidad === "a_domicilio" ||
                          precioModalidad === "domicilio"
                        );
                      });
                    }
                    
                    // Calcular el mínimo de los precios filtrados
                    if (preciosFiltrados.length > 0) {
                      const values = preciosFiltrados
                        .map((p: any) => {
                          // Extraer precio desde diferentes ubicaciones posibles
                          // El precio puede estar en p.precio directamente
                          let precioValor = 0;
                          
                          // Intentar desde p.precio primero
                          if (typeof p.precio === "number") {
                            precioValor = p.precio;
                          } else if (p.precio !== undefined && p.precio !== null && p.precio !== "") {
                            const parsed = Number(p.precio);
                            if (!isNaN(parsed)) {
                              precioValor = parsed;
                            }
                          }
                          
                          // Si no hay precio, intentar desde raw
                          if (precioValor === 0 && p.raw) {
                            if (typeof p.raw.precio === "number") {
                              precioValor = p.raw.precio;
                            } else if (p.raw.precio !== undefined && p.raw.precio !== null && p.raw.precio !== "") {
                              const parsed = Number(p.raw.precio);
                              if (!isNaN(parsed)) {
                                precioValor = parsed;
                              }
                            }
                          }
                          
                          // Debug: loggear si encontramos un precio
                          if (precioValor > 0) {
                            console.log(`[CategoryServicePage] Precio encontrado para ${professional.id}:`, {
                              precioValor,
                              precioCompleto: p,
                              modalidad: p.modalidad,
                            });
                          } else {
                            console.warn(`[CategoryServicePage] No se pudo extraer precio de:`, p);
                          }
                          
                          return precioValor;
                        })
                        .filter((v) => v > 0);
                      if (values.length > 0) {
                        const min = Number(Math.min(...values).toFixed(2));
                        console.log(`[CategoryServicePage] ✅ Precio mínimo para ${professional.id}:`, {
                          modalidad: filterModalidad,
                          preciosTotales: prices.length,
                          preciosFiltrados: preciosFiltrados.length,
                          valores: values,
                          minimo: min,
                        });
                        return min;
                      } else {
                        console.warn(`[CategoryServicePage] ⚠️ No se encontraron valores de precio válidos para ${professional.id} con modalidad ${filterModalidad}:`, {
                          preciosFiltrados,
                          preciosTotales: prices,
                        });
                      }
                    } else {
                      console.warn(`[CategoryServicePage] ⚠️ No hay precios filtrados para ${professional.id} con modalidad ${filterModalidad}:`, {
                        preciosTotales: prices,
                        modalidadFiltro: filterModalidad,
                      });
                    }
                  }
                  
                  // Fallback a tarifa por hora si no hay precios
                  if (professional.tarifaPorHora) {
                    return Number(
                      Number(professional.tarifaPorHora).toFixed(2)
                    );
                  }
                  
                  console.warn(`[CategoryServicePage] No se encontró precio para profesional ${professional.id} con modalidad ${filterModalidad}`, {
                    precios: professional.precios,
                    tarifaPorHora: professional.tarifaPorHora,
                  });
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
                    professional.fullName || professional.name || "Profesional",
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
                  // Slug basado SOLO en el nombre del profesional (sin ID en la URL)
                  // Ejemplo: "/psicologia/ansiedad/maria-lopez-perez"
                  slug: createProfessionalSlug(
                    professional.fullName || professional.name || "Profesional"
                  ),
                };

                return (
                  <ProfessionalCard
                    key={mappedProfessional.id}
                    professional={mappedProfessional}
                    categorySlug={categorySlug}
                    serviceSlug={effectiveServiceSlug}
                    modalidad={filterModalidad}
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
                    aria-label="Página anterior"
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
                            aria-label={`Página ${page}`}
                            aria-current={
                              currentPage === page ? "page" : undefined
                            }
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
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}

            {/* Información de paginación */}
            {totalProfessionalsFiltrados > 0 && (
              <div
                className="mt-6 text-center text-xs sm:text-sm text-gray-500"
                aria-live="polite"
              >
                Mostrando {startIndex + 1} -{" "}
                {Math.min(endIndex, totalProfessionalsFiltrados)}{" "}
                de {totalProfessionalsFiltrados} profesionales
              </div>
            )}
          </>
        )}
      </section>

      {/* Empty State */}
      {!loadingProfessionals && totalProfessionalsFiltrados === 0 && (
        <section
          className="container mx-auto px-4 py-12 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
        </section>
      )}
    </main>
  );
}
