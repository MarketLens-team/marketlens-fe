import { mapNewsFeedItems } from './stockMapper'
import type {
  FallbackPersonItemResponse,
  FallbackSectionsResponse,
  FallbackStockItemResponse,
  PersonSearchItemResponse,
  PersonStatementItemResponse,
  SearchResponse,
  StockSearchItemResponse,
} from '../types/searchApi'
import { groupStocksBySector } from '../../lib/groupStocksBySector'
import type {
  SearchFallbackPerson,
  SearchFallbackSections,
  SearchFallbackSectorGroup,
  SearchFallbackStock,
  SearchNewsPreview,
  SearchPersonResult,
  SearchStatementPreview,
  SearchStockResult,
  UnifiedSearchResult,
} from '../types/search'

function mapNewsPreviews(
  items: StockSearchItemResponse['relatedNews'],
  highlightTerms?: string[],
): SearchNewsPreview[] {
  return mapNewsFeedItems(items ?? [], highlightTerms).map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source,
    publishedAt: item.publishedAt,
    url: item.url,
    imageUrl: item.imageUrl,
    sentimentScore: item.sentimentScore,
  }))
}

function mapStatementPreview(dto: PersonStatementItemResponse): SearchStatementPreview {
  return {
    id: String(dto.statementId),
    quote: dto.speechQuote,
    sourceName: dto.sourceName,
    publishedAt: dto.publishedAt,
    sentimentScore: dto.sentimentScore,
    sentiment: dto.sentiment,
  }
}

function mapStockResult(dto: StockSearchItemResponse, query: string): SearchStockResult {
  const highlight = [dto.stockName, dto.stockCode, query].filter(Boolean)
  return {
    code: dto.stockCode,
    name: dto.stockName,
    market: dto.market,
    sectorCode: dto.sectorCode,
    sectorName: dto.sectorName,
    relatedNews: mapNewsPreviews(dto.relatedNews, highlight),
  }
}

function mapPersonResult(dto: PersonSearchItemResponse, query: string): SearchPersonResult {
  const highlight = [dto.personName, query]
  return {
    personId: String(dto.personId),
    personName: dto.personName,
    role: dto.personRole,
    organizationName: dto.organizationName,
    relatedNews: mapNewsPreviews(dto.relatedNews, highlight),
    relatedStatements: (dto.relatedStatements ?? []).map(mapStatementPreview),
  }
}

function mapFallbackStock(dto: FallbackStockItemResponse): SearchFallbackStock {
  return {
    code: dto.stockCode,
    name: dto.stockName,
    market: dto.market,
    sectorCode: dto.sectorCode,
    sectorName: dto.sectorName,
    mentionCount: dto.mentionCount,
  }
}

function mapFallbackStockSectors(stocks: SearchFallbackStock[]): SearchFallbackSectorGroup[] {
  return groupStocksBySector(stocks).map((group) => ({
    sectorCode: group.sectorKey,
    sectorName: group.sectorName,
    stocks: group.items,
  }))
}

function mapFallbackPerson(dto: FallbackPersonItemResponse): SearchFallbackPerson {
  return {
    personId: String(dto.personId),
    personName: dto.personName,
    role: dto.personRole,
    organizationName: dto.organizationName,
    mentionCount: dto.mentionCount,
  }
}

function mapFallbackSections(
  dto: FallbackSectionsResponse | null | undefined,
): SearchFallbackSections | null {
  if (!dto) return null

  const hotStocks = (dto.hotStocks ?? []).map(mapFallbackStock)
  const stockSectors = mapFallbackStockSectors(hotStocks)
  const topPersons = (dto.topPersons ?? []).map(mapFallbackPerson)
  const latestNews = mapNewsPreviews(dto.latestNews ?? [])

  if (stockSectors.length === 0 && topPersons.length === 0 && latestNews.length === 0) {
    return null
  }

  return { stockSectors, topPersons, latestNews }
}

export function mapSearchResponse(dto: SearchResponse, query: string): UnifiedSearchResult {
  return {
    stocks: (dto.stocks ?? []).map((item) => mapStockResult(item, query)),
    persons: (dto.persons ?? []).map((item) => mapPersonResult(item, query)),
    fallback: mapFallbackSections(dto.fallbackSections),
  }
}
