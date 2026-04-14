import type { SentimentPolarity } from './stock'

export interface PersonMention {
  id: string
  personName: string
  role: string
  context: string
  stockCodes: string[]
  /** ISO 8601 */
  publishedAt: string
  sentiment: SentimentPolarity
}
