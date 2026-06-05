import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { queryKeys } from './queryKeys'

const LEGACY_WATCHLIST_KEY = 'marketlens_watchlist'

export const WATCHLIST_STALE_MS = 5_000
export const BOOKMARK_IDS_STALE_MS = 5_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

localStorage.removeItem(LEGACY_WATCHLIST_KEY)

function syncAuthQueries(isLoggedIn: boolean) {
  if (!isLoggedIn) {
    queryClient.removeQueries({ queryKey: queryKeys.watchlist.all })
    queryClient.removeQueries({ queryKey: queryKeys.bookmarks.all })
  }
  // 로그인 시 invalidate는 useQuery enabled 전환과 겹쳐 ids·watchlist 2회 호출됨 — 캐시 제거만
}

useAuthStore.subscribe((state, prev) => {
  if (state.isLoggedIn !== prev.isLoggedIn) {
    syncAuthQueries(state.isLoggedIn)
  }
})
