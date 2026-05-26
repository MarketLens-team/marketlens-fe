/** anchored 병합 후 최신순 정렬 — API 배치가 publishedAt 순이 아닐 수 있음 */
export function sortFeedItemsByPublishedAtDesc<T extends { id: string; publishedAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const tb = Date.parse(b.publishedAt)
    const ta = Date.parse(a.publishedAt)
    const diff = (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
    if (diff !== 0) return diff
    return Number(b.id) - Number(a.id)
  })
}

/** 피드 합칠 때 id 기준 중복 제거 */
export function mergeFeedItemsById<T extends { id: string }>(
  prev: T[],
  incoming: T[],
  position: 'prepend' | 'append',
): T[] {
  const { items } = mergeFeedItemsWithCount(prev, incoming, position)
  return items
}

/** 실제로 추가된 항목 수 — prefetch·연속 로드 판단용 */
export function mergeFeedItemsWithCount<T extends { id: string }>(
  prev: T[],
  incoming: T[],
  position: 'prepend' | 'append',
): { items: T[]; added: number } {
  const seen = new Set(prev.map((item) => item.id))
  const uniqueIncoming = incoming.filter((item) => !seen.has(item.id))
  if (uniqueIncoming.length === 0) {
    return { items: prev, added: 0 }
  }
  const items =
    position === 'prepend' ? [...uniqueIncoming, ...prev] : [...prev, ...uniqueIncoming]
  return { items, added: uniqueIncoming.length }
}

/** anchored prepend/append — id 중복 제거 후 publishedAt 내림차순 */
export function mergeAnchoredFeedItemsWithCount<T extends { id: string; publishedAt: string }>(
  prev: T[],
  incoming: T[],
  position: 'prepend' | 'append',
): { items: T[]; added: number } {
  const merged = mergeFeedItemsWithCount(prev, incoming, position)
  if (merged.added === 0) return merged
  return { items: sortFeedItemsByPublishedAtDesc(merged.items), added: merged.added }
}
