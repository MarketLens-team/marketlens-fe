import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { BuzzSurgeItem } from '../../data/types/dashboard'
import { buildBuzzSurgeSummaryTarget } from './buildDashboardSummaryTarget'
import { DashboardAnomalySummaryModal } from './DashboardAnomalySummaryModal'
import { useDashboardAnomalySummary } from './useDashboardAnomalySummary'
import styles from './BuzzSurgeTop3.module.css'

interface BuzzSurgeTop3Props {
  items: BuzzSurgeItem[]
  className?: string
}

function bindHoverSummary(
  item: BuzzSurgeItem,
  summary: ReturnType<typeof useDashboardAnomalySummary>,
) {
  const target = buildBuzzSurgeSummaryTarget(item)
  return {
    onMouseEnter: () => summary.scheduleOpen(target),
    onMouseLeave: () => summary.scheduleClose(),
    onFocus: () => summary.scheduleOpen(target),
    onBlur: () => summary.scheduleClose(),
  }
}

export function BuzzSurgeTop3({ items, className }: BuzzSurgeTop3Props) {
  const summaryModal = useDashboardAnomalySummary()

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader
        title="언급량 급증 TOP 3"
        subtitle="전일 대비 뉴스 언급 급등"
        variant="embedded"
      />
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.rank}>
            <Link
              to={`/stock/${item.code}`}
              className={styles.item}
              aria-label={`${item.name} 종목 상세 보기`}
              {...bindHoverSummary(item, summaryModal)}
            >
              <span className={styles.rank}>{item.rank}</span>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.surge}>+{item.surgePercent}%</span>
            </Link>
          </li>
        ))}
      </ol>

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
