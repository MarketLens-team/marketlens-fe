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
import { formatPercent, formatPrice, priceChangeDirection } from './stockScore'
import { formatSentimentDelta24h } from './sentimentDelta'
import styles from './StockRankingCard.module.css'

export type StockRankingMetric = 'mention' | 'sentiment' | 'change'

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
  center: string
  centerTone?: 'up' | 'down' | 'sentiment'
  centerSentimentKey?: keyof typeof SENTIMENT_CLASS
  trailing: string
  trailingTone?: 'up' | 'down' | null
  trailingTitle?: string
}

function formatMentionChangeRate(value: number | null): { text: string; tone?: 'up' | 'down' } {
  if (value === null) return { text: '—' }
  if (value === 0) return { text: '0%' }
  return {
    text: formatPercent(value),
    tone: value > 0 ? 'up' : 'down',
  }
}

function getRankingRowValues(item: StockRankingItem, metric: StockRankingMetric): RankingRowValues {
  const hasPrice = item.price > 0
  const priceDirection = priceChangeDirection(item.changePercent)

  if (metric === 'mention') {
    const mention = formatMentionChangeRate(item.mentionChangeRate24h)
    return {
      center: item.mentionCount24h.toLocaleString('ko-KR'),
      trailing: mention.text,
      trailingTone: mention.tone ?? null,
    }
  }

  if (metric === 'sentiment') {
    const sentKey = buzzSentimentClass(item.sentimentScore24h)
    const delta = formatSentimentDelta24h(item.sentimentDelta24h)
    return {
      center: formatStockScore(item.sentimentScore24h),
      centerTone: 'sentiment',
      centerSentimentKey: sentKey,
      trailing: delta.text,
      trailingTone: delta.tone,
      trailingTitle: delta.title,
    }
  }

  return {
    center: hasPrice ? formatPrice(item.price) : '—',
    trailing: hasPrice ? formatPercent(item.changePercent) : '—',
    trailingTone: hasPrice
      ? priceDirection === 'up'
        ? 'up'
        : priceDirection === 'down'
          ? 'down'
          : null
      : null,
  }
}

function toneClass(tone?: 'up' | 'down' | null, sentimentKey?: keyof typeof SENTIMENT_CLASS) {
  if (sentimentKey) return SENTIMENT_CLASS[sentimentKey]
  if (tone === 'up') return styles.valueUp
  if (tone === 'down') return styles.valueDown
  return styles.valueMuted
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
        {preview.map((item) => {
          const values = getRankingRowValues(item, metric)
          return (
            <li key={item.code}>
              <Link
                to={buildStockDetailPath(item.code)}
                className={styles.item}
                title={values.trailingTitle}
              >
                <span className={styles.lead}>
                  <EntityAvatar
                    variant="stock"
                    size="sm"
                    name={item.name}
                    imageUrl={item.imageUrl}
                  />
                  <span className={styles.symbol}>{item.name}</span>
                </span>
                <span className={styles.metrics}>
                  <span
                    className={clsx(
                      styles.center,
                      values.centerTone === 'sentiment'
                        ? toneClass(null, values.centerSentimentKey)
                        : toneClass(values.centerTone),
                    )}
                  >
                    {values.center}
                  </span>
                  <span
                    className={clsx(styles.trailing, toneClass(values.trailingTone))}
                    title={values.trailingTitle}
                  >
                    {values.trailing}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
