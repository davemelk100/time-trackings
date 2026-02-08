"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  type TimeEntry,
  defaultTimeEntries,
  timeTrackingMeta,
} from "@/lib/project-data"
import { Plus, Pencil, Trash2 } from "lucide-react"

const STORAGE_KEY = "cygnet-time-entries"

function loadEntries(): TimeEntry[] {
  if (typeof window === "undefined") return defaultTimeEntries
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return defaultTimeEntries
}

function saveEntries(entries: TimeEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

const emptyEntry: Omit<TimeEntry, "id"> = {
  date: "",
  timeRange: "",
  totalHours: 0,
  tasks: "",
  notes: "",
}

export function TimeTrackingSection() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [form, setForm] = useState<Omit<TimeEntry, "id">>(emptyEntry)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    setEntries(loadEntries())
    setMounted(true)
  }, [])

  const persist = useCallback((updated: TimeEntry[]) => {
    setEntries(updated)
    saveEntries(updated)
  }, [])

  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0)
  const totalCost = totalHours * timeTrackingMeta.rate

  function openAdd() {
    setEditingEntry(null)
    setForm(emptyEntry)
    setDialogOpen(true)
  }

  function openEdit(entry: TimeEntry) {
    setEditingEntry(entry)
    setForm({
      date: entry.date,
      timeRange: entry.timeRange,
      totalHours: entry.totalHours,
      tasks: entry.tasks,
      notes: entry.notes,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.date || !form.totalHours) return
    if (editingEntry) {
      const updated = entries.map((e) =>
        e.id === editingEntry.id ? { ...e, ...form } : e
      )
      persist(updated)
    } else {
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        ...form,
      }
      persist([...entries, newEntry])
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    persist(entries.filter((e) => e.id !== id))
    setDeleteConfirm(null)
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading time entries...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Meta info */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl">Time Tracking</CardTitle>
            <Button onClick={openAdd} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Payable To</span>
              <span className="text-sm font-medium">
                {timeTrackingMeta.payableTo}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Rate</span>
              <span className="text-sm font-medium">
                ${timeTrackingMeta.rate}/hr
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Reporting Period
              </span>
              <span className="text-sm font-medium">
                {timeTrackingMeta.reportingPeriod}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{entries.length}</p>
            <p className="text-sm text-muted-foreground">Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalHours.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-muted-foreground">
              Total Cost @ ${timeTrackingMeta.rate}/hr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No time entries yet. Click "Add Entry" to start tracking.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {entry.timeRange}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {entry.totalHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                      {entry.tasks}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                      {entry.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(entry)}
                          aria-label="Edit entry"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(entry.id)}
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {entries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {totalHours.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Badge variant="secondary">
                      {formatCurrency(totalCost)}
                    </Badge>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Time Entry" : "Add Time Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Update the details of this time entry."
                : "Enter the details of the work performed."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-date">Date</Label>
              <Input
                id="entry-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-time">Time Range</Label>
              <Input
                id="entry-time"
                placeholder="e.g. 3:30 - 6:45 PM"
                value={form.timeRange}
                onChange={(e) =>
                  setForm({ ...form, timeRange: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-hours">Total Hours</Label>
              <Input
                id="entry-hours"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 4.67"
                value={form.totalHours || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalHours: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-tasks">Tasks</Label>
              <Textarea
                id="entry-tasks"
                placeholder="Describe the work performed..."
                rows={3}
                value={form.tasks}
                onChange={(e) => setForm({ ...form, tasks: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entry-notes">Notes</Label>
              <Textarea
                id="entry-notes"
                placeholder="Additional notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.date || !form.totalHours}>
              {editingEntry ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Time Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time entry? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
