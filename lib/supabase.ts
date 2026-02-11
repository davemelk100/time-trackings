import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import type { TimeEntry, Subscription, Attachment, Client } from "./project-data"

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ── Clients CRUD ────────────────────────────────────────────────────

interface ClientRow {
  id: string
  name: string
  hourly_rate: number | null
  created_at: string
}

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
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
  client: { id: string; name: string; hourlyRate: number | null },
): Promise<void> {
  const { error } = await supabase.from("clients").insert({
    id: client.id,
    name: client.name,
    hourly_rate: client.hourlyRate,
  })
  if (error) throw error
}

export async function deleteClient(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw error
}

// ── snake_case ↔ camelCase mappers ──────────────────────────────────

interface TimeEntryRow {
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

interface SubscriptionRow {
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

function rowToTimeEntry(row: TimeEntryRow): TimeEntry {
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

function timeEntryToRow(entry: TimeEntry, clientId: string): Omit<TimeEntryRow, "id"> & { id?: string } {
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

function rowToSubscription(row: SubscriptionRow): Subscription {
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

function subscriptionToRow(sub: Subscription, clientId: string): Omit<SubscriptionRow, "id"> & { id?: string } {
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

// ── Time Entries CRUD ───────────────────────────────────────────────

export async function fetchTimeEntries(supabase: SupabaseClient, clientId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("client_id", clientId)
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

// ── Attachment Storage ──────────────────────────────────────────────

export async function uploadAttachment(
  supabase: SupabaseClient,
  file: File,
  clientId: string,
  entryId: string,
): Promise<Attachment> {
  const timestamp = Date.now()
  const path = `${clientId}/${entryId}/${timestamp}-${file.name}`

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
