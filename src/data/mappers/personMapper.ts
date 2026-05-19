import type {
  PersonFrequentStock,
  PersonMention,
  PersonRelatedStock,
  PersonTopItem,
  PersonTrackerPageData,
} from '../types/person'
import type { PersonStatementResponse, PersonTopResponse } from '../types/personApi'
import type { SentimentPolarity } from '../types/stock'

function toSentiment(raw: string): SentimentPolarity {
  const value = raw.trim().toLowerCase()
  if (value === 'positive' || value.includes('긍정')) return 'positive'
  if (value === 'negative' || value.includes('부정')) return 'negative'
  return 'neutral'
}

function mapRelatedStocks(stocks: PersonStatementResponse['relatedStocks']): PersonRelatedStock[] {
  return (stocks ?? []).map((stock) => ({
    code: stock.stockCode,
    name: stock.stockName || stock.stockCode,
  }))
}

export function mapPersonStatement(dto: PersonStatementResponse): PersonMention {
  return {
    id: String(dto.statementId),
    personId: String(dto.personId),
    personName: dto.personName,
    role: dto.personRole,
    organizationName: dto.organizationName,
    context: dto.statementSummary ?? '',
    sourceName: dto.sourceName,
    publishedAt: dto.publishedAt,
    sentiment: toSentiment(dto.sentiment),
    sentimentScore: dto.score,
    relatedStocks: mapRelatedStocks(dto.relatedStocks),
  }
}

export function mapPersonTopItem(dto: PersonTopResponse): PersonTopItem {
  return {
    personId: String(dto.personId),
    personName: dto.personName,
    role: dto.personRole,
    organizationName: dto.organizationName,
    mentionCount: dto.mentionCount,
  }
}

export function aggregateFrequentStocks(mentions: PersonMention[], limit = 12): PersonFrequentStock[] {
  const counts = new Map<string, PersonFrequentStock>()

  for (const mention of mentions) {
    for (const stock of mention.relatedStocks) {
      const hit = counts.get(stock.code) ?? { code: stock.code, name: stock.name, mentionCount: 0 }
      hit.mentionCount += 1
      counts.set(stock.code, hit)
    }
  }

  return [...counts.values()].sort((a, b) => b.mentionCount - a.mentionCount).slice(0, limit)
}

export function mapPersonTrackerPage(
  mentions: PersonStatementResponse[],
  topPersons: PersonTopResponse[],
): PersonTrackerPageData {
  const mappedMentions = mentions.map(mapPersonStatement)
  return {
    mentions: mappedMentions,
    topPersons: topPersons.map(mapPersonTopItem),
    frequentStocks: aggregateFrequentStocks(mappedMentions),
  }
}
