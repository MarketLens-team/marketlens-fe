import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { StockRankingItem } from '../../data/types/stock'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import {
  buzzSentimentClass,
  formatStockScore,
} from '../buzz/buzzSurgeScore'
import { formatPercent, formatPrice } from './stockScore'
import styles from './StockRankingCard.module.css'

export type StockRankingMetric = 'mention' | 'sentiment' | 'change' | 'price'

interface StockRankingCardProps {
  title: string
  items: StockRankingItem[]
  metric: StockRankingMetric
  onMoreClick?: () => void
}

const CARD_PREVIEW_COUNT = 3

const SENTIMENT_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

function formatMetricValue(item: StockRankingItem, metric: StockRankingMetric): string {
  if (metric === 'mention') {
    return item.mentionCount24h.toLocaleString('ko-KR')
  }
  if (metric === 'sentiment') {
    return formatStockScore(item.sentimentScore24h)
  }
  if (metric === 'price') {
    return item.price > 0 ? formatPrice(item.price) : '—'
  }
  return item.price > 0 ? formatPercent(item.changePercent) : '—'
}

function metricToneClass(item: StockRankingItem, metric: StockRankingMetric): string | undefined {
  if (metric === 'sentiment') {
    return SENTIMENT_CLASS[buzzSentimentClass(item.sentimentScore24h)]
  }
  if (metric === 'change') {
    if (item.price <= 0) return undefined
    return item.changePercent >= 0 ? styles.valueUp : styles.valueDown
  }
  if (metric === 'mention') {
    if (item.mentionChangeRate24h === 0) return undefined
    return item.mentionChangeRate24h >= 0 ? styles.valueUp : styles.valueDown
  }
  return undefined
}

export function StockRankingCard({ title, items, metric, onMoreClick }: StockRankingCardProps) {
  const preview = items.slice(0, CARD_PREVIEW_COUNT)

  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.head}>
        <CardSectionHeader title={title} variant="embedded" className={styles.title} />
        {onMoreClick ? (
          <button type="button" className={styles.moreBtn} onClick={onMoreClick}>
            더보기
            <span aria-hidden>›</span>
          </button>
        ) : null}
      </div>
      <ol className={styles.list}>
        {preview.map((item, index) => {
          const hasPrice = item.price > 0
          const priceUp = item.changePercent >= 0
          return (
            <li key={item.code}>
              <Link to={buildStockDetailPath(item.code)} className={styles.item}>
                <span className={styles.rank}>{index + 1}</span>
                <EntityAvatar
                  variant="stock"
                  size="sm"
                  name={item.name}
                  imageUrl={item.imageUrl}
                />
                <span className={styles.body}>
                  <span className={styles.symbol}>{item.name}</span>
                  <span className={styles.code}>{item.code}</span>
                </span>
                <span className={styles.values}>
                  <span className={clsx(styles.metric, metricToneClass(item, metric))}>
                    {formatMetricValue(item, metric)}
                  </span>
                  {hasPrice && metric !== 'price' ? (
                    <span
                      className={clsx(
                        styles.change,
                        priceUp ? styles.valueUp : styles.valueDown,
                      )}
                    >
                      {formatPercent(item.changePercent)}
                    </span>
                  ) : null}
                  {metric === 'price' && hasPrice ? (
                    <span
                      className={clsx(
                        styles.change,
                        priceUp ? styles.valueUp : styles.valueDown,
                      )}
                    >
                      {formatPercent(item.changePercent)}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
