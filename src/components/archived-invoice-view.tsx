
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, ExternalLink, Check, CircleDashed } from "lucide-react"
import type { Invoice, TimeEntry, Subscription, Payable, Link } from "@/lib/project-data"
import {
  fetchTimeEntriesByInvoice,
  fetchSubscriptionsByInvoice,
  fetchPayablesByInvoice,
  updateInvoice,
} from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

export function ArchivedInvoiceView({ invoice, onInvoiceUpdate }: { invoice: Invoice; onInvoiceUpdate?: (updated: Invoice) => void }) {
  const { supabase } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [subs, setSubs] = useState<Subscription[]>([])
  const [payables, setPayables] = useState<Payable[]>([])
  const [loaded, setLoaded] = useState(false)
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [viewLinksData, setViewLinksData] = useState<Link[]>([])
  const [viewLinksOpen, setViewLinksOpen] = useState(false)
  const [rateHourly, setRateHourly] = useState("")
  const [rateFlat, setRateFlat] = useState("")
  const [rateSaving, setRateSaving] = useState(false)

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

  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0)

  function fmtDate(s: string) { const d = new Date(s + "T00:00:00"); return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`; }
  const periodLabel = invoice.periodStart && invoice.periodEnd
    ? `${fmtDate(invoice.periodStart)} - ${fmtDate(invoice.periodEnd)}`
    : "N/A"

  return (
    <div className="flex flex-col gap-6">
      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-sm">
            <div>
              <span className="text-muted-foreground">Period</span>
              <p className="font-medium">{periodLabel}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Hourly Rate</span>
              <p className="font-mono font-medium">
                {totalHours > 0
                  ? `${formatCurrency(invoice.totalTime / totalHours)}/hr`
                  : "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Time</span>
              <div className="flex items-center gap-1">
                <p className="font-mono font-medium">{formatCurrency(invoice.totalTime)}</p>
                {onInvoiceUpdate && (
                  <button
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setRateHourly("")
                      setRateFlat("")
                      setRateDialogOpen(true)
                    }}
                    aria-label="Edit rate"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
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
          <div className="mt-4 flex items-center gap-2">
            {invoice.paid ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Check className="h-3.5 w-3.5" />
                Paid{invoice.paidDate ? ` on ${fmtDate(invoice.paidDate)}` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <CircleDashed className="h-3.5 w-3.5" />
                Unpaid
              </span>
            )}
            {onInvoiceUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const nowPaid = !invoice.paid
                  const paidDate = nowPaid ? new Date().toISOString().slice(0, 10) : null
                  try {
                    const updated = await updateInvoice(supabase, invoice.id, {
                      paid: nowPaid,
                      paid_date: paidDate,
                    })
                    onInvoiceUpdate(updated)
                  } catch {
                    // silent
                  }
                }}
              >
                {invoice.paid ? "Mark Unpaid" : "Mark as Paid"}
              </Button>
            )}
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
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead className="w-[80px] text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {fmtDate(entry.date)}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-muted-foreground">{entry.tasks}</TableCell>
                      <TableCell className="max-w-[160px] text-muted-foreground">{entry.notes || "\u2014"}</TableCell>
                      <TableCell className="whitespace-nowrap">{entry.timeRange}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="inline-flex items-center gap-1">
                          {entry.totalHours.toFixed(2)}
                          {entry.links && entry.links.length > 0 && (
                            <button
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => { setViewLinksData(entry.links!); setViewLinksOpen(true); }}
                              aria-label="View links"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </TableCell>
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
                    <TableHead className="w-[110px]">Billing Cycle</TableHead>
                    <TableHead className="w-[110px]">Renewal Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px] text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.category}</TableCell>
                      <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.renewalDate ? fmtDate(sub.renewalDate) : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-[160px] text-muted-foreground">{sub.notes || "\u2014"}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="inline-flex items-center gap-1">
                          {formatCurrency(sub.amount)}
                          <span className="text-muted-foreground">
                            /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                          {sub.links && sub.links.length > 0 && (
                            <button
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => { setViewLinksData(sub.links!); setViewLinksOpen(true); }}
                              aria-label="View links"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
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
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">
                        {p.date ? fmtDate(p.date) : "\u2014"}
                      </TableCell>
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="inline-flex items-center gap-1">
                          {formatCurrency(p.amount)}
                          {p.links && p.links.length > 0 && (
                            <button
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => { setViewLinksData(p.links!); setViewLinksOpen(true); }}
                              aria-label="View links"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[160px] text-muted-foreground">{p.notes || "\u2014"}</TableCell>
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
                {(invoice.totalTime > 0 || invoice.totalTime === 0) && entries.length > 0 && (
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

      {/* View Links Dialog */}
      <Dialog open={viewLinksOpen} onOpenChange={setViewLinksOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Links</DialogTitle>
            <DialogDescription>{viewLinksData.length} link(s)</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {viewLinksData.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {link.label || link.url}
              </a>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLinksOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      {onInvoiceUpdate && (
        <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Rate</DialogTitle>
              <DialogDescription>
                Set an hourly rate or flat rate to recalculate the time cost for this invoice.
                Total hours: {totalHours.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rate-hourly">Hourly Rate</Label>
                  <Input
                    id="rate-hourly"
                    type="number"
                    placeholder="e.g. 75"
                    min="0"
                    step="0.01"
                    value={rateHourly}
                    onChange={(e) => setRateHourly(e.target.value)}
                    disabled={!!rateFlat.trim()}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rate-flat">Flat Rate</Label>
                  <Input
                    id="rate-flat"
                    type="number"
                    placeholder="e.g. 5000"
                    min="0"
                    step="0.01"
                    value={rateFlat}
                    onChange={(e) => setRateFlat(e.target.value)}
                    disabled={!!rateHourly.trim()}
                  />
                </div>
              </div>
              {(rateHourly.trim() || rateFlat.trim()) && (
                <p className="text-sm text-muted-foreground">
                  New time cost: {formatCurrency(
                    rateFlat.trim()
                      ? Number(rateFlat)
                      : totalHours * Number(rateHourly)
                  )}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={rateSaving || (!rateHourly.trim() && !rateFlat.trim())}
                onClick={async () => {
                  setRateSaving(true)
                  try {
                    const newTimeCost = rateFlat.trim()
                      ? Math.round(Number(rateFlat) * 100) / 100
                      : Math.round(totalHours * Number(rateHourly) * 100) / 100

                    const isNextier = invoice.clientId === "nextier"
                    const newGrandTotal = isNextier
                      ? invoice.totalPayables
                      : Math.round((newTimeCost + invoice.totalSubscriptions - invoice.totalPayables) * 100) / 100

                    const updated = await updateInvoice(supabase, invoice.id, {
                      total_time: newTimeCost,
                      grand_total: newGrandTotal,
                    })
                    onInvoiceUpdate(updated)
                    setRateDialogOpen(false)
                  } catch {
                    // silent
                  } finally {
                    setRateSaving(false)
                  }
                }}
              >
                {rateSaving ? "Saving..." : "Update Rate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
