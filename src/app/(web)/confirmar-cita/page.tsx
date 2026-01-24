"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { citasService, professionalsService } from "@/services";
import { ApiProfessional } from "@/services/types/api";
import { createSpainLocalDateUTC } from "@/services/utils/api-helpers";

// Función helper para enviar logs al backend (consola de Node)
const logToBackend = async (level: "info" | "warn" | "error" | "debug", message: string, data?: any) => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    await fetch(`${apiBaseUrl}/debug/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level,
        message,
        data,
        component: "ConfirmarCita",
      }),
    });
  } catch (err) {
    // Silenciar errores de logging para no interrumpir el flujo
    console.warn("[ConfirmarCita] No se pudo enviar log al backend:", err);
  }
};

function ConfirmarCitaAuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [notas, setNotas] = useState("");
  const [direccionDomicilio, setDireccionDomicilio] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [codigoPostalError, setCodigoPostalError] = useState<string | null>(null);
  const [professionalData, setProfessionalData] = useState<ApiProfessional | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [error, setError] = useState("");

  // Leer notas, dirección y código postal de los searchParams si vienen del redirect
  useEffect(() => {
    const notesFromUrl = searchParams.get("notes");
    if (notesFromUrl) {
      setNotas(decodeURIComponent(notesFromUrl));
    }
    const direccionFromUrl = searchParams.get("direccionDomicilio");
    if (direccionFromUrl) {
      setDireccionDomicilio(decodeURIComponent(direccionFromUrl));
    }
    const codigoPostalFromUrl = searchParams.get("codigoPostal");
    if (codigoPostalFromUrl) {
      setCodigoPostal(decodeURIComponent(codigoPostalFromUrl));
    }
  }, [searchParams]);

  // Cargar información del profesional para obtener códigos postales
  useEffect(() => {
    const loadProfessionalData = async () => {
      const professionalIdParam = searchParams.get("professionalId");
      const professionalSlug = searchParams.get("professionalSlug");
      
      if (professionalIdParam || professionalSlug) {
        try {
          let professionalResponse;
          if (professionalSlug) {
            professionalResponse = await professionalsService.getPublicProfessionalById(professionalSlug);
          } else if (professionalIdParam) {
            // Si tenemos el ID, necesitamos obtener el slug primero o usar otro método
            // Por ahora, intentar con el slug si está disponible
            return;
          }
          
          if (professionalResponse?.success && professionalResponse.data) {
            setProfessionalData(professionalResponse.data);
          }
        } catch (error) {
          console.warn("[ConfirmarCita] Error al cargar datos del profesional:", error);
        }
      }
    };

    loadProfessionalData();
  }, [searchParams]);

  // Obtener códigos postales del profesional
  const codigosPostalesDomicilio = useMemo(() => {
    if (!professionalData) return null;
    const raw: any = professionalData as any;
    let codigos =
      raw?.codigos_postales_domicilio ||
      raw?.homeVisitPostalCodes ||
      raw?.codigosPostales ||
      (professionalData as any)?.codigosPostalesDomicilio ||
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
  }, [professionalData]);

  // Validar código postal
  const validarCodigoPostal = (cp: string): { valido: boolean; error: string | null } => {
    if (!codigosPostalesDomicilio || !codigosPostalesDomicilio.trim()) {
      return { valido: true, error: null };
    }

    const codigoPostalIngresado = cp.trim();

    if (!codigoPostalIngresado) {
      return {
        valido: false,
        error: "Por favor, ingresa un código postal.",
      };
    }

    if (!/^\d{5}$/.test(codigoPostalIngresado)) {
      return {
        valido: false,
        error: "El código postal debe tener 5 dígitos.",
      };
    }

    const codigosProfesional = codigosPostalesDomicilio
      .split(/[,\s]+/)
      .map((cpItem) => cpItem.trim())
      .filter((cpItem) => cpItem.length > 0);

    const codigoEncontrado = codigosProfesional.find(
      (cpProf) => cpProf === codigoPostalIngresado
    );

    if (!codigoEncontrado) {
      return {
        valido: false,
        error: `El código postal ${codigoPostalIngresado} no está en las zonas de servicio del profesional. Códigos postales disponibles: ${codigosProfesional.join(", ")}`,
      };
    }

    return { valido: true, error: null };
  };

  const citaInfo = useMemo(() => {
    const dateISO = searchParams.get("dateISO") || "";
    const time = searchParams.get("time") || "";

    let fechaFormateada = "Fecha por confirmar";
    let fechaCorta = "";
    let horaFormateada = time;

    if (dateISO) {
      try {
        const date = new Date(dateISO);
        fechaFormateada = date.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        // Formato corto como en SelectTimePageClient (ej: "16 jul")
        fechaCorta = date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });

        // Formatear hora desde el time slot
        if (time) {
          const [hours, minutes] = time.split(":").map(Number);
          const period = hours >= 12 ? "pm" : "am";
          const hours12 = hours % 12 || 12;
          horaFormateada = `${hours12}:${minutes
            .toString()
            .padStart(2, "0")}${period}`;
        } else {
          horaFormateada = date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
      } catch {
        // Ignorar error de parseo y usar valores por defecto
      }
    }

    const price = Number(searchParams.get("price") || 0);
    const currency = searchParams.get("currency") || "EUR";
    const duration = searchParams.get("duration") || "1h";

    // Calcular hora de fin
    let horaFinFormateada = "";
    if (dateISO && time) {
      try {
        const date = new Date(dateISO);
        const [hours, minutes] = time.split(":").map(Number);
        const durationMinutes = parseInt(duration.replace(/\D/g, "")) || 60;
        const endDate = new Date(date);
        endDate.setHours(hours, minutes + durationMinutes, 0, 0);
        const endHours = endDate.getHours();
        const endMinutes = endDate.getMinutes();
        const period = endHours >= 12 ? "pm" : "am";
        const hours12 = endHours % 12 || 12;
        horaFinFormateada = `${hours12}:${endMinutes
          .toString()
          .padStart(2, "0")}${period}`;
      } catch {
        // Ignorar error
      }
    }

    const returnUrl = searchParams.get("returnUrl") || "";

    // Imagen del profesional (puede venir vacía)
    const professionalImage = searchParams.get("professionalImage") || "";

    // Snapshot de impuestos (si viene)
    const taxBaseParam = searchParams.get("taxBase");
    const taxAmountParam = searchParams.get("taxAmount");
    const taxTotalParam = searchParams.get("taxTotal");
    const taxPercentageParam = searchParams.get("taxPercentage");
    const taxIsExemptParam = searchParams.get("taxIsExempt");

    const taxInfo =
      taxBaseParam && taxTotalParam
        ? {
          base: Number(taxBaseParam),
          tax: Number(taxAmountParam || 0),
          total: Number(taxTotalParam),
          taxPercentage: Number(taxPercentageParam || 0),
          isExempt: taxIsExemptParam === "true",
        }
        : null;

    // Parámetros adicionales necesarios para crear la cita
    const professionalSlug = searchParams.get("professionalSlug") || "";
    const category = searchParams.get("category") || "";
    const service = searchParams.get("service") || "";
    const precioId = searchParams.get("precioId") || "";
    const tipoAtencion = searchParams.get("tipoAtencion") || "presencial";
    const direccionDomicilioParam = searchParams.get("direccionDomicilio") || "";
    const codigoPostalParam = searchParams.get("codigoPostal") || "";

    return {
      professionalName: searchParams.get("professionalName") || "Profesional",
      professionalCity:
        searchParams.get("professionalCity") || "Ciudad no especificada",
      serviceName: searchParams.get("serviceName") || "Servicio",
      duration,
      fechaFormateada,
      fechaCorta,
      horaFormateada,
      horaFinFormateada,
      price,
      currency,
      returnUrl,
      professionalImage,
      taxInfo,
      // Parámetros adicionales
      dateISO,
      time,
      professionalSlug,
      category,
      service,
      precioId,
      tipoAtencion,
      direccionDomicilioParam,
      codigoPostalParam,
    };
  }, [searchParams]);

  const registroHref = useMemo(() => {
    const base = "/registro";
    const redirectTarget = citaInfo.returnUrl || "/";
    const separator = redirectTarget.includes("?") ? "&" : "?";
    const targetWithNotes = notas
      ? `${redirectTarget}${separator}notes=${encodeURIComponent(notas)}`
      : redirectTarget;

    const params = new URLSearchParams();
    params.set("redirect", targetWithNotes);
    return `${base}?${params.toString()}`;
  }, [citaInfo.returnUrl, notas]);

  const loginHref = useMemo(() => {
    const base = "/iniciar-sesion";
    const redirectTarget = citaInfo.returnUrl || "/";
    const separator = redirectTarget.includes("?") ? "&" : "?";
    const targetWithNotes = notas
      ? `${redirectTarget}${separator}notes=${encodeURIComponent(notas)}`
      : redirectTarget;

    const params = new URLSearchParams();
    params.set("redirect", targetWithNotes);
    return `${base}?${params.toString()}`;
  }, [citaInfo.returnUrl, notas]);

  // Función para crear la cita y proceder al pago
  const handleConfirmAndPay = async () => {
    if (!isAuthenticated || !user) {
      setError("Debes iniciar sesión para continuar");
      return;
    }

    if (!citaInfo.dateISO || !citaInfo.time || !citaInfo.precioId) {
      setError("Faltan datos necesarios para crear la cita");
      return;
    }

    // Validar dirección y código postal solo para atención a domicilio
    if (citaInfo.tipoAtencion === "a_domicilio") {
      if (!direccionDomicilio.trim()) {
        setError("Por favor, proporciona tu dirección para la atención a domicilio.");
        return;
      }
      if (!codigoPostal.trim()) {
        setError("Por favor, ingresa el código postal de tu dirección.");
        return;
      }
      const validacion = validarCodigoPostal(codigoPostal);
      if (!validacion.valido) {
        setError(validacion.error || "El código postal ingresado no es válido.");
        setCodigoPostalError(validacion.error);
        return;
      }
    }

    setIsCreatingAppointment(true);
    setError("");

    try {
      // Calcular fecha de inicio y fin
      const date = new Date(citaInfo.dateISO);
      const [hours, minutes] = citaInfo.time.split(":").map(Number);
      const durationMinutes = parseInt(citaInfo.duration.replace(/\D/g, "")) || 60;

      // Crear fecha UTC que representa la hora seleccionada en España
      // IMPORTANTE: Las horas seleccionadas son hora España, no UTC
      const fechaInicio = createSpainLocalDateUTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0
      );
      const fechaFin = new Date(
        fechaInicio.getTime() + durationMinutes * 60000
      );

      // Obtener el ID del profesional
      // Primero intentar desde los queryParams, si no está, obtenerlo desde el slug
      let professionalId: number | null = null;
      
      const professionalIdParam = searchParams.get("professionalId");
      if (professionalIdParam) {
        professionalId = Number(professionalIdParam);
      } else if (citaInfo.professionalSlug) {
        // Si no hay ID en los params, obtenerlo desde el slug usando el servicio
        const professionalResponse = await professionalsService.getPublicProfessionalById(
          citaInfo.professionalSlug
        );
        
        if (!professionalResponse.success || !professionalResponse.data) {
          throw new Error("No se pudo obtener la información del profesional");
        }
        
        professionalId = Number(professionalResponse.data.id);
      }

      if (!professionalId) {
        throw new Error("No se pudo obtener el ID del profesional");
      }

      // Crear la cita
      const response = await citasService.createCita({
        id_cliente: Number(user.id || 0),
        id_profesional: Number(professionalId),
        id_precio: Number(citaInfo.precioId),
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        crear_payment_intent: true,
        moneda: citaInfo.currency || "EUR",
        tipo_atencion: (citaInfo.tipoAtencion || "presencial") as
          | "presencial"
          | "en_linea"
          | "a_domicilio",
        direccion_domicilio:
          citaInfo.tipoAtencion === "a_domicilio"
            ? `${direccionDomicilio.trim()}${codigoPostal.trim() ? `, ${codigoPostal.trim()}` : ""}`
            : undefined,
        notas: notas.trim() || undefined,
      });

      // Log completo de la respuesta RAW antes de procesar
      console.log("[ConfirmarCita] 🔍 Respuesta RAW completa:", JSON.stringify(response, null, 2));
      logToBackend("info", "Respuesta RAW completa de crearCita", response);

      // El apiClient devuelve { success: true, data: <backendResponse> }
      // El backend devuelve { success, message, data: CreateCitaResponse }
      // Por compatibilidad, desestructuramos así:
      const backendRaw: any = response.data;
      const citaData: any = backendRaw?.data ?? backendRaw;

      if (response.success && citaData && (citaData.cita || citaData.pago || citaData.redirectToPayment)) {
        // Guardar logs en localStorage para que persistan después de la redirección
        const logData = {
          timestamp: new Date().toISOString(),
          success: response.success,
          backendResponseStructure: {
            hasCita: !!citaData?.cita,
            hasPago: !!citaData?.pago,
            hasRedirectToPayment: !!citaData?.redirectToPayment,
            keys: citaData ? Object.keys(citaData) : [],
          },
          hasRedirectToPayment: !!citaData.redirectToPayment,
          redirectToPayment: citaData.redirectToPayment,
          hasPaymentIntent: !!citaData.paymentIntent,
          paymentIntent: citaData.paymentIntent,
          cita: citaData.cita,
          pago: citaData.pago,
          // Agregar toda la estructura para debugging
          fullCitaData: citaData,
        };
        
        console.log("[ConfirmarCita] Respuesta completa de crearCita:", logData);
        
        // Enviar log al backend (consola de Node) - NO bloquea la ejecución
        logToBackend("info", "Respuesta completa de crearCita", logData);
        
        // Guardar en localStorage para debugging
        try {
          localStorage.setItem("lastCitaResponse", JSON.stringify(logData));
        } catch (e) {
          console.warn("[ConfirmarCita] No se pudo guardar en localStorage:", e);
        }

        // Intentar obtener la URL de redirección de diferentes formas
        // Usar citaData que ya tiene la estructura correcta: { cita, pago, paymentIntent, redirectToPayment, ... }
        let paymentUrl: string | null = null;

        // Opción 1: Desde redirectToPayment.url (puede incluir query params)
        if (citaData.redirectToPayment?.url) {
          paymentUrl = citaData.redirectToPayment.url;
          
          // Si tenemos clientSecret y paymentIntentId, agregarlos como query params
          if (citaData.redirectToPayment.clientSecret && citaData.redirectToPayment.paymentIntentId) {
            const urlObj = new URL(paymentUrl, window.location.origin);
            urlObj.searchParams.set("clientSecret", citaData.redirectToPayment.clientSecret);
            urlObj.searchParams.set("paymentIntentId", citaData.redirectToPayment.paymentIntentId);
            if (citaData.pago?.monto) {
              urlObj.searchParams.set("amount", String(citaData.pago.monto));
            }
            if (citaInfo.currency) {
              urlObj.searchParams.set("currency", citaInfo.currency);
            }
            // Agregar información adicional de la cita
            if (citaInfo.fechaFormateada) {
              urlObj.searchParams.set("fecha", citaInfo.fechaFormateada);
            }
            if (citaInfo.dateISO) {
              urlObj.searchParams.set("fechaISO", citaInfo.dateISO);
            }
            if (citaInfo.horaFormateada) {
              urlObj.searchParams.set("hora", citaInfo.horaFormateada);
            }
            if (citaInfo.professionalName) {
              urlObj.searchParams.set("profesional", citaInfo.professionalName);
            }
            if (citaInfo.serviceName) {
              urlObj.searchParams.set("servicio", citaInfo.serviceName);
            }
            if (citaInfo.professionalImage) {
              urlObj.searchParams.set("professionalImage", citaInfo.professionalImage);
            }
            if (citaInfo.professionalCity) {
              urlObj.searchParams.set("professionalCity", citaInfo.professionalCity);
            }
            if (citaInfo.duration) {
              urlObj.searchParams.set("duration", citaInfo.duration);
            }
            if (citaInfo.price) {
              urlObj.searchParams.set("price", String(citaInfo.price));
            }
            if (citaInfo.tipoAtencion) {
              urlObj.searchParams.set("tipoAtencion", citaInfo.tipoAtencion);
            }
            // La dirección del consultorio y link de videollamada vienen de la respuesta del backend (dentro de citaData.cita)
            if (citaData.cita?.direccion_consultorio) {
              urlObj.searchParams.set("direccionConsultorio", citaData.cita.direccion_consultorio);
            }
            if (citaData.cita?.link_videollamada) {
              urlObj.searchParams.set("linkVideollamada", citaData.cita.link_videollamada);
            }
            if (citaInfo.direccionDomicilioParam) {
              urlObj.searchParams.set("direccionDomicilio", citaInfo.direccionDomicilioParam);
            }
            paymentUrl = urlObj.pathname + urlObj.search;
          }
        }
        // Opción 2: Construir desde paymentIntent y pago
        else if (citaData.paymentIntent?.clientSecret && citaData.pago?.id_pago) {
          const urlObj = new URL(`/pago/${citaData.pago.id_pago}`, window.location.origin);
          urlObj.searchParams.set("clientSecret", citaData.paymentIntent.clientSecret);
          if (citaData.paymentIntent.paymentIntentId) {
            urlObj.searchParams.set("paymentIntentId", citaData.paymentIntent.paymentIntentId);
          }
          if (citaData.pago.monto) {
            urlObj.searchParams.set("amount", String(citaData.pago.monto));
          }
          if (citaInfo.currency) {
            urlObj.searchParams.set("currency", citaInfo.currency);
          }
          // Agregar información adicional de la cita
          if (citaInfo.fechaFormateada) {
            urlObj.searchParams.set("fecha", citaInfo.fechaFormateada);
          }
          if (citaInfo.dateISO) {
            urlObj.searchParams.set("fechaISO", citaInfo.dateISO);
          }
          if (citaInfo.horaFormateada) {
            urlObj.searchParams.set("hora", citaInfo.horaFormateada);
          }
          if (citaInfo.professionalName) {
            urlObj.searchParams.set("profesional", citaInfo.professionalName);
          }
          if (citaInfo.serviceName) {
            urlObj.searchParams.set("servicio", citaInfo.serviceName);
          }
          if (citaInfo.professionalImage) {
            urlObj.searchParams.set("professionalImage", citaInfo.professionalImage);
          }
          if (citaInfo.professionalCity) {
            urlObj.searchParams.set("professionalCity", citaInfo.professionalCity);
          }
          if (citaInfo.duration) {
            urlObj.searchParams.set("duration", citaInfo.duration);
          }
          if (citaInfo.price) {
            urlObj.searchParams.set("price", String(citaInfo.price));
          }
          if (citaInfo.tipoAtencion) {
            urlObj.searchParams.set("tipoAtencion", citaInfo.tipoAtencion);
          }
          // La dirección del consultorio y link de videollamada vienen de la respuesta del backend
          if ((citaData as any).direccion_consultorio) {
            urlObj.searchParams.set("direccionConsultorio", (citaData as any).direccion_consultorio);
          }
          if ((citaData as any).link_videollamada) {
            urlObj.searchParams.set("linkVideollamada", (citaData as any).link_videollamada);
          }
          if (citaInfo.direccionDomicilioParam) {
            urlObj.searchParams.set("direccionDomicilio", citaInfo.direccionDomicilioParam);
          }
          if (codigoPostal.trim()) {
            urlObj.searchParams.set("codigoPostal", codigoPostal.trim());
          }
          paymentUrl = urlObj.pathname + urlObj.search;
        }
        // Opción 3: Construir desde id_pago (sin clientSecret, la página lo obtendrá del backend)
        else if (citaData.pago?.id_pago) {
          paymentUrl = `/pago/${citaData.pago.id_pago}`;
        }

        if (paymentUrl) {
          console.log("[ConfirmarCita] ✅ URL de pago encontrada:", paymentUrl);
          
          // Enviar log al backend (consola de Node)
          logToBackend("info", `URL de pago encontrada: ${paymentUrl}`, {
            paymentUrl,
            hasRedirectToPayment: !!response.data.redirectToPayment,
            hasPaymentIntent: !!response.data.paymentIntent,
            pagoId: response.data.pago?.id_pago,
          });
          
          // Guardar URL en localStorage para debugging
          try {
            localStorage.setItem("lastPaymentUrl", paymentUrl);
            localStorage.setItem("lastPaymentUrlTimestamp", new Date().toISOString());
          } catch (e) {
            console.warn("[ConfirmarCita] No se pudo guardar URL en localStorage:", e);
          }
          
          console.log("[ConfirmarCita] Intentando redirigir a:", paymentUrl);
          
          // Usar window.location.href directamente para asegurar la redirección
          // Esto evita problemas con router que pueden no funcionar en algunos casos
          window.location.href = paymentUrl;
        } else {
          // Si no hay URL de pago, intentar construirla desde id_pago
          console.warn(
            "[ConfirmarCita] ⚠️ No se encontró URL de pago en la respuesta",
            {
              redirectToPayment: response.data.redirectToPayment,
              paymentIntent: response.data.paymentIntent,
              pago: response.data.pago,
              cita: response.data.cita,
            }
          );
          
          // Último intento: construir URL desde id_pago
          if (citaData.pago?.id_pago) {
            const fallbackUrl = `/pago/${citaData.pago.id_pago}`;
            console.log("[ConfirmarCita] ⚠️ Usando URL de fallback:", fallbackUrl);
            
            // Enviar log al backend (consola de Node)
            logToBackend("warn", `Usando URL de fallback: ${fallbackUrl}`, {
              fallbackUrl,
              pagoId: citaData.pago.id_pago,
              hasRedirectToPayment: !!citaData.redirectToPayment,
              hasPaymentIntent: !!citaData.paymentIntent,
            });
            
            // Guardar en localStorage para debugging
            try {
              localStorage.setItem("lastPaymentUrl", fallbackUrl);
              localStorage.setItem("lastPaymentUrlTimestamp", new Date().toISOString());
              localStorage.setItem("lastCitaResponse", JSON.stringify({
                timestamp: new Date().toISOString(),
                usedFallback: true,
                pagoId: citaData.pago.id_pago,
              }));
            } catch (e) {
              console.warn("[ConfirmarCita] No se pudo guardar en localStorage:", e);
            }
            
            // Usar window.location.href para asegurar la redirección
            window.location.href = fallbackUrl;
          } else {
            // Si no hay id_pago, redirigir a las citas del cliente
            const errorData = {
              hasPago: !!citaData.pago,
              pagoId: citaData.pago?.id_pago,
              hasCita: !!citaData.cita,
              citaId: citaData.cita?.id_cita,
              hasRedirectToPayment: !!citaData.redirectToPayment,
              hasPaymentIntent: !!citaData.paymentIntent,
              backendResponseKeys: backendRaw ? Object.keys(backendRaw) : [],
              citaDataKeys: citaData ? Object.keys(citaData) : [],
            };
            
            console.error("[ConfirmarCita] ❌ No se pudo determinar URL de pago ni id_pago");
            console.error("[ConfirmarCita] Datos disponibles:", errorData);
            
            // Enviar error al backend (consola de Node)
            logToBackend("error", "No se pudo determinar URL de pago ni id_pago", errorData);
            
            // Guardar error en localStorage
            try {
              localStorage.setItem("lastCitaError", JSON.stringify({
                timestamp: new Date().toISOString(),
                error: "No se pudo determinar URL de pago",
                data: errorData,
              }));
            } catch (e) {
              console.warn("[ConfirmarCita] No se pudo guardar error en localStorage:", e);
            }
            
            const citasUrl = `/dashboard/cliente/citas/${citaData.cita?.id_cita || ""}`;
            window.location.href = citasUrl;
          }
        }
      } else {
        // Manejar errores específicos
        const errorMessage = response.error || "";
        
        // Error de Stripe Tax (configuración faltante)
        if (
          errorMessage.includes("stripe") ||
          errorMessage.includes("tax") ||
          errorMessage.includes("head office address") ||
          errorMessage.includes("automatic tax calculation")
        ) {
          setError(
            "Error en la configuración de impuestos. Por favor, contacta al soporte o intenta más tarde."
          );
        } else {
          setError(errorMessage || "Error al crear la cita");
        }
      }
    } catch (err: any) {
      console.error("Error creating appointment:", err);
      
      // Enviar error al backend (consola de Node)
      logToBackend("error", "Error al crear la cita", {
        error: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      
      setError(
        err?.message || "Ocurrió un error al crear la cita. Intenta de nuevo."
      );
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        {/* Enlaces superiores de registro / login */}
        <div className="mb-6 text-center text-sm text-gray-600">
          <Link
            href={registroHref}
            className="text-purple-700 font-medium hover:underline"
          >
            Regístrate
          </Link>
          <span className="mx-1">|</span>
          <Link
            href={loginHref}
            className="text-purple-700 font-medium hover:underline"
          >
            Inicia Sesión
          </Link>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
          Confirma tu cita
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Columna izquierda: notas + acciones de registro/login */}
          <section className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Agrega notas para el profesional que te atenderá
              </h2>
              <p className="text-sm text-gray-500">
                Incluye comentarios o solicitudes adicionales para tu
                profesional.
              </p>
            </div>

            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-xl p-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none mb-8"
              placeholder="Escribe aquí cualquier información que quieras compartir..."
            />


            {/* Campo de dirección y código postal para citas a domicilio */}
            {citaInfo.tipoAtencion === "a_domicilio" && (
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={codigoPostal}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, "").slice(0, 5);
                      setCodigoPostal(valor);
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

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {isAuthenticated ? (
              // Si el usuario está autenticado, mostrar botón para crear cita y proceder al pago
              <div className="space-y-4 max-w-md">
                <button
                  onClick={handleConfirmAndPay}
                  disabled={
                    isCreatingAppointment ||
                    (citaInfo.tipoAtencion === "a_domicilio" &&
                      (!direccionDomicilio.trim() || !codigoPostal.trim() || !!codigoPostalError))
                  }
                  className="w-full flex items-center justify-center bg-[#4C1DFF] hover:bg-[#3b15cc] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingAppointment
                    ? "Procesando..."
                    : "Confirmar y proceder al pago"}
                </button>
                {citaInfo.tipoAtencion === "a_domicilio" &&
                  (!direccionDomicilio.trim() || !codigoPostal.trim()) && (
                    <p className="text-sm text-red-600 mt-2">
                      Por favor, proporciona tu dirección completa y código postal para la atención a
                      domicilio.
                    </p>
                  )}
              </div>
            ) : (
              // Si el usuario NO está autenticado, mostrar botones de login/registro
              <div className="space-y-4 max-w-md">
                <Link
                  href={registroHref}
                  className="w-full flex items-center justify-center bg-[#4C1DFF] hover:bg-[#3b15cc] text-white font-semibold py-3 rounded-full transition-colors"
                >
                  Regístrate para continuar
                </Link>

                <p className="text-center text-sm text-gray-500 mt-4">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href={loginHref}
                    className="text-purple-700 font-medium hover:underline"
                  >
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            )}
          </section>

          {/* Columna derecha: resumen de cita (copiada de SelectTimePageClient) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Professional Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {citaInfo.professionalImage ? (
                    <Image
                      src={citaInfo.professionalImage}
                      alt={citaInfo.professionalName}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-15 h-15 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                      {citaInfo.professionalName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">
                      {citaInfo.serviceName}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {citaInfo.professionalName}
                    </p>
                    {citaInfo.tipoAtencion !== "en_linea" && (
                      <p className="text-sm text-gray-500">
                        {citaInfo.professionalCity}
                      </p>
                    )}
                    {citaInfo.tipoAtencion === "en_linea" && (
                      <p className="text-sm text-green-600 font-medium">
                        Videollamada en línea
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Resumen de tu cita
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {citaInfo.serviceName}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {citaInfo.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precio</span>
                    <span className="text-sm font-medium text-gray-900">
                      {citaInfo.price.toFixed(2)}
                      {citaInfo.currency === "EUR" ? "€" : "$"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fecha</span>
                      <span className="text-sm font-medium text-gray-900">
                        {citaInfo.fechaCorta || citaInfo.fechaFormateada}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Hora</span>
                      <span className="text-sm font-medium text-gray-900">
                        {citaInfo.horaFormateada}
                      </span>
                    </div>
                    {citaInfo.tipoAtencion && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Tipo de atención</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {citaInfo.tipoAtencion === "presencial"
                            ? "Presencial"
                            : citaInfo.tipoAtencion === "en_linea"
                            ? "En Línea"
                            : "A Domicilio"}
                        </span>
                      </div>
                    )}
                    {citaInfo.tipoAtencion === "en_linea" && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Plataforma</span>
                        <span className="text-sm font-medium text-green-600">
                          Google Meet
                        </span>
                      </div>
                    )}
                    {citaInfo.tipoAtencion === "a_domicilio" && codigoPostal && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Código Postal</span>
                        <span className="text-sm font-medium text-gray-900">
                          {codigoPostal}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Desglose de impuestos */}
                  {citaInfo.taxInfo && (
                    <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Subtotal (sin impuestos):
                        </span>
                        <span className="font-medium text-gray-900">
                          {citaInfo.currency === "EUR" ? "€" : "$"}{" "}
                          {citaInfo.taxInfo.base.toFixed(2)}
                        </span>
                      </div>
                      {!citaInfo.taxInfo.isExempt &&
                        citaInfo.taxInfo.tax > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Impuestos (IVA {citaInfo.taxInfo.taxPercentage}%):
                            </span>
                            <span className="font-medium text-gray-900">
                              {citaInfo.currency === "EUR" ? "€" : "$"}{" "}
                              {citaInfo.taxInfo.tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                      {citaInfo.taxInfo.isExempt && (
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
                            {citaInfo.currency === "EUR" ? "€" : "$"}{" "}
                            {citaInfo.taxInfo.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!citaInfo.taxInfo && (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-bold text-gray-900">
                          {citaInfo.currency === "EUR" ? "€" : "$"}{" "}
                          {citaInfo.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmarCitaAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ConfirmarCitaAuthPageContent />
    </Suspense>
  );
}
