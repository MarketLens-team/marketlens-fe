/** 피드 로드 모드 — 최신 목록(cursor) vs 특정 항목 기준(around/newer/older) */
export type FeedMode = 'latest' | 'anchored'

export interface AnchoredFeedPagination {
  newerCursor: string | null
  hasNewer: boolean
  olderCursor: string | null
  hasOlder: boolean
}

export const EMPTY_ANCHORED_PAGINATION: AnchoredFeedPagination = {
  newerCursor: null,
  hasNewer: false,
  olderCursor: null,
  hasOlder: false,
}
