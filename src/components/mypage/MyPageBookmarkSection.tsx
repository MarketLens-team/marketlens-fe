import clsx from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buzzSentimentClass } from '../buzz/buzzSurgeScore'
import { EmptyState } from '../common/EmptyState'
import { Modal } from '../ui/Modal'
import { formatStockScore } from '../stock/stockScore'
import type { BookmarkSortOrder } from '../../data/types/bookmark'
import type { MyPageBookmarkDateSummary, MyPageBookmarkItem } from '../../data/types/myPage'
import { buildBookmarkItemPath, formatBookmarkContextLabel } from '../../lib/bookmarkNavigation'
import { formatNewsDateLong, formatNewsTimeBadge } from '../../lib/formatNewsDateTime'
import { BookmarkCalendar } from './BookmarkCalendar'
import remove from '../common/optimisticRemove.module.css'
import styles from './MyPageBookmarkSection.module.css'

const SENTIMENT_SCORE_CLASS = {
  pos: styles.sentPos,
  warm: styles.sentWarm,
  neg: styles.sentNeg,
  neu: styles.sentNeu,
} as const

interface MyPageBookmarkSectionProps {
  // 달력
  dateSummaries: MyPageBookmarkDateSummary[]
  dateSummariesLoading?: boolean
  // 목록
  items: MyPageBookmarkItem[]
  totalPages: number
  page: number
  sortOrder: BookmarkSortOrder
  initialLoading?: boolean
  refreshing?: boolean
  onSortChange: (order: BookmarkSortOrder) => void
  onPageChange: (page: number) => void
  // 날짜 필터
  filterDate: string | null
  onDateSelect: (date: string) => void
  onDateClear: () => void
  // 삭제 (fire-and-forget — UI는 낙관적 삭제)
  onRemove: (id: string) => void
}

function formatFilterDateLabel(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const REMOVE_ANIM_MS = 150 // opacity fade duration

function BookmarkItemsList({
  items,
  onRemove,
}: {
  items: MyPageBookmarkItem[]
  onRemove: (id: string) => void
}) {
  const [animatingId, setAnimatingId] = useState<string | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const handleRemove = (id: string) => {
    setAnimatingId(id)
    onRemove(id) // fire-and-forget
    window.setTimeout(() => {
      setHiddenIds((prev) => new Set(prev).add(id))
      setAnimatingId(null)
    }, REMOVE_ANIM_MS)
  }

  const visibleItems = items.filter((item) => !hiddenIds.has(item.id))

  return (
    <ul className={styles.list}>
      {visibleItems.map((item) => {
        const sentKey = buzzSentimentClass(item.sentimentScore)
        const itemPath = buildBookmarkItemPath(item)
        const contextLabel = item.contextLabel ?? formatBookmarkContextLabel(item)
        const isAnimating = animatingId === item.id

        return (
          <li key={item.id} className={clsx(remove.item, isAnimating && remove.itemRemoving)}>
            <div className={styles.item}>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.timeBadge}>{formatNewsTimeBadge(item.publishedAt)}</span>
                  <span className={styles.date}>{formatNewsDateLong(item.publishedAt)}</span>
                  <span className={styles.metaSep} aria-hidden>·</span>
                  <span className={styles.source}>{item.source}</span>
                </div>
                <Link className={styles.titleLink} to={itemPath}>
                  <h3 className={styles.title}>{item.title}</h3>
                </Link>
                <p className={styles.contextLabel}>{contextLabel}</p>
                {item.contextType === 'STOCK' && (
                  <span
                    className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[sentKey])}
                    aria-label={`감성 점수 ${item.sentimentScore}`}
                  >
                    {formatStockScore(item.sentimentScore)}
                  </span>
                )}
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
                disabled={isAnimating}
                onClick={() => handleRemove(item.id)}
              >
                <XIcon />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function MyPageBookmarkSection({
  dateSummaries,
  dateSummariesLoading,
  items,
  totalPages,
  page,
  sortOrder,
  initialLoading,
  refreshing,
  onSortChange,
  onPageChange,
  filterDate,
  onDateSelect,
  onDateClear,
  onRemove,
}: MyPageBookmarkSectionProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleCalendarDateClick = (date: string) => {
    setCalendarOpen(false)
    onDateSelect(date)
  }

  return (
    <div className={styles.section}>
      {/* 정렬 탭 + 달력 버튼 */}
      <div className={styles.sortBar}>
        <button
          type="button"
          className={clsx(styles.sortTab, sortOrder === 'LATEST' && styles.sortTabActive)}
          onClick={() => onSortChange('LATEST')}
        >
          최신순
        </button>
        <button
          type="button"
          className={clsx(styles.sortTab, sortOrder === 'OLDEST' && styles.sortTabActive)}
          onClick={() => onSortChange('OLDEST')}
        >
          오래된순
        </button>

        {dateSummaries.length > 0 && (
          <button
            type="button"
            className={clsx(styles.calendarBtn, filterDate && styles.calendarBtnActive)}
            aria-label={filterDate ? '날짜 변경' : '날짜별 보기'}
            onClick={() => setCalendarOpen(true)}
          >
            <CalendarIcon />
            {filterDate && <span className={styles.calendarBtnDate}>{filterDate}</span>}
            {filterDate && (
              <span
                className={styles.calendarBtnX}
                role="button"
                aria-label="날짜 필터 해제"
                onClick={(e) => { e.stopPropagation(); onDateClear() }}
              >
                <XIcon />
              </span>
            )}
          </button>
        )}
      </div>

      {/* 날짜 필터 헤더 */}
      {filterDate && (
        <p className={styles.filterDateLabel}>{formatFilterDateLabel(filterDate)}</p>
      )}

      {/* 목록 */}
      <div className={clsx(styles.listWrap, refreshing && styles.listRefreshing)}>
        {initialLoading ? (
          <p className={styles.listLoadingHint} aria-busy="true">불러오는 중…</p>
        ) : items.length === 0 ? (
          <EmptyState
            className={styles.empty}
            title="저장한 뉴스가 없어요"
            message={filterDate ? '해당 날짜에 저장한 뉴스가 없어요.' : '전체 뉴스나 종목 상세 뉴스에서 ☆ 버튼으로 기사를 저장해 보세요.'}
          />
        ) : (
          <BookmarkItemsList items={items} onRemove={onRemove} />
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page === 0}
            aria-label="이전 페이지"
            onClick={() => onPageChange(page - 1)}
          >
            ‹
          </button>
          <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            aria-label="다음 페이지"
            onClick={() => onPageChange(page + 1)}
          >
            ›
          </button>
        </div>
      )}

      {/* 달력 피커 모달 */}
      <Modal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="날짜별 보기"
        lockBackgroundScroll
        contentClassName={styles.calendarModalContent}
        contentClassOnly
      >
        {dateSummariesLoading ? (
          <p className={styles.listLoadingHint} aria-busy="true">불러오는 중…</p>
        ) : (
          <BookmarkCalendar summaries={dateSummaries} onDateClick={handleCalendarDateClick} />
        )}
      </Modal>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
