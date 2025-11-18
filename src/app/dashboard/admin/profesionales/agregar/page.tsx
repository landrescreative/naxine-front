"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, X, Plus, Upload, Trash2, Save } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { lazyLoad } from "@/lib/lazy-loading";
import { Suspense } from "react";

// Lazy load del modal pesado
const SaveChangesModal = lazyLoad(() => import("@/components/dashboard/SaveChangesModal"));

export default function AgregarProfesionalPage() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    nombreCompleto: "",
    correoElectronico: "",
    telefono: "",
    password: "",
    numeroColegiado: "",
    direccion: "",
    ciudad: "",
    biografia: "",
    especialidadSeleccionada: "",
    idEspecialidad: null as string | number | null,
    fotoPerfil: null as File | null,
    videoPresentacionUrl: "",
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
    modalidadSesiones: ["En Linea"],
    diasDisponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    horarioDesde: "05:00 AM",
    horarioHasta: "6:00 PM",
    // Horarios por tipo de atención (solo En Línea)
    horariosEnLinea: null as {
      dias: string[];
      desde: string;
      hasta: string;
    } | null,
  });

  // Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Specialties state
  const [especialidades, setEspecialidades] = useState<
    Array<{ id: string | number; nombre: string }>
  >([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);

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
      // Crear URL de previsualización
      const url = URL.createObjectURL(file);
      setFotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    }
  };
  const removeSelectedImage = () => {
    update("fotoPerfil", null);
    setFotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    const inputEl = document.getElementById(
      "file-upload"
    ) as HTMLInputElement | null;
    if (inputEl) inputEl.value = "";
  };
  // Validar URL de video (YouTube, Vimeo, etc.)
  const isValidVideoUrl = (url: string): boolean => {
    if (!url.trim()) return true; // URL vacía es válida (opcional)
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      // Permitir YouTube, Vimeo, y otros servicios comunes
      return (
        hostname.includes("youtube.com") ||
        hostname.includes("youtu.be") ||
        hostname.includes("vimeo.com") ||
        hostname.includes("dailymotion.com") ||
        hostname.includes("vimeocdn.com")
      );
    } catch {
      return false;
    }
  };

  // API configuration
  const apiBaseUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    return base.replace(/\/$/, "");
  }, []);

  // Duration options for prices (every 10 minutes)
  const durationOptions = useMemo(() => {
    const options: string[] = [];
    for (let minutes = 10; minutes <= 180; minutes += 10) {
      options.push(`${minutes} min`);
    }
    return options;
  }, []);

  // Get admin token
  const getAdminToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = window.localStorage.getItem("user");
      if (!storedUser) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AgregarProfesionalPage] No hay usuario almacenado");
        }
        return null;
      }

      const parsedUser = JSON.parse(storedUser);
      const role = String(parsedUser?.role || "").toLowerCase();
      if (role === "admin" || role === "administracion") {
        return parsedUser?.token || null;
      }

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[AgregarProfesionalPage] El usuario no posee rol de administrador:",
          role
        );
      }
    } catch (tokenError) {
      console.error(
        "[AgregarProfesionalPage] Error al leer el token de administrador:",
        tokenError
      );
    }

    return null;
  }, []);

  // Extract specialties array from API response
  const extractSpecialtiesArray = useCallback((data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.especialidades))
      return data.data.especialidades;
    if (Array.isArray(data?.especialidades)) return data.especialidades;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.result)) return data.result;
    return [];
  }, []);

  // Fetch specialties from API
  const fetchEspecialidades = useCallback(async () => {
    setLoadingEspecialidades(true);
    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        console.warn(
          "[AgregarProfesionalPage] No se encontró token de administrador"
        );
        return;
      }

      const response = await fetch(`${apiBaseUrl}/especialidades`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error ${response.status} al cargar las especialidades`
        );
      }

      const data = await response.json();
      const specialtiesArray = extractSpecialtiesArray(data);

      // Map specialties to format { id, nombre }
      const mappedSpecialties = specialtiesArray.map(
        (specialty: any, index: number) => ({
          id:
            specialty?.id_especialidad ??
            specialty?.id ??
            specialty?.uuid ??
            `specialty-${index}`,
          nombre:
            specialty?.nombre ?? specialty?.name ?? "Especialidad sin nombre",
        })
      );

      setEspecialidades(mappedSpecialties);

      // Set default specialty if none is selected and specialties are available
      setForm((prevForm) => {
        if (
          !prevForm.especialidadSeleccionada &&
          mappedSpecialties.length > 0
        ) {
          return {
            ...prevForm,
            especialidadSeleccionada: mappedSpecialties[0].nombre,
            idEspecialidad: mappedSpecialties[0].id,
          };
        }
        return prevForm;
      });
    } catch (err: any) {
      console.error(
        "[AgregarProfesionalPage] Error al cargar especialidades:",
        err
      );
      setError(
        err?.message ||
          "Error al cargar las especialidades. Por favor, recarga la página."
      );
    } finally {
      setLoadingEspecialidades(false);
    }
  }, [apiBaseUrl, getAdminToken, extractSpecialtiesArray]);

  // Load specialties on component mount
  useEffect(() => {
    fetchEspecialidades();
  }, [fetchEspecialidades]);

  // Create professional API call
  const crearProfesional = useCallback(
    async (formData: typeof form, adminToken: string) => {
      try {
        // Construir horarios solo para En Línea
        const horariosEnLinea = formData.horariosEnLinea || null;

        // Log para debugging
        console.log("[AgregarProfesional] Horarios construidos:", {
          horariosEnLinea,
          modalidadSesiones: formData.modalidadSesiones,
        });

        const requestBody = {
          // Campos requeridos
          nombreCompleto: formData.nombreCompleto,
          correoElectronico: formData.correoElectronico,
          telefono: formData.telefono,
          password: formData.password,

          // Campos opcionales del formulario
          numeroColegiado: formData.numeroColegiado || "",
          especialidadSeleccionada: formData.especialidadSeleccionada || "",
          direccion: formData.direccion || "",
          ciudad: formData.ciudad || "",
          biografia: formData.biografia || "",

          // Modalidad y disponibilidad
          modalidadSesiones: formData.modalidadSesiones || [],
          diasDisponibles: formData.diasDisponibles || [],
          horarioDesde: formData.horarioDesde || "09:00 AM",
          horarioHasta: formData.horarioHasta || "06:00 PM",

          // Horarios por tipo de atención (solo En Línea)
          horariosEnLinea: horariosEnLinea,

          // Precios (en formato de arreglo esperado por el backend)
          precios: (() => {
            // Modalidad siempre virtual ya que solo se admite En Línea
            const modalidadGlobal = "virtual";

            const preciosArray: Array<any> = [];
            const pushIfValid = (src: {
              precio: string;
              nombre: string;
              duracion: string;
            }) => {
              const precioNum = parseFloat(
                String(src?.precio || "")
                  .toString()
                  .replace(/[^\d.]/g, "")
              );
              const nombreServicio = (src?.nombre || "").trim();
              const duracionStr = (src?.duracion || "").trim(); // ej: "30 min"
              if (!nombreServicio || isNaN(precioNum)) return;
              preciosArray.push({
                nombre_servicio: nombreServicio,
                descripcion: "", // opcional
                precio: precioNum,
                duracion: duracionStr,
                moneda: "MXN",
                modalidad: modalidadGlobal, // el backend puede sobreescribir si requiere por-paquete
                activo: true,
              });
            };
            pushIfValid(formData.precios.primeraSesion);
            pushIfValid(formData.precios.seguimiento);
            pushIfValid(formData.precios.pack3);

            console.log(
              "[AgregarProfesional] Precios construidos para request:",
              preciosArray
            );
            return preciosArray;
          })(),

          // Campos adicionales opcionales
          id_especialidad: formData.idEspecialidad || null,
          domicilio_consultorio: formData.direccion || "",
          experiencia_años: null,
          tarifa_por_hora: null,
          enlace_publico: null,
          video_presentacion: formData.videoPresentacionUrl?.trim() || null,
        };

        console.log(
          "[AgregarProfesional] Request body completo:",
          JSON.stringify(requestBody, null, 2)
        );

        const response = await fetch(
          `${apiBaseUrl}/profesionales/admin/crear`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Handle validation errors
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors
              .map((err: any) => {
                if (typeof err === "string") return err;
                return err.message || err.msg || JSON.stringify(err);
              })
              .join(", ");
            throw new Error(
              errorMessages || data.message || "Error al crear profesional"
            );
          }
          throw new Error(
            data.message || data.error || "Error al crear profesional"
          );
        }

        return data;
      } catch (error) {
        console.error("[AgregarProfesionalPage] Error:", error);
        throw error;
      }
    },
    [apiBaseUrl]
  );

  const handleSave = () => {
    // Validate required fields
    if (!form.nombreCompleto.trim()) {
      setError("El nombre completo es requerido");
      return;
    }
    if (!form.correoElectronico.trim()) {
      setError("El correo electrónico es requerido");
      return;
    }
    if (!form.telefono.trim()) {
      setError("El teléfono es requerido");
      return;
    }
    if (!form.password.trim()) {
      setError("La contraseña es requerida");
      return;
    }

    setError(null);
    setIsSaveModalOpen(true);
  };

  const confirmSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const adminToken = getAdminToken();
      if (!adminToken) {
        throw new Error(
          "No se encontró el token de administrador. Por favor, inicia sesión nuevamente."
        );
      }

      const created = await crearProfesional(form, adminToken);
      // Intentar obtener el id del profesional creado
      const newProfessionalId =
        created?.data?.profesional?.id_profesional ??
        created?.profesional?.id_profesional ??
        created?.id_profesional ??
        null;

      // Si hay una foto seleccionada y tenemos el ID, subirla a S3 vía API
      if (form.fotoPerfil && newProfessionalId) {
        const uploadUrl = `${apiBaseUrl}/profesionales/admin/${newProfessionalId}/foto-perfil`;
        const formDataFile = new FormData();
        formDataFile.append("foto", form.fotoPerfil);
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            // No añadir Content-Type para permitir boundary de FormData
          } as any,
          body: formDataFile,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.warn(
            "[AgregarProfesionalPage] La creación fue exitosa, pero falló la subida de la foto:",
            errData
          );
          // No interrumpir el flujo por fallo de imagen
        }
      }
      // El video_presentacion ya se guardó como URL en la creación del profesional

      // Asegurar que los horarios se creen en disponibilidad_horarios si el backend no los creó
      if (newProfessionalId) {
        try {
          const checkRes = await fetch(
            `${apiBaseUrl}/disponibilidad-horarios/profesional/${newProfessionalId}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          let existing: any[] = [];
          if (checkRes.ok) {
            const existingData = await checkRes.json().catch(() => ({}));
            const pickList =
              (Array.isArray(existingData) && existingData) ||
              existingData?.data?.disponibilidad ||
              existingData?.disponibilidad ||
              existingData?.data ||
              [];
            existing = Array.isArray(pickList) ? pickList : [];
          }

          if (!existing.length) {
            // Construir payload desde los horarios específicos del formulario
            const to24 = (v: string): string => {
              const m = v?.match?.(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
              if (!m) return v && v.length === 5 ? `${v}:00` : v || "";
              let hh = parseInt(m[1], 10);
              const mm = m[2];
              const per = m[3].toUpperCase();
              if (per === "PM" && hh !== 12) hh += 12;
              if (per === "AM" && hh === 12) hh = 0;
              return `${hh.toString().padStart(2, "0")}:${mm}:00`;
            };
            const mapDia = (d: string) =>
              (d || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const secciones: Array<{
              tipo: "en_linea";
              data: { dias: string[]; desde: string; hasta: string } | null;
            }> = [{ tipo: "en_linea", data: form.horariosEnLinea }];

            for (const sec of secciones) {
              const info = sec.data;
              if (
                !info ||
                !info.desde ||
                !info.hasta ||
                !Array.isArray(info.dias) ||
                info.dias.length === 0
              ) {
                continue;
              }
              for (const dia of info.dias) {
                // Calcular turno según hora de inicio
                const hStart = to24(info.desde);
                const hh = parseInt(String(hStart).split(":")[0], 10);
                const turno = isNaN(hh)
                  ? null
                  : hh < 14
                  ? "matutino"
                  : "vespertino";
                const createBody = {
                  id_profesional: Number(newProfessionalId),
                  dia_semana: mapDia(dia),
                  hora_inicio: to24(info.desde),
                  hora_fin: to24(info.hasta),
                  tipo_atencion: sec.tipo,
                  turno: turno,
                  activo: 1,
                };
                const postRes = await fetch(
                  `${apiBaseUrl}/disponibilidad-horarios`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${adminToken}`,
                    },
                    body: JSON.stringify(createBody),
                  }
                );
                if (!postRes.ok) {
                  const postErr = await postRes.json().catch(() => ({}));
                  console.warn(
                    "[AgregarProfesionalPage] Error al crear disponibilidad:",
                    postErr
                  );
                }
              }
            }
          }
        } catch (schedErr) {
          console.warn(
            "[AgregarProfesionalPage] No se pudo verificar/crear disponibilidad:",
            schedErr
          );
        }
      }

      // Success - close modal and redirect
      setIsSaveModalOpen(false);
      router.push("/dashboard/admin/profesionales");
    } catch (err: any) {
      console.error(
        "[AgregarProfesionalPage] Error al crear profesional:",
        err
      );
      setError(
        err?.message ||
          "Error al crear profesional. Por favor, intenta nuevamente."
      );
      setIsSaveModalOpen(false);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "white" }}
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Guardando..." : "Guardar Profesional"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Contraseña para el profesional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => update("ciudad", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ej. Madrid"
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

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                fotoPreviewUrl
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300"
              }`}
            >
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
              <div className="mb-4">
                {fotoPreviewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 text-xs font-medium px-3 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-7.778 7.778a1 1 0 01-1.414 0L3.293 11.263a1 1 0 111.414-1.414l3.101 3.1 7.07-7.07a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Imagen seleccionada
                    </span>
                    <img
                      src={fotoPreviewUrl}
                      alt="Previsualización"
                      className="h-24 w-24 rounded-lg object-cover border border-green-200"
                    />
                    {form.fotoPerfil && (
                      <p className="text-xs text-gray-600 max-w-xs truncate">
                        {form.fotoPerfil.name} (
                        {Math.round(form.fotoPerfil.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Arrastra una imagen, o haz click para agregar una.
                  </p>
                )}
              </div>
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
              {fotoPreviewUrl && (
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ml-3"
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {/* Video de presentación */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Video de presentación
            </h2>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              URL del video (YouTube, Vimeo, etc.)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace del video
                </label>
                <input
                  type="url"
                  value={form.videoPresentacionUrl}
                  onChange={(e) =>
                    update("videoPresentacionUrl", e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Proporciona un enlace de YouTube, Vimeo u otra plataforma de
                  videos. El profesional debe proporcionar este enlace.
                </p>
              </div>

              {form.videoPresentacionUrl &&
                isValidVideoUrl(form.videoPresentacionUrl) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          URL válida
                        </p>
                        <p className="text-xs text-green-700 mt-1 break-all">
                          {form.videoPresentacionUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {form.videoPresentacionUrl &&
                !isValidVideoUrl(form.videoPresentacionUrl) && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          URL inválida
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Por favor, proporciona un enlace válido de YouTube,
                          Vimeo u otra plataforma de videos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  <select
                    value={form.precios.primeraSesion.duracion}
                    onChange={(e) =>
                      updatePrecios("primeraSesion", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Selecciona duración</option>
                    {durationOptions.map((opt) => (
                      <option key={`dur-primera-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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
                  <select
                    value={form.precios.seguimiento.duracion}
                    onChange={(e) =>
                      updatePrecios("seguimiento", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Selecciona duración</option>
                    {durationOptions.map((opt) => (
                      <option key={`dur-seg-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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
                  <select
                    value={form.precios.pack3.duracion}
                    onChange={(e) =>
                      updatePrecios("pack3", "duracion", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Selecciona duración</option>
                    {durationOptions.map((opt) => (
                      <option key={`dur-pack3-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Horario En Línea
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
                  ].map((dia) => {
                    const diasEnLinea = form.horariosEnLinea?.dias || [];
                    const isSelected = diasEnLinea.includes(dia);
                    return (
                      <div
                        key={dia}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                        onClick={() => {
                          const currentDias = form.horariosEnLinea?.dias || [];
                          const newDias = isSelected
                            ? currentDias.filter((d) => d !== dia)
                            : [...currentDias, dia];
                          update("horariosEnLinea", {
                            ...form.horariosEnLinea,
                            dias: newDias,
                            desde: form.horariosEnLinea?.desde || "",
                            hasta: form.horariosEnLinea?.hasta || "",
                          });
                        }}
                      >
                        <span>{dia}</span>
                        {isSelected && <X className="h-3 w-3" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    value={(() => {
                      // Convertir formato 12h AM/PM a formato 24h para input time
                      const desde = form.horariosEnLinea?.desde || "";
                      if (!desde) return "";
                      const match = desde.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                      if (!match) return desde;
                      let hh = parseInt(match[1], 10);
                      const mm = match[2];
                      const per = match[3].toUpperCase();
                      if (per === "PM" && hh !== 12) hh += 12;
                      if (per === "AM" && hh === 12) hh = 0;
                      return `${hh.toString().padStart(2, "0")}:${mm}`;
                    })()}
                    onChange={(e) => {
                      // Convertir formato 24h a formato 12h AM/PM
                      const time24 = e.target.value;
                      if (!time24) {
                        update("horariosEnLinea", {
                          ...form.horariosEnLinea,
                          dias: form.horariosEnLinea?.dias || [],
                          desde: "",
                          hasta: form.horariosEnLinea?.hasta || "",
                        });
                        return;
                      }
                      const [hhStr, mm] = time24.split(":");
                      let hh = parseInt(hhStr, 10);
                      const period = hh >= 12 ? "PM" : "AM";
                      if (hh === 0) hh = 12;
                      else if (hh > 12) hh -= 12;
                      const time12 = `${hh}:${mm} ${period}`;
                      update("horariosEnLinea", {
                        ...form.horariosEnLinea,
                        dias: form.horariosEnLinea?.dias || [],
                        desde: time12,
                        hasta: form.horariosEnLinea?.hasta || "",
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    value={(() => {
                      // Convertir formato 12h AM/PM a formato 24h para input time
                      const hasta = form.horariosEnLinea?.hasta || "";
                      if (!hasta) return "";
                      const match = hasta.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                      if (!match) return hasta;
                      let hh = parseInt(match[1], 10);
                      const mm = match[2];
                      const per = match[3].toUpperCase();
                      if (per === "PM" && hh !== 12) hh += 12;
                      if (per === "AM" && hh === 12) hh = 0;
                      return `${hh.toString().padStart(2, "0")}:${mm}`;
                    })()}
                    onChange={(e) => {
                      // Convertir formato 24h a formato 12h AM/PM
                      const time24 = e.target.value;
                      if (!time24) {
                        update("horariosEnLinea", {
                          ...form.horariosEnLinea,
                          dias: form.horariosEnLinea?.dias || [],
                          desde: form.horariosEnLinea?.desde || "",
                          hasta: "",
                        });
                        return;
                      }
                      const [hhStr, mm] = time24.split(":");
                      let hh = parseInt(hhStr, 10);
                      const period = hh >= 12 ? "PM" : "AM";
                      if (hh === 0) hh = 12;
                      else if (hh > 12) hh -= 12;
                      const time12 = `${hh}:${mm} ${period}`;
                      update("horariosEnLinea", {
                        ...form.horariosEnLinea,
                        dias: form.horariosEnLinea?.dias || [],
                        desde: form.horariosEnLinea?.desde || "",
                        hasta: time12,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
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
                value={form.idEspecialidad ? String(form.idEspecialidad) : ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) {
                    update("idEspecialidad", null);
                    update("especialidadSeleccionada", "");
                    return;
                  }
                  const selectedEspecialidad = especialidades.find(
                    (esp) => String(esp.id) === selectedId
                  );
                  if (selectedEspecialidad) {
                    // Keep the original ID type (string or number) from the especialidad object
                    update("idEspecialidad", selectedEspecialidad.id);
                    update(
                      "especialidadSeleccionada",
                      selectedEspecialidad.nombre
                    );
                  } else {
                    update("idEspecialidad", null);
                    update("especialidadSeleccionada", "");
                  }
                }}
                disabled={loadingEspecialidades}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingEspecialidades ? (
                  <option value="">Cargando especialidades...</option>
                ) : especialidades.length === 0 ? (
                  <option value="">No hay especialidades disponibles</option>
                ) : (
                  <>
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map((especialidad) => (
                      <option
                        key={especialidad.id}
                        value={String(especialidad.id)}
                      >
                        {especialidad.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {loadingEspecialidades ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal - Lazy loaded */}
      {isSaveModalOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          }
        >
          <SaveChangesModal
            isOpen={isSaveModalOpen}
            onClose={() => {
              if (!isLoading) {
                setIsSaveModalOpen(false);
              }
            }}
            onConfirm={confirmSave}
            isLoading={isLoading}
          />
        </Suspense>
      )}
    </div>
  );
}
