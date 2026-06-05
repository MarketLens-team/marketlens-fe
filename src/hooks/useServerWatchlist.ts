import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'

export function useServerWatchlist() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  // has()만 쓰는 컴포넌트도 items 변경 시 리렌더되도록 구독
  const items = useWatchlistStore((s) => s.items)
  const pendingCode = useWatchlistStore((s) => s.pendingCode)
  const has = useWatchlistStore((s) => s.has)
  const toggle = useWatchlistStore((s) => s.toggle)
  const remove = useWatchlistStore((s) => s.remove)
  const reload = useWatchlistStore((s) => s.reload)

  return { items, has, toggle, remove, pendingCode, isLoggedIn, reload }
}
