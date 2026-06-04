import { normalizeImageUrl } from '../../lib/normalizeImageUrl'
import { toFiniteNumber } from '../../lib/toFiniteNumber'
import type {
  BuzzSurgeItem,
  DashboardBriefing,
  DashboardOverview,
  DashboardWatchlistRow,
  SectorHeatmapCell,
  SentimentGaugeBlock,
  StockHighlight,
} from '../types/dashboard'
import type { TickerStockRow } from '../types/stock'
import type { StockSummaryResponse } from '../types/stockApi'
import type { WatchlistResponse } from '../types/memberApi'
import type { DashboardBriefingResponse, DashboardOverviewResponse } from '../types/dashboardApi'

const GAUGE_MIN = -100
const GAUGE_MAX = 100

const EMPTY_SENTIMENT_BLOCK: DashboardOverviewResponse['portfolio'] = {
  avgScore: 0,
  positiveCount: 0,
  neutralCount: 0,
  negativeCount: 0,
  totalCount: 0,
}

function countsToDistribution(positive: number, neutral: number, negative: number) {
  const total = positive + neutral + negative
  if (total <= 0) return { positive: 0, neutral: 0, negative: 0 }
  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  }
}

function mapSentimentGauge(block: DashboardOverviewResponse['portfolio']): SentimentGaugeBlock {
  return {
    score: toFiniteNumber(block.avgScore),
    min: GAUGE_MIN,
    max: GAUGE_MAX,
    distribution: countsToDistribution(
      block.positiveCount,
      block.neutralCount,
      block.negativeCount,
    ),
  }
}

function mapBuzzTop3(items: DashboardOverviewResponse['buzzTop3'] | null | undefined): BuzzSurgeItem[] {
  return (items ?? []).map((item, index) => ({
    rank: index + 1,
    code: item.stockCode,
    name: item.stockName,
    surgePercent: Math.round(toFiniteNumber(item.changeRate)),
  }))
}

function mapSectorHeatmap(
  items: DashboardOverviewResponse['sectorHeatmap'] | null | undefined,
): SectorHeatmapCell[] {
  return (items ?? []).map((item) => ({
    name: item.sectorName,
    sentimentScore: Math.round(toFiniteNumber(item.avgScore)),
    mentionCount: toFiniteNumber(item.newsCount),
  }))
}

function mapHotStatementsToHighlights(
  statements: DashboardOverviewResponse['hotStatements'] | null | undefined,
): StockHighlight[] {
  return (statements ?? []).slice(0, 3).map((row) => {
    const score = toFiniteNumber(row.sentimentScore)
    return {
      name: row.personName,
      metricLabel: '감성',
      metricValue: score > 0 ? `+${score}` : String(score),
      tone: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
    }
  })
}

export function mapDashboardWatchlistRow(
  item: WatchlistResponse,
  summary?: StockSummaryResponse | null,
  priceRow?: TickerStockRow | null,
): DashboardWatchlistRow {
  const sentimentScore = toFiniteNumber(summary?.score)
  const mentionSurgePercent = toFiniteNumber(summary?.mentionChangeRate)
  return {
    name: item.stockName,
    code: item.stockCode,
    imageUrl: normalizeImageUrl(item.imageUrl),
    price: toFiniteNumber(priceRow?.price),
    changePercent: toFiniteNumber(priceRow?.changePercent),
    sentimentScore,
    newsCount: toFiniteNumber(summary?.mentionCount),
    mentionSurgePercent,
  }
}

export function mapDashboardBriefing(raw: DashboardBriefingResponse): DashboardBriefing {
  const todaySummary = raw.todaySummary?.trim() ?? null
  return {
    todaySummary: todaySummary || null,
    updatedAt: raw.updatedAt ?? null,
  }
}

export function mapDashboardOverview(
  overview: DashboardOverviewResponse,
  watchlistRows: DashboardWatchlistRow[],
): DashboardOverview {
  return {
    portfolioSentiment: mapSentimentGauge(overview.portfolio ?? EMPTY_SENTIMENT_BLOCK),
    stocksToWatch: mapHotStatementsToHighlights(overview.hotStatements),
    watchlist: watchlistRows,
    kospiSentiment: mapSentimentGauge(overview.marketSentiment ?? overview.portfolio ?? EMPTY_SENTIMENT_BLOCK),
    buzzSurgeTop3: mapBuzzTop3(overview.buzzTop3),
    sectorHeatmap: mapSectorHeatmap(overview.sectorHeatmap),
  }
}
