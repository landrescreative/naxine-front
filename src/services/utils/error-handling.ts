// src/services/utils/error-handling.ts
import { ApiError, ApiErrorResponse } from "../types/common";

export class ApiException extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const createApiException = (
  error: ApiError | ApiErrorResponse | string
): ApiException => {
  if (typeof error === "string") {
    return new ApiException(error);
  }

  if ("statusCode" in error) {
    return new ApiException(
      error.message || error.error,
      error.statusCode,
      undefined,
      error.validationErrors
        ? { validationErrors: error.validationErrors }
        : undefined
    );
  }

  return new ApiException(
    error.message,
    error.status,
    error.code,
    error.details
  );
};

export const handleApiError = (error: any): ApiException => {
  if (error instanceof ApiException) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiException(error.message);
  }

  if (typeof error === "string") {
    return new ApiException(error);
  }

  return new ApiException("An unexpected error occurred");
};

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError &&
    (error.message.includes("fetch") || error.message.includes("network"))
  );
};

export const isTimeoutError = (error: any): boolean => {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.includes("timeout"))
  );
};

export const isValidationError = (error: any): boolean => {
  return (
    error instanceof ApiException &&
    error.status === 400 &&
    error.details?.validationErrors
  );
};

export const isUnauthorizedError = (error: any): boolean => {
  return error instanceof ApiException && error.status === 401;
};

export const isForbiddenError = (error: any): boolean => {
  return error instanceof ApiException && error.status === 403;
};

export const isNotFoundError = (error: any): boolean => {
  return error instanceof ApiException && error.status === 404;
};

export const isServerError = (error: any): boolean => {
  return (
    error instanceof ApiException &&
    error.status !== undefined &&
    error.status >= 500
  );
};

export const getErrorMessage = (error: any): string => {
  const apiError = handleApiError(error);

  if (isNetworkError(error)) {
    return "Network connection error. Please check your internet connection.";
  }

  if (isTimeoutError(error)) {
    return "Request timeout. Please try again.";
  }

  if (isValidationError(apiError)) {
    const validationErrors = apiError.details?.validationErrors;
    if (validationErrors && Array.isArray(validationErrors)) {
      return validationErrors.map((err) => err.message).join(", ");
    }
    return "Validation error. Please check your input.";
  }

  if (isUnauthorizedError(apiError)) {
    return "You are not authorized to perform this action.";
  }

  if (isForbiddenError(apiError)) {
    return "Access denied. You don't have permission to perform this action.";
  }

  if (isNotFoundError(apiError)) {
    return "The requested resource was not found.";
  }

  if (isServerError(apiError)) {
    return "Server error. Please try again later.";
  }

  return apiError.message;
};

export const getErrorTitle = (error: any): string => {
  const apiError = handleApiError(error);

  if (isNetworkError(error)) {
    return "Connection Error";
  }

  if (isTimeoutError(error)) {
    return "Timeout Error";
  }

  if (isValidationError(apiError)) {
    return "Validation Error";
  }

  if (isUnauthorizedError(apiError)) {
    return "Unauthorized";
  }

  if (isForbiddenError(apiError)) {
    return "Access Denied";
  }

  if (isNotFoundError(apiError)) {
    return "Not Found";
  }

  if (isServerError(apiError)) {
    return "Server Error";
  }

  return "Error";
};

export const shouldRetry = (error: any): boolean => {
  return isNetworkError(error) || isTimeoutError(error) || isServerError(error);
};

export const getRetryDelay = (
  attempt: number,
  baseDelay: number = 1000
): number => {
  return baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
};

export const logError = (error: any, context?: string): void => {
  const apiError = handleApiError(error);

  console.error(`[API Error]${context ? ` ${context}:` : ""}`, {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    details: apiError.details,
    stack: apiError.stack,
  });
};

export const createErrorHandler = (context: string) => {
  return (error: any) => {
    logError(error, context);
    throw handleApiError(error);
  };
};
