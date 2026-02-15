import { describe, it, expect } from "vitest"
import { calcHours, formatTime12 } from "@/components/time-tracking-section"

// ── calcHours ──────────────────────────────────────────────────────

describe("calcHours", () => {
  it("returns 8 for 09:00–17:00", () => {
    expect(calcHours("09:00", "17:00")).toBe(8)
  })

  it("returns 5.92 for 15:30–21:25", () => {
    expect(calcHours("15:30", "21:25")).toBe(5.92)
  })

  it("wraps cross-midnight when end is before start", () => {
    expect(calcHours("22:00", "02:00")).toBe(4)
  })

  it("returns 24 when times are equal (full day wrap)", () => {
    expect(calcHours("12:00", "12:00")).toBe(24)
  })

  it("returns 0 for empty strings", () => {
    expect(calcHours("", "")).toBe(0)
  })

  it("returns 0 when start is empty", () => {
    expect(calcHours("", "17:00")).toBe(0)
  })

  it("returns 0 when end is empty", () => {
    expect(calcHours("09:00", "")).toBe(0)
  })

  it("handles 15-minute increment (0.25)", () => {
    expect(calcHours("09:00", "09:15")).toBe(0.25)
  })

  it("handles 30-minute increment (0.5)", () => {
    expect(calcHours("09:00", "09:30")).toBe(0.5)
  })

  it("handles 45-minute increment (0.75)", () => {
    expect(calcHours("09:00", "09:45")).toBe(0.75)
  })

  it("handles full day", () => {
    expect(calcHours("06:00", "23:00")).toBe(17)
  })
})

// ── formatTime12 ───────────────────────────────────────────────────

describe("formatTime12", () => {
  it("converts afternoon time (15:30 → 3:30 PM)", () => {
    expect(formatTime12("15:30")).toBe("3:30 PM")
  })

  it("converts morning time (09:00 → 9:00 AM)", () => {
    expect(formatTime12("09:00")).toBe("9:00 AM")
  })

  it("converts noon (12:00 → 12:00 PM)", () => {
    expect(formatTime12("12:00")).toBe("12:00 PM")
  })

  it("converts midnight (00:00 → 12:00 AM)", () => {
    expect(formatTime12("00:00")).toBe("12:00 AM")
  })

  it("converts 13:45 → 1:45 PM", () => {
    expect(formatTime12("13:45")).toBe("1:45 PM")
  })

  it("converts 11:59 → 11:59 AM", () => {
    expect(formatTime12("11:59")).toBe("11:59 AM")
  })
})

// ── Grand total formula (extracted logic) ──────────────────────────
// Mirrors the logic from grand-total-section.tsx lines 62-68

function computeGrandTotal(opts: {
  timeCost: number | null
  subscriptionMonthly: number
  payablesPaid: number
  clientId: string
  hidePayables: boolean
}): number | null {
  const subscriptionAnnual = opts.subscriptionMonthly * 12
  const isNextier = opts.clientId === "nextier"
  const effectivePayables = opts.hidePayables ? 0 : opts.payablesPaid
  const subtotal = opts.timeCost != null ? opts.timeCost + subscriptionAnnual : null
  return isNextier
    ? effectivePayables
    : subtotal != null
      ? subtotal - effectivePayables
      : null
}

describe("grand total formula", () => {
  it("standard: time + annualSubs - payables", () => {
    const result = computeGrandTotal({
      timeCost: 1000, subscriptionMonthly: 50, payablesPaid: 200,
      clientId: "cygnet", hidePayables: false,
    })
    // 1000 + (50*12) - 200 = 1000 + 600 - 200 = 1400
    expect(result).toBe(1400)
  })

  it("nextier: returns payables total only", () => {
    const result = computeGrandTotal({
      timeCost: 500, subscriptionMonthly: 10, payablesPaid: 300,
      clientId: "nextier", hidePayables: false,
    })
    expect(result).toBe(300)
  })

  it("hidePayables=true excludes payables from total", () => {
    const result = computeGrandTotal({
      timeCost: 1000, subscriptionMonthly: 50, payablesPaid: 200,
      clientId: "cygnet", hidePayables: true,
    })
    // 1000 + 600 - 0 = 1600
    expect(result).toBe(1600)
  })

  it("timeCost=null for non-nextier returns null", () => {
    const result = computeGrandTotal({
      timeCost: null, subscriptionMonthly: 50, payablesPaid: 200,
      clientId: "cygnet", hidePayables: false,
    })
    expect(result).toBeNull()
  })

  it("zero subs and zero payables returns just timeCost", () => {
    const result = computeGrandTotal({
      timeCost: 500, subscriptionMonthly: 0, payablesPaid: 0,
      clientId: "cygnet", hidePayables: false,
    })
    expect(result).toBe(500)
  })
})

