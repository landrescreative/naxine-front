// src/services/api/specialties.ts
import { apiClient, ApiResponse } from "./client";

export interface GetSpecialtiesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PublicSpecialty {
  id_especialidad?: string;
  id?: string;
  uuid?: string;
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  subcategorias?: Array<{
    id?: string;
    nombre?: string;
    name?: string;
    slug?: string;
  } | string>;
  sub_especialidades?: Array<{
    id?: string;
    nombre?: string;
    name?: string;
    slug?: string;
  } | string>;
  subspecialties?: Array<{
    id?: string;
    nombre?: string;
    name?: string;
    slug?: string;
  } | string>;
  detalle?: string;
  slug?: string;
}

export interface PublicService {
  id_servicio?: string | number;
  id?: string | number;
  uuid?: string;
  nombre?: string;
  nombre_servicio?: string; // Campo del backend
  name?: string;
  descripcion?: string;
  description?: string;
  slug?: string;
  precio?: number;
  precio_usd?: number;
  duracion?: number;
  duracion_estimada?: number; // Campo del backend
  categoria?: string;
  especialidad_id?: string | number;
  id_especialidad?: string | number; // Campo del backend
}

export interface SpecialtyWithServices {
  especialidad: PublicSpecialty;
  servicios: PublicService[];
}

export class SpecialtiesService {
  async getAdminSpecialties(
    params?: GetSpecialtiesParams
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/especialidades', params);
  }

