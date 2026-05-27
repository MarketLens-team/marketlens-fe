import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { buzzSentimentClass } from '../buzz/buzzSurgeScore'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { EmptyState } from '../common/EmptyState'
import { UnderlineTabNav } from '../common/UnderlineTabNav'
import { formatStockScore } from '../stock/stockScore'
import type { BookmarkSortOrder } from '../../data/types/bookmark'
import type { MyPageBookmarkItem, MyPageBookmarkStockSummary, MyPageBookmarkView } from '../../data/types/myPage'
import { buildBookmarkItemPath, formatBookmarkContextLabel } from '../../lib/bookmarkNavigation'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import styles from './MyPageBookmarkSection.module.css'

const VIEW_TABS: { key: MyPageBookmarkView; label: string }[] = [
  { key: 'date', label: '날짜별' },
  { key: 'stock', label: '종목별' },
]

const SENTIMENT_SCORE_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

interface MyPageBookmarkSectionProps {
  view: MyPageBookmarkView
  onViewChange: (view: MyPageBookmarkView) => void
  stockSummaries: MyPageBookmarkStockSummary[]
  stockSummariesLoading?: boolean
  selectedStockCode: string | null
  onSelectStock: (stockCode: string) => void
  items: MyPageBookmarkItem[]
  stockBookmarksLoading?: boolean
  removingId?: string | null
  onRemove: (id: string) => void
  refreshing?: boolean
  sortOrder: BookmarkSortOrder
  onSortChange: (order: BookmarkSortOrder) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
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

function BookmarkItemsList({
  items,
  removingId,
  onRemove,
}: {
  items: MyPageBookmarkItem[]
  removingId?: string | null
  onRemove: (id: string) => void
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const sentKey = buzzSentimentClass(item.sentimentScore)
        const itemPath = buildBookmarkItemPath(item)
        const contextLabel = formatBookmarkContextLabel(item)
        const titleNode = <h3 className={styles.title}>{item.title}</h3>

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
              <Link className={styles.titleLink} to={itemPath}>
                {titleNode}
              </Link>
              <p className={styles.contextLabel}>{contextLabel}</p>
              <p className={styles.savedAt}>저장 {formatBookmarkedAt(item.bookmarkedAt)}</p>
              <span
                className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[sentKey])}
                aria-label={`감성 점수 ${item.sentimentScore}`}
              >
                {formatStockScore(item.sentimentScore)}
              </span>
            </div>
            {item.imageUrl ? (
              <Link className={styles.thumbLink} to={itemPath} aria-hidden tabIndex={-1}>
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
  )
}

export function MyPageBookmarkSection({
  view,
  onViewChange,
  stockSummaries,
  stockSummariesLoading,
  selectedStockCode,
  onSelectStock,
  items,
  stockBookmarksLoading,
  removingId,
  onRemove,
  refreshing,
  sortOrder,
  onSortChange,
  page,
  totalPages,
  onPageChange,
}: MyPageBookmarkSectionProps) {
  const showStockPicker = view === 'stock'
  const stockEmpty = showStockPicker && !stockSummariesLoading && stockSummaries.length === 0
  const listLoading = showStockPicker && stockBookmarksLoading
  const hasPagination = totalPages > 1

  return (
    <Card padding="md" className={styles.card}>
      <div className={styles.header}>
        <CardSectionHeader title="저장한 뉴스" variant="embedded" />
        <Link to="/news" className={styles.feedLink}>
          뉴스 피드
        </Link>
      </div>

      <UnderlineTabNav
        className={styles.tabs}
        options={VIEW_TABS}
        value={view}
        onChange={onViewChange}
        ariaLabel="저장한 뉴스 보기 방식"
      />

      <div className={styles.sortBar}>
        <button
          type="button"
          className={clsx(styles.sortBtn, sortOrder === 'LATEST' && styles.sortBtnActive)}
          onClick={() => onSortChange('LATEST')}
        >
          최신순
        </button>
        <button
          type="button"
          className={clsx(styles.sortBtn, sortOrder === 'OLDEST' && styles.sortBtnActive)}
          onClick={() => onSortChange('OLDEST')}
        >
          오래된순
        </button>
      </div>

      {showStockPicker ? (
        <div className={styles.stockPicker} role="tablist" aria-label="저장한 종목">
          {stockSummariesLoading ? (
            <p className={styles.stockPickerHint} aria-busy="true">
              종목 목록을 불러오는 중…
            </p>
          ) : null}
          {!stockSummariesLoading && stockSummaries.length > 0 ? (
            <ul className={styles.stockList}>
              {stockSummaries.map((row) => {
                const active = row.stockCode === selectedStockCode
                return (
                  <li key={row.stockCode}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={clsx(styles.stockChip, active && styles.stockChipActive)}
                      onClick={() => onSelectStock(row.stockCode)}
                    >
                      <span className={styles.stockChipName}>{row.stockName}</span>
                      <span className={styles.stockChipCount}>{row.bookmarkCount}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={clsx(styles.listWrap, refreshing && styles.listRefreshing)} aria-busy={refreshing}>
        {stockEmpty ? (
          <EmptyState
            className={styles.empty}
            title="종목 뉴스에서 저장한 기사가 없어요"
            message="종목 상세의 뉴스 탭에서 ☆ 버튼으로 기사를 저장하면 여기에 모입니다."
          />
        ) : listLoading ? (
          <p className={styles.listLoadingHint} aria-busy="true">
            저장한 뉴스를 불러오는 중…
          </p>
        ) : items.length === 0 ? (
          <EmptyState
            className={styles.empty}
            title="저장한 뉴스가 없어요"
            message="전체 뉴스나 종목 상세 뉴스에서 ☆ 버튼으로 기사를 저장해 보세요."
            hint="저장한 위치(전체 뉴스·종목 뉴스)에 따라 다시 열어줍니다."
          />
        ) : (
          <BookmarkItemsList items={items} removingId={removingId} onRemove={onRemove} />
        )}
      </div>

      {hasPagination && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <span className={styles.pageInfo}>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            aria-label="다음 페이지"
          >
            ›
          </button>
        </div>
      )}
    </Card>
  )
}
