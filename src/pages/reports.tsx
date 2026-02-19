
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFooter } from "@/components/dashboard-footer"
import { ReportsSection } from "@/components/reports-section"
import { useAuth } from "@/lib/auth-context"

export default function ReportsPage() {
  const { isDemo } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader clientName="Reports" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-8">
        <ReportsSection isDemo={isDemo} />
      </main>
      <DashboardFooter />
    </div>
  )
}
