import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { Layout } from '../components/common/Layout'
import { PageFetchError } from '../components/common/PageFetchError'
import { PageHeader } from '../components/common/PageHeader'
import skeleton from '../components/common/Skeleton.module.css'
import { EntityAvatar } from '../components/ui/EntityAvatar'
import { fullscreenPresetFromAppError } from '../data/util/httpErrorPage'
import { buildStockDetailPath } from '../lib/buildStockRoute'
import { useStockDirectory } from '../hooks/useStockDirectory'
import styles from './StockListPage.module.css'

const SECTOR_PREVIEW_COUNT = 8

export default function StockListPage() {
  const { sectors, loading, error } = useStockDirectory()
  const [query, setQuery] = useState('')
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(() => new Set())

  const normalizedQuery = query.trim().toLowerCase()

  const visibleSectors = useMemo(() => {
    if (!normalizedQuery) return sectors
    return sectors
      .map((sector) => ({
        ...sector,
        stocks: sector.stocks.filter(
          (stock) =>
            stock.name.toLowerCase().includes(normalizedQuery) ||
            stock.code.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((sector) => sector.stocks.length > 0)
  }, [sectors, normalizedQuery])

  const httpFullscreenPreset = error ? fullscreenPresetFromAppError(error) : null
  if (httpFullscreenPreset) {
    return <AppErrorPage layout="fullscreen" preset={httpFullscreenPreset} homeHref="/" />
  }

  const toggleSectorExpanded = (sectorCode: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev)
      if (next.has(sectorCode)) next.delete(sectorCode)
      else next.add(sectorCode)
      return next
    })
  }

  return (
    <Layout>
      <div className={styles.page}>
        <PageHeader
          title="전체 종목"
          description="섹터별로 종목을 탐색하고 상세 감성·뉴스 화면으로 이동합니다."
        />

        {error ? (
          <PageFetchError title="종목 목록을 불러오지 못했어요" message={error.message} />
        ) : null}

        <label className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="종목명·코드 검색 (예: 삼성전자, 005930)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {loading && !error ? (
          <div className={styles.sectorList} aria-busy="true" aria-label="종목 목록 로딩">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={clsx(skeleton.block, styles.skeletonSector)} />
            ))}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className={styles.sectorList}>
            {visibleSectors.length === 0 ? (
              <p className={styles.empty}>검색 결과가 없습니다.</p>
            ) : (
              visibleSectors.map((sector) => {
                const isExpanded =
                  Boolean(normalizedQuery) || expandedSectors.has(sector.sectorCode)
                const hasMore = sector.stocks.length > SECTOR_PREVIEW_COUNT
                const visibleStocks = isExpanded
                  ? sector.stocks
                  : sector.stocks.slice(0, SECTOR_PREVIEW_COUNT)

                return (
                  <section key={sector.sectorCode} className={styles.sectorCard}>
                    <div className={styles.sectorHead}>
                      <h2 className={styles.sectorTitle}>
                        {sector.sectorName}
                        <span className={styles.sectorCount}>{sector.stocks.length}종</span>
                      </h2>
                      {hasMore && !normalizedQuery ? (
                        <button
                          type="button"
                          className={styles.sectorExpand}
                          onClick={() => toggleSectorExpanded(sector.sectorCode)}
                        >
                          {isExpanded ? '접기' : '모두 보기'}
                        </button>
                      ) : null}
                    </div>
                    <ul className={styles.stockList}>
                      {visibleStocks.map((stock) => (
                        <li key={stock.code}>
                          <Link className={styles.stockRow} to={buildStockDetailPath(stock.code)}>
                            <EntityAvatar
                              variant="stock"
                              size="sm"
                              name={stock.name}
                              imageUrl={null}
                            />
                            <span className={styles.stockName}>{stock.name}</span>
                            <span className={styles.stockCode}>{stock.code}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
