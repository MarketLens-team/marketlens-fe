import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import { SEARCH_NEWS_MAX, SEARCH_STATEMENTS_MAX } from '../constants/search'
import { mapNewsFeedItems } from './stockMapper'
import type {
  FallbackPersonItemResponse,
  FallbackSectionsResponse,
  FallbackStockItemResponse,
  PersonSearchItemResponse,
  PersonStatementItemResponse,
  SearchNewsItemResponse,
  SearchNewsSourceType,
  SearchResponse,
  StockSearchItemResponse,
} from '../types/searchApi'
import { groupStocksBySector } from '../../lib/groupStocksBySector'
import type {
  SearchFallbackPerson,
  SearchFallbackSections,
  SearchFallbackSectorGroup,
  SearchFallbackStock,
  SearchNewsPersonTag,
  SearchNewsPreview,
  SearchNewsStockTag,
  SearchPersonResult,
  SearchStatementPreview,
  SearchStockResult,
  UnifiedSearchResult,
} from '../types/search'

function parseSearchNewsSourceType(value: string | undefined): SearchNewsSourceType {
  if (value === 'stock' || value === 'person' || value === 'mixed' || value === 'unknown') {
    return value
  }
  return 'unknown'
}

function mapNewsStockTags(dto: SearchNewsItemResponse['stocks']): SearchNewsStockTag[] {
  return (dto ?? []).map((tag) => ({
    stockCode: tag.stockCode,
    stockName: tag.stockName,
    relevanceScore: tag.relevanceScore,
  }))
}

function mapNewsPersonTags(dto: SearchNewsItemResponse['persons']): SearchNewsPersonTag[] {
  return (dto ?? []).map((tag) => ({
    personId: String(tag.personId),
    personName: tag.personName,
    personRole: tag.personRole,
    organizationName: tag.organizationName,
    relevanceScore: tag.relevanceScore,
  }))
}

function mapSearchNewsItem(dto: SearchNewsItemResponse): SearchNewsPreview {
  return {
    id: String(dto.id),
    title: dto.title,
    source: dto.source,
    publishedAt: dto.publishedAt,
    url: dto.originalLink || undefined,
    imageUrl: normalizeImageUrl(dto.imageUrl),
    sentimentScore: dto.sentimentScore,
    sentiment: dto.sentiment,
    sourceType: parseSearchNewsSourceType(dto.sourceType),
    primaryStockCode: dto.primaryStockCode ?? null,
    stocks: mapNewsStockTags(dto.stocks),
    persons: mapNewsPersonTags(dto.persons),
  }
}

function mapNewsPreviewsFromFeed(
  items: StockSearchItemResponse['relatedNews'],
  highlightTerms?: string[],
  max = SEARCH_NEWS_MAX,
): SearchNewsPreview[] {
  return mapNewsFeedItems(items ?? [], highlightTerms)
    .slice(0, max)
    .map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      publishedAt: item.publishedAt,
      url: item.url,
      imageUrl: item.imageUrl,
      sentimentScore: item.sentimentScore,
      sentiment: item.sentiment,
      stocks: [],
      persons: [],
    }))
}

function mapSearchNewsPreviews(
  items: SearchNewsItemResponse[] | undefined,
  max = SEARCH_NEWS_MAX,
): SearchNewsPreview[] {
  return (items ?? []).slice(0, max).map(mapSearchNewsItem)
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
    imageUrl: normalizeImageUrl(dto.imageUrl),
    market: dto.market,
    sectorCode: dto.sectorCode,
    sectorName: dto.sectorName,
    relatedNews: mapNewsPreviewsFromFeed(dto.relatedNews, highlight),
  }
}

function mapPersonResult(dto: PersonSearchItemResponse): SearchPersonResult {
  return {
    personId: String(dto.personId),
    personName: dto.personName,
    imageUrl: normalizeImageUrl(dto.imageUrl),
    role: dto.personRole,
    organizationName: dto.organizationName,
    relatedStatements: (dto.relatedStatements ?? [])
      .slice(0, SEARCH_STATEMENTS_MAX)
      .map(mapStatementPreview),
  }
}

function mapFallbackStock(dto: FallbackStockItemResponse): SearchFallbackStock {
  return {
    code: dto.stockCode,
    name: dto.stockName,
    imageUrl: normalizeImageUrl(dto.imageUrl),
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
    imageUrl: normalizeImageUrl(dto.imageUrl),
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
  const latestNews = mapSearchNewsPreviews(dto.latestNews ?? [], SEARCH_NEWS_MAX)

  if (stockSectors.length === 0 && topPersons.length === 0 && latestNews.length === 0) {
    return null
  }

  return { stockSectors, topPersons, latestNews }
}

export function mapSearchResponse(dto: SearchResponse, query: string): UnifiedSearchResult {
  const news = mapSearchNewsPreviews(dto.news, SEARCH_NEWS_MAX)

  return {
    stocks: (dto.stocks ?? []).map((item) => mapStockResult(item, query)),
    persons: (dto.persons ?? []).map(mapPersonResult),
    news,
    fallback: mapFallbackSections(dto.fallbackSections),
  }
}
