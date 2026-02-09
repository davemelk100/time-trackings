import { createClient } from "@supabase/supabase-js"
import type { TimeEntry, Subscription, Attachment } from "./project-data"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// ── Time Entries CRUD ───────────────────────────────────────────────

export async function fetchTimeEntries(clientId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: true })

  if (error) throw error
  return (data as TimeEntryRow[]).map(rowToTimeEntry)
}

export async function upsertTimeEntry(entry: TimeEntry, clientId: string): Promise<void> {
  const row = timeEntryToRow(entry, clientId)
  const { error } = await supabase.from("time_entries").upsert(row)
  if (error) throw error
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase.from("time_entries").delete().eq("id", id)
  if (error) throw error
}

export async function seedTimeEntries(entries: TimeEntry[], clientId: string): Promise<void> {
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

export async function fetchSubscriptions(clientId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", clientId)
    .order("name", { ascending: true })

  if (error) throw error
  return (data as SubscriptionRow[]).map(rowToSubscription)
}

export async function upsertSubscription(sub: Subscription, clientId: string): Promise<void> {
  const row = subscriptionToRow(sub, clientId)
  const { error } = await supabase.from("subscriptions").upsert(row)
  if (error) throw error
}

export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id)
  if (error) throw error
}

export async function seedSubscriptions(subs: Subscription[], clientId: string): Promise<void> {
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

export function getAttachmentUrl(path: string): string {
  const { data } = supabase.storage.from("receipts").getPublicUrl(path)
  return data.publicUrl
}

export async function deleteAttachment(path: string): Promise<void> {
  const { error } = await supabase.storage.from("receipts").remove([path])
  if (error) throw error
}

export async function deleteAllAttachments(attachments: Attachment[]): Promise<void> {
  if (attachments.length === 0) return
  const paths = attachments.map((a) => a.path)
  const { error } = await supabase.storage.from("receipts").remove(paths)
  if (error) throw error
}
