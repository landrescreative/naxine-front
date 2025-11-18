// src/components/examples/AppointmentsExample.tsx
"use client";

import { useState, useEffect } from "react";
import { appointmentsService } from "@/services";
import { ApiAppointment } from "@/services/types/api";
import { formatDateForApi, parseApiDate } from "@/services/utils/api-helpers";

export const AppointmentsExample = () => {
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  });

  // Cargar citas al montar el componente
  useEffect(() => {
    loadAppointments();
    loadStats();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentsService.getAppointments({
        page: 1,
        limit: 10,
      });

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
  };

  const loadStats = async () => {
    try {
      const response = await appointmentsService.getAppointmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const createAppointment = async () => {
    try {
      const newAppointment = {
        professionalId: "prof-001",
        productId: "service-001",
        dateTime: formatDateForApi(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ), // En 7 días
        modality: "online" as const,
        notes: "Consulta de prueba",
        payment: {
          method: "Mastercard",
          cardNumber: "1234****5678",
          expiryDate: "12/25",
          cardholderName: "Juan Pérez",
        },
      };

      const response = await appointmentsService.createAppointment(
        newAppointment
      );

      if (response.success && response.data) {
        // Recargar la lista de citas
        await loadAppointments();
        await loadStats();
        alert("Cita creada exitosamente");
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert("Error al crear cita");
      console.error("Error creating appointment:", err);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await appointmentsService.cancelAppointment(
        appointmentId
      );

      if (response.success && response.data) {
        // Recargar la lista de citas
        await loadAppointments();
        await loadStats();
        alert("Cita cancelada exitosamente");
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      alert("Error al cancelar cita");
      console.error("Error canceling appointment:", err);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = parseApiDate(dateTimeString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Gestión de Citas</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Confirmadas</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Canceladas</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completadas</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Botón para crear cita */}
        <button
          onClick={createAppointment}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          Crear Nueva Cita
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={loadAppointments}
            className="ml-2 text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de citas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Citas Recientes</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay citas disponibles
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium">
                        {appointment.product.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <strong>Profesional:</strong>{" "}
                        {appointment.professional.name}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {formatDateTime(appointment.dateTime)}
                      </p>
                      <p>
                        <strong>Modalidad:</strong> {appointment.modality}
                      </p>
                      <p>
                        <strong>Precio:</strong> ${appointment.payment.total}
                      </p>
                      {appointment.notes && (
                        <p>
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {appointment.status === "confirmed" && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                    )}
                    <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                      Ver Detalles
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
