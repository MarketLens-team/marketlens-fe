import { create } from 'zustand'
import { isMockDataSource } from '../config/dataSource'
import {
  addWatchlistItem,
  fetchWatchlistResponses,
  removeWatchlistItem,
  watchlistResponsesToItems,
} from '../data/clients/watchlistClient'
import type { WatchlistResponse } from '../data/types/memberApi'
import type { WatchlistItem } from '../data/types/watchlist'
import { useAuthModalStore } from './authModalStore'
import { useAuthStore } from './authStore'

const LEGACY_WATCHLIST_KEY = 'marketlens_watchlist'

function watchlistItemToResponse(item: WatchlistItem): WatchlistResponse {
  return {
    stockCode: item.code,
    stockName: item.name,
    sectorName: '',
    market: '',
    imageUrl: item.imageUrl ?? undefined,
  }
}

interface WatchlistState {
  responses: WatchlistResponse[]
  items: WatchlistItem[]
  loaded: boolean
  pendingCode: string | null
  reload: () => Promise<void>
  has: (code: string) => boolean
  remove: (code: string) => Promise<void>
  toggle: (item: WatchlistItem) => Promise<'auth' | 'pending' | 'added' | 'removed' | 'error'>
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  responses: [],
  items: [],
  loaded: false,
  pendingCode: null,

  reload: async () => {
    if (!useAuthStore.getState().isLoggedIn) {
      set({ responses: [], items: [], loaded: true, pendingCode: null })
      return
    }
    try {
      const responses = await fetchWatchlistResponses()
      set({
        responses,
        items: watchlistResponsesToItems(responses),
        loaded: true,
      })
    } catch {
      set({ responses: [], items: [], loaded: true })
    }
  },

  has: (code) => get().items.some((item) => item.code === code),

  remove: async (code) => {
    if (!useAuthStore.getState().isLoggedIn) {
      useAuthModalStore.getState().open('login')
      return
    }
    if (get().pendingCode) return

    set({ pendingCode: code })
    try {
      if (isMockDataSource()) {
        set((state) => ({
          responses: state.responses.filter((item) => item.stockCode !== code),
          items: state.items.filter((item) => item.code !== code),
          loaded: true,
        }))
        return
      }
      await removeWatchlistItem(code)
      set((state) => ({
        responses: state.responses.filter((item) => item.stockCode !== code),
        items: state.items.filter((item) => item.code !== code),
        loaded: true,
      }))
    } catch {
      /* 상태 유지 */
    } finally {
      set({ pendingCode: null })
    }
  },

  toggle: async (item) => {
    if (!useAuthStore.getState().isLoggedIn) {
      useAuthModalStore.getState().open('login')
      return 'auth'
    }
    if (get().pendingCode) return 'pending'

    const wasInterested = get().items.some((v) => v.code === item.code)
    set({ pendingCode: item.code })
    try {
      if (isMockDataSource()) {
        set((state) => {
          if (wasInterested) {
            return {
              responses: state.responses.filter((v) => v.stockCode !== item.code),
              items: state.items.filter((v) => v.code !== item.code),
              loaded: true,
            }
          }
          const response = watchlistItemToResponse(item)
          return {
            responses: [...state.responses, response],
            items: [...state.items, item],
            loaded: true,
          }
        })
        return wasInterested ? 'removed' : 'added'
      }

      if (wasInterested) {
        await removeWatchlistItem(item.code)
        set((state) => ({
          responses: state.responses.filter((v) => v.stockCode !== item.code),
          items: state.items.filter((v) => v.code !== item.code),
          loaded: true,
        }))
        return 'removed'
      }

      await addWatchlistItem(item.code)
      const response = watchlistItemToResponse(item)
      set((state) => ({
        responses: [...state.responses, response],
        items: [...state.items, item],
        loaded: true,
      }))
      return 'added'
    } catch {
      return 'error'
    } finally {
      set({ pendingCode: null })
    }
  },
}))

/** 마이페이지·대시보드 등 — 스토어에 이미 로드된 rows 재사용 */
export function getCachedWatchlistResponses(): WatchlistResponse[] | null {
  const { loaded, responses } = useWatchlistStore.getState()
  return loaded ? responses : null
}

function syncWatchlistWithAuth(isLoggedIn: boolean) {
  if (!isLoggedIn) {
    useWatchlistStore.setState({
      responses: [],
      items: [],
      loaded: true,
      pendingCode: null,
    })
    return
  }
  useWatchlistStore.setState({ loaded: false })
  void useWatchlistStore.getState().reload()
}

localStorage.removeItem(LEGACY_WATCHLIST_KEY)

useAuthStore.subscribe((state, prev) => {
  if (state.isLoggedIn !== prev.isLoggedIn) {
    syncWatchlistWithAuth(state.isLoggedIn)
  }
})

syncWatchlistWithAuth(useAuthStore.getState().isLoggedIn)
