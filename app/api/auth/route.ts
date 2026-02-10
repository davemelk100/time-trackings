import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface SessionPayload {
  role: "admin" | "client"
  clientId: string | null
}

const PASSCODE_MAP: Record<string, SessionPayload> = {
  PASSCODE_ADMIN: { role: "admin", clientId: null },
  PASSCODE_CYGNET: { role: "client", clientId: "cygnet" },
  PASSCODE_MINDFLIP: { role: "client", clientId: "client-b" },
  PASSCODE_CLIENT_C: { role: "client", clientId: "client-c" },
}

function matchPasscode(passcode: string): SessionPayload | null {
  for (const [envKey, payload] of Object.entries(PASSCODE_MAP)) {
    const envVal = process.env[envKey]
    if (envVal && envVal === passcode) return payload
  }
  return null
}

export async function POST(request: Request) {
  const { passcode } = (await request.json()) as { passcode?: string }

  if (!passcode || passcode.length !== 5) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 })
  }

  const session = matchPasscode(passcode)
  if (!session) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  return NextResponse.json({ role: session.role, clientId: session.clientId })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return NextResponse.json({ ok: true })
}
