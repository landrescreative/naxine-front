"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { valoracionesService } from "@/services/api/valoraciones";
import { Loader2, Star, CheckCircle2, AlertTriangle } from "lucide-react";

function ValoracionForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const idCita = searchParams.get("cita") || "";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [calificacion, setCalificacion] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");

  const puedeEnviar = useMemo(() => {
    return (token || idCita) && calificacion >= 1 && calificacion <= 5 && !submitting;
  }, [token, idCita, calificacion, submitting]);

  useEffect(() => {
    // Opcional: Cargar información inicial por token (si el backend lo soporta)
    const load = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        await valoracionesService.getByToken(token);
      } catch (e) {
        // Ignorar error silenciosamente; el usuario aún puede valorar
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const resp = await valoracionesService.createPublic({
        token: token || undefined,
        id_cita: idCita || undefined,
        calificacion,
        comentario: comentario?.trim() || undefined,
      });
      if (resp.success) {
        setSuccess("¡Gracias! Tu valoración ha sido registrada.");
      } else {
        setError(resp.error || "No se pudo enviar la valoración. Intenta nuevamente.");
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al enviar tu valoración.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Valorar mi sesión</h1>
        <p className="text-sm text-gray-600 mb-6">
          {token
            ? "Usa el siguiente formulario para valorar tu sesión. Este enlace es único para tu cita."
            : idCita
            ? "Estás valorando tu cita por ID. Si recibiste un enlace con token, úsalo para mayor seguridad."
            : "Falta identificador de la cita. Asegúrate de abrir el enlace desde tu correo."}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className="p-1"
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setCalificacion(value)}
                    aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        (hover || calificacion) >= value
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona de 1 a 5 estrellas.
              </p>
            </div>

            <div>
              <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                id="comentario"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Cuéntanos sobre tu experiencia..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!puedeEnviar}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando valoración...
                </>
              ) : (
                "Enviar valoración"
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              Este formulario puede requerir autenticación si la cita lo solicita.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ValoracionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
      </div>
    }>
      <ValoracionForm />
    </Suspense>
  );
}

