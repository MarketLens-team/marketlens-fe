import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { buzzSentimentClass, formatSurgePercent } from '../buzz/buzzSurgeScore'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EntityAvatar } from '../ui/EntityAvatar'
import { formatPercent, formatPrice, formatStockScore } from '../stock/stockScore'
import type { MyPageWatchlistRow } from '../../data/types/myPage'
import { MY_PAGE_WATCHLIST_MAX } from '../../data/types/myPage'
import { useOptimisticRemove } from '../../hooks/useOptimisticRemove'
import remove from '../common/optimisticRemove.module.css'
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
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function formatPriceCell(price: number): string {
  return price > 0 ? formatPrice(price) : '—'
}

function formatChangeCell(changePercent: number): string {
  if (changePercent === 0) return '—'
  return formatPercent(changePercent)
}

export function MyPageWatchlistTable({ rows, onRemove }: MyPageWatchlistTableProps) {
  const navigate = useNavigate()
  // code를 id로 매핑해 훅에 전달 (useOptimisticRemove는 T extends { id: string } 제약)
  const rowsWithId = rows.map((r) => ({ ...r, id: r.code }))
  const { visibleItems, handleRemove, animatingId } = useOptimisticRemove(rowsWithId, onRemove)
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
          onClick={() => navigate('/stock')}
          title={atMax ? `최대 ${MY_PAGE_WATCHLIST_MAX}개까지 등록할 수 있습니다` : '전체 종목에서 관심 종목 추가'}
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
                언급률
              </th>
              <th scope="col" className={styles.colActions}>
                <span className={styles.srOnly}>관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((row) => {
              const sentKey = buzzSentimentClass(row.sentimentScore)
              const changeClass =
                row.changePercent > 0 ? styles.changeUp : row.changePercent < 0 ? styles.changeDown : undefined
              const isAnimating = animatingId === row.id
              return (
                <tr
                  key={row.code}
                  className={clsx(remove.item, isAnimating && remove.itemRemoving, styles.row)}
                  onClick={() => goToStock(row.code)}
                >
                  <td className={styles.stockCell}>
                    <div className={styles.stockBtn}>
                      <EntityAvatar
                        variant="stock"
                        size="sm"
                        name={row.name}
                        imageUrl={row.imageUrl}
                      />
                      <span className={styles.stockText}>
                        <span className={styles.stockName}>{row.name}</span>
                        <span className={styles.stockCode}>{row.code}</span>
                      </span>
                    </div>
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
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label={`${row.name} 관심 종목에서 제거`}
                      disabled={isAnimating}
                      onClick={(e) => { e.stopPropagation(); handleRemove(row.id) }}
                    >
                      <XIcon />
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
