import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient, fetchPasscodes, type PasscodeRow } from "@/lib/supabase"

interface Session {
  role: "admin" | "client"
  clientId: string | null
}

interface AuthContextValue {
  supabase: SupabaseClient
  isAdmin: boolean
  clientId: string | null
  passcodesReady: boolean
  signIn: (passcode: string) => { error: string | null; role?: string; clientId?: string | null }
  signOut: () => void
  reloadPasscodes: () => Promise<void>
}

const STORAGE_KEY = "session"

// Env-var fallback map (used when DB is unavailable)
const ENV_PASSCODE_MAP: Record<string, Session> = {
  VITE_PASSCODE_ADMIN: { role: "admin", clientId: null },
  VITE_PASSCODE_CYGNET: { role: "client", clientId: "cygnet" },
  VITE_PASSCODE_MINDFLIP: { role: "client", clientId: "mindflip" },
  VITE_PASSCODE_NEXTIER: { role: "client", clientId: "nextier" },
}

function matchPasscodeFromEnv(passcode: string): Session | null {
  for (const [envKey, payload] of Object.entries(ENV_PASSCODE_MAP)) {
    const envVal = import.meta.env[envKey]
    if (envVal && envVal === passcode) return payload
  }
  return null
}

function matchPasscodeFromDB(passcode: string, rows: PasscodeRow[]): Session | null {
  const match = rows.find((r) => r.code === passcode)
  if (!match) return null
  return {
    role: match.role,
    clientId: match.role === "client" ? match.client_id : null,
  }
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [session, setSession] = useState<Session | null>(loadSession)
  const [dbPasscodes, setDbPasscodes] = useState<PasscodeRow[]>([])
  const [passcodesReady, setPasscodesReady] = useState(false)

  async function loadPasscodes() {
    try {
      const rows = await fetchPasscodes(supabase)
      setDbPasscodes(rows)
    } catch {
      // DB unavailable — env-var fallback will be used
    } finally {
      setPasscodesReady(true)
    }
  }

  useEffect(() => {
    loadPasscodes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = session?.role === "admin"
  const clientId = session?.clientId ?? null

  function signIn(passcode: string) {
    // Try DB passcodes first, then env-var fallback
    const matched = matchPasscodeFromDB(passcode, dbPasscodes) ?? matchPasscodeFromEnv(passcode)
    if (!matched) return { error: "Invalid passcode" }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matched))
    setSession(matched)
    return { error: null, role: matched.role, clientId: matched.clientId }
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  async function reloadPasscodes() {
    await loadPasscodes()
  }

  return (
    <AuthContext.Provider value={{ supabase, isAdmin, clientId, passcodesReady, signIn, signOut, reloadPasscodes }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
