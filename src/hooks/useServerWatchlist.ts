import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { isMockDataSource } from '../config/dataSource'
import {
  addWatchlistItem,
  fetchWatchlistResponses,
  removeWatchlistItem,
  watchlistResponsesToItems,
} from '../data/clients/watchlistClient'
import type { WatchlistResponse } from '../data/types/memberApi'
import type { WatchlistItem } from '../data/types/watchlist'
import { memberListQueryOptions, WATCHLIST_STALE_MS } from '../lib/queryCache'
import { queryKeys } from '../lib/queryKeys'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore } from '../store/authStore'

function watchlistItemToResponse(item: WatchlistItem): WatchlistResponse {
  return {
    stockCode: item.code,
    stockName: item.name,
    sectorName: '',
    market: '',
    imageUrl: item.imageUrl ?? undefined,
  }
}

let pendingCode: string | null = null
const pendingListeners = new Set<() => void>()

function subscribePending(listener: () => void) {
  pendingListeners.add(listener)
  return () => pendingListeners.delete(listener)
}

function getPendingSnapshot() {
  return pendingCode
}

function setPendingCode(code: string | null) {
  if (pendingCode === code) return
  pendingCode = code
  pendingListeners.forEach((listener) => listener())
}

export function useServerWatchlist() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const queryClient = useQueryClient()
  const pending = useSyncExternalStore(subscribePending, getPendingSnapshot)

  const { data: responses = [] } = useQuery({
    queryKey: queryKeys.watchlist.rows,
    queryFn: fetchWatchlistResponses,
    enabled: isLoggedIn,
    staleTime: WATCHLIST_STALE_MS,
    ...memberListQueryOptions,
  })

  const items = useMemo(() => watchlistResponsesToItems(responses), [responses])

  const has = useCallback((code: string) => items.some((item) => item.code === code), [items])

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.rows })
  }, [queryClient])

  const remove = useCallback(
    async (code: string) => {
      if (!useAuthStore.getState().isLoggedIn) {
        useAuthModalStore.getState().open('login')
        return
      }
      if (pendingCode) return

      setPendingCode(code)
      const previous = queryClient.getQueryData<WatchlistResponse[]>(queryKeys.watchlist.rows)
      queryClient.setQueryData<WatchlistResponse[]>(
        queryKeys.watchlist.rows,
        (current = []) => current.filter((item) => item.stockCode !== code),
      )

      try {
        if (!isMockDataSource()) {
          await removeWatchlistItem(code)
        }
      } catch {
        if (previous) {
          queryClient.setQueryData(queryKeys.watchlist.rows, previous)
        }
      } finally {
        setPendingCode(null)
      }
    },
    [queryClient],
  )

  const toggle = useCallback(
    async (item: WatchlistItem): Promise<'auth' | 'pending' | 'added' | 'removed' | 'error'> => {
      if (!useAuthStore.getState().isLoggedIn) {
        useAuthModalStore.getState().open('login')
        return 'auth'
      }
      if (pendingCode) return 'pending'

      const wasInterested = items.some((v) => v.code === item.code)
      setPendingCode(item.code)
      const previous = queryClient.getQueryData<WatchlistResponse[]>(queryKeys.watchlist.rows)

      queryClient.setQueryData<WatchlistResponse[]>(queryKeys.watchlist.rows, (current = []) => {
        if (wasInterested) {
          return current.filter((v) => v.stockCode !== item.code)
        }
        return [...current, watchlistItemToResponse(item)]
      })

      try {
        if (isMockDataSource()) {
          return wasInterested ? 'removed' : 'added'
        }

        if (wasInterested) {
          await removeWatchlistItem(item.code)
          return 'removed'
        }

        await addWatchlistItem(item.code)
        return 'added'
      } catch {
        if (previous) {
          queryClient.setQueryData(queryKeys.watchlist.rows, previous)
        }
        return 'error'
      } finally {
        setPendingCode(null)
      }
    },
    [items, queryClient],
  )

  return { items, has, toggle, remove, pendingCode: pending, isLoggedIn, reload }
}
