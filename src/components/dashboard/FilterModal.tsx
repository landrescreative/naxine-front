"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

interface FilterState {
  status: {
    activo: boolean;
    pendiente: boolean;
  };
  income: {
    min: string;
    max: string;
  };
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: {
      activo: false,
      pendiente: false,
    },
    income: {
      min: "",
      max: "",
    },
  });

  const [expandedSections, setExpandedSections] = useState({
    status: true,
    income: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = (status: keyof FilterState["status"]) => {
    setFilters((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status],
      },
    }));
  };

  const handleIncomeChange = (
    field: keyof FilterState["income"],
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        [field]: value,
      },
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
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
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              Reiniciar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Estado Section */}
          <div>
            <button
              onClick={() => toggleSection("status")}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-medium text-gray-900">Estado</h3>
              {expandedSections.status ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.status && (
              <div className="mt-3 space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.status.activo}
                    onChange={() => handleStatusChange("activo")}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.status.pendiente}
                    onChange={() => handleStatusChange("pendiente")}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Pendiente</span>
                </label>
              </div>
            )}
          </div>

          {/* Ingresos Section */}
          <div>
            <button
              onClick={() => toggleSection("income")}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-medium text-gray-900">Ingresos</h3>
              {expandedSections.income ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.income && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Mínimo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={filters.income.min}
                      onChange={(e) =>
                        handleIncomeChange("min", e.target.value)
                      }
                      placeholder="Mínimo..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Máximo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={filters.income.max}
                      onChange={(e) =>
                        handleIncomeChange("max", e.target.value)
                      }
                      placeholder="Máximo..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>
  );
}
