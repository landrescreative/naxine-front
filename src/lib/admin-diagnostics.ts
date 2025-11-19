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

  const healthData: Record<string, any> =
    backendResponse.success && backendResponse.data
      ? (backendResponse.data as Record<string, any>)
      : {};

  const backendStatus = normalizeStatus(
    backendResponse.success ? healthData?.status ?? "operational" : "down"
  );

  const databaseStatus = normalizeStatus(
    healthData?.database?.status ??
      healthData?.db?.status ??
      healthData?.databaseStatus ??
      healthData?.dbStatus,
    backendStatus === "operational" ? "operational" : "unknown"
  );

  const apiLatencyMs =
    Number(
      healthData?.metrics?.responseTimeMs ??
        healthData?.metrics?.latency ??
        healthData?.responseTime ??
        healthData?.latency
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

  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL;
  const hasCloudinary =
    !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !!process.env.CLOUDINARY_CLOUD_NAME;
  const hasS3 =
    !!process.env.NEXT_PUBLIC_AWS_S3_BUCKET ||
    !!process.env.AWS_S3_BUCKET ||
    !!process.env.AWS_S3_BUCKET_NAME ||
    !!process.env.S3_BUCKET ||
    !!process.env.NEXT_PUBLIC_S3_BUCKET ||
    !!process.env.AWS_BUCKET;

  const rawStorageProvider =
    process.env.NEXT_PUBLIC_MEDIA_PROVIDER ||
    process.env.MEDIA_PROVIDER ||
    process.env.STORAGE_PROVIDER ||
    "";
  const normalizedStorageProvider = rawStorageProvider.toLowerCase();

  const storageProvider =
    (hasSupabase && "Supabase") ||
    (hasCloudinary && "Cloudinary") ||
    (hasS3 && "AWS S3") ||
    (normalizedStorageProvider.includes("supabase") && "Supabase") ||
    (normalizedStorageProvider.includes("cloudinary") && "Cloudinary") ||
    (normalizedStorageProvider.includes("s3") ||
    normalizedStorageProvider.includes("aws")
      ? "AWS S3"
      : normalizedStorageProvider
      ? normalizedStorageProvider
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : null);
  const storageStatus: ServiceHealth = storageProvider
    ? "operational"
    : "unknown";

  const hasResend =
    !!process.env.RESEND_API_KEY || !!process.env.NEXT_PUBLIC_RESEND_API_KEY;
  const hasSendgrid =
    !!process.env.SENDGRID_API_KEY ||
    !!process.env.NEXT_PUBLIC_SENDGRID_API_KEY ||
    !!process.env.SENDGRID_KEY;

  const rawEmailProvider =
    process.env.NEXT_PUBLIC_EMAIL_PROVIDER ||
    process.env.EMAIL_PROVIDER ||
    "";
  const normalizedEmailProvider = rawEmailProvider.toLowerCase();

  const emailProvider =
    (hasResend && "Resend") ||
    (hasSendgrid && "SendGrid") ||
    (normalizedEmailProvider.includes("sendgrid") && "SendGrid") ||
    (normalizedEmailProvider.includes("resend") && "Resend") ||
    (normalizedEmailProvider
      ? normalizedEmailProvider
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : null);
  const emailStatus: ServiceHealth = emailProvider ? "operational" : "unknown";

  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const paymentStatus: ServiceHealth = stripeKey ? "operational" : "unknown";

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
        backendStatus === "operational"
          ? "Respuesta correcta del endpoint /health."
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
        healthData?.database?.message ??
        (databaseStatus === "operational"
          ? "Conexión estable reportada por la API."
          : "Sin confirmación del estado actual."),
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
      detail: storageProvider
        ? `Proveedor configurado: ${storageProvider}.`
        : "No hay proveedor público definido en variables de entorno.",
    },
    {
      id: "emails",
      name: "Notificaciones por correo",
      status: emailStatus,
      detail: emailProvider
        ? `Integración activa con ${emailProvider}.`
        : "Sin claves de proveedor detectadas.",
    },
    {
      id: "payments",
      name: "Procesamiento de pagos",
      status: paymentStatus,
      detail: stripeKey
        ? "Stripe cuenta con clave pública configurada."
        : "Stripe no está configurado (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).",
    },
  ];

  const functions: FunctionDiagnosticInfo[] = [
    {
      id: "auth",
      name: "Autenticación y roles",
      status: backendStatus,
      description:
        "Verificación de sesiones, login y control de acceso para clientes, profesionales y administradores.",
      lastUpdated: checkedAt,
    },
    {
      id: "bookings",
      name: "Reservas y citas",
      status: backendStatus === "operational" ? "operational" : "degraded",
      description:
        "Agenda, calendarios y sincronización con Google Calendar/Meet.",
      lastUpdated: checkedAt,
    },
    {
      id: "payments-fn",
      name: "Pagos y facturación",
      status:
        backendStatus === "operational" && paymentStatus === "operational"
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
      status: backendStatus,
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

