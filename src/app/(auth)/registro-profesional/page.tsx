"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, HelpCircle, Check, Mail, Phone, MapPin } from "lucide-react";
import { authService } from "@/services/api/auth";
import { validateEmail, validatePassword } from "@/services/utils/api-helpers";
import { SpecialtiesService } from "@/services/api/specialties";

const specialtiesService = new SpecialtiesService();

export default function RegisterProfessionalPage() {
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
    consentimiento: false,
    aceptaTerminos: false,
    // Nuevos campos para horarios y precios
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
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

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

  // Cargar especialidades desde API pública
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
      if (checkboxName === "consentimiento") {
        setFormData((prev) => ({
          ...prev,
          consentimiento: checked,
        }));
      } else if (checkboxName === "modalidad") {
        const modalidadValue = (e.target as HTMLInputElement).value;
        setFormData((prev) => ({
          ...prev,
          modalidades: checked
            ? [...prev.modalidades, modalidadValue]
            : prev.modalidades.filter((m) => m !== modalidadValue),
        }));
      } else if (checkboxName === "aceptaTerminos") {
        setFormData((prev) => ({
          ...prev,
          aceptaTerminos: checked,
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

  const getMissingField = useCallback(() => {
    // 1. Validaciones básicas
    if (!formData.nombreCompleto.trim())
      return {
        field: "nombreCompleto",
        error: "El nombre completo es requerido",
      };
    if (!formData.correoElectronico.trim())
      return { field: "correoElectronico", error: "El correo es requerido" };
    if (!validateEmail(formData.correoElectronico))
      return {
        field: "correoElectronico",
        error: "El formato del correo no es válido",
      };
    if (!formData.password)
      return { field: "password", error: "La contraseña es requerida" };
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid)
      return { field: "password", error: passwordValidation.errors.join(", ") };
    if (!formData.confirmPassword)
      return {
        field: "confirmPassword",
        error: "Por favor confirma tu contraseña",
      };
    if (formData.password !== formData.confirmPassword)
      return {
        field: "confirmPassword",
        error: "Las contraseñas no coinciden",
      };
    if (!formData.telefono.trim())
      return { field: "telefono", error: "El teléfono es requerido" };
    if (!formData.titulacion.trim())
      return {
        field: "titulacion",
        error: "La titulación profesional es requerida",
      };
    if (!formData.numeroColegiado.trim())
      return {
        field: "numeroColegiado",
        error: "El número de colegiado/a es requerido",
      };
    if (!formData.nifCif.trim())
      return { field: "nifCif", error: "El NIF/CIF es requerido" };
    if (!formData.correoProfesionalPublico.trim())
      return {
        field: "correoProfesionalPublico",
        error: "El correo electrónico profesional es requerido",
      };
    if (!validateEmail(formData.correoProfesionalPublico))
      return {
        field: "correoProfesionalPublico",
        error: "El formato del correo electrónico profesional no es válido",
      };
    if (!formData.descripcion.trim())
      return {
        field: "descripcion",
        error: "La descripción general del perfil profesional es requerida",
      };
    if (formData.descripcion.length > 1500)
      return {
        field: "descripcion",
        error: "La descripción no debe superar los 1.500 caracteres",
      };
    if (!formData.serviciosOfrecidos.trim())
      return {
        field: "serviciosOfrecidos",
        error: "Los servicios ofrecidos son requeridos",
      };
    if (!foto)
      return {
        field: "foto",
        error: "La foto del perfil profesional es requerida",
      };
    if (formData.modalidades.length === 0)
      return {
        field: "modalidades",
        error: "Debes seleccionar al menos una modalidad de atención",
      };

    // 2. Validaciones condicionales de dirección
    if (
      formData.modalidades.includes("presencial") &&
      !formData.direccionConsulta.trim()
    ) {
      return {
        field: "direccionConsulta",
        error:
          "La dirección de consulta es requerida si ofreces atención presencial",
      };
    }
    if (!formData.ciudad.trim())
      return { field: "ciudad", error: "La ciudad es requerida" };
    if (
      formData.modalidades.includes("domicilio") &&
      !formData.codigosPostalesDomicilio.trim()
    ) {
      return {
        field: "codigosPostalesDomicilio",
        error:
          "Los códigos postales son requeridos si ofreces atención a domicilio",
      };
    }

    // 3. Validaciones de horarios
    const validateHorarios = (horarios: any) => {
      if (!horarios || !horarios.dias || horarios.dias.length === 0)
        return "Debes seleccionar al menos un día";
      // Validar que cada día tenga al menos un rango completo
      if (
        horarios.dias.some(
          (d: any) =>
            !d.rangos ||
            d.rangos.length === 0 ||
            d.rangos.some((r: any) => !r.desde || !r.hasta)
        )
      )
        return "Debes especificar las horas de inicio y fin para todos los rangos";
      return null;
    };

    if (formData.modalidades.includes("online")) {
      const err = validateHorarios(formData.horariosEnLinea);
      if (err)
        return {
          field: "horariosEnLinea",
          error: err + " para atención en línea",
        };
    }
    if (formData.modalidades.includes("presencial")) {
      const err = validateHorarios(formData.horariosPresencial);
      if (err)
        return {
          field: "horariosPresencial",
          error: err + " para atención presencial",
        };
    }
    if (formData.modalidades.includes("domicilio")) {
      const err = validateHorarios(formData.horariosADomicilio);
      if (err)
        return {
          field: "horariosADomicilio",
          error: err + " para atención a domicilio",
        };
    }

    // 4. Validaciones de precios
    const hasPrice = (p: any) => p.precio && p.precio.trim() !== "";
    const isValidPrice = (p: any) =>
      !hasPrice(p) || (p.nombre.trim() !== "" && p.duracion.trim() !== "");
    // Pack3 no requiere duración
    const isValidPack3 = (p: any) => !hasPrice(p) || p.nombre.trim() !== "";

    const precios = formData.precios;
    const hasAnyPrice =
      hasPrice(precios.primeraSesion) ||
      hasPrice(precios.seguimiento) ||
      hasPrice(precios.pack3);

    if (!hasAnyPrice)
      return { field: "precios", error: "Debes configurar al menos un precio" };

    if (!isValidPrice(precios.primeraSesion))
      return {
        field: "preciosPrimeraSesion",
        error: "Falta nombre o duración en Primera Sesión",
      };
    if (!isValidPrice(precios.seguimiento))
      return {
        field: "preciosSeguimiento",
        error: "Falta nombre o duración en Seguimiento",
      };
    if (!isValidPack3(precios.pack3))
      return { field: "preciosPack3", error: "Falta nombre en Pack 3" };

    // 5. Validaciones de precios domicilio
    if (formData.modalidades.includes("domicilio")) {
      const preciosDom = formData.preciosDomicilio;
      const hasAnyPriceDom =
        hasPrice(preciosDom.primeraSesion) ||
        hasPrice(preciosDom.seguimiento) ||
        hasPrice(preciosDom.pack3);

      if (!hasAnyPriceDom)
        return {
          field: "preciosDomicilio",
          error:
            "Debes configurar al menos un precio para atención a domicilio",
        };

      if (!isValidPrice(preciosDom.primeraSesion))
        return {
          field: "preciosDomicilioPrimeraSesion",
          error: "Falta nombre o duración en Primera Sesión (Domicilio)",
        };
      if (!isValidPrice(preciosDom.seguimiento))
        return {
          field: "preciosDomicilioSeguimiento",
          error: "Falta nombre o duración en Seguimiento (Domicilio)",
        };
      if (!isValidPack3(preciosDom.pack3))
        return {
          field: "preciosDomicilioPack3",
          error: "Falta nombre en Pack 3 (Domicilio)",
        };
    }

    // 6. Video opcional
    if (
      formData.videoPresentacion &&
      !validateVideoUrl(formData.videoPresentacion)
    ) {
      return {
        field: "videoPresentacion",
        error: "El enlace al vídeo debe ser de YouTube o Vimeo",
      };
    }

    return null;
  }, [formData, foto]);

  const isFormComplete = useMemo(() => {
    return getMissingField() === null;
  }, [getMissingField]);

  const handleDisabledCheckboxClick = (e: React.MouseEvent) => {
    if (isFormComplete) return;

    e.preventDefault();
    const missing = getMissingField();
    if (missing) {
      setErrors((prev) => ({ ...prev, [missing.field]: missing.error }));

      // Scroll al campo
      const element =
        document.getElementById(missing.field) ||
        document.querySelector(`[name="${missing.field}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        if (element instanceof HTMLElement) {
          element.focus({ preventScroll: true });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 [REGISTRO] Iniciando envío del formulario...");
    setErrors({});
    setLoading(true);

    // Validaciones
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

    if (!formData.consentimiento) {
      newErrors.consentimiento =
        "Debes aceptar el consentimiento de tratamiento de datos";
    }

    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos =
        "Debes aceptar los términos y condiciones para profesionales";
    }

    if (!formData.titulacion.trim()) {
      newErrors.titulacion = "La titulación profesional es requerida";
    }

    if (!formData.numeroColegiado.trim()) {
      newErrors.numeroColegiado = "El número de colegiado/a es requerido";
    }

    if (!formData.nifCif.trim()) {
      newErrors.nifCif = "El NIF/CIF es requerido";
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
    } else if (formData.descripcion.length > 1500) {
      newErrors.descripcion =
        "La descripción no debe superar los 1.500 caracteres";
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

    if (
      formData.modalidades.includes("presencial") &&
      !formData.direccionConsulta.trim()
    ) {
      newErrors.direccionConsulta =
        "La dirección de consulta es requerida si ofreces atención presencial";
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es requerida";
    }

    // Validar horarios según las modalidades seleccionadas
    if (formData.modalidades.includes("online")) {
      if (
        !formData.horariosEnLinea ||
        !formData.horariosEnLinea.dias ||
        formData.horariosEnLinea.dias.length === 0
      ) {
        newErrors.horariosEnLinea =
          "Debes seleccionar al menos un día para atención en línea";
      } else {
        // Validar que cada día tenga al menos un rango completo
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
        // Validar que cada día tenga al menos un rango completo
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
        // Validar que cada día tenga al menos un rango completo
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
      // Validar códigos postales si ofrece atención a domicilio
      if (!formData.codigosPostalesDomicilio.trim()) {
        newErrors.codigosPostalesDomicilio =
          "Los códigos postales son requeridos si ofreces atención a domicilio";
      }
      // Validar que al menos un precio de domicilio esté configurado
      const tienePreciosDomicilio =
        (formData.preciosDomicilio.primeraSesion.precio &&
          formData.preciosDomicilio.primeraSesion.precio.trim() !== "") ||
        (formData.preciosDomicilio.seguimiento.precio &&
          formData.preciosDomicilio.seguimiento.precio.trim() !== "") ||
        (formData.preciosDomicilio.pack3.precio &&
          formData.preciosDomicilio.pack3.precio.trim() !== "");

      if (!tienePreciosDomicilio) {
        newErrors.preciosDomicilio =
          "Debes configurar al menos un precio para atención a domicilio (Primera Sesión, Seguimiento o Pack x3)";
      } else {
        // Validar que los precios de domicilio configurados tengan nombre y duración
        if (
          formData.preciosDomicilio.primeraSesion.precio &&
          formData.preciosDomicilio.primeraSesion.precio.trim() !== ""
        ) {
          if (!formData.preciosDomicilio.primeraSesion.nombre.trim()) {
            newErrors.preciosDomicilioPrimeraSesion =
              "El nombre del paquete de Primera Sesión (domicilio) es requerido";
          }
          if (!formData.preciosDomicilio.primeraSesion.duracion.trim()) {
            newErrors.preciosDomicilioPrimeraSesion =
              "La duración de Primera Sesión (domicilio) es requerida";
          }
        }
        if (
          formData.preciosDomicilio.seguimiento.precio &&
          formData.preciosDomicilio.seguimiento.precio.trim() !== ""
        ) {
          if (!formData.preciosDomicilio.seguimiento.nombre.trim()) {
            newErrors.preciosDomicilioSeguimiento =
              "El nombre del paquete de Seguimiento (domicilio) es requerido";
          }
          if (!formData.preciosDomicilio.seguimiento.duracion.trim()) {
            newErrors.preciosDomicilioSeguimiento =
              "La duración de Seguimiento (domicilio) es requerida";
          }
        }
        if (
          formData.preciosDomicilio.pack3.precio &&
          formData.preciosDomicilio.pack3.precio.trim() !== ""
        ) {
          if (!formData.preciosDomicilio.pack3.nombre.trim()) {
            newErrors.preciosDomicilioPack3 =
              "El nombre del paquete Pack x3 (domicilio) es requerido";
          }
        }
      }
    }

    // Validar que al menos un precio esté configurado
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
    } else {
      // Validar que los precios configurados tengan nombre y duración
      if (
        formData.precios.primeraSesion.precio &&
        formData.precios.primeraSesion.precio.trim() !== ""
      ) {
        if (!formData.precios.primeraSesion.nombre.trim()) {
          newErrors.preciosPrimeraSesion =
            "El nombre del paquete de Primera Sesión es requerido";
        }
        if (!formData.precios.primeraSesion.duracion.trim()) {
          newErrors.preciosPrimeraSesion =
            "La duración de Primera Sesión es requerida";
        }
      }
      if (
        formData.precios.seguimiento.precio &&
        formData.precios.seguimiento.precio.trim() !== ""
      ) {
        if (!formData.precios.seguimiento.nombre.trim()) {
          newErrors.preciosSeguimiento =
            "El nombre del paquete de Seguimiento es requerido";
        }
        if (!formData.precios.seguimiento.duracion.trim()) {
          newErrors.preciosSeguimiento =
            "La duración de Seguimiento es requerida";
        }
      }
      if (
        formData.precios.pack3.precio &&
        formData.precios.pack3.precio.trim() !== ""
      ) {
        if (!formData.precios.pack3.nombre.trim()) {
          newErrors.preciosPack3 = "El nombre del paquete Pack x3 es requerido";
        }
      }
    }

    // Validar URL de video si se proporciona
    if (
      formData.videoPresentacion &&
      !validateVideoUrl(formData.videoPresentacion)
    ) {
      newErrors.videoPresentacion =
        "El enlace al vídeo debe ser de YouTube o Vimeo";
    }

    if (Object.keys(newErrors).length > 0) {
      console.error(
        "❌ [REGISTRO] Errores de validación encontrados:",
        newErrors
      );
      setErrors(newErrors);
      setLoading(false);
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

    console.log(
      "✅ [REGISTRO] Validaciones pasadas, preparando datos para envío..."
    );

    try {
      // Crear FormData para enviar archivo y datos
      const formDataToSend = new FormData();
      console.log("📦 [REGISTRO] Construyendo FormData...");

      // Agregar campos de texto
      formDataToSend.append("nombreCompleto", formData.nombreCompleto.trim());
      formDataToSend.append(
        "correoElectronico",
        formData.correoElectronico.trim().toLowerCase()
      );
      formDataToSend.append("password", formData.password);
      formDataToSend.append("telefono", formData.telefono.trim());
      formDataToSend.append("numeroColegiado", formData.numeroColegiado.trim());
      formDataToSend.append("nifCif", formData.nifCif.trim());
      formDataToSend.append(
        "aceptaTerminos",
        formData.aceptaTerminos.toString()
      );

      if (formData.especialidad.trim()) {
        formDataToSend.append("especialidad", formData.especialidad.trim());
      }
      if (formData.especialidadSeleccionada.trim()) {
        formDataToSend.append(
          "especialidadSeleccionada",
          formData.especialidadSeleccionada.trim()
        );
      }
      if (formData.id_especialidad) {
        formDataToSend.append(
          "id_especialidad",
          formData.id_especialidad.toString()
        );
      }
      // Campos requeridos adicionales
      if (formData.titulacion.trim()) {
        formDataToSend.append("titulacion", formData.titulacion.trim());
      }
      if (formData.correoProfesionalPublico.trim()) {
        formDataToSend.append(
          "correoProfesionalPublico",
          formData.correoProfesionalPublico.trim().toLowerCase()
        );
      }
      if (formData.direccionConsulta.trim()) {
        formDataToSend.append(
          "domicilio_consultorio",
          formData.direccionConsulta.trim()
        );
      }
      if (formData.ciudad.trim()) {
        formDataToSend.append("ciudad", formData.ciudad.trim());
      }
      if (formData.descripcion.trim()) {
        formDataToSend.append("biografia", formData.descripcion.trim());
      }
      if (formData.serviciosOfrecidos.trim()) {
        formDataToSend.append(
          "serviciosOfrecidos",
          formData.serviciosOfrecidos.trim()
        );
      }
      if (formData.codigosPostalesDomicilio.trim()) {
        formDataToSend.append(
          "codigosPostalesDomicilio",
          formData.codigosPostalesDomicilio.trim()
        );
      }
      if (formData.tarifas.trim()) {
        formDataToSend.append("tarifas", formData.tarifas.trim());
      }
      if (formData.accesibleMovilidad) {
        formDataToSend.append(
          "accesibleMovilidad",
          formData.accesibleMovilidad
        );
      }
      if (formData.modalidades.length > 0) {
        formDataToSend.append(
          "modalidades",
          JSON.stringify(formData.modalidades)
        );
      }
      if (formData.experiencia_años) {
        formDataToSend.append("experiencia_años", formData.experiencia_años);
      }
      if (formData.observaciones.trim()) {
        formDataToSend.append("observaciones", formData.observaciones.trim());
      }
      if (formData.tarifa_por_hora) {
        formDataToSend.append("tarifa_por_hora", formData.tarifa_por_hora);
      }
      if (formData.videoPresentacion.trim()) {
        formDataToSend.append(
          "videoPresentacion",
          formData.videoPresentacion.trim()
        );
      }

      // Agregar horarios por modalidad si están configurados
      // Transformar la estructura de rangos múltiples al formato que espera el backend
      // Backend espera: { dias: [{ dia: "Lunes", desde: "...", hasta: "..." }, ...] }
      if (formData.horariosEnLinea) {
        const horariosTransformados = {
          dias: formData.horariosEnLinea.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
        formDataToSend.append(
          "horariosEnLinea",
          JSON.stringify(horariosTransformados)
        );
      }
      if (formData.horariosPresencial) {
        const horariosTransformados = {
          dias: formData.horariosPresencial.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
        formDataToSend.append(
          "horariosPresencial",
          JSON.stringify(horariosTransformados)
        );
      }
      if (formData.horariosADomicilio) {
        const horariosTransformados = {
          dias: formData.horariosADomicilio.dias.flatMap((d) =>
            d.rangos.map((r) => ({
              dia: d.dia,
              desde: r.desde,
              hasta: r.hasta,
            }))
          ),
        };
        formDataToSend.append(
          "horariosADomicilio",
          JSON.stringify(horariosTransformados)
        );
      }

      // Agregar precios si están configurados
      if (
        formData.precios.primeraSesion.precio ||
        formData.precios.seguimiento.precio ||
        formData.precios.pack3.precio
      ) {
        formDataToSend.append("precios", JSON.stringify(formData.precios));
      }

      // Agregar precios de domicilio si están configurados y se selecciona modalidad domicilio
      if (
        formData.modalidades.includes("domicilio") &&
        (formData.preciosDomicilio.primeraSesion.precio ||
          formData.preciosDomicilio.seguimiento.precio ||
          formData.preciosDomicilio.pack3.precio)
      ) {
        formDataToSend.append(
          "preciosDomicilio",
          JSON.stringify(formData.preciosDomicilio)
        );
      }

      // Agregar foto si existe
      if (foto) {
        console.log(
          "📷 [REGISTRO] Agregando foto:",
          foto.name,
          `(${Math.round(foto.size / 1024)} KB)`
        );
        formDataToSend.append("foto", foto);
      } else {
        console.warn("⚠️ [REGISTRO] No se encontró foto para enviar");
      }

      // Log de datos que se enviarán (sin datos sensibles)
      console.log("📤 [REGISTRO] Enviando datos al servidor...");
      console.log("   - Nombre:", formData.nombreCompleto);
      console.log("   - Email:", formData.correoElectronico);
      console.log("   - Modalidades:", formData.modalidades);
      console.log("   - Horarios configurados:", {
        enLinea: !!formData.horariosEnLinea,
        presencial: !!formData.horariosPresencial,
        domicilio: !!formData.horariosADomicilio,
      });
      console.log("   - Precios configurados:", {
        primeraSesion: {
          precio: formData.precios.primeraSesion.precio,
          nombre: formData.precios.primeraSesion.nombre,
          duracion: formData.precios.primeraSesion.duracion,
        },
        seguimiento: {
          precio: formData.precios.seguimiento.precio,
          nombre: formData.precios.seguimiento.nombre,
          duracion: formData.precios.seguimiento.duracion,
        },
        pack3: {
          precio: formData.precios.pack3.precio,
          nombre: formData.precios.pack3.nombre,
          duracion: formData.precios.pack3.duracion,
        },
      });
      console.log("   - Campo tarifas (legacy):", formData.tarifas);

      const response = await authService.registerProfessional(formDataToSend);
      console.log("📥 [REGISTRO] Respuesta recibida:", {
        success: response.success,
        message: response.message,
        error: response.error,
      });

      if (response.success) {
        console.log("✅ [REGISTRO] Registro exitoso!");
        // Si el registro es exitoso y hay email en la respuesta, redirigir a verificación
        // (igual que hacen los clientes)
        const email =
          (response.data as any)?.email ||
          formData.correoElectronico.trim().toLowerCase();

        if (email) {
          console.log("🔄 [REGISTRO] Redirigiendo a verificación de código...");
          // Redirigir a la página de verificación de código con el email
          router.push(`/verificar-codigo?email=${encodeURIComponent(email)}`);
          return; // Salir temprano para evitar mostrar el mensaje de éxito
        }

        // Si no hay email en la respuesta, mostrar mensaje de éxito (fallback)
        setSuccessMsg(
          response.message ||
            "Registro exitoso. Revisa tu email para el código de 6 dígitos."
        );
        // Resetear formulario
        setFormData({
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
          id_especialidad: undefined,
          descripcion: "",
          videoPresentacion: "",
          modalidades: [],
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
          consentimiento: false,
          aceptaTerminos: false,
          horariosEnLinea: null,
          horariosPresencial: null,
          horariosADomicilio: null,
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
        setFoto(null);
        setFotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorMessage =
          response.error || "Error al registrar. Por favor, intenta de nuevo.";

        // Mapear errores de validación a campos específicos si están disponibles
        const fieldErrors: Record<string, string> = {};

        if (
          response.errorDetails?.errors &&
          Array.isArray(response.errorDetails.errors)
        ) {
          response.errorDetails.errors.forEach((err: any) => {
            let fieldName = "";
            let errorMsg = "";

            if (typeof err === "string") {
              errorMsg = err;
            } else if (err.field) {
              fieldName = err.field;
              errorMsg = err.message || err.msg || JSON.stringify(err);
            } else if (err.path || err.param) {
              fieldName = err.path || err.param;
              errorMsg = err.message || err.msg || JSON.stringify(err);
            } else {
              errorMsg = err.message || err.msg || JSON.stringify(err);
            }

            // Mapear nombres de campos del backend a los del frontend
            const fieldMap: Record<string, string> = {
              nombreCompleto: "nombreCompleto",
              correoElectronico: "correoElectronico",
              password: "password",
              telefono: "telefono",
              numeroColegiado: "numeroColegiado",
              especialidad: "especialidad",
              biografia: "descripcion",
              tarifas: "precios", // Mapear tarifas (legacy) a precios
            };

            // Si el error es sobre tarifas, convertirlo a error de precios
            if (
              fieldName === "tarifas" ||
              errorMsg.toLowerCase().includes("tarifas")
            ) {
              fieldName = "precios";
              errorMsg =
                "Debes configurar al menos un precio (Primera Sesión, Seguimiento o Pack x3)";
            }

            const frontendField = fieldName
              ? fieldMap[fieldName] || fieldName
              : "";

            if (frontendField && errorMsg) {
              fieldErrors[frontendField] = errorMsg;
            } else if (errorMsg && !frontendField) {
              if (!fieldErrors.submit) {
                fieldErrors.submit = errorMsg;
              } else {
                fieldErrors.submit += `, ${errorMsg}`;
              }
            }
          });
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: errorMessage });
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        "Ocurrió un error al registrar. Por favor, intenta de nuevo.";
      console.error("❌ [REGISTRO] Error en registro profesional:", err);
      console.error("   - Detalles:", {
        message: err?.message,
        error: err?.error,
        stack: err?.stack,
      });
      setErrors({
        submit: errorMessage,
      });
      // Scroll al mensaje de error
      setTimeout(() => {
        const errorElement = document.querySelector('[role="alert"]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } finally {
      console.log("🏁 [REGISTRO] Finalizando proceso de registro");
      setLoading(false);
    }
  };

  const statusMessageId = "professional-register-status";
  const successMessageId = `${statusMessageId}-success`;
  const caracteresRestantes = 1500 - formData.descripcion.length;
  const describedByIds =
    [errors.submit ? statusMessageId : "", successMsg ? successMessageId : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white max-w-7xl mx-auto">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12 overflow-y-auto">
        <div className="w-full">
          {/* Información de NAXINE - Arriba del título */}
          <div className="text-center mb-8 lg:mb-10 space-y-6">
            {/* Descripción de NAXINE */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                <span className="text-[#FF6B35] font-bold">NAXINE</span> es un{" "}
                <span className="italic">marketplace digital</span> que facilita
                la contratación de{" "}
                <span className="italic">servicios profesionales</span> en áreas
                como psicología, nutrición, derecho, fisioterapia, logopedia y
                desarrollo personal.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                La plataforma incorpora una{" "}
                <span className="italic">herramienta de accesibilidad digital</span>{" "}
                que permite a personas con discapacidad visual o dificultades
                específicas navegar, reservar y contratar de forma autónoma y
                segura.
              </p>
            </div>

            {/* Próximamente */}
            <div className="py-4">
              <p className="text-gray-800 text-xl md:text-2xl font-semibold">
                Próximamente disponible.
              </p>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 pt-4">
              {/* Email y Teléfono */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-gray-700">
                <a
                  href="mailto:info@naxine.com"
                  className="flex items-center gap-2 hover:text-[#0a51f2] transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#0a51f2]" />
                  <span className="text-base md:text-lg">info@naxine.com</span>
                </a>
                <span className="hidden md:inline text-gray-400">|</span>
                <a
                  href="tel:+34919933510"
                  className="flex items-center gap-2 hover:text-[#0a51f2] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#FF6B35]" />
                  <span className="text-base md:text-lg">+34 919 933 510</span>
                </a>
              </div>

              {/* Ubicación */}
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B35]" />
                <a
                  href="https://maps.app.goo.gl/DjYCs5jqRUST2t4y9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0a51f2] hover:underline text-base md:text-lg"
                >
                  Ver ubicación en Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Regístrate como profesional
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Completa este formulario para validar tu perfil y preparar tu
              futura ficha pública en la plataforma.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
            aria-describedby={describedByIds}
            aria-busy={loading}
          >
            {/* Success Message */}
            {successMsg && (
              <div
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                role="status"
                aria-live="polite"
                id={successMessageId}
              >
                {successMsg}
              </div>
            )}

            {/* Error Message */}
            {!successMsg && errors.submit && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3"
                role="alert"
                aria-live="assertive"
                id={statusMessageId}
              >
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">Error al enviar el formulario</p>
                  <p className="text-sm mt-1">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* 1. Nombre completo */}
            <div>
              <label
                htmlFor="nombreCompleto"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre y apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.nombreCompleto ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Nombre y apellidos completos"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.nombreCompleto)}
              />
              {errors.nombreCompleto && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nombreCompleto}
                </p>
              )}
            </div>

            {/* 2. Correo electrónico */}
            <div>
              <label
                htmlFor="correoElectronico"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="correoElectronico"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.correoElectronico
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="tu@email.com"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.correoElectronico)}
              />
              {errors.correoElectronico && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.correoElectronico}
                </p>
              )}
            </div>

            {/* 3. Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={!!successMsg}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {/* Requisitos de contraseña en tiempo real */}
              {(passwordFocused || formData.password) && (
                <div
                  className={`mt-3 p-3 rounded-lg border transition-colors duration-200 ${
                    validatePassword(formData.password).isValid
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-100"
                  } space-y-2`}
                >
                  <p
                    className={`text-xs font-medium mb-2 ${
                      validatePassword(formData.password).isValid
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {validatePassword(formData.password).isValid
                      ? "¡Contraseña segura!"
                      : "La contraseña debe contener:"}
                  </p>
                  {[
                    {
                      label: "Mínimo 8 caracteres",
                      valid: formData.password.length >= 8,
                    },
                    {
                      label: "Al menos una letra mayúscula",
                      valid: /[A-Z]/.test(formData.password),
                    },
                    {
                      label: "Al menos una letra minúscula",
                      valid: /[a-z]/.test(formData.password),
                    },
                    {
                      label: "Al menos un número",
                      valid: /\d/.test(formData.password),
                    },
                  ].map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs transition-colors duration-200"
                    >
                      {req.valid ? (
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
                      )}
                      <span
                        className={
                          req.valid ? "text-green-700" : "text-gray-500"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirma tu contraseña"
                  required
                  disabled={!!successMsg}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {/* Mensaje de coincidencia de contraseña en tiempo real */}
              {formData.confirmPassword && (
                <div className="mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Las contraseñas coinciden
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              )}
              {errors.confirmPassword && !formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* 5. Teléfono */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.telefono ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="+34 600 123 456"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.telefono)}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* 7. Titulación profesional */}
            <div>
              <label
                htmlFor="titulacion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titulación profesional <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Será visible en tu futura ficha pública)
                </span>
              </label>
              <input
                type="text"
                id="titulacion"
                name="titulacion"
                value={formData.titulacion}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.titulacion ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ej: Grado en Psicología"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.titulacion)}
              />
              {errors.titulacion && (
                <p className="mt-1 text-sm text-red-600">{errors.titulacion}</p>
              )}
            </div>

            {/* 8. Número de colegiado/a */}
            <div>
              <label
                htmlFor="numeroColegiado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de colegiado/a <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Será visible en tu futura ficha pública)
                </span>
              </label>
              <input
                type="text"
                id="numeroColegiado"
                name="numeroColegiado"
                value={formData.numeroColegiado}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.numeroColegiado ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Número de colegiado/a"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.numeroColegiado)}
              />
              {errors.numeroColegiado && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.numeroColegiado}
                </p>
              )}
            </div>

            {/* 8.1. NIF/CIF */}
            <div>
              <label
                htmlFor="nifCif"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NIF/CIF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nifCif"
                name="nifCif"
                value={formData.nifCif}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.nifCif ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ej: 12345678A o B12345678"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.nifCif)}
              />
              {errors.nifCif && (
                <p className="mt-1 text-sm text-red-600">{errors.nifCif}</p>
              )}
            </div>

            {/* 9. Correo electrónico profesional */}
            <div>
              <label
                htmlFor="correoProfesionalPublico"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo electrónico profesional{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="correoProfesionalPublico"
                name="correoProfesionalPublico"
                value={formData.correoProfesionalPublico}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.correoProfesionalPublico
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="profesional@email.com"
                required
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.correoProfesionalPublico)}
              />
              {errors.correoProfesionalPublico && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.correoProfesionalPublico}
                </p>
              )}
            </div>

            {/* 10. Especialidad */}
            <div>
              <label
                htmlFor="id_especialidad"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Especialidad o área profesional{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="id_especialidad"
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
                  disabled={!!successMsg || loadingEspecialidades}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white ${
                    errors.especialidad ? "border-red-300" : "border-gray-300"
                  } ${loadingEspecialidades ? "opacity-50" : ""}`}
                  required
                  aria-invalid={Boolean(errors.especialidad)}
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {loadingEspecialidades ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {errors.especialidad && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.especialidad}
                </p>
              )}
            </div>

            {/* 11. Descripción general del perfil profesional */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descripción general del perfil profesional{" "}
                <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Máximo 1.500 caracteres. Será visible en tu futura ficha
                  pública)
                </span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                maxLength={1500}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
                  errors.descripcion ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Describe tu perfil profesional, experiencia y especialidades..."
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.descripcion)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {caracteresRestantes} caracteres restantes
              </p>
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.descripcion}
                </p>
              )}
            </div>

            {/* 11.1. Servicios ofrecidos */}
            <div>
              <label
                htmlFor="serviciosOfrecidos"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Servicios ofrecidos <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Lista los servicios que ofreces)
                </span>
              </label>
              <textarea
                id="serviciosOfrecidos"
                name="serviciosOfrecidos"
                value={formData.serviciosOfrecidos}
                onChange={handleInputChange}
                required
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
                  errors.serviciosOfrecidos
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder=""
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.serviciosOfrecidos)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa cada servicio con comas o en líneas diferentes
              </p>
              {errors.serviciosOfrecidos && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.serviciosOfrecidos}
                </p>
              )}
            </div>

            {/* 12. Foto del perfil profesional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del perfil profesional{" "}
                <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Será visible en tu futura ficha pública)
                </span>
              </label>
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
                    disabled={!!successMsg}
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
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                      errors.foto ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={!!successMsg}
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

            {/* 13. Enlace al vídeo de presentación */}
            <div>
              <label
                htmlFor="videoPresentacion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enlace al vídeo de presentación
                <span className="text-xs text-gray-500 ml-2">
                  (Opcional, solo YouTube o Vimeo. Será visible en tu futura
                  ficha pública)
                </span>
              </label>
              <input
                type="url"
                id="videoPresentacion"
                name="videoPresentacion"
                value={formData.videoPresentacion}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.videoPresentacion
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.videoPresentacion)}
              />
              {errors.videoPresentacion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.videoPresentacion}
                </p>
              )}
            </div>

            {/* 14. Modalidades de atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidades de atención que ofreces{" "}
                <span className="text-red-500">*</span>
              </label>
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
                      disabled={!!successMsg}
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {modalidad === "domicilio" ? "A domicilio" : modalidad}
                    </span>
                  </label>
                ))}
              </div>
              {errors.modalidades && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.modalidades}
                </p>
              )}
            </div>

            {/* 15. Dirección de consulta */}
            {formData.modalidades.includes("presencial") && (
              <div>
                <label
                  htmlFor="direccionConsulta"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Dirección de consulta <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Solo si ofreces atención presencial)
                  </span>
                </label>
                <textarea
                  id="direccionConsulta"
                  name="direccionConsulta"
                  value={formData.direccionConsulta}
                  onChange={handleInputChange}
                  required={formData.modalidades.includes("presencial")}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
                    errors.direccionConsulta
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Dirección completa de la consulta"
                  disabled={!!successMsg}
                  aria-invalid={Boolean(errors.direccionConsulta)}
                />
                {errors.direccionConsulta && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccionConsulta}
                  </p>
                )}
              </div>
            )}

            {/* 15.1. Ciudad */}
            <div>
              <label
                htmlFor="ciudad"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                  errors.ciudad ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ej: Madrid, Barcelona, Valencia..."
                disabled={!!successMsg}
                aria-invalid={Boolean(errors.ciudad)}
              />
              {errors.ciudad && (
                <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>
              )}
            </div>

            {/* 16. Zonas donde atiendes a domicilio */}
            {formData.modalidades.includes("domicilio") && (
              <div>
                <label
                  htmlFor="codigosPostalesDomicilio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Códigos postales donde ofreces atención a domicilio{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Solo si ofreces atención a domicilio)
                  </span>
                </label>
                <textarea
                  id="codigosPostalesDomicilio"
                  name="codigosPostalesDomicilio"
                  value={formData.codigosPostalesDomicilio}
                  onChange={handleInputChange}
                  required={formData.modalidades.includes("domicilio")}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${
                    errors.codigosPostalesDomicilio
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: 28001, 28002, 28003, 28004 (separados por comas)"
                  disabled={!!successMsg}
                  aria-invalid={Boolean(errors.codigosPostalesDomicilio)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Indica los códigos postales separados por comas. Ej: 28001,
                  28002, 28003
                </p>
                {errors.codigosPostalesDomicilio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.codigosPostalesDomicilio}
                  </p>
                )}
              </div>
            )}

            {/* 17. Accesible para movilidad reducida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Tu consulta es accesible para personas con movilidad reducida?
                <span className="text-xs text-gray-500 ml-2">
                  (Cumplimentar sólo en caso de ofrecer servicio presencial)
                </span>
              </label>
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
                      disabled={!!successMsg}
                    />
                    <span className="text-sm text-gray-700">{opcion}</span>
                  </label>
                ))}
              </div>
              {errors.accesibleMovilidad && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accesibleMovilidad}
                </p>
              )}
            </div>

            {/* 18. Horarios por Modalidad */}
            {/* Horarios En Línea */}
            {formData.modalidades.includes("online") && (
              <div
                id="horariosEnLinea"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
              >
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
                        const diasEnLinea =
                          formData.horariosEnLinea?.dias || [];
                        const isSelected = diasEnLinea.some(
                          (d) => d.dia === dia
                        );
                        return (
                          <button
                            key={dia}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                            }`}
                            onClick={() => {
                              if (!successMsg) toggleDiaHorario("online", dia);
                            }}
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

                  {/* Horarios individuales por día */}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      agregarRangoHorario(
                                        "online",
                                        diaHorario.dia
                                      );
                                  }}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      toggleDiaHorario(
                                        "online",
                                        diaHorario.dia
                                      );
                                  }}
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
                                        value={getTime24From12(
                                          rango.desde || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1.5">
                                        Hora de fin
                                      </label>
                                      <input
                                        type="time"
                                        value={getTime24From12(
                                          rango.hasta || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                  </div>
                                  {diaHorario.rangos.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!successMsg)
                                          eliminarRangoHorario(
                                            "online",
                                            diaHorario.dia,
                                            idxRango
                                          );
                                      }}
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
              <div
                id="horariosPresencial"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
              >
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
                        const diasPresencial =
                          formData.horariosPresencial?.dias || [];
                        const isSelected = diasPresencial.some(
                          (d) => d.dia === dia
                        );
                        return (
                          <button
                            key={dia}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                            }`}
                            onClick={() => {
                              if (!successMsg)
                                toggleDiaHorario("presencial", dia);
                            }}
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

                  {/* Horarios individuales por día */}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      agregarRangoHorario(
                                        "presencial",
                                        diaHorario.dia
                                      );
                                  }}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      toggleDiaHorario(
                                        "presencial",
                                        diaHorario.dia
                                      );
                                  }}
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
                                        value={getTime24From12(
                                          rango.desde || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1.5">
                                        Hora de fin
                                      </label>
                                      <input
                                        type="time"
                                        value={getTime24From12(
                                          rango.hasta || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                  </div>
                                  {diaHorario.rangos.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!successMsg)
                                          eliminarRangoHorario(
                                            "presencial",
                                            diaHorario.dia,
                                            idxRango
                                          );
                                      }}
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
                        const diasDomicilio =
                          formData.horariosADomicilio?.dias || [];
                        const isSelected = diasDomicilio.some(
                          (d) => d.dia === dia
                        );
                        return (
                          <button
                            key={dia}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                            }`}
                            onClick={() => {
                              if (!successMsg)
                                toggleDiaHorario("domicilio", dia);
                            }}
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

                  {/* Horarios individuales por día */}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      agregarRangoHorario(
                                        "domicilio",
                                        diaHorario.dia
                                      );
                                  }}
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
                                  onClick={() => {
                                    if (!successMsg)
                                      toggleDiaHorario(
                                        "domicilio",
                                        diaHorario.dia
                                      );
                                  }}
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
                                        value={getTime24From12(
                                          rango.desde || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1.5">
                                        Hora de fin
                                      </label>
                                      <input
                                        type="time"
                                        value={getTime24From12(
                                          rango.hasta || ""
                                        )}
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
                                        disabled={!!successMsg}
                                        required
                                      />
                                    </div>
                                  </div>
                                  {diaHorario.rangos.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!successMsg)
                                          eliminarRangoHorario(
                                            "domicilio",
                                            diaHorario.dia,
                                            idxRango
                                          );
                                      }}
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

            {/* 19. Precios */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Precios <span className="text-red-500">*</span>
              </h3>
              {errors.precios && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.precios}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Primera Sesión */}
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
                        value={formData.precios.primeraSesion.precio}
                        onChange={(e) =>
                          updatePrecios(
                            "primeraSesion",
                            "precio",
                            e.target.value
                          )
                        }
                        placeholder="Ej: 50"
                        className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={!!successMsg}
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
                        errors.preciosPack3
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      disabled={!!successMsg}
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
                        updatePrecios(
                          "primeraSesion",
                          "duracion",
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                        errors.preciosPrimeraSesion
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      disabled={!!successMsg}
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
                    <label className="block text-xs text-gray-500 mb-1">
                      Precio
                    </label>
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
                        disabled={!!successMsg}
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
                      disabled={!!successMsg}
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
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                        errors.preciosSeguimiento
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      disabled={!!successMsg}
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
                    <label className="block text-xs text-gray-500 mb-1">
                      Precio
                    </label>
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
                        disabled={!!successMsg}
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
                        errors.preciosPack3
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      disabled={!!successMsg}
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

            {/* 19.1. Precios para atención a domicilio */}
            {formData.modalidades.includes("domicilio") && (
              <div
                id="preciosDomicilio"
                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Precios para atención a domicilio{" "}
                  <span className="text-red-500">*</span>
                </h3>
                {errors.preciosDomicilio && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      {errors.preciosDomicilio}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Primera Sesión Domicilio */}
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
                          disabled={!!successMsg}
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
                        disabled={!!successMsg}
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
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                          errors.preciosDomicilioPrimeraSesion
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={!!successMsg}
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
                      <label className="block text-xs text-gray-500 mb-1">
                        Precio
                      </label>
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
                          disabled={!!successMsg}
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
                        disabled={!!successMsg}
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
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white ${
                          errors.preciosDomicilioSeguimiento
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={!!successMsg}
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
                      <label className="block text-xs text-gray-500 mb-1">
                        Precio
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          €
                        </span>
                        <input
                          type="text"
                          value={formData.preciosDomicilio.pack3.precio}
                          onChange={(e) =>
                            updatePreciosDomicilio(
                              "pack3",
                              "precio",
                              e.target.value
                            )
                          }
                          placeholder="Ej: 120"
                          className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          disabled={!!successMsg}
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
                          updatePreciosDomicilio(
                            "pack3",
                            "nombre",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Pack 3 sesiones a domicilio"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                          errors.preciosDomicilioPack3
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={!!successMsg}
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

            {/* 22. Observaciones */}
            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Cualquier información adicional que consideres relevante..."
                disabled={!!successMsg}
              />
            </div>

            {/* Consentimiento y Términos y Condiciones */}
            <div className="space-y-4">
              {/* Consentimiento */}
              <div
                className={`bg-gray-50 p-4 rounded-lg transition-opacity duration-200 ${
                  !isFormComplete ? "opacity-60" : "opacity-100"
                }`}
              >
                <label
                  className={`flex items-start gap-3 ${
                    !isFormComplete ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="consentimiento"
                    checked={formData.consentimiento}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!successMsg || !isFormComplete}
                  />
                  <span className="text-sm text-gray-700">
                    Declaro haber leído la información anterior y consiento el
                    tratamiento de mis datos personales para la finalidad de
                    validación profesional y gestión de mi solicitud de alta en
                    NAXINE. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consentimiento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.consentimiento}
                  </p>
                )}
              </div>

              {/* Términos y Condiciones para Profesionales */}
              <div
                className={`bg-gray-50 p-4 rounded-lg transition-opacity duration-200 ${
                  !isFormComplete ? "opacity-60" : "opacity-100"
                }`}
                onClick={
                  !isFormComplete ? handleDisabledCheckboxClick : undefined
                }
              >
                <label
                  className={`flex items-start gap-3 ${
                    !isFormComplete ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!successMsg || !isFormComplete}
                  />
                  <span className="text-sm text-gray-700 flex items-start gap-2">
                    <span>
                      He leído y acepto los{" "}
                      <Link
                        href="/terminos-condiciones-profesionales"
                        className="text-primary hover:underline"
                        target="_blank"
                      >
                        términos y condiciones para profesionales
                      </Link>
                      . <span className="text-red-500">*</span>
                    </span>
                    <span className="relative group cursor-help inline-flex items-center">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform group-hover:translate-y-0 translate-y-1 pointer-events-none z-10">
                        Podrás consultar los términos y condiciones dentro de tu
                        panel
                        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></span>
                      </span>
                    </span>
                  </span>
                </label>
                {errors.aceptaTerminos && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.aceptaTerminos}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Enviando solicitud...</span>
                </>
              ) : successMsg ? (
                <>
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Enviado</span>
                </>
              ) : (
                "Enviar solicitud"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center mt-4">
              <span className="text-gray-700">¿Ya tienes una cuenta? </span>
              <Link
                href="/iniciar-sesion"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Iniciar sesión
              </Link>
            </div>

            {/* Links a términos y políticas */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                <Link
                  href="/terminos-condiciones"
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  target="_blank"
                >
                  Términos y Condiciones
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/politica-de-privacidad"
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  target="_blank"
                >
                  Política de Privacidad
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/politica-cookies"
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  target="_blank"
                >
                  Política de Cookies
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Professional Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="relative w-full h-full flex items-center lg:items-start justify-center p-4 lg:p-8">
          <div className="sticky top-4 w-full max-w-2xl">
            <div className="w-full h-[500px] lg:h-[600px] xl:h-[700px] relative rounded-3xl overflow-hidden">
              <Image
                src="/smk_Snapchat-Picture.webp"
                alt="Profesional"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
