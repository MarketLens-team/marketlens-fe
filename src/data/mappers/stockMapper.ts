import type {
  NewsFeedItemResponse,
  StockDetailResponse,
  StockSentimentBreakdownResponse,
  StockSentimentTrendResponse,
  StockSummaryResponse,
} from '../types/stockApi'
import type {
  SentimentPolarity,
  StockDetail,
  StockNewsItem,
  StockSentimentBreakdown,
  StockSentimentBreakdownRow,
  StockSentimentContext,
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
    score: point.score,
    mentionCount: point.mentionCount,
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

export function mapStockDetailPage(
  detail: StockDetailResponse,
  summary: StockSummaryResponse,
  trend: StockSentimentTrendResponse,
  breakdown: StockSentimentBreakdownResponse,
  news: NewsFeedItemResponse[],
  extras?: Pick<StockDetail, 'relatedStocks' | 'peopleTimeline'>,
): StockDetail {
  const { stock, watchlist } = detail
  const highlightTerms = [stock.name, stock.code]

  const stockSummary: StockSummary = {
    code: stock.code,
    name: stock.name,
    market: stock.market,
    sector: stock.sectorName,
    sentimentScore: summary.score,
    mentionChangePercent: summary.mentionChangeRate,
    buzz24h: summary.mentionCount,
    price: { current: 0, change: 0, changePercent: 0 },
    aiSummary: summary.aiSummary,
  }

  const sentimentContext: StockSentimentContext = {
    current: trend.currentScore,
    avg30d: trend.averageScore30d,
    high30d: trend.maxScore30d,
    summaryNote: trend.contextMessage,
    trend: mapDailyPoints(trend.trend),
  }

  return {
    stock: stockSummary,
    watchlistInterested: watchlist.interested,
    sentimentContext,
    sentimentBreakdown: mapSentimentBreakdown(breakdown),
    recentNews: mapNewsFeedItems(news, highlightTerms),
    relatedStocks: extras?.relatedStocks ?? [],
    peopleTimeline: extras?.peopleTimeline ?? [],
  }
}
