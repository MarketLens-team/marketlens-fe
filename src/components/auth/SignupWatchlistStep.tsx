import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchStockOverview } from '../../data/clients/stockClient'
import type { StockOverviewRow } from '../../data/types/stock'
import type { WatchlistItem } from '../../data/types/watchlist'
import { EntityAvatar } from '../ui/EntityAvatar'
import { FilterDropdown } from '../ui/FilterDropdown'
import styles from './SignupWatchlistStep.module.css'

const MAX_SELECTION = 10
const SECTOR_PREVIEW_COUNT = 5

interface WatchlistPickerStock {
  code: string
  name: string
  market: string
  imageUrl?: string | null
}

interface WatchlistSectorGroup {
  sectorCode: string
  sectorName: string
  stocks: WatchlistPickerStock[]
}

function groupOverviewBySector(rows: StockOverviewRow[]): WatchlistSectorGroup[] {
  const groups = new Map<string, WatchlistSectorGroup>()

  for (const row of rows) {
    const sectorCode = row.sectorCode || row.sectorName || 'unknown'
    const existing = groups.get(sectorCode)
    const stock: WatchlistPickerStock = {
      code: row.code,
      name: row.name,
      market: row.market,
      imageUrl: row.imageUrl,
    }

    if (existing) {
      existing.stocks.push(stock)
      continue
    }

    groups.set(sectorCode, {
      sectorCode,
      sectorName: row.sectorName || '—',
      stocks: [stock],
    })
  }

  return [...groups.values()].sort((a, b) => a.sectorName.localeCompare(b.sectorName, 'ko'))
}

interface SignupWatchlistStepProps {
  selected: WatchlistItem[]
  onSelectedChange: (items: WatchlistItem[]) => void
  error: string | null
  onError: (message: string | null) => void
}

