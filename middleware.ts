import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase-server"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session (sets cookies on response)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Allow /login for everyone
  if (pathname === "/login") {
    // If already authenticated, redirect away from login
    if (user) {
      const role = user.app_metadata?.role
      if (role === "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
      const clientId = user.app_metadata?.client_id
      if (clientId) {
        return NextResponse.redirect(new URL(`/client/${clientId}`, request.url))
      }
    }
    return response
  }

  // Unauthenticated → /login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const role = user.app_metadata?.role
  const clientId = user.app_metadata?.client_id as string | undefined

  // Admin gets full access
  if (role === "admin") {
    return response
  }

  // Client restrictions
  if (role === "client" && clientId) {
    // Block admin-only routes
    if (pathname === "/" || pathname === "/reports") {
      return NextResponse.redirect(new URL(`/client/${clientId}`, request.url))
    }

    // Block access to other clients' pages
    if (pathname.startsWith("/client/")) {
      const urlClientId = pathname.split("/")[2]
      if (urlClientId !== clientId) {
        return NextResponse.redirect(new URL(`/client/${clientId}`, request.url))
      }
    }

    return response
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
