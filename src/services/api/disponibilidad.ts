// src/services/api/disponibilidad.ts
import { apiClient, ApiResponse } from "./client";

export interface DisponibilidadHorario {
  id_disponibilidad: number;
  id_profesional: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_atencion?: 'presencial' | 'en_linea' | 'a_domicilio';
  turno?: string;
  activo: boolean;
}

export interface DisponibilidadResponse {
  disponibilidad_horarios: DisponibilidadHorario[];
}

export interface CitaOcupada {
  id_cita: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tipo_atencion?: string;
}

export interface CitasOcupadasResponse {
  citas: CitaOcupada[];
  fecha_inicio: string;
  fecha_fin: string;
  tipo_atencion?: string | null;
}

export class DisponibilidadService {
  /**
   * Obtiene los horarios disponibles de un profesional (público)
   * Endpoint: GET /api/disponibilidad-horarios/public/profesional/:id_profesional
   */
  async getDisponibilidadProfesional(
    profesionalId: number | string,
    tipo_atencion?: string,
    turno?: string
  ): Promise<ApiResponse<DisponibilidadResponse>> {
    const params: Record<string, string> = {};
    if (tipo_atencion) params.tipo_atencion = tipo_atencion;
    if (turno) params.turno = turno;

    const queryString = new URLSearchParams(params).toString();
    const url = `/disponibilidad-horarios/public/profesional/${profesionalId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DisponibilidadResponse>(url);
  }

  /**
   * Obtiene las citas ocupadas de un profesional en un rango de fechas
   * Endpoint: GET /api/citas/profesional/:id_profesional/ocupadas
   */
  async getCitasOcupadas(
    profesionalId: number | string,
    fechaInicio: string,
    fechaFin: string,
    tipo_atencion?: string
  ): Promise<ApiResponse<CitasOcupadasResponse>> {
    const params: Record<string, string> = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };
    if (tipo_atencion) params.tipo_atencion = tipo_atencion;

    const queryString = new URLSearchParams(params).toString();
    const url = `/citas/profesional/${profesionalId}/ocupadas?${queryString}`;
    
    return apiClient.get<CitasOcupadasResponse>(url);
  }
}

export const disponibilidadService = new DisponibilidadService();

