// src/services/api/appointments.ts
import { apiClient, ApiResponse } from "./client";
import {
  ApiAppointment,
  ApiCreateAppointmentRequest,
  ApiUpdateAppointmentRequest,
  ApiPaginationParams,
  ApiPaginatedResponse,
  ApiFilterParams,
} from "../types/api";

export class AppointmentsService {
  async getAppointments(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiAppointment>>> {
    return apiClient.get<ApiPaginatedResponse<ApiAppointment>>(
      "/appointments",
      params
    );
  }

  async getAppointmentById(id: string): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.get<ApiAppointment>(`/appointments/${id}`);
  }

  async createAppointment(
    data: ApiCreateAppointmentRequest
  ): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.post<ApiAppointment>("/appointments", data);
  }

  async updateAppointment(
    id: string,
    data: ApiUpdateAppointmentRequest
  ): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.put<ApiAppointment>(`/appointments/${id}`, data);
  }

  async cancelAppointment(id: string): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.patch<ApiAppointment>(`/appointments/${id}/cancel`);
  }

  async rescheduleAppointment(
    id: string,
    newDateTime: string
  ): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.patch<ApiAppointment>(`/appointments/${id}/reschedule`, {
      dateTime: newDateTime,
    });
  }

  async completeAppointment(id: string): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.patch<ApiAppointment>(`/appointments/${id}/complete`);
  }

  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/appointments/${id}`);
  }

  // Métodos específicos para diferentes roles
  async getClientAppointments(
    clientId?: string,
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiAppointment>>> {
    const endpoint = clientId
      ? `/appointments/client/${clientId}`
      : "/appointments/my";
    return apiClient.get<ApiPaginatedResponse<ApiAppointment>>(
      endpoint,
      params
    );
  }

  async getProfessionalAppointments(
    professionalId?: string,
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiAppointment>>> {
    const endpoint = professionalId
      ? `/appointments/professional/${professionalId}`
      : "/appointments/my";
    return apiClient.get<ApiPaginatedResponse<ApiAppointment>>(
      endpoint,
      params
    );
  }

  async getUpcomingAppointments(
    limit: number = 5
  ): Promise<ApiResponse<ApiAppointment[]>> {
    return apiClient.get<ApiAppointment[]>(
      `/appointments/upcoming?limit=${limit}`
    );
  }

  async getAppointmentsByDate(
    date: string
  ): Promise<ApiResponse<ApiAppointment[]>> {
    return apiClient.get<ApiAppointment[]>(`/appointments/date/${date}`);
  }

  async getAppointmentsByStatus(
    status: ApiAppointment["status"],
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiAppointment>>> {
    return apiClient.get<ApiPaginatedResponse<ApiAppointment>>(
      `/appointments/status/${status}`,
      params
    );
  }

  async getAppointmentStats(): Promise<
    ApiResponse<{
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      completed: number;
    }>
  > {
    return apiClient.get<{
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      completed: number;
    }>("/appointments/stats");
  }

  async getAvailableSlots(
    professionalId: string,
    date: string
  ): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(
      `/appointments/available-slots/${professionalId}?date=${date}`
    );
  }
}

export const appointmentsService = new AppointmentsService();
