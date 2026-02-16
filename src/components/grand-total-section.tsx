
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTimeEntries, fetchSubscriptions, fetchPayables } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

export function GrandTotalSection({ clientId = "cygnet", hourlyRate = null, flatRate = null, refreshKey = 0, hidePayables = false }: { clientId?: string; hourlyRate?: number | null; flatRate?: number | null; refreshKey?: number; hidePayables?: boolean }) {
  const { supabase } = useAuth()
  const HOURLY_RATE = hourlyRate
  const FLAT_RATE = flatRate
  const [timeCost, setTimeCost] = useState<number | null>(0)
  const [subscriptionMonthly, setSubscriptionMonthly] = useState(0)
  const [payablesPaid, setPayablesPaid] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)

    async function load() {
      try {
        const [entries, subs, payables] = await Promise.all([
          fetchTimeEntries(supabase, clientId),
          fetchSubscriptions(supabase, clientId),
          fetchPayables(supabase, clientId),
        ])
        if (cancelled) return

        const noData = entries.length === 0 && subs.length === 0 && payables.length === 0

        const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0)
        setTimeCost(noData ? null : HOURLY_RATE != null ? totalHours * HOURLY_RATE : null)

        const monthly = subs.reduce((sum, s) => {
          if (s.billingCycle === "monthly") return sum + s.amount
          return sum + s.amount / 12
        }, 0)
        setSubscriptionMonthly(monthly)

        const payablesTotal = payables.reduce((sum, p) => sum + p.amount, 0)
        setPayablesPaid(payablesTotal)
      } catch {
        // Sections already show their own errors
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [clientId, supabase, refreshKey])

  if (!loaded) return null

  const hasData = timeCost !== null || subscriptionMonthly > 0 || payablesPaid > 0
  if (!hasData) return null

  const subscriptionAnnual = subscriptionMonthly * 12
  const isNextier = clientId === "nextier"
  const effectivePayables = hidePayables ? 0 : payablesPaid
  const subtotal = timeCost != null ? timeCost + subscriptionAnnual : null
  const grandTotal = isNextier
    ? effectivePayables
    : subtotal != null ? subtotal - effectivePayables : null

  return (
    <Card className="ml-auto sm:max-w-[50%]">
      <CardHeader>
        <CardTitle>Grand Total</CardTitle>
      </CardHeader>
      <CardContent>
          <div className="flex justify-end">
            <div className="flex flex-col items-end">
              <div className="flex flex-col gap-0.5 items-end text-muted-foreground">
                {(timeCost == null || timeCost > 0) && (
                  <div className="flex items-baseline gap-2">
                    <span>Time Tracking</span>
                    <span className="font-mono">{timeCost != null ? formatCurrency(timeCost) : "TBD"}</span>
                  </div>
                )}
                {subscriptionAnnual > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span>Subscriptions</span>
                    <span className="font-mono">{formatCurrency(subscriptionAnnual)}</span>
                  </div>
                )}
                {!hidePayables && payablesPaid > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span>{clientId === "nextier" ? "Proceeds" : "Payables"}</span>
                    <span className="font-mono">{clientId === "nextier" ? "" : "\u2212"}{formatCurrency(payablesPaid)}</span>
                  </div>
                )}
              </div>
              <div className="mt-1 border-t border-border pt-1 w-full text-right">
                <span className="font-mono font-bold text-primary">{grandTotal != null ? formatCurrency(grandTotal) : "TBD"}</span>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
