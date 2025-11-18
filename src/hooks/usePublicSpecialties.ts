import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Heart,
  Mic,
  Zap,
  FileText,
} from "lucide-react";
import { specialtiesService } from "@/services/api/specialties";
import type { PublicSpecialty, PublicService } from "@/services/api/specialties";

// ----- Simple in-memory cache and rate-limit guards (module-scoped) -----
let cachedSpecialties:
  | Array<{
      key: string;
      title: string;
      href: string;
      Icon: React.ComponentType<{ className?: string }>;
      items: Array<{ label: string; href: string }>;
      specialtyId: string;
    }>
  | null = null;
let cachedSpecialtiesAt = 0;
let inflightSpecialtiesPromise: Promise<
  Array<{
    key: string;
    title: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
    items: Array<{ label: string; href: string }>;
    specialtyId: string;
  }>
> | null = null;
let specialtiesCooldownUntil = 0; // epoch ms; set when backend says "too many requests"
const SPECIALTIES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SPECIALTIES_MAX_RETRIES = 3;
const SPECIALTIES_BASE_BACKOFF_MS = 700;

export interface NavbarServiceCategory {
  key: string;
  title: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  items: Array<{ label: string; href: string }>;
  specialtyId: string; // ID de la especialidad para cargar servicios
}

/**
 * Hook para obtener las especialidades públicas desde el backend
 * y transformarlas al formato que usa el Navbar
 */
