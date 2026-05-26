import clsx from 'clsx'
import { memo } from 'react'
import type { StockNewsItem } from '../../data/types/stock'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { NewsBookmarkButton } from '../news/NewsBookmarkButton'
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
  showBookmark?: boolean
  bookmarked?: boolean
  bookmarkPending?: boolean
  onBookmarkToggle?: () => void
}

export const StockNewsListItem = memo(function StockNewsListItem({
  item,
  highlighted = false,
  showBookmark = false,
  bookmarked = false,
  bookmarkPending = false,
  onBookmarkToggle,
}: StockNewsListItemProps) {
  const timeBadge = formatNewsTimeBadge(item.publishedAt)
  const dateLabel = formatNewsDateLong(item.publishedAt)
  const linkClassName = clsx(styles.link, highlighted && styles.linkFocusedFromSearch)

  const titleNode = (
    <h3 className={styles.title}>{renderStockNewsTitle(item.title, item.highlightTerms)}</h3>
  )

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
          {showBookmark && onBookmarkToggle ? (
            <NewsBookmarkButton
              className={styles.bookmark}
              bookmarked={bookmarked}
              pending={bookmarkPending}
              onToggle={onBookmarkToggle}
            />
          ) : null}
        </div>
        {item.url ? (
          <a
            className={styles.titleLink}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {titleNode}
          </a>
        ) : (
          titleNode
        )}
        {item.description ? <p className={styles.description}>{item.description}</p> : null}
      </div>
      {item.imageUrl ? (
        item.url ? (
          <a
            className={styles.thumbLink}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden
            tabIndex={-1}
          >
            <img className={styles.thumb} src={item.imageUrl} alt="" width={120} height={80} loading="lazy" />
          </a>
        ) : (
          <img className={styles.thumb} src={item.imageUrl} alt="" width={120} height={80} loading="lazy" />
        )
      ) : (
        <div className={styles.thumbPlaceholder} aria-hidden />
      )}
    </>
  )

  return (
    <li id={`stock-news-${item.id}`} data-scroll-anchor-item className={styles.item}>
      <div className={linkClassName}>{body}</div>
    </li>
  )
})
