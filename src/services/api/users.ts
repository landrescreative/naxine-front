// src/services/api/users.ts
import { apiClient, ApiResponse } from "./client";
import {
  ApiUser,
  ApiClient as ApiClientType,
  ApiPaginationParams,
  ApiPaginatedResponse,
  ApiFilterParams,
} from "../types/api";

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: "client" | "professional" | "admin";
  phone?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  status?: "Activo" | "Inactivo";
}

export class UsersService {
  async getUsers(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiUser>>> {
    return apiClient.get<ApiPaginatedResponse<ApiUser>>("/users", params);
  }

  async getUserById(id: string): Promise<ApiResponse<ApiUser>> {
    return apiClient.get<ApiUser>(`/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<ApiUser>> {
    return apiClient.post<ApiUser>("/users", data);
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  async deactivateUser(id: string): Promise<ApiResponse<ApiUser>> {
    return apiClient.patch<ApiUser>(`/users/${id}/deactivate`);
  }

  async activateUser(id: string): Promise<ApiResponse<ApiUser>> {
    return apiClient.patch<ApiUser>(`/users/${id}/activate`);
  }

  // Métodos específicos para clientes
  async getClients(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiClientType>>> {
    return apiClient.get<ApiPaginatedResponse<ApiClientType>>(
      "/users/clients",
      params
    );
  }

  // Obtener clientes desde el endpoint de administración
  async getAdminClients(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<any>> {
    // El endpoint del backend es /clientes/ (sin /api porque ya está en el baseURL)
    return apiClient.get<any>("/clientes", params);
  }

  async getClientById(id: string): Promise<ApiResponse<ApiClientType>> {
    return apiClient.get<ApiClientType>(`/users/clients/${id}`);
  }

  async updateClient(
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<ApiClientType>> {
    return apiClient.put<ApiClientType>(`/users/clients/${id}`, data);
  }

  // Actualizar cliente desde el endpoint de administración
  async updateAdminClient(
    id: string,
    data: {
      nombre_completo?: string;
      telefono?: string;
      email?: string;
      fecha_nacimiento?: string;
      historial_medico?: string;
    }
  ): Promise<ApiResponse<any>> {
    // El endpoint del backend es /clientes/:id (sin /api porque ya está en el baseURL)
    return apiClient.put<any>(`/clientes/${id}`, data);
  }

  // Restablecer contraseña de usuario (solo admin)
  async resetUserPassword(
    userId: string,
    password_nueva: string
  ): Promise<ApiResponse<any>> {
    // PUT /api/usuarios/:id/restablecer-password
    return apiClient.put<any>(`/usuarios/${userId}/restablecer-password`, {
      password_nueva,
    });
  }

  // Cambiar estado de usuario (activar/desactivar) - solo admin
  async updateUserStatus(
    userId: string,
    is_active: boolean
  ): Promise<ApiResponse<any>> {
    // PUT /api/usuarios/:id/estado
    return apiClient.put<any>(`/usuarios/${userId}/estado`, {
      is_active,
    });
  }

  async getClientStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      totalRevenue: number;
      averageSessionsPerClient: number;
    }>
  > {
    return apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      totalRevenue: number;
      averageSessionsPerClient: number;
    }>("/users/clients/stats");
  }

  // Métodos para profesionales
  async getProfessionals(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<any>>> {
    return apiClient.get<ApiPaginatedResponse<any>>(
      "/users/professionals",
      params
    );
  }

  async getProfessionalById(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/users/professionals/${id}`);
  }

  async updateProfessional(id: string, data: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/users/professionals/${id}`, data);
  }

  // Métodos de perfil del usuario actual
  async getCurrentUser(): Promise<ApiResponse<ApiUser>> {
    return apiClient.get<ApiUser>("/users/me");
  }

  async updateCurrentUser(
    data: UpdateUserRequest
  ): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>("/users/me", data);
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>("/users/me/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async uploadProfileImage(
    file: File
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient.post<{ imageUrl: string }>(
      "/users/me/profile-image",
      formData
    );
  }

  async deleteProfileImage(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>("/users/me/profile-image");
  }
}

export const usersService = new UsersService();
