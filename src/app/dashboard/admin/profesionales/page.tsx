"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Pencil,
  MoreVertical,
  ChevronUp,
} from "lucide-react";
import { type AdminProfessional } from "@/data/adminProfessionals";
import { professionalsService } from "@/services/api/professionals";

// Status Badge Component
function StatusBadge({ status }: { status: AdminProfessional["status"] }) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  switch (status) {
    case "activo":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Activo
        </span>
      );
    case "inactivo":
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          Inactivo
        </span>
      );
    case "pendiente":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          Pendiente
        </span>
      );
    case "suspendido":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          Suspendido
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {status}
        </span>
      );
  }
}

// Avatar Component
function Avatar({ name, image }: { name: string; image?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
      {initials}
    </div>
  );
}

// Filter Modal Component
function FilterModal({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}) {
  const [filters, setFilters] = useState({
    estado: {
      activo: false,
      pendiente: false,
    },
    ingresos: {
      minimo: "",
      maximo: "",
    },
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      estado: {
        activo: false,
        pendiente: false,
      },
      ingresos: {
        minimo: "",
        maximo: "",
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            X Reiniciar
          </button>
        </div>

        <div className="space-y-6">
          {/* Estado Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Estado</h4>
              <ChevronUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.estado.activo}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      estado: { ...prev.estado, activo: e.target.checked },
                    }))
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Activo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.estado.pendiente}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      estado: { ...prev.estado, pendiente: e.target.checked },
                    }))
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Pendiente</span>
              </label>
            </div>
          </div>

          {/* Ingresos Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Ingresos</h4>
              <ChevronUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Minimo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.ingresos.minimo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        ingresos: { ...prev.ingresos, minimo: e.target.value },
                      }))
                    }
                    placeholder="Minimo..."
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Máximo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.ingresos.maximo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        ingresos: { ...prev.ingresos, maximo: e.target.value },
                      }))
                    }
                    placeholder="Máximo..."
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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

export default function AdminProfesionalesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Función para mapear los datos del backend al formato AdminProfessional
  const mapBackendProfessionalToAdminProfessional = (
    backendProfessional: any
  ): AdminProfessional => {
    // Mapear estado del backend al frontend
    const statusMap: Record<
      string,
      "activo" | "inactivo" | "pendiente" | "suspendido"
    > = {
      activo: "activo",
      inactivo: "inactivo",
      pendiente: "pendiente",
      suspendido: "suspendido",
      activa: "activo",
      inactiva: "inactivo",
      aprobado: "activo", // Mapear "aprobado" a "activo" si cumple condiciones
    };

    // Calcular el estado basándose en:
    // 1. Aprobación del admin (estado_aprobacion)
    // 2. Verificación de Stripe (charges_enabled && payouts_enabled)
    const estadoAprobacion = 
      backendProfessional.estado_aprobacion ||
      backendProfessional.estado ||
      "pendiente";
    
    // Normalizar valores booleanos de Stripe
    const normalizeBool = (v: any) =>
      v === true || v === "true" || v === 1 || v === "1";
    
    const chargesEnabled = normalizeBool(backendProfessional.charges_enabled);
    const payoutsEnabled = normalizeBool(backendProfessional.payouts_enabled);
    const stripeVerified = chargesEnabled && payoutsEnabled;
    
    // También considerar usuario_verificado si está disponible
    const usuarioVerificado = normalizeBool(backendProfessional.usuario_verificado);
    const isStripeVerified = stripeVerified || usuarioVerificado;
    
    // Verificar Google Calendar (el backend ahora incluye tiene_google_calendar)
    const tieneGoogleCalendar = normalizeBool(backendProfessional.tiene_google_calendar);
    
    // Determinar el estado final
    // Un profesional está "activo" cuando:
    // 1. Está aprobado por admin (estado_aprobacion === "aprobado")
    // 2. Tiene Stripe verificado (charges_enabled && payouts_enabled)
    // 3. Tiene Google Calendar conectado (tiene_google_calendar === true)
    let mappedStatus: "activo" | "inactivo" | "pendiente" | "suspendido";
    
    if (estadoAprobacion.toLowerCase() === "aprobado") {
      // Si está aprobado por admin, tiene Stripe verificado Y tiene Google Calendar, está activo
      if (isStripeVerified && tieneGoogleCalendar) {
        mappedStatus = "activo";
      } else {
        // Aprobado pero sin Stripe o sin Google Calendar = pendiente de verificación
        mappedStatus = "pendiente";
      }
    } else if (estadoAprobacion.toLowerCase() === "suspendido" || estadoAprobacion.toLowerCase() === "rechazado") {
      mappedStatus = "suspendido";
    } else if (estadoAprobacion.toLowerCase() === "inactivo" || estadoAprobacion.toLowerCase() === "inactiva") {
      mappedStatus = "inactivo";
    } else {
      // Por defecto, pendiente (incluye "pendiente" y cualquier otro estado)
      mappedStatus = "pendiente";
    }

    return {
      id: String(
        backendProfessional.id_profesional ||
          backendProfessional.id_usuario ||
          backendProfessional.id ||
          ""
      ),
      name:
        `${backendProfessional.nombre || ""} ${
          backendProfessional.apellidos || ""
        }`.trim() ||
        backendProfessional.nombre_completo ||
        backendProfessional.name ||
        "",
      fullName:
        `${backendProfessional.nombre || ""} ${
          backendProfessional.apellidos || ""
        }`.trim() ||
        backendProfessional.nombre_completo ||
        backendProfessional.fullName ||
        "",
      email:
        backendProfessional.email || backendProfessional.email_usuario || "",
      phone: backendProfessional.telefono || backendProfessional.phone || "",
      username: (backendProfessional.email || "").split("@")[0] || "",
      city: backendProfessional.ciudad || backendProfessional.city || "",
      postalCode:
        backendProfessional.codigo_postal ||
        backendProfessional.postalCode ||
        "",
      specialty:
        backendProfessional.especialidad || backendProfessional.specialty || "",
      licenseNumber:
        backendProfessional.numero_colegiado ||
        backendProfessional.licenseNumber ||
        "",
      experience:
        backendProfessional.experiencia_años ||
        backendProfessional.experience ||
        0,
      rating:
        backendProfessional.calificacion || backendProfessional.rating || 0,
      totalSessions:
        backendProfessional.total_sesiones ||
        backendProfessional.totalSessions ||
        0,
      incomeUsd:
        backendProfessional.ingreso || backendProfessional.incomeUsd || 0,
      status: mappedStatus,
      joinDate:
        backendProfessional.created_at ||
        backendProfessional.joinDate ||
        new Date().toISOString(),
      lastActive:
        backendProfessional.ultimo_acceso ||
        backendProfessional.lastActive ||
        new Date().toISOString(),
      profileImage:
        backendProfessional.imagen_perfil || backendProfessional.profileImage,
      bio: backendProfessional.descripcion || backendProfessional.bio || "",
      education:
        backendProfessional.educacion || backendProfessional.education || [],
      certifications:
        backendProfessional.certificaciones ||
        backendProfessional.certifications ||
        [],
      languages:
        backendProfessional.idiomas || backendProfessional.languages || [],
      availability: backendProfessional.disponibilidad ||
        backendProfessional.availability || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
    };
  };

  // Cargar profesionales desde la API
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await professionalsService.getAdminProfessionals();

        console.log("[AdminProfesionalesPage] Respuesta completa:", response);
        console.log(
          "[AdminProfesionalesPage] response.success:",
          response.success
        );
        console.log("[AdminProfesionalesPage] response.data:", response.data);
        console.log("[AdminProfesionalesPage] response.data (JSON):", JSON.stringify(response.data, null, 2));

        if (response.success && response.data) {
          console.log(
            "[AdminProfesionalesPage] Keys de response.data:",
            Object.keys(response.data)
          );
          if (response.data.data) {
            console.log(
              "[AdminProfesionalesPage] Keys de response.data.data:",
              Object.keys(response.data.data)
            );
            console.log(
              "[AdminProfesionalesPage] response.data.data.profesionales:",
              response.data.data.profesionales
            );
            console.log(
              "[AdminProfesionalesPage] response.data.data.profesionales es array?",
              Array.isArray(response.data.data.profesionales)
            );
            if (Array.isArray(response.data.data.profesionales)) {
              console.log(
                "[AdminProfesionalesPage] Cantidad de profesionales:",
                response.data.data.profesionales.length
              );
            }
          }
          let professionalsData: any[] = [];

          if (Array.isArray(response.data)) {
            professionalsData = response.data;
          } else if (
            response.data.data &&
            response.data.data.profesionales &&
            Array.isArray(response.data.data.profesionales)
          ) {
            professionalsData = response.data.data.profesionales;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            professionalsData = response.data.data;
          } else if (
            response.data.profesionales &&
            Array.isArray(response.data.profesionales)
          ) {
            professionalsData = response.data.profesionales;
          }

          console.log(
            "[AdminProfesionalesPage] professionalsData encontrados:",
            professionalsData.length
          );

          // Mapear los datos del backend al formato AdminProfessional
          const mappedProfessionals = professionalsData.map(
            mapBackendProfessionalToAdminProfessional
          );
          console.log(
            "[AdminProfesionalesPage] Profesionales mapeados:",
            mappedProfessionals.length
          );

          setProfessionals(mappedProfessionals);
        } else {
          setError(response.error || "Error al cargar los profesionales");
        }
      } catch (err) {
        setError("Ocurrió un error al cargar los profesionales");
        console.error("Error al cargar profesionales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Filter and search logic
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;

    // Text search
    if (query) {
      filtered = filtered.filter(
        (professional) =>
          professional.name.toLowerCase().includes(query.toLowerCase()) ||
          professional.email.toLowerCase().includes(query.toLowerCase()) ||
          professional.specialty.toLowerCase().includes(query.toLowerCase()) ||
          professional.city.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Status filter
    if (activeFilters.status) {
      filtered = filtered.filter(
        (professional) => professional.status === activeFilters.status
      );
    }

    // Specialty filter
    if (activeFilters.specialty) {
      filtered = filtered.filter((professional) =>
        professional.specialty
          .toLowerCase()
          .includes(activeFilters.specialty.toLowerCase())
      );
    }

    // Experience filter
    if (activeFilters.experience) {
      const [min, max] = activeFilters.experience.split("-").map(Number);
      if (max) {
        filtered = filtered.filter(
          (professional) =>
            professional.experience >= min && professional.experience <= max
        );
      } else {
        filtered = filtered.filter(
          (professional) => professional.experience >= min
        );
      }
    }

    // Rating filter
    if (activeFilters.rating) {
      const minRating = parseFloat(activeFilters.rating);
      filtered = filtered.filter(
        (professional) => professional.rating >= minRating
      );
    }

    return filtered;
  }, [professionals, query, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredProfessionals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredProfessionals.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleRow = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const allSelected = pageItems.every((item) => selected[item.id]);
    const newSelected = { ...selected };
    pageItems.forEach((item) => {
      newSelected[item.id] = !allSelected;
    });
    setSelected(newSelected);
  };

  const handleFilterApply = (filters: any) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== ""
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Administración de usuarios
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Administración de usuarios</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">Profesionales</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/profesionales/agregar")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Profesional
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar profesionales..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
            hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
              {Object.values(activeFilters).filter((v) => v !== "").length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar filtros
          </button>
        )}
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
          <div className="text-gray-600">Cargando profesionales...</div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        pageItems.length > 0 &&
                        pageItems.every((item) => selected[item.id])
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Profesional
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Profesional
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((professional) => (
                  <tr key={professional.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-4 align-middle">
                      <input
                        type="checkbox"
                        checked={!!selected[professional.id]}
                        onChange={() => toggleRow(professional.id)}
                      />
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-mono text-sm">
                      {professional.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={professional.name}
                          image={professional.profileImage}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {professional.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {professional.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {professional.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {String(professional.id).padStart(8, "0")}
                    </td>
                    <td className="px-4 py-4 text-gray-700 text-center">
                      ${professional.incomeUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={professional.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = `/dashboard/admin/profesionales/${professional.id}`;
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center text-sm text-gray-700">
              Mostrando {startIndex + 1}-
              {Math.min(
                startIndex + itemsPerPage,
                filteredProfessionals.length
              )}{" "}
              de {filteredProfessionals.length}
            </div>
            <div className="flex items-center gap-1">
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
                disabled={currentPage === totalPages}
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
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProfessionals.length === 0 && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">No se encontraron profesionales</p>
            {query && (
              <p className="text-sm text-gray-500 mt-2">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
      />
    </div>
  );
}
