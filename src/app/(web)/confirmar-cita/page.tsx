"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ConfirmarCitaAuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notas, setNotas] = useState("");

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

            <div className="space-y-4 max-w-md">
              <Link
                href={registroHref}
                className="block w-full flex items-center justify-center text-center bg-[#4C1DFF] hover:bg-[#3b15cc] text-white font-semibold py-3 rounded-full transition-colors"
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
                    <p className="text-sm text-gray-500">
                      {citaInfo.professionalCity}
                    </p>
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
