// src/hooks/index.ts
// Exportar todos los hooks personalizados

export { useAuth } from "./useAuth";
export { useAppointments } from "./useAppointments";
export { useProfessionals } from "./useProfessionals";
export { useCategories } from "./useCategories";
export { useUsers } from "./useUsers";
export { useTickets } from "./useTickets";
export { usePublicSpecialties } from "./usePublicSpecialties";
export type { NavbarServiceCategory } from "./usePublicSpecialties";

// Re-exportar tipos útiles
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "@/services/types/auth";
export type { ApiAppointment } from "@/services/types/api";
export type { AdminProfessional } from "@/data/adminProfessionals";
export type { CategoryData } from "@/data/categories";
export type { AdminClient } from "@/data/adminClients";
