"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { pagosService } from "@/services";
import { Pago } from "@/services/api/pagos";
import AppointmentHistoryTable from "@/components/dashboard/AppointmentHistoryTable";
import { AppointmentHistorySkeleton } from "@/components/dashboard/Skeletons";

interface AppointmentHistory {
  id: string;
  order: {
    specialty: string;
    professional: string;
  };
  date: string;
  amount: string;
  type: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  url_comprobante_pago?: string | null;
  url_factura_fiscal?: string | null;
}

export default function PagosPage() {
  const { user, isAuthenticated } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pagos del cliente
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadPagos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[PagosPage] Cargando pagos del cliente:", user.id);
        const response = await pagosService.getMisPagos({
          limit: 100,
          offset: 0,
        });

        console.log("[PagosPage] Respuesta de pagosService:", response);

        if (response.success && response.data) {
          const dataObj = response.data as any;
          
          // Extraer array de pagos
          let pagosArray: Pago[] = [];
          
          if (dataObj?.data?.pagos && Array.isArray(dataObj.data.pagos)) {
            pagosArray = dataObj.data.pagos;
            console.log("[PagosPage] Pagos encontrados en data.data.pagos");
          } else if (dataObj?.pagos && Array.isArray(dataObj.pagos)) {
            pagosArray = dataObj.pagos;
            console.log("[PagosPage] Pagos encontrados en data.pagos");
          } else if (Array.isArray(dataObj)) {
            pagosArray = dataObj;
            console.log("[PagosPage] data es directamente un array");
          }
          
          console.log("[PagosPage] Pagos recibidos:", pagosArray.length);
          
          // Filtrar pagos válidos (solo con monto, fecha puede ser null)
          const validPagos = pagosArray.filter((pago: Pago) => {
            if (!pago.monto) {
              console.warn("[PagosPage] Pago sin monto:", pago);
              return false;
            }
            // Verificar que el pago pertenezca al cliente actual (ya viene filtrado del backend)
            return true;
          });
          
          console.log("[PagosPage] Pagos válidos:", validPagos.length);
          setPagos(validPagos);
        } else {
          console.warn("[PagosPage] Error al cargar pagos:", response.error);
          setError(response.error || "Error al cargar los pagos");
          setPagos([]);
        }
      } catch (err: any) {
        console.error("[PagosPage] Error loading payments:", err);
        setError(
          "Error al conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente."
        );
        setPagos([]);
      } finally {
        setLoading(false);
      }
    };

    loadPagos();
  }, [isAuthenticated, user]);

  // Transformar pagos al formato de AppointmentHistory
  const appointmentHistory = useMemo((): AppointmentHistory[] => {
    // Ordenar pagos por fecha_pago o fecha_inicio (más recientes primero)
    const pagosOrdenados = [...pagos].sort((a, b) => {
      // Usar fecha_pago si existe, sino usar fecha_inicio
      const fechaA = a.fecha_pago || a.fecha_inicio;
      const fechaB = b.fecha_pago || b.fecha_inicio;
      const tiempoA = fechaA ? new Date(fechaA).getTime() : 0;
      const tiempoB = fechaB ? new Date(fechaB).getTime() : 0;
      return tiempoB - tiempoA; // Orden descendente (más recientes primero)
    });

    return pagosOrdenados.map((pago: Pago) => {
      // Formatear fecha: priorizar fecha_pago (fecha de creación del pago)
      // Si no existe, usar fecha_inicio de la cita como fallback
      const fechaParaMostrar = pago.fecha_pago || pago.fecha_inicio;
      let fechaFormateada = "Sin fecha";
      
      if (fechaParaMostrar) {
        try {
          const fecha = new Date(fechaParaMostrar);
          if (!isNaN(fecha.getTime())) {
            // Formato: "15 ene 2024"
            fechaFormateada = fecha.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          } else {
            console.warn("[PagosPage] Fecha inválida:", fechaParaMostrar, "para pago:", pago.id_pago);
          }
        } catch (error) {
          console.warn("[PagosPage] Error al formatear fecha:", fechaParaMostrar, error, "para pago:", pago.id_pago);
        }
      } else {
        // Log detallado para debugging
        console.warn("[PagosPage] Pago sin fecha:", {
          id_pago: pago.id_pago,
          id_cita: pago.id_cita,
          fecha_pago: pago.fecha_pago,
          fecha_inicio: pago.fecha_inicio,
          estado: pago.estado
        });
      }

      // Formatear monto
      const monto = typeof pago.monto === "string" 
        ? parseFloat(pago.monto) 
        : pago.monto;
      const montoFormateado = `USD $${monto.toFixed(2)}`;

      // Obtener nombre del profesional
      const nombreProfesional = pago.profesional_nombre
        ? `${pago.profesional_nombre}${pago.profesional_apellidos ? ` ${pago.profesional_apellidos}` : ""}`
        : "Profesional";

      // Obtener especialidad
      const especialidad = pago.profesional_especialidad || "Especialidad";

      // Mapear estado del pago al estado de la cita
      let status: "confirmed" | "pending" | "cancelled" | "completed" = "pending";
      if (pago.estado === "completado" || pago.estado === "pagado") {
        status = "confirmed";
      } else if (pago.estado === "pendiente") {
        status = "pending";
      } else if (pago.estado === "reembolsado") {
        status = "cancelled";
      } else if (pago.estado === "fallido") {
        status = "cancelled";
      }

      // Tipo de servicio basado en tipo_atencion
      const tipoServicio = pago.tipo_atencion === "en_linea" 
        ? "Consulta Virtual" 
        : pago.tipo_atencion === "presencial"
        ? "Consulta Presencial"
        : pago.tipo_atencion === "a_domicilio"
        ? "Consulta a Domicilio"
        : "Consulta";

      return {
        id: String(pago.id_pago),
        order: {
          specialty: especialidad,
          professional: nombreProfesional,
        },
        date: fechaFormateada,
        amount: montoFormateado,
        type: tipoServicio,
        status,
        url_comprobante_pago: pago.url_comprobante_pago || null,
        url_factura_fiscal: pago.url_factura_fiscal || null,
      };
    });
  }, [pagos]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar los pagos
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Por favor, inicia sesión para ver tus pagos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {loading ? (
        <AppointmentHistorySkeleton />
      ) : appointmentHistory.length > 0 ? (
        <AppointmentHistoryTable appointments={appointmentHistory} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes pagos registrados
          </h3>
          <p className="text-gray-600 mb-4">
            Cuando realices un pago por una cita, aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}
