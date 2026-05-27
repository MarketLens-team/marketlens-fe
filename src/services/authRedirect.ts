import { AUTH_REDIRECT_KEY } from '../constants/storage'

export const AUTH_REQUIRED_EVENT = 'marketlens:auth-required'

const PRIVATE_PATH_PREFIXES = ['/watchlist', '/mypage', '/admin'] as const

export function pathRequiresAuth(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function isRedirectablePath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  const pathname = path.split('?')[0]
  if (pathname === '/login' || pathname === '/onboarding') return false
  return true
}

export function saveAuthRedirect(path: string) {
  if (!isRedirectablePath(path)) return
  sessionStorage.setItem(AUTH_REDIRECT_KEY, path)
}

export function peekAuthRedirect(): string | null {
  const path = sessionStorage.getItem(AUTH_REDIRECT_KEY)
  if (!path || !isRedirectablePath(path)) return null
  return path
}

export function consumeAuthRedirect(): string | null {
  const path = peekAuthRedirect()
  if (!path) return null
  sessionStorage.removeItem(AUTH_REDIRECT_KEY)
  return path
}

export function clearAuthRedirect() {
  sessionStorage.removeItem(AUTH_REDIRECT_KEY)
}

/** 세션 만료·재발급 실패 시: 돌아갈 경로 저장 후 홈으로 이동(또는 로그인 모달 트리거) */
export function handleSessionExpired() {
  const returnPath = `${window.location.pathname}${window.location.search}`
  if (pathRequiresAuth(window.location.pathname)) {
    saveAuthRedirect(returnPath)
  }

  if (window.location.pathname === '/' && !window.location.search) {
    window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT))
    return
  }

  window.location.assign('/')
}
