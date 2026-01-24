"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { citasService, pagosService } from "@/services";
import Image from "next/image";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Inicializar Stripe con la clave pública
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Solo inicializar Stripe si tenemos la clave
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [taxInfo, setTaxInfo] = useState<{
    base: number;
    tax: number;
    total: number;
    taxExempt: boolean;
  } | null>(null);

  // Obtener información de impuestos del Payment Intent cuando esté disponible
  useEffect(() => {
    const fetchTaxInfo = async () => {
      if (!stripe || !clientSecret) return;

      try {
        // Extraer payment_intent_id del clientSecret
        // El formato es: pi_xxx_secret_xxx
        const paymentIntentId = clientSecret.split("_secret_")[0];

        if (paymentIntentId) {
          const paymentIntent = await stripe.retrievePaymentIntent(paymentIntentId);

          if (paymentIntent.paymentIntent) {
            const pi = paymentIntent.paymentIntent as any;
            const taxAmount = pi.total_details?.amount_tax || 0;
            const amountTotal = paymentIntent.paymentIntent.amount; // En centavos
            const amountBase = amountTotal - taxAmount; // En centavos

            setTaxInfo({
              base: amountBase / 100,
              tax: taxAmount / 100,
              total: amountTotal / 100,
              taxExempt: taxAmount === 0,
            });
          }
        }
      } catch (err) {
        console.warn("No se pudo obtener información de impuestos:", err);
        // Si no se puede obtener, usar el monto base sin impuestos
        setTaxInfo({
          base: amount,
          tax: 0,
          total: amount,
          taxExempt: true,
        });
      }
    };

    fetchTaxInfo();
  }, [stripe, clientSecret, amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/cliente?pago=exitoso`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Error al procesar el pago");
        onError(error.message || "Error al procesar el pago");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Actualizar información de impuestos después del pago exitoso
        const pi = paymentIntent as any;
        const taxAmount = pi.total_details?.amount_tax || 0;
        const amountTotal = paymentIntent.amount;
        const amountBase = amountTotal - taxAmount;

        setTaxInfo({
          base: amountBase / 100,
          tax: taxAmount / 100,
          total: amountTotal / 100,
          taxExempt: taxAmount === 0,
        });

        onSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado al procesar el pago";
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PaymentElement de Stripe - esto renderiza los campos de tarjeta */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Botón de confirmar y pagar */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing
          ? "Procesando..."
          : "Confirmar y pagar"}
      </button>
    </form>
  );
}

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("EUR");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [linkVideollamada, setLinkVideollamada] = useState<string>("");
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [codigoPostal, setCodigoPostal] = useState<string>("");

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      // Primero intentar obtener clientSecret de los query params
      const secret = searchParams.get("clientSecret");
      const amountParam = searchParams.get("amount");
      const currencyParam = searchParams.get("currency");
      const paymentIntentParam = searchParams.get("paymentIntentId");

      if (secret) {
        // Si tenemos clientSecret en los query params, usarlo directamente
        setClientSecret(secret);
        setAmount(amountParam ? parseFloat(amountParam) : 0);
        setCurrency(currencyParam || "EUR");
        setPaymentIntentId(paymentIntentParam || null);
        setLoading(false);
      } else {
        // Si no hay clientSecret en los query params, obtenerlo desde el backend usando el id_pago
        try {
          const pagoId = params.id;
          if (!pagoId) {
            setError("No se encontró el ID de pago");
            setLoading(false);
            return;
          }

          // Obtener información del pago desde el backend
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
          const token = localStorage.getItem("token");

          console.log("[PagoPage] 🔍 Obteniendo información de pago desde backend");
          console.log("[PagoPage] id_pago:", pagoId);
          console.log("[PagoPage] API URL:", apiBaseUrl);
          console.log("[PagoPage] Token disponible:", !!token);
          
          if (!token) {
            throw new Error("No se encontró el token de autenticación");
          }

          const response = await fetch(`${apiBaseUrl}/stripe/create-payment-intent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_pago: Number(pagoId),
              // El monto se obtendrá del pago en el backend
            }),
          });

          if (!response.ok) {
            throw new Error(`Error al obtener información de pago: ${response.statusText}`);
          }

          const data = await response.json();

          console.log("[PagoPage] Respuesta del backend:", {
            success: data.success,
            hasData: !!data.data,
            hasClientSecret: !!data.data?.clientSecret,
            message: data.message,
            error: data.error,
          });

          if (data.success && data.data?.clientSecret) {
            setClientSecret(data.data.clientSecret);
            setAmount(data.data.amount ? data.data.amount / 100 : 0); // Convertir de centavos
            setCurrency(data.data.currency || "EUR");
            setPaymentIntentId(data.data.paymentIntentId || null);
            console.log("[PagoPage] ✅ Información de pago obtenida exitosamente:", {
              hasClientSecret: !!data.data.clientSecret,
              amount: data.data.amount,
              amountFormatted: data.data.amount ? (data.data.amount / 100).toFixed(2) : "0.00",
              currency: data.data.currency,
              paymentIntentId: data.data.paymentIntentId,
            });
          } else {
            console.error("[PagoPage] ❌ Error en la respuesta del backend:", data);
            throw new Error(data.message || data.error || "No se pudo obtener la información de pago");
          }
        } catch (err: any) {
          console.error("[PagoPage] Error al obtener información de pago:", err);
          setError(err.message || "No se encontró la información de pago");
        } finally {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated && params.id) {
      fetchPaymentInfo();
    } else if (!isAuthenticated) {
      setError("Debes iniciar sesión para realizar el pago");
      setLoading(false);
    }
  }, [searchParams, params.id, isAuthenticated]);

  // Cargar código postal desde los query params
  useEffect(() => {
    const codigoPostalParam = searchParams.get("codigoPostal");
    if (codigoPostalParam) {
      setCodigoPostal(codigoPostalParam);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    setPaymentCompleted(true);
    
    // Obtener el link de Google Meet del backend si la cita es en línea
    const tipoAtencion = searchParams.get("tipoAtencion");
    if (tipoAtencion === "en_linea" && isAuthenticated && user) {
      try {
        const pagoId = params.id;
        if (pagoId) {
          // Obtener el pago para obtener el id_cita
          const pagoResponse = await pagosService.getPagoPorId(pagoId);
          
          if (pagoResponse.success && pagoResponse.data?.id_cita) {
            const idCita = pagoResponse.data.id_cita;
            
            // Obtener la cita completa para obtener el link de Google Meet
            const citaResponse = await citasService.getCitaPorId(idCita);
            if (citaResponse.success && citaResponse.data?.cita?.link_videollamada) {
              setLinkVideollamada(citaResponse.data.cita.link_videollamada);
            }
          }
        }
      } catch (error) {
        console.warn("[PagoPage] No se pudo obtener link de videollamada del backend:", error);
      }
    }

    // Obtener datos de la cita desde los query params para pasarlos a la confirmación
    const fecha = searchParams.get("fecha");
    const fechaISO = searchParams.get("fechaISO");
    const hora = searchParams.get("hora");
    const profesional = searchParams.get("profesional");
    const servicio = searchParams.get("servicio");
    const professionalImage = searchParams.get("professionalImage");
    const professionalCity = searchParams.get("professionalCity");
    const duration = searchParams.get("duration");

    // Construir URL de confirmación con los datos
    const confirmacionUrl = new URL(`/pago/${params.id}/confirmacion`, window.location.origin);
    if (fecha) confirmacionUrl.searchParams.set("fecha", fecha);
    if (fechaISO) confirmacionUrl.searchParams.set("fechaISO", fechaISO);
    if (hora) confirmacionUrl.searchParams.set("hora", hora);
    if (profesional) confirmacionUrl.searchParams.set("profesional", profesional);
    if (servicio) confirmacionUrl.searchParams.set("servicio", servicio);
    if (professionalImage) confirmacionUrl.searchParams.set("professionalImage", professionalImage);
    if (professionalCity) confirmacionUrl.searchParams.set("professionalCity", professionalCity);
    if (duration) confirmacionUrl.searchParams.set("duration", duration);
    const direccionConsultorio = searchParams.get("direccionConsultorio");
    const direccionDomicilio = searchParams.get("direccionDomicilio");
    if (tipoAtencion) confirmacionUrl.searchParams.set("tipoAtencion", tipoAtencion);
    if (direccionConsultorio) confirmacionUrl.searchParams.set("direccionConsultorio", direccionConsultorio);
    // Usar el link obtenido del backend si está disponible, sino el de los query params
    const linkVideollamadaParam = linkVideollamada || searchParams.get("linkVideollamada");
    if (linkVideollamadaParam) confirmacionUrl.searchParams.set("linkVideollamada", linkVideollamadaParam);
    if (direccionDomicilio) confirmacionUrl.searchParams.set("direccionDomicilio", direccionDomicilio);
    if (codigoPostalParam) confirmacionUrl.searchParams.set("codigoPostal", codigoPostalParam);
    confirmacionUrl.searchParams.set("monto", amount.toString());
    confirmacionUrl.searchParams.set("moneda", currency);

    // Redirigir a la página de confirmación después de un breve delay para mostrar el link
    setTimeout(() => {
      router.push(confirmacionUrl.toString());
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  // Mostrar spinner mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar mensaje de "iniciar sesión" después de que termine la verificación de autenticación
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión para continuar
          </h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para completar el pago
          </p>
          <button
            onClick={() => router.push("/iniciar-sesion")}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configuración de Stripe faltante
          </h2>
          <p className="text-gray-600 mb-6">
            La clave pública de Stripe no está configurada. Por favor, contacta al administrador.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Información de pago no encontrada
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al inicializar Stripe
          </h2>
          <p className="text-gray-600 mb-6">
            No se pudo inicializar Stripe. Por favor, intenta nuevamente.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  // Obtener información de la cita desde los query params
  const fecha = searchParams.get("fecha");
  const fechaISO = searchParams.get("fechaISO");
  const hora = searchParams.get("hora");
  const profesional = searchParams.get("profesional");
  const servicio = searchParams.get("servicio");
  const professionalCity = searchParams.get("professionalCity") || "Ciudad no especificada";
  const professionalImage = searchParams.get("professionalImage") || "";
  const duration = searchParams.get("duration") || "1h";
  const price = Number(searchParams.get("price") || amount || 0);
  const currencyParam = searchParams.get("currency") || currency || "EUR";
  const tipoAtencion = searchParams.get("tipoAtencion") || "presencial";
  const direccionConsultorio = searchParams.get("direccionConsultorio") || "";
  const codigoPostalParam = searchParams.get("codigoPostal") || "";

  // Formatear fecha y hora
  let fechaFormateada = fecha || "";
  let fechaCorta = "";
  
  if (fechaISO && !fechaFormateada) {
    try {
      const date = new Date(fechaISO);
      fechaFormateada = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      fechaCorta = date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    } catch {
      // Ignorar error
    }
  }
  
  let horaFormateada = hora || "";
  
  // Formatear hora si viene en formato 24h
  if (horaFormateada && horaFormateada.includes(":")) {
    try {
      const parts = horaFormateada.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1] || "0", 10);
      
      // Validar que hours y minutes sean números válidos
      if (!isNaN(hours) && !isNaN(minutes)) {
        const period = hours >= 12 ? "pm" : "am";
        const hours12 = hours % 12 || 12;
        horaFormateada = `${hours12}:${minutes.toString().padStart(2, "0")}${period}`;
      } else {
        // Si el parseo falla, mantener formato original
        console.warn("[PagoPage] Error al formatear hora:", horaFormateada);
      }
    } catch (error) {
      // Mantener formato original si hay error
      console.warn("[PagoPage] Error al formatear hora:", error);
    }
  }
  
  // Calcular hora de fin
  const calcularHoraFin = (horaInicio: string, duracion: string) => {
    if (!horaInicio || !duracion) return "";
    try {
      // Si la hora viene en formato 12h (ej: "5:00pm"), convertir a 24h primero
      let horas24 = 0;
      let minutos = 0;
      
      if (horaInicio.includes("pm") || horaInicio.includes("am")) {
        const [timePart, period] = horaInicio.replace(/(am|pm)/i, "").split(/(am|pm)/i);
        const [h, m] = timePart.split(":").map(Number);
        horas24 = period.toLowerCase() === "pm" && h !== 12 ? h + 12 : (period.toLowerCase() === "am" && h === 12 ? 0 : h);
        minutos = m;
      } else {
        [horas24, minutos] = horaInicio.split(":").map(Number);
      }
      
      const duracionMinutos = parseInt(duracion.replace(/\D/g, "")) || 60;
      const fechaInicio = new Date();
      fechaInicio.setHours(horas24, minutos, 0, 0);
      const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
      const endHours = fechaFin.getHours();
      const endMinutes = fechaFin.getMinutes();
      const period = endHours >= 12 ? "pm" : "am";
      const hours12 = endHours % 12 || 12;
      return `${hours12}:${endMinutes.toString().padStart(2, "0")}${period}`;
    } catch {
      return "";
    }
  };

  const horaFin = calcularHoraFin(hora || "", duration);

  return (
    <div className="min-h-screen bg-white">
      {/* Título principal */}
      <main className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
          Confirma tu cita
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Columna izquierda: Método de pago y detalles de tarjeta */}
          <section className="lg:col-span-2 space-y-8">
            {/* Método de pago */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-2">
                Método de pago
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Seleccione un método de pago a continuación. Naxine procesa su pago de forma segura con cifrado de extremo a extremo.
              </p>
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 border-2 border-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-gray-900">Tarjeta de crédito/débito</span>
                </div>
                <div className="w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center bg-primary">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Detalles de la tarjeta */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles de la tarjeta
              </h2>
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={amount}
                  currency={currency}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>

            {/* Enlaces de políticas */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <Link href="/politica-cancelacion" className="hover:text-primary hover:underline">
                Política de cancelación
              </Link>
              <Link href="/terminos-condiciones" className="hover:text-primary hover:underline">
                Términos y condiciones de uso
              </Link>
              <Link href="/politica-cookies" className="hover:text-primary hover:underline">
                Política de Cookies
              </Link>
            </div>

          </section>

          {/* Columna derecha: resumen de cita (idéntico a confirmar-cita) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Professional Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {professionalImage ? (
                    <Image
                      src={professionalImage}
                      alt={profesional || "Profesional"}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-15 h-15 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                      {profesional
                        ? profesional
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "P"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">
                      {servicio || "Servicio"}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profesional || "Profesional"}
                    </p>
                    {tipoAtencion !== "en_linea" && (
                      <p className="text-sm text-gray-500">
                        {professionalCity}
                      </p>
                    )}
                    {tipoAtencion === "en_linea" && (
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
                      {servicio || "Servicio"}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Precio</span>
                    <span className="text-sm font-medium text-gray-900">
                      {price.toFixed(2)}€
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fecha</span>
                      <span className="text-sm font-medium text-gray-900">
                        {fechaCorta || fechaFormateada || "Fecha no disponible"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Hora</span>
                      <span className="text-sm font-medium text-gray-900">
                        {horaFormateada || "Hora no disponible"}
                      </span>
                    </div>
                    {tipoAtencion && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Tipo de atención</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {tipoAtencion === "presencial"
                            ? "Presencial"
                            : tipoAtencion === "en_linea"
                            ? "En Línea"
                            : "A Domicilio"}
                        </span>
                      </div>
                    )}
                    {tipoAtencion === "en_linea" && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Plataforma</span>
                        <span className="text-sm font-medium text-green-600">
                          Google Meet
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mostrar link de Google Meet si el pago fue exitoso y la cita es en línea */}
                  {paymentCompleted && tipoAtencion === "en_linea" && linkVideollamada && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
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
                        <div className="flex-1">
                          <p className="font-semibold text-purple-900 mb-1">Link de videollamada</p>
                          <a
                            href={linkVideollamada}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-700 hover:text-purple-900 underline break-all"
                          >
                            {linkVideollamada}
                          </a>
                          <p className="text-xs text-purple-600 mt-1">
                            Haz clic en el enlace para unirte a la videollamada
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {price.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

