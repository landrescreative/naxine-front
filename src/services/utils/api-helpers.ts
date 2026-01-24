// src/services/utils/api-helpers.ts
import { ApiResponse, ApiError } from "../api/client";
import { ApiErrorResponse } from "../types/common";

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === "string";
};

export const isApiErrorResponse = (error: any): error is ApiErrorResponse => {
  return (
    error &&
    typeof error.error === "string" &&
    typeof error.statusCode === "number"
  );
};

export const extractErrorMessage = (error: any): string => {
  if (isApiErrorResponse(error)) {
    return error.message || error.error;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): T | null => {
  if (response.success && response.data) {
    onSuccess?.(response.data);
    return response.data;
  } else {
    const errorMessage = response.error || "An error occurred";
    onError?.(errorMessage);
    return null;
  }
};

export const createApiError = (
  message: string,
  status?: number,
  code?: string
): ApiError => ({
  message,
  status,
  code,
});

export const formatApiError = (error: any): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  if (isApiErrorResponse(error)) {
    return {
      message: error.message || error.error,
      status: error.statusCode,
    };
  }

  return createApiError(typeof error === "string" ? error : "Unknown error");
};

// Utilidades para fechas
export const formatDateForApi = (date: Date): string => {
  return date.toISOString();
};

export const parseApiDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Crea un objeto Date en UTC que representa una hora específica en España (Europe/Madrid).
 * 
 * IMPORTANTE: Esta función convierte correctamente una hora de España a UTC.
 * 
 * @param year - Año
 * @param month - Mes (0-11, donde 0 = enero)
 * @param day - Día del mes
 * @param hours - Hora en España (0-23)
 * @param minutes - Minutos (0-59)
 * @param seconds - Segundos (0-59, opcional, default 0)
 * @returns Date object en UTC que cuando se muestra con timeZone: "Europe/Madrid" muestra la hora especificada
 * 
 * @example
 * // Crear fecha para 12:00 PM del 27 de enero de 2026 en España
 * // Resultado: Date que cuando se muestra con timeZone: "Europe/Madrid" muestra 12:00
 * const date = createSpainLocalDateUTC(2026, 0, 27, 12, 0);
 */
export const createSpainLocalDateUTC = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number = 0
): Date => {
  // Crear una fecha de referencia en UTC para calcular el offset de España
  const fechaRefUTC = new Date(Date.UTC(year, month, day, 12, 0, 0));
  
  // Obtener qué hora es en España para esa fecha UTC de referencia
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(fechaRefUTC);
  const horaEspanaRef = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
  
  // Calcular offset: si España muestra 13:00 cuando UTC es 12:00, entonces offset = +1
  const offsetHoras = horaEspanaRef - 12;
  
  // Convertir hora España a UTC: restar el offset
  let horaUTC = hours - offsetHoras;
  let diaFinal = day;
  let mesFinal = month;
  let añoFinal = year;
  
  // Manejar desbordamientos de día
  if (horaUTC < 0) {
    horaUTC = 24 + horaUTC;
    diaFinal = day - 1;
    if (diaFinal < 1) {
      mesFinal = month - 1;
      if (mesFinal < 0) {
        mesFinal = 11;
        añoFinal = year - 1;
      }
      // Calcular días del mes anterior (simplificado)
      diaFinal = new Date(year, month, 0).getDate();
    }
  } else if (horaUTC >= 24) {
    horaUTC = horaUTC - 24;
    diaFinal = day + 1;
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    if (diaFinal > diasEnMes) {
      diaFinal = 1;
      mesFinal = month + 1;
      if (mesFinal > 11) {
        mesFinal = 0;
        añoFinal = year + 1;
      }
    }
  }
  
  // Crear fecha UTC final
  return new Date(Date.UTC(añoFinal, mesFinal, diaFinal, horaUTC, minutes, seconds));
};

