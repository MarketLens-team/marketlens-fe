import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import type { DashboardWatchlistRow } from '../../data/types/dashboard'
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
  return (
    <Card padding="none" className={clsx(styles.card, className)}>
      <div className={styles.headPad}>
        <CardSectionHeader title="내 관심 종목 워치리스트" subtitle="현재가 · 감성 · 언급량 (목 데이터)" />
      </div>
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
            {rows.map((row) => (
              <tr key={row.code}>
                <td>
                  <Link to={`/stock/${row.code}`} className={styles.stockLink}>
                    <span className={styles.stockName}>{row.name}</span>
                  </Link>
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
                <td className={styles.alertCell}>{row.hasAlert ? <span aria-label="알림 있음">🔔</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
