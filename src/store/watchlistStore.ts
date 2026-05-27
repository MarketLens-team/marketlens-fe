import { create } from 'zustand'
import { WATCHLIST_KEY } from '../constants/storage'

export interface WatchlistItem {
  code: string
  name: string
  imageUrl?: string | null
}

interface WatchlistState {
  items: WatchlistItem[]
  add: (item: WatchlistItem) => void
  remove: (code: string) => void
  has: (code: string) => boolean
  clear: () => void
}

function readStoredWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is WatchlistItem =>
        !!v &&
        typeof v === 'object' &&
        typeof (v as { code?: unknown }).code === 'string' &&
        typeof (v as { name?: unknown }).name === 'string',
    )
  } catch {
    return []
  }
}

function writeStoredWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items))
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: readStoredWatchlist(),
  add: (item) =>
    set((state) => {
      if (state.items.some((v) => v.code === item.code)) return state
      const nextItems = [...state.items, item]
      writeStoredWatchlist(nextItems)
      return { items: nextItems }
    }),
  remove: (code) =>
    set((state) => {
      const nextItems = state.items.filter((v) => v.code !== code)
      writeStoredWatchlist(nextItems)
      return { items: nextItems }
    }),
  has: (code) => get().items.some((v) => v.code === code),
  clear: () =>
    set(() => {
      writeStoredWatchlist([])
      return { items: [] }
    }),
}))
