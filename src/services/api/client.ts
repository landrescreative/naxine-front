/**
 * Cliente HTTP centralizado para todas las llamadas a la API
 * 
 * @module api/client
 * @description
 * Este módulo proporciona un cliente HTTP configurable que maneja:
 * - Autenticación automática mediante tokens Bearer
 * - Manejo centralizado de errores
 * - Timeouts configurables
 * - Logging de requests y responses
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/services/api/client';
 * 
 * const response = await apiClient.get<User>('/users/1');
 * if (response.success) {
 *   console.log(response.data);
 * }
 * ```
 */

// src/services/api/client.ts
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "15000");

/**
 * Respuesta estándar de la API
 * 
 * @template T - Tipo de datos esperados en la respuesta
 */
export interface ApiResponse<T> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos de la respuesta (solo presente si success === true) */
  data?: T;
  /** Mensaje de error (solo presente si success === false) */
  error?: string;
  /** Mensaje adicional de la respuesta */
  message?: string;
  /** Detalles completos del error, incluyendo array de errores de validación */
  errorDetails?: any;
}

/**
 * Error de API estructurado
 */
export interface ApiError {
  /** Mensaje de error legible */
  message: string;
  /** Código de estado HTTP */
  status?: number;
  /** Código de error específico de la API */
  code?: string;
}

