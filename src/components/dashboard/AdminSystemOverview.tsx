"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  ShieldCheck,
  Cloud,
  Bell,
  CreditCard,
} from "lucide-react";
import type {
  PlatformDiagnostics,
  ServiceHealth,
} from "@/lib/admin-diagnostics";

const statusConfig: Record<
  ServiceHealth,
  { label: string; classes: string; dot: string }
> = {
  operational: {
    label: "Operativo",
    classes: "bg-green-100 text-green-700 ring-green-200",
    dot: "bg-green-500",
  },
  degraded: {
    label: "Degradado",
    classes: "bg-amber-100 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  down: {
    label: "Caído",
    classes: "bg-red-100 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Desconocido",
    classes: "bg-gray-100 text-gray-600 ring-gray-200",
    dot: "bg-gray-400",
  },
};

const serviceIcons: Record<string, ReactNode> = {
  backend: <Server className="h-5 w-5 text-primary" />,
  database: <Database className="h-5 w-5 text-primary" />,
  vercel: <Cloud className="h-5 w-5 text-primary" />,
  storage: <Cloud className="h-5 w-5 text-primary" />,
  emails: <Bell className="h-5 w-5 text-primary" />,
  payments: <CreditCard className="h-5 w-5 text-primary" />,
};

const StatusBadge = ({ status }: { status: ServiceHealth }) => {
  const config = statusConfig[status] ?? statusConfig.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border text-xs font-medium px-2.5 py-0.5 ${config.classes}`}
      aria-label={`Estado: ${config.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

interface AdminSystemOverviewProps {
  initialDiagnostics: PlatformDiagnostics;
}

export default function AdminSystemOverview({
  initialDiagnostics,
}: AdminSystemOverviewProps) {
  const [diagnostics, setDiagnostics] = useState(initialDiagnostics);
  const [isRefreshing, startTransition] = useTransition();
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const formattedDate = useMemo(
    () =>
      new Date(diagnostics.checkedAt).toLocaleString("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [diagnostics.checkedAt]
  );

  const handleRefresh = () => {
    startTransition(async () => {
      setRefreshError(null);
      try {
        const response = await fetch("/api/admin/diagnostics", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("No se pudo actualizar el diagnóstico.");
        }
        const data = (await response.json()) as PlatformDiagnostics;
        setDiagnostics(data);
      } catch (error) {
        setRefreshError(
          error instanceof Error
            ? error.message
            : "Error desconocido al actualizar."
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Monitor de la plataforma
          </h1>
          <p className="text-sm text-gray-600">
            Última verificación:{" "}
            <span className="font-medium text-gray-900">{formattedDate}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={diagnostics.summary.backendStatus} />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={
              isRefreshing ? "Actualizando diagnóstico" : "Actualizar diagnóstico"
            }
            aria-busy={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Actualizando..." : "Actualizar diagnóstico"}
          </button>
        </div>
      </section>

      {refreshError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {refreshError}
        </div>
      )}

      {/* General stats */}
      <section>
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          role="list"
          aria-label="Indicadores generales"
        >
          {diagnostics.stats.map((stat) => (
            <article
              key={stat.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              role="listitem"
              aria-label={`${stat.label}: ${stat.value}`}
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
              {stat.helper && (
                <p className="mt-2 text-xs text-gray-500">{stat.helper}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Service statuses */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">
            Servicios monitoreados
          </h2>
        </div>
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          role="list"
          aria-label="Estado de servicios monitoreados"
        >
          {diagnostics.services.map((service) => (
            <article
              key={service.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              role="listitem"
              aria-label={`${service.name}: ${statusConfig[service.status]?.label ?? "Desconocido"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    {serviceIcons[service.id] ?? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-sm text-gray-600">{service.detail}</p>
                    {service.latencyMs !== undefined &&
                      service.latencyMs !== null && (
                        <p className="text-xs text-gray-500">
                          Latencia reportada:{" "}
                          <span className="font-semibold text-gray-800">
                            {service.latencyMs.toFixed(0)} ms
                          </span>
                        </p>
                      )}
                  </div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Functional diagnostics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">
            Diagnósticos funcionales
          </h2>
        </div>
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          role="list"
          aria-label="Diagnósticos funcionales"
        >
          {diagnostics.functions.map((fn) => (
            <article
              key={fn.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3"
              role="listitem"
              aria-label={`${fn.name}: ${statusConfig[fn.status]?.label ?? "Desconocido"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{fn.name}</p>
                  <p className="text-sm text-gray-600">{fn.description}</p>
                </div>
                <StatusBadge status={fn.status} />
              </div>
              <p className="text-xs text-gray-500">
                Última actualización:{" "}
                {new Date(fn.lastUpdated).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Backend: <StatusBadge status={diagnostics.summary.backendStatus} />
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Base de datos:{" "}
            <StatusBadge status={diagnostics.summary.databaseStatus} />
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            Infraestructura:{" "}
            <StatusBadge status={diagnostics.summary.vercelStatus} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">API:</span>
            {diagnostics.summary.apiBaseUrl}
          </div>
        </div>
      </section>
    </div>
  );
}

