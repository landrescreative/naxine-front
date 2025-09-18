"use client";

interface Session {
  id: string;
  time: string;
  professional: string;
  specialty: string;
  description: string;
  isToday?: boolean;
}

interface UpcomingSessionsProps {
  sessions: Session[];
}

import Link from "next/link";

export default function UpcomingSessions({
  sessions,
  basePath = "/dashboard/cliente",
}: UpcomingSessionsProps & { basePath?: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Próximas Sesiones</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="relative rounded-[28px] p-8 pb-12 w-96"
            style={{ backgroundColor: "#DED9FF" }}
          >
            {/* Video Call Icon */}
            <div className="absolute -top-4 right-5">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
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

              <Link
                href={
                  `${basePath}/citas/${session.id}` as `/dashboard/cliente/citas/${string}`
                }
                className="inline-block bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 px-10 rounded-2xl transition-colors absolute right-5 bottom-5"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
