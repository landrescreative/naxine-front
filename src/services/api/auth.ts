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
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthService] Enviando login con email:', normalizedEmail);
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
      rol: data.role === "client" ? "cliente" : data.role === "professional" ? "profesional" : "cliente",
    };

    return apiClient.post<ApiAuthResponse>("/usuarios/registro", registerData);
  }

  async registerProfessional(data: {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono: string;
    numero_colegiado: string;
    especialidad: string;
    descripcion: string;
  }): Promise<ApiResponse<ApiAuthResponse>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = data.email.trim().toLowerCase();
    
    // El backend espera el formato completo para registro de profesional
    const registerData = {
      nombre: data.nombre,
      apellidos: data.apellidos,
      email: normalizedEmail,
      password: data.password,
      rol: "profesional",
      telefono: data.telefono,
      numero_colegiado: data.numero_colegiado,
      especialidad: data.especialidad,
      descripcion: data.descripcion,
    };

    return apiClient.post<ApiAuthResponse>("/usuarios/registro", registerData);
  }

  async logout(): Promise<ApiResponse<void>> {
    console.log('[AuthService] Llamando a /usuarios/cerrar-sesion');
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
    return apiClient.post<ApiAuthResponse | { message: string }>("/usuarios/verificar-codigo", {
      email: normalizedEmail,
      codigo: codigo.trim(),
    });
  }

  async getProfile(): Promise<ApiResponse<ApiUser>> {
    return apiClient.get<ApiUser>("/usuarios/perfil");
  }

  async updateProfile(
    data: Partial<ApiUser>
  ): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>("/usuarios/perfil", data);
  }

  async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = email.trim().toLowerCase();
    
    // Solicitar código de recuperación de contraseña
    return apiClient.post<{ message: string }>("/usuarios/solicitar-reset-password", {
      email: normalizedEmail,
    });
  }

  async resetPassword(
    email: string,
    codigo: string,
    password_nueva: string
  ): Promise<ApiResponse<{ message: string }>> {
    // Normalizar el email: trim y lowercase para consistencia
    const normalizedEmail = email.trim().toLowerCase();
    
    // Restablecer contraseña con código de verificación
    return apiClient.post<{ message: string }>("/usuarios/restablecer-password", {
      email: normalizedEmail,
      codigo: codigo.trim(),
      password_nueva,
    });
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
    return apiClient.post<{ message: string }>(
      "/usuarios/resend-verification"
    );
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
