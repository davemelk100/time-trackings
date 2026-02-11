"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeTrackingSection } from "@/components/time-tracking-section"
import { SubscriptionsSection } from "@/components/subscriptions-section"
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
import { Printer, Plus } from "lucide-react"
import { type Client, defaultClients } from "@/lib/project-data"
import { fetchClients, insertClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { handlePrint } from "@/lib/print"


export default function Page() {
  const { supabase } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [activeClientId, setActiveClientId] = useState("")
  const [mounted, setMounted] = useState(false)

  // Add Client dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRate, setNewRate] = useState("")
  const [saving, setSaving] = useState(false)

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
            await insertClient(supabase, { id: c.id, name: c.name, hourlyRate: c.hourlyRate })
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

  const activeClient = clients.find((c) => c.id === activeClientId) ?? clients[0]

  async function handleAddClient() {
    if (!newName.trim()) return
    setSaving(true)

    const id = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const hourlyRate = newRate.trim() ? Number(newRate) : null

    try {
      await insertClient(supabase, { id, name: newName.trim(), hourlyRate })
      const rows = await fetchClients(supabase)
      setClients(rows)
      setActiveClientId(id)
      setAddDialogOpen(false)
      setNewName("")
      setNewRate("")
    } catch {
      // keep dialog open on error
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 print:hidden">
            <Tabs value={activeClientId} onValueChange={setActiveClientId}>
              <TabsList>
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
              className="h-8 w-8"
              onClick={() => setAddDialogOpen(true)}
              aria-label="Add client"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="hidden print:block text-lg font-semibold">{activeClient?.name}</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 print:hidden"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
        {activeClient && (
          <>
            <TimeTrackingSection editMode={editMode} clientId={activeClient.id} hourlyRate={activeClient.hourlyRate} />
            <SubscriptionsSection editMode={editMode} clientId={activeClient.id} />
            <GrandTotalSection clientId={activeClient.id} hourlyRate={activeClient.hourlyRate} />
          </>
        )}
      </main>
      <footer className="relative border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        Melkonian Industries LLC
        <button
          onClick={() => setEditMode(!editMode)}
          className={`absolute right-4 bottom-1/2 translate-y-1/2 h-3 w-3 rounded-full transition-colors shadow-[0_0_3px_rgba(0,0,0,0.08)] ${
            editMode
              ? "bg-primary"
              : "bg-card"
          }`}
          aria-label={editMode ? "Disable editing" : "Enable editing"}
        />
      </footer>

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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                placeholder="Client name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-rate">Hourly Rate (optional)</Label>
              <Input
                id="client-rate"
                type="number"
                placeholder="e.g. 75"
                min="0"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
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
