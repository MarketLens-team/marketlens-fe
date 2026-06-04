import type { SentimentPolarity } from './stock'

/** 인물 트래커 피드·우측 패널 기간 — API `range` 쿼리 매핑은 `personClient` 참고 */
export type PersonMentionsRange = 'today' | '7d'

export interface PersonRelatedStock {
  code: string
  name: string
}

export interface PersonMention {
  id: string
  personId: string
  personName: string
  imageUrl?: string | null
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
  imageUrl?: string | null
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
  /** 인물 발언 커서 — 다음 페이지 있을 때만 사용 */
  mentionsNextCursor: string | null
  mentionsHasNext: boolean
}

/** 인물 상세 — 발언 피드만 (커서 페이지네이션) */
export interface PersonMentionsFeedData {
  mentions: PersonMention[]
  mentionsNextCursor: string | null
  mentionsHasNext: boolean
}

export interface PersonProfileSummary {
  personId: string
  personName: string
  imageUrl?: string | null
  role: string
  organizationName: string
}

/** 인물 상세 — 발언 피드 + 우측 TOP5·연관 종목 */
export type PersonDetailPageData = PersonTrackerPageData
