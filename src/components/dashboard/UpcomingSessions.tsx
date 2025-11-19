"use client";

interface Session {
  id: string;
  time: string;
  professional: string;
  specialty: string;
  description: string;
  isToday?: boolean;
  tipo_atencion?: "presencial" | "en_linea" | "a_domicilio" | null;
}

interface UpcomingSessionsProps {
  sessions: Session[];
  basePath?: string;
  onViewDetails?: (sessionId: string) => void;
}

export default function UpcomingSessions({
  sessions,
  basePath = "/dashboard/cliente",
  onViewDetails,
}: UpcomingSessionsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Próximas Sesiones</h2>

      {/* Contenedor con scroll horizontal - barra oculta */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .upcoming-sessions-scroll::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `
      }} />
      <div 
        className="overflow-x-auto pb-4 -mx-4 px-4 pt-6 upcoming-sessions-scroll"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex gap-4 min-w-max">
        {sessions.map((session) => (
          <div
            key={session.id}
              className="relative rounded-[20px] sm:rounded-[28px] p-6 sm:p-8 pb-12 sm:pb-12 w-[280px] sm:w-96 flex-shrink-0"
            style={{ backgroundColor: "#DED9FF" }}
          >
            {/* Icon según tipo de atención */}
            <div className="absolute -top-4 right-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm ${
                session.tipo_atencion === "presencial" 
                  ? "bg-blue-500" 
                  : session.tipo_atencion === "a_domicilio"
                  ? "bg-yellow-500"
                  : "bg-primary"
              }`}>
                {session.tipo_atencion === "presencial" ? (
                  // Icono de ubicación para presencial
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                ) : session.tipo_atencion === "a_domicilio" ? (
                  // Icono de casa para a domicilio
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                ) : (
                  // Icono de videollamada para en línea (por defecto)
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Session Content */}
            <div className="pr-16">
              <div className="text-sm font-semibold text-secondary mb-1">
                {session.time}
              </div>

              <div
                className="text-sm font-bold text-gray-900 mb-2"
                style={{ fontWeight: "700" }}
              >
                {session.professional} - {session.specialty}
              </div>

              <div className="text-sm text-primary mb-2">
                {session.description}
              </div>

                <button
                  onClick={() => {
                    if (onViewDetails) {
                      onViewDetails(session.id);
                    }
                  }}
                className="inline-block bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-6 sm:px-10 rounded-xl sm:rounded-2xl transition-colors absolute right-3 sm:right-5 bottom-4 sm:bottom-5"
              >
                Ver detalles
                </button>
              </div>
            </div>
          ))}
          </div>
      </div>
    </div>
  );
}
