"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ChevronRight,
  X,
  Save,
  Key,
  UserX,
  Lock,
  Mail,
  BookOpen,
  Star,
  Phone,
  MapPin,
  ShoppingCart,
  Eye,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronUp,
  RotateCcw,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  Calendar as CalendarIcon,
  Info,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { type AdminProfessional } from "@/data/adminProfessionals";
import { professionalsService } from "@/services/api/professionals";
import { usersService } from "@/services/api/users";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load de modales pesados - solo se cargan cuando se necesitan
const PasswordResetModal = lazyLoad(
  () => import("@/components/dashboard/PasswordResetModal")
);
const SaveChangesModal = lazyLoad(
  () => import("@/components/dashboard/SaveChangesModal")
);
const DeactivateUserModal = lazyLoad(
  () => import("@/components/dashboard/DeactivateUserModal")
);

// Genera un slug SEO-friendly basado solo en el nombre completo del profesional.
// Ejemplo: "María López Pérez" -> "maria-lopez-perez"
function createProfessionalSlugFromName(name: string): string {
  const baseName = (name || "").trim();

  const slugifiedName =
    baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "profesional";

  return slugifiedName;
}

export default function AdminProfessionalEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params?.id)
    ? params?.id[0]
    : (params?.id as string);

  const [professional, setProfessional] = useState<AdminProfessional | null>(
    null
  );
  const [professionalIdProfesional, setProfessionalIdProfesional] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(
    null
  );
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  // Balance y transacciones
  const [balance, setBalance] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [txLimit, setTxLimit] = useState(10);
  const [txTotal, setTxTotal] = useState(0);
  // Modal de foto
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Modal de horarios
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<
    Array<{
      id_disponibilidad?: number;
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      tipo_atencion?: "presencial" | "en_linea" | "a_domicilio" | null;
      activo?: boolean;
    }>
  >([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const allDays = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];
  const displayDay = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);

  // Local form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    nombreUsuario: "",
    ciudad: "",
    codigoPostal: "",
    especialidad: "",
    numeroLicencia: "",
    experiencia: "",
    biografia: "",
    videoPresentacion: "",
    educacion: "",
    certificaciones: "",
    idiomas: "",
    tituloUniversitario: "",
    servicios: "",
    modalidades: [] as string[],
    observaciones: "",
    accesoMovilidad: false,
    tarifaPorHora: 0,
    precios: null as any,
  });

  // Modal states
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isSaveChangesOpen, setIsSaveChangesOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: {
      cancelada: false,
      completada: false,
      pendiente: false,
    },
    sessionType: {
      primeraSesion: false,
      sesionSeguimiento: false,
      packX3: false,
    },
  });

  // Edit states for each field
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  // Edit states for prices
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceData, setEditingPriceData] = useState<{
    nombre?: string;
    precio?: string;
    duracion?: string;
  }>({});
  const [priceSaveSuccessVisible, setPriceSaveSuccessVisible] = useState(false);
  const [priceSaveError, setPriceSaveError] = useState<string | null>(null);

  // Opciones de duración para precios
  const durationOptions = Array.from({ length: 7 }).map((_, i) => {
    const minutes = 30 + i * 10;
    return `${minutes} min`;
  });

  // Función para mapear los datos del backend al formato AdminProfessional
  const mapBackendProfessionalToAdminProfessional = (
    backendProfessional: any
  ): AdminProfessional => {
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
    };

    const estado =
      backendProfessional.estado_aprobacion ||
      backendProfessional.estado ||
      "pendiente";
    const mappedStatus = statusMap[estado.toLowerCase()] || "pendiente";

    // El backend ahora garantiza campos con nombres consistentes
    const mappedProfessional = {
      id: String(backendProfessional.id_profesional || ""),
      name:
        `${backendProfessional.nombre || ""} ${
          backendProfessional.apellidos || ""
        }`.trim() || "",
      fullName:
        `${backendProfessional.nombre || ""} ${
          backendProfessional.apellidos || ""
        }`.trim() || "",
      email: backendProfessional.email || "",
      phone: backendProfessional.telefono || "",
      username: (backendProfessional.email || "").split("@")[0] || "",
      city: backendProfessional.ciudad || "",
      postalCode: backendProfessional.codigo_postal || "",
      specialty: backendProfessional.especialidad || "",
      licenseNumber: backendProfessional.numero_colegiado || "",
      nifCif: backendProfessional.nif_cif || "",
      experience: backendProfessional.experiencia_años || 0,
      rating:
        backendProfessional.calificacion || backendProfessional.rating || 0,
      totalSessions: backendProfessional.total_sesiones || 0,
      incomeUsd: backendProfessional.ingreso || 0,
      status: mappedStatus,
      joinDate: backendProfessional.created_at || new Date().toISOString(),
      lastActive: backendProfessional.ultimo_acceso || new Date().toISOString(),
      profileImage: backendProfessional.foto_perfil || null,
      foto_perfil: backendProfessional.foto_perfil || null,
      bio: backendProfessional.descripcion || "",
      videoUrl: backendProfessional.video_presentacion || undefined,
      education: backendProfessional.educacion || [],
      certifications: backendProfessional.certificaciones || [],
      languages: backendProfessional.idiomas || [],
      availability: backendProfessional.disponibilidad || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      titulacion: backendProfessional.titulacion || "",
      publicEmail: backendProfessional.correo_profesional_publico || "",
      homeVisitPostalCodes:
        backendProfessional.codigos_postales_domicilio || "",
      domicilio_consultorio: backendProfessional.domicilio_consultorio || "",
      observations: backendProfessional.observaciones || "",
      services: backendProfessional.servicios_ofrecidos || "",
      modalities: (() => {
        const modalidadesData =
          backendProfessional.modalities || backendProfessional.modalidades;

        if (Array.isArray(modalidadesData)) {
          return modalidadesData;
        }

        if (typeof modalidadesData === "string" && modalidadesData.trim()) {
          try {
            const parsed = JSON.parse(modalidadesData);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.warn("Error al parsear modalidades:", e);
            return [];
          }
        }

        return [];
      })(),
      mobilityAccess: backendProfessional.accesible_movilidad || false,
      documents: {
        identityCard: backendProfessional.documento_identidad || null,
        universityDegree: backendProfessional.titulo_universitario || null,
        insurance: backendProfessional.seguro_rc || null,
        collegialCertificate:
          backendProfessional.certificado_colegiacion || null,
        cv: backendProfessional.cv || null,
        criminalRecord: backendProfessional.certificado_delitos || null,
      },
      prices: backendProfessional.precios || null,
      estadoAprobacion: backendProfessional.estado_aprobacion || "pendiente",
      motivoRechazo: backendProfessional.motivo_rechazo || undefined,
      tieneStripe: backendProfessional.tiene_stripe || false,
      tieneGoogleCalendar: backendProfessional.tiene_google_calendar || false,
      ultimaSesion: backendProfessional.ultima_sesion || null,
      proximaCita: backendProfessional.proxima_cita || null,
    };

    return mappedProfessional;
  };

  // Cargar profesional desde la API
  useEffect(() => {
    const fetchProfessional = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const adminToken =
          typeof window !== "undefined"
            ? JSON.parse(window.localStorage.getItem("user") || "{}").token
            : null;

        if (!adminToken) {
          setError("No se encontró token de administrador");
          setLoading(false);
          return;
        }

        const apiBase = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        ).replace(/\/$/, "");

        // Usar el nuevo endpoint específico para detalles de admin que devuelve toda la info (incluyendo precios y horarios)
        const response = await fetch(
          `${apiBase}/profesionales/admin/detalle/${userId}`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.profesional) {
            const foundProfessional = data.data.profesional;
            const mappedProfessional =
              mapBackendProfessionalToAdminProfessional(foundProfessional);

            setProfessional(mappedProfessional);
            setProfessionalIdProfesional(
              String(foundProfessional.id_profesional)
            );
          } else {
            setError(
              "Formato de respuesta inválido o profesional no encontrado"
            );
          }
        } else {
          setError(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError("Ocurrió un error al cargar el profesional");
        console.error("Error al cargar profesional:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [userId]);

  // Cargar balance y transacciones desde API (Stripe Connect) cuando ya tengamos el id_profesional
  useEffect(() => {
    const fetchFinance = async () => {
      if (!professionalIdProfesional) return;
      try {
        setLoadingFinance(true);
        setFinanceError(null);
        const adminToken =
          typeof window !== "undefined"
            ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
            : null;
        if (!adminToken) return;
        const apiBase = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        ).replace(/\/$/, "");
        // Balance (según rutas de pagos)
        const balanceRes = await fetch(
          `${apiBase}/pagos/profesional/${professionalIdProfesional}/balance`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData?.data || balanceData);
        }
        // Transacciones / Pagos del profesional
        const offset = (txPage - 1) * txLimit;
        const txRes = await fetch(
          `${apiBase}/pagos/profesional/${professionalIdProfesional}?limit=${txLimit}&offset=${offset}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        if (txRes.ok) {
          const txData = await txRes.json();
          // Normalizar: intentar varias formas comunes
          let list: any[] = [];
          if (Array.isArray(txData)) list = txData;
          else if (Array.isArray(txData?.data)) list = txData.data;
          else if (Array.isArray(txData?.data?.transacciones))
            list = txData.data.transacciones;
          else if (Array.isArray(txData?.transactions))
            list = txData.transactions;
          else if (Array.isArray(txData?.data?.pagos)) list = txData.data.pagos;
          else if (Array.isArray(txData?.pagos)) list = txData.pagos;
          setTransactions(list);
          // Total
          const total =
            txData?.data?.paginacion?.total ??
            txData?.paginacion?.total ??
            (typeof txData?.total === "number" ? txData.total : 0);
          setTxTotal(Number(total) || 0);
        }
      } catch (e: any) {
        setFinanceError(
          e?.message || "Error al cargar balance o transacciones"
        );
      } finally {
        setLoadingFinance(false);
      }
    };
    fetchFinance();
  }, [professionalIdProfesional, txPage, txLimit]);

  // Cargar horarios automáticamente
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!professionalIdProfesional) return;
      try {
        setLoadingSchedule(true);
        setScheduleError(null);
        const adminToken =
          typeof window !== "undefined"
            ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
            : null;
        if (!adminToken) return;

        const apiBase = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        ).replace(/\/$/, "");

        const res = await fetch(
          `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        if (!res.ok) {
          // Si es 404 es normal si no tiene horarios, no lanzamos error visible
          if (res.status !== 404) {
            throw new Error(`Error ${res.status} al cargar horarios`);
          }
        }

        const data = await res.json().catch(() => ({}));

        const collectArraysWithDia = (obj: any): any[] => {
          const results: any[] = [];
          const visit = (node: any) => {
            if (!node) return;
            if (Array.isArray(node)) {
              if (
                node.length &&
                typeof node[0] === "object" &&
                "dia_semana" in (node[0] || {})
              ) {
                results.push(node);
              } else {
                node.forEach(visit);
              }
            } else if (typeof node === "object") {
              Object.values(node).forEach(visit);
            }
          };
          visit(obj);
          if (!results.length) {
            const guess =
              obj?.data?.disponibilidad ||
              obj?.disponibilidad ||
              obj?.data ||
              [];
            if (Array.isArray(guess)) results.push(guess);
          }
          return results.flat();
        };

        const horariosSource: any[] = collectArraysWithDia(data);
        const horarios: any[] = Array.isArray(horariosSource)
          ? horariosSource
          : [];

        const normalizeTipo = (
          val: any
        ): "presencial" | "en_linea" | "a_domicilio" | null => {
          if (!val && typeof val !== "string") return null;
          const raw = String(val || "")
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const s = raw
            .replace(/\s+/g, "_")
            .replace(/en-linea|en_linea|online/, "en_linea")
            .replace(/a-domicilio|a__domicilio|a_domicilio/, "a_domicilio");
          if (s.includes("en_linea")) return "en_linea";
          if (s.includes("a_domicilio")) return "a_domicilio";
          if (s.includes("presencial") || s === "") return "presencial";
          return null;
        };

        const mapped = horarios.map((h: any) => {
          const tipo = normalizeTipo(h.tipo_atencion);
          return {
            id_disponibilidad: h.id_disponibilidad,
            dia_semana: (h.dia_semana || "").toLowerCase(),
            hora_inicio: h.hora_inicio?.slice?.(0, 5) || h.hora_inicio,
            hora_fin: h.hora_fin?.slice?.(0, 5) || h.hora_fin,
            tipo_atencion: tipo,
            activo: h.activo ?? true,
          };
        });
        setScheduleItems(mapped);
      } catch (e: any) {
        setScheduleError(e?.message || "Error al cargar horarios");
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, [professionalIdProfesional]);

  // Load professional data into form
  useEffect(() => {
    if (professional) {
      // Separar nombre y apellidos del fullName
      const nameParts = professional.fullName.split(" ");
      const nombre = nameParts[0] || "";
      const apellidos = nameParts.slice(1).join(" ") || "";

      setForm({
        nombreCompleto: professional.fullName,
        email: professional.email,
        telefono: professional.phone,
        nombreUsuario: professional.username,
        ciudad: professional.city,
        codigoPostal: professional.postalCode,
        especialidad: professional.specialty,
        numeroLicencia: professional.licenseNumber,
        experiencia: professional.experience.toString(),
        biografia: professional.bio,
        videoPresentacion: (professional as any).videoUrl || "",
        educacion: Array.isArray(professional.education)
          ? professional.education.join("\n")
          : "",
        certificaciones: Array.isArray(professional.certifications)
          ? professional.certifications.join("\n")
          : "",
        idiomas: Array.isArray(professional.languages)
          ? professional.languages.join(", ")
          : "",
        tituloUniversitario:
          professional.documents?.universityDegree ||
          professional.titulacion ||
          "",
        servicios: professional.services || "",
        modalidades: professional.modalities || [],
        observaciones: professional.observations || "",
        accesoMovilidad: professional.mobilityAccess || false,
        tarifaPorHora:
          (professional.prices as any)?.tarifaPorHora ||
          (professional.prices as any)?.hourlyRate ||
          0,
        precios: professional.prices,
      });
    }
  }, [professional]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setIsSaveChangesOpen(true);
  };

  // Handlers para modal de foto
  const openPhotoModal = () => {
    setPhotoError(null);
    setIsPhotoModalOpen(true);
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
  };
  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
    setPhotoError(null);
  };
  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };
  const confirmUploadPhoto = async () => {
    if (!photoFile || !professionalIdProfesional) {
      setPhotoError("Selecciona una imagen para subir.");
      return;
    }
    try {
      setUploadingPhoto(true);
      setPhotoError(null);
      const adminToken =
        typeof window !== "undefined"
          ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
          : null;
      if (!adminToken) {
        setPhotoError("Token de administrador no disponible.");
        return;
      }
      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");
      const formData = new FormData();
      formData.append("foto", photoFile);
      const res = await fetch(
        `${apiBase}/profesionales/admin/${professionalIdProfesional}/foto-perfil`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}` } as any,
          body: formData,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhotoError(data?.message || data?.error || "Error al subir la foto");
        return;
      }
      const imageUrl =
        data?.data?.imageUrl ||
        data?.imageUrl ||
        data?.url ||
        professional?.profileImage;
      // Actualizar imagen en pantalla
      setProfessional((prev) =>
        prev ? { ...prev, profileImage: imageUrl || prev.profileImage } : prev
      );
      closePhotoModal();
    } catch (err: any) {
      setPhotoError(err?.message || "Error al subir la foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const confirmSave = async () => {
    if (!professional) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Separar nombre y apellidos del nombreCompleto
      const nameParts = form.nombreCompleto.trim().split(" ");
      const nombre = nameParts[0] || "";
      const apellidos = nameParts.slice(1).join(" ") || "";

      // Preparar los datos para enviar al backend
      const updateData: {
        nombre?: string;
        apellidos?: string;
        telefono?: string;
        email?: string;
        especialidad?: string;
        direccion?: string;
        ciudad?: string;
        descripcion?: string;
        experiencia_años?: number;
        numero_colegiado?: string;
        video_presentacion?: string;
      } = {};

      // Incluir todos los campos modificables que tienen valor
      if (nombre && nombre !== professional.fullName.split(" ")[0]) {
        updateData.nombre = nombre;
      }
      if (apellidos) {
        updateData.apellidos = apellidos;
      }
      if (
        form.email &&
        form.email.trim() &&
        form.email !== professional.email
      ) {
        updateData.email = form.email.trim();
      }
      if (form.telefono !== undefined) {
        updateData.telefono = form.telefono.trim() || null;
      }
      if (form.especialidad && form.especialidad.trim()) {
        updateData.especialidad = form.especialidad.trim();
      }
      if (form.ciudad && form.ciudad.trim()) {
        updateData.ciudad = form.ciudad.trim();
      }
      if (form.numeroLicencia && form.numeroLicencia.trim()) {
        updateData.numero_colegiado = form.numeroLicencia.trim();
      }
      if (form.experiencia) {
        updateData.experiencia_años = parseInt(form.experiencia) || 0;
      }
      if (form.biografia !== undefined) {
        updateData.descripcion = form.biografia.trim() || null;
      }
      if (form.videoPresentacion !== undefined) {
        updateData.video_presentacion = form.videoPresentacion.trim() || null;
      }

      // Usar el id_profesional guardado
      const professionalId = professionalIdProfesional || professional.id;

      console.log(
        "[AdminProfessionalEditPage] Actualizando profesional con ID:",
        professionalId
      );
      console.log(
        "[AdminProfessionalEditPage] Datos a actualizar:",
        updateData
      );

      const response = await professionalsService.updateAdminProfessional(
        professionalId,
        updateData
      );

      if (response.success) {
        setIsSaveChangesOpen(false);
        router.push("/dashboard/admin/profesionales");
      } else {
        setSaveError(response.error || "Error al actualizar el profesional");
        console.error("Error al actualizar profesional:", response);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al actualizar el profesional. Por favor, intenta de nuevo.";
      setSaveError(errorMessage);
      console.error("Error al guardar cambios:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = () => {
    setIsPasswordResetOpen(true);
    setPasswordResetError(null);
  };

  const handleResendCode = () => {
    // No se usa en este contexto
    console.log("Resending code...");
  };

  const confirmPasswordReset = async (password: string) => {
    if (!professional) return;

    setResettingPassword(true);
    setPasswordResetError(null);

    try {
      // Usar id_usuario para el endpoint de restablecer contraseña
      const response = await usersService.resetUserPassword(
        professional.id,
        password
      );

      if (response.success) {
        setIsPasswordResetOpen(false);
        router.push("/dashboard/admin/profesionales");
      } else {
        setPasswordResetError(
          response.error || "Error al restablecer la contraseña"
        );
        console.error("Error al restablecer contraseña:", response);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al restablecer la contraseña. Por favor, intenta de nuevo.";
      setPasswordResetError(errorMessage);
      console.error("Error al restablecer contraseña:", err);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeactivate = () => {
    setIsDeactivateOpen(true);
    setStatusError(null);
  };

  const confirmDeactivate = async () => {
    if (!professional) return;

    setChangingStatus(true);
    setStatusError(null);

    try {
      // Usar id_usuario para el endpoint de estado
      // Desactivar usuario (is_active: false)
      const response = await usersService.updateUserStatus(
        professional.id,
        false
      );

      if (response.success) {
        setIsDeactivateOpen(false);
        router.push("/dashboard/admin/profesionales");
      } else {
        setStatusError(response.error || "Error al desactivar el usuario");
        console.error("Error al desactivar usuario:", response);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al desactivar el usuario. Por favor, intenta de nuevo.";
      setStatusError(errorMessage);
      console.error("Error al desactivar usuario:", err);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (
    category: "status" | "sessionType",
    filter: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [filter]:
          !prev[category][filter as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: {
        cancelada: false,
        completada: false,
        pendiente: false,
      },
      sessionType: {
        primeraSesion: false,
        sesionSeguimiento: false,
        packX3: false,
      },
    });
  };

  const handleApplyFilters = () => {
    // Filter logic will be implemented here
    setIsFilterOpen(false);
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (field: string) => {
    if (!professionalIdProfesional) {
      console.error("No hay ID de profesional disponible");
      return;
    }

    try {
      // Mapeo de campos del frontend a campos del backend
      const fieldMapping: Record<string, string> = {
        numeroUsuario: "id", // Este campo no se puede editar realmente
        email: "email",
        biografia: "descripcion",
        videoPresentacion: "video_presentacion",
        especialidad: "especialidad",
        telefono: "telefono",
        direccion: "domicilio_consultorio",
        ciudad: "ciudad",
        titulacion: "titulacion",
        numeroColegiado: "numero_colegiado",
        nifCif: "nif_cif",
        correoPublico: "correo_profesional_publico",
        codigosPostales: "codigos_postales_domicilio",
      };

      const backendField = fieldMapping[field];

      if (!backendField) {
        console.warn(`Campo no mapeado: ${field}`);
        setEditingField(null);
        setEditValue("");
        return;
      }

      // Preparar datos para actualizar
      const updateData: any = {};

      if (field === "biografia") {
        updateData.descripcion = editValue.trim() || null;
      } else if (field === "videoPresentacion") {
        updateData.video_presentacion = editValue.trim() || null;
      } else if (field === "email") {
        updateData.email = editValue.trim() || null;
      } else if (field === "especialidad") {
        updateData.especialidad = editValue.trim() || null;
      } else if (field === "telefono") {
        updateData.telefono = editValue.trim() || null;
      } else if (field === "direccion") {
        // La dirección puede ir en direccion o domicilio_consultorio
        // Usamos domicilio_consultorio que es más específico
        updateData.domicilio_consultorio = editValue.trim() || null;
      } else if (field === "ciudad") {
        updateData.ciudad = editValue.trim() || null;
      } else if (field === "titulacion") {
        updateData.titulacion = editValue.trim() || null;
      } else if (field === "numeroColegiado") {
        updateData.numero_colegiado = editValue.trim() || null;
      } else if (field === "nifCif") {
        updateData.nif_cif = editValue.trim() || null;
      } else if (field === "correoPublico") {
        updateData.correo_profesional_publico = editValue.trim() || null;
      } else if (field === "codigosPostales") {
        updateData.codigos_postales_domicilio = editValue.trim() || null;
      } else if (field === "numeroUsuario") {
        // El número de usuario (ID) no se puede editar
        alert("El número de usuario no se puede modificar");
        setEditingField(null);
        setEditValue("");
        return;
      }

      // Actualizar en el backend
      const response = await professionalsService.updateAdminProfessional(
        professionalIdProfesional,
        updateData
      );

      if (response.success) {
        // Actualizar el estado local del formulario
        update(field as keyof typeof form, editValue);

        // Mostrar notificación de éxito
        setLastSavedField(field);
        setSaveSuccessVisible(true);
        setTimeout(() => {
          setSaveSuccessVisible(false);
          setLastSavedField(null);
        }, 3000);

        // Actualizar el estado del profesional para reflejar los cambios
        if (professional) {
          const updatedProfessional = { ...professional };

          if (field === "email") {
            updatedProfessional.email = editValue.trim();
          } else if (field === "biografia") {
            updatedProfessional.bio = editValue.trim();
          } else if (field === "videoPresentacion") {
            // El video se actualiza en el form, no en professional directamente
            // Pero podemos actualizar form.videoPresentacion
          } else if (field === "especialidad") {
            updatedProfessional.specialty = editValue.trim();
          } else if (field === "telefono") {
            updatedProfessional.phone = editValue.trim();
          } else if (field === "direccion") {
            // Actualizar domicilio_consultorio en el estado
            (updatedProfessional as any).domicilio_consultorio =
              editValue.trim();
          } else if (field === "ciudad") {
            updatedProfessional.city = editValue.trim();
          } else if (field === "titulacion") {
            updatedProfessional.titulacion = editValue.trim();
          } else if (field === "numeroColegiado") {
            updatedProfessional.licenseNumber = editValue.trim();
          } else if (field === "nifCif") {
            updatedProfessional.nifCif = editValue.trim();
          } else if (field === "correoPublico") {
            updatedProfessional.publicEmail = editValue.trim();
          } else if (field === "codigosPostales") {
            updatedProfessional.homeVisitPostalCodes = editValue.trim();
          }

          setProfessional(updatedProfessional);
        }

        // Recargar los datos del profesional desde el backend para asegurar sincronización
        // Esto es opcional pero recomendado para mantener consistencia
        try {
          const adminToken =
            typeof window !== "undefined"
              ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
              : null;
          if (adminToken && professionalIdProfesional) {
            const apiBase = (
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
            ).replace(/\/$/, "");
            const response = await fetch(
              `${apiBase}/profesionales/admin/${professionalIdProfesional}`,
              {
                headers: {
                  Authorization: `Bearer ${adminToken}`,
                },
              }
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                // Actualizar el profesional con los datos más recientes del servidor
                // Esto asegura que todos los campos estén sincronizados
              }
            }
          }
        } catch (refreshError) {
          // Si falla la recarga, no es crítico, ya actualizamos el estado local
          console.warn(
            "No se pudo recargar los datos del servidor:",
            refreshError
          );
        }

        setEditingField(null);
        setEditValue("");
      } else {
        throw new Error(response.error || "Error al guardar los cambios");
      }
    } catch (err: any) {
      console.error("Error al guardar campo:", err);
      const errorMessage =
        err?.message ||
        "Error al guardar los cambios. Por favor, intenta de nuevo.";

      // Crear toast de error
      const errorToast = document.createElement("div");
      errorToast.className =
        "fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top min-w-[280px]";
      errorToast.innerHTML = `
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex-1">
          <p class="font-medium text-sm">Error al guardar</p>
          <p class="text-xs text-red-100">${errorMessage}</p>
        </div>
      `;
      document.body.appendChild(errorToast);
      setTimeout(() => {
        errorToast.style.opacity = "0";
        errorToast.style.transform = "translateY(-10px)";
        setTimeout(() => errorToast.remove(), 300);
      }, 4000);

      // No cerrar el modo de edición si hay error, para que el usuario pueda corregir
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  // Price editing handlers
  const handleEditPrice = (priceIndex: number, price: any) => {
    setEditingPriceId(priceIndex);
    setPriceSaveError(null); // Limpiar errores previos al iniciar edición
    const duracionMinutos = price.duracion_minutos || price.duracion;
    const duracionFormatted = duracionMinutos ? `${duracionMinutos} min` : "";
    setEditingPriceData({
      nombre:
        price.name ||
        price.nombre ||
        price.nombre_paquete ||
        price.nombre_servicio ||
        "",
      precio: String(
        price.price || price.precio || price.monto || price.amount || "0"
      ),
      duracion: duracionFormatted,
    });
  };

  const handleSavePrice = async (priceIndex: number, originalPrice: any) => {
    if (!professionalIdProfesional) return;

    // Limpiar errores previos
    setPriceSaveError(null);

    try {
      const adminToken =
        typeof window !== "undefined"
          ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
          : null;
      if (!adminToken) {
        setPriceSaveError("Token de administrador no disponible");
        return;
      }

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");

      const priceId = originalPrice.id_precio || originalPrice.id;
      if (!priceId) {
        setPriceSaveError("No se pudo identificar el ID del precio");
        return;
      }

      // Preparar datos de actualización según la estructura de la tabla precios (minúsculas)
      const updateData: any = {};
      if (
        editingPriceData.nombre !== undefined &&
        editingPriceData.nombre.trim()
      ) {
        updateData.nombre_paquete = editingPriceData.nombre.trim();
      }
      if (editingPriceData.precio !== undefined) {
        const precioValue = parseFloat(editingPriceData.precio);
        if (!isNaN(precioValue) && precioValue >= 0) {
          updateData.precio = precioValue;
        }
      }
      if (
        editingPriceData.duracion !== undefined &&
        editingPriceData.duracion.trim()
      ) {
        // Convertir "30 min" a minutos numéricos
        const duracionMatch = editingPriceData.duracion.match(/(\d+)\s*min/i);
        if (duracionMatch) {
          updateData.duracion_minutos = parseInt(duracionMatch[1], 10);
        }
      }

      // Usar el endpoint específico para actualizar precios de profesionales
      const response = await fetch(
        `${apiBase}/profesionales/admin/${professionalIdProfesional}/precio/${priceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          "Error al actualizar el precio";
        setPriceSaveError(errorMessage);
        return;
      }

      // Actualizar el estado local
      if (
        professional &&
        professional.prices &&
        Array.isArray(professional.prices)
      ) {
        const updatedPrices = [...professional.prices];
        const currentPrice = updatedPrices[priceIndex];
        updatedPrices[priceIndex] = {
          ...currentPrice,
          nombre_paquete:
            updateData.nombre_paquete !== undefined
              ? updateData.nombre_paquete
              : currentPrice.nombre_paquete ||
                currentPrice.nombre ||
                currentPrice.nombre_servicio,
          precio:
            updateData.precio !== undefined
              ? updateData.precio
              : currentPrice.precio ||
                currentPrice.monto ||
                currentPrice.amount,
          duracion_minutos:
            updateData.duracion_minutos !== undefined
              ? updateData.duracion_minutos
              : currentPrice.duracion_minutos || currentPrice.duracion,
        };
        setProfessional({ ...professional, prices: updatedPrices });
      }

      // Mostrar notificación de éxito
      setPriceSaveSuccessVisible(true);
      setTimeout(() => {
        setPriceSaveSuccessVisible(false);
      }, 3000);

      setEditingPriceId(null);
      setEditingPriceData({});
    } catch (err: any) {
      const errorMessage = err?.message || "Error al guardar el precio";
      setPriceSaveError(errorMessage);
      console.error("Error al guardar precio:", err);
    }
  };

  const handleCancelPriceEdit = () => {
    setEditingPriceId(null);
    setEditingPriceData({});
    setPriceSaveError(null);
  };

  const handleApprove = async () => {
    if (!professional || !professionalIdProfesional) return;

    setApproving(true);
    setApprovalError(null);

    try {
      const adminToken =
        typeof window !== "undefined"
          ? JSON.parse(window.localStorage.getItem("user") || "{}")?.token
          : null;
      if (!adminToken) {
        setApprovalError("Token de administrador no disponible.");
        setApproving(false);
        return;
      }

      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${apiBase}/profesionales/admin/${professionalIdProfesional}/aprobar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setApprovalError(
          data?.message || data?.error || "Error al aprobar el profesional"
        );
        setApproving(false);
        return;
      }

      // Actualizar el estado del profesional localmente
      setProfessional((prev) => (prev ? { ...prev, status: "activo" } : prev));

      // Recargar la página para reflejar los cambios
      router.push("/dashboard/admin/profesionales");
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al aprobar el profesional. Por favor, intenta de nuevo.";
      setApprovalError(errorMessage);
      console.error("Error al aprobar profesional:", err);
    } finally {
      setApproving(false);
    }
  };

  // URL pública del perfil del profesional, basada en el nombre (slug) en lugar del ID
  const publicProfileName = professional?.fullName || professional?.name || null;
  const publicProfileUrl = publicProfileName
    ? `/profesionales/${createProfessionalSlugFromName(publicProfileName)}`
    : null;
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const handleCopyPublicUrl = async () => {
    if (!publicProfileUrl || typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${publicProfileUrl}`
      );
      setCopyToastVisible(true);
      setTimeout(() => setCopyToastVisible(false), 1600);
    } catch (err) {
      console.error("No se pudo copiar la URL:", err);
    }
  };

  // Función para determinar el estado detallado del profesional
  const getDetailedStatus = () => {
    if (!professional)
      return { label: "Desconocido", color: "gray", icon: AlertCircle };

    const estadoAprobacion = (
      professional.estadoAprobacion || ""
    ).toLowerCase();
    const tieneStripe = professional.tieneStripe || false;
    const tieneGoogleCalendar = professional.tieneGoogleCalendar || false;

    // Si está rechazado
    if (estadoAprobacion === "rechazado") {
      return {
        label: "Rechazado",
        color: "red",
        icon: XCircle,
        description:
          professional.motivoRechazo ||
          "Profesional rechazado por administrador",
      };
    }

    // Si no está aprobado (pero no rechazado)
    if (estadoAprobacion !== "aprobado") {
      return {
        label: "Pendiente de Aprobación",
        color: "orange",
        icon: AlertCircle,
        description: "Esperando aprobación del administrador",
      };
    }

    // Si está aprobado pero falta setup
    if (!tieneStripe || !tieneGoogleCalendar) {
      const missing = [];
      if (!tieneStripe) missing.push("Stripe");
      if (!tieneGoogleCalendar) missing.push("Google Calendar");

      return {
        label: "Pendiente de Setup",
        color: "blue",
        icon: Clock,
        description: `Falta configurar: ${missing.join(", ")}`,
      };
    }

    // Si está aprobado y tiene todo configurado
    return {
      label: "Activo",
      color: "green",
      icon: CheckCircle,
      description: "Profesional activo y operativo",
    };
  };

  const detailedStatus = getDetailedStatus();
  const StatusIcon = detailedStatus.icon;

  // Show loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-full max-w-7xl px-6 py-6">
          <div className="flex gap-6">
            {/* Left Column Skeleton */}
            <div className="w-1/3 space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-pulse">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-8 w-full bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column Skeleton */}
            <div className="w-2/3 space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-pulse"
                >
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error or not found if professional doesn't exist
  if (error || !professional) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Profesional no encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            {error || `El profesional con ID ${userId} no existe.`}
          </p>
          <button
            onClick={() => router.push("/dashboard/admin/profesionales")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Volver a Profesionales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification for Save Success */}
      {saveSuccessVisible && lastSavedField && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px]">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Cambio guardado</p>
              <p className="text-xs text-green-100">
                {lastSavedField === "email" && "Correo electrónico actualizado"}
                {lastSavedField === "biografia" && "Biografía actualizada"}
                {lastSavedField === "especialidad" &&
                  "Especialidad actualizada"}
                {lastSavedField === "telefono" && "Teléfono actualizado"}
                {lastSavedField === "direccion" &&
                  "Dirección Consultorio actualizada"}
                {lastSavedField === "ciudad" && "Ciudad actualizada"}
                {lastSavedField === "titulacion" && "Titulación actualizada"}
                {lastSavedField === "numeroColegiado" &&
                  "Número de colegiado actualizado"}
                {lastSavedField === "nifCif" && "NIF/CIF actualizado"}
                {lastSavedField === "correoPublico" &&
                  "Correo público actualizado"}
                {lastSavedField === "codigosPostales" &&
                  "Códigos postales actualizados"}
                {lastSavedField === "videoPresentacion" &&
                  "Video de presentación actualizado"}
                {![
                  "email",
                  "biografia",
                  "especialidad",
                  "telefono",
                  "direccion",
                  "ciudad",
                  "titulacion",
                  "numeroColegiado",
                  "nifCif",
                  "correoPublico",
                  "codigosPostales",
                  "videoPresentacion",
                ].includes(lastSavedField) && "Campo actualizado"}
              </p>
            </div>
            <button
              onClick={() => {
                setSaveSuccessVisible(false);
                setLastSavedField(null);
              }}
              className="text-green-100 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Price Save Success */}
      {priceSaveSuccessVisible && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px]">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Precio actualizado</p>
              <p className="text-xs text-green-100">
                El precio se ha guardado correctamente
              </p>
            </div>
            <button
              onClick={() => {
                setPriceSaveSuccessVisible(false);
              }}
              className="text-green-100 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Price Save Error */}
      {priceSaveError && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px]">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Error al guardar precio</p>
              <p className="text-xs text-red-100">{priceSaveError}</p>
            </div>
            <button
              onClick={() => {
                setPriceSaveError(null);
              }}
              className="text-red-100 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm py-6 -mx-6 px-6 mb-6 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Detalles del Profesional
              </h1>
              {professional && (
                <div className="group relative">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      detailedStatus.color === "green"
                        ? "bg-green-100 text-green-700"
                        : detailedStatus.color === "orange"
                        ? "bg-orange-100 text-orange-700"
                        : detailedStatus.color === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : detailedStatus.color === "red"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {detailedStatus.label}
                  </span>
                  {detailedStatus.description && (
                    <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {detailedStatus.description}
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              )}
              {/* Mostrar motivo de rechazo si está rechazado */}
              {professional &&
                professional.estadoAprobacion?.toLowerCase() === "rechazado" &&
                professional.motivoRechazo && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 mb-1">
                          Motivo del Rechazo:
                        </p>
                        <p className="text-sm text-red-700 whitespace-pre-wrap">
                          {professional.motivoRechazo}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => router.push("/dashboard/admin/usuarios")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Administración de Usuarios
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => router.push("/dashboard/admin/profesionales")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Profesionales
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">
                {professional?.name || "Detalles de profesional"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {publicProfileUrl && (
              <div className="flex items-center gap-2 relative">
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  title="Ver perfil público del profesional"
                >
                  <Eye className="h-4 w-4" />
                  Ver perfil público
                </a>
                <button
                  type="button"
                  onClick={handleCopyPublicUrl}
                  className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 ${
                    copyToastVisible
                      ? "bg-green-50 border-green-200 text-green-700"
                      : ""
                  }`}
                  title="Copiar URL pública"
                >
                  <Copy
                    className={`h-4 w-4 ${copyToastVisible ? "scale-110" : ""}`}
                  />
                  <span className="sr-only">Copiar URL pública</span>
                </button>
                <div
                  className={`pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-20 rounded-lg bg-green-600/90 text-white text-xs font-medium px-3 py-2 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${
                    copyToastVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-2 scale-95"
                  }`}
                  aria-live="polite"
                >
                  Enlace agregado al portapapeles
                </div>
              </div>
            )}
            {professional?.status === "pendiente" && (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                title="Aprobar profesional para que aparezca en la plataforma pública"
              >
                Aprobar Profesional
              </button>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  Cambios sin guardar
                </span>
              </div>
            )}
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                hasUnsavedChanges
                  ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Professional Details */}
          <div className="w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Profile Header */}
              <div className="relative overflow-hidden">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                  style={{
                    backgroundImage: "url('/Background.png')",
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10 p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <button
                      type="button"
                      onClick={openPhotoModal}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                      title={
                        professional.profileImage
                          ? "Ver / Cambiar foto"
                          : "Agregar foto de perfil"
                      }
                    >
                      {professional.profileImage ? (
                        <img
                          src={professional.profileImage}
                          alt={professional.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                          {professional.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                    </button>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {professional.name}
                      </h2>
                      <p className="text-gray-500 text-sm mb-3 font-medium">
                        @{professional.username}
                      </p>
                      {/* Indicadores de Setup */}
                      <div className="flex items-center justify-center gap-3">
                        <div className="group relative">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              professional.tieneStripe
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-500 border border-gray-200"
                            }`}
                          >
                            <CreditCard
                              className={`h-3.5 w-3.5 ${
                                professional.tieneStripe
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span>Stripe</span>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            {professional.tieneStripe
                              ? "Stripe Connect configurado y activo"
                              : "Stripe Connect no configurado"}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </div>
                        <div className="group relative">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              professional.tieneGoogleCalendar
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-50 text-gray-500 border border-gray-200"
                            }`}
                          >
                            <CalendarIcon
                              className={`h-3.5 w-3.5 ${
                                professional.tieneGoogleCalendar
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span>Google</span>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            {professional.tieneGoogleCalendar
                              ? "Google Calendar conectado y sincronizado"
                              : "Google Calendar no conectado"}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
                {/* User ID */}
                <div className="group relative p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                      <Lock className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      Número de Usuario
                    </span>
                  </div>
                  {editingField === "numeroUsuario" ? (
                    <div className="ml-10 space-y-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit("numeroUsuario");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("numeroUsuario")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-10 flex items-center justify-between -mx-3 px-3 py-2 rounded-lg transition-colors group-hover:bg-gray-50/80">
                      <span className="text-sm font-semibold text-gray-900">
                        {professional.id}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("numeroUsuario", professional.id)
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all shadow-sm"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </span>
                  </div>
                  {editingField === "email" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("email");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("email")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.email}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("email", professional.email)
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Public Email */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Correo Público
                    </span>
                  </div>
                  {editingField === "correoPublico" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit("correoPublico");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("correoPublico")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.publicEmail || "Sin correo público"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "correoPublico",
                            professional.publicEmail || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Biografía
                    </span>
                  </div>
                  {editingField === "biografia" ? (
                    <div className="ml-9 space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-y"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("biografia")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-start justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900 flex-1 pr-2">
                        {professional.bio || "Sin biografía"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("biografia", professional.bio || "")
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all flex-shrink-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Video de Presentación */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Video de Presentación
                    </span>
                  </div>
                  {editingField === "videoPresentacion" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="url"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit("videoPresentacion");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("videoPresentacion")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900 truncate pr-2">
                        {form.videoPresentacion || "Sin video de presentación"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "videoPresentacion",
                            form.videoPresentacion || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all flex-shrink-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Specialty */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Especialidad
                    </span>
                  </div>
                  {editingField === "especialidad" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("especialidad");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("especialidad")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.specialty || "Sin especialidad"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "especialidad",
                            professional.specialty || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Titulación */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Titulación
                    </span>
                  </div>
                  {editingField === "titulacion" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("titulacion");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("titulacion")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.titulacion || "No especificada"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "titulacion",
                            professional.titulacion || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* License Number */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Número de Colegiado
                    </span>
                  </div>
                  {editingField === "numeroColegiado" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit("numeroColegiado");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("numeroColegiado")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.licenseNumber || "No especificado"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "numeroColegiado",
                            professional.licenseNumber || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* NIF/CIF */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      NIF/CIF
                    </span>
                  </div>
                  {editingField === "nifCif" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("nifCif");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("nifCif")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.nifCif || "No especificado"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("nifCif", professional.nifCif || "")
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Phone className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Número de Teléfono
                    </span>
                  </div>
                  {editingField === "telefono" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="tel"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("telefono");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("telefono")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.phone || "Sin teléfono"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("telefono", professional.phone || "")
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Dirección Consultorio
                    </span>
                  </div>
                  {editingField === "direccion" ? (
                    <div className="ml-9 space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] resize-y"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("direccion")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-start justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900 flex-1 pr-2">
                        {(professional as any)?.domicilio_consultorio ||
                          (professional as any)?.consultorio ||
                          "Sin dirección de consultorio"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "direccion",
                            (professional as any)?.domicilio_consultorio ||
                              (professional as any)?.consultorio ||
                              ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all flex-shrink-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Home Visit Postal Codes */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      CPs Domicilio
                    </span>
                  </div>
                  {editingField === "codigosPostales" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Ej: 28001, 28002, 28003"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit("codigosPostales");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("codigosPostales")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.homeVisitPostalCodes || "Sin códigos postales especificados"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField(
                            "codigosPostales",
                            professional.homeVisitPostalCodes || ""
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="group relative">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Ciudad
                    </span>
                  </div>
                  {editingField === "ciudad" ? (
                    <div className="ml-9 space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Ej. Madrid"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit("ciudad");
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit("ciudad")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-9 flex items-center justify-between group-hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      <span className="text-sm font-medium text-gray-900">
                        {professional.city || "Sin ciudad"}
                      </span>
                      <button
                        onClick={() =>
                          handleEditField("ciudad", professional.city || "")
                        }
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobility Access */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">
                      Acceso Movilidad
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {professional.mobilityAccess ? "Sí" : "No"}
                    </span>
                  </div>
                </div>

                {/* Documents Section */}
                {professional.documents &&
                  Object.values(professional.documents).some(Boolean) && (
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Documentación Adjunta
                      </h3>
                      <div className="space-y-3">
                        {professional.documents.identityCard && (
                          <a
                            href={professional.documents.identityCard}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .667.333 1 1 1v1m2-2c0 .667-.333 1-1 1v1"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Documento de Identidad
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                        {professional.documents.universityDegree && (
                          <a
                            href={professional.documents.universityDegree}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Título Universitario
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                        {professional.documents.insurance && (
                          <a
                            href={professional.documents.insurance}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Seguro RC
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                        {professional.documents.collegialCertificate && (
                          <a
                            href={professional.documents.collegialCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Certificado Colegiación
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                        {professional.documents.cv && (
                          <a
                            href={professional.documents.cv}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Curriculum Vitae
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                        {professional.documents.criminalRecord && (
                          <a
                            href={professional.documents.criminalRecord}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Certificado Delitos
                              </p>
                              <p className="text-xs text-gray-500">
                                Ver archivo
                              </p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary and Transactions */}
          <div className="w-2/3 space-y-6">
            {/* Información Extra */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Extra
              </h3>
              <div className="space-y-6">
                {/* Modalities */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Modalidades de Atención
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Obtener modalidades
                      let modalidadesList: string[] = [];

                      if (professional.modalities) {
                        if (Array.isArray(professional.modalities)) {
                          modalidadesList = professional.modalities;
                        } else if (
                          typeof professional.modalities === "string"
                        ) {
                          try {
                            const parsed = JSON.parse(professional.modalities);
                            modalidadesList = Array.isArray(parsed)
                              ? parsed
                              : [];
                          } catch (e) {
                            console.warn("Error al parsear modalidades:", e);
                            modalidadesList = [];
                          }
                        }
                      }

                      // Si no hay modalidades, mostrar mensaje
                      if (modalidadesList.length === 0) {
                        return (
                          <span className="text-gray-500 text-sm italic">
                            No especificadas
                          </span>
                        );
                      }

                      // Mapear y mostrar las modalidades
                      return modalidadesList.map((mod: string, idx: number) => {
                        // Normalizar el nombre de la modalidad para mostrar
                        const modalidadNombre = mod
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase());

                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {modalidadNombre}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Servicios Ofrecidos
                  </h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {(() => {
                      if (!professional.services) {
                        return (
                          <span className="text-gray-500 italic">
                            No especificados
                          </span>
                        );
                      }

                      const servicesData = professional.services;

                      // Si es un string JSON, intentar parsearlo
                      if (
                        typeof servicesData === "string" &&
                        (servicesData.startsWith("[") ||
                          servicesData.startsWith("{"))
                      ) {
                        try {
                          const parsed = JSON.parse(servicesData);
                          if (Array.isArray(parsed)) {
                            return parsed.join(", ");
                          }
                          if (typeof parsed === "object") {
                            return Object.values(parsed).join(", ");
                          }
                          return servicesData;
                        } catch {
                          return servicesData;
                        }
                      }

                      // Si es un string normal, mostrarlo
                      if (
                        typeof servicesData === "string" &&
                        servicesData.trim()
                      ) {
                        return servicesData;
                      }

                      // Si es un array, unirlo con comas
                      if (Array.isArray(servicesData)) {
                        return servicesData.join(", ");
                      }

                      return (
                        <span className="text-gray-500 italic">
                          No especificados
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Observations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {professional.observations || "Sin observaciones"}
                  </p>
                </div>
              </div>
            </div>

            {/* Horarios de Atención */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Horarios de Atención
                </h3>
                {savingSchedule && (
                  <span className="text-sm text-gray-500">Guardando...</span>
                )}
              </div>

              <div className="space-y-6">
                {loadingSchedule ? (
                  <div className="text-gray-600">Cargando horarios...</div>
                ) : scheduleError ? (
                  <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                    {scheduleError}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Agrupar horarios por tipo de atención */}
                    {[
                      {
                        tipo: "presencial",
                        label: "Atención Presencial",
                        bgClass: "bg-blue-50",
                        borderClass: "border-blue-200",
                        textClass: "text-blue-900",
                      },
                      {
                        tipo: "en_linea",
                        label: "Atención En Línea",
                        bgClass: "bg-green-50",
                        borderClass: "border-green-200",
                        textClass: "text-green-900",
                      },
                      {
                        tipo: "a_domicilio",
                        label: "Atención A Domicilio",
                        bgClass: "bg-purple-50",
                        borderClass: "border-purple-200",
                        textClass: "text-purple-900",
                      },
                    ].map(
                      ({ tipo, label, bgClass, borderClass, textClass }) => {
                        const horariosPorTipo = scheduleItems.filter(
                          (item) =>
                            item.tipo_atencion === tipo && item.activo !== false
                        );

                        return (
                          <div
                            key={tipo}
                            className="border border-gray-200 rounded-xl overflow-hidden"
                          >
                            <div
                              className={`${bgClass} border-b ${borderClass} px-4 py-3`}
                            >
                              <h4
                                className={`text-sm font-semibold ${textClass}`}
                              >
                                {label}
                              </h4>
                            </div>

                            <div className="p-4">
                              {/* Agrupar por día dentro de este tipo */}
                              <div className="space-y-4">
                                {allDays.map((dia) => {
                                  const horariosDelDia = horariosPorTipo.filter(
                                    (item) => item.dia_semana === dia
                                  );

                                  // Solo mostrar días que tienen horarios
                                  if (horariosDelDia.length === 0) return null;

                                  return (
                                    <div
                                      key={`${tipo}-${dia}`}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                          {displayDay(dia)}
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        {horariosDelDia.map((horario, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                          >
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                              <div>
                                                <span className="text-xs text-gray-600 block mb-1">
                                                  Hora inicio
                                                </span>
                                                <input
                                                  type="time"
                                                  value={
                                                    horario.hora_inicio?.slice(
                                                      0,
                                                      5
                                                    ) || ""
                                                  }
                                                  onChange={(e) => {
                                                    const updated = [
                                                      ...scheduleItems,
                                                    ];
                                                    const foundIdx =
                                                      updated.findIndex(
                                                        (item) =>
                                                          item === horario
                                                      );
                                                    if (foundIdx >= 0) {
                                                      updated[foundIdx] = {
                                                        ...updated[foundIdx],
                                                        hora_inicio:
                                                          e.target.value,
                                                      };
                                                      setScheduleItems(updated);
                                                    }
                                                  }}
                                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                                />
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-600 block mb-1">
                                                  Hora fin
                                                </span>
                                                <input
                                                  type="time"
                                                  value={
                                                    horario.hora_fin?.slice(
                                                      0,
                                                      5
                                                    ) || ""
                                                  }
                                                  onChange={(e) => {
                                                    const updated = [
                                                      ...scheduleItems,
                                                    ];
                                                    const foundIdx =
                                                      updated.findIndex(
                                                        (item) =>
                                                          item === horario
                                                      );
                                                    if (foundIdx >= 0) {
                                                      updated[foundIdx] = {
                                                        ...updated[foundIdx],
                                                        hora_fin:
                                                          e.target.value,
                                                      };
                                                      setScheduleItems(updated);
                                                    }
                                                  }}
                                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                                />
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => {
                                                setScheduleItems(
                                                  scheduleItems.filter(
                                                    (item) => item !== horario
                                                  )
                                                );
                                              }}
                                              className="text-red-600 hover:text-red-700 p-2"
                                              title="Eliminar horario"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Botón para agregar horarios de este tipo */}
                                {horariosPorTipo.length === 0 ? (
                                  <p className="text-sm text-gray-500 text-center py-4">
                                    Sin horarios configurados para esta
                                    modalidad
                                  </p>
                                ) : null}

                                {/* Selector de día para agregar nuevo horario */}
                                <div className="pt-4 border-t border-gray-200">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setScheduleItems([
                                          ...scheduleItems,
                                          {
                                            dia_semana: e.target.value,
                                            hora_inicio: "09:00",
                                            hora_fin: "17:00",
                                            tipo_atencion: tipo as any,
                                            activo: true,
                                          },
                                        ]);
                                        e.target.value = ""; // Reset selector
                                      }
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      + Agregar horario para...
                                    </option>
                                    {allDays.map((dia) => (
                                      <option key={dia} value={dia}>
                                        {displayDay(dia)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={async () => {
                      if (!professionalIdProfesional) return;
                      try {
                        setSavingSchedule(true);
                        setScheduleError(null);
                        const adminToken =
                          typeof window !== "undefined"
                            ? JSON.parse(
                                window.localStorage.getItem("user") || "{}"
                              )?.token
                            : null;
                        if (!adminToken)
                          throw new Error(
                            "Token de administrador no disponible"
                          );
                        const apiBase = (
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:3000/api"
                        ).replace(/\/$/, "");

                        // Normalizar hora a formato HH:MM:SS
                        const normalizeTime = (time: string) => {
                          if (!time) return "00:00:00";
                          if (time.length === 5) return `${time}:00`;
                          if (time.length === 8) return time;
                          return time;
                        };

                        // Función para extraer horarios del response (misma lógica que al cargar)
                        const extractSchedules = (obj: any): any[] => {
                          const results: any[] = [];
                          const visit = (node: any) => {
                            if (!node) return;
                            if (Array.isArray(node)) {
                              if (
                                node.length &&
                                typeof node[0] === "object" &&
                                ("dia_semana" in (node[0] || {}) ||
                                  "id_disponibilidad" in (node[0] || {}))
                              ) {
                                results.push(node);
                              } else {
                                node.forEach(visit);
                              }
                            } else if (typeof node === "object") {
                              Object.values(node).forEach(visit);
                            }
                          };
                          visit(obj);
                          if (!results.length) {
                            const guess =
                              obj?.data?.disponibilidad ||
                              obj?.disponibilidad ||
                              obj?.data ||
                              [];
                            if (Array.isArray(guess)) results.push(guess);
                          }
                          return results.flat();
                        };

                        // 1. Eliminar todos los horarios existentes
                        const currentRes = await fetch(
                          `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
                          { headers: { Authorization: `Bearer ${adminToken}` } }
                        );
                        const currentData = await currentRes
                          .json()
                          .catch(() => ({}));
                        const currentList = extractSchedules(currentData);

                        // Eliminar cada horario existente y verificar éxito
                        let deletedCount = 0;
                        for (const cur of currentList) {
                          const delId = cur.id_disponibilidad || cur.id || null;
                          if (!delId) continue;
                          const delRes = await fetch(
                            `${apiBase}/disponibilidad-horarios/${delId}`,
                            {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${adminToken}`,
                              },
                            }
                          );
                          if (delRes.ok) {
                            deletedCount++;
                          } else {
                            console.warn(
                              `No se pudo eliminar horario ${delId}:`,
                              await delRes.text().catch(() => "")
                            );
                          }
                        }
                        console.log(
                          `Eliminados ${deletedCount} de ${currentList.length} horarios existentes`
                        );

                        // 2. Crear todos los horarios desde scheduleItems
                        let createdCount = 0;
                        for (const item of scheduleItems) {
                          if (
                            !item.dia_semana ||
                            !item.hora_inicio ||
                            !item.hora_fin
                          )
                            continue;

                          const hora_inicio = normalizeTime(item.hora_inicio);
                          const hora_fin = normalizeTime(item.hora_fin);
                          const hh = parseInt(hora_inicio.split(":")[0], 10);
                          const turno = isNaN(hh)
                            ? null
                            : hh < 14
                            ? "matutino"
                            : "vespertino";

                          const createBody = {
                            id_profesional: Number(professionalIdProfesional),
                            dia_semana: item.dia_semana,
                            hora_inicio: hora_inicio,
                            hora_fin: hora_fin,
                            tipo_atencion: item.tipo_atencion || "presencial",
                            turno: turno,
                            activo: 1,
                          };

                          const createRes = await fetch(
                            `${apiBase}/disponibilidad-horarios`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${adminToken}`,
                              },
                              body: JSON.stringify(createBody),
                            }
                          );
                          if (createRes.ok) {
                            createdCount++;
                          } else {
                            console.warn(
                              `Error al crear horario:`,
                              await createRes.text().catch(() => "")
                            );
                          }
                        }
                        console.log(`Creados ${createdCount} horarios nuevos`);

                        // 3. Recargar los horarios desde el servidor para sincronizar
                        const refreshRes = await fetch(
                          `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
                          { headers: { Authorization: `Bearer ${adminToken}` } }
                        );
                        if (refreshRes.ok) {
                          const refreshData = await refreshRes
                            .json()
                            .catch(() => ({}));
                          const refreshedList = extractSchedules(refreshData);
                          const normalizeTipo = (
                            val: any
                          ):
                            | "presencial"
                            | "en_linea"
                            | "a_domicilio"
                            | null => {
                            if (!val && typeof val !== "string") return null;
                            const raw = String(val || "")
                              .toLowerCase()
                              .trim()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "");
                            const s = raw
                              .replace(/\s+/g, "_")
                              .replace(/en-linea|en_linea|online/, "en_linea")
                              .replace(
                                /a-domicilio|a__domicilio|a_domicilio/,
                                "a_domicilio"
                              );
                            if (s.includes("en_linea")) return "en_linea";
                            if (s.includes("a_domicilio")) return "a_domicilio";
                            if (s.includes("presencial") || s === "")
                              return "presencial";
                            return null;
                          };
                          const mapped = refreshedList.map((h: any) => ({
                            id_disponibilidad: h.id_disponibilidad,
                            dia_semana: (h.dia_semana || "").toLowerCase(),
                            hora_inicio:
                              h.hora_inicio?.slice?.(0, 5) || h.hora_inicio,
                            hora_fin: h.hora_fin?.slice?.(0, 5) || h.hora_fin,
                            tipo_atencion: normalizeTipo(h.tipo_atencion),
                            activo: h.activo ?? true,
                          }));
                          setScheduleItems(mapped);
                        }

                        alert("Horarios guardados correctamente");
                      } catch (e: any) {
                        setScheduleError(
                          e?.message || "Error al actualizar horarios"
                        );
                      } finally {
                        setSavingSchedule(false);
                      }
                    }}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50"
                    disabled={savingSchedule || loadingSchedule}
                  >
                    {savingSchedule ? "Guardando..." : "Guardar Horarios"}
                  </button>
                </div>
              </div>
            </div>

            {/* Paquetes de Precios */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Paquetes de Precios
                </h3>
              </div>
              {(() => {
                let pricesList: any[] = [];
                if (Array.isArray(professional.prices)) {
                  pricesList = professional.prices;
                } else if (typeof professional.prices === "string") {
                  try {
                    const parsed = JSON.parse(professional.prices);
                    if (Array.isArray(parsed)) pricesList = parsed;
                    else if (typeof parsed === "object")
                      pricesList = Object.values(parsed);
                  } catch {}
                } else if (
                  typeof professional.prices === "object" &&
                  professional.prices !== null
                ) {
                  pricesList = Object.values(professional.prices);
                }

                if (pricesList.length === 0) {
                  return (
                    <span className="text-gray-500 text-sm">
                      No especificados
                    </span>
                  );
                }

                // Agrupar precios por modalidad
                const pricesByModality: Record<
                  string,
                  { prices: any[]; originalIndices: number[] }
                > = {};

                pricesList.forEach((value: any, idx: number) => {
                  if (!value) return;
                  const modalidad =
                    value.modalidad || value.modalidad_atencion || "presencial";
                  const normalizedModality = modalidad.toLowerCase().trim();

                  // Normalizar modalidad: 'domicilio' o 'a_domicilio' -> 'domicilio', otros -> 'presencial' por defecto
                  const modalityKey =
                    normalizedModality === "domicilio" ||
                    normalizedModality === "a_domicilio"
                      ? "domicilio"
                      : normalizedModality === "virtual" ||
                        normalizedModality === "en_linea" ||
                        normalizedModality === "online"
                      ? "virtual"
                      : "presencial";

                  if (!pricesByModality[modalityKey]) {
                    pricesByModality[modalityKey] = {
                      prices: [],
                      originalIndices: [],
                    };
                  }
                  pricesByModality[modalityKey].prices.push(value);
                  pricesByModality[modalityKey].originalIndices.push(idx);
                });

                // Función para obtener el nombre de la modalidad
                const getModalityName = (modality: string) => {
                  switch (modality.toLowerCase()) {
                    case "domicilio":
                    case "a_domicilio":
                      return "A Domicilio";
                    case "virtual":
                    case "en_linea":
                    case "online":
                      return "Virtual Presencial";
                    case "presencial":
                    default:
                      return "Presencial";
                  }
                };

                // Orden de visualización: presencial primero, luego domicilio, luego virtual
                const modalityOrder = ["presencial", "domicilio", "virtual"];
                const sortedModalities = Object.keys(pricesByModality).sort(
                  (a, b) => {
                    const indexA = modalityOrder.indexOf(a);
                    const indexB = modalityOrder.indexOf(b);
                    return (
                      (indexA === -1 ? 999 : indexA) -
                      (indexB === -1 ? 999 : indexB)
                    );
                  }
                );

                return (
                  <div className="space-y-6">
                    {sortedModalities.map((modalityKey) => {
                      const { prices, originalIndices } =
                        pricesByModality[modalityKey];

                      return (
                        <div key={modalityKey} className="space-y-3">
                          {/* Título de la modalidad */}
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <h4 className="text-base font-semibold text-gray-900">
                              Precios - {getModalityName(modalityKey)}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {prices.length}{" "}
                              {prices.length === 1 ? "paquete" : "paquetes"}
                            </span>
                          </div>

                          {/* Lista de precios de esta modalidad */}
                          <div className="space-y-4">
                            {prices.map((value: any, localIdx: number) => {
                              const originalIdx = originalIndices[localIdx];
                              const isEditing = editingPriceId === originalIdx;
                              const price =
                                value.price ||
                                value.precio ||
                                value.monto ||
                                value.amount ||
                                "0";
                              const name =
                                value.name ||
                                value.nombre ||
                                value.title ||
                                value.nombre_paquete ||
                                value.nombre_servicio ||
                                `Paquete ${localIdx + 1}`;
                              const duracionMinutos =
                                value.duracion_minutos || value.duracion;
                              const duracionFormatted = duracionMinutos
                                ? `${duracionMinutos} min`
                                : "";

                              return (
                                <div
                                  key={`${modalityKey}-${originalIdx}`}
                                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                >
                                  {isEditing ? (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">
                                            Precio
                                          </label>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                              €
                                            </span>
                                            <input
                                              type="text"
                                              value={
                                                editingPriceData.precio || ""
                                              }
                                              onChange={(e) =>
                                                setEditingPriceData({
                                                  ...editingPriceData,
                                                  precio: e.target.value,
                                                })
                                              }
                                              placeholder="Ej: 50"
                                              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">
                                            Nombre y descripción del paquete
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              editingPriceData.nombre || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPriceData({
                                                ...editingPriceData,
                                                nombre: e.target.value,
                                              })
                                            }
                                            placeholder="Ej: Primera sesión"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">
                                            Duración
                                          </label>
                                          <select
                                            value={
                                              editingPriceData.duracion || ""
                                            }
                                            onChange={(e) =>
                                              setEditingPriceData({
                                                ...editingPriceData,
                                                duracion: e.target.value,
                                              })
                                            }
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                          >
                                            <option value="">
                                              Selecciona duración
                                            </option>
                                            {durationOptions.map((opt) => (
                                              <option
                                                key={`dur-${originalIdx}-${opt}`}
                                                value={opt}
                                              >
                                                {opt}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 pt-2">
                                        <button
                                          onClick={() =>
                                            handleSavePrice(originalIdx, value)
                                          }
                                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                          <Save className="h-4 w-4" />
                                          Guardar
                                        </button>
                                        <button
                                          onClick={handleCancelPriceEdit}
                                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                          <X className="h-4 w-4" />
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">
                                            Precio
                                          </p>
                                          <p className="text-lg font-bold text-primary">
                                            €
                                            {typeof price === "number"
                                              ? price.toFixed(2)
                                              : parseFloat(price).toFixed(2)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">
                                            Nombre
                                          </p>
                                          <p className="text-sm font-medium text-gray-900 capitalize">
                                            {name}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">
                                            Duración
                                          </p>
                                          <p className="text-sm text-gray-700">
                                            {duracionFormatted ||
                                              "No especificada"}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleEditPrice(originalIdx, value)
                                        }
                                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Editar precio"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historial de transacciones
                </h3>
                <button
                  onClick={handleFilterToggle}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        # ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Producto
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                        Estado
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingFinance && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 px-4 text-sm text-gray-600"
                        >
                          Cargando transacciones...
                        </td>
                      </tr>
                    )}
                    {!loadingFinance && financeError && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 px-4 text-sm text-red-600"
                        >
                          {financeError}
                        </td>
                      </tr>
                    )}
                    {!loadingFinance &&
                      !financeError &&
                      (!transactions || transactions.length === 0) && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 px-4 text-sm text-gray-600"
                          >
                            No hay transacciones para mostrar.
                          </td>
                        </tr>
                      )}
                    {(transactions || []).map((tx: any, index: number) => {
                      const id =
                        tx.id_pago ||
                        tx.id ||
                        tx.charge_id ||
                        tx.transaction_id ||
                        `#${index + 1}`;
                      const product =
                        tx.descripcion ||
                        tx.description ||
                        tx.product ||
                        tx.servicio ||
                        tx.nombre_paquete ||
                        (tx.amount || tx.total || tx.monto
                          ? "Pago"
                          : "Transacción");
                      const total =
                        typeof tx.amount === "number"
                          ? `${(tx.amount / 100).toFixed(2)}€`
                          : typeof tx.monto === "number"
                          ? `${Number(tx.monto).toFixed(2)}€`
                          : typeof tx.total === "number"
                          ? `${Number(tx.total).toFixed(2)}€`
                          : tx.total || tx.amount || tx.monto || "0.00€";
                      const status =
                        tx.status ||
                        tx.estado ||
                        tx.estado_pago ||
                        "Procesando";
                      const date =
                        tx.created_at ||
                        tx.created ||
                        tx.fecha ||
                        tx.fecha_pago ||
                        new Date().toLocaleDateString();
                      const statusColor =
                        status === "succeeded" ||
                        status === "pagado" ||
                        status === "Completada"
                          ? "bg-green-100 text-green-800"
                          : status === "pending" || status === "Pendiente"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800";
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                            {id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gray-100 rounded-full" />
                              </div>
                              <span className="text-sm text-gray-900">
                                {product}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                            {total}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            {typeof date === "string"
                              ? date
                              : new Date(date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Mostrando{" "}
                  {txTotal > 0
                    ? `${Math.min(
                        (txPage - 1) * txLimit + 1,
                        txTotal
                      )}–${Math.min(txPage * txLimit, txTotal)} de ${txTotal}`
                    : "0 de 0"}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    disabled={txPage <= 1 || loadingFinance}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white">
                    {txPage}
                  </span>
                  <button
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => {
                      const maxPage =
                        txTotal > 0 ? Math.ceil(txTotal / txLimit) : txPage + 1;
                      setTxPage((p) => Math.min(maxPage, p + 1));
                    }}
                    disabled={
                      loadingFinance ||
                      (txTotal > 0 && txPage >= Math.ceil(txTotal / txLimit))
                    }
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
                      checked={filters.status.cancelada}
                      onChange={() => handleFilterChange("status", "cancelada")}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Cancelada</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.completada}
                      onChange={() =>
                        handleFilterChange("status", "completada")
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Completada</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.pendiente}
                      onChange={() => handleFilterChange("status", "pendiente")}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pendiente</span>
                  </label>
                </div>
              </div>

              {/* Tipo de Sesión Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Tipo de Sesión
                  </h3>
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.primeraSesion}
                      onChange={() =>
                        handleFilterChange("sessionType", "primeraSesion")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Primera Sesión
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.sesionSeguimiento}
                      onChange={() =>
                        handleFilterChange("sessionType", "sesionSeguimiento")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Sesión de Seguimiento
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.sessionType.packX3}
                      onChange={() =>
                        handleFilterChange("sessionType", "packX3")
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Pack x3</span>
                  </label>
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
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90"
              >
                Aplicar Filtro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Horarios del profesional
              </h2>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setScheduleError(null);
                  setScheduleItems([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {loadingSchedule ? (
                <div className="text-gray-600">Cargando horarios...</div>
              ) : scheduleError ? (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                  {scheduleError}
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Mostrar horarios agrupados por día */}
                  {allDays.map((dia) => {
                    const horariosDelDia = scheduleItems.filter(
                      (item) => item.dia_semana === dia && item.activo !== false
                    );

                    return (
                      <div
                        key={dia}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <span className="text-sm font-medium text-gray-900">
                            {displayDay(dia)}
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          {horariosDelDia.length > 0 ? (
                            horariosDelDia.map((horario, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                  <div>
                                    <span className="text-xs text-gray-600 block mb-1">
                                      Hora inicio
                                    </span>
                                    <input
                                      type="time"
                                      value={
                                        horario.hora_inicio?.slice(0, 5) || ""
                                      }
                                      onChange={(e) => {
                                        const updated = [...scheduleItems];
                                        const foundIdx = updated.findIndex(
                                          (item) => item === horario
                                        );
                                        if (foundIdx >= 0) {
                                          updated[foundIdx] = {
                                            ...updated[foundIdx],
                                            hora_inicio: e.target.value,
                                          };
                                          setScheduleItems(updated);
                                        }
                                      }}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-600 block mb-1">
                                      Hora fin
                                    </span>
                                    <input
                                      type="time"
                                      value={
                                        horario.hora_fin?.slice(0, 5) || ""
                                      }
                                      onChange={(e) => {
                                        const updated = [...scheduleItems];
                                        const foundIdx = updated.findIndex(
                                          (item) => item === horario
                                        );
                                        if (foundIdx >= 0) {
                                          updated[foundIdx] = {
                                            ...updated[foundIdx],
                                            hora_fin: e.target.value,
                                          };
                                          setScheduleItems(updated);
                                        }
                                      }}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-600 block mb-1">
                                      Modalidad
                                    </span>
                                    <select
                                      value={
                                        horario.tipo_atencion || "presencial"
                                      }
                                      onChange={(e) => {
                                        const updated = [...scheduleItems];
                                        const foundIdx = updated.findIndex(
                                          (item) => item === horario
                                        );
                                        if (foundIdx >= 0) {
                                          updated[foundIdx] = {
                                            ...updated[foundIdx],
                                            tipo_atencion: e.target
                                              .value as any,
                                          };
                                          setScheduleItems(updated);
                                        }
                                      }}
                                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                    >
                                      <option value="presencial">
                                        Presencial
                                      </option>
                                      <option value="en_linea">En línea</option>
                                      <option value="a_domicilio">
                                        A domicilio
                                      </option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setScheduleItems(
                                      scheduleItems.filter(
                                        (item) => item !== horario
                                      )
                                    );
                                  }}
                                  className="text-red-600 hover:text-red-700 p-2"
                                  title="Eliminar horario"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-2">
                              Sin horarios configurados
                            </p>
                          )}

                          <button
                            onClick={() => {
                              setScheduleItems([
                                ...scheduleItems,
                                {
                                  dia_semana: dia,
                                  hora_inicio: "09:00",
                                  hora_fin: "17:00",
                                  tipo_atencion: "presencial",
                                  activo: true,
                                },
                              ]);
                            }}
                            className="w-full px-3 py-2 text-xs text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            + Agregar horario
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setScheduleError(null);
                  setScheduleItems([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={savingSchedule}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!professionalIdProfesional) return;
                  try {
                    setSavingSchedule(true);
                    setScheduleError(null);
                    const adminToken =
                      typeof window !== "undefined"
                        ? JSON.parse(
                            window.localStorage.getItem("user") || "{}"
                          )?.token
                        : null;
                    if (!adminToken)
                      throw new Error("Token de administrador no disponible");
                    const apiBase = (
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:3000/api"
                    ).replace(/\/$/, "");

                    // Normalizar hora a formato HH:MM:SS
                    const normalizeTime = (time: string) => {
                      if (!time) return "00:00:00";
                      if (time.length === 5) return `${time}:00`;
                      if (time.length === 8) return time;
                      return time;
                    };

                    // Función para extraer horarios del response
                    const extractSchedules = (obj: any): any[] => {
                      const results: any[] = [];
                      const visit = (node: any) => {
                        if (!node) return;
                        if (Array.isArray(node)) {
                          if (
                            node.length &&
                            typeof node[0] === "object" &&
                            ("dia_semana" in (node[0] || {}) ||
                              "id_disponibilidad" in (node[0] || {}))
                          ) {
                            results.push(node);
                          } else {
                            node.forEach(visit);
                          }
                        } else if (typeof node === "object") {
                          Object.values(node).forEach(visit);
                        }
                      };
                      visit(obj);
                      if (!results.length) {
                        const guess =
                          obj?.data?.disponibilidad ||
                          obj?.disponibilidad ||
                          obj?.data ||
                          [];
                        if (Array.isArray(guess)) results.push(guess);
                      }
                      return results.flat();
                    };

                    // 1. Eliminar todos los horarios existentes
                    const currentRes = await fetch(
                      `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
                      { headers: { Authorization: `Bearer ${adminToken}` } }
                    );
                    const currentData = await currentRes
                      .json()
                      .catch(() => ({}));
                    const currentList = extractSchedules(currentData);

                    for (const cur of currentList) {
                      const delId = cur.id_disponibilidad || cur.id || null;
                      if (!delId) continue;
                      await fetch(
                        `${apiBase}/disponibilidad-horarios/${delId}`,
                        {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${adminToken}` },
                        }
                      );
                    }

                    // 2. Crear todos los horarios desde scheduleItems
                    for (const item of scheduleItems) {
                      if (
                        !item.dia_semana ||
                        !item.hora_inicio ||
                        !item.hora_fin
                      )
                        continue;

                      const hora_inicio = normalizeTime(item.hora_inicio);
                      const hora_fin = normalizeTime(item.hora_fin);
                      const hh = parseInt(hora_inicio.split(":")[0], 10);
                      const turno = isNaN(hh)
                        ? null
                        : hh < 14
                        ? "matutino"
                        : "vespertino";

                      const createBody = {
                        id_profesional: Number(professionalIdProfesional),
                        dia_semana: item.dia_semana,
                        hora_inicio: hora_inicio,
                        hora_fin: hora_fin,
                        tipo_atencion: item.tipo_atencion || "presencial",
                        turno: turno,
                        activo: 1,
                      };

                      const postRes = await fetch(
                        `${apiBase}/disponibilidad-horarios`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${adminToken}`,
                          },
                          body: JSON.stringify(createBody),
                        }
                      );

                      if (!postRes.ok) {
                        const postErr = await postRes.json().catch(() => ({}));
                        throw new Error(
                          postErr?.message ||
                            postErr?.error ||
                            "Error al crear horario"
                        );
                      }
                    }

                    setIsScheduleModalOpen(false);
                    alert("Horarios guardados correctamente");
                  } catch (e: any) {
                    setScheduleError(
                      e?.message || "Error al actualizar horarios"
                    );
                  } finally {
                    setSavingSchedule(false);
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50"
                disabled={savingSchedule || loadingSchedule}
              >
                {savingSchedule ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isPasswordResetOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <PasswordResetModal
            isOpen={isPasswordResetOpen}
            onClose={() => {
              setIsPasswordResetOpen(false);
              setPasswordResetError(null);
            }}
            onConfirm={confirmPasswordReset}
            userEmail={professional?.email || ""}
            loading={resettingPassword}
            error={passwordResetError}
          />
        </Suspense>
      )}
      {isSaveChangesOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <SaveChangesModal
            isOpen={isSaveChangesOpen}
            onClose={() => {
              setIsSaveChangesOpen(false);
              setSaveError(null);
            }}
            onConfirm={confirmSave}
          />
        </Suspense>
      )}
      {isDeactivateOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <DeactivateUserModal
            isOpen={isDeactivateOpen}
            onClose={() => {
              setIsDeactivateOpen(false);
              setStatusError(null);
            }}
            onConfirm={confirmDeactivate}
            userName={professional?.name || ""}
            loading={changingStatus}
            error={statusError}
          />
        </Suspense>
      )}

      {/* Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {professional?.profileImage
                  ? "Foto de perfil"
                  : "Agregar foto de perfil"}
              </h2>
              <button
                onClick={closePhotoModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {professional?.profileImage && !photoPreviewUrl && (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={professional.profileImage}
                    alt="Foto de perfil"
                    className="h-28 w-28 rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
              {photoPreviewUrl && (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={photoPreviewUrl}
                    alt="Previsualización"
                    className="h-28 w-28 rounded-full object-cover border border-primary/30"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="admin-photo-upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
                >
                  Subir nueva
                  <input
                    id="admin-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickPhoto}
                  />
                </label>
                {photoPreviewUrl && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
                      setPhotoPreviewUrl(null);
                      setPhotoFile(null);
                    }}
                  >
                    Quitar selección
                  </button>
                )}
              </div>
              {photoError && (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                  {photoError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closePhotoModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploadingPhoto}
              >
                Cancelar
              </button>
              <button
                onClick={confirmUploadPhoto}
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50"
                disabled={uploadingPhoto || !photoFile}
              >
                {uploadingPhoto ? "Subiendo..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Error Message */}
      {approvalError && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">{approvalError}</p>
            <button
              onClick={() => setApprovalError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {saveError}
        </div>
      )}

      {/* Loading overlay when saving */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-gray-600">Guardando cambios...</div>
          </div>
        </div>
      )}
    </div>
  );
}
