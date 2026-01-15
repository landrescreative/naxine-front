/**
 * Production Guard - Componente y utilidad para proteger rutas en producción
 * 
 * En modo producción (APP_ENV=production), solo /proximamente y /registro-profesional
 * son accesibles. Todas las demás rutas redirigen a /registro-profesional.
 */

import { redirect } from "next/navigation";

/**
 * Lista de rutas permitidas en producción
 * La raíz "/" está permitida porque muestra el contenido de registro-profesional
 * gracias al rewrite en next.config.ts
 */
const ALLOWED_ROUTES_IN_PRODUCTION = [
  "/",
  "/proximamente",
  "/registro-profesional",
];

/**
 * Verifica si una ruta está permitida en producción
 */
export function isRouteAllowedInProduction(pathname: string): boolean {
  return ALLOWED_ROUTES_IN_PRODUCTION.some((route) =>
    pathname.startsWith(route)
  );
}

/**
 * Guard para Server Components
 * Redirige a /registro-profesional si estamos en producción y la ruta no está permitida
 * 
 * Uso en cualquier página:
 * ```tsx
 * import { ProductionGuard } from "@/lib/production-guard";
 * 
 * export default function MyPage() {
 *   ProductionGuard();
 *   return <div>...</div>;
 * }
 * ```
 */
export function ProductionGuard(currentPath?: string) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";
  const isProductionMode = appEnv === "production";

  // Si no estamos en producción, no hacer nada
  if (!isProductionMode) {
    return;
  }

  // Si no se proporciona currentPath, no podemos verificar
  // (esto se maneja en el middleware para navegación del lado del cliente)
  if (!currentPath) {
    return;
  }

  // Si la ruta actual está permitida, no hacer nada
  if (isRouteAllowedInProduction(currentPath)) {
    return;
  }

  // Redirigir a /registro-profesional
  redirect("/registro-profesional");
}

/**
 * Hook para Client Components (opcional, por si se necesita en el futuro)
 */
export function useProductionGuard(currentPath?: string) {
  if (typeof window === "undefined") {
    // En el servidor, usar ProductionGuard normal
    ProductionGuard(currentPath);
    return;
  }

  // En el cliente, el middleware ya maneja las redirecciones
  // Este hook es principalmente para consistencia
}