export function SignupWatchlistStep({ selected, onSelectedChange, error, onError }: SignupWatchlistStepProps) {
  const [directory, setDirectory] = useState<WatchlistSectorGroup[]>([])
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(() => new Set())
  const [sectorFilter, setSectorFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchStockOverview()
        if (!cancelled) {
          setDirectory(groupOverviewBySector(data.stocks))
          onError(null)
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : '종목 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [onError])

  const normalizedQuery = query.trim().toLowerCase()

  const visibleSectors = useMemo(() => {
    if (!normalizedQuery) return directory
    return directory
      .map((sector) => ({
        ...sector,
        stocks: sector.stocks.filter(
          (stock) =>
            stock.name.toLowerCase().includes(normalizedQuery) ||
            stock.code.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((sector) => sector.stocks.length > 0)
  }, [directory, normalizedQuery])

  const sectorFilterOptions = useMemo(
    () => [
      { value: 'all', label: '전체' },
      ...directory.map((sector) => ({
        value: sector.sectorCode,
        label: sector.sectorName,
      })),
    ],
    [directory],
  )

  const filteredSectors = useMemo(() => {
    if (sectorFilter === 'all') return visibleSectors
    return visibleSectors.filter((sector) => sector.sectorCode === sectorFilter)
  }, [sectorFilter, visibleSectors])

  const isSelected = useCallback((code: string) => selected.some((item) => item.code === code), [selected])

  const toggleStock = (stock: WatchlistPickerStock) => {
    onError(null)
    if (isSelected(stock.code)) {
      onSelectedChange(selected.filter((item) => item.code !== stock.code))
      return
    }
    if (selected.length >= MAX_SELECTION) {
      onError(`관심 종목은 최대 ${MAX_SELECTION}개까지 선택할 수 있습니다.`)
      return
    }
    onSelectedChange([
      ...selected,
      { code: stock.code, name: stock.name, imageUrl: stock.imageUrl ?? null },
    ])
  }

  const removeSelected = (code: string) => {
    onSelectedChange(selected.filter((item) => item.code !== code))
  }

  const clearSelection = () => {
    onError(null)
    onSelectedChange([])
  }

  const toggleSectorExpanded = (sectorCode: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev)
      if (next.has(sectorCode)) next.delete(sectorCode)
      else next.add(sectorCode)
      return next
    })
  }

  const progressPercent = (selected.length / MAX_SELECTION) * 100

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <header className={styles.intro}>
          <h2 className={styles.introTitle}>관심 종목을 골라주세요</h2>
          <p className={styles.introDescription}>
            선택한 종목의 뉴스·감성 분석을 맞춤으로 보여 드립니다.
          </p>
        </header>

        <section className={styles.summary} aria-live="polite">
        <div className={styles.summaryHead}>
          <div className={styles.summaryHeadRow}>
            <span className={styles.summaryCount}>
              내가 고른 종목 <strong>{selected.length}</strong> / {MAX_SELECTION}
            </span>
            {selected.length > 0 ? (
              <button type="button" className={styles.summaryReset} onClick={clearSelection}>
                초기화
              </button>
            ) : null}
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        {selected.length > 0 ? (
          <ul className={styles.selectedList}>
            {selected.map((item) => (
              <li key={item.code}>
                <span className={styles.selectedChip}>
                  <span className={styles.selectedChipAvatarWrap}>
                    <EntityAvatar
                      variant="stock"
                      size="sm"
                      name={item.name}
                      imageUrl={item.imageUrl}
                      className={styles.selectedChipAvatar}
                    />
                  </span>
                  {item.name}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`${item.name} 선택 해제`}
                    onClick={() => removeSelected(item.code)}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.summaryEmpty}>아직 선택한 종목이 없습니다.</p>
        )}
      </section>

      <div className={styles.filterBar}>
        {!loading && directory.length > 0 ? (
          <FilterDropdown
            value={sectorFilter}
            options={sectorFilterOptions}
            onChange={setSectorFilter}
            ariaLabel="섹터 필터"
            className={styles.sectorDropdown}
          />
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
      </div>

        {error ? (
          <p className={styles.bannerError} role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className={styles.stockCatalog}>
        {loading ? (
          <p className={styles.loading}>종목 목록을 불러오는 중…</p>
        ) : filteredSectors.length === 0 ? (
          <p className={styles.loading}>검색 결과가 없습니다.</p>
        ) : (
          filteredSectors.map((sector) => {
          const isSectorFiltered = sectorFilter !== 'all'
          const isExpanded =
            isSectorFiltered || Boolean(normalizedQuery) || expandedSectors.has(sector.sectorCode)
          const hasMore = sector.stocks.length > SECTOR_PREVIEW_COUNT
          const visibleStocks = isExpanded ? sector.stocks : sector.stocks.slice(0, SECTOR_PREVIEW_COUNT)

          return (
            <section key={sector.sectorCode} className={styles.sectorCard}>
              <div className={styles.sectorHead}>
                <h3 className={styles.sectorTitle}>
                  {sector.sectorName}
                  <span className={styles.sectorCount}>{sector.stocks.length}종</span>
                </h3>
                {hasMore && !normalizedQuery && !isSectorFiltered ? (
                  <button
                    type="button"
                    className={styles.sectorExpand}
                    onClick={() => toggleSectorExpanded(sector.sectorCode)}
                  >
                    {isExpanded ? '접기' : '모두 보기 →'}
                  </button>
                ) : null}
              </div>
              <ul className={styles.stockGrid}>
                {visibleStocks.map((stock) => {
                  const active = isSelected(stock.code)
                  return (
                    <li key={stock.code}>
                      <button
                        type="button"
                        className={`${styles.stockCard} ${active ? styles.stockCardActive : ''}`.trim()}
                        onClick={() => toggleStock(stock)}
                        aria-pressed={active}
                      >
                        <span className={styles.stockCardCheck} aria-hidden />
                        <span className={styles.stockCardAvatarWrap}>
                          <EntityAvatar
                            variant="stock"
                            size="sm"
                            name={stock.name}
                            imageUrl={stock.imageUrl}
                            className={styles.stockCardAvatar}
                          />
                        </span>
                        <span className={styles.stockCardName}>{stock.name}</span>
                        <span className={styles.stockCardCode}>{stock.code}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
          })
        )}
      </div>
    </div>
  )
}

export { MAX_SELECTION as SIGNUP_MAX_WATCHLIST }
