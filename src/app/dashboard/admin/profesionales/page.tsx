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
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  AlertCircle,
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
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
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

// Toast Notification Component
function ToastNotification({
  message,
  type,
  isVisible,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-blue-50 border-blue-200 text-blue-800";

  const iconColor =
    type === "success"
      ? "text-green-600"
      : type === "error"
      ? "text-red-600"
      : "text-blue-600";

  const Icon =
    type === "success" ? CheckCircle : type === "error" ? XCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
    }`}>
      <div
        className={`${bgColor} border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
  requireReason = false,
  reason,
  onReasonChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "danger";
  requireReason?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {requireReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason || ""}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder="Describe el motivo del rechazo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (requireReason && !reason?.trim()) {
                return;
              }
              onConfirm();
              onClose();
            }}
            disabled={requireReason && !reason?.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:opacity-90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Setup Indicators Component
function SetupIndicators({ professional }: { professional: AdminProfessional }) {
  const tieneStripe = professional.tieneStripe || false;
  const tieneGoogleCalendar = professional.tieneGoogleCalendar || false;
  const estadoAprobacion = professional.estadoAprobacion || "pendiente";

  // Solo mostrar si está aprobado
  if (estadoAprobacion.toLowerCase() !== "aprobado") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {tieneStripe ? (
        <div
          className="group relative"
          title="Stripe configurado correctamente"
        >
          <CreditCard className="h-4 w-4 text-green-600" />
        </div>
      ) : (
        <div
          className="group relative"
          title="Falta configurar Stripe Connect"
        >
          <CreditCard className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {tieneGoogleCalendar ? (
        <div
          className="group relative"
          title="Google Calendar conectado"
        >
          <Calendar className="h-4 w-4 text-green-600" />
        </div>
      ) : (
        <div
          className="group relative"
          title="Falta conectar Google Calendar"
        >
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}

// Detailed Status Badge Component
function DetailedStatusBadge({ professional }: { professional: AdminProfessional }) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
  const estadoAprobacion = professional.estadoAprobacion || "pendiente";
  const tieneStripe = professional.tieneStripe || false;
  const tieneGoogleCalendar = professional.tieneGoogleCalendar || false;

  // Estado 1: Pendiente de aprobación por admin
  if (estadoAprobacion !== "aprobado") {
    return (
      <span className={`${baseClasses} bg-orange-100 text-orange-800`} title="Pendiente de aprobación por administrador">
        Pendiente de Aprobación
      </span>
    );
  }

  // Estado 2: Aprobado pero pendiente de completar setup
  if (estadoAprobacion === "aprobado" && (!tieneStripe || !tieneGoogleCalendar)) {
    const missingItems = [];
    if (!tieneStripe) missingItems.push("Stripe");
    if (!tieneGoogleCalendar) missingItems.push("Google Calendar");
    
    return (
      <span 
        className={`${baseClasses} bg-blue-100 text-blue-800`} 
        title={`Aprobado. Pendiente: ${missingItems.join(", ")}`}
      >
        Pendiente Setup ({missingItems.join(", ")})
      </span>
    );
  }

  // Estado 3: Aprobado y con setup completado (activo)
  if (estadoAprobacion === "aprobado" && tieneStripe && tieneGoogleCalendar) {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`} title="Aprobado y con setup completado">
        Activo
      </span>
    );
  }

  // Fallback
  return (
    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
      {professional.status}
    </span>
  );
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
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para notificaciones y confirmaciones
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "info" | "danger";
    rejectReason?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      joinDate: (() => {
        const date = backendProfessional.created_at ||
          backendProfessional.joinDate ||
          backendProfessional.fecha_registro ||
          new Date().toISOString();
        
        // Normalizar el formato de fecha si viene en formato MySQL DATETIME
        if (typeof date === 'string' && date.includes('T') === false && date.includes(' ')) {
          // Formato MySQL: 'YYYY-MM-DD HH:MM:SS' -> convertir a ISO
          return new Date(date.replace(' ', 'T')).toISOString();
        }
        return date;
      })(),
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
      // Información detallada del estado
      estadoAprobacion: estadoAprobacion.toLowerCase(),
      tieneStripe: isStripeVerified,
      tieneGoogleCalendar: tieneGoogleCalendar,
    };
  };

  // Cargar profesionales desde la API
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await professionalsService.getAdminProfessionals();

        if (response.success && response.data) {
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

          // Mapear los datos del backend al formato AdminProfessional
          const mappedProfessionals = professionalsData.map(
            mapBackendProfessionalToAdminProfessional
          );

          // Ordenar por fecha de registro (más recientes primero) desde el inicio
          mappedProfessionals.sort((a, b) => {
            // Manejar casos donde joinDate podría ser undefined, null, o inválido
            const dateA = a.joinDate ? new Date(a.joinDate).getTime() : 0;
            const dateB = b.joinDate ? new Date(b.joinDate).getTime() : 0;
            
            // Si alguna fecha es inválida (NaN), ponerla al final
            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return 1; // a va al final
            if (isNaN(dateB)) return -1; // b va al final
            
            return dateB - dateA; // Más reciente primero
          });

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

  // Función para mostrar notificación
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  // Función para aprobar profesional
  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const response = await professionalsService.approveProfessional(id);
      
      if (response.success) {
        showToast("Profesional aprobado exitosamente", "success");
        // Recargar la lista de profesionales
        const refreshResponse = await professionalsService.getAdminProfessionals();
        if (refreshResponse.success && refreshResponse.data) {
          let professionalsData: any[] = [];
          if (Array.isArray(refreshResponse.data)) {
            professionalsData = refreshResponse.data;
          } else if (
            refreshResponse.data.data &&
            refreshResponse.data.data.profesionales &&
            Array.isArray(refreshResponse.data.data.profesionales)
          ) {
            professionalsData = refreshResponse.data.data.profesionales;
          } else if (refreshResponse.data.data && Array.isArray(refreshResponse.data.data)) {
            professionalsData = refreshResponse.data.data;
          } else if (
            refreshResponse.data.profesionales &&
            Array.isArray(refreshResponse.data.profesionales)
          ) {
            professionalsData = refreshResponse.data.profesionales;
          }
          const mappedProfessionals = professionalsData.map(
            mapBackendProfessionalToAdminProfessional
          );
          mappedProfessionals.sort((a, b) => {
            const dateA = a.joinDate ? new Date(a.joinDate).getTime() : 0;
            const dateB = b.joinDate ? new Date(b.joinDate).getTime() : 0;
            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
          });
          setProfessionals(mappedProfessionals);
        }
      } else {
        showToast(response.error || "Error al aprobar profesional", "error");
      }
    } catch (err: any) {
      showToast(
        err?.message || "Error al aprobar profesional",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Función para rechazar profesional
  const handleReject = async (id: string, motivo: string) => {
    try {
      setProcessingId(id);
      const response = await professionalsService.rejectProfessional(id, motivo);
      
      if (response.success) {
        showToast("Profesional rechazado exitosamente", "success");
        // Recargar la lista de profesionales
        const refreshResponse = await professionalsService.getAdminProfessionals();
        if (refreshResponse.success && refreshResponse.data) {
          let professionalsData: any[] = [];
          if (Array.isArray(refreshResponse.data)) {
            professionalsData = refreshResponse.data;
          } else if (
            refreshResponse.data.data &&
            refreshResponse.data.data.profesionales &&
            Array.isArray(refreshResponse.data.data.profesionales)
          ) {
            professionalsData = refreshResponse.data.data.profesionales;
          } else if (refreshResponse.data.data && Array.isArray(refreshResponse.data.data)) {
            professionalsData = refreshResponse.data.data;
          } else if (
            refreshResponse.data.profesionales &&
            Array.isArray(refreshResponse.data.profesionales)
          ) {
            professionalsData = refreshResponse.data.profesionales;
          }
          const mappedProfessionals = professionalsData.map(
            mapBackendProfessionalToAdminProfessional
          );
          mappedProfessionals.sort((a, b) => {
            const dateA = a.joinDate ? new Date(a.joinDate).getTime() : 0;
            const dateB = b.joinDate ? new Date(b.joinDate).getTime() : 0;
            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
          });
          setProfessionals(mappedProfessionals);
        }
      } else {
        showToast(response.error || "Error al rechazar profesional", "error");
      }
    } catch (err: any) {
      showToast(
        err?.message || "Error al rechazar profesional",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Función para abrir modal de confirmación de aprobación
  const openApproveModal = (professional: AdminProfessional) => {
    setConfirmModal({
      isOpen: true,
      title: "Aprobar Profesional",
      message: `¿Estás seguro de que deseas aprobar a ${professional.name}?`,
      type: "info",
      onConfirm: () => handleApprove(professional.id),
    });
  };

  // Función para abrir modal de confirmación de rechazo
  const openRejectModal = (professional: AdminProfessional) => {
    setRejectReason("");
    setConfirmModal({
      isOpen: true,
      title: "Rechazar Profesional",
      message: `¿Estás seguro de que deseas rechazar a ${professional.name}? Debes proporcionar un motivo.`,
      type: "danger",
      onConfirm: () => {
        if (!rejectReason.trim()) {
          showToast("Debes proporcionar un motivo de rechazo", "error");
          return;
        }
        handleReject(professional.id, rejectReason);
        setRejectReason("");
      },
    });
  };

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

    // Ordenar por fecha de registro (más recientes primero)
    // Crear una copia para no mutar el array original
    const sorted = [...filtered].sort((a, b) => {
      // Manejar casos donde joinDate podría ser undefined, null, o inválido
      const dateA = a.joinDate ? new Date(a.joinDate).getTime() : 0;
      const dateB = b.joinDate ? new Date(b.joinDate).getTime() : 0;
      
      // Si alguna fecha es inválida (NaN), ponerla al final
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1; // a va al final
      if (isNaN(dateB)) return -1; // b va al final
      
      return dateB - dateA; // Más reciente primero
    });

    return sorted;
  }, [professionals, query, activeFilters]);

  // Separar profesionales pendientes de los no pendientes
  // Pendientes: solo los que están pendientes de aprobación por el administrador
  // (no incluye los que están aprobados pero les falta completar setup)
  const pendingProfessionals = useMemo(() => {
    return filteredProfessionals.filter((p) => {
      // Solo incluir si estadoAprobacion no es "aprobado"
      const estadoAprobacion = p.estadoAprobacion || "pendiente";
      return estadoAprobacion.toLowerCase() !== "aprobado";
    });
  }, [filteredProfessionals]);

  const nonPendingProfessionals = useMemo(() => {
    return filteredProfessionals.filter((p) => {
      // Incluir todos los aprobados (aunque les falte setup) y otros estados
      const estadoAprobacion = p.estadoAprobacion || "pendiente";
      return estadoAprobacion.toLowerCase() === "aprobado";
    });
  }, [filteredProfessionals]);

  // Pagination for non-pending professionals
  const totalPages = Math.ceil(nonPendingProfessionals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = nonPendingProfessionals.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Pagination for pending professionals
  const totalPagesPending = Math.ceil(pendingProfessionals.length / itemsPerPage);
  const startIndexPending = (currentPagePending - 1) * itemsPerPage;
  const pageItemsPending = pendingProfessionals.slice(
    startIndexPending,
    startIndexPending + itemsPerPage
  );

  const toggleRow = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (items: AdminProfessional[]) => {
    const allSelected = items.every((item) => selected[item.id]);
    const newSelected = { ...selected };
    items.forEach((item) => {
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

      {/* Alert Banner for Pending Professionals */}
      {!loading && !error && pendingProfessionals.length > 0 && (
        <div className="bg-purple-50 border-l-4 border-primary p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">
                Hay <span className="font-bold">{pendingProfessionals.length}</span> profesional{pendingProfessionals.length !== 1 ? 'es' : ''} pendiente{pendingProfessionals.length !== 1 ? 's' : ''} de aprobación
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Professionals Table */}
      {!loading && !error && pendingProfessionals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Profesionales Pendientes de Aprobación ({pendingProfessionals.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        pageItemsPending.length > 0 &&
                        pageItemsPending.every((item) => selected[item.id])
                      }
                      onChange={() => toggleAll(pageItemsPending)}
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
                    Número de Colegiado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItemsPending.map((professional) => (
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
                      {professional.licenseNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700 text-center">
                      ${professional.incomeUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <DetailedStatusBadge professional={professional} />
                        <SetupIndicators professional={professional} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openApproveModal(professional)}
                          disabled={processingId === professional.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Aprobar profesional"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => openRejectModal(professional)}
                          disabled={processingId === professional.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rechazar profesional"
                        >
                          <XCircle className="h-3 w-3" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = `/dashboard/admin/profesionales/${professional.id}`;
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Ver detalles"
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

          {/* Pagination for Pending Professionals */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center text-sm text-gray-700">
              Mostrando {startIndexPending + 1}-
              {Math.min(
                startIndexPending + itemsPerPage,
                pendingProfessionals.length
              )}{" "}
              de {pendingProfessionals.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPagePending((prev) => Math.max(prev - 1, 1))}
                disabled={currentPagePending === 1}
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
              {Array.from({ length: Math.min(5, totalPagesPending) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPagePending;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPagePending(pageNum)}
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
              {totalPagesPending > 5 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() =>
                  setCurrentPagePending((prev) => Math.min(prev + 1, totalPagesPending))
                }
                disabled={currentPagePending === totalPagesPending}
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

      {/* Main Table - Non-Pending Professionals */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {nonPendingProfessionals.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Todos los Profesionales ({nonPendingProfessionals.length})
              </h2>
            </div>
          )}
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
                      onChange={() => toggleAll(pageItems)}
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
                    Número de Colegiado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
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
                      {professional.licenseNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700 text-center">
                      ${professional.incomeUsd.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <DetailedStatusBadge professional={professional} />
                        <SetupIndicators professional={professional} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            window.location.href = `/dashboard/admin/profesionales/${professional.id}`;
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Ver detalles"
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
      {!loading && !error && nonPendingProfessionals.length === 0 && pendingProfessionals.length === 0 && (
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

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        requireReason={confirmModal.type === "danger"}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        confirmText={confirmModal.type === "danger" ? "Rechazar" : "Aprobar"}
        cancelText="Cancelar"
      />
    </div>
  );
}
