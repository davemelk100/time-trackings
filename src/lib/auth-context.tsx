import { createContext, useContext, useMemo, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase"

interface Session {
  role: "admin" | "client"
  clientId: string | null
}

interface AuthContextValue {
  supabase: SupabaseClient
  isAdmin: boolean
  clientId: string | null
  signIn: (passcode: string) => { error: string | null; role?: string; clientId?: string | null }
  signOut: () => void
}

const STORAGE_KEY = "session"

const PASSCODE_MAP: Record<string, Session> = {
  VITE_PASSCODE_ADMIN: { role: "admin", clientId: null },
  VITE_PASSCODE_CYGNET: { role: "client", clientId: "cygnet" },
  VITE_PASSCODE_MINDFLIP: { role: "client", clientId: "mindflip" },
  VITE_PASSCODE_NEXTIER: { role: "client", clientId: "nextier" },
}

function matchPasscode(passcode: string): Session | null {
  for (const [envKey, payload] of Object.entries(PASSCODE_MAP)) {
    const envVal = import.meta.env[envKey]
    if (envVal && envVal === passcode) return payload
  }
  return null
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

  const isAdmin = session?.role === "admin"
  const clientId = session?.clientId ?? null

  function signIn(passcode: string) {
    const matched = matchPasscode(passcode)
    if (!matched) return { error: "Invalid passcode" }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matched))
    setSession(matched)
    return { error: null, role: matched.role, clientId: matched.clientId }
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ supabase, isAdmin, clientId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
