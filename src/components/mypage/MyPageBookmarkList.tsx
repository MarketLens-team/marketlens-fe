import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { buzzSentimentClass } from '../buzz/buzzSurgeScore'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EmptyState } from '../common/EmptyState'
import { formatStockScore } from '../stock/stockScore'
import type { MyPageBookmarkItem } from '../../data/types/myPage'
import { buildNewsFeedPath } from '../../lib/buildNewsFeedRoute'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import styles from './MyPageBookmarkList.module.css'

const SENTIMENT_SCORE_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

interface MyPageBookmarkListProps {
  items: MyPageBookmarkItem[]
  removingId?: string | null
  onRemove: (id: string) => void
}

function formatBookmarkedAt(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function MyPageBookmarkList({ items, removingId, onRemove }: MyPageBookmarkListProps) {
  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.header}>
        <CardSectionHeader title="저장한 뉴스" variant="embedded" />
        <Link to="/news" className={styles.feedLink}>
          뉴스 피드
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          className={styles.empty}
          title="저장한 뉴스가 없어요"
          message="전체 뉴스에서 ☆ 버튼으로 기사를 저장해 보세요."
          hint="/news 피드에서 즐겨찾기를 추가할 수 있어요."
        />
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const sentKey = buzzSentimentClass(item.sentimentScore)
            const feedPath = buildNewsFeedPath({ newsId: item.id })
            const titleNode = (
              <h3 className={styles.title}>{item.title}</h3>
            )

            return (
              <li key={item.id} className={styles.item}>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.timeBadge}>{formatNewsTimeBadge(item.publishedAt)}</span>
                    <span className={styles.date}>{formatNewsDateLong(item.publishedAt)}</span>
                    <span className={styles.metaSep} aria-hidden>
                      ·
                    </span>
                    <span className={styles.source}>{item.source}</span>
                  </div>
                  <Link className={styles.titleLink} to={feedPath}>
                    {titleNode}
                  </Link>
                  <p className={styles.savedAt}>저장 {formatBookmarkedAt(item.bookmarkedAt)}</p>
                  <span
                    className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[sentKey])}
                    aria-label={`감성 점수 ${item.sentimentScore}`}
                  >
                    {formatStockScore(item.sentimentScore)}
                  </span>
                </div>
                {item.imageUrl ? (
                  <Link className={styles.thumbLink} to={feedPath} aria-hidden tabIndex={-1}>
                    <img className={styles.thumb} src={item.imageUrl} alt="" loading="lazy" />
                  </Link>
                ) : (
                  <div className={styles.thumbPlaceholder} aria-hidden />
                )}
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`${item.title} 즐겨찾기 해제`}
                  disabled={removingId === item.id}
                  onClick={() => onRemove(item.id)}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
