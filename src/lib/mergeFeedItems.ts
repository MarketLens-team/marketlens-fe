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
