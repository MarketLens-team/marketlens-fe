import { formatPersonTimelineTime } from '../../lib/formatRelativeTime'
import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import { truncateText } from '../../lib/truncateText'
import { personStatementRelatesToStock as rowRelatesToStock } from '../../lib/personStatementStockMatch'
import { toFiniteNumber } from '../../lib/toFiniteNumber'

export { personStatementRelatesToStock } from '../../lib/personStatementStockMatch'
import type { PersonStatementResponse } from '../types/personApi'
import type {
  NewsFeedItemResponse,
  RelatedStocksResponse,
  StockDetailResponse,
  StockOverviewItemResponse,
  StockOverviewResponse,
  StockPricesResponse,
  StockRankingItemResponse,
  StockRankingsResponse,
  StockSentimentBreakdownResponse,
  StockSentimentTrendResponse,
  StockSummaryResponse,
} from '../types/stockApi'
import type { StockDirectory } from '../types/stockDirectory'
import type {
  NewsRelatedStock,
  SentimentPolarity,
  StockDetail,
  StockMarketRow,
  StockOverview,
  StockOverviewRow,
  StockRankingItem,
  StockRankings,
  StockNewsItem,
  StockPriceInfo,
  StockRelatedStock,
  StockSentimentBreakdown,
  StockSentimentBreakdownRow,
  StockSentimentContext,
  StockPersonTimelineItem,
  StockSentimentTrendPoint,
  TickerStockRow,
  StockSummary,
} from '../types/stock'

function parseSentimentPolarity(sentiment: string): SentimentPolarity {
  const normalized = sentiment.trim().toLowerCase()
  if (normalized === 'positive' || normalized.includes('긍정')) return 'positive'
  if (normalized === 'negative' || normalized.includes('부정')) return 'negative'
  return 'neutral'
}

function normalizeRecordedAt(recordedAt: string): string {
  if (recordedAt.includes('T')) return recordedAt
  return `${recordedAt}T00:00:00.000Z`
}

export function mapDailyPoints(trend: StockSentimentTrendResponse['trend']): StockSentimentTrendPoint[] {
  return trend.map((point) => ({
    recordedAt: normalizeRecordedAt(point.recordedAt),
    score: toFiniteNumber(point.score),
    mentionCount: toFiniteNumber(point.mentionCount),
  }))
}

export function mapSentimentBreakdown(
  breakdown: StockSentimentBreakdownResponse,
): StockSentimentBreakdown {
  const rows: StockSentimentBreakdownRow[] = [
    {
      polarity: 'positive',
      label: '긍정',
      count: breakdown.positive.count,
      avgScore: breakdown.totalAverageScore,
      percent: breakdown.positive.ratio,
    },
    {
      polarity: 'neutral',
      label: '중립',
      count: breakdown.neutral.count,
      avgScore: breakdown.totalAverageScore,
      percent: breakdown.neutral.ratio,
    },
    {
      polarity: 'negative',
      label: '부정',
      count: breakdown.negative.count,
      avgScore: breakdown.totalAverageScore,
      percent: breakdown.negative.ratio,
    },
  ]

  return {
    rows,
    totalCount: breakdown.totalCount,
    finalScore: breakdown.totalAverageScore,
  }
}

export function mapRelatedStocks(
  response: RelatedStocksResponse,
  currentCode?: string,
): StockRelatedStock[] {
  const exclude = currentCode?.trim()
  return response.stocks
    .filter((item) => !exclude || item.code !== exclude)
    .map((item) => ({
      code: item.code,
      name: item.name,
      imageUrl: normalizeImageUrl(item.imageUrl),
      market: item.market,
      sentimentScore: item.sentimentScore,
    }))
}

/** 연관 종목 코드에 `GET /api/v1/stocks/prices` 시세 병합 */
export function enrichRelatedStocksWithPrices(
  stocks: StockRelatedStock[],
  tickerRows: TickerStockRow[],
): StockRelatedStock[] {
  const priceByCode = new Map(tickerRows.map((row) => [row.code, row]))
  return stocks.map((stock) => {
    const row = priceByCode.get(stock.code)
    if (!row || row.price <= 0) return stock
    return {
      ...stock,
      price: mapStockPriceInfo(row.price, row.changePercent),
    }
  })
}

function mapNewsRelatedStocks(
  rows: NewsFeedItemResponse['relatedStocks'],
): NewsRelatedStock[] | undefined {
  if (!rows?.length) return undefined
  return rows.map((row) => ({
    stockCode: row.stockCode,
    stockName: row.stockName,
    imageUrl: normalizeImageUrl(row.imageUrl),
    relevanceScore: row.relevanceScore,
  }))
}

