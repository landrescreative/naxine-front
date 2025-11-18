import { apiClient, ApiResponse } from "./client";

export interface SupportMessageRequest {
  asunto?: string;
  contenido: string;
}

export interface SupportMessage {
  id_mensaje: number;
  id_remitente: number;
  id_destinatario: number | null;
  asunto: string | null;
  contenido: string;
  leido: boolean;
  fecha_envio: string;
  created_at: string;
  updated_at: string;
}

export class MessagesService {
  /**
   * Enviar mensaje de soporte
   * POST /api/mensajes/soporte
   */
  async sendSupportMessage(
    data: SupportMessageRequest
  ): Promise<ApiResponse<{ mensaje: SupportMessage }>> {
    // Validar que contenido no esté vacío
    if (!data.contenido || !data.contenido.trim()) {
      return {
        success: false,
        error: "El contenido del mensaje es requerido",
      };
    }

    // Validar que contenido no supere 2000 caracteres
    if (data.contenido.length > 2000) {
      return {
        success: false,
        error: "El contenido no puede superar los 2000 caracteres",
      };
    }

    // Validar que asunto no supere 255 caracteres si está presente
    if (data.asunto && data.asunto.length > 255) {
      return {
        success: false,
        error: "El asunto no puede superar los 255 caracteres",
      };
    }

    return apiClient.post<{ mensaje: SupportMessage }>(
      "/mensajes/soporte",
      {
        asunto: data.asunto?.trim() || undefined,
        contenido: data.contenido.trim(),
      }
    );
  }
}

export const messagesService = new MessagesService();

