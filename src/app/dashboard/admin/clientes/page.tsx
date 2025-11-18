"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load del modal de filtros - solo se carga cuando se necesita
const FilterModal = lazyLoad(() => import("@/components/dashboard/FilterModal"));
import { usersService } from "@/services/api/users";
import { type AdminClient } from "@/data/adminClients";

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
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para mapear los datos del backend al formato AdminClient
  const mapBackendClientToAdminClient = (backendClient: any): AdminClient => {
    // El backend devuelve: { id_cliente, id_usuario, nombre_completo, telefono, email, etc. }
    return {
      id: String(
        backendClient.id_usuario ||
          backendClient.id_cliente ||
          backendClient.id ||
          ""
      ),
      name:
        backendClient.nombre_completo ||
        backendClient.nombre_usuario ||
        backendClient.nombre ||
        backendClient.name ||
        "",
      fullName:
        backendClient.nombre_completo ||
        backendClient.nombre_usuario ||
        backendClient.nombre ||
        backendClient.name ||
        "",
      email: backendClient.email || backendClient.email_usuario || "",
      phone: backendClient.telefono || backendClient.phone || "",
      customerNumber: String(
        backendClient.id_cliente ||
          backendClient.id_usuario ||
          backendClient.id ||
          ""
      ).padStart(8, "0"),
      incomeUsd: backendClient.ingreso || backendClient.incomeUsd || 0,
      status:
        backendClient.is_verified === 1 || backendClient.is_verified === true
          ? "Activo"
          : "Inactivo",
      username:
        (backendClient.email || backendClient.email_usuario || "")?.split(
          "@"
        )[0] || "",
      city: backendClient.ciudad || backendClient.city || "",
      postalCode: backendClient.codigo_postal || backendClient.postalCode || "",
      createdAt:
        backendClient.created_at ||
        backendClient.createdAt ||
        new Date().toISOString(),
      lastLogin:
        backendClient.ultimo_acceso ||
        backendClient.lastLogin ||
        new Date().toISOString(),
      totalSessions:
        backendClient.total_sesiones || backendClient.totalSessions || 0,
      totalSpent: backendClient.total_gastado || backendClient.totalSpent || 0,
    };
  };

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersService.getAdminClients();

        console.log("[AdminClientesPage] Respuesta completa:", response);
        console.log("[AdminClientesPage] response.success:", response.success);
        console.log("[AdminClientesPage] response.data:", response.data);

        if (response.success && response.data) {
          // El backend puede devolver los datos en diferentes formatos
          let clientsData: any[] = [];

          // Log para debugging
          console.log(
            "[AdminClientesPage] Tipo de response.data:",
            typeof response.data
          );
          console.log(
            "[AdminClientesPage] Es array?",
            Array.isArray(response.data)
          );
          console.log(
            "[AdminClientesPage] response.data.data:",
            response.data.data
          );
          console.log(
            "[AdminClientesPage] response.data.clientes:",
            response.data.clientes
          );
          console.log(
            "[AdminClientesPage] Keys de response.data:",
            Object.keys(response.data)
          );

          // Intentar diferentes estructuras de respuesta
          // El backend devuelve: { success: true, data: { clientes: [...], paginacion: {...} } }
          // Pero ApiClient ya extrae el JSON, así que response.data es: { success: true, data: { clientes: [...], paginacion: {...} } }

          if (Array.isArray(response.data)) {
            // Caso 1: Array directo
            clientsData = response.data;
            console.log(
              "[AdminClientesPage] Usando response.data como array directo"
            );
          } else if (
            response.data.data &&
            response.data.data.clientes &&
            Array.isArray(response.data.data.clientes)
          ) {
            // Caso 2: { success: true, data: { clientes: [...] } }
            clientsData = response.data.data.clientes;
            console.log(
              "[AdminClientesPage] Usando response.data.data.clientes"
            );
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Caso 3: { data: [...] }
            clientsData = response.data.data;
            console.log("[AdminClientesPage] Usando response.data.data");
          } else if (
            response.data.clientes &&
            Array.isArray(response.data.clientes)
          ) {
            // Caso 4: { clientes: [...] }
            clientsData = response.data.clientes;
            console.log("[AdminClientesPage] Usando response.data.clientes");
          } else if (
            response.data.result &&
            Array.isArray(response.data.result)
          ) {
            // Caso 5: { result: [...] }
            clientsData = response.data.result;
            console.log("[AdminClientesPage] Usando response.data.result");
          } else if (
            response.data.items &&
            Array.isArray(response.data.items)
          ) {
            // Caso 6: { items: [...] }
            clientsData = response.data.items;
            console.log("[AdminClientesPage] Usando response.data.items");
          } else {
            // Intentar buscar cualquier propiedad que sea un array
            const dataKeys = Object.keys(response.data);
            for (const key of dataKeys) {
              if (Array.isArray(response.data[key])) {
                clientsData = response.data[key];
                console.log(`[AdminClientesPage] Usando response.data.${key}`);
                break;
              }
              // También buscar dentro de response.data.data si existe
              if (
                response.data.data &&
                typeof response.data.data === "object"
              ) {
                const innerKeys = Object.keys(response.data.data);
                for (const innerKey of innerKeys) {
                  if (Array.isArray(response.data.data[innerKey])) {
                    clientsData = response.data.data[innerKey];
                    console.log(
                      `[AdminClientesPage] Usando response.data.data.${innerKey}`
                    );
                    break;
                  }
                }
                if (clientsData.length > 0) break;
              }
            }

            if (clientsData.length === 0) {
              console.warn(
                "[AdminClientesPage] No se pudo encontrar el array de clientes en la respuesta"
              );
              console.warn(
                "[AdminClientesPage] Estructura completa:",
                JSON.stringify(response.data, null, 2)
              );
            }
          }

          console.log(
            "[AdminClientesPage] clientsData encontrados:",
            clientsData.length
          );
          if (clientsData.length > 0) {
            console.log(
              "[AdminClientesPage] Primer cliente (raw):",
              clientsData[0]
            );
          }

          // Mapear los datos del backend al formato AdminClient
          const mappedClients = clientsData.map(mapBackendClientToAdminClient);
          console.log(
            "[AdminClientesPage] Clientes mapeados:",
            mappedClients.length
          );
          if (mappedClients.length > 0) {
            console.log(
              "[AdminClientesPage] Primer cliente (mapeado):",
              mappedClients[0]
            );
          }

          setClients(mappedClients);
          console.log(
            "[AdminClientesPage] Estado clients actualizado con",
            mappedClients.length,
            "clientes"
          );
        } else {
          console.error("[AdminClientesPage] Error en respuesta:", response);
          console.error(
            "[AdminClientesPage] response.success:",
            response.success
          );
          console.error("[AdminClientesPage] response.data:", response.data);
          console.error("[AdminClientesPage] response.error:", response.error);
          setError(response.error || "Error al cargar los clientes");
        }
      } catch (err) {
        setError("Ocurrió un error al cargar los clientes");
        console.error("Error al cargar clientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filtered = useMemo(() => {
    let result = clients;

    // Apply search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
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
  }, [clients, query, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Logs para debugging
  useEffect(() => {
    console.log("[AdminClientesPage] Estado actualizado:");
    console.log("[AdminClientesPage] clients.length:", clients.length);
    console.log("[AdminClientesPage] filtered.length:", filtered.length);
    console.log("[AdminClientesPage] pageItems.length:", pageItems.length);
    console.log("[AdminClientesPage] loading:", loading);
    console.log("[AdminClientesPage] error:", error);
  }, [clients, filtered, pageItems, loading, error]);

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Cargando clientes...</div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
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
                  <th className="px-4 py-3 text-left font-medium">ID</th>
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
                    <td className="px-4 py-4 text-gray-700 font-mono text-sm">
                      {c.id}
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
                    <td className="px-4 py-4 text-gray-700">
                      {c.phone || "-"}
                    </td>
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">No se encontraron clientes</p>
            {query && (
              <p className="text-sm text-gray-500 mt-2">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando filtros...</p>
              </div>
            </div>
          }
        >
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
          />
        </Suspense>
      )}
    </div>
  );
}
