import { type NextRequest, NextResponse } from "next/server"

interface Session {
  role: "admin" | "client"
  clientId: string | null
}

function getSession(request: NextRequest): Session | null {
  const raw = request.cookies.get("session")?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSession(request)

  // Allow API routes without auth check
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow /login for everyone
  if (pathname === "/login") {
    if (session) {
      if (session.role === "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
      if (session.clientId) {
        return NextResponse.redirect(new URL(`/client/${session.clientId}`, request.url))
      }
    }
    return NextResponse.next()
  }

  // Unauthenticated → /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin gets full access
  if (session.role === "admin") {
    return NextResponse.next()
  }

  // Client restrictions
  if (session.role === "client" && session.clientId) {
    // Block admin-only routes
    if (pathname === "/" || pathname === "/reports") {
      return NextResponse.redirect(new URL(`/client/${session.clientId}`, request.url))
    }

    // Block access to other clients' pages
    if (pathname.startsWith("/client/")) {
      const urlClientId = pathname.split("/")[2]
      if (urlClientId !== session.clientId) {
        return NextResponse.redirect(new URL(`/client/${session.clientId}`, request.url))
      }
    }

    return NextResponse.next()
  }

  // Unknown role → login
  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
