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
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
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
