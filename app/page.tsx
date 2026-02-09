"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"


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
