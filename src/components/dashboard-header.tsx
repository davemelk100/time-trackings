import { useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Archive, BarChart3, Home, LogOut, Printer } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { handlePrint } from "@/lib/print"

export function DashboardHeader({ clientName = "Cygnet Institute" }: { clientName?: string }) {
  const { pathname } = useLocation()
  const { signOut, isAdmin, isDemo, clientId } = useAuth()

  const isReports = pathname === "/reports"
  const isArchives = pathname === "/archives"

  const title = (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {clientName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Project Dashboard
      </p>
    </div>
  )

  return (
    <header className="border-b border-border bg-card print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <Link to="/" className="hover:opacity-80 transition-opacity">
              {title}
            </Link>
          ) : (
            title
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <nav className="flex items-center gap-1">
              {isReports ? (
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/reports">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Reports</span>
                  </Button>
                </Link>
              )}
              {!isArchives && (
                <Link to="/archives">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Archive className="h-4 w-4" />
                    <span className="hidden sm:inline">Archives</span>
                  </Button>
                </Link>
              )}
            </nav>
          )}
          {isDemo && (
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
              Demo Mode
            </span>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {isDemo ? "Demo" : isAdmin ? "Admin" : clientName}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
            aria-label="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
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
