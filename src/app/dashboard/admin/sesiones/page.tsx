"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function AdminSesionesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: {
      activo: false,
      pendiente: false,
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
      },
      income: {
        min: "",
        max: "",
      },
    });
  };

  const handleApplyFilters = () => {
    // Filter logic will be implemented here
    setIsFilterOpen(false);
  };

  const handleEditSession = (sessionId: number) => {
    router.push(`/dashboard/admin/sesiones/${sessionId}`);
  };

  // Mock session data
  const sessions = [
    {
      id: 1,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Pendiente",
      statusColor: "bg-orange-100 text-orange-800",
    },
    {
      id: 2,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Pendiente",
      statusColor: "bg-orange-100 text-orange-800",
    },
    {
      id: 4,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Pendiente",
      statusColor: "bg-orange-100 text-orange-800",
    },
    {
      id: 5,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 6,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 7,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Cancelada",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 8,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 9,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 10,
      session: "Primera Sesión",
      specialty: "Nutriología",
      date: "05-12-2025",
      time: "15:00 AM",
      sessionNumber: "00000001",
      price: "$150 USD",
      professional: "Dr. Ernesto Almeida",
      status: "Activo",
      statusColor: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
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
      <div className="p-6">
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">Showing 1-10 from 100</div>
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