// ── timeCost calculation (from grand-total-section.tsx:39) ─────────

function computeTimeCost(opts: {
  totalHours: number
  flatRate: number | null
  hourlyRate: number | null
}): number | null {
  return opts.flatRate != null
    ? opts.flatRate
    : opts.hourlyRate != null
      ? opts.totalHours * opts.hourlyRate
      : null
}

describe("timeCost calculation", () => {
  it("uses flatRate when set (ignores hours)", () => {
    expect(computeTimeCost({ totalHours: 100, flatRate: 500, hourlyRate: 50 })).toBe(500)
  })

  it("uses hours * hourlyRate when no flatRate", () => {
    expect(computeTimeCost({ totalHours: 10, flatRate: null, hourlyRate: 50 })).toBe(500)
  })

  it("returns null when neither rate is set", () => {
    expect(computeTimeCost({ totalHours: 10, flatRate: null, hourlyRate: null })).toBeNull()
  })

  it("returns 0 for zero hours with hourly rate", () => {
    expect(computeTimeCost({ totalHours: 0, flatRate: null, hourlyRate: 50 })).toBe(0)
  })

  it("returns flatRate even when totalHours is 0", () => {
    expect(computeTimeCost({ totalHours: 0, flatRate: 1000, hourlyRate: null })).toBe(1000)
  })
})

// ── 10% auto-calc (from payables-section.tsx:104-110) ──────────────

function computeTenPercent(opts: {
  totalHours: number
  flatRate: number | null
  hourlyRate: number | null
}): number {
  const timeCost = opts.flatRate != null
    ? opts.flatRate
    : opts.hourlyRate != null
      ? opts.totalHours * opts.hourlyRate
      : 0
  return Math.round(timeCost * 0.1 * 100) / 100
}

describe("10% auto-calc", () => {
  it("10% of hourly cost", () => {
    expect(computeTenPercent({ totalHours: 10, flatRate: null, hourlyRate: 50 })).toBe(50)
  })

  it("10% of flat rate", () => {
    expect(computeTenPercent({ totalHours: 0, flatRate: 1000, hourlyRate: null })).toBe(100)
  })

  it("0 when no rate", () => {
    expect(computeTenPercent({ totalHours: 10, flatRate: null, hourlyRate: null })).toBe(0)
  })

  it("rounds to 2 decimals", () => {
    // 10% of (3 * 33) = 10% of 99 = 9.9
    expect(computeTenPercent({ totalHours: 3, flatRate: null, hourlyRate: 33 })).toBe(9.9)
  })

  it("handles fractional rounding", () => {
    // 10% of (7 * 62) = 10% of 434 = 43.4
    expect(computeTenPercent({ totalHours: 7, flatRate: null, hourlyRate: 62 })).toBe(43.4)
  })
})

// ── Subscription monthly/annual normalization ──────────────────────

function computeSubscriptionMonthly(
  subs: { billingCycle: "monthly" | "annual"; amount: number }[],
): number {
  return subs.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount
    return sum + s.amount / 12
  }, 0)
}

describe("subscription monthly normalization", () => {
  it("sums monthly amounts directly", () => {
    const subs = [
      { billingCycle: "monthly" as const, amount: 20 },
      { billingCycle: "monthly" as const, amount: 15 },
    ]
    expect(computeSubscriptionMonthly(subs)).toBe(35)
  })

  it("divides annual amounts by 12", () => {
    const subs = [{ billingCycle: "annual" as const, amount: 120 }]
    expect(computeSubscriptionMonthly(subs)).toBe(10)
  })

  it("handles mixed billing cycles", () => {
    const subs = [
      { billingCycle: "monthly" as const, amount: 20 },
      { billingCycle: "annual" as const, amount: 120 },
    ]
    // 20 + 120/12 = 20 + 10 = 30
    expect(computeSubscriptionMonthly(subs)).toBe(30)
  })

  it("returns 0 for empty array", () => {
    expect(computeSubscriptionMonthly([])).toBe(0)
  })

  it("handles zero amounts", () => {
    const subs = [{ billingCycle: "monthly" as const, amount: 0 }]
    expect(computeSubscriptionMonthly(subs)).toBe(0)
  })
})
