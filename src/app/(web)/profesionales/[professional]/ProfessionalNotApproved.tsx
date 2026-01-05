"use client";

import Link from "next/link";
import { Clock, Home, Shield } from "lucide-react";

interface ProfessionalNotApprovedProps {
  professionalName?: string;
  status?: string;
}

export default function ProfessionalNotApproved({
  professionalName,
  status = "pendiente",
}: ProfessionalNotApprovedProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "pendiente":
        return {
          title: "Perfil en Revisión",
          description:
            "Este perfil profesional está siendo revisado por nuestro equipo de administradores.",
          icon: Clock,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "rechazado":
        return {
          title: "Perfil No Disponible",
          description:
            "Este perfil profesional no está disponible en este momento.",
          icon: Shield,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          title: "Perfil No Disponible",
          description:
            "Este perfil profesional no está disponible públicamente en este momento.",
          icon: Shield,
          iconColor: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header con icono */}
          <div className={`${statusInfo.bgColor} px-8 py-12 text-center`}>
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6`}
            >
              <StatusIcon
                className={`w-10 h-10 ${statusInfo.iconColor}`}
                strokeWidth={2}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {statusInfo.title}
            </h1>
            {professionalName && (
              <p className="text-lg text-gray-600">
                Perfil de: <span className="font-semibold">{professionalName}</span>
              </p>
            )}
          </div>

          {/* Contenido */}
          <div className="px-8 py-10">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {statusInfo.description}
              </p>

              {status === "pendiente" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    ¿Qué significa esto?
                  </h3>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Nuestro equipo está verificando la información, credenciales y
                    documentación del profesional para garantizar la calidad y
                    seguridad de nuestros servicios. Este proceso normalmente toma
                    entre 24-48 horas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Si eres el profesional y necesitas información sobre tu perfil,{" "}
            <Link
              href="/contacto"
              className="text-primary hover:underline font-medium"
            >
              contáctanos aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

