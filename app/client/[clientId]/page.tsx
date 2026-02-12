"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { PayablesSection } from "@/components/payables-section"
import { GrandTotalSection } from "@/components/grand-total-section"
import { ArchivedInvoiceView } from "@/components/archived-invoice-view"
import { DashboardFooter } from "@/components/dashboard-footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Client, type Invoice, defaultClients } from "@/lib/project-data"
import { fetchClients, fetchInvoices } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function ClientPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const searchParams = useSearchParams()
  const { supabase } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [mounted, setMounted] = useState(false)
  const [payablesKey, setPayablesKey] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await fetchClients(supabase)
        if (cancelled) return
        const found = rows.find((c) => c.id === clientId)
        setClient(found ?? null)
      } catch {
        const found = defaultClients.find((c) => c.id === clientId)
        if (!cancelled) setClient(found ?? null)
      }

      try {
        const inv = await fetchInvoices(supabase, clientId)
        if (cancelled) return
        setInvoices(inv)

        const invoiceParam = searchParams.get("invoice")
        if (invoiceParam && inv.some((i) => i.id === invoiceParam)) {
          setSelectedPeriod(invoiceParam)
        }
      } catch {
        // invoices table may not exist yet
      }

      if (!cancelled) setMounted(true)
    }

    load()
    return () => { cancelled = true }
  }, [clientId, supabase, searchParams])

  const selectedInvoice = selectedPeriod !== "current"
    ? invoices.find((inv) => inv.id === selectedPeriod) ?? null
    : null

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
        {invoices.length > 0 && (
          <div className="flex items-center gap-3 print:hidden">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} ({inv.periodStart && inv.periodEnd
                      ? `${new Date(inv.periodStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(inv.periodEnd + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedInvoice ? (
          <ArchivedInvoiceView invoice={selectedInvoice} />
        ) : (
          <>
            {client.id !== "nextier" && (
              <>
                <TimeTrackingSection editMode={false} clientId={client.id} hourlyRate={client.hourlyRate} flatRate={client.flatRate} />
                {client.id !== "client-b" && (
                  <SubscriptionsSection editMode={false} clientId={client.id} />
                )}
              </>
            )}
            {client.id === "nextier" && (
              <PayablesSection editMode={false} clientId={client.id} hourlyRate={client.hourlyRate} flatRate={client.flatRate} onPayablesChange={() => setPayablesKey((k) => k + 1)} />
            )}
            <GrandTotalSection clientId={client.id} hourlyRate={client.hourlyRate} flatRate={client.flatRate} refreshKey={payablesKey} hidePayables={client.id !== "nextier"} />
          </>
        )}
      </main>
      <DashboardFooter />
    </div>
  )
}
