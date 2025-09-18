"use client";

import { useState } from "react";
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

export default function AdminValoracionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
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

  // Mock ratings data
  const [ratings, setRatings] = useState([
    {
      id: 1,
      client: "John Store",
      product: "Primera Sesión",
      rating: 4.8,
      professional: "Dr. Ernesto Almeida",
      message: "Personalmente considero que la...",
      date: "2025 - 10 - 12",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      client: "Laura Stuff",
      product: "Primera Sesión",
      rating: 5.0,
      professional: "Dr. Ernesto Almeida",
      message: "Excelente servicio y atención...",
      date: "2025 - 10 - 11",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      client: "Laura Perez",
      product: "Primera Sesión",
      rating: 3.9,
      professional: "Dr. Ernesto Almeida",
      message: "Buen servicio pero podría mejorar...",
      date: "2025 - 10 - 10",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 4,
      client: "Maria Garcia",
      product: "Primera Sesión",
      rating: 4.5,
      professional: "Dr. Ernesto Almeida",
      message: "Muy satisfecha con el resultado...",
      date: "2025 - 10 - 09",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 5,
      client: "Carlos Rodriguez",
      product: "Primera Sesión",
      rating: 4.2,
      professional: "Dr. Ernesto Almeida",
      message: "Profesional muy competente...",
      date: "2025 - 10 - 08",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 6,
      client: "Ana Martinez",
      product: "Primera Sesión",
      rating: 4.7,
      professional: "Dr. Ernesto Almeida",
      message: "Recomiendo ampliamente este servicio...",
      date: "2025 - 10 - 07",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 7,
      client: "Pedro Lopez",
      product: "Primera Sesión",
      rating: 3.5,
      professional: "Dr. Ernesto Almeida",
      message: "Servicio aceptable pero esperaba más...",
      date: "2025 - 10 - 06",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 8,
      client: "Sofia Herrera",
      product: "Primera Sesión",
      rating: 4.9,
      professional: "Dr. Ernesto Almeida",
      message: "Increíble experiencia, muy recomendado...",
      date: "2025 - 10 - 05",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 9,
      client: "Miguel Torres",
      product: "Primera Sesión",
      rating: 4.1,
      professional: "Dr. Ernesto Almeida",
      message: "Buen servicio, cumplió mis expectativas...",
      date: "2025 - 10 - 04",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 10,
      client: "Isabella Cruz",
      product: "Primera Sesión",
      rating: 4.6,
      professional: "Dr. Ernesto Almeida",
      message: "Muy profesional y atento a los detalles...",
      date: "2025 - 10 - 03",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 11,
      client: "Diego Morales",
      product: "Primera Sesión",
      rating: 4.3,
      professional: "Dr. Ernesto Almeida",
      message: "Servicio de calidad, lo recomiendo...",
      date: "2025 - 10 - 02",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 12,
      client: "Valentina Ruiz",
      product: "Primera Sesión",
      rating: 4.8,
      professional: "Dr. Ernesto Almeida",
      message: "Excelente atención y resultados...",
      date: "2025 - 10 - 01",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 13,
      client: "Sebastian Vega",
      product: "Primera Sesión",
      rating: 3.8,
      professional: "Dr. Ernesto Almeida",
      message: "Buen servicio pero podría ser mejor...",
      date: "2025 - 09 - 30",
      status: "Pendiente",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 14,
      client: "Camila Silva",
      product: "Primera Sesión",
      rating: 4.4,
      professional: "Dr. Ernesto Almeida",
      message: "Muy satisfecha con la atención recibida...",
      date: "2025 - 09 - 29",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 15,
      client: "Nicolas Ramos",
      product: "Primera Sesión",
      rating: 4.7,
      professional: "Dr. Ernesto Almeida",
      message: "Profesional excepcional, muy recomendado...",
      date: "2025 - 09 - 28",
      status: "Aprobada",
      statusColor: "bg-green-100 text-green-800",
    },
  ]);

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

  const handleViewRating = (id: number) => {
    const review = ratings.find((rating) => rating.id === id);
    if (review) {
      setSelectedReview(review);
      setIsReviewModalOpen(true);
    }
  };

  const handleApproveReview = () => {
    if (selectedReview) {
      setRatings((prev) =>
        prev.map((rating) =>
          rating.id === selectedReview.id
            ? {
                ...rating,
                status: "Aprobada",
                statusColor: "bg-green-100 text-green-800",
              }
            : rating
        )
      );
    }
    setIsReviewModalOpen(false);
  };

  const handleMarkInappropriate = () => {
    if (selectedReview) {
      setRatings((prev) =>
        prev.map((rating) =>
          rating.id === selectedReview.id
            ? {
                ...rating,
                status: "Inapropiada",
                statusColor: "bg-red-100 text-red-800",
              }
            : rating
        )
      );
    }
    setIsReviewModalOpen(false);
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
      <div className="bg-white border-b border-gray-200 px-6 py-6">
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
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
            <div className="text-sm text-gray-600">Mostrando 15 de 204</div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium">
                1
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                4
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                5
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                ...
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
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
        {isReviewModalOpen && selectedReview && (
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
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Detalles de la reseña
                </h2>
                <p className="text-sm text-gray-600">
                  Puedes aprobar o desaprobar la reseña que ha dejado el
                  cliente.
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Reviewer and Professional Info */}
                <div className="flex items-center justify-between mb-8 gap-16 px-4">
                  {/* Reviewer */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedReview.client}
                      </h3>
                      <p className="text-sm text-gray-500">Cliente</p>
                    </div>
                  </div>

                  {/* Professional */}
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
                      alt="Professional"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedReview.professional}
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
                      Considero que el profesional realizó un trabajo impecable,
                      me encantó la atención y el seguimiento que le dio a mi
                      caso. Personalmente lo recomiendo ampliamente y espero que
                      pueda ayudar a mas personas.
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
                          i < Math.floor(selectedReview.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={handleMarkInappropriate}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Marcar como inapropiado
                  </button>
                  <button
                    onClick={handleApproveReview}
                    className="px-6 py-3 bg-primary/80 text-white rounded-lg font-medium hover:bg-primary/70 transition-colors"
                  >
                    Aprobar Reseña
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
