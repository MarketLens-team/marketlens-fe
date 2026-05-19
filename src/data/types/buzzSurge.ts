export interface BuzzSurgeSummary {
  /** +180% 이상 급등 감지 종목 수 */
  detectedCount: number
  topMoverName: string
  topMoverSurgePercent: number
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
