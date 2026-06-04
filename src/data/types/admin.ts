/** `crawling_log.status` */
export type CrawlingLogStatus = 'SUCCESS' | 'FAIL' | 'PARTIAL'

/** `crawling_log` 행 — ID는 JSON에서 bigint 문자열 권장 */
export interface CrawlingLog {
  crawlingLogId: string
  startedAt: string
  endedAt: string | null
  totalCount: number
  successCount: number
  failCount: number
  status: CrawlingLogStatus
  errorMessage: string | null
}

export interface AdminOverview {
  /** `stock` 중 `deleted_at` IS NULL */
  totalStocks: number
  /** 오늘 시작된 `crawling_log` 건수(백엔드 집계) */
  crawlingRunsToday: number
  /** 최근 24h `status = FAIL` 인 실행 건수 */
  failedRuns24h: number
  /** 가장 최근 종료된 크롤의 `ended_at` */
  lastCrawlEndedAt: string | null
}

/** `stock` + 뉴스 수집 시각 등 DTO (마지막 시각은 ERD상 조인·집계) */
export interface AdminStockRow {
  stockId: string
  stockCode: string
  stockName: string
  market: string
  deletedAt: string | null
  /** 해당 종목 관련 뉴스의 최신 `news.crawled_at` 등 — 서버 집계 */
  lastNewsCrawledAt: string | null
}
