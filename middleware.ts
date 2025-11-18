import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para proteger rutas que requieren autenticación
 * 
 * Protege todas las rutas del dashboard (incluyendo /dashboard/admin)
 * verificando que el usuario tenga un token de autenticación válido.
 * 
 * La validación real del token y verificación de roles se hace en el backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas del dashboard - verificar autenticación
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
    "/dashboard/:path*",
  ],
};
