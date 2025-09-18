"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FilterModal from "@/components/dashboard/FilterModal";
import { ADMIN_CLIENTS, type AdminClient } from "@/data/adminClients";

function StatusBadge({ status }: { status: AdminClient["status"] }) {
  const isActive = status === "Activo";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
}

export default function AdminClientesPage() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    status: string[];
    incomeMin?: number;
    incomeMax?: number;
  }>({
    status: [],
    incomeMin: undefined,
    incomeMax: undefined,
  });

  const filtered = useMemo(() => {
    let result = ADMIN_CLIENTS;

    // Apply search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.customerNumber.includes(q)
      );
    }

    // Apply status filters
    if (appliedFilters.status.length > 0) {
      result = result.filter((c) => appliedFilters.status.includes(c.status));
    }

    // Apply income filters
    if (appliedFilters.incomeMin !== undefined) {
      result = result.filter((c) => c.incomeUsd >= appliedFilters.incomeMin!);
    }
    if (appliedFilters.incomeMax !== undefined) {
      result = result.filter((c) => c.incomeUsd <= appliedFilters.incomeMax!);
    }

    return result;
  }, [query, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelectAll = () => {
    const newVal = !selectAll;
    setSelectAll(newVal);
    const next: Record<string, boolean> = {};
    pageItems.forEach((c) => (next[c.id] = newVal));
    setSelected(next);
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFilterApply = (filters: any) => {
    const statusFilters: string[] = [];
    if (filters.status.activo) statusFilters.push("Activo");
    if (filters.status.pendiente) statusFilters.push("Inactivo"); // Mapping pendiente to Inactivo for now

    setAppliedFilters({
      status: statusFilters,
      incomeMin: filters.income.min
        ? parseFloat(filters.income.min)
        : undefined,
      incomeMax: filters.income.max
        ? parseFloat(filters.income.max)
        : undefined,
    });
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setAppliedFilters({
      status: [],
      incomeMin: undefined,
      incomeMax: undefined,
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header + Breadcrumbs */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-100 md:text-gray-900">
          Administración de usuarios
        </h1>
        <div className="text-sm text-gray-500">
          <span className="text-gray-600">Administración de usuarios</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">Clientes</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Filter className="mr-2 h-4 w-4" /> Filtros
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">
                  Número de Cliente
                </th>
                <th className="px-4 py-3 text-left font-medium">Ingreso</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-4 align-middle">
                    <input
                      type="checkbox"
                      checked={!!selected[c.id]}
                      onChange={() => toggleRow(c.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{c.phone}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {c.customerNumber}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    ${c.incomeUsd.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        // Navigate to dynamic edit page
                        window.location.href = `/dashboard/admin/clientes/${c.id}`;
                      }}
                      className="inline-flex items-center rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
          <div>
            Mostrando {pageItems.length} de {filtered.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages })
              .slice(0, 6)
              .map((_, i) => {
                const page = i + 1;
                const isCurrent = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-full px-3 text-sm ${
                      isCurrent
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            <button
              className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </div>
  );
}
