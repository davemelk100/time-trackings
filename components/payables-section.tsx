"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Payable, Attachment } from "@/lib/project-data";
import {
  fetchPayables,
  fetchTimeEntries,
  upsertPayable,
  deletePayable as deletePayableApi,
  deletePayableByMatch,
  updateNextierMirror,
  uploadAttachment,
  getAttachmentUrl,
  deleteAttachment,
  deleteAllAttachments,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pencil, Trash2, Paperclip, X, Download } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  description: "",
  amount: 0,
  date: todayISO(),
  notes: "",
};

export function PayablesSection({
  editMode = false,
  clientId = "cygnet",
  hourlyRate = null,
  flatRate = null,
  onPayablesChange,
}: {
  editMode?: boolean;
  clientId?: string;
  hourlyRate?: number | null;
  flatRate?: number | null;
  onPayablesChange?: () => void;
}) {
  const { supabase } = useAuth();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Attachment[]>([]);
  const [viewAttachmentsPayable, setViewAttachmentsPayable] = useState<Payable | null>(null);
  const [tenPercent, setTenPercent] = useState(0);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setError(null);

    async function load() {
      try {
        const [rows, entries] = await Promise.all([
          fetchPayables(supabase, clientId),
          fetchTimeEntries(supabase, clientId),
        ]);
        if (cancelled) return;
        setPayables(rows);

        const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0);
        const timeCost =
          flatRate != null
            ? flatRate
            : hourlyRate != null
              ? totalHours * hourlyRate
              : 0;
        setTenPercent(Math.round(timeCost * 0.1 * 100) / 100);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load payables",
          );
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId, supabase, hourlyRate, flatRate]);

  const total = payables.reduce((sum, p) => sum + p.amount, 0);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: todayISO(),
      amount: tenPercent,
      description: tenPercent > 0 ? "10% of time entries" : "",
    });
    setPendingFiles([]);
    setExistingAttachments([]);
    setAttachmentsToDelete([]);
    setDialogOpen(true);
  }, [tenPercent]);

  const openEdit = useCallback((p: Payable) => {
    setEditingId(p.id);
    setForm({
      description: p.description,
      amount: p.amount,
      date: p.date,
      notes: p.notes,
    });
    setPendingFiles([]);
    setExistingAttachments(p.attachments ?? []);
    setAttachmentsToDelete([]);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.description.trim()) return;

    const payableId = editingId ?? crypto.randomUUID();

    try {
      setSaving(true);

      // Delete attachments marked for removal
      for (const att of attachmentsToDelete) {
        await deleteAttachment(supabase, att.path);
      }

      // Upload new files
      const newAttachments: Attachment[] = [];
      for (const file of pendingFiles) {
        const att = await uploadAttachment(supabase, file, clientId, payableId);
        newAttachments.push(att);
      }

      // Compute final attachments list
      const remainingExisting = existingAttachments.filter(
        (a) => !attachmentsToDelete.some((d) => d.path === a.path),
      );
      const finalAttachments = [...remainingExisting, ...newAttachments];

      if (editingId) {
        const existing = payables.find((p) => p.id === editingId);
        const updated: Payable = {
          id: editingId,
          description: form.description,
          amount: form.amount,
          date: form.date,
          paid: existing?.paid ?? false,
          paidDate: existing?.paidDate ?? "",
          notes: form.notes,
          attachments: finalAttachments,
        };
        setPayables((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        );
        await upsertPayable(supabase, updated, clientId);

        // Sync changes to the Nextier mirror
        if (clientId !== "nextier" && existing) {
          await updateNextierMirror(supabase, existing.description, existing.amount, existing.date, {
            description: updated.description,
            amount: updated.amount,
            date: updated.date,
            notes: updated.notes,
            attachments: finalAttachments,
          });
        }
      } else {
        const newPayable: Payable = {
          id: payableId,
          description: form.description,
          amount: form.amount,
          date: form.date,
          paid: false,
          paidDate: "",
          notes: form.notes,
          attachments: finalAttachments,
        };
        setPayables((prev) => [newPayable, ...prev]);
        await upsertPayable(supabase, newPayable, clientId);

        // Mirror as a paid proceed on the Nextier client
        if (clientId !== "nextier") {
          const nextierPayable: Payable = {
            id: crypto.randomUUID(),
            description: form.description,
            amount: form.amount,
            date: form.date,
            paid: true,
            paidDate: todayISO(),
            notes: form.notes,
            attachments: finalAttachments,
          };
          await upsertPayable(supabase, nextierPayable, "nextier");
        }
      }
      setDialogOpen(false);
      onPayablesChange?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save payable",
      );
      try {
        const rows = await fetchPayables(supabase, clientId);
        setPayables(rows);
      } catch {
        /* keep error visible */
      }
    } finally {
      setSaving(false);
    }
  }, [editingId, form, clientId, supabase, payables, pendingFiles, existingAttachments, attachmentsToDelete]);

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = payables;
      const toDelete = payables.find((p) => p.id === id);
      setPayables((current) => current.filter((p) => p.id !== id));

      try {
        if (toDelete?.attachments?.length) {
          await deleteAllAttachments(supabase, toDelete.attachments);
        }
        await deletePayableApi(supabase, id);

        // Also delete the mirror record on Nextier
        if (clientId !== "nextier" && toDelete) {
          await deletePayableByMatch(
            supabase,
            "nextier",
            toDelete.description,
            toDelete.amount,
            toDelete.date,
          );
        }
        onPayablesChange?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete payable",
        );
        setPayables(prev);
      }
    },
    [payables, supabase],
  );

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>{clientId === "nextier" ? "Nextier Proceeds" : "Payables"}</CardTitle>
          </div>
          {editMode && clientId !== "nextier" && (
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Payable
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {editMode && clientId !== "nextier" && (
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={(editMode && clientId !== "nextier") ? 5 : 4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {clientId === "nextier"
                        ? "No proceeds yet."
                        : "No payables yet. Click \"Add Payable\" to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  payables.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">
                        {p.date
                          ? new Date(p.date + "T00:00:00").toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.description}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">
                        {p.notes || "\u2014"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          {formatCurrency(p.amount)}
                          {p.attachments?.length > 0 && (
                            <button
                              type="button"
                              className="inline-flex text-muted-foreground hover:text-primary"
                              title={`${p.attachments.length} file(s)`}
                              onClick={() => setViewAttachmentsPayable(p)}
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </TableCell>
                      {editMode && clientId !== "nextier" && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(p.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
              {payables.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatCurrency(total)}
                    </TableCell>
                    {editMode && clientId !== "nextier" && <TableCell />}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Attachments Dialog */}
      <Dialog
        open={viewAttachmentsPayable !== null}
        onOpenChange={() => setViewAttachmentsPayable(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
            <DialogDescription>
              {viewAttachmentsPayable?.attachments?.length ?? 0} file(s) attached
              to this payable.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {viewAttachmentsPayable?.attachments?.map((att) => {
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
              onClick={() => setViewAttachmentsPayable(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Payable" : "Add Payable"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the payable details below."
                : "Enter the details for the new payable."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-desc">Description</Label>
              <Input
                id="pay-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. Website development - Phase 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pay-amount">Amount ($)</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pay-date">Date</Label>
                <Input
                  id="pay-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pay-notes">Notes</Label>
              <Input
                id="pay-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>

            {/* Attachments */}
            <div className="flex flex-col gap-1.5">
              <Label>Attachments</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.description.trim()}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Payable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
