"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function DashboardFooter({ children }: { children?: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="relative border-t border-border bg-card py-4 text-center text-xs text-muted-foreground print:hidden">
      Melkonian Industries LLC
      <br />
      Email <a href="mailto:davemelk@gmail.com" className="underline hover:text-foreground">davemelk@gmail.com</a> with any concerns.
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
      {children}
    </footer>
  )
}
