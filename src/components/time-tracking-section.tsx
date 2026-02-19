;

import { useState, useEffect, useMemo } from "react";
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
  type Attachment,
  type Link,
  timeTrackingMeta,
} from "@/lib/project-data";
import {
  fetchTimeEntries,
  upsertTimeEntry,
  deleteTimeEntry as deleteTimeEntryApi,
  uploadAttachment,
  getAttachmentUrl,
  deleteAttachment,
  deleteAllAttachments,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useDemoGuard } from "@/lib/use-demo-guard";
import { demoTimeEntries } from "@/lib/demo-data";
import { Plus, Pencil, Trash2, Paperclip, X, Download, ExternalLink } from "lucide-react";



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
export function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${mStr} ${period}`;
}

/** Calculate hours between two 24h time strings (supports cross-midnight) */
export function calcHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60; // cross-midnight
  return Math.round(((endMin - startMin) / 60) * 100) / 100;
}

interface EntryForm {
  date: string;
  startTime: string;
  endTime: string;
  tasks: string;
  notes: string;
  links: Link[];
}

const emptyForm: EntryForm = {
  date: "",
  startTime: "",
  endTime: "",
  tasks: "",
  notes: "",
  links: [],
};

export function TimeTrackingSection({
  editMode = false,
  clientId = "cygnet",
  clientName,
  hourlyRate = null,
  flatRate = null,
  refreshKey = 0,
  billingPeriodEnd = null,
  isDemo: isDemoProp = false,
  onRateChange,
  onEntriesChange,
}: {
  editMode?: boolean;
  clientId?: string;
  clientName?: string;
  hourlyRate?: number | null;
  flatRate?: number | null;
  refreshKey?: number;
  billingPeriodEnd?: string | null;
  isDemo?: boolean;
  onRateChange?: (hourlyRate: number | null, flatRate: number | null) => void;
  onEntriesChange?: (entries: TimeEntry[]) => void;
}) {
  const { supabase } = useAuth();
  const { guardAction } = useDemoGuard();
  const demoBlock = guardAction(() => {});
  const HOURLY_RATE = hourlyRate;
  const FLAT_RATE = flatRate;
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editHourlyRate, setEditHourlyRate] = useState("");
  const [editFlatRate, setEditFlatRate] = useState("");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    [],
  );
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Attachment[]>(
    [],
  );
  const [uploading, setUploading] = useState(false);
  const [viewAttachmentsEntry, setViewAttachmentsEntry] =
    useState<TimeEntry | null>(null);
  const [viewLinksEntry, setViewLinksEntry] = useState<TimeEntry | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const reportingPeriod = useMemo(() => {
    const dates = entries.map((e) => e.date).filter(Boolean).sort();
    if (dates.length === 0) return null;
    const fmt = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    const startLabel = fmt(new Date(dates[0] + "T00:00:00"));
    if (!billingPeriodEnd) return `${startLabel} - Present`;
    return `${startLabel} - ${fmt(new Date(billingPeriodEnd + "T00:00:00"))}`;
  }, [entries, billingPeriodEnd]);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // Fetch entries from Supabase on mount / client change
  useEffect(() => {
    if (isDemoProp) {
      setEntries(demoTimeEntries[clientId] ?? []);
      setMounted(true);
      return;
    }

    let cancelled = false;
    setMounted(false);
    setError(null);

    async function load() {
      try {
        const rows = await fetchTimeEntries(supabase, clientId);
        if (cancelled) return;

        setEntries(rows);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : typeof err === "object" && err !== null && "message" in err
                ? String((err as { message: unknown }).message)
                : "Failed to load time entries";
          setError(message);
        }
      } finally {
        if (!cancelled) setMounted(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId, supabase, refreshKey, isDemoProp]);

  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0);
  const totalCost = entries.length === 0
    ? null
    : HOURLY_RATE != null
      ? totalHours * HOURLY_RATE
      : null;

  const calculatedHours = calcHours(form.startTime, form.endTime);

  function openAdd() {
    if (isDemoProp) { demoBlock(); return }
    setEditingEntry(null);
    setForm(emptyForm);
    setPendingFiles([]);
    setExistingAttachments([]);
    setAttachmentsToDelete([]);
    setDialogOpen(true);
  }

  function openEdit(entry: TimeEntry) {
    if (isDemoProp) { demoBlock(); return }
    setEditingEntry(entry);
    setForm({
      date: entry.date,
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      tasks: entry.tasks,
      notes: entry.notes,
      links: entry.links ?? [],
    });
    setPendingFiles([]);
    setExistingAttachments(entry.attachments ?? []);
    setAttachmentsToDelete([]);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (isDemoProp) { demoBlock(); return }
    if (!form.date) return;
    if (FLAT_RATE == null && !form.startTime) return;
    if (form.endTime && calculatedHours <= 0) return;

    const timeRange = FLAT_RATE != null
      ? ""
      : form.endTime
        ? `${formatTime12(form.startTime)} - ${formatTime12(form.endTime)}`
        : `${formatTime12(form.startTime)} - In Progress`;

    const entryId = editingEntry?.id ?? crypto.randomUUID();

    try {
      setUploading(true);

      // Delete attachments marked for removal
      for (const att of attachmentsToDelete) {
        await deleteAttachment(supabase, att.path);
      }

      // Upload new files
      const newAttachments: Attachment[] = [];
      for (const file of pendingFiles) {
        const att = await uploadAttachment(supabase, file, clientId, entryId);
        newAttachments.push(att);
      }

      // Compute final attachments list
      const remainingExisting = existingAttachments.filter(
        (a) => !attachmentsToDelete.some((d) => d.path === a.path),
      );
      const finalAttachments = [...remainingExisting, ...newAttachments];

      const entryData: Omit<TimeEntry, "id"> = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        timeRange,
        totalHours: FLAT_RATE != null ? 0 : form.endTime ? calculatedHours : 0,
        tasks: form.tasks,
        notes: form.notes,
        attachments: finalAttachments,
        links: form.links.filter((l) => l.url.trim()),
      };

      if (editingEntry) {
        const updated = { ...editingEntry, ...entryData };
        const newEntries = entries.map((e) => (e.id === editingEntry.id ? updated : e));
        setEntries(newEntries);
        await upsertTimeEntry(supabase, updated, clientId);
        onEntriesChange?.(newEntries);
      } else {
        const newEntry: TimeEntry = { id: entryId, ...entryData };
        const newEntries = [...entries, newEntry];
        setEntries(newEntries);
        await upsertTimeEntry(supabase, newEntry, clientId);
        onEntriesChange?.(newEntries);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save time entry",
      );
      try {
        const rows = await fetchTimeEntries(supabase, clientId);
        setEntries(rows);
      } catch {
        /* keep error visible */
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (isDemoProp) { demoBlock(); return }
    const prev = entries;
    const entryToDelete = entries.find((e) => e.id === id);
    setEntries(entries.filter((e) => e.id !== id));
    setDeleteConfirm(null);

    try {
      // Clean up storage files
      if (entryToDelete?.attachments?.length) {
        await deleteAllAttachments(supabase, entryToDelete.attachments);
      }
      await deleteTimeEntryApi(supabase, id);
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

      {/* Meta info – only shown when entries exist */}
      {entries.length > 0 && (
      <Card>
        <CardHeader>
          {/* Print-only: two-column layout */}
          <div className="invoice-print hidden print:flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              {clientName && <span className="text-lg font-semibold">{clientName}</span>}
              <CardTitle>Invoice Details</CardTitle>
              {reportingPeriod && <span className="text-muted-foreground">{reportingPeriod}</span>}
            </div>
            <div className="flex flex-col gap-1 items-end text-right">
              <div>
                <span className="text-muted-foreground">Payable To: </span>
                <span className="font-medium">{timeTrackingMeta.payableTo}</span>
              </div>
              <div className="text-muted-foreground">2680 Diane Marie Ct, Waterford, MI 48329</div>
              <div>
                <span className="text-muted-foreground">Venmo: </span>
                <span className="font-medium">@MelkonianLLC</span>
              </div>
              <div>
                <span className="text-muted-foreground">{FLAT_RATE != null ? "Flat Rate: " : "Hourly Rate: "}</span>
                <span className="font-medium">{FLAT_RATE != null ? formatCurrency(FLAT_RATE) : HOURLY_RATE != null ? formatCurrency(HOURLY_RATE) : "TBD"}</span>
              </div>
            </div>
          </div>
          {/* Screen: grid layout */}
          <div className="invoice-screen grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-0.5">
              <CardTitle>Invoice Details</CardTitle>
              {reportingPeriod && <span className="text-sm text-muted-foreground">{reportingPeriod}</span>}
            </div>
            <div className="flex flex-col gap-0.5 items-start">
              <span className="text-muted-foreground">Payable To</span>
              <span className="font-medium">{timeTrackingMeta.payableTo}</span>
              <span className="text-muted-foreground">
                2680 Diane Marie Ct
                <br />
                Waterford, MI 48329
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-start">
              <span className="text-muted-foreground">Venmo</span>
              <span className="font-medium">@MelkonianLLC</span>
            </div>
            <div className="flex flex-col gap-0.5 items-start">
              <span className="text-muted-foreground">{FLAT_RATE != null ? "Flat Rate" : "Hourly Rate"}</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{FLAT_RATE != null ? formatCurrency(FLAT_RATE) : HOURLY_RATE != null ? formatCurrency(HOURLY_RATE) : "TBD"}</span>
                {onRateChange && (
                  <button
                    className="text-muted-foreground hover:text-primary print:hidden"
                    onClick={() => {
                      setEditHourlyRate(HOURLY_RATE != null ? String(HOURLY_RATE) : "");
                      setEditFlatRate(FLAT_RATE != null ? String(FLAT_RATE) : "");
                      setRateDialogOpen(true);
                    }}
                    aria-label="Edit rate"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      )}

      {/* Entries table – hidden entirely when empty and not in edit mode */}
      {(entries.length > 0 || editMode) && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Time Tracking</CardTitle>
          </div>
          {editMode && (
            <Button onClick={openAdd} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Entry
            </Button>
          )}
        </CardHeader>
        {entries.length > 0 && (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Tasks</TableHead>
                {FLAT_RATE == null && <TableHead className="w-[110px]">Time Range</TableHead>}
                {FLAT_RATE == null && <TableHead className="w-[80px] text-right">Hours</TableHead>}
                {FLAT_RATE == null && <TableHead className="w-[100px] text-right">Cost</TableHead>}
                {editMode && (
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {(() => { const d = new Date(entry.date + "T00:00:00"); return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`; })()}
                    </TableCell>
                    <TableCell className="max-w-[220px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {entry.tasks}
                        {FLAT_RATE != null && entry.attachments?.length > 0 && (
                          <button
                            type="button"
                            className="inline-flex text-muted-foreground hover:text-primary"
                            title={`${entry.attachments.length} receipt(s)`}
                            onClick={() => setViewAttachmentsEntry(entry)}
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {FLAT_RATE != null && entry.links?.length > 0 && (
                          <button
                            type="button"
                            className="inline-flex text-muted-foreground hover:text-primary"
                            title={`${entry.links.length} link(s)`}
                            onClick={() => setViewLinksEntry(entry)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </TableCell>
                    {FLAT_RATE == null && (
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        {entry.timeRange}
                      </span>
                    </TableCell>
                    )}
                    {FLAT_RATE == null && (
                    <TableCell className="text-right font-mono">
                      {entry.totalHours.toFixed(2)}
                    </TableCell>
                    )}
                    {FLAT_RATE == null && (
                    <TableCell className="text-right font-monotext-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {HOURLY_RATE != null ? formatCurrency(entry.totalHours * HOURLY_RATE) : "TBD"}
                        {entry.attachments?.length > 0 && (
                          <button
                            type="button"
                            className="inline-flex text-muted-foreground hover:text-primary"
                            title={`${entry.attachments.length} receipt(s)`}
                            onClick={() => setViewAttachmentsEntry(entry)}
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {entry.links?.length > 0 && (
                          <button
                            type="button"
                            className="inline-flex text-muted-foreground hover:text-primary"
                            title={`${entry.links.length} link(s)`}
                            onClick={() => setViewLinksEntry(entry)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    </TableCell>
                    )}
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
                ))}
            </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={FLAT_RATE != null ? 2 : 3} className="font-semibold">
                    Total
                  </TableCell>
                  {FLAT_RATE == null ? (
                  <>
                  <TableCell className="text-right font-mono font-semibold">
                    {totalHours.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {totalCost != null ? formatCurrency(totalCost) : "TBD"}
                  </TableCell>
                  </>
                  ) : (
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {formatCurrency(FLAT_RATE)}
                  </TableCell>
                  )}
                  {editMode && <TableCell />}
                </TableRow>
              </TableFooter>
          </Table>
          </div>
        </CardContent>
        )}
      </Card>
      )}

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
                : FLAT_RATE != null
                  ? "Enter the details for this entry."
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

            {FLAT_RATE == null && (
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
            )}

            {/* Auto-calculated hours preview */}
            {FLAT_RATE == null && form.startTime && form.endTime && (
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
                {calculatedHours > 0 && FLAT_RATE == null && (
                  <div className="ml-auto flex flex-col text-right">
                    <span className="text-muted-foreground">
                      Estimated Cost
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {HOURLY_RATE != null ? formatCurrency(calculatedHours * HOURLY_RATE) : "TBD"}
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
            {/* Receipts / Attachments */}
            <div className="flex flex-col gap-1.5">
              <Label>Receipts</Label>
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                multiple
                className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  const valid = files.filter((f) => {
                    if (f.size > MAX_FILE_SIZE) {
                      setError(`"${f.name}" exceeds 5 MB limit`);
                      return false;
                    }
                    return true;
                  });
                  setPendingFiles((prev) => [...prev, ...valid]);
                  e.target.value = "";
                }}
              />

              {/* Existing attachments */}
              {existingAttachments
                .filter(
                  (a) => !attachmentsToDelete.some((d) => d.path === a.path),
                )
                .map((att) => (
                  <div
                    key={att.path}
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{att.name}</span>
                    <span className="ml-auto text-muted-foreground">
                      {(att.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() =>
                        setAttachmentsToDelete((prev) => [...prev, att])
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

              {/* Pending files */}
              {pendingFiles.map((file, idx) => (
                <div
                  key={`pending-${idx}`}
                  className="flex items-center gap-2 rounded-md border border-dashed px-3 py-1.5 text-sm"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() =>
                      setPendingFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-col gap-1.5">
              <Label>Links</Label>
              {form.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...form.links];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      setForm({ ...form, links: updated });
                    }}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...form.links];
                      updated[idx] = { ...updated[idx], url: e.target.value };
                      setForm({ ...form, links: updated });
                    }}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() =>
                      setForm({
                        ...form,
                        links: form.links.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    links: [...form.links, { url: "", label: "" }],
                  })
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Link
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                uploading ||
                !form.date ||
                (FLAT_RATE == null && !form.startTime) ||
                (FLAT_RATE == null && !!form.endTime && calculatedHours <= 0)
              }
            >
              {uploading
                ? "Uploading..."
                : editingEntry
                  ? "Save Changes"
                  : "Add Entry"}
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

      {/* View Attachments Dialog */}
      <Dialog
        open={viewAttachmentsEntry !== null}
        onOpenChange={() => setViewAttachmentsEntry(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipts</DialogTitle>
            <DialogDescription>
              {viewAttachmentsEntry?.attachments?.length ?? 0} receipt(s)
              attached to this entry.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {viewAttachmentsEntry?.attachments?.map((att) => {
              const url = getAttachmentUrl(supabase, att.path);
              return (
                <div key={att.path} className="flex flex-col gap-2">
                  {att.name.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={url}
                      title={att.name}
                      className="w-full rounded-md border h-64"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={att.name}
                      className="w-full rounded-md border object-contain max-h-64"
                    />
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="truncate font-medium">{att.name}</span>
                    <span className="text-muted-foreground">
                      {(att.size / 1024).toFixed(0)} KB
                    </span>
                    <a
                      href={url}
                      download={att.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewAttachmentsEntry(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Links Dialog */}
      <Dialog open={viewLinksEntry !== null} onOpenChange={() => setViewLinksEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Links</DialogTitle>
            <DialogDescription>{viewLinksEntry?.links?.length ?? 0} link(s)</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {viewLinksEntry?.links?.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {link.label || link.url}
              </a>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLinksEntry(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      {onRateChange && (
        <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Rate</DialogTitle>
              <DialogDescription>
                Set an hourly rate or flat rate for this billing period.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-hourly-rate">Hourly Rate</Label>
                  <Input
                    id="edit-hourly-rate"
                    type="number"
                    placeholder="e.g. 75"
                    min="0"
                    step="0.01"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    disabled={!!editFlatRate.trim()}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-flat-rate">Flat Rate</Label>
                  <Input
                    id="edit-flat-rate"
                    type="number"
                    placeholder="e.g. 5000"
                    min="0"
                    step="0.01"
                    value={editFlatRate}
                    onChange={(e) => setEditFlatRate(e.target.value)}
                    disabled={!!editHourlyRate.trim()}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Set either an hourly rate or a flat rate, not both.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const newHourly = editHourlyRate.trim() ? Number(editHourlyRate) : null;
                  const newFlat = editFlatRate.trim() ? Number(editFlatRate) : null;
                  onRateChange(newHourly, newFlat);
                  setRateDialogOpen(false);
                }}
                disabled={!editHourlyRate.trim() && !editFlatRate.trim()}
              >
                Update Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
