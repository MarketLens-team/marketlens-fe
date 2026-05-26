import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../common/Card'
import { CardSectionHeader } from '../common/CardSectionHeader'
import { PageFetchError } from '../common/PageFetchError'
import skeleton from '../common/Skeleton.module.css'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { StockTodayNewsItem } from '../../data/types/stock'
import { buildStockDetailPath } from '../../lib/buildStockRoute'
import styles from './StockTodayNewsSidebar.module.css'

const DEFAULT_VISIBLE_COUNT = 5
const EXPANDED_VISIBLE_COUNT = 10

interface StockTodayNewsSidebarProps {
  items: StockTodayNewsItem[]
  loading: boolean
  error: string | null
  className?: string
}

function barWidthPercent(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return 0
  return Math.max(6, Math.round((count / maxCount) * 100))
}

export function StockTodayNewsSidebar({
  items,
  loading,
  error,
  className,
}: StockTodayNewsSidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleCount = expanded ? EXPANDED_VISIBLE_COUNT : DEFAULT_VISIBLE_COUNT
  const visibleItems = items.slice(0, visibleCount)
  const canExpand = !expanded && items.length > DEFAULT_VISIBLE_COUNT

  const maxCount = useMemo(
    () => visibleItems.reduce((max, item) => Math.max(max, item.todayNewsCount), 0),
    [visibleItems],
  )

  return (
    <aside className={clsx(styles.aside, className)} aria-label="오늘 뉴스 많은 종목">
      <Card padding="md" className={styles.card}>
        <CardSectionHeader title="오늘 뉴스" variant="embedded" className={styles.title} />
        {error ? (
          <PageFetchError title="순위를 불러오지 못했어요" message={error} />
        ) : null}
        {loading && !error ? (
          <ul className={styles.list} aria-busy="true" aria-label="오늘 뉴스 순위 로딩">
            {Array.from({ length: DEFAULT_VISIBLE_COUNT }).map((_, i) => (
              <li key={i}>
                <div className={clsx(skeleton.block, styles.skeletonRow)} />
              </li>
            ))}
          </ul>
        ) : null}
        {!loading && !error ? (
          <>
            {visibleItems.length === 0 ? (
              <p className={styles.empty}>오늘 등록된 뉴스가 없습니다.</p>
            ) : (
              <ol className={styles.list}>
                {visibleItems.map((item, index) => {
                  const width = barWidthPercent(item.todayNewsCount, maxCount)
                  return (
                    <li key={item.stockCode}>
                      <Link
                        to={buildStockDetailPath(item.stockCode)}
                        className={styles.item}
                        title={`${item.stockName} 오늘 뉴스 ${item.todayNewsCount}건`}
                      >
                        <span className={styles.rank} aria-hidden>
                          {index + 1}
                        </span>
                        <EntityAvatar
                          variant="stock"
                          size="sm"
                          name={item.stockName}
                          imageUrl={item.imageUrl}
                          className={styles.avatar}
                        />
                        <span className={styles.name}>{item.stockName}</span>
                        <span className={styles.barTrack} aria-hidden>
                          <span className={styles.barFill} style={{ width: `${width}%` }} />
                        </span>
                        <span className={styles.count}>
                          {item.todayNewsCount.toLocaleString('ko-KR')}
                          <span className={styles.countUnit}>건</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}
            {canExpand ? (
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setExpanded(true)}
              >
                더보기
                <span aria-hidden>›</span>
              </button>
            ) : null}
          </>
        ) : null}
      </Card>
    </aside>
  )
}
