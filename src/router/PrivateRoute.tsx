import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export interface PrivateRouteProps {
  requiredRole?: 'ADMIN'
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const role = useAuthStore((s) => s.role)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
