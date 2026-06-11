import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import { formatStockScore, STOCK_SENTIMENT_NEUTRAL_BAND } from '../stock/stockScore'
import type { DashboardWatchlistRow } from '../../data/types/dashboard'

export type DashboardSignalKind =
  | 'price_drop'
  | 'sentiment_low'
  | 'price_rise'
  | 'sentiment_high'
  | 'news_peak'

/** 호버 AI 모달·접근성용 한 줄 라벨 */
export const DASHBOARD_SIGNAL_LABEL: Record<DashboardSignalKind, string> = {
  price_drop: '등락 주의',
  sentiment_low: '감성 부정',
  price_rise: '등락 주목',
  sentiment_high: '감성 긍정',
  news_peak: '뉴스 집중',
}

export const DASHBOARD_ALERT_SCOPE_LABEL = {
  watchlist: '관심',
  market: '시장',
} as const

export type DashboardAlertScope = keyof typeof DASHBOARD_ALERT_SCOPE_LABEL

export type DashboardAlertTargetKind = 'stock'

/** 카드에 표시할 선정 기준 (큰 숫자와 분리) */
export const DASHBOARD_ALERT_CRITERION: Record<DashboardSignalKind, string> = {
  price_drop: '등락 최저',
  sentiment_low: '감성 최저',
  price_rise: '등락 최고',
  sentiment_high: '감성 최고',
  news_peak: '뉴스 최다',
}

export type DashboardHeadlineTone = 'up' | 'down' | 'neu'

export interface DashboardAlertItem {
  signal: DashboardSignalKind
  scope: DashboardAlertScope
  targetKind: DashboardAlertTargetKind
  to: string
  criterion: string
  code: string
  name: string
  imageUrl?: string | null
  headline: string
  headlineTone: DashboardHeadlineTone
  /** 종목 카드만 AI 요약 호버 */
  summaryEnabled: boolean
}

function formatSignedPercent(value: number): string {
  if (value === 0) return '0%'
  return value > 0 ? `+${value}%` : `${value}%`
}

function formatNewsCount(value: number): string {
  return `${value.toLocaleString('ko-KR')}건`
}

function pushUnique(
  items: DashboardAlertItem[],
  seen: Set<string>,
  item: DashboardAlertItem,
): void {
  if (seen.has(item.code)) return
  seen.add(item.code)
  items.push(item)
}

function stockAlert(
  row: DashboardWatchlistRow,
  input: Omit<
    DashboardAlertItem,
    'scope' | 'targetKind' | 'to' | 'summaryEnabled' | 'code' | 'name' | 'imageUrl'
  >,
  scope: DashboardAlertScope,
): DashboardAlertItem {
  return {
    ...input,
    scope,
    targetKind: 'stock',
    to: `/stock/${row.code}`,
    summaryEnabled: true,
    code: row.code,
    name: row.name,
    imageUrl: resolveStockImageUrl(row.code, row.imageUrl),
  }
}

export function pickDashboardAlerts(
  watchlist: DashboardWatchlistRow[],
  limit = 3,
  stockScope: DashboardAlertScope = 'watchlist',
): DashboardAlertItem[] {
  const items: DashboardAlertItem[] = []
  const seen = new Set<string>()

  const worstDrop = [...watchlist].sort((a, b) => a.changePercent - b.changePercent)[0]
  if (worstDrop && worstDrop.changePercent < 0) {
    pushUnique(
      items,
      seen,
      stockAlert(worstDrop, {
        signal: 'price_drop',
        criterion: DASHBOARD_ALERT_CRITERION.price_drop,
        headline: formatSignedPercent(worstDrop.changePercent),
        headlineTone: 'down',
      }, stockScope),
    )
  }

  const lowSentiment = [...watchlist]
    .filter((row) => row.sentimentScore < -STOCK_SENTIMENT_NEUTRAL_BAND)
    .sort((a, b) => a.sentimentScore - b.sentimentScore)[0]
  if (lowSentiment) {
    pushUnique(
      items,
      seen,
      stockAlert(lowSentiment, {
        signal: 'sentiment_low',
        criterion: DASHBOARD_ALERT_CRITERION.sentiment_low,
        headline: formatStockScore(lowSentiment.sentimentScore),
        headlineTone: 'down',
      }, stockScope),
    )
  }

  const bestRise = [...watchlist]
    .filter((row) => row.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)[0]
  if (bestRise) {
    pushUnique(
      items,
      seen,
      stockAlert(bestRise, {
        signal: 'price_rise',
        criterion: DASHBOARD_ALERT_CRITERION.price_rise,
        headline: formatSignedPercent(bestRise.changePercent),
        headlineTone: 'up',
      }, stockScope),
    )
  }

  const highSentiment = [...watchlist]
    .filter((row) => row.sentimentScore > STOCK_SENTIMENT_NEUTRAL_BAND)
    .sort((a, b) => b.sentimentScore - a.sentimentScore)[0]
  if (highSentiment && items.length < limit) {
    pushUnique(
      items,
      seen,
      stockAlert(highSentiment, {
        signal: 'sentiment_high',
        criterion: DASHBOARD_ALERT_CRITERION.sentiment_high,
        headline: formatStockScore(highSentiment.sentimentScore),
        headlineTone: 'up',
      }, stockScope),
    )
  }

  const topNews = [...watchlist]
    .filter((row) => row.newsCount > 0)
    .sort((a, b) => b.newsCount - a.newsCount)[0]
  if (topNews && items.length < limit) {
    pushUnique(
      items,
      seen,
      stockAlert(topNews, {
        signal: 'news_peak',
        criterion: DASHBOARD_ALERT_CRITERION.news_peak,
        headline: formatNewsCount(topNews.newsCount),
        headlineTone: 'neu',
      }, stockScope),
    )
  }

  const topMentionSurge = [...watchlist]
    .filter((row) => row.mentionSurgePercent > 0)
    .sort((a, b) => b.mentionSurgePercent - a.mentionSurgePercent)[0]
  if (topMentionSurge && items.length < limit && stockScope === 'market') {
    pushUnique(
      items,
      seen,
      stockAlert(topMentionSurge, {
        signal: 'news_peak',
        criterion: '언급 급증',
        headline: formatSignedPercent(topMentionSurge.mentionSurgePercent),
        headlineTone: 'up',
      }, stockScope),
    )
  }

  return items.slice(0, limit)
}

/** 관심 종목 우선 선정 후, 남는 슬롯을 시장 종목 풀로 채움 */
export function pickDashboardAlertsWithMarketBackfill(
  watchlist: DashboardWatchlistRow[],
  marketRows: DashboardWatchlistRow[],
  limit = 3,
): DashboardAlertItem[] {
  const primary = pickDashboardAlerts(watchlist, limit, 'watchlist')
  if (primary.length >= limit) return primary

  const seen = new Set(primary.map((alert) => alert.code))
  const backfillPool = marketRows.filter((row) => !seen.has(row.code))
  const backfill = pickDashboardAlerts(backfillPool, limit - primary.length, 'market')
  return [...primary, ...backfill]
}
