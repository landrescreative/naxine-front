// src/services/api/calendars.ts
import { apiClient, ApiResponse } from "./client";

export interface CalendarEntry {
  id_calendario: number;
  id_usuario: number;
  proveedor: string;
  access_token?: string;
  refresh_token?: string;
  expiracion_token?: string;
  token_type?: string;
  external_calendar_id?: string;
  nombre_calendario?: string;
  sincronizacion_activa?: boolean;
  modo_sincronizacion?: string;
  connected?: boolean;
  google_sync_ok?: number | boolean;
  ultima_verificacion?: string | null;
  error_conexion?: string | null;
}

export interface CalendarsResponse {
  calendarios_externos: CalendarEntry[];
}

export interface CalendarVerificationResult {
  id_calendario: number;
  ok: boolean;
  error?: string;
}

export class CalendarsService {
  async getMyCalendars(): Promise<ApiResponse<CalendarsResponse>> {
    return apiClient.get<CalendarsResponse>("/calendarios-externos/mis-calendarios");
  }

  async getGoogleAuthorizationUrl(): Promise<ApiResponse<{ url: string }>> {
    return apiClient.get<{ url: string }>("/calendarios-externos/google/authorize");
  }

  async verifyMyCalendars(): Promise<ApiResponse<{ resultados: CalendarVerificationResult[] }>> {
    return apiClient.post<{ resultados: CalendarVerificationResult[] }>("/calendarios-externos/verificar");
  }
}

export const calendarsService = new CalendarsService();

