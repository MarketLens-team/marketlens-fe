import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import {
  addNewsBookmark,
  fetchBookmarkIds,
  removeNewsBookmark,
} from '../data/clients/bookmarkClient'
import type { ApiEnvelope } from '../data/types/api'
import type { NewsBookmarkSaveContext } from '../data/types/bookmark'
import { getApiErrorMessage } from '../data/util/apiError'
import { BOOKMARK_IDS_STALE_MS, memberListQueryOptions } from '../lib/queryCache'
import { queryKeys } from '../lib/queryKeys'
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

type ToggleBookmarkResult = 'auth' | 'pending' | 'added' | 'removed' | 'error'

let pendingIds = new Set<string>()
const pendingListeners = new Set<() => void>()

function subscribePending(listener: () => void) {
  pendingListeners.add(listener)
  return () => pendingListeners.delete(listener)
}

function getPendingSnapshot() {
  return pendingIds
}

function setPendingIds(next: Set<string>) {
  pendingIds = next
  pendingListeners.forEach((listener) => listener())
}

async function fetchBookmarkIdStrings(): Promise<string[]> {
  const ids = await fetchBookmarkIds()
  return ids.map(String)
}

export function useNewsBookmarks() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const queryClient = useQueryClient()
  const pending = useSyncExternalStore(subscribePending, getPendingSnapshot)

  const { data: bookmarkedIdsList = [], error } = useQuery({
    queryKey: queryKeys.bookmarks.ids,
    queryFn: fetchBookmarkIdStrings,
    enabled: isLoggedIn,
    staleTime: BOOKMARK_IDS_STALE_MS,
    ...memberListQueryOptions,
  })

  const bookmarkedIds = useMemo(() => new Set(bookmarkedIdsList), [bookmarkedIdsList])
  const [mutationError, setMutationError] = useState<string | null>(null)
  const loadError = error
    ? getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.')
    : mutationError

  const isBookmarked = useCallback(
    (newsId: string) => bookmarkedIds.has(newsId),
    [bookmarkedIds],
  )

  const isBookmarkPending = useCallback((newsId: string) => pending.has(newsId), [pending])

  const toggleBookmark = useCallback(
    async (
      newsId: string,
      context: NewsBookmarkSaveContext,
    ): Promise<ToggleBookmarkResult> => {
      if (!useAuthStore.getState().isLoggedIn) {
        useAuthModalStore.getState().open('login')
        return 'auth'
      }

      if (pendingIds.has(newsId)) return 'pending'

      const wasBookmarked = bookmarkedIds.has(newsId)
      const previous = queryClient.getQueryData<string[]>(queryKeys.bookmarks.ids)

      const optimistic = new Set(bookmarkedIds)
      if (wasBookmarked) optimistic.delete(newsId)
      else optimistic.add(newsId)
      queryClient.setQueryData(queryKeys.bookmarks.ids, Array.from(optimistic))

      const nextPending = new Set(pendingIds)
      nextPending.add(newsId)
      setPendingIds(nextPending)

      try {
        if (wasBookmarked) {
          await removeNewsBookmark(newsId)
          return 'removed'
        }
        await addNewsBookmark(newsId, context)
        return 'added'
      } catch (err) {
        const code = extractApiErrorCode(err)
        if (code === 'B001' && !wasBookmarked) {
          queryClient.setQueryData<string[]>(queryKeys.bookmarks.ids, (current = []) => {
            const ids = new Set(current)
            ids.add(newsId)
            return Array.from(ids)
          })
          return 'added'
        }
        if (code === 'B002' && wasBookmarked) {
          queryClient.setQueryData<string[]>(queryKeys.bookmarks.ids, (current = []) =>
            current.filter((id) => id !== newsId),
          )
          return 'removed'
        }

        if (previous) {
          queryClient.setQueryData(queryKeys.bookmarks.ids, previous)
        }
        setMutationError(getApiErrorMessage(err, '즐겨찾기 처리에 실패했습니다.'))
        return 'error'
      } finally {
        const cleared = new Set(pendingIds)
        cleared.delete(newsId)
        setPendingIds(cleared)
      }
    },
    [bookmarkedIds, queryClient],
  )

  return {
    isBookmarked,
    isBookmarkPending,
    toggleBookmark,
    loadError,
  }
}
