import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para:
 * 1. Proteger rutas que requieren autenticación
 * 2. Controlar acceso según el entorno de la aplicación
 *
 * ENTORNOS:
 * - PRODUCCIÓN (naxine.com - APP_ENV=production):
 *   - SOLO 2 rutas visibles: /proximamente y /registro-profesional
 *   - Todas las demás rutas redirigen a /proximamente
 *
 * - STAGING/PRUEBAS (prueba.naxine.com - APP_ENV=staging):
 *   - Todas las páginas son públicas y funcionan normalmente
 *   - Dashboard protegido con autenticación
 *
 * - DESARROLLO LOCAL (localhost - sin APP_ENV o APP_ENV=development):
 *   - Todas las páginas son públicas y funcionan normalmente
 *   - Dashboard protegido con autenticación
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determinar el entorno de la aplicación
  // Si APP_ENV no está definido, se asume desarrollo (comportamiento completo)
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "development";
  const isProductionMode = appEnv === "production";

  // DEBUG: Logs temporales (eliminar después de verificar)
  console.log("🔍 Middleware ejecutándose:", {
    pathname,
    appEnv,
    isProductionMode,
  });

  // ========================================
  // CONTROL DE ACCESO EN MODO PRODUCCIÓN
  // (Solo activo cuando APP_ENV=production)
  // ========================================
  if (isProductionMode) {
    // Lista de rutas permitidas en producción
    const allowedRoutes = ["/proximamente", "/registro-profesional"];

    // Rutas de sistema que siempre deben estar permitidas
    const systemRoutes = ["/_next", "/api", "/favicon.ico", "/public"];

    // Verificar si es una ruta de sistema
    const isSystemRoute = systemRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Verificar si es una ruta permitida
    const isAllowedRoute = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // DEBUG: Logs temporales
    console.log("🔒 Modo producción activo:", {
      isSystemRoute,
      isAllowedRoute,
      shouldRedirect: !isSystemRoute && !isAllowedRoute,
    });

    // Si es la raíz (/), redirigir a /proximamente
    if (pathname === "/") {
      console.log("🔄 Redirigiendo desde raíz a /proximamente");
      const proximamenteUrl = new URL("/proximamente", request.url);
      return NextResponse.redirect(proximamenteUrl);
    }

    // Si no es ruta de sistema, no es ruta permitida, y no es dashboard, redirigir
    if (
      !isSystemRoute &&
      !isAllowedRoute &&
      !pathname.startsWith("/dashboard")
    ) {
      console.log("🔄 Redirigiendo a /proximamente desde:", pathname);
      const proximamenteUrl = new URL("/proximamente", request.url);
      return NextResponse.redirect(proximamenteUrl);
    }
  }

  // ========================================
  // PROTECCIÓN DE RUTAS DEL DASHBOARD
  // ========================================
  if (pathname.startsWith("/dashboard")) {
    // Obtener token de las cookies
    const token = request.cookies.get("auth-token")?.value;

    // Si no hay token en cookies, redirigir a login
    // El token se guarda en cookies cuando el usuario hace login (ver useAuth.ts)
    if (!token) {
      const loginUrl = new URL("/iniciar-sesion", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // El token está presente, permitir acceso
    // La validación real del token y verificación de roles se hace en el backend
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
