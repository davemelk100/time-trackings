import { Navigate, useParams } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function RouteGuard({ children, adminOnly }: RouteGuardProps) {
  const { isAdmin, clientId } = useAuth()
  const { clientId: urlClientId } = useParams()

  // No session → login
  if (!isAdmin && !clientId) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={clientId ? `/client/${clientId}` : "/login"} replace />
  }

  if (urlClientId && !isAdmin && urlClientId !== clientId) {
    return <Navigate to={clientId ? `/client/${clientId}` : "/login"} replace />
  }

  return <>{children}</>
}
