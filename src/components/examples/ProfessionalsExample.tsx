// src/components/examples/ProfessionalsExample.tsx
"use client";

import { useState, useEffect } from "react";
import { professionalsService } from "@/services";
import { ApiProfessional } from "@/services/types/api";
import { debounce } from "@/services/utils/api-helpers";

export const ProfessionalsExample = () => {
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
  });

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim()) {
      await searchProfessionals(query);
    } else {
      await loadProfessionals();
    }
  }, 500);

  useEffect(() => {
    loadProfessionals();
    loadStats();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await professionalsService.getProfessionals({
        page: 1,
        limit: 20,
      });

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
  };

  const searchProfessionals = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await professionalsService.searchProfessionals(query, {
        page: 1,
        limit: 20,
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
  };

  const loadStats = async () => {
    try {
      const response = await professionalsService.getProfessionalStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const filterBySpecialty = async (specialty: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await professionalsService.getProfessionalsBySpecialty(
        specialty,
        {
          page: 1,
          limit: 20,
        }
      );

      if (response.success && response.data) {
        setProfessionals(response.data.data);
        setSelectedSpecialty(specialty);
      } else {
        setError(response.error || "Error al filtrar por especialidad");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error filtering by specialty:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    loadProfessionals();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "inactivo":
        return "bg-red-100 text-red-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "suspendido":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const specialties = [
    "Psicología Clínica",
    "Psiquiatría",
    "Terapia Familiar",
    "Psicología Deportiva",
    "Neuropsicología",
    "Psicología Forense",
    "Psicología Infantil",
    "Sexología",
    "Psicología de la Salud",
    "Psicología Organizacional",
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Directorio de Profesionales</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
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
            <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspendidos</h3>
            <p className="text-2xl font-bold text-gray-600">
              {stats.suspended}
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar profesionales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por especialidad */}
            <div className="md:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  if (e.target.value) {
                    filterBySpecialty(e.target.value);
                  } else {
                    clearFilters();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón limpiar filtros */}
            {(searchQuery || selectedSpecialty) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={loadProfessionals}
            className="ml-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de profesionales */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : selectedSpecialty
              ? `Especialidad: ${selectedSpecialty}`
              : "Todos los Profesionales"}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando...</span>
          </div>
        ) : professionals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron profesionales
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {professional.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {professional.specialty}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      professional.status
                    )}`}
                  >
                    {professional.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Ciudad:</strong> {professional.city}
                  </p>
                  <p>
                    <strong>Experiencia:</strong> {professional.experience} años
                  </p>
                  <p>
                    <strong>Calificación:</strong> ⭐ {professional.rating}/5
                  </p>
                  <p>
                    <strong>Sesiones:</strong> {professional.totalSessions}
                  </p>
                  <p>
                    <strong>Ingresos:</strong> ${professional.incomeUsd}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">
                    {professional.bio}
                  </p>

                  {professional.languages.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-500">
                        Idiomas:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {professional.languages.map((language) => (
                          <span
                            key={language}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      Ver Perfil
                    </button>
                    <button className="flex-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                      Reservar Cita
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
