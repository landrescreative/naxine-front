// src/lib/api.ts
// Este archivo se mantiene para compatibilidad hacia atrás
// Se recomienda usar los servicios de src/services/ en su lugar

import {
  apiClient,
  testApiConnection as newTestApiConnection,
} from "@/services";

// NEXT_PUBLIC_API_URL ya incluye /api al final
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Función de compatibilidad hacia atrás
export const testApiConnection = async () => {
  try {
      const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Función de compatibilidad hacia atrás
export const createUserDirect = async (userData: any) => {
  try {
      const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorData}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Re-exportar la nueva función de prueba de conexión
export { newTestApiConnection as testApiConnectionV2 };
