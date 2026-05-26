import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { useAuthStore } from '../../store/authStore'
import type { DashboardWatchlistRow } from '../../data/types/dashboard'
import { DashboardLoginPrompt } from './DashboardLoginPrompt'
import styles from './DashboardWatchlistTable.module.css'

interface DashboardWatchlistTableProps {
  rows: DashboardWatchlistRow[]
  className?: string
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR')
}

function sentimentClass(score: number) {
  if (score > 0) return styles.sentPos
  if (score < 0) return styles.sentNeg
  return styles.sentNeu
}

export function DashboardWatchlistTable({ rows, className }: DashboardWatchlistTableProps) {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const goToStock = (code: string) => {
    navigate(`/stock/${code}`)
  }

  return (
    <Card padding="md" className={clsx(styles.card, className)}>
      <CardSectionHeader
        title="내 관심 종목 워치리스트"
        subtitle="현재가 · 감성 · 언급량"
        variant="embedded"
      />
      {!isLoggedIn ? (
        <DashboardLoginPrompt
          className={styles.loginPrompt}
          title="로그인이 필요해요"
          message="로그인하면 관심 종목 워치리스트를 확인할 수 있어요."
        />
      ) : null}
      {isLoggedIn ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">종목</th>
                <th scope="col">현재가</th>
                <th scope="col">등락</th>
                <th scope="col">감성</th>
                <th scope="col">뉴스</th>
                <th scope="col">언급량</th>
                <th scope="col">
                  <span className={styles.srOnly}>알림</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    관심종목이 없습니다. 종목 상세에서 추가해 보세요.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr
                  key={row.code}
                  className={styles.rowClickable}
                  tabIndex={0}
                  role="link"
                  aria-label={`${row.name} 종목 상세 보기`}
                  onClick={() => goToStock(row.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToStock(row.code)
                    }
                  }}
                >
                  <td>
                    <span className={styles.stockName}>{row.name}</span>
                  </td>
                  <td className={styles.mono}>{formatPrice(row.price)}</td>
                  <td className={clsx(styles.mono, row.changePercent >= 0 ? styles.up : styles.down)}>
                    {row.changePercent > 0 ? '+' : ''}
                    {row.changePercent}%
                  </td>
                  <td>
                    <span className={clsx(styles.sentPill, sentimentClass(row.sentimentScore))}>
                      {row.sentimentScore > 0 ? '+' : ''}
                      {row.sentimentScore}
                    </span>
                  </td>
                  <td className={styles.mono}>{row.newsCount}</td>
                  <td className={clsx(styles.mono, styles.mention)}>+{row.mentionSurgePercent}%</td>
                  <td className={styles.alertCell}>
                    {row.hasAlert ? <span aria-label="알림 있음">🔔</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  )
}
