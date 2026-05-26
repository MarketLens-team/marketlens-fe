import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import {
  StockMarketTable,
  type StockMarketSortKey,
} from '../components/stock/StockMarketTable'
import type { StockMarketRow } from '../data/types/stock'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { useStockMarketList } from '../hooks/useStockMarketList'
import styles from './StockListPage.module.css'

function sortRows(
  rows: StockMarketRow[],
  sortKey: StockMarketSortKey,
  sortDesc: boolean,
): StockMarketRow[] {
  const dir = sortDesc ? -1 : 1
  return [...rows].sort((a, b) => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name, 'ko') * dir
    }
    if (sortKey === 'price') {
      return (a.price - b.price) * dir
    }
    return (a.changePercent - b.changePercent) * dir
  })
}

export default function StockListPage() {
  const { data: rows, loading, error, refreshing } = useStockMarketList()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<StockMarketSortKey>('price')
  const [sortDesc, setSortDesc] = useState(true)

  const normalizedQuery = query.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    const base = rows ?? []
    if (!normalizedQuery) return base
    return base.filter(
      (row) =>
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.code.toLowerCase().includes(normalizedQuery) ||
        row.sectorName.toLowerCase().includes(normalizedQuery) ||
        row.market.toLowerCase().includes(normalizedQuery),
    )
  }, [rows, normalizedQuery])

  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDesc),
    [filteredRows, sortKey, sortDesc],
  )

  const handleSortChange = (key: StockMarketSortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev)
      return
    }
    setSortKey(key)
    setSortDesc(key !== 'name')
  }

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const showSkeleton = loading && !rows && !error

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="전체 종목"
          description="실시간 시세·등락률을 확인하고 종목 상세로 이동합니다."
        />

        {error ? (
          <PageFetchError title="종목 시세를 불러오지 못했어요" message={error.message} />
        ) : null}

        <div className={styles.toolbar}>
          <label className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="종목명·코드·섹터 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {rows ? (
            <p className={clsx(styles.meta, refreshing && styles.metaRefreshing)} aria-live="polite">
              {sortedRows.length}종목
              {refreshing ? ' · 시세 갱신 중…' : null}
            </p>
          ) : null}
        </div>

        {showSkeleton ? (
          <div className={clsx(skeleton.block, styles.skeletonTable)} aria-busy="true" />
        ) : null}

        {rows ? (
          <StockMarketTable
            rows={sortedRows}
            sortKey={sortKey}
            sortDesc={sortDesc}
            onSortChange={handleSortChange}
          />
        ) : null}
      </div>
    </Layout>
  )
}
