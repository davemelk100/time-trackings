import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Invoice, Client } from "@/lib/project-data"
import { fetchAllInvoices, fetchClients } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

export default function ArchivesPage() {
  const { supabase } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [inv, cl] = await Promise.all([
          fetchAllInvoices(supabase),
          fetchClients(supabase),
        ])
        if (cancelled) return
        setInvoices(inv)
        setClients(cl)
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [supabase])

  const clientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? clientId

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName="Archives" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Archived Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                    <TableHead className="text-right">Subs</TableHead>
                    <TableHead className="text-right">Payables</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loaded ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No archived invoices yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => {
                      const periodLabel = inv.periodStart && inv.periodEnd
                        ? `${new Date(inv.periodStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(inv.periodEnd + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "N/A"

                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/client/${inv.clientId}?invoice=${inv.id}`}
                              className="text-primary hover:underline"
                            >
                              {inv.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{clientName(inv.clientId)}</TableCell>
                          <TableCell className="text-muted-foreground">{periodLabel}</TableCell>
                          <TableCell>
                            {inv.paid ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Unpaid</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(inv.totalTime)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(inv.totalSubscriptions)}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(inv.totalPayables)}</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-primary">
                            {formatCurrency(inv.grandTotal)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <DashboardFooter />
    </div>
  )
}
