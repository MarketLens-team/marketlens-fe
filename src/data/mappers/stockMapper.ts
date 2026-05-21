import { formatPersonTimelineTime } from '../../lib/formatRelativeTime'
import { truncateText } from '../../lib/truncateText'
import { normalizeStockCodeForMatch } from '../../lib/normalizeStockCode'
import { toFiniteNumber } from '../../lib/toFiniteNumber'
import type { PersonStatementResponse } from '../types/personApi'
import type {
  NewsFeedItemResponse,
  RelatedStocksResponse,
  StockDetailResponse,
  StockSentimentBreakdownResponse,
  StockSentimentTrendResponse,
  StockSummaryResponse,
} from '../types/stockApi'
import type {
  SentimentPolarity,
  StockDetail,
  StockNewsItem,
  StockPriceInfo,
  StockRelatedStock,
  StockSentimentBreakdown,
  StockSentimentBreakdownRow,
  StockSentimentContext,
  StockPersonTimelineItem,
  StockSentimentTrendPoint,
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
      market: item.market,
      sentimentScore: item.sentimentScore,
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
    imageUrl: item.imageUrl || null,
    url: item.originalLink || undefined,
  }))
}

/** `PersonStatementResponse[]` — 종목 연관 발언만 추림 (커서 API 수집 결과) */
function mentionRelatesToStock(row: PersonStatementResponse, targetNormalized: string): boolean {
  const tags = row.relatedStocks ?? []
  if (tags.length === 0) return false
  return tags.some((stock) => {
    const raw = stock.stockCode ?? stock.code ?? ''
    return normalizeStockCodeForMatch(raw) === targetNormalized
  })
}

/** 종목 상세 등 — 발언이 해당 종목과 연관되는지 */
export function personStatementRelatesToStock(row: PersonStatementResponse, stockCode: string): boolean {
  return mentionRelatesToStock(row, normalizeStockCodeForMatch(stockCode))
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
  limit = 8,
): StockPersonTimelineItem[] {
  const target = normalizeStockCodeForMatch(stockCode)
  return mentions
    .filter((row) => mentionRelatesToStock(row, target))
    .slice(0, limit)
    .map((row) => {
      const { label, isFresh } = formatPersonTimelineTime(row.publishedAt)
      return {
        id: String(row.statementId),
        personName: row.personName,
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
