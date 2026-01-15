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
 *   - Todas las demás rutas redirigen a /registro-profesional
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

  // DEBUG: Headers personalizados para verificar ejecución del middleware
  const response = NextResponse.next();
  response.headers.set("x-middleware-executed", "true");
  response.headers.set("x-app-env", appEnv);
  response.headers.set("x-is-production", isProductionMode.toString());

  // ========================================
  // CONTROL DE ACCESO EN MODO PRODUCCIÓN
  // (Solo activo cuando APP_ENV=production)
  // ========================================
  if (isProductionMode) {
    // Lista de rutas permitidas en producción
    // La raíz "/" está permitida para mostrar el registro-profesional directamente
    const allowedRoutes = [
      "/",
      "/proximamente",
      "/registro-profesional",
      "/terminos-condiciones",
      "/politica-de-privacidad",
      "/politica-cookies",
      "/politica-cancelacion",
      "/terminos-condiciones-profesionales",
    ];

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

    // La raíz "/" ahora está permitida y no se redirige
    // Se mostrará directamente el contenido de registro-profesional

    // Si no es ruta de sistema, no es ruta permitida, y no es dashboard, redirigir
    if (
      !isSystemRoute &&
      !isAllowedRoute &&
      !pathname.startsWith("/dashboard")
    ) {
      const registroUrl = new URL("/registro-profesional", request.url);
      const redirect = NextResponse.redirect(registroUrl);
      redirect.headers.set("x-redirect-reason", `blocked-route: ${pathname}`);
      redirect.headers.set("x-is-system-route", isSystemRoute.toString());
      redirect.headers.set("x-is-allowed-route", isAllowedRoute.toString());
      return redirect;
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

  // Agregar headers a todas las respuestas para debugging
  response.headers.set("x-pathname", pathname);
  return response;
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
