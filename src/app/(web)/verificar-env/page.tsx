/**
 * PÁGINA TEMPORAL PARA VERIFICAR VARIABLES DE ENTORNO
 * Eliminar después de verificar que todo funciona
 */

import Link from "next/link";
import { ProductionGuard } from "@/lib/production-guard";

// Forzar rendering dinámico para que el middleware se ejecute
export const dynamic = "force-dynamic";

export default function VerificarEnvPage() {
  // TEMPORALMENTE comentado para verificar en staging
  // ProductionGuard("/verificar-env");
  
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          🔍 Verificación de Variables de Entorno
        </h1>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">NEXT_PUBLIC_APP_ENV:</p>
            <p className="text-lg font-mono font-bold text-blue-700">
              {appEnv || "❌ NO DEFINIDA"}
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">NODE_ENV:</p>
            <p className="text-lg font-mono font-bold text-green-700">
              {nodeEnv}
            </p>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h2 className="font-bold text-yellow-800 mb-2">
              ✅ Comportamiento Esperado:
            </h2>
            <ul className="text-sm text-yellow-900 space-y-1">
              {appEnv === "production" ? (
                <>
                  <li>✅ APP_ENV = production (CORRECTO)</li>
                  <li>
                    ✅ Solo /proximamente y /registro-profesional visibles
                  </li>
                  <li>⚠️ Esta página NO debería ser accesible en producción</li>
                  <li>
                    🔄 Después de verificar, deberías ser redirigido a
                    /proximamente
                  </li>
                </>
              ) : appEnv === "staging" ? (
                <>
                  <li>✅ APP_ENV = staging (CORRECTO PARA PRUEBAS)</li>
                  <li>✅ Todas las páginas son visibles</li>
                  <li>✅ Esta página es accesible</li>
                </>
              ) : (
                <>
                  <li>
                    ❌ APP_ENV = {appEnv || "undefined"} (NO ES CORRECTO PARA
                    PRODUCCIÓN)
                  </li>
                  <li>
                    ⚠️ Si esto es producción (naxine.com), necesitas configurar
                    NEXT_PUBLIC_APP_ENV=production
                  </li>
                </>
              )}
            </ul>
          </div>

          {appEnv !== "production" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <h2 className="font-bold text-red-800 mb-2">
                ⚠️ Acción Requerida:
              </h2>
              <ol className="text-sm text-red-900 space-y-1 list-decimal list-inside">
                <li>
                  Ve a Vercel Dashboard → Settings → Environment Variables
                </li>
                <li>Agrega: NEXT_PUBLIC_APP_ENV = production</li>
                <li>Marca SOLO "Production" environment</li>
                <li>Haz Redeploy del proyecto</li>
              </ol>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Volver al inicio
          </Link>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>⚠️ ELIMINAR ESTA PÁGINA DESPUÉS DE VERIFICAR</p>
          <p>Archivo: src/app/(web)/verificar-env/page.tsx</p>
        </div>
      </div>
    </div>
  );
}
