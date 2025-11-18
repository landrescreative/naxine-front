// src/services/api/servicios.ts
import { apiClient, ApiResponse } from "./client";

export type ServicioApi = {
  id_servicio: number;
  id_especialidad: number;
  nombre_servicio: string;
  descripcion: string | null;
  nombre_especialidad?: string;
};

type GetServiciosResponse = {
  success: boolean;
  data?: {
    servicios: ServicioApi[];
  };
  message?: string;
  error?: string;
};

export async function getServicios(options?: {
  soloActivos?: boolean;
}): Promise<ApiResponse<ServicioApi[]>> {
  const soloActivos = options?.soloActivos ?? true;
  const res = await apiClient.get<GetServiciosResponse>("/servicios", {
    solo_activos: String(soloActivos),
  });

  if (!res.success) {
    return { success: false, error: res.error || "Error al obtener servicios" };
  }

  // El backend envuelve el payload como { data: { servicios: [...] } }
  const servicios = (res.data && (res.data as any).data?.servicios) || [];
  return { success: true, data: servicios };
}









