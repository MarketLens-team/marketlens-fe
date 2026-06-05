import axios from 'axios'
import { create } from 'zustand'
import {
  addNewsBookmark,
  fetchBookmarkIds,
  removeNewsBookmark,
} from '../data/clients/bookmarkClient'
import type { ApiEnvelope } from '../data/types/api'
import type { NewsBookmarkSaveContext } from '../data/types/bookmark'
import { getApiErrorMessage } from '../data/util/apiError'
import { useAuthModalStore } from './authModalStore'
import { useAuthStore } from './authStore'

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

interface NewsBookmarkState {
  bookmarkedIds: Set<string>
  pendingIds: Set<string>
  loadError: string | null
  loaded: boolean
  reload: () => Promise<void>
  isBookmarked: (newsId: string) => boolean
  isBookmarkPending: (newsId: string) => boolean
  toggleBookmark: (newsId: string, context: NewsBookmarkSaveContext) => Promise<ToggleBookmarkResult>
}

export const useNewsBookmarkStore = create<NewsBookmarkState>((set, get) => ({
  bookmarkedIds: new Set(),
  pendingIds: new Set(),
  loadError: null,
  loaded: false,

  reload: async () => {
    if (!useAuthStore.getState().isLoggedIn) {
      set({
        bookmarkedIds: new Set(),
        pendingIds: new Set(),
        loadError: null,
        loaded: true,
      })
      return
    }
    try {
      const ids = await fetchBookmarkIds()
      set({
        bookmarkedIds: new Set(ids.map(String)),
        loadError: null,
        loaded: true,
      })
    } catch (error) {
      set({
        bookmarkedIds: new Set(),
        loadError: getApiErrorMessage(error, '즐겨찾기를 불러오지 못했습니다.'),
        loaded: true,
      })
    }
  },

  isBookmarked: (newsId) => get().bookmarkedIds.has(newsId),

  isBookmarkPending: (newsId) => get().pendingIds.has(newsId),

  toggleBookmark: async (newsId, context) => {
    if (!useAuthStore.getState().isLoggedIn) {
      useAuthModalStore.getState().open('login')
      return 'auth'
    }

    if (get().pendingIds.has(newsId)) return 'pending'

    const wasBookmarked = get().bookmarkedIds.has(newsId)

    set((state) => {
      const pendingIds = new Set(state.pendingIds)
      pendingIds.add(newsId)
      const bookmarkedIds = new Set(state.bookmarkedIds)
      if (wasBookmarked) bookmarkedIds.delete(newsId)
      else bookmarkedIds.add(newsId)
      return { pendingIds, bookmarkedIds }
    })

    try {
      if (wasBookmarked) {
        await removeNewsBookmark(newsId)
        return 'removed'
      }
      await addNewsBookmark(newsId, context)
      return 'added'
    } catch (error) {
      const code = extractApiErrorCode(error)
      if (code === 'B001' && !wasBookmarked) {
        set((state) => ({
          bookmarkedIds: new Set(state.bookmarkedIds).add(newsId),
        }))
        return 'added'
      }
      if (code === 'B002' && wasBookmarked) {
        set((state) => {
          const bookmarkedIds = new Set(state.bookmarkedIds)
          bookmarkedIds.delete(newsId)
          return { bookmarkedIds }
        })
        return 'removed'
      }

      set((state) => {
        const bookmarkedIds = new Set(state.bookmarkedIds)
        if (wasBookmarked) bookmarkedIds.add(newsId)
        else bookmarkedIds.delete(newsId)
        return {
          bookmarkedIds,
          loadError: getApiErrorMessage(error, '즐겨찾기 처리에 실패했습니다.'),
        }
      })
      return 'error'
    } finally {
      set((state) => {
        const pendingIds = new Set(state.pendingIds)
        pendingIds.delete(newsId)
        return { pendingIds }
      })
    }
  },
}))

/** 마이페이지 등 — 스토어에 이미 로드된 ID 목록 재사용 */
export function getCachedBookmarkIds(): Set<string> | null {
  const { loaded, bookmarkedIds } = useNewsBookmarkStore.getState()
  return loaded ? bookmarkedIds : null
}

function syncNewsBookmarksWithAuth(isLoggedIn: boolean) {
  if (!isLoggedIn) {
    useNewsBookmarkStore.setState({
      bookmarkedIds: new Set(),
      pendingIds: new Set(),
      loadError: null,
      loaded: true,
    })
    return
  }
  useNewsBookmarkStore.setState({ loaded: false })
  void useNewsBookmarkStore.getState().reload()
}

useAuthStore.subscribe((state, prev) => {
  if (state.isLoggedIn !== prev.isLoggedIn) {
    syncNewsBookmarksWithAuth(state.isLoggedIn)
  }
})

syncNewsBookmarksWithAuth(useAuthStore.getState().isLoggedIn)
