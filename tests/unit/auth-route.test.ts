import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next/headers cookies() before importing the route
const mockCookieSet = vi.fn()
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: (...args: unknown[]) => mockCookieSet(...args),
  }),
}))

import { POST, DELETE } from "@/app/api/auth/route"

function makeRequest(body: object): Request {
  return new Request("http://localhost:3000/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PASSCODE_ADMIN = "11111"
    process.env.PASSCODE_CYGNET = "22222"
    process.env.PASSCODE_MINDFLIP = "33333"
    process.env.PASSCODE_NEXTIER = "44444"
  })

  it("rejects missing passcode with 401", async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(401)
  })

  it("rejects short passcode with 401", async () => {
    const res = await POST(makeRequest({ passcode: "123" }))
    expect(res.status).toBe(401)
  })

  it("rejects wrong passcode with 401", async () => {
    const res = await POST(makeRequest({ passcode: "99999" }))
    expect(res.status).toBe(401)
  })

  it("authenticates admin and sets httpOnly cookie", async () => {
    const res = await POST(makeRequest({ passcode: "11111" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ role: "admin", clientId: null })
    expect(mockCookieSet).toHaveBeenCalledWith(
      "session",
      JSON.stringify({ role: "admin", clientId: null }),
      expect.objectContaining({ httpOnly: true, path: "/" }),
    )
  })

  it("authenticates cygnet client", async () => {
    const res = await POST(makeRequest({ passcode: "22222" }))
    const body = await res.json()
    expect(body).toEqual({ role: "client", clientId: "cygnet" })
  })

  it("authenticates mindflip client", async () => {
    const res = await POST(makeRequest({ passcode: "33333" }))
    const body = await res.json()
    expect(body).toEqual({ role: "client", clientId: "client-b" })
  })

  it("authenticates nextier client", async () => {
    const res = await POST(makeRequest({ passcode: "44444" }))
    const body = await res.json()
    expect(body).toEqual({ role: "client", clientId: "nextier" })
  })
})

describe("DELETE /api/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("clears session cookie with maxAge=0", async () => {
    const res = await DELETE()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
    expect(mockCookieSet).toHaveBeenCalledWith(
      "session",
      "",
      expect.objectContaining({ maxAge: 0, httpOnly: true }),
    )
  })
})
