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
  defaultSubscriptions,
  subscriptionCategories,
} from "@/lib/project-data"
import { Plus, Pencil, Trash2 } from "lucide-react"

const STORAGE_KEY = "cygnet-subscriptions"

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
}

export function SubscriptionsSection() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Subscription, "id">>(emptySubscription)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSubscriptions(JSON.parse(stored))
      } else {
        setSubscriptions(defaultSubscriptions)
      }
    } catch {
      setSubscriptions(defaultSubscriptions)
    }
    setLoaded(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
    }
  }, [subscriptions, loaded])

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount
    return sum + s.amount / 12
  }, 0)

  const totalAnnual = totalMonthly * 12

  const openAdd = useCallback(() => {
    setEditingId(null)
    setForm(emptySubscription)
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
    })
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim()) return

    if (editingId) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      )
    } else {
      const newSub: Subscription = {
        id: crypto.randomUUID(),
        ...form,
      }
      setSubscriptions((prev) => [...prev, newSub])
    }
    setDialogOpen(false)
  }, [editingId, form])

  const handleDelete = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  if (!loaded) return null

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Software Subscriptions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Third-party software and service subscriptions
            </p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
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
                  <TableHead className="text-right">Monthly Equiv.</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                      <TableCell className="font-medium text-sm">
                        {sub.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.category}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {sub.billingCycle}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.renewalDate
                          ? new Date(sub.renewalDate + "T00:00:00").toLocaleDateString()
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                        {sub.notes || "\u2014"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(sub.amount)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(
                          sub.billingCycle === "monthly"
                            ? sub.amount
                            : sub.amount / 12
                        )}
                      </TableCell>
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
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        /yr
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatCurrency(totalMonthly)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </TableCell>
                    <TableCell />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? "Save Changes" : "Add Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
