"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  CreditCard,
  DollarSign,
  User,
  Mail,
  Phone,
  X,
  RotateCcw,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { citasService, Cita } from "@/services/api/citas";
import { pagosService } from "@/services/api/pagos";
import { disponibilidadService } from "@/services/api/disponibilidad";

export default function AdminSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  // Modal states
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cita, setCita] = useState<Cita | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Reschedule states
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Cargar datos de la cita
  useEffect(() => {
    const loadCita = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await citasService.getCitaPorId(sessionId);
        
        console.log('Respuesta completa del servicio:', response);
        
        if (response.success && response.data) {
          // El apiClient devuelve: { success: true, data: { success: true, data: { cita: {...} } } }
          // El backend devuelve: { success: true, data: { cita: {...} } }
          // Por lo tanto, necesitamos acceder a response.data.data.cita
          const backendData = response.data;
          const citaData = backendData?.data?.cita || backendData?.cita || backendData;
          
          if (!citaData || !citaData.id_cita) {
            console.error('No se encontró la cita en la respuesta:', response);
            setError('No se pudo obtener la información de la cita');
            return;
          }
          
          console.log('Datos de la cita cargados:', citaData);
          setCita(citaData);
        } else {
          console.error('Error en la respuesta:', response);
          setError(response.error || 'Error al cargar la sesión');
        }
      } catch (err) {
        console.error('Error al cargar cita:', err);
        setError('Error al cargar la sesión. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadCita();
  }, [sessionId]);

  // Función para mapear datos de la cita al formato de la UI
  const mapCitaToSession = (cita: Cita) => {
    if (!cita || !cita.fecha_inicio) {
      console.error('Cita inválida o sin fecha_inicio:', cita);
      return null;
    }

    let fechaInicio: Date;
    try {
      fechaInicio = new Date(cita.fecha_inicio);
      if (isNaN(fechaInicio.getTime())) {
        console.error('Fecha inválida:', cita.fecha_inicio);
        fechaInicio = new Date(); // Fallback a fecha actual
      }
    } catch (error) {
      console.error('Error al parsear fecha:', error);
      fechaInicio = new Date(); // Fallback a fecha actual
    }

    const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const horaFormateada = fechaInicio.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const fechaHoraCompleta = `${fechaFormateada} a las ${horaFormateada}`;

    // Formatear precio
    const montoNumero = cita.pago_monto 
      ? (typeof cita.pago_monto === 'string' 
          ? parseFloat(cita.pago_monto) 
          : Number(cita.pago_monto))
      : null;
    const precio = montoNumero && !isNaN(montoNumero)
      ? `${montoNumero.toFixed(2)}€`
      : 'N/A';

    // Mapear estado
    let status = cita.estado;
    let statusColor = "bg-gray-100 text-gray-800";
    
    if (cita.estado === 'pendiente') {
      status = 'Pendiente';
      statusColor = "bg-orange-100 text-orange-800";
    } else if (cita.estado === 'confirmada' || cita.estado === 'activa') {
      status = 'Confirmada';
      statusColor = "bg-green-100 text-green-800";
    } else if (cita.estado === 'cancelada') {
      status = 'Cancelada';
      statusColor = "bg-red-100 text-red-800";
    } else if (cita.estado === 'completada') {
      status = 'Completada';
      statusColor = "bg-blue-100 text-blue-800";
    }

    // Determinar tipo de sesión
    const tipoSesion = cita.tipo_atencion === 'en_linea' 
      ? 'Sesión en Línea' 
      : cita.tipo_atencion === 'a_domicilio'
      ? 'Sesión a Domicilio'
      : 'Sesión Presencial';

    return {
      id: cita.id_cita,
      orderNumber: String(cita.id_cita).padStart(8, '0'),
      date: fechaHoraCompleta,
      status,
      statusColor,
      product: {
        name: tipoSesion,
        price: precio,
        description: cita.notas || 'Sin descripción',
        specialty: "Nutriología", // TODO: Obtener especialidad del profesional
        icon: "🩺",
      },
      paymentMethod: {
        type: "Stripe",
        number: "**** **** ****",
        expiry: "N/A",
        cardholder: cita.cliente_nombre || 'Cliente',
      },
      client: {
        name: cita.cliente_nombre || 'Cliente desconocido',
        email: cita.cliente_email || 'Email no disponible',
        phone: cita.cliente_telefono || 'Teléfono no disponible',
      },
      pricing: {
        productPrice: precio,
        taxes: "0.00€",
        total: precio,
      },
      pago_monto: montoNumero || 0,
      id_pago: cita.id_pago,
    };
  };

  const session = cita ? (mapCitaToSession(cita) || {
    id: sessionId,
    orderNumber: String(sessionId).padStart(8, '0'),
    date: "Fecha no disponible",
    status: "Error",
    statusColor: "bg-red-100 text-red-800",
    product: {
      name: "Error al cargar",
      price: "N/A",
      description: "No se pudieron cargar los datos de la cita",
      specialty: "N/A",
      icon: "⚠️",
    },
    paymentMethod: {
      type: "N/A",
      number: "****",
      expiry: "N/A",
      cardholder: "N/A",
    },
    client: {
      name: "N/A",
      email: "N/A",
      phone: "N/A",
    },
    pricing: {
      productPrice: "N/A",
      taxes: "0.00€",
      total: "N/A",
    },
    pago_monto: 0,
    id_pago: undefined,
  }) : {
    id: sessionId,
    orderNumber: "00000000",
    date: "Cargando...",
    status: "Cargando...",
    statusColor: "bg-gray-100 text-gray-800",
    product: {
      name: "Cargando...",
      price: "N/A",
      description: "Cargando...",
      specialty: "Cargando...",
      icon: "🩺",
    },
    paymentMethod: {
      type: "Cargando...",
      number: "****",
      expiry: "N/A",
      cardholder: "Cargando...",
    },
    client: {
      name: "Cargando...",
      email: "Cargando...",
      phone: "N/A",
    },
    pricing: {
      productPrice: "N/A",
      taxes: "$0.00",
      total: "N/A",
    },
    pago_monto: 0,
    id_pago: undefined,
  };

  const handleRefund = () => {
    setIsRefundModalOpen(true);
  };

  const handleReschedule = () => {
    if (cita) {
      // Establecer fecha y hora actuales como valores iniciales
      const fechaActual = new Date(cita.fecha_inicio);
      const fechaStr = fechaActual.toISOString().split('T')[0];
      const horaStr = fechaActual.toTimeString().slice(0, 5);
      setNewDate(fechaStr);
      setNewTime(horaStr);
    }
    setIsRescheduleModalOpen(true);
  };

  const confirmRefund = async () => {
    if (!cita || !cita.id_pago) {
      setError('No se puede procesar el reembolso: falta información del pago');
      setIsRefundModalOpen(false);
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Procesar reembolso a través de Stripe
      const response = await pagosService.procesarReembolso(cita.id_pago, {
        cancelar_cita: true,
        motivo: 'Reembolso solicitado por administrador'
      });
      
      if (response.success && response.data) {
        // El backend ya cancela la cita automáticamente si cancelar_cita es true
        // Recargar los datos
        const citaResponse = await citasService.getCitaPorId(sessionId);
        if (citaResponse.success && citaResponse.data) {
          const backendData = citaResponse.data;
          const citaData = backendData?.data?.cita || backendData?.cita || backendData;
          if (citaData && citaData.id_cita) {
            setCita(citaData);
          }
        }
        
        setIsRefundModalOpen(false);
        // Mostrar mensaje de éxito con información del reembolso
        const refundData = response.data.refund;
        if (refundData) {
          alert(`Reembolso procesado exitosamente. ID de reembolso: ${refundData.id}. Monto: ${refundData.amount} ${refundData.currency.toUpperCase()}`);
        } else {
          alert('Reembolso procesado exitosamente');
        }
      } else {
        setError(response.error || 'Error al procesar el reembolso');
      }
    } catch (err) {
      console.error('Error al procesar reembolso:', err);
      setError('Error al procesar el reembolso. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReschedule = async () => {
    if (!cita || !newDate || !newTime) {
      setError('Por favor, selecciona una fecha y hora válidas');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setCheckingAvailability(true);

      // Construir nueva fecha y hora
      const nuevaFechaInicio = new Date(`${newDate}T${newTime}:00`);
      const nuevaFechaFin = new Date(nuevaFechaInicio);
      
      // Calcular duración basada en la cita original
      const fechaInicioOriginal = new Date(cita.fecha_inicio);
      const fechaFinOriginal = new Date(cita.fecha_fin);
      const duracionMs = fechaFinOriginal.getTime() - fechaInicioOriginal.getTime();
      nuevaFechaFin.setTime(nuevaFechaInicio.getTime() + duracionMs);

      // Verificar disponibilidad del profesional
      const disponibilidadResponse = await disponibilidadService.getCitasOcupadas(
        cita.id_profesional,
        nuevaFechaInicio.toISOString(),
        nuevaFechaFin.toISOString(),
        cita.tipo_atencion || undefined
      );

      if (disponibilidadResponse.success && disponibilidadResponse.data) {
        const citasOcupadas = disponibilidadResponse.data.citas || [];
        
        // Filtrar la cita actual (excluirla del chequeo de conflictos)
        const otrasCitasOcupadas = citasOcupadas.filter(
          (c: any) => c.id_cita !== cita.id_cita
        );

        if (otrasCitasOcupadas.length > 0) {
          setError('El profesional ya tiene una cita programada en este horario. Por favor, selecciona otro horario.');
          setCheckingAvailability(false);
          return;
        }
      }

      // Actualizar la cita con las nuevas fechas
      // Incluir id_cliente e id_profesional porque la validación del backend los requiere
      const response = await citasService.actualizarCita(sessionId, {
        id_cliente: cita.id_cliente,
        id_profesional: cita.id_profesional,
        fecha_inicio: nuevaFechaInicio.toISOString(),
        fecha_fin: nuevaFechaFin.toISOString(),
      });

      if (response.success) {
        // Recargar los datos
        const citaResponse = await citasService.getCitaPorId(sessionId);
        if (citaResponse.success && citaResponse.data) {
          const backendData = citaResponse.data;
          const citaData = backendData?.data?.cita || backendData?.cita || backendData;
          if (citaData && citaData.id_cita) {
            setCita(citaData);
          }
        }
        
        setIsRescheduleModalOpen(false);
        setNewDate("");
        setNewTime("");
        alert('Cita reagendada exitosamente');
      } else {
        setError(response.error || 'Error al reagendar la cita');
      }
    } catch (err) {
      console.error('Error al reagendar cita:', err);
      setError('Error al reagendar la cita. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(false);
      setCheckingAvailability(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 -mx-6 px-6 mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administración de Sesiones
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">
              Administración de Sesiones
            </span>
            <span className="text-gray-400">{">"}</span>
            <span className="text-gray-500">Lista de sesiones</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-gray-600">Cargando sesión...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600">
              <p className="font-medium">Error al cargar la sesión</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Resumen de la sesión */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de la sesión
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Número de pedido:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.statusColor}`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Producto */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Producto
              </h2>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {session.product.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {session.product.name}
                  </h3>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {session.product.price}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {session.product.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.product.specialty}
                  </p>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Método de Pago
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {session.paymentMethod.type}
                  </span>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {session.paymentMethod.number}
                </div>
                <div className="text-sm text-gray-600">
                  Expira {session.paymentMethod.expiry}
                </div>
                <div className="text-sm text-gray-600">
                  {session.paymentMethod.cardholder}
                </div>
                <div className="flex justify-end">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-orange-500 rounded-sm -ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleReschedule}
                  disabled={!cita || cita.estado === 'cancelada' || cita.estado === 'completada'}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Reagendar Sesión
                </button>
                <button
                  onClick={handleRefund}
                  disabled={!cita || !cita.id_pago || cita.pago_estado === 'reembolsado'}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rembolsar Sesión
                </button>
              </div>
            </div>

            {/* Detalles del Cliente */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles del Cliente
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {session.client.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Correo Electrónico:
                  </span>
                  <span className="text-sm text-gray-900">
                    {session.client.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <span className="text-sm text-gray-900">
                    {session.client.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Precios
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Product Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.pricing.productPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impuestos:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.pricing.taxes}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {session.pricing.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmar Reembolso
              </h2>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Estás seguro que deseas reembolsar esta sesión?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción procesará un reembolso de {session.pricing.total} al método de
                    pago original. La sesión será cancelada automáticamente.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRefund}
                  disabled={processing}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Reembolso'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Reagendar Sesión
              </h2>
              <button
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setError(null);
                  setNewDate("");
                  setNewTime("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Nueva Fecha
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={processing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-2" />
                    Nueva Hora
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={processing}
                  />
                </div>

                {cita && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Fecha actual:</strong> {new Date(cita.fecha_inicio).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Duración:</strong> {Math.round((new Date(cita.fecha_fin).getTime() - new Date(cita.fecha_inicio).getTime()) / (1000 * 60))} minutos
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsRescheduleModalOpen(false);
                    setError(null);
                    setNewDate("");
                    setNewTime("");
                  }}
                  disabled={processing}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReschedule}
                  disabled={processing || !newDate || !newTime}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {checkingAvailability ? 'Verificando disponibilidad...' : 'Reagendando...'}
                    </>
                  ) : (
                    'Confirmar Reagendamiento'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
