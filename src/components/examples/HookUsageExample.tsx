// src/components/examples/HookUsageExample.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  appointmentsService,
  professionalsService,
  categoriesService,
  createPaginationParams,
  createFilterParams,
} from "@/services";

export const HookUsageExample = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo usando Promise.all
      const [appointmentsRes, professionalsRes, categoriesRes] =
        await Promise.all([
          appointmentsService.getClientAppointments(),
          professionalsService.getProfessionals(createPaginationParams(1, 5)),
          categoriesService.getCategories(createPaginationParams(1, 5)),
        ]);

      // Procesar respuestas
      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data?.data || []);
      }

      if (professionalsRes.success) {
        setProfessionals(professionalsRes.data?.data || []);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data?.data || []);
      }
    } catch (err) {
      setError("Error al cargar datos del usuario");
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewAppointment = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para crear una cita");
      return;
    }

    try {
      setLoading(true);

      const newAppointment = {
        professionalId: professionals[0]?.id || "prof-001",
        productId: "service-001",
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        modality: "online" as const,
        notes: "Cita creada desde el ejemplo",
        payment: {
          method: "Mastercard",
          cardNumber: "1234****5678",
          expiryDate: "12/25",
          cardholderName: user?.name || "Usuario",
        },
      };

      const response = await appointmentsService.createAppointment(
        newAppointment
      );

      if (response.success) {
        alert("Cita creada exitosamente");
        await loadUserData(); // Recargar datos
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert("Error al crear cita");
      console.error("Error creating appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchProfessionals = async (query: string) => {
    try {
      setLoading(true);

      const response = await professionalsService.searchProfessionals(query, {
        page: 1,
        limit: 5,
      });

      if (response.success) {
        setProfessionals(response.data?.data || []);
      }
    } catch (err) {
      console.error("Error searching professionals:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Verificando autenticación...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
        <p className="text-gray-600 mb-4">
          Necesitas iniciar sesión para ver tus datos
        </p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard del Usuario</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.name} ({user?.role})
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={loadUserData}
            className="ml-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={createNewAppointment}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Nueva Cita"}
          </button>

          <button
            onClick={() => searchProfessionals("psicólogo")}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Buscar Psicólogos
          </button>

          <button
            onClick={loadUserData}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Mis Citas</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500 text-center">
                No tienes citas programadas
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-gray-50 rounded">
                    <h4 className="font-medium">{appointment.product?.name}</h4>
                    <p className="text-sm text-gray-600">
                      {appointment.professional?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.dateTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profesionales */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Profesionales</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : professionals.length === 0 ? (
              <p className="text-gray-500 text-center">
                No hay profesionales disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {professionals.slice(0, 3).map((professional) => (
                  <div key={professional.id} className="p-3 bg-gray-50 rounded">
                    <h4 className="font-medium">{professional.name}</h4>
                    <p className="text-sm text-gray-600">
                      {professional.specialty}
                    </p>
                    <p className="text-sm text-gray-500">
                      ⭐ {professional.rating}/5
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Categorías</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-gray-500 text-center">
                No hay categorías disponibles
              </p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="p-3 bg-gray-50 rounded">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Información de la Sesión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Rol:</strong> {user?.role}
            </p>
          </div>
          <div>
            <p>
              <strong>Token:</strong>{" "}
              {user?.token ? "Presente" : "No disponible"}
            </p>
            <p>
              <strong>Refresh Token:</strong>{" "}
              {user?.refreshToken ? "Presente" : "No disponible"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
