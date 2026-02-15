import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import type { TimeEntry, Subscription, Attachment, Client, Payable, Invoice } from "./project-data"

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── Clients CRUD ────────────────────────────────────────────────────

export interface ClientRow {
  id: string
  name: string
  hourly_rate: number | null
  flat_rate: number | null
  billing_period_start: string | null
  billing_period_end: string | null
  created_at: string
}

export function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
    flatRate: row.flat_rate != null ? Number(row.flat_rate) : null,
    billingPeriodStart: row.billing_period_start ?? null,
    billingPeriodEnd: row.billing_period_end ?? null,
  }
}

export async function fetchClients(supabase: SupabaseClient): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data as ClientRow[]).map(rowToClient)
}

export async function insertClient(
  supabase: SupabaseClient,
  client: { id: string; name: string; hourlyRate: number | null; flatRate: number | null },
): Promise<void> {
  const { error } = await supabase.from("clients").insert({
    id: client.id,
    name: client.name,
    hourly_rate: client.hourlyRate,
    flat_rate: client.flatRate,
  })
  if (error) throw error
}

export async function deleteClient(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw error
}

export async function updateClientBillingPeriodStart(
  supabase: SupabaseClient,
  clientId: string,
  date: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ billing_period_start: date })
    .eq("id", clientId)
  if (error) throw error
}

export async function updateClientBillingPeriodEnd(
  supabase: SupabaseClient,
  clientId: string,
  date: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({ billing_period_end: date })
    .eq("id", clientId)
  if (error) throw error
}

// ── snake_case ↔ camelCase mappers ──────────────────────────────────

export interface TimeEntryRow {
  id: string
  client_id: string
  date: string
  start_time: string
  end_time: string
  time_range: string
  total_hours: number
  tasks: string
  notes: string
  attachments: Attachment[]
}

export interface SubscriptionRow {
  id: string
  client_id: string
  name: string
  category: string
  billing_cycle: "monthly" | "annual"
  amount: number
  renewal_date: string | null
  notes: string
  attachments: Attachment[]
}

export function rowToTimeEntry(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    timeRange: row.time_range,
    totalHours: Number(row.total_hours),
    tasks: row.tasks,
    notes: row.notes,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  }
}

export function timeEntryToRow(entry: TimeEntry, clientId: string): Omit<TimeEntryRow, "id"> & { id?: string } {
  return {
    id: entry.id,
    client_id: clientId,
    date: entry.date,
    start_time: entry.startTime,
    end_time: entry.endTime,
    time_range: entry.timeRange,
    total_hours: entry.totalHours,
    tasks: entry.tasks,
    notes: entry.notes,
    attachments: entry.attachments ?? [],
  }
}

export function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    billingCycle: row.billing_cycle,
    amount: Number(row.amount),
    renewalDate: row.renewal_date ?? "",
    notes: row.notes,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  }
}

export function subscriptionToRow(sub: Subscription, clientId: string): Omit<SubscriptionRow, "id"> & { id?: string } {
  return {
    id: sub.id,
    client_id: clientId,
    name: sub.name,
    category: sub.category,
    billing_cycle: sub.billingCycle,
    amount: sub.amount,
    renewal_date: sub.renewalDate || null,
    notes: sub.notes,
    attachments: sub.attachments ?? [],
  }
}

// ── Cross-client queries (for reports) ──────────────────────────────

export interface TimeEntryWithClient extends TimeEntry {
  clientId: string
}

export interface SubscriptionWithClient extends Subscription {
  clientId: string
}

export interface PayableWithClient extends Payable {
  clientId: string
}

export async function fetchAllTimeEntries(supabase: SupabaseClient): Promise<TimeEntryWithClient[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .order("date", { ascending: false })

  if (error) throw error
  return (data as (TimeEntryRow & { client_id: string })[]).map((row) => ({
    ...rowToTimeEntry(row),
    clientId: row.client_id,
  }))
}

