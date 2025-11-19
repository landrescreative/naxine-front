"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { citasService, Cita } from "@/services/api/citas";

interface SessionDisplay {
  id: number;
  session: string;
  specialty: string;
  date: string;
  time: string;
  sessionNumber: string;
  price: string;
  professional: string;
  status: string;
  statusColor: string;
}

export default function AdminSesionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionDisplay[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const pageSize = 10;

  // Filter states
  const [filters, setFilters] = useState({
    status: {
      activo: false,
      pendiente: false,
      cancelada: false,
    },
    income: {
      min: "",
      max: "",
    },
  });

  const handleFilterChange = (
    category: "status" | "income",
    filter: string,
    value?: string
  ) => {
    if (category === "status") {
      setFilters((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [filter]:
            !prev[category][filter as keyof (typeof prev)[typeof category]],
        },
      }));
    } else if (category === "income" && value !== undefined) {
      setFilters((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [filter]: value,
        },
      }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      status: {
        activo: false,
        pendiente: false,
        cancelada: false,
      },
      income: {
        min: "",
        max: "",
      },
    });
  };

  // Función para mapear cita de la API al formato de la UI
  const mapCitaToSession = (cita: Cita): SessionDisplay => {
    const fechaInicio = new Date(cita.fecha_inicio);
    const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormateada = fechaInicio.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Determinar el tipo de sesión basado en el número de cita o tipo de atención
    const tipoSesion = cita.tipo_atencion === 'en_linea' 
      ? 'Sesión en Línea' 
      : cita.tipo_atencion === 'a_domicilio'
      ? 'Sesión a Domicilio'
      : 'Sesión Presencial';

    // Formatear precio - convertir a número si es string o null/undefined
    const montoNumero = cita.pago_monto 
      ? (typeof cita.pago_monto === 'string' 
          ? parseFloat(cita.pago_monto) 
          : Number(cita.pago_monto))
      : null;
    const precio = montoNumero && !isNaN(montoNumero)
      ? `$${montoNumero.toFixed(2)} USD`
      : 'N/A';

    // Mapear estado
    let status = cita.estado;
    let statusColor = "bg-gray-100 text-gray-800";
    
    if (cita.estado === 'pendiente') {
      status = 'Pendiente';
      statusColor = "bg-orange-100 text-orange-800";
    } else if (cita.estado === 'confirmada' || cita.estado === 'activa') {
      status = 'Activo';
      statusColor = "bg-green-100 text-green-800";
    } else if (cita.estado === 'cancelada') {
      status = 'Cancelada';
      statusColor = "bg-red-100 text-red-800";
    } else if (cita.estado === 'completada') {
      status = 'Completada';
      statusColor = "bg-blue-100 text-blue-800";
    }

    return {
      id: cita.id_cita,
      session: tipoSesion,
      specialty: "Nutriología", // TODO: Obtener especialidad del profesional
      date: fechaFormateada,
      time: horaFormateada,
      sessionNumber: String(cita.id_cita).padStart(8, '0'),
      price: precio,
      professional: cita.profesional_nombre || 'Profesional desconocido',
      status,
      statusColor,
    };
  };

  // Cargar citas desde la API
  const loadCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de filtro
      const params: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };

      // Aplicar filtro de estado si está activo
      const estadosActivos: string[] = [];
      if (filters.status.activo) estadosActivos.push('confirmada', 'activa');
      if (filters.status.pendiente) estadosActivos.push('pendiente');
      if (filters.status.cancelada) estadosActivos.push('cancelada');
      
      if (estadosActivos.length > 0) {
        // Si hay múltiples estados, necesitamos hacer múltiples llamadas o filtrar en el frontend
        // Por ahora, usamos el primero o hacemos la llamada sin filtro y filtramos después
        params.estado = estadosActivos[0]; // El backend solo acepta un estado a la vez
      }

      const response = await citasService.getAllCitas(params);

      console.log("[AdminSesionesPage] Respuesta completa:", response);
      console.log("[AdminSesionesPage] response.success:", response.success);
      console.log("[AdminSesionesPage] response.data:", response.data);
      console.log("[AdminSesionesPage] response.data (JSON):", JSON.stringify(response.data, null, 2));

      if (response.success && response.data) {
        // El backend devuelve: { success: true, data: { citas: [...], paginacion: {...} } }
        // ApiClient devuelve esto completo en response.data, así que necesitamos acceder a response.data.data
        console.log("[AdminSesionesPage] Keys de response.data:", Object.keys(response.data));
        
        let citas: any[] = [];
        let paginacion: any = { total: 0 };

        // Intentar diferentes estructuras
        if (response.data.data && response.data.data.citas && Array.isArray(response.data.data.citas)) {
          // Estructura: { success: true, data: { citas: [...], paginacion: {...} } }
          citas = response.data.data.citas;
          paginacion = response.data.data.paginacion || { total: 0 };
          console.log("[AdminSesionesPage] Usando response.data.data.citas, cantidad:", citas.length);
        } else if (response.data.citas && Array.isArray(response.data.citas)) {
          // Estructura: { citas: [...], paginacion: {...} }
          citas = response.data.citas;
          paginacion = response.data.paginacion || { total: 0 };
          console.log("[AdminSesionesPage] Usando response.data.citas, cantidad:", citas.length);
        } else if (Array.isArray(response.data)) {
          // Estructura: array directo
          citas = response.data;
          console.log("[AdminSesionesPage] Usando response.data como array, cantidad:", citas.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Estructura: { data: [...] }
          citas = response.data.data;
          console.log("[AdminSesionesPage] Usando response.data.data como array, cantidad:", citas.length);
        } else {
          console.warn("[AdminSesionesPage] No se pudo encontrar el array de citas en la respuesta");
          console.warn("[AdminSesionesPage] Estructura completa:", JSON.stringify(response.data, null, 2));
        }

        // Verificar que citas sea un array
        if (!Array.isArray(citas)) {
          console.error('Las citas no son un array:', citas);
          setError('Error: formato de respuesta inválido');
          setSessions([]);
          return;
        }

        let citasFiltradas = [...citas];

        // Filtrar por múltiples estados en el frontend si es necesario
        if (estadosActivos.length > 0) {
          citasFiltradas = citasFiltradas.filter(cita => 
            estadosActivos.includes(cita.estado)
          );
        }

        // Filtrar por rango de ingresos si está configurado
        if (filters.income.min || filters.income.max) {
          const min = filters.income.min ? parseFloat(filters.income.min) : 0;
          const max = filters.income.max ? parseFloat(filters.income.max) : Infinity;
          citasFiltradas = citasFiltradas.filter(cita => {
            // Convertir pago_monto a número si es necesario
            const monto = cita.pago_monto 
              ? (typeof cita.pago_monto === 'string' 
                  ? parseFloat(cita.pago_monto) 
                  : Number(cita.pago_monto))
              : 0;
            return !isNaN(monto) && monto >= min && monto <= max;
          });
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          citasFiltradas = citasFiltradas.filter(cita => 
            cita.profesional_nombre?.toLowerCase().includes(term) ||
            cita.cliente_nombre?.toLowerCase().includes(term) ||
            String(cita.id_cita).includes(term)
          );
        }

        // Mapear citas al formato de la UI
        const sessionsMapped = citasFiltradas.map(mapCitaToSession);
        setSessions(sessionsMapped);
        setTotalSessions(paginacion.total || citasFiltradas.length);
      } else {
        setError(response.error || 'Error al cargar las citas');
        setSessions([]);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
      setError('Error al cargar las citas. Por favor, intenta nuevamente.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, searchTerm, pageSize]);

  // Cargar citas cuando cambian los filtros, página o término de búsqueda
  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  const handleApplyFilters = () => {
    setCurrentPage(1); // Resetear a la primera página al aplicar filtros
    setIsFilterOpen(false);
  };

  const handleEditSession = (sessionId: number) => {
    router.push(`/dashboard/admin/sesiones/${sessionId}`);
  };

  // Mock session data (removido - ahora usamos datos reales)

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

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Sesión / Especialidad
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Fecha y Hora
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Número de Sesión
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Precio
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Profesional
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-gray-600">Cargando sesiones...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-red-600">
                        <p className="font-medium">Error al cargar las sesiones</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                          onClick={loadCitas}
                          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                          Reintentar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No se encontraron sesiones
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
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
                        <div className="text-sm font-medium text-gray-900">
                          {session.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">
                        {session.sessionNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">
                        {session.price}
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
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditSession(session.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {sessions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, totalSessions)} de {totalSessions}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(totalSessions / pageSize)) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                );
              })}
              {Math.ceil(totalSessions / pageSize) > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalSessions / pageSize) || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="text-gray-500 hover:text-gray-700 underline text-sm"
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-6">
              {/* Estado Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Estado</h3>
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.activo}
                      onChange={() => handleFilterChange("status", "activo")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Activo</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.pendiente}
                      onChange={() => handleFilterChange("status", "pendiente")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Pendiente</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.cancelada}
                      onChange={() => handleFilterChange("status", "cancelada")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Cancelada</span>
                  </label>
                </div>
              </div>

              {/* Ingresos Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Ingresos
                  </h3>
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Minimo
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Minimo..."
                        value={filters.income.min}
                        onChange={(e) =>
                          handleFilterChange("income", "min", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Maximo
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Máximo..."
                        value={filters.income.max}
                        onChange={(e) =>
                          handleFilterChange("income", "max", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                Aplicar Filtro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
