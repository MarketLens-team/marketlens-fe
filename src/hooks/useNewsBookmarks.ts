import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addNewsBookmark,
  fetchNewsBookmarks,
  removeNewsBookmark,
} from '../data/clients/bookmarkClient'
import type { ApiEnvelope } from '../data/types/api'
import { getApiErrorMessage } from '../data/util/apiError'
import { useAuthModalStore } from '../store/authModalStore'
import { useAuthStore } from '../store/authStore'

function extractApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined
  const body = error.response?.data
  if (body && typeof body === 'object' && 'error' in body) {
    const apiError = (body as ApiEnvelope<unknown>).error
    return apiError?.code
  }
  return undefined
}

export function useNewsBookmarks() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openAuthModal = useAuthModalStore((s) => s.open)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
  const [loadError, setLoadError] = useState<string | null>(null)
  const bookmarkedIdsRef = useRef(bookmarkedIds)
  bookmarkedIdsRef.current = bookmarkedIds

  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkedIds(new Set())
      setPendingIds(new Set())
      setLoadError(null)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const rows = await fetchNewsBookmarks()
        if (cancelled) return
        setBookmarkedIds(new Set(rows.map((row) => String(row.newsArticleId))))
        setLoadError(null)
      } catch (error) {
        if (cancelled) return
        setLoadError(getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.'))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  const isBookmarked = useCallback(
    (newsId: string) => bookmarkedIds.has(newsId),
    [bookmarkedIds],
  )

  const isBookmarkPending = useCallback(
    (newsId: string) => pendingIds.has(newsId),
    [pendingIds],
  )

  const toggleBookmark = useCallback(
    async (newsId: string) => {
      if (!isLoggedIn) {
        openAuthModal('login')
        return
      }

      if (pendingIds.has(newsId)) return

      const wasBookmarked = bookmarkedIdsRef.current.has(newsId)

      setPendingIds((prev) => new Set(prev).add(newsId))
      setBookmarkedIds((prev) => {
        const next = new Set(prev)
        if (wasBookmarked) next.delete(newsId)
        else next.add(newsId)
        return next
      })

      try {
        if (wasBookmarked) {
          await removeNewsBookmark(newsId)
        } else {
          await addNewsBookmark(newsId)
        }
      } catch (error) {
        const code = extractApiErrorCode(error)
        if (code === 'B001' && !wasBookmarked) {
          setBookmarkedIds((prev) => new Set(prev).add(newsId))
          return
        }
        if (code === 'B002' && wasBookmarked) {
          setBookmarkedIds((prev) => {
            const next = new Set(prev)
            next.delete(newsId)
            return next
          })
          return
        }

        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          if (wasBookmarked) next.add(newsId)
          else next.delete(newsId)
          return next
        })
        setLoadError(getApiErrorMessage(error, '즐겨찾기 처리에 실패했습니다.'))
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(newsId)
          return next
        })
      }
    },
    [isLoggedIn, openAuthModal, pendingIds],
  )

  return {
    isBookmarked,
    isBookmarkPending,
    toggleBookmark,
    loadError,
  }
}
