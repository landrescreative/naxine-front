"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de pago
        </label>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-gray-900">
            € {amount.toFixed(2)} EUR
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? "Procesando..." : `Pagar € ${amount.toFixed(2)} EUR`}
      </button>
    </form>
  );
}

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("EUR");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener clientSecret de los query params o del estado
    const secret = searchParams.get("clientSecret");
    const amountParam = searchParams.get("amount");
    const currencyParam = searchParams.get("currency");
    const paymentIntentParam = searchParams.get("paymentIntentId");

    if (secret) {
      setClientSecret(secret);
      setAmount(amountParam ? parseFloat(amountParam) : 0);
      setCurrency("EUR");
      setPaymentIntentId(paymentIntentParam || null);
      setLoading(false);
    } else {
      setError("No se encontró la información de pago");
      setLoading(false);
    }
  }, [searchParams]);

  const handlePaymentSuccess = () => {
    // Obtener datos de la cita desde los query params para pasarlos a la confirmación
    const fecha = searchParams.get("fecha");
    const fechaISO = searchParams.get("fechaISO"); // Fecha ISO completa
    const hora = searchParams.get("hora");
    const profesional = searchParams.get("profesional");
    const servicio = searchParams.get("servicio");
    
    // Construir URL de confirmación con los datos
    const confirmacionUrl = new URL(`/pago/${params.id}/confirmacion`, window.location.origin);
    if (fecha) confirmacionUrl.searchParams.set("fecha", fecha);
    if (fechaISO) confirmacionUrl.searchParams.set("fechaISO", fechaISO); // Pasar fechaISO
    if (hora) confirmacionUrl.searchParams.set("hora", hora);
    if (profesional) confirmacionUrl.searchParams.set("profesional", profesional);
    if (servicio) confirmacionUrl.searchParams.set("servicio", servicio);
    confirmacionUrl.searchParams.set("monto", amount.toString());
    confirmacionUrl.searchParams.set("moneda", currency);
    
    // Redirigir a la página de confirmación
    router.push(confirmacionUrl.toString());
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl font-bold">Completar Pago</h1>
            <p className="text-primary-foreground mt-2">
              Pago ID: {params.id}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
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

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Pago seguro procesado por Stripe</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-500">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