export const usePublicSpecialties = () => {
  const [specialties, setSpecialties] = useState<NavbarServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicesCache, setServicesCache] = useState<Record<string, PublicService[]>>({});
  const [loadingServices, setLoadingServices] = useState<Record<string, boolean>>({});
  const servicesCacheRef = useRef<Record<string, PublicService[]>>({});
  const loadingServicesRef = useRef<Record<string, boolean>>({});

  const loadSpecialties = useCallback(async () => {
    try {
      console.log("[usePublicSpecialties] Iniciando carga de especialidades...");
      setLoading(true);
      setError(null);

      // Cooldown if we recently hit rate limit
      if (Date.now() < specialtiesCooldownUntil) {
        const waitMs = specialtiesCooldownUntil - Date.now();
        console.warn(
          "[usePublicSpecialties] En cooldown por límite de peticiones. Esperando (ms):",
          waitMs
        );
        // Mostrar error amable y no disparar petición
        setError("Demasiadas solicitudes, intenta más tarde.");
        // Si tenemos cache previa, úsala para no romper la UI
        if (cachedSpecialties && Date.now() - cachedSpecialtiesAt < SPECIALTIES_CACHE_TTL_MS) {
          setSpecialties(cachedSpecialties);
        } else {
          setSpecialties([]);
        }
        return;
      }

      // Servir desde cache si aún es válida
      if (cachedSpecialties && Date.now() - cachedSpecialtiesAt < SPECIALTIES_CACHE_TTL_MS) {
        console.log("[usePublicSpecialties] Usando especialidades desde cache");
        setSpecialties(cachedSpecialties);
        return;
      }

      // De-duplicar solicitudes concurrentes
      if (inflightSpecialtiesPromise) {
        console.log("[usePublicSpecialties] Esperando petición en curso (inflight)...");
        const mapped = await inflightSpecialtiesPromise;
        setSpecialties(mapped);
        return;
      }

      // Función con reintentos y backoff exponencial básico
      const fetchWithRetry = async () => {
        let lastError: unknown = null;
        for (let attempt = 0; attempt < SPECIALTIES_MAX_RETRIES; attempt++) {
          try {
            const resp = await specialtiesService.getPublicSpecialties();
            return resp;
          } catch (e) {
            lastError = e;
          }
          const backoff =
            SPECIALTIES_BASE_BACKOFF_MS * Math.pow(2, attempt) +
            Math.floor(Math.random() * 150); // jitter
          await new Promise((r) => setTimeout(r, backoff));
        }
        throw lastError ?? new Error("Fallo al obtener especialidades");
      };

      inflightSpecialtiesPromise = (async () => {
        const response = await fetchWithRetry();

      console.log("[usePublicSpecialties] Respuesta del servicio:", {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        error: response.error,
      });

      if (response.success && response.data) {
        console.log("[usePublicSpecialties] Mapeando especialidades al formato del navbar...");
        console.log("[usePublicSpecialties] Especialidades recibidas:", response.data.length);
        
        const mapped = mapSpecialtiesToNavbarFormat(response.data);
        
        console.log("[usePublicSpecialties] Especialidades mapeadas:", mapped.length);
        mapped.forEach((cat, index) => {
          console.log(`[usePublicSpecialties] Categoría ${index + 1}:`, {
            key: cat.key,
            title: cat.title,
            href: cat.href,
            specialtyId: cat.specialtyId,
            itemsCount: cat.items.length,
          });
        });
        // Actualizar cache
        cachedSpecialties = mapped;
        cachedSpecialtiesAt = Date.now();
        console.log("[usePublicSpecialties] Especialidades cargadas y cacheadas exitosamente");
        return mapped;
      } else {
        const errorMsg = response.error || "Error al cargar especialidades";
        // Si es mensaje de rate limit, activar cooldown breve
        const isRateLimited =
          typeof errorMsg === "string" &&
          errorMsg.toLowerCase().includes("demasiadas solicitudes");
        if (isRateLimited) {
          // 60s de cooldown para evitar bombardear el backend
          specialtiesCooldownUntil = Date.now() + 60_000;
          console.warn("[usePublicSpecialties] Rate limited. Activando cooldown 60s.");
        } else {
          console.warn("[usePublicSpecialties] Error al cargar especialidades:", errorMsg);
        }
        // Vaciar cache si no hay datos
        cachedSpecialties = null;
        cachedSpecialtiesAt = 0;
        throw new Error(errorMsg);
      }
      })();

      const mapped = await inflightSpecialtiesPromise;
      setSpecialties(mapped);
      console.log("[usePublicSpecialties] Especialidades establecidas en estado");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de conexión";
      // Evitar ruido excesivo en consola en caso de rate limit; usar warn
      const isRateLimited =
        typeof errorMessage === "string" &&
        errorMessage.toLowerCase().includes("demasiadas solicitudes");
      const logger = isRateLimited ? console.warn : console.error;
      logger("[usePublicSpecialties] Excepción al cargar especialidades:", err);
      setError(errorMessage);
      setSpecialties([]);
    } finally {
      inflightSpecialtiesPromise = null;
      setLoading(false);
      console.log("[usePublicSpecialties] Carga de especialidades finalizada");
    }
  }, []);

  /**
   * Carga los servicios de una especialidad específica
   */
  const loadServicesForSpecialty = useCallback(async (specialtyId: string) => {
    console.log(`[usePublicSpecialties] loadServicesForSpecialty llamado para:`, specialtyId);
    
    // Verificar si ya están cargados usando refs (siempre actualizados)
    if (servicesCacheRef.current[specialtyId]) {
      console.log(`[usePublicSpecialties] Servicios ya en cache para ${specialtyId}:`, servicesCacheRef.current[specialtyId].length);
      return servicesCacheRef.current[specialtyId];
    }
    
    if (loadingServicesRef.current[specialtyId]) {
      console.log(`[usePublicSpecialties] Servicios ya se están cargando para ${specialtyId}`);
      return [];
    }

    try {
      console.log(`[usePublicSpecialties] Iniciando carga de servicios para especialidad ${specialtyId}...`);
      loadingServicesRef.current[specialtyId] = true;
      setLoadingServices((prev) => ({ ...prev, [specialtyId]: true }));

      const response = await specialtiesService.getServicesBySpecialtyId(specialtyId);

      console.log(`[usePublicSpecialties] Respuesta del servicio para ${specialtyId}:`, {
        success: response.success,
        hasData: !!response.data,
        serviciosCount: response.data?.servicios?.length || 0,
        error: response.error,
      });

      if (response.success && response.data) {
        const servicios = response.data.servicios || [];
        console.log(`[usePublicSpecialties] Servicios recibidos para ${specialtyId}:`, servicios.length);
        servicios.forEach((serv, index) => {
          console.log(`[usePublicSpecialties] Servicio ${index + 1} de ${specialtyId}:`, {
            id: serv.id_servicio || serv.id || serv.uuid,
            nombre: serv.nombre_servicio || serv.nombre || serv.name,
            nombre_servicio: serv.nombre_servicio,
            nombre_field: serv.nombre,
            name_field: serv.name,
          });
        });
        
        servicesCacheRef.current[specialtyId] = servicios;
        setServicesCache((prev) => ({ ...prev, [specialtyId]: servicios }));
        console.log(`[usePublicSpecialties] Servicios guardados en cache para ${specialtyId}`);
        return servicios;
      } else {
        // Evitar ruido con error duro y cachear vacío para no reintentar en hover constante
        console.warn(`[usePublicSpecialties] No se pudieron cargar servicios para ${specialtyId}:`, response.error || "Respuesta no exitosa");
        servicesCacheRef.current[specialtyId] = [];
        setServicesCache((prev) => ({ ...prev, [specialtyId]: [] }));
        return [];
      }
    } catch (err) {
      console.warn(`[usePublicSpecialties] Excepción al cargar servicios para ${specialtyId}:`, err);
      // Cachear vacío para evitar múltiples intentos fallidos por hover
      servicesCacheRef.current[specialtyId] = [];
      setServicesCache((prev) => ({ ...prev, [specialtyId]: [] }));
      return [];
    } finally {
      loadingServicesRef.current[specialtyId] = false;
      setLoadingServices((prev) => ({ ...prev, [specialtyId]: false }));
      console.log(`[usePublicSpecialties] Carga de servicios finalizada para ${specialtyId}`);
    }
  }, []); // Sin dependencias para evitar re-renders innecesarios

  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  return {
    specialties,
    loading,
    error,
    reload: loadSpecialties,
    loadServicesForSpecialty,
    getServicesForSpecialty: (specialtyId: string) => servicesCache[specialtyId] || [],
    isLoadingServices: (specialtyId: string) => loadingServices[specialtyId] || false,
  };
};

