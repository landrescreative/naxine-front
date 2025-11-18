// src/services/api/citas.ts
// Servicio específico para crear citas con el formato del backend
import { apiClient, ApiResponse } from "./client";

export interface CreateCitaRequest {
  id_cliente: number;
  id_profesional: number;
  id_precio: number;
  fecha_inicio: string; // ISO 8601 format
  fecha_fin: string; // ISO 8601 format
  crear_payment_intent: boolean;
  moneda?: string; // Moneda para el Payment Intent (EUR por defecto para España)
  tipo_atencion?: 'presencial' | 'en_linea' | 'a_domicilio'; // Tipo de atención de la cita
  direccion_domicilio?: string; // Dirección del cliente para citas a domicilio
}

export interface CreateCitaResponse {
  cita: {
    id_cita: number;
    estado: string;
    id_pago: number;
  };
  pago: {
    id_pago: number;
    monto: number;
    estado: string;
    id_precio: number;
  };
  paymentIntent: {
    paymentIntentId: string;
    clientSecret: string;
    estado: string;
  };
  redirectToPayment: {
    clientSecret: string;
    paymentIntentId: string;
    url: string;
  };
}

export interface Cita {
  id_cita: number;
  id_cliente: number;
  id_profesional: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion?: number;
  tipo_atencion?: 'presencial' | 'en_linea' | 'a_domicilio';
  plataforma?: string;
  link_videollamada?: string;
  estado: string;
  notas?: string;
  id_pago?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Campos de JOIN
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  profesional_nombre?: string;
  domicilio_consultorio?: string;
  pago_monto?: number;
  pago_estado?: string;
  // Campos legacy (opcionales)
  id_precio?: number;
  created_at?: string;
  updated_at?: string;
  profesional?: {
    id_profesional: number;
    nombre_completo: string;
    especialidad: string;
    email?: string;
    telefono?: string;
  };
  precio?: {
    id_precio: number;
    nombre_servicio: string;
    descripcion: string;
    precio: number;
    moneda: string;
    duracion?: string;
  };
}

export interface CitasClienteResponse {
  citas: Cita[];
  id_cliente: string;
  paginacion: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface CitaOcupada {
  id_cita: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface CitasOcupadasResponse {
  citas: CitaOcupada[];
  fecha_inicio: string;
  fecha_fin: string;
}

export interface CitasResponse {
  citas: Cita[];
  paginacion: {
    limit: number;
    offset: number;
    total: number;
  };
}

export class CitasService {
  /**
   * Crea una cita con Payment Intent en Stripe
   * Endpoint: POST /api/citas
   */
  async createCita(
    data: CreateCitaRequest
  ): Promise<ApiResponse<CreateCitaResponse>> {
    return apiClient.post<CreateCitaResponse>("/citas", data);
  }

  /**
   * Obtiene las citas de un cliente
   * Endpoint: GET /api/citas/cliente/:id
   * Respuesta: { citas: Cita[], id_cliente: string, paginacion: {...} }
   */
  async getCitasCliente(
    clienteId: number | string
  ): Promise<ApiResponse<CitasClienteResponse>> {
    return apiClient.get<CitasClienteResponse>(`/citas/cliente/${clienteId}`);
  }

  /**
   * Obtiene las citas de un profesional
   * Endpoint: GET /api/citas/profesional/:id_profesional
   */
  async getCitasProfesional(
    profesionalId: number | string
  ): Promise<ApiResponse<Cita[]>> {
    return apiClient.get<Cita[]>(`/citas/profesional/${profesionalId}`);
  }

  /**
   * Obtiene las citas ocupadas de un profesional en un rango de fechas
   * Endpoint: GET /api/citas/profesional/:id_profesional/ocupadas
   * Query params: fecha_inicio, fecha_fin (opcionales, si no se proporcionan usa el mes actual)
   */
  async getCitasOcupadas(
    profesionalId: number | string,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<ApiResponse<CitasOcupadasResponse>> {
    const params: Record<string, string> = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    
    const queryString = new URLSearchParams(params).toString();
    const url = `/citas/profesional/${profesionalId}/ocupadas${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CitasOcupadasResponse>(url);
  }

  /**
   * Obtiene todas las citas con paginación y filtros opcionales
   * Endpoint: GET /api/citas
   * Query params: limit, offset, estado, fecha_desde, fecha_hasta
   */
  async getAllCitas(params?: {
    limit?: number;
    offset?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ApiResponse<CitasResponse>> {
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();
    if (params?.estado) queryParams.estado = params.estado;
    if (params?.fecha_desde) queryParams.fecha_desde = params.fecha_desde;
    if (params?.fecha_hasta) queryParams.fecha_hasta = params.fecha_hasta;

    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/citas${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CitasResponse>(url);
  }

  /**
   * Obtiene una cita por ID
   * Endpoint: GET /api/citas/:id
   */
  async getCitaPorId(
    citaId: number | string
  ): Promise<ApiResponse<{ cita: Cita }>> {
    return apiClient.get<{ cita: Cita }>(`/citas/${citaId}`);
  }

  /**
   * Cambia el estado de una cita
   * Endpoint: PUT /api/citas/:id/estado
   */
  async cambiarEstadoCita(
    citaId: number | string,
    estado: string
  ): Promise<ApiResponse<{ cita: Cita }>> {
    return apiClient.put<{ cita: Cita }>(`/citas/${citaId}/estado`, { estado });
  }

  /**
   * Actualiza una cita (para reagendar)
   * Endpoint: PUT /api/citas/:id
   */
  async actualizarCita(
    citaId: number | string,
    datos: {
      id_cliente?: number;
      id_profesional?: number;
      fecha_inicio?: string;
      fecha_fin?: string;
      tipo_atencion?: 'presencial' | 'en_linea' | 'a_domicilio';
      estado?: string;
    }
  ): Promise<ApiResponse<{ cita: Cita }>> {
    return apiClient.put<{ cita: Cita }>(`/citas/${citaId}`, datos);
  }
}

export const citasService = new CitasService();

