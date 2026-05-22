import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ensureAccessToken } from '../../services/authTokenRefresh'
import {
  AUTH_REQUIRED_EVENT,
  handleSessionExpired,
  peekAuthRedirect,
  saveAuthRedirect,
} from '../../services/authRedirect'
import { useAuthModalStore } from '../../store/authModalStore'
import { useAuthStore } from '../../store/authStore'

type AuthRouteState = {
  from?: string
  openAuth?: boolean
}

/** 앱 로드 시 refresh 시도, 비로그인 리다이렉트 시 로그인 모달 오픈 */
export function AuthSessionGate() {
  const location = useLocation()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuthModal = useAuthModalStore((s) => s.open)

  useEffect(() => {
    const hadRefresh = Boolean(useAuthStore.getState().refreshToken)
    void ensureAccessToken().then((ok) => {
      if (hadRefresh && !ok && !useAuthStore.getState().token?.trim()) {
        useAuthStore.getState().logout()
        handleSessionExpired()
      }
    })
  }, [location.pathname])

  useEffect(() => {
    if (isLoggedIn) return

    const routeState = location.state as AuthRouteState | null
    if (routeState?.from) {
      saveAuthRedirect(routeState.from)
    }

    const shouldOpen =
      routeState?.openAuth === true || Boolean(peekAuthRedirect()) || routeState?.from

    if (shouldOpen) {
      openAuthModal('login')
    }
  }, [isLoggedIn, location.pathname, location.state, openAuthModal])

  useEffect(() => {
    if (isLoggedIn) return

    const onAuthRequired = () => {
      openAuthModal('login')
    }

    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired)
  }, [isLoggedIn, openAuthModal])

  return null
}
