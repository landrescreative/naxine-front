"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lazyLoad } from "@/lib/lazy-loading";

// Registrar componentes de Chart.js de forma lazy
let chartRegistered = false;
const registerChart = async () => {
  if (chartRegistered) return;
  const chartModule = await import("chart.js");
  chartModule.Chart.register(
    chartModule.CategoryScale,
    chartModule.LinearScale,
    chartModule.PointElement,
    chartModule.LineElement,
    chartModule.Title,
    chartModule.Tooltip,
    chartModule.Legend
  );
  chartRegistered = true;
};
import {
  CheckCircle,
  ShoppingCart,
  Users,
  Folder,
  Download,
  TrendingUp,
  X,
  Loader2,
} from "lucide-react";
import { pagosService, Pago } from "@/services/api/pagos";

// Componente wrapper para cargar Chart.js de forma lazy
function ChartLoader({ data, options }: { data: any; options: any }) {
  const [ChartReady, setChartReady] = useState(false);
  const [LineComponent, setLineComponent] = useState<any>(null);

  useEffect(() => {
    const loadChart = async () => {
      await registerChart();
      const lineModule = await import("react-chartjs-2");
      setLineComponent(() => lineModule.Line);
      setChartReady(true);
    };
    loadChart();
  }, []);

  if (!ChartReady || !LineComponent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  return <LineComponent data={data} options={options} />;
}

export default function AdminPagosPage() {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  
  // Estados para datos reales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    balance_general: 0,
    total_ventas: 0,
    total_comisiones: 0,
    total_pagos: 0,
    total_clientes: 0,
    total_profesionales: 0,
  });
  const [chartData, setChartData] = useState<number[]>([]);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPagos, setTotalPagos] = useState(0);

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // No usar filtros de fecha, cargar todos los pagos
      const fecha_inicio = undefined;
      const fecha_fin = undefined;

      // Calcular offset basado en la página actual
      const offset = (currentPage - 1) * itemsPerPage;

      // Cargar pagos
      let pagosData: Pago[] = [];
      const pagosResponse = await pagosService.getAllPagos({
        limit: itemsPerPage,
        offset: offset,
        fecha_desde: fecha_inicio,
        fecha_hasta: fecha_fin,
      });

      console.log('[AdminPagosPage] Respuesta completa:', pagosResponse);
      console.log('[AdminPagosPage] pagosResponse.data:', pagosResponse.data);
      console.log('[AdminPagosPage] pagosResponse.data (JSON):', JSON.stringify(pagosResponse.data, null, 2));

      if (pagosResponse.success && pagosResponse.data) {
        // Normalizar respuesta principal tipada
        let paginacionData: any = pagosResponse.data.paginacion || { total: 0 };
        pagosData = Array.isArray(pagosResponse.data.pagos)
          ? pagosResponse.data.pagos
          : [];

        // Compatibilidad con respuestas antiguas o distintas estructuras
        if (pagosData.length === 0) {
          const legacyData = pagosResponse.data as any;

          if (
            legacyData?.data?.pagos &&
            Array.isArray(legacyData.data.pagos)
          ) {
            pagosData = legacyData.data.pagos;
            paginacionData = legacyData.data.paginacion || paginacionData;
            console.log(
              "[AdminPagosPage] Usando legacy data.pagos, cantidad:",
              pagosData.length
            );
          } else if (Array.isArray(legacyData)) {
            pagosData = legacyData;
            console.log(
              "[AdminPagosPage] Usando legacy array directo, cantidad:",
              pagosData.length
            );
          } else if (
            legacyData?.data &&
            Array.isArray(legacyData.data)
          ) {
            pagosData = legacyData.data;
            console.log(
              "[AdminPagosPage] Usando legacy data[] como array, cantidad:",
              pagosData.length
            );
          } else {
            console.warn(
              "[AdminPagosPage] No se pudo encontrar el array de pagos en la respuesta"
            );
            console.warn(
              "[AdminPagosPage] Estructura completa:",
              JSON.stringify(legacyData, null, 2)
            );
          }
        } else {
          console.log(
            "[AdminPagosPage] Usando pagosResponse.data.pagos, cantidad:",
            pagosData.length
          );
        }

        setPagos(pagosData);
        
        // Obtener total de pagos de la respuesta de paginación
        let totalCalculado = 0;
        
        // Priorizar el total del backend si está disponible
        if (paginacionData && paginacionData.total) {
          const totalFromBackend = paginacionData.total;
          if (typeof totalFromBackend === 'number' && totalFromBackend > 0) {
            totalCalculado = totalFromBackend;
          } else if (typeof totalFromBackend === 'string') {
            // Si viene como string, convertirlo a número
            const parsedTotal = parseInt(totalFromBackend, 10);
            if (!isNaN(parsedTotal) && parsedTotal > 0) {
              totalCalculado = parsedTotal;
            }
          }
        }
        
        // Si no hay total del backend o es 0, usar lógica de estimación
        if (totalCalculado === 0 || totalCalculado < pagosData.length) {
          if (pagosData.length < itemsPerPage) {
            // Si hay menos pagos que el límite, ese es el total
            totalCalculado = pagosData.length;
          } else if (pagosData.length === itemsPerPage) {
            // Si hay exactamente el límite, verificar si hay más resultados
            // Intentar obtener un resultado más para verificar (solo en página 1 para evitar múltiples llamadas)
            if (currentPage === 1) {
              try {
                const testResponse = await pagosService.getAllPagos({
                  limit: 1,
                  offset: itemsPerPage,
                  fecha_desde: fecha_inicio,
                  fecha_hasta: fecha_fin,
                });
                if (testResponse.success && testResponse.data) {
                  // Intentar diferentes estructuras para la respuesta de prueba
                  let testPagos: any[] = Array.isArray(testResponse.data.pagos)
                    ? testResponse.data.pagos
                    : [];

                  if (testPagos.length === 0) {
                    const legacyTestData = testResponse.data as any;
                    if (
                      legacyTestData?.data?.pagos &&
                      Array.isArray(legacyTestData.data.pagos)
                    ) {
                      testPagos = legacyTestData.data.pagos;
                    } else if (Array.isArray(legacyTestData)) {
                      testPagos = legacyTestData;
                    } else if (
                      legacyTestData?.data &&
                      Array.isArray(legacyTestData.data)
                    ) {
                      testPagos = legacyTestData.data;
                    }
                  }
                  // Si hay más resultados, usar el total del backend si está disponible, sino estimar
                  if (testPagos.length > 0) {
                    // Hay más resultados, pero no sabemos cuántos exactamente
                    // Usar una estimación conservadora: asumir que hay al menos una página más
                    totalCalculado = itemsPerPage + 1;
                  } else {
                    // No hay más resultados, el total es exactamente los que tenemos
                    totalCalculado = pagosData.length;
                  }
                } else {
                  // Si falla la verificación, asumir que hay más
                  totalCalculado = itemsPerPage + 1;
                }
              } catch (error) {
                // Si falla la verificación, asumir que hay más
                totalCalculado = itemsPerPage + 1;
              }
            } else {
              // Si estamos en una página posterior y hay exactamente el límite, probablemente hay más
              totalCalculado = (currentPage * itemsPerPage) + 1;
            }
          } else {
            totalCalculado = pagosData.length;
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[AdminPagosPage] pagosResponse.data.paginacion:', pagosResponse.data.paginacion);
          console.log('[AdminPagosPage] totalCalculado:', totalCalculado);
          console.log('[AdminPagosPage] pagosData.length:', pagosData.length);
          console.log('[AdminPagosPage] currentPage:', currentPage);
          console.log('[AdminPagosPage] itemsPerPage:', itemsPerPage);
        }
        
        setTotalPagos(totalCalculado);
      }

      // Cargar estadísticas
      const statsResponse = await pagosService.getEstadisticasPagos({
        fecha_inicio,
        fecha_fin,
      });

      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data.estadisticas || {};
        
        // NUEVO MODELO: La plataforma NO gestiona dinero, no hay balance interno
        const balanceGeneral = 0;
        
        setEstadisticas({
          balance_general: 0, // NUEVO MODELO: No hay balance interno de la plataforma
          total_ventas: typeof stats.total_ventas === 'number' ? stats.total_ventas : (typeof stats.total_ventas === 'string' ? parseFloat(stats.total_ventas) : 0),
          total_comisiones: 0, // NUEVO MODELO: La plataforma NO retiene comisión
          total_pagos: typeof stats.total_pagos === 'number' ? stats.total_pagos : pagosData.length,
          total_clientes: 0, // TODO: Obtener de otra API
          total_profesionales: 0, // TODO: Obtener de otra API
        });

        // Calcular datos mensuales para la gráfica
        calculateMonthlyData(pagosData, fecha_inicio, fecha_fin);
      } else {
        // Si no hay estadísticas, calcular desde los pagos
        // NUEVO MODELO: La plataforma NO retiene comisión, solo actúa como pasarela
        const totalVentas = pagosData
          .filter(p => p.estado === 'completado' || p.estado === 'pagado')
          .reduce((sum, p) => {
            const monto = typeof p.monto === 'string' ? parseFloat(p.monto) : Number(p.monto);
            return sum + (isNaN(monto) ? 0 : monto);
          }, 0);
        
        // NUEVO MODELO: La plataforma NO retiene comisión
        const totalComisiones = 0;
        
        setEstadisticas({
          balance_general: 0, // NUEVO MODELO: No hay balance interno de la plataforma
          total_ventas: totalVentas,
          total_comisiones: 0, // NUEVO MODELO: La plataforma NO retiene comisión
          total_pagos: pagosData.length,
          total_clientes: new Set(pagosData.map(p => p.id_cliente)).size,
          total_profesionales: new Set(pagosData.map(p => p.id_profesional)).size,
        });
        
        calculateMonthlyData(pagosData, fecha_inicio, fecha_fin);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Calcular datos mensuales para la gráfica
  const calculateMonthlyData = (pagosData: Pago[], fecha_inicio?: string, fecha_fin?: string) => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const ingresosMensuales = new Array(12).fill(0);
    const ingresosNetosMensuales = new Array(12).fill(0);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    
    pagosData.forEach((pago) => {
      if (pago.fecha_pago && pago.estado === 'completado' || pago.estado === 'pagado') {
        const fechaPago = new Date(pago.fecha_pago);
        const mes = fechaPago.getMonth();
        const año = fechaPago.getFullYear();
        
        if (año === currentYear) {
          const monto = typeof pago.monto === 'string' ? parseFloat(pago.monto) : Number(pago.monto);
          if (!isNaN(monto)) {
            ingresosMensuales[mes] += monto;
            // Calcular comisión (aproximación: 10-20% según el monto)
            const comision = monto <= 100 ? monto * 0.20 : monto <= 200 ? monto * 0.15 : monto <= 300 ? monto * 0.10 : monto * 0.08;
            ingresosNetosMensuales[mes] += monto - comision;
          }
        }
      }
    });

    setChartData(ingresosMensuales);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Configuración de la gráfica
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + (value / 1000).toFixed(1) + "k";
          },
        },
      },
    },
  };

  const chartDataConfig = {
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    datasets: [
      {
        label: "Ingresos",
        data: chartData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Ingresos Netos (Profesionales)",
        data: chartData.map((ingreso) => {
          // NUEVO MODELO: El profesional recibe el 100% del pago (menos comisiones de Stripe que se deducen automáticamente)
          // Aproximación: ~96.5% después de comisiones de Stripe (~3.5%)
          return ingreso * 0.965;
        }),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Mapear pago a formato de sesión
  const mapPagoToSession = (pago: Pago) => {
    const fechaInicio = pago.fecha_inicio ? new Date(pago.fecha_inicio) : null;
    const fechaFormateada = fechaInicio
      ? fechaInicio.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : pago.fecha_pago
      ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : 'N/A';
    
    const horaFormateada = fechaInicio
      ? fechaInicio.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      : 'N/A';

    const montoNumero = typeof pago.monto === 'string' ? parseFloat(pago.monto) : Number(pago.monto);
    const precio = !isNaN(montoNumero) ? `${montoNumero.toFixed(2)}€` : 'N/A';
    
    // Calcular comisión (aproximación)
    const comision = montoNumero <= 100 ? montoNumero * 0.20 
      : montoNumero <= 200 ? montoNumero * 0.15 
      : montoNumero <= 300 ? montoNumero * 0.10 
      : montoNumero * 0.08;
    const comisionFormateada = `${comision.toFixed(2)}€`;

    const tipoSesion = pago.tipo_atencion === 'en_linea'
      ? 'Sesión en Línea'
      : pago.tipo_atencion === 'a_domicilio'
      ? 'Sesión a Domicilio'
      : 'Sesión Presencial';

    let status: string = pago.estado;
    let statusColor = "bg-gray-100 text-gray-800";

    if (pago.estado === 'pendiente') {
      status = 'Pendiente';
      statusColor = "bg-orange-100 text-orange-800";
    } else if (pago.estado === 'completado' || pago.estado === 'pagado') {
      status = 'Activo';
      statusColor = "bg-green-100 text-green-800";
    } else if (pago.estado === 'reembolsado') {
      status = 'Reembolsado';
      statusColor = "bg-red-100 text-red-800";
    } else if (pago.estado === 'fallido') {
      status = 'Fallido';
      statusColor = "bg-red-100 text-red-800";
    }

    // Verificar si tiene factura profesional vinculada
    const tieneFacturaProfesional = !!(pago.url_factura_fiscal);

    return {
      id: pago.id_pago,
      session: tipoSesion,
      specialty: pago.profesional_especialidad || "Especialidad",
      date: fechaFormateada,
      time: horaFormateada,
      sessionId: String(pago.id_pago).padStart(8, '0'),
      price: precio,
      commission: comisionFormateada,
      professional: pago.profesional_nombre 
        ? `${pago.profesional_nombre}${pago.profesional_apellidos ? ' ' + pago.profesional_apellidos : ''}`
        : 'Profesional desconocido',
      status,
      statusColor,
      tieneFacturaProfesional,
      pago,
    };
  };


  const handleViewFile = async (pagoId: number) => {
    try {
      const urlResponse = await pagosService.obtenerUrlFacturaFirmada(pagoId);
      if (urlResponse.success && urlResponse.data) {
        setViewingFile({
          name: `Factura-${pagoId}.pdf`,
          url: urlResponse.data.url || '',
        });
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Error al obtener URL de factura:', err);
      alert('Error al cargar la factura. Por favor, intenta nuevamente.');
    }
  };

  const handleDownloadInvoice = async (pagoId: number) => {
    try {
      const blob = await pagosService.descargarFacturaFiscal(pagoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-profesional-${pagoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar factura profesional:', err);
      alert('Error al descargar la factura profesional. Por favor, intenta nuevamente.');
    }
  };

  const handleDownloadNaxineInvoice = async (pagoId: number) => {
    try {
      const blob = await pagosService.descargarComprobanteNaxine(pagoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-naxine-${pagoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar comprobante de Naxine:', err);
      alert('Error al descargar el comprobante de Naxine. Por favor, intenta nuevamente.');
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingFile(null);
  };


  const sessions = pagos.map(mapPagoToSession);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel De Pagos
        </h1>
        <div className="flex items-center gap-2 text-sm mb-6">
          <span className="text-primary font-medium">
            Administración de Pagos
          </span>
          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-500">Dashboard de Pagos</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-gray-600">Cargando datos...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600">
            <p className="font-medium">Error al cargar los datos</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Balance General */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Balance General
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    $0.00
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    La plataforma no gestiona dinero
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Ventas (Sesiones) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Ventas (Sesiones)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(typeof estadisticas.total_ventas === 'number' ? estadisticas.total_ventas : parseFloat(String(estadisticas.total_ventas || 0))).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center p-2">
                  <ShoppingCart className="w-6 h-6 text-green-600 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Clientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas.total_clientes || pagos.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Profesionales */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Profesionales
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas.total_profesionales || new Set(pagos.map(p => p.id_profesional)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Folder className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Ingresos Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Estadísticas Ingresos
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ingresos Netos</span>
                </div>
              </div>
            </div>

            {/* Chart - Lazy loaded */}
            <div className="h-64">
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Cargando gráfico...</p>
                    </div>
                  </div>
                }
              >
                <ChartLoader data={chartDataConfig} options={chartOptions} />
              </Suspense>
            </div>
          </div>

          {/* Sesiones Recientes Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sesiones Recientes
              </h3>
            </div>

            {sessions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-48">
                        Sesión / Especialidad
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-32">
                        Fecha y Hora
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-24">
                        ID Sesión
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-20">
                        Precio
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-20">
                        Comision
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-40">
                        Profesional
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-24">
                        Estado
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-40">
                        Factura Profesional
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-900 w-40">
                        Factura Naxine
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.session}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.specialty}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm text-gray-900">
                              {session.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.time}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {session.sessionId}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {session.price}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {session.commission}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-primary">
                            {session.professional}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.statusColor}`}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => handleDownloadInvoice(session.id)}
                            disabled={!session.tieneFacturaProfesional}
                            className={`text-sm font-medium ${
                              session.tieneFacturaProfesional
                                ? "text-primary hover:text-primary/80 cursor-pointer"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={!session.tieneFacturaProfesional ? "El profesional no ha subido la factura" : ""}
                          >
                            Descargar factura Profesional
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleDownloadNaxineInvoice(session.id)}
                            className="text-sm text-primary hover:text-primary/80 font-medium"
                          >
                            Descargar factura de Naxine
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {sessions.length > 0 && totalPagos > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1}-
                  {Math.min(
                    currentPage * itemsPerPage,
                    totalPagos
                  )}{" "}
                  de {totalPagos}
                </div>
                <div className="flex items-center gap-1">
                  {(() => {
                    const totalPages = Math.ceil(totalPagos / itemsPerPage);
                    if (totalPages <= 1) return null; // No mostrar paginación si solo hay una página
                    
                    return (
                      <>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === currentPage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {totalPages > 5 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={currentPage >= totalPages}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* View File Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Visualizar Factura
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingFile.name}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* File Content */}
              <div className="p-6 max-h-[70vh] overflow-auto">
                {viewingFile.name.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={viewingFile.url}
                    className="w-full h-96 border border-gray-200 rounded-lg"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="flex justify-center">
                    <img
                      src={viewingFile.url}
                      alt={viewingFile.name}
                      className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href={viewingFile.url}
                  download={viewingFile.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Descargar
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

