"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <TimeTrackingSection />
        <SubscriptionsSection />
      </main>
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Cygnet Institute SOW Dashboard &middot; Governed by Michigan Law
        &middot; All data stored locally in your browser
      </footer>
    </div>
  )
}
