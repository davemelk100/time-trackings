"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { GrandTotalSection } from "@/components/grand-total-section"
import { DashboardFooter } from "@/components/dashboard-footer"
import { type Client, defaultClients } from "@/lib/project-data"
import { fetchClients } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function ClientPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const { supabase } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await fetchClients(supabase)
        if (cancelled) return
        const found = rows.find((c) => c.id === clientId)
        setClient(found ?? null)
      } catch {
        // Fallback to hardcoded defaults
        const found = defaultClients.find((c) => c.id === clientId)
        if (!cancelled) setClient(found ?? null)
      } finally {
        if (!cancelled) setMounted(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [clientId, supabase])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader clientName="Loading..." />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center text-muted-foreground">
          Loading...
        </main>
      </div>
    )
  }

  if (!client) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName={client.name} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <TimeTrackingSection editMode={false} clientId={client.id} hourlyRate={client.hourlyRate} flatRate={client.flatRate} />
        <SubscriptionsSection editMode={false} clientId={client.id} />
        <GrandTotalSection clientId={client.id} hourlyRate={client.hourlyRate} flatRate={client.flatRate} />
      </main>
      <DashboardFooter />
    </div>
  )
}
