import { useNewsBookmarkStore } from '../store/newsBookmarkStore'

export function useNewsBookmarks() {
  // isBookmarked()만 쓰는 컴포넌트도 ID 변경 시 리렌더되도록 구독
  useNewsBookmarkStore((s) => s.bookmarkedIds)
  useNewsBookmarkStore((s) => s.pendingIds)
  const loadError = useNewsBookmarkStore((s) => s.loadError)
  const isBookmarked = useNewsBookmarkStore((s) => s.isBookmarked)
  const isBookmarkPending = useNewsBookmarkStore((s) => s.isBookmarkPending)
  const toggleBookmark = useNewsBookmarkStore((s) => s.toggleBookmark)

  return {
    isBookmarked,
    isBookmarkPending,
    toggleBookmark,
    loadError,
  }
}
