"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SuccessPopup from "@/components/ui/SuccessPopup";

interface ReschedulePageProps {
  searchParams: Promise<{
    sessionId?: string;
    professionalName?: string;
    currentDate?: string;
    currentTime?: string;
  }>;
}

export default function ReschedulePage({ searchParams }: ReschedulePageProps) {
  const router = useRouter();
  const sp = use(searchParams);
  const currentDate = sp.currentDate || "Lun 16, Jul 2024";
  const currentTime = sp.currentTime || "5:00pm";
  const [selectedDate, setSelectedDate] = useState("Lun 16");
  const [selectedTime, setSelectedTime] = useState("5:00pm");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Mock data for the professional
  const professional = {
    name: "Carmen Leandra",
    title: "Nutriologa",
    image: "/1821c887-f531-4da4-8c1d-e81b8c21c771.png",
  };

  const handleReschedule = () => {
    setShowSuccessPopup(true);
  };

  const handleConfirmReschedule = () => {
    setShowSuccessPopup(false);
    // Here you would typically make an API call to reschedule the appointment
    router.push("/dashboard/cliente/pagos");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reagendar Cita
              </h1>
              <p className="text-gray-600 mt-1">
                Selecciona una nueva fecha y hora para tu cita
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professional Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden relative">
                  <Image
                    src={professional.image}
                    alt={professional.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {professional.name}
                  </h3>
                  <p className="text-sm text-gray-600">{professional.title}</p>
                </div>
              </div>

              {/* Current Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Cita Actual
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium">{currentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora:</span>
                    <span className="font-medium">{currentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidad:</span>
                    <span className="font-medium">En línea</span>
                  </div>
                </div>
              </div>

              {/* New Appointment Summary */}
              <div className="bg-primary/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Nueva Cita
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium text-primary">
                      {selectedDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora:</span>
                    <span className="font-medium text-primary">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidad:</span>
                    <span className="font-medium text-primary">En línea</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Time Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Selecciona Nueva Fecha y Hora
              </h2>

              {/* Month header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Julio 2024
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date chips */}
              <div className="flex w-full max-w-full gap-3 mb-8 overflow-x-auto snap-x snap-mandatory px-1">
                {[
                  "Lun 16",
                  "Mar 17",
                  "Mier 18",
                  "Juev 19",
                  "Vier 20",
                  "Sab 21",
                  "Dom 22",
                  "Lun 23",
                  "Mar 24",
                  "Mier 25",
                  "Juev 26",
                  "Vier 27",
                ].map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-3 rounded-lg text-sm whitespace-nowrap snap-center transition-all duration-200 ${
                      selectedDate === date
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>

              {/* Times list styled as timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Horarios Disponibles
                </h4>

                {(
                  [
                    { type: "label", text: "9:00pm" },
                    { type: "slot", label: "4:45pm" },
                    { type: "slot", label: "5:00pm", highlight: true },
                    { type: "slot", label: "5:15pm" },
                    { type: "slot", label: "5:30pm" },
                    { type: "slot", label: "5:45pm", highlight: true },
                    { type: "slot", label: "6:00pm", highlight: true },
                    { type: "slot", label: "8:00pm", highlight: true },
                  ] as Array<
                    | { type: "label"; text: string }
                    | { type: "slot"; label: string; highlight?: boolean }
                  >
                ).map((item, idx) =>
                  item.type === "label" ? (
                    <div
                      key={`label-${idx}`}
                      className="text-sm text-gray-600 pl-1"
                    >
                      {item.text}
                    </div>
                  ) : (
                    <button
                      key={`slot-${idx}`}
                      onClick={() => setSelectedTime(item.label)}
                      className={`w-full text-left rounded-xl border flex items-center justify-between transition-all duration-200 overflow-hidden ${
                        selectedTime === item.label
                          ? "bg-primary text-white border-primary"
                          : item.highlight
                          ? "bg-purple-100 border-purple-200 text-gray-900"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="px-6 py-5 text-sm font-medium">
                        {item.label}
                      </span>
                      <span
                        className={`px-4 ${
                          selectedTime === item.label
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                      </span>
                    </button>
                  )
                )}

                {/* subtle dividers between groups */}
                <div className="h-px bg-gray-200" />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReschedule}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Confirmar Reagendamiento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Cita reagendada exitosamente"
        duration={3000}
      />
    </div>
  );
}
