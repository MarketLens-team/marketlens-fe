import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { buzzSentimentClass, formatSurgePercent } from '../buzz/buzzSurgeScore'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { formatPercent, formatPrice, formatStockScore } from '../stock/stockScore'
import type { MyPageWatchlistRow } from '../../data/types/myPage'
import { MY_PAGE_WATCHLIST_MAX } from '../../data/types/myPage'
import styles from './MyPageWatchlistTable.module.css'

const SENTIMENT_SCORE_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

interface MyPageWatchlistTableProps {
  rows: MyPageWatchlistRow[]
  onRemove: (code: string) => void
  removingCode?: string | null
}

function formatPriceCell(price: number): string {
  return price > 0 ? formatPrice(price) : '—'
}

function formatChangeCell(changePercent: number): string {
  if (changePercent === 0) return '—'
  return formatPercent(changePercent)
}

export function MyPageWatchlistTable({ rows, onRemove, removingCode }: MyPageWatchlistTableProps) {
  const navigate = useNavigate()
  const atMax = rows.length >= MY_PAGE_WATCHLIST_MAX

  const goToStock = (code: string) => {
    navigate(`/stock/${code}`)
  }

  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.header}>
        <CardSectionHeader title="관심 종목 리스트" variant="embedded" />
        <button
          type="button"
          className={styles.addBtn}
          disabled={atMax}
          onClick={() => navigate('/stock/005930')}
          title={atMax ? `최대 ${MY_PAGE_WATCHLIST_MAX}개까지 등록할 수 있습니다` : '종목 상세에서 관심 종목 추가'}
        >
          + 추가
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStock}>
                종목
              </th>
              <th scope="col" className={styles.colNum}>
                현재가
              </th>
              <th scope="col" className={styles.colNum}>
                등락
              </th>
              <th scope="col" className={styles.colSentiment}>
                감성
              </th>
              <th scope="col" className={styles.colNum}>
                언급량
              </th>
              <th scope="col" className={styles.colActions}>
                알림
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const sentKey = buzzSentimentClass(row.sentimentScore)
              const changeClass =
                row.changePercent > 0 ? styles.changeUp : row.changePercent < 0 ? styles.changeDown : undefined
              return (
                <tr key={row.code}>
                  <td className={styles.stockCell}>
                    <button
                      type="button"
                      className={styles.stockBtn}
                      onClick={() => goToStock(row.code)}
                    >
                      <span className={styles.stockName}>{row.name}</span>
                      <span className={styles.stockCode}>{row.code}</span>
                    </button>
                  </td>
                  <td className={clsx(styles.mono, styles.numCell)}>{formatPriceCell(row.price)}</td>
                  <td className={clsx(styles.mono, styles.numCell, changeClass)}>
                    {formatChangeCell(row.changePercent)}
                  </td>
                  <td className={styles.sentimentCell}>
                    <span className={clsx(styles.mono, styles.sentScore, SENTIMENT_SCORE_CLASS[sentKey])}>
                      {formatStockScore(row.sentimentScore)}
                    </span>
                  </td>
                  <td className={clsx(styles.mono, styles.numCell, styles.surge)}>
                    {row.mentionSurgePercent > 0
                      ? formatSurgePercent(row.mentionSurgePercent)
                      : '—'}
                  </td>
                  <td className={styles.actionsCell}>
                    <span
                      className={clsx(styles.bell, row.hasAlert && styles.bellActive)}
                      aria-label={row.hasAlert ? '주의 알림' : '알림 없음'}
                      title={row.hasAlert ? '주의 필요' : '알림'}
                    >
                      🔔
                    </span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label={`${row.name} 관심 종목에서 제거`}
                      disabled={removingCode === row.code}
                      onClick={() => onRemove(row.code)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? <p className={styles.empty}>등록된 관심 종목이 없습니다</p> : null}
    </Card>
  )
}
