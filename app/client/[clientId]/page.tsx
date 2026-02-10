"use client"

import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { GrandTotalSection } from "@/components/grand-total-section"
import { defaultClients } from "@/lib/project-data"

export default function ClientPage() {
  const { clientId } = useParams<{ clientId: string }>()

  const client = defaultClients.find((c) => c.id === clientId)
  if (!client) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName={client.name} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <TimeTrackingSection editMode={false} clientId={client.id} />
        <SubscriptionsSection editMode={false} clientId={client.id} />
        <GrandTotalSection clientId={client.id} />
      </main>
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Melkonian Industries LLC
      </footer>
    </div>
  )
}