export async function fetchAllSubscriptions(supabase: SupabaseClient): Promise<SubscriptionWithClient[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data as (SubscriptionRow & { client_id: string })[]).map((row) => ({
    ...rowToSubscription(row),
    clientId: row.client_id,
  }))
}

export async function fetchAllPayables(supabase: SupabaseClient): Promise<PayableWithClient[]> {
  const { data, error } = await supabase
    .from("payables")
    .select("*")
    .order("date", { ascending: false })

  if (error) throw error
  return (data as (PayableRow & { client_id: string })[]).map((row) => ({
    ...rowToPayable(row),
    clientId: row.client_id,
  }))
}

// ── Time Entries CRUD ───────────────────────────────────────────────

export async function fetchTimeEntries(supabase: SupabaseClient, clientId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("client_id", clientId)
    .is("invoice_id", null)
    .order("date", { ascending: true })

  if (error) throw error
  return (data as TimeEntryRow[]).map(rowToTimeEntry)
}

export async function upsertTimeEntry(supabase: SupabaseClient, entry: TimeEntry, clientId: string): Promise<void> {
  const row = timeEntryToRow(entry, clientId)
  const { error } = await supabase.from("time_entries").upsert(row)
  if (error) throw error
}

export async function deleteTimeEntry(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("time_entries").delete().eq("id", id)
  if (error) throw error
}

export async function seedTimeEntries(supabase: SupabaseClient, entries: TimeEntry[], clientId: string): Promise<void> {
  const rows = entries.map((e) => {
    const row = timeEntryToRow(e, clientId)
    // Let Supabase generate UUIDs for seeded data
    delete row.id
    return row
  })
  const { error } = await supabase.from("time_entries").insert(rows)
  if (error) throw error
}

// ── Subscriptions CRUD ──────────────────────────────────────────────

export async function fetchSubscriptions(supabase: SupabaseClient, clientId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", clientId)
    .is("invoice_id", null)
    .order("name", { ascending: true })

  if (error) throw error
  return (data as SubscriptionRow[]).map(rowToSubscription)
}

export async function upsertSubscription(supabase: SupabaseClient, sub: Subscription, clientId: string): Promise<void> {
  const row = subscriptionToRow(sub, clientId)
  const { error } = await supabase.from("subscriptions").upsert(row)
  if (error) throw error
}

export async function deleteSubscription(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id)
  if (error) throw error
}

export async function seedSubscriptions(supabase: SupabaseClient, subs: Subscription[], clientId: string): Promise<void> {
  const rows = subs.map((s) => {
    const row = subscriptionToRow(s, clientId)
    delete row.id
    return row
  })
  const { error } = await supabase.from("subscriptions").insert(rows)
  if (error) throw error
}

// ── Payables CRUD ───────────────────────────────────────────────────

export interface PayableRow {
  id: string
  client_id: string
  description: string
  amount: number
  date: string
  paid: boolean
  paid_date: string | null
  notes: string
  attachments: Attachment[]
}

export function rowToPayable(row: PayableRow): Payable {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    paid: row.paid,
    paidDate: row.paid_date ?? "",
    notes: row.notes,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  }
}

export function payableToRow(p: Payable, clientId: string): Omit<PayableRow, "id"> & { id?: string } {
  return {
    id: p.id,
    client_id: clientId,
    description: p.description,
    amount: p.amount,
    date: p.date,
    paid: p.paid,
    paid_date: p.paidDate || null,
    notes: p.notes,
    attachments: p.attachments ?? [],
  }
}

export async function fetchPayables(supabase: SupabaseClient, clientId: string): Promise<Payable[]> {
  const { data, error } = await supabase
    .from("payables")
    .select("*")
    .eq("client_id", clientId)
    .is("invoice_id", null)
    .order("date", { ascending: false })

  if (error) throw error
  return (data as PayableRow[]).map(rowToPayable)
}

export async function upsertPayable(supabase: SupabaseClient, payable: Payable, clientId: string): Promise<void> {
  const row = payableToRow(payable, clientId)
  const { error } = await supabase.from("payables").upsert(row)
  if (error) throw error
}

