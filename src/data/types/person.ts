import type { SentimentPolarity } from './stock'

export interface PersonRelatedStock {
  code: string
  name: string
}

export interface PersonMention {
  id: string
  personId: string
  personName: string
  role: string
  organizationName: string
  context: string
  sourceName: string
  publishedAt: string
  sentiment: SentimentPolarity
  sentimentScore: number
  relatedStocks: PersonRelatedStock[]
}

export interface PersonTopItem {
  personId: string
  personName: string
  role: string
  organizationName: string
  mentionCount: number
}

export interface PersonFrequentStock {
  code: string
  name: string
  mentionCount: number
}

export interface PersonTrackerPageData {
  mentions: PersonMention[]
  topPersons: PersonTopItem[]
  frequentStocks: PersonFrequentStock[]
}
