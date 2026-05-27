export interface SentimentDistribution {
  positive: number
  neutral: number
  negative: number
}

export interface SentimentGaugeBlock {
  score: number
  min: number
  max: number
  distribution: SentimentDistribution
}

export interface StockHighlight {
  name: string
  metricLabel: string
  metricValue: string
  tone: 'positive' | 'negative' | 'neutral'
}

export interface DashboardWatchlistRow {
  name: string
  code: string
  imageUrl?: string | null
  price: number
  changePercent: number
  sentimentScore: number
  newsCount: number
  mentionSurgePercent: number
  hasAlert: boolean
}

export interface BuzzSurgeItem {
  rank: number
  code: string
  name: string
  surgePercent: number
}

export interface SectorHeatmapCell {
  name: string
  sentimentScore: number
  mentionCount: number
}

export interface DashboardOverview {
  portfolioSentiment: SentimentGaugeBlock
  stocksToWatch: StockHighlight[]
  watchlist: DashboardWatchlistRow[]
  kospiSentiment: SentimentGaugeBlock
  buzzSurgeTop3: BuzzSurgeItem[]
  sectorHeatmap: SectorHeatmapCell[]
}

/** @deprecated 뉴스 스파크라인 등 레거시 — 신규 대시보드 UI에서는 미사용 */
export interface DashboardStat {
  id: string
  label: string
  value: string
  changePercent?: number | null
  hint?: string
}

export interface SentimentTimelinePoint {
  at: string
  score: number
}

export interface SectorHeatItem {
  sectorCode: string
  sectorName: string
  buzzCount: number
  sentimentAvg: number
}
