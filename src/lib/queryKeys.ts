/** TanStack Query cache key — 서버 상태 단일 주소 */
export const queryKeys = {
  watchlist: {
    all: ['watchlist'] as const,
    rows: ['watchlist', 'rows'] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
    ids: ['bookmarks', 'ids'] as const,
  },
} as const