/**
 * Mapea las especialidades del backend al formato usado por el Navbar
 */
function mapSpecialtiesToNavbarFormat(
  backendSpecialties: PublicSpecialty[]
): NavbarServiceCategory[] {
  console.log("[mapSpecialtiesToNavbarFormat] Iniciando mapeo de especialidades:", backendSpecialties.length);
  
  // Mapeo de nombres de especialidades a iconos
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    dietas: CheckCircle,
    nutricion: CheckCircle,
    nutricionista: CheckCircle,
    terapias: Heart,
    psicologia: Heart,
    psicologo: Heart,
    logopedas: Mic,
    logopedia: Mic,
    desarrollo: Zap,
    "desarrollo personal": Zap,
    legales: FileText,
    legal: FileText,
    consultas: FileText,
  };

  return backendSpecialties.map((specialty, index) => {
    console.log(`[mapSpecialtiesToNavbarFormat] Procesando especialidad ${index + 1}:`, {
      raw: specialty,
      id_especialidad: specialty.id_especialidad,
      id: specialty.id,
      uuid: specialty.uuid,
      nombre: specialty.nombre,
      name: specialty.name,
    });
    // El ID debe ser numérico o string, pero siempre usar el ID real del backend
    const specialtyId =
      String(specialty.id_especialidad ?? specialty.id ?? specialty.uuid ?? `specialty-${index}`);

    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - ID extraído:`, specialtyId);
    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - ID original:`, {
      id_especialidad: specialty.id_especialidad,
      id: specialty.id,
      uuid: specialty.uuid,
    });

    const specialtyName =
      specialty.nombre ?? specialty.name ?? "Especialidad sin nombre";

    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Nombre:`, specialtyName);

    // Generar slug/key basado en el nombre
    const key = generateSlug(specialtyName);
    
    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Key generado:`, key);
    
    // Generar href basado en el slug o usar el slug del backend si existe
    const href = specialty.slug 
      ? `/${specialty.slug}` 
      : `/${key}`;

    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Href:`, href);

    // Obtener icono basado en el nombre de la especialidad
    const specialtyNameLower = specialtyName.toLowerCase();
    let Icon: React.ComponentType<{ className?: string }> = CheckCircle; // Icono por defecto
    
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (specialtyNameLower.includes(keyword)) {
        Icon = icon as React.ComponentType<{ className?: string }>;
        break;
      }
    }

    // Mapear subcategorías a items
    const subcategoriesSource =
      specialty.subcategorias ??
      specialty.sub_especialidades ??
      specialty.subspecialties ??
      [];

    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Subcategorías fuente:`, {
      subcategorias: specialty.subcategorias,
      sub_especialidades: specialty.sub_especialidades,
      subspecialties: specialty.subspecialties,
      detalle: specialty.detalle,
      subcategoriesSource,
    });

    const items: Array<{ label: string; href: string }> = [];

    if (Array.isArray(subcategoriesSource)) {
      console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Procesando ${subcategoriesSource.length} subcategorías`);
      subcategoriesSource.forEach((sub, subIndex) => {
        if (typeof sub === "string") {
          const subSlug = generateSlug(sub);
          items.push({
            label: sub,
            href: `${href}/${subSlug}`,
          });
          console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Subcategoría ${subIndex + 1} (string):`, sub);
        } else if (sub && typeof sub === "object") {
          const subName = sub.nombre ?? sub.name ?? `Subcategoría ${subIndex + 1}`;
          const subSlug = sub.slug ?? generateSlug(subName);
          items.push({
            label: subName,
            href: `${href}/${subSlug}`,
          });
          console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Subcategoría ${subIndex + 1} (object):`, subName);
        }
      });
    } else if (typeof specialty.detalle === "string" && specialty.detalle.trim()) {
      // Si hay detalle pero no subcategorías, intentar parsear
      // Esto es un fallback, idealmente el backend debería enviar subcategorías estructuradas
      console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Usando detalle como fallback`);
      const detailLines = specialty.detalle.split("\n").filter((line) => line.trim());
      detailLines.forEach((line) => {
        const subSlug = generateSlug(line.trim());
        items.push({
          label: line.trim(),
          href: `${href}/${subSlug}`,
        });
      });
    }

    console.log(`[mapSpecialtiesToNavbarFormat] Especialidad ${index + 1} - Total items generados:`, items.length);

    return {
      key,
      title: specialtyName,
      href,
      Icon,
      items,
      specialtyId, // Incluir el ID para poder cargar servicios después
    };
  });
}

/**
 * Genera un slug a partir de un texto
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final
}

