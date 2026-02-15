import { describe, it, expect } from "vitest"
import {
  rowToClient,
  rowToTimeEntry,
  timeEntryToRow,
  rowToSubscription,
  subscriptionToRow,
  rowToPayable,
  payableToRow,
  type ClientRow,
  type TimeEntryRow,
  type SubscriptionRow,
  type PayableRow,
} from "@/lib/supabase"

describe("rowToClient", () => {
  it("maps snake_case to camelCase", () => {
    const row: ClientRow = { id: "c1", name: "Acme", hourly_rate: 50, flat_rate: null, billing_period_start: null, billing_period_end: null, created_at: "2025-01-01" }
    const result = rowToClient(row)
    expect(result).toEqual({ id: "c1", name: "Acme", hourlyRate: 50, flatRate: null, billingPeriodStart: null, billingPeriodEnd: null })
  })

  it("coerces numeric string rates to numbers", () => {
    const row = { id: "c2", name: "Beta", hourly_rate: "75" as any, flat_rate: "100" as any, billing_period_start: null, billing_period_end: null, created_at: "2025-01-01" }
    const result = rowToClient(row)
    expect(result.hourlyRate).toBe(75)
    expect(result.flatRate).toBe(100)
  })

  it("keeps null rates as null", () => {
    const row: ClientRow = { id: "c3", name: "Gamma", hourly_rate: null, flat_rate: null, billing_period_start: null, billing_period_end: null, created_at: "2025-01-01" }
    const result = rowToClient(row)
    expect(result.hourlyRate).toBeNull()
    expect(result.flatRate).toBeNull()
  })
})

describe("rowToTimeEntry", () => {
  it("maps all fields correctly", () => {
    const row: TimeEntryRow = {
      id: "t1",
      client_id: "c1",
      date: "2025-02-06",
      start_time: "09:00",
      end_time: "17:00",
      time_range: "9:00 AM - 5:00 PM",
      total_hours: 8,
      tasks: "coding",
      notes: "good day",
      attachments: [{ name: "receipt.pdf", path: "p", size: 1024, uploadedAt: "2025-01-01" }],
    }
    const result = rowToTimeEntry(row)
    expect(result.startTime).toBe("09:00")
    expect(result.endTime).toBe("17:00")
    expect(result.totalHours).toBe(8)
    expect(result.attachments).toHaveLength(1)
  })

  it("coerces string total_hours to number", () => {
    const row: TimeEntryRow = {
      id: "t2", client_id: "c1", date: "2025-02-06", start_time: "09:00",
      end_time: "17:00", time_range: "", total_hours: "5.5" as any,
      tasks: "", notes: "", attachments: [],
    }
    expect(rowToTimeEntry(row).totalHours).toBe(5.5)
  })

  it("falls back to empty array when attachments is not an array", () => {
    const row: TimeEntryRow = {
      id: "t3", client_id: "c1", date: "2025-02-06", start_time: "09:00",
      end_time: "17:00", time_range: "", total_hours: 1,
      tasks: "", notes: "", attachments: null as any,
    }
    expect(rowToTimeEntry(row).attachments).toEqual([])
  })
})

describe("timeEntryToRow", () => {
  it("converts camelCase to snake_case with clientId injection", () => {
    const entry = {
      id: "t1", date: "2025-02-06", startTime: "09:00", endTime: "17:00",
      timeRange: "9:00 AM - 5:00 PM", totalHours: 8, tasks: "work", notes: "",
      attachments: [],
    }
    const row = timeEntryToRow(entry, "client-abc")
    expect(row.client_id).toBe("client-abc")
    expect(row.start_time).toBe("09:00")
    expect(row.end_time).toBe("17:00")
    expect(row.total_hours).toBe(8)
  })
})

describe("rowToSubscription", () => {
  it("maps billing_cycle to billingCycle", () => {
    const row: SubscriptionRow = {
      id: "s1", client_id: "c1", name: "Vercel", category: "Hosting",
      billing_cycle: "monthly", amount: 20, renewal_date: "2025-03-01",
      notes: "", attachments: [],
    }
    expect(rowToSubscription(row).billingCycle).toBe("monthly")
  })

  it("maps null renewalDate to empty string", () => {
    const row: SubscriptionRow = {
      id: "s2", client_id: "c1", name: "Tool", category: "Other",
      billing_cycle: "annual", amount: 100, renewal_date: null,
      notes: "", attachments: [],
    }
    expect(rowToSubscription(row).renewalDate).toBe("")
  })

  it("coerces amount to number", () => {
    const row = {
      id: "s3", client_id: "c1", name: "X", category: "Y",
      billing_cycle: "monthly" as const, amount: "49.99" as any,
      renewal_date: null, notes: "", attachments: [],
    }
    expect(rowToSubscription(row).amount).toBe(49.99)
  })
})

describe("subscriptionToRow", () => {
  it("converts empty renewalDate to null", () => {
    const sub = {
      id: "s1", name: "Tool", category: "Hosting", billingCycle: "monthly" as const,
      amount: 20, renewalDate: "", notes: "", attachments: [],
    }
    expect(subscriptionToRow(sub, "c1").renewal_date).toBeNull()
  })

  it("preserves non-empty renewalDate", () => {
    const sub = {
      id: "s2", name: "Tool", category: "Hosting", billingCycle: "monthly" as const,
      amount: 20, renewalDate: "2025-06-01", notes: "", attachments: [],
    }
    expect(subscriptionToRow(sub, "c1").renewal_date).toBe("2025-06-01")
  })
})

describe("rowToPayable", () => {
  it("maps paid_date null to empty string", () => {
    const row: PayableRow = {
      id: "p1", client_id: "c1", description: "Test", amount: 100,
      date: "2025-01-01", paid: false, paid_date: null, notes: "", attachments: [],
    }
    expect(rowToPayable(row).paidDate).toBe("")
  })

  it("coerces amount to number", () => {
    const row = {
      id: "p2", client_id: "c1", description: "Test", amount: "200.5" as any,
      date: "2025-01-01", paid: true, paid_date: "2025-01-15", notes: "",
      attachments: [],
    }
    expect(rowToPayable(row).amount).toBe(200.5)
  })

  it("falls back to empty array for non-array attachments", () => {
    const row = {
      id: "p3", client_id: "c1", description: "Test", amount: 50,
      date: "2025-01-01", paid: false, paid_date: null, notes: "",
      attachments: "invalid" as any,
    }
    expect(rowToPayable(row).attachments).toEqual([])
  })
})

describe("payableToRow", () => {
  it("converts empty paidDate to null and injects clientId", () => {
    const p = {
      id: "p1", description: "Work", amount: 100, date: "2025-01-01",
      paid: false, paidDate: "", notes: "", attachments: [],
    }
    const row = payableToRow(p, "my-client")
    expect(row.paid_date).toBeNull()
    expect(row.client_id).toBe("my-client")
  })

  it("preserves non-empty paidDate", () => {
    const p = {
      id: "p2", description: "Work", amount: 100, date: "2025-01-01",
      paid: true, paidDate: "2025-02-01", notes: "", attachments: [],
    }
    expect(payableToRow(p, "c1").paid_date).toBe("2025-02-01")
  })
})
