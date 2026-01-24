"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { pagosService, professionalsService } from "@/services";
import ProfessionalPaymentsTable from "@/components/dashboard/ProfessionalPaymentsTable";
import { logger } from "@/lib/logger";
import {
  PaymentsSummarySkeleton,
  ProfessionalPaymentsTableSkeleton,
} from "@/components/dashboard/Skeletons";

interface PaymentRow {
  id: string;
  professional: {
    specialty: string;
    name: string;
  };
  date: string;
  amount: string;
  type: string;
  status: "pending" | "confirmed" | "cancelled";
  url_comprobante_pago?: string | null;
  url_factura_fiscal?: string | null;
}

export default function PagosPage() {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    balanceGeneral: 0,
    ingresosMes: 0,
    stripeBalance: 0,
    tieneFacturasPendientes: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingStripeLogin, setLoadingStripeLogin] = useState(false);

  // Función para abrir el dashboard de Stripe
  const handleOpenStripeDashboard = async () => {
    if (!professionalId) {
      setError("No se pudo identificar tu cuenta profesional");
      return;
    }

    try {
      setLoadingStripeLogin(true);
      setError(null);

      const response = await professionalsService.getStripeLoginLink();

      if (response.success && response.data) {
        const backendData = response.data as any;
        const loginUrl =
          backendData.data?.login_url ||
          backendData.login_url ||
          backendData.data?.data?.login_url;

        if (loginUrl) {
          // Abrir el dashboard de Stripe en una nueva pestaña
          window.open(loginUrl, "_blank", "noopener,noreferrer");
        } else {
          setError("No se pudo obtener el enlace de acceso a Stripe");
        }
      } else {
        setError(
          response.error ||
            "Error al obtener el enlace de acceso al dashboard de Stripe"
        );
      }
    } catch (err: any) {
      console.error("Error al obtener link de Stripe:", err);
      setError(
        err.message ||
          "Error al acceder al dashboard de Stripe. Por favor, intenta de nuevo."
      );
    } finally {
      setLoadingStripeLogin(false);
    }
  };

  // Cargar id_profesional del usuario autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadProfessionalId = async () => {
      try {
        const response = await professionalsService.getMyProfessionalProfile();
        if (response.success && response.data) {
          // El backend devuelve: { success: true, data: { profesional: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = response.data as any;
          const profesional =
            backendData.data?.profesional ||
            backendData.profesional ||
            backendData;
          const idProfesional = String(
            profesional.id_profesional || profesional.id || ""
          );

          setProfessionalId(idProfesional);
          // Resetear a página 1 cuando se carga un nuevo profesional
          setCurrentPage(1);
        } else {
          setError(
            response.error || "Error al cargar información del profesional"
          );
          setLoading(false);
        }
      } catch (err) {
        setError("Error al cargar información del profesional");
        setLoading(false);
      }
    };

    loadProfessionalId();
  }, [isAuthenticated, user]);

  // Cargar pagos cuando tengamos el professionalId
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!professionalId) {
      return;
    }

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convertir professionalId a número si es necesario
        const professionalIdNum = parseInt(professionalId, 10);
        if (isNaN(professionalIdNum) || professionalIdNum <= 0) {
          throw new Error(`ID de profesional inválido: ${professionalId}`);
        }

        const pagosResponse = await pagosService.getPagosProfesional(
          professionalIdNum,
          {
            limit: pageSize,
            offset: (currentPage - 1) * pageSize,
          }
        );

        if (pagosResponse.success && pagosResponse.data) {
          // El backend devuelve: { success: true, data: { pagos: [...], id_profesional: ..., paginacion: {...} } }
          // El apiClient envuelve esto, así que response.data es el objeto completo del backend
          const backendData = pagosResponse.data as any;

          // Intentar extraer pagos de diferentes formas
          let pagosArray: any[] = [];
          if (Array.isArray(backendData)) {
            pagosArray = backendData;
          } else if (backendData.data?.pagos) {
            pagosArray = Array.isArray(backendData.data.pagos)
              ? backendData.data.pagos
              : [];
          } else if (backendData.pagos) {
            pagosArray = Array.isArray(backendData.pagos)
              ? backendData.pagos
              : [];
          }

          // Intentar extraer información de paginación
          let paginacionData: any = null;
          if (backendData.data?.paginacion) {
            paginacionData = backendData.data.paginacion;
          } else if (backendData.paginacion) {
            paginacionData = backendData.paginacion;
          }

          logger.debug(
            "Datos recibidos del backend",
            {
              backendDataKeys: Object.keys(backendData),
              hasDataPagos: !!backendData.data?.pagos,
              hasPagos: !!backendData.pagos,
              hasDataPaginacion: !!backendData.data?.paginacion,
              hasPaginacion: !!backendData.paginacion,
              paginacionData,
              pagosArrayLength: pagosArray.length,
            },
            "PagosPage"
          );

          // Extraer total de diferentes formas posibles
          let total = 0;
          if (paginacionData) {
            if (typeof paginacionData === "object" && paginacionData !== null) {
              total =
                Number(paginacionData.total) ||
                Number(paginacionData.total_filtrado) ||
                0;
            } else if (typeof paginacionData === "number") {
              total = paginacionData;
            }
          }

          // Si no hay total del backend, usar el tamaño del array actual
          // Si el array tiene exactamente pageSize elementos, probablemente hay más páginas
          const hasMore = pagosArray.length >= pageSize;
          if (total === 0) {
            total = pagosArray.length;
            setHasMorePages(hasMore);
          } else {
            setHasMorePages(total > pagosArray.length);
          }

          // Calcular totalPages
          // NOTA: El backend actualmente devuelve total como pagosSerializados.length (solo la página actual)
          // Por eso usamos una lógica especial: si tenemos pageSize elementos, asumimos que hay más páginas
          let totalPages = 1;
          let finalTotal = pagosArray.length;

          // Si el total del backend es mayor que los elementos actuales, es el total real
          if (total > 0 && total > pagosArray.length) {
            totalPages = Math.ceil(total / pageSize);
            finalTotal = total;
          } else if (pagosArray.length >= pageSize) {
            // Si tenemos exactamente pageSize elementos, probablemente hay más páginas
            // Si estamos en la página 1, asumimos que hay al menos página 2
            // Si estamos en una página mayor y aún tenemos pageSize elementos, hay más
            if (currentPage === 1) {
              totalPages = 2; // Mínimo 2 páginas si hay pageSize elementos en la primera página
            } else {
              // Estamos en una página mayor y aún tenemos pageSize elementos, hay más páginas
              totalPages = currentPage + 1;
            }
            finalTotal = pagosArray.length * totalPages; // Estimación
            setHasMorePages(true);
            logger.debug(
              "Asumiendo más páginas porque hay pageSize elementos",
              {
                pagosArrayLength: pagosArray.length,
                pageSize,
                totalPages,
                currentPage,
              },
              "PagosPage"
            );
          } else {
            // Menos de pageSize elementos, solo esta página
            totalPages = 1;
            finalTotal = pagosArray.length;
            setHasMorePages(false);
          }

          logger.debug(
            "Paginación calculada",
            {
              total: finalTotal,
              totalPages,
              currentPage,
              pageSize,
              pagosArrayLength: pagosArray.length,
              hasMorePages: hasMore || total > pagosArray.length,
              paginacionData,
              backendTotal: total,
            },
            "PagosPage"
          );

          setPagination({
            total: finalTotal,
            totalPages: Math.max(totalPages, 1),
          });

          setPayments(pagosArray);

          // Calcular estadísticas
          // NUEVO MODELO: La plataforma NO gestiona dinero, no hay balance interno
          // El dinero va directamente a Stripe Connect del profesional
          const now = new Date();
          const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

          // NUEVO MODELO: No hay balance interno de la plataforma
          // El balance real está en Stripe Connect del profesional
          const balanceNaxine = 0;

          // Ingresos del mes (pagos completados este mes)
          // NUEVO MODELO: El profesional recibe el 100% del pago directamente en Stripe Connect
          const ingresosMes = pagosArray
            .filter((p: any) => {
              const estado = String(p.estado || "").toLowerCase();
              if (
                estado !== "completado" &&
                estado !== "pagado" &&
                estado !== "paid"
              )
                return false;
              if (!p.fecha_pago) return false;
              try {
                const fechaPago = new Date(p.fecha_pago);
                return !isNaN(fechaPago.getTime()) && fechaPago >= inicioMes;
              } catch {
                return false;
              }
            })
            .reduce((sum: number, p: any) => {
              // El profesional recibe el 100% del monto (menos comisiones de Stripe que se deducen automáticamente)
              const monto = p.monto ? parseFloat(String(p.monto)) : 0;
              return sum + monto;
            }, 0);

          // Obtener balance de Naxine desde el backend (más preciso)
          let balanceNaxineBackend = 0;
          let tieneFacturasPendientes = false;
          try {
            const balanceResponse = await pagosService.getBalanceProfesional(
              professionalIdNum
            );
            if (balanceResponse.success && balanceResponse.data) {
              const backendData = balanceResponse.data as any;
              const balanceData =
                backendData.data?.balance || backendData.balance || backendData;
              balanceNaxineBackend = parseFloat(
                balanceData.balance_actual || 0
              );
              tieneFacturasPendientes =
                backendData.data?.tieneFacturasPendientes ||
                backendData.tieneFacturasPendientes ||
                false;
            }
          } catch (err: any) {
            // Usar cálculo local como fallback
            balanceNaxineBackend = balanceNaxine;
            // Calcular facturas pendientes localmente como fallback
            tieneFacturasPendientes = pagosArray.some((p: any) => {
              const estado = String(p.estado || "").toLowerCase();
              const tieneFacturaFiscal =
                p.url_factura_fiscal &&
                p.url_factura_fiscal !== null &&
                p.url_factura_fiscal !== "null" &&
                p.url_factura_fiscal !== "undefined" &&
                String(p.url_factura_fiscal).trim() !== "";
              return (
                (estado === "completado" ||
                  estado === "pagado" ||
                  estado === "paid") &&
                !tieneFacturaFiscal
              );
            });
          }

          setStats({
            balanceGeneral: 0, // NUEVO MODELO: No hay balance interno de la plataforma
            ingresosMes, // Ingresos del mes (100% del pago va a Stripe Connect)
            stripeBalance: 0, // NUEVO MODELO: El balance está en Stripe Connect del profesional, no en la plataforma
            tieneFacturasPendientes, // Solo informativo (no bloquea nada)
          });
        } else {
          setError(pagosResponse.error || "Error al cargar los pagos");
        }
      } catch (err: any) {
        setError("Error al cargar los pagos");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [professionalId, isAuthenticated, currentPage]);

  // Transformar pagos al formato esperado por ProfessionalPaymentsTable
  const paymentRows = useMemo((): PaymentRow[] => {
    return payments.map((pago: any) => {
      // Formatear fecha correctamente
      let fechaPago = "N/A";
      if (pago.fecha_pago) {
        try {
          const fecha = new Date(pago.fecha_pago);
          if (!isNaN(fecha.getTime())) {
            fechaPago = fecha.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        } catch (e) {
          // Fecha inválida, mantener "N/A"
        }
      }

      // Obtener monto del pago (siempre visible)
      const monto = pago.monto ? parseFloat(String(pago.monto)) : 0;
      const amount = `EUR €${monto.toFixed(2)}`;

      // Determinar estado del pago
      let status: "pending" | "confirmed" | "cancelled" = "confirmed";
      const estado = String(pago.estado || "").toLowerCase();
      if (estado === "pendiente") {
        status = "pending";
      } else if (
        estado === "fallido" ||
        estado === "cancelado" ||
        estado === "cancelled"
      ) {
        status = "cancelled";
      } else if (
        estado === "completado" ||
        estado === "pagado" ||
        estado === "paid"
      ) {
        status = "confirmed";
      }

      // Obtener información del cliente y servicio
      const clientName = pago.cliente_nombre || "Cliente";
      const specialty =
        pago.profesional_especialidad || pago.especialidad || "Especialidad";
      const serviceName =
        pago.nombre_servicio || pago.nombre_paquete || "Servicio";

      return {
        id: String(pago.id_pago),
        professional: {
          specialty: specialty,
          name: clientName,
        },
        date: fechaPago,
        amount,
        type: serviceName,
        status,
        // Mantener valores tal cual vienen (null, undefined, o string válido)
        // Solo convertir undefined a null, pero mantener null y strings válidos
        url_comprobante_pago:
          pago.url_comprobante_pago !== undefined
            ? pago.url_comprobante_pago
            : null,
        url_factura_fiscal:
          pago.url_factura_fiscal !== undefined
            ? pago.url_factura_fiscal
            : null,
        // Flag para indicar si necesita subir factura fiscal (solo para destacar el botón)
        // NUEVO MODELO: La factura solo se guarda, no activa nada en el backend
        necesitaFacturaFiscal: !(
          pago.url_factura_fiscal &&
          pago.url_factura_fiscal !== null &&
          pago.url_factura_fiscal !== "null" &&
          pago.url_factura_fiscal !== "undefined" &&
          String(pago.url_factura_fiscal).trim() !== ""
        ),
      };
    });
  }, [payments]);


  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {loading ? (
        <>
          <PaymentsSummarySkeleton />
          <ProfessionalPaymentsTableSkeleton />
        </>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="overflow-hidden shadow rounded-lg bg-primary">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white truncate">
                    Balance en Stripe Connect
                  </dt>
                  <dd className="text-lg font-medium text-white mb-2">
                    Ver en Stripe Dashboard
                  </dd>
                  <dd className="text-xs text-white/80 mt-1 mb-3">
                    ℹ️ El dinero va directamente a tu cuenta de Stripe Connect
                  </dd>
                  <dd>
                    <button
                      onClick={handleOpenStripeDashboard}
                      disabled={loadingStripeLogin}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingStripeLogin ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-3 w-3 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Abrir Dashboard de Stripe
                        </>
                      )}
                    </button>
                  </dd>
                  {stats.tieneFacturasPendientes && (
                    <dd className="text-xs text-white/80 mt-2">
                      ⚠️ Tienes facturas pendientes de subir (solo informativo)
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos del Mes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    EUR €{stats.ingresosMes.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {paymentRows.length > 0 ? (
        <>
          <ProfessionalPaymentsTable
            rows={paymentRows}
            onUploadInvoice={async (pagoId: string, file: File) => {
              // NUEVO MODELO: La factura solo se guarda, no activa balance ni depósitos
              const response = await pagosService.subirFacturaFiscal(
                pagoId,
                file
              );
              if (!response.success) {
                throw new Error(
                  response.error || "Error desconocido al subir factura"
                );
              }
              // El componente manejará el mensaje de éxito y recarga para mostrar la factura guardada
            }}
          />

          {/* Paginación - Mostrar si hay más de una página o si hay pageSize elementos (indica más páginas) */}
          {(pagination.totalPages > 1 || paymentRows.length >= pageSize) && (
            <div className="flex items-center justify-between bg-white px-3 sm:px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => {
                    if (currentPage < pagination.totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={currentPage === pagination.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, pagination.total)}
                    </span>{" "}
                    de <span className="font-medium">{pagination.total}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Números de página */}
                    {Array.from(
                      { length: Math.max(pagination.totalPages, 2) },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        // Si solo hay 2 páginas, mostrar ambas
                        if (pagination.totalPages <= 2) {
                          return true;
                        }
                        // Mostrar primera, última, actual y páginas adyacentes
                        if (page === 1 || page === pagination.totalPages) {
                          return true;
                        }
                        if (
                          page >= currentPage - 1 &&
                          page <= currentPage + 1
                        ) {
                          return true;
                        }
                        return false;
                      })
                      .map((page, index, array) => {
                        // Agregar puntos suspensivos si hay gap
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== page - 1;
                        const showEllipsisAfter =
                          index < array.length - 1 &&
                          array[index + 1] !== page + 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 ${
                                currentPage === page
                                  ? "z-10 bg-primary text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                  : "text-gray-900 ring-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                            {showEllipsisAfter && (
                              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                ...
                              </span>
                            )}
                          </div>
                        );
                      })}

                    <button
                      onClick={() => {
                        if (currentPage < pagination.totalPages) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay pagos registrados
          </h3>
          <p className="text-gray-600">
            Cuando recibas pagos, aparecerán aquí.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
