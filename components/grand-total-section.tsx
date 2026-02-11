"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTimeEntries, fetchSubscriptions } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { getHourlyRate } from "@/lib/project-data"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n)
}

export function GrandTotalSection({ clientId = "cygnet" }: { clientId?: string }) {
  const { supabase } = useAuth()
  const HOURLY_RATE = getHourlyRate(clientId)
  const [timeCost, setTimeCost] = useState<number | null>(0)
  const [subscriptionMonthly, setSubscriptionMonthly] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)

    async function load() {
      try {
        const [entries, subs] = await Promise.all([
          fetchTimeEntries(supabase, clientId),
          fetchSubscriptions(supabase, clientId),
        ])
        if (cancelled) return

        const totalHours = entries.reduce((sum, e) => sum + e.totalHours, 0)
        setTimeCost(HOURLY_RATE != null ? totalHours * HOURLY_RATE : null)

        const monthly = subs.reduce((sum, s) => {
          if (s.billingCycle === "monthly") return sum + s.amount
          return sum + s.amount / 12
        }, 0)
        setSubscriptionMonthly(monthly)
      } catch {
        // Sections already show their own errors
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [clientId, supabase])

  if (!loaded) return null

  const subscriptionAnnual = subscriptionMonthly * 12
  const grandTotal = timeCost != null ? timeCost + subscriptionAnnual : null

  return (
    <Card className="ml-auto sm:max-w-[50%]">
      <CardHeader>
        <CardTitle>Grand Total</CardTitle>
      </CardHeader>
      <CardContent>
          <div className="flex justify-end">
            <div className="flex flex-col items-end">
              <div className="flex flex-col gap-0.5 items-end text-muted-foreground">
                <div className="flex items-baseline gap-2">
                  <span>Time Tracking</span>
                  <span className="font-mono">{timeCost != null ? formatCurrency(timeCost) : "TBD"}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span>Subscriptions</span>
                  <span className="font-mono">{formatCurrency(subscriptionAnnual)}</span>
                </div>
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
