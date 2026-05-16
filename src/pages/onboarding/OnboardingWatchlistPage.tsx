import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from '../../components/onboarding/OnboardingShell'
import { fetchStockDirectory } from '../../data/clients/stockClient'
import { syncWatchlistItems } from '../../data/clients/watchlistClient'
import type { StockDirectoryItem, StockSectorGroup } from '../../data/types/stockDirectory'
import { useWatchlistStore, type WatchlistItem } from '../../store/watchlistStore'
import styles from './OnboardingWatchlistPage.module.css'

const MAX_SELECTION = 10

export default function OnboardingWatchlistPage() {
  const navigate = useNavigate()
  const addToStore = useWatchlistStore((s) => s.add)
  const [directory, setDirectory] = useState<StockSectorGroup[]>([])
  const [selected, setSelected] = useState<WatchlistItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchStockDirectory()
        if (!cancelled) setDirectory(data.sectors)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '종목 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
    setError(null)
    if (isSelected(stock.code)) {
      setSelected((prev) => prev.filter((item) => item.code !== stock.code))
      return
    }
    if (selected.length >= MAX_SELECTION) {
      setError(`관심 종목은 최대 ${MAX_SELECTION}개까지 선택할 수 있습니다.`)
      return
    }
    setSelected((prev) => [...prev, { code: stock.code, name: stock.name }])
  }

  const removeSelected = (code: string) => {
    setSelected((prev) => prev.filter((item) => item.code !== code))
  }

  const handleSkip = () => {
    navigate('/', { replace: true })
  }

  const handleNext = async () => {
    if (selected.length === 0) {
      setError('최소 1개 이상 선택해 주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await syncWatchlistItems(selected)
      selected.forEach((item) => addToStore(item))
      navigate('/onboarding/alerts', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '관심 종목 저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const progressPercent = (selected.length / MAX_SELECTION) * 100

  return (
    <OnboardingShell
      step={2}
      title="관심 종목을 골라주세요"
      description="최소 1개, 최대 10개까지. 나중에 마이페이지에서 수정할 수 있어요."
      footer={
        <>
          <p className={styles.footerHint}>
            0개 선택 후 건너뛰면 일반 시장 데이터로 대시보드에 들어갑니다.
          </p>
          <button type="button" className={styles.btnGhost} onClick={handleSkip} disabled={submitting}>
            건너뛰기
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleNext}
            disabled={submitting || selected.length === 0}
          >
            {submitting ? '저장 중…' : '다음 — 알림 설정 →'}
          </button>
        </>
      }
    >
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
        visibleSectors.map((sector) => (
          <section key={sector.sectorCode} className={styles.sector}>
            <div className={styles.sectorHead}>
              <h2 className={styles.sectorTitle}>
                {sector.sectorName}
                <span className={styles.sectorCount}>{sector.stocks.length}종</span>
              </h2>
            </div>
            <ul className={styles.chipGrid}>
              {sector.stocks.map((stock) => {
                const active = isSelected(stock.code)
                return (
                  <li key={stock.code}>
                    <button
                      type="button"
                      className={`${styles.stockChip} ${active ? styles.stockChipActive : ''}`.trim()}
                      onClick={() => toggleStock(stock)}
                      aria-pressed={active}
                    >
                      <span>{stock.name}</span>
                      <span className={styles.chipMark} aria-hidden>
                        {active ? '✓' : '+'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </OnboardingShell>
  )
}
