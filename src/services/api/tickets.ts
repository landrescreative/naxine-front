// src/services/api/tickets.ts
import { apiClient, ApiResponse } from "./client";
import { ApiPaginationParams, ApiFilterParams } from "../types/api";

export type TicketStatus = "abierto" | "en proceso" | "cerrado";

export interface Ticket {
  id_ticket: number;
  id_usuario: number;
  asunto: string;
  mensaje: string;
  telefono?: string;
  correo_electronico?: string;
  estado: TicketStatus;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario?: {
    id_usuario: number;
    nombre: string;
    email: string;
    telefono?: string;
    rol: string;
  };
}

export interface TicketStatistics {
  total: number;
  abiertos: number;
  en_proceso: number;
  cerrados: number;
}

export interface CreateTicketRequest {
  asunto: string;
  mensaje: string;
  telefono?: string;
  correo_electronico?: string;
}

export interface CreatePublicTicketRequest {
  nombre?: string;
  asunto?: string;
  mensaje: string;
  correo_electronico: string;
  telefono?: string;
}

export interface UpdateTicketRequest {
  estado?: TicketStatus;
  asunto?: string;
  mensaje?: string;
}

export interface TicketListParams extends ApiPaginationParams, ApiFilterParams {
  estado?: TicketStatus;
  id_usuario?: number;
  offset?: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  limit?: number;
  offset?: number;
}

export class TicketsService {
  /**
   * Listar todos los tickets (solo administradores)
   */
  async getTickets(
    params?: TicketListParams
  ): Promise<ApiResponse<TicketListResponse>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.estado) queryParams.estado = params.estado;
    if (params?.id_usuario) queryParams.id_usuario = params.id_usuario;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset !== undefined) queryParams.offset = params.offset;

    return apiClient.get<TicketListResponse>("/tickets", queryParams);
  }

  /**
   * Obtener un ticket específico por ID
   */
  async getTicketById(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.get<Ticket>(`/tickets/${id}`);
  }

  /**
   * Crear un nuevo ticket de soporte
   */
  async createTicket(
    data: CreateTicketRequest
  ): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>("/tickets", data);
  }

  /**
   * Crear un ticket público (sin autenticación) - para formulario de contacto
   */
  async createPublicTicket(
    data: CreatePublicTicketRequest
  ): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>("/tickets/publico", data, {
      skipAuth: true, // No requiere autenticación
    });
  }

  /**
   * Actualizar un ticket (principalmente para cambiar el estado)
   */
  async updateTicket(
    id: number,
    data: UpdateTicketRequest
  ): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${id}`, data);
  }

  /**
   * Obtener estadísticas de tickets (solo administradores)
   */
  async getStatistics(): Promise<ApiResponse<TicketStatistics>> {
    return apiClient.get<TicketStatistics>("/tickets/estadisticas");
  }

  /**
   * Obtener mis tickets (para usuarios autenticados)
   */
  async getMyTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>("/tickets/mis-tickets");
  }
}

export const ticketsService = new TicketsService();

