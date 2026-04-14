export type SentimentPolarity = 'positive' | 'negative' | 'neutral'

export interface StockSummary {
  code: string
  name: string
  sentimentScore: number
  buzz24h: number
}

export interface StockNewsItem {
  id: string
  title: string
  source: string
  /** ISO 8601 */
  publishedAt: string
  sentiment: SentimentPolarity
}

export interface StockDetail {
  stock: StockSummary
  recentNews: StockNewsItem[]
}