export function mapNewsFeedItems(
  items: NewsFeedItemResponse[],
  highlightTerms?: string[],
): StockNewsItem[] {
  return items.map((item) => ({
    id: String(item.id),
    title: item.title,
    description: item.description || undefined,
    source: item.source,
    publishedAt: item.publishedAt,
    sentiment: parseSentimentPolarity(item.sentiment),
    sentimentScore: item.sentimentScore,
    aiReason: '',
    highlightTerms,
    imageUrl: normalizeImageUrl(item.imageUrl),
    url: item.originalLink || undefined,
    relatedStocks: mapNewsRelatedStocks(item.relatedStocks),
  }))
}

/** OpenAPI `StockInfo.currentPrice` / `changeRate` → UI `StockPriceInfo` */
export function mapStockPriceInfo(
  currentPrice: number | undefined,
  changeRate: number | undefined,
): StockPriceInfo {
  const current = toFiniteNumber(currentPrice)
  const changePercent = toFiniteNumber(changeRate)
  if (current <= 0) {
    return { current: 0, change: 0, changePercent: 0 }
  }
  const change =
    changePercent === 0 ? 0 : Math.round((current * changePercent) / (100 + changePercent))
  return { current, change, changePercent }
}

/** 종목 상세 사이드 타임라인 — 한 줄에 너무 길지 않게 */
const STOCK_PERSON_SUMMARY_MAX_LEN = 140

export function mapStockPeopleTimeline(
  mentions: PersonStatementResponse[],
  stockCode: string,
  limit = 5,
): StockPersonTimelineItem[] {
  return mentions
    .filter((row) => rowRelatesToStock(row, stockCode))
    .slice(0, limit)
    .map((row) => {
      const { label, isFresh } = formatPersonTimelineTime(row.publishedAt)
      return {
        id: String(row.statementId),
        personId: String(row.personId),
        personName: row.personName,
        imageUrl: normalizeImageUrl(row.imageUrl),
        role: [row.personRole, row.organizationName].filter(Boolean).join(' · ') || '—',
        summary: truncateText(row.statementSummary?.trim() || '—', STOCK_PERSON_SUMMARY_MAX_LEN),
        sourceName: row.sourceName?.trim() || '—',
        publishedAt: row.publishedAt,
        relativeLabel: label,
        isFresh,
        sentimentScore: toFiniteNumber(row.score),
      }
    })
}

export function mapStockDetailPage(
  detail: StockDetailResponse,
  summary: StockSummaryResponse,
  trend: StockSentimentTrendResponse,
  breakdown: StockSentimentBreakdownResponse,
  news: NewsFeedItemResponse[],
  newsPagination: { nextCursor?: string | null; hasNext?: boolean },
  extras?: Partial<Pick<StockDetail, 'relatedStocks' | 'peopleTimeline'>>,
): StockDetail {
  const { stock, watchlist } = detail
  const highlightTerms = [stock.name, stock.code]

  const stockSummary: StockSummary = {
    code: stock.code,
    name: stock.name,
    imageUrl: normalizeImageUrl(stock.imageUrl),
    market: stock.market,
    sector: stock.sectorName,
    sentimentScore: toFiniteNumber(summary.score),
    mentionChangePercent: toFiniteNumber(summary.mentionChangeRate),
    buzz24h: toFiniteNumber(summary.mentionCount),
    price: mapStockPriceInfo(stock.currentPrice, stock.changeRate),
    aiSummary: summary.aiSummary ?? '',
  }

  const sentimentContext: StockSentimentContext = {
    current: toFiniteNumber(trend.currentScore),
    avg30d: toFiniteNumber(trend.averageScore30d),
    high30d: toFiniteNumber(trend.maxScore30d),
    summaryNote: trend.contextMessage ?? '',
    trend: mapDailyPoints(trend.trend),
  }

  return {
    stock: stockSummary,
    watchlistInterested: watchlist.interested,
    sentimentContext,
    sentimentBreakdown: mapSentimentBreakdown(breakdown),
    recentNews: mapNewsFeedItems(news, highlightTerms),
    newsPagination: {
      nextCursor: newsPagination.nextCursor ?? null,
      hasNext: newsPagination.hasNext ?? false,
    },
    relatedStocks: extras?.relatedStocks ?? [],
    peopleTimeline: extras?.peopleTimeline ?? [],
  }
}

