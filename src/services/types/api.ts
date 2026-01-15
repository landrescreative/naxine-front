// src/services/types/api.ts
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "client" | "professional" | "admin";
  createdAt: string;
  updatedAt: string;
}

// Formato de respuesta del backend real
export interface BackendUsuario {
  id_usuario: number;
  email: string;
  nombre: string;
  rol: "cliente" | "profesional" | "admin" | "administracion";
  is_verified: number;
  oauth_provider: string | null;
  oauth_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiAuthResponse {
  // Formato esperado por el frontend (después del mapeo)
  user: ApiUser;
  token: string;
  refreshToken?: string;
}

// Formato real que devuelve el backend
export interface BackendAuthResponse {
  usuario: BackendUsuario;
  token: string;
}

export interface ApiLoginRequest {
  email: string;
  password: string;
}

export interface ApiRegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: "client" | "professional";
}

export interface ApiAppointment {
  id: string;
  orderNumber: string;
  dateTime: string; // ISO string
  status: "confirmed" | "pending" | "cancelled" | "completed";
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
  };
  professional: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
    subtotal: number;
    taxes: number;
    total: number;
  };
  modality: "online" | "in-person" | "home-visit";
  tipo_atencion?: "presencial" | "en_linea" | "a_domicilio" | null; // Campo adicional para compatibilidad
  link_videollamada?: string | null; // Link de Google Meet si es en línea
  plataforma?: string | null; // Plataforma de videollamada (ej: "Google Meet")
  direccion_consultorio?: string | null; // Dirección del consultorio si es presencial
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCreateAppointmentRequest {
  professionalId: string;
  productId: string;
  dateTime: string;
  modality: "online" | "in-person";
  notes?: string;
  payment: {
    method: string;
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
  };
}

export interface ApiUpdateAppointmentRequest {
  status?: "confirmed" | "pending" | "cancelled" | "completed";
  dateTime?: string;
  notes?: string;
}

export interface ProfessionalPrice {
  id_precio: number;
  nombre_servicio: string;
  descripcion: string;
  precio: number;
  moneda: string;
  duracion?: string;
  modalidad?: string;
}

export interface ApiProfessional {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  postalCode: string;
  specialty: string;
  licenseNumber: string;
  experience: number;
  rating: number;
  totalSessions: number;
  incomeUsd: number;
  status: "activo" | "inactivo" | "pendiente" | "suspendido";
  joinDate: string;
  lastActive: string;
  profileImage?: string;
  bio: string;
  education: string[];
  certifications: string[];
  languages: string[];
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  } | {
    dias?: string[];
    horario?: {
      desde: string;
      hasta: string;
    };
  } | any;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales del perfil público
  videoUrl?: string;
  tarifaPorHora?: number;
  verificado?: boolean;
  direccion?: string;
  domicilio_consultorio?: string; // Dirección del consultorio del profesional
  modalidadCita?: string[];
  modoAtencion?: string[];
  codigosPostalesDomicilio?: string;
  precios?: ProfessionalPrice[];
  modalidadesSesiones?: string[];
  // Datos originales del backend para acceso directo
  disponibilidadRaw?: {
    dias?: string[];
    horario?: {
      desde: string;
      hasta: string;
    };
  };
  // Objeto raw completo del backend para acceso a campos no mapeados
  raw?: any;
}

export interface ApiClient {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  postalCode: string;
  customerNumber: string;
  incomeUsd: number;
  status: "Activo" | "Inactivo";
  createdAt: string;
  lastLogin: string;
  totalSessions: number;
  totalSpent: number;
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  id: string;
  categoryId: string;
  name: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  description: string;
  keywords: string[];
  backgroundImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategoryWithServices extends ApiCategory {
  services: ApiService[];
  professionals: ApiProfessional[];
}

export interface ApiPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiFilterParams {
  search?: string;
  status?: string;
  specialty?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}
