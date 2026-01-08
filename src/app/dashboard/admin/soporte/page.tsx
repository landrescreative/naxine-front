"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  CheckCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { useTickets } from "@/hooks/useTickets";
import { Ticket, TicketStatus } from "@/services/api/tickets";

// Helper function to map API status to UI display
const getStatusDisplay = (status: TicketStatus) => {
  switch (status) {
    case "abierto":
      return { label: "Pendiente", color: "bg-red-100 text-red-800" };
    case "en proceso":
      return { label: "En Proceso", color: "bg-yellow-100 text-yellow-800" };
    case "cerrado":
      return { label: "Resuelto", color: "bg-green-100 text-green-800" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "Fecha no disponible";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

export default function AdminSoportePage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(
    undefined
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const prevStatusFilterRef = useRef<TicketStatus | undefined>(undefined);

  const {
    tickets,
    loading,
    error,
    total,
    currentOffset,
    limit,
    updateTicketStatus,
    getTicketById,
    nextPage,
    prevPage,
    goToPage,
    refreshTickets,
  } = useTickets({
    estado: statusFilter,
    limit: 15,
    offset: 0,
    autoLoad: true,
  });

  // Reset offset when filter changes
  useEffect(() => {
    const prevFilter = prevStatusFilterRef.current;
    prevStatusFilterRef.current = statusFilter;
    
    // Only reset if filter actually changed (not on initial mount)
    if (prevFilter !== undefined && prevFilter !== statusFilter && currentOffset !== 0) {
      goToPage(0);
    }
  }, [statusFilter, currentOffset, goToPage]);

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === tickets.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tickets.map((ticket) => ticket.id_ticket));
    }
  };

  const handleViewTicket = async (id: number) => {
    try {
      // Primero intentar usar el ticket de la lista si está disponible
      const ticketFromList = tickets.find((t) => t.id_ticket === id);
      if (ticketFromList) {
        setSelectedTicket(ticketFromList);
        setIsTicketModalOpen(true);
        return;
      }

      // Si no está en la lista, obtenerlo del API
      const result = await getTicketById(id);
      if (result.success && result.data) {
        setSelectedTicket(result.data);
        setIsTicketModalOpen(true);
      } else {
        console.error("[AdminSoportePage] Error al obtener ticket:", result.error);
      }
    } catch (error) {
      console.error("[AdminSoportePage] Error en handleViewTicket:", error);
    }
  };

  const handleCloseModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSendEmail = () => {
    if (selectedTicket?.correo) {
      window.location.href = `mailto:${selectedTicket.correo}`;
    } else if (selectedTicket?.usuario?.email) {
      window.location.href = `mailto:${selectedTicket.usuario.email}`;
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    const result = await updateTicketStatus(selectedTicket.id_ticket, newStatus);

    if (result.success && result.data) {
      // Cerrar el modal después de actualizar exitosamente
      setIsTicketModalOpen(false);
      setSelectedTicket(null);
      // Refresh the list para actualizar el ticket en la lista
      refreshTickets();
    } else {
      // Si falla, mostrar error pero mantener el modal abierto
      console.error("Error al actualizar estado:", result.error);
    }
    setIsUpdatingStatus(false);
  };

  const handleMarkResolved = async () => {
    await handleUpdateStatus("cerrado");
  };

  const handleMarkInProcess = async () => {
    await handleUpdateStatus("en proceso");
  };

  const handleReopen = async () => {
    await handleUpdateStatus("abierto");
  };

  const currentPage = Math.floor(currentOffset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const startItem = currentOffset + 1;
  const endItem = Math.min(currentOffset + limit, total);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isTicketModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isTicketModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 -mx-6 px-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tickets de Soporte
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-medium">
            Administración de Soporte
          </span>
          <span className="text-gray-400">{">"}</span>
          <span className="text-gray-500">Tickets de Soporte</span>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Filters */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === undefined
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("abierto")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "abierto"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter("en proceso")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "en proceso"
                  ? "bg-yellow-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setStatusFilter("cerrado")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "cerrado"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Resueltos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200" role="alert" aria-live="assertive">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading && tickets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Cargando tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No hay tickets disponibles</p>
                  {total > 0 && (
                    <p className="text-xs text-gray-400">
                      Total en servidor: {total} | Tickets cargados: {tickets.length}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="w-12 py-4 px-6">
                      <input
                        type="checkbox"
                        checked={
                          tickets.length > 0 &&
                          selectedRows.length === tickets.length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        aria-label="Seleccionar todos los tickets"
                      />
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Usuario
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Asunto
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Mensaje
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Fecha
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Estado
                    </th>
                    <th scope="col" className="text-left py-4 px-6 text-sm font-medium text-gray-900">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket, index) => {
                    const statusDisplay = getStatusDisplay(ticket.estado);
                    return (
                      <tr key={ticket.id_ticket || `ticket-${index}`} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(ticket.id_ticket)}
                            onChange={() => handleSelectRow(ticket.id_ticket)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            aria-label={`Seleccionar ticket ${ticket.id_ticket}`}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.usuario?.nombre || "Usuario desconocido"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.usuario?.rol || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.asunto}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {ticket.mensaje}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {formatDate(ticket.fecha_creacion)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
                          >
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleViewTicket(ticket.id_ticket)}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={loading}
                            aria-label={`Ver detalles del ticket ${ticket.id_ticket}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {tickets.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {startItem} - {endItem} de {total}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentOffset === 0 || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newOffset = (pageNum - 1) * limit;
                          goToPage(newOffset);
                        }}
                        disabled={loading}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentOffset + limit >= total || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {isTicketModalOpen && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto max-h-[calc(100vh-2rem)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Ticket #{selectedTicket.id_ticket}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusDisplay(selectedTicket.estado).color}`}
                    >
                      {getStatusDisplay(selectedTicket.estado).label}
                    </span>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* User Information */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full"></div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {selectedTicket.usuario?.nombre || "Usuario desconocido"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {selectedTicket.usuario?.rol || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="text-left sm:text-right">
                    {selectedTicket.telefono && (
                      <p className="text-xs sm:text-sm text-gray-900 font-medium break-words">
                        Teléfono: {selectedTicket.telefono}
                      </p>
                    )}
                    {(selectedTicket.correo || selectedTicket.usuario?.email) && (
                      <p className="text-xs sm:text-sm text-gray-900 font-medium break-all">
                        Correo: {selectedTicket.correo || selectedTicket.usuario?.email}
                      </p>
                    )}
                    {selectedTicket.fecha_creacion && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Fecha: {formatDate(selectedTicket.fecha_creacion)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Asunto
                  </h4>
                  <p className="text-sm sm:text-base text-gray-900 break-words">
                    {selectedTicket.asunto}
                  </p>
                </div>

                {/* Message Section */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                    Mensaje
                  </h4>
                  <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                      {selectedTicket.mensaje}
                    </p>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Cambiar Estado
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.estado !== "abierto" && (
                      <button
                        onClick={handleReopen}
                        disabled={isUpdatingStatus}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          "Reabrir"
                        )}
                      </button>
                    )}
                    {selectedTicket.estado !== "en proceso" && (
                      <button
                        onClick={handleMarkInProcess}
                        disabled={isUpdatingStatus}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          "En Proceso"
                        )}
                      </button>
                    )}
                    {selectedTicket.estado !== "cerrado" && (
                      <button
                        onClick={handleMarkResolved}
                        disabled={isUpdatingStatus}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          "Resuelto"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSendEmail}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Enviar correo electrónico</span>
                    <span className="sm:hidden">Enviar correo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
