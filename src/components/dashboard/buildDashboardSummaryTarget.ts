import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import type { BuzzSurgeItem, DashboardWatchlistRow } from '../../data/types/dashboard'
import { formatPercent, priceChangeDirection } from '../stock/stockScore'
import {
  DASHBOARD_SIGNAL_LABEL,
  type DashboardAlertItem,
  type DashboardHeadlineTone,
} from './pickDashboardAlerts'
import type { OpenAnomalySummary } from './useDashboardAnomalySummary'

export function buildAlertSummaryTarget(alert: DashboardAlertItem): OpenAnomalySummary {
  return {
    code: alert.code,
    name: alert.name,
    imageUrl: resolveStockImageUrl(alert.code, alert.imageUrl),
    signalLabel: DASHBOARD_SIGNAL_LABEL[alert.signal],
    headline: alert.headline,
    headlineTone: alert.headlineTone,
  }
}

export function buildBuzzSurgeSummaryTarget(item: BuzzSurgeItem): OpenAnomalySummary {
  return {
    code: item.code,
    name: item.name,
    imageUrl: resolveStockImageUrl(item.code, null),
    signalLabel: '언급 급증',
    headline: `+${item.surgePercent}%`,
    headlineTone: 'up',
  }
}

export function buildWatchlistSummaryTarget(row: DashboardWatchlistRow): OpenAnomalySummary {
  const hasPrice = row.price > 0
  const dir = priceChangeDirection(row.changePercent)
  const headlineTone: DashboardHeadlineTone =
    dir === 'up' ? 'up' : dir === 'down' ? 'down' : 'neu'

  return {
    code: row.code,
    name: row.name,
    imageUrl: resolveStockImageUrl(row.code, row.imageUrl),
    signalLabel: '관심 종목',
    headline: hasPrice ? formatPercent(row.changePercent) : '—',
    headlineTone,
  }
}
