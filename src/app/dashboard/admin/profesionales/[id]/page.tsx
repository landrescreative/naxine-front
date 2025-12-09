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
  // Modal de video
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
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
  const [existingScheduleTypes, setExistingScheduleTypes] = useState<
    Set<"presencial" | "en_linea" | "a_domicilio">
  >(new Set());
  const timeOptions = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const period = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute} ${period}`;
  });
  // Vista agrupada por tipo (máximo 3 bloques)
  const [scheduleByType, setScheduleByType] = useState<
    Record<
      "presencial" | "en_linea" | "a_domicilio",
      { enabled: boolean; dias: string[]; desde: string; hasta: string }
    >
  >({
    presencial: { enabled: false, dias: [], desde: "", hasta: "" },
    en_linea: { enabled: false, dias: [], desde: "", hasta: "" },
    a_domicilio: { enabled: false, dias: [], desde: "", hasta: "" },
  });
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
    educacion: "",
    certificaciones: "",
    idiomas: "",
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

  // Funciones de video
  const openVideoModal = () => {
    setVideoError(null);
    setIsVideoModalOpen(true);
    setVideoPreviewUrl(null);
    setVideoFile(null);
  };
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setVideoFile(null);
    setVideoError(null);
  };
  const onPickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };
  const confirmUploadVideo = async () => {
    if (!videoFile || !professionalIdProfesional) {
      setVideoError("Selecciona un video para subir.");
      return;
    }
    try {
      setUploadingVideo(true);
      setVideoError(null);
      const adminToken =
        typeof window !== "undefined"
          ? JSON.parse(window.localStorage.getItem("user") || "{}").token
          : null;
      if (!adminToken) {
        setVideoError("Token de administrador no disponible.");
        return;
      }
      const apiBase = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
      ).replace(/\/$/, "");
      const formData = new FormData();
      formData.append("video", videoFile);
      const res = await fetch(
        `${apiBase}/profesionales/admin/${professionalIdProfesional}/video-presentacion`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${adminToken}` } as any,
          body: formData,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVideoError(
          data?.message || data?.error || "Error al subir el video"
        );
        return;
      }
      // No hay campo de video en AdminProfessional; cerrar modal tras éxito
      closeVideoModal();
    } catch (err: any) {
      setVideoError(err?.message || "Error al subir el video");
    } finally {
      setUploadingVideo(false);
    }
  };

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

    // Derivar dirección desde campos del backend
    const derivedAddress =
      backendProfessional.direccion ||
      backendProfessional.domicilio_consultorio ||
      backendProfessional.address ||
      "";

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
      city:
        backendProfessional.ciudad ||
        backendProfessional.city ||
        derivedAddress ||
        "",
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

  // Cargar profesional desde la API
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todos los profesionales y buscar el que coincida con el ID
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

          // Buscar el profesional por id_profesional, id_usuario o id
          const foundProfessional = professionalsData.find(
            (p) =>
              String(p.id_profesional) === userId ||
              String(p.id_usuario) === userId ||
              String(p.id) === userId
          );

          if (foundProfessional) {
            const mappedProfessional =
              mapBackendProfessionalToAdminProfessional(foundProfessional);
            // Intentar obtener foto de perfil desde API admin
            try {
              const adminToken =
                typeof window !== "undefined"
                  ? JSON.parse(window.localStorage.getItem("user") || "{}")
                      .token
                  : null;
              if (adminToken) {
                const apiBase = (
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
                ).replace(/\/$/, "");
                const profId = String(
                  foundProfessional.id_profesional ||
                    foundProfessional.id ||
                    userId
                );
                const photoRes = await fetch(
                  `${apiBase}/profesionales/${profId}/foto-perfil`,
                  {
                    headers: { Authorization: `Bearer ${adminToken}` },
                  }
                );
                if (photoRes.ok) {
                  const photoData = await photoRes.json();
                  if (photoData?.data?.imageUrl) {
                    mappedProfessional.profileImage = photoData.data.imageUrl;
                  }
                }
              }
            } catch (photoErr) {
              console.warn(
                "[AdminProfessionalEditPage] No se pudo cargar la foto de perfil:",
                photoErr
              );
            }
            setProfessional(mappedProfessional);
            // Guardar el id_profesional original para usar en la actualización
            setProfessionalIdProfesional(
              String(
                foundProfessional.id_profesional ||
                  foundProfessional.id ||
                  userId
              )
            );
          } else {
            setError(`Profesional con ID ${userId} no encontrado`);
          }
        } else {
          setError(response.error || "Error al cargar el profesional");
        }
      } catch (err) {
        setError("Ocurrió un error al cargar el profesional");
        console.error("Error al cargar profesional:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfessional();
    }
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
        educacion: Array.isArray(professional.education)
          ? professional.education.join("\n")
          : "",
        certificaciones: Array.isArray(professional.certifications)
          ? professional.certifications.join("\n")
          : "",
        idiomas: Array.isArray(professional.languages)
          ? professional.languages.join(", ")
          : "",
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
        tarifa_por_hora?: number;
        experiencia_años?: number;
        numero_colegiado?: string;
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

  const handleSaveEdit = (field: string) => {
    // Update the form with the new value
    update(field as keyof typeof form, editValue);
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const publicProfileId = professionalIdProfesional || professional?.id;
  const publicProfileUrl = publicProfileId
    ? `/profesionales/${publicProfileId}`
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando profesional...</div>
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 -mx-6 px-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Detalles del Profesional
            </h1>
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
              <span className="text-gray-500">Detalles de profesional</span>
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
            <button
              onClick={async () => {
                if (!professionalIdProfesional) return;
                setScheduleError(null);
                setIsScheduleModalOpen(true);
                setLoadingSchedule(true);
                try {
                  const adminToken =
                    typeof window !== "undefined"
                      ? JSON.parse(window.localStorage.getItem("user") || "{}")
                          .token
                      : null;
                  if (!adminToken)
                    throw new Error("Token de administrador no disponible");
                  const apiBase = (
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3000/api"
                  ).replace(/\/$/, "");
                  // Cargar horarios desde disponibilidad_horarios (ruta protegida)
                  const res = await fetch(
                    `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
                    {
                      headers: { Authorization: `Bearer ${adminToken}` },
                    }
                  );
                  if (!res.ok) {
                    throw new Error(`Error ${res.status} al cargar horarios`);
                  }
                  const data = await res.json();
                  // Buscar robustamente una lista de horarios dentro del JSON (cualquier nivel)
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
                    // Si no se encontró un array directo, intenta patrones comunes
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
                  // Normalización de tipo_atencion (en_linea / presencial / a_domicilio) y campos comunes
                  const normalizeTipo = (
                    val: any
                  ): "presencial" | "en_linea" | "a_domicilio" | null => {
                    if (!val && typeof val !== "string") return null;
                    const raw = String(val || "")
                      .toLowerCase()
                      .trim()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, ""); // quitar acentos
                    // Reemplazos comunes
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
                  const mapped = horarios.map((h: any) => {
                    const tipo = normalizeTipo(h.tipo_atencion);
                    return {
                      id_disponibilidad: h.id_disponibilidad,
                      dia_semana: (h.dia_semana || "").toLowerCase(),
                      hora_inicio:
                        h.hora_inicio?.slice?.(0, 5) || h.hora_inicio,
                      hora_fin: h.hora_fin?.slice?.(0, 5) || h.hora_fin,
                      tipo_atencion: tipo,
                      activo: h.activo ?? true,
                    };
                  });
                  setScheduleItems(mapped);
                  // Construir vista por tipo
                  const initial: Record<
                    "presencial" | "en_linea" | "a_domicilio",
                    {
                      enabled: boolean;
                      dias: string[];
                      desde: string;
                      hasta: string;
                    }
                  > = {
                    presencial: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                    en_linea: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                    a_domicilio: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                  };
                  const presentTipos = new Set<
                    "presencial" | "en_linea" | "a_domicilio"
                  >();
                  ["presencial", "en_linea", "a_domicilio"].forEach((tipo) => {
                    const rows = mapped.filter(
                      (r) => (r.tipo_atencion || "") === tipo
                    );
                    if (rows.length) {
                      presentTipos.add(tipo as any);
                      initial[tipo as keyof typeof initial].enabled = true;
                      // Unificar días
                      const dias = Array.from(
                        new Set(rows.map((r) => r.dia_semana).filter(Boolean))
                      );
                      initial[tipo as keyof typeof initial].dias = dias;
                      // Tomar desde/hasta del primer registro
                      const first = rows[0];
                      // Convertir 24h a 12h para dropdown
                      const to12 = (v: string) => {
                        if (!v) return "";
                        const [hhRaw, mmRaw] = v.split(":");
                        const hh = parseInt(hhRaw, 10);
                        const mm = mmRaw || "00";
                        const per = hh < 12 ? "AM" : "PM";
                        const h12 = hh % 12 === 0 ? 12 : hh % 12;
                        return `${h12}:${mm} ${per}`;
                      };
                      initial[tipo as keyof typeof initial].desde = to12(
                        first.hora_inicio
                      );
                      initial[tipo as keyof typeof initial].hasta = to12(
                        first.hora_fin
                      );
                    }
                  });
                  // Compatibilidad: si hay filas sin tipo_atencion, tratarlas como 'presencial'
                  if (!presentTipos.size && mapped.length) {
                    const rows = mapped;
                    const dias = Array.from(
                      new Set(rows.map((r) => r.dia_semana).filter(Boolean))
                    );
                    const to12 = (v: string) => {
                      if (!v) return "";
                      const [hhRaw, mmRaw] = v.split(":");
                      const hh = parseInt(hhRaw, 10);
                      const mm = mmRaw || "00";
                      const per = hh < 12 ? "AM" : "PM";
                      const h12 = hh % 12 === 0 ? 12 : hh % 12;
                      return `${h12}:${mm} ${per}`;
                    };
                    initial.presencial.enabled = true;
                    initial.presencial.dias = dias;
                    initial.presencial.desde = to12(rows[0].hora_inicio);
                    initial.presencial.hasta = to12(rows[0].hora_fin);
                    presentTipos.add("presencial");
                  }
                  setScheduleByType(initial);
                  setExistingScheduleTypes(presentTipos);
                } catch (e: any) {
                  setScheduleError(e?.message || "Error al cargar horarios");
                  setScheduleItems([]);
                  setScheduleByType({
                    presencial: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                    en_linea: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                    a_domicilio: {
                      enabled: false,
                      dias: [],
                      desde: "",
                      hasta: "",
                    },
                  });
                  setExistingScheduleTypes(new Set());
                } finally {
                  setLoadingSchedule(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
              title="Editar horarios del profesional"
            >
              Editar horarios
            </button>
            <button
              onClick={openVideoModal}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200"
              title="Agregar/Actualizar video de presentación"
            >
              Video de presentación
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Professional Details */}
          <div className="w-1/3 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
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
                      <h2 className="text-2xl font-bold text-black mb-1">
                        {professional.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        @{professional.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                {/* User ID */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Lock className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Número de Usuario
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "numeroUsuario" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("numeroUsuario")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.id}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("numeroUsuario", professional.id)
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Correo Electrónico
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "email" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("email")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.email}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("email", professional.email)
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Biografía</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "biografia" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1 min-h-[60px] resize-none"
                          autoFocus
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleSaveEdit("biografia")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.bio || "Sin biografía"}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("biografia", professional.bio || "")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Especialidad</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "especialidad" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("especialidad")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.specialty || "Sin especialidad"}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "especialidad",
                              professional.specialty || ""
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "rating" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("rating")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.rating.toFixed(1)}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "rating",
                              professional.rating.toString()
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Phone className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Número de Teléfono
                    </span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "telefono" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="tel"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit("telefono")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.phone || "Sin teléfono"}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "telefono",
                              professional.phone || ""
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Dirección</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "direccion" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1 min-h-[60px] resize-none"
                          autoFocus
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleSaveEdit("direccion")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {(() => {
                            const dir =
                              (professional as any)?.direccion ||
                              (professional as any)?.address ||
                              "";
                            const consultorio =
                              (professional as any)?.domicilio_consultorio ||
                              (professional as any)?.consultorio ||
                              "";
                            if (dir && dir.trim().length > 0) return dir;
                            if (consultorio && consultorio.trim().length > 0)
                              return consultorio;
                            return "Sin dirección";
                          })()}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField(
                              "direccion",
                              (() => {
                                const dir =
                                  (professional as any)?.direccion ||
                                  (professional as any)?.address ||
                                  "";
                                const consultorio =
                                  (professional as any)
                                    ?.domicilio_consultorio ||
                                  (professional as any)?.consultorio ||
                                  "";
                                if (dir && dir.trim().length > 0) return dir;
                                if (
                                  consultorio &&
                                  consultorio.trim().length > 0
                                )
                                  return consultorio;
                                return "";
                              })()
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Ciudad</span>
                  </div>
                  <div className="ml-9 flex items-center justify-between">
                    {editingField === "ciudad" ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm font-medium border border-gray-300 rounded px-2 py-1 flex-1"
                          autoFocus
                          placeholder="Ej. Madrid"
                        />
                        <button
                          onClick={() => handleSaveEdit("ciudad")}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">
                          {professional.city || "Sin ciudad"}
                        </span>
                        <Edit
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            handleEditField("ciudad", professional.city || "")
                          }
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Removed Certifications and Packages sections */}
              </div>
            </div>
          </div>

          {/* Right Column - Summary and Transactions */}
          <div className="w-2/3 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const cents =
                        balance?.available_amount ??
                        balance?.available ??
                        balance?.total ??
                        (typeof balance === "number" ? balance : null);
                      if (cents != null) {
                        const amount =
                          typeof cents === "number" ? cents : Number(cents);
                        const normalized = amount / 100;
                        return `$${normalized.toFixed(2)}`;
                      }
                      return `$${professional.incomeUsd.toFixed(2)}`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Sesiones Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {professional.totalSessions.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6 text-primary"
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
                  <p className="text-sm text-gray-600 mb-1">Tipo de Sesiones</p>
                  <p className="text-sm font-medium text-gray-900">
                    {["En línea", "Presencial", "A domicilio"].join(" + ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
                          ? `$${(tx.amount / 100).toFixed(2)}`
                          : typeof tx.monto === "number"
                          ? `$${Number(tx.monto).toFixed(2)}`
                          : typeof tx.total === "number"
                          ? `$${Number(tx.total).toFixed(2)}`
                          : tx.total || tx.amount || tx.monto || "$0.00";
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
                <>
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                    {(["presencial", "en_linea", "a_domicilio"] as const).map(
                      (tipo) => (
                        <div
                          key={tipo}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {tipo === "presencial"
                                  ? "Presencial"
                                  : tipo === "en_linea"
                                  ? "En línea"
                                  : "A domicilio"}
                              </span>
                              {scheduleByType[tipo].enabled ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Configurado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  Sin configurar
                                </span>
                              )}
                            </div>
                            {/* Para tipos ya existentes, no mostrar acciones de agregar/quitar para evitar confusión */}
                            {existingScheduleTypes.has(
                              tipo
                            ) ? null : scheduleByType[tipo].enabled ? (
                              <button
                                className="px-3 py-1 text-xs rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                onClick={() =>
                                  setScheduleByType((prev) => ({
                                    ...prev,
                                    [tipo]: {
                                      enabled: false,
                                      dias: [],
                                      desde: "",
                                      hasta: "",
                                    },
                                  }))
                                }
                              >
                                Quitar horario
                              </button>
                            ) : (
                              <button
                                className="px-3 py-1 text-xs rounded-lg border bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                onClick={() =>
                                  setScheduleByType((prev) => ({
                                    ...prev,
                                    [tipo]: {
                                      enabled: true,
                                      dias: [],
                                      desde: "",
                                      hasta: "",
                                    },
                                  }))
                                }
                              >
                                Agregar horario
                              </button>
                            )}
                          </div>
                          {scheduleByType[tipo].enabled && (
                            <div className="p-4 space-y-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Días disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {allDays.map((d) => {
                                    const sel =
                                      scheduleByType[tipo].dias.includes(d);
                                    return (
                                      <button
                                        key={`${tipo}-${d}`}
                                        className={`px-2.5 py-1 rounded-full text-xs border ${
                                          sel
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-white border-gray-300 text-gray-700"
                                        }`}
                                        onClick={() =>
                                          setScheduleByType((prev) => {
                                            const current = prev[tipo];
                                            const dias = sel
                                              ? current.dias.filter(
                                                  (x) => x !== d
                                                )
                                              : [...current.dias, d];
                                            return {
                                              ...prev,
                                              [tipo]: { ...current, dias },
                                            };
                                          })
                                        }
                                      >
                                        {displayDay(d)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Desde
                                  </label>
                                  <select
                                    value={scheduleByType[tipo].desde || ""}
                                    onChange={(e) =>
                                      setScheduleByType((prev) => ({
                                        ...prev,
                                        [tipo]: {
                                          ...prev[tipo],
                                          desde: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="">Selecciona</option>
                                    {timeOptions.map((t) => (
                                      <option
                                        key={`${tipo}-desde-${t}`}
                                        value={t}
                                      >
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Hasta
                                  </label>
                                  <select
                                    value={scheduleByType[tipo].hasta || ""}
                                    onChange={(e) =>
                                      setScheduleByType((prev) => ({
                                        ...prev,
                                        [tipo]: {
                                          ...prev[tipo],
                                          hasta: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="">Selecciona</option>
                                    {timeOptions.map((t) => (
                                      <option
                                        key={`${tipo}-hasta-${t}`}
                                        value={t}
                                      >
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </>
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
                    const to24 = (v: string) => {
                      const m = v.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                      if (!m) return v.length === 5 ? `${v}:00` : v;
                      let hh = parseInt(m[1], 10);
                      const mm = m[2];
                      const per = m[3].toUpperCase();
                      if (per === "PM" && hh !== 12) hh += 12;
                      if (per === "AM" && hh === 12) hh = 0;
                      return `${hh.toString().padStart(2, "0")}:${mm}:00`;
                    };
                    // Construir payload a partir de bloques por tipo (una fila por día seleccionado)
                    const payload: Array<any> = [];
                    (
                      ["presencial", "en_linea", "a_domicilio"] as const
                    ).forEach((tipo) => {
                      const section = scheduleByType[tipo];
                      if (!section.enabled) return;
                      if (
                        !section.desde ||
                        !section.hasta ||
                        !section.dias.length
                      )
                        return;
                      for (const dia of section.dias) {
                        payload.push({
                          dia_semana: dia,
                          hora_inicio: to24(section.desde),
                          hora_fin: to24(section.hasta),
                          tipo_atencion: tipo,
                          activo: 1,
                        });
                      }
                    });
                    if (payload.length === 0) {
                      throw new Error(
                        "Debes configurar al menos un horario antes de guardar."
                      );
                    }
                    // 1) Obtener horarios actuales para borrarlos
                    const currentRes = await fetch(
                      `${apiBase}/disponibilidad-horarios/profesional/${professionalIdProfesional}`,
                      { headers: { Authorization: `Bearer ${adminToken}` } }
                    );
                    const currentData = await currentRes
                      .json()
                      .catch(() => ({}));
                    const currentList: any[] =
                      (Array.isArray(currentData) && currentData) ||
                      currentData?.data?.disponibilidad ||
                      currentData?.disponibilidad ||
                      currentData?.data ||
                      [];
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
                    // 2) Crear nuevos registros
                    for (const row of payload) {
                      // Calcular turno
                      const hStart = row.hora_inicio || "09:00:00";
                      const hh = parseInt(String(hStart).split(":")[0], 10);
                      const turno = isNaN(hh)
                        ? null
                        : hh < 14
                        ? "matutino"
                        : "vespertino";
                      const createBody = {
                        id_profesional: Number(professionalIdProfesional),
                        dia_semana: row.dia_semana,
                        hora_inicio: row.hora_inicio,
                        hora_fin: row.hora_fin,
                        tipo_atencion: row.tipo_atencion || null,
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

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Video de presentación
              </h2>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {videoPreviewUrl && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-w-xl rounded-lg border border-purple-200"
                  />
                  {videoFile && (
                    <p className="text-xs text-gray-600 max-w-full truncate">
                      {videoFile.name} ({Math.round(videoFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="admin-video-upload"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
                >
                  Seleccionar video
                  <input
                    id="admin-video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={onPickVideo}
                  />
                </label>
                {videoPreviewUrl && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                      setVideoFile(null);
                    }}
                  >
                    Quitar selección
                  </button>
                )}
              </div>
              {videoError && (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                  {videoError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeVideoModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploadingVideo}
              >
                Cancelar
              </button>
              <button
                onClick={confirmUploadVideo}
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50"
                disabled={uploadingVideo || !videoFile}
              >
                {uploadingVideo ? "Subiendo..." : "Guardar"}
              </button>
            </div>
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
