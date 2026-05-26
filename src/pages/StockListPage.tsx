import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageHeader } from '../components/common/PageHeader'
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

type MarketFilter = 'all' | 'KOSPI' | 'KOSDAQ'

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
    return (a.sentimentScore24h - b.sentimentScore24h) * dir
  })
}

export default function StockListPage() {
  const { data, loading, error, refreshing } = useStockListPageData()
  const [query, setQuery] = useState('')
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [sortKey, setSortKey] = useState<StockOverviewSortKey>('mention')
  const [sortDesc, setSortDesc] = useState(true)

  const rows = data?.overview.stocks
  const rankings = data?.rankings
  const currentNewsCount = data?.overview.currentNewsCount ?? 0

  const sectorOptions = useMemo(() => {
    const base = rows ?? []
    const names = [...new Set(base.map((row) => row.sectorName).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'ko'),
    )
    return ['all', ...names]
  }, [rows])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    const base = rows ?? []
    return base.filter((row) => {
      if (marketFilter !== 'all' && row.market !== marketFilter) return false
      if (sectorFilter !== 'all' && row.sectorName !== sectorFilter) return false
      if (!normalizedQuery) return true
      return (
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.code.toLowerCase().includes(normalizedQuery) ||
        row.sectorName.toLowerCase().includes(normalizedQuery) ||
        row.market.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [rows, normalizedQuery, marketFilter, sectorFilter])

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
        <PageHeader
          title="전체 종목"
          description="시세·언급량·감성을 한눈에 보고 종목 상세로 이동합니다."
        />

        {error ? (
          <PageFetchError title="종목 데이터를 불러오지 못했어요" message={error.message} />
        ) : null}

        {showSkeleton ? (
          <div className={styles.skeletonGrid} aria-busy="true">
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
            <div className={clsx(skeleton.block, styles.skeletonCard)} />
          </div>
        ) : null}

        {rankings ? <StockRankingCards rankings={rankings} onMoreClick={handleRankingMore} /> : null}

        <div className={styles.filters}>
          <div className={styles.marketTabs} role="tablist" aria-label="시장 필터">
            {(['all', 'KOSPI', 'KOSDAQ'] as const).map((market) => (
              <button
                key={market}
                type="button"
                role="tab"
                aria-selected={marketFilter === market}
                className={clsx(styles.marketTab, marketFilter === market && styles.marketTabActive)}
                onClick={() => setMarketFilter(market)}
              >
                {market === 'all' ? '전체' : market}
              </button>
            ))}
          </div>

          <label className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="종목명·코드 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {sectorOptions.length > 1 ? (
          <div className={styles.sectorRow} role="group" aria-label="섹터 필터">
            {sectorOptions.map((sector) => (
              <button
                key={sector}
                type="button"
                className={clsx(styles.sectorChip, sectorFilter === sector && styles.sectorChipActive)}
                onClick={() => setSectorFilter(sector)}
              >
                {sector === 'all' ? '전체 섹터' : sector}
              </button>
            ))}
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
              currentNewsCount={currentNewsCount}
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
