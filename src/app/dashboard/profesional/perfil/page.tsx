"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Check, CreditCard } from "lucide-react";
import { ticketsService } from "@/services/api/tickets";
import { professionalsService } from "@/services/api/professionals";
import { calendarsService } from "@/services/api/calendars";
import { handleApiError } from "@/services";

export default function PerfilPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "Juan",
    lastName: "Pérez",
    email: "jp@gmail.com",
    username: "@jnutriologo",
    phone: "+52 55 31 953 893",
    city: "Madrid, España",
    occupation: "Nutriologo",
    postalCode: "63929",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [notif, setNotif] = useState({
    bankUpdates: true,
    appointmentReminders: true,
  });

  const [showToast, setShowToast] = useState(false);
  const [showSupportToast, setShowSupportToast] = useState(false);
  const [animateSaveToast, setAnimateSaveToast] = useState(false);
  const [animateSupportToast, setAnimateSupportToast] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<{
    charges_enabled: boolean;
    payouts_enabled: boolean;
    loading: boolean;
  }>({
    charges_enabled: false,
    payouts_enabled: false,
    loading: true,
  });
  const [isCreatingOnboarding, setIsCreatingOnboarding] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const [calendarStatus, setCalendarStatus] = useState<{
    loading: boolean;
    connected: boolean;
    syncOk: boolean;
    lastVerification: string | null;
    error: string | null;
  }>({
    loading: true,
    connected: false,
    syncOk: false,
    lastVerification: null,
    error: null,
  });
  const [calendarConnectLoading, setCalendarConnectLoading] = useState(false);
  const [calendarVerifyLoading, setCalendarVerifyLoading] = useState(false);
  const [calendarFeedback, setCalendarFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const getErrorMessage = useCallback((error: unknown): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return handleApiError(error as any);
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      firstName: user.name?.split(" ")[0] || prev.firstName,
      lastName: user.name?.split(" ").slice(1).join(" ") || prev.lastName,
      email: user.email || prev.email,
    }));
  }, [user]);

  // Cargar estado de Stripe Connect
  const loadStripeStatus = useCallback(async () => {
    if (!user) return;

    try {
      setStripeStatus((prev) => ({ ...prev, loading: true }));
      const response = await professionalsService.getMyProfessionalProfile();

      // El apiClient suele envolver la respuesta del backend.
      // Estructuras posibles:
      // - { data: { profesional: {...} } }
      // - { profesional: {...} }
      // - { ...profesional }
      const backendData: any = response.data || {};
      const profesional =
        backendData.data?.profesional ||
        backendData.profesional ||
        backendData;

      const normalizeBool = (v: any) =>
        v === true || v === "true" || v === 1 || v === "1";

      if (response.success && profesional && (profesional.charges_enabled != null || profesional.payouts_enabled != null)) {
        const chargesEnabled = normalizeBool(profesional.charges_enabled);
        const payoutsEnabled = normalizeBool(profesional.payouts_enabled);

        setStripeStatus({
          charges_enabled: chargesEnabled,
          payouts_enabled: payoutsEnabled,
          loading: false,
        });
      } else {
        // Si no hay perfil profesional o hay error, asumir que no está verificado
        setStripeStatus({
          charges_enabled: false,
          payouts_enabled: false,
          loading: false,
        });
      }
    } catch (err) {
      // Error ya manejado por el servicio
      setStripeStatus({
        charges_enabled: false,
        payouts_enabled: false,
        loading: false,
      });
    }
  }, [user]);

  useEffect(() => {
    loadStripeStatus();
  }, [loadStripeStatus]);

  const loadCalendarStatus = useCallback(async () => {
    if (!user) return;

    setCalendarStatus((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await calendarsService.getMyCalendars();

      if (response.success && response.data) {
        const rawCalendars =
          (response.data as any).calendarios_externos ??
          (response.data as any).data?.calendarios_externos ??
          [];
        const calendars = Array.isArray(rawCalendars) ? rawCalendars : [];
        const googleCalendars = calendars.filter(
          (cal) => cal.proveedor === "google"
        );
        const hasConnected = googleCalendars.some((cal) => cal.connected);
        const activeCalendars = googleCalendars.filter(
          (cal) =>
            cal.connected && (cal.sincronizacion_activa ?? true)
        );

        let lastVerification: string | null = null;
        let errorMessage: string | null = null;

        activeCalendars.forEach((cal) => {
          if (cal.ultima_verificacion) {
            if (
              !lastVerification ||
              new Date(cal.ultima_verificacion) > new Date(lastVerification)
            ) {
              lastVerification = cal.ultima_verificacion;
            }
          }
          if (cal.google_sync_ok === 0 || cal.google_sync_ok === "0") {
            errorMessage =
              "Tu conexión con Google necesita reconfirmarse. Generaremos enlaces temporales hasta que la restaures.";
          }
          if (cal.error_conexion) {
            errorMessage = cal.error_conexion;
          }
        });

        const hasSyncOk = activeCalendars.some((cal) => {
          const value = cal.google_sync_ok;
          return (
            value === true ||
            value === 1 ||
            value === "1" ||
            value === undefined ||
            value === null
          );
        });

        if (hasConnected && activeCalendars.length === 0) {
          errorMessage =
            "Tu calendario está conectado, pero la sincronización está desactivada.";
        }

        setCalendarStatus({
          loading: false,
          connected: hasConnected,
          syncOk: hasConnected ? hasSyncOk && activeCalendars.length > 0 : false,
          lastVerification,
          error: errorMessage,
        });
      } else {
        setCalendarStatus({
          loading: false,
          connected: false,
          syncOk: false,
          lastVerification: null,
          error:
            response.error ||
            "No se pudo obtener el estado de Google Calendar. Intenta nuevamente.",
        });
      }
    } catch (error) {
      setCalendarStatus({
        loading: false,
        connected: false,
        syncOk: false,
        lastVerification: null,
        error: getErrorMessage(error),
      });
    }
  }, [user, getErrorMessage]);

  useEffect(() => {
    loadCalendarStatus();
  }, [loadCalendarStatus]);

  useEffect(() => {
    if (calendarFeedback) {
      const timeout = setTimeout(
        () => setCalendarFeedback(null),
        4000
      );
      return () => clearTimeout(timeout);
    }
  }, [calendarFeedback]);

  // Manejar retorno de Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeReturn = urlParams.get("stripe_return");
    const stripeRefresh = urlParams.get("stripe_refresh");

    if (stripeReturn || stripeRefresh) {
      // Limpiar los parámetros de la URL
      window.history.replaceState({}, "", window.location.pathname);

      // Recargar el estado de Stripe después de un breve delay
      setTimeout(() => {
        loadStripeStatus();
      }, 1000);
    }
  }, [loadStripeStatus]);

  // Trigger entrance animation for Save popup
  useEffect(() => {
    if (showToast) {
      setAnimateSaveToast(false);
      requestAnimationFrame(() => setAnimateSaveToast(true));
    }
  }, [showToast]);


  // Trigger entrance animation for Support popup
  useEffect(() => {
    if (showSupportToast) {
      setAnimateSupportToast(false);
      requestAnimationFrame(() => setAnimateSupportToast(true));
    }
  }, [showSupportToast]);

  const toggle = (key: keyof typeof notif) =>
    setNotif((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setPassword({ current: "", next: "", confirm: "" });
  };

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) {
      setSupportError("Por favor, escribe un mensaje");
      return;
    }

    setSupportError(null);
    setIsSubmittingSupport(true);

    try {
      const response = await ticketsService.createTicket({
        asunto: "Consulta desde perfil",
        mensaje: supportMessage.trim(),
        correo: user?.email || undefined,
      });

      if (response.success) {
        setSupportMessage("");
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      } else {
        // Manejar errores de validación del backend
        if (response.errorDetails?.errors) {
          const validationErrors = response.errorDetails.errors;
          const errorMessages = Array.isArray(validationErrors)
            ? validationErrors.map((err: any) => err.message || err).join(", ")
            : JSON.stringify(validationErrors);
          setSupportError(errorMessages);
        } else {
          setSupportError(
            response.error ||
              "Error al enviar el mensaje. Por favor, intenta nuevamente."
          );
        }
      }
    } catch (err: any) {
      console.error("[PerfilPage] Error al enviar ticket:", err);
      setSupportError(
        err?.message ||
          "Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const handleStripeOnboarding = async () => {
    if (!user) return;

    setStripeError(null);
    setIsCreatingOnboarding(true);

    try {
      const returnUrl = `${window.location.origin}/dashboard/profesional/perfil?stripe_return=true`;
      const refreshUrl = `${window.location.origin}/dashboard/profesional/perfil?stripe_refresh=true`;

      const response = await professionalsService.createStripeOnboardingLink({
        return_url: returnUrl,
        refresh_url: refreshUrl,
      });

      // El API devuelve { success: true, data: { onboarding_url: ... } }
      const onboardingUrl = response.data?.onboarding_url;

      if (response.success && onboardingUrl) {
        // Redirigir al profesional al onboarding de Stripe
        window.location.href = onboardingUrl;
      } else {
        console.error("[PerfilPage] Respuesta inesperada:", response);
        setStripeError(
          response.error ||
            "Error al crear el link de verificación. Por favor, intenta nuevamente."
        );
      }
    } catch (err: any) {
      console.error("[PerfilPage] Error al crear link de onboarding:", err);
      setStripeError(
        err?.message ||
          "Ocurrió un error al iniciar la verificación. Por favor, intenta nuevamente."
      );
    } finally {
      setIsCreatingOnboarding(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (calendarConnectLoading) return;

    setCalendarFeedback(null);
    setCalendarConnectLoading(true);

    try {
      const response = await calendarsService.getGoogleAuthorizationUrl();
      const rawData = response.data as any;
      const url =
        rawData?.url ??
        rawData?.data?.url ??
        rawData?.data?.data?.url ??
        null;

      if (response.success && url) {
        window.location.href = url;
      } else {
        setCalendarFeedback({
          type: "error",
          message:
            response.error ||
            "No se pudo obtener la URL de autorización de Google Calendar.",
        });
      }
    } catch (error) {
      setCalendarFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
      await loadCalendarStatus();
    } finally {
      setCalendarConnectLoading(false);
    }
  };

  const handleVerifyCalendars = async () => {
    if (calendarVerifyLoading) return;

    setCalendarFeedback(null);
    setCalendarVerifyLoading(true);

    try {
      const response = await calendarsService.verifyMyCalendars();

      if (response.success && response.data) {
        const rawResultados =
          (response.data as any).resultados ??
          (response.data as any).data?.resultados ??
          [];
        const resultados = Array.isArray(rawResultados) ? rawResultados : [];
        const fallidos = resultados.filter((r) => !r.ok);

        if (fallidos.length === 0) {
          setCalendarFeedback({
            type: "success",
            message: "Sincronización con Google Calendar verificada correctamente.",
          });
        } else {
          setCalendarFeedback({
            type: "error",
            message:
              "Algunos calendarios necesitan reconectarse en Google para reactivar la sincronización.",
          });
        }
      } else {
        setCalendarFeedback({
          type: "error",
          message:
            response.error ||
            "No se pudo verificar la sincronización con Google Calendar.",
        });
      }
    } catch (error) {
      setCalendarFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setCalendarVerifyLoading(false);
      await loadCalendarStatus();
    }
  };

  // Verificar si necesita onboarding de Stripe
  const needsStripeOnboarding =
    !stripeStatus.loading &&
    (!stripeStatus.charges_enabled || !stripeStatus.payouts_enabled);

  // Estado de Stripe (similar a Google Calendar)
  const stripeStatusLabel = stripeStatus.loading
    ? "Verificando..."
    : stripeStatus.charges_enabled && stripeStatus.payouts_enabled
    ? "Cuenta verificada"
    : "Verificación requerida";

  const stripeStatusClass = stripeStatus.loading
    ? "bg-gray-100 text-gray-600"
    : stripeStatus.charges_enabled && stripeStatus.payouts_enabled
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

  const calendarStatusLabel = calendarStatus.loading
    ? "Verificando..."
    : calendarStatus.connected
    ? calendarStatus.syncOk
      ? "Sincronización activa"
      : "Atención requerida"
    : "No conectado";

  const calendarStatusClass = calendarStatus.loading
    ? "bg-gray-100 text-gray-600"
    : calendarStatus.connected
    ? calendarStatus.syncOk
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";

  const formattedLastVerification = calendarStatus.lastVerification
    ? new Date(calendarStatus.lastVerification).toLocaleString()
    : null;

  return (
    <div className="space-y-6">
      {showToast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
            animateSaveToast
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3"
          }`}
        >
          <div className="bg-primary text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Cambios aplicados</span>
              <span className="font-medium text-sm">correctamente.</span>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Ajustes de Perfil
        </h2>
        <p className="text-xs text-purple-600 mt-1">
          NOTA: La información personal no es editable por el usuario,
          contacta con soporte para cambiar tu información.
        </p>
      </div>

      {/* Stripe Connect Verification - Siempre visible con badge de estado */}
      <div className="bg-white shadow rounded-lg border border-blue-100">
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-1">
                Verificación de Cuenta de Stripe
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl">
                Conecta y verifica tu cuenta de Stripe Connect para poder recibir pagos
                de tus clientes de forma segura.
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stripeStatusClass}`}
            >
              {stripeStatusLabel}
            </span>
          </div>

          {stripeError && (
            <div className="border rounded-lg px-4 py-3 text-sm bg-red-50 border-red-200 text-red-700">
              {stripeError}
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            {stripeStatus.loading ? (
              <p>Verificando el estado de tu cuenta de Stripe...</p>
            ) : stripeStatus.charges_enabled && stripeStatus.payouts_enabled ? (
              <>
                <p>
                  Tu cuenta de Stripe está verificada y lista para recibir pagos.
                  Puedes procesar transacciones y recibir transferencias de tus clientes.
                </p>
              </>
            ) : (
              <>
                <p>
                  Para poder recibir pagos, necesitas completar la verificación
                  de tu cuenta de Stripe Connect. Este proceso incluye la
                  verificación de datos fiscales y bancarios.
                </p>
              </>
            )}
          </div>

          {needsStripeOnboarding && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleStripeOnboarding}
                disabled={isCreatingOnboarding}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreatingOnboarding ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Verificar Cuenta de Stripe</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar Sync - Movido hacia arriba */}
      <div className="bg-white shadow rounded-lg border border-blue-100">
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-1">
                Sincronización con Google Calendar
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl">
                Conecta tu cuenta de Google para que tus citas se sincronicen automáticamente
                con tu calendario y generen enlaces reales de Google Meet.
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${calendarStatusClass}`}
            >
              {calendarStatusLabel}
            </span>
          </div>

          {calendarFeedback && (
            <div
              className={`border rounded-lg px-4 py-3 text-sm ${
                calendarFeedback.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : calendarFeedback.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {calendarFeedback.message}
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            {calendarStatus.loading ? (
              <p>Verificando el estado de la sincronización...</p>
            ) : calendarStatus.connected ? (
              <>
                <p>
                  {calendarStatus.syncOk
                    ? "Tu cuenta de Google está conectada y lista para generar enlaces de Meet."
                    : "Tu cuenta de Google está conectada, pero necesitamos que la reconectes para generar enlaces reales. Usaremos enlaces temporales hasta que lo hagas."}
                </p>
                {calendarStatus.error && (
                  <p className="text-sm text-yellow-700">{calendarStatus.error}</p>
                )}
                {formattedLastVerification && (
                  <p className="text-xs text-gray-500">
                    Última verificación: {formattedLastVerification}
                  </p>
                )}
              </>
            ) : (
              <p>
                Aún no has vinculado tu cuenta de Google. Conéctala para que las citas en línea
                generen automáticamente eventos y enlaces seguros de Google Meet.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleConnectGoogle}
              disabled={calendarConnectLoading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calendarConnectLoading ? "Redirigiendo..." : "Conectar Google Calendar"}
            </button>
            <button
              onClick={handleVerifyCalendars}
              disabled={
                calendarVerifyLoading ||
                calendarStatus.loading ||
                !calendarStatus.connected
              }
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calendarVerifyLoading ? "Verificando..." : "Verificar sincronización"}
            </button>
          </div>
        </div>
      </div>

      {/* Info + Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  disabled
                  value={profile.firstName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  disabled
                  value={profile.lastName}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  disabled
                  value={profile.email}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  disabled
                  value={profile.username}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  disabled
                  value={profile.phone}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ciudad
                </label>
                <input
                  disabled
                  value={profile.city}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ocupación
                </label>
                <input
                  disabled
                  value={profile.occupation}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código Postal
                </label>
                <input
                  disabled
                  value={profile.postalCode}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary text-white rounded-2xl p-6 md:p-8">
          <h4 className="text-white text-lg mb-2" style={{ fontWeight: 900 }}>
            NOTA:
          </h4>
          <p className="text-base leading-7 opacity-95 mb-6">
            La información personal no es editable por el usuario, contacta con
            soporte para cambiar tu información.
          </p>
          <label
            className="block text-white text-lg mb-3"
            style={{ fontWeight: 900 }}
          >
            Deja tu mensaje:
          </label>
          <textarea
            value={supportMessage}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 2000) {
                setSupportMessage(value);
                setSupportError(null);
              }
            }}
            className="w-full h-32 rounded-xl bg-white/30 placeholder-white/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/60 resize-none"
            placeholder="Escribe tu mensaje..."
            maxLength={2000}
          />
          {supportError && (
            <div className="mt-2 p-2 bg-red-500/30 border border-red-300 rounded-lg">
              <p className="text-white text-xs">{supportError}</p>
            </div>
          )}
          {supportMessage.length > 0 && (
            <p className="text-white/80 text-xs mt-1">
              {supportMessage.length}/2000 caracteres
            </p>
          )}
          <button
            onClick={handleSupportSubmit}
            disabled={isSubmittingSupport || !supportMessage.trim()}
            className="mt-5 w-full bg-white text-black uppercase tracking-wide py-4 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontWeight: 900 }}
          >
            {isSubmittingSupport ? "Enviando..." : "CONTACTAR A SOPORTE"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Contraseña
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña actual
              </label>
              <input
                type="password"
                value={password.current}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, current: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password.next}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, next: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirma Contraseña
              </label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, confirm: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Sugerencias de contraseña
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              Para crear una nueva contraseña, debes cumplir estos requisitos.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 list-disc pl-5">
              <li>Al menos 8 caracteres</li>
              <li>Al menos un caracter especial</li>
              <li>Al menos un número</li>
              <li>No puede ser similar a alguna anterior</li>
            </ul>
          </div>

          {/* Botones de acción - Solo mostrar si hay cambios en la contraseña */}
          {(password.current || password.next || password.confirm) && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Configuración de Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggle("bankUpdates")}
                className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  notif.bankUpdates ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    notif.bankUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                Actualizaciones de transacciones bancarias
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggle("appointmentReminders")}
                className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  notif.appointmentReminders ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    notif.appointmentReminders
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                Recordatorios de citas vía correo electrónico
              </span>
            </div>
          </div>
        </div>
      </div>


      {showSupportToast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
            animateSupportToast
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3"
          }`}
        >
          <div className="bg-primary text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Mensaje enviado</span>
              <span className="font-medium text-sm">
                Te contactaremos pronto para ayudarte.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
