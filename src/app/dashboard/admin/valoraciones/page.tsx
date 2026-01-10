"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  X,
} from "lucide-react";
import { valoracionesService, ValoracionItem } from "@/services/api/valoraciones";

export default function AdminValoracionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    rating: {
      "4.0-5.0": false,
      "3.0-4.0": false,
      "2.0-3.0": false,
      "1.0-2.0": false,
    },
  });
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const [items, setItems] = useState<ValoracionItem[]>([]);

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const ratings = useMemo(() => {
    return items.map((v) => {
      const rating = typeof v.calificacion === "number" ? v.calificacion : 0;
      const status = v.estado === "aprobada" ? "Aprobada" : v.estado === "rechazada" ? "Rechazada" : "Pendiente";
      const statusColor =
        v.estado === "aprobada"
          ? "bg-green-100 text-green-800"
          : v.estado === "rechazada"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800";
      const date =
        v.fecha_valoracion
          ? new Date(v.fecha_valoracion).toLocaleDateString("es-ES")
          : "-";
      return {
        id: v.id_valoracion,
        client: v.clientes_nombre || "Cliente",
        product: "Sesión",
        rating,
        professional: v.profesional_nombre || "Profesional",
        message: v.comentario || "",
        date,
        status,
        statusColor,
      };
    });
  }, [items]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (page - 1) * pageSize;
        const resp = await valoracionesService.getAll({ limit: pageSize, offset });
        
        console.log('[AdminValoracionesPage] Respuesta completa:', resp);
        console.log('[AdminValoracionesPage] resp.data:', resp.data);
        console.log('[AdminValoracionesPage] resp.data (JSON):', JSON.stringify(resp.data, null, 2));
        
        if (resp.success && resp.data) {
          console.log('[AdminValoracionesPage] Keys de resp.data:', Object.keys(resp.data));
          
          let list: ValoracionItem[] = Array.isArray(resp.data.valoraciones)
            ? resp.data.valoraciones
            : [];
          let pag: any = resp.data.paginacion || { total: list.length };

          // Compatibilidad con estructuras antiguas
          if (list.length === 0) {
            const legacyData = resp.data as any;

            if (
              legacyData?.data?.valoraciones &&
              Array.isArray(legacyData.data.valoraciones)
            ) {
              list = legacyData.data.valoraciones;
              pag = legacyData.data.paginacion || pag;
              console.log(
                '[AdminValoracionesPage] Usando legacy data.valoraciones, cantidad:',
                list.length
              );
            } else if (Array.isArray(legacyData)) {
              list = legacyData;
            pag = { total: list.length };
              console.log(
                '[AdminValoracionesPage] Usando legacy array directo, cantidad:',
                list.length
              );
            } else if (
              legacyData?.data &&
              Array.isArray(legacyData.data)
            ) {
              list = legacyData.data;
            pag = { total: list.length };
              console.log(
                '[AdminValoracionesPage] Usando legacy data[] como array, cantidad:',
                list.length
              );
            } else {
              console.warn('[AdminValoracionesPage] No se pudo encontrar el array de valoraciones en la respuesta');
              console.warn('[AdminValoracionesPage] Estructura completa:', JSON.stringify(legacyData, null, 2));
            }
          } else {
            console.log('[AdminValoracionesPage] Usando resp.data.valoraciones, cantidad:', list.length);
          }
          
          setItems(list);
          setTotal(pag.total || list.length);
          setSelectedRows([]);
        } else {
          setError(resp.error || "Error al cargar valoraciones");
        }
      } catch (e: any) {
        setError(e?.message || "Error al cargar valoraciones");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize]);

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === ratings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(ratings.map((rating) => rating.id));
    }
  };

  const handleViewRating = async (id: number) => {
    setIsReviewModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);
    try {
      const response = await valoracionesService.getById(id);
      console.log('[AdminValoracionesPage] Respuesta getById:', response);
      
      if (response.success && response.data) {
        // El apiClient devuelve: { success: true, data: { valoracion: {...} } }
        // response.data es de tipo { valoracion: ValoracionItem }
        const backendData = response.data;
        const valoracion = backendData?.valoracion;
        
        if (!valoracion || !valoracion.id_valoracion) {
          console.error('[AdminValoracionesPage] No se encontró la valoración en la respuesta:', response);
          setModalError("No se pudo obtener la información de la valoración");
          setSelectedReview(null);
          return;
        }
        
        console.log('[AdminValoracionesPage] Valoración cargada:', valoracion);
        setSelectedReview(valoracion);
      } else {
        console.error('[AdminValoracionesPage] Error en la respuesta:', response);
        setModalError(response.error || "Error al cargar la valoración");
        setSelectedReview(null);
      }
    } catch (error: any) {
      console.error('[AdminValoracionesPage] Error al cargar valoración:', error);
      setModalError(error?.message || "Error al cargar la valoración.");
      setSelectedReview(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleApproveReview = async () => {
    if (!selectedReview) return;
    try {
      setModalError(null);
      setModalSuccess(null);
      const resp = await valoracionesService.cambiarEstado(selectedReview.id_valoracion || selectedReview.id, 'aprobada');
      console.log('[AdminValoracionesPage] Respuesta cambiarEstado (aprobada):', resp);
      
      if (!resp.success) {
        setModalError(resp.error || 'No se pudo aprobar la reseña');
        return;
      }
      
      setModalSuccess('Valoración aprobada correctamente');
      
      // Actualizar el estado local de la valoración
      setSelectedReview({ ...selectedReview, estado: 'aprobada' });
      
      // Refrescar listado
      const offset = (page - 1) * pageSize;
      const refreshed = await valoracionesService.getAll({ limit: pageSize, offset });
      if (refreshed.success && refreshed.data) {
        const backendData = refreshed.data;
        // response.data es de tipo ValoracionesListResponse que tiene valoraciones y paginacion directamente
        const valoraciones = backendData?.valoraciones || [];
        const paginacion = backendData?.paginacion;
        setItems(valoraciones);
        setTotal(paginacion?.total || valoraciones.length || 0);
      }
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setSelectedReview(null);
        setModalSuccess(null);
      }, 2000);
    } catch (e: any) {
      console.error('[AdminValoracionesPage] Error al aprobar reseña:', e);
      setModalError(e?.message || 'Error al aprobar la reseña');
    }
  };

  const handleMarkInappropriate = async () => {
    if (!selectedReview) return;
    try {
      setModalError(null);
      setModalSuccess(null);
      const resp = await valoracionesService.cambiarEstado(selectedReview.id_valoracion || selectedReview.id, 'rechazada');
      console.log('[AdminValoracionesPage] Respuesta cambiarEstado (rechazada):', resp);
      
      if (!resp.success) {
        setModalError(resp.error || 'No se pudo marcar como inapropiada');
        return;
      }
      
      setModalSuccess('Valoración marcada como inapropiada');
      
      // Actualizar el estado local de la valoración
      setSelectedReview({ ...selectedReview, estado: 'rechazada' });
      
      // Refrescar listado
      const offset = (page - 1) * pageSize;
      const refreshed = await valoracionesService.getAll({ limit: pageSize, offset });
      if (refreshed.success && refreshed.data) {
        const backendData = refreshed.data;
        // response.data es de tipo ValoracionesListResponse que tiene valoraciones y paginacion directamente
        const valoraciones = backendData?.valoraciones || [];
        const paginacion = backendData?.paginacion;
        setItems(valoraciones);
        setTotal(paginacion?.total || valoraciones.length || 0);
      }
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setSelectedReview(null);
        setModalSuccess(null);
      }, 2000);
    } catch (e: any) {
      console.error('[AdminValoracionesPage] Error al marcar como inapropiada:', e);
      setModalError(e?.message || 'Error al marcar como inapropiada');
    }
  };
  const handleFilterChange = (category: string, filter: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [filter]: !(prev[category as keyof typeof prev] as any)[filter],
      },
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      rating: {
        "4.0-5.0": false,
        "3.0-4.0": false,
        "2.0-3.0": false,
        "1.0-2.0": false,
      },
    });
  };

  const handleApplyFilters = () => {
    // Apply filter logic here
    console.log("Applying filters:", filters);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = Object.values(filters.rating).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 -mx-6 px-6 mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Valoraciones
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">Valoraciones</span>
            <span className="text-gray-400">{">"}</span>
            <span className="text-gray-500">Lista de valoraciones</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reseña"
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
          {loading ? (
            <div className="p-8 text-center text-gray-600">Cargando valoraciones...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : (
          <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === ratings.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Cliente / Producto
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Ratings
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1">
                      Profesional
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1">
                      Mensaje
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1">
                      Fecha
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rating.id)}
                        onChange={() => handleSelectRow(rating.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rating.client}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rating.product}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {rating.rating}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-primary">
                        {rating.professional}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {rating.message}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{rating.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rating.statusColor}`}
                      >
                        {rating.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewRating(rating.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mostrando {items.length} de {total}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium">
                {page}
              </span>
              <button
                onClick={() => {
                  const nextOffset = page * pageSize;
                  if (nextOffset < total) setPage((p) => p + 1);
                }}
                disabled={page * pageSize >= total}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-gray-600 underline hover:text-gray-800"
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
              <div className="p-6">
                {/* Rating Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsRatingExpanded(!isRatingExpanded)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      Rating
                    </span>
                    {isRatingExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {isRatingExpanded && (
                    <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                      {Object.entries(filters.rating).map(
                        ([range, checked]) => (
                          <label
                            key={range}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleFilterChange("rating", range)
                              }
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              {range}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyFilters}
                  disabled={!hasActiveFilters}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    hasActiveFilters
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Aplicar Filtro
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Details Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 border border-primary/20"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Detalles de la reseña
                  </h2>
                  <p className="text-sm text-gray-600">
                    Puedes aprobar o desaprobar la reseña que ha dejado el
                    cliente.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedReview(null);
                    setModalError(null);
                    setModalSuccess(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando valoración...</p>
                    </div>
                  </div>
                ) : modalError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{modalError}</p>
                    <button
                      onClick={() => {
                        setIsReviewModalOpen(false);
                        setModalError(null);
                        setSelectedReview(null);
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : modalSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-600">{modalSuccess}</p>
                  </div>
                ) : selectedReview ? (
                  <>
                    {/* Reviewer and Professional Info */}
                    <div className="flex items-center justify-between mb-8 gap-16 px-4">
                      {/* Reviewer */}
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {selectedReview.clientes_nombre || 'Cliente'}
                          </h3>
                          <p className="text-sm text-gray-500">Cliente</p>
                        </div>
                      </div>

                  {/* Professional */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedReview.profesional_nombre || 'Profesional'}
                      </h3>
                      <p className="text-sm text-gray-500">Profesional</p>
                    </div>
                  </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        Reseña
                      </h4>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedReview?.comentario || 'Sin mensaje'}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-8">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
                              i < Math.floor(selectedReview?.calificacion || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({selectedReview?.calificacion || 0}/5)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4">
                      <button
                        onClick={handleMarkInappropriate}
                        disabled={selectedReview.estado === 'rechazada'}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Marcar como inapropiado
                      </button>
                      <button
                        onClick={handleApproveReview}
                        disabled={selectedReview.estado === 'aprobada'}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aprobar Reseña
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No se pudo cargar la valoración</p>
                    <button
                      onClick={() => {
                        setIsReviewModalOpen(false);
                        setSelectedReview(null);
                      }}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
