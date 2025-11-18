import { useState, useEffect, useCallback } from "react";
import { usersService } from "@/services";
import { AdminClient } from "@/data/adminClients";

interface UseUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  autoLoad?: boolean;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { page = 1, limit = 10, search, status, autoLoad = true } = options;

  const [users, setUsers] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    inactive: 0,
    totalSpent: 0,
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit };
      if (status) params.status = status;

      const response = await usersService.getClients(params);

      if (response.success && response.data) {
        setUsers(response.data.data);
      } else {
        setError(response.error || "Error al cargar usuarios");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  const searchUsers = useCallback(
    async (query: string) => {
      try {
        setLoading(true);
        setError(null);

        const params: any = { page, limit, search: query };
        if (status) params.status = status;

        const response = await usersService.getClients(params);

        if (response.success && response.data) {
          setUsers(response.data.data);
        } else {
          setError(response.error || "Error en la búsqueda");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error searching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, status]
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await usersService.getClientStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  const getUserById = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersService.getClientById(userId);

      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || "Error al cargar usuario");
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = "Error de conexión";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (userId: string, updateData: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await usersService.updateClient(userId, updateData);

        if (response.success) {
          await loadUsers(); // Recargar la lista
          await loadStats(); // Actualizar estadísticas
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al actualizar usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, loadStats]
  );

  const deactivateUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await usersService.deactivateUser(userId);

        if (response.success) {
          await loadUsers(); // Recargar la lista
          await loadStats(); // Actualizar estadísticas
          return { success: true };
        } else {
          setError(response.error || "Error al desactivar usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al desactivar usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, loadStats]
  );

  const activateUser = useCallback(
    async (userId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await usersService.activateUser(userId);

        if (response.success) {
          await loadUsers(); // Recargar la lista
          await loadStats(); // Actualizar estadísticas
          return { success: true };
        } else {
          setError(response.error || "Error al activar usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error al activar usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadUsers, loadStats]
  );

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    if (autoLoad) {
      loadUsers();
      loadStats();
    }
  }, [loadUsers, loadStats, autoLoad]);

  // Búsqueda automática cuando cambia el parámetro search
  useEffect(() => {
    if (search && search.trim()) {
      searchUsers(search);
    } else if (search === "") {
      loadUsers(); // Recargar todos si se limpia la búsqueda
    }
  }, [search, searchUsers, loadUsers]);

  return {
    users,
    stats,
    loading,
    error,
    loadUsers,
    searchUsers,
    loadStats,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    clearError: () => setError(null),
  };
};
