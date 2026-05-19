import { formatStockScore } from '../stock/stockScore'
import type { SentimentPolarity } from '../../data/types/stock'

const SENTIMENT_LABEL: Record<SentimentPolarity, string> = {
  positive: '긍정',
  neutral: '중립',
  negative: '부정',
}

export function getPersonInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
  }
  return trimmed.slice(0, 1)
}

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
