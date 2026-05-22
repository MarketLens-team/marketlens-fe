import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ensureAccessToken } from '../services/authTokenRefresh'
import { useAuthStore } from '../store/authStore'

export interface PrivateRouteProps {
  requiredRole?: 'ADMIN'
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const location = useLocation()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const role = useAuthStore((s) => s.role)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    void ensureAccessToken().finally(() => {
      if (!cancelled) setSessionChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  if (!sessionChecked) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname + location.search,
          openAuth: true,
        }}
      />
    )
  }

  if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
