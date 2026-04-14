export type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

export interface SentimentScore {
  news_id: string
  sentiment: SentimentType
  score: number
  reason: string
  analyzed_at: string
}

export interface MarketSentiment {
  overall_score: number
  positive_ratio: number
  negative_ratio: number
  neutral_ratio: number
  total_count: number
}
