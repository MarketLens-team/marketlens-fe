import { Link } from 'react-router-dom'
import { useStockPrices } from '../../hooks/useStockPrices'
import type { TickerStockRow } from '../../data/types/stock'
import styles from './TickerBar.module.css'

function Row({ row }: { row: TickerStockRow }) {
  const up = row.changePercent > 0
  const down = row.changePercent < 0
  const pctClass = up ? styles.up : down ? styles.down : ''
  const sign = up ? '+' : ''

  return (
    <Link
      className={styles.item}
      to={`/stock/${row.code}`}
      aria-label={`${row.name}(${row.code}) 종목 상세`}
    >
      <span className={styles.symbol}>
        {row.name} ({row.code})
      </span>
      <span className={styles.price}>{row.price.toLocaleString('ko-KR')}</span>
      <span className={pctClass}>
        {sign}
        {row.changePercent.toFixed(2)}%
      </span>
    </Link>
  )
}

function TickerSegment({ items, id }: { items: TickerStockRow[]; id: string }) {
  return (
    <>
      {items.map((row, i) => (
        <Row key={`${id}-${i}-${row.id}`} row={row} />
      ))}
    </>
  )
}

export function TickerBar() {
  const { data, loading } = useStockPrices()
  const items = data ?? []

  if (loading && items.length === 0) {
    return (
      <div className={styles.bar} aria-label="시세 티커" aria-busy="true">
        <div className={styles.viewport}>
          <span className={styles.placeholder}>시세 불러오는 중…</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className={styles.bar} aria-label="시세 티커">
      <div className={styles.viewport}>
        <div className={styles.track}>
          <TickerSegment items={items} id="a" />
          <TickerSegment items={items} id="b" />
        </div>
      </div>
    </div>
  )
}
