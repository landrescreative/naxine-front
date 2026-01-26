"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
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
  const [enrichingPrices, setEnrichingPrices] = useState(false);
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
    // Limpiar refs cuando cambia la especialidad o la página (navegación)
    enrichmentAttemptedIdsRef.current?.clear();
    isEnrichingRef.current = false;
    // No limpiar lastValidPricesRef aquí, se limpiará solo cuando cambien los profesionales
    
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

              // Limpiar el ref de enriquecimiento cuando se cargan nuevos profesionales
              // Esto asegura que los precios se carguen cuando navegas a una nueva página
              const newProfessionalsKey = professionalsData.map(p => p.id).sort().join(',');
              if (newProfessionalsKey !== lastProfessionalsKeyRef.current && newProfessionalsKey) {
                // Solo limpiar si realmente cambió la lista de profesionales (navegación)
                if (lastProfessionalsKeyRef.current) {
                  enrichmentAttemptedIdsRef.current?.clear();
                  lastValidPricesRef.current.clear(); // Limpiar precios válidos solo cuando cambian los profesionales
                }
                isEnrichingRef.current = false;
                lastProfessionalsKeyRef.current = newProfessionalsKey;
              }

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
      // Evitar múltiples ejecuciones simultáneas
      if (isEnrichingRef.current) {
        return;
      }
      
      const API_BASE_URL = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");
      // Evitar reintentar enriquecimiento para los mismos IDs
      // Limpiar el ref cuando cambian los profesionales (navegación a nueva página)
      if (!enrichmentAttemptedIdsRef.current) {
        enrichmentAttemptedIdsRef.current = new Set<string>();
      }
      const attempted = enrichmentAttemptedIdsRef.current;
      
      // Crear una clave única basada en los IDs de profesionales actuales
      // para detectar cuando cambian los profesionales (navegación)
      const currentProfessionalsKey = professionals.map(p => p.id).sort().join(',');
      
      // Si los profesionales cambiaron (navegación), limpiar los refs
      // Solo limpiar si realmente cambió la lista de profesionales (navegación a nueva página)
      if (currentProfessionalsKey !== lastProfessionalsKeyRef.current && currentProfessionalsKey) {
        // Solo limpiar si el último key no está vacío (para evitar limpiar en la primera carga)
        if (lastProfessionalsKeyRef.current) {
          attempted.clear();
          lastValidPricesRef.current.clear(); // Limpiar también los precios válidos anteriores
        }
        isEnrichingRef.current = false; // Resetear el flag de enriquecimiento
        lastProfessionalsKeyRef.current = currentProfessionalsKey;
      }
      
      // Función helper para verificar si hay precios para la modalidad actual
      // Esta función replica la lógica de calculateMinPrice para verificar si hay precios válidos
      const hasPricesForModalidad = (p: ApiProfessional, modalidad: string): boolean => {
        const prices = Array.isArray(p.precios) ? p.precios : [];
        if (prices.length === 0) return false;
        
        const modalidadLower = modalidad.toLowerCase();
        let preciosFiltrados = prices;
        
        if (modalidadLower === "presencial" || modalidadLower === "en_linea") {
          preciosFiltrados = prices.filter((pr: any) => {
            const precioModalidad = (pr.modalidad || "").toLowerCase().trim();
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
          preciosFiltrados = prices.filter((pr: any) => {
            const precioModalidad = (pr.modalidad || "").toLowerCase().trim();
            return (
              precioModalidad === "a_domicilio" ||
              precioModalidad === "domicilio"
            );
          });
        }
        
        // Verificar que haya precios filtrados con valores válidos (> 0)
        if (preciosFiltrados.length === 0) return false;
        
        const hasValidPrices = preciosFiltrados.some((pr: any) => {
          const precioValor = typeof pr.precio === "number" 
            ? pr.precio 
            : Number(pr.precio) || 0;
          return precioValor > 0;
        });
        
        return hasValidPrices;
      };
      
      // Seleccionar profesionales que necesitan enriquecimiento:
      // 1. No tienen precios en absoluto (siempre cargar si no se ha intentado)
      // 2. Tienen precios pero no para la modalidad actual
      // 3. No se han intentado cargar aún para esta modalidad específica
      const targets = professionals.filter((p) => {
        const id = String(p.id || "");
        if (!id) return false;
        
        const noPrices = !Array.isArray(p.precios) || p.precios.length === 0;
        
        // Crear una clave única por modalidad para permitir recargar cuando cambia la modalidad
        // Para profesionales sin precios, usar una clave genérica sin modalidad
        const modalidadKey = noPrices ? `${id}-all` : `${id}-${filterModalidad}`;
        
        // Si ya se intentó cargar para esta combinación, no intentar de nuevo
        if (attempted.has(modalidadKey)) {
          return false;
        }
        
        // Si no tiene precios en absoluto, siempre intentar cargar (primera vez)
        if (noPrices) {
          return true;
        }
        
        // Si tiene precios, verificar si tiene precios para la modalidad actual
        const noPricesForModalidad = !hasPricesForModalidad(p, filterModalidad);
        
        // Cargar si no tiene precios para la modalidad actual
        return noPricesForModalidad;
      });
      
      if (targets.length === 0) {
        setEnrichingPrices(false);
        return;
      }
      
      // Marcar que estamos enriqueciendo para evitar ejecuciones simultáneas
      isEnrichingRef.current = true;
      setEnrichingPrices(true);
      
      try {
        // Marcar como intentados inmediatamente para evitar bucles incluso si la respuesta no trae precios
        // Usar clave por modalidad para permitir recargar cuando cambia la modalidad
        targets.forEach((p) => {
          const id = String(p.id || "");
          if (id) {
            const noPrices = !Array.isArray(p.precios) || p.precios.length === 0;
            // Para profesionales sin precios, usar clave genérica; para otros, usar clave por modalidad
            const modalidadKey = noPrices ? `${id}-all` : `${id}-${filterModalidad}`;
            attempted.add(modalidadKey);
          }
        });
        // Procesar en lotes para evitar demasiadas peticiones simultáneas
        const batchSize = 5; // Máximo 5 peticiones simultáneas
        const allResults: PromiseSettledResult<any>[] = [];
        
        for (let i = 0; i < targets.length; i += batchSize) {
          const batch = targets.slice(i, i + batchSize);
          const batchResults = await Promise.allSettled(
            batch.map(async (p) => {
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
          allResults.push(...batchResults);
          
          // Pequeño delay entre lotes para evitar sobrecargar el servidor
          if (i + batchSize < targets.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        const results = allResults;
        const enriched = results
          .filter(
            (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
          )
          .map((r) => r.value)
          .filter(Boolean);
        if (enriched.length) {
          // Guardar precios válidos en el ref antes de actualizar el estado
          enriched.forEach((e) => {
            if (Array.isArray(e.precios) && e.precios.length > 0) {
              // Calcular el precio mínimo para la modalidad actual y guardarlo
              const prices = e.precios;
              const modalidadLower = filterModalidad.toLowerCase();
              let preciosFiltrados = prices;
              
              if (modalidadLower === "presencial" || modalidadLower === "en_linea") {
                preciosFiltrados = prices.filter((pr: any) => {
                  const precioModalidad = (pr.modalidad || "").toLowerCase().trim();
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
                preciosFiltrados = prices.filter((pr: any) => {
                  const precioModalidad = (pr.modalidad || "").toLowerCase().trim();
                  return (
                    precioModalidad === "a_domicilio" ||
                    precioModalidad === "domicilio"
                  );
                });
              }
              
              if (preciosFiltrados.length > 0) {
                const values = preciosFiltrados
                  .map((pr: any) => {
                    const precioValor = typeof pr.precio === "number" 
                      ? pr.precio 
                      : Number(pr.precio) || 0;
                    return precioValor;
                  })
                  .filter((v) => v > 0);
                
                if (values.length > 0) {
                  const minPrice = Number(Math.min(...values).toFixed(2));
                  const priceKey = `${e.id}-${filterModalidad}`;
                  lastValidPricesRef.current.set(priceKey, minPrice);
                }
              }
            }
          });
          
          setProfessionals((prev) => {
            // Crear un nuevo array para asegurar que React detecte el cambio
            const updated = prev.map((p) => {
              const found = enriched.find((e) => e.id === p.id);
              if (!found) return p;
              const updatedProf = {
                ...p,
                // Asegurar que precios sea un nuevo array para que React detecte el cambio
                precios: Array.isArray(found.precios) && found.precios.length > 0
                  ? [...found.precios] // Crear copia del array
                  : (Array.isArray(p.precios) ? [...p.precios] : []),
                profileImage: found.profileImage || p.profileImage,
              };
              return updatedProf;
            });
            // Forzar una nueva referencia del array
            return [...updated];
          });
        }
      } catch (e) {
        console.warn(
          "[CategoryServicePage] No se pudo enriquecer precios/imagen:",
          e
        );
      } finally {
        isEnrichingRef.current = false;
        setEnrichingPrices(false);
      }
    };
    // Ejecutar enriquecimiento cuando:
    // 1. No se están cargando profesionales
    // 2. Hay profesionales
    // 3. No se está ejecutando ya un enriquecimiento
    if (!loadingProfessionals && professionals.length > 0 && !isEnrichingRef.current) {
      // Ejecutar inmediatamente cuando se cargan nuevos profesionales
      enrichMissingData();
    }
  }, [professionals, loadingProfessionals, filterModalidad]); // filterModalidad fuerza recarga cuando cambia

  // Limpiar las entradas del ref relacionadas con la modalidad anterior cuando cambia el filtro
  // Esto permite recargar precios cuando cambia la modalidad
  useEffect(() => {
    if (enrichmentAttemptedIdsRef.current) {
      // Limpiar solo las entradas de la modalidad anterior, no todas
      // Como ahora usamos claves por modalidad, esto se maneja automáticamente
      // Pero podemos limpiar entradas antiguas si queremos optimizar memoria
      // Por ahora, dejamos que se acumulen ya que usamos claves únicas por modalidad
    }
  }, [filterModalidad]);

  // Guardar IDs de profesionales ya intentados para enriquecimiento (evita spam de peticiones)
  const enrichmentAttemptedIdsRef = useRef<Set<string>>(new Set());
  // Ref para rastrear los profesionales anteriores y detectar navegación
  const lastProfessionalsKeyRef = useRef<string>('');
  // Ref para almacenar los últimos precios válidos calculados (evita parpadeos)
  const lastValidPricesRef = useRef<Map<string, number>>(new Map());
  // Ref para evitar múltiples ejecuciones simultáneas del enriquecimiento
  const isEnrichingRef = useRef<boolean>(false);

  // Función helper para calcular el precio mínimo de un profesional según la modalidad
  const calculateMinPrice = (
    professional: ApiProfessional,
    modalidad: string
  ): number => {
    const prices = Array.isArray(professional.precios)
      ? professional.precios
      : [];

    if (prices.length > 0) {
      // Filtrar precios según la modalidad seleccionada
      let preciosFiltrados = prices;
      const modalidadLower = modalidad.toLowerCase();

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
            let precioValor = 0;

            // Intentar desde p.precio primero
            if (typeof p.precio === "number") {
              precioValor = p.precio;
            } else if (
              p.precio !== undefined &&
              p.precio !== null &&
              p.precio !== ""
            ) {
              const parsed = Number(p.precio);
              if (!isNaN(parsed)) {
                precioValor = parsed;
              }
            }

            // Si no hay precio, intentar desde raw
            if (precioValor === 0 && p.raw) {
              if (typeof p.raw.precio === "number") {
                precioValor = p.raw.precio;
              } else if (
                p.raw.precio !== undefined &&
                p.raw.precio !== null &&
                p.raw.precio !== ""
              ) {
                const parsed = Number(p.raw.precio);
                if (!isNaN(parsed)) {
                  precioValor = parsed;
                }
              }
            }

            return precioValor;
          })
          .filter((v) => v > 0);
        if (values.length > 0) {
          return Number(Math.min(...values).toFixed(2));
        }
      }
    }

    // Fallback a tarifa por hora si no hay precios
    if (professional.tarifaPorHora) {
      return Number(Number(professional.tarifaPorHora).toFixed(2));
    }

    return 0;
  };

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
          return (
            precioModalidad === "a_domicilio" ||
            precioModalidad === "domicilio"
          );
        });
      }

      // PRIORIDAD 2: Verificar si tiene códigos postales de domicilio
      // Si tiene codigos_postales_domicilio, significa que ofrece servicio a domicilio
      if (!matchesModalidad && (prof as any).codigosPostalesDomicilio) {
        const codigosPostales = String((prof as any).codigosPostalesDomicilio || "").trim();
        if (codigosPostales.length > 0) {
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

  // Crear una dependencia que detecte cambios en los precios para forzar la recalculación
  // Incluir filterModalidad para que se recalcule cuando cambia la modalidad
  const pricesKey = useMemo(() => {
    return `${filterModalidad}|${professionals
      .map((p) => {
        const precios = Array.isArray(p.precios) ? p.precios : [];
        const preciosStr = precios
          .map((pr: any) => `${pr.id_precio || ''}-${pr.precio || 0}-${pr.modalidad || ''}`)
          .join(',');
        return `${p.id}:${precios.length}:${preciosStr}`;
      })
      .join('|')}`;
  }, [professionals, filterModalidad]);

  // Calcular profesionales mapeados con precios mínimos de forma reactiva
  const mappedProfessionals = useMemo(() => {
    return currentProfessionalsPaginated.map((professional) => {
      const minPrice = calculateMinPrice(professional, filterModalidad);
      
      // Usar el último precio válido conocido si el precio actual es 0
      // Esto evita el parpadeo mientras se cargan los precios o cuando se recalcula el useMemo
      const priceKey = `${professional.id}-${filterModalidad}`;
      let finalPrice = minPrice;
      
      if (minPrice > 0) {
        // Si el precio es válido, guardarlo en el ref para uso futuro
        lastValidPricesRef.current.set(priceKey, minPrice);
        finalPrice = minPrice;
      } else {
        // Si el precio es 0, intentar usar el último precio válido conocido
        // Esto evita el parpadeo cuando el useMemo se recalcula antes de que los precios se actualicen
        // O cuando los precios se están cargando
        const lastValidPrice = lastValidPricesRef.current.get(priceKey);
        if (lastValidPrice && lastValidPrice > 0) {
          // Usar el precio del ref solo si no estamos en la primera carga (para evitar mostrar precios de otros profesionales)
          // Verificar que el profesional actual tenga el mismo ID que el precio guardado
          finalPrice = lastValidPrice;
        }
      }

      const cardImage =
        professional.profileImage &&
        professional.profileImage.trim().length > 0
          ? professional.profileImage
          : "/placeholder-professional.jpg";

      return {
        id: professional.id || "",
        name:
          professional.fullName || professional.name || "Profesional",
        title: professional.specialty || "Especialista",
        description: professional.bio || "",
        rating: professional.rating || 0,
        reviewCount: professional.totalSessions || 0,
        price: finalPrice,
        image: cardImage,
        isPopular:
          professional.status === "activo" &&
          (professional.rating || 0) >= 4.5,
        specialties: professional.specialty
          ? [professional.specialty]
          : [],
        slug: createProfessionalSlug(
          professional.fullName || professional.name || "Profesional"
        ),
      };
    });
  }, [currentProfessionalsPaginated, filterModalidad, pricesKey]);


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
              {mappedProfessionals.map((mappedProfessional) => {
                // Usar el serviceSlug si existe, sino usar el slug de la especialidad
                const effectiveServiceSlug = serviceSlug || categorySlug;

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
