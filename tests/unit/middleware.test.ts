import { describe, it, expect, vi } from "vitest"
import { NextRequest } from "next/server"
import { middleware } from "@/middleware"

function makeRequest(pathname: string, session?: object | string): NextRequest {
  const url = new URL(pathname, "http://localhost:3000")
  const req = new NextRequest(url)
  if (session !== undefined) {
    const value = typeof session === "string" ? session : JSON.stringify(session)
    req.cookies.set("session", value)
  }
  return req
}

function redirectUrl(response: ReturnType<typeof middleware>): string | null {
  const location = response.headers.get("location")
  if (!location) return null
  return new URL(location).pathname
}

describe("middleware", () => {
  // ── API routes pass through ──────────────────────────────────────
  it("allows API routes without auth", () => {
    const res = middleware(makeRequest("/api/auth"))
    expect(res.status).not.toBe(307)
  })

  it("allows API routes even without session", () => {
    const res = middleware(makeRequest("/api/some-endpoint"))
    expect(redirectUrl(res)).toBeNull()
  })

  // ── Unauthenticated ──────────────────────────────────────────────
  it("allows /login for unauthenticated users", () => {
    const res = middleware(makeRequest("/login"))
    expect(res.status).not.toBe(307)
  })

  it("redirects unauthenticated / to /login", () => {
    const res = middleware(makeRequest("/"))
    expect(redirectUrl(res)).toBe("/login")
  })

  it("redirects unauthenticated /reports to /login", () => {
    const res = middleware(makeRequest("/reports"))
    expect(redirectUrl(res)).toBe("/login")
  })

  it("redirects unauthenticated /client/cygnet to /login", () => {
    const res = middleware(makeRequest("/client/cygnet"))
    expect(redirectUrl(res)).toBe("/login")
  })

  // ── Admin role ───────────────────────────────────────────────────
  it("redirects admin from /login to /", () => {
    const res = middleware(makeRequest("/login", { role: "admin", clientId: null }))
    expect(redirectUrl(res)).toBe("/")
  })

  it("allows admin access to /", () => {
    const res = middleware(makeRequest("/", { role: "admin", clientId: null }))
    expect(res.status).not.toBe(307)
  })

  it("allows admin access to /reports", () => {
    const res = middleware(makeRequest("/reports", { role: "admin", clientId: null }))
    expect(res.status).not.toBe(307)
  })

  it("allows admin access to /client/cygnet", () => {
    const res = middleware(makeRequest("/client/cygnet", { role: "admin", clientId: null }))
    expect(res.status).not.toBe(307)
  })

  it("allows admin access to /client/nextier", () => {
    const res = middleware(makeRequest("/client/nextier", { role: "admin", clientId: null }))
    expect(res.status).not.toBe(307)
  })

  // ── Client role (cygnet) ─────────────────────────────────────────
  it("redirects client from /login to their own page", () => {
    const res = middleware(makeRequest("/login", { role: "client", clientId: "cygnet" }))
    expect(redirectUrl(res)).toBe("/client/cygnet")
  })

  it("redirects client from / to their own page", () => {
    const res = middleware(makeRequest("/", { role: "client", clientId: "cygnet" }))
    expect(redirectUrl(res)).toBe("/client/cygnet")
  })

  it("redirects client from /reports to their own page", () => {
    const res = middleware(makeRequest("/reports", { role: "client", clientId: "cygnet" }))
    expect(redirectUrl(res)).toBe("/client/cygnet")
  })

  it("allows client access to their own page", () => {
    const res = middleware(makeRequest("/client/cygnet", { role: "client", clientId: "cygnet" }))
    expect(res.status).not.toBe(307)
  })

  it("blocks client from accessing another client's page", () => {
    const res = middleware(makeRequest("/client/nextier", { role: "client", clientId: "cygnet" }))
    expect(redirectUrl(res)).toBe("/client/cygnet")
  })

  // ── Edge cases ───────────────────────────────────────────────────
  it("treats invalid JSON cookie as unauthenticated", () => {
    const res = middleware(makeRequest("/", "not-valid-json"))
    expect(redirectUrl(res)).toBe("/login")
  })

  it("redirects client with null clientId to /login", () => {
    const res = middleware(makeRequest("/client/cygnet", { role: "client", clientId: null }))
    expect(redirectUrl(res)).toBe("/login")
  })

  it("allows /login for client with null clientId (no redirect)", () => {
    const res = middleware(makeRequest("/login", { role: "client", clientId: null }))
    expect(res.status).not.toBe(307)
  })
})
