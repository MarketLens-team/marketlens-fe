import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { Card } from '../common/Card'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { StockMarketRow } from '../../data/types/stock'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import { formatPercent, formatPrice, priceChangeDirection } from './stockScore'
import styles from './StockMarketTable.module.css'

export type StockMarketSortKey = 'name' | 'price' | 'change'

interface StockMarketTableProps {
  rows: StockMarketRow[]
  sortKey: StockMarketSortKey
  sortDesc: boolean
  onSortChange: (key: StockMarketSortKey) => void
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

export function StockMarketTable({ rows, sortKey, sortDesc, onSortChange }: StockMarketTableProps) {
  const navigate = useNavigate()

  const goToStock = (code: string) => {
    navigate(buildStockDetailPath(code))
  }

  return (
    <Card padding="none" className={styles.card}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.colRank}>
                #
              </th>
              <th scope="col" className={styles.colStock}>
                <SortButton
                  label="종목"
                  active={sortKey === 'name'}
                  desc={sortDesc}
                  onClick={() => onSortChange('name')}
                />
              </th>
              <th scope="col" className={styles.colMarket}>
                시장
              </th>
              <th scope="col" className={styles.colSector}>
                섹터
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
            {rows.map((row, index) => {
              const priceDirection = priceChangeDirection(row.changePercent)
              const hasPrice = row.price > 0
              return (
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
                  <td className={styles.rank}>{index + 1}</td>
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
                        <span className={styles.stockCode}>{row.code}</span>
                      </span>
                    </span>
                  </td>
                  <td className={styles.market}>{row.market}</td>
                  <td className={styles.sector}>{row.sectorName}</td>
                  <td className={styles.mono}>
                    {hasPrice ? formatPrice(row.price) : '—'}
                  </td>
                  <td
                    className={clsx(
                      styles.mono,
                      hasPrice && priceDirection === 'up' && styles.up,
                      hasPrice && priceDirection === 'down' && styles.down,
                    )}
                  >
                    {hasPrice ? formatPercent(row.changePercent) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
