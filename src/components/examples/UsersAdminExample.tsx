// src/components/examples/UsersAdminExample.tsx
"use client";

import { useState, useEffect } from "react";
import { usersService } from "@/services";
import { ApiClient } from "@/services/types/api";
import { formatCurrency } from "@/services/utils/api-helpers";

export const UsersAdminExample = () => {
  const [users, setUsers] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Activo" | "Inactivo" | "">(
    ""
  );
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    averageSessionsPerClient: 0,
  });

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: 1,
        limit: 20,
      };

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (statusFilter) {
        filters.status = statusFilter;
      }

      const response = await usersService.getClients(filters);

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
  };

  const loadStats = async () => {
    try {
      const response = await usersService.getClientStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleStatusChange = (status: "Activo" | "Inactivo" | "") => {
    setStatusFilter(status);
    // Recargar usuarios con el nuevo filtro
    setTimeout(() => loadUsers(), 100);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      let response;

      if (currentStatus === "Activo") {
        response = await usersService.deactivateUser(userId);
      } else {
        response = await usersService.activateUser(userId);
      }

      if (response.success) {
        // Recargar usuarios y estadísticas
        await loadUsers();
        await loadStats();
        alert(
          `Usuario ${
            currentStatus === "Activo" ? "desactivado" : "activado"
          } exitosamente`
        );
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert("Error al cambiar estado del usuario");
      console.error("Error toggling user status:", err);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    loadUsers();
  };

  const getStatusColor = (status: string) => {
    return status === "Activo"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Administración de Usuarios</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total Usuarios
            </h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Activos</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Inactivos</h3>
            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Ingresos Totales
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Promedio Sesiones
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.averageSessionsPerClient.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "Activo" | "Inactivo" | ""
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Buscar
              </button>
              {(searchQuery || statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={loadUsers} className="ml-2 text-red-600 underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Lista de Usuarios</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando usuarios...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron usuarios
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{user.customerNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.city}</div>
                      <div className="text-sm text-gray-500">
                        {user.postalCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.totalSessions} sesiones
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(user.totalSpent)} gastado
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          className={`px-3 py-1 text-xs rounded-md ${
                            user.status === "Activo"
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {user.status === "Activo" ? "Desactivar" : "Activar"}
                        </button>
                        <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600">
                          Editar
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600">
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
