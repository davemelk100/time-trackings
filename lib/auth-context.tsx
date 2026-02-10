"use client"

import { createContext, useContext, useMemo } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"

interface Session {
  role: "admin" | "client"
  clientId: string | null
}

interface AuthContextValue {
  supabase: SupabaseClient
  isAdmin: boolean
  clientId: string | null
  signIn: (passcode: string) => Promise<{ error: string | null; role?: string; clientId?: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const isAdmin = session?.role === "admin"
  const clientId = session?.clientId ?? null

  async function signIn(passcode: string) {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? "Invalid passcode" }
    router.refresh()
    return { error: null, role: data.role, clientId: data.clientId }
  }

  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" })
    router.push("/login")
    router.refresh()
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
