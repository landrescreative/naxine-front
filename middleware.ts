import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect only the admin entry route with HTTP Basic Auth
  if (pathname.startsWith("/admin")) {
    const authHeader = request.headers.get("authorization") || "";

    const expectedUser = process.env.ADMIN_USER || "naxine";
    const expectedPass = process.env.ADMIN_PASS || "access2024";

    if (authHeader.startsWith("Basic ")) {
      try {
        const base64 = authHeader.slice(6).trim();
        // Use web standard decoder in the Edge runtime
        const decoded = atob(base64);
        const [user, pass] = decoded.split(":");
        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next();
        }
      } catch (err) {
        // ignore and fall through to challenge
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
