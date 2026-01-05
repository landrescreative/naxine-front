// src/services/api/professionals.ts
import { apiClient, ApiResponse } from "./client";
import {
  ApiProfessional,
  ApiPaginationParams,
  ApiPaginatedResponse,
  ApiFilterParams,
  ProfessionalPrice,
} from "../types/api";

export interface CreateProfessionalRequest {
  name: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  username: string;
  city: string;
  postalCode: string;
  specialty: string;
  licenseNumber: string;
  experience: number;
  bio: string;
  education: string[];
  certifications: string[];
  languages: string[];
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

export interface UpdateProfessionalRequest {
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  specialty?: string;
  licenseNumber?: string;
  experience?: number;
  bio?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  status?: "activo" | "inactivo" | "pendiente" | "suspendido";
}

export class ProfessionalsService {
  async getProfessionals(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    return apiClient.get<ApiPaginatedResponse<ApiProfessional>>(
      "/professionals",
      params
    );
  }

  // Obtener profesionales desde el endpoint de administración
  async getAdminProfessionals(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<any>> {
    // El endpoint del backend es /profesionales (sin /api porque ya está en el baseURL)
    return apiClient.get<any>("/profesionales", params);
  }

  async approveProfessional(id: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/profesionales/admin/${id}/aprobar`, {});
  }

  async rejectProfessional(id: string, motivoRechazo: string): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/profesionales/admin/${id}/rechazar`, {
      motivo_rechazo: motivoRechazo,
    });
  }

  async getProfessionalById(id: string): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.get<ApiProfessional>(`/professionals/${id}`);
  }

