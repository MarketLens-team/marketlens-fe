import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import type {
  PersonFrequentStock,
  PersonMention,
  PersonMentionsFeedData,
  PersonProfileSummary,
  PersonRelatedStock,
  PersonTopItem,
  PersonTrackerPageData,
} from '../types/person'
import type {
  FrequentStockItemResponse,
  PersonMentionAroundResponse,
  PersonMentionCursorResponse,
  PersonSidebarResponse,
  PersonStatementResponse,
  PersonTopResponse,
} from '../types/personApi'
import type { AnchoredFeedPagination } from '../types/anchoredFeed'
import type { SentimentPolarity } from '../types/stock'

function toSentiment(raw: string): SentimentPolarity {
  const value = raw.trim().toLowerCase()
  if (value === 'positive' || value.includes('긍정')) return 'positive'
  if (value === 'negative' || value.includes('부정')) return 'negative'
  return 'neutral'
}

function mapRelatedStocks(stocks: PersonStatementResponse['relatedStocks']): PersonRelatedStock[] {
  return (stocks ?? []).flatMap((stock) => {
    const code = stock.stockCode ?? stock.code ?? ''
    if (!code) return []
    return [{ code, name: stock.stockName || code }]
  })
}

export function mapPersonStatement(dto: PersonStatementResponse): PersonMention {
  return {
    id: String(dto.statementId),
    personId: String(dto.personId),
    personName: dto.personName,
    imageUrl: normalizeImageUrl(dto.imageUrl),
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
    imageUrl: normalizeImageUrl(dto.imageUrl),
    role: dto.personRole,
    organizationName: dto.organizationName,
    mentionCount: dto.mentionCount,
  }
}

export function mapFrequentStockItem(dto: FrequentStockItemResponse): PersonFrequentStock | null {
  const code = dto.stockCode?.trim() ?? ''
  if (!code) return null
  return {
    code,
    name: dto.stockName?.trim() || code,
    mentionCount: Number(dto.mentionCount) || 0,
  }
}

export function mapFrequentStockList(
  items: FrequentStockItemResponse[],
  mentionsFallback?: PersonMention[],
): PersonFrequentStock[] {
  const mapped = items.map(mapFrequentStockItem).filter((x): x is PersonFrequentStock => x != null)
  if (mapped.length) return mapped
  return mentionsFallback ? aggregateFrequentStocks(mentionsFallback) : []
}

function publishedAtMs(mention: PersonMention): number {
  const t = Date.parse(mention.publishedAt)
  return Number.isFinite(t) ? t : 0
}

/** 커서 페이지 합친 뒤 최신순·중복 제거 */
export function normalizePersonMentionsList(mentions: PersonMention[]): PersonMention[] {
  const seen = new Set<string>()
  const unique: PersonMention[] = []
  for (const mention of mentions) {
    if (seen.has(mention.id)) continue
    seen.add(mention.id)
    unique.push(mention)
  }
  return unique.sort((a, b) => publishedAtMs(b) - publishedAtMs(a))
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
  cursorMeta?: { nextCursor: string | null; hasNext: boolean },
): PersonTrackerPageData {
  const mappedMentions = mentions.map(mapPersonStatement)
  return {
    mentions: mappedMentions,
    topPersons: topPersons.map(mapPersonTopItem),
    frequentStocks: aggregateFrequentStocks(mappedMentions),
    mentionsNextCursor: cursorMeta?.nextCursor ?? null,
    mentionsHasNext: cursorMeta?.hasNext ?? false,
  }
}

export function mapPersonMentionsCursor(page: PersonMentionCursorResponse) {
  const mappedMentions = normalizePersonMentionsList(page.items.map(mapPersonStatement))
  return {
    mentions: mappedMentions,
    mentionsNextCursor: page.nextCursor ?? null,
    mentionsHasNext: page.hasNext ?? false,
  }
}

export function mapPersonMentionsAroundPagination(
  page: PersonMentionAroundResponse,
): AnchoredFeedPagination {
  return {
    newerCursor: page.newerCursor ?? null,
    hasNewer: page.hasNewer ?? false,
    olderCursor: page.olderCursor ?? null,
    hasOlder: page.hasOlder ?? false,
  }
}

export function mapPersonMentionsAround(page: PersonMentionAroundResponse) {
  return {
    mentions: normalizePersonMentionsList(page.items.map(mapPersonStatement)),
    anchoredPagination: mapPersonMentionsAroundPagination(page),
  }
}

export function mapPersonSidebar(sidebar: PersonSidebarResponse, mentionsFallback: PersonMention[]) {
  return {
    topPersons: (sidebar.topPersons ?? []).map(mapPersonTopItem),
    frequentStocks: mapFrequentStockList(sidebar.frequentStocks ?? [], mentionsFallback),
  }
}

/** @deprecated mapPersonMentionsCursor + mapPersonSidebar 사용 */
export function mapPersonTrackerFromCursorResponse(page: PersonMentionCursorResponse): PersonTrackerPageData {
  const cursor = mapPersonMentionsCursor(page)
  return {
    ...cursor,
    topPersons: [],
    frequentStocks: aggregateFrequentStocks(cursor.mentions),
  }
}

export function mergePersonTrackerPage(
  cursor: PersonMentionCursorResponse,
  topPersons: PersonTopResponse[],
  frequentStocks: FrequentStockItemResponse[],
): PersonTrackerPageData {
  const cursorPart = mapPersonMentionsCursor(cursor)
  return {
    ...cursorPart,
    topPersons: topPersons.map(mapPersonTopItem),
    frequentStocks: mapFrequentStockList(frequentStocks, cursorPart.mentions),
  }
}

export function personProfileFromMention(mention: PersonMention): PersonProfileSummary {
  return {
    personId: mention.personId,
    personName: mention.personName,
    imageUrl: mention.imageUrl,
    role: mention.role,
    organizationName: mention.organizationName,
  }
}

/** 인물 상세 — 다음 커서 페이지 합침 */
export function mergePersonMentionsFeedPage(
  prev: PersonMentionsFeedData,
  newStatements: PersonStatementResponse[],
  cursorMeta: { nextCursor: string | null; hasNext: boolean },
): PersonMentionsFeedData {
  const merged = normalizePersonMentionsList([
    ...prev.mentions,
    ...newStatements.map(mapPersonStatement),
  ])
  return {
    mentions: merged,
    mentionsNextCursor: cursorMeta.nextCursor,
    mentionsHasNext: cursorMeta.hasNext,
  }
}

/** 인물 트래커 — 다음 커서 페이지를 기존 데이터에 합침 (우측 top/자주 언급은 첫 응답 유지) */
export function mergePersonTrackerMentionsPage(
  prev: PersonTrackerPageData,
  newStatements: PersonStatementResponse[],
  cursorMeta: { nextCursor: string | null; hasNext: boolean },
): PersonTrackerPageData {
  const mergedMentions = normalizePersonMentionsList([
    ...prev.mentions,
    ...newStatements.map(mapPersonStatement),
  ])
  return {
    ...prev,
    mentions: mergedMentions,
    mentionsNextCursor: cursorMeta.nextCursor,
    mentionsHasNext: cursorMeta.hasNext,
  }
}
