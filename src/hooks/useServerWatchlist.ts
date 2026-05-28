import { useCallback, useEffect, useState } from 'react'
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
        return
      }
      if (pendingCode) return

      setPendingCode(item.code)
      try {
        if (isMockDataSource()) {
          setCodes((prev) => {
            const next = new Set(prev)
            if (next.has(item.code)) next.delete(item.code)
            else next.add(item.code)
            return next
          })
          return
        }

        if (codes.has(item.code)) {
          await removeWatchlistItem(item.code)
          setCodes((prev) => {
            const next = new Set(prev)
            next.delete(item.code)
            return next
          })
        } else {
          await addWatchlistItem(item.code)
          setCodes((prev) => new Set(prev).add(item.code))
        }
      } catch {
        /* 상태 유지 */
      } finally {
        setPendingCode(null)
      }
    },
    [codes, isLoggedIn, openAuthModal, pendingCode],
  )

  return { has, toggle, pendingCode, isLoggedIn }
}
