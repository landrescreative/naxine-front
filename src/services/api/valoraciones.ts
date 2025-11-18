// src/services/api/valoraciones.ts
import { apiClient, ApiResponse } from "./client";

export interface ValoracionPublicRequest {
  token?: string;
  id_cita?: number | string;
  calificacion: number;
  comentario?: string;
}

export interface ValoracionPublicResponse {
  success: boolean;
  message?: string;
}

export interface ValoracionInfoResponse {
  id_valoracion?: number;
  id_cliente?: number;
  id_profesional?: number;
  id_sesion?: number;
  calificacion?: number;
  comentario?: string | null;
  estado?: string;
}

export interface ValoracionItem {
  id_valoracion: number;
  id_cliente?: number;
  id_profesional?: number;
  id_sesion?: number | null;
  calificacion?: number;
  comentario?: string | null;
  fecha_valoracion?: string | null;
  estado?: "pendiente" | "aprobada" | "rechazada" | string;
  clientes_nombre?: string | null;
  profesional_nombre?: string | null;
}

export interface ValoracionesListResponse {
  valoraciones: ValoracionItem[];
  paginacion?: {
    limit: number;
    offset: number;
    total: number;
    total_filtrado?: number;
  };
}

class ValoracionesService {
  /**
   * Obtiene información de una valoración pública por token
   * Endpoint esperado (backend): GET /api/valoraciones/public?token=...
   */
  async getByToken(token: string): Promise<ApiResponse<ValoracionInfoResponse>> {
    return apiClient.get<ValoracionInfoResponse>(`/valoraciones/public?token=${encodeURIComponent(token)}`);
  }

  /**
   * Crea o completa una valoración pública (por token o id_cita)
   * Endpoint esperado (backend): POST /api/valoraciones/public
   */
  async createPublic(body: ValoracionPublicRequest): Promise<ApiResponse<ValoracionPublicResponse>> {
    return apiClient.post<ValoracionPublicResponse>(`/valoraciones/public`, body);
  }

  /**
   * Lista valoraciones (admin)
   * Endpoint: GET /api/valoraciones?limit&offset
   */
  async getAll(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ValoracionesListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));
    const qs = queryParams.toString();
    return apiClient.get<ValoracionesListResponse>(`/valoraciones${qs ? `?${qs}` : ""}`);
  }

  async getById(id: number | string): Promise<ApiResponse<{ valoracion: ValoracionItem }>> {
    return apiClient.get<{ valoracion: ValoracionItem }>(`/valoraciones/${id}`);
  }

  async cambiarEstado(id: number | string, estado: string): Promise<ApiResponse<{ valoracion: ValoracionItem }>> {
    return apiClient.put<{ valoracion: ValoracionItem }>(`/valoraciones/${id}/estado`, { estado });
  }
}

export const valoracionesService = new ValoracionesService();


