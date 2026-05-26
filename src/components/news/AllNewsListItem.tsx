import clsx from 'clsx'
import { Link } from 'react-router-dom'
import type { StockNewsItem } from '../../data/types/stock'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import { newsFeedItemElementId } from '../../lib/newsFeedFocus'
import { useNavigateToStockFromNewsFeed } from '../../hooks/useNavigateToStockFromNewsFeed'
import { renderStockNewsTitle } from '../stock/stockNewsTitle'
import { EntityAvatar } from '../ui/EntityAvatar'
import { NewsBookmarkButton } from './NewsBookmarkButton'
import styles from './AllNewsListItem.module.css'

export interface AllNewsListItemProps {
  item: StockNewsItem
  highlighted?: boolean
  showBookmark?: boolean
  bookmarked?: boolean
  bookmarkPending?: boolean
  onBookmarkToggle?: () => void
}

export function AllNewsListItem({
  item,
  highlighted = false,
  showBookmark = false,
  bookmarked = false,
  bookmarkPending = false,
  onBookmarkToggle,
}: AllNewsListItemProps) {
  const navigateToStockFromNews = useNavigateToStockFromNewsFeed()
  const timeBadge = formatNewsTimeBadge(item.publishedAt)
  const dateLabel = formatNewsDateLong(item.publishedAt)
  const relatedStocks = item.relatedStocks ?? []
  const rowClassName = clsx(styles.link, highlighted && styles.linkFocused)

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
        <div className={styles.relatedStocksRow}>
          <ul className={styles.relatedStocks} aria-label="관련 종목">
            {relatedStocks.map((stock) => (
              <li key={stock.stockCode}>
                <Link
                  className={styles.relatedStockLink}
                  to={buildStockDetailPath(stock.stockCode, { newsId: item.id })}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    navigateToStockFromNews(stock.stockCode, item.id)
                  }}
                >
                  <EntityAvatar
                    variant="stock"
                    size="sm"
                    name={stock.stockName}
                    imageUrl={stock.imageUrl}
                  />
                  <span className={styles.relatedStockName}>{stock.stockName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
    <li id={newsFeedItemElementId(item.id)} className={styles.item}>
      <div className={rowClassName}>{body}</div>
    </li>
  )
}
