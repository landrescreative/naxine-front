"use client";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SeparatorSection from "@/components/ui/SeparatorSection";
import PricingCard from "@/components/ui/PricingCard";
import { ApiProfessional, ProfessionalPrice } from "@/services/types/api";
import { appointmentsService, citasService } from "@/services";
import { useAuth } from "@/hooks/useAuth";

interface ProfessionalPageClientProps {
  professional: ApiProfessional;
}

export default function ProfessionalPageClient({
  professional,
}: ProfessionalPageClientProps) {
  // Video popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<ProfessionalPrice | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [selectedTipoAtencion, setSelectedTipoAtencion] = useState<
    "presencial" | "en_linea" | "a_domicilio" | null
  >(null);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [direccionDomicilio, setDireccionDomicilio] = useState<string>("");
  const router = useRouter();
  const params = useParams<{
    category: string;
    service: string;
    professional: string;
  }>();
  const { user, isAuthenticated } = useAuth();

  // Debug: Log professional data
  console.log(
    "[ProfessionalPageClient] Professional data received:",
    professional
  );

  // Unified presentation video URL from backend (supports multiple field names)
  const presentationVideoUrl = useMemo(() => {
    const raw: any = professional as any;
    return (
      (professional as any)?.videoUrl ||
      raw?.video_presentacion ||
      raw?.videoPresentacion ||
      null
    );
  }, [professional]);

  // Helper function to convert YouTube/Vimeo URLs to embed format
  const getEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        let videoId: string | null = null;

        if (hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.pathname.includes("/embed/")) {
          return url; // Already an embed URL
        } else {
          videoId = urlObj.searchParams.get("v");
        }

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Vimeo
      if (hostname.includes("vimeo.com")) {
        const videoId = urlObj.pathname.split("/").filter(Boolean).pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }

      // Return original URL if not YouTube/Vimeo (assume direct video URL)
      return url;
    } catch {
      return url; // If URL parsing fails, return as-is
    }
  };

  // Check if URL is from YouTube/Vimeo (needs iframe)
  const isEmbedVideo = useMemo(() => {
    if (!presentationVideoUrl) return false;
    try {
      const urlObj = new URL(presentationVideoUrl);
      const hostname = urlObj.hostname.toLowerCase();
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("vimeo.com")
      );
    } catch {
      return false;
    }
  }, [presentationVideoUrl]);

  const embedUrl = useMemo(() => {
    return isEmbedVideo ? getEmbedUrl(presentationVideoUrl) : null;
  }, [isEmbedVideo, presentationVideoUrl]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Handle popup open
  const handlePopupOpen = () => {
    if (presentationVideoUrl) {
      setIsPopupOpen(true);
    }
  };

  // Close popup when clicking outside
  const handlePopupClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false);
    }
  };

  // Helper functions - mejorados con fallbacks más robustos
  const displayName =
    professional.fullName || professional.name || "Profesional";
  // Extraer ciudad/ubicación general evitando dirección completa
  const extractCityFromAddress = (address?: string | null): string | null => {
    if (!address || typeof address !== "string") return null;
    const parts = address
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return null;
    // Heurística: tomar desde el final la primera parte sin dígitos y con longitud razonable
    for (let i = parts.length - 1; i >= 0; i--) {
      const seg = parts[i];
      if (!/\d/.test(seg) && seg.length >= 3) {
        return seg;
      }
    }
    // Fallback: primera parte
    return parts[0] || null;
  };
  // Extra: limpiar direcciones sin comas y estimar ciudad del último segmento alfabético
  const extractCityFromLooseAddress = (
    value?: string | null
  ): string | null => {
    if (!value || typeof value !== "string") return null;
    const stopwords = new Set([
      "av",
      "ave",
      "avenida",
      "calle",
      "calz",
      "calzada",
      "mz",
      "lt",
      "lote",
      "casa",
      "col",
      "colonia",
      "fracc",
      "fraccionamiento",
      "hab",
      "u",
      "sur",
      "norte",
      "pte",
      "poniente",
      "oriente",
      "ote",
      "cp",
      "num",
      "no",
      "ii",
      "iii",
      "iv",
      "vi",
      "vii",
      "viii",
      "ix",
      "x",
    ]);
    const tokens = value
      .replace(/[.#\-_/]/g, " ")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);
    // Filtrar tokens con dígitos o muy cortos o stopwords
    const alphaTokens = tokens.filter(
      (t) => !/\d/.test(t) && t.length > 2 && !stopwords.has(t.toLowerCase())
    );
    if (!alphaTokens.length) return null;
    // Tomar el último token alfabético como ciudad estimada
    const candidate = alphaTokens[alphaTokens.length - 1];
    // Capitalizar primera letra
    return candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
  };
  const displayImageInitial =
    professional.profileImage ||
    (professional as any)?.foto_perfil ||
    (professional as any)?.imagen_perfil ||
    null; // Fallbacks a campos alternos
  // Imagen a mostrar en componentes secundarios (avatar/resumen): prioriza URL resuelta
  const displayImage = profileImageUrl || displayImageInitial || null;
  // Ciudad a mostrar en etiquetas públicas (no dirección completa)
  const rawCity =
    (professional as any)?.ciudad ||
    professional.city ||
    (professional as any)?.municipio ||
    (professional as any)?.provincia ||
    null;
  const fallbackFromAddress = extractCityFromAddress(
    (professional as any)?.direccion ||
      (professional as any)?.domicilio_consultorio ||
      ""
  );
  const cityLabel = (() => {
    if (typeof rawCity === "string" && rawCity.trim().length > 0) {
      const hasComma = rawCity.includes(",");
      const hasDigits = /\d/.test(rawCity);
      // Si parece una dirección (comas o números), extraer ciudad
      if (hasComma || hasDigits) {
        return (
          extractCityFromAddress(rawCity) ||
          extractCityFromLooseAddress(rawCity) ||
          extractCityFromLooseAddress(fallbackFromAddress || "") ||
          fallbackFromAddress ||
          "Ubicación no especificada"
        );
      }
      // Si es una palabra/segmento corto, usarlo
      return rawCity.trim();
    }
    return (
      extractCityFromLooseAddress(fallbackFromAddress || "") ||
      fallbackFromAddress ||
      "Ubicación no especificada"
    );
  })();
  console.log("[ProfessionalPageClient] city label sources:", {
    rawCity,
    fallbackFromAddress,
    cityLabel,
  });
  const displaySpecialty = professional.specialty || "Especialista";
  const displayPrice = professional.tarifaPorHora || 0;
  const displayBio =
    professional.bio ||
    `¡Hola! Soy ${
      displayName.split(" ")[0]
    }, ${displaySpecialty.toLowerCase()}.`;

  // Intentar cargar foto de perfil desde API si no vino en el objeto
  useEffect(() => {
    let cancelled = false;
    const tryFetchImage = async () => {
      console.log("[ProfessionalPageClient] image bootstrap", {
        initialFromProps: {
          profileImage: professional.profileImage,
          foto_perfil: (professional as any)?.foto_perfil,
          imagen_perfil: (professional as any)?.imagen_perfil,
        },
      });
      if (displayImageInitial) {
        console.log(
          "[ProfessionalPageClient] using initial image URL",
          displayImageInitial
        );
        setProfileImageUrl(displayImageInitial);
        return;
      }
      try {
        const apiBaseUrl = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        ).replace(/\/$/, "");
        const idProfesional =
          (professional as any)?.id_profesional ||
          (professional as any)?.id ||
          professional.id;
        if (!idProfesional) return;
        const endpoint = `${apiBaseUrl}/profesionales/${idProfesional}/foto-perfil`;
        console.log("[ProfessionalPageClient] fetching photo from", endpoint);
        const res = await fetch(endpoint);
        console.log(
          "[ProfessionalPageClient] photo response status",
          res.status
        );
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          console.log("[ProfessionalPageClient] photo payload", data);
          const url =
            data?.data?.imageUrl || data?.imageUrl || data?.url || null;
          if (!cancelled && url) {
            console.log("[ProfessionalPageClient] resolved photo URL", url);
            setProfileImageUrl(url);
            return;
          }
        } else if (res.status === 401) {
          console.warn(
            "[ProfessionalPageClient] photo endpoint returned 401. Retrying with BACKEND URL (public)..."
          );
          const backendBase = (
            process.env.NEXT_PUBLIC_BACKEND_URL || ""
          ).replace(/\/$/, "");
          if (backendBase) {
            const altEndpoint = `${backendBase}/profesionales/${idProfesional}/foto-perfil`;
            console.log(
              "[ProfessionalPageClient] fetching photo from backend directly:",
              altEndpoint
            );
            const res2 = await fetch(altEndpoint);
            console.log(
              "[ProfessionalPageClient] backend photo response status",
              res2.status
            );
            if (res2.ok) {
              const data2 = await res2.json().catch(() => ({}));
              console.log(
                "[ProfessionalPageClient] backend photo payload",
                data2
              );
              const url2 =
                data2?.data?.imageUrl || data2?.imageUrl || data2?.url || null;
              if (!cancelled && url2) {
                console.log(
                  "[ProfessionalPageClient] resolved photo URL (backend)",
                  url2
                );
                setProfileImageUrl(url2);
                return;
              }
            }
          } else {
            console.warn(
              "[ProfessionalPageClient] NEXT_PUBLIC_BACKEND_URL not set. Skipping backend fallback."
            );
          }
        } else {
          console.warn(
            "[ProfessionalPageClient] photo endpoint not OK. status:",
            res.status
          );
        }
      } catch (e) {
        console.warn("[ProfessionalPageClient] error fetching image", e);
      }
    };
    tryFetchImage();
    return () => {
      cancelled = true;
    };
  }, [professional]);

  // Estado para almacenar todos los horarios del profesional (sin filtrar)
  const [todosLosHorarios, setTodosLosHorarios] = useState<
    Array<{
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      tipo_atencion: string | null;
    }>
  >([]);

  // Cargar TODOS los horarios del profesional al inicio (sin filtrar por tipo_atencion)
  useEffect(() => {
    if (professional.id) {
      setLoadingHorarios(true);
      const fetchTodosLosHorarios = async () => {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          // Cargar todos los horarios sin filtrar por tipo_atencion
          // NOTA: La ruta correcta es /api/disponibilidad-horarios (plural)
          const url = `${apiBaseUrl}/disponibilidad-horarios/public/profesional/${professional.id}`;
          console.log(
            `[ProfessionalPageClient] Cargando horarios desde: ${url}`
          );

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(
              `[ProfessionalPageClient] Respuesta completa de la API:`,
              data
            );

            if (data.success && data.data?.disponibilidad_horarios) {
              const horarios = data.data.disponibilidad_horarios;
              console.log(
                `[ProfessionalPageClient] ✅ ${horarios.length} horarios cargados:`,
                horarios
              );
              setTodosLosHorarios(horarios);

              // Debug: mostrar tipos de atención encontrados
              const tiposEncontrados = new Set(
                horarios.map((h: any) => h.tipo_atencion).filter(Boolean)
              );
              console.log(
                `[ProfessionalPageClient] Tipos de atención encontrados en horarios:`,
                Array.from(tiposEncontrados)
              );
            } else {
              console.warn(
                "[ProfessionalPageClient] ⚠️ No se encontraron horarios en la respuesta:",
                data
              );
              setTodosLosHorarios([]);
            }
          } else {
            const errorText = await response.text();
            console.error(
              `[ProfessionalPageClient] ❌ Error al cargar todos los horarios (${response.status}):`,
              errorText
            );
            setTodosLosHorarios([]);
          }
        } catch (error) {
          console.error(
            "[ProfessionalPageClient] Error al cargar todos los horarios:",
            error
          );
          setTodosLosHorarios([]);
        } finally {
          setLoadingHorarios(false);
        }
      };

      fetchTodosLosHorarios();
    }
  }, [professional.id]);

  // Determinar tipos de atención disponibles basándose en los horarios REALES del profesional
  const tiposAtencionDisponibles = useMemo(() => {
    const tipos: Array<"presencial" | "en_linea" | "a_domicilio"> = [];

    console.log(
      `[ProfessionalPageClient] Determinando tipos disponibles. Total horarios: ${todosLosHorarios.length}`
    );

    // Verificar qué tipos de atención tienen horarios configurados
    const tiposEnHorarios = new Set<string>();
    todosLosHorarios.forEach((horario) => {
      if (horario.tipo_atencion) {
        tiposEnHorarios.add(horario.tipo_atencion);
        console.log(
          `[ProfessionalPageClient] Horario encontrado con tipo: ${horario.tipo_atencion} (${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin})`
        );
      } else {
        console.warn(
          `[ProfessionalPageClient] ⚠️ Horario sin tipo_atencion:`,
          horario
        );
      }
    });

    console.log(
      `[ProfessionalPageClient] Tipos únicos encontrados en horarios:`,
      Array.from(tiposEnHorarios)
    );

    // Agregar tipos basándose en los horarios encontrados
    if (tiposEnHorarios.has("presencial")) {
      tipos.push("presencial");
    }
    if (tiposEnHorarios.has("en_linea")) {
      tipos.push("en_linea");
    }
    if (tiposEnHorarios.has("a_domicilio")) {
      tipos.push("a_domicilio");
    }

    console.log(
      `[ProfessionalPageClient] Tipos de atención disponibles determinados:`,
      tipos
    );

    // Fallback: Si no hay horarios con tipo_atencion, usar modalidadCita/modoAtencion del profesional
    if (tipos.length === 0) {
      const hasPresencial =
        professional.modalidadCita?.some((m: string) =>
          m.toLowerCase().includes("presencial")
        ) ||
        professional.modoAtencion?.some((m: string) =>
          m.toLowerCase().includes("presencial")
        ) ||
        false;

      const hasOnline =
        professional.modalidadCita?.some(
          (m: string) =>
            m.toLowerCase().includes("online") ||
            m.toLowerCase().includes("línea")
        ) ||
        professional.modoAtencion?.some(
          (m: string) =>
            m.toLowerCase().includes("online") ||
            m.toLowerCase().includes("línea")
        ) ||
        false;

      const hasADomicilio =
        professional.modalidadCita?.some((m: string) =>
          m.toLowerCase().includes("domicilio")
        ) ||
        professional.modoAtencion?.some((m: string) =>
          m.toLowerCase().includes("domicilio")
        ) ||
        false;

      if (hasPresencial) tipos.push("presencial");
      if (hasOnline) tipos.push("en_linea");
      if (hasADomicilio) tipos.push("a_domicilio");
    }

    return tipos;
  }, [todosLosHorarios, professional.modalidadCita, professional.modoAtencion]);

  // Auto-seleccionar el primer tipo disponible cuando se selecciona un precio
  useEffect(() => {
    if (
      selectedPrice &&
      tiposAtencionDisponibles.length > 0 &&
      !selectedTipoAtencion
    ) {
      setSelectedTipoAtencion(tiposAtencionDisponibles[0]);
    }
    // Si se deselecciona el precio, limpiar también el tipo de atención
    if (!selectedPrice) {
      setSelectedTipoAtencion(null);
    }
  }, [selectedPrice, tiposAtencionDisponibles.length, selectedTipoAtencion]);

  // Función helper para normalizar nombres de días (manejar acentos y mayúsculas)
  const normalizarDia = (dia: string): string => {
    return dia
      .toLowerCase()
      .trim()
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u");
  };

  // Mapeo de días en español a índices (usando nombres normalizados)
  const diasMap: { [key: string]: number } = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
  };

  // Filtrar horarios según el tipo de atención seleccionado
  const horariosCargados = useMemo(() => {
    if (!selectedTipoAtencion) {
      console.log(
        `[ProfessionalPageClient] No hay tipo de atención seleccionado, retornando array vacío`
      );
      return [];
    }
    // Filtrar todosLosHorarios por el tipo de atención seleccionado
    const filtrados = todosLosHorarios.filter(
      (horario) => horario.tipo_atencion === selectedTipoAtencion
    );
    console.log(
      `[ProfessionalPageClient] Horarios filtrados para tipo "${selectedTipoAtencion}": ${filtrados.length} de ${todosLosHorarios.length} totales`
    );
    console.log(`[ProfessionalPageClient] Horarios filtrados:`, filtrados);
    return filtrados;
  }, [todosLosHorarios, selectedTipoAtencion]);

  // Extraer horarios disponibles del profesional filtrados por tipo de atención seleccionado
  const horariosDisponibles = useMemo(() => {
    // Cambiar estructura para soportar múltiples rangos por día
    const horarios: { [key: number]: Array<{ desde: string; hasta: string }> } = {};

    // Si hay horarios cargados (ya filtrados por tipo de atención), usarlos
    if (horariosCargados.length > 0) {
      console.log(
        `[ProfessionalPageClient] Procesando ${horariosCargados.length} horarios para tipo ${selectedTipoAtencion}`
      );

      horariosCargados.forEach((horario) => {
        const diaNormalizado = normalizarDia(horario.dia_semana);
        const diaIndex = diasMap[diaNormalizado];

        if (diaIndex !== undefined) {
          // Convertir hora de formato 24h (HH:MM:SS) a formato legible
          const desde = horario.hora_inicio.substring(0, 5); // "09:00:00" -> "09:00"
          const hasta = horario.hora_fin.substring(0, 5); // "18:00:00" -> "18:00"

          console.log(
            `[ProfessionalPageClient] Horario encontrado: ${horario.dia_semana} (${diaNormalizado}) -> índice ${diaIndex}, ${desde} - ${hasta}`
          );

          // Agregar el rango al array de rangos del día (soporta múltiples rangos)
          if (!horarios[diaIndex]) {
            horarios[diaIndex] = [];
          }
          
          // Verificar si el rango ya existe para evitar duplicados
          const rangoExiste = horarios[diaIndex].some(
            (r) => r.desde === desde && r.hasta === hasta
          );
          
          if (!rangoExiste) {
            horarios[diaIndex].push({ desde, hasta });
          }
        } else {
          console.warn(
            `[ProfessionalPageClient] ⚠️ Día no reconocido: "${horario.dia_semana}" (normalizado: "${diaNormalizado}")`
          );
        }
      });

      console.log(
        `[ProfessionalPageClient] Horarios disponibles procesados:`,
        horarios
      );
    } else if (!selectedTipoAtencion) {
      // Fallback: usar disponibilidadRaw del objeto professional solo si no hay tipo seleccionado
      const disponibilidadRaw = (professional as any).disponibilidadRaw;

      if (
        disponibilidadRaw &&
        disponibilidadRaw.dias &&
        disponibilidadRaw.horario
      ) {
        const desde =
          disponibilidadRaw.horario.desde ||
          disponibilidadRaw.horario.inicio ||
          "09:00";
        const hasta =
          disponibilidadRaw.horario.hasta ||
          disponibilidadRaw.horario.fin ||
          "18:00";

        disponibilidadRaw.dias.forEach((dia: string) => {
          const diaLower = dia.toLowerCase().trim();
          const diaIndex = diasMap[diaLower];
          if (diaIndex !== undefined) {
            if (!horarios[diaIndex]) {
              horarios[diaIndex] = [];
            }
            // Verificar si el rango ya existe para evitar duplicados
            const rangoExiste = horarios[diaIndex].some(
              (r) => r.desde === desde && r.hasta === hasta
            );
            if (!rangoExiste) {
              horarios[diaIndex].push({ desde, hasta });
            }
          }
        });
      }
    }

    return horarios;
  }, [horariosCargados, professional, selectedTipoAtencion]);

  // Función helper para crear fecha UTC que representa la hora seleccionada en España
  // IMPORTANTE: El usuario selecciona la hora pensando que es hora de España
  // Necesitamos crear una fecha UTC que cuando MySQL la guarde y se muestre, sea la hora correcta
  const crearFechaEspanaUTC = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
  ): Date => {
    // Crear una fecha de referencia en UTC y ver qué hora muestra en España
    // Luego calcular qué hora UTC necesitamos para que en España sea la hora seleccionada
    const fechaReferenciaUTC = new Date(Date.UTC(year, month, day, 12, 0, 0)); // Mediodía UTC

    // Obtener la hora en España para esta fecha de referencia
    const horaReferenciaEspana = fechaReferenciaUTC.toLocaleString("en-US", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [horaRefEspanaStr] = horaReferenciaEspana.split(":");
    const horaRefEspana = parseInt(horaRefEspanaStr);

    // Calcular el offset: diferencia entre hora UTC de referencia (12:00) y hora en España
    // Si España muestra 13:00 cuando UTC es 12:00, offset es +1 hora
    const offsetHoras = horaRefEspana - 12;

    // Calcular la hora UTC que necesitamos para que en España sea la hora seleccionada
    // Si seleccionas 9:00 AM España y offset es +1, necesitamos 9 - 1 = 8:00 AM UTC
    const horaUTC = hour - offsetHoras;

    // Manejar casos donde la hora UTC podría ser negativa o mayor a 23
    let horaUTCFinal = horaUTC;
    let diaFinal = day;
    if (horaUTC < 0) {
      horaUTCFinal = 24 + horaUTC;
      diaFinal = day - 1;
    } else if (horaUTC >= 24) {
      horaUTCFinal = horaUTC - 24;
      diaFinal = day + 1;
    }

    // Crear la fecha UTC final
    return new Date(Date.UTC(year, month, diaFinal, horaUTCFinal, minute, 0));
  };

  // Función helper para normalizar fechas a UTC para comparación precisa
  const normalizeDateToUTC = (dateInput: string | Date): Date => {
    if (dateInput instanceof Date) {
      // Si ya es un Date, crear uno nuevo en UTC para evitar problemas de zona horaria
      return new Date(
        Date.UTC(
          dateInput.getUTCFullYear(),
          dateInput.getUTCMonth(),
          dateInput.getUTCDate(),
          dateInput.getUTCHours(),
          dateInput.getUTCMinutes(),
          dateInput.getUTCSeconds()
        )
      );
    }

    const dateStr = String(dateInput);

    // Si ya tiene 'Z' o '+', es ISO con zona horaria, parsear directamente
    if (
      dateStr.includes("Z") ||
      dateStr.includes("+") ||
      dateStr.includes("-", 10)
    ) {
      return new Date(dateStr);
    }

    // Si es formato MySQL DATETIME (YYYY-MM-DD HH:MM:SS), tratarlo como UTC
    if (dateStr.includes(" ") && !dateStr.includes("T")) {
      // Formato: "2024-01-15 10:00:00" -> "2024-01-15T10:00:00Z"
      return new Date(dateStr.replace(" ", "T") + "Z");
    }

    // Si tiene 'T' pero no 'Z', agregar 'Z' para indicar UTC
    if (
      dateStr.includes("T") &&
      !dateStr.includes("Z") &&
      !dateStr.includes("+")
    ) {
      return new Date(dateStr + "Z");
    }

    // Fallback: parsear como está
    return new Date(dateStr);
  };

  // Convertir hora a minutos desde medianoche
  function timeToMinutes(timeStr: string): number {
    const cleaned = timeStr.trim().toUpperCase();

    if (cleaned.includes("AM") || cleaned.includes("PM")) {
      const [time, period] = cleaned.split(/\s*(AM|PM)/);
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + (minutes || 0);

      if (period === "PM" && hours !== 12) {
        totalMinutes += 12 * 60;
      }
      if (period === "AM" && hours === 12) {
        totalMinutes -= 12 * 60;
      }

      return totalMinutes;
    }

    const [hours, minutes] = cleaned.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  }

  // Convertir minutos a formato "HH:MM AM/PM"
  function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")} ${period}`;
  }

  // Generar días disponibles para el mes actual
  // Esta función verifica si cada día tiene slots disponibles considerando las citas ocupadas
  const getAvailableDays = useMemo(() => {
    return () => {
      console.log(
        `[ProfessionalPageClient] getAvailableDays - Tipo seleccionado: ${selectedTipoAtencion}, Horarios disponibles:`,
        horariosDisponibles
      );

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days: Array<{
        date: Date;
        dayName: string;
        dayNumber: number;
        available: boolean;
        isToday: boolean;
        isPast: boolean;
        hasAvailableSlots: boolean;
      }> = [];

      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isAvailable = horariosDisponibles[dayOfWeek] !== undefined;

        if (isAvailable) {
          console.log(
            `[ProfessionalPageClient] Día ${day} (${dayNames[dayOfWeek]}) tiene horario disponible:`,
            horariosDisponibles[dayOfWeek]
          );
        }
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();

        // Verificar si hay slots disponibles para este día
        // Solo verificar si hay un precio seleccionado (para saber la duración)
        let hasAvailableSlots = false;
        if (isAvailable && !isPast) {
          if (selectedPrice) {
            // Si hay precio seleccionado, verificar slots ocupados
            // Procesar todos los rangos horarios del día
            const rangosDelDia = horariosDisponibles[dayOfWeek];
            if (rangosDelDia && rangosDelDia.length > 0) {
              const duracionMinutos = selectedPrice.duracion
                ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
                : 60;

              // Verificar si hay al menos un slot disponible en algún rango
              for (const horario of rangosDelDia) {
                const desde = timeToMinutes(horario.desde);
                const hasta = timeToMinutes(horario.hasta);
                let currentTime = desde;
                while (currentTime + duracionMinutos <= hasta) {
                  const hour = Math.floor(currentTime / 60);
                  const minute = currentTime % 60;

                  // Crear fecha UTC interpretando la hora como hora de España
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const day = date.getDate();
                const slotDateTimeUTC = crearFechaEspanaUTC(
                  year,
                  month,
                  day,
                  hour,
                  minute
                );
                const slotEndUTC = new Date(
                  slotDateTimeUTC.getTime() + duracionMinutos * 60000
                );

                const isOccupied = existingAppointments.some((apt) => {
                  // Usar dateTimeUTC si está disponible, sino normalizar dateTime
                  const aptStart =
                    apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
                  const aptEnd = new Date(
                    aptStart.getTime() +
                      (apt.duration || duracionMinutos) * 60000
                  );

                  // Verificar solapamiento
                  return (
                    (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
                    (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
                    (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd)
                  );
                });

                  if (!isOccupied) {
                    hasAvailableSlots = true;
                    break; // Salir del loop de slots
                  }

                  currentTime += duracionMinutos;
                }
                
                // Si ya encontramos un slot disponible, salir del loop de rangos
                if (hasAvailableSlots) break;
              }
            }
          } else {
            // Si no hay precio seleccionado, mostrar todos los días disponibles
            // (el usuario seleccionará el precio después)
            hasAvailableSlots = true;
          }
        }

        days.push({
          date,
          dayName: dayNames[dayOfWeek],
          dayNumber: day,
          available: isAvailable && !isPast && hasAvailableSlots,
          isToday,
          isPast,
          hasAvailableSlots,
        });
      }

      return days.filter((d) => d.available);
    };
  }, [
    currentMonth,
    horariosDisponibles,
    selectedPrice,
    existingAppointments,
    timeToMinutes,
  ]);

  // Generar slots de tiempo para la fecha seleccionada
  // Ahora considera los horarios específicos del tipo de atención seleccionado
  const generateTimeSlots = (
    date: Date
  ): Array<{ time: string; displayTime: string; available: boolean }> => {
    if (!selectedPrice || !date || !selectedTipoAtencion) return [];

    const dayOfWeek = date.getDay();

    // Verificar si la fecha seleccionada es hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0);
    const isToday = selectedDateOnly.getTime() === today.getTime();
    const currentTime = new Date();

    // Obtener el nombre del día en español
    const dayNames = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const diaSemanaNombre = dayNames[dayOfWeek];

    // Buscar horarios específicos para este día y tipo de atención
    const diaSemanaNormalizado = normalizarDia(diaSemanaNombre);
    const horariosDelDia = horariosCargados.filter((h) => {
      const diaHorarioNormalizado = normalizarDia(h.dia_semana);
      const coincide =
        diaHorarioNormalizado === diaSemanaNormalizado &&
        h.tipo_atencion === selectedTipoAtencion;
      if (coincide) {
        console.log(
          `[ProfessionalPageClient] Horario encontrado para ${diaSemanaNombre}: ${h.hora_inicio} - ${h.hora_fin}`
        );
      }
      return coincide;
    });

    console.log(
      `[ProfessionalPageClient] Horarios del día ${diaSemanaNombre} (${diaSemanaNormalizado}) para tipo ${selectedTipoAtencion}: ${horariosDelDia.length}`
    );
    console.log(
      `[ProfessionalPageClient] ¿Es hoy? ${isToday}, Hora actual: ${currentTime.getHours()}:${currentTime.getMinutes()}`
    );

    // Si no hay horarios específicos para este día y tipo, usar el horario general
    const rangosDelDia = horariosDisponibles[dayOfWeek];
    if (!rangosDelDia || rangosDelDia.length === 0) {
      // Si no hay rangos en horariosDisponibles, usar horariosDelDia (horarios específicos cargados)
      if (horariosDelDia.length === 0) return [];
    }

    const slots: Array<{
      time: string;
      displayTime: string;
      available: boolean;
    }> = [];

    const duracionMinutos = selectedPrice.duracion
      ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
      : 60;

    // Si hay horarios específicos del día, generar slots para cada rango
    if (horariosDelDia.length > 0) {
      horariosDelDia.forEach((horarioDelDia) => {
        const desde = timeToMinutes(horarioDelDia.hora_inicio.substring(0, 5));
        const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
        let currentTime = desde;

        while (currentTime + duracionMinutos <= hasta) {
          const slotTime = minutesToTime(currentTime);
          const hour = Math.floor(currentTime / 60);
          const minute = currentTime % 60;

          // Crear fecha UTC interpretando la hora como hora de España
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const slotDateTimeUTC = crearFechaEspanaUTC(
            year,
            month,
            day,
            hour,
            minute
          );
          const slotEndUTC = new Date(
            slotDateTimeUTC.getTime() + duracionMinutos * 60000
          );

          // Validación: Si es hoy, filtrar horas que ya pasaron
          let isPastTime = false;
          if (isToday) {
            // Obtener hora actual en España
            const now = new Date();
            const nowInSpain = new Date(
              now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
            );
            const nowMinutes =
              nowInSpain.getHours() * 60 + nowInSpain.getMinutes();

            // El slot está en el pasado si sus minutos son menores a los minutos actuales
            isPastTime = currentTime < nowMinutes;

            if (isPastTime) {
              const nowHour = Math.floor(nowMinutes / 60);
              const nowMin = nowMinutes % 60;
              console.log(
                `[ProfessionalPageClient] Slot ${slotTime} filtrado porque ya pasó (hora actual en España: ${nowHour}:${nowMin
                  .toString()
                  .padStart(2, "0")})`
              );
            }
          }

          const isOccupied = existingAppointments.some((apt) => {
            // Usar dateTimeUTC si está disponible, sino normalizar dateTime
            const aptStart =
              apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
            const aptEnd = new Date(
              aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
            );

            // Verificar solapamiento: dos intervalos se solapan si:
            // - El inicio del slot está dentro del intervalo de la cita, O
            // - El fin del slot está dentro del intervalo de la cita, O
            // - El slot contiene completamente la cita
            const hasOverlap =
              (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
              (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
              (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd);

            if (hasOverlap) {
              console.log(
                `[ProfessionalPageClient] 🔴 Slot OCUPADO: ${slotTime} (${slotDateTimeUTC.toISOString()}) se solapa con cita ${
                  apt.id
                } (${aptStart.toISOString()} - ${aptEnd.toISOString()})`
              );
              console.log(
                `[ProfessionalPageClient] Detalles del solapamiento:`,
                {
                  slotStart: slotDateTimeUTC.toISOString(),
                  slotEnd: slotEndUTC.toISOString(),
                  aptStart: aptStart.toISOString(),
                  aptEnd: aptEnd.toISOString(),
                  aptDuration: apt.duration || duracionMinutos,
                  condition1:
                    slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd,
                  condition2: slotEndUTC > aptStart && slotEndUTC <= aptEnd,
                  condition3:
                    slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd,
                }
              );
            }

            return hasOverlap;
          });

          const timeStr = `${Math.floor(currentTime / 60)
            .toString()
            .padStart(2, "0")}:${(currentTime % 60)
            .toString()
            .padStart(2, "0")}`;

          // Evitar duplicados y filtrar horas pasadas
          if (!slots.some((s) => s.time === timeStr) && !isPastTime) {
            slots.push({
              time: timeStr,
              displayTime: slotTime,
              available: !isOccupied,
            });
          }

          currentTime += duracionMinutos;
        }
      });
    } else if (rangosDelDia && rangosDelDia.length > 0) {
      // Fallback: usar rangos de horariosDisponibles si no hay horarios específicos del día
      rangosDelDia.forEach((horario) => {
        const desde = timeToMinutes(horario.desde);
        const hasta = timeToMinutes(horario.hasta);
        let currentTime = desde;

      while (currentTime + duracionMinutos <= hasta) {
        const slotTime = minutesToTime(currentTime);
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;

        // Crear fecha UTC interpretando la hora como hora de España
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const slotDateTimeUTC = crearFechaEspanaUTC(
          year,
          month,
          day,
          hour,
          minute
        );
        const slotEndUTC = new Date(
          slotDateTimeUTC.getTime() + duracionMinutos * 60000
        );

        // Validación: Si es hoy, filtrar horas que ya pasaron
        let isPastTime = false;
        if (isToday) {
          // Obtener hora actual en España
          const now = new Date();
          const nowInSpain = new Date(
            now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
          );
          const nowMinutes =
            nowInSpain.getHours() * 60 + nowInSpain.getMinutes();

          // El slot está en el pasado si sus minutos son menores a los minutos actuales
          isPastTime = currentTime < nowMinutes;

          if (isPastTime) {
            const nowHour = Math.floor(nowMinutes / 60);
            const nowMin = nowMinutes % 60;
            console.log(
              `[ProfessionalPageClient] Slot ${slotTime} filtrado porque ya pasó (hora actual en España: ${nowHour}:${nowMin
                .toString()
                .padStart(2, "0")})`
            );
          }
        }

        const isOccupied = existingAppointments.some((apt) => {
          // Usar dateTimeUTC si está disponible, sino normalizar dateTime
          const aptStart = apt.dateTimeUTC || normalizeDateToUTC(apt.dateTime);
          const aptEnd = new Date(
            aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
          );

          // Verificar solapamiento: dos intervalos se solapan si:
          // - El inicio del slot está dentro del intervalo de la cita, O
          // - El fin del slot está dentro del intervalo de la cita, O
          // - El slot contiene completamente la cita
          const hasOverlap =
            (slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd) ||
            (slotEndUTC > aptStart && slotEndUTC <= aptEnd) ||
            (slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd);

          if (hasOverlap) {
            console.log(
              `[ProfessionalPageClient] 🔴 Slot OCUPADO: ${slotTime} (${slotDateTimeUTC.toISOString()}) se solapa con cita ${
                apt.id
              } (${aptStart.toISOString()} - ${aptEnd.toISOString()})`
            );
            console.log(`[ProfessionalPageClient] Detalles del solapamiento:`, {
              slotStart: slotDateTimeUTC.toISOString(),
              slotEnd: slotEndUTC.toISOString(),
              aptStart: aptStart.toISOString(),
              aptEnd: aptEnd.toISOString(),
              aptDuration: apt.duration || duracionMinutos,
              condition1:
                slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd,
              condition2: slotEndUTC > aptStart && slotEndUTC <= aptEnd,
              condition3: slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd,
            });
          }

          return hasOverlap;
        });

        // Solo agregar el slot si no es una hora pasada
        if (!isPastTime) {
          slots.push({
            time: `${Math.floor(currentTime / 60)
              .toString()
              .padStart(2, "0")}:${(currentTime % 60)
              .toString()
              .padStart(2, "0")}`,
            displayTime: slotTime,
            available: !isOccupied,
          });
        }

        currentTime += duracionMinutos;
      }
      });
    }

    // Ordenar slots por hora
    slots.sort((a, b) => {
      const timeA = timeToMinutes(a.time);
      const timeB = timeToMinutes(b.time);
      return timeA - timeB;
    });

    return slots;
  };

  // Cargar citas ocupadas del mes completo cuando cambia el mes o el profesional
  useEffect(() => {
    if (professional.id && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          // Calcular rango del mes visible
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);

          // Importar citasService
          const { citasService } = await import("@/services/api/citas");

          // Obtener citas ocupadas del mes
          const response = await citasService.getCitasOcupadas(
            professional.id,
            inicioMes.toISOString(),
            finMes.toISOString()
          );

          // Manejar estructura anidada: response.data.data.citas o response.data.citas
          let citasData = null;
          if (response.success && response.data) {
            const data = response.data as any; // Usar 'as any' para manejar estructuras anidadas
            // Intentar acceder a response.data.data.citas primero (estructura anidada)
            if (
              data.data &&
              data.data.citas &&
              Array.isArray(data.data.citas)
            ) {
              citasData = data.data.citas;
            }
            // Si no, intentar response.data.citas (estructura directa)
            else if (data.citas && Array.isArray(data.citas)) {
              citasData = data.citas;
            }
          }

          if (citasData && citasData.length > 0) {
            // Convertir citas ocupadas al formato esperado por el componente
            // Normalizar fechas a UTC para comparación precisa
            const appointments = citasData.map((cita: any) => {
              const fechaInicioUTC = normalizeDateToUTC(cita.fecha_inicio);
              const fechaFinUTC = normalizeDateToUTC(cita.fecha_fin);
              const duration = Math.round(
                (fechaFinUTC.getTime() - fechaInicioUTC.getTime()) / 60000
              );

              return {
                id: String(cita.id_cita),
                dateTime: fechaInicioUTC.toISOString(), // Guardar en formato ISO UTC
                dateTimeUTC: fechaInicioUTC, // Guardar objeto Date UTC para comparación rápida
                duration,
                estado: cita.estado,
              };
            });
            setExistingAppointments(appointments);
            console.log(
              `[ProfessionalPageClient] ✅ Citas ocupadas cargadas: ${appointments.length}`,
              appointments.map((apt) => ({
                id: apt.id,
                dateTime: apt.dateTime,
                dateTimeUTC: apt.dateTimeUTC?.toISOString(),
                duration: apt.duration,
                estado: apt.estado,
                // Mostrar también en hora de España para referencia
                fechaEspana: apt.dateTimeUTC
                  ? new Date(apt.dateTimeUTC).toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null,
              }))
            );
          } else {
            console.warn(
              "[ProfessionalPageClient] No se encontraron citas ocupadas o la estructura de respuesta es incorrecta:",
              response
            );
            setExistingAppointments([]);
          }
        } catch (error) {
          console.error("Error loading occupied appointments:", error);
          setExistingAppointments([]);
        } finally {
          setLoadingAppointments(false);
        }
      };

      fetchOccupiedAppointments();
    }
  }, [currentMonth, professional.id]);

  const availableDays = useMemo(() => {
    const getDays = getAvailableDays;
    return getDays();
  }, [getAvailableDays]);

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [
    selectedDate,
    selectedPrice,
    existingAppointments,
    horariosDisponibles,
    horariosCargados,
    selectedTipoAtencion,
  ]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const handleDateSelect = (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;
    const dayOfWeek = date.getDay();
    if (!horariosDisponibles[dayOfWeek]) return;

    // Verificar que el día tenga slots disponibles antes de seleccionarlo
    if (!selectedPrice) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      return;
    }

    // Generar slots temporalmente para verificar si hay alguno disponible
    const tempSlots = generateTimeSlots(date);
    const hasAvailableSlots = tempSlots.some((slot) => slot.available);

    if (!hasAvailableSlots) {
      alert(
        "Esta fecha no tiene horarios disponibles. Por favor, selecciona otra fecha."
      );
      return;
    }

    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedPrice || !selectedDate || !selectedTimeSlot) return;

    // Validar que se haya seleccionado un tipo de atención si hay tipos disponibles
    if (tiposAtencionDisponibles.length > 0 && !selectedTipoAtencion) {
      alert(
        "Por favor, selecciona un tipo de atención antes de confirmar la cita."
      );
      return;
    }

    // Validar dirección cuando es a domicilio
    if (
      selectedTipoAtencion === "a_domicilio" &&
      (!direccionDomicilio || direccionDomicilio.trim() === "")
    ) {
      alert(
        "Por favor, proporciona tu dirección para la atención a domicilio."
      );
      return;
    }

    // Verificar autenticación
    if (!isAuthenticated || !user) {
      router.push(
        "/iniciar-sesion?redirect=" +
          encodeURIComponent(window.location.pathname)
      );
      return;
    }

    setIsCreatingAppointment(true);

    try {
      // Calcular fecha de inicio y fin en zona horaria de España (Europe/Madrid)
      const [hours, minutes] = selectedTimeSlot.split(":").map(Number);

      // Crear fecha interpretando la hora como hora local de España
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      // Función helper para crear fecha UTC que representa la hora seleccionada en España
      // IMPORTANTE: El usuario selecciona la hora pensando que es hora de España
      // Necesitamos crear una fecha UTC que cuando MySQL la guarde y se muestre, sea la hora correcta
      // Método más directo: usar una fecha de prueba para calcular el offset exacto
      const crearFechaEspana = (
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number
      ) => {
        // Crear una fecha que represente la hora seleccionada en España (Europe/Madrid)
        // España está en UTC+1 (o UTC+2 en verano), así que necesitamos calcular el offset correcto

        // Método: crear una fecha de referencia en UTC y ver qué hora muestra en España
        // Luego calcular qué hora UTC necesitamos para que en España sea la hora seleccionada
        const fechaReferenciaUTC = new Date(
          Date.UTC(year, month, day, 12, 0, 0)
        ); // Mediodía UTC

        // Obtener la hora en España para esta fecha de referencia
        const horaReferenciaEspana = fechaReferenciaUTC.toLocaleString(
          "en-US",
          {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        );
        const [horaRefEspanaStr] = horaReferenciaEspana.split(":");
        const horaRefEspana = parseInt(horaRefEspanaStr);

        // Calcular el offset: diferencia entre hora UTC de referencia (12:00) y hora en España
        // Si España muestra 13:00 cuando UTC es 12:00, offset es +1 hora
        const offsetHoras = horaRefEspana - 12;

        // Calcular la hora UTC que necesitamos para que en España sea la hora seleccionada
        // Si seleccionas 9:00 AM España y offset es +1, necesitamos 9 - 1 = 8:00 AM UTC
        const horaUTC = hour - offsetHoras;

        // Manejar casos donde la hora UTC podría ser negativa o mayor a 23
        let horaUTCFinal = horaUTC;
        let diaFinal = day;
        if (horaUTC < 0) {
          horaUTCFinal = 24 + horaUTC;
          diaFinal = day - 1;
        } else if (horaUTC >= 24) {
          horaUTCFinal = horaUTC - 24;
          diaFinal = day + 1;
        }

        // Crear la fecha UTC final
        const fechaInicioUTC = new Date(
          Date.UTC(year, month, diaFinal, horaUTCFinal, minute, 0)
        );

        // Verificar que la conversión sea correcta
        const horaVerificacion = fechaInicioUTC.toLocaleString("en-US", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        console.log("[crearFechaEspana] Conversión:", {
          horaSeleccionada: `${hour}:${String(minute).padStart(
            2,
            "0"
          )} (España)`,
          fechaReferenciaUTC: fechaReferenciaUTC.toISOString(),
          horaReferenciaEspana: horaReferenciaEspana,
          offsetHoras: offsetHoras,
          horaUTC: horaUTC,
          horaUTCFinal: horaUTCFinal,
          fechaInicioUTC: fechaInicioUTC.toISOString(),
          horaVerificacionEspana: horaVerificacion,
          coincide:
            horaVerificacion ===
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}`,
        });

        return fechaInicioUTC;
      };

      const fechaInicio = crearFechaEspana(year, month, day, hours, minutes);

      // Calcular fecha de fin según la duración del paquete
      const duracionMinutos = selectedPrice.duracion
        ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
        : 60;
      const fechaFin = new Date(
        fechaInicio.getTime() + duracionMinutos * 60000
      );

      console.log("[handleConfirmAppointment] Fecha seleccionada:", {
        fechaOriginal: selectedDate.toISOString(),
        horaSeleccionada: selectedTimeSlot,
        fechaInicioISO: fechaInicio.toISOString(),
        fechaInicioEspana: fechaInicio.toLocaleString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        fechaFinISO: fechaFin.toISOString(),
        fechaFinEspana: fechaFin.toLocaleString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });

      // Crear la cita con Payment Intent
      const response = await citasService.createCita({
        id_cliente: parseInt(user.id),
        id_profesional: parseInt(professional.id),
        id_precio: selectedPrice.id_precio,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        crear_payment_intent: true,
        moneda: "eur", // Moneda en euros para España
        tipo_atencion: selectedTipoAtencion || undefined, // Tipo de atención seleccionado
        direccion_domicilio:
          selectedTipoAtencion === "a_domicilio"
            ? direccionDomicilio
            : undefined, // Dirección si es a domicilio
      });

      // Log completo de la respuesta para debugging
      console.log("[handleConfirmAppointment] Respuesta completa:", response);
      console.log(
        "[handleConfirmAppointment] response.success:",
        response.success
      );
      console.log("[handleConfirmAppointment] response.data:", response.data);
      console.log(
        "[handleConfirmAppointment] Tipo de response.data:",
        typeof response.data
      );

      if (response.success && response.data) {
        // Verificar que la estructura de la respuesta sea correcta
        const data = response.data;

        // Log detallado de la estructura
        console.log("[handleConfirmAppointment] Estructura de data:", {
          tienePago: !!data.pago,
          tieneRedirectToPayment: !!data.redirectToPayment,
          keys: Object.keys(data),
          dataCompleto: JSON.stringify(data, null, 2),
        });

        // Verificar si la respuesta está envuelta en otra estructura
        // El backend puede devolver: { success: true, data: { pago: {...}, redirectToPayment: {...} } }
        // O el apiClient puede envolverlo: { success: true, data: { success: true, data: { pago: {...} } } }
        let pagoData = data.pago;
        let redirectData = data.redirectToPayment;

        // Si no encontramos los datos directamente, intentar buscar en data.data
        if (!pagoData && (data as any).data) {
          const nestedData = (data as any).data;
          console.log(
            "[handleConfirmAppointment] Buscando en data.data:",
            nestedData
          );
          pagoData = nestedData.pago;
          redirectData = nestedData.redirectToPayment;
        }

        // También verificar si viene directamente en la raíz
        if (!pagoData && (data as any).id_pago) {
          console.log("[handleConfirmAppointment] Encontrado id_pago en raíz");
          pagoData = data as any;
        }

        if (!pagoData || !pagoData.id_pago) {
          console.error(
            "Estructura de respuesta inválida - pago no encontrado:",
            {
              data,
              pagoData,
              keys: Object.keys(data),
            }
          );
          alert(
            "Error: No se recibió la información de pago correctamente. Revisa la consola para más detalles."
          );
          return;
        }

        if (!redirectData || !redirectData.clientSecret) {
          console.error(
            "Estructura de respuesta inválida - redirectToPayment no encontrado:",
            {
              data,
              redirectData,
              keys: Object.keys(data),
            }
          );
          alert(
            "Error: No se recibió la información de pago de Stripe correctamente. Revisa la consola para más detalles."
          );
          return;
        }

        // Construir URL de pago con todos los datos necesarios
        // Usar la fecha ISO completa que se envió al backend para mantener consistencia
        const fechaISOCompleta = fechaInicio.toISOString();
        const fechaStr = fechaInicio.toLocaleDateString("es-ES", {
          timeZone: "Europe/Madrid",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const horaStr = fechaInicio.toLocaleTimeString("es-ES", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const profesionalNombre =
          professional.fullName || professional.name || "Profesional";
        const servicioNombre = selectedPrice.nombre_servicio || "Servicio";

        const pagoUrl = new URL(
          `/pago/${pagoData.id_pago}`,
          window.location.origin
        );
        pagoUrl.searchParams.set("clientSecret", redirectData.clientSecret);
        pagoUrl.searchParams.set("amount", pagoData.monto.toString());
        pagoUrl.searchParams.set("currency", selectedPrice.moneda || "eur");
        pagoUrl.searchParams.set(
          "paymentIntentId",
          redirectData.paymentIntentId
        );
        pagoUrl.searchParams.set("fecha", fechaStr);
        pagoUrl.searchParams.set("fechaISO", fechaISOCompleta); // Pasar fecha ISO completa
        pagoUrl.searchParams.set("hora", horaStr);
        pagoUrl.searchParams.set("profesional", profesionalNombre);
        pagoUrl.searchParams.set("servicio", servicioNombre);

        // Redirigir a la página de pago con el clientSecret
        router.push(pagoUrl.toString());
      } else {
        console.error("[handleConfirmAppointment] Respuesta sin éxito:", {
          success: response.success,
          error: response.error,
          data: response.data,
        });
        alert(
          response.error ||
            "Error al crear la cita. Por favor, intenta nuevamente."
        );
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      alert(
        error.message ||
          "Error al crear la cita. Por favor, intenta nuevamente."
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
          {/* Page Title */}
          <div className="text-center mb-8">
            <p className="text-primary text-sm mb-2 font-normal">
              Conoce a tu especialista
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-black">
              Perfil Profesional
            </h1>
          </div>

          {/* Professional Card */}
          <div className="bg-[#E3DCFF] rounded-3xl p-5 sm:p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Side - Image and Basic Info */}
              <div className="space-y-6">
                {/* Professional Image or Initials - SIEMPRE arriba de especialidad/verificado */}
                <div className="relative flex justify-center">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt={displayName}
                      width={300}
                      height={225}
                      className="rounded-2xl object-cover w-full max-w-sm aspect-[4/3]"
                      unoptimized
                      onError={(e) => {
                        console.error(
                          "[ProfessionalPageClient] Next/Image onError main cover",
                          {
                            src: (e as any)?.currentTarget?.src,
                          }
                        );
                        setImageError("No se pudo cargar la foto de perfil");
                      }}
                      onLoad={() => {
                        console.log(
                          "[ProfessionalPageClient] Main cover image loaded OK"
                        );
                        setImageError(null);
                      }}
                    />
                  ) : (
                    <div className="w-full max-w-sm aspect-[4/3] rounded-2xl bg-gray-200 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                        {displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    </div>
                  )}
                  {/* Play Button Overlay - Solo mostrar si hay video */}
                  {presentationVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handlePopupOpen}
                        className="bg-white hover:bg-gray-50 rounded-full p-6 transition-colors shadow-lg"
                        aria-label="Reproducir video de presentación"
                        title="Ver video de presentación"
                      >
                        <svg
                          className="w-8 h-8 text-primary"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {imageError && (
                  <p className="text-xs text-red-600 text-center">
                    {imageError}
                  </p>
                )}

                {/* Professional Type and Location */}
                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button className="bg-[#1a0082] text-white px-5 py-2.5 rounded-full font-bold text-sm sm:text-base">
                      {displaySpecialty}
                    </button>
                    {professional.verificado && (
                      <span className="bg-green-500 text-white px-3 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verificado
                      </span>
                    )}
                  </div>
                  <button className="bg-[#F37E1F] text-white px-5 py-2.5 rounded-full font-medium text-sm sm:text-base flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{cityLabel}</span>
                  </button>
                  {/* Rating */}
                  {professional.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      {renderStars(professional.rating)}
                      <span className="text-sm text-gray-600">
                        {professional.rating.toFixed(1)} (
                        {professional.totalSessions} sesiones)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - About Section */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {displayName.toUpperCase()}
                  </h2>

                  {/* Modality Buttons - Mostrar basándose en tiposAtencionDisponibles */}
                  {tiposAtencionDisponibles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {tiposAtencionDisponibles.includes("presencial") && (
                        <button className="bg-primary-foreground text-white px-4 py-2 rounded-full flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <span>Presencial</span>
                        </button>
                      )}
                      {tiposAtencionDisponibles.includes("en_linea") && (
                        <button className="bg-primary-foreground text-white px-4 py-2 rounded-full flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-8-2c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                          </svg>
                          <span>En línea</span>
                        </button>
                      )}
                      {tiposAtencionDisponibles.includes("a_domicilio") && (
                        <button className="bg-primary-foreground text-white px-4 py-2 rounded-full flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          </svg>
                          <span>A Domicilio</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Experience and Price */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    {professional.experience > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {professional.experience} años de experiencia
                      </span>
                    )}
                    {displayPrice > 0 && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253v1.928a1 1 0 10 2 0v-1.928a4.487 4.487 0 002.353-1.253c.56-.649.782-1.42.514-2.034a4.49 4.49 0 00-1.867-2.014c-.352-.21-.804-.338-1.203-.393a1 1 0 10-.204-.994c.209-.034.44-.052.693-.052h.008v-.092a4.535 4.535 0 00-1.676-.662C7.398 5.766 7 6.991 7 8c0 .99.398 1.234.676 1.662.24.32.477.545.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253v1.928a1 1 0 102 0v-1.928a4.487 4.487 0 002.353-1.253c.56-.649.782-1.42.514-2.034a4.49 4.49 0 00-1.867-2.014c-.352-.21-.804-.338-1.203-.393V9.849z"
                            clipRule="evenodd"
                          />
                        </svg>
                        ${displayPrice}/hora
                      </span>
                    )}
                  </div>

                  {/* About Section */}
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      Sobre mi
                    </h3>
                    <p className="text-secondary leading-relaxed text-sm whitespace-pre-line">
                      {displayBio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SeparatorSection
        subtitle="SERVICIOS"
        title="Servicios Ofrecidos"
        className=""
      />

      {/* Services Section */}
      <div className="bg-white py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Service Cards */}
          {professional.precios && professional.precios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              {professional.precios
                .map((p: any) => {
                  // Normalizar precio para soportar distintas estructuras del backend
                  const nombre_servicio =
                    p.nombre_servicio ||
                    p.nombre_paquete ||
                    p.nombre ||
                    "Servicio";
                  const descripcion = p.descripcion || "";
                  const precioValor =
                    typeof p.precio === "number"
                      ? p.precio
                      : Number(p.precio) || 0;
                  // Forzar visualización en Euros en el frontend
                  const moneda = "EUR";
                  const duracion =
                    p.duracion ||
                    (p.duracion_minutos
                      ? `${p.duracion_minutos} min`
                      : undefined);
                  return {
                    id_precio:
                      p.id_precio ||
                      p.id ||
                      `${nombre_servicio}-${precioValor}`,
                    nombre_servicio,
                    descripcion,
                    precio: precioValor,
                    moneda,
                    duracion,
                    raw: p,
                  };
                })
                .sort((a: any, b: any) => a.precio - b.precio) // Ordenar por precio ascendente
                .map((precio: any, index: number) => {
                  // Formatear precio según moneda
                  const formatearPrecio = (precio: number, moneda: string) => {
                    const simbolos: { [key: string]: string } = {
                      MXN: "$",
                      USD: "$",
                      EUR: "€",
                    };
                    const simbolo = simbolos[moneda] || "$";
                    return `${simbolo}${precio.toFixed(2)}`;
                  };

                  // Extraer duración de la descripción si no está disponible
                  const extraerDuracion = (descripcion: string) => {
                    const match = descripcion.match(
                      /(\d+)\s*(min|minutos|minuto|hora|horas)/i
                    );
                    return match ? match[0] : undefined;
                  };

                  const duracion =
                    precio.duracion ||
                    extraerDuracion(precio.descripcion || "") ||
                    undefined;
                  const esPopular =
                    index === Math.floor(professional.precios!.length / 2); // Marcar el del medio como popular

                  return (
                    <PricingCard
                      key={precio.id_precio}
                      title={precio.nombre_servicio}
                      subtitle={displaySpecialty}
                      description={precio.descripcion}
                      duration={duracion || "Consultar"}
                      price={formatearPrecio(precio.precio, precio.moneda)}
                      isPopular={esPopular}
                      onPurchase={() => {
                        setSelectedPrice(precio.raw || precio);
                        setTimeout(() => {
                          document
                            .getElementById("appointment-scheduler")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }, 100);
                      }}
                      onDetails={() => {
                        setSelectedPrice(precio.raw || precio);
                        setTimeout(() => {
                          document
                            .getElementById("appointment-scheduler")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }, 100);
                      }}
                    />
                  );
                })}
            </div>
          ) : (
            // Fallback si no hay precios disponibles
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              <PricingCard
                title="Primera sesión"
                subtitle={displaySpecialty}
                description="Ideal para comenzar tu proceso con una evaluación emocional y plan personalizado"
                duration="60 min"
                price={`$${displayPrice || 100}`}
                onPurchase={() => console.log("Comprar primera sesión")}
                onDetails={() =>
                  router.push(
                    `/${params.category}/${params.service}/${params.professional}/detalles`
                  )
                }
              />

              <PricingCard
                title="Seguimiento"
                subtitle={`Sesión de seguimiento - ${displaySpecialty}`}
                description="Para continuar tu terapia, revisar avances y trabajar nuevos objetivos."
                duration="45 min"
                price={`$${Math.round((displayPrice || 100) * 0.85)}`}
                onPurchase={() => console.log("Comprar seguimiento")}
                onDetails={() =>
                  router.push(
                    `/${params.category}/${params.service}/${params.professional}/detalles`
                  )
                }
              />

              <PricingCard
                title="Pack x3"
                subtitle={`Pack ${displaySpecialty}`}
                description="Tres sesiones para trabajar tus objetivos con técnicas prácticas + guía de apoyo entre sesiones."
                duration="3x 50 min"
                price={`$${Math.round((displayPrice || 100) * 2.7)}`}
                savings={`Ahorra $${Math.round((displayPrice || 100) * 0.3)}`}
                isPopular={true}
                onPurchase={() => console.log("Comprar pack x3")}
                onDetails={() =>
                  router.push(
                    `/${params.category}/${params.service}/${params.professional}/detalles`
                  )
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Availability Section - Solo mostrar si hay un paquete seleccionado */}
      {selectedPrice && (
        <div
          id="appointment-scheduler"
          className="bg-white py-10 sm:py-12 md:py-16"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-gray-500 text-sm mb-2">Horarios Disponibles</p>
              <h2 className="text-3xl font-bold text-gray-900">
                Disponibilidad
              </h2>
            </div>

            {/* Selector de Tipo de Atención */}
            {tiposAtencionDisponibles.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de atención
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {tiposAtencionDisponibles.map((tipo) => {
                    const isSelected = selectedTipoAtencion === tipo;
                    const labels: { [key: string]: string } = {
                      presencial: "Presencial",
                      en_linea: "En Línea",
                      a_domicilio: "A Domicilio",
                    };
                    const icons: { [key: string]: React.ReactElement } = {
                      presencial: (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      ),
                      en_linea: (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-8-2c-1.38 0-2.5-1.12-2.5-2.5S10.62 11 12 11s2.5 1.12 2.5 2.5S13.38 16 12 16z" />
                        </svg>
                      ),
                      a_domicilio: (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                      ),
                    };

                    return (
                      <button
                        key={tipo}
                        onClick={() => {
                          const tipoAnterior = selectedTipoAtencion;
                          setSelectedTipoAtencion(tipo);
                          // Limpiar fecha y hora cuando cambia el tipo de atención
                          // para que el usuario vea los nuevos horarios disponibles
                          setSelectedDate(null);
                          setSelectedTimeSlot(null);
                          // Limpiar dirección si cambia de tipo
                          if (tipo !== "a_domicilio") {
                            setDireccionDomicilio("");
                          }
                          console.log(
                            `[ProfessionalPageClient] Tipo de atención cambiado de ${tipoAnterior} a ${tipo}`
                          );
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {icons[tipo]}
                        <span>{labels[tipo]}</span>
                      </button>
                    );
                  })}
                </div>
                {loadingHorarios && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Cargando horarios...
                  </p>
                )}
              </div>
            )}

            {/* Campo de dirección para citas a domicilio */}
            {selectedTipoAtencion === "a_domicilio" && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección para atención a domicilio{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={direccionDomicilio}
                  onChange={(e) => setDireccionDomicilio(e.target.value)}
                  placeholder="Ingresa tu dirección completa (calle, número, ciudad, código postal)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  El profesional llegará a esta dirección en la fecha y hora
                  seleccionada.
                </p>
              </div>
            )}

            {/* Mensaje informativo para citas presenciales */}
            {selectedTipoAtencion === "presencial" && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Cita Presencial
                    </h4>
                    <p className="text-sm text-blue-800">
                      Recibirás la dirección del consultorio por correo
                      electrónico después de confirmar tu pago.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Te recomendamos llegar 10 minutos antes de la hora
                      programada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje si no hay tipo de atención seleccionado */}
            {!selectedTipoAtencion && tiposAtencionDisponibles.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">
                  Por favor, selecciona un tipo de atención
                </p>
                <p className="text-sm">
                  Elige entre Presencial, En Línea o A Domicilio para ver los
                  horarios disponibles
                </p>
              </div>
            )}

            {/* Calendario y horarios - Solo mostrar si hay tipo de atención seleccionado */}
            {selectedTipoAtencion && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {/* Left: Calendar and times (2 cols) */}
                <div className="md:col-span-2">
                  {/* Month header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setCurrentMonth(newMonth);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Date chips */}
                  {availableDays.length > 0 ? (
                    <>
                      <div className="flex w-full max-w-full gap-2 mb-6 overflow-x-auto snap-x snap-mandatory px-1 sm:px-2">
                        {availableDays.slice(0, 14).map((day, i) => {
                          const isSelected =
                            selectedDate &&
                            day.date.getTime() === selectedDate.getTime();
                          return (
                            <button
                              key={i}
                              onClick={() => handleDateSelect(day.date)}
                              className={`px-3 py-2 rounded-md text-sm whitespace-nowrap snap-center ${
                                isSelected
                                  ? "bg-orange-500 text-white"
                                  : day.isToday
                                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                                  : "bg-white text-gray-700 border border-gray-200"
                              }`}
                            >
                              {day.dayName} {day.dayNumber}
                            </button>
                          );
                        })}
                      </div>

                      {/* Times list blocks */}
                      {selectedDate ? (
                        loadingAppointments ? (
                          <div className="text-center py-8 text-gray-500">
                            Cargando horarios...
                          </div>
                        ) : timeSlots.length > 0 ? (
                          <div className="space-y-3">
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">
                                Horarios disponibles para{" "}
                                {selectedDate.toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                  <span>Disponible</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                                  <span>Ocupado</span>
                                </div>
                              </div>
                            </div>
                            {timeSlots.map((slot, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  slot.available &&
                                  setSelectedTimeSlot(slot.time)
                                }
                                disabled={!slot.available}
                                className={`w-full text-left px-3 md:px-4 py-3 md:py-4 rounded-xl border flex items-center justify-between transition-all ${
                                  selectedTimeSlot === slot.time
                                    ? "bg-purple-100 border-purple-300 text-purple-800 shadow-md"
                                    : !slot.available
                                    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                                    : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
                                }`}
                                title={
                                  !slot.available
                                    ? "Este horario está ocupado"
                                    : "Click para seleccionar"
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      slot.available
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-sm font-medium ${
                                      !slot.available && "line-through"
                                    }`}
                                  >
                                    {slot.displayTime}
                                  </span>
                                  {!slot.available && (
                                    <span className="text-xs text-gray-400 italic">
                                      (Ocupado)
                                    </span>
                                  )}
                                </div>
                                {slot.available ? (
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No hay horarios disponibles para esta fecha
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Selecciona una fecha para ver los horarios disponibles
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay días disponibles este mes
                    </div>
                  )}
                </div>

                {/* Right: Summary */}
                <aside className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center space-x-3 mb-4">
                      {displayImage && (
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <Image
                            src={displayImage}
                            alt={displayName}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.error(
                                "[ProfessionalPageClient] Next/Image onError avatar",
                                {
                                  src: (e as any)?.currentTarget?.src,
                                }
                              );
                            }}
                            onLoad={() => {
                              console.log(
                                "[ProfessionalPageClient] Avatar image loaded OK"
                              );
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">
                          {selectedPrice.nombre_servicio}
                        </p>
                        <p className="text-xs text-gray-500">
                          {displayName}
                          <br />
                          {cityLabel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 py-2">
                      <span>{selectedPrice.nombre_servicio}</span>
                      <span>€{selectedPrice.precio.toFixed(2)} EUR</span>
                    </div>
                    {selectedPrice.duracion && (
                      <div className="flex items-center justify-between text-sm text-gray-600 py-2">
                        <span>Duración</span>
                        <span>{selectedPrice.duracion}</span>
                      </div>
                    )}
                    {selectedTipoAtencion && (
                      <div className="flex items-center justify-between text-sm text-gray-600 py-2">
                        <span>Tipo de atención</span>
                        <span className="capitalize">
                          {selectedTipoAtencion === "presencial"
                            ? "Presencial"
                            : selectedTipoAtencion === "en_linea"
                            ? "En Línea"
                            : "A Domicilio"}
                        </span>
                      </div>
                    )}
                    {selectedTipoAtencion === "en_linea" && (
                      <div className="flex items-center justify-between text-sm text-gray-600 py-2">
                        <span>Plataforma</span>
                        <span className="text-green-600 font-medium">
                          Google Meet
                        </span>
                      </div>
                    )}
                    {selectedTipoAtencion === "a_domicilio" &&
                      direccionDomicilio && (
                        <div className="text-sm text-gray-600 py-2">
                          <span className="block mb-1 font-medium">
                            Dirección de atención:
                          </span>
                          <span className="text-xs">{direccionDomicilio}</span>
                        </div>
                      )}
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>EUR {selectedPrice.precio.toFixed(2)}</span>
                    </div>
                    {selectedDate && selectedTimeSlot && (
                      <>
                        <div className="h-px bg-gray-200 my-2" />
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            <strong>Fecha:</strong>{" "}
                            {selectedDate.toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div>
                            <strong>Hora:</strong>{" "}
                            {
                              timeSlots.find((s) => s.time === selectedTimeSlot)
                                ?.displayTime
                            }
                          </div>
                        </div>
                        <button
                          onClick={handleConfirmAppointment}
                          disabled={isCreatingAppointment}
                          className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingAppointment
                            ? "Creando cita..."
                            : "Confirmar Cita"}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedPrice(null);
                        setSelectedDate(null);
                        setSelectedTimeSlot(null);
                      }}
                      className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Cambiar paquete
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handlePopupClose}
        >
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                setIsPopupOpen(false);
              }}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all duration-200"
              aria-label="Cerrar video"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video container */}
            <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden">
              {isEmbedVideo && embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video de presentación"
                />
              ) : presentationVideoUrl ? (
                <video
                  className="w-full h-full object-cover"
                  poster={displayImage || undefined}
                  controls
                  preload="metadata"
                  playsInline
                >
                  <source src={presentationVideoUrl} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              ) : (
                <video
                  className="w-full h-full object-cover"
                  poster={displayImage || undefined}
                  controls
                  preload="metadata"
                  playsInline
                >
                  <source src="/Naxine_V1_Music.mp4" type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
