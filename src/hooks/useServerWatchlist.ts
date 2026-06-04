import { useCallback, useEffect, useRef, useState } from 'react'
import { isMockDataSource } from '../config/dataSource'
import { addWatchlistItem, fetchWatchlist, removeWatchlistItem } from '../data/clients/watchlistClient'
import type { WatchlistItem } from '../data/types/watchlist'
import { useAuthStore } from '../store/authStore'
import { useAuthModalStore } from '../store/authModalStore'

const LEGACY_WATCHLIST_KEY = 'marketlens_watchlist'

export function useServerWatchlist() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuthModal = useAuthModalStore((s) => s.open)
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const itemsRef = useRef(items)
  const pendingCodeRef = useRef<string | null>(null)

  useEffect(() => {
    localStorage.removeItem(LEGACY_WATCHLIST_KEY)
  }, [])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    pendingCodeRef.current = pendingCode
  }, [pendingCode])

  const reload = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([])
      return
    }
    const nextItems = await fetchWatchlist()
    setItems(nextItems)
  }, [isLoggedIn])

  useEffect(() => {
    void reload().catch(() => {
      setItems([])
    })
  }, [reload])

  const has = useCallback((code: string) => items.some((item) => item.code === code), [items])

  const remove = useCallback(
    async (code: string) => {
      if (!isLoggedIn) {
        openAuthModal('login')
        return
      }
      if (pendingCodeRef.current) return

      pendingCodeRef.current = code
      setPendingCode(code)
      try {
        if (isMockDataSource()) {
          setItems((prev) => prev.filter((item) => item.code !== code))
          return
        }
        await removeWatchlistItem(code)
        setItems((prev) => prev.filter((item) => item.code !== code))
      } catch {
        /* 상태 유지 */
      } finally {
        pendingCodeRef.current = null
        setPendingCode(null)
      }
    },
    [isLoggedIn, openAuthModal],
  )

  const toggle = useCallback(
    async (item: WatchlistItem) => {
      if (!isLoggedIn) {
        openAuthModal('login')
        return 'auth' as const
      }
      if (pendingCodeRef.current) return 'pending' as const

      const wasInterested = itemsRef.current.some((v) => v.code === item.code)
      pendingCodeRef.current = item.code
      setPendingCode(item.code)
      try {
        if (isMockDataSource()) {
          setItems((prev) =>
            wasInterested ? prev.filter((v) => v.code !== item.code) : [...prev, item],
          )
          return wasInterested ? ('removed' as const) : ('added' as const)
        }

        if (wasInterested) {
          await removeWatchlistItem(item.code)
          setItems((prev) => prev.filter((v) => v.code !== item.code))
          return 'removed' as const
        }

        await addWatchlistItem(item.code)
        setItems((prev) => [...prev, item])
        return 'added' as const
      } catch {
        /* 상태 유지 */
        return 'error' as const
      } finally {
        pendingCodeRef.current = null
        setPendingCode(null)
      }
    },
    [isLoggedIn, openAuthModal],
  )

  return { items, has, toggle, remove, pendingCode, isLoggedIn, reload }
}
