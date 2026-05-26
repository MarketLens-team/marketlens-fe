import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { StockOverviewRow } from '../../data/types/stock'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import {
  buzzSentimentClass,
  formatStockScore,
} from '../buzz/buzzSurgeScore'
import { formatPercent, formatPrice } from './stockScore'
import styles from './StockOverviewTable.module.css'

export type StockOverviewSortKey =
  | 'name'
  | 'price'
  | 'change'
  | 'mention'
  | 'mentionChange'
  | 'sentiment'

interface StockOverviewTableProps {
  rows: StockOverviewRow[]
  sortKey: StockOverviewSortKey
  sortDesc: boolean
  onSortChange: (key: StockOverviewSortKey) => void
}

function SortButton({
  label,
  active,
  desc,
  onClick,
  className,
}: {
  label: string
  active: boolean
  desc: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={clsx(styles.sortBtn, active && styles.sortBtnActive, className)}
      onClick={onClick}
      aria-sort={active ? (desc ? 'descending' : 'ascending') : 'none'}
    >
      {label}
      {active ? <span className={styles.sortMark} aria-hidden>{desc ? '▼' : '▲'}</span> : null}
    </button>
  )
}

const SENTIMENT_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

function formatMentionChangeRate(value: number | null): string {
  if (value === null) return '—'
  if (value === 0) return '0%'
  return formatPercent(value)
}

export function StockOverviewTable({
  rows,
  sortKey,
  sortDesc,
  onSortChange,
}: StockOverviewTableProps) {
  const navigate = useNavigate()

  const goToStock = (code: string) => {
    navigate(buildStockDetailPath(code))
  }

  return (
    <section className={styles.section} aria-label="전체 종목 목록">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStock}>
                <SortButton
                  label="종목"
                  active={sortKey === 'name'}
                  desc={sortDesc}
                  onClick={() => onSortChange('name')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="현재가"
                  active={sortKey === 'price'}
                  desc={sortDesc}
                  onClick={() => onSortChange('price')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="등락"
                  active={sortKey === 'change'}
                  desc={sortDesc}
                  onClick={() => onSortChange('change')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="24h 언급량"
                  active={sortKey === 'mention'}
                  desc={sortDesc}
                  onClick={() => onSortChange('mention')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="언급률"
                  active={sortKey === 'mentionChange'}
                  desc={sortDesc}
                  onClick={() => onSortChange('mentionChange')}
                />
              </th>
              <th scope="col" className={styles.colNum}>
                <SortButton
                  label="감성"
                  active={sortKey === 'sentiment'}
                  desc={sortDesc}
                  onClick={() => onSortChange('sentiment')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  표시할 종목이 없습니다.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const priceUp = row.changePercent >= 0
              const hasPrice = row.price > 0
              const mentionUp = row.mentionChangeRate24h != null && row.mentionChangeRate24h >= 0
              const sentKey = buzzSentimentClass(row.sentimentScore24h)
              return (
                <tr
                  key={row.code}
                  className={styles.rowRing}
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
                  <td className={styles.stockCell}>
                    <span className={styles.stockLead}>
                      <EntityAvatar
                        variant="stock"
                        size="sm"
                        name={row.name}
                        imageUrl={row.imageUrl}
                      />
                      <span className={styles.stockText}>
                        <span className={styles.stockName}>{row.name}</span>
                        <span className={styles.stockMeta}>
                          <span className={styles.stockCode}>{row.code}</span>
                          <span className={styles.stockMarket}>{row.market}</span>
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className={styles.mono}>
                    {hasPrice ? formatPrice(row.price) : '—'}
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      hasPrice && (priceUp ? styles.up : styles.down),
                    )}
                  >
                    {hasPrice ? formatPercent(row.changePercent) : '—'}
                  </td>
                  <td className={styles.mono}>
                    {row.mentionCount24h.toLocaleString('ko-KR')}
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      row.mentionChangeRate24h != null &&
                        row.mentionChangeRate24h !== 0 &&
                        (mentionUp ? styles.up : styles.down),
                    )}
                  >
                    {formatMentionChangeRate(row.mentionChangeRate24h)}
                  </td>
                  <td>
                    <span className={clsx(styles.mono, styles.sentScore, SENTIMENT_CLASS[sentKey])}>
                      {formatStockScore(row.sentimentScore24h)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