/**
 * Convierte una fecha MySQL DATETIME (sin zona horaria) a un objeto Date
 * interpretándola como hora local de España (Europe/Madrid).
 * 
 * IMPORTANTE: Las fechas MySQL DATETIME vienen como hora local de España, NO como UTC.
 * Esta función las convierte correctamente a UTC considerando el offset de España.
 * 
 * @param mysqlDateTime - Fecha en formato MySQL: "2026-01-26 09:00:00" o ISO string
 * @returns Date object que representa correctamente la hora en España convertida a UTC
 * 
 * @example
 * // MySQL: "2026-01-26 09:00:00" (09:00 hora España)
 * // Resultado: Date que cuando se muestra con timeZone: "Europe/Madrid" muestra 09:00
 * const date = parseMySQLDateAsSpainLocal("2026-01-26 09:00:00");
 */
export const parseMySQLDateAsSpainLocal = (mysqlDateTime: string | Date): Date => {
  // Si ya es un Date, devolverlo tal cual (asumiendo que ya está correctamente convertido)
  if (mysqlDateTime instanceof Date) {
    return mysqlDateTime;
  }

  const dateStr = String(mysqlDateTime).trim();

  // Si ya tiene 'Z' o '+', es ISO con zona horaria, parsear directamente
  if (dateStr.includes("Z") || dateStr.includes("+") || dateStr.includes("-", 10)) {
    return new Date(dateStr);
  }

  // Si es formato MySQL DATETIME (YYYY-MM-DD HH:MM:SS), interpretarlo como hora local de España
  if (dateStr.includes(" ") && !dateStr.includes("T")) {
    // Formato: "2026-01-26 09:00:00" -> interpretar como 09:00 España y convertir a UTC
    const [datePart, timePart] = dateStr.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const timeParts = timePart.split(":").map(Number);
    const [hours, minutes, seconds = 0] = timeParts;
    
    // Crear una fecha de referencia en UTC para calcular el offset de España en esa fecha específica
    // Usamos mediodía (12:00) como referencia para evitar problemas con cambios de día
    const fechaReferenciaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const horaReferenciaEspana = fechaReferenciaUTC.toLocaleString("en-US", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [horaRefEspanaStr] = horaReferenciaEspana.split(":");
    const horaRefEspana = parseInt(horaRefEspanaStr);
    const offsetHoras = horaRefEspana - 12; // Offset en horas (ej: si España es UTC+1, offsetHoras = 1)
    
    // Convertir hora España a UTC restando el offset
    let horaUTC = hours - offsetHoras;
    let diaFinal = day;
    
    // Manejar desbordamientos de día
    if (horaUTC < 0) {
      horaUTC = 24 + horaUTC;
      diaFinal = day - 1;
    } else if (horaUTC >= 24) {
      horaUTC = horaUTC - 24;
      diaFinal = day + 1;
    }
    
    return new Date(Date.UTC(year, month - 1, diaFinal, horaUTC, minutes, seconds));
  }

  // Si tiene 'T' pero no 'Z' ni offset, podría ser ISO sin zona horaria
  // En este caso, asumimos que ya viene en UTC desde el backend
  if (dateStr.includes("T") && !dateStr.includes("Z") && !dateStr.includes("+")) {
    return new Date(dateStr + (dateStr.includes(".") ? "Z" : ".000Z"));
  }

  // Por defecto, intentar parsear como ISO
  return new Date(dateStr);
};

// Utilidades para paginación
export const createPaginationParams = (
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
) => ({
  page,
  limit,
  ...(sortBy && { sortBy, sortOrder }),
});

// Utilidades para filtros
export const createFilterParams = (filters: Record<string, any>) => {
  return Object.entries(filters)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Utilidades para URLs
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

// Utilidades para validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utilidades para formateo
export const formatCurrency = (
  amount: number,
  currency: string = "EUR"
): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  // Simple formateo para números españoles
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
};

// Utilidades para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utilidades para retry
export const retryApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResponse<T>> => {
  let lastError: string = "";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiCall();
      if (response.success) {
        return response;
      }
      lastError = response.error || "Unknown error";
    } catch (error) {
      lastError = extractErrorMessage(error);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
  };
};
