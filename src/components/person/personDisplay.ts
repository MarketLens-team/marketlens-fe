import { formatStockScore } from '../stock/stockScore'
import type { SentimentPolarity } from '../../data/types/stock'

const SENTIMENT_LABEL: Record<SentimentPolarity, string> = {
  positive: '긍정',
  neutral: '중립',
  negative: '부정',
}

export { getPersonInitials } from '../../lib/entityInitials'

export function formatPersonRole(organizationName: string, role: string): string {
  const org = organizationName.trim()
  const title = role.trim()
  if (org && title) return `${org} ${title}`
  return org || title || '—'
}

export function formatPersonSentimentBadge(sentiment: SentimentPolarity, score: number): string {
  return `${SENTIMENT_LABEL[sentiment]} ${formatStockScore(score)}`
}

export type PersonSentimentTone = 'pos' | 'neu' | 'neg'

export function personSentimentToneClass(sentiment: SentimentPolarity): PersonSentimentTone {
  if (sentiment === 'positive') return 'pos'
  if (sentiment === 'negative') return 'neg'
  return 'neu'
}
