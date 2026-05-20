/** UI 요약 — `StockBuzzSurgeResponse`에서 매핑 */
export interface BuzzSurgeSummary {
  topMoverName: string
  topMoverSurgePercent: number
  /** API 미제공 — TOP N `items` 평균 감성 점수 */
  avgSentiment: number
  newsCount: number
}

export interface BuzzSurgeRow {
  rank: number
  stockCode: string
  stockName: string
  currentMentionCount: number
  surgePercent: number
  sentimentScore: number
  aiSummary: string
}

export interface BuzzSurgePage {
  updatedAt: string
  summary: BuzzSurgeSummary
  items: BuzzSurgeRow[]
}
