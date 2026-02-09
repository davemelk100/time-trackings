"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type Subscription,
  type Attachment,
  defaultSubscriptions,
  subscriptionCategories,
} from "@/lib/project-data"
import {
  fetchSubscriptions,
  upsertSubscription,
  deleteSubscription as deleteSubscriptionApi,
  seedSubscriptions,
  uploadAttachment,
  getAttachmentUrl,
  deleteAttachment,
  deleteAllAttachments,
} from "@/lib/supabase"
import { Plus, Pencil, Trash2, Paperclip, X, Download } from "lucide-react"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

const emptySubscription: Omit<Subscription, "id"> = {
  name: "",
  category: subscriptionCategories[0],
  billingCycle: "monthly",
  amount: 0,
  renewalDate: "",
  notes: "",
  attachments: [],
}

export function SubscriptionsSection({ editMode = false, clientId = "cygnet" }: { editMode?: boolean; clientId?: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Subscription, "id">>(emptySubscription)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([])
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [viewAttachmentsSub, setViewAttachmentsSub] = useState<Subscription | null>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  // Fetch subscriptions from Supabase on mount / client change
  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setError(null)

    async function load() {
      try {
        let rows = await fetchSubscriptions(clientId)
        if (cancelled) return

        // Seed defaults for the cygnet client on first use
        if (rows.length === 0 && clientId === "cygnet") {
          await seedSubscriptions(defaultSubscriptions, clientId)
          rows = await fetchSubscriptions(clientId)
          if (cancelled) return
        }

        setSubscriptions(rows)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load subscriptions")
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [clientId])

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount
    return sum + s.amount / 12
  }, 0)

  const totalAnnual = totalMonthly * 12

  const openAdd = useCallback(() => {
    setEditingId(null)
    setForm(emptySubscription)
    setPendingFiles([])
    setExistingAttachments([])
    setAttachmentsToDelete([])
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((sub: Subscription) => {
    setEditingId(sub.id)
    setForm({
      name: sub.name,
      category: sub.category,
      billingCycle: sub.billingCycle,
      amount: sub.amount,
      renewalDate: sub.renewalDate,
      notes: sub.notes,
      attachments: sub.attachments ?? [],
    })
    setPendingFiles([])
    setExistingAttachments(sub.attachments ?? [])
    setAttachmentsToDelete([])
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return

    const subId = editingId ?? crypto.randomUUID()

    try {
      setUploading(true)

      // Delete attachments marked for removal
      for (const att of attachmentsToDelete) {
        await deleteAttachment(att.path)
      }

      // Upload new files
      const newAttachments: Attachment[] = []
      for (const file of pendingFiles) {
        const att = await uploadAttachment(file, clientId, subId)
        newAttachments.push(att)
      }

      // Compute final attachments list
      const remainingExisting = existingAttachments.filter(
        (a) => !attachmentsToDelete.some((d) => d.path === a.path),
      )
      const finalAttachments = [...remainingExisting, ...newAttachments]

      if (editingId) {
        const updated: Subscription = { id: editingId, ...form, attachments: finalAttachments }
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        )
        await upsertSubscription(updated, clientId)
      } else {
        const newSub: Subscription = {
          id: subId,
          ...form,
          attachments: finalAttachments,
        }
        setSubscriptions((prev) => [...prev, newSub])
        await upsertSubscription(newSub, clientId)
      }
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subscription")
      // Re-fetch to restore consistent state
      try {
        const rows = await fetchSubscriptions(clientId)
        setSubscriptions(rows)
      } catch { /* keep error visible */ }
    } finally {
      setUploading(false)
    }
  }, [editingId, form, clientId, pendingFiles, existingAttachments, attachmentsToDelete])

  const handleDelete = useCallback(async (id: string) => {
    const prev = subscriptions
    const subToDelete = subscriptions.find((s) => s.id === id)
    setSubscriptions((current) => current.filter((s) => s.id !== id))

    try {
      if (subToDelete?.attachments?.length) {
        await deleteAllAttachments(subToDelete.attachments)
      }
      await deleteSubscriptionApi(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subscription")
      setSubscriptions(prev)
    }
  }, [subscriptions])

  if (!loaded) return null

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4text-destructive">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Software Subscriptions</CardTitle>
            <p className="mt-1text-muted-foreground">
              Third-party software and service subscriptions
            </p>
          </div>
          {editMode && (
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
          )}
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
                  {editMode && (
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No subscriptions yet. Click &quot;Add Subscription&quot; to
                      get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.category}
                      </TableCell>
                      <TableCell className="capitalize">
                        {sub.billingCycle}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.renewalDate
                          ? new Date(sub.renewalDate + "T00:00:00").toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-[200px]text-muted-foreground">
                        {sub.notes || "\u2014"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="inline-flex items-center gap-1.5">
                          {formatCurrency(sub.amount)}
                          <span className="ml-1 text-muted-foreground">
                            /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                          {sub.attachments?.length > 0 && (
                            <button
                              type="button"
                              className="inline-flex text-muted-foreground hover:text-primary"
                              title={`${sub.attachments.length} receipt(s)`}
                              onClick={() => setViewAttachmentsSub(sub)}
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </TableCell>
                      {editMode && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(sub)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(sub.id)}
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
              {subscriptions.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(totalAnnual)}
                      <span className="ml-1 font-normal text-muted-foreground">
                        /yr
                      </span>
                    </TableCell>
                    {editMode && <TableCell />}
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
              {editingId ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the subscription details below."
                : "Enter the details for the new subscription."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub-name">Name</Label>
              <Input
                id="sub-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vercel Pro"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger id="sub-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-cycle">Billing Cycle</Label>
                <Select
                  value={form.billingCycle}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      billingCycle: v as "monthly" | "annual",
                    })
                  }
                >
                  <SelectTrigger id="sub-cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-amount">
                  Amount ($/{form.billingCycle === "monthly" ? "mo" : "yr"})
                </Label>
                <Input
                  id="sub-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub-renewal">Renewal Date</Label>
              <Input
                id="sub-renewal"
                type="date"
                value={form.renewalDate}
                onChange={(e) =>
                  setForm({ ...form, renewalDate: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sub-notes">Notes</Label>
              <Input
                id="sub-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>

            {/* Receipts / Attachments */}
            <div className="flex flex-col gap-1.5">
              <Label>Receipts</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  const valid = files.filter((f) => {
                    if (f.size > MAX_FILE_SIZE) {
                      setError(`"${f.name}" exceeds 5 MB limit`)
                      return false
                    }
                    return true
                  })
                  setPendingFiles((prev) => [...prev, ...valid])
                  e.target.value = ""
                }}
              />

              {/* Existing attachments */}
              {existingAttachments
                .filter((a) => !attachmentsToDelete.some((d) => d.path === a.path))
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
                      onClick={() => setAttachmentsToDelete((prev) => [...prev, att])}
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
                      setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
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
            <Button onClick={handleSave} disabled={uploading || !form.name.trim()}>
              {uploading
                ? "Uploading..."
                : editingId
                  ? "Save Changes"
                  : "Add Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attachments Dialog */}
      <Dialog
        open={viewAttachmentsSub !== null}
        onOpenChange={() => setViewAttachmentsSub(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipts</DialogTitle>
            <DialogDescription>
              {viewAttachmentsSub?.attachments?.length ?? 0} receipt(s) attached
              to this subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {viewAttachmentsSub?.attachments?.map((att) => {
              const url = getAttachmentUrl(att.path)
              return (
                <div key={att.path} className="flex flex-col gap-2">
                  <img
                    src={url}
                    alt={att.name}
                    className="w-full rounded-md border object-contain max-h-64"
                  />
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
              )
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewAttachmentsSub(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
