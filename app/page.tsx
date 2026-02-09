"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { Pencil } from "lucide-react"

export default function Page() {
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <TimeTrackingSection editMode={editMode} />
        <SubscriptionsSection editMode={editMode} />
      </main>
      <footer className="relative border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Cygnet Institute SOW Dashboard &middot; Governed by Michigan Law
        &middot; All data stored locally in your browser
        <button
          onClick={() => setEditMode((prev) => !prev)}
          className={`absolute right-4 bottom-1/2 translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
            editMode
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
          aria-label={editMode ? "Disable editing" : "Enable editing"}
        >
          <Pencil className="h-3 w-3" />
        </button>
      </footer>
    </div>
  )
}
