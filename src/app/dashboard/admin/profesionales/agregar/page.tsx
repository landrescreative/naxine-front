"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, X, HelpCircle, Check } from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";
import { SpecialtiesService } from "@/services/api/specialties";
import { validateEmail, validatePassword } from "@/services/utils/api-helpers";

// Lazy load del modal pesado
const SaveChangesModal = lazyLoad(() => import("@/components/dashboard/SaveChangesModal"));

const specialtiesService = new SpecialtiesService();

export default function AgregarProfesionalPage() {
  const router = useRouter();

  // Form state - igual estructura que el formulario público
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    correoElectronico: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    numeroColegiado: "",
    nifCif: "",
    titulacion: "",
    correoProfesionalPublico: "",
    especialidad: "",
    especialidadSeleccionada: "",
    id_especialidad: undefined as number | undefined,
    descripcion: "",
    videoPresentacion: "",
    modalidades: [] as string[],
    direccionConsulta: "",
    zonasDomicilio: "",
    codigosPostalesDomicilio: "",
    serviciosOfrecidos: "",
    accesibleMovilidad: "",
    horarios: "",
    tarifas: "",
    observaciones: "",
    experiencia_años: "",
    tarifa_por_hora: "",
    direccion: "",
    ciudad: "",
    // Horarios por modalidad
    horariosEnLinea: null as {
      dias: Array<{
        dia: string;
        rangos: Array<{
          desde: string;
          hasta: string;
        }>;
      }>;
    } | null,
    horariosPresencial: null as {
      dias: Array<{
        dia: string;
        rangos: Array<{
          desde: string;
          hasta: string;
        }>;
      }>;
    } | null,
    horariosADomicilio: null as {
      dias: Array<{
        dia: string;
        rangos: Array<{
          desde: string;
          hasta: string;
        }>;
      }>;
    } | null,
    precios: {
      primeraSesion: {
        precio: "",
        nombre: "",
        duracion: "",
      },
      seguimiento: {
        precio: "",
        nombre: "",
        duracion: "",
      },
      pack3: {
        precio: "",
        nombre: "Pack 3 sesiones",
        duracion: "",
      },
    },
    preciosDomicilio: {
      primeraSesion: {
        precio: "",
        nombre: "",
        duracion: "",
      },
      seguimiento: {
        precio: "",
        nombre: "",
        duracion: "",
      },
      pack3: {
        precio: "",
        nombre: "Pack 3 sesiones",
        duracion: "",
      },
    },
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Estados para especialidades
  const [especialidades, setEspecialidades] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

  // Opciones de duración para precios
  const durationOptions = useMemo(() => {
    const options: string[] = [];
    for (let minutes = 30; minutes <= 90; minutes += 10) {
      options.push(`${minutes} min`);
    }
    return options;
  }, []);

  // API configuration
  const apiBaseUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return base.replace(/\/$/, "");
  }, []);

  // Get admin token
  const getAdminToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = window.localStorage.getItem("user");
      if (!storedUser) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AgregarProfesionalPage] No hay usuario almacenado");
        }
        return null;
      }

      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "").toLowerCase();
      if (role === "admin" || role === "administracion") {
        return parsedUser?.token || null;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[AgregarProfesionalPage] El usuario no posee rol de administrador:",
          role
        );
      }
    } catch (tokenError) {
      console.error(
        "[AgregarProfesionalPage] Error al leer el token de administrador:",
        tokenError
      );
    }

    return null;
  }, []);

  // Cargar especialidades
  const fetchEspecialidades = useCallback(async () => {
    setLoadingEspecialidades(true);
    try {
      const response = await specialtiesService.getPublicSpecialties();

      if (response.success && response.data) {
        const mappedSpecialties = response.data.map((spec: any) => ({
          id: spec.id_especialidad || spec.id,
          nombre: spec.nombre || spec.name,
        }));
        setEspecialidades(mappedSpecialties);
      } else {
        console.error("Error al cargar especialidades:", response.error);
      }
    } catch (err: any) {
      console.error("Error al cargar especialidades:", err);
    } finally {
      setLoadingEspecialidades(false);
    }
  }, []);

  useEffect(() => {
    fetchEspecialidades();
  }, [fetchEspecialidades]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      const checkboxName = name;
      if (checkboxName === "modalidad") {
        const modalidadValue = (e.target as HTMLInputElement).value;
        setFormData((prev) => ({
          ...prev,
          modalidades: checked
            ? [...prev.modalidades, modalidadValue]
            : prev.modalidades.filter((m) => m !== modalidadValue),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Función para actualizar precios
  const updatePrecios = (
    tipo: keyof typeof formData.precios,
    campo: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      precios: {
        ...prev.precios,
        [tipo]: {
          ...prev.precios[tipo],
          [campo]: value,
        },
      },
    }));
  };

  // Función para actualizar precios de domicilio
  const updatePreciosDomicilio = (
    tipo: keyof typeof formData.preciosDomicilio,
    campo: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      preciosDomicilio: {
        ...prev.preciosDomicilio,
        [tipo]: {
          ...prev.preciosDomicilio[tipo],
          [campo]: value,
        },
      },
    }));
  };

  // Función para manejar días de horarios por modalidad
  const toggleDiaHorario = (
    modalidad: "online" | "presencial" | "domicilio",
    dia: string
  ) => {
    const horarioKey =
      modalidad === "online"
        ? "horariosEnLinea"
        : modalidad === "presencial"
        ? "horariosPresencial"
        : "horariosADomicilio";

    const horariosActuales = formData[horarioKey] || {
      dias: [],
    };

    const diaIndex = horariosActuales.dias.findIndex((d) => d.dia === dia);
    const isSelected = diaIndex !== -1;

    let newDias: Array<{
      dia: string;
      rangos: Array<{ desde: string; hasta: string }>;
    }>;
    if (isSelected) {
      // Remover el día
      newDias = horariosActuales.dias.filter((d) => d.dia !== dia);
    } else {
      // Agregar el día con un rango inicial vacío
      newDias = [
        ...horariosActuales.dias,
        {
          dia: dia,
          rangos: [{ desde: "", hasta: "" }],
        },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      [horarioKey]: {
        dias: newDias,
      },
    }));
  };

  // Función para agregar un nuevo rango de horario a un día
  const agregarRangoHorario = (
    modalidad: "online" | "presencial" | "domicilio",
    dia: string
  ) => {
    const horarioKey =
      modalidad === "online"
        ? "horariosEnLinea"
        : modalidad === "presencial"
        ? "horariosPresencial"
        : "horariosADomicilio";

    const horariosActuales = formData[horarioKey] || { dias: [] };

    const newDias = horariosActuales.dias.map((d) =>
      d.dia === dia
        ? {
            ...d,
            rangos: [...d.rangos, { desde: "", hasta: "" }],
          }
        : d
    );

    setFormData((prev) => ({
      ...prev,
      [horarioKey]: {
        dias: newDias,
      },
    }));
  };

  // Función para eliminar un rango de horario de un día
  const eliminarRangoHorario = (
    modalidad: "online" | "presencial" | "domicilio",
    dia: string,
    indiceRango: number
  ) => {
    const horarioKey =
      modalidad === "online"
        ? "horariosEnLinea"
        : modalidad === "presencial"
        ? "horariosPresencial"
        : "horariosADomicilio";

    const horariosActuales = formData[horarioKey] || { dias: [] };

    const newDias = horariosActuales.dias.map((d) =>
      d.dia === dia
        ? {
            ...d,
            rangos: d.rangos.filter((_, idx) => idx !== indiceRango),
          }
        : d
    );

    setFormData((prev) => ({
      ...prev,
      [horarioKey]: {
        dias: newDias,
      },
    }));
  };

  // Función para actualizar horas de horarios por modalidad, día y rango específico
  const updateHorarioTime = (
    modalidad: "online" | "presencial" | "domicilio",
    dia: string,
    indiceRango: number,
    campo: "desde" | "hasta",
    time24: string
  ) => {
    const horarioKey =
      modalidad === "online"
        ? "horariosEnLinea"
        : modalidad === "presencial"
        ? "horariosPresencial"
        : "horariosADomicilio";

    const horariosActuales = formData[horarioKey] || {
      dias: [],
    };

    // Convertir formato 24h a formato 12h AM/PM
    let time12 = "";
    if (time24) {
      const [hhStr, mm] = time24.split(":");
      let hh = parseInt(hhStr, 10);
      const period = hh >= 12 ? "PM" : "AM";
      if (hh === 0) hh = 12;
      else if (hh > 12) hh -= 12;
      time12 = `${hh}:${mm} ${period}`;
    }

    // Actualizar el rango específico del día
    const newDias = horariosActuales.dias.map((d) =>
      d.dia === dia
        ? {
            ...d,
            rangos: d.rangos.map((rango, idx) =>
              idx === indiceRango ? { ...rango, [campo]: time12 } : rango
            ),
          }
        : d
    );

    setFormData((prev) => ({
      ...prev,
      [horarioKey]: {
        dias: newDias,
      },
    }));
  };

  // Función para obtener tiempo en formato 24h desde formato 12h
  const getTime24From12 = (time12: string): string => {
    if (!time12) return "";
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return time12;
    let hh = parseInt(match[1], 10);
    const mm = match[2];
    const per = match[3].toUpperCase();
    if (per === "PM" && hh !== 12) hh += 12;
    if (per === "AM" && hh === 12) hh = 0;
    return `${hh.toString().padStart(2, "0")}:${mm}`;
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          foto: "Por favor, selecciona un archivo de imagen válido",
        }));
        return;
      }

      // Validar tamaño (máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          foto: "La imagen no debe superar los 5MB",
        }));
        return;
      }

      setFoto(file);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.foto;
        return newErrors;
      });

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!url) return true; // Opcional
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  // Validación básica antes de abrir modal
  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo es requerido";
    }
    if (!formData.correoElectronico.trim()) {
      newErrors.correoElectronico = "El correo es requerido";
    } else if (!validateEmail(formData.correoElectronico)) {
      newErrors.correoElectronico = "El formato del correo no es válido";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(", ");
      }
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }
    if (!formData.numeroColegiado.trim()) {
      newErrors.numeroColegiado = "El número de colegiado/a es requerido";
    }
    if (!formData.nifCif.trim()) {
      newErrors.nifCif = "El NIF/CIF es requerido";
    }
    if (!formData.titulacion.trim()) {
      newErrors.titulacion = "La titulación profesional es requerida";
    }
    if (!formData.correoProfesionalPublico.trim()) {
      newErrors.correoProfesionalPublico =
        "El correo electrónico profesional es requerido";
    } else if (!validateEmail(formData.correoProfesionalPublico)) {
      newErrors.correoProfesionalPublico =
        "El formato del correo electrónico profesional no es válido";
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion =
        "La descripción general del perfil profesional es requerida";
    }
    if (!formData.serviciosOfrecidos.trim()) {
      newErrors.serviciosOfrecidos = "Los servicios ofrecidos son requeridos";
    }
    if (!foto) {
      newErrors.foto = "La foto del perfil profesional es requerida";
    }
    if (formData.modalidades.length === 0) {
      newErrors.modalidades =
        "Debes seleccionar al menos una modalidad de atención";
    }
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es requerida";
    }

    // Validar horarios según modalidades
    if (formData.modalidades.includes("online")) {
      if (
        !formData.horariosEnLinea ||
        !formData.horariosEnLinea.dias ||
        formData.horariosEnLinea.dias.length === 0
      ) {
        newErrors.horariosEnLinea =
          "Debes seleccionar al menos un día para atención en línea";
      } else {
        const diasIncompletos = formData.horariosEnLinea.dias.filter(
          (d) =>
            !d.rangos ||
            d.rangos.length === 0 ||
            d.rangos.some((r) => !r.desde || !r.hasta)
        );
        if (diasIncompletos.length > 0) {
          newErrors.horariosEnLinea =
            "Debes especificar las horas de inicio y fin para todos los rangos horarios en atención en línea";
        }
      }
    }
    if (formData.modalidades.includes("presencial")) {
      if (
        !formData.horariosPresencial ||
        !formData.horariosPresencial.dias ||
        formData.horariosPresencial.dias.length === 0
      ) {
        newErrors.horariosPresencial =
          "Debes seleccionar al menos un día para atención presencial";
      } else {
        const diasIncompletos = formData.horariosPresencial.dias.filter(
          (d) =>
            !d.rangos ||
            d.rangos.length === 0 ||
            d.rangos.some((r) => !r.desde || !r.hasta)
        );
        if (diasIncompletos.length > 0) {
          newErrors.horariosPresencial =
            "Debes especificar las horas de inicio y fin para todos los rangos horarios en atención presencial";
        }
      }
      if (!formData.direccionConsulta.trim()) {
        newErrors.direccionConsulta =
          "La dirección de consulta es requerida si ofreces atención presencial";
      }
    }
    if (formData.modalidades.includes("domicilio")) {
      if (
        !formData.horariosADomicilio ||
        !formData.horariosADomicilio.dias ||
        formData.horariosADomicilio.dias.length === 0
      ) {
        newErrors.horariosADomicilio =
          "Debes seleccionar al menos un día para atención a domicilio";
      } else {
        const diasIncompletos = formData.horariosADomicilio.dias.filter(
          (d) =>
            !d.rangos ||
            d.rangos.length === 0 ||
            d.rangos.some((r) => !r.desde || !r.hasta)
        );
        if (diasIncompletos.length > 0) {
          newErrors.horariosADomicilio =
            "Debes especificar las horas de inicio y fin para todos los rangos horarios en atención a domicilio";
        }
      }
      if (!formData.codigosPostalesDomicilio.trim()) {
        newErrors.codigosPostalesDomicilio =
          "Los códigos postales son requeridos si ofreces atención a domicilio";
      }
    }

    // Validar precios
    const tienePrecios =
      (formData.precios.primeraSesion.precio &&
        formData.precios.primeraSesion.precio.trim() !== "") ||
      (formData.precios.seguimiento.precio &&
        formData.precios.seguimiento.precio.trim() !== "") ||
      (formData.precios.pack3.precio &&
        formData.precios.pack3.precio.trim() !== "");

    if (!tienePrecios) {
      newErrors.precios =
        "Debes configurar al menos un precio (Primera Sesión, Seguimiento o Pack x3)";
    }

    if (formData.modalidades.includes("domicilio")) {
      const tienePreciosDomicilio =
        (formData.preciosDomicilio.primeraSesion.precio &&
          formData.preciosDomicilio.primeraSesion.precio.trim() !== "") ||
        (formData.preciosDomicilio.seguimiento.precio &&
          formData.preciosDomicilio.seguimiento.precio.trim() !== "") ||
        (formData.preciosDomicilio.pack3.precio &&
          formData.preciosDomicilio.pack3.precio.trim() !== "");

      if (!tienePreciosDomicilio) {
        newErrors.preciosDomicilio =
          "Debes configurar al menos un precio para atención a domicilio";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll al primer error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"], #${firstErrorField}`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    setIsSaveModalOpen(true);
  };

  // Crear profesional usando FormData como el formulario público
  const confirmSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        throw new Error(
          "No se encontró el token de administrador. Por favor, inicia sesión nuevamente."
        );
      }

      // Construir objeto JSON con los datos (el endpoint del admin espera JSON)
      // Parsear horarios
      let horariosEnLineaParsed = null;
      if (formData.horariosEnLinea) {
        horariosEnLineaParsed = {
          dias: formData.horariosEnLinea.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
      }

      let horariosPresencialParsed = null;
      if (formData.horariosPresencial) {
        horariosPresencialParsed = {
          dias: formData.horariosPresencial.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
      }

      let horariosADomicilioParsed = null;
      if (formData.horariosADomicilio) {
        horariosADomicilioParsed = {
          dias: formData.horariosADomicilio.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
      }

      // Construir request body
      const requestBody: any = {
        nombreCompleto: formData.nombreCompleto.trim(),
        correoElectronico: formData.correoElectronico.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono.trim(),
        numeroColegiado: formData.numeroColegiado.trim(),
        nifCif: formData.nifCif.trim(),
        titulacion: formData.titulacion.trim(),
        correoProfesionalPublico: formData.correoProfesionalPublico.trim().toLowerCase(),
        ciudad: formData.ciudad.trim(),
        biografia: formData.descripcion.trim(),
        serviciosOfrecidos: formData.serviciosOfrecidos.trim(),
        modalidades: formData.modalidades,
        horariosEnLinea: horariosEnLineaParsed,
        horariosPresencial: horariosPresencialParsed,
        horariosADomicilio: horariosADomicilioParsed,
        precios: formData.precios,
        preciosDomicilio: formData.modalidades.includes("domicilio")
          ? formData.preciosDomicilio
          : undefined,
      };

      if (formData.especialidad.trim()) {
        requestBody.especialidad = formData.especialidad.trim();
      }
      if (formData.especialidadSeleccionada.trim()) {
        requestBody.especialidadSeleccionada = formData.especialidadSeleccionada.trim();
      }
      if (formData.id_especialidad) {
        requestBody.id_especialidad = formData.id_especialidad;
      }
      if (formData.direccionConsulta.trim()) {
        requestBody.domicilio_consultorio = formData.direccionConsulta.trim();
      }
      if (formData.codigosPostalesDomicilio.trim()) {
        requestBody.codigosPostalesDomicilio = formData.codigosPostalesDomicilio.trim();
      }
      if (formData.accesibleMovilidad) {
        requestBody.accesibleMovilidad = formData.accesibleMovilidad;
      }
      if (formData.experiencia_años) {
        requestBody.experiencia_años = formData.experiencia_años;
      }
      if (formData.observaciones.trim()) {
        requestBody.observaciones = formData.observaciones.trim();
      }
      if (formData.tarifa_por_hora) {
        requestBody.tarifa_por_hora = formData.tarifa_por_hora;
      }
      if (formData.videoPresentacion.trim()) {
        requestBody.video_presentacion = formData.videoPresentacion.trim();
      }

      // Enviar al endpoint del admin (espera JSON)
      const response = await fetch(
        `${apiBaseUrl}/profesionales/admin/crear`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors
            .map((err: any) => {
              if (typeof err === "string") return err;
              return err.message || err.msg || JSON.stringify(err);
            })
            .join(", ");
          throw new Error(
            errorMessages || data.message || "Error al crear profesional"
          );
        }
        throw new Error(
          data.message || data.error || "Error al crear profesional"
        );
      }

      // Obtener el ID del profesional creado
      const newProfessionalId =
        data?.data?.profesional?.id_profesional ??
        data?.profesional?.id_profesional ??
        data?.id_profesional ??
        null;

      // Si hay una foto seleccionada y tenemos el ID, subirla a S3 vía API
      if (foto && newProfessionalId) {
        const uploadUrl = `${apiBaseUrl}/profesionales/admin/${newProfessionalId}/foto-perfil`;
        const formDataFile = new FormData();
        formDataFile.append("foto", foto);
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            // No añadir Content-Type para permitir boundary de FormData
          } as any,
          body: formDataFile,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.warn(
            "[AgregarProfesionalPage] La creación fue exitosa, pero falló la subida de la foto:",
            errData
          );
          // No interrumpir el flujo por fallo de imagen
        }
      }

      // Success - close modal and redirect
      setIsSaveModalOpen(false);
      router.push("/dashboard/admin/profesionales");
    } catch (err: any) {
      console.error(
        "[AgregarProfesionalPage] Error al crear profesional:",
        err
      );
      setErrors({
        submit:
          err?.message ||
          "Error al crear profesional. Por favor, intenta nuevamente.",
      });
      setIsSaveModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Añadir profesional nuevo
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Administración de usuarios</span>
            <ChevronRight className="h-4 w-4" />
            <span>Profesionales</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">
              Agregar profesional nuevo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-primary hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Profesional
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{errors.submit}</p>
            </div>
            <button
              onClick={() => setErrors((prev) => ({ ...prev, submit: undefined }))}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Información General */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información General
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.nombreCompleto
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {errors.nombreCompleto && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.nombreCompleto}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.correoElectronico
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {errors.correoElectronico && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.correoElectronico}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Las contraseñas coinciden
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>
                )}
                {errors.confirmPassword && !formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.telefono ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.telefono && (
                  <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de colegiado/a <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numeroColegiado"
                  value={formData.numeroColegiado}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.numeroColegiado
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {errors.numeroColegiado && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.numeroColegiado}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIF/CIF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nifCif"
                  value={formData.nifCif}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.nifCif ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.nifCif && (
                  <p className="mt-1 text-xs text-red-600">{errors.nifCif}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titulación profesional <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titulacion"
                  value={formData.titulacion}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.titulacion ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.titulacion && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.titulacion}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico profesional{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correoProfesionalPublico"
                value={formData.correoProfesionalPublico}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.correoProfesionalPublico
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              {errors.correoProfesionalPublico && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.correoProfesionalPublico}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad o área profesional{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="id_especialidad"
                value={formData.id_especialidad || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) {
                    setFormData((prev) => ({
                      ...prev,
                      id_especialidad: undefined,
                      especialidadSeleccionada: "",
                      especialidad: "",
                    }));
                    return;
                  }
                  const selectedEspecialidad = especialidades.find(
                    (esp) => String(esp.id) === selectedId
                  );
                  if (selectedEspecialidad) {
                    setFormData((prev) => ({
                      ...prev,
                      id_especialidad: selectedEspecialidad.id,
                      especialidadSeleccionada: selectedEspecialidad.nombre,
                      especialidad: selectedEspecialidad.nombre,
                    }));
                  }
                }}
                disabled={loadingEspecialidades}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white ${
                  errors.especialidad ? "border-red-300" : "border-gray-300"
                } ${loadingEspecialidades ? "opacity-50" : ""}`}
              >
                {loadingEspecialidades ? (
                  <option value="">Cargando especialidades...</option>
                ) : especialidades.length === 0 ? (
                  <option value="">No hay especialidades disponibles</option>
                ) : (
                  <>
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map((especialidad) => (
                      <option key={especialidad.id} value={especialidad.id}>
                        {especialidad.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.especialidad && (
                <p className="mt-1 text-xs text-red-600">{errors.especialidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción general del perfil profesional{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={6}
                maxLength={1500}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                  errors.descripcion ? "border-red-300" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {1500 - formData.descripcion.length} caracteres restantes
              </p>
              {errors.descripcion && (
                <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicios ofrecidos <span className="text-red-500">*</span>
              </label>
              <textarea
                name="serviciosOfrecidos"
                value={formData.serviciosOfrecidos}
                onChange={handleInputChange}
                rows={4}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                  errors.serviciosOfrecidos
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa cada servicio con comas o en líneas diferentes
              </p>
              {errors.serviciosOfrecidos && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.serviciosOfrecidos}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Foto de perfil */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Foto de perfil profesional <span className="text-red-500">*</span>
          </h2>
          {fotoPreview ? (
            <div className="relative">
              <div className="w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeFoto}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Eliminar foto
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.foto ? "border-red-300" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
              </p>
            </div>
          )}
          {errors.foto && (
            <p className="mt-1 text-sm text-red-600">{errors.foto}</p>
          )}
        </div>

        {/* Video de presentación */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Video de presentación
          </h2>
          <input
            type="url"
            name="videoPresentacion"
            value={formData.videoPresentacion}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
              errors.videoPresentacion
                ? "border-red-300"
                : "border-gray-300"
            }`}
            placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
          />
          {errors.videoPresentacion && (
            <p className="mt-1 text-xs text-red-600">
              {errors.videoPresentacion}
            </p>
          )}
        </div>

        {/* Modalidades de atención */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Modalidades de atención que ofreces{" "}
            <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-2">
            {["online", "presencial", "domicilio"].map((modalidad) => (
              <label
                key={modalidad}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="modalidad"
                  value={modalidad}
                  checked={formData.modalidades.includes(modalidad)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {modalidad === "domicilio" ? "A domicilio" : modalidad}
                </span>
              </label>
            ))}
          </div>
          {errors.modalidades && (
            <p className="mt-1 text-sm text-red-600">{errors.modalidades}</p>
          )}
        </div>

        {/* Dirección de consulta */}
        {formData.modalidades.includes("presencial") && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dirección de consulta <span className="text-red-500">*</span>
            </h2>
            <textarea
              name="direccionConsulta"
              value={formData.direccionConsulta}
              onChange={handleInputChange}
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                errors.direccionConsulta
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Dirección completa de la consulta"
            />
            {errors.direccionConsulta && (
              <p className="mt-1 text-xs text-red-600">
                {errors.direccionConsulta}
              </p>
            )}
          </div>
        )}

        {/* Ciudad */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ciudad <span className="text-red-500">*</span>
          </h2>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
              errors.ciudad ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Ej: Madrid, Barcelona, Valencia..."
          />
          {errors.ciudad && (
            <p className="mt-1 text-xs text-red-600">{errors.ciudad}</p>
          )}
        </div>

        {/* Códigos postales domicilio */}
        {formData.modalidades.includes("domicilio") && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Códigos postales donde ofreces atención a domicilio{" "}
              <span className="text-red-500">*</span>
            </h2>
            <textarea
              name="codigosPostalesDomicilio"
              value={formData.codigosPostalesDomicilio}
              onChange={handleInputChange}
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                errors.codigosPostalesDomicilio
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="Ej: 28001, 28002, 28003, 28004 (separados por comas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Indica los códigos postales separados por comas. Ej: 28001, 28002,
              28003
            </p>
            {errors.codigosPostalesDomicilio && (
              <p className="mt-1 text-xs text-red-600">
                {errors.codigosPostalesDomicilio}
              </p>
            )}
          </div>
        )}

        {/* Accesible movilidad reducida */}
        {formData.modalidades.includes("presencial") && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Tu consulta es accesible para personas con movilidad reducida?
            </h2>
            <div className="space-y-2">
              {["Sí", "No"].map((opcion) => (
                <label
                  key={opcion}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="accesibleMovilidad"
                    value={opcion}
                    checked={formData.accesibleMovilidad === opcion}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{opcion}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Horarios por Modalidad - En Línea */}
        {formData.modalidades.includes("online") && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horario En Línea <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona los días disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((dia) => {
                    const diasEnLinea = formData.horariosEnLinea?.dias || [];
                    const isSelected = diasEnLinea.some((d) => d.dia === dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                        }`}
                        onClick={() => toggleDiaHorario("online", dia)}
                      >
                        <span>{dia}</span>
                        {isSelected && <X className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {errors.horariosEnLinea && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.horariosEnLinea}
                  </p>
                )}
              </div>

              {formData.horariosEnLinea?.dias &&
                formData.horariosEnLinea.dias.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Configura las horas para cada día:
                    </h4>
                    {formData.horariosEnLinea.dias.map((diaHorario) => (
                      <div
                        key={diaHorario.dia}
                        className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {diaHorario.dia}
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                agregarRangoHorario("online", diaHorario.dia)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Agregar horario
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleDiaHorario("online", diaHorario.dia)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Quitar día
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {diaHorario.rangos.map((rango, idxRango) => (
                            <div
                              key={idxRango}
                              className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de inicio
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.desde || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "online",
                                        diaHorario.dia,
                                        idxRango,
                                        "desde",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de fin
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.hasta || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "online",
                                        diaHorario.dia,
                                        idxRango,
                                        "hasta",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                              </div>
                              {diaHorario.rangos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarRangoHorario(
                                      "online",
                                      diaHorario.dia,
                                      idxRango
                                    )
                                  }
                                  className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar este horario"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Horarios Presencial */}
        {formData.modalidades.includes("presencial") && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horario Presencial <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona los días disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((dia) => {
                    const diasPresencial = formData.horariosPresencial?.dias || [];
                    const isSelected = diasPresencial.some((d) => d.dia === dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                        }`}
                        onClick={() => toggleDiaHorario("presencial", dia)}
                      >
                        <span>{dia}</span>
                        {isSelected && <X className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {errors.horariosPresencial && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.horariosPresencial}
                  </p>
                )}
              </div>

              {formData.horariosPresencial?.dias &&
                formData.horariosPresencial.dias.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Configura las horas para cada día:
                    </h4>
                    {formData.horariosPresencial.dias.map((diaHorario) => (
                      <div
                        key={diaHorario.dia}
                        className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {diaHorario.dia}
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                agregarRangoHorario("presencial", diaHorario.dia)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Agregar horario
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleDiaHorario("presencial", diaHorario.dia)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Quitar día
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {diaHorario.rangos.map((rango, idxRango) => (
                            <div
                              key={idxRango}
                              className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de inicio
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.desde || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "presencial",
                                        diaHorario.dia,
                                        idxRango,
                                        "desde",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de fin
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.hasta || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "presencial",
                                        diaHorario.dia,
                                        idxRango,
                                        "hasta",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                              </div>
                              {diaHorario.rangos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarRangoHorario(
                                      "presencial",
                                      diaHorario.dia,
                                      idxRango
                                    )
                                  }
                                  className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar este horario"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Horarios A Domicilio */}
        {formData.modalidades.includes("domicilio") && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horario A Domicilio <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona los días disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((dia) => {
                    const diasDomicilio = formData.horariosADomicilio?.dias || [];
                    const isSelected = diasDomicilio.some((d) => d.dia === dia);
                    return (
                      <button
                        key={dia}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                        }`}
                        onClick={() => toggleDiaHorario("domicilio", dia)}
                      >
                        <span>{dia}</span>
                        {isSelected && <X className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {errors.horariosADomicilio && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.horariosADomicilio}
                  </p>
                )}
              </div>

              {formData.horariosADomicilio?.dias &&
                formData.horariosADomicilio.dias.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Configura las horas para cada día:
                    </h4>
                    {formData.horariosADomicilio.dias.map((diaHorario) => (
                      <div
                        key={diaHorario.dia}
                        className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-gray-900">
                            {diaHorario.dia}
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                agregarRangoHorario("domicilio", diaHorario.dia)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Agregar horario
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleDiaHorario("domicilio", diaHorario.dia)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Quitar día
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {diaHorario.rangos.map((rango, idxRango) => (
                            <div
                              key={idxRango}
                              className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de inicio
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.desde || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "domicilio",
                                        diaHorario.dia,
                                        idxRango,
                                        "desde",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1.5">
                                    Hora de fin
                                  </label>
                                  <input
                                    type="time"
                                    value={getTime24From12(rango.hasta || "")}
                                    onChange={(e) =>
                                      updateHorarioTime(
                                        "domicilio",
                                        diaHorario.dia,
                                        idxRango,
                                        "hasta",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                    required
                                  />
                                </div>
                              </div>
                              {diaHorario.rangos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarRangoHorario(
                                      "domicilio",
                                      diaHorario.dia,
                                      idxRango
                                    )
                                  }
                                  className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar este horario"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Precios */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Precios <span className="text-red-500">*</span>
          </h2>
          {errors.precios && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.precios}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Primera Sesión */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    type="text"
                    value={formData.precios.primeraSesion.precio}
                    onChange={(e) =>
                      updatePrecios("primeraSesion", "precio", e.target.value)
                    }
                    placeholder="Ej: 50"
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Nombre y descripción del paquete
                </label>
                <input
                  type="text"
                  value={formData.precios.primeraSesion.nombre}
                  onChange={(e) =>
                    updatePrecios("primeraSesion", "nombre", e.target.value)
                  }
                  placeholder="Ej: Primera sesión"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                    errors.preciosPrimeraSesion
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {errors.preciosPrimeraSesion && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.preciosPrimeraSesion}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Duración
                </label>
                <select
                  value={formData.precios.primeraSesion.duracion}
                  onChange={(e) =>
                    updatePrecios("primeraSesion", "duracion", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">Selecciona duración</option>
                  {durationOptions.map((opt) => (
                    <option key={`dur-primera-${opt}`} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sesión de Seguimiento */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    type="text"
                    value={formData.precios.seguimiento.precio}
                    onChange={(e) =>
                      updatePrecios("seguimiento", "precio", e.target.value)
                    }
                    placeholder="Ej: 40"
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Nombre y descripción del paquete
                </label>
                <input
                  type="text"
                  value={formData.precios.seguimiento.nombre}
                  onChange={(e) =>
                    updatePrecios("seguimiento", "nombre", e.target.value)
                  }
                  placeholder="Ej: Sesión de seguimiento"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                    errors.preciosSeguimiento
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {errors.preciosSeguimiento && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.preciosSeguimiento}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Duración
                </label>
                <select
                  value={formData.precios.seguimiento.duracion}
                  onChange={(e) =>
                    updatePrecios("seguimiento", "duracion", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">Selecciona duración</option>
                  {durationOptions.map((opt) => (
                    <option key={`dur-seg-${opt}`} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pack x3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Precio</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    type="text"
                    value={formData.precios.pack3.precio}
                    onChange={(e) =>
                      updatePrecios("pack3", "precio", e.target.value)
                    }
                    placeholder="Ej: 100"
                    className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Nombre y descripción del paquete
                </label>
                <input
                  type="text"
                  value={formData.precios.pack3.nombre}
                  onChange={(e) =>
                    updatePrecios("pack3", "nombre", e.target.value)
                  }
                  placeholder="Ej: Pack 3 sesiones"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                    errors.preciosPack3 ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.preciosPack3 && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.preciosPack3}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Precios para atención a domicilio */}
        {formData.modalidades.includes("domicilio") && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Precios para atención a domicilio{" "}
              <span className="text-red-500">*</span>
            </h3>
            {errors.preciosDomicilio && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.preciosDomicilio}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Primera Sesión Domicilio */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      €
                    </span>
                    <input
                      type="text"
                      value={formData.preciosDomicilio.primeraSesion.precio}
                      onChange={(e) =>
                        updatePreciosDomicilio(
                          "primeraSesion",
                          "precio",
                          e.target.value
                        )
                      }
                      placeholder="Ej: 60"
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre y descripción del paquete
                  </label>
                  <input
                    type="text"
                    value={formData.preciosDomicilio.primeraSesion.nombre}
                    onChange={(e) =>
                      updatePreciosDomicilio(
                        "primeraSesion",
                        "nombre",
                        e.target.value
                      )
                    }
                    placeholder="Ej: Primera sesión a domicilio"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.preciosDomicilioPrimeraSesion
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.preciosDomicilioPrimeraSesion && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.preciosDomicilioPrimeraSesion}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duración
                  </label>
                  <select
                    value={formData.preciosDomicilio.primeraSesion.duracion}
                    onChange={(e) =>
                      updatePreciosDomicilio(
                        "primeraSesion",
                        "duracion",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Selecciona duración</option>
                    {durationOptions.map((opt) => (
                      <option key={`dur-dom-primera-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seguimiento Domicilio */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      €
                    </span>
                    <input
                      type="text"
                      value={formData.preciosDomicilio.seguimiento.precio}
                      onChange={(e) =>
                        updatePreciosDomicilio(
                          "seguimiento",
                          "precio",
                          e.target.value
                        )
                      }
                      placeholder="Ej: 50"
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre y descripción del paquete
                  </label>
                  <input
                    type="text"
                    value={formData.preciosDomicilio.seguimiento.nombre}
                    onChange={(e) =>
                      updatePreciosDomicilio(
                        "seguimiento",
                        "nombre",
                        e.target.value
                      )
                    }
                    placeholder="Ej: Sesión de seguimiento a domicilio"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.preciosDomicilioSeguimiento
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.preciosDomicilioSeguimiento && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.preciosDomicilioSeguimiento}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duración
                  </label>
                  <select
                    value={formData.preciosDomicilio.seguimiento.duracion}
                    onChange={(e) =>
                      updatePreciosDomicilio(
                        "seguimiento",
                        "duracion",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Selecciona duración</option>
                    {durationOptions.map((opt) => (
                      <option key={`dur-dom-seg-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pack x3 Domicilio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      €
                    </span>
                    <input
                      type="text"
                      value={formData.preciosDomicilio.pack3.precio}
                      onChange={(e) =>
                        updatePreciosDomicilio("pack3", "precio", e.target.value)
                      }
                      placeholder="Ej: 120"
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre y descripción del paquete
                  </label>
                  <input
                    type="text"
                    value={formData.preciosDomicilio.pack3.nombre}
                    onChange={(e) =>
                      updatePreciosDomicilio("pack3", "nombre", e.target.value)
                    }
                    placeholder="Ej: Pack 3 sesiones a domicilio"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.preciosDomicilioPack3
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.preciosDomicilioPack3 && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.preciosDomicilioPack3}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Observaciones
          </h2>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Cualquier información adicional que consideres relevante..."
          />
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {isSaveModalOpen && (
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
            isOpen={isSaveModalOpen}
            onClose={() => {
              if (!isLoading) {
                setIsSaveModalOpen(false);
              }
            }}
            onConfirm={confirmSave}
            isLoading={isLoading}
          />
        </Suspense>
      )}
    </div>
  );
}