function mapOverviewItem(item: StockOverviewItemResponse): StockOverviewRow {
  return {
    code: item.stockCode,
    name: item.stockName,
    market: item.market ?? '—',
    sectorCode: item.sectorCode ?? '',
    sectorName: item.sectorName ?? '—',
    imageUrl: normalizeImageUrl(item.imageUrl) ?? null,
    price: toFiniteNumber(item.currentPrice),
    changePercent: toFiniteNumber(item.changeRate),
    mentionCount24h: toFiniteNumber(item.mentionCount24h),
    mentionChangeRate24h: toFiniteNumber(item.mentionChangeRate24h),
    sentimentScore24h: toFiniteNumber(item.sentimentScore24h),
  }
}

function mapRankingItem(item: StockRankingItemResponse): StockRankingItem {
  return {
    code: item.stockCode,
    name: item.stockName,
    imageUrl: normalizeImageUrl(item.imageUrl) ?? null,
    price: toFiniteNumber(item.currentPrice),
    changePercent: toFiniteNumber(item.changeRate),
    mentionCount24h: toFiniteNumber(item.mentionCount24h),
    mentionChangeRate24h: toFiniteNumber(item.mentionChangeRate24h),
    sentimentScore24h: toFiniteNumber(item.sentimentScore24h),
  }
}

/** `GET /api/v1/stocks/overview` */
export function mapStockOverviewResponse(response: StockOverviewResponse): StockOverview {
  const stocks = (response.stocks ?? []).map(mapOverviewItem)
  const summedMentions = stocks.reduce((sum, row) => sum + row.mentionCount24h, 0)
  const currentNewsCount =
    response.currentNewsCount > 0 ? response.currentNewsCount : summedMentions

  return {
    currentNewsCount,
    stocks,
  }
}

/** `GET /api/v1/stocks/rankings` */
export function mapStockRankingsResponse(response: StockRankingsResponse): StockRankings {
  return {
    topMentionCount: (response.topMentionCount ?? []).map(mapRankingItem),
    topSentimentScore: (response.topSentimentScore ?? []).map(mapRankingItem),
    topChangeRate: (response.topChangeRate ?? []).map(mapRankingItem),
    topCurrentPrice: (response.topCurrentPrice ?? []).map(mapRankingItem),
  }
}

/** directory + `GET /api/v1/stocks/prices` → 전체 종목 시세 테이블 */
export function mapDirectoryToStockMarketRows(
  directory: StockDirectory,
  prices: StockPricesResponse,
): StockMarketRow[] {
  const priceByCode = new Map(prices.items.map((item) => [item.stockCode, item]))
  const rows: StockMarketRow[] = []

  for (const sector of directory.sectors) {
    for (const stock of sector.stocks) {
      const item = priceByCode.get(stock.code)
      rows.push({
        code: stock.code,
        name: item?.stockName ?? stock.name,
        market: item?.market ?? stock.market ?? '—',
        sectorName: sector.sectorName,
        imageUrl: normalizeImageUrl(item?.imageUrl) ?? null,
        price: toFiniteNumber(item?.currentPrice),
        changePercent: toFiniteNumber(item?.changeRate),
      })
    }
  }

  const knownCodes = new Set(rows.map((row) => row.code))
  for (const item of prices.items) {
    if (knownCodes.has(item.stockCode)) continue
    rows.push({
      code: item.stockCode,
      name: item.stockName,
      market: item.market ?? '—',
      sectorName: '—',
      imageUrl: normalizeImageUrl(item.imageUrl) ?? null,
      price: toFiniteNumber(item.currentPrice),
      changePercent: toFiniteNumber(item.changeRate),
    })
  }

  return rows
}

/** `GET /api/v1/stocks/prices` → TickerBar 행 (지정 코드 순서 유지) */
export function mapStockPricesToTickerRows(
  response: StockPricesResponse,
  orderedCodes: readonly string[],
): TickerStockRow[] {
  const byCode = new Map(response.items.map((item) => [item.stockCode, item]))
  return orderedCodes.flatMap((code) => {
    const item = byCode.get(code)
    if (!item) return []
    const price = toFiniteNumber(item.currentPrice)
    if (price <= 0) return []
    return [
      {
        id: item.stockCode,
        code: item.stockCode,
        name: item.stockName,
        price,
        changePercent: toFiniteNumber(item.changeRate),
      },
    ]
  })
}