  /**
   * Obtiene el perfil público de un profesional por ID sin autenticación
   * Ruta: GET /api/profesionales/:id
   * Solo muestra profesionales con estado "aprobado"
   */
  async getPublicProfessionalById(
    id: string
  ): Promise<ApiResponse<ApiProfessional>> {
    // Usar fetch directo para evitar que apiClient agregue el token de autenticación
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const url = `${API_BASE_URL}/profesionales/${id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any = {};
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 404) {
          return {
            success: false,
            error: "Profesional no encontrado",
          };
        }

        if (response.status === 403) {
          // Profesional existe pero no está aprobado
          return {
            success: false,
            error: errorData.message || "Perfil no disponible",
            statusCode: 403,
            reason: errorData.reason || "not_approved",
            data: errorData.data || null,
          } as any;
        }

        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();

      console.log(`[ProfessionalsService] Respuesta completa del backend para profesional ${id}:`, JSON.stringify(data, null, 2));

      // El backend puede devolver diferentes estructuras
      let professionalRaw: any = null;

      // El backend devuelve: { success: true, data: { profesional: {...} } }
      if (data?.data?.profesional) {
        professionalRaw = data.data.profesional;
      } else if (data?.profesional) {
        professionalRaw = data.profesional;
      } else if (data?.data) {
        professionalRaw = data.data;
      } else if (data) {
        professionalRaw = data;
      }

      console.log(`[ProfessionalsService] professionalRaw extraído:`, JSON.stringify(professionalRaw, null, 2));

      if (!professionalRaw) {
        return {
          success: false,
          error: "No se recibieron datos del profesional",
        };
      }

      // Mapear profesional del formato del backend al formato del frontend
      // Construir nombre completo
      const nombre = professionalRaw.nombre || professionalRaw.name || "";
      const apellidos = professionalRaw.apellidos || professionalRaw.lastName || "";
      const nombreCompleto = professionalRaw.nombre_completo || 
                            (nombre && apellidos ? `${nombre} ${apellidos}`.trim() : nombre || apellidos) ||
                            professionalRaw.fullName || "";

      // Construir especialidad - puede venir como objeto o string
      let especialidad = "";
      if (professionalRaw.especialidad) {
        if (typeof professionalRaw.especialidad === 'string') {
          especialidad = professionalRaw.especialidad;
        } else if (professionalRaw.especialidad.nombre) {
          especialidad = professionalRaw.especialidad.nombre;
        } else if (professionalRaw.especialidad.nombre_especialidad) {
          especialidad = professionalRaw.especialidad.nombre_especialidad;
        }
      } else if (professionalRaw.nombre_especialidad) {
        especialidad = professionalRaw.nombre_especialidad;
      } else if (professionalRaw.specialty) {
        especialidad = professionalRaw.specialty;
      }

      // Construir ubicación
      const ciudad = professionalRaw.ciudad || professionalRaw.city || "";
      const direccion = professionalRaw.direccion || professionalRaw.domicilio_consultorio || "";
      const ubicacion = ciudad || direccion || "";

      // Construir biografía
      const biografia = professionalRaw.biografia || 
                       professionalRaw.bio || 
                       professionalRaw.descripcion || 
                       "";

      // Manejar disponibilidad/horario - el backend devuelve un formato diferente
      let disponibilidad = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
      
      if (professionalRaw.disponibilidad) {
        if (typeof professionalRaw.disponibilidad === 'string') {
          try {
            disponibilidad = JSON.parse(professionalRaw.disponibilidad);
          } catch (e) {
            console.warn("Error parsing disponibilidad:", e);
          }
        } else if (typeof professionalRaw.disponibilidad === 'object') {
          // El backend puede devolver: { dias: [...], horario: { desde, hasta } }
          // Convertir a formato esperado
          if (professionalRaw.disponibilidad.dias && Array.isArray(professionalRaw.disponibilidad.dias)) {
            const diasMap: { [key: string]: string } = {
              'Lunes': 'monday',
              'Martes': 'tuesday',
              'Miércoles': 'wednesday',
              'Miercoles': 'wednesday',
              'Jueves': 'thursday',
              'Viernes': 'friday',
              'Sábado': 'saturday',
              'Sabado': 'saturday',
              'Domingo': 'sunday',
            };
            
            professionalRaw.disponibilidad.dias.forEach((dia: string) => {
              const diaLower = dia.toLowerCase();
              const key = diasMap[dia] || diaLower;
              if (key in disponibilidad) {
                disponibilidad[key as keyof typeof disponibilidad] = [];
              }
            });
          } else {
            disponibilidad = professionalRaw.disponibilidad;
          }
        }
      } else if (professionalRaw.horario) {
        if (typeof professionalRaw.horario === 'string') {
          try {
            disponibilidad = JSON.parse(professionalRaw.horario);
          } catch (e) {
            console.warn("Error parsing horario:", e);
          }
        } else if (typeof professionalRaw.horario === 'object') {
          disponibilidad = professionalRaw.horario;
        }
      }

      // Manejar modalidad_cita y modo_atencion
      // El backend puede devolver "ambas", "presencial", "online" como string
      let modalidadCita: string[] = [];
      if (professionalRaw.modalidad_cita) {
        if (Array.isArray(professionalRaw.modalidad_cita)) {
          modalidadCita = professionalRaw.modalidad_cita;
        } else if (typeof professionalRaw.modalidad_cita === 'string') {
          try {
            modalidadCita = JSON.parse(professionalRaw.modalidad_cita);
          } catch (e) {
            // Si es "ambas", convertir a array con ambas opciones
            if (professionalRaw.modalidad_cita.toLowerCase() === 'ambas') {
              modalidadCita = ['presencial', 'online'];
            } else {
              modalidadCita = [professionalRaw.modalidad_cita];
            }
          }
        }
      }

      let modoAtencion: string[] = [];
      if (professionalRaw.modo_atencion) {
        if (Array.isArray(professionalRaw.modo_atencion)) {
          modoAtencion = professionalRaw.modo_atencion;
        } else if (typeof professionalRaw.modo_atencion === 'string') {
          try {
            modoAtencion = JSON.parse(professionalRaw.modo_atencion);
          } catch (e) {
            modoAtencion = [professionalRaw.modo_atencion];
          }
        }
      }

      // Manejar precios
      let precios: any[] = [];
      if (professionalRaw.precios) {
        if (Array.isArray(professionalRaw.precios)) {
          precios = professionalRaw.precios.map((precio: any) => ({
            id_precio: precio.id_precio || precio.id || 0,
            nombre_servicio: precio.nombre_servicio || precio.nombre || "",
            descripcion: precio.descripcion || "",
            precio: precio.precio || 0,
            moneda: precio.moneda || "MXN",
            duracion: precio.duracion || precio.duration || undefined,
          }));
        }
      }

      // Manejar modalidades_sesiones
      let modalidadesSesiones: string[] = [];
      if (professionalRaw.modalidades_sesiones) {
        if (Array.isArray(professionalRaw.modalidades_sesiones)) {
          modalidadesSesiones = professionalRaw.modalidades_sesiones;
        } else if (typeof professionalRaw.modalidades_sesiones === 'string') {
          try {
            modalidadesSesiones = JSON.parse(professionalRaw.modalidades_sesiones);
          } catch (e) {
            modalidadesSesiones = [professionalRaw.modalidades_sesiones];
          }
        }
      }

      const professional: ApiProfessional = {
        id: String(professionalRaw.id_profesional || professionalRaw.id_usuario || professionalRaw.id || ""),
        name: nombre || "Profesional",
        fullName: nombreCompleto || nombre || "Profesional",
        email: professionalRaw.email || professionalRaw.email_usuario || "",
        phone: professionalRaw.telefono || professionalRaw.phone || "",
        username: professionalRaw.username || (professionalRaw.email || "").split("@")[0] || "",
        city: ciudad || direccion || "",
        postalCode: professionalRaw.codigo_postal || professionalRaw.postalCode || "",
        specialty: especialidad || "Especialista",
        licenseNumber: professionalRaw.numero_colegiado || professionalRaw.licenseNumber || "",
        experience: professionalRaw.experiencia_años || professionalRaw.experience || 0,
        rating: professionalRaw.calificacion || professionalRaw.rating || 0,
        totalSessions: professionalRaw.total_sesiones || professionalRaw.totalSessions || 0,
        incomeUsd: professionalRaw.ingreso || professionalRaw.incomeUsd || 0,
        status: (professionalRaw.estado_aprobacion === "aprobado" ? "activo" : professionalRaw.estado || professionalRaw.status || "pendiente") as "activo" | "inactivo" | "pendiente" | "suspendido",
        joinDate: professionalRaw.created_at || professionalRaw.joinDate || new Date().toISOString(),
        lastActive: professionalRaw.updated_at || professionalRaw.lastActive || new Date().toISOString(),
        profileImage: professionalRaw.imagen_perfil || professionalRaw.enlace_publico || professionalRaw.profileImage || undefined,
        bio: biografia || "",
        education: Array.isArray(professionalRaw.educacion) ? professionalRaw.educacion : (professionalRaw.education || []),
        certifications: Array.isArray(professionalRaw.certificaciones) ? professionalRaw.certificaciones : (professionalRaw.certifications || []),
        languages: Array.isArray(professionalRaw.idiomas) ? professionalRaw.idiomas : (professionalRaw.languages || []),
        availability: disponibilidad,
        createdAt: professionalRaw.created_at || professionalRaw.createdAt || new Date().toISOString(),
        updatedAt: professionalRaw.updated_at || professionalRaw.updatedAt || new Date().toISOString(),
        // Campos adicionales del perfil público
        videoUrl: professionalRaw.video_presentacion || professionalRaw.videoUrl || undefined,
        tarifaPorHora: professionalRaw.tarifa_por_hora || professionalRaw.tarifaPorHora || 0,
        verificado: professionalRaw.usuario_verificado || professionalRaw.verificado || false,
        direccion: direccion || "",
        domicilio_consultorio: professionalRaw.domicilio_consultorio || undefined,
        modalidadCita: modalidadCita,
        modoAtencion: modoAtencion,
        precios: precios.length > 0 ? precios : undefined,
        modalidadesSesiones: modalidadesSesiones.length > 0 ? modalidadesSesiones : undefined,
        // Guardar datos originales de disponibilidad para acceso directo
        disponibilidadRaw: professionalRaw.disponibilidad || undefined,
      };

      console.log(`[ProfessionalsService] Profesional mapeado:`, JSON.stringify(professional, null, 2));

      return {
        success: true,
        data: professional,
      };
    } catch (error) {
      console.error(`[ProfessionalsService] Error al cargar profesional público:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async createProfessional(
    data: CreateProfessionalRequest
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.post<ApiProfessional>("/professionals", data);
  }

  async updateProfessional(
    id: string,
    data: UpdateProfessionalRequest
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.put<ApiProfessional>(`/professionals/${id}`, data);
  }

  // Actualizar profesional desde el endpoint de administración
  async updateAdminProfessional(
    id: string,
    data: {
      nombre?: string;
      apellidos?: string;
      telefono?: string;
      email?: string;
      especialidad?: string;
      direccion?: string;
      domicilio_consultorio?: string;
      ciudad?: string;
      descripcion?: string;
      video_presentacion?: string | null;
      tarifa_por_hora?: number;
      experiencia_años?: number;
      numero_colegiado?: string;
      nif_cif?: string;
      correo_profesional_publico?: string;
      codigos_postales_domicilio?: string;
      titulacion?: string;
    }
  ): Promise<ApiResponse<any>> {
    // PUT /api/profesionales/:id
    return apiClient.put<any>(`/profesionales/${id}`, data);
  }

  async deleteProfessional(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/professionals/${id}`);
  }

  async activateProfessional(
    id: string
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.patch<ApiProfessional>(`/professionals/${id}/activate`);
  }

  async deactivateProfessional(
    id: string
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.patch<ApiProfessional>(`/professionals/${id}/deactivate`);
  }

  async suspendProfessional(
    id: string,
    reason?: string
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.patch<ApiProfessional>(`/professionals/${id}/suspend`, {
      reason,
    });
  }

  // Métodos de filtrado y búsqueda
  async getProfessionalsBySpecialty(
    specialty: string,
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    return apiClient.get<ApiPaginatedResponse<ApiProfessional>>(
      `/professionals/specialty/${specialty}`,
      params
    );
  }

  /**
   * Obtiene profesionales públicos aprobados por ID de especialidad sin autenticación
   * Ruta: GET /api/profesionales/public?id_especialidad=:id
   */
  async getPublicProfessionalsBySpecialtyId(
    specialtyId: string,
    params?: ApiPaginationParams & {
      especialidad?: string;
      nombre_completo?: string;
      nombre?: string;
      apellidos?: string;
    }
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    // Usar fetch directo para evitar que apiClient agregue el token de autenticación
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    
    // Construir URL con parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Filtro por ID de especialidad (requerido)
    queryParams.append("id_especialidad", specialtyId);
    
    // Parámetros de paginación (el backend usa offset y limit)
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    const offset = (page - 1) * limit;
    
    queryParams.append("limit", String(limit));
    queryParams.append("offset", String(offset));
    
    // Filtros opcionales
    if (params?.especialidad) {
      queryParams.append("especialidad", params.especialidad);
    }
    if (params?.nombre_completo) {
      queryParams.append("nombre_completo", params.nombre_completo);
    }
    if (params?.nombre) {
      queryParams.append("nombre", params.nombre);
    }
    if (params?.apellidos) {
      queryParams.append("apellidos", params.apellidos);
    }
    
    const url = `${API_BASE_URL}/profesionales/public?${queryParams.toString()}`;
    
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
      
      console.log(`[ProfessionalsService] Respuesta completa de profesionales públicos para especialidad ${specialtyId}:`, data);
      console.log(`[ProfessionalsService] Estructura de la respuesta:`, JSON.stringify(data, null, 2));
      
      // Manejar diferentes formatos de respuesta del backend
      let professionalsRaw: any[] = [];
      let paginationInfo: any = {};

      // El backend puede devolver diferentes estructuras según el controlador
      if (data?.data && Array.isArray(data.data)) {
        // Formato: { data: [...], pagination: {...} }
        professionalsRaw = data.data;
        paginationInfo = data.pagination || {};
      } else if (data?.profesionales && Array.isArray(data.profesionales)) {
        // Formato: { profesionales: [...], pagination: {...} }
        professionalsRaw = data.profesionales;
        paginationInfo = data.pagination || {};
      } else if (data?.result && Array.isArray(data.result)) {
        // Formato: { result: [...], pagination: {...} }
        professionalsRaw = data.result;
        paginationInfo = data.pagination || {};
      } else if (Array.isArray(data)) {
        // Formato: array directo
        professionalsRaw = data;
      } else if (data?.data?.profesionales && Array.isArray(data.data.profesionales)) {
        // Formato anidado: { data: { profesionales: [...], pagination: {...} } }
        professionalsRaw = data.data.profesionales;
        paginationInfo = data.data.pagination || {};
      }

      console.log(`[ProfessionalsService] Profesionales encontrados (raw):`, professionalsRaw.length);
      console.log(`[ProfessionalsService] Información de paginación:`, paginationInfo);

      // Mapear profesionales del formato del backend al formato del frontend
      const professionals: ApiProfessional[] = professionalsRaw.map((prof: any) => {
        // El backend devuelve campos en español, mapearlos al formato esperado
        // Derivar modalidades del backend si están disponibles
        const modalidadesSesiones: string[] = [];
        const modalidadCitaRaw = prof.modalidad_cita || prof.modalidadCita;
        const modoAtencionRaw = prof.modo_atencion || prof.modoAtencion;
        if (modalidadCitaRaw === "ambas") {
          modalidadesSesiones.push("En Linea", "Presencial");
        } else if (modalidadCitaRaw === "virtual") {
          modalidadesSesiones.push("En Linea");
        } else if (modalidadCitaRaw === "presencial") {
          modalidadesSesiones.push("Presencial");
        }
        if (modoAtencionRaw === "a_domicilio") {
          modalidadesSesiones.push("A domicilio");
        }

        const rawPrices: ProfessionalPrice[] = Array.isArray(prof.precios)
          ? prof.precios.map((precio: any): ProfessionalPrice => ({
              id_precio: precio.id_precio ?? precio.id ?? 0,
              nombre_servicio:
                precio.nombre_servicio ||
                precio.nombre_paquete ||
                precio.nombre ||
                "Servicio",
              descripcion: precio.descripcion ?? "",
              precio: typeof precio.precio === "number" ? precio.precio : Number(precio.precio) || 0,
              moneda: precio.moneda || "MXN",
              duracion:
                precio.duracion ||
                (precio.duracion_minutos ? `${precio.duracion_minutos} min` : undefined),
            }))
          : [];

        return {
          id: String(prof.id_profesional || prof.id_usuario || prof.id || ""),
          name: prof.nombre || prof.name || "",
          fullName: prof.nombre_completo || `${prof.nombre || ""} ${prof.apellidos || ""}`.trim() || prof.fullName || "",
          email: prof.email || prof.email_usuario || "",
          phone: prof.telefono || prof.phone || "",
          username: prof.username || (prof.email || "").split("@")[0] || "",
          city: prof.ciudad || prof.city || "",
          postalCode: prof.codigo_postal || prof.postalCode || "",
          specialty: prof.especialidad || prof.specialty || "",
          licenseNumber: prof.numero_colegiado || prof.licenseNumber || "",
          experience: prof.experiencia_años || prof.experience || 0,
          rating: prof.calificacion || prof.rating || 0,
          totalSessions: prof.total_sesiones || prof.totalSessions || 0,
          incomeUsd: prof.ingreso || prof.incomeUsd || 0,
          status: (prof.estado_aprobacion === "aprobado" ? "activo" : prof.estado || prof.status || "pendiente") as "activo" | "inactivo" | "pendiente" | "suspendido",
          joinDate: prof.created_at || prof.joinDate || new Date().toISOString(),
          lastActive: prof.updated_at || prof.lastActive || new Date().toISOString(),
          profileImage: prof.imagen_perfil || prof.foto_perfil || prof.profileImage || undefined,
          bio: prof.biografia || prof.bio || prof.descripcion || "",
          education: prof.educacion || prof.education || [],
          certifications: prof.certificaciones || prof.certifications || [],
          languages: prof.idiomas || prof.languages || [],
          availability: prof.disponibilidad || prof.availability || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
          // Campos adicionales útiles para filtros
          direccion: prof.direccion || prof.domicilio_consultorio || prof.address || undefined,
          modalidadesSesiones,
          modalidadCita: modalidadCitaRaw ? [modalidadCitaRaw] : undefined,
          modoAtencion: modoAtencionRaw ? [modoAtencionRaw] : undefined,
          precios: rawPrices,
          createdAt: prof.created_at || prof.createdAt || new Date().toISOString(),
          updatedAt: prof.updated_at || prof.updatedAt || new Date().toISOString(),
        };
      });

      // Extraer información de paginación
      const total = paginationInfo.total || paginationInfo.count || professionals.length;
      const currentLimit = paginationInfo.limit || limit;
      const currentOffset = paginationInfo.offset || offset;
      const totalPages = Math.ceil(total / currentLimit);

      console.log(`[ProfessionalsService] Profesionales mapeados:`, professionals.length);
      console.log(`[ProfessionalsService] Total: ${total}, Página: ${page}, Total páginas: ${totalPages}`);

      return {
        success: true,
        data: {
          data: professionals,
          pagination: {
            page: page,
            limit: currentLimit,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error(`[ProfessionalsService] Error al cargar profesionales:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getProfessionalsByCity(
    city: string,
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    return apiClient.get<ApiPaginatedResponse<ApiProfessional>>(
      `/professionals/city/${city}`,
      params
    );
  }

  async getProfessionalsByStatus(
    status: ApiProfessional["status"],
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    return apiClient.get<ApiPaginatedResponse<ApiProfessional>>(
      `/professionals/status/${status}`,
      params
    );
  }

  async searchProfessionals(
    query: string,
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiProfessional>>> {
    return apiClient.get<ApiPaginatedResponse<ApiProfessional>>(
      `/professionals/search`,
      { ...params, q: query }
    );
  }

  // Métodos de estadísticas
  async getProfessionalStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      pending: number;
      suspended: number;
      totalRevenue: number;
      averageRating: number;
    }>
  > {
    return apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      pending: number;
      suspended: number;
      totalRevenue: number;
      averageRating: number;
    }>("/professionals/stats");
  }

  async getProfessionalStatsById(id: string): Promise<
    ApiResponse<{
      totalSessions: number;
      totalRevenue: number;
      averageRating: number;
      totalClients: number;
      monthlyRevenue: number[];
      recentSessions: number;
    }>
  > {
    return apiClient.get<{
      totalSessions: number;
      totalRevenue: number;
      averageRating: number;
      totalClients: number;
      monthlyRevenue: number[];
      recentSessions: number;
    }>(`/professionals/${id}/stats`);
  }

  // Métodos de disponibilidad
  async updateAvailability(
    id: string,
    availability: UpdateProfessionalRequest["availability"]
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.put<ApiProfessional>(`/professionals/${id}/availability`, {
      availability,
    });
  }

  async getAvailability(
    id: string
  ): Promise<ApiResponse<ApiProfessional["availability"]>> {
    return apiClient.get<ApiProfessional["availability"]>(
      `/professionals/${id}/availability`
    );
  }

  // Métodos de perfil del profesional actual
  async getCurrentProfessional(): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.get<ApiProfessional>("/professionals/me");
  }

