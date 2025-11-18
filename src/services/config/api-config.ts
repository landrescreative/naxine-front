// src/services/config/api-config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000"),

  // Configuración de paginación
  DEFAULT_PAGE_SIZE: parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || "10"
  ),
  MAX_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || "100"),

  // Configuración de caché
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || "300000"), // 5 minutos
  ENABLE_CACHE: process.env.NEXT_PUBLIC_ENABLE_CACHE === "true",

  // Configuración de logging
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
  ENABLE_CONSOLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === "true",

  // Configuración de reintentos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/usuarios/login",
      REGISTER: "/usuarios/registro",
      LOGOUT: "/usuarios/cerrar-sesion",
      REFRESH: "/usuarios/refresh",
      VERIFY: "/usuarios/perfil",
      VERIFY_CODE: "/usuarios/verificar-codigo",
      FORGOT_PASSWORD: "/usuarios/forgot-password",
      RESET_PASSWORD: "/usuarios/reset-password",
      CHANGE_PASSWORD: "/usuarios/cambiar-password",
      VERIFY_EMAIL: "/usuarios/verify-email",
      RESEND_VERIFICATION: "/usuarios/resend-verification",
      PROFILE: "/usuarios/perfil",
    },
    USERS: {
      BASE: "/users",
      ME: "/users/me",
      CLIENTS: "/users/clients",
      PROFESSIONALS: "/users/professionals",
      CHANGE_PASSWORD: "/users/me/change-password",
      PROFILE_IMAGE: "/users/me/profile-image",
    },
    APPOINTMENTS: {
      BASE: "/appointments",
      UPCOMING: "/appointments/upcoming",
      BY_DATE: "/appointments/date",
      BY_STATUS: "/appointments/status",
      STATS: "/appointments/stats",
      AVAILABLE_SLOTS: "/appointments/available-slots",
      MY: "/appointments/my",
      CLIENT: "/appointments/client",
      PROFESSIONAL: "/appointments/professional",
    },
    PROFESSIONALS: {
      BASE: "/professionals",
      ME: "/professionals/me",
      BY_SPECIALTY: "/professionals/specialty",
      BY_CITY: "/professionals/city",
      BY_STATUS: "/professionals/status",
      SEARCH: "/professionals/search",
      STATS: "/professionals/stats",
      AVAILABILITY: "/professionals/availability",
      PROFILE_IMAGE: "/professionals/me/profile-image",
    },
    CATEGORIES: {
      BASE: "/categories",
      WITH_SERVICES: "/categories/with-services",
      POPULAR: "/categories/popular",
      STATS: "/categories/stats",
      BY_SLUG: "/categories/slug",
    },
    SERVICES: {
      BASE: "/services",
      BY_CATEGORY: "/services/category",
      BY_SLUG: "/services/slug",
      FEATURED: "/services/featured",
      STATS: "/services/stats",
    },
    SEARCH: {
      ALL: "/search",
      CATEGORIES: "/categories/search",
      SERVICES: "/services/search",
    },
    HEALTH: "/health",
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getEndpoint = (path: string): string => {
  const keys = path.split(".");
  let endpoint = API_CONFIG.ENDPOINTS as any;

  for (const key of keys) {
    endpoint = endpoint[key];
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${path}`);
    }
  }

  return endpoint;
};

export const createApiUrl = (path: string, ...params: string[]): string => {
  const endpoint = getEndpoint(path);
  const fullPath = params.reduce((acc, param) => `${acc}/${param}`, endpoint);
  return getApiUrl(fullPath);
};
