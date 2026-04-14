import clsx from 'clsx'
import type { NewsFeedItem } from '../../data/types/news'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import { SentimentMiniSparkline } from './SentimentMiniSparkline'
import styles from './NewsListRow.module.css'

export interface NewsListRowProps {
  item: NewsFeedItem
  onOpen: () => void
}

function scoreLabel(score: number): string {
  if (score > 0) return `+${score}`
  return String(score)
}

export function NewsListRow({ item, onOpen }: NewsListRowProps) {
  const rel = formatRelativeTimeKo(item.publishedAt)
  const scoreClass =
    item.sentimentScore > 0 ? styles.scorePos : item.sentimentScore < 0 ? styles.scoreNeg : styles.scoreNeu

  return (
    <article className={styles.row}>
      <button type="button" className={styles.hit} onClick={onOpen} aria-label={`뉴스 상세: ${item.title}`}>
        <div className={styles.main}>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.summary}>{item.summary}</p>
          <div className={styles.meta}>
            <span className={styles.time}>{rel}</span>
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span className={styles.source}>{item.source}</span>
            <span className={styles.sep} aria-hidden>
              |
            </span>
            <span className={styles.coverage}>분석 커버 {item.coverage.percent}%</span>
            <span className={styles.sep} aria-hidden>
              |
            </span>
            <span className={styles.buzz}>버즈 {item.buzzScore}</span>
            <span className={clsx(styles.scorePill, scoreClass)}>{scoreLabel(item.sentimentScore)}</span>
          </div>
        </div>
        <div className={styles.side}>
          <div className={styles.spark}>
            <SentimentMiniSparkline data={item.sentimentTrend} />
            <span className={styles.sparkCap}>{item.primaryTicker.name}</span>
          </div>
          {item.imageUrl ? (
            <img className={styles.thumb} src={item.imageUrl} alt="" width={120} height={80} loading="lazy" />
          ) : (
            <div className={styles.thumbPlaceholder} aria-hidden />
          )}
        </div>
      </button>
    </article>
  )
}
