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

interface RankingRowValues {
  primary: string
  secondary: string | null
  primaryTone?: 'up' | 'down' | 'sentiment'
  secondaryTone?: 'up' | 'down'
  sentimentKey?: keyof typeof SENTIMENT_CLASS
}

function getRankingRowValues(item: StockRankingItem, metric: StockRankingMetric): RankingRowValues {
  const hasPrice = item.price > 0
  const priceUp = item.changePercent >= 0
  const mentionUp = item.mentionChangeRate24h >= 0

  if (metric === 'mention') {
    return {
      primary: item.mentionCount24h.toLocaleString('ko-KR'),
      secondary: formatPercent(item.mentionChangeRate24h),
      secondaryTone: mentionUp ? 'up' : 'down',
    }
  }

  if (metric === 'sentiment') {
    const sentKey = buzzSentimentClass(item.sentimentScore24h)
    return {
      primary: formatStockScore(item.sentimentScore24h),
      secondary: hasPrice ? formatPercent(item.changePercent) : null,
      primaryTone: 'sentiment',
      sentimentKey: sentKey,
      secondaryTone: priceUp ? 'up' : 'down',
    }
  }

  if (metric === 'change') {
    return {
      primary: hasPrice ? formatPercent(item.changePercent) : '—',
      secondary: hasPrice ? formatPrice(item.price) : null,
      primaryTone: hasPrice ? (priceUp ? 'up' : 'down') : undefined,
    }
  }

  return {
    primary: hasPrice ? formatPrice(item.price) : '—',
    secondary: hasPrice ? formatPercent(item.changePercent) : null,
    secondaryTone: priceUp ? 'up' : 'down',
  }
}

function toneClass(tone?: 'up' | 'down' | 'sentiment', sentimentKey?: keyof typeof SENTIMENT_CLASS) {
  if (tone === 'sentiment' && sentimentKey) return SENTIMENT_CLASS[sentimentKey]
  if (tone === 'up') return styles.valueUp
  if (tone === 'down') return styles.valueDown
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
          const values = getRankingRowValues(item, metric)
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
                  <span
                    className={clsx(
                      styles.valuePrimary,
                      toneClass(values.primaryTone, values.sentimentKey),
                    )}
                  >
                    {values.primary}
                  </span>
                  {values.secondary ? (
                    <span
                      className={clsx(
                        styles.valueSecondary,
                        toneClass(values.secondaryTone),
                      )}
                    >
                      {values.secondary}
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
