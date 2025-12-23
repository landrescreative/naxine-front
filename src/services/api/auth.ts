/**
 * Servicio de autenticación
 *
 * @module api/auth
 * @description
 * Maneja todas las operaciones relacionadas con autenticación:
 * - Login de usuarios
 * - Registro de usuarios y profesionales
 * - Verificación de tokens
 * - Recuperación de contraseña
 *
 * @example
 * ```typescript
 * import { authService } from '@/services/api/auth';
 *
 * const response = await authService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * if (response.success) {
 *   const { token, usuario } = response.data;
 *   // Guardar token y usuario
 * }
 * ```
 */

// src/services/api/auth.ts
import { apiClient, ApiResponse } from "./client";
import {
  ApiAuthResponse,
  ApiLoginRequest,
  ApiRegisterRequest,
  ApiUser,
} from "../types/api";
import { LoginCredentials, RegisterData } from "../types/auth";

/**
 * Servicio para operaciones de autenticación
 */
export class AuthService {
  /**
   * Inicia sesión con email y contraseña
   *
   * @param credentials - Credenciales de login (email y password)
   * @returns Promise con la respuesta que incluye token y datos del usuario
   *
   * @example
   * ```typescript
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * if (response.success) {
   *   console.log('Token:', response.data.token);
   *   console.log('Usuario:', response.data.usuario);
   * }
   * ```
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<ApiAuthResponse>> {
    // Normalizar email: trim espacios pero preservar puntos y otros caracteres
    const normalizedEmail = credentials.email.trim().toLowerCase();

    const loginData: ApiLoginRequest = {
      email: normalizedEmail,
      password: credentials.password,
    };

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log("[AuthService] Enviando login con email:", normalizedEmail);
    }

    return apiClient.post<ApiAuthResponse>("/usuarios/login", loginData);
  }

  async register(data: RegisterData): Promise<ApiResponse<ApiAuthResponse>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = data.email.trim().toLowerCase();

    // El backend espera: email, password, nombre, rol
    const registerData = {
      email: normalizedEmail,
      password: data.password,
      nombre: data.name, // Mapear name a nombre
      rol:
        data.role === "client"
          ? "cliente"
          : data.role === "professional"
          ? "profesional"
          : "cliente",
    };

    return apiClient.post<ApiAuthResponse>("/usuarios/registro", registerData);
  }

  async registerProfessional(
    data:
      | FormData
      | {
          nombreCompleto: string;
          correoElectronico: string;
          password: string;
          telefono: string;
          numeroColegiado: string;
          especialidad?: string;
          especialidadSeleccionada?: string;
          id_especialidad?: number;
          direccion?: string;
          ciudad?: string;
          biografia?: string;
          experiencia_años?: number;
          tarifa_por_hora?: number;
          videoPresentacion?: string;
        }
  ): Promise<ApiResponse<ApiAuthResponse>> {
    // Si es FormData, enviarlo directamente
    if (data instanceof FormData) {
      // Usar fetch directamente para FormData ya que apiClient podría no manejarlo correctamente
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      console.log(
        "[AUTH] Enviando registro profesional a:",
        `${apiBaseUrl}/profesionales/registro`
      );

      const response = await fetch(`${apiBaseUrl}/profesionales/registro`, {
        method: "POST",
        body: data,
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
      });

      console.log("[AUTH] Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log("[AUTH] Datos de respuesta:", {
          success: responseData.success,
          message: responseData.message,
          error: responseData.error,
          hasErrors: !!responseData.errors,
          errorsCount: responseData.errors?.length || 0,
        });

        if (responseData.errors && Array.isArray(responseData.errors)) {
          console.log(
            "[AUTH] Errores detallados del servidor:",
            responseData.errors
          );
        }
      } catch (parseError) {
        console.error("[AUTH] Error al parsear respuesta JSON:", parseError);
        const textResponse = await response.text();
        console.error("[AUTH] Respuesta como texto:", textResponse);
        throw new Error("Error al procesar la respuesta del servidor");
      }

      return {
        success: response.ok && responseData.success,
        data: {
          ...responseData.data,
          email: responseData.email, // Incluir email para redirigir a verificación
        },
        message: responseData.message,
        error: responseData.error || responseData.message,
        errorDetails: responseData.errors
          ? { errors: responseData.errors }
          : undefined,
      };
    }

    // Si es objeto, normalizar y enviar como JSON (compatibilidad)
    const normalizedEmail = data.correoElectronico.trim().toLowerCase();

    const registerData = {
      nombreCompleto: data.nombreCompleto,
      correoElectronico: normalizedEmail,
      password: data.password,
      telefono: data.telefono,
      numeroColegiado: data.numeroColegiado,
      especialidad: data.especialidad,
      especialidadSeleccionada: data.especialidadSeleccionada,
      id_especialidad: data.id_especialidad,
      direccion: data.direccion,
      ciudad: data.ciudad,
      biografia: data.biografia,
      experiencia_años: data.experiencia_años,
      tarifa_por_hora: data.tarifa_por_hora,
      videoPresentacion: data.videoPresentacion,
    };

    // Usar el nuevo endpoint de registro público
    return apiClient.post<ApiAuthResponse>(
      "/profesionales/registro",
      registerData
    );
  }

  async logout(): Promise<ApiResponse<void>> {
    console.log("[AuthService] Llamando a /usuarios/cerrar-sesion");
    return apiClient.post<void>("/usuarios/cerrar-sesion");
  }

  async refreshToken(): Promise<ApiResponse<ApiAuthResponse>> {
    // Si tu backend no tiene refresh token, puedes retornar un error o implementar lógica alternativa
    return apiClient.post<ApiAuthResponse>("/usuarios/refresh");
  }

  async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    // Usar el endpoint de perfil para verificar el token
    try {
      const response = await apiClient.get<any>("/usuarios/perfil");
      return {
        success: response.success,
        data: { valid: response.success },
      };
    } catch (error) {
      return {
        success: false,
        data: { valid: false },
      };
    }
  }

  async verifyCode(
    email: string,
    codigo: string
  ): Promise<ApiResponse<ApiAuthResponse | { message: string }>> {
    // Normalizar el email igual que en login y registro: trim y lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // El backend espera: { email, codigo }
    // Puede devolver { message } o { usuario, token } si inicia sesión automáticamente
    return apiClient.post<ApiAuthResponse | { message: string }>(
      "/usuarios/verificar-codigo",
      {
        email: normalizedEmail,
        codigo: codigo.trim(),
      }
    );
  }

  async getProfile(): Promise<ApiResponse<ApiUser>> {
    return apiClient.get<ApiUser>("/usuarios/perfil");
  }

  async updateProfile(data: Partial<ApiUser>): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>("/usuarios/perfil", data);
  }

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = email.trim().toLowerCase();

    // Solicitar código de recuperación de contraseña
    return apiClient.post<{ message: string }>(
      "/usuarios/solicitar-reset-password",
      {
        email: normalizedEmail,
      }
    );
  }

  async resetPassword(
    email: string,
    codigo: string,
    password_nueva: string
  ): Promise<ApiResponse<{ message: string }>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = email.trim().toLowerCase();

    // Restablecer contraseña con código de verificación
    return apiClient.post<{ message: string }>(
      "/usuarios/restablecer-password",
      {
        email: normalizedEmail,
        codigo: codigo.trim(),
        password_nueva,
      }
    );
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>("/usuarios/cambiar-password", {
      password_actual: currentPassword,
      password_nueva: newPassword,
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    // Si tu backend tiene esta ruta, ajústala aquí
    return apiClient.post<{ message: string }>("/usuarios/verify-email", {
      token,
    });
  }

  async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    // Si tu backend tiene esta ruta, ajústala aquí
    return apiClient.post<{ message: string }>("/usuarios/resend-verification");
  }

  async resendVerificationCode(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = email.trim().toLowerCase();

    // Reenviar código de verificación
    return apiClient.post<{ message: string }>("/usuarios/reenviar-codigo", {
      email: normalizedEmail,
    });
  }
}

export const authService = new AuthService();
