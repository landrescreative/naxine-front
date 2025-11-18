// src/services/index.ts
// Cliente API base
export { apiClient, testApiConnection, handleApiError } from "./api/client";

// Servicios de API
export { authService } from "./api/auth";
export { appointmentsService } from "./api/appointments";
export { citasService } from "./api/citas";
export { pagosService } from "./api/pagos";
export { usersService } from "./api/users";
export { professionalsService } from "./api/professionals";
export { calendarsService } from "./api/calendars";
export { categoriesService } from "./api/categories";
export { specialtiesService } from "./api/specialties";
export { messagesService } from "./api/messages";
export { ticketsService } from "./api/tickets";
export { disponibilidadService } from "./api/disponibilidad";

// Tipos
export * from "./types/api";
export * from "./types/auth";
export * from "./types/common";

// Utilidades
export * from "./utils/api-helpers";
export * from "./utils/error-handling";

// Configuración
export {
  API_CONFIG,
  getApiUrl,
  getEndpoint,
  createApiUrl,
} from "./config/api-config";

// Re-exportar tipos principales para conveniencia
export type { ApiResponse, ApiError } from "./api/client";
export type {
  ApiUser,
  ApiAuthResponse,
  ApiAppointment,
  ApiProfessional,
  ProfessionalPrice,
  ApiClient,
  ApiCategory,
  ApiService,
} from "./types/api";
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "./types/auth";
