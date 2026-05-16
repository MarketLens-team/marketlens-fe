import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchStockDirectory } from '../../data/clients/stockClient'
import type { StockDirectoryItem, StockSectorGroup } from '../../data/types/stockDirectory'
import type { WatchlistItem } from '../../store/watchlistStore'
import styles from './SignupWatchlistStep.module.css'

const MAX_SELECTION = 10
const SECTOR_PREVIEW_COUNT = 5

interface SignupWatchlistStepProps {
  selected: WatchlistItem[]
  onSelectedChange: (items: WatchlistItem[]) => void
  error: string | null
  onError: (message: string | null) => void
}

export function SignupWatchlistStep({ selected, onSelectedChange, error, onError }: SignupWatchlistStepProps) {
  const [directory, setDirectory] = useState<StockSectorGroup[]>([])
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(() => new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchStockDirectory()
        if (!cancelled) setDirectory(data.sectors)
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

  const isSelected = useCallback((code: string) => selected.some((item) => item.code === code), [selected])

  const toggleStock = (stock: StockDirectoryItem) => {
    onError(null)
    if (isSelected(stock.code)) {
      onSelectedChange(selected.filter((item) => item.code !== stock.code))
      return
    }
    if (selected.length >= MAX_SELECTION) {
      onError(`관심 종목은 최대 ${MAX_SELECTION}개까지 선택할 수 있습니다.`)
      return
    }
    onSelectedChange([...selected, { code: stock.code, name: stock.name }])
  }

  const removeSelected = (code: string) => {
    onSelectedChange(selected.filter((item) => item.code !== code))
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
      <header className={styles.intro}>
        <h2 className={styles.introTitle}>관심 종목을 골라주세요</h2>
        <p className={styles.introDescription}>
          관심 종목을 선택해 주세요. 선택한 종목의 뉴스·감성 분석을 맞춤으로 보여 드립니다.
        </p>
      </header>

      <section className={styles.summary} aria-live="polite">
        <div className={styles.summaryHead}>
          <span className={styles.summaryCount}>
            내가 고른 종목 <strong>{selected.length}</strong> / {MAX_SELECTION}
          </span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        {selected.length > 0 ? (
          <ul className={styles.selectedList}>
            {selected.map((item) => (
              <li key={item.code}>
                <span className={styles.selectedChip}>
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

      {error ? (
        <p className={styles.bannerError} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.loading}>종목 목록을 불러오는 중…</p>
      ) : visibleSectors.length === 0 ? (
        <p className={styles.loading}>검색 결과가 없습니다.</p>
      ) : (
        visibleSectors.map((sector) => {
          const isExpanded = Boolean(normalizedQuery) || expandedSectors.has(sector.sectorCode)
          const hasMore = sector.stocks.length > SECTOR_PREVIEW_COUNT
          const visibleStocks = isExpanded ? sector.stocks : sector.stocks.slice(0, SECTOR_PREVIEW_COUNT)

          return (
            <section key={sector.sectorCode} className={styles.sectorCard}>
              <div className={styles.sectorHead}>
                <h3 className={styles.sectorTitle}>
                  {sector.sectorName}
                  <span className={styles.sectorCount}>{sector.stocks.length}종</span>
                </h3>
                {hasMore && !normalizedQuery ? (
                  <button
                    type="button"
                    className={styles.sectorExpand}
                    onClick={() => toggleSectorExpanded(sector.sectorCode)}
                  >
                    {isExpanded ? '접기' : '모두 보기 →'}
                  </button>
                ) : null}
              </div>
              <ul className={styles.chipGrid}>
                {visibleStocks.map((stock) => {
                  const active = isSelected(stock.code)
                  return (
                    <li key={stock.code}>
                      <button
                        type="button"
                        className={`${styles.stockChip} ${active ? styles.stockChipActive : ''}`.trim()}
                        onClick={() => toggleStock(stock)}
                        aria-pressed={active}
                      >
                        <span className={styles.chipMark} aria-hidden>
                          {active ? '✓' : '+'}
                        </span>
                        <span>{stock.name}</span>
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
  )
}

export { MAX_SELECTION as SIGNUP_MAX_WATCHLIST }
