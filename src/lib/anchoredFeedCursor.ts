import type { AnchoredFeedPagination } from '../data/types/anchoredFeed'

function publishedAtMs(publishedAt: string): number {
  const t = Date.parse(publishedAt)
  return Number.isFinite(t) ? t : 0
}

/** API `older` 커서 형식 — `2026-05-20T19:43:00Z|2902` */
export function buildAnchoredItemCursor(item: { id: string; publishedAt: string }): string {
  const ms = publishedAtMs(item.publishedAt)
  const iso = ms > 0 ? new Date(ms).toISOString() : item.publishedAt
  return `${iso}|${item.id}`
}

export function pickOldestFeedItem<T extends { id: string; publishedAt: string }>(
  items: T[],
): T | null {
  if (items.length === 0) return null
  return items.reduce((oldest, item) =>
    publishedAtMs(item.publishedAt) < publishedAtMs(oldest.publishedAt) ? item : oldest,
  )
}

/**
 * older 응답의 olderCursor가 배치 최신글(첫 항목)을 가리키면 같은 페이지가 반복됨.
 * 다음 older 요청은 배치에서 가장 오래된 항목 기준으로 맞춤.
 */
export function correctOlderPaginationFromItems<T extends { id: string; publishedAt: string }>(
  items: T[],
  pagination: AnchoredFeedPagination,
): AnchoredFeedPagination {
  if (!pagination.hasOlder) return pagination
  const oldest = pickOldestFeedItem(items)
  if (!oldest) return pagination
  return {
    ...pagination,
    olderCursor: buildAnchoredItemCursor(oldest),
  }
}
