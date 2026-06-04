import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DashboardWatchlistRow } from '../../data/types/dashboard'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EntityAvatar } from '../ui/EntityAvatar'
import { PillButton } from '../ui/PillButton'
import { formatPercent, priceChangeDirection } from '../stock/stockScore'
import { buildWatchlistSummaryTarget } from './buildDashboardSummaryTarget'
import { DashboardAnomalySummaryModal } from './DashboardAnomalySummaryModal'
import { DashboardLoginPrompt } from './DashboardLoginPrompt'
import { DashboardWatchlistTable } from './DashboardWatchlistTable'
import { useDashboardAnomalySummary } from './useDashboardAnomalySummary'
import { useAuthStore } from '../../store/authStore'
import styles from './DashboardWatchlistSection.module.css'

type WatchlistView = 'tiles' | 'list'

interface DashboardWatchlistSectionProps {
  rows: DashboardWatchlistRow[]
}

function bindTileHoverSummary(
  row: DashboardWatchlistRow,
  summary: ReturnType<typeof useDashboardAnomalySummary>,
) {
  const target = buildWatchlistSummaryTarget(row)
  return {
    onMouseEnter: () => summary.scheduleOpen(target),
    onMouseLeave: () => summary.scheduleClose(),
    onFocus: () => summary.scheduleOpen(target),
    onBlur: () => summary.scheduleClose(),
  }
}

export function DashboardWatchlistSection({ rows }: DashboardWatchlistSectionProps) {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [view, setView] = useState<WatchlistView>('tiles')
  const summaryModal = useDashboardAnomalySummary()

  const goToStock = (code: string) => {
    navigate(`/stock/${code}`)
  }

  const showViewToggle = isLoggedIn && rows.length > 0

  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.headRow}>
        <CardSectionHeader title="관심 종목 한눈에" variant="embedded" className={styles.title} />
        {showViewToggle ? (
          <PillButton
            variant="secondary"
            compact
            className={styles.viewToggle}
            aria-label={view === 'tiles' ? '리스트 보기로 전환' : '카드 보기로 전환'}
            onClick={() => setView((current) => (current === 'tiles' ? 'list' : 'tiles'))}
          >
            {view === 'tiles' ? '리스트' : '카드'}
          </PillButton>
        ) : null}
      </div>

      {!isLoggedIn ? (
        <DashboardLoginPrompt
          className={styles.loginPrompt}
          title="로그인이 필요해요"
          message="로그인하면 관심 종목을 확인할 수 있어요."
        />
      ) : null}

      {isLoggedIn && rows.length === 0 ? (
        <p className={styles.empty}>관심종목이 없습니다. 종목 상세에서 추가해 보세요.</p>
      ) : null}

      {isLoggedIn && rows.length > 0 && view === 'tiles' ? (
        <div className={styles.scroll}>
          <ul className={styles.tileList}>
            {rows.map((row) => {
              const priceDirection = priceChangeDirection(row.changePercent)
              const hasPrice = row.price > 0
              return (
                <li key={row.code}>
                  <button
                    type="button"
                    className={styles.tile}
                    onClick={() => goToStock(row.code)}
                    aria-label={`${row.name} 종목 상세 보기`}
                    {...bindTileHoverSummary(row, summaryModal)}
                  >
                    <EntityAvatar
                      variant="stock"
                      size="md"
                      name={row.name}
                      imageUrl={row.imageUrl}
                    />
                    <span className={styles.tileName}>{row.name}</span>
                    <span
                      className={clsx(
                        styles.tileChange,
                        hasPrice && priceDirection === 'up' && styles.up,
                        hasPrice && priceDirection === 'down' && styles.down,
                      )}
                    >
                      {hasPrice ? formatPercent(row.changePercent) : '—'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {isLoggedIn && rows.length > 0 && view === 'list' ? (
        <DashboardWatchlistTable rows={rows} embedded className={styles.embeddedTable} />
      ) : null}

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
