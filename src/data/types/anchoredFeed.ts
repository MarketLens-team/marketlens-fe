/** 피드 로드 모드 — 최신 목록(cursor) vs 특정 항목 기준(around/newer/older) */
export type FeedMode = 'latest' | 'anchored'

export interface AnchoredFeedPagination {
  newerCursor: string | null
  hasNewer: boolean
  olderCursor: string | null
  hasOlder: boolean
}

export interface LatestFeedPagination {
  nextCursor: string | null
  hasNext: boolean
}

/** latest(cursor) vs anchored(around/newer/older) 공통 상태 */
export interface FeedState<TItem> {
  mode: FeedMode
  items: TItem[]
  latestPagination: LatestFeedPagination
  anchoredPagination: AnchoredFeedPagination
}

export const EMPTY_ANCHORED_PAGINATION: AnchoredFeedPagination = {
  newerCursor: null,
  hasNewer: false,
  olderCursor: null,
  hasOlder: false,
}

/** anchored around/newer/older 요청 limit */
export const ANCHORED_FEED_PAGE_LIMIT = 20

/** 응답이 limit 미만일 때 같은 방향 연속 prefetch 상한 */
export const ANCHORED_FEED_MAX_PREFETCH_PAGES = 3

/** IntersectionObserver rootMargin — 과도하면 빠른 스크롤 시 연속 로드·튐 유발 */
export const ANCHORED_SCROLL_PREFETCH_EDGE_PX = 280

/** around 직후 목록 높이 ≥ 뷰포트 × 배수 될 때까지 양방향 워밍 */
export const ANCHORED_WARM_VIEWPORT_RATIO = 2

export const ANCHORED_WARM_MAX_ROUNDS = 4
