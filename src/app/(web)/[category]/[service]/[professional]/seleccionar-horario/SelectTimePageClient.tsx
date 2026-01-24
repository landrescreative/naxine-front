"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ApiProfessional, ProfessionalPrice } from "@/services/types/api";
import { appointmentsService, citasService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { createSpainLocalDateUTC, parseMySQLDateAsSpainLocal } from "@/services/utils/api-helpers";
import Image from "next/image";

interface SelectTimePageClientProps {
  professional: ApiProfessional;
  initialDate?: string;
  precioId?: string;
  tipoAtencion?: string;
  initialHorario?: string;
}

export default function SelectTimePageClient({
  professional,
  initialDate,
  precioId,
  tipoAtencion,
  initialHorario,
}: SelectTimePageClientProps) {
  const router = useRouter();
  const params = useParams<{
    category: string;
    service: string;
    professional: string;
  }>();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(
    initialHorario || null
  );
  const [selectedPrice, setSelectedPrice] = useState<ProfessionalPrice | null>(
    null
  );
  // Normalizar tipo de atención inicial
  const normalizeTipoAtencion = useCallback(
    (tipo: any): "presencial" | "en_linea" | "a_domicilio" | null => {
      if (!tipo) return null;
      const tipoLower = String(tipo).toLowerCase().trim();
      if (tipoLower === "presencial" || tipoLower === "en_persona") {
        return "presencial";
      } else if (
        tipoLower === "en_linea" ||
        tipoLower === "en línea" ||
        tipoLower === "online" ||
        tipoLower === "virtual"
      ) {
        return "en_linea";
      } else if (
        tipoLower === "a_domicilio" ||
        tipoLower === "a domicilio" ||
        tipoLower === "domicilio"
      ) {
        return "a_domicilio";
      }
      return null;
    },
    []
  );

  // Inicializar selectedTipoAtencion desde el prop (viene de page.tsx que lee searchParams)
  // El prop tipoAtencion es más confiable que leer searchParams directamente
  const tipoAtencionInicial = useMemo(() => {
    // También leer de searchParams como fallback por si acaso
    const tipoFromUrl = searchParams.get("tipoAtencion");
    const tipoFinal = tipoAtencion || tipoFromUrl || null;
    const normalized = normalizeTipoAtencion(tipoFinal);
    console.log("[SelectTimePageClient] Calculando tipoAtencionInicial:", {
      tipoAtencionProp: tipoAtencion,
      tipoFromUrl,
      tipoFinal,
      normalized,
    });
    return normalized;
  }, [tipoAtencion, searchParams, normalizeTipoAtencion]);

  const [selectedTipoAtencion, setSelectedTipoAtencion] = useState<
    "presencial" | "en_linea" | "a_domicilio" | null
  >(() => {
    // Inicializar con el valor normalizado del prop
    const initial = normalizeTipoAtencion(tipoAtencion);
    console.log("[SelectTimePageClient] Inicializando selectedTipoAtencion:", {
      tipoAtencion,
      initial,
    });
    return initial;
  });

  // Actualizar selectedTipoAtencion cuando cambie tipoAtencionInicial o el prop tipoAtencion
  useEffect(() => {
    const nuevoTipo = normalizeTipoAtencion(tipoAtencion);
    if (nuevoTipo && nuevoTipo !== selectedTipoAtencion) {
      console.log(
        "[SelectTimePageClient] Actualizando selectedTipoAtencion desde prop:",
        { tipoAtencion, nuevoTipo, selectedTipoAtencion }
      );
      setSelectedTipoAtencion(nuevoTipo);
    } else if (tipoAtencionInicial && tipoAtencionInicial !== selectedTipoAtencion) {
      console.log(
        "[SelectTimePageClient] Actualizando selectedTipoAtencion desde tipoAtencionInicial:",
        tipoAtencionInicial
      );
      setSelectedTipoAtencion(tipoAtencionInicial);
    }
  }, [tipoAtencion, tipoAtencionInicial, selectedTipoAtencion, normalizeTipoAtencion]);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [direccionDomicilio, setDireccionDomicilio] = useState<string>("");
  const [codigoPostal, setCodigoPostal] = useState<string>("");
  const [codigoPostalError, setCodigoPostalError] = useState<string | null>(
    null
  );
  const [stripeTaxCode, setStripeTaxCode] = useState<string | null>(null);

  // Ref para evitar re-seleccionar el precio múltiples veces
  const hasSelectedPrice = useRef(false);

  // Resetear la referencia cuando cambia el profesional o precioId
  useEffect(() => {
    hasSelectedPrice.current = false;
  }, [professional?.id, precioId]);

  // Pre-cargar dirección y código postal desde la URL (si vienen del paso anterior)
  useEffect(() => {
    const direccionFromUrl = searchParams.get("direccionDomicilio");
    if (direccionFromUrl) {
      setDireccionDomicilio(direccionFromUrl);
    }
    const cpFromUrl = searchParams.get("codigoPostal");
    if (cpFromUrl) {
      setCodigoPostal(cpFromUrl);
    }
  }, [searchParams]);

  // Cargar el precio seleccionado
  useEffect(() => {
    if (!professional.precios || professional.precios.length === 0) {
      console.log("[SelectTimePageClient] No hay precios disponibles");
      return;
    }

    // Evitar re-seleccionar si ya se seleccionó
    if (hasSelectedPrice.current) {
      return;
    }

    console.log("[SelectTimePageClient] Cargando precio:", {
      precioId,
      totalPrecios: professional.precios.length,
    });

    if (precioId) {
      const precio = professional.precios.find(
        (p: any) =>
          String(p.id_precio || p.id || "") === String(precioId) ||
          String(p.raw?.id_precio || "") === String(precioId)
      );
      if (precio) {
        const precioAny = precio as any;
        const precioNormalizado: ProfessionalPrice = {
          id_precio: precioAny.id_precio || precioAny.id || 0,
          nombre_servicio:
            precioAny.nombre_servicio ||
            precioAny.nombre_paquete ||
            precioAny.nombre ||
            "Servicio",
          descripcion: precioAny.descripcion || "",
          precio: precioAny.precio || 0,
          moneda: precioAny.moneda || "EUR",
          duracion: precioAny.duracion || undefined,
        };
        console.log(
          "[SelectTimePageClient] Precio encontrado por ID:",
          precioNormalizado
        );
        setSelectedPrice(precioNormalizado);
        hasSelectedPrice.current = true;
        return;
      } else {
        console.warn(
          "[SelectTimePageClient] Precio con ID no encontrado, seleccionando el primero"
        );
      }
    }

    // Si no hay precioId o no se encontró el precio, seleccionar el primero
    if (professional.precios.length > 0) {
      const primerPrecio = professional.precios[0] as any;
      const precioNormalizado: ProfessionalPrice = {
        id_precio: primerPrecio.id_precio || primerPrecio.id || 0,
        nombre_servicio:
          primerPrecio.nombre_servicio ||
          primerPrecio.nombre_paquete ||
          primerPrecio.nombre ||
          "Servicio",
        descripcion: primerPrecio.descripcion || "",
        precio: primerPrecio.precio || 0,
        moneda: primerPrecio.moneda || "EUR",
        duracion: primerPrecio.duracion || undefined,
      };
      console.log(
        "[SelectTimePageClient] Auto-seleccionando primer precio:",
        precioNormalizado
      );
      setSelectedPrice(precioNormalizado);
      hasSelectedPrice.current = true;
    }
  }, [precioId, professional.precios]);

  // Cargar horarios del profesional
  const [horariosCargados, setHorariosCargados] = useState<
    Array<{
      dia_semana: string;
      hora_inicio: string;
      hora_fin: string;
      tipo_atencion: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!professional.id) {
      console.log("[SelectTimePageClient] No hay professional.id, saliendo");
      return;
    }

    // Usar el tipoAtencion del prop (viene de la URL) o el selectedTipoAtencion
    // El tipo de atención debe venir de la página anterior
    // Priorizar el prop tipoAtencion directamente, luego tipoAtencionInicial, luego selectedTipoAtencion
    const tipoNormalizadoDelProp = normalizeTipoAtencion(tipoAtencion);
    const tipoAtencionParaFiltrar = tipoNormalizadoDelProp || tipoAtencionInicial || selectedTipoAtencion;
    
    console.log("[SelectTimePageClient] Cargando horarios - Tipo de atención:", {
      tipoAtencionProp: tipoAtencion,
      tipoNormalizadoDelProp,
      tipoAtencionFromUrl: searchParams.get("tipoAtencion"),
      tipoAtencionInicial,
      selectedTipoAtencion,
      tipoAtencionParaFiltrar,
    });
    
    if (!tipoAtencionParaFiltrar) {
      console.warn(
        "[SelectTimePageClient] ⚠️ No hay tipo de atención seleccionado, esperando...",
        { 
          tipoAtencion, 
          tipoAtencionFromUrl: searchParams.get("tipoAtencion"),
          tipoAtencionInicial, 
          selectedTipoAtencion,
          searchParamsString: searchParams.toString(),
        }
      );
      setHorariosCargados([]);
      return;
    }
    
    console.log(
      "[SelectTimePageClient] ✅ Tipo de atención encontrado, cargando horarios para:",
      tipoAtencionParaFiltrar
    );

    // Función helper para normalizar y filtrar horarios
    // Similar a ProfessionalPageClient, pero con normalización para casos edge
    const normalizarYFiltrarHorarios = (horarios: any[]) => {
      console.log("[SelectTimePageClient] Normalizando horarios:", {
        total: horarios.length,
        tipoAtencionParaFiltrar,
        muestraHorarios: horarios.slice(0, 3).map((h: any) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          tipo_atencion_original: h.tipo_atencion,
        })),
      });

      // Primero normalizar los horarios (por si vienen con formatos diferentes)
      const horariosNormalizados = horarios.map((h: any) => {
        let tipoNormalizado = h.tipo_atencion || null;
        
        // Si el tipo ya está normalizado (en_linea, presencial, a_domicilio), usarlo directamente
        // Si no, normalizarlo
        if (tipoNormalizado) {
          const tipoLower = String(tipoNormalizado).toLowerCase().trim();
          
          // Si ya está en el formato correcto, mantenerlo
          if (tipoLower === "presencial" || tipoLower === "en_linea" || tipoLower === "a_domicilio") {
            tipoNormalizado = tipoLower;
          } else {
            // Normalizar formatos alternativos
            if (tipoLower === "en_persona") {
              tipoNormalizado = "presencial";
            } else if (
              tipoLower === "en línea" ||
              tipoLower === "en-linea" ||
              tipoLower === "online" ||
              tipoLower === "virtual"
            ) {
              tipoNormalizado = "en_linea";
            } else if (
              tipoLower === "a-domicilio" ||
              tipoLower === "a domicilio" ||
              tipoLower === "domicilio"
            ) {
              tipoNormalizado = "a_domicilio";
            }
          }
        }

        return {
          dia_semana: h.dia_semana || "",
          hora_inicio: h.hora_inicio || "09:00:00",
          hora_fin: h.hora_fin || "17:00:00",
          tipo_atencion: tipoNormalizado,
          tipo_atencion_original: h.tipo_atencion, // Guardar original para debug
        };
      });

      const tiposEncontrados = [
        ...new Set(
          horariosNormalizados.map((h) => h.tipo_atencion || "null")
        ),
      ];
      console.log("[SelectTimePageClient] Horarios normalizados:", {
        total: horariosNormalizados.length,
        tiposEncontrados,
        tipoBuscado: tipoAtencionParaFiltrar,
        coinciden: tiposEncontrados.includes(tipoAtencionParaFiltrar),
        muestraNormalizados: horariosNormalizados.slice(0, 5).map((h) => ({
          dia: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          tipo_atencion: h.tipo_atencion,
          tipo_original: h.tipo_atencion_original,
        })),
      });

      // Filtrar por el tipo de atención (igual que ProfessionalPageClient)
      const horariosFiltrados = horariosNormalizados.filter((h) => {
        // Si el horario no tiene tipo_atencion, no incluirlo
        // Si tiene tipo_atencion, solo incluirlo si coincide con el seleccionado
        return h.tipo_atencion === tipoAtencionParaFiltrar;
      });

      console.log("[SelectTimePageClient] Horarios después de filtrar:", {
        totalAntes: horariosNormalizados.length,
        totalDespues: horariosFiltrados.length,
        tipoFiltrado: tipoAtencionParaFiltrar,
        tiposEnHorarios: [
          ...new Set(horariosNormalizados.map((h) => h.tipo_atencion || "null")),
        ],
      });

      return horariosFiltrados.map((h) => ({
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        tipo_atencion: h.tipo_atencion,
      }));
    };

    // SIEMPRE cargar desde el endpoint (igual que ProfessionalPageClient)
    // para asegurar que los horarios estén normalizados correctamente
    const fetchHorariosDesdeEndpoint = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const url = `${apiBaseUrl}/disponibilidad-horarios/public/profesional/${professional.id}`;
        console.log(
          `[SelectTimePageClient] Cargando horarios desde endpoint público: ${url} (filtrando por tipo: ${tipoAtencionParaFiltrar})`
        );

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[SelectTimePageClient] Respuesta del endpoint:", data);

          let horarios: any[] = [];
          if (data.success && data.data?.disponibilidad_horarios) {
            horarios = data.data.disponibilidad_horarios;
          } else if (Array.isArray(data.data)) {
            horarios = data.data;
          } else if (Array.isArray(data)) {
            horarios = data;
          }

          if (horarios.length > 0) {
            // Normalizar y filtrar horarios por tipo de atención
            const horariosFiltrados = normalizarYFiltrarHorarios(horarios);

            console.log(
              "[SelectTimePageClient] Horarios cargados desde endpoint:",
              horariosFiltrados.length,
              "de",
              horarios.length,
              "total (filtrados por tipo:",
              tipoAtencionParaFiltrar,
              ")"
            );
            setHorariosCargados(horariosFiltrados);
          } else {
            console.warn(
              "[SelectTimePageClient] No se encontraron horarios en la respuesta"
            );
            setHorariosCargados([]);
          }
        } else {
          console.warn(
            "[SelectTimePageClient] Error al cargar horarios:",
            response.status,
            response.statusText
          );
          setHorariosCargados([]);
        }
      } catch (error) {
        console.error("[SelectTimePageClient] Error loading schedules:", error);
        setHorariosCargados([]);
      }
    };

    fetchHorariosDesdeEndpoint();
  }, [professional.id, professional, selectedTipoAtencion, tipoAtencionInicial, tipoAtencion, searchParams, normalizeTipoAtencion]);

  // Cargar citas ocupadas
  useEffect(() => {
    if (professional.id && currentMonth) {
      setLoadingAppointments(true);
      const fetchOccupiedAppointments = async () => {
        try {
          // Calcular rango del mes visible (igual que ProfessionalPageClient)
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const inicioMes = new Date(year, month, 1);
          const finMes = new Date(year, month + 1, 0, 23, 59, 59);

          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          const response = await fetch(
            `${apiBaseUrl}/citas/profesional/${professional.id}/ocupadas?fecha_inicio=${inicioMes.toISOString()}&fecha_fin=${finMes.toISOString()}`
          );
          if (response.ok) {
            const data = await response.json();
            
            // Manejar estructura anidada: response.data.data.citas o response.data.citas
            let citasData = null;
            if (data.success && data.data) {
              // Intentar acceder a response.data.data.citas primero (estructura anidada)
              if (
                data.data.data &&
                data.data.data.citas &&
                Array.isArray(data.data.data.citas)
              ) {
                citasData = data.data.data.citas;
              }
              // Si no, intentar response.data.citas (estructura directa)
              else if (data.data.citas && Array.isArray(data.data.citas)) {
                citasData = data.data.citas;
              }
              // Fallback: si data.data es un array directamente
              else if (Array.isArray(data.data)) {
                citasData = data.data;
              }
            }

            if (citasData && citasData.length > 0) {
              // Convertir citas ocupadas al formato esperado por el componente
              // Normalizar fechas a UTC para comparación precisa (igual que ProfessionalPageClient)
              console.log(
                `[SelectTimePageClient] Procesando ${citasData.length} citas del API:`,
                citasData.slice(0, 3).map((c: any) => ({
                  id_cita: c.id_cita,
                  fecha_inicio: c.fecha_inicio,
                  fecha_fin: c.fecha_fin,
                  estado: c.estado,
                  tipo_atencion: c.tipo_atencion,
                  fuente: c.fuente,
                }))
              );
              
              const appointments = citasData.map((cita: any) => {
                // Log la fecha original antes de normalizar
                console.log(
                  `[SelectTimePageClient] Normalizando cita ${cita.id_cita}:`,
                  {
                    fecha_inicio_original: cita.fecha_inicio,
                    fecha_fin_original: cita.fecha_fin,
                    tipo_fecha_inicio: typeof cita.fecha_inicio,
                    fuente: cita.fuente,
                  }
                );
                
                // Los eventos de Google Calendar y Outlook ya vienen en formato ISO UTC desde el backend
                // Solo las citas de la plataforma (MySQL DATETIME) necesitan conversión
                let fechaInicioUTC: Date;
                let fechaFinUTC: Date;
                
                if (cita.fuente === "google_calendar" || cita.fuente === "outlook_calendar") {
                  // Eventos externos ya vienen en formato ISO UTC desde el backend
                  // El backend ya convirtió correctamente de la zona horaria original (México, etc.) a UTC
                  // Solo necesitamos parsear directamente
                  fechaInicioUTC = new Date(cita.fecha_inicio);
                  fechaFinUTC = new Date(cita.fecha_fin);
                  
                  // Verificar que la conversión sea correcta
                  const fechaInicioEspana = fechaInicioUTC.toLocaleString("es-ES", {
                    timeZone: "Europe/Madrid",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  console.log(
                    `[SelectTimePageClient] Evento ${cita.fuente} ${cita.id_cita}:`,
                    {
                      fecha_inicio_original: cita.fecha_inicio,
                      fechaInicioUTC: fechaInicioUTC.toISOString(),
                      fechaInicioEspana,
                    }
                  );
                } else {
                  // Citas de la plataforma vienen en formato MySQL DATETIME, necesitan conversión
                  fechaInicioUTC = normalizeDateToUTC(cita.fecha_inicio);
                  fechaFinUTC = normalizeDateToUTC(cita.fecha_fin);
                }
                const duration = Math.round(
                  (fechaFinUTC.getTime() - fechaInicioUTC.getTime()) / 60000
                );
                
                console.log(
                  `[SelectTimePageClient] Cita ${cita.id_cita} normalizada:`,
                  {
                    fechaInicioUTC: fechaInicioUTC.toISOString(),
                    fechaFinUTC: fechaFinUTC.toISOString(),
                    duration,
                    fechaInicioEspana: fechaInicioUTC.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    fechaFinEspana: fechaFinUTC.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                );

                // Generar ID único: usar id_cita si existe, sino usar id_evento_google o id_evento_outlook
                let uniqueId = String(
                  cita.id_cita ||
                    cita.id_evento_google ||
                    cita.id_evento_outlook ||
                    `event_${Date.now()}_${Math.random()}`
                );

                // Si el id_cita tiene prefijo (gc_ o oc_), usarlo directamente
                if (
                  cita.id_cita &&
                  (cita.id_cita.toString().startsWith("gc_") ||
                    cita.id_cita.toString().startsWith("oc_"))
                ) {
                  uniqueId = String(cita.id_cita);
                }

                return {
                  id: uniqueId,
                  dateTime: fechaInicioUTC.toISOString(), // Guardar en formato ISO UTC
                  dateTimeUTC: fechaInicioUTC, // Guardar objeto Date UTC para comparación rápida
                  dateTimeEnd: fechaFinUTC.toISOString(), // Guardar fecha fin en formato ISO UTC
                  dateTimeEndUTC: fechaFinUTC, // Guardar objeto Date UTC para fecha fin
                  duration,
                  estado: cita.estado || "confirmada",
                  fuente: cita.fuente || "plataforma",
                  titulo: cita.titulo || null,
                };
              });
              
              console.log(
                `[SelectTimePageClient] ✅ Citas ocupadas cargadas: ${appointments.length} total`,
                {
                  total: appointments.length,
                  detalles: appointments.map((apt) => ({
                    id: apt.id,
                    dateTime: apt.dateTime,
                    dateTimeUTC: apt.dateTimeUTC?.toISOString(),
                    dateTimeUTCType: typeof apt.dateTimeUTC,
                    duration: apt.duration,
                    estado: apt.estado,
                    fuente: apt.fuente,
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
                  })),
                }
              );
              
              setExistingAppointments(appointments);
            } else {
              console.warn(
                "[SelectTimePageClient] No se encontraron citas ocupadas o la estructura de respuesta es incorrecta:",
                data
              );
              setExistingAppointments([]);
            }
          } else {
            console.error(
              "[SelectTimePageClient] Error al cargar citas ocupadas:",
              response.status,
              response.statusText
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

  // Validar que el código postal esté en la lista del profesional
  const validarCodigoPostal = (
    cp: string
  ): { valido: boolean; error: string | null } => {
    if (!codigosPostalesDomicilio || !codigosPostalesDomicilio.trim()) {
      return { valido: true, error: null }; // Si el profesional no especifica códigos, no validar
    }

    const codigoPostalIngresado = cp.trim();

    if (!codigoPostalIngresado) {
      return {
        valido: false,
        error: "Por favor, ingresa un código postal.",
      };
    }

    // Validar formato (5 dígitos para España)
    if (!/^\d{5}$/.test(codigoPostalIngresado)) {
      return {
        valido: false,
        error: "El código postal debe tener 5 dígitos.",
      };
    }

    // Normalizar códigos postales del profesional (separar por comas/espacios y limpiar)
    const codigosProfesional = codigosPostalesDomicilio
      .split(/[,\s]+/)
      .map((cpItem) => cpItem.trim())
      .filter((cpItem) => cpItem.length > 0);

    // Verificar si el código postal ingresado está en la lista
    const codigoEncontrado = codigosProfesional.find(
      (cpProf) => cpProf === codigoPostalIngresado
    );

    if (!codigoEncontrado) {
      return {
        valido: false,
        error: `El código postal ${codigoPostalIngresado} no está en las zonas de servicio del profesional. Códigos postales disponibles: ${codigosProfesional.join(
          ", "
        )}`,
      };
    }

    return { valido: true, error: null };
  };

  // Funciones helper
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

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Usar funciones helper centralizadas de api-helpers.ts para consistencia
  const crearFechaEspanaUTC = createSpainLocalDateUTC;
  const normalizeDateToUTC = parseMySQLDateAsSpainLocal;

  // Generar horarios disponibles basados en los horarios cargados
  const horariosDisponibles = useMemo(() => {
    const horarios: {
      [key: number]: Array<{ desde: string; hasta: string }>;
    } = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    console.log("[SelectTimePageClient] Generando horarios disponibles:", {
      horariosCargados: horariosCargados.length,
      selectedTipoAtencion,
    });

    // Los horarios ya están filtrados por tipo de atención desde la carga
    // Solo procesar si hay tipo de atención seleccionado
    if (!selectedTipoAtencion) {
      console.log(
        "[SelectTimePageClient] No hay tipo de atención seleccionado, no generando horarios disponibles"
      );
      return horarios;
    }

    horariosCargados.forEach((horario) => {
      const diaNormalizado = normalizarDia(horario.dia_semana);
      const diaMap: { [key: string]: number } = {
        domingo: 0,
        lunes: 1,
        martes: 2,
        miercoles: 2,
        miércoles: 2,
        jueves: 3,
        viernes: 4,
        sabado: 5,
        sábado: 5,
      };
      const diaIndex = diaMap[diaNormalizado];

      // Los horarios en horariosCargados ya están filtrados por tipo de atención
      // Solo verificar que el tipo coincida como doble verificación de seguridad
      const horarioTipoNormalizado = normalizeTipoAtencion(
        horario.tipo_atencion
      );

      // Verificar que el tipo coincida (debería ser siempre true ya que están filtrados)
      const tipoCoincide =
        horarioTipoNormalizado === selectedTipoAtencion;

      if (diaIndex !== undefined && tipoCoincide) {
        if (!horarios[diaIndex]) horarios[diaIndex] = [];
        horarios[diaIndex].push({
          desde: horario.hora_inicio?.substring(0, 5) || "09:00",
          hasta: horario.hora_fin?.substring(0, 5) || "17:00",
        });
      }
    });

    console.log(
      "[SelectTimePageClient] Horarios disponibles generados:",
      horarios
    );

    return horarios;
  }, [horariosCargados, selectedTipoAtencion, normalizeTipoAtencion]);

  // Obtener tipos de atención disponibles de los horarios
  const tiposAtencionDisponibles = useMemo(() => {
    const tipos = new Set<string>();
    horariosCargados.forEach((horario) => {
      if (horario.tipo_atencion) {
        tipos.add(horario.tipo_atencion);
      }
    });
    return Array.from(tipos) as Array<
      "presencial" | "en_linea" | "a_domicilio"
    >;
  }, [horariosCargados]);

  // Ref para evitar re-seleccionar el tipo de atención múltiples veces
  const hasSelectedTipoAtencion = useRef(false);

  // Resetear la referencia cuando cambia el profesional
  useEffect(() => {
    hasSelectedTipoAtencion.current = false;
  }, [professional?.id]);

  // Auto-seleccionar el primer tipo de atención disponible cuando se cargan los horarios
  useEffect(() => {
    if (
      tiposAtencionDisponibles.length > 0 &&
      !selectedTipoAtencion &&
      !hasSelectedTipoAtencion.current
    ) {
      // Si viene tipoAtencion en los parámetros, usarlo; si no, usar el primero disponible
      const tipoInicial = normalizeTipoAtencion(tipoAtencion);
      if (tipoInicial && tiposAtencionDisponibles.includes(tipoInicial)) {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando tipo de atención desde parámetros:",
          tipoInicial
        );
        setSelectedTipoAtencion(tipoInicial);
        hasSelectedTipoAtencion.current = true;
      } else {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando primer tipo disponible:",
          tiposAtencionDisponibles[0]
        );
        setSelectedTipoAtencion(tiposAtencionDisponibles[0]);
        hasSelectedTipoAtencion.current = true;
      }
    }
  }, [
    tiposAtencionDisponibles,
    selectedTipoAtencion,
    tipoAtencion,
    normalizeTipoAtencion,
  ]);

  // Generar fechas disponibles
  const getAvailableDays = useMemo(() => {
    return () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mañana24Horas = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      mañana24Horas.setHours(0, 0, 0, 0);

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
        const rangosDelDia = horariosDisponibles[dayOfWeek];
        const isAvailable =
          rangosDelDia !== undefined && rangosDelDia.length > 0;
        const isPast = date < mañana24Horas;
        const isToday = date.getTime() === today.getTime();

        let hasAvailableSlots = false;
        // Si hay horarios disponibles para este día y no es pasado, marcar como disponible
        if (isAvailable && !isPast) {
          // Si hay precio seleccionado, verificar slots específicos
          if (selectedPrice && rangosDelDia && rangosDelDia.length > 0) {
            const duracionMinutos = selectedPrice.duracion
              ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
              : 60;

            // Intervalo fijo para generar slots (cada 15 minutos)
            // Esto permite mostrar slots más frecuentes y verificar disponibilidad dinámicamente
            const slotIntervalMinutes = 15;

            for (const horario of rangosDelDia) {
              const desde = timeToMinutes(horario.desde);
              const hasta = timeToMinutes(horario.hasta);
              let currentTime = desde;
              while (currentTime + duracionMinutos <= hasta) {
                const hour = Math.floor(currentTime / 60);
                const minute = currentTime % 60;
                const slotDateTimeUTC = createSpainLocalDateUTC(
                  year,
                  month,
                  day,
                  hour,
                  minute,
                  0
                );
                const slotEndUTC = new Date(
                  slotDateTimeUTC.getTime() + duracionMinutos * 60000
                );

                const isOccupied = existingAppointments.some((apt) => {
                  // Asegurarse de que aptStart sea un objeto Date válido
                  const aptStart =
                    apt.dateTimeUTC instanceof Date
                      ? apt.dateTimeUTC
                      : normalizeDateToUTC(apt.dateTime || apt.dateTimeUTC);
                  
                  // Si la cita tiene fecha_fin, usarla directamente en lugar de calcular desde duration
                  let aptEnd: Date;
                  if (apt.dateTimeEndUTC instanceof Date) {
                    aptEnd = apt.dateTimeEndUTC;
                  } else if (apt.dateTimeEnd) {
                    aptEnd = normalizeDateToUTC(apt.dateTimeEnd);
                  } else {
                    // Fallback: calcular desde duration
                    aptEnd = new Date(
                      aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
                    );
                  }
                  
                  // DEBUG: Calcular diferencia de tiempo para debugging
                  const timeDiffMs = slotDateTimeUTC.getTime() - aptEnd.getTime();
                  const timeDiffMinutes = Math.round(timeDiffMs / 60000);
                  
                  // Lógica de solapamiento mejorada:
                  // Dos intervalos se solapan si:
                  // 1. El inicio del slot está dentro del intervalo de la cita (>= inicio y < fin)
                  // 2. El fin del slot está dentro del intervalo de la cita (>= inicio y <= fin)
                  // 3. El slot contiene completamente la cita (slot inicio <= cita inicio y slot fin >= cita fin)
                  // 4. El slot empieza exactamente cuando termina la cita (necesitamos buffer de 15 minutos entre citas)
                  // 5. El slot termina exactamente cuando empieza la cita (también necesita buffer)
                  const condition1 = slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd;
                  const condition2 = slotEndUTC >= aptStart && slotEndUTC <= aptEnd;
                  const condition3 = slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd;
                  const condition4 = slotDateTimeUTC.getTime() === aptEnd.getTime(); // Slot empieza cuando termina la cita (buffer necesario)
                  const condition5 = slotEndUTC.getTime() === aptStart.getTime(); // Slot termina cuando empieza la cita (buffer necesario)
                  const hasOverlap = condition1 || condition2 || condition3 || condition4 || condition5;
                  
                  if (hasOverlap) {
                    console.log(
                      `[SelectTimePageClient] 🔴 Slot OCUPADO detectado:`,
                      {
                        slotTime: `${hour}:${minute.toString().padStart(2, "0")}`,
                        slotStart: slotDateTimeUTC.toISOString(),
                        slotEnd: slotEndUTC.toISOString(),
                        slotStartEspana: slotDateTimeUTC.toLocaleString("es-ES", {
                          timeZone: "Europe/Madrid",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        slotEndEspana: slotEndUTC.toLocaleString("es-ES", {
                          timeZone: "Europe/Madrid",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        aptId: apt.id,
                        aptStart: aptStart.toISOString(),
                        aptEnd: aptEnd.toISOString(),
                        aptStartEspana: aptStart.toLocaleString("es-ES", {
                          timeZone: "Europe/Madrid",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        aptEndEspana: aptEnd.toLocaleString("es-ES", {
                          timeZone: "Europe/Madrid",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        aptDuration: apt.duration || duracionMinutos,
                        aptEstado: apt.estado,
                        aptFuente: apt.fuente,
                  condition1,
                  condition2,
                  condition3,
                  condition4: slotDateTimeUTC.getTime() === aptEnd.getTime(),
                  timeDiff: slotDateTimeUTC.getTime() - aptStart.getTime(),
                      }
                    );
                  }
                  
                  return hasOverlap;
                });

                if (!isOccupied) {
                  hasAvailableSlots = true;
                  break;
                }
                // Incrementar por intervalo fijo (15 minutos) en lugar de por duración completa
                currentTime += slotIntervalMinutes;
              }
              if (hasAvailableSlots) break;
            }
          } else {
            // Si no hay precio seleccionado pero hay horarios, marcar como disponible
            // (los slots específicos se verificarán cuando se seleccione un precio)
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

      const filteredDays = days.filter((d) => d.available);
      console.log("[SelectTimePageClient] Días disponibles generados:", {
        totalDias: days.length,
        diasDisponibles: filteredDays.length,
        horariosDisponibles,
        selectedPrice: selectedPrice?.id_precio,
        selectedTipoAtencion,
      });
      return filteredDays;
    };
  }, [currentMonth, horariosDisponibles, selectedPrice, existingAppointments]);

  const availableDays = useMemo(() => {
    const days = getAvailableDays();
    console.log(
      "[SelectTimePageClient] availableDays actualizado:",
      days.length,
      "días"
    );
    return days;
  }, [getAvailableDays]);

  // Generar slots de tiempo
  const generateTimeSlots = useCallback(
    (
      date: Date
    ): Array<{ time: string; displayTime: string; available: boolean }> => {
      if (!selectedPrice || !date || !selectedTipoAtencion) return [];

      const dayOfWeek = date.getDay();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(date);
      selectedDateOnly.setHours(0, 0, 0, 0);
      const isToday = selectedDateOnly.getTime() === today.getTime();

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
      const diaSemanaNormalizado = normalizarDia(diaSemanaNombre);

      // Los horarios ya están filtrados por tipo de atención desde la carga
      // Solo filtrar por día de la semana
      const horariosDelDia = horariosCargados.filter((h) => {
        const diaHorarioNormalizado = normalizarDia(h.dia_semana);
        // Verificar que el tipo coincida como doble verificación (debería ser siempre true)
        const horarioTipoNormalizado = normalizeTipoAtencion(h.tipo_atencion);
        const tipoCoincide =
          horarioTipoNormalizado === selectedTipoAtencion;

        return diaHorarioNormalizado === diaSemanaNormalizado && tipoCoincide;
      });

      const slots: Array<{
        time: string;
        displayTime: string;
        available: boolean;
      }> = [];

      const duracionMinutos = selectedPrice.duracion
        ? parseInt(selectedPrice.duracion.replace(/\D/g, "")) || 60
        : 60;

      // Intervalo fijo para generar slots (cada 15 minutos)
      // Esto permite mostrar slots más frecuentes y verificar disponibilidad dinámicamente
      const slotIntervalMinutes = 15;

      if (horariosDelDia.length > 0) {
        // Usar un Map para evitar duplicados basándose en el time del slot
        const slotsMap = new Map<
          string,
          {
            time: string;
            displayTime: string;
            available: boolean;
          }
        >();

        horariosDelDia.forEach((horarioDelDia) => {
          const desde = timeToMinutes(
            horarioDelDia.hora_inicio.substring(0, 5)
          );
          const hasta = timeToMinutes(horarioDelDia.hora_fin.substring(0, 5));
          let currentTime = desde;

          // Generar slots cada slotIntervalMinutes minutos, verificando si hay tiempo suficiente
          // para la duración seleccionada desde cada slot
          while (currentTime + duracionMinutos <= hasta) {
            const slotTime = minutesToTime(currentTime);

            // Si ya existe este slot, solo actualizar si el nuevo es más disponible
            if (slotsMap.has(slotTime)) {
              const existingSlot = slotsMap.get(slotTime)!;
              // Si el slot existente no está disponible pero este sí, actualizarlo
              if (!existingSlot.available) {
                // Continuar con la lógica para verificar disponibilidad
              } else {
                // Si el existente ya está disponible, no hacer nada
                // Incrementar por intervalo fijo en lugar de por duración completa
                currentTime += slotIntervalMinutes;
                continue;
              }
            }

            const hour = Math.floor(currentTime / 60);
            const minute = currentTime % 60;

            const slotDateTimeUTC = createSpainLocalDateUTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              hour,
              minute,
              0
            );
            const slotEndUTC = new Date(
              slotDateTimeUTC.getTime() + duracionMinutos * 60000
            );

            let isPastTime = false;
            if (isToday) {
              const now = new Date();
              const nowInSpain = new Date(
                now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
              );
              const nowMinutes =
                nowInSpain.getHours() * 60 + nowInSpain.getMinutes();
              if (currentTime < nowMinutes) {
                isPastTime = true;
              }
            }

            // Verificar si hay suficiente tiempo continuo disponible desde este slot
            // Un slot está ocupado si se solapa con alguna cita existente
            const isOccupied = existingAppointments.some((apt) => {
              // Asegurarse de que aptStart sea un objeto Date válido
              const aptStart =
                apt.dateTimeUTC instanceof Date
                  ? apt.dateTimeUTC
                  : normalizeDateToUTC(apt.dateTime || apt.dateTimeUTC);
              
              // Si la cita tiene fecha_fin, usarla directamente en lugar de calcular desde duration
              // Esto es más preciso porque la duración puede tener problemas de redondeo
              let aptEnd: Date;
              if (apt.dateTimeEndUTC instanceof Date) {
                aptEnd = apt.dateTimeEndUTC;
              } else if (apt.dateTimeEnd) {
                aptEnd = normalizeDateToUTC(apt.dateTimeEnd);
              } else {
                // Fallback: calcular desde duration
                aptEnd = new Date(
                  aptStart.getTime() + (apt.duration || duracionMinutos) * 60000
                );
              }
              
              // Lógica de solapamiento: dos intervalos se solapan si:
              // 1. El inicio del slot está dentro del intervalo de la cita (>= inicio y < fin)
              // 2. El fin del slot está dentro del intervalo de la cita (>= inicio y <= fin)
              // 3. El slot contiene completamente la cita (slot inicio <= cita inicio y slot fin >= cita fin)
              // 4. El slot empieza exactamente cuando termina la cita (necesitamos buffer de 15 minutos entre citas)
              // NOTA: condition5 se eliminó porque condition2 ya cubre el caso donde el slot termina dentro de la cita
              const condition1 = slotDateTimeUTC >= aptStart && slotDateTimeUTC < aptEnd;
              const condition2 = slotEndUTC > aptStart && slotEndUTC <= aptEnd;
              const condition3 = slotDateTimeUTC <= aptStart && slotEndUTC >= aptEnd;
              const condition4 = slotDateTimeUTC.getTime() === aptEnd.getTime(); // Slot empieza cuando termina la cita (buffer necesario)
              const hasOverlap = condition1 || condition2 || condition3 || condition4;
              
              if (hasOverlap) {
                console.log(
                  `[SelectTimePageClient] 🔴 Slot OCUPADO en generateTimeSlots:`,
                  {
                    slotTime,
                    slotStart: slotDateTimeUTC.toISOString(),
                    slotEnd: slotEndUTC.toISOString(),
                    slotStartEspana: slotDateTimeUTC.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    slotEndEspana: slotEndUTC.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    aptId: apt.id,
                    aptStart: aptStart.toISOString(),
                    aptEnd: aptEnd.toISOString(),
                    aptStartEspana: aptStart.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    aptEndEspana: aptEnd.toLocaleString("es-ES", {
                      timeZone: "Europe/Madrid",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    aptDuration: apt.duration || duracionMinutos,
                    aptEstado: apt.estado,
                    aptFuente: apt.fuente,
                    aptDateTimeOriginal: apt.dateTime,
                    condition1,
                    condition2,
                    condition3,
                    condition4: slotDateTimeUTC.getTime() === aptEnd.getTime(),
                    slotDuration: duracionMinutos,
                  }
                );
              }
              
              return hasOverlap;
            });

            const available = !isPastTime && !isOccupied;

            const [hours24, minutes24] = slotTime.split(":").map(Number);
            const period = hours24 >= 12 ? "pm" : "am";
            const hours12 = hours24 % 12 || 12;
            const displayTime = `${hours12}:${minutes24
              .toString()
              .padStart(2, "0")}${period}`;

            // Solo agregar si no existe o si el existente no está disponible y este sí
            if (!slotsMap.has(slotTime) || !slotsMap.get(slotTime)!.available) {
              slotsMap.set(slotTime, {
                time: slotTime,
                displayTime,
                available,
              });
            }

            // Incrementar por intervalo fijo (15 minutos) en lugar de por duración completa
            // Esto permite mostrar slots más frecuentes y verificar disponibilidad dinámicamente
            currentTime += slotIntervalMinutes;
          }
        });

        // Convertir el Map a un array y ordenar por tiempo
        return Array.from(slotsMap.values()).sort((a, b) => {
          const timeA = timeToMinutes(a.time);
          const timeB = timeToMinutes(b.time);
          return timeA - timeB;
        });
      }

      return slots;
    },
    [
      selectedPrice,
      selectedTipoAtencion,
      horariosCargados,
      existingAppointments,
      normalizarDia,
      timeToMinutes,
      minutesToTime,
      crearFechaEspanaUTC,
      normalizeDateToUTC,
      normalizeTipoAtencion,
    ]
  );

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : [];
  }, [selectedDate, generateTimeSlots]);

  // Auto-seleccionar fecha si viene en los parámetros (después de que los horarios se carguen)
  useEffect(() => {
    if (
      initialDate &&
      !selectedDate &&
      horariosCargados.length > 0 &&
      selectedPrice &&
      selectedTipoAtencion
    ) {
      const fechaInicial = new Date(initialDate);
      // Verificar que la fecha esté en los días disponibles
      const tempSlots = generateTimeSlots(fechaInicial);
      if (tempSlots.length > 0) {
        console.log(
          "[SelectTimePageClient] Auto-seleccionando fecha inicial:",
          fechaInicial.toISOString(),
          "con",
          tempSlots.length,
          "slots disponibles"
        );
        setSelectedDate(fechaInicial);
      } else {
        console.warn(
          "[SelectTimePageClient] Fecha inicial no tiene slots disponibles:",
          fechaInicial.toISOString()
        );
        // Si la fecha inicial no tiene slots, seleccionar la primera fecha disponible
        if (availableDays.length > 0) {
          console.log(
            "[SelectTimePageClient] Seleccionando primera fecha disponible:",
            availableDays[0].date.toISOString()
          );
          setSelectedDate(availableDays[0].date);
        }
      }
    }
  }, [
    initialDate,
    selectedDate,
    horariosCargados,
    selectedPrice,
    selectedTipoAtencion,
    generateTimeSlots,
    availableDays,
  ]);

  // Auto-seleccionar horario si viene en los parámetros (después de que la fecha se seleccione)
  useEffect(() => {
    if (
      initialHorario &&
      !selectedTimeSlot &&
      selectedDate &&
      horariosCargados.length > 0 &&
      selectedPrice &&
      selectedTipoAtencion
    ) {
      const tempSlots = generateTimeSlots(selectedDate);
      console.log(
        "[SelectTimePageClient] Buscando horario inicial:",
        initialHorario,
        "Slots disponibles:",
        tempSlots.map((s) => ({ time: s.time, displayTime: s.displayTime }))
      );

      // Normalizar el horario inicial para comparación (puede venir en formato HH:MM o HH:MM:SS)
      const horarioNormalizado = initialHorario.includes(":")
        ? initialHorario.substring(0, 5) // Tomar solo HH:MM
        : initialHorario;

      const slotEncontrado = tempSlots.find(
        (slot) =>
          slot.time === horarioNormalizado ||
          slot.time === initialHorario ||
          slot.displayTime === initialHorario ||
          slot.time.substring(0, 5) === horarioNormalizado
      );

      if (slotEncontrado) {
        if (slotEncontrado.available) {
          console.log(
            "[SelectTimePageClient] Auto-seleccionando horario inicial:",
            slotEncontrado.time
          );
          setSelectedTimeSlot(slotEncontrado.time);
        } else {
          console.warn(
            "[SelectTimePageClient] Horario inicial encontrado pero no disponible:",
            slotEncontrado.time
          );
          // Si el horario exacto no está disponible, seleccionar el primero disponible
          const primerDisponible = tempSlots.find((slot) => slot.available);
          if (primerDisponible) {
            console.log(
              "[SelectTimePageClient] Seleccionando primer horario disponible:",
              primerDisponible.time
            );
            setSelectedTimeSlot(primerDisponible.time);
          }
        }
      } else if (tempSlots.length > 0) {
        // Si el horario exacto no se encuentra, seleccionar el primero disponible
        const primerDisponible = tempSlots.find((slot) => slot.available);
        if (primerDisponible) {
          console.log(
            "[SelectTimePageClient] Horario inicial no encontrado, seleccionando primer disponible:",
            primerDisponible.time
          );
          setSelectedTimeSlot(primerDisponible.time);
        }
      }
    }
  }, [
    initialHorario,
    selectedTimeSlot,
    selectedDate,
    horariosCargados,
    selectedPrice,
    selectedTipoAtencion,
    generateTimeSlots,
  ]);

  const handleDateSelect = async (date: Date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;
    const dayOfWeek = date.getDay();
    if (!horariosDisponibles[dayOfWeek]) return;

    if (!selectedPrice) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      return;
    }

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
    
    // Refrescar horarios ocupados cuando se selecciona una nueva fecha
    // Esto asegura que se muestren las citas más recientes (incluyendo las que están en proceso de pago)
    if (professional.id) {
      try {
        // Calcular rango del mes visible
        const year = date.getFullYear();
        const month = date.getMonth();
        const inicioMes = new Date(year, month, 1);
        const finMes = new Date(year, month + 1, 0, 23, 59, 59);

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const response = await fetch(
          `${apiBaseUrl}/citas/profesional/${professional.id}/ocupadas?fecha_inicio=${inicioMes.toISOString()}&fecha_fin=${finMes.toISOString()}`
        );
        if (response.ok) {
          const data = await response.json();
          
          // Manejar estructura anidada
          let citasData = null;
          if (data.success && data.data) {
            if (
              data.data.data &&
              data.data.data.citas &&
              Array.isArray(data.data.data.citas)
            ) {
              citasData = data.data.data.citas;
            } else if (data.data.citas && Array.isArray(data.data.citas)) {
              citasData = data.data.citas;
            } else if (Array.isArray(data.data)) {
              citasData = data.data;
            }
          }

          if (citasData && citasData.length > 0) {
            const appointments = citasData.map((cita: any) => {
              const fechaInicioUTC = normalizeDateToUTC(cita.fecha_inicio);
              const fechaFinUTC = normalizeDateToUTC(cita.fecha_fin);
              const duration = Math.round(
                (fechaFinUTC.getTime() - fechaInicioUTC.getTime()) / 60000
              );

              let uniqueId = String(
                cita.id_cita ||
                  cita.id_evento_google ||
                  cita.id_evento_outlook ||
                  `event_${Date.now()}_${Math.random()}`
              );

              if (
                cita.id_cita &&
                (cita.id_cita.toString().startsWith("gc_") ||
                  cita.id_cita.toString().startsWith("oc_"))
              ) {
                uniqueId = String(cita.id_cita);
              }

              return {
                id: uniqueId,
                dateTime: fechaInicioUTC.toISOString(), // Guardar en formato ISO UTC
                dateTimeUTC: fechaInicioUTC, // Guardar objeto Date UTC para comparación rápida
                dateTimeEnd: fechaFinUTC.toISOString(), // Guardar fecha fin en formato ISO UTC
                dateTimeEndUTC: fechaFinUTC, // Guardar objeto Date UTC para fecha fin
                duration,
                estado: cita.estado || "confirmada",
                fuente: cita.fuente || "plataforma",
                titulo: cita.titulo || null,
              };
            });
            
            setExistingAppointments(appointments);
          }
        }
      } catch (error) {
        console.error("Error al refrescar horarios ocupados:", error);
      }
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedPrice || !selectedDate || !selectedTimeSlot) return;

    // Validar que el horario seleccionado no esté ocupado ANTES de continuar
    const selectedSlot = timeSlots.find((slot) => slot.time === selectedTimeSlot);
    if (!selectedSlot || !selectedSlot.available) {
      alert(
        "Este horario ya no está disponible. El profesional ya tiene una cita en este horario. Por favor, selecciona otro horario."
      );
      return;
    }

    if (tiposAtencionDisponibles.length > 0 && !selectedTipoAtencion) {
      alert(
        "Por favor, selecciona un tipo de atención antes de confirmar la cita."
      );
      return;
    }

    if (selectedTipoAtencion === "a_domicilio") {
      if (!direccionDomicilio || direccionDomicilio.trim() === "") {
        alert(
          "Por favor, proporciona tu dirección completa para la atención a domicilio."
        );
        return;
      }

      if (!codigoPostal || codigoPostal.trim() === "") {
        alert("Por favor, ingresa el código postal de tu dirección.");
        return;
      }

      // Validar código postal
      const validacion = validarCodigoPostal(codigoPostal);
      if (!validacion.valido) {
        alert(
          validacion.error ||
            "El código postal ingresado no es válido para este profesional."
        );
        setCodigoPostalError(validacion.error);
        return;
      }
    }

    // SIEMPRE redirigir a la página de confirmación para permitir agregar notas
    // independientemente de si el usuario está autenticado o no
    try {
      // Construimos primero los parámetros base de la cita
      const queryParams = new URLSearchParams();

      // Datos básicos de la cita
      queryParams.set("category", params.category);
      queryParams.set("service", params.service);
      queryParams.set("professionalSlug", params.professional);
      queryParams.set("professionalId", String(professional.id || ""));
      queryParams.set("professionalName", professional.name || "");
      if (professional.city) {
        queryParams.set("professionalCity", professional.city);
      }

      // Foto de perfil (si existe)
      const raw = (professional as any).raw;
      const profileImageUrl =
        (professional as any).profileImage ||
        raw?.foto_perfil ||
        raw?.imagen_perfil ||
        raw?.enlace_publico ||
        "";
      if (profileImageUrl) {
        queryParams.set("professionalImage", profileImageUrl);
      }

      // Datos del servicio/precio
      queryParams.set(
        "serviceName",
        selectedPrice.nombre_servicio || "Servicio"
      );
      queryParams.set("price", String(selectedPrice.precio ?? 0));
      queryParams.set("currency", selectedPrice.moneda || "EUR");
      queryParams.set("precioId", String(selectedPrice.id_precio || ""));
      if (selectedPrice.duracion) {
        queryParams.set("duration", selectedPrice.duracion);
      }

      // Fecha y hora seleccionadas
      queryParams.set("dateISO", selectedDate.toISOString());
      queryParams.set("time", selectedTimeSlot);

      // Tipo de atención
      if (selectedTipoAtencion) {
        queryParams.set("tipoAtencion", selectedTipoAtencion);
      }

      // Dirección y código postal solo para atención a domicilio
      if (selectedTipoAtencion === "a_domicilio" && direccionDomicilio) {
        queryParams.set("direccionDomicilio", direccionDomicilio);
        if (codigoPostal) {
          queryParams.set("codigoPostal", codigoPostal);
        }
      }

      // Snapshot de impuestos para que la tarjeta sea idéntica
      if (taxInfo) {
        queryParams.set("taxBase", String(taxInfo.base));
        queryParams.set("taxAmount", String(taxInfo.tax));
        queryParams.set("taxTotal", String(taxInfo.total));
        queryParams.set("taxPercentage", String(taxInfo.taxPercentage ?? 0));
        queryParams.set("taxIsExempt", taxInfo.isExempt ? "true" : "false");
      }

      // Si el usuario NO está autenticado, queremos que tras registrarse vuelva a la propia
      // página de confirmación (con la misma info de la cita).
      if (!isAuthenticated || !user) {
        const baseConfirmQuery = queryParams.toString();
        const confirmReturnUrl = `/confirmar-cita?${baseConfirmQuery}`;
        queryParams.set("returnUrl", confirmReturnUrl);
      }

      const confirmPath = `/confirmar-cita?${queryParams.toString()}`;
      router.push(confirmPath);
      return;
    } catch (error) {
      console.error("Error al construir URL de confirmación:", error);
      // Fallback: si algo falla al construir la URL y el usuario no está autenticado, redirigir al login
      if (!isAuthenticated || !user) {
        router.push(
          "/iniciar-sesion?redirect=" +
          encodeURIComponent(window.location.pathname)
        );
      } else {
        alert("Error al redirigir a la página de confirmación. Intenta de nuevo.");
      }
      return;
    }
  };

  // Obtener stripe_tax_code desde la especialidad del profesional
  useEffect(() => {
    const fetchStripeTaxCode = async () => {
      try {
        const raw: any = professional as any;
        // Intentar obtener desde el objeto professional
        let taxCode =
          raw?.stripe_tax_code ||
          raw?.raw?.stripe_tax_code ||
          raw?.raw?.especialidad?.stripe_tax_code ||
          null;

        // Si no está disponible, intentar obtener desde el backend usando id_especialidad
        if (!taxCode) {
          const idEspecialidad =
            raw?.id_especialidad ||
            raw?.raw?.id_especialidad ||
            raw?.raw?.especialidad?.id_especialidad ||
            null;

          if (idEspecialidad) {
            const apiBaseUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
            const response = await fetch(
              `${apiBaseUrl}/especialidades/${idEspecialidad}`
            );
            if (response.ok) {
              const data = await response.json();
              taxCode =
                data.data?.stripe_tax_code || data.stripe_tax_code || null;
            }
          }
        }

        setStripeTaxCode(taxCode);
      } catch (error) {
        console.warn(
          "[SelectTimePageClient] Error al obtener stripe_tax_code:",
          error
        );
        // Si hay error, intentar determinar por el nombre de la especialidad
        const raw: any = professional as any;
        const specialtyName = (
          raw?.specialty ||
          raw?.raw?.especialidad?.nombre ||
          raw?.raw?.nombre_especialidad ||
          ""
        ).toLowerCase();

        // Servicios sanitarios (exentos de IVA)
        if (
          specialtyName.includes("psicología") ||
          specialtyName.includes("psicologia") ||
          specialtyName.includes("nutrición") ||
          specialtyName.includes("nutricion") ||
          specialtyName.includes("fisioterapia") ||
          specialtyName.includes("logopedia") ||
          specialtyName.includes("desarrollo personal")
        ) {
          setStripeTaxCode("txcd_10000000");
        }
        // Servicios legales (con IVA)
        else if (specialtyName.includes("legal")) {
          setStripeTaxCode("txcd_10000001");
        }
      }
    };

    fetchStripeTaxCode();
  }, [professional]);

  // Calcular información de impuestos basándome en el stripe_tax_code
  const taxInfo = useMemo(() => {
    if (!selectedPrice) return null;

    const baseAmount = selectedPrice.precio;
    let taxPercentage = 0;
    let isExempt = false;

    // Determinar porcentaje de impuestos según el código
    if (stripeTaxCode === "txcd_10000000") {
      // Servicios sanitarios - IVA exento en España
      taxPercentage = 0;
      isExempt = true;
    } else if (stripeTaxCode === "txcd_10000001") {
      // Servicios legales - IVA 21% en España
      taxPercentage = 21;
      isExempt = false;
    } else {
      // Por defecto, asumir exento si no hay código
      taxPercentage = 0;
      isExempt = true;
    }

    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;

    return {
      base: baseAmount,
      tax: taxAmount,
      total: totalAmount,
      taxPercentage,
      isExempt,
    };
  }, [selectedPrice, stripeTaxCode]);

  // Obtener códigos postales
  const codigosPostalesDomicilio = useMemo(() => {
    const raw: any = professional as any;
    let codigos =
      raw?.codigos_postales_domicilio ||
      raw?.homeVisitPostalCodes ||
      raw?.codigosPostales ||
      null;

    if (!codigos && raw?.raw) {
      codigos =
        raw.raw?.codigos_postales_domicilio ||
        raw.raw?.homeVisitPostalCodes ||
        raw.raw?.codigosPostales ||
        null;
    }

    if (codigos && typeof codigos === "string" && codigos.trim()) {
      return codigos.trim();
    }

    return null;
  }, [professional]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-purple-600 mb-2">
              Selecciona el horario que deseas
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Selecciona la hora de tu cita
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Time Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Date Picker */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
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
                  <div className="flex w-full max-w-full gap-2 mb-6 overflow-x-auto snap-x snap-mandatory px-1 sm:px-2">
                    {availableDays.slice(0, 14).map((day, i) => {
                      const isSelected =
                        selectedDate &&
                        day.date.getTime() === selectedDate.getTime();
                      return (
                        <button
                          key={i}
                          onClick={() => handleDateSelect(day.date)}
                          className={`px-3 py-2 rounded-md text-sm whitespace-nowrap snap-center ${isSelected
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
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    <p className="mb-2">No hay fechas disponibles</p>
                    {!selectedPrice && (
                      <p className="text-sm text-gray-400">
                        Selecciona un paquete de precios primero
                      </p>
                    )}
                    {!selectedTipoAtencion && (
                      <p className="text-sm text-gray-400">
                        Selecciona un tipo de atención primero
                      </p>
                    )}
                    {horariosCargados.length === 0 && (
                      <p className="text-sm text-gray-400">
                        Cargando horarios...
                      </p>
                    )}
                  </div>
                )}

                {/* Time Slots */}
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
                      {timeSlots.map((slot, idx) => {
                        const handleSlotClick = () => {
                          if (!slot.available) {
                            alert(
                              "Este horario no está disponible. El profesional ya tiene una cita en este horario."
                            );
                            return;
                          }
                          setSelectedTimeSlot(slot.time);
                        };

                        return (
                          <button
                            key={idx}
                            onClick={handleSlotClick}
                            disabled={!slot.available}
                            className={`w-full text-left px-3 md:px-4 py-3 md:py-4 rounded-xl border flex items-center justify-between transition-all ${selectedTimeSlot === slot.time
                              ? "bg-purple-100 border-purple-300 text-purple-800 shadow-md"
                              : !slot.available
                                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                                : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm"
                              }`}
                          >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${slot.available ? "bg-green-500" : "bg-gray-400"
                                }`}
                            ></div>
                            <span
                              className={`text-sm font-medium ${!slot.available && "line-through"
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
                          {slot.available && (
                            <div className="flex items-center gap-2">
                              {selectedTimeSlot === slot.time && (
                                <span className="text-xs text-purple-700 font-medium">
                                  Horario Seleccionado
                                </span>
                              )}
                              <svg
                                className="w-4 h-4 text-gray-400"
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
                            </div>
                          )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Selecciona una fecha para ver los horarios disponibles
                  </p>
                )}
              </div>


              {/* Campo de dirección y código postal para citas a domicilio */}
              {selectedTipoAtencion === "a_domicilio" && (
                <div className="mb-6">
                  {codigosPostalesDomicilio && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Zonas de servicio
                          </h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Este profesional ofrece atención a domicilio en los
                            siguientes códigos postales:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {codigosPostalesDomicilio
                              .split(/[,\s]+/)
                              .filter((cp: string) => cp.trim())
                              .map((cp: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {cp.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Código Postal */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={codigoPostal}
                      onChange={(e) => {
                        // Solo permitir números y máximo 5 dígitos
                        const valor = e.target.value.replace(/\D/g, "").slice(0, 5);
                        setCodigoPostal(valor);

                        // Validar en tiempo real si hay texto
                        if (valor.trim().length > 0) {
                          const validacion = validarCodigoPostal(valor);
                          setCodigoPostalError(validacion.error);
                        } else {
                          setCodigoPostalError(null);
                        }
                      }}
                      onBlur={() => {
                        if (codigoPostal.trim().length > 0) {
                          const validacion = validarCodigoPostal(codigoPostal);
                          setCodigoPostalError(validacion.error);
                        }
                      }}
                      placeholder="28001"
                      maxLength={5}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        codigoPostalError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-primary focus:ring-primary/20"
                      }`}
                      required
                    />
                    {codigoPostalError ? (
                      <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
                        <svg
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{codigoPostalError}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa el código postal de tu dirección
                      </p>
                    )}
                  </div>

                  {/* Dirección completa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección para atención a domicilio{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={direccionDomicilio}
                      onChange={(e) => setDireccionDomicilio(e.target.value)}
                      placeholder="Ingresa tu dirección completa (calle, número, ciudad)"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Professional Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const raw = (professional as any).raw;
                    const profileImageUrl =
                      professional.profileImage ||
                      raw?.foto_perfil ||
                      raw?.imagen_perfil ||
                      raw?.enlace_publico ||
                      null;

                    return profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt={professional.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                        {professional.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedPrice?.nombre_servicio || "Servicio"}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {professional.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {professional.city || "Ciudad no especificada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Resumen de tu cita
                </h3>
                {selectedPrice && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {selectedPrice.nombre_servicio}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPrice.duracion || "1h"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPrice.precio.toFixed(2)}€
                      </span>
                    </div>
                    {selectedDate && selectedTimeSlot && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fecha</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Hora</span>
                          <span className="text-sm font-medium text-gray-900">
                            {timeSlots.find((s) => s.time === selectedTimeSlot)
                              ?.displayTime || selectedTimeSlot}
                          </span>
                        </div>
                        {selectedTipoAtencion && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Tipo de atención</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {selectedTipoAtencion === "presencial"
                                ? "Presencial"
                                : selectedTipoAtencion === "en_linea"
                                ? "En Línea"
                                : "A Domicilio"}
                            </span>
                          </div>
                        )}
                        {selectedTipoAtencion === "en_linea" && (
                          <>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-gray-600">Plataforma</span>
                              <span className="text-sm font-medium text-green-600">
                                Google Meet
                              </span>
                            </div>
                            {codigoPostal && (
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600">Código Postal</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {codigoPostal}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {selectedTipoAtencion === "a_domicilio" && codigoPostal && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Código Postal</span>
                            <span className="text-sm font-medium text-gray-900">
                              {codigoPostal}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Desglose de impuestos */}
                    {taxInfo && (
                      <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Subtotal (sin impuestos):
                          </span>
                          <span className="font-medium text-gray-900">
                            {taxInfo.base.toFixed(2)}€
                          </span>
                        </div>
                        {!taxInfo.isExempt && taxInfo.tax > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Impuestos (IVA {taxInfo.taxPercentage}%):
                            </span>
                            <span className="font-medium text-gray-900">
                              {taxInfo.tax.toFixed(2)}€
                            </span>
                          </div>
                        )}
                        {taxInfo.isExempt && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Impuestos:</span>
                            <span className="font-medium text-green-600">
                              Exento
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-900">
                              Total
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {taxInfo.total.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {!taxInfo && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-900">
                            Total
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            {selectedPrice.precio.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleConfirmAppointment}
                disabled={
                  !selectedPrice ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  isCreatingAppointment ||
                  (selectedTipoAtencion === "a_domicilio" &&
                    (!direccionDomicilio.trim() ||
                      !codigoPostal.trim() ||
                      !!codigoPostalError))
                }
                className="w-full bg-[#1a0082] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a0082]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingAppointment ? "Procesando..." : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
