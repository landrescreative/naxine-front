// src/components/examples/HookBasedExample.tsx
"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useCategories } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";

export const HookBasedExample = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Hooks para diferentes tipos de datos
  const {
    appointments,
    stats: appointmentStats,
    loading: appointmentsLoading,
    error: appointmentsError,
    createAppointment,
    cancelAppointment,
  } = useAppointments({ page: 1, limit: 5 });

  const {
    professionals,
    stats: professionalStats,
    loading: professionalsLoading,
    error: professionalsError,
    searchProfessionals,
  } = useProfessionals({ page: 1, limit: 5 });

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    getCategoryById,
  } = useCategories({ page: 1, limit: 5 });

  const {
    users,
    stats: userStats,
    loading: usersLoading,
    error: usersError,
    deactivateUser,
  } = useUsers({ page: 1, limit: 5 });

  const handleCreateAppointment = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para crear una cita");
      return;
    }

    const newAppointment = {
      professionalId: professionals[0]?.id || "prof-001",
      productId: "service-001",
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      modality: "online" as const,
      notes: "Cita creada desde el ejemplo con hooks",
      payment: {
        method: "Mastercard",
        cardNumber: "1234****5678",
        expiryDate: "12/25",
        cardholderName: user?.name || "Usuario",
      },
    };

    const result = await createAppointment(newAppointment);
    if (result.success) {
      alert("Cita creada exitosamente");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSearchProfessionals = async () => {
    await searchProfessionals("psicólogo");
  };

  const handleDeactivateUser = async (userId: string) => {
    const result = await deactivateUser(userId);
    if (result.success) {
      alert("Usuario desactivado exitosamente");
    } else {
      alert(`Error: ${result.error}`);
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
        <h1 className="text-3xl font-bold mb-2">
          Dashboard con Hooks Personalizados
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user?.name} ({user?.role})
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCreateAppointment}
            disabled={appointmentsLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {appointmentsLoading ? "Creando..." : "Nueva Cita"}
          </button>

          <button
            onClick={handleSearchProfessionals}
            disabled={professionalsLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Buscar Psicólogos
          </button>
        </div>
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Mis Citas</h2>
            {appointmentStats.total > 0 && (
              <p className="text-sm text-gray-500">
                Total: {appointmentStats.total} | Confirmadas:{" "}
                {appointmentStats.confirmed}
              </p>
            )}
          </div>
          <div className="p-6">
            {appointmentsError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {appointmentsError}
              </div>
            )}
            {appointmentsLoading ? (
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {appointment.product?.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.professional?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.dateTime).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                    </div>
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
            {professionalStats.total > 0 && (
              <p className="text-sm text-gray-500">
                Total: {professionalStats.total} | Activos:{" "}
                {professionalStats.active}
              </p>
            )}
          </div>
          <div className="p-6">
            {professionalsError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {professionalsError}
              </div>
            )}
            {professionalsLoading ? (
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
            {categoriesError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {categoriesError}
              </div>
            )}
            {categoriesLoading ? (
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
                    <button
                      onClick={() => getCategoryById(category.id)}
                      className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Usuarios (Solo para admin) */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Usuarios</h2>
              {userStats.total > 0 && (
                <p className="text-sm text-gray-500">
                  Total: {userStats.total} | Activos: {userStats.active}
                </p>
              )}
            </div>
            <div className="p-6">
              {usersError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {usersError}
                </div>
              )}
              {usersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No hay usuarios disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {users.slice(0, 3).map((user) => (
                    <div key={user.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Estado: {user.status}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Desactivar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
