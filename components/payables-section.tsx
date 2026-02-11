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
import { Badge } from "@/components/ui/badge";
import type { Payable } from "@/lib/project-data";
import {
  fetchPayables,
  upsertPayable,
  deletePayable as deletePayableApi,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
}: {
  editMode?: boolean;
  clientId?: string;
}) {
  const { supabase } = useAuth();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setError(null);

    async function load() {
      try {
        const rows = await fetchPayables(supabase, clientId);
        if (cancelled) return;
        setPayables(rows);
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
  }, [clientId, supabase]);

  const totalOwed = payables
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payables
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm({ ...emptyForm, date: todayISO() });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((p: Payable) => {
    setEditingId(p.id);
    setForm({
      description: p.description,
      amount: p.amount,
      date: p.date,
      notes: p.notes,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.description.trim()) return;

    const payableId = editingId ?? crypto.randomUUID();

    try {
      setSaving(true);

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
        };
        setPayables((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        );
        await upsertPayable(supabase, updated, clientId);
      } else {
        const newPayable: Payable = {
          id: payableId,
          description: form.description,
          amount: form.amount,
          date: form.date,
          paid: false,
          paidDate: "",
          notes: form.notes,
        };
        setPayables((prev) => [newPayable, ...prev]);
        await upsertPayable(supabase, newPayable, clientId);
      }
      setDialogOpen(false);
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
  }, [editingId, form, clientId, supabase, payables]);

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = payables;
      setPayables((current) => current.filter((p) => p.id !== id));

      try {
        await deletePayableApi(supabase, id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete payable",
        );
        setPayables(prev);
      }
    },
    [payables, supabase],
  );

  const togglePaid = useCallback(
    async (p: Payable) => {
      const newPaid = !p.paid;
      const updated: Payable = {
        ...p,
        paid: newPaid,
        paidDate: newPaid ? todayISO() : "",
      };
      setPayables((prev) =>
        prev.map((item) => (item.id === p.id ? updated : item)),
      );

      try {
        await upsertPayable(supabase, updated, clientId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update payable",
        );
        try {
          const rows = await fetchPayables(supabase, clientId);
          setPayables(rows);
        } catch {
          /* keep error visible */
        }
      }
    },
    [supabase, clientId],
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
            <CardTitle>Payables</CardTitle>
          </div>
          {editMode && (
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
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Notes</TableHead>
                  {editMode && (
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
                      colSpan={editMode ? 7 : 6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No payables yet. Click &quot;Add Payable&quot; to get
                      started.
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
                      <TableCell className="text-right font-mono">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell>
                        <button type="button" onClick={() => togglePaid(p)}>
                          <Badge
                            variant={p.paid ? "default" : "secondary"}
                            className="cursor-pointer select-none"
                          >
                            {p.paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.paidDate
                          ? new Date(
                              p.paidDate + "T00:00:00",
                            ).toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-muted-foreground">
                        {p.notes || "\u2014"}
                      </TableCell>
                      {editMode && (
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
                    <TableCell colSpan={2} className="font-semibold">
                      Total Owed
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatCurrency(totalOwed)}
                    </TableCell>
                    <TableCell colSpan={editMode ? 4 : 3} />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">
                      Total Paid
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-muted-foreground">
                      {formatCurrency(totalPaid)}
                    </TableCell>
                    <TableCell colSpan={editMode ? 4 : 3} />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

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
