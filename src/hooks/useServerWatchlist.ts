import { useCallback, useEffect, useRef, useState } from 'react'
import { isMockDataSource } from '../config/dataSource'
import { addWatchlistItem, fetchWatchlist, removeWatchlistItem } from '../data/clients/watchlistClient'
import { useAuthStore } from '../store/authStore'
import { useAuthModalStore } from '../store/authModalStore'
import type { WatchlistItem } from '../store/watchlistStore'

export function useServerWatchlist() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuthModal = useAuthModalStore((s) => s.open)
  const [codes, setCodes] = useState<Set<string>>(() => new Set())
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const codesRef = useRef(codes)
  const pendingCodeRef = useRef<string | null>(null)

  useEffect(() => {
    codesRef.current = codes
  }, [codes])

  useEffect(() => {
    pendingCodeRef.current = pendingCode
  }, [pendingCode])

  const reload = useCallback(async () => {
    if (!isLoggedIn) {
      setCodes(new Set())
      return
    }
    const items = await fetchWatchlist()
    setCodes(new Set(items.map((item) => item.code)))
  }, [isLoggedIn])

  useEffect(() => {
    void reload().catch(() => {
      setCodes(new Set())
    })
  }, [reload])

  const has = useCallback((code: string) => codes.has(code), [codes])

  const toggle = useCallback(
    async (item: WatchlistItem) => {
      if (!isLoggedIn) {
        openAuthModal('login')
        return 'auth' as const
      }
      if (pendingCodeRef.current) return 'pending' as const

      const wasInterested = codesRef.current.has(item.code)
      pendingCodeRef.current = item.code
      setPendingCode(item.code)
      try {
        if (isMockDataSource()) {
          setCodes((prev) => {
            const next = new Set(prev)
            if (next.has(item.code)) next.delete(item.code)
            else next.add(item.code)
            return next
          })
          return wasInterested ? 'removed' as const : 'added' as const
        }

        if (wasInterested) {
          await removeWatchlistItem(item.code)
          setCodes((prev) => {
            const next = new Set(prev)
            next.delete(item.code)
            return next
          })
          return 'removed' as const
        } else {
          await addWatchlistItem(item.code)
          setCodes((prev) => new Set(prev).add(item.code))
          return 'added' as const
        }
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

  return { has, toggle, pendingCode, isLoggedIn }
}
