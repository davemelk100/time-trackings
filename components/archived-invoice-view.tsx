"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Invoice, TimeEntry, Subscription, Payable } from "@/lib/project-data"
import {
  fetchTimeEntriesByInvoice,
  fetchSubscriptionsByInvoice,
  fetchPayablesByInvoice,
} from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

export function ArchivedInvoiceView({ invoice }: { invoice: Invoice }) {
  const { supabase } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [subs, setSubs] = useState<Subscription[]>([])
  const [payables, setPayables] = useState<Payable[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [e, s, p] = await Promise.all([
          fetchTimeEntriesByInvoice(supabase, invoice.id),
          fetchSubscriptionsByInvoice(supabase, invoice.id),
          fetchPayablesByInvoice(supabase, invoice.id),
        ])
        if (cancelled) return
        setEntries(e)
        setSubs(s)
        setPayables(p)
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [invoice.id, supabase])

  if (!loaded) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading archived invoice...
        </CardContent>
      </Card>
    )
  }

  const periodLabel = invoice.periodStart && invoice.periodEnd
    ? `${new Date(invoice.periodStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(invoice.periodEnd + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "N/A"

  return (
    <div className="flex flex-col gap-6">
      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground">Period</span>
              <p className="font-medium">{periodLabel}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time</span>
              <p className="font-mono font-medium">{formatCurrency(invoice.totalTime)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Subscriptions</span>
              <p className="font-mono font-medium">{formatCurrency(invoice.totalSubscriptions)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payables</span>
              <p className="font-mono font-medium">{formatCurrency(invoice.totalPayables)}</p>
            </div>
          </div>
          {invoice.notes && (
            <p className="mt-3 text-sm text-muted-foreground">{invoice.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Archived Time Entries */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="max-w-[280px] text-muted-foreground">{entry.tasks}</TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">{entry.notes || "\u2014"}</TableCell>
                      <TableCell className="whitespace-nowrap">{entry.timeRange}</TableCell>
                      <TableCell className="text-right font-mono">{entry.totalHours.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {entries.reduce((sum, e) => sum + e.totalHours, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archived Subscriptions */}
      {subs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Software Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.category}</TableCell>
                      <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.renewalDate
                          ? new Date(sub.renewalDate + "T00:00:00").toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">{sub.notes || "\u2014"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sub.amount)}
                        <span className="ml-1 text-muted-foreground">
                          /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archived Payables */}
      {payables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{invoice.clientId === "nextier" ? "Nextier Proceeds" : "Payables"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">
                        {p.date
                          ? new Date(p.date + "T00:00:00").toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">{p.notes || "\u2014"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatCurrency(payables.reduce((sum, p) => sum + p.amount, 0))}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grand Total (snapshot) */}
      <Card className="ml-auto sm:max-w-[50%]">
        <CardHeader>
          <CardTitle>Grand Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <div className="flex flex-col items-end">
              <div className="flex flex-col gap-0.5 items-end text-muted-foreground">
                {invoice.totalTime > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span>Time Tracking</span>
                    <span className="font-mono">{formatCurrency(invoice.totalTime)}</span>
                  </div>
                )}
                {invoice.totalSubscriptions > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span>Subscriptions</span>
                    <span className="font-mono">{formatCurrency(invoice.totalSubscriptions)}</span>
                  </div>
                )}
                {invoice.totalPayables > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span>{invoice.clientId === "nextier" ? "Proceeds" : "Payables"}</span>
                    <span className="font-mono">{invoice.clientId === "nextier" ? "" : "\u2212"}{formatCurrency(invoice.totalPayables)}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 border-t border-border pt-1 w-full text-right">
                <span className="font-mono font-bold text-primary">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
