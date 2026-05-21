import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export interface PrivateRouteProps {
  requiredRole?: 'ADMIN'
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const location = useLocation()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const role = useAuthStore((s) => s.role)

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
