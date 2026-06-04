import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import { STOCK_SENTIMENT_NEUTRAL_BAND } from '../stock/stockScore'
import type { BuzzSurgeItem, DashboardWatchlistRow } from '../../data/types/dashboard'

export type DashboardSignalKind =
  | 'price_drop'
  | 'sentiment_low'
  | 'mention_surge'
  | 'market_buzz'

export const DASHBOARD_SIGNAL_LABEL: Record<DashboardSignalKind, string> = {
  price_drop: '등락 하락',
  sentiment_low: '감성 부정',
  mention_surge: '언급 급증',
  market_buzz: '시장 급등',
}

export type DashboardHeadlineTone = 'up' | 'down' | 'neu'

export interface DashboardAlertItem {
  signal: DashboardSignalKind
  code: string
  name: string
  imageUrl?: string | null
  headline: string
  detail: string
  headlineTone: DashboardHeadlineTone
}

function formatSignedPercent(value: number): string {
  if (value === 0) return '0%'
  return value > 0 ? `+${value}%` : `${value}%`
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

export function pickDashboardAlerts(
  watchlist: DashboardWatchlistRow[],
  buzzTop3: BuzzSurgeItem[],
  limit = 3,
): DashboardAlertItem[] {
  const items: DashboardAlertItem[] = []
  const seen = new Set<string>()
  const watchByCode = new Map(watchlist.map((row) => [row.code, row]))

  const worstDrop = [...watchlist].sort((a, b) => a.changePercent - b.changePercent)[0]
  if (worstDrop && worstDrop.changePercent < 0) {
    pushUnique(items, seen, {
      signal: 'price_drop',
      code: worstDrop.code,
      name: worstDrop.name,
      imageUrl: resolveStockImageUrl(worstDrop.code, worstDrop.imageUrl),
      headline: formatSignedPercent(worstDrop.changePercent),
      detail: `관심 종목 · 감성 ${worstDrop.sentimentScore > 0 ? '+' : ''}${worstDrop.sentimentScore}`,
      headlineTone: 'down',
    })
  }

  const lowSentiment = [...watchlist]
    .filter((row) => row.sentimentScore < -STOCK_SENTIMENT_NEUTRAL_BAND)
    .sort((a, b) => a.sentimentScore - b.sentimentScore)[0]
  if (lowSentiment) {
    pushUnique(items, seen, {
      signal: 'sentiment_low',
      code: lowSentiment.code,
      name: lowSentiment.name,
      imageUrl: resolveStockImageUrl(lowSentiment.code, lowSentiment.imageUrl),
      headline: `${lowSentiment.sentimentScore > 0 ? '+' : ''}${lowSentiment.sentimentScore}`,
      detail: '관심 종목',
      headlineTone: lowSentiment.sentimentScore < 0 ? 'down' : 'neu',
    })
  }

  const topMention = [...watchlist].sort(
    (a, b) => b.mentionSurgePercent - a.mentionSurgePercent,
  )[0]
  if (topMention && topMention.mentionSurgePercent > 0) {
    pushUnique(items, seen, {
      signal: 'mention_surge',
      code: topMention.code,
      name: topMention.name,
      imageUrl: resolveStockImageUrl(topMention.code, topMention.imageUrl),
      headline: formatSignedPercent(topMention.mentionSurgePercent),
      detail: '관심 종목',
      headlineTone: topMention.mentionSurgePercent > 0 ? 'up' : topMention.mentionSurgePercent < 0 ? 'down' : 'neu',
    })
  }

  for (const buzz of buzzTop3) {
    if (items.length >= limit) break
    pushUnique(items, seen, {
      signal: 'market_buzz',
      code: buzz.code,
      name: buzz.name,
      imageUrl: resolveStockImageUrl(
        buzz.code,
        watchByCode.get(buzz.code)?.imageUrl,
      ),
      headline: `+${buzz.surgePercent}%`,
      detail: `시장 · TOP ${buzz.rank}`,
      headlineTone: 'up',
    })
  }

  return items.slice(0, limit)
}
