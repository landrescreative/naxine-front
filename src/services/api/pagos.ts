// src/services/api/pagos.ts
// Servicio para obtener pagos del cliente
import { apiClient, ApiResponse } from "./client";

export interface Pago {
  id_pago: number;
  id_cita: number;
  id_cliente: number;
  id_profesional: number;
  monto: string | number;
  metodo_pago: string;
  estado: "pendiente" | "completado" | "pagado" | "fallido" | "reembolsado";
  fecha_pago: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Campos de JOIN con citas y profesionales
  fecha_inicio?: string;
  fecha_fin?: string;
  estado_cita?: string;
  tipo_atencion?: "presencial" | "en_linea" | "a_domicilio";
  profesional_nombre?: string;
  profesional_apellidos?: string;
  profesional_especialidad?: string;
  stripe_payment_intent_id?: string;
  estado_stripe?: string;
  // URLs de facturas
  url_comprobante_pago?: string | null;
  url_factura_fiscal?: string | null;
}

export interface PagosClienteResponse {
  pagos: Pago[];
  id_cliente: string | number;
  paginacion: {
    limit: number;
    offset: number;
    total: number;
    total_filtrado?: number;
  };
}

export interface PagosProfesionalResponse {
  pagos: Pago[];
  id_profesional: string | number;
  paginacion: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface PagosResponse {
  pagos: Pago[];
  paginacion: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface EstadisticasPagosResponse {
  estadisticas: {
    total_pagos?: number;
    pagos_completados?: number;
    pagos_pendientes?: number;
    pagos_fallidos?: number;
    pagos_reembolsados?: number;
    monto_total?: number;
    monto_pendiente?: number;
    total_ventas?: number;
    total_comisiones?: number;
    balance_general?: number;
    balance_stripe?: number;
    balance_total?: number;
  };
  filtros?: {
    id_profesional?: string | number;
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

export class PagosService {
  /**
   * Obtiene todos los pagos (para admin)
   * Endpoint: GET /api/pagos
   * Requiere autenticación
   */
  async getAllPagos(params?: {
    limit?: number;
    offset?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ApiResponse<PagosResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.estado) queryParams.append("estado", params.estado);
    if (params?.fecha_desde) queryParams.append("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) queryParams.append("fecha_hasta", params.fecha_hasta);
    
    const queryString = queryParams.toString();
    const endpoint = `/pagos${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<PagosResponse>(endpoint);
  }

  /**
   * Obtiene estadísticas de pagos
   * Endpoint: GET /api/pagos/estadisticas
   * Requiere autenticación
   */
  async getEstadisticasPagos(params?: {
    id_profesional?: number | string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<ApiResponse<EstadisticasPagosResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.id_profesional) queryParams.append("id_profesional", params.id_profesional.toString());
    if (params?.fecha_inicio) queryParams.append("fecha_inicio", params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append("fecha_fin", params.fecha_fin);
    
    const queryString = queryParams.toString();
    const endpoint = `/pagos/estadisticas${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<EstadisticasPagosResponse>(endpoint);
  }

  /**
   * Obtiene los pagos del cliente autenticado
   * Endpoint: GET /api/pagos/mis-pagos
   * Requiere autenticación
   */
  async getMisPagos(params?: {
    limit?: number;
    offset?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<ApiResponse<PagosClienteResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.estado) queryParams.append("estado", params.estado);
    if (params?.fecha_desde) queryParams.append("fecha_desde", params.fecha_desde);
    if (params?.fecha_hasta) queryParams.append("fecha_hasta", params.fecha_hasta);
    
    const queryString = queryParams.toString();
    const endpoint = `/pagos/mis-pagos${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<PagosClienteResponse>(endpoint);
  }

  /**
   * Obtiene los pagos de un profesional
   * Endpoint: GET /api/pagos/profesional/:id_profesional
   */
  async getPagosProfesional(
    profesionalId: number | string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<PagosProfesionalResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/pagos/profesional/${profesionalId}${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<PagosProfesionalResponse>(endpoint);
  }

  /**
   * Obtiene un pago por ID
   * Endpoint: GET /api/pagos/:id
   */
  async getPagoPorId(pagoId: number | string): Promise<ApiResponse<Pago>> {
    return apiClient.get<Pago>(`/pagos/${pagoId}`);
  }

  /**
   * Cambia el estado de un pago (para reembolsos)
   * Endpoint: PUT /api/pagos/:id/estado
   */
  async cambiarEstadoPago(
    pagoId: number | string,
    estado: "pendiente" | "completado" | "pagado" | "fallido" | "reembolsado"
  ): Promise<ApiResponse<{ pago: Pago }>> {
    return apiClient.put<{ pago: Pago }>(`/pagos/${pagoId}/estado`, { estado });
  }

  /**
   * Procesa un reembolso de un pago a través de Stripe
   * Endpoint: POST /api/pagos/:id/reembolso
   */
  async procesarReembolso(
    pagoId: number | string,
    opciones?: {
      cancelar_cita?: boolean;
      motivo?: string;
    }
  ): Promise<ApiResponse<{ pago: Pago; refund: { id: string; amount: number; currency: string; status: string; reason: string } }>> {
    return apiClient.post<{ pago: Pago; refund: { id: string; amount: number; currency: string; status: string; reason: string } }>(
      `/pagos/${pagoId}/reembolso`,
      {
        cancelar_cita: opciones?.cancelar_cita !== false, // Por defecto true
        motivo: opciones?.motivo || 'Reembolso solicitado por administrador'
      }
    );
  }

  /**
   * Obtiene el balance de Naxine de un profesional
   * Endpoint: GET /api/pagos/profesional/:id_profesional/balance
   */
  async getBalanceProfesional(
    profesionalId: number | string
  ): Promise<ApiResponse<{ balance: { balance_actual: number; total_ventas: number; total_comisiones: number }; id_profesional: number | string }>> {
    return apiClient.get<{ balance: { balance_actual: number; total_ventas: number; total_comisiones: number }; id_profesional: number | string }>(
      `/pagos/profesional/${profesionalId}/balance`
    );
  }

  /**
   * Sube una factura fiscal del profesional
   * Endpoint: POST /api/pagos/:id/factura-fiscal
   * Requiere autenticación y rol de profesional
   */
  async subirFacturaFiscal(
    pagoId: number | string,
    file: File
  ): Promise<ApiResponse<{ pago: { id_pago: number; url_factura_fiscal: string } }>> {
    const formData = new FormData();
    formData.append("factura", file);

    // NO establecer Content-Type manualmente - el navegador lo hará automáticamente con el boundary correcto
    return apiClient.post<{ pago: { id_pago: number; url_factura_fiscal: string } }>(
      `/pagos/${pagoId}/factura-fiscal`,
      formData
      // Sin headers personalizados - dejar que el navegador establezca Content-Type con boundary
    );
  }

  /**
   * Obtiene una URL firmada para visualizar la factura fiscal
   * Endpoint: GET /api/pagos/:id/factura-fiscal/url
   * Requiere autenticación (profesional o cliente asociado al pago)
   */
  async obtenerUrlFacturaFirmada(
    pagoId: number | string
  ): Promise<ApiResponse<{ url: string; expiresIn: number }>> {
    return apiClient.get<{ url: string; expiresIn: number }>(
      `/pagos/${pagoId}/factura-fiscal/url`
    );
  }

  /**
   * Descarga el comprobante de Naxine a través del backend (proxy, evita CORS)
   * Endpoint: GET /api/pagos/:id/comprobante-naxine/descargar
   * Requiere autenticación (profesional o cliente asociado al pago)
   * Retorna el archivo directamente como blob
   */
  async descargarComprobanteNaxine(
    pagoId: number | string
  ): Promise<Blob> {
    // Obtener el token de la misma manera que apiClient
    const getAuthToken = (): string | null => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const token = user.token || null;
            if (process.env.NODE_ENV === 'development') {
              console.log('[PagosService] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
            }
            return token;
          } catch (error) {
            console.error('[PagosService] Error parsing user data:', error);
            return null;
          }
        }
      }
      return null;
    };

    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
    }

    // NEXT_PUBLIC_API_URL ya incluye /api al final
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/pagos/${pagoId}/comprobante-naxine/descargar`;
    
    console.log('[PagosService] Descargando comprobante de Naxine:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('[PagosService] Error del servidor:', errorData);
      } catch (e) {
        try {
          const errorText = await response.text();
          console.error('[PagosService] Error del servidor (texto):', errorText);
        } catch (e2) {
        }
      }
      throw new Error(`Error al descargar comprobante: ${errorMessage}`);
    }

    return await response.blob();
  }

  /**
   * Descarga la factura fiscal a través del backend (proxy, evita CORS)
   * Endpoint: GET /api/pagos/:id/factura-fiscal/descargar
   * Requiere autenticación (profesional o cliente asociado al pago)
   * Retorna el archivo directamente como blob
   */
  async descargarFacturaFiscal(
    pagoId: number | string
  ): Promise<Blob> {
    // Obtener el token de la misma manera que apiClient
    const getAuthToken = (): string | null => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const token = user.token || null;
            if (process.env.NODE_ENV === 'development') {
              console.log('[PagosService] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
            }
            return token;
          } catch (error) {
            console.error('[PagosService] Error parsing user data:', error);
            return null;
          }
        }
      }
      return null;
    };

    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
    }

    // NEXT_PUBLIC_API_URL ya incluye /api al final
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = `${baseUrl}/pagos/${pagoId}/factura-fiscal/descargar`;
    
    console.log('[PagosService] Descargando factura fiscal:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Intentar obtener el mensaje de error del cuerpo de la respuesta
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('[PagosService] Error del servidor:', errorData);
      } catch (e) {
        // Si no se puede parsear como JSON, usar el texto
        try {
          const errorText = await response.text();
          console.error('[PagosService] Error del servidor (texto):', errorText);
        } catch (e2) {
          // Ignorar errores al leer el cuerpo
        }
      }
      throw new Error(`Error al descargar factura: ${errorMessage}`);
    }

    return await response.blob();
  }
}

export const pagosService = new PagosService();

