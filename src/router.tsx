import { Routes, Route, Navigate } from "react-router-dom"
import { RouteGuard } from "@/components/route-guard"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import ClientPage from "@/pages/client"
import ReportsPage from "@/pages/reports"
import ArchivesPage from "@/pages/archives"

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RouteGuard adminOnly>
            <DashboardPage />
          </RouteGuard>
        }
      />
      <Route
        path="/client/:clientId"
        element={
          <RouteGuard>
            <ClientPage />
          </RouteGuard>
        }
      />
      <Route
        path="/reports"
        element={
          <RouteGuard adminOnly>
            <ReportsPage />
          </RouteGuard>
        }
      />
      <Route
        path="/archives"
        element={
          <RouteGuard adminOnly>
            <ArchivesPage />
          </RouteGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
