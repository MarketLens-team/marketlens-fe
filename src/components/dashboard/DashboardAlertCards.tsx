import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { buildAlertSummaryTarget } from './buildDashboardSummaryTarget'
import { DASHBOARD_SIGNAL_LABEL, pickDashboardAlerts } from './pickDashboardAlerts'
import type { DashboardAlertItem } from './pickDashboardAlerts'
import type { BuzzSurgeItem, DashboardWatchlistRow } from '../../data/types/dashboard'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { DashboardAnomalySummaryModal } from './DashboardAnomalySummaryModal'
import { useDashboardAnomalySummary } from './useDashboardAnomalySummary'
import styles from './DashboardAlertCards.module.css'

interface DashboardAlertCardsProps {
  watchlist: DashboardWatchlistRow[]
  buzzTop3: BuzzSurgeItem[]
  isLoggedIn: boolean
}

const HEADLINE_TONE_CLASS = {
  up: styles.headlineUp,
  down: styles.headlineDown,
  neu: styles.headlineNeu,
} as const

function bindHoverSummary(
  alert: DashboardAlertItem,
  summary: ReturnType<typeof useDashboardAnomalySummary>,
) {
  return {
    onMouseEnter: () => summary.scheduleOpen(buildAlertSummaryTarget(alert)),
    onMouseLeave: () => summary.scheduleClose(),
    onFocus: () => summary.scheduleOpen(buildAlertSummaryTarget(alert)),
    onBlur: () => summary.scheduleClose(),
  }
}

export function DashboardAlertCards({ watchlist, buzzTop3, isLoggedIn }: DashboardAlertCardsProps) {
  const alerts = isLoggedIn && watchlist.length > 0
    ? pickDashboardAlerts(watchlist, buzzTop3)
    : pickDashboardAlerts([], buzzTop3)

  const summaryModal = useDashboardAnomalySummary()

  return (
    <Card padding="md" className={styles.card}>
      <CardSectionHeader title="오늘 이상치" subtitle="관심·시장" variant="embedded" />
      {alerts.length === 0 ? (
        <p className={styles.empty}>표시할 이상치가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li key={`${alert.signal}-${alert.code}`}>
              <Link
                to={`/stock/${alert.code}`}
                className={styles.item}
                aria-label={`${alert.name} 종목 상세 보기`}
                {...bindHoverSummary(alert, summaryModal)}
              >
                <span className={styles.signal}>{DASHBOARD_SIGNAL_LABEL[alert.signal]}</span>
                <span className={styles.body}>
                  <span className={styles.name}>{alert.name}</span>
                  <span className={styles.detail}>{alert.detail}</span>
                </span>
                <span className={clsx(styles.headline, HEADLINE_TONE_CLASS[alert.headlineTone])}>
                  {alert.headline}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <DashboardAnomalySummaryModal
        target={summaryModal.target}
        status={summaryModal.status}
        summaryText={summaryModal.summaryText}
        isOpen={summaryModal.isOpen}
        onClose={summaryModal.close}
        onHoverPaneEnter={summaryModal.cancelClose}
        onHoverPaneLeave={summaryModal.scheduleModalLeave}
      />
    </Card>
  )
}
