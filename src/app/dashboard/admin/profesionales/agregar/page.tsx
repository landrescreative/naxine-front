"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, X, Plus, Upload, Trash2, Save } from "lucide-react";
import { useState } from "react";
import SaveChangesModal from "@/components/dashboard/SaveChangesModal";

export default function AgregarProfesionalPage() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    correoElectronico: "",
    telefono: "",
    numeroColegiado: "",
    especialidad: "",
    direccion: "",
    biografia: "",
    especialidadSeleccionada: "Psicología",
    fotoPerfil: null as File | null,
    precios: {
      primeraSesion: {
        precio: "",
        nombre: "Terapia ansiedad",
        duracion: "30 min",
      },
      seguimiento: {
        precio: "",
        nombre: "Terapia ansiedad",
        duracion: "30 min",
      },
      pack3: { precio: "", nombre: "Terapia ansiedad", duracion: "30 min" },
    },
    modalidadSesiones: ["En Linea", "Presencial"],
    diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    horarioDesde: "05:00 AM",
    horarioHasta: "6:00 PM",
  });

  // Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrecios = (
    tipo: keyof typeof form.precios,
    campo: string,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      precios: {
        ...prev.precios,
        [tipo]: {
          ...prev.precios[tipo],
          [campo]: value,
        },
      },
    }));
  };

  const toggleModalidad = (modalidad: string) => {
    setForm((prev) => ({
      ...prev,
      modalidadSesiones: prev.modalidadSesiones.includes(modalidad)
        ? prev.modalidadSesiones.filter((m) => m !== modalidad)
        : [...prev.modalidadSesiones, modalidad],
    }));
  };

  const toggleDia = (dia: string) => {
    setForm((prev) => ({
      ...prev,
      diasDisponibles: prev.diasDisponibles.includes(dia)
        ? prev.diasDisponibles.filter((d) => d !== dia)
        : [...prev.diasDisponibles, dia],
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      update("fotoPerfil", file);
    }
  };

  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    // Handle form submission
    console.log("Form submitted:", form);
    setIsSaveModalOpen(false);
    router.push("/dashboard/admin/profesionales");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Añadir profesional nuevo
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Administración de usuarios</span>
            <ChevronRight className="h-4 w-4" />
            <span>Profesionales</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">
              Agregar profesional nuevo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-primary hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            style={{ color: "white" }}
          >
            <Save className="h-4 w-4" />
            Guardar Profesional
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información General
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={form.nombreCompleto}
                    onChange={(e) => update("nombreCompleto", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={form.correoElectronico}
                    onChange={(e) =>
                      update("correoElectronico", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => update("telefono", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de colegiado
                  </label>
                  <input
                    type="text"
                    value={form.numeroColegiado}
                    onChange={(e) => update("numeroColegiado", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad o área profesional
                  </label>
                  <input
                    type="text"
                    value={form.especialidad}
                    onChange={(e) => update("especialidad", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => update("direccion", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía
                </label>
                <textarea
                  value={form.biografia}
                  onChange={(e) => update("biografia", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Foto de perfil */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Foto de perfil de profesional
            </h2>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Foto</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Arrastra una imagen, o haz click para agregar una.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Agregar Imagen
              </label>
            </div>
          </div>

          {/* Precios */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Precios
            </h2>

            <div className="space-y-4">
              {/* Primera Sesión */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={form.precios.primeraSesion.precio}
                      onChange={(e) =>
                        updatePrecios("primeraSesion", "precio", e.target.value)
                      }
                      placeholder="Type base price here..."
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre del paquete
                  </label>
                  <input
                    type="text"
                    value={form.precios.primeraSesion.nombre}
                    onChange={(e) =>
                      updatePrecios("primeraSesion", "nombre", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={form.precios.primeraSesion.duracion}
                    onChange={(e) =>
                      updatePrecios("primeraSesion", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Sesión de Seguimiento */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={form.precios.seguimiento.precio}
                      onChange={(e) =>
                        updatePrecios("seguimiento", "precio", e.target.value)
                      }
                      placeholder="Type base price here..."
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre del paquete
                  </label>
                  <input
                    type="text"
                    value={form.precios.seguimiento.nombre}
                    onChange={(e) =>
                      updatePrecios("seguimiento", "nombre", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={form.precios.seguimiento.duracion}
                    onChange={(e) =>
                      updatePrecios("seguimiento", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Pack x3 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={form.precios.pack3.precio}
                      onChange={(e) =>
                        updatePrecios("pack3", "precio", e.target.value)
                      }
                      placeholder="Type base price here..."
                      className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nombre del paquete
                  </label>
                  <input
                    type="text"
                    value={form.precios.pack3.nombre}
                    onChange={(e) =>
                      updatePrecios("pack3", "nombre", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={form.precios.pack3.duracion}
                    onChange={(e) =>
                      updatePrecios("pack3", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Modalidad de Sesiones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad de Sesiones
                </label>
                <div className="flex flex-wrap gap-2">
                  {["En Linea", "Presencial", "A domicilio"].map(
                    (modalidad) => (
                      <div
                        key={modalidad}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                          form.modalidadSesiones.includes(modalidad)
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        <span>{modalidad}</span>
                        {form.modalidadSesiones.includes(modalidad) && (
                          <button
                            onClick={() => toggleModalidad(modalidad)}
                            className="text-primary hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )
                  )}
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Horario
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((dia) => (
                    <div
                      key={dia}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                        form.diasDisponibles.includes(dia)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <span>{dia}</span>
                      {form.diasDisponibles.includes(dia) && (
                        <button
                          onClick={() => toggleDia(dia)}
                          className="text-primary hover:text-primary/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="text"
                    value={form.horarioDesde}
                    onChange={(e) => update("horarioDesde", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="text"
                    value={form.horarioHasta}
                    onChange={(e) => update("horarioHasta", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Especialidad */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Especialidad
            </h2>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Especialidad
            </h3>

            <div className="relative">
              <select
                value={form.especialidadSeleccionada}
                onChange={(e) =>
                  update("especialidadSeleccionada", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white"
              >
                <option value="Psicología">Psicología</option>
                <option value="Psiquiatría">Psiquiatría</option>
                <option value="Terapia Familiar">Terapia Familiar</option>
                <option value="Psicología Deportiva">
                  Psicología Deportiva
                </option>
                <option value="Neuropsicología">Neuropsicología</option>
                <option value="Psicología Forense">Psicología Forense</option>
                <option value="Psicología Infantil">Psicología Infantil</option>
                <option value="Sexología">Sexología</option>
                <option value="Psicología de la Salud">
                  Psicología de la Salud
                </option>
                <option value="Psicología Organizacional">
                  Psicología Organizacional
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <SaveChangesModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={confirmSave}
      />
    </div>
  );
}
