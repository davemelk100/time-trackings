"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { GrandTotalSection } from "@/components/grand-total-section"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultClients } from "@/lib/project-data"


export default function Page() {
  const [editMode, setEditMode] = useState(false)
  const [activeClientId, setActiveClientId] = useState(defaultClients[0].id)

  const activeClient = defaultClients.find((c) => c.id === activeClientId) ?? defaultClients[0]

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName="Admin" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <Tabs value={activeClientId} onValueChange={setActiveClientId}>
          <TabsList>
            {defaultClients.map((client) => (
              <TabsTrigger key={client.id} value={client.id}>
                {client.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <TimeTrackingSection editMode={editMode} clientId={activeClient.id} />
        <SubscriptionsSection editMode={editMode} clientId={activeClient.id} />
        <GrandTotalSection clientId={activeClient.id} />
      </main>
      <footer className="relative border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Melkonian Industries LLC
        <button
          onClick={() => setEditMode(!editMode)}
          className={`absolute right-4 bottom-1/2 translate-y-1/2 h-3 w-3 rounded-full transition-colors shadow-[0_0_3px_rgba(0,0,0,0.08)] ${
            editMode
              ? "bg-primary"
              : "bg-card"
          }`}
          aria-label={editMode ? "Disable editing" : "Enable editing"}
        />
      </footer>
    </div>
  )
}
