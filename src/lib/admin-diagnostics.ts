import { testApiConnection } from "@/services";
import {
  specialtiesService,
  type PublicSpecialty,
} from "@/services/api/specialties";

export type ServiceHealth = "operational" | "degraded" | "down" | "unknown";

export interface StatCardInfo {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

export interface ServiceStatusInfo {
  id: string;
  name: string;
  status: ServiceHealth;
  detail: string;
  latencyMs?: number | null;
}

export interface FunctionDiagnosticInfo {
  id: string;
  name: string;
  status: ServiceHealth;
  description: string;
  lastUpdated: string;
}

export interface PlatformDiagnostics {
  checkedAt: string;
  summary: {
    backendStatus: ServiceHealth;
    databaseStatus: ServiceHealth;
    vercelStatus: ServiceHealth;
    apiLatencyMs: number | null;
    apiBaseUrl: string;
    uptime?: string | null;
  };
  stats: StatCardInfo[];
  services: ServiceStatusInfo[];
  functions: FunctionDiagnosticInfo[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "URL de API no configurada";

const normalizeStatus = (
  value: string | boolean | null | undefined,
  fallback: ServiceHealth = "unknown"
): ServiceHealth => {
  if (typeof value === "boolean") {
    return value ? "operational" : "down";
  }
  if (!value) {
    return fallback;
  }

  const normalized = value.toString().toLowerCase();

  if (
    normalized.includes("ok") ||
    normalized.includes("healthy") ||
    normalized.includes("operational") ||
    normalized.includes("up") ||
    normalized.includes("running")
  ) {
    return "operational";
  }

  if (
    normalized.includes("warn") ||
    normalized.includes("degrad") ||
    normalized.includes("slow")
  ) {
    return "degraded";
  }

  if (
    normalized.includes("down") ||
    normalized.includes("error") ||
    normalized.includes("fail") ||
    normalized.includes("critical")
  ) {
    return "down";
  }

  return fallback;
};

const formatNumber = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/D";
  }

  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(value);
};

const countSubcategories = (specialties: PublicSpecialty[]): number => {
  return specialties.reduce((acc, specialty) => {
    const totals =
      (specialty.subcategorias?.length ?? 0) +
      (specialty.sub_especialidades?.length ?? 0) +
      (specialty.subspecialties?.length ?? 0);

    return acc + totals;
  }, 0);
};

export async function getPlatformDiagnostics(): Promise<PlatformDiagnostics> {
  const checkedAt = new Date().toISOString();

  const [healthResult, specialtiesResult] = await Promise.allSettled([
    testApiConnection(),
    specialtiesService.getPublicSpecialties(),
  ]);

  const backendResponse =
    healthResult.status === "fulfilled"
      ? healthResult.value
      : {
          success: false,
          error:
            healthResult.reason?.message ||
            "No se pudo contactar el endpoint /health",
        };

  const backendData =
    backendResponse.success && "data" in backendResponse
      ? (backendResponse.data as Record<string, any>)
      : undefined;

  const healthData: Record<string, any> = backendData ?? {};

  // Servicios del endpoint /health del backend
  const backendServices: Record<string, any> = healthData?.services ?? {};

  // El backend puede responder con status: "operational", "degraded", o "down"
  // "degraded" significa que servicios no críticos tienen problemas pero la plataforma funciona
  const backendStatus = normalizeStatus(
    backendResponse.success ? healthData?.status ?? "operational" : "down"
  );

  // Si pudimos conectar al backend, asumimos que podemos obtener el estado real de los servicios
  const backendIsReachable = backendResponse.success;

  // Buscar estado de la base de datos en services.database.status (estructura real del backend)
  const databaseStatus = normalizeStatus(
    backendServices?.database?.status ??
      healthData?.database?.status ??
      healthData?.db?.status ??
      healthData?.databaseStatus ??
      healthData?.dbStatus,
    // Si el backend respondió exitosamente, la DB probablemente funciona aunque no tengamos el dato explícito
    backendIsReachable ? "operational" : "unknown"
  );

  // Obtener latencia de la base de datos si está disponible
  const dbLatencyMs = backendServices?.database?.latencyMs ?? null;

  const apiLatencyMs =
    Number(
      healthData?.metrics?.responseTimeMs ??
        healthData?.metrics?.latency ??
        healthData?.responseTime ??
        healthData?.latency ??
        dbLatencyMs
    ) || null;

  const uptime =
    healthData?.uptime ??
    healthData?.metrics?.uptime ??
    healthData?.info?.uptime ??
    null;

  let specialtiesCount: number | null = null;
  let subcategoryCount: number | null = null;

  if (
    specialtiesResult.status === "fulfilled" &&
    specialtiesResult.value.success &&
    Array.isArray(specialtiesResult.value.data)
  ) {
    specialtiesCount = specialtiesResult.value.data.length;
    subcategoryCount = countSubcategories(specialtiesResult.value.data);
  }

  const vercelStatus = normalizeStatus(
    process.env.VERCEL ? "operational" : null,
    process.env.NODE_ENV === "production" ? "unknown" : "operational"
  );

  // Obtener estado real de servicios del backend si están disponibles
  const backendStorageService = backendServices?.storage;
  const backendEmailService = backendServices?.emails;
  const backendPaymentService = backendServices?.payments;

  // Storage: preferir datos del backend
  const storageStatus: ServiceHealth = backendStorageService?.status
    ? normalizeStatus(backendStorageService.status)
    : "unknown";
  const storageProvider =
    backendStorageService?.name ||
    (!!process.env.NEXT_PUBLIC_SUPABASE_URL && "Supabase") ||
    (!!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && "Cloudinary") ||
    (!!process.env.NEXT_PUBLIC_AWS_S3_BUCKET && "AWS S3") ||
    null;
  const storageDetail =
    backendStorageService?.detail ||
    (storageProvider
      ? `Proveedor configurado: ${storageProvider}.`
      : "No hay proveedor público definido en variables de entorno.");

  // Email: preferir datos del backend (puede estar "down" pero sigue funcionando el resto de la plataforma)
  const emailStatus: ServiceHealth = backendEmailService?.status
    ? normalizeStatus(backendEmailService.status)
    : "unknown";
  const emailProvider =
    backendEmailService?.name ||
    (!!process.env.RESEND_API_KEY && "Resend") ||
    (!!process.env.SENDGRID_API_KEY && "SendGrid") ||
    null;
  const emailDetail =
    backendEmailService?.detail ||
    (emailProvider
      ? `Integración activa con ${emailProvider}.`
      : "Sin claves de proveedor detectadas.");

  // Payments: preferir datos del backend
  const paymentStatus: ServiceHealth = backendPaymentService?.status
    ? normalizeStatus(backendPaymentService.status)
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? "operational"
    : "unknown";
  const paymentDetail =
    backendPaymentService?.detail ||
    (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "Stripe cuenta con clave pública configurada."
      : "Stripe no está configurado (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).");

  const stats: StatCardInfo[] = [
    {
      id: "specialties",
      label: "Especialidades activas",
      value: formatNumber(specialtiesCount),
      helper:
        specialtiesCount === null
          ? "No fue posible obtener el catálogo público."
          : "Catálogo público indexado.",
    },
    {
      id: "subcategories",
      label: "Servicios / subcategorías",
      value: formatNumber(subcategoryCount),
      helper:
        subcategoryCount === null
          ? "No disponible."
          : "Incluye sub-especialidades declaradas.",
    },
    {
      id: "api-latency",
      label: "Latencia promedio de API",
      value: apiLatencyMs ? `${apiLatencyMs.toFixed(0)} ms` : "N/D",
      helper:
        backendIsReachable
          ? backendStatus === "degraded"
            ? "Backend responde. Algunos servicios secundarios tienen problemas."
            : "Respuesta correcta del endpoint /health."
          : backendResponse.error || "Sin respuesta del backend.",
    },
    {
      id: "uptime",
      label: "Uptime reportado",
      value: uptime ? `${uptime}` : "N/D",
      helper: `Última verificación: ${new Date(
        checkedAt
      ).toLocaleTimeString("es-ES")}`,
    },
  ];

  const services: ServiceStatusInfo[] = [
    {
      id: "backend",
      name: "API Backend",
      status: backendStatus,
      detail: backendResponse.success
        ? "Endpoint /health respondió correctamente."
        : backendResponse.error || "No se pudo contactar al backend.",
      latencyMs: apiLatencyMs,
    },
    {
      id: "database",
      name: "Base de datos principal",
      status: databaseStatus,
      detail:
        backendServices?.database?.detail ??
        healthData?.database?.message ??
        (databaseStatus === "operational"
          ? "Conexión estable reportada por la API."
          : "Sin confirmación del estado actual."),
      latencyMs: dbLatencyMs,
    },
    {
      id: "vercel",
      name: "Infraestructura Vercel",
      status: vercelStatus,
      detail: process.env.VERCEL
        ? `Deployment ${process.env.VERCEL_ENV || "production"}.`
        : "Ejecutando en entorno local/auto-gestionado.",
    },
    {
      id: "storage",
      name: "Almacenamiento de medios",
      status: storageStatus,
      detail: storageDetail,
      latencyMs: backendStorageService?.latencyMs ?? null,
    },
    {
      id: "emails",
      name: "Notificaciones por correo",
      status: emailStatus,
      detail: emailDetail,
      latencyMs: backendEmailService?.latencyMs ?? null,
    },
    {
      id: "payments",
      name: "Procesamiento de pagos",
      status: paymentStatus,
      detail: paymentDetail,
      latencyMs: backendPaymentService?.latencyMs ?? null,
    },
  ];

  // Determinar si los servicios core (sin contar emails) están operativos
  const coreServicesOperational =
    databaseStatus === "operational" && backendStatus !== "down";

  const functions: FunctionDiagnosticInfo[] = [
    {
      id: "auth",
      name: "Autenticación y roles",
      status: coreServicesOperational ? "operational" : "down",
      description:
        "Verificación de sesiones, login y control de acceso para clientes, profesionales y administradores.",
      lastUpdated: checkedAt,
    },
    {
      id: "bookings",
      name: "Reservas y citas",
      status: coreServicesOperational ? "operational" : "degraded",
      description:
        "Agenda, calendarios y sincronización con Google Calendar/Meet.",
      lastUpdated: checkedAt,
    },
    {
      id: "payments-fn",
      name: "Pagos y facturación",
      status:
        coreServicesOperational && paymentStatus === "operational"
          ? "operational"
          : paymentStatus === "unknown"
          ? "unknown"
          : "degraded",
      description:
        "Cobros con Stripe Connect, facturas fiscales y conciliación.",
      lastUpdated: checkedAt,
    },
    {
      id: "notifications",
      name: "Notificaciones y correos",
      status: emailStatus,
      description:
        "Recordatorios de citas, actualización de estado y comunicaciones transaccionales.",
      lastUpdated: checkedAt,
    },
    {
      id: "support",
      name: "Soporte y tickets",
      status: coreServicesOperational ? "operational" : "degraded",
      description:
        "Formulario de soporte, inbox de tickets y alertas para el equipo.",
      lastUpdated: checkedAt,
    },
  ];

  return {
    checkedAt,
    summary: {
      backendStatus,
      databaseStatus,
      vercelStatus,
      apiLatencyMs,
      apiBaseUrl: API_BASE_URL,
      uptime,
    },
    stats,
    services,
    functions,
  };
}

