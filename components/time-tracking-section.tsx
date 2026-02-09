"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TimeEntry,
  defaultTimeEntries,
  timeTrackingMeta,
} from "@/lib/project-data";
import {
  fetchTimeEntries,
  upsertTimeEntry,
  deleteTimeEntry as deleteTimeEntryApi,
  seedTimeEntries,
} from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

const HOURLY_RATE = 62;

function getReportingPeriod(): string {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(first)} - ${fmt(now)}`;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/** Generate time options in 15-min increments from 6:00 AM to 11:45 PM */
function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour24 = String(h).padStart(2, "0");
      const min = String(m).padStart(2, "0");
      const value = `${hour24}:${min}`;

      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${hour12}:${min} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

/** Convert 24h time string "HH:MM" to a readable 12h label */
function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${mStr} ${period}`;
}

/** Calculate hours between two 24h time strings */
function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (endMin <= startMin) return 0;
  return Math.round(((endMin - startMin) / 60) * 100) / 100;
}

interface EntryForm {
  date: string;
  startTime: string;
  endTime: string;
  tasks: string;
  notes: string;
}

const emptyForm: EntryForm = {
  date: "",
  startTime: "",
  endTime: "",
  tasks: "",
  notes: "",
};

export function TimeTrackingSection({
  editMode = false,
  clientId = "cygnet",
}: {
  editMode?: boolean;
  clientId?: string;
}) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // Fetch entries from Supabase on mount / client change
  useEffect(() => {
    let cancelled = false;
    setMounted(false);
    setError(null);

    async function load() {
      try {
        let rows = await fetchTimeEntries(clientId);
        if (cancelled) return;

        // Seed defaults for the cygnet client on first use
        if (rows.length === 0 && clientId === "cygnet") {
          await seedTimeEntries(defaultTimeEntries, clientId);
          rows = await fetchTimeEntries(clientId);
          if (cancelled) return;
        }

        setEntries(rows);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load time entries",
          );
      } finally {
        if (!cancelled) setMounted(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0);
  const totalCost = totalHours * HOURLY_RATE;

  const calculatedHours = calcHours(form.startTime, form.endTime);

  function openAdd() {
    setEditingEntry(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(entry: TimeEntry) {
    setEditingEntry(entry);
    setForm({
      date: entry.date,
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      tasks: entry.tasks,
      notes: entry.notes,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.date || !form.startTime) return;
    if (form.endTime && calculatedHours <= 0) return;

    const timeRange = form.endTime
      ? `${formatTime12(form.startTime)} - ${formatTime12(form.endTime)}`
      : `${formatTime12(form.startTime)} - In Progress`;
    const entryData: Omit<TimeEntry, "id"> = {
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      timeRange,
      totalHours: form.endTime ? calculatedHours : 0,
      tasks: form.tasks,
      notes: form.notes,
    };

    try {
      if (editingEntry) {
        const updated = { ...editingEntry, ...entryData };
        // Optimistic update
        setEntries((prev) =>
          prev.map((e) => (e.id === editingEntry.id ? updated : e)),
        );
        await upsertTimeEntry(updated, clientId);
      } else {
        const newEntry: TimeEntry = { id: crypto.randomUUID(), ...entryData };
        setEntries((prev) => [...prev, newEntry]);
        await upsertTimeEntry(newEntry, clientId);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save time entry",
      );
      // Re-fetch to restore consistent state
      try {
        const rows = await fetchTimeEntries(clientId);
        setEntries(rows);
      } catch {
        /* keep error visible */
      }
    }
  }

  async function handleDelete(id: string) {
    // Optimistic update
    const prev = entries;
    setEntries(entries.filter((e) => e.id !== id));
    setDeleteConfirm(null);

    try {
      await deleteTimeEntryApi(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete time entry",
      );
      setEntries(prev);
    }
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading time entries...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4text-destructive">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meta info */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle>Invoice Details</CardTitle>
              {editMode && (
                <Button onClick={openAdd} size="sm" className="w-fit">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Entry
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-0.5 items-center text-center">
              <span className="text-muted-foreground">Payable To</span>
              <span className="font-medium">{timeTrackingMeta.payableTo}</span>
              <span className="text-muted-foreground">
                2680 Diane Marie Ct
                <br />
                Waterford, MI 48329
              </span>
            </div>
            <div className="flex justify-end">
              <div className="flex flex-col gap-0.5 text-center">
                <span className="text-muted-foreground">Reporting Period</span>
                <span className="font-medium">{getReportingPeriod()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Entries table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Time Tracking</CardTitle>
            <p className="mt-1 text-muted-foreground">
              Billable hours and task details
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                {editMode && (
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {
                      'No time entries yet. Click "Add Entry" to start tracking.'
                    }
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
                        },
                      )}
                    </TableCell>
                    <TableCell className="max-w-[280px]text-muted-foreground">
                      {entry.tasks}
                    </TableCell>
                    <TableCell className="max-w-[200px]text-muted-foreground">
                      {entry.notes || "\u2014"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {entry.timeRange}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.totalHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-monotext-muted-foreground">
                      {formatCurrency(entry.totalHours * HOURLY_RATE)}
                    </TableCell>
                    {editMode && (
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
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
            {entries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {totalHours.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(totalCost)}
                  </TableCell>
                  {editMode && <TableCell />}
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
                : "Select start and end times to automatically calculate hours."}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Start Time</Label>
                <Select
                  value={form.startTime}
                  onValueChange={(val) => setForm({ ...form, startTime: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>End Time</Label>
                <Select
                  value={form.endTime}
                  onValueChange={(val) => setForm({ ...form, endTime: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-calculated hours preview */}
            {form.startTime && form.endTime && (
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    Calculated Hours
                  </span>
                  <span className="font-mono font-bold">
                    {calculatedHours > 0
                      ? calculatedHours.toFixed(2)
                      : "Invalid range"}
                  </span>
                </div>
                {calculatedHours > 0 && (
                  <div className="ml-auto flex flex-col text-right">
                    <span className="text-muted-foreground">
                      Estimated Cost
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {formatCurrency(calculatedHours * HOURLY_RATE)}
                    </span>
                  </div>
                )}
              </div>
            )}

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
            <Button
              onClick={handleSave}
              disabled={
                !form.date ||
                !form.startTime ||
                (!!form.endTime && calculatedHours <= 0)
              }
            >
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
              Are you sure you want to delete this time entry? This action
              cannot be undone.
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
  );
}
