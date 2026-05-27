import type { AnchoredFeedPagination } from '../data/types/anchoredFeed'

/** API 커서 `2026-05-19T08:53:00Z|2788` 에서 statement/news id */
export function anchoredCursorItemId(cursor: string | null | undefined): string | null {
  if (!cursor) return null
  const pipe = cursor.lastIndexOf('|')
  if (pipe < 0) return null
  const id = cursor.slice(pipe + 1).trim()
  return id.length > 0 ? id : null
}

/** API 커서 문자열 생성 — `publishedAt|id` */
export function buildAnchoredItemCursor(item: { id: string; publishedAt: string }): string {
  return `${item.publishedAt}|${item.id}`
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
interface AnchoredEdgeLike {
  hasMore: boolean
  cursor: string | null
}

function publishedAtMs(value: string): number {
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : 0
}

/** 배치 안에서 publishedAt 기준 가장 최신 항목 */
export function newestItemInBatch<T extends { id: string; publishedAt: string }>(
  items: T[],
): T | null {
  if (items.length === 0) return null
  return items.reduce((best, item) =>
    publishedAtMs(item.publishedAt) > publishedAtMs(best.publishedAt) ? item : best,
  )
}

/** 배치 안에서 publishedAt 기준 가장 오래된 항목 */
export function oldestItemInBatch<T extends { id: string; publishedAt: string }>(
  items: T[],
): T | null {
  if (items.length === 0) return null
  return items.reduce((best, item) =>
    publishedAtMs(item.publishedAt) < publishedAtMs(best.publishedAt) ? item : best,
  )
}

/** newer 응답 — BE가 준 newerCursor를 그대로 사용 (재조합 시 400 가능) */
export function resolveNewerEdgeFromPage(
  _pageItems: unknown[],
  pagination: { hasNewer: boolean; newerCursor: string | null },
): AnchoredEdgeLike {
  if (!pagination.hasNewer || !pagination.newerCursor) {
    return { hasMore: false, cursor: null }
  }
  return { hasMore: true, cursor: pagination.newerCursor }
}

/** older 응답 — BE가 준 olderCursor를 그대로 사용 (재조합 시 400 가능) */
export function resolveOlderEdgeFromPage(
  _pageItems: unknown[],
  pagination: { hasOlder: boolean; olderCursor: string | null },
): AnchoredEdgeLike {
  if (!pagination.hasOlder || !pagination.olderCursor) {
    return { hasMore: false, cursor: null }
  }
  return { hasMore: true, cursor: pagination.olderCursor }
}

/** 병합·정렬 후 목록 최상단과 newer 커서 id가 어긋나면 보정 (older 후 newer 재요청 시 중복 페이지 방지) */
export function alignNewerEdgeToListTop<T extends { id: string; publishedAt: string }>(
  items: T[],
  edge: AnchoredEdgeLike,
): AnchoredEdgeLike {
  if (!edge.hasMore || items.length === 0) return edge
  const newest = items[0]
  const edgeId = anchoredCursorItemId(edge.cursor)
  if (!edgeId || edgeId === newest.id) return edge
  return { hasMore: edge.hasMore, cursor: buildAnchoredItemCursor(newest) }
}

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