  /**
   * Obtiene todas las especialidades públicas sin autenticación
   * Ruta: GET /api/especialidades/public
   */
  async getPublicSpecialties(): Promise<ApiResponse<PublicSpecialty[]>> {
    // Usar fetch directo para evitar que apiClient agregue el token de autenticación
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const url = `${API_BASE_URL}/especialidades/public`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      
      console.log("[SpecialtiesService] Respuesta completa de especialidades públicas:", data);
      console.log("[SpecialtiesService] Tipo de data:", typeof data);
      console.log("[SpecialtiesService] Es array?", Array.isArray(data));
      
      // Manejar diferentes formatos de respuesta
      let specialties: PublicSpecialty[] = [];
      
      // El backend devuelve: {success: true, data: {especialidades: [...]}}
      if (data?.data?.especialidades && Array.isArray(data.data.especialidades)) {
        specialties = data.data.especialidades;
        console.log("[SpecialtiesService] Especialidades encontradas en data.data.especialidades:", specialties.length);
      } else if (Array.isArray(data)) {
        specialties = data;
        console.log("[SpecialtiesService] Data es array directo, especialidades encontradas:", specialties.length);
      } else if (data?.result && Array.isArray(data.result)) {
        specialties = data.result;
        console.log("[SpecialtiesService] Especialidades en data.result:", specialties.length);
      } else if (data?.data && Array.isArray(data.data)) {
        specialties = data.data;
        console.log("[SpecialtiesService] Especialidades en data.data:", specialties.length);
      } else if (data?.especialidades && Array.isArray(data.especialidades)) {
        specialties = data.especialidades;
        console.log("[SpecialtiesService] Especialidades en data.especialidades:", specialties.length);
      } else {
        console.warn("[SpecialtiesService] No se encontró formato reconocido de especialidades");
        console.warn("[SpecialtiesService] Estructura de data:", JSON.stringify(data, null, 2));
      }

      console.log("[SpecialtiesService] Especialidades procesadas:", specialties.length);
      specialties.forEach((spec, index) => {
        console.log(`[SpecialtiesService] Especialidad ${index + 1}:`, {
          id: spec.id_especialidad || spec.id || spec.uuid,
          nombre: spec.nombre || spec.name,
          subcategorias: spec.subcategorias?.length || 0,
        });
      });

      return {
        success: true,
        data: specialties,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Obtiene los servicios de una especialidad específica sin autenticación
   * Ruta: GET /api/especialidades/:id/servicios
   */
  async getServicesBySpecialtyId(
    specialtyId: string
  ): Promise<ApiResponse<SpecialtyWithServices>> {
    // Usar fetch directo para evitar que apiClient agregue el token de autenticación
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const url = `${API_BASE_URL}/especialidades/${specialtyId}/servicios`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      
      console.log(`[SpecialtiesService] Respuesta completa de servicios para especialidad ${specialtyId}:`, data);
      console.log(`[SpecialtiesService] Tipo de data:`, typeof data);
      console.log(`[SpecialtiesService] Estructura completa de data:`, JSON.stringify(data, null, 2));
      
      // Manejar diferentes formatos de respuesta
      let specialty: PublicSpecialty | null = null;
      let servicios: PublicService[] = [];

      // El backend puede devolver: {especialidad: {...}, servicios: [...]} o {data: {especialidad: {...}, servicios: [...]}}
      if (data?.data?.especialidad) {
        specialty = data.data.especialidad;
        console.log(`[SpecialtiesService] Especialidad encontrada en data.data.especialidad:`, {
          id: specialty.id_especialidad || specialty.id || specialty.uuid,
          nombre: specialty.nombre || specialty.name,
        });
      } else if (data?.especialidad) {
        specialty = data.especialidad;
        console.log(`[SpecialtiesService] Especialidad encontrada en data.especialidad:`, {
          id: specialty.id_especialidad || specialty.id || specialty.uuid,
          nombre: specialty.nombre || specialty.name,
        });
      } else if (data?.data?.specialty) {
        specialty = data.data.specialty;
        console.log(`[SpecialtiesService] Especialidad encontrada en data.data.specialty:`, {
          id: specialty.id_especialidad || specialty.id || specialty.uuid,
          nombre: specialty.nombre || specialty.name,
        });
      } else if (data?.specialty) {
        specialty = data.specialty;
        console.log(`[SpecialtiesService] Especialidad encontrada en data.specialty:`, {
          id: specialty.id_especialidad || specialty.id || specialty.uuid,
          nombre: specialty.nombre || specialty.name,
        });
      } else {
        console.warn(`[SpecialtiesService] No se encontró especialidad en la respuesta`);
        console.warn(`[SpecialtiesService] Keys disponibles en data:`, Object.keys(data || {}));
      }

      // Buscar servicios en diferentes ubicaciones posibles
      if (data?.data?.servicios && Array.isArray(data.data.servicios)) {
        servicios = data.data.servicios;
        console.log(`[SpecialtiesService] Servicios encontrados en data.data.servicios:`, servicios.length);
      } else if (data?.servicios && Array.isArray(data.servicios)) {
        servicios = data.servicios;
        console.log(`[SpecialtiesService] Servicios encontrados en data.servicios:`, servicios.length);
      } else if (data?.data?.services && Array.isArray(data.data.services)) {
        servicios = data.data.services;
        console.log(`[SpecialtiesService] Servicios encontrados en data.data.services:`, servicios.length);
      } else if (data?.services && Array.isArray(data.services)) {
        servicios = data.services;
        console.log(`[SpecialtiesService] Servicios encontrados en data.services:`, servicios.length);
      } else if (Array.isArray(data)) {
        servicios = data;
        console.log(`[SpecialtiesService] Data es array directo, servicios:`, servicios.length);
      } else {
        console.warn(`[SpecialtiesService] No se encontraron servicios en la respuesta`);
        console.warn(`[SpecialtiesService] Keys disponibles en data:`, Object.keys(data || {}));
      }

      console.log(`[SpecialtiesService] Servicios procesados para especialidad ${specialtyId}:`, servicios.length);
      servicios.forEach((serv, index) => {
        console.log(`[SpecialtiesService] Servicio ${index + 1}:`, {
          id: serv.id_servicio || serv.id || serv.uuid,
          nombre: serv.nombre_servicio || serv.nombre || serv.name,
          nombre_servicio: serv.nombre_servicio,
          nombre_field: serv.nombre,
          name_field: serv.name,
        });
      });

      // Si no hay especialidad pero hay servicios, crear una especialidad mínima
      // Esto puede pasar si el backend solo devuelve servicios
      if (!specialty && servicios.length > 0) {
        console.log(`[SpecialtiesService] No se encontró especialidad pero hay servicios, creando especialidad mínima`);
        specialty = {
          id_especialidad: specialtyId,
          nombre: `Especialidad ${specialtyId}`,
        };
      }

      // Si no hay especialidad ni servicios, retornar error
      if (!specialty && servicios.length === 0) {
        console.error(`[SpecialtiesService] Error: No se encontró especialidad ni servicios en la respuesta`);
        return {
          success: false,
          error: "Especialidad no encontrada en la respuesta",
        };
      }

      // Si hay servicios pero no especialidad, aún así retornar éxito con servicios
      if (servicios.length > 0) {
        console.log(`[SpecialtiesService] Retornando ${servicios.length} servicios para especialidad ${specialtyId}`);
        return {
          success: true,
          data: {
            especialidad: specialty || {
              id_especialidad: specialtyId,
              nombre: `Especialidad ${specialtyId}`,
            },
            servicios,
          },
        };
      }

      // Si hay especialidad pero no servicios, retornar éxito con array vacío
      return {
        success: true,
        data: {
          especialidad: specialty!,
          servicios: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Obtiene una especialidad por su slug o ID
   * Busca en todas las especialidades públicas
   */
  async getSpecialtyBySlugOrId(
    slugOrId: string
  ): Promise<ApiResponse<PublicSpecialty>> {
    try {
      // Primero obtener todas las especialidades
      const response = await this.getPublicSpecialties();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: "No se pudieron cargar las especialidades",
        };
      }

      // Buscar por ID numérico primero
      const specialtyById = response.data.find(
        (spec) =>
          String(spec.id_especialidad) === slugOrId ||
          String(spec.id) === slugOrId ||
          spec.uuid === slugOrId
      );

      if (specialtyById) {
        return {
          success: true,
          data: specialtyById,
        };
      }

      // Buscar por slug o nombre (generar slug del nombre)
      const slugLower = slugOrId.toLowerCase();
      const specialtyBySlug = response.data.find((spec) => {
        const name = (spec.nombre || spec.name || "").toLowerCase();
        const slug = spec.slug?.toLowerCase() || "";
        const nameSlug = name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        
        return slug === slugLower || nameSlug === slugLower;
      });

      if (specialtyBySlug) {
        return {
          success: true,
          data: specialtyBySlug,
        };
      }

      return {
        success: false,
        error: "Especialidad no encontrada",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Obtiene un servicio específico de una especialidad por su slug o ID
   */
  async getServiceBySlugOrId(
    specialtyId: string,
    serviceSlugOrId: string
  ): Promise<ApiResponse<PublicService>> {
    try {
      // Obtener todos los servicios de la especialidad
      const response = await this.getServicesBySpecialtyId(specialtyId);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "No se pudieron cargar los servicios",
        };
      }

      const servicios = response.data.servicios || [];

      // Buscar por slug exacto primero
      const serviceBySlug = servicios.find(
        (serv) => serv.slug?.toLowerCase() === serviceSlugOrId.toLowerCase()
      );

      if (serviceBySlug) {
        return {
          success: true,
          data: serviceBySlug,
        };
      }

      // Buscar por nombre (generar slug del nombre y comparar)
      const slugLower = serviceSlugOrId.toLowerCase();
      const serviceByName = servicios.find((serv) => {
        const name = (serv.nombre_servicio || serv.nombre || serv.name || "").toLowerCase();
        const nameSlug = name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        
        // Comparar slug generado con el slug de la URL
        return nameSlug === slugLower;
      });

      if (serviceByName) {
        return {
          success: true,
          data: serviceByName,
        };
      }

      return {
        success: false,
        error: "Servicio no encontrado",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export const specialtiesService = new SpecialtiesService();