  async updateCurrentProfessional(
    data: UpdateProfessionalRequest
  ): Promise<ApiResponse<ApiProfessional>> {
    return apiClient.put<ApiProfessional>("/professionals/me", data);
  }

  async uploadProfileImage(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.post<{ imageUrl: string }>(
      "/professionals/me/profile-image",
      formData
    );
  }

  async deleteProfileImage(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>("/professionals/me/profile-image");
  }

  // Métodos de Stripe Connect
  /**
   * Obtiene el perfil profesional actual con información de Stripe Connect
   * Endpoint: GET /api/profesionales/me
   */
  async getMyProfessionalProfile(): Promise<
    ApiResponse<{
      profesional: {
        id_profesional: number;
        id_usuario: number;
        nombre: string;
        apellidos: string;
        email: string;
        telefono: string;
        especialidad: string;
        stripe_connect_account_id: string | null;
        charges_enabled: boolean;
        payouts_enabled: boolean;
        estado_aprobacion: string;
        usuario_verificado: boolean;
        [key: string]: any;
      };
    }>
  > {
    return apiClient.get<{
      profesional: {
        id_profesional: number;
        id_usuario: number;
        nombre: string;
        apellidos: string;
        email: string;
        telefono: string;
        especialidad: string;
        stripe_connect_account_id: string | null;
        charges_enabled: boolean;
        payouts_enabled: boolean;
        estado_aprobacion: string;
        usuario_verificado: boolean;
        [key: string]: any;
      };
    }>("/profesionales/me");
  }

