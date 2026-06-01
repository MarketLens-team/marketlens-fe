import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import skeleton from '../components/common/Skeleton.module.css'
import {
  rankingCategoryToSortKey,
  StockRankingCards,
} from '../components/stock/StockRankingCards'
import {
  StockOverviewTable,
  type StockOverviewSortKey,
} from '../components/stock/StockOverviewTable'
import type { StockOverviewRow, StockRankingCategory } from '../data/types/stock'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useStockListPageData } from '../hooks/useStockListPageData'
import styles from './StockListPage.module.css'

function sortRows(
  rows: StockOverviewRow[],
  sortKey: StockOverviewSortKey,
  sortDesc: boolean,
): StockOverviewRow[] {
  const dir = sortDesc ? -1 : 1
  return [...rows].sort((a, b) => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name, 'ko') * dir
    }
    if (sortKey === 'price') {
      return (a.price - b.price) * dir
    }
    if (sortKey === 'change') {
      return (a.changePercent - b.changePercent) * dir
    }
    if (sortKey === 'mention') {
      return (a.mentionCount24h - b.mentionCount24h) * dir
    }
    if (sortKey === 'mentionChange') {
      const aNull = a.mentionChangeRate24h === null
      const bNull = b.mentionChangeRate24h === null
      if (aNull && !bNull) return 1
      if (!aNull && bNull) return -1
      if (aNull && bNull) return 0
      return (a.mentionChangeRate24h! - b.mentionChangeRate24h!) * dir
    }
    if (sortKey === 'sentimentDelta') {
      const aNull = a.sentimentDelta24h === null
      const bNull = b.sentimentDelta24h === null
      if (aNull && !bNull) return 1
      if (!aNull && bNull) return -1
      if (aNull && bNull) return 0
      return (a.sentimentDelta24h! - b.sentimentDelta24h!) * dir
    }
    return (a.sentimentScore24h - b.sentimentScore24h) * dir
  })
}

export default function StockListPage() {
  const { data, loading, error, refreshing } = useStockListPageData()
  const [sectorFilter, setSectorFilter] = useState('all')
  const [sortKey, setSortKey] = useState<StockOverviewSortKey>('mention')
  const [sortDesc, setSortDesc] = useState(true)

  const rows = data?.overview.stocks
  const rankings = data?.rankings
  const sectorOptions = useMemo(() => {
    const base = rows ?? []
    const names = [...new Set(base.map((row) => row.sectorName).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'ko'),
    )
    return ['all', ...names]
  }, [rows])

  const filteredRows = useMemo(() => {
    const base = rows ?? []
    if (sectorFilter === 'all') return base
    return base.filter((row) => row.sectorName === sectorFilter)
  }, [rows, sectorFilter])

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDesc),
    [filteredRows, sortKey, sortDesc],
  )

  const handleSortChange = (key: StockOverviewSortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev)
      return
    }
    setSortKey(key)
    setSortDesc(key !== 'name')
  }

  const handleRankingMore = (category: StockRankingCategory) => {
    setSortKey(rankingCategoryToSortKey(category))
    setSortDesc(true)
    document.getElementById('stock-overview-table')?.scrollIntoView({ behavior: 'smooth' })
  }

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const showSkeleton = loading && !data && !error

  return (
    <Layout>
      <div className={styles.page}>
        {error ? (
          <PageFetchError title="종목 데이터를 불러오지 못했어요" message={error.message} />
        ) : null}

        {showSkeleton ? (
          <div className={styles.skeletonGrid} aria-busy="true">
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
          </div>
        ) : null}

        {rankings ? <StockRankingCards rankings={rankings} onMoreClick={handleRankingMore} /> : null}

        {sectorOptions.length > 1 ? (
          <div className={styles.sectorDropdownRow}>
            <label htmlFor="stock-sector-filter" className={styles.sectorDropdownLabel}>
              섹터
            </label>
            <div className={styles.sectorSelectWrap}>
              <select
                id="stock-sector-filter"
                className={styles.sectorSelect}
                value={sectorFilter}
                onChange={(event) => setSectorFilter(event.target.value)}
                aria-label="섹터 필터"
              >
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? '전체 섹터' : sector}
                  </option>
                ))}
              </select>
              <span className={styles.sectorSelectChevron} aria-hidden>
                ▾
              </span>
            </div>
          </div>
        ) : null}

        {rows ? (
          <p className={clsx(styles.meta, refreshing && styles.metaRefreshing)} aria-live="polite">
            {sortedRows.length}종목
            {refreshing ? ' · 갱신 중…' : null}
          </p>
        ) : null}

        {showSkeleton ? (
          <div className={clsx(skeleton.block, styles.skeletonTable)} aria-busy="true" />
        ) : null}

        {rows ? (
          <div id="stock-overview-table">
            <StockOverviewTable
              rows={sortedRows}
              sortKey={sortKey}
              sortDesc={sortDesc}
              onSortChange={handleSortChange}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
