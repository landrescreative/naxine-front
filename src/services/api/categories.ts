// src/services/api/categories.ts
import { apiClient, ApiResponse } from "./client";
import {
  ApiCategory,
  ApiService,
  ApiCategoryWithServices,
  ApiPaginationParams,
  ApiPaginatedResponse,
  ApiFilterParams,
} from "../types/api";

export interface CreateCategoryRequest {
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  backgroundImage?: string;
}

export interface CreateServiceRequest {
  categoryId: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  description: string;
  keywords: string[];
  backgroundImage?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  description?: string;
  keywords?: string[];
  backgroundImage?: string;
}

export class CategoriesService {
  // Métodos para categorías
  async getCategories(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiCategory>>> {
    return apiClient.get<ApiPaginatedResponse<ApiCategory>>(
      "/categories",
      params
    );
  }

  async getCategoryById(
    id: string
  ): Promise<ApiResponse<ApiCategoryWithServices>> {
    return apiClient.get<ApiCategoryWithServices>(`/categories/${id}`);
  }

  async getCategoryBySlug(
    slug: string
  ): Promise<ApiResponse<ApiCategoryWithServices>> {
    return apiClient.get<ApiCategoryWithServices>(`/categories/slug/${slug}`);
  }

  async createCategory(
    data: CreateCategoryRequest
  ): Promise<ApiResponse<ApiCategory>> {
    return apiClient.post<ApiCategory>("/categories", data);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<ApiCategory>> {
    return apiClient.put<ApiCategory>(`/categories/${id}`, data);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/categories/${id}`);
  }

  // Métodos para servicios
  async getServices(
    params?: ApiPaginationParams & ApiFilterParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiService>>> {
    return apiClient.get<ApiPaginatedResponse<ApiService>>("/services", params);
  }

  async getServiceById(id: string): Promise<ApiResponse<ApiService>> {
    return apiClient.get<ApiService>(`/services/${id}`);
  }

  async getServiceBySlug(slug: string): Promise<ApiResponse<ApiService>> {
    return apiClient.get<ApiService>(`/services/slug/${slug}`);
  }

  async getServicesByCategory(
    categoryId: string,
    params?: ApiPaginationParams
  ): Promise<ApiResponse<ApiPaginatedResponse<ApiService>>> {
    return apiClient.get<ApiPaginatedResponse<ApiService>>(
      `/categories/${categoryId}/services`,
      params
    );
  }

  async createService(
    data: CreateServiceRequest
  ): Promise<ApiResponse<ApiService>> {
    return apiClient.post<ApiService>("/services", data);
  }

  async updateService(
    id: string,
    data: UpdateServiceRequest
  ): Promise<ApiResponse<ApiService>> {
    return apiClient.put<ApiService>(`/services/${id}`, data);
  }

  async deleteService(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/services/${id}`);
  }

  // Métodos de búsqueda
  async searchCategories(query: string): Promise<ApiResponse<ApiCategory[]>> {
    return apiClient.get<ApiCategory[]>("/categories/search", { q: query });
  }

  async searchServices(query: string): Promise<ApiResponse<ApiService[]>> {
    return apiClient.get<ApiService[]>("/services/search", { q: query });
  }

  async searchAll(query: string): Promise<
    ApiResponse<{
      categories: ApiCategory[];
      services: ApiService[];
    }>
  > {
    return apiClient.get<{
      categories: ApiCategory[];
      services: ApiService[];
    }>("/search", { q: query });
  }

  // Métodos de estadísticas
  async getCategoryStats(): Promise<
    ApiResponse<{
      totalCategories: number;
      totalServices: number;
      mostPopularCategories: Array<{
        category: ApiCategory;
        serviceCount: number;
      }>;
    }>
  > {
    return apiClient.get<{
      totalCategories: number;
      totalServices: number;
      mostPopularCategories: Array<{
        category: ApiCategory;
        serviceCount: number;
      }>;
    }>("/categories/stats");
  }

  async getServiceStats(): Promise<
    ApiResponse<{
      totalServices: number;
      servicesByCategory: Array<{
        categoryId: string;
        categoryName: string;
        serviceCount: number;
      }>;
    }>
  > {
    return apiClient.get<{
      totalServices: number;
      servicesByCategory: Array<{
        categoryId: string;
        categoryName: string;
        serviceCount: number;
      }>;
    }>("/services/stats");
  }

  // Métodos para obtener datos completos
  async getAllCategoriesWithServices(): Promise<
    ApiResponse<ApiCategoryWithServices[]>
  > {
    return apiClient.get<ApiCategoryWithServices[]>(
      "/categories/with-services"
    );
  }

  async getPopularCategories(
    limit: number = 10
  ): Promise<ApiResponse<ApiCategory[]>> {
    return apiClient.get<ApiCategory[]>(`/categories/popular?limit=${limit}`);
  }

  async getFeaturedServices(
    limit: number = 10
  ): Promise<ApiResponse<ApiService[]>> {
    return apiClient.get<ApiService[]>(`/services/featured?limit=${limit}`);
  }
}

export const categoriesService = new CategoriesService();
