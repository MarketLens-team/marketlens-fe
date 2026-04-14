import styles from './TickerBar.module.css'

type IndexTicker = {
  id: string
  kind: 'index'
  label: string
  value: number
  changePercent: number
}

type StockTicker = {
  id: string
  kind: 'stock'
  name: string
  symbol: string
  price: number
  changePercent: number
}

type TickerRow = IndexTicker | StockTicker

const MOCK_TICKERS: TickerRow[] = [
  { id: 'kospi', kind: 'index', label: 'KOSPI', value: 2654.12, changePercent: 0.42 },
  { id: 'kosdaq', kind: 'index', label: 'KOSDAQ', value: 848.35, changePercent: -0.18 },
  { id: 'samsung', kind: 'stock', name: '삼성전자', symbol: '005930', price: 71200, changePercent: 1.24 },
  { id: 'skh', kind: 'stock', name: 'SK하이닉스', symbol: '000660', price: 186500, changePercent: -0.82 },
  { id: 'naver', kind: 'stock', name: 'NAVER', symbol: '035420', price: 218000, changePercent: 0.35 },
  { id: 'hyundai', kind: 'stock', name: '현대차', symbol: '005380', price: 221000, changePercent: 0.67 },
  { id: 'lgchem', kind: 'stock', name: 'LG화학', symbol: '051910', price: 298000, changePercent: -0.45 },
  { id: 'kakao', kind: 'stock', name: '카카오', symbol: '035720', price: 44850, changePercent: -1.12 },
]

function Row({ row }: { row: TickerRow }) {
  const up = row.changePercent > 0
  const down = row.changePercent < 0
  const pctClass = up ? styles.up : down ? styles.down : ''
  const sign = up ? '+' : ''

  if (row.kind === 'index') {
    return (
      <span className={styles.item}>
        <span className={styles.symbol}>{row.label}</span>
        <span className={styles.price}>{row.value.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={pctClass}>
          {sign}
          {row.changePercent.toFixed(2)}%
        </span>
      </span>
    )
  }

  return (
    <span className={styles.item}>
      <span className={styles.symbol}>
        {row.name} ({row.symbol})
      </span>
      <span className={styles.price}>{row.price.toLocaleString('ko-KR')}</span>
      <span className={pctClass}>
        {sign}
        {row.changePercent.toFixed(2)}%
      </span>
    </span>
  )
}

function TickerSegment({ items, id }: { items: TickerRow[]; id: string }) {
  return (
    <>
      {items.map((row, i) => (
        <Row key={`${id}-${i}-${row.id}`} row={row} />
      ))}
    </>
  )
}

export function TickerBar() {
  return (
    <div className={styles.bar} aria-label="시세 티커">
      <div className={styles.viewport}>
        <div className={styles.track}>
          <TickerSegment items={MOCK_TICKERS} id="a" />
          <TickerSegment items={MOCK_TICKERS} id="b" />
        </div>
      </div>
    </div>
  )
}
