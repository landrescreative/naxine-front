import { useState, useEffect, useCallback } from "react";
import { professionalsService } from "@/services";
import { AdminProfessional } from "@/data/adminProfessionals";

interface UseProfessionalsOptions {
  page?: number;
  limit?: number;
  specialty?: string;
  search?: string;
  autoLoad?: boolean;
}

export const useProfessionals = (options: UseProfessionalsOptions = {}) => {
  const { page = 1, limit = 10, specialty, search, autoLoad = true } = options;

  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    inactive: 0,
    specialties: [] as string[],
  });

  const loadProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit };
      if (specialty) params.specialty = specialty;

      const response = await professionalsService.getProfessionals(params);

      if (response.success && response.data) {
        setProfessionals(response.data.data);
      } else {
        setError(response.error || "Error al cargar profesionales");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading professionals:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, specialty]);

  const searchProfessionals = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await professionalsService.searchProfessionals(query, {
          page,
          limit,
        });

        if (response.success && response.data) {
          setProfessionals(response.data.data);
        } else {
          setError(response.error || "Error en la búsqueda");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error searching professionals:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await professionalsService.getProfessionalStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const getProfessionalsBySpecialty = useCallback(
    async (specialtyName: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await professionalsService.getProfessionalsBySpecialty(
          specialtyName
        );

        if (response.success && response.data) {
          setProfessionals(response.data.data);
        } else {
          setError(
            response.error || "Error al cargar profesionales por especialidad"
          );
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error loading professionals by specialty:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProfessionalAvailability = useCallback(
    async (professionalId: string, date?: string) => {
      try {
        const response = await professionalsService.getAvailability(
          professionalId
        );
        return response;
      } catch (err) {
        console.error("Error getting availability:", err);
        return { success: false, error: "Error al obtener disponibilidad" };
      }
    },
    []
  );

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadProfessionals();
      loadStats();
    }
  }, [loadProfessionals, loadStats, autoLoad]);

  // Búsqueda automática cuando cambia el parámetro search
  useEffect(() => {
    if (search && search.trim()) {
      searchProfessionals(search);
    } else if (search === "") {
      loadProfessionals(); // Recargar todos si se limpia la búsqueda
    }
  }, [search, searchProfessionals, loadProfessionals]);

  return {
    professionals,
    stats,
    loading,
    error,
    loadProfessionals,
    searchProfessionals,
    loadStats,
    getProfessionalsBySpecialty,
    getProfessionalAvailability,
    clearError: () => setError(null),
  };
};
