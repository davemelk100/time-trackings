"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ReportsSection } from "@/components/reports-section"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName="Reports" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <ReportsSection />
      </main>
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Melkonian Industries LLC
      </footer>
    </div>
  )
}
