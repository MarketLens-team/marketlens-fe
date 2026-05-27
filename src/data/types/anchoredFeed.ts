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

/** IntersectionObserver rootMargin (아래 older) — 과도하면 빠른 스크롤 시 연속 로드 */
export const ANCHORED_SCROLL_PREFETCH_EDGE_PX = 160

/** anchored newer/older — 이전 로드 종료 후 다음 API까지 최소 간격 */
export const ANCHORED_LOAD_MIN_INTERVAL_MS = 550

/** anchored 로드 스피너 최소 표시 시간 (newer·older 공통) */
export const ANCHORED_LOAD_MIN_VISIBLE_MS = 480

/** anchored 무한 스크롤 — 센티널 연속 트리거만 완화 (API 간격은 MIN_INTERVAL) */
export const ANCHORED_INFINITE_SCROLL_COOLDOWN_MS = 400

/** IntersectionObserver rootMargin (위 newer) — 크면 상단에서 자동 연속 로드 */
export const ANCHORED_SCROLL_PREFETCH_EDGE_UP_PX = 64

/** around 직후 목록 높이 ≥ 뷰포트 × 배수 될 때까지 양방향 워밍 */
export const ANCHORED_WARM_VIEWPORT_RATIO = 2

export const ANCHORED_WARM_MAX_ROUNDS = 4
