import type { AnchoredFeedPagination } from '../data/types/anchoredFeed'

/** API 커서 `2026-05-19T08:53:00Z|2788` 에서 statement/news id */
export function anchoredCursorItemId(cursor: string | null | undefined): string | null {
  if (!cursor) return null
  const pipe = cursor.lastIndexOf('|')
  if (pipe < 0) return null
  const id = cursor.slice(pipe + 1).trim()
  return id.length > 0 ? id : null
}

/** 타임스탬프 문자열 차이는 무시하고 같은 항목 id면 동일 커서로 봄 */
export function anchoredCursorsEqual(a: string | null, b: string | null): boolean {
  if (!a || !b) return a === b
  const idA = anchoredCursorItemId(a)
  const idB = anchoredCursorItemId(b)
  if (idA && idB) return idA === idB
  return a === b
}

/**
 * newer/older 한 방향 응답 적용 시 반대쪽 페이지네이션은 유지.
 * (BE는 newer=첫 항목·older=마지막 항목 커서를 주지만, 단방향 응답이 반대 edge를 덮지 않게 방어)
 */
export function mergeAnchoredPaginationForDirection(
  prev: AnchoredFeedPagination,
  incoming: AnchoredFeedPagination,
  direction: 'newer' | 'older',
): AnchoredFeedPagination {
  if (direction === 'newer') {
    return {
      hasNewer: incoming.hasNewer,
      newerCursor: incoming.hasNewer ? incoming.newerCursor : null,
      hasOlder: prev.hasOlder,
      olderCursor: prev.hasOlder ? prev.olderCursor : null,
    }
  }

  return {
    hasNewer: prev.hasNewer,
    newerCursor: prev.hasNewer ? prev.newerCursor : null,
    hasOlder: incoming.hasOlder,
    olderCursor: incoming.hasOlder ? incoming.olderCursor : null,
  }
}