  /**
   * Obtiene el balance de Stripe Connect del profesional autenticado
   * Endpoint: GET /api/profesionales/me/stripe/balance
   */
  async getMyStripeBalance(): Promise<
    ApiResponse<{
      balance: {
        disponible: {
          monto: number;
          moneda: string;
          disponible_en: any;
        };
        pendiente: {
          monto: number;
          moneda: string;
        };
        conectado: any[];
      };
      profesional_id: number;
      stripe_account_id: string;
    }>
  > {
    return apiClient.get<{
      balance: {
        disponible: {
          monto: number;
          moneda: string;
          disponible_en: any;
        };
        pendiente: {
          monto: number;
          moneda: string;
        };
        conectado: any[];
      };
      profesional_id: number;
      stripe_account_id: string;
    }>("/profesionales/me/stripe/balance");
  }

  /**
   * Crea un link de onboarding de Stripe Connect
   * Endpoint: POST /api/profesionales/me/stripe/onboarding
   */
  async createStripeOnboardingLink(params?: {
    return_url?: string;
    refresh_url?: string;
  }): Promise<
    ApiResponse<{
      onboarding_url: string;
      expires_at: number;
      profesional_id: number;
      stripe_account_id: string;
    }>
  > {
    return apiClient.post<{
      onboarding_url: string;
      expires_at: number;
      profesional_id: number;
      stripe_account_id: string;
    }>("/profesionales/me/stripe/onboarding", params);
  }
}

export const professionalsService = new ProfessionalsService();
