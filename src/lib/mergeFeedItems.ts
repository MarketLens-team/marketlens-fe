/** 피드 합칠 때 id 기준 중복 제거 */
export function mergeFeedItemsById<T extends { id: string }>(
  prev: T[],
  incoming: T[],
  position: 'prepend' | 'append',
): T[] {
  const seen = new Set(prev.map((item) => item.id))
  const uniqueIncoming = incoming.filter((item) => !seen.has(item.id))
  if (uniqueIncoming.length === 0) return prev
  return position === 'prepend' ? [...uniqueIncoming, ...prev] : [...prev, ...uniqueIncoming]
}
