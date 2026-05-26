import clsx from 'clsx'
import type { StockNewsItem } from '../../data/types/stock'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { formatStockScore, stockSentimentTone } from './stockScore'
import { renderStockNewsTitle } from './stockNewsTitle'
import styles from './StockNewsListItem.module.css'

function sentimentScoreClass(score: number) {
  const tone = stockSentimentTone(score)
  if (tone === 'positive') return styles.scorePos
  if (tone === 'negative') return styles.scoreNeg
  return styles.scoreWarn
}

export interface StockNewsListItemProps {
  item: StockNewsItem
  highlighted?: boolean
}

export function StockNewsListItem({ item, highlighted = false }: StockNewsListItemProps) {
  const timeBadge = formatNewsTimeBadge(item.publishedAt)
  const dateLabel = formatNewsDateLong(item.publishedAt)
  const body = (
    <>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.timeBadge}>{timeBadge}</span>
          <div className={styles.metaLine}>
            <time className={styles.date} dateTime={item.publishedAt}>
              {dateLabel}
            </time>
            <span className={styles.metaSep} aria-hidden>
              ·
            </span>
            <span className={styles.source}>{item.source}</span>
            <span className={clsx(styles.score, sentimentScoreClass(item.sentimentScore))}>
              {formatStockScore(item.sentimentScore)}
            </span>
          </div>
        </div>
        <h3 className={styles.title}>{renderStockNewsTitle(item.title, item.highlightTerms)}</h3>
        {item.description ? <p className={styles.description}>{item.description}</p> : null}
      </div>
      {item.imageUrl ? (
        <img className={styles.thumb} src={item.imageUrl} alt="" width={120} height={80} loading="lazy" />
      ) : (
        <div className={styles.thumbPlaceholder} aria-hidden />
      )}
    </>
  )

  const linkClassName = clsx(styles.link, highlighted && styles.linkFocusedFromSearch)

  if (item.url) {
    return (
      <li id={`stock-news-${item.id}`} className={styles.item}>
        <a className={linkClassName} href={item.url} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      </li>
    )
  }

  return (
    <li id={`stock-news-${item.id}`} className={styles.item}>
      <div className={linkClassName}>{body}</div>
    </li>
  )
}
