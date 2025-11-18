import { useState, useEffect, useCallback } from "react";
import { appointmentsService } from "@/services";
import { ApiAppointment } from "@/services/types/api";

interface UseAppointmentsOptions {
  page?: number;
  limit?: number;
  status?: string;
  professionalId?: string;
  autoLoad?: boolean;
}

export const useAppointments = (options: UseAppointmentsOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    professionalId,
    autoLoad = true,
  } = options;

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  });

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit };
      if (status) params.status = status;
      if (professionalId) params.professionalId = professionalId;

      const response = await appointmentsService.getAppointments(params);

      if (response.success && response.data) {
        setAppointments(response.data.data);
      } else {
        setError(response.error || "Error al cargar citas");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, professionalId]);

  const loadStats = useCallback(async () => {
    try {
      const response = await appointmentsService.getAppointmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const createAppointment = useCallback(
    async (appointmentData: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await appointmentsService.createAppointment(
          appointmentData
        );

        if (response.success) {
          await loadAppointments(); // Recargar la lista
          await loadStats(); // Actualizar estadísticas
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear cita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al crear cita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments, loadStats]
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await appointmentsService.cancelAppointment(
          appointmentId
        );

        if (response.success) {
          await loadAppointments(); // Recargar la lista
          await loadStats(); // Actualizar estadísticas
          return { success: true };
        } else {
          setError(response.error || "Error al cancelar cita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al cancelar cita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments, loadStats]
  );

  const updateAppointment = useCallback(
    async (appointmentId: string, updateData: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await appointmentsService.updateAppointment(
          appointmentId,
          updateData
        );

        if (response.success) {
          await loadAppointments(); // Recargar la lista
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar cita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al actualizar cita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadAppointments]
  );

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadAppointments();
      loadStats();
    }
  }, [loadAppointments, loadStats, autoLoad]);

  return {
    appointments,
    stats,
    loading,
    error,
    loadAppointments,
    loadStats,
    createAppointment,
    cancelAppointment,
    updateAppointment,
    clearError: () => setError(null),
  };
};