export async function deletePayable(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("payables").delete().eq("id", id)
  if (error) throw error
}

export async function deletePayableByMatch(
  supabase: SupabaseClient,
  clientId: string,
  description: string,
  amount: number,
  date: string,
): Promise<void> {
  const { error } = await supabase
    .from("payables")
    .delete()
    .eq("client_id", clientId)
    .eq("description", description)
    .eq("amount", amount)
    .eq("date", date)
  if (error) throw error
}

export async function updateNextierMirror(
  supabase: SupabaseClient,
  oldDescription: string,
  oldAmount: number,
  oldDate: string,
  updated: { description: string; amount: number; date: string; notes: string; attachments: Attachment[] },
): Promise<void> {
  const { error } = await supabase
    .from("payables")
    .update({
      description: updated.description,
      amount: updated.amount,
      date: updated.date,
      notes: updated.notes,
      attachments: updated.attachments,
    })
    .eq("client_id", "nextier")
    .eq("description", oldDescription)
    .eq("amount", oldAmount)
    .eq("date", oldDate)
  if (error) throw error
}

// ── Attachment Storage ──────────────────────────────────────────────

export async function uploadAttachment(
  supabase: SupabaseClient,
  file: File,
  clientId: string,
  entryId: string,
): Promise<Attachment> {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${clientId}/${entryId}/${timestamp}-${safeName}`

  const { error } = await supabase.storage.from("receipts").upload(path, file)
  if (error) throw error

  return {
    name: file.name,
    path,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }
}

export function getAttachmentUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from("receipts").getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAttachment(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from("receipts").remove([path])
  if (error) throw error
}

export async function deleteAllAttachments(supabase: SupabaseClient, attachments: Attachment[]): Promise<void> {
  if (attachments.length === 0) return
  const paths = attachments.map((a) => a.path)
  const { error } = await supabase.storage.from("receipts").remove(paths)
  if (error) throw error
}

// ── Invoices CRUD ───────────────────────────────────────────────────

export interface InvoiceRow {
  id: string
  client_id: string
  invoice_number: string
  period_start: string | null
  period_end: string | null
  total_time: number
  total_subscriptions: number
  total_payables: number
  grand_total: number
  notes: string
  created_at: string
}

export function rowToInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    clientId: row.client_id,
    invoiceNumber: row.invoice_number,
    periodStart: row.period_start ?? "",
    periodEnd: row.period_end ?? "",
    totalTime: Number(row.total_time),
    totalSubscriptions: Number(row.total_subscriptions),
    totalPayables: Number(row.total_payables),
    grandTotal: Number(row.grand_total),
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export async function fetchInvoices(supabase: SupabaseClient, clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as InvoiceRow[]).map(rowToInvoice)
}

export async function fetchInvoice(supabase: SupabaseClient, invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return rowToInvoice(data as InvoiceRow)
}

export async function fetchAllInvoices(supabase: SupabaseClient): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as InvoiceRow[]).map(rowToInvoice)
}

export async function fetchTimeEntriesByInvoice(supabase: SupabaseClient, invoiceId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("date", { ascending: true })

  if (error) throw error
  return (data as TimeEntryRow[]).map(rowToTimeEntry)
}

export async function fetchSubscriptionsByInvoice(supabase: SupabaseClient, invoiceId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("name", { ascending: true })

  if (error) throw error
  return (data as SubscriptionRow[]).map(rowToSubscription)
}

export async function fetchPayablesByInvoice(supabase: SupabaseClient, invoiceId: string): Promise<Payable[]> {
  const { data, error } = await supabase
    .from("payables")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("date", { ascending: false })

  if (error) throw error
  return (data as PayableRow[]).map(rowToPayable)
}

export async function createInvoice(
  supabase: SupabaseClient,
  clientId: string,
  options: { copySubscriptionsForward?: boolean; notes?: string; hourlyRateOverride?: number; flatRateOverride?: number; rateTbd?: boolean } = {},
): Promise<Invoice> {
  const { copySubscriptionsForward = false, notes = "", hourlyRateOverride, flatRateOverride, rateTbd = false } = options

  // 1. Fetch current-period data + client info
  const [entries, subs, payables, clients] = await Promise.all([
    fetchTimeEntries(supabase, clientId),
    fetchSubscriptions(supabase, clientId),
    fetchPayables(supabase, clientId),
    fetchClients(supabase),
  ])

  const client = clients.find((c) => c.id === clientId)
  const hourlyRate = hourlyRateOverride !== undefined ? hourlyRateOverride : (client?.hourlyRate ?? null)
  const flatRate = flatRateOverride !== undefined ? flatRateOverride : (client?.flatRate ?? null)

  // 2. Compute snapshot totals
  const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0)
  const timeCost = rateTbd ? 0 : (flatRate != null ? flatRate : hourlyRate != null ? totalHours * hourlyRate : 0)

  const monthlySubTotal = subs.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount
    return sum + s.amount / 12
  }, 0)
  const subscriptionAnnual = monthlySubTotal * 12

  const payablesTotal = payables.reduce((sum, p) => sum + p.amount, 0)

  const isNextier = clientId === "nextier"
  const grandTotal = isNextier ? payablesTotal : timeCost + subscriptionAnnual - payablesTotal

  // 3. Derive period dates from client billing fields, falling back to entry dates / today
  const dates = entries.map((e) => e.date).filter(Boolean).sort()
  const periodStart = client?.billingPeriodStart || dates[0] || new Date().toISOString().slice(0, 10)
  const periodEnd = client?.billingPeriodEnd || new Date().toISOString().slice(0, 10)

  // 4. Generate invoice number
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
  const num = ((count ?? 0) + 1).toString().padStart(3, "0")
  const invoiceNumber = `INV-${clientId}-${num}`

  // 5. Insert invoice row
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      client_id: clientId,
      invoice_number: invoiceNumber,
      period_start: periodStart,
      period_end: periodEnd,
      total_time: Math.round(timeCost * 100) / 100,
      total_subscriptions: Math.round(subscriptionAnnual * 100) / 100,
      total_payables: Math.round(payablesTotal * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      notes,
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError
  const invoice = rowToInvoice(invoiceData as InvoiceRow)

  // 6. Stamp all current-period rows with the new invoice_id
  const entryIds = entries.map((e) => e.id)
  const subIds = subs.map((s) => s.id)
  const payableIds = payables.map((p) => p.id)

  if (entryIds.length > 0) {
    const { error } = await supabase
      .from("time_entries")
      .update({ invoice_id: invoice.id })
      .in("id", entryIds)
    if (error) throw error
  }

  if (subIds.length > 0) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ invoice_id: invoice.id })
      .in("id", subIds)
    if (error) throw error
  }

  if (payableIds.length > 0) {
    const { error } = await supabase
      .from("payables")
      .update({ invoice_id: invoice.id })
      .in("id", payableIds)
    if (error) throw error

  }

  // 8. Optionally copy subscriptions forward as new current-period entries
  if (copySubscriptionsForward && subs.length > 0) {
    const newSubRows = subs.map((s) => ({
      client_id: clientId,
      name: s.name,
      category: s.category,
      billing_cycle: s.billingCycle,
      amount: s.amount,
      renewal_date: s.renewalDate || null,
      notes: s.notes,
      attachments: s.attachments ?? [],
    }))
    const { error } = await supabase.from("subscriptions").insert(newSubRows)
    if (error) throw error
  }

  // 9. Clear billing period dates on client after invoice creation
  if (client?.billingPeriodStart || client?.billingPeriodEnd) {
    const { error: clearError } = await supabase
      .from("clients")
      .update({ billing_period_start: null, billing_period_end: null })
      .eq("id", clientId)
    if (clearError) throw clearError
  }

  return invoice
}
