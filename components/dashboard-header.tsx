"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Moon, Sun, BarChart3, Home, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function DashboardHeader({ clientName = "Cygnet Institute" }: { clientName?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { signOut, isAdmin } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isReports = pathname === "/reports"

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {clientName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Project Dashboard
            </p>
          </div>
          {isAdmin && (
            <nav className="flex items-center gap-1 ml-2">
              {isReports ? (
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Reports</span>
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
