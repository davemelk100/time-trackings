"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { CostsSection } from "@/components/costs-section"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { DollarSign, Clock } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="costs" className="flex flex-col gap-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
            <TabsTrigger
              value="costs"
              className="flex items-center gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Costs</span>
            </TabsTrigger>
            <TabsTrigger
              value="time"
              className="flex items-center gap-1.5 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time Tracking</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="costs">
            <CostsSection />
          </TabsContent>
          <TabsContent value="time">
            <TimeTrackingSection />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Cygnet Institute SOW Dashboard &middot; Governed by Michigan Law
        &middot; All data stored locally in your browser
      </footer>
    </div>
  )
}
