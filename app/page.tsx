"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { PayablesSection } from "@/components/payables-section"
import { GrandTotalSection } from "@/components/grand-total-section"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Archive } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ArchivedInvoiceView } from "@/components/archived-invoice-view"
import { type Client, type Invoice, defaultClients } from "@/lib/project-data"
import { fetchClients, insertClient, fetchInvoices, createInvoice } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function Page() {
  const { supabase } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [activeClientId, setActiveClientId] = useState("")
  const [mounted, setMounted] = useState(false)

  // Add Client dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newFlatRate, setNewFlatRate] = useState("")
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [payablesKey, setPayablesKey] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // Invoice / archive state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current")
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archiveCopySubs, setArchiveCopySubs] = useState(false)
  const [archiveNotes, setArchiveNotes] = useState("")
  const [archiving, setArchiving] = useState(false)

  // Fetch clients from Supabase on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        let rows = await fetchClients(supabase)
        if (cancelled) return

        // Seed from defaults if table is empty
        if (rows.length === 0) {
          for (const c of defaultClients) {
            await insertClient(supabase, { id: c.id, name: c.name, hourlyRate: c.hourlyRate, flatRate: c.flatRate })
          }
          rows = await fetchClients(supabase)
          if (cancelled) return
        }

        setClients(rows)
        if (!cancelled && rows.length > 0) {
          setActiveClientId((prev) => prev || rows[0].id)
        }
      } catch {
        // Fallback to hardcoded defaults
        setClients(defaultClients)
        setActiveClientId((prev) => prev || defaultClients[0].id)
      } finally {
        if (!cancelled) setMounted(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [supabase])

  // Fetch invoices when active client changes
  useEffect(() => {
    if (!activeClientId) return
    let cancelled = false

    async function loadInvoices() {
      try {
        const inv = await fetchInvoices(supabase, activeClientId)
        if (!cancelled) {
          setInvoices(inv)
          setSelectedPeriod("current")
        }
      } catch {
        if (!cancelled) setInvoices([])
      }
    }

    loadInvoices()
    return () => { cancelled = true }
  }, [activeClientId, supabase, refreshKey])

  const activeClient = clients.find((c) => c.id === activeClientId) ?? clients[0]
  const selectedInvoice = selectedPeriod !== "current"
    ? invoices.find((inv) => inv.id === selectedPeriod) ?? null
    : null

  async function handleArchive() {
    if (!activeClient) return
    setArchiving(true)
    try {
      await createInvoice(supabase, activeClient.id, {
        copySubscriptionsForward: archiveCopySubs,
        notes: archiveNotes,
      })
      setArchiveDialogOpen(false)
      setArchiveNotes("")
      setArchiveCopySubs(false)
      setRefreshKey((k) => k + 1)
      setPayablesKey((k) => k + 1)
      setSelectedPeriod("current")
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create invoice")
    } finally {
      setArchiving(false)
    }
  }

  async function handleAddClient() {
    if (!newName.trim()) return
    setSaving(true)
    setAddError(null)

    const id = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const hourlyRate = newRate.trim() ? Number(newRate) : null
    const flatRate = newFlatRate.trim() ? Number(newFlatRate) : null

    try {
      await insertClient(supabase, { id, name: newName.trim(), hourlyRate, flatRate })
      const rows = await fetchClients(supabase)
      setClients(rows)
      setActiveClientId(id)
      setAddDialogOpen(false)
      setNewName("")
      setNewRate("")
      setNewFlatRate("")
      setAddError(null)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add client")
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader clientName="Admin" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center text-muted-foreground">
          Loading...
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName="Admin" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 print:hidden overflow-x-auto">
            <Tabs value={activeClientId} onValueChange={setActiveClientId}>
              <TabsList className="flex-wrap h-auto">
                {clients.map((client) => (
                  <TabsTrigger key={client.id} value={client.id}>
                    {client.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setAddDialogOpen(true)}
              aria-label="Add client"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="hidden print:block text-lg font-semibold">{activeClient?.name}</span>
          <Button onClick={() => setArchiveDialogOpen(true)} variant="default" size="sm" className="gap-1.5 shrink-0 print:hidden">
            <Archive className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
        {activeClient && invoices.length > 0 && (
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
        {activeClient && selectedInvoice ? (
          <ArchivedInvoiceView invoice={selectedInvoice} />
        ) : activeClient && (
          <>
            {activeClient.id !== "nextier" && (
              <>
                <TimeTrackingSection editMode clientId={activeClient.id} hourlyRate={activeClient.hourlyRate} flatRate={activeClient.flatRate} refreshKey={refreshKey} />
                <SubscriptionsSection editMode clientId={activeClient.id} refreshKey={refreshKey} />
              </>
            )}
            <PayablesSection editMode clientId={activeClient.id} hourlyRate={activeClient.hourlyRate} flatRate={activeClient.flatRate} onPayablesChange={() => setPayablesKey((k) => k + 1)} />
            <GrandTotalSection clientId={activeClient.id} hourlyRate={activeClient.hourlyRate} flatRate={activeClient.flatRate} refreshKey={payablesKey + refreshKey} />
            {/* New Invoice button moved to top bar */}
          </>
        )}
      </main>
      <DashboardFooter />

      {/* Archive / New Invoice Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Archive the current period data into a new invoice. All current entries, subscriptions, and payables will be stamped to this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="copy-subs"
                checked={archiveCopySubs}
                onCheckedChange={(checked) => setArchiveCopySubs(checked === true)}
              />
              <Label htmlFor="copy-subs">Copy subscriptions to new period</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="archive-notes">Notes</Label>
              <Textarea
                id="archive-notes"
                placeholder="Optional invoice notes..."
                rows={3}
                value={archiveNotes}
                onChange={(e) => setArchiveNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleArchive} disabled={archiving}>
              {archiving ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>
              Create a new client. The ID is auto-generated from the name.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                placeholder="Client name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-rate">Hourly Rate</Label>
                <Input
                  id="client-rate"
                  type="number"
                  placeholder="e.g. 75"
                  min="0"
                  step="0.01"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  disabled={!!newFlatRate.trim()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-flat-rate">Flat Rate</Label>
                <Input
                  id="client-flat-rate"
                  type="number"
                  placeholder="e.g. 5000"
                  min="0"
                  step="0.01"
                  value={newFlatRate}
                  onChange={(e) => setNewFlatRate(e.target.value)}
                  disabled={!!newRate.trim()}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Set either an hourly rate or a flat rate, not both.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient} disabled={saving || !newName.trim()}>
              {saving ? "Saving..." : "Add Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
