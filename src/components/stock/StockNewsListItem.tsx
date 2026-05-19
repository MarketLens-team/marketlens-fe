import type { StockNewsItem } from '../../data/types/stock'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { renderStockNewsTitle } from './stockNewsTitle'
import styles from './StockNewsListItem.module.css'

export interface StockNewsListItemProps {
  item: StockNewsItem
}

export function StockNewsListItem({ item }: StockNewsListItemProps) {
  const timeBadge = formatNewsTimeBadge(item.publishedAt)
  const dateLabel = formatNewsDateLong(item.publishedAt)
  const body = (
    <>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.timeBadge}>{timeBadge}</span>
          <time className={styles.date} dateTime={item.publishedAt}>
            {dateLabel}
          </time>
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

  if (item.url) {
    return (
      <li className={styles.item}>
        <a className={styles.link} href={item.url} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      </li>
    )
  }

  return (
    <li className={styles.item}>
      <div className={styles.link}>{body}</div>
    </li>
  )
}
