import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabase } from "../helpers/mock-supabase"
import {
  fetchClients,
  fetchTimeEntries,
  upsertPayable,
  deletePayableByMatch,
  updateNextierMirror,
  uploadAttachment,
} from "@/lib/supabase"

describe("fetchClients", () => {
  it("queries clients table, orders by name, and maps rows", async () => {
    const { client, chain } = createMockSupabase()
    chain._setResult([
      { id: "c1", name: "Acme", hourly_rate: 50, flat_rate: null, created_at: "2025-01-01" },
      { id: "c2", name: "Beta", hourly_rate: null, flat_rate: 200, created_at: "2025-01-01" },
    ])

    const result = await fetchClients(client)
    expect(client.from).toHaveBeenCalledWith("clients")
    expect(chain.select).toHaveBeenCalledWith("*")
    expect(chain.order).toHaveBeenCalledWith("name", { ascending: true })
    expect(result).toEqual([
      { id: "c1", name: "Acme", hourlyRate: 50, flatRate: null },
      { id: "c2", name: "Beta", hourlyRate: null, flatRate: 200 },
    ])
  })

  it("throws on Supabase error", async () => {
    const { client, chain } = createMockSupabase()
    const err = { message: "connection failed", code: "500" }
    chain._setResult(null, err)

    await expect(fetchClients(client)).rejects.toEqual(err)
  })
})

describe("fetchTimeEntries", () => {
  it("filters by client_id and orders by date", async () => {
    const { client, chain } = createMockSupabase()
    chain._setResult([
      {
        id: "t1", client_id: "cygnet", date: "2025-02-06",
        start_time: "09:00", end_time: "17:00", time_range: "9:00 AM - 5:00 PM",
        total_hours: 8, tasks: "coding", notes: "", attachments: [],
      },
    ])

    const result = await fetchTimeEntries(client, "cygnet")
    expect(client.from).toHaveBeenCalledWith("time_entries")
    expect(chain.eq).toHaveBeenCalledWith("client_id", "cygnet")
    expect(chain.order).toHaveBeenCalledWith("date", { ascending: true })
    expect(result).toHaveLength(1)
    expect(result[0].startTime).toBe("09:00")
  })
})

describe("upsertPayable", () => {
  it("converts domain object and calls upsert with snake_case row", async () => {
    const { client, chain } = createMockSupabase()
    chain._setResult(null, null)

    const payable = {
      id: "p1", description: "10% of time", amount: 50, date: "2025-02-01",
      paid: false, paidDate: "", notes: "auto", attachments: [],
    }

    await upsertPayable(client, payable, "cygnet")
    expect(client.from).toHaveBeenCalledWith("payables")
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "p1",
        client_id: "cygnet",
        paid_date: null,
        description: "10% of time",
      }),
    )
  })
})

describe("deletePayableByMatch", () => {
  it("chains 4 .eq() calls with correct args", async () => {
    const { client, chain } = createMockSupabase()
    chain._setResult(null, null)

    await deletePayableByMatch(client, "nextier", "10% of time", 50, "2025-02-01")
    expect(client.from).toHaveBeenCalledWith("payables")
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith("client_id", "nextier")
    expect(chain.eq).toHaveBeenCalledWith("description", "10% of time")
    expect(chain.eq).toHaveBeenCalledWith("amount", 50)
    expect(chain.eq).toHaveBeenCalledWith("date", "2025-02-01")
  })
})

describe("updateNextierMirror", () => {
  it("calls update with new values and filters by old values + client_id=nextier", async () => {
    const { client, chain } = createMockSupabase()
    chain._setResult(null, null)

    await updateNextierMirror(client, "old desc", 100, "2025-01-01", {
      description: "new desc",
      amount: 200,
      date: "2025-02-01",
      notes: "updated",
      attachments: [],
    })

    expect(client.from).toHaveBeenCalledWith("payables")
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "new desc",
        amount: 200,
        date: "2025-02-01",
      }),
    )
    expect(chain.eq).toHaveBeenCalledWith("client_id", "nextier")
    expect(chain.eq).toHaveBeenCalledWith("description", "old desc")
    expect(chain.eq).toHaveBeenCalledWith("amount", 100)
    expect(chain.eq).toHaveBeenCalledWith("date", "2025-01-01")
  })
})

describe("uploadAttachment", () => {
  it("uploads to receipts bucket and returns Attachment with correct path structure", async () => {
    const { client, storageBucket } = createMockSupabase()

    const file = new File(["data"], "receipt.pdf", { type: "application/pdf" })
    const result = await uploadAttachment(client, file, "cygnet", "entry-123")

    expect(client.storage.from).toHaveBeenCalledWith("receipts")
    expect(storageBucket.upload).toHaveBeenCalledWith(
      expect.stringContaining("cygnet/entry-123/"),
      file,
    )
    expect(result.name).toBe("receipt.pdf")
    expect(result.path).toContain("cygnet/entry-123/")
    expect(result.path).toContain("receipt.pdf")
    expect(result.size).toBe(file.size)
    expect(result.uploadedAt).toBeTruthy()
  })
})
