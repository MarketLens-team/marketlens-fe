import clsx from 'clsx'
import { Link } from 'react-router-dom'
import type { StockNewsItem } from '../../data/types/stock'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import { formatStockScore } from '../stock/stockScore'
import { renderStockNewsTitle } from '../stock/stockNewsTitle'
import { EntityAvatar } from '../ui/EntityAvatar'
import styles from './AllNewsListItem.module.css'

function sentimentScoreClass(score: number) {
  if (score > 0) return styles.scorePos
  if (score < 0) return styles.scoreNeg
  return styles.scoreNeu
}

export interface AllNewsListItemProps {
  item: StockNewsItem
}

export function AllNewsListItem({ item }: AllNewsListItemProps) {
  const timeBadge = formatNewsTimeBadge(item.publishedAt)
  const dateLabel = formatNewsDateLong(item.publishedAt)
  const relatedStocks = item.relatedStocks ?? []

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
        {relatedStocks.length > 0 ? (
          <ul className={styles.relatedStocks} aria-label="관련 종목">
            {relatedStocks.map((stock) => (
              <li key={stock.stockCode}>
                <Link
                  className={styles.relatedStockLink}
                  to={buildStockDetailPath(stock.stockCode)}
                  onClick={(event) => event.stopPropagation()}
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
        ) : null}
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
