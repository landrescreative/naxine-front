"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/api/auth";
import {
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "@/services/types/auth";
import {
  handleApiError,
  getErrorMessage,
} from "@/services/utils/error-handling";
import { logger } from "@/lib/logger";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

// Función helper para mapear la respuesta del backend al formato del frontend
const mapBackendResponseToAuthUser = (backendData: any): AuthUser => {
  // Mapear roles del backend al frontend
  const roleMap: Record<string, "client" | "professional" | "admin"> = {
    "cliente": "client",
    "profesional": "professional",
    "admin": "admin",
    "administracion": "admin",
  };

  logger.debug("Backend data recibido", { token: !!backendData.token, usuario: !!backendData.usuario }, "mapBackendResponseToAuthUser");

  const mapped = {
    id: String(backendData.usuario?.id_usuario || backendData.user?.id || ""),
    email: backendData.usuario?.email || backendData.user?.email || "",
    name: backendData.usuario?.nombre || backendData.user?.name || "",
    role: roleMap[backendData.usuario?.rol || backendData.user?.role || ""] || "client",
    token: backendData.token || "",
    refreshToken: backendData.refreshToken,
  };

  logger.debug("Resultado mapeado", { id: mapped.id, email: mapped.email, role: mapped.role }, "mapBackendResponseToAuthUser");

  return mapped;
};

/**
 * Hook de autenticación
 * 
 * @module hooks/useAuth
 * @description
 * Hook personalizado que gestiona el estado de autenticación de la aplicación.
 * Proporciona funciones para login, registro, logout y verificación de sesión.
 * 
 * @example
 * ```typescript
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * function MyComponent() {
 *   const { user, loading, isAuthenticated, login, logout } = useAuth();
 * 
 *   if (loading) return <div>Cargando...</div>;
 *   if (!isAuthenticated) return <LoginForm onLogin={login} />;
 * 
 *   return (
 *     <div>
 *       <p>Bienvenido, {user?.name}</p>
 *       <button onClick={logout}>Cerrar sesión</button>
 *     </div>
 *   );
 * }
 * ```
 */

// Tipo de retorno para login que puede indicar necesidad de verificación
type LoginResult = 
  | true 
  | false 
  | { needsVerification: true; email: string };

/**
 * Hook para gestionar la autenticación del usuario
 * 
 * @returns Objeto con estado y funciones de autenticación
 * 
 * @example
 * ```typescript
 * const {
 *   user,              // Usuario actual o null
 *   loading,           // Estado de carga
 *   error,             // Mensaje de error si existe
 *   isAuthenticated,   // Boolean que indica si hay sesión activa
 *   login,             // Función para iniciar sesión
 *   register,          // Función para registrar usuario
 *   logout,            // Función para cerrar sesión
 *   refreshToken       // Función para refrescar el token
 * } = useAuth();
 * ```
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar usuario al cargar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);

            // Verificar si el token sigue siendo válido
            if (parsedUser.token) {
              const response = await authService.verifyToken();
              if (response.success && response.data?.valid) {
                setUser(parsedUser);
                // Sincronizar token en cookies
                if (parsedUser.token) {
                  setCookie("auth-token", parsedUser.token);
                }
              } else {
                // Token inválido, intentar refrescar
                await refreshToken();
              }
            } else {
              setUser(parsedUser);
            }
          } catch (error) {
            logger.error("Error parsing user data", error, "useAuth");
            localStorage.removeItem("user");
            deleteCookie("auth-token");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error("Error checking user", error, "useAuth");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener para cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        checkUser();
      }
    };

    // Listener para eventos personalizados
    const handleUserLogin = () => {
      setTimeout(checkUser, 100);
    };

    const handleUserLogout = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
    };
  }, []);

  // Función para hacer logout local (sin llamar al servidor)
  // Usada internamente cuando el refresh token falla
  const doLocalLogout = useCallback(() => {
    localStorage.removeItem("user");
    deleteCookie("auth-token");
    setUser(null);
    setError(null);
    window.dispatchEvent(new CustomEvent("userLogout"));
  }, []);

  // Función para refrescar token
  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      if (response.success && response.data) {
        // El backend devuelve { success: true, message: '...', data: { usuario: {...}, token: "..." } }
        // Mapear el formato del backend al formato esperado
        const userData = mapBackendResponseToAuthUser(response.data);

        localStorage.setItem("user", JSON.stringify(userData));
        // Guardar token en cookies para que el middleware pueda acceder
        if (userData.token) {
          setCookie("auth-token", userData.token);
        }
        setUser(userData);
        return true;
      }
    } catch (error) {
      logger.error("Error refreshing token", error, "useAuth");
    }

    // Si no se puede refrescar, hacer logout local
    doLocalLogout();
    return false;
  }, [doLocalLogout]);

  // Función de login
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);

      if (response.success && response.data) {
        // El backend devuelve { success: true, message: '...', data: { usuario: {...}, token: "..." } }
        const actualData = response.data;
        
        logger.debug("Login exitoso", { 
          hasToken: !!actualData.token, 
          hasUsuario: !!(actualData as any).usuario 
        }, "useAuth");
        
        // Verificar si es un profesional no verificado o pendiente de aprobación
        const actualDataAny = actualData as any;
        if (actualDataAny.profesional) {
          const profesional = actualDataAny.profesional;
          const usuario = actualDataAny.usuario || actualDataAny.user;
          
          // Si el profesional no está verificado o está pendiente de aprobación
          if (profesional.estado_aprobacion === "pendiente" || !profesional.usuario_verificado) {
            const errorMsg = profesional.mensaje || 
              "Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando tu cuenta sea aprobada.";
            setError(errorMsg);
            return false;
          }
        }
        
        // Mapear el formato del backend al formato esperado
        const userData = mapBackendResponseToAuthUser(actualData);

        localStorage.setItem("user", JSON.stringify(userData));
        // Guardar token en cookies para que el middleware pueda acceder
        if (userData.token) {
          setCookie("auth-token", userData.token);
        }
        
        setUser(userData);
        window.dispatchEvent(new CustomEvent("userLogin"));
        return true;
      } else {
        // Verificar si el error es de cuenta no verificada
        const errorMessage = response.error || "";
        const errorDetails = response.errorDetails;
        
        // Obtener el mensaje completo del error (puede estar en errorMessage o errorDetails.message)
        const fullErrorMessage = (
          errorDetails?.message || 
          errorMessage || 
          ""
        ).toLowerCase();
        
        // Detectar si el error indica que la cuenta no está verificada
        const isUnverifiedAccount = 
          fullErrorMessage.includes("no ha sido verificada") ||
          fullErrorMessage.includes("no verificada") ||
          fullErrorMessage.includes("verifica tu email") ||
          fullErrorMessage.includes("revisa tu email") ||
          fullErrorMessage.includes("cuenta no verificada") ||
          fullErrorMessage.includes("email no verificado");

        if (isUnverifiedAccount) {
          // Retornar un objeto especial que indique que necesita verificación
          // El email ya está en credentials.email
          return {
            needsVerification: true,
            email: credentials.email.trim().toLowerCase(),
          };
        }

        // Verificar si el error contiene información sobre profesional pendiente
        if (errorDetails) {
          const errorData = errorDetails;
          if (errorData.profesional && (errorData.profesional.estado_aprobacion === "pendiente" || !errorData.profesional.usuario_verificado)) {
            const errorMsg = errorData.message || errorData.profesional.mensaje || 
              "Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando tu cuenta sea aprobada.";
            setError(errorMsg);
            return false;
          }
        }
        setError(errorMessage || "Login failed");
        return false;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de registro
  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(data);

      if (response.success) {
        // El registro fue exitoso, pero NO iniciamos sesión automáticamente
        // El usuario debe verificar el código primero
        // Retornamos el email para que la página pueda redirigir a verificación
        return { success: true, email: data.email };
      } else {
        setError(response.error || "Registration failed");
        return { success: false, email: null };
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, email: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de logout
  const logout = useCallback(async () => {
    try {
      // Intentar hacer logout en el servidor
      // Si el token no existe o ya fue invalidado, el servidor puede devolver un error
      // pero eso está bien, continuamos con el logout local de todas formas
      logger.debug("Iniciando logout", undefined, "useAuth");
      try {
        const response = await authService.logout();
        if (!response.success) {
          logger.warn("Logout en servidor falló, pero continuando con logout local", response.error, "useAuth");
        } else {
          logger.debug("Logout exitoso en servidor", undefined, "useAuth");
        }
      } catch (error) {
        logger.warn("Error durante logout en servidor (continuando con logout local)", error, "useAuth");
      }
    } catch (error) {
      logger.error("Error inesperado durante logout", error, "useAuth");
    } finally {
      // Siempre limpiar la sesión local, independientemente del resultado del servidor
      localStorage.removeItem("user");
      deleteCookie("auth-token");
      setUser(null);
      setError(null);
      window.dispatchEvent(new CustomEvent("userLogout"));
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para cambiar contraseña
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.changePassword(
          currentPassword,
          newPassword
        );

        if (response.success) {
          return true;
        } else {
          setError(response.error || "Password change failed");
          return false;
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    changePassword,
    isAuthenticated: !!user,
  };
};