/**
 * Cliente HTTP para realizar peticiones a la API
 * 
 * @class ApiClient
 * @description
 * Maneja automáticamente:
 * - Autenticación mediante tokens Bearer
 * - Timeouts configurables
 * - Manejo de errores HTTP y de red
 * - Logging de operaciones
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  /**
   * Realiza una petición HTTP a la API
   * 
   * @template T - Tipo de datos esperados en la respuesta
   * @param endpoint - Ruta del endpoint (sin el base URL)
   * @param options - Opciones de fetch estándar + skipAuth para omitir autenticación
   * @returns Promise con la respuesta de la API
   * 
   * @example
   * ```typescript
   * // Petición GET con autenticación
   * const response = await apiClient.request<User>('/users/1', { method: 'GET' });
   * 
   * // Petición POST sin autenticación
   * const response = await apiClient.request('/public/endpoint', { 
   *   method: 'POST',
   *   skipAuth: true,
   *   body: JSON.stringify(data)
   * });
   * ```
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const skipAuth = options.skipAuth || false;

    // Crear headers usando Headers para asegurar que se envíen correctamente
    const headers = new Headers();
    
    // Solo establecer Content-Type si no es FormData
    // FormData establece automáticamente el Content-Type con el boundary correcto
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Obtener token de autenticación si existe y no se especifica skipAuth
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        logger.debug("Agregando token a headers", { endpoint }, "ApiClient");
      } else {
        logger.warn("No hay token disponible", { endpoint }, "ApiClient");
      }
    } else {
      logger.debug("Saltando autenticación", { endpoint }, "ApiClient");
    }

    // Combinar con headers adicionales si existen
    // IMPORTANTE: Si el body es FormData, NO sobrescribir Content-Type (el navegador lo establece con boundary)
    if (options.headers) {
      const isFormData = options.body instanceof FormData;
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          // No establecer Content-Type si es FormData
          if (isFormData && key.toLowerCase() === 'content-type') {
            return;
          }
          headers.set(key, value);
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          // No establecer Content-Type si es FormData
          if (isFormData && key.toLowerCase() === 'content-type') {
            return;
          }
          headers.set(key, value);
        });
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          // No establecer Content-Type si es FormData
          if (isFormData && key.toLowerCase() === 'content-type') {
            return;
          }
          headers.set(key, value as string);
        });
      }
    }

    // Si el body es FormData, crear headers solo con Authorization (sin Content-Type)
    // El navegador establecerá automáticamente Content-Type con boundary
    let finalHeaders: Headers | undefined;
    const isFormDataBody = options.body instanceof FormData;
    if (isFormDataBody) {
      // Para FormData, solo incluir Authorization si no se salta auth, dejar que el navegador establezca Content-Type
      const formDataHeaders = new Headers();
      if (!skipAuth) {
        const token = this.getAuthToken();
        if (token) {
          formDataHeaders.set("Authorization", `Bearer ${token}`);
        }
      }
      finalHeaders = formDataHeaders;
    } else {
      finalHeaders = headers;
    }

    const config: RequestInit = {
      method: options.method,
      body: options.body,
      // NO incluir headers si es FormData - el navegador los establecerá automáticamente
      // Pero necesitamos Authorization, así que lo incluimos manualmente arriba
      headers: finalHeaders,
    };

    try {
      // Log del body antes de enviar (solo en desarrollo)
      if (options.body && typeof options.body === 'string') {
        try {
          const bodyObj = JSON.parse(options.body);
          logger.debug("Request body", bodyObj, "ApiClient");
        } catch (e) {
          // No es JSON, ignorar
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails: any = null;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorDetails = errorData;
            
            // Verificar si el objeto está vacío
            const isEmpty = !errorData || Object.keys(errorData).length === 0;
            
            // Log detallado del error
            if (isEmpty) {
              logger.error("Error response vacío", {
                status: response.status,
                statusText: response.statusText,
                url: url,
                method: options.method || 'GET',
              }, "ApiClient");
            } else {
              logger.error("Error response", errorData, "ApiClient");
              if (errorData.errors && Array.isArray(errorData.errors)) {
                logger.error("Errores de validación", errorData.errors, "ApiClient");
              }
            }
            
            if (!isEmpty) {
              // Intentar extraer el mensaje de error del JSON
              if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                // Si hay errores de validación, construir un mensaje detallado
                const validationErrors = errorData.errors.map((e: any) => {
                  if (typeof e === 'string') return e;
                  return e.message || e.msg || e.field ? `${e.field}: ${e.message || e.msg || e}` : JSON.stringify(e);
                }).join(', ');
                errorMessage = validationErrors || errorData.message || errorData.error || errorData.msg || `HTTP ${response.status}`;
              } else {
                errorMessage =
                  errorData.message ||
                  errorData.error ||
                  errorData.msg ||
                  `HTTP ${response.status}: ${JSON.stringify(errorData)}`;
              }
            } else {
              // Si el objeto está vacío, usar el status code con información adicional
              errorMessage = `HTTP ${response.status}: ${response.statusText || 'Error desconocido'}`;
              // En desarrollo, agregar más contexto
              if (process.env.NODE_ENV === 'development') {
                errorMessage += ` (Respuesta vacía del servidor para ${options.method || 'GET'} ${endpoint})`;
              }
            }
          } catch (parseError) {
            // Si falla el parseo, intentar leer como texto
            try {
              const errorText = await response.text();
              errorMessage = errorText || `HTTP ${response.status}: Error parsing JSON`;
            } catch {
              errorMessage = `HTTP ${response.status}: Error parsing response`;
            }
          }
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: Unknown error`;
          }
        }
        
        // Manejo centralizado de autenticación: 401/403
        if (response.status === 401 || response.status === 403) {
          // Normalizar mensaje para el frontend y cerrar sesión
          const authMessage = "Token inválido. Sesión cerrada.";
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem("user");
              window.dispatchEvent(new CustomEvent("userLogout"));
            }
          } catch {
            // Ignorar errores al limpiar sesión
          }
          return {
            success: false,
            error: authMessage,
            errorDetails: errorDetails || { status: response.status },
          };
        }
        
        return {
          success: false,
          error: errorMessage,
          errorDetails: errorDetails, // Incluir detalles completos del error
        };
      }

      const data = await response.json();
      
      // Log para debugging con más detalle
      logger.debug("Respuesta exitosa", {
        url,
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
        hasData: !!(data?.data),
        dataDataKeys: data?.data && typeof data.data === 'object' ? Object.keys(data.data) : [],
        // Solo loguear una muestra pequeña para no saturar los logs
        dataSample: data && typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data
      }, "ApiClient");
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Unknown error occurred",
      };
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const token = user?.token || null;
            
            if (token) {
              logger.debug("Token obtenido", { 
                hasToken: true,
                userId: user?.id,
                email: user?.email,
                tokenLength: token.length
              }, "ApiClient");
            } else {
              // Solo loguear warning si realmente hay datos de usuario pero sin token
              if (user && typeof user === 'object') {
                logger.warn("Token no encontrado en user data", { 
                  hasUserData: true,
                  userId: user?.id,
                  email: user?.email,
                  userKeys: user ? Object.keys(user) : []
                }, "ApiClient");
              }
            }
            
            return token;
          } catch (error) {
            logger.error("Error parsing user data", error, "ApiClient");
            return null;
          }
        } else {
          logger.debug("No hay user data en localStorage", undefined, "ApiClient");
        }
      } catch (error) {
        logger.error("Error accediendo a localStorage", error, "ApiClient");
        return null;
      }
    }
    return null;
  }

  /**
   * Realiza una petición GET
   * 
   * @template T - Tipo de datos esperados en la respuesta
   * @param endpoint - Ruta del endpoint
   * @param params - Parámetros de consulta (query params)
   * @returns Promise con la respuesta de la API
   * 
   * @example
   * ```typescript
   * const response = await apiClient.get<User[]>('/users', { page: 1, limit: 10 });
   * ```
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * Realiza una petición POST
   * 
   * @template T - Tipo de datos esperados en la respuesta
   * @param endpoint - Ruta del endpoint
   * @param data - Datos a enviar en el body (se serializa a JSON automáticamente, excepto FormData)
   * @param options - Opciones adicionales (headers personalizados, skipAuth)
   * @returns Promise con la respuesta de la API
   * 
   * @example
   * ```typescript
   * // POST con JSON
   * const response = await apiClient.post<User>('/users', { name: 'John', email: 'john@example.com' });
   * 
   * // POST con FormData (para uploads)
   * const formData = new FormData();
   * formData.append('file', file);
   * const response = await apiClient.post('/upload', formData);
   * ```
   */
  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string>; skipAuth?: boolean }): Promise<ApiResponse<T>> {
    // Log para debugging
    if (data && !(data instanceof FormData)) {
      logger.debug("POST request", { endpoint, hasEmail: !!data.email }, "ApiClient");
    }
    
    const headers: Record<string, string> = {};
    
    // Si es FormData, NO establecer Content-Type (el navegador lo hará automáticamente con el boundary)
    if (data instanceof FormData) {
      // No establecer Content-Type para FormData - el navegador lo maneja automáticamente
      // Si hay headers personalizados, eliminar Content-Type si existe
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            headers[key] = value;
          }
        });
      }
    } else {
      headers['Content-Type'] = 'application/json';
      // Merge con headers personalizados si existen
      if (options?.headers) {
        Object.assign(headers, options.headers);
      }
    }
    
    return this.request<T>(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      skipAuth: options?.skipAuth,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Instancia singleton del cliente
export const apiClient = new ApiClient();

// Función de utilidad para manejar errores de API
export const handleApiError = (error: ApiError | string): string => {
  if (typeof error === "string") {
    return error;
  }
  return error.message || "An error occurred";
};

// Función para verificar conexión con la API
export const testApiConnection = async (): Promise<ApiResponse<any>> => {
  return apiClient.get("/health");
};
