export interface DashboardStat {
  id: string
  label: string
  value: string
  changePercent?: number | null
  hint?: string
}

export interface SentimentTimelinePoint {
  /** ISO 8601 */
  at: string
  score: number
}

export interface SectorHeatItem {
  sectorCode: string
  sectorName: string
  buzzCount: number
  /** -100 ~ 100 스케일 가정 */
  sentimentAvg: number
}

export interface DashboardOverview {
  stats: DashboardStat[]
  sentimentTimeline: SentimentTimelinePoint[]
  sectorHeat: SectorHeatItem[]
}
