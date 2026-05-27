/** 인물 트래커·상세 — 첫 페인트 전 스켈레톤 유지 (열 단위 스왑 없이 동일 그리드) */
export function isPersonTrackerPageLoading(input: {
  feedError: Error | null
  feedInitialLoading: boolean
  topLoading: boolean
  topPersons: unknown[] | null | undefined
  stocksLoading: boolean
  frequentStocks: unknown[] | null | undefined
}): boolean {
  if (input.feedError) return false
  return (
    input.feedInitialLoading ||
    (input.topLoading && input.topPersons == null) ||
    (input.stocksLoading && input.frequentStocks == null)
  )
}

export function isPersonDetailPageLoading(
  input: Parameters<typeof isPersonTrackerPageLoading>[0] & {
    mentionCountLoading: boolean
    mentionCount: number | null | undefined
  },
): boolean {
  if (input.feedError) return false
  return (
    isPersonTrackerPageLoading(input) ||
    (input.mentionCountLoading && input.mentionCount == null)
  )
}
