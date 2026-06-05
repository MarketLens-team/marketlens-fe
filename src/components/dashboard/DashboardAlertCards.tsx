import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { resolveStockImageUrl } from '../../lib/normalizeImageUrl'
import { buildAlertSummaryTarget } from './buildDashboardSummaryTarget'
import { DASHBOARD_ALERT_SCOPE_LABEL, pickDashboardAlerts } from './pickDashboardAlerts'
import type { DashboardAlertItem, DashboardSignalKind } from './pickDashboardAlerts'
import type { DashboardWatchlistRow, SectorHeatmapCell } from '../../data/types/dashboard'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { DashboardAnomalySummaryController } from './useDashboardAnomalySummary'
import styles from './DashboardAlertCards.module.css'

interface DashboardAlertCardsProps {
  watchlist: DashboardWatchlistRow[]
  marketOutlierRows: DashboardWatchlistRow[]
  sectorHeatmap: SectorHeatmapCell[]
  isLoggedIn: boolean
  anomalySummary: DashboardAnomalySummaryController
}

const HEADLINE_TONE_CLASS = {
  up: styles.headlineUp,
  down: styles.headlineDown,
  neu: styles.headlineNeu,
} as const

const CRITERION_TONE_CLASS: Record<DashboardSignalKind, string | undefined> = {
  price_drop: styles.criterionDown,
  sentiment_low: styles.criterionDown,
  price_rise: styles.criterionUp,
  sentiment_high: styles.criterionUp,
  news_peak: undefined,
  sector_sentiment_low: styles.criterionDown,
}

function bindHoverSummary(
  alert: DashboardAlertItem,
  summary: DashboardAnomalySummaryController,
) {
  if (!alert.summaryEnabled) return {}
  return {
    onMouseEnter: () => summary.scheduleOpen(buildAlertSummaryTarget(alert)),
    onMouseLeave: () => summary.scheduleClose(),
    onFocus: () => summary.scheduleOpen(buildAlertSummaryTarget(alert)),
    onBlur: () => summary.scheduleClose(),
  }
}

export function DashboardAlertCards({
  watchlist,
  marketOutlierRows,
  sectorHeatmap,
  isLoggedIn,
  anomalySummary,
}: DashboardAlertCardsProps) {
  const alerts =
    isLoggedIn && watchlist.length > 0
      ? pickDashboardAlerts(watchlist, sectorHeatmap)
      : pickDashboardAlerts(marketOutlierRows, sectorHeatmap, 3, 'market')

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader
        title="오늘 이상치"
        subtitle={isLoggedIn ? '관심·시장' : '시장'}
        variant="embedded"
      />
      {alerts.length === 0 ? (
        <p className={styles.empty}>표시할 이상치가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li key={`${alert.signal}-${alert.code}`}>
              <Link
                to={alert.to}
                className={styles.item}
                aria-label={`${alert.name} ${DASHBOARD_ALERT_SCOPE_LABEL[alert.scope]} ${alert.criterion} ${alert.headline}`}
                {...bindHoverSummary(alert, anomalySummary)}
              >
                {alert.targetKind === 'stock' ? (
                  <EntityAvatar
                    variant="stock"
                    size="md"
                    name={alert.name}
                    imageUrl={resolveStockImageUrl(alert.code, alert.imageUrl)}
                    className={styles.lead}
                  />
                ) : (
                  <span className={clsx(styles.sectorMark, styles.lead)} aria-hidden>
                    {alert.name.slice(0, 1)}
                  </span>
                )}
                <span className={styles.identity}>
                  <span className={styles.name}>{alert.name}</span>
                  <span className={styles.meta}>
                    <span
                      className={clsx(
                        styles.scopePill,
                        alert.scope === 'market' && styles.scopeMarket,
                      )}
                    >
                      {DASHBOARD_ALERT_SCOPE_LABEL[alert.scope]}
                    </span>
                    <span
                      className={clsx(styles.criterionPill, CRITERION_TONE_CLASS[alert.signal])}
                    >
                      {alert.criterion}
                    </span>
                  </span>
                </span>
                <span className={clsx(styles.headline, HEADLINE_TONE_CLASS[alert.headlineTone])}>
                  {alert.headline}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
