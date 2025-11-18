import { useState, useEffect, useCallback } from "react";
import { ticketsService, Ticket, TicketStatus, TicketStatistics } from "@/services/api/tickets";
import { handleApiError, getErrorMessage } from "@/services/utils/error-handling";

interface UseTicketsOptions {
  estado?: TicketStatus;
  id_usuario?: number;
  limit?: number;
  offset?: number;
  autoLoad?: boolean;
}

export const useTickets = (options: UseTicketsOptions = {}) => {
  const {
    estado,
    id_usuario,
    limit = 15,
    offset = 0,
    autoLoad = true,
  } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState<TicketStatistics | null>(null);
  const [currentOffset, setCurrentOffset] = useState(offset);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        limit,
        offset: currentOffset,
      };
      if (estado) params.estado = estado;
      if (id_usuario) params.id_usuario = id_usuario;

      const response = await ticketsService.getTickets(params);

      if (response.success && response.data) {
        // El backend devuelve: { success: true, data: { tickets: [...], total: ... } }
        // Y el apiClient lo envuelve en: { success: true, data: { success: true, data: {...} } }
        // Entonces necesitamos acceder a response.data.data o response.data dependiendo del caso
        
        let ticketsData: Ticket[] = [];
        let totalCount = 0;

        // Acceder directamente a response.data
        const actualData = response.data;

        if (actualData.tickets && Array.isArray(actualData.tickets)) {
          // Si tiene estructura { tickets: [...], total: ... }
          // Mapear los tickets del formato del backend al formato del frontend
          ticketsData = actualData.tickets.map((ticket: any) => {
            // El backend ahora siempre envía rol_usuario en cada ticket
            // Priorizar rol_usuario ya que es el campo que el backend envía directamente
            let userRole = ticket.rol_usuario || ticket.usuario?.rol || ticket.rol || 'cliente';
            
            // Normalizar el rol (asegurar formato consistente)
            if (userRole === 'profesional' || userRole === 'professional') {
              userRole = 'profesional';
            } else if (userRole === 'cliente' || userRole === 'client') {
              userRole = 'cliente';
            } else if (userRole === 'admin' || userRole === 'administracion') {
              userRole = 'admin';
            }

            return {
              id_ticket: ticket.id_ticket,
              id_usuario: ticket.id_usuario,
              asunto: ticket.asunto,
              mensaje: ticket.mensaje,
              telefono: ticket.telefono,
              correo: ticket.correo_electronico || ticket.correo,
              estado: ticket.estado,
              fecha_creacion: ticket.fecha_creacion,
              fecha_actualizacion: ticket.fecha_actualizacion || ticket.fecha_creacion,
              usuario: ticket.usuario || (ticket.nombre_usuario || ticket.email_usuario ? {
                id_usuario: ticket.id_usuario,
                nombre: ticket.nombre_usuario || 'Usuario desconocido',
                email: ticket.email_usuario || ticket.correo_electronico || '',
                telefono: ticket.telefono,
                rol: userRole,
              } : undefined),
            };
          });
          // El total puede venir como string desde el backend
          totalCount = typeof actualData.total === 'string' 
            ? parseInt(actualData.total, 10) 
            : (actualData.total || actualData.tickets.length);
        } else {
          console.warn("[useTickets] Formato de respuesta desconocido:", response.data);
          ticketsData = [];
          totalCount = 0;
        }

        setTickets(ticketsData);
        setTotal(totalCount);
      } else {
        setError(response.error || "Error al cargar tickets");
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [estado, id_usuario, limit, currentOffset]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await ticketsService.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  }, []);

  const getTicketById = useCallback(async (ticketId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ticketsService.getTicketById(ticketId);

      if (response.success && response.data) {
        // Acceder directamente a response.data
        const actualData = response.data as any;
        
        // El backend ahora siempre envía rol_usuario
        let userRole = actualData.rol_usuario || actualData.usuario?.rol || actualData.rol || 'cliente';
        
        // Normalizar el rol
        if (userRole === 'profesional' || userRole === 'professional') {
          userRole = 'profesional';
        } else if (userRole === 'cliente' || userRole === 'client') {
          userRole = 'cliente';
        } else if (userRole === 'admin' || userRole === 'administracion') {
          userRole = 'admin';
        }
        
        // Mapear el ticket del formato del backend al formato del frontend
        const ticket: Ticket = {
          id_ticket: actualData.id_ticket,
          id_usuario: actualData.id_usuario,
          asunto: actualData.asunto,
          mensaje: actualData.mensaje,
          telefono: actualData.telefono,
          correo: actualData.correo_electronico || actualData.correo,
          estado: actualData.estado,
          fecha_creacion: actualData.fecha_creacion,
          fecha_actualizacion: actualData.fecha_actualizacion || actualData.fecha_creacion,
          usuario: actualData.usuario || (actualData.nombre_usuario || actualData.email_usuario ? {
            id_usuario: actualData.id_usuario,
            nombre: actualData.nombre_usuario || 'Usuario desconocido',
            email: actualData.email_usuario || actualData.correo_electronico || '',
            telefono: actualData.telefono,
            rol: userRole,
          } : undefined),
        };

        return { success: true, data: ticket };
      } else {
        setError(response.error || "Error al cargar ticket");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicketStatus = useCallback(
    async (ticketId: number, newStatus: TicketStatus) => {
      try {
        setLoading(true);
        setError(null);

        const response = await ticketsService.updateTicket(ticketId, {
          estado: newStatus,
        });

        if (response.success && response.data) {
          // Acceder directamente a response.data
          const actualData = response.data as any;
          
          // El backend ahora siempre envía rol_usuario
          let userRole = actualData.rol_usuario || actualData.usuario?.rol || actualData.rol || 'cliente';
          
          // Normalizar el rol
          if (userRole === 'profesional' || userRole === 'professional') {
            userRole = 'profesional';
          } else if (userRole === 'cliente' || userRole === 'client') {
            userRole = 'cliente';
          } else if (userRole === 'admin' || userRole === 'administracion') {
            userRole = 'admin';
          }
          
          // Mapear el ticket del formato del backend al formato del frontend
          const updatedTicket: Ticket = {
            id_ticket: actualData.id_ticket,
            id_usuario: actualData.id_usuario,
            asunto: actualData.asunto,
            mensaje: actualData.mensaje,
            telefono: actualData.telefono,
            correo: actualData.correo_electronico || actualData.correo,
            estado: actualData.estado || newStatus,
            fecha_creacion: actualData.fecha_creacion,
            fecha_actualizacion: actualData.fecha_actualizacion || actualData.fecha_creacion,
            usuario: actualData.usuario || (actualData.nombre_usuario || actualData.email_usuario ? {
              id_usuario: actualData.id_usuario,
              nombre: actualData.nombre_usuario || 'Usuario desconocido',
              email: actualData.email_usuario || actualData.correo_electronico || '',
              telefono: actualData.telefono,
              rol: userRole,
            } : undefined),
          };

          // Actualizar el ticket en la lista local
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id_ticket === ticketId
                ? updatedTicket
                : ticket
            )
          );
          // Recargar estadísticas si están disponibles
          if (statistics) {
            await loadStatistics();
          }
          return { success: true, data: updatedTicket };
        } else {
          setError(response.error || "Error al actualizar ticket");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [statistics, loadStatistics]
  );

  const refreshTickets = useCallback(() => {
    loadTickets();
    loadStatistics();
  }, [loadTickets, loadStatistics]);

  const goToPage = useCallback((newOffset: number) => {
    setCurrentOffset(newOffset);
  }, []);

  const nextPage = useCallback(() => {
    if (currentOffset + limit < total) {
      setCurrentOffset((prev) => prev + limit);
    }
  }, [currentOffset, limit, total]);

  const prevPage = useCallback(() => {
    if (currentOffset >= limit) {
      setCurrentOffset((prev) => Math.max(0, prev - limit));
    }
  }, [currentOffset, limit]);

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadTickets();
      loadStatistics();
    }
  }, [loadTickets, loadStatistics, autoLoad]);

  // Recargar cuando cambian los filtros o la paginación
  useEffect(() => {
    if (autoLoad) {
      loadTickets();
    }
  }, [estado, id_usuario, currentOffset, limit]);

  return {
    tickets,
    statistics,
    loading,
    error,
    total,
    currentOffset,
    limit,
    loadTickets,
    loadStatistics,
    getTicketById,
    updateTicketStatus,
    refreshTickets,
    goToPage,
    nextPage,
    prevPage,
    clearError: () => setError(null),
  };
};

